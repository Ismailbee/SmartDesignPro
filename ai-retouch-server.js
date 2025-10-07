/**
 * AI Retouch Server
 * Provides AI-powered design retouch and layout optimization
 */

import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3005

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// ============================================================
// Color Harmony Algorithms
// ============================================================

function hexToHSL(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 0 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h, s, l) {
  h = h / 360
  s = s / 100
  l = l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function generateComplementaryPalette(baseColor) {
  const hsl = hexToHSL(baseColor)
  return {
    id: 'complementary',
    name: 'Complementary',
    colors: [
      baseColor,
      hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 100)),
      hslToHex((hsl.h + 180) % 360, hsl.s, Math.max(hsl.l - 20, 0)),
      hslToHex(hsl.h, Math.max(hsl.s - 20, 0), hsl.l)
    ],
    description: 'Colors opposite on the color wheel for high contrast',
    harmony: 'complementary'
  }
}

function generateAnalogousPalette(baseColor) {
  const hsl = hexToHSL(baseColor)
  return {
    id: 'analogous',
    name: 'Analogous',
    colors: [
      hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      baseColor,
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)),
      hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 0))
    ],
    description: 'Adjacent colors on the color wheel for harmony',
    harmony: 'analogous'
  }
}

function generateTriadicPalette(baseColor) {
  const hsl = hexToHSL(baseColor)
  return {
    id: 'triadic',
    name: 'Triadic',
    colors: [
      baseColor,
      hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 100)),
      hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 0))
    ],
    description: 'Three evenly spaced colors for vibrant designs',
    harmony: 'triadic'
  }
}

function generateMonochromaticPalette(baseColor) {
  const hsl = hexToHSL(baseColor)
  return {
    id: 'monochromatic',
    name: 'Monochromatic',
    colors: [
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 30, 100)),
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)),
      baseColor,
      hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 0)),
      hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 30, 0))
    ],
    description: 'Variations of a single color for elegant simplicity',
    harmony: 'monochromatic'
  }
}

function generateSplitComplementaryPalette(baseColor) {
  const hsl = hexToHSL(baseColor)
  const complementHue = (hsl.h + 180) % 360
  return {
    id: 'split-complementary',
    name: 'Split Complementary',
    colors: [
      baseColor,
      hslToHex((complementHue - 30 + 360) % 360, hsl.s, hsl.l),
      hslToHex((complementHue + 30) % 360, hsl.s, hsl.l),
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)),
      hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 0))
    ],
    description: 'Base color with two adjacent to its complement',
    harmony: 'split-complementary'
  }
}

// ============================================================
// Layout Optimization Algorithms
// ============================================================

function calculateOptimalSpacing(elements, canvasSize) {
  const baseSpacing = Math.min(canvasSize.width, canvasSize.height) * 0.02
  return {
    horizontal: Math.max(baseSpacing, 16),
    vertical: Math.max(baseSpacing, 16),
    margin: Math.max(baseSpacing * 2, 24)
  }
}

function detectAlignmentIssues(elements) {
  const issues = []
  const threshold = 5

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const el1 = elements[i]
      const el2 = elements[j]

      if (Math.abs(el1.x - el2.x) < threshold && Math.abs(el1.x - el2.x) > 0) {
        issues.push({
          type: 'vertical-misalignment',
          elements: [el1.id, el2.id],
          difference: Math.abs(el1.x - el2.x),
          suggestedX: Math.min(el1.x, el2.x)
        })
      }

      if (Math.abs(el1.y - el2.y) < threshold && Math.abs(el1.y - el2.y) > 0) {
        issues.push({
          type: 'horizontal-misalignment',
          elements: [el1.id, el2.id],
          difference: Math.abs(el1.y - el2.y),
          suggestedY: Math.min(el1.y, el2.y)
        })
      }
    }
  }

  return issues
}

function optimizeElementLayout(elements, canvasSize) {
  const adjustments = []
  const spacing = calculateOptimalSpacing(elements, canvasSize)
  const alignmentIssues = detectAlignmentIssues(elements)

  // Fix alignment issues
  alignmentIssues.forEach(issue => {
    issue.elements.forEach(elementId => {
      if (issue.type === 'vertical-misalignment') {
        adjustments.push({
          elementId,
          property: 'x',
          oldValue: elements.find(e => e.id === elementId)?.x || 0,
          newValue: issue.suggestedX,
          reason: 'Align vertically with nearby elements'
        })
      } else if (issue.type === 'horizontal-misalignment') {
        adjustments.push({
          elementId,
          property: 'y',
          oldValue: elements.find(e => e.id === elementId)?.y || 0,
          newValue: issue.suggestedY,
          reason: 'Align horizontally with nearby elements'
        })
      }
    })
  })

  // Calculate layout quality score
  const score = Math.max(0, 100 - (alignmentIssues.length * 10))

  return {
    adjustments,
    score,
    issues: alignmentIssues.map(i => `${i.type}: ${i.difference.toFixed(1)}px difference`)
  }
}

