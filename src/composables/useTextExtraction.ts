/**
 * Composable for extracting wedding information from text
 * Handles names, dates, courtesy, and size extraction
 * 
 * NOTE: Date extraction now uses shared utility from @/utils/extraction/datePatterns
 */

import { ref } from 'vue'
import { extractDateFromText as sharedExtractDate } from '@/utils/extraction/datePatterns'

export interface ExtractedNames {
  name1: string | null
  name2: string | null
}

export interface ExtractedInfo {
  names: ExtractedNames
  date: string | null
  courtesy: string | null
  size: string | null
}

export interface ParseResult extends ExtractedInfo {
  rawText: string
}

// Common words that should NOT be extracted as names
const COMMON_WORDS = [
  // Basic English words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 'him', 'let', 'put', 'say', 'she', 'too', 'use', 'from', 'with', 'this', 'that', 'have', 'will', 'your', 'make', 'like', 'just', 'over', 'such', 'into', 'year', 'also', 'back', 'been', 'come', 'could', 'what', 'when', 'more', 'some', 'than', 'them', 'then', 'these', 'would', 'about', 'after', 'could', 'first', 'other', 'their', 'there', 'which', 'would',
  // Short common words including 'on'
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
]

// Request phrases that should skip name extraction
const REQUEST_PHRASE_PATTERNS = [
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
  // Color/style requests
  /^i\s+want\s+(?:a\s+)?(?:\w+)\s+(?:color|colour|design|style|theme|background)/i,
  /^i\s+(?:want|need|like|prefer)\s+(?:a\s+)?(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\b/i,
  /\b(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\s+(?:color|colour|design|style|theme|background)/i
]

// Words to skip before "and"/"&" in name extraction
const SKIP_WORDS_BEFORE_AND = ['is', 'are', 'the', 'couple', 'name', 'names', 'my', 'our', 'their', 'for', 'of', 'to', 'from', 'with']

/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str: string): string {
  // Strip accidental numbers from names (typos like "Yahaya4")
  const cleanStr = str.replace(/\d+/g, '')
  return cleanStr
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Check if text is a request phrase (should skip extraction)
 */
function isRequestPhrase(text: string): boolean {
  return REQUEST_PHRASE_PATTERNS.some(pattern => pattern.test(text.trim()))
}

/**
 * Extract names from text
 */
export function extractNamesFromResponse(text: string): ExtractedNames {
  // Skip request phrases
  if (isRequestPhrase(text)) {
    console.log('[extractNames] Skipping - detected request phrase:', text)
    return { name1: null, name2: null }
  }

  // Priority 0: Check for names inside brackets/parentheses
  const bracketMatch = text.match(/\(([^)]+)\)/)
  if (bracketMatch && bracketMatch[1]) {
    const bracketContent = bracketMatch[1].trim()
    const bracketAndMatch = bracketContent.match(/(.+?)\s*(?:and|&)\s*(.+)/i)
    if (bracketAndMatch) {
      return { 
        name1: capitalizeWords(bracketAndMatch[1].trim()), 
        name2: capitalizeWords(bracketAndMatch[2].trim()) 
      }
    }
    return { name1: capitalizeWords(bracketContent), name2: null }
  }

  // Pre-process: Remove date portion to avoid "Hauwa on" being captured as "Hauwa On"
  // Match patterns like "on 6th January" or "on March 7" and remove them for name extraction
  let textForNames = text
    .replace(/\s+on\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/gi, ' ')
    // Also remove courtesy portion
    .replace(/courtesy\s*[:;]?\s*.+$/gi, ' ')
    .trim()
  
  console.log('[extractNames] Text after cleanup:', textForNames)

  // Pattern 1: Name and Name or Name & Name (must be capitalized or after ceremony/wedding words)
  // Updated to work even after "ceremony" keyword
  const andPattern = /\b([A-Z][a-zA-Z0-9'-]*(?:\s+[A-Z][a-zA-Z0-9'-]*)?)\s*(?:and|&|n)\s*([A-Z][a-zA-Z0-9'-]*(?:\s+[A-Z][a-zA-Z0-9'-]*)?)\b/
  const andMatch = textForNames.match(andPattern)

  if (andMatch) {
    const firstWord = andMatch[1].trim().toLowerCase()
    if (!SKIP_WORDS_BEFORE_AND.includes(firstWord)) {
      console.log('[extractNames] Found with & pattern:', andMatch[1], andMatch[2])
      return { 
        name1: capitalizeWords(andMatch[1].trim()), 
        name2: capitalizeWords(andMatch[2].trim()) 
      }
    }
  }
  
  // Pattern 1b: Case-insensitive name pattern after keywords like "ceremony"
  // Note: we[ea]ding handles common "weeding" typo
  const afterKeywordPattern = /(?:ceremony|we[ea]ding|nikkah|nikah|walimah|fatiha)\s+([a-zA-Z][a-zA-Z'-]*)\s*(?:and|&|n)\s*([a-zA-Z][a-zA-Z'-]*)/i
  const afterKeywordMatch = textForNames.match(afterKeywordPattern)
  if (afterKeywordMatch) {
    const name1 = afterKeywordMatch[1].trim()
    const name2 = afterKeywordMatch[2].trim()
    if (!COMMON_WORDS.includes(name1.toLowerCase()) && !COMMON_WORDS.includes(name2.toLowerCase())) {
      console.log('[extractNames] Found after ceremony keyword:', name1, name2)
      return { 
        name1: capitalizeWords(name1), 
        name2: capitalizeWords(name2) 
      }
    }
  }

  // Try again without case sensitivity
  const andPatternCI = /\b([a-zA-Z][a-zA-Z0-9'-]*)\s*(?:and|&)\s*([a-zA-Z][a-zA-Z0-9'-]*)\b/i
  const andMatchCI = textForNames.match(andPatternCI)

  if (andMatchCI) {
    const name1 = andMatchCI[1].trim()
    const name2 = andMatchCI[2].trim()
    // Check both words are not common words
    if (!COMMON_WORDS.includes(name1.toLowerCase()) && !COMMON_WORDS.includes(name2.toLowerCase())) {
      console.log('[extractNames] Found with case-insensitive & pattern:', name1, name2)
      return { 
        name1: capitalizeWords(name1), 
        name2: capitalizeWords(name2) 
      }
    }
  }

  // Pattern 2: Two consecutive name-like words
  const twoNamesMatch = textForNames.match(/\b([a-zA-Z][a-zA-Z'-]{1,})\s+([a-zA-Z][a-zA-Z'-]{1,})\b/i)
  if (twoNamesMatch) {
    const word1 = twoNamesMatch[1].toLowerCase()
    const word2 = twoNamesMatch[2].toLowerCase()
    if (!COMMON_WORDS.includes(word1) && !COMMON_WORDS.includes(word2)) {
      return { 
        name1: capitalizeWords(twoNamesMatch[1]), 
        name2: capitalizeWords(twoNamesMatch[2]) 
      }
    }
  }

  // Pattern 3: Single name
  const words = textForNames.split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z'-]/g, '')
    if (cleanWord.length >= 2 && !COMMON_WORDS.includes(cleanWord.toLowerCase())) {
      if (/^[a-zA-Z][a-zA-Z'-]+$/.test(cleanWord)) {
        return { name1: capitalizeWords(cleanWord), name2: null }
      }
    }
  }

  return { name1: null, name2: null }
}

