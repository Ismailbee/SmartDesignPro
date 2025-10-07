/**
 * Template Marketplace Server
 * Handles template browsing, upload, purchase, and management
 */

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.MARKETPLACE_PORT || 3004

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())

// Serve uploaded files
const UPLOADS_DIR = path.join(__dirname, 'marketplace-uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}
app.use('/uploads', express.static(UPLOADS_DIR))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf', 'application/json']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Initialize SQLite Database
const db = new Database('marketplace.db')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    tags TEXT,
    thumbnailUrl TEXT,
    previewUrl TEXT,
    fileUrl TEXT NOT NULL,
    format TEXT NOT NULL,
    accessLevel TEXT DEFAULT 'free',
    price REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    createdBy TEXT NOT NULL,
    createdByName TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600,
    isPremium INTEGER DEFAULT 0,
    isExclusive INTEGER DEFAULT 0,
    isFeatured INTEGER DEFAULT 0
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS user_libraries (
    userId TEXT PRIMARY KEY,
    savedTemplates TEXT,
    purchasedTemplates TEXT,
    uploadedTemplates TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS template_purchases (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    templateId TEXT NOT NULL,
    price REAL NOT NULL,
    purchasedAt TEXT NOT NULL,
    FOREIGN KEY (templateId) REFERENCES templates(id)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS template_likes (
    userId TEXT NOT NULL,
    templateId TEXT NOT NULL,
    likedAt TEXT NOT NULL,
    PRIMARY KEY (userId, templateId),
    FOREIGN KEY (templateId) REFERENCES templates(id)
  )
`)

// Seed some sample templates
const seedTemplates = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM templates').get()
  if (count.count === 0) {
    console.log('Seeding sample templates...')
    
    const sampleTemplates = [
      {
        id: uuidv4(),
        title: 'Modern Business Card',
        description: 'Professional business card template with clean design',
        category: 'business-cards',
        tags: JSON.stringify(['modern', 'professional', 'minimal']),
        thumbnailUrl: 'https://picsum.photos/seed/template1/400/300',
        previewUrl: 'https://picsum.photos/seed/template1/800/600',
        fileUrl: 'https://picsum.photos/seed/template1/800/600',
        format: 'svg',
        accessLevel: 'free',
        price: 0,
        status: 'approved',
        downloads: 1250,
        likes: 340,
        views: 5600,
        createdBy: 'admin',
        createdByName: 'Design Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 1050,
        height: 600,
        isPremium: 0,
        isExclusive: 0,
        isFeatured: 1
      },
      {
        id: uuidv4(),
        title: 'Colorful Event Flyer',
        description: 'Eye-catching flyer template for events and promotions',
        category: 'flyers-posters',
        tags: JSON.stringify(['colorful', 'bold', 'creative']),
        thumbnailUrl: 'https://picsum.photos/seed/template2/400/300',
        previewUrl: 'https://picsum.photos/seed/template2/800/600',
        fileUrl: 'https://picsum.photos/seed/template2/800/600',
        format: 'pdf',
        accessLevel: 'premium',
        price: 200,
        status: 'approved',
        downloads: 890,
        likes: 210,
        views: 3400,
        createdBy: 'admin',
        createdByName: 'Design Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 1200,
        height: 1800,
        isPremium: 1,
        isExclusive: 0,
        isFeatured: 1
      },
      {
        id: uuidv4(),
        title: 'Professional Invoice Template',
        description: 'Clean and professional invoice template for businesses',
        category: 'receipt-invoice',
        tags: JSON.stringify(['professional', 'simple', 'corporate']),
        thumbnailUrl: 'https://picsum.photos/seed/template3/400/300',
        previewUrl: 'https://picsum.photos/seed/template3/800/600',
        fileUrl: 'https://picsum.photos/seed/template3/800/600',
        format: 'pdf',
        accessLevel: 'free',
        price: 0,
        status: 'approved',
        downloads: 2100,
        likes: 450,
        views: 7800,
        createdBy: 'admin',
        createdByName: 'Design Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 800,
        height: 1100,
        isPremium: 0,
        isExclusive: 0,
        isFeatured: 1
      },
      {
        id: uuidv4(),
        title: 'Instagram Post Template',
        description: 'Trendy Instagram post template for social media',
        category: 'social-media',
        tags: JSON.stringify(['modern', 'trendy', 'social']),
        thumbnailUrl: 'https://picsum.photos/seed/template4/400/300',
        previewUrl: 'https://picsum.photos/seed/template4/800/600',
        fileUrl: 'https://picsum.photos/seed/template4/800/600',
        format: 'png',
        accessLevel: 'free',
        price: 0,
        status: 'approved',
        downloads: 3200,
        likes: 680,
        views: 9500,
        createdBy: 'admin',
        createdByName: 'Design Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 1080,
        height: 1080,
        isPremium: 0,
        isExclusive: 0,
        isFeatured: 1
      },
      {
        id: uuidv4(),
        title: 'Vintage Sticker Pack',
        description: 'Collection of vintage-style stickers',
        category: 'stickers',
        tags: JSON.stringify(['vintage', 'retro', 'creative']),
        thumbnailUrl: 'https://picsum.photos/seed/template5/400/300',
        previewUrl: 'https://picsum.photos/seed/template5/800/600',
        fileUrl: 'https://picsum.photos/seed/template5/800/600',
        format: 'svg',
        accessLevel: 'premium',
        price: 150,
        status: 'approved',
        downloads: 560,
        likes: 180,
        views: 2300,
        createdBy: 'admin',
        createdByName: 'Design Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 500,
        height: 500,
        isPremium: 1,
        isExclusive: 0,
        isFeatured: 0
      },
      {
        id: uuidv4(),
        title: 'Luxury Brand Banner',
        description: 'Exclusive luxury brand banner template',
        category: 'flex-banners',
        tags: JSON.stringify(['luxury', 'elegant', 'premium']),
        thumbnailUrl: 'https://picsum.photos/seed/template6/400/300',
        previewUrl: 'https://picsum.photos/seed/template6/800/600',
        fileUrl: 'https://picsum.photos/seed/template6/800/600',
        format: 'pdf',
        accessLevel: 'exclusive',
        price: 500,
        status: 'approved',
        downloads: 120,
        likes: 95,
        views: 890,
        createdBy: 'admin',
        createdByName: 'Design Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 3000,
        height: 2000,
        isPremium: 0,
        isExclusive: 1,
        isFeatured: 1
      }
    ]

    const stmt = db.prepare(`
      INSERT INTO templates (
        id, title, description, category, tags, thumbnailUrl, previewUrl, fileUrl,
        format, accessLevel, price, status, downloads, likes, views, createdBy,
        createdByName, createdAt, updatedAt, width, height, isPremium, isExclusive, isFeatured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    sampleTemplates.forEach(template => {
      stmt.run(
        template.id, template.title, template.description, template.category,
        template.tags, template.thumbnailUrl, template.previewUrl, template.fileUrl,
        template.format, template.accessLevel, template.price, template.status,
        template.downloads, template.likes, template.views, template.createdBy,
        template.createdByName, template.createdAt, template.updatedAt,
        template.width, template.height, template.isPremium, template.isExclusive, template.isFeatured
      )
    })

    console.log(`✅ Seeded ${sampleTemplates.length} sample templates`)
  }
}

seedTemplates()

// Helper function to parse template
function parseTemplate(row) {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
    isPremium: row.isPremium === 1,
    isExclusive: row.isExclusive === 1,
    isFeatured: row.isFeatured === 1
  }
}

// ============================================================================
// TEMPLATE ENDPOINTS
// ============================================================================

/**
 * GET /api/templates
 * Fetch templates with filters
 */
app.get('/api/templates', (req, res) => {
  try {
    const {
      category,
      accessLevel,
      sortBy = 'popular',
      search,
      tags,
      minPrice,
      maxPrice,
      isPremium,
      isFeatured,
      page = 1,
      pageSize = 12
    } = req.query

    let query = 'SELECT * FROM templates WHERE status = ?'
    const params = ['approved']

    // Apply filters
    if (category && category !== 'all') {
      query += ' AND category = ?'
      params.push(category)
    }

    if (accessLevel) {
      query += ' AND accessLevel = ?'
      params.push(accessLevel)
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      tagArray.forEach(tag => {
        query += ' AND tags LIKE ?'
        params.push(`%${tag}%`)
      })
    }

    if (minPrice !== undefined) {
      query += ' AND price >= ?'
      params.push(parseFloat(minPrice))
    }

    if (maxPrice !== undefined) {
      query += ' AND price <= ?'
      params.push(parseFloat(maxPrice))
    }

    if (isPremium !== undefined) {
      query += ' AND isPremium = ?'
      params.push(isPremium === 'true' ? 1 : 0)
    }

    if (isFeatured !== undefined) {
      query += ' AND isFeatured = ?'
      params.push(isFeatured === 'true' ? 1 : 0)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query += ' ORDER BY downloads DESC, likes DESC'
        break
      case 'newest':
        query += ' ORDER BY createdAt DESC'
        break
      case 'trending':
        query += ' ORDER BY views DESC, likes DESC'
        break
      case 'price-low':
        query += ' ORDER BY price ASC'
        break
      case 'price-high':
        query += ' ORDER BY price DESC'
        break
      default:
        query += ' ORDER BY downloads DESC'
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total')
    const { total } = db.prepare(countQuery).get(...params)

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), offset)

    // Execute query
    const rows = db.prepare(query).all(...params)
    const templates = rows.map(parseTemplate)

    res.json({
      templates,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      hasMore: offset + templates.length < total
    })
  } catch (error) {
    console.error('Fetch templates error:', error)
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message })
  }
})

