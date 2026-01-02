/**
 * Sticker Composables Index
 * 
 * Export all composables for the wedding sticker chat system
 */

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
  type AskedQuestions,
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

// Extraction utilities for names, dates, courtesy
export {
  useExtractionUtils,
  capitalizeWords,
  escapeRegExp,
  extractNamesFromResponse,
  extractDateFromText,
  extractCourtesyFromText,
  extractSizeFromText,
  extractNamesFromBrackets,
  parseAllInOneMessage,
} from './useExtractionUtils'

// AI Response Helper - professional response templates
export {
  useAIResponseHelper,
  aiResponseHelper,
  pick,
  greetings,
  confirmations,
  processingMessages,
  askNames,
  askDate,
  askCourtesy,
  successMessages,
  pictureMessages,
  sizeMessages,
  multipleImagesMessage,
  errorMessages,
  jokes,
  casualResponses,
  getGreeting,
} from './useAIResponseHelper'

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
