/**
 * AI Integration Backend Server
 * Handles AI text generation, image generation, background removal, and QR code generation
 */

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// In-memory storage (replace with database in production)
const textResults = new Map()
const imageResults = new Map()
const backgroundResults = new Map()
const qrCodeResults = new Map()
const usageStats = {
  textGenerations: 0,
  imageGenerations: 0,
  backgroundRemovals: 0,
  qrCodesGenerated: 0,
  totalCost: 0
}

// ============================================================================
// TEXT GENERATION ENDPOINTS
// ============================================================================

/**
 * Generate text with AI
 */
app.post('/api/ai/text/generate', async (req, res) => {
  try {
    const { prompt, type, tone, language, length, variations = 3 } = req.body

    if (!prompt || !type || !tone || !language || !length) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Simulate AI text generation (replace with actual AI API call)
    const results = []
    for (let i = 0; i < variations; i++) {
      const result = {
        id: uuidv4(),
        text: `[${tone.toUpperCase()}] ${prompt} - Generated text variation ${i + 1} in ${language}. This is a simulated response. In production, this would call OpenAI GPT-4 or similar API.`,
        prompt,
        type,
        tone,
        language,
        createdAt: new Date(),
        tokens: Math.floor(Math.random() * 100) + 50,
        cost: 0.001
      }
      
      textResults.set(result.id, result)
      results.push(result)
    }

    // Update usage stats
    usageStats.textGenerations += variations
    usageStats.totalCost += 0.001 * variations

    res.json({ results })
  } catch (error) {
    console.error('Text generation error:', error)
    res.status(500).json({ message: 'Text generation failed', error: error.message })
  }
})

/**
 * Rewrite text with AI
 */
app.post('/api/ai/text/rewrite', async (req, res) => {
  try {
    const { text, action, tone } = req.body

    if (!text || !action) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Simulate text rewriting
    const result = {
      id: uuidv4(),
      text: `[${action.toUpperCase()}] ${text} - Rewritten with ${tone || 'default'} tone. This is a simulated response.`,
      prompt: text,
      type: 'rewrite',
      tone: tone || 'neutral',
      language: 'en',
      createdAt: new Date(),
      tokens: Math.floor(Math.random() * 100) + 50,
      cost: 0.001
    }

    textResults.set(result.id, result)
    usageStats.textGenerations++
    usageStats.totalCost += 0.001

    res.json(result)
  } catch (error) {
    console.error('Text rewrite error:', error)
    res.status(500).json({ message: 'Text rewrite failed', error: error.message })
  }
})

/**
 * Translate text
 */
app.post('/api/ai/text/translate', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body

    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Simulate translation
    const result = {
      id: uuidv4(),
      text: `[TRANSLATED to ${targetLanguage}] ${text}`,
      prompt: text,
      type: 'translation',
      tone: 'neutral',
      language: targetLanguage,
      createdAt: new Date(),
      tokens: Math.floor(Math.random() * 100) + 50,
      cost: 0.001
    }

    textResults.set(result.id, result)
    usageStats.textGenerations++
    usageStats.totalCost += 0.001

    res.json(result)
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({ message: 'Translation failed', error: error.message })
  }
})

// ============================================================================
// IMAGE GENERATION ENDPOINTS
// ============================================================================

/**
 * Generate image with AI
 */
app.post('/api/ai/image/generate', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt,
      style,
      resolution,
      width,
      height,
      seed,
      guidanceScale,
      steps,
      batchSize = 1
    } = req.body

    if (!prompt || !style || !resolution) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Determine dimensions
    const resolutionMap = {
      low: { width: 512, height: 512 },
      medium: { width: 1024, height: 1024 },
      high: { width: 2048, height: 2048 },
      custom: { width: width || 1024, height: height || 1024 }
    }

    const dimensions = resolutionMap[resolution]

    // Simulate image generation
    const result = {
      id: uuidv4(),
      imageUrl: `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now()}`,
      thumbnailUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
      prompt,
      negativePrompt,
      style,
      width: dimensions.width,
      height: dimensions.height,
      seed: seed || Math.floor(Math.random() * 1000000),
      createdAt: new Date(),
      status: 'complete', // In production: 'processing' -> poll for status
      estimatedTime: 30,
      cost: 0.02
    }

    imageResults.set(result.id, result)
    usageStats.imageGenerations++
    usageStats.totalCost += 0.02

    res.json(result)
  } catch (error) {
    console.error('Image generation error:', error)
    res.status(500).json({ message: 'Image generation failed', error: error.message })
  }
})

