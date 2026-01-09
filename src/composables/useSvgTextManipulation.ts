/**
 * SVG Text Manipulation Composable
 * Provides reusable utilities for handling SVG text elements
 */

export interface TextScalingOptions {
  maxWidth: number
  minFontSize?: number
  safetyMargin?: number
  charWidthRatio?: number
  maxIterations?: number
}

export interface TextPositionOptions {
  x: number
  y?: string
  anchor?: 'start' | 'middle' | 'end'
}

/**
 * Find text element in SVG by content match
 */
export function findTextElement(
  svg: SVGElement,
  searchText: string
): SVGTextElement | null {
  const texts = svg.querySelectorAll('text')
  for (const text of texts) {
    if (text.textContent?.includes(searchText)) {
      return text as SVGTextElement
    }
  }
  return null
}

/**
 * Find all text elements in SVG by content match
 */
export function findTextElements(
  svg: SVGElement,
  searchText: string
): SVGTextElement[] {
  const texts = svg.querySelectorAll('text')
  const matches: SVGTextElement[] = []
  
  for (const text of texts) {
    if (text.textContent?.includes(searchText)) {
      matches.push(text as SVGTextElement)
    }
  }
  
  return matches
}

/**
 * Scale text to fit within specified width
 */
export function scaleTextToFit(
  textElement: SVGTextElement,
  options: TextScalingOptions
): number {
  const {
    maxWidth,
    minFontSize = 18,
    safetyMargin = 0.85,
    charWidthRatio = 0.75,
    maxIterations = 50
  } = options

  const computedStyle = window.getComputedStyle(textElement)
  const baseFontSize = parseFloat(
    textElement.getAttribute('font-size') || computedStyle.fontSize || '120'
  )
  
  const textContent = textElement.textContent || ''
  
  // Pre-calculate estimated font size
  const estimatedCharWidth = baseFontSize * charWidthRatio
  const estimatedWidth = textContent.length * estimatedCharWidth
  let fontSize = baseFontSize
  
  if (estimatedWidth > maxWidth) {
    const scaleFactor = maxWidth / estimatedWidth
    fontSize = baseFontSize * scaleFactor * safetyMargin
  }
  
  fontSize = Math.max(minFontSize, fontSize)
  textElement.setAttribute('font-size', fontSize.toString())
  
  // Measure actual width and adjust iteratively
  try {
    let bbox = textElement.getBBox()
    let textWidth = bbox.width
    let iterations = 0
    
    while (textWidth > maxWidth && fontSize > minFontSize && iterations < maxIterations) {
      if (textWidth > maxWidth * 1.2) {
        // Much too wide - reduce by 10%
        fontSize = fontSize * 0.9
      } else {
        // Slightly too wide - reduce by 1px
        fontSize -= 1
      }
      
      fontSize = Math.max(minFontSize, fontSize)
      textElement.setAttribute('font-size', fontSize.toString())
      bbox = textElement.getBBox()
      textWidth = bbox.width
      iterations++
    }
  } catch (e) {
    // Fallback if getBBox fails
    const fallbackCharWidth = fontSize * charWidthRatio
    const fallbackWidth = textContent.length * fallbackCharWidth
    
    if (fallbackWidth > maxWidth) {
      const scaleFactor = maxWidth / fallbackWidth
      fontSize = Math.max(minFontSize, fontSize * scaleFactor * safetyMargin)
      textElement.setAttribute('font-size', fontSize.toString())
    }
  }
  
  return fontSize
}

/**
 * Update text element content and position
 */
export function updateTextElement(
  textElement: SVGTextElement,
  content: string,
  position: TextPositionOptions,
  fontSize?: number
): void {
  textElement.textContent = content
  textElement.setAttribute('x', position.x.toString())
  
  if (position.y) {
    textElement.setAttribute('y', position.y)
  }
  
  if (position.anchor) {
    textElement.setAttribute('text-anchor', position.anchor)
  }
  
  if (fontSize) {
    textElement.setAttribute('font-size', fontSize.toString())
  }
}

/**
 * Remove text element from SVG
 */
export function removeTextElement(textElement: SVGTextElement): void {
  textElement.textContent = ''
  textElement.style.display = 'none'
}

/**
 * Hide text elements by content match
 */
export function hideTextElements(svg: SVGElement, searchText: string): void {
  const elements = findTextElements(svg, searchText)
  elements.forEach(el => removeTextElement(el))
}

/**
 * Calculate centered position within a range
 */
export function calculateCenterPosition(startX: number, endX: number): number {
  return startX + (endX - startX) / 2
}

/**
 * Get text bounding box with fallback estimation
 */
export function getTextWidth(
  textElement: SVGTextElement,
  fallbackCharWidth: number = 0.7
): number {
  try {
    const bbox = textElement.getBBox()
    return bbox.width
  } catch (e) {
    // Fallback estimation
    const fontSize = parseFloat(textElement.getAttribute('font-size') || '120')
    const textLength = (textElement.textContent || '').length
    return fontSize * fallbackCharWidth * textLength
  }
}

/**
 * Create or update SVG clipPath
 */
export function createClipPath(
  svg: SVGElement,
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const defs = svg.querySelector('defs') || 
    svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svg.firstChild)
  
  // Remove existing clip if present
  const existingClip = svg.querySelector(`#${id}`)
  if (existingClip) existingClip.remove()
  
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
  clipPath.setAttribute('id', id)
  
  const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  clipRect.setAttribute('x', x.toString())
  clipRect.setAttribute('y', y.toString())
  clipRect.setAttribute('width', width.toString())
  clipRect.setAttribute('height', height.toString())
  
  clipPath.appendChild(clipRect)
  defs.appendChild(clipPath)
}

/**
 * Apply clip path to element
 */
export function applyClipPath(element: SVGElement, clipPathId: string): void {
  element.setAttribute('clip-path', `url(#${clipPathId})`)
}
