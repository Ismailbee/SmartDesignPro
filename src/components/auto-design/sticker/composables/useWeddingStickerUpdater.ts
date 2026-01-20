/**
 * Wedding Sticker Template Real-time Text Updater
 *
 * This composable provides functionality to update SVG text elements
 * in real-time based on user input description.
 *
 * Note: For SVG graphic replacement (e.g., Nikkah graphics), see useSVGTextReplacement.ts
 * which handles replacing text elements with SVG images based on keywords.
 */

import { extractNamesFromBrackets as sharedExtractNamesFromBrackets } from '@/utils/extraction'
import { useDateLibrary } from './useDateLibrary'

export interface WeddingStickerElements {
  blessingText: SVGTextElement | null
  occasionText: SVGTextElement | null
  eventTypeText: SVGTextElement | null
  ceremonyText: SVGTextElement | null
  name1Text: SVGTextElement | null
  name2Text: SVGTextElement | null
  // Enhanced name elements for first/last name separation
  name1First: SVGTextElement | null
  name1Last: SVGTextElement | null
  name2First: SVGTextElement | null
  name2Last: SVGTextElement | null
  nameSeparator: SVGTextElement | null  // The "&" separator between names
  weddingNamesGroup: SVGGElement | null  // The container group for wedding names
  weddingDateGroup: SVGGElement | null   // The container group for date SVG
  dateText: SVGTextElement | null
  courtesyText: SVGTextElement | null
}

export interface WeddingStickerData {
  blessing: string
  occasion: string
  eventType: string
  ceremony: string
  name1: string
  name2: string
  date: string
  courtesy: string
}

