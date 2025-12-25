// Shared types for sticker components

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  image?: string
  actions?: MessageAction[]
}

export interface MessageAction {
  label: string
  action: string
  icon?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  gradient: string
}

export interface SVGImage {
  id: string
  url: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  originalWidth: number
  originalHeight: number
  clipPath?: string
}

export interface ExtractedInfo {
  date: string | null
  courtesy: string | null
  size: string | null
  names: {
    name1: string | null
    name2: string | null
  }
}

export interface UploadedImage {
  id: string
  file: File
  url: string
  used: boolean
  timestamp: number
}

export interface StickerTemplate {
  id: string
  name: string
  category: string
  svgContent: string
  thumbnail?: string
  defaultColors?: Record<string, string>
  editableFields?: string[]
}

export interface ExportOptions {
  format: 'png' | 'svg'
  filename?: string
  pngResolution?: number
  includeBackground?: boolean
}

export interface DesignState {
  selectedCategory: string | null
  showPreview: boolean
  isGenerating: boolean
  generationProgress: number
  hasUnsavedChanges: boolean
}

export interface VoiceState {
  isEnabled: boolean
  isRecording: boolean
  isSpeaking: boolean
  transcript: string
  error: string | null
}

// Intent detection types
export interface IntentResult {
  intent: string
  confidence: number
  entities: Record<string, string>
}

export type Intent = 
  | 'greeting'
  | 'thanks'
  | 'help_request'
  | 'cancel'
  | 'download'
  | 'color_change'
  | 'name_change'
  | 'date_change'
  | 'size_change'
  | 'upload_image'
  | 'generate'
  | 'unknown'

// Form data types
export interface StickerFormData {
  description: string
  svgWidth: number
  svgHeight: number
  backgroundColor: string
  textColor: string
  fontSize: number
  fontFamily: string
}

// Canvas/Konva types
export interface CanvasConfig {
  width: number
  height: number
  backgroundColor: string
}

export interface TextConfig {
  x: number
  y: number
  text: string
  fontSize: number
  fontFamily: string
  fill: string
  align: 'left' | 'center' | 'right'
  draggable: boolean
}
