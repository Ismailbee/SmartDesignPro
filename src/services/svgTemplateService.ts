/**
 * SVG Template Service
 * Handles loading and rendering of letterhead SVG templates with dynamic data
 */

import {
  findTextElement,
  findTextElements,
  scaleTextToFit,
  updateTextElement,
  hideTextElements,
  calculateCenterPosition,
  getTextWidth
} from '@/composables/useSvgTextManipulation'

import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

export interface LetterHeadData {
  organizationName?: string
  registrationNumber?: string
  headOffice?: string
  otherAddress?: string
  phones?: string[]
  email?: string
  logoDataUrl?: string
  primaryBrandColor?: string
  referenceFields?: {
    ref?: string
    date?: string
    [key: string]: string | undefined
  }
}

/**
 * Convert text to title case
 */
function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validate and normalize phone numbers using libphonenumber-js
 */
function validateAndNormalizePhones(phones: string[]): string[] {
  const validPhones: string[] = []
  
  for (const phone of phones) {
    try {
      // Try to validate with different country codes (Nigeria first, then international)
      let isValid = isValidPhoneNumber(phone, 'NG') || isValidPhoneNumber(phone)
      
      if (isValid) {
        // Parse and format the number
        const phoneNumber = parsePhoneNumber(phone, 'NG') || parsePhoneNumber(phone)
        if (phoneNumber) {
          // Use international format instead of E.164 for better readability
          validPhones.push(phoneNumber.formatInternational())
        } else {
          // If parsing fails but validation passed, keep original
          validPhones.push(phone)
        }
      } else {
        // If not valid even with country code, keep original number
        // Don't replace with "unavailable" as it might still be a valid local format
        validPhones.push(phone)
      }
    } catch (error) {
      // If any error occurs, keep the original phone number
      validPhones.push(phone)
    }
  }
  
  return validPhones
}

/**
 * Check if a field value should be considered as "skipped" or "not provided"
 */
function isFieldSkipped(value: string | string[] | undefined): boolean {
  if (!value) return true
  
  // Handle array (for phones)
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    // Check if all phone entries are skipped
    return value.every(v => isFieldSkipped(v))
  }
  
  // Handle string
  const normalized = value.toLowerCase().trim()
  const skipPatterns = [
    'n/a',
    'no',
    'none',
    'i dont have',
    "i don't have",
    'i do not have',
    'skip',
    'null',
    'nil',
    'not available'
  ]
  
  return skipPatterns.some(pattern => normalized === pattern || normalized.includes(pattern))
}

// Template cache to avoid redundant network requests
let cachedTemplate: string | null = null
let templateLoadPromise: Promise<string> | null = null

/**
 * Load the letter head SVG template from the public directory
 * Includes caching to improve performance on subsequent loads
 */
