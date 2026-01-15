/**
 * Template Utilities
 * 
 * Extracted from StickerTemplatePanel.vue for better maintainability.
 * Handles SVG template loading and description processing.
 */

import { nextTick, type Ref } from 'vue'
import { applyTitleColors } from '../composables/useTitleColors'
import type { BackgroundPaletteKey } from '@/services/background/background.types'

// Types
export interface TitleMatch {
  svgPath: string
  fallbackText?: string
  position?: { x: number; y: number; width: number; height: number }
  scale?: number
}

export interface TitleImageConfig {
  svgPath: string
  targetElementIds: string[]
  position: { x: number; y: number; width: number; height: number }
  scale: number
  color: string
}

export interface TemplateContext {
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  formData: { description: string; customSize?: string }
  accumulatedDescription: Ref<string>
  customHeading: Ref<string | null>
  selectedHeadingFont: Ref<string | null>
  selectedCategory: Ref<string | null>
  currentBackgroundFileName: Ref<string>
  currentBackgroundPaletteKey: Ref<BackgroundPaletteKey>
  
  // Functions
  resetReplacement: () => void
  getSVGElements: (svg: SVGSVGElement | null) => any
  findMatchingTitle: (text: string) => TitleMatch | null
  getTitleColorForBackground: () => string
  getFlourishColorForBackground: () => string
  replaceTitleWithImage: (svg: SVGSVGElement, config: TitleImageConfig) => Promise<void>
  restoreTitleTextElements: (svg: SVGSVGElement, ids: string[]) => void
  insertFlourishAboveNames: (svg: SVGSVGElement, color: string) => Promise<void>
  updateStickerText: (desc: string, elements: any) => Promise<any>
  updateValidationWarnings: (data: any) => void
  updateSVGWithImages: () => void
  applyCustomHeadingUtil: (svg: SVGSVGElement, heading: string | null) => void
  applyHeadingFontUtil: (svg: SVGSVGElement, font: string | null) => void
  
  // Auth store for notifications
  authStore: {
    showNotification: (opts: { title: string; message: string; type: string }) => void
  }
  
  // Mutable state for svgElements
  setSvgElements: (elements: any) => void
  getSvgElementsRef: () => any
}

// Cache keys to avoid expensive re-renders during real-time updates
let lastWeddingTitleRenderKey = ''
let lastWeddingFlourishRenderKey = ''

/**
 * Reset the title render cache keys
 */
export function resetTitleRenderCache(): void {
  lastWeddingTitleRenderKey = ''
  lastWeddingFlourishRenderKey = ''
}

export async function ensureDecorativeWeddingTitleUtil(svgElement: SVGSVGElement): Promise<void> {
  // Always use the decorative title injected from /titles/alhamdulillah/t1.svg.
  // This keeps headings editable (we can update its internal <text> nodes).
  const titleElementIds = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']

  // Hide base title nodes to avoid duplicates behind the decorative title.
  titleElementIds.forEach(id => {
    const el = svgElement.querySelector(`#${id}`) as SVGElement | null
    if (el) el.setAttribute('display', 'none')
  })

  // Remove any existing replacement(s) and re-inject fresh.
  const existingReplacements = Array.from(svgElement.querySelectorAll('#wedding-title-replacement'))
  existingReplacements.forEach(el => el.remove())

  try {
    const titleResponse = await fetch('/titles/alhamdulillah/t1.svg')

    if (!titleResponse.ok) {
      console.warn('Failed to fetch /titles/alhamdulillah/t1.svg:', titleResponse.status)
      return
    }

    const titleSvgText = await titleResponse.text()

    const parser = new DOMParser()
    const titleDoc = parser.parseFromString(titleSvgText, 'image/svg+xml')
    const titleSvg = titleDoc.querySelector('svg')
    if (!titleSvg) return

    const titleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    titleGroup.setAttribute('id', 'wedding-title-replacement')

    const titleViewBox = titleSvg.getAttribute('viewBox')
    if (titleViewBox) titleGroup.setAttribute('data-title-viewbox', titleViewBox)

    // Left for better visual balance (noticeable shift in a ~3000px-wide template)
    titleGroup.setAttribute('transform', 'translate(260, 260) scale(1.4)')

    // Copy defs first (fonts/styles)
    const titleDefs = titleSvg.querySelector('defs')
    if (titleDefs) {
      let svgDefs = svgElement.querySelector('defs')
      if (!svgDefs) {
        svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        svgElement.insertBefore(svgDefs, svgElement.firstChild)
      }
      Array.from(titleDefs.children).forEach(child => {
        svgDefs!.appendChild(child.cloneNode(true))
      })
    }

    const layerGroup = titleSvg.querySelector('g[id]')
    if (layerGroup) {
      titleGroup.appendChild(layerGroup.cloneNode(true))
    } else {
      Array.from(titleSvg.children).forEach(child => {
        if (child.tagName.toLowerCase() !== 'defs') {
          titleGroup.appendChild(child.cloneNode(true))
        }
      })
    }

    const svgDefs = svgElement.querySelector('defs')
    if (svgDefs && svgDefs.nextSibling) {
      svgElement.insertBefore(titleGroup, svgDefs.nextSibling)
    } else {
      svgElement.appendChild(titleGroup)
    }
  } catch (e) {
    console.error('❌ Error injecting title SVG:', e)
  }
}