/**
 * Extract date from text - uses shared utility
 */
export function extractDateFromText(text: string): string | null {
  return sharedExtractDate(text)
}

/**
 * Extract courtesy from text (STRICT mode)
 */
export function extractCourtesyFromText(text: string): string | null {
  console.log('[extractCourtesy] Input:', text)
  
  // Skip if this looks like a heading/title
  const isHeadingInput = /\b(heading|title|header|congratulations|happy|wedding|best wishes|wishing you)\b/i.test(text)
  if (isHeadingInput && !/\b(courtesy|cut-cee|from the .+ family|from .+ family)\b/i.test(text)) {
    console.log('[extractCourtesy] Skipping - looks like heading without courtesy keyword')
    return null
  }
  
  // Must contain courtesy keyword
  const hasCourtesyKeyword = /\b(courtesy|cut-cee)\b/i.test(text) || 
                            /\bfrom\s+(the\s+)?[a-zA-Z][a-zA-Z]*\s+(family|families)\b/i.test(text) ||
                            /\b(change|update|edit)\s+(the\s+)?courtesy/i.test(text)

  if (!hasCourtesyKeyword) {
    console.log('[extractCourtesy] No courtesy keyword found')
    return null
  }
  
  console.log('[extractCourtesy] Courtesy keyword detected')

  const courtesyPatterns = [
    /(?:change|update|edit)\s+(?:the\s+)?courtesy\s*[:\s]+(?:to\s+)?(.+?)(?:\s*$|\n|!)/i,
    // "courtesy: the main family" or "courtesy:the main family"
    /courtesy\s*[:;]\s*(.+?)(?:\s*$|\n|!)/i,
    /courtesy\s*(?:of|:)\s+(.+?)(?:\s*$|\n|!)/i,
    /courtesy\s+([a-zA-Z].+?)(?:\s*$|\n|!)/i,
    /cut-cee\s*[:\s]+(.+?)(?:\s*$|\n|!)/i,
    /from\s+the\s+([A-Za-z][A-Za-z\s&'.-]+\s+(?:family|families))(?:\s*$|\n|,|\.(?!\w)|!)/i,
    /from\s+([A-Za-z][A-Za-z\s&'.-]+\s+(?:family|families))(?:\s*$|\n|,|\.(?!\w)|!)/i,
    /(?:gift|sticker|card)\s+from\s+([A-Za-z][A-Za-z\s&'.-]+?)(?:\s*$|\n|,|\.(?!\w)|!)/i,
  ]

  const falsePositives = [
    'the', 'a', 'an', 'way', 'now', 'then', 'here', 'there',
    'me', 'you', 'us', 'them', 'him', 'her', 'it', 'this', 'that',
    'what', 'when', 'where', 'why', 'how', 'who', 'whom',
    'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank',
    'my', 'your', 'our', 'their', 'his', 'her', 'its'
  ]

  for (const pattern of courtesyPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      let name = match[1].trim().replace(/[.,!?:;]+$/, '').trim()
      
      if (name.length < 3) continue
      if (falsePositives.includes(name.toLowerCase())) continue
      
      // Remove bad prefixes
      name = name.replace(/^(the|a|an|my|your|our|their)\s+/i, '').trim()
      if (name.length < 3) continue

      return `courtesy: ${name}`
    }
  }
  return null
}

/**
 * Extract size from text
 */
export function extractSizeFromText(text: string): string | null {
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
  if (sizeMatch) {
    const width = parseFloat(sizeMatch[1])
    const height = parseFloat(sizeMatch[2])
    return `${width}x${height} in`
  }
  return null
}

/**
 * Parse all information from a single message
 */
export function parseAllInOneMessage(text: string): ParseResult {
  return {
    names: extractNamesFromResponse(text),
    date: extractDateFromText(text),
    courtesy: extractCourtesyFromText(text),
    size: extractSizeFromText(text),
    rawText: text
  }
}

/**
 * Composable for text extraction
 */
export function useTextExtraction() {
  const extractedInfo = ref<ExtractedInfo>({
    names: { name1: null, name2: null },
    date: null,
    courtesy: null,
    size: null
  })

  function extractFromText(text: string): ParseResult {
    const result = parseAllInOneMessage(text)
    
    // Update extracted info if new data found
    if (result.names.name1 && !extractedInfo.value.names.name1) {
      extractedInfo.value.names = result.names
    }
    if (result.date && !extractedInfo.value.date) {
      extractedInfo.value.date = result.date
    }
    if (result.courtesy && !extractedInfo.value.courtesy) {
      extractedInfo.value.courtesy = result.courtesy
    }
    if (result.size && !extractedInfo.value.size) {
      extractedInfo.value.size = result.size
    }

    return result
  }

  function resetExtraction() {
    extractedInfo.value = {
      names: { name1: null, name2: null },
      date: null,
      courtesy: null,
      size: null
    }
  }

  function hasAllRequiredInfo(): boolean {
    return !!(
      extractedInfo.value.names.name1 &&
      extractedInfo.value.date &&
      extractedInfo.value.courtesy
    )
  }

  function getMissingFields(): string[] {
    const missing: string[] = []
    if (!extractedInfo.value.names.name1) missing.push('names')
    if (!extractedInfo.value.date) missing.push('date')
    if (!extractedInfo.value.courtesy) missing.push('courtesy')
    return missing
  }

  return {
    extractedInfo,
    extractFromText,
    resetExtraction,
    hasAllRequiredInfo,
    getMissingFields,
    // Export individual functions for direct use
    extractNamesFromResponse,
    extractDateFromText,
    extractCourtesyFromText,
    extractSizeFromText,
    parseAllInOneMessage
  }
}
