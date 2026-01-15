/**
 * Local Extraction for Wedding Sticker Details
 * 
 * Extracts wedding details (title, names, date, courtesy) from user messages
 * using pattern matching. Works completely offline without AI.
 * 
 * NOTE: Date, Name, and Courtesy patterns are now imported from shared utilities.
 * See: src/utils/extraction/
 */

import type { LocalExtractionResult } from '../types'
import { 
  DATE_PATTERNS, 
  extractDateFromText as sharedExtractDate,
  hasDate as sharedHasDate 
} from '@/utils/extraction/datePatterns'
import { 
  NAME_STOP_WORDS,
  capitalizeWords as sharedCapitalize,
  normalizeNameCandidate as sharedNormalizeName,
  BRACKET_PATTERN as SHARED_BRACKET_PATTERN,
  NAME_PATTERNS as SHARED_NAME_PATTERNS,
  extractNamesWithMeta,
  shouldConfirmExtractedNames
} from '@/utils/extraction/namePatterns'
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
  /^(wedding\s+ceremony)$/i,  // Happy marriage/married life patterns
  /\b(happy\s+(?:marriage|married)\s+life)\b/i,
  /\b(wishing\s+you\s+a?\s*happy\s+(?:marriage|married)\s+life)\b/i,  // Graduation patterns
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

// Name patterns (supports full names like "Yahaya Suleiman & Haruna Mohammed")
// Using shared BRACKET_PATTERN from utils
const BRACKET_PATTERN = SHARED_BRACKET_PATTERN

// Use shared NAME_PATTERNS as the single source of truth.
// This ensures multi-word full names like "Muhammad Haruna & Ramatu Yahaya" work consistently.
const NAME_PATTERNS = SHARED_NAME_PATTERNS

// Using shared normalizeNameCandidate from namePatterns.ts
const normalizeNameCandidate = sharedNormalizeName

// Date patterns - using shared DATE_PATTERNS imported from '@/utils/extraction/datePatterns'
// (Do not redefine here - use the import at the top of this file)

// Courtesy patterns - using shared COURTESY_PATTERNS imported from '@/utils/extraction/courtesyPatterns'  
// (Do not redefine here - use the import at the top of this file)

