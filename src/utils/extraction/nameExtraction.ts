/**
 * Name Extraction - Single Source of Truth
 * 
 * This file contains all name extraction logic for the application.
 * 
 * Strategy:
 * 1. OFFLINE/FREE: Bracket-based extraction - "(Name1 & Name2)" - 100% reliable
 * 2. FALLBACK: DeepSeek AI - Only called when offline can't parse names
 * 
 * DO NOT duplicate these patterns elsewhere.
 */

import { capitalizeWords } from './index'

/**
 * Result from name extraction
 */
export interface NameExtractionResult {
  name1: string | null
  name2: string | null
  name1First: string | null
  name1Last: string | null
  name2First: string | null
  name2Last: string | null
  source: 'bracket' | 'ai' | 'none'
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Name separators recognized in bracket notation
 */
const NAME_SEPARATORS = [
  '&',
  ' and ',
  ' AND ',
  ' with ',
  ' WITH ',
  ' n ',  // Common abbreviation for "and"
  ' + ',
]

/**
 * Split a full name into first name and remaining parts
 * 
 * Rules:
 * - First name: The very first word only
 * - Remaining: ALL other parts (surname, middle names, nicknames, bracketed text)
 * - Never split remaining parts across multiple lines
 * 
 * Examples:
 * - "Muhammad" -> { first: "Muhammad", remaining: null }
 * - "Muhammad Ali" -> { first: "Muhammad", remaining: "Ali" }
 * - "Muhammad Ali Hassan" -> { first: "Muhammad", remaining: "Ali Hassan" }
 * - "Aisha (Iya)" -> { first: "Aisha", remaining: "(Iya)" }
 * - "Muhammad Ali (Cassius)" -> { first: "Muhammad", remaining: "Ali (Cassius)" }
 */
function splitName(fullName: string): { first: string; last: string | null } {
  const trimmed = fullName.trim()
  
  // Find the first space - everything before is first name, everything after is remaining
  const firstSpaceIndex = trimmed.indexOf(' ')
  
  if (firstSpaceIndex === -1) {
    // Single word - just the first name
    return { first: trimmed, last: null }
  }
  
  // First name is the first word only
  const first = trimmed.substring(0, firstSpaceIndex)
  // Remaining is EVERYTHING after the first word (preserved as a single unit)
  const last = trimmed.substring(firstSpaceIndex + 1).trim()
  
  return {
    first,
    last: last || null
  }
}

/**
 * Extract names from bracket notation: "(Name1 & Name2)"
 * This is the primary extraction method - FREE and 100% reliable
 * 
 * Supported formats:
 * - "(Aisha & Suleiman)"
 * - "(Aisha Ahmed & Suleiman Musa)"
 * - "(Aisha and Suleiman)"
 * - "[Aisha & Suleiman]"
 * 
 * @param text - The text to search for bracketed names
 * @returns NameExtractionResult or null if no brackets found
 */
export function extractNamesFromBrackets(text: string): NameExtractionResult | null {
  if (!text || typeof text !== 'string') return null
  
  // Match content inside parentheses or square brackets
  const bracketMatch = text.match(/[\(\[]([^\)\]]+)[\)\]]/)
  if (!bracketMatch) return null
  
  const content = bracketMatch[1].trim()
  if (!content) return null
  
  // Try each separator
  for (const sep of NAME_SEPARATORS) {
    const sepIndex = content.toLowerCase().indexOf(sep.toLowerCase())
    if (sepIndex === -1) continue
    
    const beforeSep = content.substring(0, sepIndex).trim()
    const afterSep = content.substring(sepIndex + sep.length).trim()
    
    // Validate both parts have content
    if (!beforeSep || !afterSep) continue
    
    // Clean and capitalize names
    const name1 = capitalizeWords(beforeSep)
    const name2 = capitalizeWords(afterSep)
    
    // Split into first/last
    const name1Parts = splitName(name1)
    const name2Parts = splitName(name2)
    
    return {
      name1,
      name2,
      name1First: name1Parts.first,
      name1Last: name1Parts.last,
      name2First: name2Parts.first,
      name2Last: name2Parts.last,
      source: 'bracket',
      confidence: 'high'
    }
  }
  
  // No separator found - try to intelligently split 4 words into 2 names
  // Common pattern: "(FirstName1 LastName1 FirstName2 LastName2)"
  // e.g., "(Suleiman Yahaya Salamatu Yunusa)" -> "Suleiman Yahaya" & "Salamatu Yunusa"
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  if (words.length === 4) {
    // Exactly 4 words - split into two 2-word names
    const name1 = capitalizeWords(`${words[0]} ${words[1]}`)
    const name2 = capitalizeWords(`${words[2]} ${words[3]}`)
    
    return {
      name1,
      name2,
      name1First: capitalizeWords(words[0]),
      name1Last: capitalizeWords(words[1]),
      name2First: capitalizeWords(words[2]),
      name2Last: capitalizeWords(words[3]),
      source: 'bracket',
      confidence: 'medium' // Lower confidence since we guessed the split
    }
  }
  
  if (words.length === 2) {
    // Exactly 2 words - could be single-word names for two people
    const name1 = capitalizeWords(words[0])
    const name2 = capitalizeWords(words[1])
    
    return {
      name1,
      name2,
      name1First: name1,
      name1Last: null,
      name2First: name2,
      name2Last: null,
      source: 'bracket',
      confidence: 'medium'
    }
  }
  
  // No separator found and can't intelligently split
  return null
}