export async function loadLetterHeadTemplate(): Promise<string> {
  // Return cached template if available
  if (cachedTemplate) {
    console.log('📦 Using cached SVG template')
    return cachedTemplate
  }

  // Return existing promise if template is being loaded
  if (templateLoadPromise) {
    console.log('⏳ Template load in progress, reusing promise')
    return templateLoadPromise
  }

  // Load template and cache result
  templateLoadPromise = (async () => {
    try {
      console.log('📥 Loading SVG template from server')
      const response = await fetch('/templates/letterhead/letter head.svg')
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`)
      }
      cachedTemplate = await response.text()
      console.log('✅ SVG template loaded and cached')
      return cachedTemplate
    } catch (error) {
      console.error('Failed to load letter head template:', error)
      throw error
    } finally {
      // Clear promise after load completes
      templateLoadPromise = null
    }
  })()

  return templateLoadPromise
}

/**
 * Render letterhead with provided data
 */
export async function renderLetterHead(data: LetterHeadData): Promise<string> {
  try {
    const template = await loadLetterHeadTemplate()
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(template, 'image/svg+xml')
    
    // Check for parsing errors
    const parserError = svgDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Failed to parse SVG template')
    }

    const svg = svgDoc.documentElement as unknown as SVGElement
    
    // Temporarily attach SVG to DOM for accurate measurements
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.visibility = 'hidden'
    tempContainer.style.pointerEvents = 'none'
    document.body.appendChild(tempContainer)
    tempContainer.appendChild(svg)

    // Update text elements based on their positions (approximate line numbers from SVG)
    // We'll search for specific text patterns and replace them


    // Find and update organization name (split across two text elements)
    if (data.organizationName) {
      const orgNameUpper = data.organizationName.toUpperCase()
      
      // Find and update organization name text
      const orgTextElement = findTextElement(svg, 'WILLMIKE')
      
      if (orgTextElement) {
        /**
         * Dynamic organization name fitting:
         * - Must stay within fixed width boundary
         * - If text exceeds width, reduce font size to fit
         * - Font size: starts at 60 if > 25 chars, otherwise 120
         * - Reduces font size until text fits
         */
        
        // Define boundaries - much more generous to allow larger fonts
        const logoEndX = 2400 // Right edge of logo with margin
        const greenStartX = 7200 // Much further right to give more space (was 6400)
        const maxWidth = greenStartX - logoEndX // ~4800 units maximum width (increased)
        const safeZoneCenterX = logoEndX + (maxWidth / 2) - 300 // Center point shifted left by 300 units
        
        // Always center the text in the available space (shifted left)
        orgTextElement.setAttribute('x', safeZoneCenterX.toString())
        orgTextElement.setAttribute('text-anchor', 'middle') // Ensures text is centered around the x position
        
        // Get base font size
        const baseFontSize = parseFloat(orgTextElement.getAttribute('font-size') || '120')
        
        // Count total characters (alphabets, symbols, spaces)
        const charCount = orgNameUpper.length
        
        // Set font size based on character count - Large size for short names, very large for long names
        let fontSize = 3400 // Use 3400px for short names (25 or fewer characters)
        if (charCount > 25) {
          fontSize = baseFontSize * 20.0 // Use large size (2400) for long names only
        }
        
        // Calculate if text needs font size reduction instead of horizontal scaling
        // Average character width is more generous for uppercase text
        const avgCharWidthRatio = 0.45 // Reduced from 0.60 to allow bigger fonts
        let estimatedWidth = charCount * fontSize * avgCharWidthRatio
        
        // If text is too wide, reduce font size more gently
        while (estimatedWidth > maxWidth && fontSize > 200) { // Higher minimum (was 80)
          fontSize -= 10 // Smaller reduction steps (was 20)
          estimatedWidth = charCount * fontSize * avgCharWidthRatio
        }
        
        // Remove horizontal scaling - text should never be compressed
        const scaleX = 1.0 // Always keep normal width
        
        // Set the text content and styling
        // IMPORTANT: Remove class to prevent CSS override, use inline style
        orgTextElement.textContent = orgNameUpper
        orgTextElement.removeAttribute('class') // Remove CSS class that overrides font-size
        
        // Apply font size without any horizontal compression
        // Use CSS variable for brand color, fallback to default if not provided
        const brandColor = data.primaryBrandColor ? 'var(--primary-brand-color)' : '#058A6C'
        let styleString = `font-size:${fontSize}px; font-family:'Sans Inserat'; font-weight:normal; fill:${brandColor};`
        // Remove horizontal scaling - text maintains natural proportions
        orgTextElement.setAttribute('style', styleString)
        
        // Hide the second part of template org name since we put everything in first element
        hideTextElements(svg, 'SONS')
      }
      
      // Find and update registration number - position based on logo presence
      if (data.registrationNumber && data.registrationNumber !== 'N/A' && orgTextElement) {
        const rcTextElement = findTextElement(svg, 'RC NO.')
        
        if (rcTextElement) {
          // First, set the RC number text with smaller font size
          rcTextElement.textContent = `RC NO.: ${data.registrationNumber}`
          
          // Set RC font size to be smaller (10px or 12% of org name font size)
          const orgFontSize = parseFloat(orgTextElement.getAttribute('font-size') || '120')
          const rcFontSize = Math.max(10, orgFontSize * 0.12)
          rcTextElement.setAttribute('font-size', rcFontSize.toString())
          
          // Position RC number consistently regardless of logo presence
          try {
            // Always position RC above org name, shifted left from right edge
            const bbox = orgTextElement.getBBox()
            const orgNameRightEdge = bbox.x + bbox.width
            const orgNameTop = bbox.y
            
            const rcX = orgNameRightEdge - 200 // Shift 200 units to the left
            const rcY = orgNameTop - 5 // Position above with small gap
            
            rcTextElement.setAttribute('x', rcX.toString())
            rcTextElement.setAttribute('y', rcY.toString())
            rcTextElement.setAttribute('text-anchor', 'end') // Right-align
            rcTextElement.setAttribute('dominant-baseline', 'auto')
          } catch (e) {
            // Fallback to default position if getBBox fails
            rcTextElement.setAttribute('x', '712')
            rcTextElement.setAttribute('y', '850')
            rcTextElement.setAttribute('text-anchor', 'start')
          }
        }
      } else {
        hideTextElements(svg, 'RC NO.')
      }
    } else {
      // If no organization name, just handle RC number removal if needed
      if (!data.registrationNumber || data.registrationNumber === 'N/A') {
        hideTextElements(svg, 'RC NO.')
      }
    }

    // Calculate organization name center position for alignment
    const logoEndX = 2400 // Right edge of logo with margin  
    const greenStartX = 7200 // Much further right to give more space
    const maxWidth = greenStartX - logoEndX // ~4800 units maximum width
    const orgCenterX = logoEndX + (maxWidth / 2) - 300 // Same as organization name center

    // Find and update other address - blank everything if skipped
    const allTexts = Array.from(svg.querySelectorAll('text'))
    
    // Find the Minna address label
    const addressLabel = allTexts.find(text => text.textContent?.includes('Minna Address:') || text.textContent?.includes('Address:'))
    
    // Find the address content
    for (const text of allTexts) {
      const content = text.textContent || ''
      if (content.includes('Hydro') || content.includes('Minna')) {
        if (!isFieldSkipped(data.otherAddress)) {
          // User provided an address - center the complete "Address: Content" unit
          const otherAddressTitleCase = toTitleCase(data.otherAddress!)
          const fullAddressText = `Address: ${otherAddressTitleCase}`
          text.textContent = fullAddressText
          // Center the entire text under organization name
          text.setAttribute('x', orgCenterX.toString())
          text.setAttribute('text-anchor', 'middle')
          // Shift the address down a bit
          const currentY = parseFloat(text.getAttribute('y') || '0')
          text.setAttribute('y', (currentY + 30).toString())
          // Apply red and bold styling to the label part only using tspan
          text.innerHTML = `<tspan fill="red" font-weight="bold">Address:</tspan> ${otherAddressTitleCase}`
          // Hide the separate label since we're using inline styling
          if (addressLabel) {
            addressLabel.textContent = ''
          }
        } else {
          // User skipped address - blank both label and content
          text.textContent = ''
          if (addressLabel) addressLabel.textContent = ''
        }
        break
      }
    }

    // Find and update head office - blank everything if skipped
    const headOfficeTexts = Array.from(svg.querySelectorAll('text'))
    
    // Find the head office label
    const headOfficeLabel = headOfficeTexts.find(text => text.textContent?.includes('Head Office:'))
    
    // Find the head office content
    for (const text of headOfficeTexts) {
      const content = text.textContent || ''
      if (content.includes('Enogie') || content.includes('Benin')) {
        if (!isFieldSkipped(data.headOffice)) {
          // User provided a head office - center the complete "Head Office: Content" unit
          const headOfficeTitleCase = toTitleCase(data.headOffice!)
          const fullHeadOfficeText = `Head Office: ${headOfficeTitleCase}`
          text.textContent = fullHeadOfficeText
          // Center the entire text under organization name
          text.setAttribute('x', orgCenterX.toString())
          text.setAttribute('text-anchor', 'middle')
          // Shift the head office down a bit more
          const currentY = parseFloat(text.getAttribute('y') || '0')
          text.setAttribute('y', (currentY + 60).toString())
          // Apply red and bold styling to the label part only using tspan
          text.innerHTML = `<tspan fill="red" font-weight="bold">Head Office:</tspan> ${headOfficeTitleCase}`
          // Hide the separate label since we're using inline styling
          if (headOfficeLabel) {
            headOfficeLabel.textContent = ''
          }
        } else {
          // User skipped head office - blank both label and content
          text.textContent = ''
          if (headOfficeLabel) headOfficeLabel.textContent = ''
        }
        break
      }
    }

    // Handle phones - replace the template phone numbers with user's numbers or blank if skipped
    const texts = svg.querySelectorAll('text')
    const allTextArray = Array.from(texts)
    
    // Find phone label (Tel: or Telephone:)
    const phoneLabel = allTextArray.find(text => 
      text.textContent?.includes('Tel:') || text.textContent?.includes('Telephone:')
    )
    
    if (!isFieldSkipped(data.phones)) {
      // User provided phone numbers - validate and normalize them first
      const validatedPhones = validateAndNormalizePhones(data.phones!)
      
      // Remove any "Phone:" text that was previously added
      const textsToRemove = allTextArray.filter(text => 
        text.textContent?.includes('Phone:')
      )
      textsToRemove.forEach(text => text.remove())
      
      // Find and replace the template phone numbers (08035976700, 08074383622)
      for (const text of texts) {
        const content = text.textContent || ''
        if (content.includes('08035976700') || content.includes('08074383622')) {
          const parentGroup = text.parentElement
          
          // If 2 or fewer numbers, display them on one line
          if (validatedPhones.length <= 2) {
            text.textContent = validatedPhones.join(', ')
          } else if (validatedPhones.length === 3) {
            // For exactly 3 numbers: first 2 on first line, 3rd below the first
            text.textContent = validatedPhones[0] + ', ' + validatedPhones[1] + '.'
            
            // Get the position and styling of the current text element
            const x = text.getAttribute('x')
            const y = text.getAttribute('y')
            const textClass = text.getAttribute('class')
            
            if (x && y) {
              const yNum = parseFloat(y)
              const lineHeight = 140 // Approximate line height based on font size
              
              // Create a new text element for the 3rd number (below first number)
              const thirdPhone = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              thirdPhone.setAttribute('x', x)
              thirdPhone.setAttribute('y', (yNum + lineHeight).toString())
              if (textClass) thirdPhone.setAttribute('class', textClass)
              thirdPhone.textContent = validatedPhones[2]
              
              // Insert the new element
              if (parentGroup) {
                parentGroup.appendChild(thirdPhone)
              } else {
                text.parentNode?.appendChild(thirdPhone)
              }
            }
          } else {
            // For 4+ numbers: first 2 on first line, next 2 on second line
            text.textContent = validatedPhones[0] + ', ' + validatedPhones[1] + '.'
            
            // Get the position and styling of the current text element
            const x = text.getAttribute('x')
            const y = text.getAttribute('y')
            const textClass = text.getAttribute('class')
            
            if (x && y) {
              const yNum = parseFloat(y)
              const lineHeight = 140 // Approximate line height based on font size
              
              // Create a new text element for the 3rd and 4th numbers on second line
              const secondLineText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              secondLineText.setAttribute('x', x)
              secondLineText.setAttribute('y', (yNum + lineHeight).toString())
              if (textClass) secondLineText.setAttribute('class', textClass)
              secondLineText.textContent = validatedPhones[2] + ', ' + validatedPhones[3] + '.'
              
              // Insert the new element
              if (parentGroup) {
                parentGroup.appendChild(secondLineText)
              } else {
                text.parentNode?.appendChild(secondLineText)
              }
            }
          }
          break
        }
      }
    } else {
      // User skipped phone - blank both label and content
      for (const text of texts) {
        const content = text.textContent || ''
        if (content.includes('08035976700') || content.includes('08074383622')) {
          text.textContent = ''
        }
      }
      if (phoneLabel) phoneLabel.textContent = ''
    }

    // Email is on the left side - blank everything if skipped
    const emailTexts = Array.from(svg.querySelectorAll('text'))
    
    // Find the email label
    const emailLabel = emailTexts.find(text => text.textContent?.includes('Email:'))
    
    // Find and update the email content
    for (const text of emailTexts) {
      if (text.textContent?.includes('mathewuzzy@gmail')) {
        if (!isFieldSkipped(data.email)) {
          // Handle multiple emails if provided
          const emails = data.email!.split(/[,;]/).map(email => email.trim()).filter(email => email)
          
          if (emails.length === 1) {
            // Single email - show it and shift to the left
            text.textContent = emails[0]
            // Shift email content further to the left
            const currentX = parseFloat(text.getAttribute('x') || '0')
            text.setAttribute('x', (currentX - 500).toString())
            // Ensure label is visible and shift it further to the left too
            if (emailLabel) {
              emailLabel.textContent = 'Email:'
              const labelX = parseFloat(emailLabel.getAttribute('x') || '0')
              emailLabel.setAttribute('x', (labelX - 500).toString())
            }
          } else if (emails.length > 1) {
            // Multiple emails - show first email and create additional elements for others
            text.textContent = emails[0]
            const currentX = parseFloat(text.getAttribute('x') || '0')
            const currentY = parseFloat(text.getAttribute('y') || '0')
            const textClass = text.getAttribute('class')
            const parentGroup = text.parentElement
            
            // Position first email
            text.setAttribute('x', (currentX - 500).toString())
            
            // Create additional text elements for remaining emails
            for (let i = 1; i < emails.length; i++) {
              const additionalEmail = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              additionalEmail.setAttribute('x', (currentX - 500).toString())
              additionalEmail.setAttribute('y', (currentY + (i * 160)).toString()) // Increased spacing to 160 units
              if (textClass) additionalEmail.setAttribute('class', textClass)
              additionalEmail.textContent = emails[i]
              
              // Insert the new element
              if (parentGroup) {
                parentGroup.appendChild(additionalEmail)
              } else {
                text.parentNode?.appendChild(additionalEmail)
              }
            }
            
            // Position email label
            if (emailLabel) {
              emailLabel.textContent = 'Email:'
              const labelX = parseFloat(emailLabel.getAttribute('x') || '0')
              emailLabel.setAttribute('x', (labelX - 500).toString())
            }
          }
        } else {
          // User skipped email - blank both label and content
          text.textContent = ''
          if (emailLabel) emailLabel.textContent = ''
        }
        break
      }
    }

    // Update reference fields
    if (data.referenceFields) {
      if (data.referenceFields.ref) {
        updateTextByPattern(svg, /REF:/i, `REF: ${data.referenceFields.ref}`)
      }
      if (data.referenceFields.date) {
        updateTextByPattern(svg, /DATE:/i, `DATE: ${data.referenceFields.date}`)
      }
    }

    // Always remove the template logo, then add user logo if provided
    removeTemplateLogo(svg)
    if (data.logoDataUrl) {
      await injectLogo(svg, data.logoDataUrl)
    }

    // Remove SVG from temporary container and clean up
    document.body.removeChild(tempContainer)

    // Serialize the updated SVG
    const serializer = new XMLSerializer()
    let finalSvg = serializer.serializeToString(svg)
    
    // Inject CSS variables for brand color
    if (data.primaryBrandColor) {
      finalSvg = injectCSSVariables(finalSvg, data.primaryBrandColor)
    }
    
    return finalSvg
  } catch (error) {
    console.error('Error rendering letterhead:', error)
    throw error
  }
}

/**
 * Add new text element to SVG
 */
function addTextToSVG(svg: Element, content: string, x: number, y: number, className: string): void {
  const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textElement.setAttribute('x', x.toString())
  textElement.setAttribute('y', y.toString())
  textElement.setAttribute('class', className)
  textElement.textContent = content
  svg.appendChild(textElement)
}

/**
 * Update text element by exact content match
 */
function updateTextByContent(svg: Element, searchText: string, newText: string): boolean {
  const textElements = svg.querySelectorAll('text, tspan')
  
  for (const element of textElements) {
    if (element.textContent?.trim() === searchText.trim()) {
      element.textContent = newText
      return true
    }
  }
  
  return false
}

/**
 * Update text element by pattern match (supports partial matches)
 */
function updateTextByPattern(svg: Element, pattern: RegExp, newText: string): boolean {
  const textElements = svg.querySelectorAll('text, tspan')
  
  for (const element of textElements) {
    if (element.textContent && pattern.test(element.textContent)) {
      element.textContent = newText
      return true
    }
  }
  
  return false
}

/**
 * Remove the template logo from SVG
 */
function removeTemplateLogo(svg: Element): void {
  // Remove the template logo (paths with classes fil3, fil4, fil6, fil7, fil8)
  const templateLogoPaths = svg.querySelectorAll('path.fil3, path.fil4, path.fil6, path.fil7, path.fil8')
  templateLogoPaths.forEach(path => path.remove())
  
  // Remove the "S" text element that's part of the template logo
  const texts = svg.querySelectorAll('text')
  for (const text of texts) {
    if (text.classList.contains('fil5') && text.classList.contains('fnt4') && text.textContent?.trim() === 'S') {
      text.remove()
      break
    }
  }
  
  // Also remove any existing user-uploaded logos
  const existingLogos = svg.querySelectorAll('image.letterhead-logo')
  existingLogos.forEach(img => img.remove())
}

/**
 * Inject logo image into SVG
 */
async function injectLogo(svg: Element, logoDataUrl: string): Promise<void> {
  // Create new logo image element
  // Position it in the center where the template logo was (around x=712, y=411)
  // Template logo is approximately 617x563 pixels (from paths) - enlarging to 1000x900
  const newImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  newImage.setAttribute('class', 'letterhead-logo')
  newImage.setAttribute('x', '300')  // Moved further left to accommodate even larger size
  newImage.setAttribute('y', '350')  // Moved down from 300 to 350
  newImage.setAttribute('width', '1000')  // Increased from 800 to 1000
  newImage.setAttribute('height', '900')  // Increased from 730 to 900
  newImage.setAttribute('href', logoDataUrl)
  newImage.setAttribute('xlink:href', logoDataUrl)
  newImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  
  // Insert into the main group
  const mainGroup = svg.querySelector('g')
  if (mainGroup && mainGroup.firstChild) {
    mainGroup.insertBefore(newImage, mainGroup.firstChild)
  } else if (mainGroup) {
    mainGroup.appendChild(newImage)
  } else {
    // Fallback: add to SVG root after defs
    const defs = svg.querySelector('defs')
    if (defs && defs.nextSibling) {
      svg.insertBefore(newImage, defs.nextSibling)
    } else {
      svg.appendChild(newImage)
    }
  }
}

/**
 * Download SVG as file
 */
export function downloadSVG(svgContent: string, filename: string = 'letterhead.svg'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Update brand color using CSS variables
 */
export function updateLetterHeadBrandColor(brandColor: string): void {
  try {
    // Set CSS variable on document root
    document.documentElement.style.setProperty('--primary-brand-color', brandColor)
    
    // Also update any SVG elements currently displayed
    const svgElements = document.querySelectorAll('svg')
    svgElements.forEach(svg => {
      // Find any existing style elements within the SVG
      const styleEl = svg.querySelector('style')
      if (styleEl && styleEl.textContent) {
        // Update the CSS variable definition within the SVG
        let cssContent = styleEl.textContent
        const variableRegex = /:root\s*\{\s*--primary-brand-color:\s*[^;]+;?\s*\}/g
        if (variableRegex.test(cssContent)) {
          cssContent = cssContent.replace(variableRegex, `:root { --primary-brand-color: ${brandColor}; }`)
          styleEl.textContent = cssContent
        }
      }
    })
  } catch (error) {
    console.error('Error updating brand color:', error)
  }
}

/**
 * Inject CSS variables into SVG content
 */
function injectCSSVariables(svgContent: string, primaryBrandColor?: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svg = doc.documentElement

    // Find the existing style element
    const existingStyle = svg.querySelector('style')
    if (existingStyle && existingStyle.textContent) {
      let updatedCSS = existingStyle.textContent
      
      // Add CSS variable definition at the top
      updatedCSS = `:root { --primary-brand-color: ${primaryBrandColor || '#058A6C'}; }\n` + updatedCSS
      
      // Replace brand-colored fill and stroke classes with CSS variables
      // Organization name text (fil11)
      updatedCSS = updatedCSS.replace(/\.fil11\s*\{[^}]*fill:\s*#[0-9a-fA-F]{6}[^}]*\}/g, 
        '.fil11 {fill:var(--primary-brand-color)}')
      
      // Green design element strokes (str1 and str2) 
      updatedCSS = updatedCSS.replace(/\.str1\s*\{([^}]*)stroke:\s*#058A6C([^}]*)\}/g, 
        '.str1 {$1stroke:var(--primary-brand-color)$2}')
      updatedCSS = updatedCSS.replace(/\.str2\s*\{([^}]*)stroke:\s*#058A6C([^}]*)\}/g, 
        '.str2 {$1stroke:var(--primary-brand-color)$2}')
      
      // Add specific polygon selectors for the design elements
      updatedCSS += `
        polygon[points="8717.72,342.99 7799.47,926.7 7796.05,155.24 8005.15,0 8717.72,0 "] {
          fill: var(--primary-brand-color) !important;
        }
        polygon[points="-450,11349.93 468.25,10766.21 471.67,11537.67 262.56,11692.91 -450,11692.91 "] {
          fill: var(--primary-brand-color) !important;
        }
      `
      
      // Green design fill elements (if any use #058A6C directly)
      updatedCSS = updatedCSS.replace(/fill:\s*#058A6C/g, 'fill:var(--primary-brand-color)')
      updatedCSS = updatedCSS.replace(/stroke:\s*#058A6C/g, 'stroke:var(--primary-brand-color)')
      
      // Keep grey elements unchanged (fil12: #D2D3D5, etc.)
      // These will remain hardcoded as intended
      
      existingStyle.textContent = updatedCSS
    }

    return new XMLSerializer().serializeToString(doc)
  } catch (error) {
    console.error('Error injecting CSS variables:', error)
    return svgContent
  }
}

/**
 * Convert SVG to PNG
 */
export async function convertSvgToPng(svgContent: string, width: number = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const aspectRatio = img.height / img.width
      canvas.width = width
      canvas.height = width * aspectRatio

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Download PNG version of letterhead
 */
export async function downloadAsPng(svgContent: string, filename: string = 'letterhead.png'): Promise<void> {
  try {
    const pngDataUrl = await convertSvgToPng(svgContent, 10000)
    const link = document.createElement('a')
    link.href = pngDataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error converting to PNG:', error)
    throw error
  }
}

/**
 * Convert SVG to JPEG data URL
 */
async function convertSvgToJpeg(svgContent: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const img = new Image()
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      // Scale up for higher resolution
      const scale = 8
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      // Fill with white background for JPEG
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      
      // Convert to JPEG with high quality
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95)
      resolve(jpegDataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Download JPEG version of letterhead
 */
export async function downloadAsJpeg(svgContent: string, filename: string = 'letterhead.jpg'): Promise<void> {
  try {
    const jpegDataUrl = await convertSvgToJpeg(svgContent)
    const link = document.createElement('a')
    link.href = jpegDataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error converting to JPEG:', error)
    throw error
  }
}

/**
 * Download PDF version of letterhead
 */
export async function downloadAsPdf(svgContent: string, filename: string = 'letterhead.pdf'): Promise<void> {
  try {
    // Convert SVG to PNG first for better compatibility (maximum resolution)
    const pngDataUrl = await convertSvgToPng(svgContent, 10000)
    
    // Create a temporary canvas to get image dimensions
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = pngDataUrl
    })
    
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf')
    
    // Create PDF with A4 dimensions (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Calculate dimensions to fit the image on A4
    const pdfWidth = 210
    const pdfHeight = 297
    const imgWidth = img.width
    const imgHeight = img.height
    
    // Calculate aspect ratios
    const imgRatio = imgWidth / imgHeight
    const pageRatio = pdfWidth / pdfHeight
    
    let finalWidth = pdfWidth
    let finalHeight = pdfHeight
    
    if (imgRatio > pageRatio) {
      // Image is wider than page
      finalHeight = pdfWidth / imgRatio
    } else {
      // Image is taller than page
      finalWidth = pdfHeight * imgRatio
    }
    
    // Center the image
    const xOffset = (pdfWidth - finalWidth) / 2
    const yOffset = (pdfHeight - finalHeight) / 2
    
    // Add image to PDF
    pdf.addImage(pngDataUrl, 'PNG', xOffset, yOffset, finalWidth, finalHeight)
    
    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Error converting to PDF:', error)
    throw error
  }
}

/**
 * Get preview SVG with sample data
 */
export async function getPreviewSvg(): Promise<string> {
  const sampleData: LetterHeadData = {
    organizationName: 'Your Company Name',
    registrationNumber: '123456',
    headOffice: 'Your Head Office Address Here',
    otherAddress: 'Your Other Office Address Here',
    phones: ['+234-XXX-XXXX-XXX', '+234-XXX-XXXX-XXX'],
    email: 'info@yourcompany.com',
    primaryBrandColor: '#058A6C',
    referenceFields: {
      ref: 'REF/2024/001',
      date: new Date().toLocaleDateString()
    }
  }

  return await renderLetterHead(sampleData)
}