// Using shared capitalizeWords from namePatterns.ts
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

  // Use a working message for downstream extraction (names/date/courtesy).
  // If a title is detected at the start (e.g., "Happy Marriage Life ..."),
  // strip it so title words don't leak into name extraction.
  let workMsg = msg
  let workLower = lower
  
  // --- Extract Title/Blessing ---
  // Explicit title/heading assignment: “title is …”, “heading: …”
  const explicitTitleMatch = msg.match(/\b(?:the\s+)?(?:title|heading)\s*(?:is|:)\s*([^\n]+)$/i)
  if (explicitTitleMatch && explicitTitleMatch[1]) {
    result.title = capitalize(explicitTitleMatch[1].trim())
    result.foundSomething = true

    // Remove explicit title assignment from the working message.
    // Example: "title: Happy Marriage Life" should not affect name parsing.
    workMsg = msg.replace(explicitTitleMatch[0], '').trim()
    workMsg = workMsg.replace(/^[\s,;:\-]+/, '').trim()
    workLower = workMsg.toLowerCase()
  } else {
    for (const pattern of TITLE_PATTERNS) {
      const exec = pattern.exec(msg)
      if (exec && exec[0]) {
        const matchedTitle = exec[0].trim()
        // Use the full matched phrase for generic title patterns (e.g. “congratulation on your wedding”).
        result.title = capitalize(matchedTitle)
        result.foundSomething = true

        // If the title appears at the beginning, strip it from the working text.
        // This prevents cases like: "Happy Marriage Life Sakina and Abdullahi" -> name1 becomes "Life Sakina".
        const idx = (exec as any).index as number | undefined
        if (typeof idx === 'number' && idx <= 2) {
          workMsg = msg.slice(idx + matchedTitle.length).trim()
          workMsg = workMsg.replace(/^[\s,;:\-]+/, '').trim()
          workLower = workMsg.toLowerCase()
        }
        break
      }
    }
  }
  
  // --- Extract Names ---
  for (const pattern of NAME_PATTERNS) {
    const match = workMsg.match(pattern)
    if (!match) continue

    // Brackets: parse the inner content with a couple pattern
    if (pattern === BRACKET_PATTERN) {
      const inner = (match[1] || '').trim()
      const couple = inner.match(/\b(.+?)\s*(?:&|and|with)\s*(.+)\b/i)
      if (couple) {
        const n1 = normalizeNameCandidate(couple[1])
        const n2 = normalizeNameCandidate(couple[2])
        if (n1 && n2) {
          result.name1 = n1
          result.name2 = n2
          result.foundSomething = true
          break
        }
      } else {
        // Single name in brackets
        const single = normalizeNameCandidate(inner)
        if (single) {
          result.name1 = single
          result.foundSomething = true
          break
        }
      }
      continue
    }

    // Bride/Groom patterns use group 1 & 2 as names
    if (match[2]) {
      const n1 = normalizeNameCandidate(match[1])
      const n2 = normalizeNameCandidate(match[2])
      if (n1 && n2) {
        result.name1 = n1
        result.name2 = n2
        result.foundSomething = true
        break
      }
      continue
    }

    // “names: …” line (group 1) → try to split into two names
    const payload = (match[1] || '').trim()
    const couple = payload.match(/\b(.+?)\s*(?:&|and|with)\s*(.+)\b/i)
    if (couple) {
      const n1 = normalizeNameCandidate(couple[1])
      const n2 = normalizeNameCandidate(couple[2])
      if (n1 && n2) {
        result.name1 = n1
        result.name2 = n2
        result.foundSomething = true
        break
      }
    } else {
      // Single name payload
      const single = normalizeNameCandidate(payload)
      if (single) {
        result.name1 = single
        result.foundSomething = true
        break
      }
    }
  }

  // If regex-based extraction didn't find names, use shared fallback (includes compromise NLP).
  // Mark low-confidence results for confirmation before applying.
  if (!result.name1 && !result.name2) {
    const meta = extractNamesWithMeta(workMsg)
    if (meta.name1) result.name1 = meta.name1
    if (meta.name2) result.name2 = meta.name2
    if (meta.source !== 'none' && (meta.name1 || meta.name2)) {
      result.nameSource = meta.source
      result.nameNeedsConfirmation = shouldConfirmExtractedNames(meta)
      result.foundSomething = true
    }
  }
  
  // --- Extract Date ---
  for (const pattern of DATE_PATTERNS) {
    const match = workMsg.match(pattern)
    if (match) {
      // Use match[0] (full match) not match[1] (first capture group)
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
      // Normalize “Courtesy: X” patterns
      if (match[1] && /^courtesy$/i.test(match[1].trim()) && match[2]) {
        result.courtesy = match[2].trim()
      } else {
        result.courtesy = match[1].trim()
      }
      result.foundSomething = true
      break
    }
  }

  // Heuristic: “... wedding Fatiha” should not become courtesy.
  // If we have a title-ish phrase and no names were captured, try a trailing single name.
  // Avoid this heuristic if the user is explicitly setting the title/heading.
  if (!result.name1 && !result.name2 && !/\b(title|heading)\b/i.test(workLower)) {
    const trailingNameMatch = workMsg.match(/\bwedding\b\s+([A-Za-z']{2,})\s*$/i)
    if (trailingNameMatch) {
      const candidate = capitalize(trailingNameMatch[1].trim())
      const stop = new Set([
        'Wedding',
        'Ceremony',
        'Marriage',
        'Family',
        'Anniversary',
        'Sticker',
        'Stiker',
        'Stickers',
        'Stikers',
        'Congratulations',
        'Congratulation',
        'Alhamdulillah',
        'Mashaallah',
        'Mashallah',
        'Barakallah'
      ])
      if (!stop.has(candidate)) {
        result.name1 = candidate
        result.foundSomething = true
      }
    }
  }
  
  // If message is short and doesn't match other patterns, it might be a courtesy message
  const hasExistingName = existingInfo?.hasName ?? false
  const hasExistingDate = existingInfo?.hasDate ?? false
  const noNameInMsg = !NAME_PATTERNS.some(p => p.test(workMsg))
  const noDateInMsg = !DATE_PATTERNS.some(p => p.test(workMsg))
  
  if (!result.foundSomething && hasExistingName && hasExistingDate && noNameInMsg && noDateInMsg) {
    // Short text without names/dates is likely a courtesy message
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
    NAME_PATTERNS.some(p => p.test(msg)) ||
    DATE_PATTERNS.some(p => p.test(msg)) ||
    COURTESY_PATTERNS.some(p => p.test(msg))
  )
}
