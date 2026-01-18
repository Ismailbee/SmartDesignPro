/**
 * Local Extraction for Wedding Sticker Details
 * 
 * Extracts wedding details (title, date, courtesy, names) from user messages
 * using pattern matching. Works completely offline without AI.
 * 
 * Name extraction uses BRACKET NOTATION: "(Name1 & Name2)"
 * This is FREE and 100% reliable. If no brackets, DeepSeek can be called as fallback.
 * See: src/utils/extraction/nameExtraction.ts
 */

import type { LocalExtractionResult } from '../types'
import { 
  DATE_PATTERNS, 
  extractDateFromText as sharedExtractDate,
  hasDate as sharedHasDate 
} from '@/utils/extraction/datePatterns'
import { 
  capitalizeWords as sharedCapitalize,
  extractNamesFromBrackets,
  hasBracketedNames
} from '@/utils/extraction'
import { 
  COURTESY_PATTERNS,
  extractCourtesy as sharedExtractCourtesy 
} from '@/utils/extraction/courtesyPatterns'

// Common wedding titles that should be auto-applied without confirmation
// These are the standard headings users expect on wedding stickers
export const COMMON_WEDDING_TITLES = [
  'congratulation on your wedding ceremony',
  'congratulations on your wedding ceremony',
  'alhamdulillahi on your wedding ceremony',
  'alhamdulillah on your wedding ceremony',
  'congratulation on your wedding',
  'congratulations on your wedding',
  'alhamdulillahi on your wedding',
  'alhamdulillah on your wedding',
  'happy marriage life',
  'happy married life',
  'thanks for attending our wedding',
  'thank you for attending our wedding',
  'conjugal bliss',
  'together forever',
  'together for ever',
]

/**
 * Check if a title is a common/known wedding title
 * These titles should be applied directly without confirmation
 */
export function isCommonWeddingTitle(title: string): boolean {
  if (!title) return false
  const normalized = title.toLowerCase().trim().replace(/\s+/g, ' ')
  return COMMON_WEDDING_TITLES.some(common => 
    normalized === common || 
    normalized.includes(common) ||
    common.includes(normalized)
  )
}