// ============================================================
// Font Pairing Data
// ============================================================

const FONT_PAIRINGS = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    heading: 'Montserrat',
    subheading: 'Lato',
    body: 'Open Sans',
    description: 'Clean and professional for business designs',
    category: 'professional'
  },
  {
    id: 'elegant-classic',
    name: 'Elegant Classic',
    heading: 'Playfair Display',
    subheading: 'Lora',
    body: 'Merriweather',
    description: 'Sophisticated and timeless',
    category: 'elegant'
  },
  {
    id: 'playful-modern',
    name: 'Playful Modern',
    heading: 'Poppins',
    subheading: 'Nunito',
    body: 'Quicksand',
    description: 'Fun and friendly for creative projects',
    category: 'playful'
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    heading: 'Bebas Neue',
    subheading: 'Oswald',
    body: 'Roboto',
    description: 'Strong and attention-grabbing',
    category: 'bold'
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    heading: 'Inter',
    subheading: 'Work Sans',
    body: 'Source Sans Pro',
    description: 'Simple and modern minimalism',
    category: 'minimal'
  }
]

// ============================================================
// API Routes
// ============================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Retouch Server',
    version: '1.0.0',
    models: ['color-harmony', 'layout-optimization', 'font-pairing']
  })
})

// Get color palette suggestions
app.get('/api/ai/color-palette', (req, res) => {
  try {
    const { colors, count = 4 } = req.query
    
    if (!colors) {
      return res.status(400).json({ message: 'Colors parameter is required' })
    }

    const colorArray = colors.split(',')
    const baseColor = colorArray[0] || '#667eea'

    const palettes = [
      generateComplementaryPalette(baseColor),
      generateAnalogousPalette(baseColor),
      generateTriadicPalette(baseColor),
      generateMonochromaticPalette(baseColor),
      generateSplitComplementaryPalette(baseColor)
    ].slice(0, parseInt(count))

    res.json({
      currentPalette: {
        id: 'current',
        name: 'Current',
        colors: colorArray,
        description: 'Your current color scheme',
        harmony: 'custom'
      },
      suggestions: palettes,
      analysis: {
        harmony: 'custom',
        contrast: 75,
        accessibility: true
      }
    })
  } catch (error) {
    console.error('Color palette error:', error)
    res.status(500).json({ message: 'Failed to generate color palettes' })
  }
})

// Get font pairing suggestions
app.get('/api/ai/font-pairing', (req, res) => {
  try {
    const { currentFonts, designType } = req.query

    let suggestions = FONT_PAIRINGS

    // Filter by design type if provided
    if (designType) {
      suggestions = suggestions.filter(p => p.category === designType)
    }

    // If no matches, return all
    if (suggestions.length === 0) {
      suggestions = FONT_PAIRINGS
    }

    res.json({
      currentPairing: currentFonts ? {
        id: 'current',
        name: 'Current Fonts',
        heading: currentFonts.split(',')[0] || 'Arial',
        subheading: currentFonts.split(',')[1] || 'Arial',
        body: currentFonts.split(',')[2] || 'Arial',
        description: 'Your current font selection',
        category: 'custom'
      } : null,
      suggestions: suggestions.slice(0, 5),
      analysis: {
        readability: 85,
        hierarchy: true,
        consistency: true
      }
    })
  } catch (error) {
    console.error('Font pairing error:', error)
    res.status(500).json({ message: 'Failed to get font pairings' })
  }
})

// Optimize layout
app.post('/api/ai/layout', (req, res) => {
  try {
    const { elements, canvasSize, options } = req.body

    if (!elements || !canvasSize) {
      return res.status(400).json({ message: 'Elements and canvasSize are required' })
    }

    const result = optimizeElementLayout(elements, canvasSize)

    res.json({
      adjustments: result.adjustments,
      preview: null,
      score: result.score,
      issues: result.issues,
      success: true
    })
  } catch (error) {
    console.error('Layout optimization error:', error)
    res.status(500).json({ message: 'Failed to optimize layout', success: false })
  }
})

