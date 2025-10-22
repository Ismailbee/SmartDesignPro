/**
 * Wedding Sticker Template Real-time Text Updater
 * 
 * This composable provides functionality to update SVG text elements
 * in real-time based on user input description.
 */

export interface WeddingStickerElements {
  blessingText: SVGTextElement | null
  occasionText: SVGTextElement | null
  eventTypeText: SVGTextElement | null
  ceremonyText: SVGTextElement | null
  name1Text: SVGTextElement | null
  name2Text: SVGTextElement | null
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
   * Examples: "(Sarah Ahmed)", "[John Mary]", "(Fatima and Ibrahim)"
   */
  const extractNamesFromBrackets = (description: string): { name1: string | null; name2: string | null } => {
    // Match content inside () or []
    const bracketPattern = /[\(\[]([^\)\]]+)[\)\]]/
    const match = description.match(bracketPattern)

    if (match && match[1]) {
      const namesText = match[1].trim()

      // Try to split by "and" or "&"
      const andPattern = /([A-Za-z]+)\s+(?:and|&)\s+([A-Za-z]+)/i
      const andMatch = namesText.match(andPattern)

      if (andMatch) {
        return {
          name1: andMatch[1].toUpperCase(),
          name2: andMatch[2].toUpperCase()
        }
      }

      // Try to split by space (two words)
      const words = namesText.split(/\s+/).filter(w => w.length > 0)
      if (words.length >= 2) {
        return {
          name1: words[0].toUpperCase(),
          name2: words[1].toUpperCase()
        }
      }
    }

    return { name1: null, name2: null }
  }

  /**
   * Extract names from description
   * ONLY extracts names from content inside brackets () or []
   * Newline-based extraction is DISABLED
   * Examples: "(Sarah Ahmed)", "[John Mary]", "(Fatima and Ibrahim)"
   */
  const extractNames = (description: string): { name1: string | null; name2: string | null } => {
    // ONLY use bracket-based extraction
    const bracketNames = extractNamesFromBrackets(description)
    if (bracketNames.name1 && bracketNames.name2) {
      return bracketNames
    }

    // Return null if no brackets found
    return { name1: null, name2: null }
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
    // Pattern 1: "courtesy:" followed by ANY text (case-insensitive)
    // Captures everything after "courtesy:" until end of line or period/comma
    const courtesyPattern = /courtesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const courtesyMatch = description.match(courtesyPattern)

    if (courtesyMatch && courtesyMatch[1]) {
      return courtesyMatch[1].trim()
    }

    // Pattern 2: "coutesy:" (common misspelling) followed by ANY text
    const misspelledPattern = /coutesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const misspelledMatch = description.match(misspelledPattern)

    if (misspelledMatch && misspelledMatch[1]) {
      return misspelledMatch[1].trim()
    }

    // Pattern 3: "cut-cee:" followed by ANY text (case-insensitive)
    const cutCeePattern = /cut-cee:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const cutCeeMatch = description.match(cutCeePattern)

    if (cutCeeMatch && cutCeeMatch[1]) {
      return cutCeeMatch[1].trim()
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

    // 3. Extract names (ONLY from brackets)
    const { name1, name2 } = extractNames(description)
    if (name1) {
      data.name1 = name1
      if (elements.name1Text) {
        elements.name1Text.textContent = data.name1
        console.log(`👤 Name 1 updated: "${data.name1}"`)
      }
    }
    if (name2) {
      data.name2 = name2
      if (elements.name2Text) {
        elements.name2Text.textContent = data.name2
        console.log(`👤 Name 2 updated: "${data.name2}"`)
      }
    }

    // Apply font change if either name exceeds 7-8 characters
    if (name1 || name2) {
      const name1Length = name1 ? name1.length : 0
      const name2Length = name2 ? name2.length : 0

      // Check if either name is longer than 7 characters
      if (name1Length > 7 || name2Length > 7) {
        // Apply AlternateGothic2 BT font to BOTH name elements
        if (elements.name1Text) {
          elements.name1Text.setAttribute('font-family', 'AlternateGothic2 BT')
          console.log(`🔤 Name 1 font changed to AlternateGothic2 BT (${name1Length} chars)`)
        }
        if (elements.name2Text) {
          elements.name2Text.setAttribute('font-family', 'AlternateGothic2 BT')
          console.log(`🔤 Name 2 font changed to AlternateGothic2 BT (${name2Length} chars)`)
        }
      } else {
        // Reset to original font if both names are 7 characters or less
        if (elements.name1Text) {
          elements.name1Text.removeAttribute('font-family')
          console.log(`🔤 Name 1 font reset to original (${name1Length} chars)`)
        }
        if (elements.name2Text) {
          elements.name2Text.removeAttribute('font-family')
          console.log(`🔤 Name 2 font reset to original (${name2Length} chars)`)
        }
      }
    }

    // 4. Extract date with enhanced pattern matching
    const extractedDate = extractDate(description)
    if (extractedDate) {
      // extractDate already includes "on" prefix
      data.date = extractedDate
      if (elements.dateText) {
        elements.dateText.textContent = data.date
        console.log(`📅 Date updated: "${data.date}"`)
      }
    }

    // 5. Extract courtesy/family name with enhanced pattern matching
    const extractedCourtesy = extractCourtesy(description)
    if (extractedCourtesy) {
      data.courtesy = `CUT-CEE: ${extractedCourtesy}`
      if (elements.courtesyText) {
        elements.courtesyText.textContent = data.courtesy
        console.log(`🏠 Courtesy updated: "${data.courtesy}"`)
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

