/**
 * useBackgroundManager Composable
 * 
 * Extracted from StickerTemplatePanel.vue
 * Manages background selection, color configurations, and application
 * 
 * Features:
 * - Background persistence with localStorage
 * - Background manifest loading from JSON + Firebase
 * - Color configuration for different background types
 * - Title color determination based on background
 * - Random background selection with session tracking
 * - Background application to SVG with color updates
 */

import { ref, nextTick, type Ref } from 'vue'
import { getBackgroundRefsCached } from '@/services/background-catalog.service'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Background color configuration interface
 * Defines what text colors to use for each background type
 */
export interface BackgroundColorConfig {
  // Title colors (blessing, occasion, event type, ceremony)
  titleColor: string
  eventTypeColor: string  // WEDDING, NIKKAH, etc.
  ceremonyColor: string   // CEREMONY
  // Names colors
  name1Color: string
  name2Color: string
  separatorColor: string  // The "&" between names
  // Date and courtesy colors
  dateColor: string
  courtesyColor: string
}

/**
 * Background manifest item from backgrounds.json
 */
export interface BackgroundManifestItem {
  file: string
  category?: string
  name?: string
}

// ============================================================================
// Color Configuration Constants
// ============================================================================

/**
 * Light backgrounds - need dark text for titles, black names
 */
export const LIGHT_BG_COLORS: BackgroundColorConfig = {
  titleColor: '#000000',      // Black titles
  eventTypeColor: '#104C6E',  // Dark blue event type
  ceremonyColor: '#CC0000',   // Red ceremony
  name1Color: '#000000',      // Black names
  name2Color: '#000000',
  separatorColor: '#FFD700',  // Gold separator
  dateColor: '#000000',       // Black date
  courtesyColor: '#333333',   // Dark gray courtesy
}

/**
 * Dark backgrounds (Deep Green) - need white/yellow text
 */
export const DARK_BG_COLORS: BackgroundColorConfig = {
  titleColor: '#FFFFFF',      // White titles
  eventTypeColor: '#FFFF00',  // Yellow event type
  ceremonyColor: '#FFFF00',   // Yellow ceremony
  name1Color: '#FEFEFE',      // White names
  name2Color: '#FEFEFE',
  separatorColor: '#FFF212',  // Bright yellow separator
  dateColor: '#FFFF00',       // Yellow date
  courtesyColor: '#FFFFFF',   // White courtesy
}

/**
 * Red and Gold background - white/yellow titles, dark names
 */
export const RED_GOLD_BG_COLORS: BackgroundColorConfig = {
  titleColor: '#FFFFFF',      // White titles (Alhamdulillahi, ON YOUR)
  eventTypeColor: '#FFD700',  // Gold event type (WEDDING)
  ceremonyColor: '#FFD700',   // Gold ceremony
  name1Color: '#FEFEFE',      // White names (visible on red)
  name2Color: '#FEFEFE',
  separatorColor: '#FFD700',  // Gold separator
  dateColor: '#FFD700',       // Gold date
  courtesyColor: '#FFFFFF',   // White courtesy
}

/**
 * Fallback list of available backgrounds if manifest load fails
 */
const FALLBACK_BACKGROUNDS = [
  'backgroundColour.svg',
  'Deep Green Batik Background.png',
  'Beige Gold Gradient Borders Engagement Invitation.png',
  'Blue Futuristic Gradient Background.png',
  'Red and Gold Simple Elegant Islamic Background Poster.png',
]

// ============================================================================
// Composable Factory
// ============================================================================

export interface UseBackgroundManagerOptions {
  /** Reference to the wedding preview container DOM element */
  weddingPreviewContainer: Ref<HTMLElement | null>
  /** Reference to the chat preview container(s) */
  chatPreviewContainer: Ref<HTMLElement | HTMLElement[] | null>
  /** Callback to clear title image cache when background changes */
  clearTitleImageCache?: () => void
  /** Callback to update SVG with images after background change */
  updateSVGWithImages?: () => void
  /** Callback to update title color in SVG */
  updateTitleColor?: (svgElement: SVGSVGElement, color: string) => Promise<void>
  /** Flourish system functions */
  flourishSystem?: {
    getFlourishColorForBackground: (bg: string) => string
    updateFlourishColor: (svg: SVGSVGElement, color: string) => Promise<void>
  }
  /** Custom persistence key (reactive) - allows per-user keys */
  persistenceKey?: Ref<string> | (() => string)
}

