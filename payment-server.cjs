/**
 * Payment & Token Management Server
 * Handles Paystack payments, token purchases, plan upgrades, and subscription management
 */

// Load environment variables from .env file
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const Database = require('better-sqlite3')
const { body, validationResult } = require('express-validator')
const crypto = require('crypto')
const axios = require('axios')

const app = express()
const PORT = process.env.PAYMENT_PORT || 3006

// ============================================================================
// PAYSTACK CONFIGURATION
// ============================================================================

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET

// Validate Paystack configuration
if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
  console.error('\n❌ CRITICAL ERROR: Paystack keys not configured!')
  console.error('📝 Please set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in your .env file')
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Paystack keys. Cannot start server.')
  } else {
    console.warn('⚠️  WARNING: Using test mode. Set Paystack keys for payment processing!')
  }
}

// Plan Configuration
const PLAN_CONFIG = {
  'PLN_5x6n9kfpr8z34lu': {
    name: 'Premium',
    freeTokens: 1000,
    durationMonths: 2,
    price: 2500
  },
  'PLN_31ofmv6h9jplglk': {
    name: 'Pro',
    freeTokens: 1500,
    durationMonths: 2,
    price: 5000
  }
}

// Token Package Configuration
const TOKEN_PACKAGES = {
  100: 100,
  200: 200,
  300: 300,
  500: 500,
  1000: 1000,
  1200: 1200
}

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:8100', 'http://localhost:3000']

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json())

// Raw body for webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// Initialize SQLite Database
const db = new Database('payments.db')

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

// Users table (extended from auth.db)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'Basic',
    planExpiryDate TEXT,
    tokens INTEGER DEFAULT 0,
    totalDesignsGenerated INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`)

// Payments table
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    tokens INTEGER,
    plan TEXT,
    planId TEXT,
    metadata TEXT,
    createdAt TEXT NOT NULL,
    verifiedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`)

// Create indexes
db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments(userId)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_planExpiryDate ON users(planExpiryDate)`)

console.log('✅ Database initialized successfully')

// ============================================================================
// PAYSTACK SERVICE
// ============================================================================

const paystackService = {
  /**
   * Initialize a Paystack transaction
   */
  async initializeTransaction(email, amount, reference, metadata, callbackUrl) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
          callback_url: callbackUrl || `${process.env.APP_URL}/payment/callback`
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.data
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message)
      throw new Error('Failed to initialize payment')
    }
  },

  /**
   * Verify a Paystack transaction
   */
  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }
      )

      return response.data.data
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message)
      throw new Error('Failed to verify payment')
    }
  },

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    if (!PAYSTACK_WEBHOOK_SECRET) {
      console.warn('⚠️  Webhook secret not configured, skipping signature verification')
      return true // Allow in development
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex')

    return hash === signature
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create user
 */
function getOrCreateUser(userId, email, name) {
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  
  if (!user) {
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO users (id, email, name, plan, tokens, totalDesignsGenerated, createdAt, updatedAt)
      VALUES (?, ?, ?, 'Basic', 0, 0, ?, ?)
    `).run(userId, email, name || email.split('@')[0], now, now)
    
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  }
  
  return user
}

/**
 * Update user tokens
 */
function updateUserTokens(userId, tokensToAdd) {
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE users 
    SET tokens = tokens + ?, updatedAt = ?
    WHERE id = ?
  `).run(tokensToAdd, now, userId)
}

/**
 * Update user plan
 */
function updateUserPlan(userId, plan, expiryDate, freeTokens) {
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE users 
    SET plan = ?, planExpiryDate = ?, tokens = tokens + ?, updatedAt = ?
    WHERE id = ?
  `).run(plan, expiryDate, freeTokens, now, userId)
}

/**
 * Generate payment reference
 */
function generateReference(type, userId) {
  const prefix = type === 'token_purchase' ? 'TKN' : 'PLN'
  const timestamp = Date.now()
  return `${prefix}_${userId}_${timestamp}`
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-server' })
})

/**
 * GET /api/users/:userId
 * Get user data including tokens and plan
 * Creates user if they don't exist (for first-time access)
 */