// Title patterns for stickers (wedding, graduation, birthday, naming, etc.)
// NOTE: These are specific to sticker titles and stay here
const TITLE_PATTERNS = [
  // Wedding patterns
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding\s+nikkah|wedding)?/i,
  /(congratulations?)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding\s+nikkah|wedding|marriage)?/i,
  /(masha\s*['']?allah)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /(barakallah)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /(with\s+prayers?)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /(best\s+wishes)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /^(wedding\s+ceremony)$/i,
  // Happy marriage/married life patterns
  /\b(happy\s+(?:marriage|married)\s+life)\b/i,
  /\b(wishing\s+you\s+a?\s*happy\s+(?:marriage|married)\s+life)\b/i,
  // Graduation patterns
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?(graduation\s+ceremony|graduation)/i,
  /(congratulations?)\s*(on\s+your\s+)?(graduation\s+ceremony|graduation)/i,
  // Birthday patterns
  /(happy\s+birthday)/i,
  /(congratulations?)\s*(on\s+your\s+)?(birthday\s+ceremony|birthday)/i,
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?(birthday\s+ceremony|birthday)/i,
  // Naming ceremony patterns
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?(naming\s+ceremony|naming)/i,
  /(congratulations?)\s*(on\s+your\s+)?(naming\s+ceremony|naming)/i,
  // Quranic walima / nikkah (all walima variations)
  /(congratulations?)\s*(on\s+your\s+)?(qur'?anic\s+)?(walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)/i,
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?(qur'?anic\s+)?(walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)/i,
  // Freedom patterns
  /(congratulations?)\s*(on\s+your\s+)?freedom/i,
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?freedom/i,
  // Special phrases (exact matches)
  /\b(conjugal\s+bliss)\b/i,
  /\b(together\s+for\s*ever)\b/i,
  /\b(toget+her\s+for\s*ever)\b/i,
  // Additional title patterns from useTitleDetection
  /\b(beautiful\s+beginning)\b/i,
  /\b(save\s+the\s+date)\b/i,
  /\b(happy\s+wedding)\b/i,
  /\b(thank[s]?\s+for\s+attending)\b/i,
  /\b(thanks?\s+for\s+attending\s+our\s+wedding)\b/i,
  /\b(thank\s+you\s+for\s+attending\s+our\s+wedding)\b/i,
  /\b(with\s+love)\b/i,
]

// Using shared capitalizeWords from extraction utils
const capitalize = sharedCapitalize

/**
 * Extract wedding details from a message
 * 
 * @param message - The user's message
 * @param existingInfo - Optional existing extracted info to check context
 * @returns LocalExtractionResult with any found details
 */
export function extractWeddingDetails(
  message: string,
  existingInfo?: { hasName?: boolean; hasDate?: boolean }
): LocalExtractionResult {
  const result: LocalExtractionResult = { foundSomething: false }
  // Ensure message is a string
  if (!message || typeof message !== 'string') return result
  const msg = message.trim()
  const lower = msg.toLowerCase()

  // Use a working message for downstream extraction (date/courtesy).
  let workMsg = msg
  
  // --- Extract Title/Blessing ---
  // Explicit title/heading assignment: "title is …", "heading: …"
  const explicitTitleMatch = msg.match(/\b(?:the\s+)?(?:title|heading)\s*(?:is|:)\s*([^\n]+)$/i)
  if (explicitTitleMatch && explicitTitleMatch[1]) {
    result.title = capitalize(explicitTitleMatch[1].trim())
    result.foundSomething = true

    // Remove explicit title assignment from the working message.
    workMsg = msg.replace(explicitTitleMatch[0], '').trim()
    workMsg = workMsg.replace(/^[\s,;:\-]+/, '').trim()
  } else {
    for (const pattern of TITLE_PATTERNS) {
      const exec = pattern.exec(msg)
      if (exec && exec[0]) {
        const matchedTitle = exec[0].trim()
        result.title = capitalize(matchedTitle)
        result.foundSomething = true

        // If the title appears at the beginning, strip it from the working text.
        const idx = (exec as any).index as number | undefined
        if (typeof idx === 'number' && idx <= 2) {
          workMsg = msg.slice(idx + matchedTitle.length).trim()
          workMsg = workMsg.replace(/^[\s,;:\-]+/, '').trim()
        }
        break
      }
    }
  }
  
  // --- Extract Names from Brackets ---
  // Uses bracket notation "(Name1 & Name2)" - FREE and 100% reliable
  const nameResult = extractNamesFromBrackets(workMsg)
  if (nameResult && nameResult.name1) {
    result.name1 = nameResult.name1
    result.name2 = nameResult.name2
    result.nameSource = 'bracket'
    result.foundSomething = true
  }
  
  // --- Extract Date ---
  for (const pattern of DATE_PATTERNS) {
    const match = workMsg.match(pattern)
    if (match) {
      result.date = match[0].trim()
      // Month+Year only (e.g. "January, 2026") needs an exact day.
      result.dateIsPartial = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s+\d{4}$/i.test(result.date)
      result.foundSomething = true
      break
    }
  }
  
  // --- Extract Courtesy Message ---
  for (const pattern of COURTESY_PATTERNS) {
    const match = workMsg.match(pattern)
    if (match) {
      // Normalize "Courtesy: X" patterns
      if (match[1] && /^courtesy$/i.test(match[1].trim()) && match[2]) {
        result.courtesy = match[2].trim()
      } else {
        result.courtesy = match[1].trim()
      }
      result.foundSomething = true
      break
    }
  }

  // If message is short and doesn't match other patterns, it might be a courtesy message
  const hasExistingName = existingInfo?.hasName ?? false
  const hasExistingDate = existingInfo?.hasDate ?? false
  const noDateInMsg = !DATE_PATTERNS.some(p => p.test(workMsg))
  
  if (!result.foundSomething && hasExistingName && hasExistingDate && noDateInMsg) {
    // Short text without dates is likely a courtesy message
    const looksLikeQuestion = /\?|\b(what|who|which|how|when|where|need|provide|information|info|details|do\s+i\s+need)\b/i.test(workMsg)
    if (workMsg.length >= 3 && workMsg.length < 100 && !looksLikeQuestion && !/^(yes|no|ok|hi|hello|hey|thanks)/i.test(workMsg)) {
      result.courtesy = workMsg
      result.foundSomething = true
    }
  }
  
  return result
}

/**
 * Check if a message contains any extractable wedding details
 */
export function hasWeddingDetails(message: string): boolean {
  const msg = message.trim()
  
  return (
    TITLE_PATTERNS.some(p => p.test(msg)) ||
    DATE_PATTERNS.some(p => p.test(msg)) ||
    COURTESY_PATTERNS.some(p => p.test(msg)) ||
    hasBracketedNames(msg)
  )
}