/**
 * GET /api/templates/:id
 * Fetch single template
 */
app.get('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params

    const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id)

    if (!row) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Increment views
    db.prepare('UPDATE templates SET views = views + 1 WHERE id = ?').run(id)

    const template = parseTemplate(row)
    res.json({ template })
  } catch (error) {
    console.error('Fetch template error:', error)
    res.status(500).json({ message: 'Failed to fetch template', error: error.message })
  }
})

/**
 * POST /api/templates/upload
 * Upload new template
 */
app.post('/api/templates/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      accessLevel = 'free',
      price = 0,
      width = 800,
      height = 600,
      userId,
      userName
    } = req.body

    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'Template file required' })
    }

    const file = req.files.file[0]
    const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : null

    // Determine format from file
    const formatMap = {
      'image/svg+xml': 'svg',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'application/pdf': 'pdf',
      'application/json': 'json'
    }
    const format = formatMap[file.mimetype] || 'png'

    const templateId = uuidv4()
    const now = new Date().toISOString()

    const fileUrl = `http://localhost:${PORT}/uploads/${file.filename}`
    const thumbnailUrl = thumbnail
      ? `http://localhost:${PORT}/uploads/${thumbnail.filename}`
      : fileUrl
    const previewUrl = fileUrl

    db.prepare(`
      INSERT INTO templates (
        id, title, description, category, tags, thumbnailUrl, previewUrl, fileUrl,
        format, accessLevel, price, status, downloads, likes, views, createdBy,
        createdByName, createdAt, updatedAt, width, height, isPremium, isExclusive, isFeatured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      templateId, title, description, category, tags, thumbnailUrl, previewUrl, fileUrl,
      format, accessLevel, parseFloat(price), 'pending', 0, 0, 0, userId || 'anonymous',
      userName || 'Anonymous', now, now, parseInt(width), parseInt(height),
      accessLevel === 'premium' ? 1 : 0,
      accessLevel === 'exclusive' ? 1 : 0,
      0
    )

    const template = parseTemplate(
      db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId)
    )

    res.status(201).json({
      message: 'Template uploaded successfully. Pending admin approval.',
      template
    })
  } catch (error) {
    console.error('Upload template error:', error)
    res.status(500).json({ message: 'Failed to upload template', error: error.message })
  }
})

/**
 * PUT /api/templates/:id
 * Update template (admin or owner)
 */
app.put('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category, tags, accessLevel, price, status, isFeatured } = req.body

    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const updates = []
    const params = []

    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (category !== undefined) {
      updates.push('category = ?')
      params.push(category)
    }
    if (tags !== undefined) {
      updates.push('tags = ?')
      params.push(tags)
    }
    if (accessLevel !== undefined) {
      updates.push('accessLevel = ?')
      params.push(accessLevel)
      updates.push('isPremium = ?')
      params.push(accessLevel === 'premium' ? 1 : 0)
      updates.push('isExclusive = ?')
      params.push(accessLevel === 'exclusive' ? 1 : 0)
    }
    if (price !== undefined) {
      updates.push('price = ?')
      params.push(parseFloat(price))
    }
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }
    if (isFeatured !== undefined) {
      updates.push('isFeatured = ?')
      params.push(isFeatured ? 1 : 0)
    }

    updates.push('updatedAt = ?')
    params.push(new Date().toISOString())
    params.push(id)

    const query = `UPDATE templates SET ${updates.join(', ')} WHERE id = ?`
    db.prepare(query).run(...params)

    const updated = parseTemplate(
      db.prepare('SELECT * FROM templates WHERE id = ?').get(id)
    )

    res.json({ message: 'Template updated successfully', template: updated })
  } catch (error) {
    console.error('Update template error:', error)
    res.status(500).json({ message: 'Failed to update template', error: error.message })
  }
})

/**
 * DELETE /api/templates/:id
 * Delete template (admin only)
 */
app.delete('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params

    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    db.prepare('DELETE FROM templates WHERE id = ?').run(id)
    db.prepare('DELETE FROM template_likes WHERE templateId = ?').run(id)
    db.prepare('DELETE FROM template_purchases WHERE templateId = ?').run(id)

    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Delete template error:', error)
    res.status(500).json({ message: 'Failed to delete template', error: error.message })
  }
})

/**
 * POST /api/templates/:id/like
 * Like/unlike template
 */
app.post('/api/templates/:id/like', (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' })
    }

    const existing = db.prepare('SELECT * FROM template_likes WHERE userId = ? AND templateId = ?')
      .get(userId, id)

    if (existing) {
      // Unlike
      db.prepare('DELETE FROM template_likes WHERE userId = ? AND templateId = ?').run(userId, id)
      db.prepare('UPDATE templates SET likes = likes - 1 WHERE id = ?').run(id)
      res.json({ message: 'Template unliked', liked: false })
    } else {
      // Like
      db.prepare('INSERT INTO template_likes (userId, templateId, likedAt) VALUES (?, ?, ?)')
        .run(userId, id, new Date().toISOString())
      db.prepare('UPDATE templates SET likes = likes + 1 WHERE id = ?').run(id)
      res.json({ message: 'Template liked', liked: true })
    }
  } catch (error) {
    console.error('Like template error:', error)
    res.status(500).json({ message: 'Failed to like template', error: error.message })
  }
})

/**
 * POST /api/templates/:id/purchase
 * Purchase template
 */
app.post('/api/templates/:id/purchase', (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' })
    }

    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Check if already purchased
    const existing = db.prepare('SELECT * FROM template_purchases WHERE userId = ? AND templateId = ?')
      .get(userId, id)

    if (existing) {
      return res.status(400).json({ message: 'Template already purchased' })
    }

    // Create purchase record
    const purchaseId = uuidv4()
    db.prepare(`
      INSERT INTO template_purchases (id, userId, templateId, price, purchasedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(purchaseId, userId, id, template.price, new Date().toISOString())

    // Increment downloads
    db.prepare('UPDATE templates SET downloads = downloads + 1 WHERE id = ?').run(id)

    res.json({ message: 'Template purchased successfully', purchaseId })
  } catch (error) {
    console.error('Purchase template error:', error)
    res.status(500).json({ message: 'Failed to purchase template', error: error.message })
  }
})

