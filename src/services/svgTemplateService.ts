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
  emails?: string[]
  motto?: string // Motto text above description
  description?: string // Description text when optional fields are not included
  logoDataUrl?: string
  primaryBrandColor?: string
  backgroundId?: string | number // Add background support
  includeOptionalFields?: boolean // Control whether to show Our Ref, Your Ref, Date
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
 * Template management - random selection between letter head.svg and headed.svg
 */
let templateQueue: string[] = []

function initializeTemplateQueue(): void {
  // Shuffle the two templates
  const templates = ['letter head', 'headed']
  templateQueue = Math.random() > 0.5 ? templates : templates.reverse()
  console.log('🎲 Initialized template queue:', templateQueue)
}

/**
 * Get random template name from available templates
 * Ensures both templates are used before repeating
 * @param includeHeaded - Whether to include the 'headed' template in selection
 */
export function getRandomTemplate(includeHeaded: boolean = false): string {
  if (!includeHeaded) {
    // Always return 'letter head' when headed is not included
    return 'letter head'
  }
  
  if (templateQueue.length === 0) {
    initializeTemplateQueue()
  }
  const template = templateQueue.pop()!
  console.log(`📋 Selected template "${template}", ${templateQueue.length} remaining in queue`)
  return template
}

/**
 * Background management functions for letterhead templates
 */

/**
 * Background queue management to ensure all backgrounds shown before repeat
 */
let backgroundQueue: number[] = []

/**
 * Get the dominant brand color for each background
 */
export function getBackgroundColor(backgroundId: number): string {
  const colorMap: Record<number, string> = {
    1: '#1BA349',  // bg1: Green
    2: '#0F314C',  // bg2: Dark blue
    3: '#A3DB18',  // bg3: Light green
    4: '#F5951C',  // bg4: Orange
    5: '#EB7200',  // bg5: Orange
    6: '#058A6C',  // bg6: Default teal (plain background)
    7: '#C60234',  // bg7: Red
    9: '#E21130',  // bg9: Red
    10: '#6CB11A',  // bg10: Green
    11: '#2B2C6D',  // bg11: Navy blue
    12: '#6E2B8A',  // bg12: Purple
    13: '#50216F',  // bg13: Deep purple
    14: '#8D7559',  // bg14: Brown/tan
    15: '#C5996A',  // bg15: Gold/tan
    16: '#C5996A',  // bg16: Gold/tan
    17: '#60A880',  // bg17: Teal green
    18: '#0C92AD',  // bg18: Cyan blue
    19: '#0C92AD'   // bg19: Cyan blue
  }
  return colorMap[backgroundId] || '#058A6C' // Default color
}

