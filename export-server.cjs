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
const exportRecords = new Map()
const shareLinks = new Map()

// =======================
// Imposition Endpoints
// =======================
// Use memory storage for imposition endpoints (we pass buffers to pdf-lib/sharp)
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

// Lazy-load heavy deps to keep base server lean until first use
let ImpositionService = null
async function getImpositionService() {
  if (!ImpositionService) {
    const { PDFDocument } = require('pdf-lib')
    const sharp = require('sharp')
    class Service {
      constructor () {
        this.pageSizes = {
          A4: { width: 595, height: 842 },
          A3: { width: 842, height: 1191 },
          Letter: { width: 612, height: 792 },
          Legal: { width: 612, height: 1008 },
          Tabloid: { width: 792, height: 1224 }
        }
      }
      getPageSize (size, orientation = 'portrait') {
        const base = this.pageSizes[size] || this.pageSizes.A4
        return orientation === 'landscape' ? { width: base.height, height: base.width } : base
      }
      async convertImageToPdf (imageBuffer) {
        const image = sharp(imageBuffer)
        const metadata = await image.metadata()
        const pngBuffer = await image.png().toBuffer()
        const pdfDoc = await PDFDocument.create()
        const embeddedImage = await pdfDoc.embedPng(pngBuffer)
        const page = pdfDoc.addPage([metadata.width, metadata.height])
        page.drawImage(embeddedImage, { x: 0, y: 0, width: metadata.width, height: metadata.height })
        return await pdfDoc.save()
      }
      async processFile (fileBuffer, fileName, impositionType, options) {
        let pdfBuffer = fileBuffer
        if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(fileName)) {
          pdfBuffer = await this.convertImageToPdf(fileBuffer)
        }
        const sourcePdf = await PDFDocument.load(pdfBuffer)
        switch (impositionType) {
          case 'booklet': return await this.createBooklet(sourcePdf, options)
          case '2up': return await this.create2Up(sourcePdf, options)
          case '4up': return await this.create4Up(sourcePdf, options)
          default: return await this.simplePassthrough(sourcePdf)
        }
      }
      async mergeFiles (filesArray, impositionType, options) {
        const mergedPdf = await PDFDocument.create()
        for (const fileData of filesArray) {
          let pdfBuffer = fileData.buffer
          if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(fileData.name)) {
            pdfBuffer = await this.convertImageToPdf(fileData.buffer)
          }
          const src = await PDFDocument.load(pdfBuffer)
          const indices = Array.from({ length: src.getPageCount() }, (_, i) => i)
          const copied = await mergedPdf.copyPages(src, indices)
          copied.forEach(p => mergedPdf.addPage(p))
        }
        switch (impositionType) {
          case 'booklet': return await this.createBooklet(mergedPdf, options)
          case '2up': return await this.create2Up(mergedPdf, options)
          case '4up': return await this.create4Up(mergedPdf, options)
          default: return await mergedPdf.save()
        }
      }
      async simplePassthrough (sourcePdf) {
        const target = await PDFDocument.create()
        const indices = Array.from({ length: sourcePdf.getPageCount() }, (_, i) => i)
        const pages = await target.copyPages(sourcePdf, indices)
        pages.forEach(p => target.addPage(p))
        return await target.save()
      }
      getPageDimensions (sourcePage) {
        if (!sourcePage) throw new Error('Source page is missing')
        if (typeof sourcePage.getSize === 'function') return sourcePage.getSize()
        if (typeof sourcePage.width === 'number' && typeof sourcePage.height === 'number') return { width: sourcePage.width, height: sourcePage.height }
        if (sourcePage.size && typeof sourcePage.size.width === 'number') return { width: sourcePage.size.width, height: sourcePage.size.height }
        const scaled = sourcePage.scale?.(1)
        if (scaled && typeof scaled.width === 'number') return { width: scaled.width, height: scaled.height }
        throw new Error('Unable to determine source page dimensions')
      }
      drawPageScaled (targetSheet, sourcePage, x, y, width, height) {
        const srcSize = this.getPageDimensions(sourcePage)
        const scale = Math.min(width / srcSize.width, height / srcSize.height)
        const w = srcSize.width * scale
        const h = srcSize.height * scale
        const cx = x + (width - w) / 2
        const cy = y + (height - h) / 2
        targetSheet.drawPage(sourcePage, { x: cx, y: cy, width: w, height: h })
      }
      async createBooklet (sourcePdf, options) {
        const target = await PDFDocument.create()
        const total = sourcePdf.getPageCount()
        const first = sourcePdf.getPage(0)
        const srcSize = first.getSize()
        const sheetSize = (options.pageSize && options.pageSize !== 'auto') ? this.getPageSize(options.pageSize, options.orientation) : { width: srcSize.width * 2, height: srcSize.height }
        const pageW = sheetSize.width / 2
        const pageH = sheetSize.height
        const padded = total % 4 === 0 ? total : total + (4 - (total % 4))
        const indices = Array.from({ length: total }, (_, i) => i)
        const copied = await target.copyPages(sourcePdf, indices)
        const embedded = await Promise.all(copied.map(p => target.embedPage(p)))
        for (let i = 0; i < Math.ceil(padded / 4); i++) {
          const front = target.addPage([sheetSize.width, sheetSize.height])
          const back = target.addPage([sheetSize.width, sheetSize.height])
          const outerLeft = padded - 1 - (i * 2)
          const innerLeft = i * 2
          const innerRight = innerLeft + 1
          const outerRight = outerLeft - 1
          if (innerLeft < embedded.length) this.drawPageScaled(front, embedded[innerLeft], 0, 0, pageW, pageH)
          if (outerLeft < embedded.length) this.drawPageScaled(front, embedded[outerLeft], pageW, 0, pageW, pageH)
          if (innerRight < embedded.length) this.drawPageScaled(back, embedded[innerRight], pageW, 0, pageW, pageH)
          if (outerRight < embedded.length) this.drawPageScaled(back, embedded[outerRight], 0, 0, pageW, pageH)
        }
        return await target.save()
      }
      async create2Up (sourcePdf, options) {
        const target = await PDFDocument.create()
        const total = sourcePdf.getPageCount()
        const first = sourcePdf.getPage(0)
        const srcSize = first.getSize()
        const sheetSize = (options.pageSize && options.pageSize !== 'auto') ? this.getPageSize(options.pageSize, options.orientation) : { width: srcSize.width * 2, height: srcSize.height }
        const pageW = sheetSize.width / 2
        const pageH = sheetSize.height
        const indices = Array.from({ length: total }, (_, i) => i)
        const copied = await target.copyPages(sourcePdf, indices)
        const embedded = await Promise.all(copied.map(p => target.embedPage(p)))
        for (let i = 0; i < Math.ceil(total / 2); i++) {
          const sheet = target.addPage([sheetSize.width, sheetSize.height])
          const leftIdx = i * 2
          const rightIdx = i * 2 + 1
          if (leftIdx < embedded.length) this.drawPageScaled(sheet, embedded[leftIdx], 0, 0, pageW, pageH)
          if (rightIdx < embedded.length) this.drawPageScaled(sheet, embedded[rightIdx], pageW, 0, pageW, pageH)
        }
        return await target.save()
      }
      async create4Up (sourcePdf, options) {
        const target = await PDFDocument.create()
        const total = sourcePdf.getPageCount()
        const first = sourcePdf.getPage(0)
        const srcSize = first.getSize()
        const sheetSize = (options.pageSize && options.pageSize !== 'auto') ? this.getPageSize(options.pageSize, options.orientation) : { width: srcSize.width * 2, height: srcSize.height * 2 }
        const pageW = sheetSize.width / 2
        const pageH = sheetSize.height / 2
        const indices = Array.from({ length: total }, (_, i) => i)
        const copied = await target.copyPages(sourcePdf, indices)
        const embedded = await Promise.all(copied.map(p => target.embedPage(p)))
        for (let i = 0; i < Math.ceil(total / 4); i++) {
          const sheet = target.addPage([sheetSize.width, sheetSize.height])
          const start = i * 4
          const positions = [ { x: 0, y: pageH }, { x: pageW, y: pageH }, { x: 0, y: 0 }, { x: pageW, y: 0 } ]
          for (let j = 0; j < 4; j++) {
            const idx = start + j
            if (idx < embedded.length) this.drawPageScaled(sheet, embedded[idx], positions[j].x, positions[j].y, pageW, pageH)
          }
        }
        return await target.save()
      }
    }
    ImpositionService = new Service()
  }
  return ImpositionService
}

