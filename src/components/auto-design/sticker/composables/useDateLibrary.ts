/**
 * Date Library System
 * Injects decorative date SVG into the wedding sticker design
 * Converts user date format (7th January, 2023) to abbreviated format (7th Jan., 2023)
 */

// Month abbreviation mapping
const MONTH_ABBREVIATIONS: Record<string, string> = {
  'january': 'JAN',
  'february': 'FEB',
  'march': 'MAR',
  'april': 'APR',
  'may': 'MAY',
  'june': 'JUN',
  'july': 'JUL',
  'august': 'AUG',
  'september': 'SEP',
  'october': 'OCT',
  'november': 'NOV',
  'december': 'DEC'
}

// Ordinal suffix mapping
const ORDINAL_SUFFIXES: Record<number, string> = {
  1: 'ST',
  2: 'ND',
  3: 'RD',
  21: 'ST',
  22: 'ND',
  23: 'RD',
  31: 'ST'
}

export interface ParsedDate {
  day: string        // e.g., "7"
  ordinal: string    // e.g., "TH"
  month: string      // e.g., "JAN"
  year: string       // e.g., "2023"
}

/**
 * Get the ordinal suffix for a day number
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'TH'
  }
  return ORDINAL_SUFFIXES[day] || 'TH'
}

/**
 * Parse user date input to structured format
 * Input: "on 7th January, 2023" or "7th January, 2023" or "January 7, 2023"
 * Output: { day: "7", ordinal: "TH", month: "JAN", year: "2023" }
 */
export function parseUserDate(dateStr: string): ParsedDate | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null
  }

  // Clean the input
  let cleaned = dateStr.trim().toLowerCase()
  
  // Remove "on " prefix if present
  cleaned = cleaned.replace(/^on\s+/i, '')
  
  // Try different date patterns
  
  // Pattern 1: "7th January, 2023" or "7th January 2023"
  const pattern1 = /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)[,.]?\s*(\d{4})/i
  const match1 = cleaned.match(pattern1)
  if (match1) {
    const day = parseInt(match1[1], 10)
    const monthFull = match1[2].toLowerCase()
    const year = match1[3]
    const monthAbbr = MONTH_ABBREVIATIONS[monthFull]
    
    if (monthAbbr) {
      return {
        day: String(day),
        ordinal: getOrdinalSuffix(day),
        month: monthAbbr,
        year: year
      }
    }
  }
  
  // Pattern 2: "January 7, 2023" or "January 7 2023"
  const pattern2 = /([a-z]+)\s+(\d{1,2})[,.]?\s*(\d{4})/i
  const match2 = cleaned.match(pattern2)
  if (match2) {
    const monthFull = match2[1].toLowerCase()
    const day = parseInt(match2[2], 10)
    const year = match2[3]
    const monthAbbr = MONTH_ABBREVIATIONS[monthFull]
    
    if (monthAbbr) {
      return {
        day: String(day),
        ordinal: getOrdinalSuffix(day),
        month: monthAbbr,
        year: year
      }
    }
  }
  
  // Pattern 3: Numeric format "7/1/2023" or "7-1-2023"
  const pattern3 = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
  const match3 = cleaned.match(pattern3)
  if (match3) {
    const day = parseInt(match3[1], 10)
    const monthNum = parseInt(match3[2], 10)
    const year = match3[3]
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    
    if (monthNum >= 1 && monthNum <= 12) {
      return {
        day: String(day),
        ordinal: getOrdinalSuffix(day),
        month: months[monthNum - 1],
        year: year
      }
    }
  }
  
  return null
}

/**
 * Format parsed date back to display string
 * Output: "7th Jan., 2023"
 */
export function formatDateForDisplay(parsed: ParsedDate): string {
  return `${parsed.day}${parsed.ordinal.toLowerCase()} ${parsed.month.charAt(0)}${parsed.month.slice(1).toLowerCase()}., ${parsed.year}`
}

/**
 * Date Library Composable
 */
