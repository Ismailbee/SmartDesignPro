/**
 * Wedding Sticker Template Real-time Text Updater
 *
 * This composable provides functionality to update SVG text elements
 * in real-time based on user input description.
 *
 * Note: For SVG graphic replacement (e.g., Nikkah graphics), see useSVGTextReplacement.ts
 * which handles replacing text elements with SVG images based on keywords.
 */

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

    if (match && match[1]) {
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
   * When user presses Enter, extract names from the line after the newline
   * Examples:
   *   "Congratulations on your wedding\nSarah Ahmed"
   *   "Congratulations on your wedding ceremony\nJohn and Mary"
   */
  const extractNamesFromNewline = (description: string): { name1: string | null; name2: string | null } => {
    // Check if there's a newline character
    if (!description.includes('\n')) {
      return { name1: null, name2: null }
    }

    // Split by newline and get the line after the first newline
    const lines = description.split('\n')
    if (lines.length < 2) {
      return { name1: null, name2: null }
    }

    // Get the second line (first line after newline)
    const nameLine = lines[1].trim()
    if (!nameLine) {
      return { name1: null, name2: null }
    }

    // Try to split by "and" or "&"
    const andPattern = /([A-Za-z]+)\s+(?:and|&)\s+([A-Za-z]+)/i
    const andMatch = nameLine.match(andPattern)

    if (andMatch) {
      return {
        name1: andMatch[1].toUpperCase(),
        name2: andMatch[2].toUpperCase()
      }
    }

    // Try to split by space (two words)
    const words = nameLine.split(/\s+/).filter(w => w.length > 0)
    if (words.length >= 2) {
      return {
        name1: words[0].toUpperCase(),
        name2: words[1].toUpperCase()
      }
    } else if (words.length === 1) {
      // Single name on the line
      return {
        name1: words[0].toUpperCase(),
        name2: null
      }
    }

    return { name1: null, name2: null }
  }

  /**
   * Extract names from brackets () or []
   * Enhanced to support full names with multi-word surnames
   *
   * Name Formatting Rules:
   * - First names: Title Case (first letter uppercase, rest lowercase)
   * - Surnames: UPPERCASE (all letters uppercase)
   *
   * Parsing Logic:
   * - First word = First Name (Title Case)
   * - Everything after first word = Surname (UPPERCASE, can be multi-word)
   * - Ampersand (&) or "and" separates the two people
   *
   * Examples:
   * - "(Suleiman Abdullahi & Ramatu Yunusa)" → first1: "Suleiman", last1: "ABDULLAHI", first2: "Ramatu", last2: "YUNUSA"
   * - "(John Paul Smith & Mary Jane Doe)" → first1: "John", last1: "PAUL SMITH", first2: "Mary", last2: "JANE DOE"
   * - "(Sarah Ahmed and Tom Lee)" → first1: "Sarah", last1: "AHMED", first2: "Tom", last2: "LEE"
   */
  const extractNamesFromBrackets = (description: string): {
    name1: string | null;
    name2: string | null;
    name1First: string | null;
    name1Last: string | null;
    name2First: string | null;
    name2Last: string | null;
    hasSeparator: boolean;  // NEW: Indicates if "&" or "and" was detected
  } => {
    // Match content inside () or []
    const bracketPattern = /[\(\[]([^\)\]]+)[\)\]]/
    const match = description.match(bracketPattern)

    if (match && match[1]) {
      const namesText = match[1].trim()

      // Try to split by "and" or "&" to get couples
      const couplePattern = /([^&]+)\s*(?:&|and)\s*([^&]+)/i
      const coupleMatch = namesText.match(couplePattern)

      if (coupleMatch) {
        // We have two people with a separator ("&" or "and")
        const person1 = coupleMatch[1].trim()
        const person2 = coupleMatch[2].trim()

        // Parse person 1: first word = first name (Title Case), rest = surname (UPPERCASE)
        const person1Parts = person1.split(/\s+/).filter(w => w.length > 0)
        const first1 = person1Parts.length > 0 ? toTitleCase(person1Parts[0]) : null
        const last1 = person1Parts.length > 1
          ? person1Parts.slice(1).join(' ').toUpperCase()
          : null

        // Parse person 2: first word = first name (Title Case), rest = surname (UPPERCASE)
        const person2Parts = person2.split(/\s+/).filter(w => w.length > 0)
        const first2 = person2Parts.length > 0 ? toTitleCase(person2Parts[0]) : null
        const last2 = person2Parts.length > 1
          ? person2Parts.slice(1).join(' ').toUpperCase()
          : null

        // For backward compatibility, combine first + last for name1 and name2
        const fullName1 = [first1, last1].filter(Boolean).join(' ')
        const fullName2 = [first2, last2].filter(Boolean).join(' ')

        return {
          name1: fullName1 || null,
          name2: fullName2 || null,
          name1First: first1,
          name1Last: last1,
          name2First: first2,
          name2Last: last2,
          hasSeparator: true  // Separator was detected
        }
      }

      // Single person or simple format (no separator)
      const words = namesText.split(/\s+/).filter(w => w.length > 0)
      if (words.length >= 2) {
        // Multiple words - first is first name (Title Case), rest is surname (UPPERCASE)
        const firstName = toTitleCase(words[0])
        const lastName = words.slice(1).join(' ').toUpperCase()
        const fullName = [firstName, lastName].join(' ')

        return {
          name1: fullName,
          name2: null,
          name1First: firstName,
          name1Last: lastName,
          name2First: null,
          name2Last: null,
          hasSeparator: false  // No separator detected
        }
      } else if (words.length === 1) {
        // Single word - treat as first name only (Title Case)
        const firstName = toTitleCase(words[0])
        return {
          name1: firstName,
          name2: null,
          name1First: firstName,
          name1Last: null,
          name2First: null,
          name2Last: null,
          hasSeparator: false  // No separator detected
        }
      }
    }

    return {
      name1: null,
      name2: null,
      name1First: null,
      name1Last: null,
      name2First: null,
      name2Last: null,
      hasSeparator: false  // No separator detected
    }
  }

  /**
   * Extract names from description
   * ONLY extracts names from content inside brackets () or []
   * Returns both full names and separated first/last names
   * Examples: "(Sarah Ahmed)", "[John Mary]", "(Fatima and Ibrahim)", "(Suleiman Abdullahi & Hauwa Yunusa)"
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
    // ONLY use bracket-based extraction
    const bracketNames = extractNamesFromBrackets(description)
    if (bracketNames.name1First || bracketNames.name2First) {
      return bracketNames
    }

    // Return null if no brackets found
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
    // Pattern 1: "on [date]" - preserve the "on" prefix
    const onDatePattern = /\bon\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*\d{4})/i
    const onDateMatch = description.match(onDatePattern)

    if (onDateMatch && onDateMatch[1]) {
      return `on ${onDateMatch[1]}`
    }

    // Pattern 2: Date with ordinal suffix (6th March, 2025)
    const ordinalDatePattern = /(\d{1,2}(?:st|nd|rd|th)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,.]?\s*\d{4})/i
    const ordinalMatch = description.match(ordinalDatePattern)

    if (ordinalMatch && ordinalMatch[1]) {
      return `on ${ordinalMatch[1]}`
    }

    // Pattern 3: Month Day, Year (March 6, 2025)
    const monthDayYearPattern = /((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}[,.]?\s*\d{4})/i
    const monthDayMatch = description.match(monthDayYearPattern)

    if (monthDayMatch && monthDayMatch[1]) {
      return `on ${monthDayMatch[1]}`
    }

    // Pattern 4: Numeric date (6/3/2025, 6-3-2025)
    const numericDatePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/
    const numericMatch = description.match(numericDatePattern)

    if (numericMatch && numericMatch[1]) {
      return `on ${numericMatch[1]}`
    }

    // Pattern 5: Date without year (6th March)
    const noYearPattern = /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/i
    const noYearMatch = description.match(noYearPattern)

    if (noYearMatch && noYearMatch[1]) {
      return `on ${noYearMatch[1]}`
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
   * Returns the extracted text as-is (preserves original capitalization and spacing)
   */
  const extractCourtesy = (description: string): string | null => {
    // Helper function to capitalize first letter of each word
    const capitalizeWords = (text: string): string => {
      return text.split(' ').map(word => {
        if (word.length === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }).join(' ')
    }

    // Pattern 1: "courtesy:" followed by ANY text (case-insensitive)
    // Captures everything after "courtesy:" until end of line or period/comma
    const courtesyPattern = /courtesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const courtesyMatch = description.match(courtesyPattern)

    if (courtesyMatch && courtesyMatch[1]) {
      const courtesyText = courtesyMatch[1].trim()
      // Capitalize first letter of each word
      return capitalizeWords(courtesyText)
    }

    // Pattern 2: "coutesy:" (common misspelling) followed by ANY text
    const misspelledPattern = /coutesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const misspelledMatch = description.match(misspelledPattern)

    if (misspelledMatch && misspelledMatch[1]) {
      const courtesyText = misspelledMatch[1].trim()
      // Capitalize first letter of each word
      return capitalizeWords(courtesyText)
    }

    // Pattern 3: "cut-cee:" followed by ANY text (case-insensitive)
    const cutCeePattern = /cut-cee:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const cutCeeMatch = description.match(cutCeePattern)

    if (cutCeeMatch && cutCeeMatch[1]) {
      const courtesyText = cutCeeMatch[1].trim()
      // Capitalize first letter of each word
      return capitalizeWords(courtesyText)
    }

    return null
  }

  /**
   * Extract courtesy/family name after date (legacy support)
   * The text after the date is treated as courtesy name
   * Examples: "(Sarah Ahmed) 5th March 2025 Rahman Family"
   */
  const extractCourtesyAfterDate = (description: string): string | null => {
    return extractCourtesy(description)
  }

  /**
   * Check if description contains wedding-related keywords
   */
  const isWeddingRelated = (description: string): boolean => {
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
    const svgPath = '/svg/weddingStiker/weddingTwoNames/name02.svg'

    try {
      console.log('🔄 Attempting to load decorative SVG from:', svgPath)

      const response = await fetch(svgPath)

      console.log('📡 Fetch response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })

      if (!response.ok) {
        console.error('❌ Failed to load name SVG:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
        console.error('💡 Tip: Check if file exists at public/svg/weddingStiker/weddingTwoNames/name02.svg')
        return null
      }

      const svgContent = await response.text()
      console.log('✅ Successfully loaded name SVG file')
      console.log('   Content length:', svgContent.length, 'characters')
      console.log('   First 100 chars:', svgContent.substring(0, 100))

      return svgContent
    } catch (error) {
      console.error('❌ Error loading name SVG:', error)
      console.error('   Path attempted:', svgPath)
      console.error('💡 Possible causes:')
      console.error('   - File does not exist at public/svg/weddingStiker/weddingTwoNames/name02.svg')
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
  const replaceNamesInSVG = (svgContent: string, name1: string, name2: string): string => {
    // Apply Title Case formatting to names
    const formattedName1 = toTitleCase(name1)
    const formattedName2 = toTitleCase(name2)

    console.log('🔄 Replacing names in SVG:', {
      original: { name1: 'Muhammad', name2: 'Hauwawu' },
      replacement: { name1: formattedName1, name2: formattedName2 }
    })

    // Adjust x and y positions based on character length
    const name1Length = formattedName1.length
    const name2Length = formattedName2.length
    
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
    
    // First name position - adjust left if very long name, or right if 7 + 9+ condition, or right if 4 + 7+ condition, or right if 6-8 + 10+ condition, or right if 6 + 9+ condition, or left if 6 + 7 condition
    const name1XPosition = String(-30 - leftShift + name1RightShift + name1ExtraRightShift + name1AndSeparatorExtraShift + name1RightShiftFor6And7Plus + name1LeftShiftFor6And7)
    const name1YPosition = '90'  // Moved down by 10 units (from 80 to 90)

    // Determine separator x position based on conditions:
    // - If first name is 4 letters AND second name is 7+ letters: x="155"
    // - If first name is 3 letters AND second name is 4+ letters: x="155" (same as 4 + 7)
    // - If first name is 3 letters AND second name is 8+ letters: x="155"
    // - If first name is 5-6 letters AND second name is 7 letters: x="260" (same as 6 + 8+)
    // - Otherwise if shift triggered: x="260"
    // - Default (no shift): x="-50.3"
    let separatorXPosition = '-50.3'  // Default position
    if (shouldShiftPositions) {
      if ((name1Length === 4 && name2Length >= 7) || (name1Length === 3 && name2Length >= 4)) {
        separatorXPosition = String(155 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor6And8 + separatorRightShiftFor6And7)  // 4-letter first name with 7+ second name, or 3-letter first name with 4+
      } else if ((name1Length >= 5 && name1Length <= 6 && name2Length === 7)) {
        separatorXPosition = String(260 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor6And8 + separatorRightShiftFor6And7)  // 5-6 letter first name with 7-letter second name (same as 6 + 8+)
      } else {
        separatorXPosition = String(260 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift + separatorExtraShiftFor6And8 + separatorRightShiftFor6And7)  // Other shift conditions
      }
    } else {
      separatorXPosition = String(-50.3 - leftShift + separatorAndName2RightShift + separatorExtraRightShift + name1AndSeparatorExtraShift)  // Apply left shift to default position too
    }
    
    const separatorYPosition = shouldShiftPositions ? '90' : '160.4'  // Moved down by 10 units (from 80 to 90, from 150.4 to 160.4)
    
    // Additional shift for second name if first name is 4-6 letters AND second name is 8+ letters
    const shouldShiftName2Left = name1Length >= 4 && name1Length <= 6 && name2Length >= 8
    const name2ExtraShift = shouldShiftName2Left ? 10 : 0  // Extra 10 units left for second name
    
    const name2XPosition = shouldShiftPositions ? String(-50.3 - leftShift - name2ExtraShift + separatorAndName2RightShift) : String(30.23 - leftShift - name2ExtraShift + separatorAndName2RightShift)
    const name2YPosition = '158'  // Moved down by 10 units (from 148 to 158)

    // Font size adjustment logic:
    // - If first name is 4 letters AND second name is 4-5 letters: increase font size by 15 points (85px)
    // - If both names are exactly 4 letters: increase font size by 15 points (85px)
    // - If either name has 8+ letters: reduce font size by 3 points (67px)
    // - Otherwise: keep base font size (70px)
    const bothNames4Letters = name1Length === 4 && name2Length === 4
    const name1Is4AndName2Is4to5 = name1Length === 4 && name2Length >= 4 && name2Length <= 5
    const hasLongName = name1Length >= 8 || name2Length >= 8
    const baseFontSize = 70
    const increasedFontSize = baseFontSize + 15  // 85px
    const reducedFontSize = baseFontSize - 3  // 67px
    
    let fontSize = baseFontSize
    if (name1Is4AndName2Is4to5) {
      fontSize = increasedFontSize
    } else if (hasLongName) {
      fontSize = reducedFontSize
    }

    console.log(`📏 First name length: ${name1Length} characters, Second name length: ${name2Length} characters`)
    console.log(`↔️ Very long name (10+): ${hasVeryLongName ? 'YES - All elements shifted left by 30 units' : 'NO'}`)
    console.log(`↔️ Name1 right shift (7 + 9+): ${shouldShiftName1Right ? 'YES - First name shifted right by 10 units' : 'NO'}`)
    console.log(`↔️ Name1 extra right shift (4 + 7+): ${shouldShiftName1RightAfterSeparator ? 'YES - First name shifted right by 15 units after & shift' : 'NO'}`)
    console.log(`↔️ Name1 & Separator right shift (6-8 + 10+): ${shouldShiftName1AndSeparatorRight ? 'YES - First name and & shifted right by 35 units' : 'NO'}`)
    console.log(`↔️ Name1 right shift (6 + 9+): ${shouldShiftName1RightFor6And7Plus ? 'YES - First name shifted right by 20 units' : 'NO'}`)
    console.log(`↔️ Special shift (6 + 7 only): ${shouldShiftFor6And7 ? 'YES - First name shifted left by 15 units, & shifted right by 20 units' : 'NO'}`)
    console.log(`↔️ Separator right shift (6 + 8 only): ${shouldShiftSeparatorFor6And8 ? 'YES - & shifted right by 15 units, first name returns to default' : 'NO'}`)
    console.log(`↔️ Name2 extra shift (4-6 + 8+): ${shouldShiftName2Left ? 'YES - Second name shifted left by extra 10 units' : 'NO'}`)
    console.log(`↔️ Separator & Name2 right shift (7+ & 4-5 OR 10+ & 5-7): ${shouldShiftSeparatorAndName2Right ? 'YES - & and second name shifted right by 90 units' : 'NO'}`)
    console.log(`↔️ Separator right shift (6 letters starting with M & 8+): ${shouldShiftSeparatorForM ? 'YES - & shifted right by 30 units' : 'NO'}`)
    console.log(`📍 Position shift: ${shouldShiftPositions ? `YES - & moves to x=${separatorXPosition} y=80, name2 x moves to & x-position` : 'NO - using default positions'}`)
    console.log(`📍 Setting position for name1-first: x=${name1XPosition}, y=${name1YPosition}`)
    console.log(`📍 Setting position for separator: x=${separatorXPosition}, y=${separatorYPosition}`)
    console.log(`📍 Setting position for name2-first: x=${name2XPosition}, y=${name2YPosition}`)
    console.log(`📐 Font size adjustment: ${name1Is4AndName2Is4to5 ? `Increased to ${fontSize}px (first name is 4 letters and second name is 4-5 letters)` : hasLongName ? `Reduced to ${fontSize}px (8+ letters detected)` : `Keeping ${fontSize}px (base size)`}`)

    // Replace the hardcoded names in the SVG
    // Line 9: <text id="name1-first" x="-20" y="80" class="fil0 fnt0">Muhammad</text>
    // Line 10: <text id="name2-first" x="40.23" y="148" class="fil0 fnt0">Hauwawu</text>
    // Line 11: <text id="name-separator" x="-40.3" y="160.4" class="fil1 fnt0">&amp;</text>
    let modifiedSVG = svgContent
      .replace(/>Muhammad</g, `>${formattedName1}<`)
      .replace(/>Hauwawu</g, `>${formattedName2}<`)
      // Adjust x position for name1-first
      .replace(
        /(<text id="name1-first" x=")[^"]*(")/g,
        `$1${name1XPosition}$2`
      )
      // Adjust x position for name2-first
      .replace(
        /(<text id="name2-first" x=")[^"]*(")/g,
        `$1${name2XPosition}$2`
      )
      // Adjust y position for name2-first
      .replace(
        /(<text id="name2-first" x="[^"]*" y=")[^"]*(")/g,
        `$1${name2YPosition}$2`
      )
      // Adjust x position for separator
      .replace(
        /(<text id="name-separator" x=")[^"]*(")/g,
        `$1${separatorXPosition}$2`
      )
      // Adjust y position for separator (this is the key change)
      .replace(
        /(<text id="name-separator" x="[^"]*" y=")[^"]*(")/g,
        `$1${separatorYPosition}$2`
      )

    // Apply font size adjustment if needed (both for increase and reduction)
    // Modify the .fnt0 style definition to use the calculated font size
    if (name1Is4AndName2Is4to5 || hasLongName) {
      // More flexible regex to match various whitespace patterns
      const beforeReplace = modifiedSVG.match(/font-size:\s*\d+px/g)
      console.log(`🔍 Before font-size replacement:`, beforeReplace)
      
      modifiedSVG = modifiedSVG.replace(
        /font-size:\s*70px/g,
        `font-size: ${fontSize}px`
      )
      
      
      // Also add letter-spacing for tighter text when font is reduced (only for long names)
      if (hasLongName) {
        modifiedSVG = modifiedSVG.replace(
          /font-family: 'Cinzel Decorative', serif; }/g,
          `font-family: 'Cinzel Decorative', serif; letter-spacing: -1px; }`
        )
      }

      const afterReplace = modifiedSVG.match(/font-size:\s*\d+px/g)
      console.log(`✏️ Font size adjusted to ${fontSize}px for all name elements (name1, "&", name2)${hasLongName ? ' with letter-spacing: -1px' : ''}`)
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

      // STEP 1: Inject the style definition directly into the root SVG
      // This preserves the Cinzel Decorative Bold font and color classes
      const loadedStyle = svgDoc.querySelector('style')
      if (loadedStyle) {
        // Remove existing style if present, so we can update it with new font size
        const existingStyle = rootSVG.querySelector('style#cinzel-decorative-style')
        if (existingStyle) {
          existingStyle.remove()
          console.log('🔄 Removed existing style to update with new font size')
        }
        
        // Import and append the style element directly to root SVG
        const importedStyle = document.importNode(loadedStyle, true) as Element
        importedStyle.id = 'cinzel-decorative-style' // Add ID to track it
        rootSVG.insertBefore(importedStyle, rootSVG.firstChild)
        console.log('✅ Style definition (Cinzel Decorative Bold) injected into root SVG')
      } else {
        console.warn('⚠️ No <style> section found in loaded SVG - font may not render correctly')
      }

      // STEP 2: Find the main group element containing the names and decorative elements
      // In name02.svg, this is the outer <g> element with transform
      const svgRoot = svgDoc.documentElement
      const mainGroup = svgRoot.querySelector('g[transform]')
      if (!mainGroup) {
        console.error('❌ Could not find main group in loaded SVG')
        console.error('   Looking for <g> element with transform attribute')
        return
      }
      console.log('✅ Found main group with transform:', mainGroup.getAttribute('transform'))

      // STEP 3: Clear existing content in the target element
      // Remove all old text-based name elements
      while (targetElement.firstChild) {
        targetElement.removeChild(targetElement.firstChild)
      }

      // STEP 4: Clone and import all child nodes from the loaded SVG group
      // This includes the text elements AND the decorative path
      // IMPORTANT: document.importNode(child, true) preserves ALL attributes including x, y coordinates
      const children = Array.from(mainGroup.childNodes)
      children.forEach(child => {
        const importedNode = document.importNode(child, true)
        targetElement.appendChild(importedNode)
      })

      // STEP 5: Mark the group with a data attribute to indicate decorative SVG is loaded
      // This prevents the old text-based rendering from interfering
      targetElement.setAttribute('data-decorative-svg-loaded', 'true')

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
      console.log('   Font definition preserved: Cinzel Decorative')
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
  const updateStickerText = (description: string, elements: WeddingStickerElements): WeddingStickerData => {
    const data: WeddingStickerData = {
      blessing: 'Alhamdulillahi',
      occasion: 'ON YOUR',
      eventType: 'WEDDING',
      ceremony: 'CEREMONY',
      name1: 'HANNATU',
      name2: 'HARUNA',
      date: 'on 7th March, 2025',
      courtesy: 'CUT-CEE: Maijama family'
    }

    if (!description || description.trim() === '') {
      return data
    }

    // 1. Extract first word as blessing text
    // The first word typed replaces the blessing text automatically
    const firstWord = extractFirstWord(description)
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
      data.occasion = 'ON YOUR'
      data.eventType = eventTypeData.eventType
      data.ceremony = eventTypeData.ceremony || 'CEREMONY'

      if (elements.occasionText) {
        elements.occasionText.textContent = data.occasion
      }
      if (elements.eventTypeText) {
        elements.eventTypeText.textContent = data.eventType

        // Apply alternative font family if event type is 9+ characters
        const fontFamily = calculateEventTypeFontFamily(data.eventType)
        if (fontFamily) {
          // Event type has 9+ characters - apply AlternateGothic2 BT to event type
          elements.eventTypeText.setAttribute('font-family', fontFamily)
          console.log(`🎪 Event Type updated: "${data.eventType}" with font-family: ${fontFamily}`)

          // Also apply "Great Day Personal Use" font to blessing text
          if (elements.blessingText && data.blessing) {
            elements.blessingText.setAttribute('font-family', 'Great Day Personal Use')
            console.log(`✨ Blessing updated: "${data.blessing}" with font-family: Great Day Personal Use`)
          }
        } else {
          // Event type has ≤8 characters - use original fonts for both
          elements.eventTypeText.removeAttribute('font-family')
          console.log(`🎪 Event Type updated: "${data.eventType}" (original font)`)

          // Remove font-family from blessing text to use original SVG font
          if (elements.blessingText && data.blessing) {
            elements.blessingText.removeAttribute('font-family')
            console.log(`✨ Blessing updated: "${data.blessing}" (original font)`)
          }
        }
      }

      // Handle ceremony text visibility
      if (elements.ceremonyText) {
        if (eventTypeData.hideCeremony) {
          // Hide ceremony text when word after "wedding" is not a recognized ceremony type
          elements.ceremonyText.setAttribute('display', 'none')
          console.log(`🚫 Ceremony text hidden (word after "wedding" is not a recognized ceremony type)`)
        } else {
          // Show ceremony text and update content
          elements.ceremonyText.removeAttribute('display')
          elements.ceremonyText.textContent = data.ceremony
          console.log(`✅ Ceremony text shown: "${data.ceremony}"`)
        }
      }
    } else {
      // No event type pattern found - reset to defaults and ensure ceremony is visible
      if (elements.occasionText) {
        elements.occasionText.textContent = data.occasion
      }
      if (elements.eventTypeText) {
        elements.eventTypeText.textContent = data.eventType
        elements.eventTypeText.removeAttribute('font-family')
      }
      if (elements.ceremonyText) {
        // Reset ceremony text to visible with default content
        elements.ceremonyText.removeAttribute('display')
        elements.ceremonyText.textContent = data.ceremony
        console.log(`🔄 Reset ceremony text to default: "${data.ceremony}"`)
      }
      // Reset blessing font to original
      if (elements.blessingText && data.blessing) {
        elements.blessingText.removeAttribute('font-family')
      }
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
    if (hasSeparator && name1First && name2First) {
      console.log('🎨 Two names with separator detected - loading decorative SVG')

      // Load and populate the external name SVG asynchronously
      loadAndPopulateNameSVG()
        .then(svgContent => {
          if (svgContent) {
            // Replace hardcoded names with user-provided names
            const modifiedSVG = replaceNamesInSVG(svgContent, name1First, name2First)

            // Inject the modified SVG into the template
            injectNameSVGIntoTemplate(modifiedSVG, elements.weddingNamesGroup)

            console.log('✅ Decorative SVG successfully loaded and injected')
            console.log('   Position: transform="translate(270, 950) scale(3)"')
            console.log('   Font: Cinzel Decorative Bold (preserved from external SVG)')
          } else {
            console.error('❌ Failed to load decorative SVG')
            console.error('💡 Check if file exists at: public/svg/weddingStiker/weddingTwoNames/name02.svg')
          }
        })
        .catch(error => {
          console.error('❌ Error in SVG replacement system:', error)
        })
    } else {
      console.log('📝 Single name or no separator detected - SVG rendering skipped')
      console.log('💡 To use decorative SVG, enter two names with "&" or "and" separator')
      console.log('   Example: (Hauwa & Abdullahi)')
    }

    // Update full name elements (backward compatibility for old template elements)
    if (name1) {
      data.name1 = name1
      if (elements.name1Text) {
        elements.name1Text.textContent = data.name1
      }
    }
    if (name2) {
      data.name2 = name2
      if (elements.name2Text) {
        elements.name2Text.textContent = data.name2
      }
    }

    // 4. Extract date with enhanced pattern matching
    console.log('🔍 Attempting to extract date from description:', description)
    const extractedDate = extractDate(description)
    console.log('🔍 Extracted date result:', extractedDate)
    console.log('🔍 Date element found:', elements.dateText)
    if (extractedDate) {
      // extractDate already includes "on" prefix
      data.date = extractedDate
      if (elements.dateText) {
        elements.dateText.textContent = data.date
        console.log(`📅 Date updated: "${data.date}"`)
      } else {
        console.error('❌ Date element not found in SVG!')
      }
    } else {
      console.log('⚠️ No date extracted from description')
    }

    // 5. Extract courtesy/family name with enhanced pattern matching
    const extractedCourtesy = extractCourtesy(description)
    if (extractedCourtesy) {
      data.courtesy = `CUT-CEE: ${extractedCourtesy}`
      if (elements.courtesyText) {
        elements.courtesyText.textContent = data.courtesy
        
        // Check if courtesy text is long and adjust font accordingly
        const courtesyLength = data.courtesy.length
        if (courtesyLength > 25) {
          // For long text like "CUT-CEE: The Family Abdulrahman"
          elements.courtesyText.setAttribute('font-size', '75')
          elements.courtesyText.setAttribute('font-family', 'Arial, sans-serif')
        } else {
          // Default font for shorter text
          elements.courtesyText.setAttribute('font-size', '100')
          elements.courtesyText.setAttribute('font-family', 'sans-serif')
        }
        
        console.log(`🏠 Courtesy updated: "${data.courtesy}" (length: ${courtesyLength})`)
      }
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










