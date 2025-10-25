/**
 * SVG Text Replacement Composable
 * 
 * Handles dynamic replacement of SVG text elements with SVG graphics
 * based on keywords in the description field.
 * 
 * Use Case: Replace "Alhamdulillahi ON YOUR WEDDING CEREMONY" text
 * with a decorative Nikkah SVG graphic when description contains
 * both "congratulation" and "nikkah" keywords.
 */

import { ref, Ref } from 'vue'

export interface ReplacementConfig {
  // Keywords to detect (case-insensitive)
  keywords: string[]
  // SVG files to choose from
  svgFiles: string[]
  // Element IDs to replace
  targetElementIds: string[]
  // Position and size for the replacement
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ReplacementState {
  isReplaced: boolean
  selectedSvgFile: string | null
  originalElements: Map<string, { element: SVGElement; parent: SVGElement | null }>
}

export function useSVGTextReplacement() {
  const replacementState = ref<ReplacementState>({
    isReplaced: false,
    selectedSvgFile: null,
    originalElements: new Map()
  })

  /**
   * Check if description contains all required keywords (case-insensitive)
   */
  const hasAllKeywords = (description: string, keywords: string[]): boolean => {
    if (!description || keywords.length === 0) return false
    
    const lowerDesc = description.toLowerCase()
    return keywords.every(keyword => lowerDesc.includes(keyword.toLowerCase()))
  }

  /**
   * Select a random SVG file from the available options
   */
  const selectRandomSvg = (svgFiles: string[]): string => {
    if (svgFiles.length === 0) {
      throw new Error('No SVG files available for replacement')
    }
    
    const randomIndex = Math.floor(Math.random() * svgFiles.length)
    return svgFiles[randomIndex]
  }

  /**
   * Store original elements before replacement for potential restoration
   */
  const storeOriginalElements = (
    svgElement: SVGSVGElement,
    elementIds: string[]
  ): void => {
    replacementState.value.originalElements.clear()
    
    elementIds.forEach(id => {
      const element = svgElement.querySelector(`#${id}`) as SVGElement
      if (element) {
        replacementState.value.originalElements.set(id, {
          element: element.cloneNode(true) as SVGElement,
          parent: element.parentElement
        })
      }
    })
  }

  /**
   * Calculate scaled dimensions for the replacement SVG
   * to fit within the target space while maintaining aspect ratio
   */
  const calculateScaledDimensions = (
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number
  ): { width: number; height: number; scale: number } => {
    const scaleX = targetWidth / originalWidth
    const scaleY = targetHeight / originalHeight
    const scale = Math.min(scaleX, scaleY) // Use smaller scale to fit within bounds
    
    return {
      width: originalWidth * scale,
      height: originalHeight * scale,
      scale
    }
  }

  /**
   * Replace text elements with an SVG image element
   */
  const replaceWithSvgImage = async (
    svgElement: SVGSVGElement,
    config: ReplacementConfig
  ): Promise<boolean> => {
    try {
      // Store original elements first
      storeOriginalElements(svgElement, config.targetElementIds)

      // Select SVG file (random or first available)
      const selectedSvg = replacementState.value.selectedSvgFile || selectRandomSvg(config.svgFiles)
      replacementState.value.selectedSvgFile = selectedSvg

      // Fetch the SVG file to get its dimensions
      const response = await fetch(selectedSvg)
      if (!response.ok) {
        console.error(`Failed to fetch SVG: ${selectedSvg}`)
        return false
      }

      const svgText = await response.text()
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const fetchedSvg = svgDoc.querySelector('svg')

      if (!fetchedSvg) {
        console.error('Invalid SVG file')
        return false
      }

      // Get original SVG dimensions from viewBox or width/height attributes
      const viewBox = fetchedSvg.getAttribute('viewBox')
      let originalWidth = 718.18 // Default from Nikkah.svg
      let originalHeight = 289.67

      if (viewBox) {
        const [, , w, h] = viewBox.split(' ').map(Number)
        originalWidth = w
        originalHeight = h
      } else {
        const width = fetchedSvg.getAttribute('width')
        const height = fetchedSvg.getAttribute('height')
        if (width && height) {
          originalWidth = parseFloat(width)
          originalHeight = parseFloat(height)
        }
      }

      // Calculate scaled dimensions
      const scaled = calculateScaledDimensions(
        originalWidth,
        originalHeight,
        config.position.width,
        config.position.height
      )

      // Remove original text elements
      config.targetElementIds.forEach(id => {
        const element = svgElement.querySelector(`#${id}`)
        if (element) {
          element.remove()
        }
      })

      // Create image element for the replacement SVG
      const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      imageElement.setAttribute('id', 'nikkah-replacement-image')
      imageElement.setAttribute('href', selectedSvg)
      
      // Position the image (centered horizontally)
      const centerX = config.position.x - (scaled.width / 2)
      imageElement.setAttribute('x', centerX.toString())
      imageElement.setAttribute('y', config.position.y.toString())
      imageElement.setAttribute('width', scaled.width.toString())
      imageElement.setAttribute('height', scaled.height.toString())

      // Insert the image element at the same position as the first removed element
      const firstOriginal = replacementState.value.originalElements.get(config.targetElementIds[0])
      if (firstOriginal?.parent) {
        firstOriginal.parent.appendChild(imageElement)
      } else {
        svgElement.appendChild(imageElement)
      }

      replacementState.value.isReplaced = true
      console.log(`✅ SVG text replaced with: ${selectedSvg}`)
      console.log(`📐 Scaled dimensions: ${scaled.width.toFixed(2)}×${scaled.height.toFixed(2)} (scale: ${scaled.scale.toFixed(2)})`)
      
      return true
    } catch (error) {
      console.error('Error replacing SVG text:', error)
      return false
    }
  }

  /**
   * Restore original text elements
   */
  const restoreOriginalElements = (svgElement: SVGSVGElement): void => {
    if (!replacementState.value.isReplaced) return

    // Remove replacement image
    const replacementImage = svgElement.querySelector('#nikkah-replacement-image')
    if (replacementImage) {
      replacementImage.remove()
    }

    // Restore original elements
    replacementState.value.originalElements.forEach((data, id) => {
      if (data.parent) {
        data.parent.appendChild(data.element.cloneNode(true))
      }
    })

    replacementState.value.isReplaced = false
    replacementState.value.selectedSvgFile = null
    console.log('🔄 Original text elements restored')
  }

  /**
   * Main function to handle replacement based on description
   */
  const handleReplacement = async (
    description: string,
    svgElement: SVGSVGElement,
    config: ReplacementConfig
  ): Promise<void> => {
    const shouldReplace = hasAllKeywords(description, config.keywords)

    if (shouldReplace && !replacementState.value.isReplaced) {
      // Replace text with SVG
      await replaceWithSvgImage(svgElement, config)
    } else if (!shouldReplace && replacementState.value.isReplaced) {
      // Restore original text
      restoreOriginalElements(svgElement)
    }
  }

  /**
   * Reset replacement state (useful when loading a new template)
   */
  const resetReplacement = (): void => {
    replacementState.value = {
      isReplaced: false,
      selectedSvgFile: null,
      originalElements: new Map()
    }
  }

  return {
    replacementState,
    hasAllKeywords,
    handleReplacement,
    restoreOriginalElements,
    resetReplacement
  }
}