export function useWeddingStickerUpdater() {
  // Cache for the decorative SVG content to prevent redundant fetches
  let cachedNameSVG: string | null = null

  /**
   * Extract the first word from description to use as blessing text
   * The first word should replace the default blessing text
   */
  const extractFirstWord = (description: string): string | null => {
    if (!description || description.trim() === '') {
      return null
    }

    // Get the first word (before any space)
    const firstWord = description.trim().split(/\s+/)[0]

    if (!firstWord) {
      return null
    }

    // Capitalize properly: first letter uppercase, rest as typed
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1)
  }

  /**
   * Calculate appropriate font family for event type text based on text length
   * If the event type word length is 9 or more characters, change to alternative font
   * Short words (1-8 chars): Keep original font
   * Long words (9+ chars): Change to AlternateGothic2 BT font
   */
  const calculateEventTypeFontFamily = (text: string): string => {
    const length = text.length

    if (length >= 9) {
      return 'AlternateGothic2 BT'  // Alternative font for long event type words
    } else {
      return ''  // Keep original font for short words (empty string means no change)
    }
  }

  /**
   * Helper function to convert text to Title Case (first letter uppercase, rest lowercase)
   */
  const toTitleCase = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  /**
   * Calculate dynamic font size based on name length
   * Font family is determined separately based on whether ANY name has 9+ letters
   *
   * Minimal Step-Down Approach:
   * - Names with 8 or fewer letters: Keep original size
   * - Names with 9+ letters: Reduce by 1px per additional letter beyond 8
   * - Formula: fontSize = baseFontSize - (letterCount - 8)
   *
   * Examples (base 68.31px):
   * - 8 letters → 68.31px (no reduction)
   * - 9 letters → 67.31px (reduced by 1px)
   * - 11 letters → 65.31px (reduced by 3px)
   *
   * @param text - The name text to measure
   * @param baseFontSize - Original font size from SVG (68.31px for first names, 30px for last names)
   * @returns Calculated font size in pixels
   */
  const calculateFontSize = (text: string, baseFontSize: number): number => {
    // Count only alphabetic characters (ignore spaces, punctuation, numbers)
    const letterCount = text.replace(/[^a-zA-Z]/g, '').length

    if (letterCount <= 8) {
      // Short names (1-8 letters): keep original size
      return baseFontSize
    } else {
      // Long names (9+ letters): reduce by 1px per additional letter beyond 8
      // Formula: newSize = baseSize - (letterCount - 8)
      const reduction = letterCount - 8
      return baseFontSize - reduction
    }
  }

  /**
   * Check if any name in the collection has 12 or more letters
   * This determines whether to use Montserrat or AlternateGothic2 BT for ALL names
   *
   * @param names - Array of name strings to check
   * @returns true if any name has 12+ letters, false otherwise
   */
  const hasLongName = (names: (string | null)[]): boolean => {
    return names.some(name => {
      if (!name) return false
      const letterCount = name.replace(/[^a-zA-Z]/g, '').length
      return letterCount >= 12
    })
  }

  /**
   * Calculate optimal x-coordinates for name positioning based on surname length
   *
   * SURNAME LENGTH CLASSIFICATION:
   * - LONG: 12+ alphabetic characters
   * - MEDIUM: 8-11 alphabetic characters
   * - SHORT: 1-7 alphabetic characters
   *
   * POSITIONING STRATEGY:
   * - SHORT surnames: Use default positions (no adjustment)
   * - LONG first surname: Shift name1 group LEFT, optionally shift name2 RIGHT for balance
   * - LONG second surname: Shift name2 group RIGHT, optionally shift name1 LEFT for balance
   * - BOTH LONG: Increase spacing between both groups
   *
   * @param name1First - First person's first name
   * @param name1Last - First person's surname
   * @param name2First - Second person's first name
   * @param name2Last - Second person's surname
   * @returns Object with x-coordinates for all name elements
   */
  const calculateNamePositioning = (
    name1First: string | null,
    name1Last: string | null,
    name2First: string | null,
    name2Last: string | null
  ): {
    name1First: number
    name1Last: number
    name2First: number
    name2Last: number
    separator: number
  } => {
    // Default x-coordinates (for SHORT surnames)
    const basePositions = {
      name1First: -15,
      name1Last: 60,
      name2First: 50,
      name2Last: 75,
      separator: -30
    }

    // Calculate surname lengths (alphabetic characters only)
    const name1LastLength = name1Last ? name1Last.replace(/[^a-zA-Z]/g, '').length : 0
    const name2LastLength = name2Last ? name2Last.replace(/[^a-zA-Z]/g, '').length : 0

    // Determine if surnames are LONG (12+ characters)
    const isName1LastLong = name1LastLength >= 12
    const isName2LastLong = name2LastLength >= 12

    // Start with base positions
    const positions = { ...basePositions }

    // Adjust positions based on surname lengths
    if (isName1LastLong && !isName2LastLong) {
      // First person has long surname, shift left and balance
      positions.name1First = -25
      positions.name1Last = 50
      positions.name2First = 55
      positions.name2Last = 80
      console.log('📐 Positioning: First person has LONG surname → Shift name1 LEFT, name2 RIGHT for balance')
    } else if (!isName1LastLong && isName2LastLong) {
      // Second person has long surname, shift right and balance
      positions.name1First = -20
      positions.name1Last = 55
      positions.name2First = 60
      positions.name2Last = 85
      console.log('📐 Positioning: Second person has LONG surname → Shift name2 RIGHT, name1 LEFT for balance')
    } else if (isName1LastLong && isName2LastLong) {
      // Both have long surnames, increase spacing significantly
      positions.name1First = -30
      positions.name1Last = 45
      positions.name2First = 65
      positions.name2Last = 90
      positions.separator = -25
      console.log('📐 Positioning: BOTH have LONG surnames → Increase spacing between groups')
    } else {
      console.log('📐 Positioning: Using default positions (SHORT surnames)')
    }

    console.log(`   name1Last: ${name1LastLength} chars (${isName1LastLong ? 'LONG' : 'SHORT'}), name2Last: ${name2LastLength} chars (${isName2LastLong ? 'LONG' : 'SHORT'})`)
    console.log(`   Positions: name1First=${positions.name1First}, name1Last=${positions.name1Last}, name2First=${positions.name2First}, name2Last=${positions.name2Last}, separator=${positions.separator}`)

    return positions
  }

  /**
   * Check if description contains congratulations variations (flexible matching)
   * Handles: congratulation, congratulations, congrats, and common misspellings
   * NOTE: This is now deprecated in favor of extractFirstWord()
   */
  const hasCongratulations = (description: string): boolean => {
    if (!description || typeof description !== 'string') return false
    const lowerDesc = description.toLowerCase()
    // Match variations and common misspellings
    return /congr[ae]t[us]?l?[aeiou]*t?[io]*[on]*s?/i.test(lowerDesc) ||
           lowerDesc.includes('congrats')
  }

  /**
   * Extract event type from "on your [EVENT TYPE]" pattern
   * Examples: "on your wedding ceremony", "on your Quran Walimat", "on your graduation"
   *
   * Special handling for "wedding":
   * - If the word after "wedding" is a recognized ceremony type (ceremony, nikkah, service, walimah),
   *   show both event type and ceremony
   * - If the word after "wedding" is NOT a recognized ceremony type (e.g., a name),
   *   hide ceremony and treat the word as part of names
   */
  const extractEventType = (description: string): { eventType: string; ceremony: string; hideCeremony: boolean } | null => {
    const eventPattern = /on\s+your\s+([^.,\n()[\]]+)/i
    const match = description.match(eventPattern)

    if (match && match[1] && match[1].trim().length > 0) {
      const fullEvent = match[1].trim().toUpperCase()

      // Split into event type and ceremony if it contains multiple words
      const words = fullEvent.split(/\s+/)

      if (words.length >= 2) {
        const firstWord = words[0]
        const secondWord = words[1]

        // Check if first word is "WEDDING"
        if (firstWord === 'WEDDING') {
          // Recognized ceremony types for wedding
          const recognizedCeremonies = ['CEREMONY', 'NIKKAH', 'SERVICE', 'WALIMAH']

          if (recognizedCeremonies.includes(secondWord)) {
            // Valid ceremony type - show both event type and ceremony
            return {
              eventType: firstWord,
              ceremony: secondWord,
              hideCeremony: false
            }
          } else {
            // Not a recognized ceremony type - hide ceremony, treat second word as name
            return {
              eventType: firstWord,
              ceremony: '',
              hideCeremony: true
            }
          }
        } else {
          // Not a wedding event - use normal logic
          // Last word is ceremony, rest is event type
          const ceremony = words[words.length - 1]
          const eventType = words.slice(0, -1).join(' ')
          return { eventType, ceremony, hideCeremony: false }
        }
      } else {
        // Single word event
        return { eventType: fullEvent, ceremony: '', hideCeremony: false }
      }
    }

    return null
  }

  /**
   * Extract names from newline-separated content
   * Returns null - use bracket extraction or DeepSeek instead
   */
  const extractNamesFromNewline = (description: string): { name1: string | null; name2: string | null } => {
    // Newline extraction is unreliable - use bracket notation instead
    return { name1: null, name2: null }
  }

  /**
   * Extract names from bracket notation: "(Name1 & Name2)"
   * Uses shared extraction utility from src/utils/extraction/nameExtraction.ts
   */
  const extractNamesFromBrackets = (description: string): {
    name1: string | null;
    name2: string | null;
    name1First: string | null;
    name1Last: string | null;
    name2First: string | null;
    name2Last: string | null;
    hasSeparator: boolean;
  } => {
    // Use shared extraction utility
    const result = sharedExtractNamesFromBrackets(description)
    
    if (result && result.name1) {
      return {
        name1: result.name1,
        name2: result.name2,
        name1First: result.name1First,
        name1Last: result.name1Last,
        name2First: result.name2First,
        name2Last: result.name2Last,
        hasSeparator: !!result.name2
      }
    }
    
    return {
      name1: null,
      name2: null,
      name1First: null,
      name1Last: null,
      name2First: null,
      name2Last: null,
      hasSeparator: false
    }
  }

  /**
   * Extract names from description using bracket notation
   * Uses shared extraction utility from src/utils/extraction/nameExtraction.ts
   */
  const extractNames = (description: string): {
    name1: string | null;
    name2: string | null;
    name1First: string | null;
    name1Last: string | null;
    name2First: string | null;
    name2Last: string | null;
    hasSeparator: boolean;
  } => {
    // Use bracket extraction
    return extractNamesFromBrackets(description)
  }

  /**
   * Extract date from description with enhanced pattern matching
   * Supports multiple date formats:
   * - "on 6th March, 2025"
   * - "6th March 2025"
   * - "March 6, 2025"
   * - "6/3/2025"
   * - Dates with ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
   * Preserves "on" prefix if present, adds it if missing
   */
  const extractDate = (description: string): string | null => {
    // Helper function to add ordinal suffix to day number
    const addOrdinalSuffix = (day: number): string => {
      if (day >= 11 && day <= 13) return `${day}th`
      switch (day % 10) {
        case 1: return `${day}st`
        case 2: return `${day}nd`
        case 3: return `${day}rd`
        default: return `${day}th`
      }
    }

    // Helper to expand 2-digit year to 4-digit
    const expandYear = (year: string): string => {
      if (year.length === 2) {
        const num = parseInt(year)
        return num >= 0 && num <= 50 ? `20${year}` : `19${year}`
      }
      return year
    }

    // Month name mapping
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December']
    const monthAbbrev: Record<string, string> = {
      'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
      'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
      'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
    }
    
    const normalizeMonth = (m: string): string => {
      const lower = m.toLowerCase().replace(/[,.]/, '')
      if (monthAbbrev[lower.substring(0, 3)]) {
        return monthAbbrev[lower.substring(0, 3)]
      }
      // Capitalize first letter
      return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
    }

    // Pattern 1: Numeric date (6/1/25, 6/1/2025, 6-1-25, 6-1-2025)
    // Assumes day/month/year format
    const numericPattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/
    const numericMatch = description.match(numericPattern)
    if (numericMatch) {
      const day = parseInt(numericMatch[1])
      const month = parseInt(numericMatch[2])
      const year = expandYear(numericMatch[3])
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return `on ${addOrdinalSuffix(day)} ${monthNames[month - 1]}, ${year}`
      }
    }

    // Pattern 2: "6th of January, 2024" or "6 of January 2024"
    // Guard against partial matches into a year (e.g. "January, 20" inside "January, 2023").
    const dayOfMonthPattern = /(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*(\d{4})?(?!\d)/i
    const dayOfMonthMatch = description.match(dayOfMonthPattern)
    if (dayOfMonthMatch) {
      const day = parseInt(dayOfMonthMatch[1])
      const month = normalizeMonth(dayOfMonthMatch[2])
      const year = dayOfMonthMatch[3] || new Date().getFullYear().toString()
      return `on ${addOrdinalSuffix(day)} ${month}, ${year}`
    }

    // Pattern 3: "6th January, 2024" or "6th January 2024" or "on 6th January, 2024"
    // Prefer day-month-year before month-day-year to avoid false positives inside years.
    const dayMonthYearPattern = /(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*(\d{4})?(?!\d)/i
    const dayMonthMatch = description.match(dayMonthYearPattern)
    if (dayMonthMatch) {
      const day = parseInt(dayMonthMatch[1])
      const month = normalizeMonth(dayMonthMatch[2])
      const year = dayMonthMatch[3] || new Date().getFullYear().toString()
      return `on ${addOrdinalSuffix(day)} ${month}, ${year}`
    }

    // Pattern 4: "January 6th, 2024" or "January, 6th 2024" or "on January, 6th 2024"
    // Guard against partial matches into a year (e.g. "March, 20" inside "March, 2023").
    const monthDayYearPattern = /(?:on\s+)?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*(\d{1,2})(?:st|nd|rd|th)?(?:[,.]?\s*(\d{4}))?(?!\d)/i
    const monthDayMatch = description.match(monthDayYearPattern)
    if (monthDayMatch) {
      const month = normalizeMonth(monthDayMatch[1])
      const day = parseInt(monthDayMatch[2])
      const year = monthDayMatch[3] || new Date().getFullYear().toString()
      return `on ${addOrdinalSuffix(day)} ${month}, ${year}`
    }

    // Pattern 5: Simple day number after bracket or comma (e.g., "), 6," or "), 15,")
    // This captures just a day number that appears after names in brackets
    // Auto-completes with current month and year
    const simpleDayPattern = /\)\s*,?\s*(\d{1,2})(?:st|nd|rd|th)?\s*[,.]?\s*(?:courtesy|cut-cee|$)/i
    const simpleDayMatch = description.match(simpleDayPattern)
    if (simpleDayMatch && simpleDayMatch[1]) {
      const day = parseInt(simpleDayMatch[1])
      if (day >= 1 && day <= 31) {
        const currentDate = new Date()
        const currentMonth = monthNames[currentDate.getMonth()]
        const currentYear = currentDate.getFullYear()
        return `on ${addOrdinalSuffix(day)} ${currentMonth}, ${currentYear}`
      }
    }

    return null
  }

  /**
   * Extract date after name brackets (legacy support)
   * Looks for numbers after closing bracket ) or ] as date indicators
   * Examples: "(Sarah Ahmed) 5th March 2025", "[John Mary] 15 April 2025"
   */
  const extractDateAfterBrackets = (description: string): string | null => {
    return extractDate(description)
  }

  /**
   * Extract courtesy text with specific keyword patterns
   * Accepts ANY text after the keyword (not limited to family names)
   * Supported patterns:
   * - "courtesy: [any text]" - Example: "courtesy: the family", "courtesy: Rahman Family"
   * - "coutesy: [any text]" - Common misspelling
   * - "cut-cee: [any text]" - Example: "cut-cee: anything", "cut-cee: the organizers"
   * Returns the extracted text and the prefix used
   */
  const extractCourtesy = (description: string): { text: string; prefix: string } | null => {
    // Helper function to capitalize first letter of each word and remove parentheses
    const capitalizeWords = (text: string): string => {
      // Remove parentheses from the text
      const cleanedText = text.replace(/[()]/g, '')
      
      return cleanedText.split(' ').map(word => {
        if (word.length === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }).join(' ')
    }

    // Pattern 1: "courtesy:" followed by text (case-insensitive)
    // Captures text after "courtesy:" but stops at brackets or newlines
    const courtesyPattern = /courtesy:\s*([^\n\(\[]+?)(?:\s*$|\.|\n|\s*\(|\s*\[)/i
    const courtesyMatch = description.match(courtesyPattern)

    if (courtesyMatch && courtesyMatch[1]) {
      const courtesyText = courtesyMatch[1].trim()
      // Capitalize first letter of each word
      return { text: capitalizeWords(courtesyText), prefix: 'Courtesy:' }
    }

    // Pattern 2: "coutesy:" (common misspelling) followed by text
    const misspelledPattern = /coutesy:\s*([^\n\(\[]+?)(?:\s*$|\.|\n|\s*\(|\s*\[)/i
    const misspelledMatch = description.match(misspelledPattern)

    if (misspelledMatch && misspelledMatch[1]) {
      const courtesyText = misspelledMatch[1].trim()
      // Capitalize first letter of each word
      return { text: capitalizeWords(courtesyText), prefix: 'Courtesy:' }
    }

    // Pattern 3: "cut-cee:" followed by text (case-insensitive)
    // Stops at brackets or newlines
    const cutCeePattern = /cut-cee:\s*([^\n\(\[]+?)(?:\s*$|\.|\n|\s*\(|\s*\[)/i
    const cutCeeMatch = description.match(cutCeePattern)

    if (cutCeeMatch && cutCeeMatch[1]) {
      const courtesyText = cutCeeMatch[1].trim()
      // Capitalize first letter of each word
      return { text: capitalizeWords(courtesyText), prefix: 'CUT-CEE:' }
    }

    return null
  }

  /**
   * Extract courtesy/family name after date (legacy support)
   * The text after the date is treated as courtesy name
   * Examples: "(Sarah Ahmed) 5th March 2025 Rahman Family"
   */
  const extractCourtesyAfterDate = (description: string): string | null => {
    const result = extractCourtesy(description)
    return result ? result.text : null
  }

  /**
   * Check if description contains wedding-related keywords
   */
  const isWeddingRelated = (description: string): boolean => {
    if (!description || typeof description !== 'string') return false
    const lowerDesc = description.toLowerCase()
    return lowerDesc.includes('congratulation') ||
           lowerDesc.includes('wedding') ||
           lowerDesc.includes('ceremony') ||
           lowerDesc.includes('marriage')
  }

  /**
   * Load external name SVG file from public directory
   * @returns Promise with SVG content as string, or null if loading fails
   */
  const loadAndPopulateNameSVG = async (): Promise<string | null> => {
    // Return cached content if available
    if (cachedNameSVG) {
      return cachedNameSVG
    }

    try {
      // Prefer the new name library asset.
      // Fallback to the legacy decorative name+surname asset if needed.
      const candidatePaths = [
        '/names/name1.svg',
        '/assets/name&surname/name%20and%20surname.svg'
      ]

      let svgContent: string | null = null
      let loadedFrom: string | null = null

      for (const svgPath of candidatePaths) {
        console.log('🔄 Attempting to load decorative name SVG from:', svgPath)
        const response = await fetch(svgPath)
        console.log('📡 Fetch response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          url: response.url
        })
        if (!response.ok) continue
        svgContent = await response.text()
        loadedFrom = svgPath
        break
      }

      if (!svgContent || !loadedFrom) {
        console.error('❌ Failed to load name SVG from all candidates')
        console.error('💡 Tip: Ensure one of these exists under public/:')
        console.error('   - public/names/name1.svg')
        console.error('   - public/assets/name&surname/name and surname.svg')
        return null
      }

      console.log('✅ Successfully loaded name SVG file')
      console.log('   Loaded from:', loadedFrom)
      console.log('   Content length:', svgContent.length, 'characters')
      console.log('   First 100 chars:', svgContent.substring(0, 100))

      // Cache the loaded SVG content
      cachedNameSVG = svgContent
      console.log('💾 Cached SVG content for future use')

      return svgContent
    } catch (error) {
      console.error('❌ Error loading name SVG:', error)
      console.error('   Paths attempted: public/names/name1.svg, public/assets/name&surname/name and surname.svg')
      console.error('💡 Possible causes:')
      console.error('   - File does not exist at public/names/name1.svg')
      console.error('   - File does not exist at public/assets/name&surname/name and surname.svg')
      console.error('   - CORS policy blocking the request')
      console.error('   - Network error or server not running')
      return null
    }
  }

  /**
   * Replace hardcoded names in the loaded SVG content with user-provided names
   * @param svgContent - The loaded SVG content as string
   * @param name1 - First person's name (will be converted to Title Case)
   * @param name2 - Second person's name (will be converted to Title Case)
   * @returns Modified SVG content with replaced names
   */
  const replaceNamesInSVG = (svgContent: string, name1: string, name2: string, name1LastRaw = '', name2LastRaw = ''): string => {
    // Apply Title Case formatting to names
    const formattedName1 = toTitleCase(name1)
    const formattedName2 = toTitleCase(name2)
    const formattedLast1 = name1LastRaw?.trim() ? name1LastRaw.trim().toUpperCase() : ''
    const formattedLast2 = name2LastRaw?.trim() ? name2LastRaw.trim().toUpperCase() : ''

    console.log('🔄 Replacing names in SVG:', {
      original: { name1: 'Muhammad', name2: 'Hauwawu' },
      replacement: { name1: formattedName1, name2: formattedName2 }
    })

    // Adjust x and y positions based on character length
    const name1Length = formattedName1.length
    const name2Length = formattedName2.length

    // Extract first name lengths (before space/surname) for font scaling and positioning
    const firstName1 = formattedName1.split(' ')[0]
    const firstName2 = formattedName2.split(' ')[0]
    const firstName1Length = firstName1.length
    const firstName2Length = firstName2.length
    
    const hasLongName = firstName1Length >= 8 || firstName2Length >= 8
    
    // Check if first name is 4-6 letters AND second name is 7 letters or more
    // OR if first name is 3 letters AND second name is 4+ letters
    // This triggers position shift: & moves to name1's y-position, name2 x moves to & x-position
    const shouldShiftPositions = (name1Length >= 4 && name1Length <= 6 && name2Length >= 7) || (name1Length === 3 && name2Length >= 4)
    
    // Check if either name is 10+ letters - move all elements left
    const hasVeryLongName = name1Length >= 10 || name2Length >= 10
    const leftShift = hasVeryLongName ? 30 : 0  // Move left by 30 units if very long name
    
    // Check if first name is 7 letters AND second name is 9+ letters - move first name right
    const shouldShiftName1Right = name1Length === 7 && name2Length >= 9
    const name1RightShift = shouldShiftName1Right ? 10 : 0  // Move right by 10 units
    
    // Check if first name is 4 letters AND second name is 7+ letters - move first name right after & shifts
    const shouldShiftName1RightAfterSeparator = name1Length === 4 && name2Length >= 7
    const name1ExtraRightShift = shouldShiftName1RightAfterSeparator ? 15 : 0  // Move right by 15 units
    
    // Check if first name is 7+ letters AND second name is 4-5 letters - move & and name2 right
    // OR if first name is 10+ letters AND second name is 5-7 letters - use same positions as 10+ & 4
    const shouldShiftSeparatorAndName2Right = (name1Length >= 7 && name2Length >= 4 && name2Length <= 5) || (name1Length >= 10 && name2Length >= 5 && name2Length <= 7)
    const separatorAndName2RightShift = shouldShiftSeparatorAndName2Right ? 90 : 0  // Move right by 90 units
    
    // Check if first name is 6 letters starting with "M" AND second name is 8+ letters - move & right
    const startsWithM = formattedName1.charAt(0).toUpperCase() === 'M'
    const shouldShiftSeparatorForM = name1Length === 6 && startsWithM && name2Length >= 8
    const separatorExtraRightShift = shouldShiftSeparatorForM ? 30 : 0  // Move right by 30 units
    
    // Check if first name is 6-8 letters AND second name is 10+ letters - move first name & separator right
    const shouldShiftName1AndSeparatorRight = name1Length >= 6 && name1Length <= 8 && name2Length >= 10
    const name1AndSeparatorExtraShift = shouldShiftName1AndSeparatorRight ? 35 : 0  // Move right by 35 units
    
    // Check if first name is 6 letters AND second name is 7+ letters - move first name right
    // Exception: if first name is 6 AND second name is exactly 7 or 8, handle separately
    const shouldShiftName1RightFor6And7Plus = name1Length === 6 && name2Length >= 9
    const name1RightShiftFor6And7Plus = shouldShiftName1RightFor6And7Plus ? 20 : 0  // Move right by 20 units
    
    // Check if first name is 6 letters AND second name is exactly 7 letters - move first name left, & right
    const shouldShiftFor6And7 = name1Length === 6 && name2Length === 7
    const name1LeftShiftFor6And7 = shouldShiftFor6And7 ? -15 : 0  // Move first name left by 15 units
    const separatorRightShiftFor6And7 = shouldShiftFor6And7 ? 20 : 0  // Move & right by 20 units
    
    // Check if first name is 6 letters AND second name is exactly 8 letters - move & right more
    const shouldShiftSeparatorFor6And8 = name1Length === 6 && name2Length === 8
    const separatorExtraShiftFor6And8 = shouldShiftSeparatorFor6And8 ? 15 : 0  // Move & right by 15 units
    
    // NEW: Check if first name is 4 letters AND second name is 7+ letters - move & right after initial shift
    const shouldShiftSeparatorFor4And7Plus = name1Length === 4 && name2Length >= 7
    const separatorExtraShiftFor4And7Plus = shouldShiftSeparatorFor4And7Plus ? 100 : 0  // Move & right by additional 100 units
    
    // NEW: Check if first name is 7 letters AND second name is 10 letters - apply same & position as other shifting logic
    const shouldShiftSeparatorFor7And10 = name1Length === 7 && name2Length === 10
    
    // First name position - adjust left if very long name, or right if 7 + 9+ condition, or right if 4 + 7+ condition, or right if 6-8 + 10+ condition, or right if 6 + 9+ condition, or left if 6 + 7 condition
    const name1XPosition = String(-50 - leftShift + name1RightShift + name1ExtraRightShift + name1AndSeparatorExtraShift + name1RightShiftFor6And7Plus + name1LeftShiftFor6And7)
    const name1YPosition = '85'  // Matched to template (was 90)

    // Determine separator x position based on conditions:
    // - If first name is 4 letters AND second name is 7+ letters: x="155"
    // - If first name is 3 letters AND second name is 4+ letters: x="155" (same as 4 + 7)
    // - If first name is 3 letters AND second name is 8+ letters: x="155"
    // - If first name is 5-6 letters AND second name is 7 letters: x="260" (same as 6 + 8+)
    // - If first name is 7 letters AND second name is 10 letters: use shift position (same as other shift logic)
    // - Otherwise if shift triggered: x="260"
    // - Default (no shift): x="-70.3"
    let separatorXPosition = '-70.3'  // Default position matched to template
    if (shouldShiftPositions || shouldShiftSeparatorFor7And10) {
      if ((name1Length === 4 && name2Length >= 7) || (name1Length === 3 && name2Length >= 4)) {
        separatorXPosition = String(135 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor6And8 + separatorRightShiftFor6And7 + separatorExtraShiftFor4And7Plus)  // 4-letter first name with 7+ second name, or 3-letter first name with 4+
      } else if ((name1Length >= 5 && name1Length <= 6 && name2Length === 7)) {
        separatorXPosition = String(240 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor6And8 + separatorRightShiftFor6And7 + separatorExtraShiftFor4And7Plus)  // 5-6 letter first name with 7-letter second name (same as 6 + 8+)
      } else {
        separatorXPosition = String(240 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor6And8 + separatorRightShiftFor6And7 + separatorExtraShiftFor4And7Plus)  // Other shift conditions including 7 + 10
      }
    } else {
      separatorXPosition = String(-70.3 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor4And7Plus)  // Apply left shift to default position too
    }
    
    const separatorYPosition = (shouldShiftPositions || shouldShiftSeparatorFor7And10) ? '85' : '160.4'  // Moved to 85 if shifted (same as name1)
    
    // Additional shift for second name if first name is 4-6 letters AND second name is 8+ letters
    const shouldShiftName2Left = name1Length >= 4 && name1Length <= 6 && name2Length >= 8
    const name2ExtraShift = shouldShiftName2Left ? 10 : 0  // Extra 10 units left for second name
    
    const name2XPosition = shouldShiftPositions ? String(-70.3 - leftShift - name2ExtraShift + separatorAndName2RightShift) : String(10.23 - leftShift - name2ExtraShift + separatorAndName2RightShift)
    const name2YPosition = hasLongName ? '150' : '160'  // Move up to 150 if font is reduced (long names), otherwise 160

    // Font size adjustment logic:
    // - Use ONLY first name length (not full name with surname) for font scaling
    // - If first name is 4 letters AND second first name is 4-5 letters: increase font size by 15 points
    // - If either FIRST NAME has 8+ letters: reduce font size progressively
    // - Otherwise: keep base font size (84.15px)
    
    // (firstName1, firstName2, lengths, and hasLongName are already defined above)
    
    const bothNames4Letters = firstName1Length === 4 && firstName2Length === 4
    const name1Is4AndName2Is4to5 = firstName1Length === 4 && firstName2Length >= 4 && firstName2Length <= 5
    // const hasLongName = firstName1Length >= 8 || firstName2Length >= 8 (defined above)
    const baseFontSize = 84.15
    const increasedFontSize = baseFontSize + 15
    
    // Progressive font reduction for longer names (subtle adjustment)
    // 8 letters: reduce by 5px
    // 9 letters: reduce by 8px
    // 10 letters: reduce by 10px
    // 11+ letters: reduce by 12px (max reduction)
    const longestFirstName = Math.max(firstName1Length, firstName2Length)
    let nameFontReduction = 0
    if (longestFirstName >= 8) {
      const extraLetters = longestFirstName - 8 // 0 for 8 letters, 1 for 9 letters, etc.
      nameFontReduction = Math.min(5 + (extraLetters * 2.5), 12) // Subtle reduction, max 12px
    }
    const reducedFontSize = baseFontSize - nameFontReduction
    
    let fontSize = baseFontSize
    if (name1Is4AndName2Is4to5) {
      fontSize = increasedFontSize
    } else if (hasLongName) {
      fontSize = reducedFontSize
    }

    console.log(`📏 Full name1: "${formattedName1}" (${name1Length} chars), Full name2: "${formattedName2}" (${name2Length} chars)`)
    console.log(`📏 First name only: "${firstName1}" (${firstName1Length} chars), "${firstName2}" (${firstName2Length} chars)`)
    console.log(`🔍 Font size conditions:`)
    console.log(`   - bothNames4Letters: ${bothNames4Letters}`)
    console.log(`   - name1Is4AndName2Is4to5: ${name1Is4AndName2Is4to5}`)
    console.log(`   - hasLongName (8+ letters): ${hasLongName} (${firstName1Length >= 8 ? 'First name ≥8' : ''}${firstName1Length >= 8 && firstName2Length >= 8 ? ' AND ' : ''}${firstName2Length >= 8 ? 'Second name ≥8' : ''})`)
    console.log(`   - Final font size: ${fontSize}px ${fontSize < 84.15 ? '(REDUCED)' : fontSize > 84.15 ? '(INCREASED)' : '(DEFAULT)'}`)
    console.log(`↔️ Very long name (10+): ${hasVeryLongName ? 'YES - All elements shifted left by 30 units' : 'NO'}`)
    console.log(`↔️ Name1 right shift (7 + 9+): ${shouldShiftName1Right ? 'YES - First name shifted right by 10 units' : 'NO'}`)
    console.log(`↔️ Name1 extra right shift (4 + 7+): ${shouldShiftName1RightAfterSeparator ? 'YES - First name shifted right by 15 units after & shift' : 'NO'}`)
    console.log(`↔️ Name1 & Separator right shift (6-8 + 10+): ${shouldShiftName1AndSeparatorRight ? 'YES - First name and & shifted right by 35 units' : 'NO'}`)
    console.log(`↔️ Name1 right shift (6 + 9+): ${shouldShiftName1RightFor6And7Plus ? 'YES - First name shifted right by 20 units' : 'NO'}`)
    console.log(`↔️ Special shift (6 + 7 only): ${shouldShiftFor6And7 ? 'YES - First name shifted left by 15 units, & shifted right by 20 units' : 'NO'}`)
    console.log(`↔️ Separator right shift (6 + 8 only): ${shouldShiftSeparatorFor6And8 ? 'YES - & shifted right by 15 units, first name returns to default' : 'NO'}`)
    console.log(`↔️ Separator extra right shift (4 + 7+): ${shouldShiftSeparatorFor4And7Plus ? 'YES - & shifted right by additional 100 units after initial positioning' : 'NO'}`)
    console.log(`📍 Setting position for name1-first: x=${name1XPosition}, y=${name1YPosition}`)
    console.log(`📍 Setting position for separator: x=${separatorXPosition}, y=${separatorYPosition}`)
    console.log(`📍 Setting position for name2-first: x=${name2XPosition}, y=${name2YPosition}`)
    console.log(`📐 Font size adjustment: ${name1Is4AndName2Is4to5 ? `Increased to ${fontSize}px (FIRST names are 4 and 4-5 letters)` : hasLongName ? `Reduced to ${fontSize}px (FIRST name has 8+ letters)` : `Keeping ${fontSize}px (base size)`}`)

    // Check if both names are 10+ characters to apply Swiss font, otherwise use Cinzel Decorative
    const bothNamesLong = firstName1Length >= 10 && firstName2Length >= 10
    const fontFamily = bothNamesLong ? 'Arial, Helvetica, sans-serif' : "'Cinzel Decorative', Georgia, serif"
    
    if (bothNamesLong) {
      console.log(`📝 FONT FAMILY CHANGE: Both names are 10+ characters - switching to Swiss/Arial font`)
    } else {
      console.log(`📝 FONT FAMILY: Using Cinzel Decorative for wedding names`)
    }

    // Prefer DOM-based updates so we can support any decorative SVG that
    // provides the expected ids (name1-first, name2-first, name-separator, optional surname ids).
    let modifiedSVG = svgContent
    let skipPositioning = false
    try {
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
      const parserError = svgDoc.querySelector('parsererror')
      if (parserError) {
        throw new Error(parserError.textContent || 'SVG parse error')
      }

      skipPositioning = svgDoc.documentElement.getAttribute('data-skip-positioning') === 'true'

      const elName1 = svgDoc.querySelector('text#name1-first') as SVGTextElement | null
      const elName2 = svgDoc.querySelector('text#name2-first') as SVGTextElement | null
      const elSep = svgDoc.querySelector('text#name-separator') as SVGTextElement | null
      const elLast1 = svgDoc.querySelector('text#name1-last') as SVGTextElement | null
      const elLast2 = svgDoc.querySelector('text#name2-last') as SVGTextElement | null

      if (elName1) {
        elName1.textContent = formattedName1
        if (!skipPositioning) {
          elName1.setAttribute('x', name1XPosition)
          elName1.setAttribute('y', name1YPosition)
        }
        if (!skipPositioning) {
          elName1.setAttribute('font-weight', '900')
          elName1.style.fontSize = `${fontSize}px`
          elName1.style.fontFamily = fontFamily
        }
        if (!skipPositioning) {
          elName1.style.fontWeight = '900'
        }
      }

      if (elName2) {
        elName2.textContent = formattedName2
        if (!skipPositioning) {
          elName2.setAttribute('x', name2XPosition)
          elName2.setAttribute('y', name2YPosition)
        }
        if (!skipPositioning) {
          elName2.setAttribute('font-weight', '900')
          elName2.style.fontSize = `${fontSize}px`
          elName2.style.fontFamily = fontFamily
        }
        if (!skipPositioning) {
          elName2.style.fontWeight = '900'
        }
      }

      if (elSep) {
        if (!skipPositioning) {
          elSep.setAttribute('x', separatorXPosition)
          elSep.setAttribute('y', separatorYPosition)
        }
        if (!skipPositioning) {
          elSep.setAttribute('font-weight', '900')
          elSep.style.fontSize = `${fontSize}px`
          elSep.style.fontFamily = fontFamily
        }
        if (!skipPositioning) {
          elSep.style.fontWeight = '900'
        }
      }

      if (formattedLast1 && elLast1) {
        elLast1.textContent = formattedLast1
      }
      if (formattedLast2 && elLast2) {
        elLast2.textContent = formattedLast2
      }

      if (hasLongName && !skipPositioning) {
        if (elName1) elName1.style.letterSpacing = '-1px'
        if (elName2) elName2.style.letterSpacing = '-1px'
      }

      const serializer = new XMLSerializer()
      modifiedSVG = serializer.serializeToString(svgDoc.documentElement)
    } catch (e) {
      // Keep legacy regex-based behavior if parsing fails.
      console.warn('⚠️ Decorative SVG DOM update failed, falling back to regex replacement:', e)
      modifiedSVG = svgContent
    }

    // For the name library SVGs (data-skip-positioning="true"), we only replace the text content.
    // Do NOT alter font-size/font-family/font-weight/letter-spacing via regex.
    if (skipPositioning) {
      console.log('ℹ️ Using data-skip-positioning="true" name SVG: injecting as-is (no font/position adjustments).')
      return modifiedSVG
    }

    // If DOM update succeeded, we already applied fontFamily/fontSize directly.
    // Keep legacy behavior below for older SVGs that rely on CSS class replacement.

    // Apply font size adjustment ALWAYS to ensure consistent sizing
    // Modify the .name-fnt0 style definition to use the calculated font size
    // More flexible regex to match various whitespace patterns
    const beforeReplace = modifiedSVG.match(/font-size:\s*\d+(\.\d+)?px/g)
    console.log(`🔍 Before font-size replacement:`, beforeReplace)
    
    if (fontSize !== 84.15) {
      console.log(`🔧 APPLYING FONT SIZE CHANGE: ${fontSize}px (original: 84.15px) - Change: ${fontSize > 84.15 ? 'INCREASE' : 'DECREASE'} by ${Math.abs(fontSize - 84.15)}px`)
    } else {
      console.log(`ℹ️ Font size remains at default: ${fontSize}px`)
    }
    
    modifiedSVG = modifiedSVG.replace(
      /font-size:\s*84\.15px/g,
      `font-size: ${fontSize}px`
    )
    
    // Also try to replace any font-size="84.15px" attributes (direct attributes)
    modifiedSVG = modifiedSVG.replace(
      /font-size="84\.15px"/g,
      `font-size="${fontSize}px"`
    )
    
    // Additional replacement for any other font size patterns without px
    modifiedSVG = modifiedSVG.replace(
      /font-size:\s*84\.15(?!px)/g,
      `font-size: ${fontSize}`
    )
    
    // Ensure we also replace any remaining 84.15 font sizes in the .name-fnt0 class specifically
    modifiedSVG = modifiedSVG.replace(
      /(\.name-fnt0\s*{[^}]*font-size:\s*)84\.15(px;)/g,
      `$1${fontSize}$2`
    )
    
    // Also add letter-spacing for tighter text when font is reduced (only for long names)
    if (hasLongName) {
      modifiedSVG = modifiedSVG.replace(
        /font-family: 'Cinzel Decorative', serif; }/g,
        `font-family: 'Cinzel Decorative', serif; letter-spacing: -1px; }`
      )
    }

    const afterReplace = modifiedSVG.match(/font-size:\s*\d+(\.\d+)?px/g)
    console.log(`🔍 After font-size replacement:`, afterReplace)
    
    // Validate that font size replacement worked
    const expectedPattern = `font-size: ${fontSize}px`
    const fontReplaceWorked = modifiedSVG.includes(expectedPattern)
    console.log(`✏️ Font size adjusted to ${fontSize}px for all name elements (name1, "&", name2)${hasLongName ? ' with letter-spacing: -1px' : ''}`)
    console.log(`🔍 Font replacement validation: ${fontReplaceWorked ? '✅ SUCCESS' : '❌ FAILED'} - Looking for: "${expectedPattern}"`)
    
    if (!fontReplaceWorked) {
      console.log('❌ Font size replacement failed - checking what patterns exist:')
      const allFontSizes = modifiedSVG.match(/font-size[^;]+/g)
      console.log('Found font-size patterns:', allFontSizes)
    }

    console.log('✅ Names replaced successfully')
    return modifiedSVG
  }

  /**
   * Inject the modified name SVG content into the wedding names group
   * Preserves the Cinzel Decorative Bold font definition and decorative elements
   * @param svgContent - The modified SVG content with user names
   * @param targetElement - The #wedding-names-group element
   */
  const injectNameSVGIntoTemplate = (svgContent: string, targetElement: SVGGElement | null): void => {
    if (!targetElement) {
      console.error('❌ Target element (#wedding-names-group) not found')
      return
    }

    try {
      // Parse the SVG content
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')

      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror')
      if (parserError) {
        console.error('❌ Error parsing SVG:', parserError.textContent)
        return
      }

      // Find the root SVG element to access the main template
      const rootSVG = targetElement.ownerSVGElement
      if (!rootSVG) {
        console.error('❌ Could not find root SVG element')
        return
      }

      const injectAsIs = svgDoc.documentElement.getAttribute('data-skip-positioning') === 'true'

      // STEP 1: Inject supporting defs/styles as needed.
      // For data-skip-positioning="true" assets, we still need to inject @font-face styles
      // but we don't rewrite them (keep original font definitions).
      
      // ALWAYS inject @font-face styles regardless of injectAsIs flag
      // This ensures embedded fonts (like Grand Hotel) are available in the target SVG
      const allStyles = svgDoc.querySelectorAll('style')
      allStyles.forEach(loadedStyle => {
        const cssText = loadedStyle.textContent || ''
        
        // Check if this style contains @font-face declarations
        if (cssText.includes('@font-face')) {
          const styleId = loadedStyle.id || (cssText.includes('Grand Hotel') ? 'grand-hotel-embedded-font' : 'injected-font-style')
          
          // Check if this font style already exists in root
          const existingStyle = rootSVG.querySelector(`style#${styleId}`)
          if (existingStyle) {
            console.log(`🔄 Font style #${styleId} already exists at root, skipping`)
            return
          }
          
          // Inject font-face style directly into root SVG
          const importedStyle = document.importNode(loadedStyle, true) as Element
          importedStyle.id = styleId
          rootSVG.insertBefore(importedStyle, rootSVG.firstChild)
          console.log(`✅ Font @font-face style #${styleId} injected at root SVG level`)
        }
      })
      
      // For non-skip-positioning assets, also inject other styles
      if (!injectAsIs) {
        const loadedStyle = svgDoc.querySelector('style:not([id*="font"])')
        if (loadedStyle && !loadedStyle.textContent?.includes('@font-face')) {
          const existingStyle = rootSVG.querySelector('style#cinzel-decorative-style')
          if (existingStyle) {
            existingStyle.remove()
            console.log('🔄 Removed existing style to update with new font size')
          }
          const importedStyle = document.importNode(loadedStyle, true) as Element
          importedStyle.id = 'cinzel-decorative-style'
          rootSVG.insertBefore(importedStyle, rootSVG.firstChild)
          console.log('✅ Style definition injected into root SVG')
        }
      }

      // Always merge <defs> (fonts/clipPaths/etc.) if present.
      const loadedDefs = svgDoc.querySelector('defs')
      if (loadedDefs) {
        let rootDefs = rootSVG.querySelector('defs')
        if (!rootDefs) {
          rootDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
          rootSVG.insertBefore(rootDefs, rootSVG.firstChild)
        }

        const hasElementWithId = (id: string): boolean => {
          const safeId = id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
          return Boolean(rootSVG.querySelector(`[id="${safeId}"]`))
        }

        Array.from(loadedDefs.children).forEach(child => {
          const childEl = child as Element
          const childId = childEl?.getAttribute?.('id')

          if (childId && hasElementWithId(childId)) {
            return
          }

          // IMPORTANT: <style> elements with @font-face MUST be placed directly in <svg>,
          // NOT inside <defs>. Browsers may not process CSS inside <defs> correctly.
          if (childEl?.tagName?.toLowerCase?.() === 'style') {
            const cssText = childEl.textContent || ''
            
            // Check if this is a font-face style that needs to be at root level
            if (cssText.includes('@font-face')) {
              // Check if Grand Hotel font is already at root
              const existingGrandHotel = rootSVG.querySelector('style#grand-hotel-embedded-font')
              if (cssText.includes('Grand Hotel') && existingGrandHotel) {
                console.log('🔄 Grand Hotel font style already exists at root, skipping')
                return
              }
              
              // Inject font-face style directly into root SVG (NOT inside defs)
              const importedStyle = document.importNode(childEl, true) as Element
              if (!importedStyle.id && cssText.includes('Grand Hotel')) {
                importedStyle.id = 'grand-hotel-embedded-font'
              }
              rootSVG.insertBefore(importedStyle, rootSVG.firstChild)
              console.log('✅ Font @font-face style injected at root SVG level (not in defs)')
              return
            }
          }

          rootDefs!.appendChild(document.importNode(child, true))
        })
      }

      // STEP 2: Find the main group element containing the names and decorative elements
      // In name02.svg, this is the outer <g> element
      const svgRoot = svgDoc.documentElement
      let mainGroup = svgRoot.querySelector('g#Layer_x0020_1_0')
      if (!mainGroup) {
        // Legacy support: some assets wrap everything in a transformed group
        mainGroup = svgRoot.querySelector('g[transform]')
      }
      if (!mainGroup) {
        mainGroup = svgRoot.querySelector('g')
      }
      
      if (!mainGroup) {
        console.error('❌ Could not find main group in loaded SVG')
        console.error('   Looking for <g> element')
        return
      }
      console.log('✅ Found main group')

      // STEP 3: Clear existing content in the target element
      // Remove all old text-based name elements
      while (targetElement.firstChild) {
        targetElement.removeChild(targetElement.firstChild)
      }

      // STEP 4: Inject EXACTLY as in the loaded SVG group (no wrappers, no transforms, no style forcing)
      // IMPORTANT: document.importNode(child, true) preserves ALL attributes including x/y/font.
      const children = Array.from(mainGroup.childNodes)
      children.forEach(child => {
        const importedNode = document.importNode(child, true)
        targetElement.appendChild(importedNode)
      })

      // STEP 5: Mark the group with a data attribute to indicate decorative SVG is loaded
      // This prevents the old text-based rendering from interfering
      targetElement.setAttribute('data-decorative-svg-loaded', 'true')

      // STEP 5.5: CENTER the injected content for data-skip-positioning="true" SVGs
      // The name1.svg has its own coordinate system and needs to be centered within the template
      if (injectAsIs && rootSVG) {
        // Get the viewBox of the source SVG to understand its coordinate system
        const viewBoxAttr = svgRoot.getAttribute('viewBox')
        if (viewBoxAttr) {
          const [vbX, vbY, vbWidth, vbHeight] = viewBoxAttr.split(/\s+/).map(parseFloat)
          console.log(`📐 Source SVG viewBox: ${vbX} ${vbY} ${vbWidth} ${vbHeight}`)
          
          // Get the template viewBox for positioning reference
          const templateViewBox = rootSVG.getAttribute('viewBox')
          if (templateViewBox) {
            const [, , templateWidth] = templateViewBox.split(/\s+/).map(parseFloat)
            
            // The names should be centered around x=850 (same as blessing text, occasion, etc.)
            // Calculate the current wedding-names-group transform
            const currentTransform = targetElement.getAttribute('transform') || 'translate(400, 900) scale(2.5)'
            
            // Parse the current transform to extract scale and translate values
            const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
            const translateMatch = currentTransform.match(/translate\(([^)]+)\)/)
            
            const scale = scaleMatch ? parseFloat(scaleMatch[1].split(/[\s,]+/)[0]) : 2.5
            const translateParts = translateMatch ? translateMatch[1].split(/[\s,]+/).map(parseFloat) : [300, 600]
            const translateY = translateParts[1] || 600
            
            // Calculate the new X translate to center the content
            // The content width after scaling is vbWidth * scale
            // To center at x=1150, we need: translateX = 1150 - (vbWidth * scale / 2)
            // But we also need to account for the content's internal positioning
            // The name1.svg content is already centered within its viewBox
            const contentWidthAfterScale = vbWidth * scale
            const targetCenterX = 1050  // Shift further left for better visual alignment
            const newTranslateX = targetCenterX - (contentWidthAfterScale / 2)
            
            const newTransform = `translate(${newTranslateX}, ${translateY}) scale(${scale})`
            targetElement.setAttribute('transform', newTransform)
            
            console.log(`📍 Centering decorative name SVG:`)
            console.log(`   Original transform: ${currentTransform}`)
            console.log(`   New transform: ${newTransform}`)
            console.log(`   Content width (scaled): ${contentWidthAfterScale}`)
            console.log(`   Target center X: ${targetCenterX}`)
          }
        }
      }

      // STEP 6: Log coordinate preservation details
      const textElements = targetElement.querySelectorAll('text')
      const coordinates: string[] = []
      textElements.forEach((text, index) => {
        const x = text.getAttribute('x')
        const y = text.getAttribute('y')
        const content = text.textContent?.substring(0, 20) || ''
        coordinates.push(`Text ${index + 1}: x="${x}" y="${y}" content="${content}"`)
      })

      console.log('✅ Successfully injected name SVG into template')
      console.log('   Transform maintained:', targetElement.getAttribute('transform'))
      console.log('   Children injected:', children.length)
      console.log('   Injected as-is:', injectAsIs)
      console.log('   Original coordinates preserved:')
      coordinates.forEach(coord => console.log('     ' + coord))
      console.log('   Old text elements removed and replaced with decorative SVG')
    } catch (error) {
      console.error('❌ Error injecting SVG:', error)
    }
  }

  /**
   * Update SVG text elements based on description
   */
  const updateStickerText = async (description: string, elements: WeddingStickerElements): Promise<WeddingStickerData> => {
    // Ensure description is always a string
    const safeDescription = typeof description === 'string' ? description : String(description || '')
    
    // Check if decorative title replacement exists - if so, we should NOT touch original title elements
    // The decorative title system handles the blessing/occasion/eventType/ceremony display
    const svgRoot = elements.weddingNamesGroup?.ownerSVGElement || elements.blessingText?.ownerSVGElement
    const hasDecorativeTitle = !!svgRoot?.querySelector('#wedding-title-replacement')
    
    if (hasDecorativeTitle) {
      console.log('🎨 Decorative title detected - skipping original title element updates')
    }
    
    // Default data used ONLY when description is empty
    const defaultData: WeddingStickerData = {
      blessing: 'Alhamdulillahi',
      occasion: 'ON YOUR',
      eventType: 'WEDDING',
      ceremony: 'CEREMONY',
      name1: 'HANNATU',
      name2: 'HARUNA',
      date: 'on 7th March, 2025',
      courtesy: 'CUT-CEE: Maijama family'
    }

    if (!safeDescription || safeDescription.trim() === '') {
      return defaultData
    }

    // If description is provided, start with empty data for user-replaceable fields
    // This ensures that if a user doesn't type a date, the default date is NOT shown
    const data: WeddingStickerData = {
      blessing: 'Alhamdulillahi', // Keep default blessing/occasion/event unless overridden
      occasion: 'ON YOUR',
      eventType: 'WEDDING',
      ceremony: 'CEREMONY',
      name1: '', // Clear names
      name2: '',
      date: '',  // Clear date
      courtesy: '' // Clear courtesy
    }
    
    // Clear elements initially (they will be repopulated if found)
    if (elements.name1Text) elements.name1Text.textContent = ''
    if (elements.name2Text) elements.name2Text.textContent = ''
    if (elements.name1First) elements.name1First.textContent = ''
    if (elements.name2First) elements.name2First.textContent = ''
    if (elements.dateText) elements.dateText.textContent = ''
    if (elements.courtesyText) elements.courtesyText.textContent = ''

    // Helper to clean description for header extraction (remove brackets, courtesy, date)
    const getCleanHeader = (text: string): string => {
      let clean = text
      // Remove content in brackets (names)
      clean = clean.replace(/[\(\[][^\)\]]*[\)\]]/g, '')
      // Remove courtesy
      clean = clean.replace(/courtesy:\s*[^\n]+(?:\s*$|\.|\n)/ig, '')
      clean = clean.replace(/cut-cee:\s*[^\n]+(?:\s*$|\.|\n)/ig, '')
      
      // Remove date patterns to prevent date from being treated as header text
      // Pattern 1: "on [date]"
      clean = clean.replace(/\bon\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*\d{4})/ig, '')
      // Pattern 2: Date with ordinal suffix
      clean = clean.replace(/(\d{1,2}(?:st|nd|rd|th)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*\d{4})/ig, '')
      // Pattern 3: Month Day, Year
      clean = clean.replace(/((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}[,.]?\s*\d{4})/ig, '')
      // Pattern 4: Numeric date
      clean = clean.replace(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g, '')
      // Pattern 5: Date without year
      clean = clean.replace(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/ig, '')
      
      return clean.trim()
    }

    const cleanHeader = getCleanHeader(description)
    const hasCustomHeader = cleanHeader.length > 0

    // 1. Extract first word as blessing text
    // Use clean header to avoid picking up "(Name" as blessing
    let firstWord: string | null = null
    if (hasCustomHeader) {
       firstWord = cleanHeader.split(/\s+/)[0]
       // Capitalize
       if (firstWord) {
         firstWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1)
       }
    }

    if (firstWord) {
      data.blessing = firstWord

      if (elements.blessingText) {
        elements.blessingText.textContent = data.blessing
        // Note: Blessing font will be updated after event type is determined
      }
    }

    // 2. Extract event type dynamically from "on your [EVENT TYPE]" pattern
    const eventTypeData = extractEventType(description)
    
    if (eventTypeData) {
      // Pattern matched: "on your [EVENT TYPE]"
      data.occasion = 'ON YOUR'
      data.eventType = eventTypeData.eventType
      data.ceremony = eventTypeData.ceremony || 'CEREMONY'

      // Set occasion text (ON YOUR - should be together on one line)
      if (elements.occasionText) {
        elements.occasionText.removeAttribute('display')
        elements.occasionText.textContent = data.occasion
      }
      
      // Set event type text (WEDDING - gold color, below ON YOUR)
      if (elements.eventTypeText) {
        elements.eventTypeText.removeAttribute('display')
        elements.eventTypeText.textContent = data.eventType
        elements.eventTypeText.removeAttribute('font-family')
      }

      // Handle ceremony text visibility
      if (elements.ceremonyText) {
        if (eventTypeData.hideCeremony) {
          elements.ceremonyText.setAttribute('display', 'none')
        } else {
          elements.ceremonyText.removeAttribute('display')
          elements.ceremonyText.textContent = data.ceremony
        }
      }
    } else {
      // No "on your [EVENT TYPE]" pattern found
      
      if (hasCustomHeader) {
        // User typed something custom - show it as the main text
        const firstWordLength = cleanHeader.split(/\s+/)[0].length
        const remainingText = cleanHeader.substring(firstWordLength).trim()
        
        // Hide occasion text
        if (elements.occasionText) {
          elements.occasionText.setAttribute('display', 'none')
        }
        
        // Show remaining text as event type
        if (elements.eventTypeText) {
          elements.eventTypeText.removeAttribute('display')
          elements.eventTypeText.textContent = remainingText
          elements.eventTypeText.removeAttribute('font-family')
        }
        
        // Hide ceremony text
        if (elements.ceremonyText) {
          elements.ceremonyText.setAttribute('display', 'none')
        }
      } else {
        // No custom header - use defaults from template
        if (elements.occasionText) {
          elements.occasionText.removeAttribute('display')
          elements.occasionText.textContent = data.occasion
        }
        if (elements.eventTypeText) {
          elements.eventTypeText.removeAttribute('display')
          elements.eventTypeText.textContent = data.eventType
          elements.eventTypeText.removeAttribute('font-family')
        }
        if (elements.ceremonyText) {
          elements.ceremonyText.removeAttribute('display')
          elements.ceremonyText.textContent = data.ceremony
        }
      }
    }

    // Reset blessing font
    if (elements.blessingText) {
      elements.blessingText.removeAttribute('font-family')
    }

    // 3. Extract names (ONLY from brackets) - Enhanced with first/last name support
    const { name1, name2, name1First, name1Last, name2First, name2Last, hasSeparator } = extractNames(description)

    console.log('🔍 Name Extraction Debug:', {
      description,
      extracted: { name1, name2, name1First, name1Last, name2First, name2Last, hasSeparator },
      elementsFound: {
        name1First: !!elements.name1First,
        name1Last: !!elements.name1Last,
        name2First: !!elements.name2First,
        name2Last: !!elements.name2Last,
        nameSeparator: !!elements.nameSeparator,
        weddingNamesGroup: !!elements.weddingNamesGroup
      }
    })

    // SVG-BASED NAME RENDERING SYSTEM
    // Use external decorative SVG file with Cinzel Decorative Bold font
    // when two names with separator ("&" or "and") are detected
    let usedDecorativeSVG = false
    if (hasSeparator && name1First && name2First) {
      console.log('🎨 Two names with separator detected - loading decorative SVG')

      try {
        // Load and populate the external name SVG asynchronously
        const svgContent = await loadAndPopulateNameSVG()
        
        if (svgContent) {
          // Replace hardcoded names with user-provided names
          const modifiedSVG = replaceNamesInSVG(
            svgContent,
            name1First,
            name2First,
            name1Last || '',
            name2Last || ''
          )

          // Inject the modified SVG into the template
          injectNameSVGIntoTemplate(modifiedSVG, elements.weddingNamesGroup)
          usedDecorativeSVG = true

          console.log('✅ Decorative SVG successfully loaded and injected')
          console.log('   Position: transform="translate(270, 950) scale(3)"')
          console.log('   Font: Cinzel Decorative Bold (preserved from external SVG)')
        } else {
          console.error('❌ Failed to load decorative SVG')
          console.error('💡 Check if file exists at: public/svg/weddingStiker/weddingTwoNames/name02.svg')
        }
      } catch (error) {
        console.error('❌ Error in SVG replacement system:', error)
      }
    } else {
      console.log('📝 Single name or no separator detected - SVG rendering skipped')
      console.log('💡 To use decorative SVG, enter two names with "&" or "and" separator')
      console.log('   Example: (Hauwa & Abdullahi)')
      
      // If we are NOT using the decorative SVG, we need to make sure the weddingNamesGroup
      // is reset to its default state (simple text elements) if it was previously replaced
      // However, since we can't easily "reset" to the original template state without reloading,
      // we'll rely on the fact that the text elements might still be there if they weren't overwritten.
      // But wait, injectNameSVGIntoTemplate CLEARS the group.
      // So if the user types brackets (loads SVG) then deletes brackets (simple text),
      // the group is empty! We need to handle this.
      
      // Check if the group has been modified by our injection
      if (elements.weddingNamesGroup && elements.weddingNamesGroup.hasAttribute('data-decorative-svg-loaded')) {
         // Ideally we should reload the template here, but that's expensive.
         // For now, we'll just try to update the text elements if they exist.
         // If they don't exist (because they were cleared), the user might need to reload or we need a way to restore them.
         console.warn('⚠️ Warning: Wedding names group was previously replaced with decorative SVG. Simple text updates might not work until reload.')
      }
    }

    // Update full name elements (backward compatibility for old template elements)
    // SKIP this if we already used the decorative SVG - the names are already set correctly
    if (!usedDecorativeSVG) {
      if (name1) {
        data.name1 = name1
        if (elements.name1Text) {
          elements.name1Text.textContent = data.name1
        }
        // Also update name1First if available (for new template structure)
        if (elements.name1First) {
          elements.name1First.textContent = toTitleCase(name1)
        }
      }
      if (name2) {
        data.name2 = name2
        if (elements.name2Text) {
          elements.name2Text.textContent = data.name2
        }
        // Also update name2First if available (for new template structure)
        if (elements.name2First) {
          elements.name2First.textContent = toTitleCase(name2)
        }
      }
    } else {
      // Just update the data object for return value
      if (name1) data.name1 = name1
      if (name2) data.name2 = name2
    }

    // 4. Extract date with enhanced pattern matching and inject date SVG
    console.log('🔍 Attempting to extract date from description:', description)
    const extractedDate = extractDate(description)
    console.log('🔍 Extracted date result:', extractedDate)
    console.log('🔍 Date element found:', !!elements.dateText)
    console.log('🔍 Date group found:', !!elements.weddingDateGroup)
    if (extractedDate) {
      // extractDate already includes "on" prefix
      data.date = extractedDate
      
      // Try to inject the decorative date SVG
      const svgRoot = elements.weddingNamesGroup?.ownerSVGElement || elements.dateText?.ownerSVGElement
      if (svgRoot) {
        const { injectDateSVG, removeDateSVG } = useDateLibrary()
        try {
          const injected = await injectDateSVG(svgRoot as unknown as SVGSVGElement, extractedDate)
          if (injected) {
            console.log(`📅 Date SVG injected: "${extractedDate}"`)
          } else {
            console.warn('⚠️ Date SVG injection returned false; falling back to plain text')
            // Ensure we don't keep showing a stale decorative date.
            removeDateSVG(svgRoot as unknown as SVGSVGElement)
            if (elements.dateText) {
              elements.dateText.textContent = data.date
              elements.dateText.removeAttribute('display')
              console.log(`📅 Date text fallback: "${data.date}"`)
            }
          }
        } catch (err) {
          console.error('❌ Failed to inject date SVG:', err)
          // Fallback to text update if SVG injection fails
          // Ensure we don't keep showing a stale decorative date.
          const { removeDateSVG } = useDateLibrary()
          removeDateSVG(svgRoot as unknown as SVGSVGElement)
          if (elements.dateText) {
            elements.dateText.textContent = data.date
            elements.dateText.removeAttribute('display')
            console.log(`📅 Date text fallback: "${data.date}"`)
          }
        }
      } else if (elements.dateText) {
        // Fallback to text update if no SVG root
        elements.dateText.textContent = data.date
        elements.dateText.removeAttribute('display')
        console.log(`📅 Date updated: "${data.date}"`)
      } else if (elements.weddingNamesGroup || elements.name1Text) {
        // Only log error if SVG seems to be loaded but element is missing
        console.error('❌ Date element not found in SVG!')
      }
    } else {
      console.log('⚠️ No date extracted from description')
      // Remove any previously-injected decorative date so we don't show stale values.
      const svgRoot = elements.weddingNamesGroup?.ownerSVGElement || elements.dateText?.ownerSVGElement
      if (svgRoot) {
        const { removeDateSVG } = useDateLibrary()
        removeDateSVG(svgRoot as unknown as SVGSVGElement)
      }
      // Ensure fallback date text stays hidden when no date is provided
      if (elements.dateText) {
        elements.dateText.textContent = ''
        elements.dateText.setAttribute('display', 'none')
      }
    }

    // 5. Extract courtesy/family name with enhanced pattern matching
    console.log('🔍 Attempting to extract courtesy from description:', description)
    const extractedCourtesyData = extractCourtesy(description)
    console.log('🔍 Extracted courtesy result:', extractedCourtesyData)
    console.log('🔍 Courtesy element found:', !!elements.courtesyText)
    console.log('🔍 Courtesy element details:', elements.courtesyText ? `id="${elements.courtesyText.id}" content="${elements.courtesyText.textContent}"` : 'null')
    if (extractedCourtesyData) {
      data.courtesy = `${extractedCourtesyData.prefix} ${extractedCourtesyData.text}`
      if (elements.courtesyText) {
        elements.courtesyText.textContent = data.courtesy
        
        // Auto-size courtesy text based on WORD COUNT (not character length)
        // Only reduce font when there are 4 or more words
        // Reduction is subtle and proportional to word count
        const courtesyWords = data.courtesy.trim().split(/\s+/)
        const wordCount = courtesyWords.length
        const baseFontSize = 85 // Default font size
        
        // Calculate font size based on word count
        // 1-3 words: keep base font size (85px)
        // 4 words: reduce by 5px (80px)
        // 5 words: reduce by 8px (77px)
        // 6 words: reduce by 12px (73px)
        // 7+ words: reduce by 15px (70px) - minimum
        let calculatedFontSize = baseFontSize
        if (wordCount >= 4) {
          // Subtle reduction: 5px for 4 words, +3px per additional word, max reduction 15px
          const extraWords = wordCount - 4 // 0 for 4 words, 1 for 5 words, etc.
          const reduction = Math.min(5 + (extraWords * 3), 15)
          calculatedFontSize = baseFontSize - reduction
        }
        
        elements.courtesyText.setAttribute('font-size', String(calculatedFontSize))
        elements.courtesyText.setAttribute('font-family', 'Arial, sans-serif')
        // Keep text visually secondary
        elements.courtesyText.setAttribute('font-weight', 'bold')
        elements.courtesyText.setAttribute('fill', '#333333')
        
        console.log(`🏠 Courtesy updated: "${data.courtesy}" (words: ${wordCount}, fontSize: ${calculatedFontSize}px)`)
      } else if (elements.weddingNamesGroup || elements.name1Text) {
        // Only log error if SVG seems to be loaded but element is missing
        console.error('❌ Courtesy element not found in SVG!')
      }
    } else {
      console.log('⚠️ No courtesy extracted from description')
    }

    return data
  }

  /**
   * Get SVG elements by their IDs
   */
  const getSVGElements = (svgElement: SVGSVGElement | null): WeddingStickerElements => {
    if (!svgElement) {
      return {
        blessingText: null,
        occasionText: null,
        eventTypeText: null,
        ceremonyText: null,
        name1Text: null,
        name2Text: null,
        name1First: null,
        name1Last: null,
        name2First: null,
        name2Last: null,
        nameSeparator: null,
        weddingNamesGroup: null,
        weddingDateGroup: null,
        dateText: null,
        courtesyText: null
      }
    }

    return {
      blessingText: svgElement.querySelector('#blessing-text') as SVGTextElement,
      occasionText: svgElement.querySelector('#occasion-text') as SVGTextElement,
      eventTypeText: svgElement.querySelector('#event-type-text') as SVGTextElement,
      ceremonyText: svgElement.querySelector('#ceremony-text') as SVGTextElement,
      name1Text: svgElement.querySelector('#name1-text') as SVGTextElement,
      name2Text: svgElement.querySelector('#name2-text') as SVGTextElement,
      name1First: svgElement.querySelector('#name1-first') as SVGTextElement,
      name1Last: svgElement.querySelector('#name1-last') as SVGTextElement,
      name2First: svgElement.querySelector('#name2-first') as SVGTextElement,
      name2Last: svgElement.querySelector('#name2-last') as SVGTextElement,
      nameSeparator: svgElement.querySelector('#name-separator') as SVGTextElement,
      weddingNamesGroup: svgElement.querySelector('#wedding-names-group') as SVGGElement,
      weddingDateGroup: svgElement.querySelector('#wedding-date-group') as SVGGElement,
      dateText: svgElement.querySelector('#date-text') as SVGTextElement,
      courtesyText: svgElement.querySelector('#courtesy-text') as SVGTextElement
    }
  }

  return {
    updateStickerText,
    getSVGElements,
    extractFirstWord,
    calculateEventTypeFontFamily,
    hasCongratulations,
    extractEventType,
    extractNamesFromNewline,
    extractNamesFromBrackets,
    extractNames,
    extractDate,
    extractDateAfterBrackets,
    extractCourtesy,
    extractCourtesyAfterDate,
    isWeddingRelated
  }
}