/**
 * Get image generation status
 */
app.get('/api/ai/image/status/:imageId', (req, res) => {
  try {
    const { imageId } = req.params
    const result = imageResults.get(imageId)

    if (!result) {
      return res.status(404).json({ message: 'Image not found' })
    }

    res.json({
      id: imageId,
      status: result.status,
      progress: 100,
      message: 'Image generation complete',
      estimatedTimeRemaining: 0
    })
  } catch (error) {
    console.error('Get image status error:', error)
    res.status(500).json({ message: 'Failed to get image status', error: error.message })
  }
})

// ============================================================================
// BACKGROUND REMOVAL ENDPOINTS
// ============================================================================

/**
 * Remove background from image
 */
app.post('/api/ai/bg-remove', async (req, res) => {
  try {
    const {
      imageUrl,
      outputType,
      backgroundColor,
      blurAmount,
      aiPrompt,
      edgeRefinement,
      feathering
    } = req.body

    if (!imageUrl || !outputType) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Simulate background removal
    const result = {
      id: uuidv4(),
      originalImageUrl: imageUrl,
      processedImageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
      outputType,
      createdAt: new Date(),
      processingTime: 5,
      cost: 0.01
    }

    backgroundResults.set(result.id, result)
    usageStats.backgroundRemovals++
    usageStats.totalCost += 0.01

    res.json(result)
  } catch (error) {
    console.error('Background removal error:', error)
    res.status(500).json({ message: 'Background removal failed', error: error.message })
  }
})

// ============================================================================
// QR CODE GENERATION ENDPOINTS
// ============================================================================

/**
 * Generate QR code
 */
app.post('/api/ai/qrcode/generate', async (req, res) => {
  try {
    const {
      data,
      type,
      size,
      foregroundColor,
      backgroundColor,
      logoUrl,
      dotStyle,
      cornerStyle,
      errorCorrection
    } = req.body

    if (!data || !type || !size) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Generate QR code
    const qrOptions = {
      errorCorrectionLevel: errorCorrection || 'M',
      type: 'image/png',
      quality: 1,
      margin: 1,
      width: size,
      color: {
        dark: foregroundColor || '#000000',
        light: backgroundColor || '#ffffff'
      }
    }

    const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions)
    
    // Save QR code
    const fileName = `qr-${uuidv4()}.png`
    const filePath = path.join(__dirname, 'uploads', fileName)
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '')
    fs.writeFileSync(filePath, base64Data, 'base64')

    const result = {
      id: uuidv4(),
      qrCodeUrl: `http://localhost:${PORT}/uploads/${fileName}`,
      qrCodeSvg: await QRCode.toString(data, { ...qrOptions, type: 'svg' }),
      data,
      type,
      size,
      createdAt: new Date()
    }

    qrCodeResults.set(result.id, result)
    usageStats.qrCodesGenerated++

    res.json(result)
  } catch (error) {
    console.error('QR code generation error:', error)
    res.status(500).json({ message: 'QR code generation failed', error: error.message })
  }
})

/**
 * Validate QR code data
 */
app.post('/api/ai/qrcode/validate', (req, res) => {
  try {
    const { data, type } = req.body

    let valid = false

    switch (type) {
      case 'url':
        try {
          new URL(data)
          valid = true
        } catch {
          valid = false
        }
        break
      case 'email':
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)
        break
      case 'phone':
        valid = /^\+?[1-9]\d{1,14}$/.test(data.replace(/[\s-()]/g, ''))
        break
      default:
        valid = data.length > 0
    }

    res.json({ valid })
  } catch (error) {
    console.error('QR validation error:', error)
    res.status(500).json({ message: 'Validation failed', error: error.message })
  }
})

// ============================================================================
// UPLOAD ENDPOINT
// ============================================================================

/**
 * Upload image
 */
app.post('/api/ai/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`
    res.json({ imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

// ============================================================================
// USAGE STATS ENDPOINT
// ============================================================================

/**
 * Get usage statistics
 */
app.get('/api/ai/usage/stats', (req, res) => {
  res.json(usageStats)
})

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    stats: usageStats
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 AI Integration Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}\n`)
})

