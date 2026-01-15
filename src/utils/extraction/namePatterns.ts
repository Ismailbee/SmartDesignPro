/**
 * Name Extraction Patterns - Single Source of Truth
 * 
 * This file contains all name patterns used across the application.
 * DO NOT duplicate these patterns elsewhere.
 */

import nlp from 'compromise'

export type NameExtractionSource = 'bracket' | 'pattern' | 'nlp' | 'none'

export interface ExtractedNamesWithMeta {
  name1: string | null
  name2: string | null
  source: NameExtractionSource
}

/**
 * Pattern to extract names from brackets: (Name1 & Name2) or [Name1 and Name2]
 */
export const BRACKET_PATTERN = /[\[(]([^\])\)]+)[\])]/

/**
 * Patterns for extracting couple names from text
 */
export const NAME_PATTERNS: RegExp[] = [
  // Bracketed couples: (A & B) or [A and B]
  BRACKET_PATTERN,
  // Explicit label: "names: A & B", "couple's names are A and B"
  /\b(?:names?|couple(?:'s)?\s+names?)\s*(?:are|is|:)\s*([^\n]+)$/i,
  // Bride/Groom labels
  /\bbride\s*[:\-]\s*([^,\n]+)\s*(?:,|\s)\s*groom\s*[:\-]\s*([^\n]+)$/i,
  /\bgroom\s*[:\-]\s*([^,\n]+)\s*(?:,|\s)\s*bride\s*[:\-]\s*([^\n]+)$/i,
  // Fallback: STRICT couple-only support (single word per side).
  /\b([A-Za-z][A-Za-z'-]+)\s*(?:&|and|with)\s*([A-Za-z][A-Za-z'-]+)\b/i,
  // "wedding of A & B" (still strict: single word per side).
  /(?:ceremony|wedding|marriage)\s+(?:of\s+)?([A-Za-z][A-Za-z'-]+)\s*(?:&|and|with)\s*([A-Za-z][A-Za-z'-]+)\b/i,
]

// For now we ONLY support simple A & B (single token each side).
const STRICT_COUPLE_ONLY = true

function isSingleTokenName(value: string | null | undefined): boolean {
  const trimmed = (value || '').trim()
  if (!trimmed) return false
  return !/\s/.test(trimmed)
}

function hasPossibleCoupleSeparator(text: string): boolean {
  if (!text) return false
  // Guard for cases like "with love" by requiring letters on both sides.
  return /[A-Za-z].*(?:&|\band\b|\bwith\b).*[A-Za-z]/i.test(text)
}

/**
 * Stop words that should not be considered as names
 */
export const NAME_STOP_WORDS = new Set([
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
  'barakallah',
  'the',
  'and',
  'with',
  'from',
  'courtesy',
  'on',
  'of',
])

/**
 * Extended list of common words that should NOT be extracted as names
 */
export const COMMON_WORDS = new Set([
  // Basic English words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 'him', 'let', 'put', 'say', 'she', 'too', 'use', 'from', 'with', 'this', 'that', 'have', 'will', 'your', 'make', 'like', 'just', 'over', 'such', 'into', 'year', 'also', 'back', 'been', 'come', 'could', 'what', 'when', 'more', 'some', 'than', 'them', 'then', 'these', 'would', 'about', 'after', 'first', 'other', 'their', 'there', 'which',
  // Short common words
  'to', 'a', 'i', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'if', 'in', 'me', 'of', 'on', 'or', 'so', 'up', 'us', 'we',
  // Wedding/sticker context words
  'wedding', 'sticker', 'stiker', 'design', 'designs', 'please', 'courtesy', 'family', 'picture', 'image', 'photo', 'template', 'templates',
  // Colors
  'purple', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'black', 'white', 'gold', 'silver', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'violet', 'indigo', 'teal', 'maroon', 'navy', 'beige', 'cream', 'coral', 'lavender', 'turquoise', 'burgundy', 'rose', 'peach', 'mint', 'olive', 'tan', 'ivory', 'aqua', 'lime', 'crimson', 'scarlet', 'amber', 'bronze', 'copper', 'ruby', 'emerald', 'sapphire', 'pearl', 'platinum', 'champagne', 'wine', 'plum', 'mauve', 'lilac', 'fuchsia', 'chartreuse', 'salmon', 'rust',
  // Design/style words
  'color', 'colour', 'style', 'theme', 'background', 'font', 'size', 'shape', 'border', 'frame', 'layout', 'format', 'look', 'fancy', 'elegant', 'simple', 'modern', 'classic', 'traditional', 'beautiful', 'nice', 'pretty', 'cool', 'awesome', 'great', 'best', 'perfect', 'amazing',
  // Greeting/conversation words
  'hi', 'hello', 'hey', 'my', 'is', 'information', 'info', 'details', 'here', 'name', 'names', 'date', 'it', 'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank', 'good', 'morning', 'afternoon', 'evening', 'night',
  // Request verbs
  'want', 'need', 'create', 'looking', 'help', 'assist', 'give', 'show', 'wanted', 'wanting', 'needs', 'needed', 'needing', 'love', 'doing', 'making', 'getting', 'having', 'using', 'going', 'coming', 'thinking', 'try', 'trying', 'start', 'starting', 'work', 'working',
  // Change/update verbs
  'change', 'changed', 'changing', 'update', 'updated', 'updating', 'edit', 'edited', 'editing', 'modify', 'modified', 'modifying', 'replace', 'replaced', 'replacing', 'set', 'setting', 'alter', 'altered', 'altering', 'correct', 'corrected', 'correcting', 'fix', 'fixed', 'fixing', 'switch', 'switched', 'switching', 'different', 'another'
])

/**
 * Request phrase patterns that should skip name extraction
 */
export const REQUEST_PHRASE_PATTERNS: RegExp[] = [
  /^i\s+want\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
  /^i\s+need\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
  /^i\s+would\s+like\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
  /^i\s+(?:want|need|would\s+like)\s+(?:to\s+)?(?:create|make|design|get)/i,
  /^(?:create|make|design|get)\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
  /^(?:can|could)\s+(?:you|i)\s+(?:help|make|create|design|get)/i,
  /^please\s+(?:help|make|create|design|get)/i,
  /^help\s+(?:me\s+)?(?:make|create|design|get)/i,
  /^i\s+want\s+(?:a\s+)?(?:stiker|sticker)\s+design/i,
  /(?:sticker|stiker)\s+design/i,
  /^i\s+want\s+(?:a\s+)?(?:\w+)\s+(?:color|colour|design|style|theme|background)/i,
  /^i\s+(?:want|need|like|prefer)\s+(?:a\s+)?(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\b/i,
  /\b(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\s+(?:color|colour|design|style|theme|background)/i
]

/**
 * Words to skip before "and"/"&" in name extraction
 */
export const SKIP_WORDS_BEFORE_AND = new Set([
  'is', 'are', 'the', 'couple', 'name', 'names', 'my', 'our', 'their', 'for', 'of', 'to', 'from', 'with'
])

/**
 * Check if text is a request phrase (should skip name extraction)
 */
export function isRequestPhrase(text: string): boolean {
  return REQUEST_PHRASE_PATTERNS.some(pattern => pattern.test(text.trim()))
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  if (!str) return ''
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Normalize a name candidate by cleaning up punctuation and invalid parts
 */
export function normalizeNameCandidate(value: string): string | null {
  let name = (value || '').trim()
  if (!name) return null

  // Strip surrounding punctuation/quotes
  name = name.replace(/^[\s"'""''.,:;\-]+/, '').replace(/[\s"'""''.,:;\-]+$/, '').trim()

  // Remove common leading labels/verbs
  name = name
    .replace(/^(?:names?|couple(?:'s)?\s+names?|bride|groom)\s*[:\-]\s*/i, '')
    .replace(/^(?:is|are|was|were)\s+/i, '')
    .replace(/^(?:the\s+)?(?:wedding|ceremony|marriage)\s+/i, '')
    // Remove title/slogan words that commonly leak into names
    // Example: "Happy Marriage Life together Sakina and Abdullahi" -> name1 becomes "Together Sakina"
    .replace(/^(?:together|forever)\s+/i, '')
    .trim()

  // If we accidentally captured a dangling "on", remove it
  name = name.replace(/\s+on\s*$/i, '').trim()

  // If a date phrase was included, trim it off
  const onDateIdx = name.search(/\s+on\s+(?:\d{1,2}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i)
  if (onDateIdx >= 0) {
    name = name.slice(0, onDateIdx).trim()
  }

  // Collapse whitespace
  name = name.replace(/\s+/g, ' ').trim()
  if (!name) return null

  // Reject obvious non-names
  const lower = name.toLowerCase()
  if (NAME_STOP_WORDS.has(lower)) return null

  // Keep reasonably short single-token names too (e.g., Fatiha)
  if (name.length < 2) return null
  
  return capitalizeWords(name)
}

function extractNamesWithCompromise(text: string): { name1: string | null; name2: string | null } {
  try {
    const doc = nlp(text)
    const people = (doc as any).people?.().out?.('array') as unknown
    const candidates = Array.isArray(people) ? (people as string[]) : []

    const cleaned = candidates
      .map(c => normalizeNameCandidate(c))
      .filter((c): c is string => !!c)
      // extra safety: slogans/phrases that sometimes get tagged as people
      .filter(c => {
        const lower = c.toLowerCase()
        return !['together', 'forever'].includes(lower)
      })

    const unique: string[] = []
    for (const c of cleaned) {
      if (!unique.includes(c)) unique.push(c)
      if (unique.length >= 2) break
    }

    return {
      name1: unique[0] ?? null,
      name2: unique[1] ?? null,
    }
  } catch {
    return { name1: null, name2: null }
  }
}

function looksSuspiciousName(name: string): boolean {
  const trimmed = (name || '').trim()
  if (!trimmed) return true
  if (/\d/.test(trimmed)) return true
  if (/[^a-zA-Z\s'\-]/.test(trimmed)) return true

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length > 4) return true

  for (const part of parts) {
    const lower = part.toLowerCase()
    if (lower.length <= 1) return true
    if (NAME_STOP_WORDS.has(lower)) return true
    if (COMMON_WORDS.has(lower)) return true
    if (['together', 'forever', 'life'].includes(lower)) return true
  }

  return false
}

export function shouldConfirmExtractedNames(meta: ExtractedNamesWithMeta): boolean {
  if (meta.source === 'nlp') return !!(meta.name1 || meta.name2)
  if (meta.name1 && looksSuspiciousName(meta.name1)) return true
  if (meta.name2 && looksSuspiciousName(meta.name2)) return true
  return false
}

/**
 * Extract names from bracketed text like (John & Sarah)
 */
export function extractNamesFromBrackets(text: string): { name1: string | null; name2: string | null } {
  if (!text || typeof text !== 'string') {
    return { name1: null, name2: null }
  }
  
  const bracketMatch = text.match(BRACKET_PATTERN)
  if (!bracketMatch) {
    return { name1: null, name2: null }
  }
  
  const inner = bracketMatch[1].trim()
  
  // Split by & or "and"
  const separatorMatch = inner.match(/(.+?)\s*(?:&|and)\s*(.+)/i)
  if (separatorMatch) {
    const leftRaw = separatorMatch[1]
    const rightRaw = separatorMatch[2]
    if (STRICT_COUPLE_ONLY && (!isSingleTokenName(leftRaw) || !isSingleTokenName(rightRaw))) {
      return { name1: null, name2: null }
    }

    const name1 = normalizeNameCandidate(leftRaw)
    const name2 = normalizeNameCandidate(rightRaw)
    return { name1, name2 }
  }
  
  // Single name in brackets
  const singleName = normalizeNameCandidate(inner)
  return { name1: singleName, name2: null }
}

/**
 * Extract couple names from any text format
 */
export function extractNames(text: string): { name1: string | null; name2: string | null } {
  const { name1, name2 } = extractNamesWithMeta(text)
  return { name1, name2 }
}

export function extractNamesWithMeta(text: string): ExtractedNamesWithMeta {
  if (!text || typeof text !== 'string') {
    return { name1: null, name2: null, source: 'none' }
  }

  // Try bracketed names first (most reliable)
  const bracketResult = extractNamesFromBrackets(text)
  if (bracketResult.name1 || bracketResult.name2) {
    return { ...bracketResult, source: 'bracket' }
  }

  // Try other patterns
  for (const pattern of NAME_PATTERNS) {
    if (pattern === BRACKET_PATTERN) continue // Already tried

    const match = text.match(pattern)
    if (!match) continue

    if (match[2]) {
      if (STRICT_COUPLE_ONLY && (!isSingleTokenName(match[1]) || !isSingleTokenName(match[2]))) {
        continue
      }

      const name1 = normalizeNameCandidate(match[1])
      const name2 = normalizeNameCandidate(match[2])
      if (name1 || name2) {
        return { name1, name2, source: 'pattern' }
      }
      continue
    }

    if (match[1]) {
      const inner = match[1].trim()
      const separatorMatch = inner.match(/(.+?)\s*(?:&|and)\s*(.+)/i)
      if (separatorMatch) {
        if (STRICT_COUPLE_ONLY && (!isSingleTokenName(separatorMatch[1]) || !isSingleTokenName(separatorMatch[2]))) {
          continue
        }

        const name1 = normalizeNameCandidate(separatorMatch[1])
        const name2 = normalizeNameCandidate(separatorMatch[2])
        if (name1 || name2) {
          return { name1, name2, source: 'pattern' }
        }
      }

      const name1 = normalizeNameCandidate(inner)
      if (name1) {
        return { name1, name2: null, source: 'pattern' }
      }
    }
  }

  // Last resort: NLP-ish fallback (offline). Useful for OCR/pasted text.
  // IMPORTANT: When the user typed a couple separator (and/&/with) but it wasn't a valid "A & B",
  // do NOT fall back to NLP, because it tends to extract the last name only (e.g., "... and Yahaya" -> "Yahaya").
  if (!STRICT_COUPLE_ONLY || !hasPossibleCoupleSeparator(text)) {
    const nlpResult = extractNamesWithCompromise(text)
    if (nlpResult.name1 || nlpResult.name2) {
      return { ...nlpResult, source: 'nlp' }
    }
  }

  return { name1: null, name2: null, source: 'none' }
}

/**
 * Check if text contains names
 */
export function hasNames(text: string): boolean {
  const { name1, name2 } = extractNames(text)
  return !!(name1 || name2)
}
