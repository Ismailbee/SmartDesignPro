/**
 * AI Retouch API Service
 * Handles AI-powered design retouch and layout optimization
 */

import type {
  RetouchRequest,
  RetouchResponse,
  LayoutOptimizationRequest,
  LayoutOptimizationResponse,
  ColorAnalysisRequest,
  ColorAnalysisResponse,
  FontAnalysisRequest,
  FontAnalysisResponse,
  ImageEnhancementRequest,
  ImageEnhancementResponse,
  BackgroundEnhancementRequest,
  BackgroundEnhancementResponse
} from '@/types/ai-retouch'

const API_BASE_URL = import.meta.env.VITE_AI_RETOUCH_URL || 'http://localhost:3005/api'

/**
 * Apply AI retouch to design
 */
export async function applyAIRetouch(request: RetouchRequest): Promise<RetouchResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/retouch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to apply AI retouch')
  }

  return response.json()
}

/**
 * Optimize layout
 */
export async function optimizeLayout(request: LayoutOptimizationRequest): Promise<LayoutOptimizationResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to optimize layout')
  }

  return response.json()
}

/**
 * Analyze colors and get palette suggestions
 */
export async function analyzeColors(request: ColorAnalysisRequest): Promise<ColorAnalysisResponse> {
  const params = new URLSearchParams()
  params.append('colors', request.colors.join(','))
  if (request.count) params.append('count', request.count.toString())

  const response = await fetch(`${API_BASE_URL}/ai/color-palette?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to analyze colors')
  }

  return response.json()
}

/**
 * Get font pairing suggestions
 */
export async function getFontPairings(request: FontAnalysisRequest): Promise<FontAnalysisResponse> {
  const params = new URLSearchParams()
  params.append('currentFonts', request.currentFonts.join(','))
  if (request.designType) params.append('designType', request.designType)

  const response = await fetch(`${API_BASE_URL}/ai/font-pairing?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to get font pairings')
  }

  return response.json()
}

/**
 * Enhance image (contrast, brightness, etc.)
 */
export async function enhanceImage(request: ImageEnhancementRequest): Promise<ImageEnhancementResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/enhance-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to enhance image')
  }

  return response.json()
}

/**
 * Enhance background
 */
export async function enhanceBackground(request: BackgroundEnhancementRequest): Promise<BackgroundEnhancementResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/enhance-background`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to enhance background')
  }

  return response.json()
}

/**
 * Check server health
 */
export async function checkAIHealth(): Promise<{ status: string; models: any[] }> {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
  return response.json()
}

/**
 * Local AI Processing (Browser-based)
 * These functions run in the browser without server calls
 */

/**
 * Generate color palette suggestions locally
 */
export function generateLocalColorPalettes(colors: string[], count: number = 3) {
  // Simple color harmony algorithm
  const palettes = []
  
  // Complementary palette
  palettes.push({
    id: 'complementary',
    name: 'Complementary',
    colors: generateComplementaryColors(colors[0] || '#667eea'),
    description: 'Colors opposite on the color wheel',
    harmony: 'complementary' as const
  })

  // Analogous palette
  palettes.push({
    id: 'analogous',
    name: 'Analogous',
    colors: generateAnalogousColors(colors[0] || '#667eea'),
    description: 'Colors adjacent on the color wheel',
    harmony: 'analogous' as const
  })

  // Triadic palette
  palettes.push({
    id: 'triadic',
    name: 'Triadic',
    colors: generateTriadicColors(colors[0] || '#667eea'),
    description: 'Three colors evenly spaced on the color wheel',
    harmony: 'triadic' as const
  })

  // Monochromatic palette
  palettes.push({
    id: 'monochromatic',
    name: 'Monochromatic',
    colors: generateMonochromaticColors(colors[0] || '#667eea'),
    description: 'Variations of a single color',
    harmony: 'monochromatic' as const
  })

  return palettes.slice(0, count)
}

/**
 * Helper: Generate complementary colors
 */
function generateComplementaryColors(baseColor: string): string[] {
  const hsl = hexToHSL(baseColor)
  return [
    baseColor,
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 100)),
    hslToHex((hsl.h + 180) % 360, hsl.s, Math.max(hsl.l - 20, 0)),
    hslToHex(hsl.h, Math.max(hsl.s - 20, 0), hsl.l)
  ]
}

/**
 * Helper: Generate analogous colors
 */
function generateAnalogousColors(baseColor: string): string[] {
  const hsl = hexToHSL(baseColor)
  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    baseColor,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)),
    hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 0))
  ]
}

/**
 * Helper: Generate triadic colors
 */
function generateTriadicColors(baseColor: string): string[] {
  const hsl = hexToHSL(baseColor)
  return [
    baseColor,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 100)),
    hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 0))
  ]
}

/**
 * Helper: Generate monochromatic colors
 */
function generateMonochromaticColors(baseColor: string): string[] {
  const hsl = hexToHSL(baseColor)
  return [
    hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 30, 100)),
    hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)),
    baseColor,
    hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 0)),
    hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 30, 0))
  ]
}

/**
 * Helper: Convert hex to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
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

/**
 * Helper: Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
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

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Calculate optimal spacing between elements
 */
export function calculateOptimalSpacing(elements: any[], canvasSize: { width: number; height: number }) {
  const baseSpacing = Math.min(canvasSize.width, canvasSize.height) * 0.02 // 2% of smallest dimension
  
  return {
    horizontal: Math.max(baseSpacing, 16),
    vertical: Math.max(baseSpacing, 16),
    margin: Math.max(baseSpacing * 2, 24)
  }
}

/**
 * Detect alignment issues
 */
export function detectAlignmentIssues(elements: any[]) {
  const issues: any[] = []
  const threshold = 5 // pixels

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const el1 = elements[i]
      const el2 = elements[j]

      // Check vertical alignment
      if (Math.abs(el1.x - el2.x) < threshold) {
        issues.push({
          type: 'vertical-misalignment',
          elements: [el1.id, el2.id],
          difference: Math.abs(el1.x - el2.x)
        })
      }

      // Check horizontal alignment
      if (Math.abs(el1.y - el2.y) < threshold) {
        issues.push({
          type: 'horizontal-misalignment',
          elements: [el1.id, el2.id],
          difference: Math.abs(el1.y - el2.y)
        })
      }
    }
  }

  return issues
}

