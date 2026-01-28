/**
 * Sticker Composables Index
 * 
 * Export all composables for the wedding sticker chat system
 */

// Re-export extraction utilities from shared utils
export {
  capitalizeWords,
  escapeRegExp,
} from '@/utils/extraction'

export {
  extractDateFromText,
} from '@/utils/extraction/datePatterns'

export {
  extractCourtesy as extractCourtesyFromText,
} from '@/utils/extraction/courtesyPatterns'

// Size extraction and parseAllInOneMessage - create simple implementations
export function extractSizeFromText(text: string): string | null {
  if (!text) return null
  const sizeMatch = text.match(/\b(4x6|5x7|6x8|8x10|A4|A5|letter)\b/i)
  return sizeMatch ? sizeMatch[1] : null
}

export function parseAllInOneMessage(text: string): {
  date: string | null;
  courtesy: string | null;
  size: string | null;
} {
  return {
    date: null,
    courtesy: null,
    size: extractSizeFromText(text)
  }
}

// AI Response Helper - minimal implementation
export const aiResponseHelper = {
  pick: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
  getGreeting: (): string => 'Hello! I\'m your wedding sticker assistant.',
}

// Offline response handlers
export {
  offlineDelay,
  isGreeting,
  getGreetingResponse,
  isWhoAreYou,
  getWhoAreYouResponse,
  isHowAreYou,
  getHowAreYouResponse,
  isCapabilityQuestion,
  getCapabilityResponse,
  isNonWeddingRequest,
  getNonWeddingResponse,
  isVagueDesignRequest,
  getVagueDesignResponse,
  isAffirmative,
  getAffirmativeResponse,
  isChangeRequest,
  getChangeResponse,
  isNegative,
  getNegativeResponse,
  isThanks,
  getThanksResponse,
  isHelp,
  getHelpResponse,
  isStartRequest,
  getStartResponse,
  isPricingQuestion,
  getPricingResponse,
  isConfused,
  getConfusedResponse,
  getFallbackResponse,
  getExtractionSuccessResponse,
  // Title-only, Names-only, Date-only detection
  isTitleOnly,
  getTitleOnlyResponse,
  isNamesOnly,
  getNamesOnlyResponse,
  isDateOnly,
  getDateOnlyResponse,
  isCourtesyOnly,
} from './useOfflineResponses'

// Local extraction
export {
  extractWeddingDetails,
  hasWeddingDetails,
  isCommonWeddingTitle,
  COMMON_WEDDING_TITLES,
} from './useLocalExtraction'

export type { LocalExtractionResult } from '../types'

// Main wedding chat composable
export {
  useWeddingChat,
  type UseWeddingChatOptions,
} from './useWeddingChat'

// Title library system
export {
  useTitleLibrary,
  type TitleEntry,
  type TitleImageConfig,
} from './useTitleLibrary'

// Flourish decoration system
export {
  useFlourishSystem,
  type FlourishConfig,
} from './useFlourishSystem'

// Speech-to-Text and Text-to-Speech
export {
  useSpeechToText,
  type SpeechToTextOptions,
  type ChatMessage,
} from './useSpeechToText'

// Spell correction with fuzzy matching
export {
  useSpellCorrection,
  correctSpelling,
  findFuzzyMatch,
  levenshteinDistance,
  COMMON_MISSPELLINGS,
  type SpellCorrectionResult,
} from './useSpellCorrection'

// Image Upload Flow (crop modal, upload modal, image handling)
export {
  useImageUploadFlow,
  type CropCompleteData,
  type UploadedImage,
  type UseImageUploadFlowOptions,
  type UseImageUploadFlowReturn,
} from './useImageUploadFlow'

// Intent detection for chat messages
export {
  useIntentDetection,
  detectIntent,
  isPositiveConfirmation,
  isNegativeConfirmation,
  isGreeting as isGreetingIntent,
  isChangeRequest as isChangeRequestIntent,
  extractTargetField,
  type UserIntent,
  type IntentEntities,
  type IntentResult,
} from './useIntentDetection'