function shuffleArray(array: number[]): number[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function initializeBackgroundQueue(): void {
  // Create array [2, 3, 4, ..., 19] (excluding bg1) and shuffle it
  const allBackgrounds = Array.from({ length: 18 }, (_, i) => i + 2)
  backgroundQueue = shuffleArray(allBackgrounds)
  console.log('🎲 Initialized background queue:', backgroundQueue)
}

/**
 * Get random background ID from available backgrounds
 * Ensures all backgrounds are used before any repeats
 * bg1-bg7: decorative patterns, bg9: plain/clean
 */
export function getRandomBackgroundId(): number {
  // Initialize queue if empty
  if (backgroundQueue.length === 0) {
    initializeBackgroundQueue()
  }
  
  // Pop the next background from the queue
  const backgroundId = backgroundQueue.pop()!
  console.log(`📋 Selected background ${backgroundId}, ${backgroundQueue.length} remaining in queue`)
  
  // Skip bg8 (removed duplicate)
  if (backgroundId === 8) {
    return getRandomBackgroundId()
  }
  
  return backgroundId
}

/**
 * Load background SVG from the backgrounds folder
 */
const backgroundCache: Record<string, string> = {}

async function loadBackgroundSvg(backgroundId: string | number): Promise<string> {
  const cacheKey = `bg${backgroundId}`
  
  // Return cached background if available
  if (backgroundCache[cacheKey]) {
    console.log('📦 Using cached background:', cacheKey)
    return backgroundCache[cacheKey]
  }
  
  try {
    const backgroundPath = `/templates/letterhead/letterheadbg/${cacheKey}.svg`
    console.log('📥 Loading background from:', backgroundPath)
    const response = await fetch(backgroundPath)
    if (!response.ok) {
      console.error(`Failed to load background: ${response.status} - ${response.statusText}`)
      throw new Error(`Failed to load background: ${response.status}`)
    }
    const backgroundContent = await response.text()
    
    // Cache the background for future use
    backgroundCache[cacheKey] = backgroundContent
    console.log('✅ Background loaded and cached, length:', backgroundContent.length)
    return backgroundContent
  } catch (error) {
    console.error('Error loading background:', error)
    // Return empty string as fallback
    return ''
  }
}

/**
 * Apply background to the main letterhead SVG
 */
function applyBackgroundToSvg(mainSvg: Document, backgroundSvgContent: string): void {
  if (!backgroundSvgContent) {
    console.log('No background content to apply')
    return
  }
  
  try {
    console.log('Applying background to SVG...')
    const parser = new DOMParser()
    const backgroundDoc = parser.parseFromString(backgroundSvgContent, 'image/svg+xml')
    const backgroundSvg = backgroundDoc.documentElement
    
    // Check for parsing errors
    const parserError = backgroundDoc.querySelector('parsererror')
    if (parserError) {
      console.error('Error parsing background SVG:', parserError.textContent)
      return
    }
    
    // Get viewBox information for scaling
    const mainViewBox = mainSvg.documentElement.getAttribute('viewBox')
    const backgroundViewBox = backgroundSvg.getAttribute('viewBox')
    console.log('Main viewBox:', mainViewBox)
    console.log('Background viewBox:', backgroundViewBox)
    
    // Get background elements (excluding defs and metadata)
    const backgroundElements = Array.from(backgroundSvg.children).filter(child => 
      child.tagName !== 'defs' && 
      child.tagName !== 'metadata' && 
      child.tagName !== 'title' && 
      child.tagName !== 'desc'
    )
    
    console.log('Found background elements:', backgroundElements.length)
    
    // Insert background elements at the beginning of the main SVG (behind other content)
    const mainSvgRoot = mainSvg.documentElement
    const firstChild = mainSvgRoot.firstElementChild
    
    // Create a wrapper group for background elements
    const backgroundGroup = mainSvg.createElementNS('http://www.w3.org/2000/svg', 'g')
    backgroundGroup.setAttribute('id', 'background-layer')
    
    // If viewBoxes don't match, we might need to apply scaling
    if (backgroundViewBox && mainViewBox && backgroundViewBox !== mainViewBox) {
      // For now, just add the elements as-is since they should be similar sizes
      // Future enhancement: calculate and apply proper scaling transform
      console.log('ViewBox mismatch detected, but proceeding with direct insertion')
    }
    
    backgroundElements.forEach((element, index) => {
      const importedElement = mainSvg.importNode(element, true) as Element
      
      // Remove white background rectangles that would cover the content
      if (importedElement.querySelectorAll) {
        const whiteRects = Array.from(importedElement.querySelectorAll('rect.fil0, rect[fill="white"], rect[fill="#FFFFFF"], rect[fill="#ffffff"]'))
        
        // Remove any white rects found within this element
        whiteRects.forEach(rect => {
          console.log('Removing nested white background rect')
          rect.remove()
        })
      }
      
      // If this element itself is a white rectangle, skip it
      if (importedElement.tagName === 'rect') {
        const fill = importedElement.getAttribute('fill') || ''
        const className = importedElement.getAttribute('class') || ''
        if (fill.toLowerCase() === 'white' || fill.toLowerCase() === '#ffffff' || className.includes('fil0')) {
          console.log('Skipping white background rect')
          return // Skip this element entirely
        }
      }
      
      backgroundGroup.appendChild(importedElement)
      console.log(`Added background element ${index + 1} to group:`, element.tagName)
    })
    
    // Insert the background group at the beginning
    if (firstChild) {
      mainSvgRoot.insertBefore(backgroundGroup, firstChild)
    } else {
      mainSvgRoot.appendChild(backgroundGroup)
    }
    
    // Copy background defs if any
    const backgroundDefs = backgroundSvg.querySelector('defs')
    if (backgroundDefs) {
      console.log('Copying background defs...')
      let mainDefs = mainSvg.querySelector('defs')
      if (!mainDefs) {
        mainDefs = mainSvg.createElementNS('http://www.w3.org/2000/svg', 'defs')
        mainSvgRoot.insertBefore(mainDefs, mainSvgRoot.firstElementChild)
        console.log('Created new defs element')
      }
      
      Array.from(backgroundDefs.children).forEach((defChild, index) => {
        const importedDef = mainSvg.importNode(defChild, true)
        
        // If this is a style element, scope it to only affect background elements
        if (importedDef.tagName === 'style') {
          let styleContent = importedDef.textContent || ''
          
          // Replace white fill with transparent for fil0 class
          styleContent = styleContent.replace(/\.fil0\s*\{[^}]*fill\s*:\s*white[^}]*\}/gi, '.fil0 {fill:none;opacity:0}')
          styleContent = styleContent.replace(/\.fil0\s*\{[^}]*fill\s*:\s*#fff(fff)?\s*[^}]*\}/gi, '.fil0 {fill:none;opacity:0}')
          
          // Scope all background CSS classes to only apply within #background-layer
          // This prevents background styles from affecting main letterhead text
          styleContent = styleContent.replace(/\.(fil\d+)/g, '#background-layer .$1')
          styleContent = styleContent.replace(/\.(str\d+)/g, '#background-layer .$1')
          
          importedDef.textContent = styleContent
          console.log('Scoped background styles to prevent text color conflicts')
        }
        
        mainDefs!.appendChild(importedDef)
        console.log(`Copied def element ${index + 1}:`, defChild.tagName)
      })
    }
    
    console.log('Background applied successfully')
  } catch (error) {
    console.error('Error applying background to SVG:', error)
  }
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
 * Clear template cache (useful for development)
 */
export function clearTemplateCache(): void {
  cachedTemplate = null
  templateLoadPromise = null
  console.log('🗑️ Template cache cleared')
}

/**
 * Load the letter head SVG template from the public directory
 * Includes caching to improve performance on subsequent loads
 */
export async function loadLetterHeadTemplate(templateName: string = 'letter head'): Promise<string> {
  // Force reload by skipping cache for now
  cachedTemplate = null
  
  // Return cached template if available
  if (cachedTemplate) {
    console.log('📦 Using cached SVG template:', templateName)
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
      console.log(`📥 Loading SVG template "${templateName}" from server`)
      // Add cache-busting parameter to always get latest version
      const cacheBuster = Date.now()
      const response = await fetch(`/templates/letterhead/${templateName}.svg?v=${cacheBuster}`)
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`)
      }
      cachedTemplate = await response.text()
      console.log('✅ SVG template loaded and cached')
      return cachedTemplate
    } catch (error) {
      console.error(`Failed to load template "${templateName}":`, error)
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
 * Returns the rendered SVG and the background ID that was used
 * @param data - Letterhead data
 * @param includeHeaded - Whether to include 'headed' template in random selection
 * @param specificTemplate - If provided, use this specific template instead of random selection
 */
export async function renderLetterHead(data: LetterHeadData, includeHeaded: boolean = false, specificTemplate?: string): Promise<{ svg: string; backgroundId: number; templateName: string }> {
  try {
    // Use specific template if provided, otherwise randomly select
    const templateName = specificTemplate || getRandomTemplate(includeHeaded)
    console.log(`🎨 Using template: ${templateName}`)
    
    const template = await loadLetterHeadTemplate(templateName)
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(template, 'image/svg+xml')
    
    // Check for parsing errors
    const parserError = svgDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Failed to parse SVG template')
    }

    // Apply background only for letter head template (skip for headed template)
    let usedBackgroundId = typeof data.backgroundId === 'number' ? data.backgroundId : 
                          typeof data.backgroundId === 'string' ? parseInt(data.backgroundId, 10) : 
                          getRandomBackgroundId()
    
    if (templateName !== 'headed') {
      try {
        if (!data.backgroundId) {
          console.log('Generated random background ID:', usedBackgroundId)
        } else {
          console.log('Using specified background ID:', usedBackgroundId)
        }
        
        console.log('Loading background SVG...')
        const backgroundSvg = await loadBackgroundSvg(usedBackgroundId)
        if (backgroundSvg) {
          console.log('Applying background to main SVG...')
          applyBackgroundToSvg(svgDoc, backgroundSvg)
        } else {
          console.log('No background SVG loaded')
        }
      } catch (bgError) {
        console.error('Background loading failed, continuing without background:', bgError)
        // Continue with rendering even if background fails
      }
    } else {
      console.log('Skipping background for headed template')
    }

    const svg = svgDoc.documentElement as unknown as SVGElement
    
    // Temporarily attach SVG to DOM for accurate measurements
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.visibility = 'hidden'
    tempContainer.style.pointerEvents = 'none'
    document.body.appendChild(tempContainer)
    tempContainer.appendChild(svg)

    // Route to template-specific rendering
    if (templateName === 'headed') {
      
      // Headed template has different element positions and structure
      // Organization name is in green header bar with different font
      if (data.organizationName) {
        const orgNameUpper = data.organizationName.toUpperCase()
        const orgTextElement = findTextElement(svg, 'WILLMIKE')
        
        if (orgTextElement) {
          // The green header path has been extended to width ~5400 units
          // Use very conservative width with large safety margin
          const maxWidth = 4200 // Much more conservative to prevent overflow
          
          console.log('🎨 Organization name:', orgNameUpper, 'Length:', orgNameUpper.length)
          
          // Split the organization name intelligently across two lines
          const words = orgNameUpper.split(' ')
          
          // Find the second line element (SONS)
          const allTexts = Array.from(svg.querySelectorAll('text'))
          const sonsElement = allTexts.find(text => text.textContent?.includes('SONS'))
          
          let firstLine = ''
          let secondLine = ''
          
          if (words.length === 1) {
            // Single word - put it all on first line
            firstLine = orgNameUpper
            secondLine = ''
          } else if (words.length === 2) {
            // Two words - one per line
            firstLine = words[0]
            secondLine = words[1]
          } else {
            // Multiple words - split at middle
            const midPoint = Math.ceil(words.length / 2)
            firstLine = words.slice(0, midPoint).join(' ')
            secondLine = words.slice(midPoint).join(' ')
          }
          
          // Use same font size logic as letterhead template
          // Count total characters to determine starting font size
          const charCount = orgNameUpper.length
          
          // Use very conservative starting font sizes
          let fontSize = 300 // Even smaller starting point
          if (charCount <= 10) {
            fontSize = 450 // Reduced for very short names
          } else if (charCount <= 20) {
            fontSize = 380 // Reduced for medium names
          }
          // For long names (> 20 chars), keep 300
          
          console.log('🎨 Starting with fontSize:', fontSize, 'for charCount:', charCount)
          
          // Set initial text and styling
          // Use brand color if provided, otherwise use green
          const brandColor = data.primaryBrandColor || '#068A4F'
          
          orgTextElement.textContent = firstLine
          orgTextElement.setAttribute('fill', brandColor)
          orgTextElement.setAttribute('font-size', fontSize.toString())
          orgTextElement.setAttribute('font-family', 'Montserrat ExtraBold')
          orgTextElement.setAttribute('font-weight', '800')
          
          // Set up second line if it exists
          if (sonsElement && secondLine) {
            sonsElement.textContent = secondLine
            sonsElement.setAttribute('fill', brandColor)
            sonsElement.setAttribute('font-size', fontSize.toString())
            sonsElement.setAttribute('font-family', 'Montserrat ExtraBold')
            sonsElement.setAttribute('font-weight', '800')
          } else if (sonsElement) {
            sonsElement.textContent = ''
          }
          
          // Measure both lines and reduce font size more gently until both fit
          let firstLineWidth = orgTextElement.getBBox().width
          let secondLineWidth = sonsElement && secondLine ? sonsElement.getBBox().width : 0
          let maxLineWidth = Math.max(firstLineWidth, secondLineWidth)
          
          console.log('🎨 Initial measurements - First line width:', firstLineWidth, 'Second line width:', secondLineWidth, 'Max:', maxLineWidth, 'MaxWidth:', maxWidth, 'Font size:', fontSize)
          
          // Reduce font size more aggressively if needed
          let iterations = 0
          while (maxLineWidth > maxWidth && fontSize > 50) { // Lower minimum from 100 to 50
            // Use larger reduction steps if very far from target
            const overBy = maxLineWidth - maxWidth
            const reductionStep = overBy > 2000 ? 50 : overBy > 1000 ? 25 : 10
            
            fontSize -= reductionStep
            orgTextElement.setAttribute('font-size', fontSize.toString())
            if (sonsElement && secondLine) {
              sonsElement.setAttribute('font-size', fontSize.toString())
            }
            
            firstLineWidth = orgTextElement.getBBox().width
            secondLineWidth = sonsElement && secondLine ? sonsElement.getBBox().width : 0
            maxLineWidth = Math.max(firstLineWidth, secondLineWidth)
            
            iterations++
            if (iterations % 5 === 0 || iterations === 1) {
              console.log(`🎨 Iteration ${iterations} - Font size: ${fontSize}, Max line width: ${maxLineWidth}, Over by: ${maxLineWidth - maxWidth}`)
            }
          }
          
          console.log('🎨 Final - Font size:', fontSize, 'First line width:', firstLineWidth, 'Second line width:', secondLineWidth, 'Fits:', maxLineWidth <= maxWidth)
        }
        
        // Update separator lines to match organization name color
        const orgNameColor = orgTextElement?.getAttribute('fill') || '#FEFEFE'
        const separatorLines = svg.querySelectorAll('line')
        separatorLines.forEach(line => {
          const y1 = line.getAttribute('y1')
          const y2 = line.getAttribute('y2')
          // Only update the two specific separator lines below reference fields
          if ((y1 === '1912.82' && y2 === '1912.82') || (y1 === '1940.95' && y2 === '1940.95')) {
            line.style.stroke = orgNameColor
          }
        })
      }
      
      // Add Motto below organization name in headed template
      if (data.motto && data.motto.trim()) {
        const allTexts = Array.from(svg.querySelectorAll('text'))
        
        // Position motto on same line as branch office second line (y ~1232)
        // But if no description, move motto up to description position (y ~1050)
        const hasDescription = data.description && data.description.trim()
        const mottoY = hasDescription ? 1232 : 1050 // Move up if no description
        const mottoX = 1026.58 // Aligned with organization name (moved right by 50 units)
        
        // Create motto text element
        const mottoElement = svg.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'text')
        mottoElement.setAttribute('x', mottoX.toString())
        mottoElement.setAttribute('y', mottoY.toString())
        mottoElement.setAttribute('font-size', '165')
        mottoElement.setAttribute('font-family', 'Montserrat')
        
        // Create tspan for label (red and bold)
        const labelTspan = svg.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'tspan')
        labelTspan.textContent = 'Motto: '
        labelTspan.setAttribute('fill', '#ED3237') // Red color
        labelTspan.setAttribute('font-weight', 'bold')
        
        // Create tspan for content (black and not bold)
        const contentTspan = svg.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'tspan')
        contentTspan.textContent = data.motto
        contentTspan.setAttribute('fill', '#373435') // Black color
        contentTspan.setAttribute('font-weight', 'normal')
        
        mottoElement.appendChild(labelTspan)
        mottoElement.appendChild(contentTspan)
        
        // Insert motto element after organization name elements
        const orgElements = allTexts.filter(text => 
          text.textContent?.includes('WILLMIKE') || 
          text.textContent?.includes('SONS') ||
          text.getAttribute('x') === '976.58'
        )
        if (orgElements.length > 0) {
          const lastOrgElement = orgElements[orgElements.length - 1]
          lastOrgElement.parentNode?.insertBefore(mottoElement, lastOrgElement.nextSibling)
        } else {
          svg.appendChild(mottoElement)
        }
      }
      
      // Add Description above motto in headed template
      if (data.description && data.description.trim()) {
        const descriptionY = 1050 // Above motto (motto is at 1200)
        const descriptionX = 1026.58 // Aligned with motto label
        
        // Create description text element
        const descriptionElement = svg.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'text')
        descriptionElement.setAttribute('x', descriptionX.toString())
        descriptionElement.setAttribute('y', descriptionY.toString())
        descriptionElement.setAttribute('font-size', '180')
        descriptionElement.setAttribute('font-family', 'Montserrat')
        descriptionElement.setAttribute('fill', '#373435')
        descriptionElement.setAttribute('font-weight', 'normal')
        descriptionElement.textContent = toTitleCase(data.description)
        
        // Insert description before motto or after org name
        const allTexts = Array.from(svg.querySelectorAll('text'))
        const mottoElement = allTexts.find(text => text.textContent?.includes('Motto:'))
        if (mottoElement) {
          mottoElement.parentNode?.insertBefore(descriptionElement, mottoElement)
        } else {
          const orgElements = allTexts.filter(text => 
            text.textContent?.includes('WILLMIKE') || 
            text.textContent?.includes('SONS') ||
            text.getAttribute('x') === '976.58'
          )
          if (orgElements.length > 0) {
            const lastOrgElement = orgElements[orgElements.length - 1]
            lastOrgElement.parentNode?.insertBefore(descriptionElement, lastOrgElement.nextSibling)
          } else {
            svg.appendChild(descriptionElement)
          }
        }
      }
      
      // Head Office and Branch Office in headed template
      // Collect ALL elements FIRST before modifying any of them
      const allTexts = Array.from(svg.querySelectorAll('text'))
      
      // Find all address-related elements before modification
      const abdulsamElements = allTexts.filter(text => text.textContent?.includes('Abdulsalam'))
      const minnaElements = allTexts.filter(text => text.textContent?.includes('Minna'))
      
      console.log('🏢 Found Abdulsalam elements:', abdulsamElements.length)
      console.log('🏢 Found Minna elements:', minnaElements.length)
      
      // Store references
      const headOfficeFirstLine = abdulsamElements[0]
      const headOfficeSecondLine = minnaElements[0]
      const branchOfficeFirstLine = abdulsamElements[1]
      const branchOfficeSecondLine = minnaElements[1]
      
      // Now modify head office
      if (data.headOffice && !isFieldSkipped(data.headOffice)) {
        const fullAddress = toTitleCase(data.headOffice)
        
        if (headOfficeFirstLine) {
          // Use actual width measurement to prevent overflow
          const maxWidth = 2800 // Reduced to ensure wrapping happens
          
          // Set full address initially
          headOfficeFirstLine.textContent = fullAddress
          let firstLineWidth = headOfficeFirstLine.getBBox().width
          
          console.log('📏 Head Office - Full address width:', firstLineWidth, 'Max:', maxWidth)
          
          if (firstLineWidth <= maxWidth) {
            // Fits on one line
            if (headOfficeSecondLine) headOfficeSecondLine.textContent = ''
            console.log('📏 Head Office fits on one line')
          } else {
            // Need to wrap - split by words and find best fit
            const words = fullAddress.split(' ')
            let firstLine = ''
            let secondLine = ''
            
            for (let i = 0; i < words.length; i++) {
              const testLine = firstLine + (firstLine ? ' ' : '') + words[i]
              headOfficeFirstLine.textContent = testLine
              const testWidth = headOfficeFirstLine.getBBox().width
              
              console.log(`📏 Testing word ${i}: "${testLine}" width: ${testWidth}`)
              
              if (testWidth > maxWidth && firstLine) {
                // This word pushes us over, move it to second line
                secondLine = words.slice(i).join(' ')
                console.log('📏 Breaking at word', i, '- Second line:', secondLine)
                break
              } else {
                firstLine = testLine
              }
            }
            
            headOfficeFirstLine.textContent = firstLine
            if (headOfficeSecondLine) {
              headOfficeSecondLine.textContent = secondLine
            }
            console.log('📏 Final - First line:', firstLine, '| Second line:', secondLine)
          }
        }
      } else {
        // Hide head office if skipped (but only if there's no branch address to display there)
        const hasBranchAddress = data.otherAddress && !isFieldSkipped(data.otherAddress)
        if (!hasBranchAddress) {
          const headOfficeLabel = allTexts.find(text => text.textContent?.includes('Head Office:'))
          if (headOfficeLabel) headOfficeLabel.textContent = ''
          if (headOfficeFirstLine) headOfficeFirstLine.textContent = ''
          if (headOfficeSecondLine) headOfficeSecondLine.textContent = ''
        }
      }
      
      // Now modify branch office (using pre-collected references)
      if (data.otherAddress && !isFieldSkipped(data.otherAddress)) {
        console.log('🏢 Setting branch address:', data.otherAddress)
        console.log('🏢 Branch first line element:', branchOfficeFirstLine)
        console.log('🏢 Branch second line element:', branchOfficeSecondLine)
        
        const fullAddress = toTitleCase(data.otherAddress)
        
        // Check if head office is provided
        const hasHeadOffice = data.headOffice && !isFieldSkipped(data.headOffice)
        
        // If no head office, use head office position and change label to "Address:"
        if (!hasHeadOffice) {
          // Use head office elements and position
          const allTexts = Array.from(svg.querySelectorAll('text'))
          const headOfficeLabel = allTexts.find(text => text.textContent?.includes('Head Office:'))
          
          if (headOfficeLabel) {
            headOfficeLabel.textContent = 'Address:'
          }
          
          if (headOfficeFirstLine) {
            // Use actual width measurement to prevent overflow
            const maxWidth = 2800
            
            // Set full address initially
            headOfficeFirstLine.textContent = fullAddress
            let firstLineWidth = headOfficeFirstLine.getBBox().width
            
            console.log('📏 Address (no head office) - Full address width:', firstLineWidth, 'Max:', maxWidth)
            
            if (firstLineWidth <= maxWidth) {
              // Fits on one line
              if (headOfficeSecondLine) headOfficeSecondLine.textContent = ''
              console.log('📏 Address fits on one line')
            } else {
              // Need to wrap - split by words and find best fit
              const words = fullAddress.split(' ')
              let firstLine = ''
              let secondLine = ''
              
              for (let i = 0; i < words.length; i++) {
                const testLine = firstLine + (firstLine ? ' ' : '') + words[i]
                headOfficeFirstLine.textContent = testLine
                const testWidth = headOfficeFirstLine.getBBox().width
                
                console.log(`📏 Testing word ${i}: "${testLine}" width: ${testWidth}`)
                
                if (testWidth > maxWidth && firstLine) {
                  // This word pushes us over, move it to second line
                  secondLine = words.slice(i).join(' ')
                  console.log('📏 Breaking at word', i, '- Second line:', secondLine)
                  break
                } else {
                  firstLine = testLine
                }
              }
              
              headOfficeFirstLine.textContent = firstLine
              if (headOfficeSecondLine) {
                headOfficeSecondLine.textContent = secondLine
              }
              console.log('📏 Final - First line:', firstLine, '| Second line:', secondLine)
            }
          }
          
          // Hide branch office elements
          const branchOfficeLabel = allTexts.find(text => text.textContent?.includes('Branch Office:'))
          if (branchOfficeLabel) branchOfficeLabel.textContent = ''
          if (branchOfficeFirstLine) branchOfficeFirstLine.textContent = ''
          if (branchOfficeSecondLine) branchOfficeSecondLine.textContent = ''
          
          // Hide the two footer lines at y=11151.38
          const footerLines = svg.querySelectorAll('line')
          footerLines.forEach(line => {
            const y1 = line.getAttribute('y1')
            const y2 = line.getAttribute('y2')
            if (y1 === '11151.38' && y2 === '11151.38') {
              line.setAttribute('opacity', '0')
            }
          })
          
          // Reposition Tel and Email below the address when no head office
          const phoneLabel = findTextElement(svg, 'Tel:')
          const phoneElement = findTextElement(svg, '09027222282')
          const emailLabel = findTextElement(svg, 'Email:')
          const emailElement = findTextElement(svg, 'mattewwsonadl')
          
          // Address content has transform matrix(0.942221 0 0 1 1503.98 -5462.27)
          // Content is at x=4133.86 in template, transform shifts it by 1503.98
          // Actual X position: (4133.86 * 0.942221) + 1503.98 = 5398.94
          // Y transform: -5462.27, so y=5999.51 becomes 537.24, y=6152.56 becomes 690.29
          const addressContentX = 5398.94  // Actual X position after transform
          const telY = 920  // Below address second line
          const emailY = 1080  // Below Tel
          
          // Check if phone is provided
          const hasPhones = data.phones && data.phones.length > 0 && data.phones.some(p => p && p.trim())
          
          // Reposition and style Tel with label and content on same line
          if (phoneLabel && phoneElement && hasPhones) {
            phoneLabel.removeAttribute('class')
            phoneLabel.setAttribute('y', telY.toString())
            phoneLabel.setAttribute('fill', '#ED3237')  // Red color
            phoneLabel.setAttribute('font-weight', 'bold')
            phoneLabel.setAttribute('x', addressContentX.toString())
            phoneLabel.setAttribute('font-family', 'Montserrat')
            phoneLabel.setAttribute('font-size', '140.33')
            
            phoneElement.removeAttribute('class')
            phoneElement.setAttribute('y', telY.toString())
            phoneElement.setAttribute('x', (addressContentX + 300).toString())  // Offset after "Tel: "
            phoneElement.setAttribute('fill', '#373435')  // Same color as address content
            phoneElement.setAttribute('font-weight', 'normal')  // Not bold
            phoneElement.setAttribute('font-family', 'Montserrat')
            phoneElement.setAttribute('font-size', '140.33')
          } else if (phoneLabel && phoneElement) {
            // Hide phone if not provided
            phoneLabel.textContent = ''
            phoneElement.textContent = ''
          }
          
          // Reposition and style Email with label and content on same line
          // If no phone, email takes tel position (telY), otherwise uses emailY
          const actualEmailY = hasPhones ? emailY : telY
          
          if (emailLabel && emailElement) {
            emailLabel.removeAttribute('class')
            emailLabel.setAttribute('y', actualEmailY.toString())
            emailLabel.setAttribute('fill', '#ED3237')  // Red color
            emailLabel.setAttribute('font-weight', 'bold')
            emailLabel.setAttribute('x', addressContentX.toString())
            emailLabel.setAttribute('font-family', 'Montserrat')
            emailLabel.setAttribute('font-size', '140.33')
            
            // Handle multiple emails in no head office layout
            const emailsArray = data.emails ? [...data.emails] : []
            const emails = emailsArray.filter(email => email && email.trim()).slice(0, 2)
            
            if (emails.length > 0) {
              // First email
              // Use Tel's X offset when no phones (300 + 165 for spacing), otherwise use Email's offset (500)
              const emailContentX = hasPhones ? (addressContentX + 500) : (addressContentX + 465)
              
              emailElement.removeAttribute('class')
              emailElement.textContent = emails[0]
              emailElement.setAttribute('y', actualEmailY.toString())
              emailElement.setAttribute('x', emailContentX.toString())
              emailElement.setAttribute('fill', '#373435')  // Same color as address content
              emailElement.setAttribute('font-weight', 'normal')  // Not bold
              emailElement.setAttribute('font-family', 'Montserrat')
              emailElement.setAttribute('font-size', '140.33')
              
              // Second email below the Email: label
              if (emails.length > 1) {
                const secondEmailY = actualEmailY + 140 // Position below Email: label
                
                // Create or update second email element
                let secondEmailElement = svg.querySelector(`text[data-email-below-label="true"]`) as SVGTextElement | null
                if (!secondEmailElement) {
                  secondEmailElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                  secondEmailElement.setAttribute('data-email-below-label', 'true')
                  emailElement.parentNode?.appendChild(secondEmailElement)
                }
                
                secondEmailElement.textContent = emails[1]
                secondEmailElement.setAttribute('x', emailContentX.toString())
                secondEmailElement.setAttribute('y', secondEmailY.toString())
                secondEmailElement.setAttribute('fill', '#373435')  // Same color as address content
                secondEmailElement.setAttribute('font-weight', 'normal')  // Not bold
                secondEmailElement.setAttribute('font-family', emailElement.getAttribute('font-family') || '')
                secondEmailElement.setAttribute('font-size', emailElement.getAttribute('font-size') || '')
              }
            }
          }
        } else {
          // Head office exists, use normal branch office position
          if (branchOfficeFirstLine) {
            // Use actual width measurement to prevent overflow
            const maxWidth = 2800 // Reduced to ensure wrapping happens
            
            // Set full address initially
            branchOfficeFirstLine.textContent = fullAddress
            let firstLineWidth = branchOfficeFirstLine.getBBox().width
            
            console.log('📏 Branch Office - Full address width:', firstLineWidth, 'Max:', maxWidth)
            
            if (firstLineWidth <= maxWidth) {
              // Fits on one line
              if (branchOfficeSecondLine) branchOfficeSecondLine.textContent = ''
              console.log('📏 Branch Office fits on one line')
              console.log('🏢 Set first line to:', branchOfficeFirstLine.textContent)
            } else {
              // Need to wrap - split by words and find best fit
              const words = fullAddress.split(' ')
              let firstLine = ''
              let secondLine = ''
              
              for (let i = 0; i < words.length; i++) {
                const testLine = firstLine + (firstLine ? ' ' : '') + words[i]
                branchOfficeFirstLine.textContent = testLine
                const testWidth = branchOfficeFirstLine.getBBox().width
                
                console.log(`📏 Testing word ${i}: "${testLine}" width: ${testWidth}`)
                
                if (testWidth > maxWidth && firstLine) {
                  // This word pushes us over, move it to second line
                  secondLine = words.slice(i).join(' ')
                  console.log('📏 Breaking at word', i, '- Second line:', secondLine)
                  break
                } else {
                  firstLine = testLine
                }
              }
              
              branchOfficeFirstLine.textContent = firstLine
              console.log('🏢 Set first line to:', branchOfficeFirstLine.textContent)
              if (branchOfficeSecondLine) {
                branchOfficeSecondLine.textContent = secondLine
                console.log('🏢 Set second line to:', branchOfficeSecondLine.textContent)
              }
              console.log('📏 Final - First line:', firstLine, '| Second line:', secondLine)
            }
          } else {
            console.error('🏢 ❌ Could not find branch office first line element')
          }
        }
      } else {
        // Hide branch office if skipped
        const allTexts = Array.from(svg.querySelectorAll('text'))
        const branchOfficeLabel = allTexts.find(text => text.textContent?.includes('Branch Office:'))
        if (branchOfficeLabel) branchOfficeLabel.textContent = ''
        const abdulsamElements = allTexts.filter(text => text.textContent?.includes('Abdulsalam'))
        if (abdulsamElements[1]) abdulsamElements[1].textContent = ''
        const minnaElements = allTexts.filter(text => text.textContent?.includes('Minna'))
        if (minnaElements[1]) minnaElements[1].textContent = ''
      }
      
      // Handle phones with comprehensive logic (using letter head template logic)
      if (!isFieldSkipped(data.phones)) {
        const validatedPhones = validateAndNormalizePhones(data.phones!)
        const phoneElement = findTextElement(svg, '09027222282')
        
        if (phoneElement && validatedPhones.length > 0) {
          const hasEmails = !isFieldSkipped(data.emails)
          const hasHeadOffice = data.headOffice && !isFieldSkipped(data.headOffice)
          
          // Find phone label
          const phoneLabel = findTextElement(svg, 'Tel:')
          
          // Skip normal phone positioning if we're in the no head office layout (already handled above)
          if (hasHeadOffice) {
            if (validatedPhones.length === 1) {
            phoneElement.textContent = validatedPhones[0]
            
            // If no emails, center the phone number
            if (!hasEmails) {
              phoneElement.setAttribute('x', '4133.86')
              phoneElement.setAttribute('text-anchor', 'middle')
              
              if (phoneLabel) {
                phoneLabel.setAttribute('x', '3200')
              }
            } else {
              // Has emails: keep phone on same line as email (y=11211.98)
              // Don't apply any transform - let it stay aligned with email
              console.log('📞 Keeping single phone aligned with emails on same line')
            }
          } else if (validatedPhones.length === 2) {
            // Show both on same line with spacing (regardless of email presence)
            phoneElement.textContent = ''
            for (let i = 0; i < validatedPhones.length; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              if (i > 0) tspan.setAttribute('dx', '30')
              phoneElement.appendChild(tspan)
            }
            
            // If no emails, center the phone numbers
            if (!hasEmails) {
              phoneElement.setAttribute('x', '4133.86')
              phoneElement.setAttribute('text-anchor', 'middle')
              
              if (phoneLabel) {
                phoneLabel.setAttribute('x', '2600')
              }
            }
          } else if (validatedPhones.length === 3) {
            // For exactly 3 numbers: first 2 on first line with spacing, 3rd below the first
            phoneElement.textContent = ''
            
            // Create tspan elements for first two numbers
            for (let i = 0; i < 2; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              if (i > 0) tspan.setAttribute('dx', '30')
              phoneElement.appendChild(tspan)
            }
            
            // Get the position and styling of the current text element
            const x = phoneElement.getAttribute('x')
            const y = phoneElement.getAttribute('y')
            const textClass = phoneElement.getAttribute('class')
            const fontSize = phoneElement.getAttribute('font-size')
            const fontFamily = phoneElement.getAttribute('font-family')
            const fill = phoneElement.getAttribute('fill')
            
            // If no emails, center the phone numbers
            if (!hasEmails) {
              phoneElement.setAttribute('x', '4133.86')
              phoneElement.setAttribute('text-anchor', 'middle')
              
              if (phoneLabel) {
                phoneLabel.setAttribute('x', '2600')
              }
            }
            
            if (x && y) {
              const yNum = parseFloat(y)
              const lineHeight = 140
              
              // Create a new text element for the 3rd number (below first number)
              const thirdPhone = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              const centerX = !hasEmails ? '4133.86' : x
              thirdPhone.setAttribute('x', centerX)
              thirdPhone.setAttribute('y', (yNum + lineHeight).toString())
              if (!hasEmails) thirdPhone.setAttribute('text-anchor', 'middle')
              if (textClass) thirdPhone.setAttribute('class', textClass)
              if (fontSize) thirdPhone.setAttribute('font-size', fontSize)
              if (fontFamily) thirdPhone.setAttribute('font-family', fontFamily)
              if (fill) thirdPhone.setAttribute('fill', fill)
              thirdPhone.textContent = validatedPhones[2]
              
              phoneElement.parentElement?.appendChild(thirdPhone) || phoneElement.parentNode?.appendChild(thirdPhone)
            }
          } else {
            // For 4+ numbers: first 2 on first line with spacing, next 2 on second line with spacing
            phoneElement.textContent = ''
            
            // Create tspan elements for first two numbers
            for (let i = 0; i < 2; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              if (i > 0) tspan.setAttribute('dx', '30')
              phoneElement.appendChild(tspan)
            }
            
            // If no emails, center the phone numbers
            if (!hasEmails) {
              phoneElement.setAttribute('x', '4133.86')
              phoneElement.setAttribute('text-anchor', 'middle')
              
              if (phoneLabel) {
                phoneLabel.setAttribute('x', '2600')
              }
            }
            
            // Get the position and styling of the current text element
            const x = phoneElement.getAttribute('x')
            const y = phoneElement.getAttribute('y')
            const textClass = phoneElement.getAttribute('class')
            const fontSize = phoneElement.getAttribute('font-size')
            const fontFamily = phoneElement.getAttribute('font-family')
            const fill = phoneElement.getAttribute('fill')
            
            if (x && y) {
              const yNum = parseFloat(y)
              const lineHeight = 150
              
              // Create a new text element for the 3rd and 4th numbers on second line
              const secondLineText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              const centerX = !hasEmails ? '4133.86' : x
              secondLineText.setAttribute('x', centerX)
              secondLineText.setAttribute('y', (yNum + lineHeight).toString())
              if (!hasEmails) secondLineText.setAttribute('text-anchor', 'middle')
              if (textClass) secondLineText.setAttribute('class', textClass)
              if (fontSize) secondLineText.setAttribute('font-size', fontSize)
              if (fontFamily) secondLineText.setAttribute('font-family', fontFamily)
              if (fill) secondLineText.setAttribute('fill', fill)
              
              // Use tspan elements for proper spacing on second line too
              for (let i = 2; i < Math.min(4, validatedPhones.length); i++) {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                tspan.textContent = validatedPhones[i]
                if (i > 2) tspan.setAttribute('dx', '30')
                secondLineText.appendChild(tspan)
              }
              
              phoneElement.parentElement?.appendChild(secondLineText) || phoneElement.parentNode?.appendChild(secondLineText)
            }
          }
          }
        }
      } else {
        hideTextElements(svg, '09027222282')
        hideTextElements(svg, 'Tel:')
      }
      
      // Handle emails with comprehensive logic (using letter head template logic)
      if (!isFieldSkipped(data.emails)) {
        const emailElement = findTextElement(svg, 'mattewwsonadl')
        const emailsArray = data.emails ? [...data.emails] : []
        const emails = emailsArray.filter(email => email && email.trim()).slice(0, 2)
        
        if (emailElement && emails.length > 0) {
          const hasPhones = !isFieldSkipped(data.phones)
          const hasHeadOffice = data.headOffice && !isFieldSkipped(data.headOffice)
          
          // Find email label
          const emailLabel = findTextElement(svg, 'Email:')
          
          // Skip normal email positioning if we're in the no head office layout (already handled above)
          if (hasHeadOffice) {
            if (emails.length === 1) {
              emailElement.textContent = emails[0]
              
              // If no phones, center the email
              if (!hasPhones) {
                emailElement.removeAttribute('class')
                emailElement.setAttribute('x', '4500')
                emailElement.setAttribute('text-anchor', 'middle')
                emailElement.setAttribute('font-family', 'Montserrat')
                emailElement.setAttribute('font-size', '140.33')
                
                if (emailLabel) {
                  emailLabel.removeAttribute('class')
                  emailLabel.setAttribute('x', '3200')
                  emailLabel.setAttribute('font-family', 'Montserrat')
                  emailLabel.setAttribute('font-size', '140.33')
                  emailLabel.setAttribute('font-weight', 'bold')
                  console.log('📧 Email label positioned at x=3200, content at x=4500')
                }
              }
            } else if (emails.length === 2) {
              if (!hasPhones) {
                // No phones: show both on same line with spacing and center them
                emailElement.removeAttribute('class')
                emailElement.textContent = `${emails[0]}     ${emails[1]}`
                emailElement.setAttribute('x', '4600')
                emailElement.setAttribute('text-anchor', 'middle')
                emailElement.setAttribute('font-family', 'Montserrat')
                emailElement.setAttribute('font-size', '140.33')
                
                if (emailLabel) {
                  emailLabel.removeAttribute('class')
                  emailLabel.setAttribute('x', '2500')
                  emailLabel.setAttribute('font-family', 'Montserrat')
                  emailLabel.setAttribute('font-size', '140.33')
                  emailLabel.setAttribute('font-weight', 'bold')
                }
              } else {
                // Has phones: render vertically with alignment to phone lines
                emailElement.textContent = emails[0]
                
                const x = emailElement.getAttribute('x')
                const y = emailElement.getAttribute('y')
                const textClass = emailElement.getAttribute('class')
                const fontSize = emailElement.getAttribute('font-size')
                const fontFamily = emailElement.getAttribute('font-family')
                const fill = emailElement.getAttribute('fill')
                
                if (x && y) {
                  const yNum = parseFloat(y)
                  const secondEmail = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                  secondEmail.setAttribute('x', x)
                  secondEmail.setAttribute('y', (yNum + 140).toString())
                  if (textClass) secondEmail.setAttribute('class', textClass)
                  if (fontSize) secondEmail.setAttribute('font-size', fontSize)
                  if (fontFamily) secondEmail.setAttribute('font-family', fontFamily)
                  if (fill) secondEmail.setAttribute('fill', fill)
                  secondEmail.textContent = emails[1]
                  
                  emailElement.parentElement?.appendChild(secondEmail) || emailElement.parentNode?.appendChild(secondEmail)
                }
              }
            }
          }
        }
      } else {
        hideTextElements(svg, 'mattewwsonadl')
        hideTextElements(svg, 'Email:')
      }
      
      // Handle registration number (RC NO) in headed template
      const rcTextElement = findTextElement(svg, 'RC NO')
      if (rcTextElement && data.registrationNumber && data.registrationNumber !== 'N/A') {
        // Remove transform from parent group if it exists
        const parentG = rcTextElement.parentElement
        if (parentG && parentG.tagName === 'g') {
          parentG.removeAttribute('transform')
        }
        
        rcTextElement.removeAttribute('class')  // Remove CSS class that might hide content
        rcTextElement.textContent = `RC NO.: ${data.registrationNumber}`
        rcTextElement.setAttribute('font-family', 'Montserrat')
        rcTextElement.setAttribute('font-size', '92.98')
        rcTextElement.setAttribute('font-weight', 'bold')
        rcTextElement.setAttribute('fill', '#373435')  // Black text
        rcTextElement.style.fill = '#373435'
        rcTextElement.setAttribute('opacity', '1')
        // Position inside the green curved shape below logo (y range ~180-1289)
        rcTextElement.setAttribute('x', '537.77')  // Centered under logo
        rcTextElement.setAttribute('y', '1150')  // Inside green curved shape
        rcTextElement.setAttribute('text-anchor', 'middle')
        console.log('📋 RC NO set:', rcTextElement.textContent)
        console.log('📋 RC NO position:', rcTextElement.getAttribute('x'), rcTextElement.getAttribute('y'))
        console.log('📋 RC NO parent transform removed:', parentG?.hasAttribute('transform') === false)
      } else if (rcTextElement) {
        // Hide RC element if no registration number provided
        rcTextElement.textContent = ''
      }
      
      // Hide ellipse placeholder in headed template (always, regardless of logo upload)
      const ellipse = svg.querySelector('ellipse[cx="643.77"]')
      if (ellipse) {
        ellipse.setAttribute('opacity', '0')
      }
      
      // Logo injection for headed template
      removeTemplateLogo(svg)
      if (data.logoDataUrl) {
        // Headed template has image placeholder - inject there
        await injectLogo(svg, data.logoDataUrl, data.organizationName || '', 'headed')
        
        // Add transparent watermark logo in the center
        await injectWatermarkLogo(svg, data.logoDataUrl)
      }
      
      // Remove optional fields if not included
      if (!data.includeOptionalFields) {
        removeOptionalFields(svg)
      }
    } else {
      // Original letter head template rendering
      await renderLetterHeadTemplate(svg, data)
    }

    // Get final SVG content
    const serializer = new XMLSerializer()
    
    // Serialize the svg element directly (not svgDoc, which has null documentElement after appendChild)
    let finalSvg = serializer.serializeToString(svg)
    
    // Remove SVG from temporary container and clean up
    document.body.removeChild(tempContainer)
    
    // Inject CSS variables for brand color
    if (data.primaryBrandColor) {
      finalSvg = injectCSSVariables(finalSvg, data.primaryBrandColor)
    }
    
    return { svg: finalSvg, backgroundId: usedBackgroundId, templateName }
  } catch (error) {
    console.error('❌ Error rendering letterhead:', error)
    throw error
  }
}

/**
 * Render fields for original letter head template
 */
/**
 * Render fields for original letter head template
 */
async function renderLetterHeadTemplate(svg: SVGElement, data: LetterHeadData): Promise<void> {
  console.log('📝 renderLetterHeadTemplate called with data:', {
    organizationName: data.organizationName,
    headOffice: data.headOffice,
    otherAddress: data.otherAddress,
    phones: data.phones,
    emails: data.emails
  })
  
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
      
      // Check if organization name has exactly two words
      const words = orgNameUpper.trim().split(/\s+/)
      const isTwoWords = words.length === 2
      
      // Set font size based on character count - Large size for short names, very large for long names
      let fontSize = 3400 // Use 3400px for short names (25 or fewer characters)
      
      // For two-word names using Montserrat, use moderate sizing
      if (isTwoWords) {
        if (charCount <= 10) {
          fontSize = 500  // Further reduced
        } else if (charCount <= 20) {
          fontSize = 410  // Further reduced
        } else {
          fontSize = 330  // Further reduced
        }
      } else if (charCount > 25) {
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
      
      // Use the words variable already declared above for font selection
      const fontFamily = words.length === 2 ? 'Montserrat ExtraBold' : 'Oswald'
      const fontWeight = words.length === 2 ? '800' : '600'
      
      let styleString = `font-size:${fontSize}px; font-family:'${fontFamily}'; font-weight:${fontWeight}; fill:${brandColor};`
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
        rcTextElement.setAttribute('font-family', 'Montserrat')
        rcTextElement.setAttribute('font-weight', 'bold')
        
        // Position RC number consistently regardless of logo presence
        try {
          // Always position RC above org name, shifted left from right edge
          const bbox = orgTextElement.getBBox()
          const orgNameRightEdge = bbox.x + bbox.width
          const orgNameTop = bbox.y
          
          const rcX = orgNameRightEdge - 200 // Shift 200 units to the left
          const rcY = orgNameTop + 40 // Position below with spacing (changed from -5 to +40)
          
          rcTextElement.setAttribute('x', rcX.toString())
          rcTextElement.setAttribute('y', rcY.toString())
          rcTextElement.setAttribute('text-anchor', 'end') // Right-align
          rcTextElement.setAttribute('dominant-baseline', 'auto')
        } catch (e) {
          // Fallback to default position if getBBox fails
          rcTextElement.setAttribute('x', '712')
          rcTextElement.setAttribute('y', '890')
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
    
    console.log('🔍 Address Debug:', {
      otherAddress: data.otherAddress,
      headOffice: data.headOffice,
      isOtherSkipped: isFieldSkipped(data.otherAddress),
      isHeadSkipped: isFieldSkipped(data.headOffice)
    })
    
    // Find the Minna address label
    const addressLabel = allTexts.find(text => text.textContent?.includes('Minna Address:') || text.textContent?.includes('Address:'))
    
    // Store the branch address Y position for head office to use if branch is missing
    let branchAddressY: number | null = null
    let headOfficeY: number | null = null
    
    // Check if motto and/or description are provided (independent of optional fields toggle)
    const hasMottoOrDescription = data.motto?.trim() || data.description?.trim()
    
    // First pass: Capture the original Y positions for both branch and head office
    for (const text of allTexts) {
      const content = text.textContent || ''
      if (content.includes('Hydro') || content.includes('Minna')) {
        const originalY = parseFloat(text.getAttribute('y') || '0')
        branchAddressY = originalY + 30
      }
      if (content.includes('Enogie') || content.includes('Benin')) {
        const currentY = parseFloat(text.getAttribute('y') || '0')
        const addressIsMissing = !data.otherAddress || data.otherAddress.trim() === '' || isFieldSkipped(data.otherAddress)
        if (addressIsMissing && branchAddressY !== null) {
          headOfficeY = branchAddressY
        } else {
          const yOffset = addressIsMissing ? 30 : 60
          headOfficeY = currentY + yOffset
        }
      }
    }
    
    // Find the address content
    for (const text of allTexts) {
      const content = text.textContent || ''
      if (content.includes('Hydro') || content.includes('Minna')) {
        if (!isFieldSkipped(data.otherAddress)) {
          // User provided an address - center the complete "Address: Content" unit
          const otherAddressTitleCase = toTitleCase(data.otherAddress!)
          
          // Determine label: use "Branch Address:" if both branch and head office provided
          const hasBothAddresses = !isFieldSkipped(data.headOffice)
          const addressLabelText = hasBothAddresses ? 'Branch Address:' : 'Address:'
          
          const fullAddressText = `${addressLabelText} ${otherAddressTitleCase}`
          text.textContent = fullAddressText
          // Center the entire text under organization name
          text.setAttribute('x', orgCenterX.toString())
          text.setAttribute('text-anchor', 'middle')
          
          // If description/motto provided, shift branch address down
          let finalBranchY = branchAddressY!
          if (hasMottoOrDescription && headOfficeY !== null) {
            // Branch goes below motto if it exists, otherwise below description
            if (data.motto?.trim() && !data.description?.trim()) {
              // Only motto exists (no description): motto at branchAddressY, branch 150 units below
              finalBranchY = branchAddressY! + 150
            } else if (data.motto?.trim() && data.description?.trim()) {
              // Both description and motto exist: description at branchAddressY, motto at branchAddressY + 150
              finalBranchY = branchAddressY! + 300 // motto position + 150
            } else if (data.description?.trim() && !data.motto?.trim()) {
              // Only description exists, no motto - branch goes 150 units below description
              finalBranchY = branchAddressY! + 150
            }
          }
          
          // Shift branch down by 30 units
          finalBranchY = finalBranchY + 30
          
          text.setAttribute('y', finalBranchY.toString())
          // Apply red and bold styling to the label part only using tspan
          text.innerHTML = `<tspan fill="red" font-weight="bold">${addressLabelText}</tspan> ${otherAddressTitleCase}`
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
          
          // Determine Y positioning: If address (branch) is missing, use branch position
          const currentY = parseFloat(text.getAttribute('y') || '0')
          // Check if address is truly missing - check for empty, null, undefined, or skip patterns
          const addressIsMissing = !data.otherAddress || 
                                   data.otherAddress.trim() === '' || 
                                   isFieldSkipped(data.otherAddress)
          
          // If branch missing and we captured its position, use that exact position
          // Otherwise use standard offsets: 30 for branch position, 60 for head office position
          let finalY: number
          if (addressIsMissing && branchAddressY !== null) {
            finalY = branchAddressY // Use exact branch position
          } else {
            const yOffset = addressIsMissing ? 30 : 60
            finalY = currentY + yOffset
          }
          
          headOfficeY = finalY // Store original position for motto/description positioning
          
          // If description/motto provided, adjust head office positioning
          if (hasMottoOrDescription && branchAddressY !== null) {
            // Check if branch is available or not
            const branchIsMissing = !data.otherAddress || data.otherAddress.trim() === '' || isFieldSkipped(data.otherAddress)
            
            if (branchIsMissing) {
              // Branch is unavailable - head office goes 150 units below motto
              if (data.description?.trim() && data.motto?.trim()) {
                // Both description and motto exist: motto is at branchAddressY + 150
                finalY = branchAddressY + 300 // motto position + 150
              } else if (data.motto?.trim()) {
                // Only motto exists: motto is at branchAddressY
                finalY = branchAddressY + 150
              } else if (data.description?.trim()) {
                // Only description exists: head office goes 150 units below description
                finalY = branchAddressY + 150
              }
            } else {
              // Branch is available - head office goes 150 units below branch
              if (data.description?.trim() && !data.motto?.trim()) {
                // Only description exists, no motto: branch is at motto position (branchAddressY + 150)
                // Head office should be 150 units below branch
                finalY = branchAddressY + 300 // branch position (branchAddressY + 150) + 150
              } else if (data.description?.trim() && data.motto?.trim()) {
                // Both description and motto exist: description, motto, branch, then head office
                // Branch is at branchAddressY + 300, so head office is at branchAddressY + 300 + 150
                finalY = branchAddressY + 450
              } else if (data.motto?.trim()) {
                // Only motto exists: motto at branchAddressY, branch at branchAddressY + 150
                // Head office is at branch position + 150
                finalY = branchAddressY + 300 // branchAddressY + 150 (branch) + 150 (gap)
              }
            }
          }
          
          // Shift head office down by 95 units
          finalY = finalY + 95
          
          text.setAttribute('y', finalY.toString())
          
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
      
      // Check if emails were provided (for layout decisions)
      const hasEmails = !isFieldSkipped(data.emails)
      
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
          
          // If no emails, display ALL phone numbers horizontally and centered
          if (!hasEmails) {
            // Clear existing text content
            text.textContent = ''
            
            // Create tspan elements for all phone numbers with proper spacing
            for (let i = 0; i < validatedPhones.length; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              
              // Add spacing between phone numbers
              if (i > 0) {
                tspan.setAttribute('dx', '30') // 30 units of space between numbers
              }
              
              text.appendChild(tspan)
            }
            
            // Center the phone numbers under the line (same as email centering)
            text.setAttribute('x', '4200')
            text.setAttribute('text-anchor', 'middle')
            const currentY = parseFloat(text.getAttribute('y') || '0')
            text.setAttribute('y', (currentY + 840).toString())
            
            if (phoneLabel) {
              phoneLabel.textContent = 'Tel:'
              const labelY = parseFloat(phoneLabel.getAttribute('y') || '0')
              phoneLabel.setAttribute('y', (labelY + 840).toString())
              
              // Adjust label position based on number of phones - keep close to the numbers without overlap
              if (validatedPhones.length === 1) {
                phoneLabel.setAttribute('x', '3300')
              } else if (validatedPhones.length === 2) {
                phoneLabel.setAttribute('x', '2750')
              } else if (validatedPhones.length === 3) {
                phoneLabel.setAttribute('x', '2200')
              } else {
                phoneLabel.setAttribute('x', '1550')
              }
              phoneLabel.removeAttribute('text-anchor')
              
              // Create a horizontal line above the phone section (no emails case)
              const phoneLabelY = parseFloat(phoneLabel.getAttribute('y') || '0')
              const phoneLineY = phoneLabelY + 5000 // Position line below the phone numbers
              
              const phoneLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
              phoneLine.setAttribute('class', 'fil0')
              phoneLine.setAttribute('stroke', '#000000')
              phoneLine.setAttribute('stroke-width', '13.89')
              phoneLine.setAttribute('x1', '860.1')
              phoneLine.setAttribute('y1', phoneLineY.toString())
              phoneLine.setAttribute('x2', '7400')
              phoneLine.setAttribute('y2', phoneLineY.toString())
              
              svg.appendChild(phoneLine)
            }
          }
          // If emails exist, use original multi-line layout for 3+ phones
          else if (validatedPhones.length === 1) {
            text.textContent = validatedPhones[0]
            // Shift phone down when emails are present
            const currentY = parseFloat(text.getAttribute('y') || '0')
            text.setAttribute('y', (currentY + 640).toString())
            if (phoneLabel) {
              const labelY = parseFloat(phoneLabel.getAttribute('y') || '0')
              phoneLabel.setAttribute('y', (labelY + 640).toString())
            }
          }
          else if (validatedPhones.length === 2) {
            // Clear existing text content
            text.textContent = ''
            
            // Create tspan elements for each phone number with proper spacing
            for (let i = 0; i < validatedPhones.length; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              
              // Add spacing between phone numbers (dx attribute for horizontal offset)
              if (i > 0) {
                tspan.setAttribute('dx', '30') // 30 units of space between numbers
              }
              
              text.appendChild(tspan)
            }
            // Shift phone down when emails are present
            const currentY = parseFloat(text.getAttribute('y') || '0')
            text.setAttribute('y', (currentY + 640).toString())
            if (phoneLabel) {
              const labelY = parseFloat(phoneLabel.getAttribute('y') || '0')
              phoneLabel.setAttribute('y', (labelY + 640).toString())
            }
          } else if (validatedPhones.length === 3) {
            // For exactly 3 numbers: first 2 on first line with spacing, 3rd below the first
            text.textContent = ''
            
            // Create tspan elements for first two numbers
            for (let i = 0; i < 2; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              
              if (i > 0) {
                tspan.setAttribute('dx', '30') // Space between first two numbers
              }
              
              text.appendChild(tspan)
            }
            
            // Shift phone down when emails are present
            const currentY = parseFloat(text.getAttribute('y') || '0')
            text.setAttribute('y', (currentY + 640).toString())
            if (phoneLabel) {
              const labelY = parseFloat(phoneLabel.getAttribute('y') || '0')
              phoneLabel.setAttribute('y', (labelY + 640).toString())
            }
            
            // Get the position and styling of the current text element
            const x = text.getAttribute('x')
            const y = text.getAttribute('y')
            const textClass = text.getAttribute('class')
            const fontSize = text.getAttribute('font-size')
            const fontFamily = text.getAttribute('font-family')
            const fill = text.getAttribute('fill')
            
            if (x && y) {
              const yNum = parseFloat(y)
              const lineHeight = 140 // Increased spacing to prevent overlap
              
              // Create a new text element for the 3rd number (below first number)
              const thirdPhone = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              thirdPhone.setAttribute('x', x)
              thirdPhone.setAttribute('y', (yNum + lineHeight).toString())
              if (textClass) thirdPhone.setAttribute('class', textClass)
              if (fontSize) thirdPhone.setAttribute('font-size', fontSize)
              if (fontFamily) thirdPhone.setAttribute('font-family', fontFamily)
              if (fill) thirdPhone.setAttribute('fill', fill)
              thirdPhone.textContent = validatedPhones[2]
              
              // Insert the new element
              if (parentGroup) {
                parentGroup.appendChild(thirdPhone)
              } else {
                text.parentNode?.appendChild(thirdPhone)
              }
            }
          } else {
            // For 4+ numbers: first 2 on first line with spacing, next 2 on second line with spacing
            text.textContent = ''
            
            // Create tspan elements for first two numbers
            for (let i = 0; i < 2; i++) {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
              tspan.textContent = validatedPhones[i]
              
              if (i > 0) {
                tspan.setAttribute('dx', '30') // Space between first two numbers
              }
              
              text.appendChild(tspan)
            }
            
            // Shift phone down when emails are present
            const currentY = parseFloat(text.getAttribute('y') || '0')
            text.setAttribute('y', (currentY + 640).toString())
            if (phoneLabel) {
              const labelY = parseFloat(phoneLabel.getAttribute('y') || '0')
              phoneLabel.setAttribute('y', (labelY + 640).toString())
            }
            
            // Get the position and styling of the current text element
            const x = text.getAttribute('x')
            const y = text.getAttribute('y')
            const textClass = text.getAttribute('class')
            const fontSize = text.getAttribute('font-size')
            const fontFamily = text.getAttribute('font-family')
            const fill = text.getAttribute('fill')
            
            if (x && y) {
              const yNum = parseFloat(y)
              const lineHeight = 150 // Move phone numbers down further
              
              // Create a new text element for the 3rd and 4th numbers on second line
              const secondLineText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              secondLineText.setAttribute('x', x)
              secondLineText.setAttribute('y', (yNum + lineHeight).toString())
              if (textClass) secondLineText.setAttribute('class', textClass)
              if (fontSize) secondLineText.setAttribute('font-size', fontSize)
              if (fontFamily) secondLineText.setAttribute('font-family', fontFamily)
              if (fill) secondLineText.setAttribute('fill', fill)
              
              // Use tspan elements for proper spacing on second line too
              for (let i = 2; i < Math.min(4, validatedPhones.length); i++) {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                tspan.textContent = validatedPhones[i]
                
                if (i > 2) {
                  tspan.setAttribute('dx', '30') // Space between third and fourth numbers
                }
                
                secondLineText.appendChild(tspan)
              }
              
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
    
    // Check if phone numbers were provided
    const hasPhones = data.phones && data.phones.length > 0
    
    // Check if emails were provided
    const hasEmails = data.emails && data.emails.length > 0
    
    // Remove the original horizontal line at y=10450 first
    const allLines = svg.querySelectorAll('line')
    for (const line of allLines) {
      const y1 = line.getAttribute('y1')
      const y2 = line.getAttribute('y2')
      const x1 = line.getAttribute('x1')
      const x2 = line.getAttribute('x2')
      
      // Remove the original line (matches x1=460.1, x2=7800, y around 10450)
      if (x1 === '460.1' && x2 === '7800' && y1 === y2) {
        const currentY = parseFloat(y1 || '0')
        if (currentY >= 10400 && currentY <= 11000) {
          line.remove()
        }
      }
    }
    
    console.log('Email data:', data.emails)
    console.log('Has phones:', hasPhones)
    
    // Find and update the email content
    let emailFound = false
    for (const text of emailTexts) {
      const textContent = (text.textContent || '').trim()
      console.log('Checking text element:', textContent)
      
      // Check for the placeholder email with or without spaces
      if (textContent.includes('mathewuzzy') || textContent.match(/mathew.*@.*gmail.*\.com/i)) {
        emailFound = true
        console.log('Found email placeholder!')
        console.log('Raw emails:', data.emails)
        console.log('Emails type:', typeof data.emails)
        console.log('Emails length:', data.emails?.length)
        
        // Convert proxy to regular array if needed
        const emailsArray = data.emails ? [...data.emails] : []
        console.log('Converted emails array:', emailsArray)
        
        if (emailsArray && emailsArray.length > 0) {
          // Use the emails array directly - limit to maximum 2 emails
          const emails = emailsArray.filter(email => email && email.trim()).slice(0, 2)
          console.log('Filtered emails:', emails)
          console.log('Email count:', emails.length)
          
          if (emails.length === 0) {
            console.log('WARNING: All emails filtered out!')
            text.textContent = ''
            if (emailLabel) emailLabel.textContent = ''
            break
          }
          
          if (emails.length === 1) {
            // Single email
            console.log('Rendering single email:', emails[0])
            text.textContent = emails[0]
            
            if (!hasPhones) {
              // No phone numbers - center the single email under the line
              text.setAttribute('x', '4500')
              text.setAttribute('text-anchor', 'middle')
              const currentY = parseFloat(text.getAttribute('y') || '0')
              text.setAttribute('y', (currentY + 840).toString())
              
              if (emailLabel) {
                emailLabel.textContent = 'Email:'
                emailLabel.setAttribute('x', '3200')
                const labelY = parseFloat(emailLabel.getAttribute('y') || '0')
                emailLabel.setAttribute('y', (labelY + 840).toString())
              }
            } else {
              // Has phone numbers - shift to the left as before
              const currentX = parseFloat(text.getAttribute('x') || '0')
              const currentY = parseFloat(text.getAttribute('y') || '0')
              text.setAttribute('x', (currentX - 500).toString())
              text.setAttribute('y', (currentY + 640).toString())
              if (emailLabel) {
                emailLabel.textContent = 'Email:'
                const labelX = parseFloat(emailLabel.getAttribute('x') || '0')
                const labelY = parseFloat(emailLabel.getAttribute('y') || '0')
                emailLabel.setAttribute('x', (labelX - 500).toString())
                emailLabel.setAttribute('y', (labelY + 640).toString())
              }
            }
          } else if (emails.length === 2) {
            console.log('Rendering 2 emails:', emails)
            if (!hasPhones) {
              // No phone numbers - show both emails on same line with simple spacing and center them
              text.textContent = `${emails[0]}     ${emails[1]}`
              console.log('Set combined email text:', text.textContent)
              
              // Center the emails under the line
              text.setAttribute('x', '4500')
              text.setAttribute('text-anchor', 'middle')
              const currentY = parseFloat(text.getAttribute('y') || '0')
              text.setAttribute('y', (currentY + 840).toString())
              
              // Keep label visible and position it to the left with more spacing
              if (emailLabel) {
                emailLabel.textContent = 'Email:'
                emailLabel.setAttribute('x', '2600')
                const labelY = parseFloat(emailLabel.getAttribute('y') || '0')
                emailLabel.setAttribute('y', (labelY + 840).toString())
              }
            } else {
              // Has phone numbers - render vertically (never inline)
              // First email replaces the existing text
              text.textContent = emails[0]
              const currentX = parseFloat(text.getAttribute('x') || '0')
              const currentY = parseFloat(text.getAttribute('y') || '0')
              const textClass = text.getAttribute('class')
              const fontSize = text.getAttribute('font-size')
              const fontFamily = text.getAttribute('font-family')
              const fill = text.getAttribute('fill')
              const parentGroup = text.parentElement
              
              // Find the phone text element to get its Y position for alignment
              // Look for any text element that contains a phone number pattern (digits with optional spaces/dashes)
              const phoneTexts = Array.from(svg.querySelectorAll('text'))
              const phoneText = phoneTexts.find(t => {
                const content = t.textContent || ''
                // Check if it matches a phone pattern or contains the user's phone numbers
                return /\d{3,}/.test(content) && (
                  content.includes('08035976700') || 
                  content.includes('08074383622') ||
                  (data.phones && data.phones.some(phone => content.includes(phone.replace(/\D/g, ''))))
                )
              })
              const phoneY = phoneText ? parseFloat(phoneText.getAttribute('y') || '0') : (currentY + 640)
              
              // Position first email with left alignment and align with first phone line
              const alignedX = currentX - 500
              text.setAttribute('x', alignedX.toString())
              text.setAttribute('y', phoneY.toString())
              
              // Shift email label to match first phone's Y position
              if (emailLabel) {
                const labelX = parseFloat(emailLabel.getAttribute('x') || '0')
                emailLabel.setAttribute('x', (labelX - 50).toString())
                emailLabel.setAttribute('y', phoneY.toString())
              }
              
              // Create text element for the second email positioned on same line as 3rd phone
              const secondEmail = document.createElementNS('http://www.w3.org/2000/svg', 'text')
              secondEmail.setAttribute('x', alignedX.toString()) // Same x position for perfect alignment
              secondEmail.setAttribute('y', (phoneY + 140).toString()) // 140 units below first phone to align with 3rd phone position
              
              // Copy all styling attributes to ensure visual consistency
              if (textClass) secondEmail.setAttribute('class', textClass)
              if (fontSize) secondEmail.setAttribute('font-size', fontSize)
              if (fontFamily) secondEmail.setAttribute('font-family', fontFamily)
              if (fill) secondEmail.setAttribute('fill', fill)
              
              secondEmail.textContent = emails[1]
              
              // Insert the second email element in the same parent
              if (parentGroup) {
                parentGroup.appendChild(secondEmail)
              } else {
                text.parentNode?.appendChild(secondEmail)
              }
              
              // Position email label
              if (emailLabel) {
                emailLabel.textContent = 'Email:'
                const labelX = parseFloat(emailLabel.getAttribute('x') || '0')
                emailLabel.setAttribute('x', (labelX - 500).toString())
              }
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
    
    // Clean up any other email text elements that might contain concatenated emails
    // BUT skip the element we just updated with user emails
    const allTextElements = Array.from(svg.querySelectorAll('text'))
    for (const text of allTextElements) {
      const content = text.textContent || ''
      // Only clear if it contains the placeholder emails AND multiple @ symbols
      // This avoids clearing user emails we just added
      if (content.includes('mathewuzzy') || (content.includes('@') && content.split('@').length > 2 && !data.emails?.some(email => content.includes(email)))) {
        // This text element contains placeholder or duplicate emails, clear it
        text.textContent = ''
      }
    }
    
    // Add a horizontal line at the top of email/phone section (after all updates are done)
    // Create line when emails are present (with or without phones)
    if (hasEmails) {
      const allTexts = Array.from(svg.querySelectorAll('text'))
      
      // Find Email: or Tel: labels (these have been shifted)
      const emailLabelElement = allTexts.find(text => text.textContent?.trim() === 'Email:')
      const phoneLabelElement = allTexts.find(text => text.textContent?.trim() === 'Tel:' || text.textContent?.trim() === 'Telephone:')
      
      const referenceText = emailLabelElement || phoneLabelElement
      if (referenceText) {
        const textY = parseFloat(referenceText.getAttribute('y') || '0')
        // Position line 150 units above the label to ensure it's not touching
        const lineY = textY - 150
        
        // Create the duplicate line element
        const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        newLine.setAttribute('class', 'fil0')
        newLine.setAttribute('stroke', '#000000')
        newLine.setAttribute('stroke-width', '13.89')
        newLine.setAttribute('x1', '860.1')
        newLine.setAttribute('y1', lineY.toString())
        newLine.setAttribute('x2', '7400')
        newLine.setAttribute('y2', lineY.toString())
        
        // Insert the line into the SVG
        svg.appendChild(newLine)
      }
    }

    // Update or remove reference fields based on user preference
    if (data.includeOptionalFields && data.referenceFields) {
      // Include optional fields - update them with values
      if (data.referenceFields.ref) {
        updateTextByPattern(svg, /REF:/i, `REF: ${data.referenceFields.ref}`)
      }
      if (data.referenceFields.date) {
        updateTextByPattern(svg, /DATE:/i, `DATE: ${data.referenceFields.date}`)
      }
    } else {
      // Remove optional fields from the SVG
      removeOptionalFields(svg)
    }
    
    // Add "Description:" label and content at branch address position (independent of optional fields)
    if (data.description && data.description.trim() !== '' && branchAddressY !== null) {
      const descriptionTitleCase = toTitleCase(data.description)
      const descriptionText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      descriptionText.setAttribute('x', orgCenterX.toString())
      descriptionText.setAttribute('y', branchAddressY.toString()) // At branch address position
      descriptionText.setAttribute('text-anchor', 'middle')
      descriptionText.setAttribute('font-family', 'Montserrat')
      descriptionText.setAttribute('font-size', '180')
      
      // Only content, no label
      descriptionText.textContent = descriptionTitleCase
      
      svg.appendChild(descriptionText)
    }
    
    // Add "Motto:" label and content at head office position (or below description) (independent of optional fields)
    if (data.motto && data.motto.trim() !== '' && headOfficeY !== null && branchAddressY !== null) {
      // Create motto text with label FIRST, then content (like Head Office format)
      const mottoTitleCase = toTitleCase(data.motto)
      const mottoText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      mottoText.setAttribute('x', orgCenterX.toString())
      
      // If description exists, motto goes 150 units below description (which is at branchAddressY)
      // If only motto exists (no description), motto goes at branchAddressY (description position)
      let mottoY: number
      if (data.description?.trim()) {
        // Description exists, motto goes 150 units below description
        mottoY = branchAddressY + 150
      } else {
        // No description, motto goes at description position (branchAddressY)
        mottoY = branchAddressY
      }
      
      // Shift motto down by 20 units
      mottoY = mottoY + 20
      
      mottoText.setAttribute('y', mottoY.toString())
      mottoText.setAttribute('text-anchor', 'middle')
      mottoText.setAttribute('font-family', 'Arial, sans-serif')
      mottoText.setAttribute('font-size', '60') // Same size as head office
      
      // Label first (red, bold), then content (Montserrat, 140.00px, not bold)
      mottoText.innerHTML = `<tspan fill="red" font-weight="bold" font-family="Montserrat" font-size="140.00">Motto:</tspan> <tspan font-family="Montserrat" font-size="140.00">${mottoTitleCase}</tspan>`
      
      svg.appendChild(mottoText)
    }

  // Always remove the template logo, then add user logo if provided
  removeTemplateLogo(svg)
  if (data.logoDataUrl) {
    await injectLogo(svg, data.logoDataUrl, data.organizationName || '', 'letter head')
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
 * Remove optional fields (Our Ref, Your Ref, Date) from SVG
 */
function removeOptionalFields(svg: Element): void {
  // Hide text elements with optional field labels using opacity instead of remove
  const textElements = svg.querySelectorAll('text, tspan')
  
  // Patterns to match optional fields - matching the actual SVG text content
  const patterns = [
    /Our\s*Ref/i,      // Matches "Our Ref" or "Our Ref."
    /Your/i,           // Matches "Your" (part of "Your Ref")
    /Ref\./i,          // Matches "Ref." (the second part)
    /Date/i,           // Matches "Date"
    /^:$/              // Matches standalone colon
  ]
  
  for (const element of textElements) {
    const text = element.textContent?.trim() || ''
    if (text) {
      // Check if this element contains any of the optional field patterns
      const hasOptionalField = patterns.some(pattern => pattern.test(text))
      if (hasOptionalField) {
        // Hide instead of remove so it can be restored
        element.setAttribute('opacity', '0')
      }
    }
  }
  
  // Hide the underline elements for optional fields (three short lines at y=1801)
  const lineElements = svg.querySelectorAll('line')
  for (const line of lineElements) {
    const y1 = line.getAttribute('y1')
    const y2 = line.getAttribute('y2')
    const x1 = line.getAttribute('x1')
    const x2 = line.getAttribute('x2')
    
    // Hide the main horizontal line at the bottom (matches x1=460.1, x2=7800, y1=y2=10450)
    if (x1 === '460.1' && x2 === '7800' && y1 === y2) {
      const currentY = parseFloat(y1 || '0')
      if (currentY >= 10400 && currentY <= 11000) {
        line.setAttribute('opacity', '0')
      }
    }
    // Hide the three underlines for Our Ref, Your Ref, and Date (y=1801 for headed, y=1961 for letterhead)
    else if ((y1 === '1801' && y2 === '1801') || (y1 === '1961' && y2 === '1961')) {
      line.setAttribute('opacity', '0')
    }
    // Hide the two separator lines below optional fields (y=1912.82 and y=1940.95 for headed, y=2072.82 and y=2100.95 for letterhead)
    else if ((y1 === '1912.82' && y2 === '1912.82') || (y1 === '1940.95' && y2 === '1940.95') || 
             (y1 === '2072.82' && y2 === '2072.82') || (y1 === '2100.95' && y2 === '2100.95')) {
      line.setAttribute('opacity', '0')
    }
    // Also check for lines with str1 or str2 class that are in the separator area
    else {
      const lineClass = line.getAttribute('class') || ''
      if ((lineClass.includes('str1') || lineClass.includes('str2')) && x1 === '460.1' && x2 === '7800') {
        const currentY = parseFloat(y1 || '0')
        if (currentY >= 1910 && currentY <= 1945) {
          line.setAttribute('opacity', '0')
        }
      }
    }
  }
}

/**
 * Apply styling to contact section text based on layout structure
 * 
 * Why not collision detection:
 * - Collision detection (getBBox checks) is unreliable in SVG rendering across browsers/PDF
 * - Print/PDF generation may not preserve runtime computed positions
 * - Layout-based approach is deterministic: we KNOW contact details are in bottom section
 * 
 * Solution:
 * - Contact section (Email/Tel) is positioned at y > 10000 (bottom region with design elements)
 * - All text in this region is styled white by design, not by detection
/**
 * Inject logo image into SVG
 */
async function injectLogo(svg: Element, logoDataUrl: string, organizationName: string = '', templateName: string = 'letter head'): Promise<void> {
  let logoWidth: number
  let logoHeight: number
  let logoX: number
  let logoY: number
  
  if (templateName === 'headed') {
    // For headed template, use ellipse element position and size
    // Ellipse specs: cx="643.77" cy="671.65" rx="318.26" ry="342.02"
    const ellipseCx = 537.77  // Moved left from 643.77
    const ellipseCy = 671.65
    const ellipseRx = 318.26
    const ellipseRy = 342.02
    
    // Logo dimensions match ellipse diameter
    logoWidth = ellipseRx * 2  // 636.52
    logoHeight = ellipseRy * 2  // 684.04
    
    // Position logo so its center matches ellipse center
    // SVG image x,y is top-left corner, so subtract half width/height
    logoX = ellipseCx - ellipseRx  // Center - radius = top-left x
    logoY = ellipseCy - ellipseRy  // Center - radius = top-left y
    
    // Hide/remove the ellipse placeholder
    const ellipse = svg.querySelector('ellipse[cx="643.77"]')
    if (ellipse) {
      ellipse.setAttribute('opacity', '0')
    }
  } else {
    // Letter head template: Dynamic logo sizing based on organization name length
    logoWidth = 1050  // Reduced from 1400 (30% size)
    logoHeight = 945  // Reduced from 1260 (30% size)
    logoX = 100
    logoY = 350
    
    // Reduce logo size if organization name is long
    const nameLength = organizationName.length
    if (nameLength > 50) {
      // Very long name - smallest logo
      logoWidth = 675  // Reduced from 900
      logoHeight = 607.5  // Reduced from 810
      logoX = 250
      logoY = 450
    } else if (nameLength > 35) {
      // Long name - medium logo
      logoWidth = 825  // Reduced from 1100
      logoHeight = 742.5  // Reduced from 990
      logoX = 180
      logoY = 400
    }
    // else: short name - keep largest size
  }
  
  // Create new logo image element
  const newImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  newImage.setAttribute('class', 'letterhead-logo')
  newImage.setAttribute('x', String(logoX))
  newImage.setAttribute('y', String(logoY))
  newImage.setAttribute('width', String(logoWidth))
  newImage.setAttribute('height', String(logoHeight))
  newImage.setAttribute('href', logoDataUrl)
  newImage.setAttribute('xlink:href', logoDataUrl)
  newImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  
  // Insert into the main group - append at the END to ensure it's on top
  const mainGroup = svg.querySelector('g')
  if (mainGroup) {
    // Append to the end so it appears on top of background elements
    mainGroup.appendChild(newImage)
  } else {
    // Fallback: add to SVG root
    svg.appendChild(newImage)
  }
}

/**
 * Inject transparent watermark logo in the center of the page
 */
async function injectWatermarkLogo(svg: Element, logoDataUrl: string): Promise<void> {
  // SVG dimensions (viewBox: 0 0 8267.72 11692.91)
  const svgWidth = 8267.72
  const svgHeight = 11692.91
  
  // Watermark logo dimensions - large and centered
  const watermarkWidth = 3000  // Large watermark
  const watermarkHeight = 3000
  
  // Position in the center of the page
  const watermarkX = (svgWidth - watermarkWidth) / 2
  const watermarkY = (svgHeight - watermarkHeight) / 2
  
  // Create watermark image element
  const watermarkImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  watermarkImage.setAttribute('class', 'letterhead-watermark')
  watermarkImage.setAttribute('x', String(watermarkX))
  watermarkImage.setAttribute('y', String(watermarkY))
  watermarkImage.setAttribute('width', String(watermarkWidth))
  watermarkImage.setAttribute('height', String(watermarkHeight))
  watermarkImage.setAttribute('href', logoDataUrl)
  watermarkImage.setAttribute('xlink:href', logoDataUrl)
  watermarkImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  watermarkImage.setAttribute('opacity', '0.08')  // Very transparent watermark
  
  // Insert into the main group - add BEFORE other content so it appears behind
  const mainGroup = svg.querySelector('g')
  if (mainGroup && mainGroup.firstChild) {
    // Insert as first child so it's behind everything
    mainGroup.insertBefore(watermarkImage, mainGroup.firstChild)
  } else if (mainGroup) {
    mainGroup.appendChild(watermarkImage)
  } else {
    // Fallback: add to SVG root
    svg.appendChild(watermarkImage)
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
      
      // Replace organization name text color (fil11) and custom lines (str1, str2)
      updatedCSS = updatedCSS.replace(/\.fil11\s*\{[^}]*fill:\s*#[0-9a-fA-F]{6}[^}]*\}/g, 
        '.fil11 {fill:var(--primary-brand-color)}')
      
      // Make the custom lines (str1, str2) follow brand color
      updatedCSS = updatedCSS.replace(/\.str1\s*\{([^}]*)stroke:\s*#[0-9a-fA-F]{6}([^}]*)\}/g, 
        '.str1 {$1stroke:var(--primary-brand-color)$2}')
      updatedCSS = updatedCSS.replace(/\.str2\s*\{([^}]*)stroke:\s*#[0-9a-fA-F]{6}([^}]*)\}/g, 
        '.str2 {$1stroke:var(--primary-brand-color)$2}')
      
      // DO NOT change other colors - keep all other elements at their original colors
      // This includes:
      // - fil2, fil10 (black text for addresses, phone, email, RC number)
      // - fil9 (red text for labels like Branch:, Head Office:, Tel:, Email:)
      // - str0, str1, str2, str3 (strokes for design elements)
      // - Background pattern colors (fil0-fil4, fil12-fil14, etc.)
      
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
async function convertSvgToJpeg(svgContent: string, width: number = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Use high resolution like PNG
      const aspectRatio = img.height / img.width
      canvas.width = width
      canvas.height = width * aspectRatio
      
      // Fill with white background for JPEG
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      
      // Convert to JPEG with high quality
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.98)
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
    const jpegDataUrl = await convertSvgToJpeg(svgContent, 10000)
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
    // Use moderate resolution for PDF to keep file size reasonable (300 DPI equivalent for A4)
    // A4 at 300 DPI is approximately 2480 x 3508 pixels, but letterheads are typically smaller
    const pdfOptimizedWidth = 2480
    const pngDataUrl = await convertSvgToPng(svgContent, pdfOptimizedWidth)
    
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
      format: 'a4',
      compress: true // Enable PDF compression
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
    
    // Add image to PDF with compression
    pdf.addImage(pngDataUrl, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'MEDIUM')
    
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
    emails: ['info@yourcompany.com'],
    primaryBrandColor: '#058A6C',
    referenceFields: {
      ref: 'REF/2024/001',
      date: new Date().toLocaleDateString()
    }
  }

  return (await renderLetterHead(sampleData)).svg
}