app.post('/api/imposition/process', memoryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const svc = await getImpositionService()
    let { impositionType = 'booklet', pageSize = 'auto', orientation = 'portrait', addBlankPages = false, type } = req.body || {}
    if (!impositionType && type) impositionType = type
    const resultBuffer = await svc.processFile(req.file.buffer, req.file.originalname, impositionType, { pageSize, orientation, addBlankPages })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="imposed-${Date.now()}.pdf"`)
    res.send(Buffer.from(resultBuffer))
  } catch (err) {
    console.error('Imposition process error:', err)
    res.status(500).json({ error: err.message || 'Failed to process file' })
  }
})

app.post('/api/imposition/merge', memoryUpload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' })
    const svc = await getImpositionService()
    let { impositionType = 'booklet', pageSize = 'auto', orientation = 'portrait', addBlankPages = false, type } = req.body || {}
    if (!impositionType && type) impositionType = type
    const filesArray = req.files.map(f => ({ name: f.originalname, buffer: f.buffer }))
    const resultBuffer = await svc.mergeFiles(filesArray, impositionType, { pageSize, orientation, addBlankPages })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="imposed-merged-${Date.now()}.pdf"`)
    res.send(Buffer.from(resultBuffer))
  } catch (err) {
    console.error('Imposition merge error:', err)
    res.status(500).json({ error: err.message || 'Failed to merge files' })
  }
})

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

    exportRecords.set(exportId, exportData)

    // Simulate async processing (in production, use a job queue like Bull)
    setTimeout(() => {
      const data = exportRecords.get(exportId)
      if (data) {
        data.status = 'complete'
        data.downloadUrl = `http://localhost:${PORT}/api/export/${exportId}/download`
        data.fileSize = Math.floor(Math.random() * 5000000) + 100000 // Simulated size
        exportRecords.set(exportId, data)
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
  const exportData = exportRecords.get(exportId)

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
  const exportData = exportRecords.get(exportId)

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