/**
 * GET /api/user/:userId/library
 * Get user's template library
 */
app.get('/api/user/:userId/library', (req, res) => {
  try {
    const { userId } = req.params

    let library = db.prepare('SELECT * FROM user_libraries WHERE userId = ?').get(userId)

    if (!library) {
      // Create empty library
      db.prepare(`
        INSERT INTO user_libraries (userId, savedTemplates, purchasedTemplates, uploadedTemplates)
        VALUES (?, ?, ?, ?)
      `).run(userId, '[]', '[]', '[]')

      library = { userId, savedTemplates: '[]', purchasedTemplates: '[]', uploadedTemplates: '[]' }
    }

    res.json({
      userId: library.userId,
      savedTemplates: JSON.parse(library.savedTemplates || '[]'),
      purchasedTemplates: JSON.parse(library.purchasedTemplates || '[]'),
      uploadedTemplates: JSON.parse(library.uploadedTemplates || '[]')
    })
  } catch (error) {
    console.error('Get library error:', error)
    res.status(500).json({ message: 'Failed to get library', error: error.message })
  }
})

/**
 * POST /api/user/:userId/library/save
 * Save template to library
 */
app.post('/api/user/:userId/library/save', (req, res) => {
  try {
    const { userId } = req.params
    const { templateId } = req.body

    let library = db.prepare('SELECT * FROM user_libraries WHERE userId = ?').get(userId)

    if (!library) {
      db.prepare(`
        INSERT INTO user_libraries (userId, savedTemplates, purchasedTemplates, uploadedTemplates)
        VALUES (?, ?, ?, ?)
      `).run(userId, JSON.stringify([templateId]), '[]', '[]')
    } else {
      const saved = JSON.parse(library.savedTemplates || '[]')
      if (!saved.includes(templateId)) {
        saved.push(templateId)
        db.prepare('UPDATE user_libraries SET savedTemplates = ? WHERE userId = ?')
          .run(JSON.stringify(saved), userId)
      }
    }

    res.json({ message: 'Template saved to library' })
  } catch (error) {
    console.error('Save to library error:', error)
    res.status(500).json({ message: 'Failed to save template', error: error.message })
  }
})

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Template Marketplace Server',
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('🎨 Template Marketplace Server')
  console.log('='.repeat(60))
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`💾 Database: marketplace.db`)
  console.log(`📁 Uploads: ${UPLOADS_DIR}`)
  console.log('='.repeat(60))
  console.log('Endpoints:')
  console.log('  GET    /api/templates')
  console.log('  GET    /api/templates/:id')
  console.log('  POST   /api/templates/upload')
  console.log('  PUT    /api/templates/:id')
  console.log('  DELETE /api/templates/:id')
  console.log('  POST   /api/templates/:id/like')
  console.log('  POST   /api/templates/:id/purchase')
  console.log('  GET    /api/user/:userId/library')
  console.log('  POST   /api/user/:userId/library/save')
  console.log('='.repeat(60))
})