app.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const { email, name } = req.query

    let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)

    // Create user if they don't exist
    if (!user && email) {
      user = getOrCreateUser(userId, email, name)
      console.log(`✅ Created new user: ${userId}`)
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planExpiryDate: user.planExpiryDate,
      tokens: user.tokens,
      totalDesignsGenerated: user.totalDesignsGenerated
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

/**
 * PATCH /api/users/:userId/tokens
 * Deduct tokens when a design is generated
 */
app.patch('/api/users/:userId/tokens', [
  body('deduct').isInt({ min: 1 }).withMessage('Deduct amount must be a positive integer')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { userId } = req.params
    const { deduct } = req.body

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.tokens < deduct) {
      return res.status(400).json({ error: 'Insufficient tokens' })
    }

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE users
      SET tokens = tokens - ?, totalDesignsGenerated = totalDesignsGenerated + 1, updatedAt = ?
      WHERE id = ?
    `).run(deduct, now, userId)

    const updatedUser = db.prepare('SELECT tokens, totalDesignsGenerated FROM users WHERE id = ?').get(userId)

    res.json({
      tokens: updatedUser.tokens,
      totalDesignsGenerated: updatedUser.totalDesignsGenerated
    })
  } catch (error) {
    console.error('Deduct tokens error:', error)
    res.status(500).json({ error: 'Failed to deduct tokens' })
  }
})

/**
 * GET /api/users/:userId/payments
 * Get user payment history
 */
app.get('/api/users/:userId/payments', (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10, type, startDate, endDate } = req.query

    const offset = (page - 1) * limit
    let query = 'SELECT * FROM payments WHERE userId = ?'
    const params = [userId]

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    if (startDate) {
      query += ' AND createdAt >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND createdAt <= ?'
      params.push(endDate)
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)

    const payments = db.prepare(query).all(...params)

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM payments WHERE userId = ?'
    const countParams = [userId]

    if (type) {
      countQuery += ' AND type = ?'
      countParams.push(type)
    }

    if (startDate) {
      countQuery += ' AND createdAt >= ?'
      countParams.push(startDate)
    }

    if (endDate) {
      countQuery += ' AND createdAt <= ?'
      countParams.push(endDate)
    }

    const { total } = db.prepare(countQuery).get(...countParams)

    res.json({
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        type: p.type,
        tokens: p.tokens,
        plan: p.plan,
        status: p.status,
        reference: p.reference,
        createdAt: p.createdAt,
        verifiedAt: p.verifiedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get payments error:', error)
    res.status(500).json({ error: 'Failed to fetch payment history' })
  }
})

/**
 * POST /api/payments/initialize
 * Initialize a Paystack payment
 */
app.post('/api/payments/initialize', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be positive'),
  body('type').isIn(['token_purchase', 'plan_upgrade']).withMessage('Invalid payment type'),
  body('tokens').optional().isInt({ min: 1 }),
  body('plan').optional().isIn(['Premium', 'Pro']),
  body('planId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { userId, email, amount, type, tokens, plan, planId, name } = req.body

    // Validate token purchase
    if (type === 'token_purchase') {
      if (!tokens || !TOKEN_PACKAGES[amount]) {
        return res.status(400).json({ error: 'Invalid token package' })
      }
    }

    // Validate plan upgrade
    if (type === 'plan_upgrade') {
      if (!plan || !planId || !PLAN_CONFIG[planId]) {
        return res.status(400).json({ error: 'Invalid plan configuration' })
      }
    }

    // Ensure user exists
    getOrCreateUser(userId, email, name)

    // Generate reference
    const reference = generateReference(type, userId)

    // Create pending payment record
    const paymentId = uuidv4()
    const now = new Date().toISOString()
    const metadata = {
      userId,
      type,
      tokens: tokens || null,
      plan: plan || null,
      planId: planId || null
    }

    db.prepare(`
      INSERT INTO payments (id, userId, amount, type, reference, status, tokens, plan, planId, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `).run(paymentId, userId, amount, type, reference, tokens || null, plan || null, planId || null, JSON.stringify(metadata), now)

    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeTransaction(
      email,
      amount,
      reference,
      metadata
    )

    res.json({
      authorizationUrl: paystackResponse.authorization_url,
      reference: paystackResponse.reference,
      accessCode: paystackResponse.access_code
    })
  } catch (error) {
    console.error('Initialize payment error:', error)
    res.status(500).json({ error: error.message || 'Failed to initialize payment' })
  }
})

/**
 * POST /api/payments/webhook
 * Handle Paystack webhook events
 */
app.post('/api/payments/webhook', (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature']
    const payload = req.body

    // Verify webhook signature
    if (!paystackService.verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature')
      return res.status(400).send('Invalid signature')
    }

    const event = payload.event
    const data = payload.data

    // Only process successful charge events
    if (event !== 'charge.success') {
      console.log(`Ignoring webhook event: ${event}`)
      return res.status(200).send('Event ignored')
    }

    const reference = data.reference
    const payment = db.prepare('SELECT * FROM payments WHERE reference = ?').get(reference)

    if (!payment) {
      console.error(`Payment not found for reference: ${reference}`)
      return res.status(404).send('Payment not found')
    }

    // Check idempotency - if already processed, return success
    if (payment.status === 'success') {
      console.log(`Payment already processed: ${reference}`)
      return res.status(200).send('Already processed')
    }

    // Update payment status
    const now = new Date().toISOString()
    db.prepare(`
      UPDATE payments
      SET status = 'success', verifiedAt = ?
      WHERE reference = ?
    `).run(now, reference)

    // Process payment based on type
    if (payment.type === 'token_purchase') {
      // Add tokens to user balance
      updateUserTokens(payment.userId, payment.tokens)
      console.log(`✅ Added ${payment.tokens} tokens to user ${payment.userId}`)
    } else if (payment.type === 'plan_upgrade') {
      // Update user plan and add free tokens
      const planConfig = PLAN_CONFIG[payment.planId]
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + planConfig.durationMonths)

      updateUserPlan(payment.userId, payment.plan, expiryDate.toISOString(), planConfig.freeTokens)
      console.log(`✅ Upgraded user ${payment.userId} to ${payment.plan} plan with ${planConfig.freeTokens} free tokens`)
    }

    res.status(200).send('Webhook processed successfully')
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Always return 200 to prevent Paystack retries
    res.status(200).send('Error logged')
  }
})

/**
 * GET /api/payments/verify/:reference
 * Manually verify a payment
 */
app.get('/api/payments/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params

    const payment = db.prepare('SELECT * FROM payments WHERE reference = ?').get(reference)

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // If already verified, return current status
    if (payment.status === 'success') {
      return res.json({
        status: payment.status,
        amount: payment.amount,
        type: payment.type,
        tokens: payment.tokens,
        plan: payment.plan,
        verifiedAt: payment.verifiedAt
      })
    }

    // Verify with Paystack
    const paystackData = await paystackService.verifyTransaction(reference)

    if (paystackData.status === 'success') {
      // Update payment status
      const now = new Date().toISOString()
      db.prepare(`
        UPDATE payments
        SET status = 'success', verifiedAt = ?
        WHERE reference = ?
      `).run(now, reference)

      // Process payment
      if (payment.type === 'token_purchase') {
        updateUserTokens(payment.userId, payment.tokens)
      } else if (payment.type === 'plan_upgrade') {
        const planConfig = PLAN_CONFIG[payment.planId]
        const expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + planConfig.durationMonths)

        updateUserPlan(payment.userId, payment.plan, expiryDate.toISOString(), planConfig.freeTokens)
      }

      res.json({
        status: 'success',
        amount: payment.amount,
        type: payment.type,
        tokens: payment.tokens,
        plan: payment.plan,
        verifiedAt: now
      })
    } else {
      // Update to failed status
      db.prepare(`
        UPDATE payments
        SET status = 'failed'
        WHERE reference = ?
      `).run(reference)

      res.json({
        status: 'failed',
        amount: payment.amount,
        type: payment.type
      })
    }
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Payment Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`💳 Paystack mode: ${PAYSTACK_SECRET_KEY ? (PAYSTACK_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'LIVE') : 'NOT CONFIGURED'}`)
  console.log(`\n✅ Ready to process payments!\n`)
})