/**
 * Load the wedding sticker SVG template
 */
export async function loadWeddingStickerTemplateUtil(ctx: TemplateContext): Promise<void> {
  if (!ctx.weddingPreviewContainer.value) {
    console.error('❌ loadWeddingStickerTemplateUtil: weddingPreviewContainer is null')
    return
  }

  try {
    // Reset replacement state when loading new template
    ctx.resetReplacement()

    // Load SVG template from external file
    console.log('📄 loadWeddingStickerTemplateUtil: fetching template...')
    const response = await fetch('/templates/wedding-sticker-base.svg')
    
    if (!response.ok) {
      console.error('❌ loadWeddingStickerTemplateUtil: fetch failed', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })
      return
    }
    
    const svgText = await response.text()
    console.log('✅ loadWeddingStickerTemplateUtil: template loaded', {
      length: svgText.length,
      startsWithSvg: svgText.trim().startsWith('<svg')
    })

    // Insert SVG into container
    ctx.weddingPreviewContainer.value.innerHTML = svgText
    
    // Force immediate DOM update
    await nextTick()
    await nextTick() // Double nextTick to ensure Vue has fully updated
    
    // Force a reflow to ensure the browser has rendered
    if (ctx.weddingPreviewContainer.value) {
      void ctx.weddingPreviewContainer.value.offsetHeight
    }

    // Get SVG element and its text elements
    const svgElement = ctx.weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    
    if (!svgElement) {
      return
    }
    
    // Set responsive dimensions based on viewBox aspect ratio
    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).map(Number)
      if (parts.length >= 4) {
        svgElement.setAttribute('width', '100%')
        svgElement.removeAttribute('height')
        svgElement.setAttribute('data-original-viewbox', viewBox)
      }
    } else if (!svgElement.hasAttribute('viewBox')) {
      const width = svgElement.getAttribute('width') || '2996.9'
      const height = svgElement.getAttribute('height') || '1685.75'
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }

    const svgElements = ctx.getSVGElements(svgElement)
    console.log('🗓️ [loadTemplate] SVG Elements captured:', {
      dateText: svgElements.dateText,
      dateTextId: svgElements.dateText?.id,
      courtesyText: svgElements.courtesyText,
      courtesyTextId: svgElements.courtesyText?.id,
      directQueryDate: svgElement.querySelector('#date-text'),
      directQueryCourtesy: svgElement.querySelector('#courtesy-text')
    })
    ctx.setSvgElements(svgElements)

    // Title behavior:
    // - Always inject a decorative title from /titles/alhamdulillah/t1.svg.
    // - If the user provides a custom heading, we REPLACE the text inside that injected SVG.
    const hasCustomHeading = !!ctx.customHeading?.value && String(ctx.customHeading.value).trim().length > 0

    await ensureDecorativeWeddingTitleUtil(svgElement)

    if (hasCustomHeading) {
      ctx.applyCustomHeadingUtil(svgElement, String(ctx.customHeading.value))
      ctx.applyHeadingFontUtil(svgElement, ctx.selectedHeadingFont?.value || null)
    }

    // Insert flourish above names
    try {
      const flourishColor = ctx.getFlourishColorForBackground()
      await ctx.insertFlourishAboveNames(svgElement, flourishColor)
    } catch (e) {
      // Non-fatal
    }

    // Apply current description if any (for names, date, etc.)
    if (ctx.formData.description) {
      await ctx.updateStickerText(ctx.formData.description, svgElements)
    }
  } catch (error) {
    ctx.authStore.showNotification({
      title: 'Template Load Failed',
      message: 'Failed to load wedding sticker template.',
      type: 'error'
    })
  }
}