// AI Chat Logic (Ollama integration)
export {
  useAIChatLogic,
  type WeddingAssistantActionName,
  type WeddingAssistantDecision,
  type UseAIChatLogicOptions,
  type ChatMessage as AIChatMessage,
  type ExtractedInfo,
  type AskedQuestions as AIAskedQuestions,
  type FormData as AIFormData,
} from './useAIChatLogic'

// Background Manager System
export {
  useBackgroundManager,
  type BackgroundColorConfig,
  type BackgroundManifestItem,
  type UseBackgroundManagerOptions,
  type UseBackgroundManagerReturn,
  LIGHT_BG_COLORS,
  DARK_BG_COLORS,
  RED_GOLD_BG_COLORS,
} from './useBackgroundManager'

// Title detection utilities
export {
  useTitleDetection,
  titlePatterns,
  titlePhraseMap,
  isPotentialTitle,
  extractTitleFromText,
  getAllTitleOptions,
} from './useTitleDetection'

// Wedding Preview Generation
export {
  useWeddingPreviewGeneration,
  type GenerationDependencies,
  type UseWeddingPreviewGenerationReturn,
} from './useWeddingPreviewGeneration'

// SVG Draggable (mouse + touch support)
export {
  useSVGDraggable,
  type UseSVGDraggableOptions,
  type UseSVGDraggableReturn,
} from './useSVGDraggable'

// SVG Image Updater
export {
  useSVGImageUpdater,
  type UseSVGImageUpdaterOptions,
  type UseSVGImageUpdaterReturn,
  type SVGImageData,
} from './useSVGImageUpdater'

// Wedding State Management
export {
  useWeddingState,
  type UploadedImage as WeddingUploadedImage,
  type AskedQuestions,
  type FormData as WeddingFormData,
  type WeddingStateReturn,
} from './useWeddingState'

// ========================================
// MOVED FROM src/composables/ (sticker-only usage)
// ========================================

// Wedding Sticker Text Updater
export {
  useWeddingStickerUpdater,
  type WeddingStickerElements,
  type WeddingStickerData,
} from './useWeddingStickerUpdater'

// Sticker Export (PNG, PDF formats)
export {
  useStickerExport,
  type ExportOptions as StickerExportOptions,
} from './useStickerExport'

// SVG Text Replacement (decorative titles)
export {
  useSVGTextReplacement,
  type ReplacementConfig,
  type ReplacementState,
} from './useSVGTextReplacement'

// SVG Image Manager
export {
  useSVGImageManager,
  type SVGImage,
  type ImageUploadOptions,
} from './useSVGImageManager'

// SVG Export
export {
  useSVGExport,
  type ExportOptions as SVGExportOptions,
} from './useSVGExport'

// Dynamic SVG Generator
export {
  useDynamicSVG,
  type DynamicSVGConfig,
  type SVGDimensions,
  type ExportConfig,
  type ElementPosition,
} from './useDynamicSVG'

// Upload Chat Flow (multi-photo crop, choose main, bg removal prompt)
export {
  useUploadChatFlow,
  type UseUploadChatFlowDeps,
  type UseUploadChatFlowReturn,
} from './useUploadChatFlow'

// Auto-save indicator
export {
  useAutoSave,
  type AutoSaveOptions,
} from './useAutoSave'

// Image actions (flip, swap, drag modes)
export {
  useImageActions,
  type ImageActionsOptions,
} from './useImageActions'

// Content protection (prevent context menu on images)
export {
  useContentProtection,
  type ContentProtectionOptions,
} from './useContentProtection'

// Offline storage (IndexedDB)
export {
  useOfflineStorage,
  type UseOfflineStorageOptions,
  type UseOfflineStorageReturn,
} from './useOfflineStorage'

// Orientation handler
export {
  useOrientationHandler,
  type Orientation,
  type UseOrientationHandlerOptions,
  type UseOrientationHandlerReturn,
} from './useOrientationHandler'

// Voice control
export {
  useVoiceControl,
  type VoiceCommand,
  type UseVoiceControlOptions,
  type UseVoiceControlReturn,
} from './useVoiceControl'
