/**
 * Extraction Utilities - Single Source of Truth
 * 
 * All text extraction patterns and functions for the sticker system.
 * Import from this file instead of duplicating patterns elsewhere.
 */

// Date extraction
export {
  DATE_PATTERNS,
  extractDateFromText,
  hasDate,
  isDateOnly,
} from './datePatterns'

// Courtesy extraction
export {
  COURTESY_PATTERNS,
  extractCourtesy,
  extractCourtesyFromText,
  hasCourtesy,
  isCourtesyOnly,
} from './courtesyPatterns'

// Name extraction - bracket-based (offline) + DeepSeek helpers
export {
  extractNames,
  extractNamesFromBrackets,
  hasBracketedNames,
  formatNamesAsBrackets,
  emptyNameResult,
  buildNameExtractionPrompt,
  parseDeepSeekNameResponse,
} from './nameExtraction'

export type { NameExtractionResult } from './nameExtraction'

// Simple utility for capitalizing words (kept for general use)
export function capitalizeWords(str: string): string {
  if (!str) return ''
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Escape special regex characters in a string
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Re-export types if needed
export interface ExtractedNames {
  name1: string | null
  name2: string | null
}

export interface ExtractedCourtesy {
  text: string
  prefix: string
}