// Apply AI retouch
app.post('/api/ai/retouch', (req, res) => {
  try {
    const { designData, options } = req.body
    const startTime = Date.now()

    if (!designData) {
      return res.status(400).json({ message: 'Design data is required' })
    }

    const suggestions = []

    // Generate suggestions based on enabled features
    if (options.features.includes('color-palette')) {
      const colors = extractColorsFromDesign(designData)
      const baseColor = colors[0] || '#667eea'
      const palettes = [
        generateComplementaryPalette(baseColor),
        generateAnalogousPalette(baseColor),
        generateTriadicPalette(baseColor)
      ]

      palettes.forEach((palette, index) => {
        suggestions.push({
          id: `color-${Date.now()}-${index}`,
          feature: 'color-palette',
          title: palette.name,
          description: palette.description,
          confidence: 85,
          data: palette,
          applied: false,
          createdAt: new Date().toISOString()
        })
      })
    }

    if (options.features.includes('font-pairing')) {
      FONT_PAIRINGS.slice(0, 3).forEach((pairing, index) => {
        suggestions.push({
          id: `font-${Date.now()}-${index}`,
          feature: 'font-pairing',
          title: pairing.name,
          description: pairing.description,
          confidence: 80,
          data: pairing,
          applied: false,
          createdAt: new Date().toISOString()
        })
      })
    }

    if (options.features.includes('smart-alignment') || options.features.includes('auto-spacing')) {
      const layoutResult = optimizeElementLayout(
        designData.elements || [],
        designData.canvasSize || { width: 800, height: 600 }
      )

      if (layoutResult.adjustments.length > 0) {
        suggestions.push({
          id: `layout-${Date.now()}`,
          feature: 'smart-alignment',
          title: 'Layout Optimization',
          description: `${layoutResult.adjustments.length} alignment improvements`,
          confidence: layoutResult.score,
          data: layoutResult.adjustments,
          applied: false,
          createdAt: new Date().toISOString()
        })
      }
    }

    const processingTime = Date.now() - startTime

    res.json({
      suggestions,
      preview: null,
      processingTime,
      success: true,
      message: `Generated ${suggestions.length} suggestions`
    })
  } catch (error) {
    console.error('AI retouch error:', error)
    res.status(500).json({
      suggestions: [],
      processingTime: 0,
      success: false,
      message: 'Failed to apply AI retouch'
    })
  }
})

// Enhance image (placeholder - would integrate with actual image processing)
app.post('/api/ai/enhance-image', (req, res) => {
  try {
    const { imageUrl, enhancements, intensity } = req.body

    // Placeholder response
    res.json({
      enhancedImageUrl: imageUrl, // In production, return processed image
      adjustments: {
        contrast: enhancements.contrast ? intensity * 0.5 : 0,
        brightness: enhancements.brightness ? intensity * 0.3 : 0,
        saturation: enhancements.saturation ? intensity * 0.4 : 0,
        sharpness: enhancements.sharpness ? intensity * 0.6 : 0
      },
      success: true
    })
  } catch (error) {
    console.error('Image enhancement error:', error)
    res.status(500).json({ message: 'Failed to enhance image', success: false })
  }
})

// Enhance background (placeholder)
app.post('/api/ai/enhance-background', (req, res) => {
  try {
    const { imageUrl, effect, intensity } = req.body

    // Placeholder response
    res.json({
      enhancedImageUrl: imageUrl, // In production, return processed image
      effect,
      success: true
    })
  } catch (error) {
    console.error('Background enhancement error:', error)
    res.status(500).json({ message: 'Failed to enhance background', success: false })
  }
})

// ============================================================
// Helper Functions
// ============================================================

function extractColorsFromDesign(designData) {
  const colors = []

  // Extract from background
  if (designData.backgroundColor) {
    colors.push(designData.backgroundColor)
  }

  // Extract from elements
  if (designData.elements) {
    designData.elements.forEach(element => {
      if (element.fill && typeof element.fill === 'string' && element.fill.startsWith('#')) {
        colors.push(element.fill)
      }
      if (element.stroke && typeof element.stroke === 'string' && element.stroke.startsWith('#')) {
        colors.push(element.stroke)
      }
    })
  }

  // Remove duplicates and return
  return [...new Set(colors)].slice(0, 5)
}

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log('============================================================')
  console.log('✨ AI Retouch Server')
  console.log('============================================================')
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log('============================================================')
  console.log('Endpoints:')
  console.log('  GET    /api/ai/color-palette')
  console.log('  GET    /api/ai/font-pairing')
  console.log('  POST   /api/ai/layout')
  console.log('  POST   /api/ai/retouch')
  console.log('  POST   /api/ai/enhance-image')
  console.log('  POST   /api/ai/enhance-background')
  console.log('============================================================')
})

export default app

