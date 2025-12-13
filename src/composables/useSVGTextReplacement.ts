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
  // Version: 2025-11-12-15:30 - FORCE BROWSER CACHE REFRESH
  const replacementState = ref<ReplacementState>({
    isReplaced: false,
    selectedSvgFile: null,
    originalElements: new Map()
  })

  /**
   * Check if description contains all required keywords (case-insensitive)
   */
  const hasAllKeywords = (description: string, keywords: string[]): boolean => {
    if (!description || keywords.length === 0) {
      console.log(`❌ hasAllKeywords: Invalid input - description: "${description}", keywords:`, keywords)
      return false
    }
    
    const lowerDesc = description.toLowerCase()
    console.log(`🔍 hasAllKeywords checking description: "${lowerDesc}"`)
    console.log(`🔍 Keywords to check:`, keywords)
    
    const result = keywords.every(keyword => {
      const found = lowerDesc.includes(keyword.toLowerCase())
      console.log(`  - Checking keyword "${keyword}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`)
      return found
    })
    
    console.log(`📊 hasAllKeywords result: ${result ? '✅ ALL KEYWORDS FOUND' : '❌ SOME KEYWORDS MISSING'}`)
    return result
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
      console.log('🎨 Starting SVG replacement process... VERSION: 2025-11-12-16:00 LATEST')
      console.log('🔗 SVG Path to fetch:', config.svgFiles[0])
      
      // Store original elements first
      storeOriginalElements(svgElement, config.targetElementIds)

      // Select SVG file (random or first available)
      const selectedSvg = replacementState.value.selectedSvgFile || selectRandomSvg(config.svgFiles)
      replacementState.value.selectedSvgFile = selectedSvg
      console.log('📁 Selected SVG file:', selectedSvg)

      // Fetch the SVG file content
      const response = await fetch(selectedSvg)
      if (!response.ok) {
        console.error(`❌ Failed to fetch SVG: ${selectedSvg}`, response.status, response.statusText)
        return false
      }

      const svgText = await response.text()
      console.log('✅ SVG content fetched, length:', svgText.length)
      console.log('📄 First 200 chars:', svgText.substring(0, 200))
      
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const fetchedSvg = svgDoc.querySelector('svg')

      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror')
      if (parserError) {
        console.error('❌ XML parsing error:', parserError.textContent)
        return false
      }

      if (!fetchedSvg) {
        console.error('❌ Invalid SVG file - no <svg> element found')
        console.log('📄 Document body:', svgDoc.documentElement?.outerHTML?.substring(0, 500))
        return false
      }

      console.log('✅ SVG parsed successfully')

      // Remove original text elements
      console.log('🗑️ Removing original text elements:', config.targetElementIds)
      config.targetElementIds.forEach(id => {
        const element = svgElement.querySelector(`#${id}`)
        if (element) {
          console.log(`  ✅ Removed element: #${id}`)
          element.remove()
        } else {
          console.log(`  ⚠️ Element not found: #${id}`)
        }
      })

      // Create a group element to hold the embedded SVG content
      const groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      groupElement.setAttribute('id', 'wedding-title-replacement')
      
      // Set transform to position and scale the group
      groupElement.setAttribute('transform', `translate(${config.position.x}, ${config.position.y})`)
      
      console.log('� Created group element with transform:', groupElement.getAttribute('transform'))

      // Copy all child elements from the fetched SVG into the group
      Array.from(fetchedSvg.children).forEach(child => {
        // If it's a style element, we need to be careful about global scope pollution
        if (child.tagName.toLowerCase() === 'style') {
          // Rename classes in the style content to avoid conflicts
          // Specifically looking for .fnt0 which conflicts with name02.svg
          let styleContent = child.textContent || ''
          if (styleContent.includes('.fnt0')) {
            console.log('⚠️ Found conflicting .fnt0 class in title SVG style - renaming to .title-fnt0')
            styleContent = styleContent.replace(/\.fnt0/g, '.title-fnt0')
            child.textContent = styleContent
          }
        }
        
        const clonedChild = child.cloneNode(true)
        
        // If we renamed the class in the style, we need to update usages in the elements
        if (child.tagName.toLowerCase() !== 'style') {
          // Recursively update class attributes in cloned elements
          const updateClasses = (el: Element) => {
            if (el.hasAttribute('class')) {
              const cls = el.getAttribute('class') || ''
              if (cls.includes('fnt0')) {
                el.setAttribute('class', cls.replace('fnt0', 'title-fnt0'))
              }
            }
            Array.from(el.children).forEach(updateClasses)
          }
          updateClasses(clonedChild as Element)
        }
        
        groupElement.appendChild(clonedChild)
      })
      
      console.log('✅ Copied', fetchedSvg.children.length, 'child elements into group')

      // Insert the group element
      const firstOriginal = replacementState.value.originalElements.get(config.targetElementIds[0])
      console.log('📍 Insertion point:', { 
        hasFirstOriginal: !!firstOriginal, 
        hasParent: !!firstOriginal?.parent,
        parentTagName: firstOriginal?.parent?.tagName
      })
      
      if (firstOriginal?.parent) {
        firstOriginal.parent.appendChild(groupElement)
        console.log('✅ Group appended to original parent:', firstOriginal.parent.tagName)
      } else {
        svgElement.appendChild(groupElement)
        console.log('✅ Group appended to SVG root')
      }

      replacementState.value.isReplaced = true
      console.log(`✅ SVG text replaced with embedded content from: ${selectedSvg}`)
      
      return true
    } catch (error) {
      console.error('❌ Error replacing SVG text:', error)
      return false
    }
  }

  /**
   * Restore original text elements
   */
  const restoreOriginalElements = (svgElement: SVGSVGElement): void => {
    if (!replacementState.value.isReplaced) return

    // Remove replacement group
    const replacementGroup = svgElement.querySelector('#wedding-title-replacement')
    if (replacementGroup) {
      replacementGroup.remove()
      console.log('🗑️ Removed replacement group')
    }

    // Restore original elements
    replacementState.value.originalElements.forEach((data, id) => {
      if (data.parent) {
        data.parent.appendChild(data.element.cloneNode(true))
        console.log(`✅ Restored element: #${id}`)
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

    console.log('🔍 useSVGTextReplacement.handleReplacement:', {
      description,
      keywords: config.keywords,
      shouldReplace,
      isAlreadyReplaced: replacementState.value.isReplaced,
      currentSvgFile: replacementState.value.selectedSvgFile,
      newSvgFile: config.svgFiles[0]
    })

    if (shouldReplace) {
      // Check if we need to replace with a different SVG
      const needsReplacement = !replacementState.value.isReplaced || 
                              replacementState.value.selectedSvgFile !== config.svgFiles[0]
      
      if (needsReplacement) {
        // If already replaced with a different SVG, restore first
        if (replacementState.value.isReplaced && replacementState.value.selectedSvgFile !== config.svgFiles[0]) {
          console.log('🔄 Restoring before replacing with new SVG')
          restoreOriginalElements(svgElement)
        }
        
        // Replace text with SVG
        console.log(`🎨 Replacing with: ${config.svgFiles[0]}`)
        await replaceWithSvgImage(svgElement, config)
      } else {
        console.log('✅ Already replaced with the same SVG, skipping')
      }
    } else if (!shouldReplace && replacementState.value.isReplaced) {
      // Restore original text
      console.log('🔄 Restoring original text elements')
      restoreOriginalElements(svgElement)
    } else {
      console.log('❌ Conditions not met for replacement')
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