export function useDateLibrary() {
  // Cache for loaded date SVG
  let cachedDateSVG: string | null = null
  
  /**
   * Load the date SVG template
   */
  async function loadDateSVG(): Promise<string | null> {
    if (cachedDateSVG) {
      return cachedDateSVG
    }
    
    try {
      // Prefer date.svg (the canonical template), but keep fallbacks for older assets.
      const candidateUrls = ['/dateibrary/date.svg', '/dateibrary/date1.svg', '/dateibrary/date']

      for (const url of candidateUrls) {
        try {
          const response = await fetch(url)
          if (!response.ok) {
            console.warn(`⚠️ Failed to load date template (${url}):`, response.statusText)
            continue
          }

          cachedDateSVG = await response.text()
          console.log('✅ Date SVG loaded successfully from:', url)
          return cachedDateSVG
        } catch (innerErr) {
          console.warn(`⚠️ Error fetching date template (${url}):`, innerErr)
          continue
        }
      }

      console.error('❌ Failed to load any date template from:', candidateUrls.join(', '))
      return null
    } catch (error) {
      console.error('❌ Error loading date template:', error)
      return null
    }
  }
  
  /**
   * Update the date SVG text elements with parsed date
   */
  function updateDateSVGContent(svgContent: string, parsed: ParsedDate): string {
    // Parse the SVG to manipulate DOM
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')

    // If parsing failed, bail out with original content
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      console.error('❌ Error parsing date SVG template:', parserError.textContent)
      return svgContent
    }

    // IMPORTANT: CorelDRAW exports SVG Fonts (<font> in <defs>). These are deprecated and
    // not consistently supported (notably on mobile Safari), and can cause SVG text to disappear.
    // Strip them and force a safe system font so the date always renders.
    Array.from(doc.querySelectorAll('defs font')).forEach((fontEl) => fontEl.remove())
    
    // Get all text elements
    const textElements = Array.from(doc.querySelectorAll('text'))

    // Ensure date text always renders by using a safe system font-family.
    for (const el of textElements) {
      // Force a system font to avoid matching the removed SVG font-face family names.
      el.setAttribute('font-family', 'Arial, Helvetica, sans-serif')

      // Some renderers prefer fill on style rather than attribute inheritance.
      const fill = (el.getAttribute('fill') || '').trim()
      if (fill && fill !== 'none') {
        const currentStyle = (el.getAttribute('style') || '').trim()
        const styleWithoutFill = currentStyle.replace(/(^|;)\s*fill\s*:[^;]*;?/gi, '$1').trim()
        const sep = styleWithoutFill && !styleWithoutFill.endsWith(';') ? '; ' : ''
        el.setAttribute('style', `${styleWithoutFill}${sep}fill: ${fill};`)
      }
    }
    
    // The date.svg has these text elements in order:
    // 1. Day number (currently "13") - at x~6.27, y~8.26
    // 2. Ordinal suffix (currently "TH") - at x~10.45, y~8.26
    // 3. Punctuation ".," - at x~14.07, y~11.91
    // 4. Month (currently "DEC") - at x~6.07, y~11.91
    // 5. Year (currently "2025") - at x~6.41, y~15.57
    
    // Prefer content/row-based matching (more resilient than exact x/y heuristics)
    let dayEl: SVGTextElement | null = null
    let ordinalEl: SVGTextElement | null = null
    let monthEl: SVGTextElement | null = null
    let yearEl: SVGTextElement | null = null

    for (const el of textElements) {
      const content = el.textContent?.trim() || ''
      const y = parseFloat(el.getAttribute('y') || '0')

      if (!dayEl && y < 10 && /^\d+$/.test(content)) {
        dayEl = el as SVGTextElement
        continue
      }

      if (!ordinalEl && y < 10 && /^(ST|ND|RD|TH)$/i.test(content)) {
        ordinalEl = el as SVGTextElement
        continue
      }

      if (!monthEl && y > 10 && y < 14 && /^[A-Z]{3}$/.test(content)) {
        monthEl = el as SVGTextElement
        continue
      }

      if (!yearEl && y > 14 && /^\d{4}$/.test(content)) {
        yearEl = el as SVGTextElement
        continue
      }
    }

    // Deterministic fallback for templates that keep the same ordering
    // Expected order in date.svg: day, ordinal, punctuation, month, year
    if (!dayEl || !ordinalEl || !monthEl || !yearEl) {
      const ordered = [...textElements]
      if (ordered.length >= 5) {
        dayEl = dayEl || (ordered[0] as SVGTextElement)
        ordinalEl = ordinalEl || (ordered[1] as SVGTextElement)
        monthEl = monthEl || (ordered[3] as SVGTextElement)
        yearEl = yearEl || (ordered[4] as SVGTextElement)
      }
    }

    if (dayEl) dayEl.textContent = parsed.day
    if (ordinalEl) {
      ordinalEl.textContent = parsed.ordinal

      // The template positions the ordinal assuming a 2-digit day (e.g. "13").
      // For 1-digit days (e.g. "6"), shift the ordinal left so it stays close.
      const ordinalX = parseFloat(ordinalEl.getAttribute('x') || '')
      const dayDigits = String(parsed.day).replace(/\D/g, '').length
      if (!Number.isNaN(ordinalX) && dayDigits > 0 && dayDigits < 2) {
        const shiftPerMissingDigit = 2.0 // tuned for date.svg coordinate system
        const missingDigits = 2 - dayDigits
        const newX = ordinalX - (missingDigits * shiftPerMissingDigit)
        ordinalEl.setAttribute('x', String(newX))
      }
    }
    if (monthEl) monthEl.textContent = parsed.month
    if (yearEl) yearEl.textContent = parsed.year
    
    // Serialize back to string
    const serializer = new XMLSerializer()
    return serializer.serializeToString(doc)
  }
  
  /**
   * Inject the date SVG into the wedding sticker template
   */
  async function injectDateSVG(
    svgElement: SVGSVGElement,
    dateStr: string
  ): Promise<boolean> {
    console.log('📅 Injecting date SVG for:', dateStr)
    
    // Parse the user date
    const parsed = parseUserDate(dateStr)
    if (!parsed) {
      console.warn('⚠️ Could not parse date:', dateStr)
      // Avoid leaving a stale injected date visible.
      removeDateSVG(svgElement)
      return false
    }
    
    console.log('📅 Parsed date:', parsed)
    
    // Load the date SVG template
    const dateSVGContent = await loadDateSVG()
    if (!dateSVGContent) {
      // Avoid leaving a stale injected date visible.
      removeDateSVG(svgElement)
      return false
    }
    
    // Update the SVG content with the parsed date
    const updatedSVG = updateDateSVGContent(dateSVGContent, parsed)
    
    // Find the date group in the template
    const dateGroup = svgElement.querySelector('#wedding-date-group') as SVGGElement
    if (!dateGroup) {
      console.warn('⚠️ #wedding-date-group not found in template')
      return false
    }
    
    // Parse the updated SVG
    const parser = new DOMParser()
    const dateSVGDoc = parser.parseFromString(updatedSVG, 'image/svg+xml')
    
    // Check for parsing errors
    const parserError = dateSVGDoc.querySelector('parsererror')
    if (parserError) {
      console.error('❌ Error parsing date SVG:', parserError.textContent)
      // Avoid leaving a stale injected date visible.
      removeDateSVG(svgElement)
      return false
    }
    
    // Clear existing content in date group
    while (dateGroup.firstChild) {
      dateGroup.removeChild(dateGroup.firstChild)
    }
    
    // Get the root SVG for injecting defs
    const rootSVG = dateGroup.ownerSVGElement
    if (rootSVG) {
      // Inject defs (gradients, fonts) from date SVG
      const dateDefs = dateSVGDoc.querySelector('defs')
      if (dateDefs) {
        let rootDefs = rootSVG.querySelector('defs')
        if (!rootDefs) {
          rootDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
          rootSVG.insertBefore(rootDefs, rootSVG.firstChild)
        }
        
        // Import gradient definitions (skip deprecated SVG font definitions)
        Array.from(dateDefs.children).forEach(child => {
          const tagName = (child as Element).tagName?.toLowerCase?.() || ''
          if (tagName === 'font' || tagName === 'font-face' || tagName === 'font-face-src' || tagName === 'font-face-name') {
            return
          }
          const childId = (child as Element).getAttribute?.('id')
          if (childId && !rootSVG.querySelector(`#${childId}`)) {
            rootDefs!.appendChild(document.importNode(child, true))
          }
        })
      }
    }
    
    // Find the main content group in date SVG
    const dateContent = dateSVGDoc.querySelector('#Layer_x0020_1') || dateSVGDoc.querySelector('g')
    if (dateContent) {
      // Import all children from the date SVG content group
      Array.from(dateContent.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tagName = (child as Element).tagName?.toLowerCase()
          // Skip metadata
          if (tagName !== 'metadata') {
            dateGroup.appendChild(document.importNode(child, true))
          }
        }
      })
    }
    
    // Mark as injected
    dateGroup.setAttribute('data-date-svg-loaded', 'true')
    dateGroup.setAttribute('data-date-value', dateStr)
    
    console.log('✅ Date SVG injected successfully:', formatDateForDisplay(parsed))
    return true
  }
  
  /**
   * Remove the date SVG and show plain text fallback
   */
  function removeDateSVG(svgElement: SVGSVGElement): void {
    const dateGroup = svgElement.querySelector('#wedding-date-group') as SVGGElement
    if (dateGroup) {
      while (dateGroup.firstChild) {
        dateGroup.removeChild(dateGroup.firstChild)
      }
      dateGroup.removeAttribute('data-date-svg-loaded')
      dateGroup.removeAttribute('data-date-value')
    }
    
    // Show the plain text date
    const dateText = svgElement.querySelector('#date-text') as SVGTextElement
    if (dateText) {
      dateText.removeAttribute('display')
    }
  }
  
  return {
    parseUserDate,
    formatDateForDisplay,
    loadDateSVG,
    injectDateSVG,
    removeDateSVG,
    MONTH_ABBREVIATIONS
  }
}
