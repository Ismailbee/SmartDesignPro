/**
 * Local Extraction for Wedding Sticker Details
 * 
 * Extracts wedding details (title, names, date, courtesy) from user messages
 * using pattern matching. Works completely offline without AI.
 */

import type { LocalExtractionResult } from '../types'

// Title patterns for stickers (wedding, graduation, birthday, naming, etc.)
const TITLE_PATTERNS = [
  // Wedding patterns
  /(alhamdulillah[i]?)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding\s+nikkah|wedding)?/i,
  /(congratulations?)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding\s+nikkah|wedding|marriage)?/i,
  /(masha\s*['']?allah)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /(barakallah)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /(with\s+prayers?)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /(best\s+wishes)\s*(on\s+your\s+)?(wedding\s+ceremony|wedding)?/i,
  /^(wedding\s+ceremony)$/i,
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
  /\b(with\s+love)\b/i,
]

// Name patterns (supports full names like "Yahaya Suleiman & Haruna Mohammed")
const BRACKET_PATTERN = /[\[(]([^\])\)]+)[\])]/

const NAME_PATTERNS = [
  // Bracketed couples: (A & B) or [A and B]
  BRACKET_PATTERN,
  // Explicit label: “names: A & B”, “couple's names are A and B”
  /\b(?:names?|couple(?:'s)?\s+names?)\s*(?:are|is|:)\s*([^\n]+)$/i,
  // Bride/Groom labels
  /\bbride\s*[:\-]\s*([^,\n]+)\s*(?:,|\s)\s*groom\s*[:\-]\s*([^\n]+)$/i,
  /\bgroom\s*[:\-]\s*([^,\n]+)\s*(?:,|\s)\s*bride\s*[:\-]\s*([^\n]+)$/i,
  // Fallback: “A & B” / “A and B” / “A with B”
  /\b([a-zA-Z][a-zA-Z'-]+(?:\s+[a-zA-Z][a-zA-Z'-]+)?)\s*(?:&|and|with)\s*([a-zA-Z][a-zA-Z'-]+(?:\s+[a-zA-Z][a-zA-Z'-]+)?)\b/i,
  // “wedding of A & B”
  /(?:ceremony|wedding|marriage)\s+(?:of\s+)?([a-zA-Z][a-zA-Z'-]+(?:\s+[a-zA-Z][a-zA-Z'-]+)?)\s*(?:&|and|with)\s*([a-zA-Z][a-zA-Z'-]+(?:\s+[a-zA-Z][a-zA-Z'-]+)?)\b/i,
]

function normalizeNameCandidate(value: string): string | null {
  let name = (value || '').trim()
  if (!name) return null

  // Strip surrounding punctuation/quotes
  name = name.replace(/^[\s"'“”‘’.,:;\-]+/, '').replace(/[\s"'“”‘’.,:;\-]+$/, '').trim()

  // Remove common leading labels/verbs
  name = name
    .replace(/^(?:names?|couple(?:'s)?\s+names?|bride|groom)\s*[:\-]\s*/i, '')
    .replace(/^(?:is|are|was|were)\s+/i, '')
    .replace(/^(?:the\s+)?(?:wedding|ceremony|marriage)\s+/i, '')
    .trim()

  // If we accidentally captured a dangling "on" (e.g. "Salamatu on"), remove it.
  name = name.replace(/\s+on\s*$/i, '').trim()

  // If a date phrase was included, trim it off ("Sarah on 6th March 2025")
  // Only trim when it clearly looks like a date after "on".
  const onDateIdx = name.search(/\s+on\s+(?:\d{1,2}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i)
  if (onDateIdx >= 0) {
    name = name.slice(0, onDateIdx).trim()
  }

  // Collapse whitespace
  name = name.replace(/\s+/g, ' ').trim()
  if (!name) return null

  // Reject obvious non-names
  const lower = name.toLowerCase()
  const stop = new Set([
    'wedding',
    'ceremony',
    'marriage',
    'anniversary',
    'family',
    'sticker',
    'stiker',
    'congratulations',
    'congratulation',
    'alhamdulillah',
    'mashaallah',
    'mashallah',
    'barakallah'
  ])
  if (stop.has(lower)) return null

  // Keep reasonably short single-token names too (e.g., Fatiha)
  if (name.length < 2) return null
  return capitalize(name)
}

// Date patterns
const DATE_PATTERNS = [
  /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4})/i,
  /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/i,
  /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s+\d{4})/i,
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  /on\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December))/i,
]

// Courtesy patterns
const COURTESY_PATTERNS = [
  // Explicit courtesy/sign-off patterns only (avoid capturing greeting/title phrases)
  /\b(courtesy)\b\s*(?::|\-|is)?\s*([\w\s]+)$/i,
  /((?:with love|from|by)[\s:]*(?:the\s+)?[\w\s]+(?:family|families))$/i,
  /(we invite you[\s\w]+)/i,
  /^(the\s+[\w\s]+family)/i,
  /^(family\s+of\s+[\w\s]+)/i,
  /^(from\s+[\w\s]+)/i,
]

// Capitalize first letter of each word
function capitalize(str: string): string {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

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
  
  // --- Extract Title/Blessing ---
  // Explicit title/heading assignment: “title is …”, “heading: …”
  const explicitTitleMatch = msg.match(/\b(?:the\s+)?(?:title|heading)\s*(?:is|:)\s*([^\n]+)$/i)
  if (explicitTitleMatch && explicitTitleMatch[1]) {
    result.title = capitalize(explicitTitleMatch[1].trim())
    result.foundSomething = true
  } else {
  for (const pattern of TITLE_PATTERNS) {
    const match = msg.match(pattern)
    if (match) {
      // Use the full matched phrase for generic title patterns (e.g. “congratulation on your wedding”).
      result.title = capitalize(match[0].trim())
      result.foundSomething = true
      break
    }
  }
  }
  
  // --- Extract Names ---
  for (const pattern of NAME_PATTERNS) {
    const match = msg.match(pattern)
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
  
  // --- Extract Date ---
  for (const pattern of DATE_PATTERNS) {
    const match = msg.match(pattern)
    if (match) {
      result.date = match[1].trim()
      // Month+Year only (e.g. "January, 2026") needs an exact day.
      result.dateIsPartial = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s+\d{4}$/i.test(result.date)
      result.foundSomething = true
      break
    }
  }
  
  // --- Extract Courtesy Message ---
  for (const pattern of COURTESY_PATTERNS) {
    const match = msg.match(pattern)
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
  if (!result.name1 && !result.name2 && !/\b(title|heading)\b/i.test(lower)) {
    const trailingNameMatch = msg.match(/\bwedding\b\s+([A-Za-z']{2,})\s*$/i)
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
  const noNameInMsg = !NAME_PATTERNS.some(p => p.test(msg))
  const noDateInMsg = !DATE_PATTERNS.some(p => p.test(msg))
  
  if (!result.foundSomething && hasExistingName && hasExistingDate && noNameInMsg && noDateInMsg) {
    // Short text without names/dates is likely a courtesy message
    const looksLikeQuestion = /\?|\b(what|who|which|how|when|where|need|provide|information|info|details|do\s+i\s+need)\b/i.test(msg)
    if (msg.length >= 3 && msg.length < 100 && !looksLikeQuestion && !/^(yes|no|ok|hi|hello|hey|thanks)/i.test(msg)) {
      result.courtesy = msg
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
