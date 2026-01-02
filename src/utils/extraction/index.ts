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

// Name extraction
export {
  BRACKET_PATTERN,
  NAME_PATTERNS,
  NAME_STOP_WORDS,
  capitalizeWords,
  normalizeNameCandidate,
  extractNamesFromBrackets,
  extractNames,
  hasNames,
} from './namePatterns'

// Courtesy extraction
export {
  COURTESY_PATTERNS,
  extractCourtesy,
  extractCourtesyFromText,
  hasCourtesy,
  isCourtesyOnly,
} from './courtesyPatterns'

// Re-export types if needed
export interface ExtractedNames {
  name1: string | null
  name2: string | null
}

export interface ExtractedCourtesy {
  text: string
  prefix: string
}
