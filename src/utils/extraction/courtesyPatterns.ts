/**
 * Courtesy Extraction Patterns - Single Source of Truth
 * 
 * This file contains all courtesy/from patterns used across the application.
 * DO NOT duplicate these patterns elsewhere.
 */

/**
 * Patterns for extracting courtesy messages from text
 */
export const COURTESY_PATTERNS: RegExp[] = [
  // Explicit courtesy patterns
  /\b(courtesy)\b\s*(?::|\-|of|is)?\s*([\w\s]+(?:family|families)?)/i,
  // "with love from" / "from the" patterns
  /((?:with love|from|by)[\s:]*(?:the\s+)?[\w\s]+(?:family|families))/i,
  // Invitation style
  /(we invite you[\s\w]+)/i,
  // "the X family" at start
  /^(the\s+[\w\s]+family)/i,
  // "family of X"
  /^(family\s+of\s+[\w\s]+)/i,
  // "from X"
  /^(from\s+[\w\s]+)/i,
  // "courtesy: X" or "c/o: X"
  /(?:courtesy|c\/o)\s*[:=]\s*(.+?)(?:\.|$)/i,
]

/**
 * Extract courtesy message from text
 * @param text - The text to search
 * @returns Object with text and prefix, or null
 */
export function extractCourtesy(text: string): { text: string; prefix: string } | null {
  if (!text || typeof text !== 'string') return null
  
  // Check for explicit "courtesy:" label first
  const courtesyMatch = text.match(/courtesy\s*[:=\-]?\s*(.+?)(?:\.|$)/i)
  if (courtesyMatch) {
    const courtesyText = courtesyMatch[1].trim()
    if (courtesyText && courtesyText.length > 2) {
      return { text: courtesyText, prefix: 'Courtesy:' }
    }
  }
  
  // Try other patterns
  for (const pattern of COURTESY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const captured = match[2] || match[1]
      if (captured) {
        const cleaned = captured.trim()
        if (cleaned.length > 2) {
          // Determine appropriate prefix
          const lowerMatch = (match[0] || '').toLowerCase()
          let prefix = 'Courtesy:'
          if (lowerMatch.includes('with love')) {
            prefix = 'With Love,'
          } else if (lowerMatch.includes('from')) {
            prefix = 'From:'
          }
          return { text: cleaned, prefix }
        }
      }
    }
  }
  
  return null
}

/**
 * Check if text contains a courtesy message
 */
export function hasCourtesy(text: string): boolean {
  return extractCourtesy(text) !== null
}

/**
 * Check if message is ONLY a courtesy (for courtesy-only detection)
 */
export function isCourtesyOnly(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  
  const trimmed = text.trim().toLowerCase()
  
  // Check if it starts with courtesy-related words
  if (/^(courtesy|from|by|with love|c\/o)\s*[:=\-]?\s*/i.test(trimmed)) {
    return true
  }
  
  // Check if it ends with "family" or "families"
  if (/\b(family|families)\s*$/i.test(trimmed)) {
    // Make sure it's not too long (probably just a courtesy)
    if (trimmed.split(/\s+/).length <= 6) {
      return true
    }
  }
  
  return false
}
