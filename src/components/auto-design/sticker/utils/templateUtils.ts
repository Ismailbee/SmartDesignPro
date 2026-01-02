/**
 * Template Utilities
 * 
 * Extracted from StickerTemplatePanel.vue for better maintainability.
 * Handles SVG template loading and description processing.
 */

import { nextTick, type Ref } from 'vue'

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

/**
 * Load the wedding sticker SVG template
 */
export async function loadWeddingStickerTemplateUtil(ctx: TemplateContext): Promise<void> {
  if (!ctx.weddingPreviewContainer.value) {
    return
  }

  try {
    // Reset replacement state when loading new template
    ctx.resetReplacement()

    // Load SVG template from external file
    const response = await fetch('/templates/wedding-sticker-base.svg')
    const svgText = await response.text()

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
    ctx.setSvgElements(svgElements)

    // Use Title Library to find matching title SVG based on description or custom heading
    const textToMatch = ctx.customHeading.value || ctx.accumulatedDescription.value || ctx.formData.description || 'wedding'
    const matchedTitle = ctx.findMatchingTitle(textToMatch)
    
    try {
      // Get title color based on current background
      const titleColor = ctx.getTitleColorForBackground()
      
      if (matchedTitle) {
        await ctx.replaceTitleWithImage(svgElement, {
          svgPath: matchedTitle.svgPath,
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
          scale: matchedTitle.scale || 1.0,
          color: titleColor
        })
      } else {
        await ctx.replaceTitleWithImage(svgElement, {
          svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: { x: -30, y: 50, width: 1800, height: 900 },
          scale: 1.0,
          color: titleColor
        })
      }
      
      // Insert flourish above names with matching color
      const flourishColor = ctx.getFlourishColorForBackground()
      await ctx.insertFlourishAboveNames(svgElement, flourishColor)
    } catch (handleReplacementError) {
      // Continue without title replacement
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
  if (!customHeading && !selectedHeadingFont) return
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
    // Handle SVG text replacement for title graphic
    const svgElement = ctx.weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      let stickerData: any = null

      // Use Title Library to find matching title SVG
      const customHeadingText = (ctx.customHeading.value ?? '').trim()
      const textToMatch = customHeadingText || ctx.accumulatedDescription.value || ctx.formData.description
      const matchedTitle = ctx.findMatchingTitle(textToMatch)
      
      // Get title color based on current background
      const titleColor = ctx.getTitleColorForBackground()

      const headingElementIds = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']
      const hasCustomHeading = customHeadingText.length > 0

      // If user provided a custom heading, ALWAYS show the editable text heading.
      // Title graphics are only for the default/auto heading flow.
      if (hasCustomHeading) {
        ctx.restoreTitleTextElements(svgElement, headingElementIds)
        lastWeddingTitleRenderKey = `text|${customHeadingText}`
      } else {
        const desiredTitle = matchedTitle
          ? {
              svgPath: matchedTitle.svgPath,
              fallbackText: matchedTitle.fallbackText,
              position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
              scale: matchedTitle.scale || 1.0
            }
          : {
              svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
              fallbackText: 'Default wedding title',
              position: { x: -30, y: 50, width: 1800, height: 900 },
              scale: 1.0
            }

        const titleCacheKey = [
          desiredTitle.svgPath,
          titleColor,
          desiredTitle.position.x,
          desiredTitle.position.y,
          desiredTitle.position.width,
          desiredTitle.position.height,
          desiredTitle.scale
        ].join('|')

        const hasTitleReplacement = !!svgElement.querySelector('#wedding-title-replacement')
        if (!hasTitleReplacement || titleCacheKey !== lastWeddingTitleRenderKey) {
          lastWeddingTitleRenderKey = titleCacheKey

          if (matchedTitle) {
            // Pre-render SVG to PNG for reliable export (allows color changes)
            await ctx.replaceTitleWithImage(svgElement, {
              svgPath: matchedTitle.svgPath,
              targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
              position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
              scale: matchedTitle.scale || 1.0,
              color: titleColor
            })
          } else {
            // No match found - use default wedding title
            await ctx.replaceTitleWithImage(svgElement, {
              svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
              targetElementIds: headingElementIds,
              position: { x: -30, y: 50, width: 1800, height: 900 },
              scale: 1.0,
              color: titleColor
            })
          }
        }
      }
      
      // Insert flourish above names with matching color
      const flourishColor = ctx.getFlourishColorForBackground()
      const flourishCacheKey = [flourishColor, ctx.currentBackgroundFileName.value || ''].join('|')
      const hasFlourish = !!svgElement.querySelector('#wedding-flourish')
      if (!hasFlourish || flourishCacheKey !== lastWeddingFlourishRenderKey) {
        lastWeddingFlourishRenderKey = flourishCacheKey
        await ctx.insertFlourishAboveNames(svgElement, flourishColor)
      }
      
      // Update names, date, and courtesy
      stickerData = await ctx.updateStickerText(ctx.formData.description, svgElements)
      
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