export function useBackgroundManager(options: UseBackgroundManagerOptions) {
  const {
    weddingPreviewContainer,
    chatPreviewContainer,
    clearTitleImageCache,
    updateSVGWithImages,
    updateTitleColor,
    flourishSystem,
    persistenceKey,
  } = options

  // ============================================================================
  // State
  // ============================================================================

  /** Available backgrounds loaded from manifest and Firebase */
  const availableBackgrounds = ref<string[]>([...FALLBACK_BACKGROUNDS])

  /** Promise for loading backgrounds (prevents duplicate loads) */
  let weddingBackgroundsLoadPromise: Promise<void> | null = null

  /** Track current background index to avoid repeating when user requests another */
  const currentBackgroundIndex = ref(-1) // -1 means no background applied yet

  /** Track current background filename for color detection */
  const currentBackgroundFileName = ref<string>('')

  /** Track used backgrounds to avoid repetition in session */
  const usedBackgroundsInSession = ref<number[]>([])

  // ============================================================================
  // Persistence Key (supports reactive refs or functions)
  // ============================================================================

  /** Get the current persistence key */
  function getPersistenceKey(): string {
    if (!persistenceKey) return 'wedding_chat_background'
    if (typeof persistenceKey === 'function') return persistenceKey()
    return persistenceKey.value
  }

  // ============================================================================
  // Persistence Functions
  // ============================================================================

  /**
   * Get persisted wedding background from localStorage
   */
  function getPersistedWeddingBackground(): string | null {
    try {
      return localStorage.getItem(getPersistenceKey())
    } catch {
      return null
    }
  }

  /**
   * Set persisted wedding background to localStorage
   */
  function setPersistedWeddingBackground(fileName: string): void {
    try {
      localStorage.setItem(getPersistenceKey(), fileName)
    } catch {
      // ignore (private mode, storage disabled)
    }
  }

  // ============================================================================
  // Manifest Loading
  // ============================================================================

  /**
   * Load wedding background manifest from JSON and Firebase
   * Merges both sources and deduplicates
   */
  async function loadWeddingBackgroundManifest(): Promise<void> {
    if (weddingBackgroundsLoadPromise) return weddingBackgroundsLoadPromise

    weddingBackgroundsLoadPromise = (async () => {
      try {
        const res = await fetch('/svg/background/backgrounds.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load backgrounds.json (${res.status})`)
        const items = (await res.json()) as BackgroundManifestItem[]
        const weddingFiles = (items || [])
          .filter((it) => !it.category || it.category === 'wedding')
          .map((it) => it.file)
          .filter(Boolean)
        const firebaseRefs = await getBackgroundRefsCached('wedding', { ttlMs: 12 * 60 * 60 * 1000, limit: 50 })
        const merged = [...weddingFiles, ...firebaseRefs]
        const deduped = Array.from(new Set(merged))
        if (deduped.length > 0) availableBackgrounds.value = deduped
      } catch (e) {
        console.warn('⚠️ Could not load /svg/background/backgrounds.json. Using fallback list.', e)
        // Still try Firebase in case local manifest fails
        const firebaseRefs = await getBackgroundRefsCached('wedding', { ttlMs: 12 * 60 * 60 * 1000, limit: 50 })
        const merged = [...FALLBACK_BACKGROUNDS, ...firebaseRefs]
        availableBackgrounds.value = Array.from(new Set(merged))
      }
    })()

    return weddingBackgroundsLoadPromise
  }

  // ============================================================================
  // Color Configuration
  // ============================================================================

  /**
   * Get color configuration for a specific background
   * Returns appropriate colors for titles, names, dates, etc.
   */
  function getBackgroundColorConfig(backgroundFileName: string): BackgroundColorConfig {
    const lowerName = backgroundFileName.toLowerCase()
    
    // Deep Green - dark background, needs light text everywhere
    if (lowerName.includes('deep green')) {
      return DARK_BG_COLORS
    }
    
    // Blue Futuristic - dark blue background, needs light text
    if (lowerName.includes('blue futuristic')) {
      return {
        ...DARK_BG_COLORS,
        titleColor: '#FFFFFF',      // White titles
        eventTypeColor: '#00BFFF',  // Light blue event type
        ceremonyColor: '#00BFFF',   // Light blue ceremony
        name1Color: '#FFFFFF',      // White names
        name2Color: '#FFFFFF',
        separatorColor: '#00BFFF',  // Light blue separator
        dateColor: '#00BFFF',       // Light blue date
        courtesyColor: '#FFFFFF',   // White courtesy
      }
    }
    
    // Red and Gold Simple Elegant - white/yellow titles, white/yellow date/courtesy
    if (lowerName.includes('red and gold simple elegant islamic background poster.png') ||
        lowerName === 'red and gold simple elegant islamic background poster.png') {
      return RED_GOLD_BG_COLORS
    }
    
    // Red and Gold Chinese New Year - red/gold Chinese theme
    if (lowerName.includes('red and gold chinese new year')) {
      return {
        ...RED_GOLD_BG_COLORS,
        titleColor: '#FFD700',      // Gold titles
        eventTypeColor: '#FFFFFF',  // White event type
        ceremonyColor: '#FFFFFF',   // White ceremony
        name1Color: '#FFD700',      // Gold names
        name2Color: '#FFD700',
        separatorColor: '#FFFFFF',  // White separator
        dateColor: '#FFD700',       // Gold date
        courtesyColor: '#FFFFFF',   // White courtesy
      }
    }
    
    // Red and Gold Classic Lunar Chinese - traditional Chinese colors
    if (lowerName.includes('red and gold classic lunar chinese')) {
      return {
        ...RED_GOLD_BG_COLORS,
        titleColor: '#FFD700',      // Gold titles
        eventTypeColor: '#FFFFFF',  // White event type
        ceremonyColor: '#FFFFFF',   // White ceremony
        name1Color: '#FFD700',      // Gold names
        name2Color: '#FFD700',
        separatorColor: '#FFFFFF',  // White separator
        dateColor: '#FFD700',       // Gold date
        courtesyColor: '#FFFFFF',   // White courtesy
      }
    }
    
    // Red and Gold Modern Chinese - modern Chinese aesthetic
    if (lowerName.includes('red and gold modern chinese')) {
      return {
        ...RED_GOLD_BG_COLORS,
        titleColor: '#FFFFFF',      // White titles
        eventTypeColor: '#FFD700',  // Gold event type
        ceremonyColor: '#FFD700',   // Gold ceremony
        name1Color: '#FFFFFF',      // White names
        name2Color: '#FFFFFF',
        separatorColor: '#FFD700',  // Gold separator
        dateColor: '#FFD700',       // Gold date
        courtesyColor: '#FFFFFF',   // White courtesy
      }
    }
    
    // Beige Gold Gradient - light background, black names and BLACK titles
    if (lowerName.includes('beige gold gradient')) {
      return {
        ...LIGHT_BG_COLORS,
        titleColor: '#000000',      // Black title (Alhamdulillahi, ON YOUR)
        eventTypeColor: '#000000',  // Black event type (WEDDING)
        ceremonyColor: '#000000',   // Black ceremony
        name1Color: '#000000',
        name2Color: '#000000',
        separatorColor: '#B8860B',  // Dark gold separator
        dateColor: '#000000',
        courtesyColor: '#333333',
      }
    }
    
    // Blue Yellow Modern - light background
    if (lowerName.includes('blue yellow modern')) {
      return {
        ...LIGHT_BG_COLORS,
        eventTypeColor: '#1E40AF',  // Blue event type
        name1Color: '#000000',
        name2Color: '#000000',
        separatorColor: '#F59E0B',  // Yellow/amber separator
        dateColor: '#1E40AF',
        courtesyColor: '#333333',
      }
    }
    
    // BackgroundColour.svg - Yellow/Gold background with dark blue accents at bottom
    // Names, date, and courtesy appear on the dark blue section, so they need to be WHITE/GOLD to be visible
    if (lowerName.includes('backgroundcolour')) {
      return {
        titleColor: '#000066',      // Dark blue titles (matching the accent)
        eventTypeColor: '#000066',  // Dark blue event type
        ceremonyColor: '#000066',   // Dark blue ceremony
        name1Color: '#FFFFFF',      // WHITE names (visible on dark blue section)
        name2Color: '#FFFFFF',      // WHITE names (visible on dark blue section)
        separatorColor: '#FFD700',  // Gold separator (visible on dark blue)
        dateColor: '#FFD700',       // GOLD date (visible on dark blue area)
        courtesyColor: '#FFFFFF',   // White courtesy (on dark blue area)
      }
    }
    
    // Default - light background colors
    return LIGHT_BG_COLORS
  }

  /**
   * Get the title color based on current background
   * Dark backgrounds: WHITE or LIGHT GOLD
   * Light backgrounds: BLACK
   */
  function getTitleColorForBackground(backgroundFileName?: string): string {
    const bgFile = backgroundFileName || currentBackgroundFileName.value
    console.log('🎨 getTitleColorForBackground called with:', bgFile)
    
    if (!bgFile) {
      // No background set yet, use white as default (safe for most backgrounds)
      console.log('⚪ No background set, using default WHITE')
      return '#FFFFFF' // White
    }
    
    const lowerName = bgFile.toLowerCase()
    
    // === LIGHT BACKGROUNDS - Use BLACK title ===
    
    // Beige Gold Gradient - Light beige background
    if (lowerName.includes('beige gold gradient')) {
      console.log('🎨 Light bg (beige gold) -> BLACK')
      return '#000000' // Black
    }
    
    // === DARK BACKGROUNDS - Use WHITE title ===
    
    // Deep Green - Very dark green background
    if (lowerName.includes('deep green')) {
      console.log('🎨 Dark bg (deep green) -> WHITE')
      return '#FFFFFF' // White
    }
    
    // Blue Futuristic - Dark blue background
    if (lowerName.includes('blue futuristic')) {
      console.log('🎨 Dark bg (blue futuristic) -> WHITE')
      return '#FFFFFF' // White
    }
    
    // BackgroundColour.svg - Yellow/Gold background with dark blue accents
    if (lowerName.includes('backgroundcolour')) {
      console.log('🎨 Light bg (backgroundColour - yellow) -> DARK BLUE')
      return '#000066' // Dark Blue (matching the accent color)
    }
    
    // === RED BACKGROUNDS - Use LIGHT GOLD title ===
    
    // Red and Gold Simple Elegant Islamic
    if (lowerName.includes('red and gold simple elegant')) {
      console.log('🎨 Red bg (simple elegant) -> LIGHT GOLD')
      return '#FFE4B5' // Light Gold (Moccasin)
    }
    
    // Red and Gold Chinese New Year
    if (lowerName.includes('red and gold chinese new year')) {
      console.log('🎨 Red bg (chinese new year) -> LIGHT GOLD')
      return '#FFE4B5' // Light Gold (Moccasin)
    }
    
    // Red and Gold Classic Lunar Chinese
    if (lowerName.includes('red and gold classic lunar')) {
      console.log('🎨 Red bg (classic lunar) -> LIGHT GOLD')
      return '#FFE4B5' // Light Gold (Moccasin)
    }
    
    // Red and Gold Modern Chinese
    if (lowerName.includes('red and gold modern chinese')) {
      console.log('🎨 Red bg (modern chinese) -> WHITE')
      return '#FFFFFF' // White
    }
    
    // === FALLBACK DETECTION ===
    console.log('🔍 Using fallback detection for:', lowerName)
    
    // Dark backgrounds - use White
    if (lowerName.includes('dark') || lowerName.includes('deep') || lowerName.includes('black') || lowerName.includes('futuristic')) {
      console.log('🎨 Fallback: dark bg -> WHITE')
      return '#FFFFFF' // White
    }
    
    // Red backgrounds - use Light Gold
    if (lowerName.includes('red')) {
      console.log('🎨 Fallback: red bg -> LIGHT GOLD')
      return '#FFE4B5' // Light Gold
    }
    
    // Light backgrounds - use Black
    if (lowerName.includes('white') || lowerName.includes('light') || lowerName.includes('beige') || lowerName.includes('pastel') || lowerName.includes('gold')) {
      console.log('🎨 Fallback: light bg -> BLACK')
      return '#000000' // Black
    }
    
    // Default: White (visible on most backgrounds)
    console.log('🎨 Default -> WHITE')
    return '#FFFFFF'
  }

  // ============================================================================
  // Random Background Selection
  // ============================================================================

  /**
   * Get a random background (different from current)
   * Uses Fisher-Yates style selection to ensure variety
   */
  function getRandomBackground(): string {
    const backgrounds = availableBackgrounds.value
    if (backgrounds.length === 0) return ''
    if (backgrounds.length === 1) return backgrounds[0]
    
    // Get list of unused backgrounds in this session
    const unusedIndices = backgrounds
      .map((_, index) => index)
      .filter(index => !usedBackgroundsInSession.value.includes(index))
    
    // If all backgrounds have been used, reset the session tracking
    if (unusedIndices.length === 0) {
      usedBackgroundsInSession.value = [currentBackgroundIndex.value] // Keep current to avoid immediate repeat
      const availableIndices = backgrounds
        .map((_, index) => index)
        .filter(index => index !== currentBackgroundIndex.value)
      const newIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      currentBackgroundIndex.value = newIndex
      usedBackgroundsInSession.value.push(newIndex)
      console.log(`🎲 Background cycle reset. Selected: ${backgrounds[newIndex]}`)
      return backgrounds[newIndex]
    }
    
    // Pick a random unused background
    const randomUnusedIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)]
    currentBackgroundIndex.value = randomUnusedIndex
    usedBackgroundsInSession.value.push(randomUnusedIndex)
    
    console.log(`🎲 Random background selected: ${backgrounds[randomUnusedIndex]} (index: ${randomUnusedIndex})`)
    return backgrounds[randomUnusedIndex]
  }

  // ============================================================================
  // Background Application
  // ============================================================================

  /**
   * Apply a new background to the SVG template
   * Updates background image, element colors, and layer ordering
   */
  async function applyNewBackground(backgroundFileName: string): Promise<void> {
    if (!weddingPreviewContainer.value) {
      console.error('❌ weddingPreviewContainer not available')
      return
    }

    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (!svgElement) {
      console.error('❌ SVG element not found')
      return
    }

    // Handle backgrounds from different sources:
    // - Remote URLs (Firebase Storage download URLs): use as-is
    // - Absolute paths: use as-is
    // - Relative paths with '/': treat as under /svg/
    // - Plain filenames: treat as under /svg/background/
    const isRemoteUrl = /^https?:\/\//i.test(backgroundFileName)
    const backgroundUrl = isRemoteUrl
      ? backgroundFileName
      : backgroundFileName.startsWith('/')
        ? backgroundFileName
        : backgroundFileName.includes('/')
          ? encodeURI(`/svg/${backgroundFileName}`)
          : encodeURI(`/svg/background/${backgroundFileName}`)
    console.log(`🖼️ Applying new background: ${backgroundUrl}`)
    
    // Track current background filename for title color detection
    currentBackgroundFileName.value = backgroundFileName
    setPersistedWeddingBackground(backgroundFileName)
    
    // Clear title cache to force re-render with new background color
    if (clearTitleImageCache) {
      clearTitleImageCache()
    }

    // Get SVG dimensions from CURRENT viewBox (may have been resized)
    const viewBox = svgElement.getAttribute('viewBox')
    let svgWidth = 2996.89
    let svgHeight = 1685.75
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/)
      if (parts.length >= 4) {
        svgWidth = parseFloat(parts[2])
        svgHeight = parseFloat(parts[3])
      }
    }
    
    console.log(`📐 Background will cover: ${svgWidth}x${svgHeight}`)

    // Find existing background elements
    const existingBgRect = svgElement.querySelector('rect[fill="#F8F8F8"]')
    const existingBgImage = svgElement.querySelector('#background-image')
    
    // Find wave path elements (they have specific fill colors) - use broader selector
    // Also find paths that might have been modified
    const wavePaths = svgElement.querySelectorAll('path[fill="#FFCC29"], path[fill="url(#g1)"], path[fill="#507C95"], path[fill="#104C6E"], path[d*="776.51"], path[d*="539.04"], path[d*="616.09"]')

    console.log(`🌊 Found ${wavePaths.length} wave paths to hide`)

    // Remove or hide wave paths - use both style and attribute for reliability
    wavePaths.forEach((path, index) => {
      const pathEl = path as SVGPathElement
      pathEl.style.display = 'none'
      pathEl.style.visibility = 'hidden'
      pathEl.setAttribute('opacity', '0')
      console.log(`  - Hidden wave path ${index + 1}`)
    })

    // Hide the default background rect
    if (existingBgRect) {
      const rectEl = existingBgRect as SVGRectElement
      rectEl.style.display = 'none'
      rectEl.style.visibility = 'hidden'
      rectEl.setAttribute('opacity', '0')
      console.log('📦 Hidden default background rect')
    }

    // Check if we already have a background image element
    if (existingBgImage) {
      // Update existing background image with new URL and dimensions
      existingBgImage.setAttribute('href', backgroundUrl)
      existingBgImage.setAttribute('xlink:href', backgroundUrl)
      existingBgImage.setAttribute('width', String(svgWidth))
      existingBgImage.setAttribute('height', String(svgHeight))
      console.log('🔄 Updated existing background image')
    } else {
      // Create new background image element
      const bgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      bgImage.setAttribute('id', 'background-image')
      bgImage.setAttribute('x', '0')
      bgImage.setAttribute('y', '0')
      bgImage.setAttribute('width', String(svgWidth))
      bgImage.setAttribute('height', String(svgHeight))
      bgImage.setAttribute('href', backgroundUrl)
      bgImage.setAttribute('xlink:href', backgroundUrl)
      bgImage.setAttribute('preserveAspectRatio', 'xMidYMid slice')

      // Insert as the first child after defs (before other elements)
      const defs = svgElement.querySelector('defs')
      if (defs && defs.nextSibling) {
        svgElement.insertBefore(bgImage, defs.nextSibling)
      } else {
        svgElement.insertBefore(bgImage, svgElement.firstChild)
      }
    }

    // Update title colors based on background type
    // Get the appropriate color configuration for this background
    const colorConfig = getBackgroundColorConfig(backgroundFileName)
    
    const blessingText = svgElement.querySelector('#blessing-text') as SVGTextElement
    const occasionText = svgElement.querySelector('#occasion-text') as SVGTextElement
    const eventTypeText = svgElement.querySelector('#event-type-text') as SVGTextElement
    const ceremonyText = svgElement.querySelector('#ceremony-text') as SVGTextElement
    const dateText = svgElement.querySelector('#date-text') as SVGTextElement
    const courtesyText = svgElement.querySelector('#courtesy-text') as SVGTextElement
    
    // Names group
    const name1First = svgElement.querySelector('#name1-first') as SVGTextElement
    const name2First = svgElement.querySelector('#name2-first') as SVGTextElement
    const nameSeparator = svgElement.querySelector('#name-separator') as SVGTextElement
    
    // Also try to find names inside the wedding-names-group
    const namesGroup = svgElement.querySelector('#wedding-names-group')
    const name1InGroup = namesGroup?.querySelector('text:nth-child(1)') as SVGTextElement
    const name2InGroup = namesGroup?.querySelector('text:nth-child(2)') as SVGTextElement
    const separatorInGroup = namesGroup?.querySelector('text:nth-child(3)') as SVGTextElement

    console.log('👫 Name elements found:', {
      name1First: !!name1First,
      name2First: !!name2First,
      nameSeparator: !!nameSeparator,
      namesGroup: !!namesGroup,
      name1InGroup: !!name1InGroup,
      name2InGroup: !!name2InGroup,
      separatorInGroup: !!separatorInGroup,
      colorConfig: colorConfig
    })

    // Apply title colors
    if (blessingText) blessingText.setAttribute('fill', colorConfig.titleColor)
    if (occasionText) occasionText.setAttribute('fill', colorConfig.titleColor)
    if (eventTypeText) eventTypeText.setAttribute('fill', colorConfig.eventTypeColor)
    if (ceremonyText) ceremonyText.setAttribute('fill', colorConfig.ceremonyColor)
    
    // Apply name colors - try both by ID and by group child position
    // CRITICAL: Apply to ALL found name elements to ensure colors are set
    const name1Elements = [name1First, name1InGroup].filter(Boolean)
    const name2Elements = [name2First, name2InGroup].filter(Boolean)
    const separatorElements = [nameSeparator, separatorInGroup].filter(Boolean)
    
    name1Elements.forEach(el => {
      if (el) {
        el.setAttribute('fill', colorConfig.name1Color)
        console.log(`🎨 Set name1 fill to: ${colorConfig.name1Color}`)
      }
    })
    
    name2Elements.forEach(el => {
      if (el) {
        el.setAttribute('fill', colorConfig.name2Color)
        console.log(`🎨 Set name2 fill to: ${colorConfig.name2Color}`)
      }
    })
    
    separatorElements.forEach(el => {
      if (el) {
        el.setAttribute('fill', colorConfig.separatorColor)
        console.log(`🎨 Set separator fill to: ${colorConfig.separatorColor}`)
      }
    })
    
    // Fallback: apply to all text elements inside wedding-names-group
    if (namesGroup) {
      const allNamesText = namesGroup.querySelectorAll('text')
      allNamesText.forEach((textEl, index) => {
        const currentFill = textEl.getAttribute('fill')
        if (index === 0 || textEl.id === 'name1-first') {
          textEl.setAttribute('fill', colorConfig.name1Color)
          console.log(`🎨 Names group text[${index}] (${textEl.id}): ${currentFill} → ${colorConfig.name1Color}`)
        } else if (index === 1 || textEl.id === 'name2-first') {
          textEl.setAttribute('fill', colorConfig.name2Color)
          console.log(`🎨 Names group text[${index}] (${textEl.id}): ${currentFill} → ${colorConfig.name2Color}`)
        } else if (textEl.id === 'name-separator' || textEl.textContent === '&') {
          textEl.setAttribute('fill', colorConfig.separatorColor)
          console.log(`🎨 Names group text[${index}] (${textEl.id}): ${currentFill} → ${colorConfig.separatorColor}`)
        }
      })
      console.log(`🎨 Applied colors to ${allNamesText.length} text elements in names group`)
    }
    
    // Apply date and courtesy colors
    if (dateText) dateText.setAttribute('fill', colorConfig.dateColor)
    if (courtesyText) courtesyText.setAttribute('fill', colorConfig.courtesyColor)

    // Adjust title position for specific backgrounds
    // backgroundColour.svg needs titles moved up slightly
    const lowerBgName = backgroundFileName.toLowerCase()
    if (lowerBgName.includes('backgroundcolour')) {
      // Move all title elements up by 30 pixels for this background
      const titleElements = [blessingText, occasionText, eventTypeText, ceremonyText]
      titleElements.forEach(el => {
        if (el) {
          const currentY = parseFloat(el.getAttribute('y') || '0')
          el.setAttribute('y', String(currentY - 30))
        }
      })
      console.log('📐 Adjusted title positions up for backgroundColour.svg')
    }

    // Also find text elements by content as fallback (in case IDs changed)
    const allTextElements = svgElement.querySelectorAll('text')
    allTextElements.forEach((textEl) => {
      const content = textEl.textContent?.toLowerCase() || ''
      const id = textEl.getAttribute('id') || ''
      
      // Skip if already handled by ID
      if (id && ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text', 
                 'name1-first', 'name2-first', 'name-separator', 'date-text', 'courtesy-text'].includes(id)) {
        return
      }
      
      // Top titles - Alhamdulillahi, Congratulations, ON YOUR
      if (content.includes('alhamdulillah') || content.includes('congratulation') || content.includes('on your')) {
        textEl.setAttribute('fill', colorConfig.titleColor)
      }
      // Main event type - WEDDING, NIKKAH
      else if (content === 'wedding' || content === 'nikkah') {
        textEl.setAttribute('fill', colorConfig.eventTypeColor)
      }
      // Ceremony
      else if (content === 'ceremony') {
        textEl.setAttribute('fill', colorConfig.ceremonyColor)
      }
    })
    
    console.log(`🎨 Applied colors for background: ${backgroundFileName}`, colorConfig)

    // Ensure proper element ordering: background -> user image -> text elements
    // This ensures user image shows above background but text shows above everything
    
    // First, ensure user image is visible and properly positioned in the layer order
    const userImage = svgElement.querySelector('#userImage') as SVGImageElement
    if (userImage) {
      // Make sure user image has the clip-path
      if (!userImage.getAttribute('clip-path')) {
        userImage.setAttribute('clip-path', 'url(#imageClip)')
      }
      
      // Move user image after the background image (so it's visible above the background)
      const bgImage = svgElement.querySelector('#background-image')
      if (bgImage && bgImage.nextSibling !== userImage) {
        bgImage.after(userImage)
        console.log('✅ User image moved after background image')
      }
      
      console.log('✅ User image found with href:', userImage.getAttribute('href') || userImage.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
    }

    // Move all text elements to the end (on top of everything)
    const textElements = [
      svgElement.querySelector('#blessing-text'),
      svgElement.querySelector('#occasion-text'),
      svgElement.querySelector('#event-type-text'),
      svgElement.querySelector('#ceremony-text'),
      svgElement.querySelector('#wedding-names-group'),
      svgElement.querySelector('#date-text'),
      svgElement.querySelector('#courtesy-text'),
    ]

    textElements.forEach((el) => {
      if (el) {
        svgElement.appendChild(el)
      }
    })
    console.log('📚 Text elements moved to top layer')

    // Refresh the images to ensure they are displayed correctly after background change
    if (updateSVGWithImages) {
      updateSVGWithImages()
    }

    // Update the chat preview container as well
    await nextTick()
    updateChatPreviewSVG()
    
    // Update title PNG color based on new background
    const titleColor = getTitleColorForBackground(backgroundFileName)
    console.log(`🎨 Updating title color to: ${titleColor} for background: ${backgroundFileName}`)
    if (updateTitleColor) {
      await updateTitleColor(svgElement, titleColor)
    }
    
    // Update flourish color based on new background
    if (flourishSystem) {
      const flourishColor = flourishSystem.getFlourishColorForBackground(backgroundFileName)
      console.log(`🌺 Updating flourish color to: ${flourishColor} for background: ${backgroundFileName}`)
      await flourishSystem.updateFlourishColor(svgElement, flourishColor)
    }
    
    console.log(`✅ Background applied successfully: ${backgroundFileName}`)
  }

  // ============================================================================
  // Chat Preview Update
  // ============================================================================

  /**
   * Helper to update chat preview SVG with current state
   */
  function updateChatPreviewSVG(): void {
    const previewContainers = Array.isArray(chatPreviewContainer.value) 
      ? chatPreviewContainer.value 
      : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])

    if (!weddingPreviewContainer.value) return
    const masterSvg = weddingPreviewContainer.value.querySelector('svg')
    if (!masterSvg) return

    previewContainers.forEach((container) => {
      if (container) {
        // Clone the master SVG to update chat preview
        const existingSvg = container.querySelector('svg')
        if (existingSvg) {
          existingSvg.remove()
        }
        const clonedSvg = masterSvg.cloneNode(true) as SVGSVGElement
        
        // Get viewBox to calculate aspect ratio
        const viewBox = clonedSvg.getAttribute('viewBox')
        if (viewBox) {
          const parts = viewBox.split(/\s+|,/)
          if (parts.length >= 4) {
            const vbWidth = parseFloat(parts[2])
            const vbHeight = parseFloat(parts[3])
            const aspectRatio = vbWidth / vbHeight
            
            // Set container aspect ratio to match SVG
            container.style.aspectRatio = String(aspectRatio)
          }
        }
        
        // Set SVG to fill container while preserving aspect ratio
        clonedSvg.style.width = '100%'
        clonedSvg.style.height = 'auto'
        clonedSvg.style.maxWidth = '100%'
        clonedSvg.style.display = 'block'
        
        container.appendChild(clonedSvg)
      }
    })
  }

  // ============================================================================
  // Public API
  // ============================================================================

  return {
    // State
    availableBackgrounds,
    currentBackgroundIndex,
    currentBackgroundFileName,
    usedBackgroundsInSession,
    
    // Persistence
    getPersistedWeddingBackground,
    setPersistedWeddingBackground,
    getPersistenceKey,
    
    // Loading
    loadWeddingBackgroundManifest,
    
    // Color Configuration
    getBackgroundColorConfig,
    getTitleColorForBackground,
    
    // Background Selection & Application
    getRandomBackground,
    applyNewBackground,
    updateChatPreviewSVG,
    
    // Constants (exported for external use if needed)
    LIGHT_BG_COLORS,
    DARK_BG_COLORS,
    RED_GOLD_BG_COLORS,
  }
}

// Export type for the composable return value
export type UseBackgroundManagerReturn = ReturnType<typeof useBackgroundManager>