/**
 * Apply custom heading and font to the SVG heading elements
 */
export function applyCustomHeadingAndFont(
  svgElement: SVGSVGElement,
  customHeading: string | null,
  selectedHeadingFont: string | null,
  applyCustomHeadingUtil: (svg: SVGSVGElement, heading: string | null) => void,
  applyHeadingFontUtil: (svg: SVGSVGElement, font: string | null) => void
): void {
  if (!customHeading && !selectedHeadingFont) {
    return
  }
  applyCustomHeadingUtil(svgElement, customHeading)
  applyHeadingFontUtil(svgElement, selectedHeadingFont)
}

/**
 * Process description input and update SVG in real-time
 */
export async function processDescriptionInputUtil(ctx: TemplateContext): Promise<void> {
  const svgElements = ctx.getSvgElementsRef()
  
  // Perform validation even if SVG elements are not loaded yet
  if (ctx.selectedCategory.value === 'wedding' && !svgElements) {
    // Pass null elements structure to avoid errors while validating
    const stickerData = await ctx.updateStickerText(ctx.formData.description, ctx.getSVGElements(null))
    ctx.updateValidationWarnings(stickerData)
  }
  
  // Update wedding sticker preview in real-time
  if (ctx.selectedCategory.value === 'wedding' && svgElements) {
    const svgElement = ctx.weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      // Default title behavior:
      // - We use a decorative title from /titles/alhamdulillah/t1.svg (id="wedding-title-replacement").
      // - When a custom heading is set, we replace the TEXT inside that decorative title.
      const titleElementIds = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']
      const hasDecorativeTitle = !!svgElement.querySelector('#wedding-title-replacement')

      if (hasDecorativeTitle) {
        titleElementIds.forEach(id => {
          const el = svgElement.querySelector(`#${id}`) as SVGElement | null
          if (el) el.setAttribute('display', 'none')
        })
      }
      
      // Debug: Check date element
      console.log('🗓️ [processDescription] svgElements.dateText:', svgElements.dateText)
      console.log('🗓️ [processDescription] Direct query #date-text:', svgElement.querySelector('#date-text'))
      
      // Insert flourish above names with matching color
      const flourishColor = ctx.getFlourishColorForBackground()
      const flourishCacheKey = [flourishColor, ctx.currentBackgroundFileName.value || ''].join('|')
      const hasFlourish = !!svgElement.querySelector('#wedding-flourish')
      if (!hasFlourish || flourishCacheKey !== lastWeddingFlourishRenderKey) {
        lastWeddingFlourishRenderKey = flourishCacheKey
        await ctx.insertFlourishAboveNames(svgElement, flourishColor)
      }
      
      // Update text content (names, date, courtesy, blessing, occasion, event type, ceremony)
      // Re-query elements to ensure we have fresh references
      const freshElements = ctx.getSVGElements(svgElement)
      console.log('🗓️ [processDescription] freshElements.dateText:', freshElements.dateText)
      const stickerData = await ctx.updateStickerText(ctx.formData.description, freshElements)
      
      // Double-check date and courtesy after update
      const dateEl = svgElement.querySelector('#date-text') as SVGTextElement
      const courtesyEl = svgElement.querySelector('#courtesy-text') as SVGTextElement  
      console.log('🗓️ [processDescription] After update - dateEl content:', dateEl?.textContent)
      console.log('🗓️ [processDescription] After update - courtesyEl content:', courtesyEl?.textContent)
      
      // Update validation warnings
      if (stickerData) {
        ctx.updateValidationWarnings(stickerData)
      }

      // Apply custom heading and font if set
      applyCustomHeadingAndFont(
        svgElement,
        ctx.customHeading.value,
        ctx.selectedHeadingFont.value,
        ctx.applyCustomHeadingUtil,
        ctx.applyHeadingFontUtil
      )
    }
  }

  // Update SVG with embedded images in real-time
  ctx.updateSVGWithImages()
}
