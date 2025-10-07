/**
 * Export & Share Backend Server
 * Handles export processing and share link management
 */

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs').promises
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, 'exports')
    try {
      await fs.mkdir(dir, { recursive: true })
      cb(null, dir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
})

// In-memory storage (replace with database in production)
const exports = new Map()
const shareLinks = new Map()

/**
 * POST /api/export
 * Create a new export job
 */
app.post('/api/export', async (req, res) => {
  try {
    const { projectId, format, resolution, ...options } = req.body

    if (!projectId || !format) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, format' 
      })
    }

    const exportId = uuidv4()
    const fileName = `export-${exportId}.${format === 'jpeg' ? 'jpg' : format}`
    
    const exportData = {
      exportId,
      projectId,
      format,
      resolution,
      options,
      status: 'pending',
      fileName,
      createdAt: new Date(),
      downloadUrl: null,
      fileSize: null
    }

    exports.set(exportId, exportData)

    // Simulate async processing (in production, use a job queue like Bull)
    setTimeout(() => {
      const data = exports.get(exportId)
      if (data) {
        data.status = 'complete'
        data.downloadUrl = `http://localhost:${PORT}/api/export/${exportId}/download`
        data.fileSize = Math.floor(Math.random() * 5000000) + 100000 // Simulated size
        exports.set(exportId, data)
      }
    }, 2000)

    res.json({
      exportId,
      status: 'processing',
      fileName,
      format,
      createdAt: exportData.createdAt
    })
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Export failed' })
  }
})

/**
 * GET /api/export/:exportId/status
 * Get export status
 */
app.get('/api/export/:exportId/status', (req, res) => {
  const { exportId } = req.params
  const exportData = exports.get(exportId)

  if (!exportData) {
    return res.status(404).json({ error: 'Export not found' })
  }

  const progress = exportData.status === 'complete' ? 100 : 
                   exportData.status === 'processing' ? 50 : 0

  res.json({
    exportId,
    status: exportData.status,
    progress,
    message: exportData.status === 'complete' ? exportData.downloadUrl : 'Processing...',
    estimatedTimeRemaining: exportData.status === 'processing' ? 5 : 0
  })
})

/**
 * GET /api/export/:exportId/download
 * Download exported file
 */
app.get('/api/export/:exportId/download', async (req, res) => {
  const { exportId } = req.params
  const exportData = exports.get(exportId)

  if (!exportData) {
    return res.status(404).json({ error: 'Export not found' })
  }

  if (exportData.status !== 'complete') {
    return res.status(400).json({ error: 'Export not ready' })
  }

  // In production, serve actual file from storage
  // For now, send a placeholder response
  res.setHeader('Content-Type', `image/${exportData.format}`)
  res.setHeader('Content-Disposition', `attachment; filename="${exportData.fileName}"`)
  
  // Send empty buffer as placeholder
  res.send(Buffer.from(''))
})

/**
 * POST /api/share
 * Create a shareable link
 */
app.post('/api/share', async (req, res) => {
  try {
    const { projectId, permission, expiresAt, password, allowDownload, message } = req.body

    if (!projectId || !permission) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, permission' 
      })
    }

    const shareId = uuidv4()
    const shareUrl = `http://localhost:5173/shared/${shareId}`

    const shareData = {
      shareId,
      shareUrl,
      projectId,
      permission,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      hasPassword: !!password,
      passwordHash: password ? hashPassword(password) : null,
      allowDownload: allowDownload !== false,
      message,
      views: 0,
      downloads: 0,
      isActive: true
    }

    shareLinks.set(shareId, shareData)

    // Remove password hash from response
    const { passwordHash, ...responseData } = shareData

    res.json(responseData)
  } catch (error) {
    console.error('Share link creation error:', error)
    res.status(500).json({ error: 'Failed to create share link' })
  }
})

/**
 * GET /api/share/:shareId
 * Get share link details
 */
app.get('/api/share/:shareId', (req, res) => {
  const { shareId } = req.params
  const { password } = req.query

  const shareData = shareLinks.get(shareId)

  if (!shareData) {
    return res.status(404).json({ error: 'Share link not found' })
  }

  if (!shareData.isActive) {
    return res.status(403).json({ error: 'Share link has been revoked' })
  }

  if (shareData.expiresAt && new Date() > new Date(shareData.expiresAt)) {
    return res.status(403).json({ error: 'Share link has expired' })
  }

  if (shareData.hasPassword) {
    if (!password || !verifyPassword(password, shareData.passwordHash)) {
      return res.status(401).json({ error: 'Invalid password' })
    }
  }

  // Increment view count
  shareData.views++
  shareLinks.set(shareId, shareData)

  // Remove password hash from response
  const { passwordHash, ...responseData } = shareData

  res.json(responseData)
})

/**
 * DELETE /api/share/:shareId
 * Revoke a share link
 */
app.delete('/api/share/:shareId', (req, res) => {
  const { shareId } = req.params
  const shareData = shareLinks.get(shareId)

  if (!shareData) {
    return res.status(404).json({ error: 'Share link not found' })
  }

  shareData.isActive = false
  shareLinks.set(shareId, shareData)

  res.json({ message: 'Share link revoked successfully' })
})

/**
 * GET /api/share/project/:projectId
 * Get all share links for a project
 */
app.get('/api/share/project/:projectId', (req, res) => {
  const { projectId } = req.params

  const projectLinks = Array.from(shareLinks.values())
    .filter(link => link.projectId === projectId)
    .map(({ passwordHash, ...link }) => link)

  res.json(projectLinks)
})

/**
 * POST /api/share/:shareId/track
 * Track share analytics
 */
app.post('/api/share/:shareId/track', (req, res) => {
  const { shareId } = req.params
  const { action } = req.body

  const shareData = shareLinks.get(shareId)

  if (!shareData) {
    return res.status(404).json({ error: 'Share link not found' })
  }

  if (action === 'view') {
    shareData.views++
  } else if (action === 'download') {
    shareData.downloads++
  }

  shareLinks.set(shareId, shareData)

  res.json({ message: 'Tracked successfully' })
})

/**
 * POST /api/share/email
 * Send email with shared design
 */
app.post('/api/share/email', async (req, res) => {
  try {
    const { recipients, subject, message, attachmentUrl, projectName } = req.body

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients specified' })
    }

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email to:', recipients)
    console.log('Subject:', subject || `${projectName} - Shared Design`)
    console.log('Message:', message)
    console.log('Attachment:', attachmentUrl)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    res.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

/**
 * Helper: Hash password
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Helper: Verify password
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    exports: exports.size,
    shareLinks: shareLinks.size
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Export & Share Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