/**
 * Check if text contains bracketed names
 */
export function hasBracketedNames(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  const bracketMatch = text.match(/[\(\[]([^\)\]]+)[\)\]]/)
  if (!bracketMatch) return false
  
  const content = bracketMatch[1].trim()
  
  // Has separator
  if (NAME_SEPARATORS.some(sep => content.toLowerCase().includes(sep.toLowerCase()))) {
    return true
  }
  
  // Has 2 or 4 words (can be intelligently split)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  return words.length === 2 || words.length === 4
}

/**
 * Format names for bracket notation (for display/editing)
 */
export function formatNamesAsBrackets(name1: string, name2: string): string {
  if (!name1 && !name2) return ''
  if (!name2) return `(${name1})`
  return `(${name1} & ${name2})`
}

/**
 * Empty result helper
 */
export function emptyNameResult(): NameExtractionResult {
  return {
    name1: null,
    name2: null,
    name1First: null,
    name1Last: null,
    name2First: null,
    name2Last: null,
    source: 'none',
    confidence: 'low'
  }
}

/**
 * Build prompt for DeepSeek name extraction
 * Only used when bracket extraction fails
 */
export function buildNameExtractionPrompt(text: string): string {
  return `Extract the two people's names from this wedding text. Return ONLY valid JSON.

Text: "${text}"

Rules:
1. Look for names of the couple (bride and groom)
2. Names are usually proper nouns (capitalized)
3. Common patterns: "Name1 and Name2", "of Name1 and Name2", "for Name1 and Name2"
4. If you can't find two clear names, return null for both

Return JSON:
{
  "name1": "First person's full name or null",
  "name2": "Second person's full name or null"
}`
}

/**
 * Parse DeepSeek response for names
 */
export function parseDeepSeekNameResponse(response: string): NameExtractionResult {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(response)
    
    if (parsed.name1 || parsed.name2) {
      const name1 = parsed.name1 ? capitalizeWords(String(parsed.name1)) : null
      const name2 = parsed.name2 ? capitalizeWords(String(parsed.name2)) : null
      
      const name1Parts = name1 ? splitName(name1) : { first: null, last: null }
      const name2Parts = name2 ? splitName(name2) : { first: null, last: null }
      
      return {
        name1,
        name2,
        name1First: name1Parts.first,
        name1Last: name1Parts.last,
        name2First: name2Parts.first,
        name2Last: name2Parts.last,
        source: 'ai',
        confidence: 'medium'
      }
    }
  } catch {
    // Try to extract JSON from response text
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.name1 || parsed.name2) {
          return parseDeepSeekNameResponse(jsonMatch[0])
        }
      } catch {
        // Could not parse
      }
    }
  }
  
  return emptyNameResult()
}

/**
 * Main extraction function - tries bracket first, returns info for AI fallback
 * 
 * Usage:
 * 1. Call extractNames(text)
 * 2. If source is 'bracket' - names are reliable, use them
 * 3. If source is 'none' and you need names - call DeepSeek with buildNameExtractionPrompt()
 */
export function extractNames(text: string): NameExtractionResult {
  // First, try bracket extraction (FREE, reliable)
  const bracketResult = extractNamesFromBrackets(text)
  if (bracketResult) {
    return bracketResult
  }
  
  // No brackets found - return empty result
  // Caller should decide whether to call DeepSeek based on context
  return emptyNameResult()
}
