/**
 * AI Retouch Type Definitions
 */

// AI Retouch Features
export type AIRetouchFeature =
  | 'color-palette'
  | 'font-pairing'
  | 'contrast-brightness'
  | 'background-enhancement'
  | 'smart-alignment'
  | 'auto-spacing'
  | 'balance-detection'
  | 'content-aware-scaling'
  | 'auto-layering'

// Processing Status
export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error'

// Color Palette
export interface ColorPalette {
  id: string
  name: string
  colors: string[] // Array of hex colors
  description: string
  harmony: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split-complementary'
}

// Font Pairing
export interface FontPairing {
  id: string
  name: string
  heading: string
  subheading: string
  body: string
  description: string
  category: 'modern' | 'classic' | 'elegant' | 'playful' | 'professional'
}

// Layout Adjustment
export interface LayoutAdjustment {
  elementId: string
  property: 'x' | 'y' | 'width' | 'height' | 'rotation' | 'zIndex'
  oldValue: number
  newValue: number
  reason: string
}

// AI Suggestion
export interface AISuggestion {
  id: string
  feature: AIRetouchFeature
  title: string
  description: string
  confidence: number // 0-100
  preview?: string // Base64 or URL
  data: any // Feature-specific data
  applied: boolean
  createdAt: string
}

// Retouch Options
export interface RetouchOptions {
  features: AIRetouchFeature[]
  intensity: number // 0-100
  preserveOriginal: boolean
  autoApply: boolean
}

// Retouch Request
export interface RetouchRequest {
  designData: {
    elements: any[]
    canvasSize: { width: number; height: number }
    backgroundColor?: string
  }
  options: RetouchOptions
}

// Retouch Response
export interface RetouchResponse {
  suggestions: AISuggestion[]
  preview?: string
  processingTime: number
  success: boolean
  message?: string
}

// Layout Optimization Request
export interface LayoutOptimizationRequest {
  elements: any[]
  canvasSize: { width: number; height: number }
  options: {
    alignment: boolean
    spacing: boolean
    balance: boolean
    layering: boolean
  }
}

// Layout Optimization Response
export interface LayoutOptimizationResponse {
  adjustments: LayoutAdjustment[]
  preview?: string
  score: number // 0-100, layout quality score
  issues: string[]
  success: boolean
}

// Color Analysis Request
export interface ColorAnalysisRequest {
  colors: string[] // Current design colors
  count?: number // Number of palettes to return
}

// Color Analysis Response
export interface ColorAnalysisResponse {
  currentPalette: ColorPalette
  suggestions: ColorPalette[]
  analysis: {
    harmony: string
    contrast: number
    accessibility: boolean
  }
}

// Font Analysis Request
export interface FontAnalysisRequest {
  currentFonts: string[]
  designType?: 'business' | 'creative' | 'minimal' | 'bold'
}

// Font Analysis Response
export interface FontAnalysisResponse {
  currentPairing: FontPairing
  suggestions: FontPairing[]
  analysis: {
    readability: number
    hierarchy: boolean
    consistency: boolean
  }
}

// Image Enhancement Request
export interface ImageEnhancementRequest {
  imageUrl: string
  enhancements: {
    contrast?: boolean
    brightness?: boolean
    saturation?: boolean
    sharpness?: boolean
  }
  intensity: number
}

// Image Enhancement Response
export interface ImageEnhancementResponse {
  enhancedImageUrl: string
  adjustments: {
    contrast?: number
    brightness?: number
    saturation?: number
    sharpness?: number
  }
  success: boolean
}

// Background Enhancement Request
export interface BackgroundEnhancementRequest {
  imageUrl: string
  effect: 'blur' | 'fade' | 'gradient' | 'artistic' | 'remove'
  intensity: number
}

// Background Enhancement Response
export interface BackgroundEnhancementResponse {
  enhancedImageUrl: string
  effect: string
  success: boolean
}

// AI Retouch State
export interface AIRetouchState {
  isOpen: boolean
  isProcessing: boolean
  processingStatus: ProcessingStatus
  currentFeature: AIRetouchFeature | null
  suggestions: AISuggestion[]
  appliedSuggestions: string[] // IDs of applied suggestions
  history: AISuggestion[]
  error: string | null
  showBeforeAfter: boolean
  beforeSnapshot: string | null
  afterSnapshot: string | null
  intensity: number
  enabledFeatures: AIRetouchFeature[]
}

// Retouch Settings
export interface RetouchSettings {
  autoSave: boolean
  showPreview: boolean
  confirmBeforeApply: boolean
  defaultIntensity: number
  enabledFeatures: AIRetouchFeature[]
  premiumEnabled: boolean
}

// AI Processing Job
export interface AIProcessingJob {
  id: string
  feature: AIRetouchFeature
  status: ProcessingStatus
  progress: number // 0-100
  startTime: number
  endTime?: number
  result?: any
  error?: string
}

// Before/After Comparison
export interface BeforeAfterComparison {
  before: string // Base64 or URL
  after: string // Base64 or URL
  changes: string[]
  timestamp: string
}

// AI Model Info
export interface AIModelInfo {
  name: string
  version: string
  type: 'local' | 'cloud'
  features: AIRetouchFeature[]
  loaded: boolean
  size?: number // In MB
}

// Alignment Guide
export interface AlignmentGuide {
  type: 'vertical' | 'horizontal'
  position: number
  elements: string[] // Element IDs aligned to this guide
  visible: boolean
}

// Spacing Info
export interface SpacingInfo {
  elementId: string
  top: number
  right: number
  bottom: number
  left: number
  recommended: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Balance Analysis
export interface BalanceAnalysis {
  score: number // 0-100
  issues: {
    area: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    type: 'overcrowded' | 'sparse' | 'unbalanced'
    severity: 'low' | 'medium' | 'high'
    suggestion: string
  }[]
  visualCenter: { x: number; y: number }
  actualCenter: { x: number; y: number }
}

// Layer Suggestion
export interface LayerSuggestion {
  elementId: string
  currentZIndex: number
  suggestedZIndex: number
  reason: string
  confidence: number
}

// Export all feature flags
export const AI_FEATURES: Record<AIRetouchFeature, { name: string; icon: string; description: string }> = {
  'color-palette': {
    name: 'Color Palette',
    icon: '🎨',
    description: 'Suggest harmonious color schemes'
  },
  'font-pairing': {
    name: 'Font Pairing',
    icon: '🔤',
    description: 'Recommend professional font combinations'
  },
  'contrast-brightness': {
    name: 'Contrast & Brightness',
    icon: '☀️',
    description: 'Auto-adjust image contrast and brightness'
  },
  'background-enhancement': {
    name: 'Background Enhancement',
    icon: '🖼️',
    description: 'Apply artistic background effects'
  },
  'smart-alignment': {
    name: 'Smart Alignment',
    icon: '📐',
    description: 'Automatically align elements to grid'
  },
  'auto-spacing': {
    name: 'Auto Spacing',
    icon: '↔️',
    description: 'Apply consistent padding and margins'
  },
  'balance-detection': {
    name: 'Balance Detection',
    icon: '⚖️',
    description: 'Identify and fix visual imbalance'
  },
  'content-aware-scaling': {
    name: 'Content-Aware Scaling',
    icon: '🔍',
    description: 'Resize images intelligently'
  },
  'auto-layering': {
    name: 'Auto Layering',
    icon: '📚',
    description: 'Optimize element z-index hierarchy'
  }
}

