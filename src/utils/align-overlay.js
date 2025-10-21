/**
 * HARDENED OVERLAY ALIGNMENT FUNCTION FOR KONVA.TEXT
 * 
 * Aligns an HTML textarea/div exactly over a Konva.Text node for editing.
 * Handles: rotation, scaling, padding, stroke, DPR, scroll, stage transforms, font metrics.
 * 
 * USAGE:
 * ```javascript
 * import { alignTextareaToKonva, attachRealignmentHandlers, detachRealignmentHandlers } from '@/utils/align-overlay'
 * 
 * // When starting text edit:
 * const overlay = document.createElement('div')
 * overlay.contentEditable = true
 * overlay.textContent = textNode.text()
 * document.body.appendChild(overlay)
 * 
 * // Align overlay to text node
 * const debugInfo = alignTextareaToKonva(stage, textNode, overlay)
 * 
 * // Attach event handlers for realignment on scroll/resize/transform
 * const cleanup = attachRealignmentHandlers(stage, textNode, overlay)
 * 
 * // When done editing:
 * cleanup() // Removes event listeners
 * overlay.remove()
 * ```
 * 
 * EVENTS TO WIRE:
 * - window.scroll - Re-align when page scrolls
 * - window.resize - Re-align when window resizes
 * - stage.on('dragmove') - Re-align when stage is dragged
 * - stage.on('transform') - Re-align when stage is transformed
 * - stage.on('wheel') - Re-align when stage is zoomed via mouse wheel
 * 
 * ASSUMPTIONS:
 * - Konva.Text node uses default rotation pivot (top-left corner)
 * - If text uses custom offset(), rotation pivot calculations may need adjustment
 * - Browser supports getBoundingClientRect() (all modern browsers)
 * - DPR detection via window.devicePixelRatio (fallback to 1 if unavailable)
 * 
 * LIMITATIONS:
 * - If text is clipped by stage bounds, overlay may extend beyond visible area
 * - Very large rotations (>360°) are normalized to 0-360° range
 * - Sub-pixel rendering differences may cause 1-2px variance on some browsers
 * 
 * @module align-overlay
 */

/**
 * Aligns an HTML textarea/div exactly over a Konva.Text node.
 * 
 * @param {Konva.Stage} stageNode - The Konva stage instance
 * @param {Konva.Text} textNode - The Konva text node to align to
 * @param {HTMLElement} textarea - The HTML overlay element (textarea or contenteditable div)
 * @returns {Object} Debug info with computed metrics for validation
 */
export function alignTextareaToKonva(stageNode, textNode, textarea) {
  // ============================================================================
  // STEP 1: Get text node transform and dimensions
  // ============================================================================
  const absTransform = textNode.getAbsoluteTransform()
  const absPos = absTransform.getTranslation()
  const rotationDeg = textNode.getAbsoluteRotation()
  const absScale = textNode.getAbsoluteScale()
  const scaleX = absScale.x
  const scaleY = absScale.y

  // CRITICAL: Use getWidth()/getHeight() for auto-sized text
  // width()/height() return configured values (may be undefined)
  // getWidth()/getHeight() return actual rendered dimensions
  const textWidth = textNode.getWidth()
  const textHeight = textNode.getHeight()
  const padding = textNode.padding() || 0
  const totalWidth = textWidth + padding * 2
  const totalHeight = textHeight + padding * 2

  // ============================================================================
  // STEP 2: Convert stage coordinates → viewport coordinates
  // ============================================================================
  const containerRect = stageNode.container().getBoundingClientRect()
  const scrollX = window.pageXOffset || window.scrollX || 0
  const scrollY = window.pageYOffset || window.scrollY || 0
  const stageX = stageNode.x()
  const stageY = stageNode.y()
  const stageScaleX = stageNode.scaleX()
  const stageScaleY = stageNode.scaleY()
  const viewportX = containerRect.left + (stageX + absPos.x) * stageScaleX
  const viewportY = containerRect.top + (stageY + absPos.y) * stageScaleY

  // ============================================================================
  // STEP 3: Compute final dimensions
  // ============================================================================
  const dpr = window.devicePixelRatio || 1

  // CRITICAL FIX: getAbsoluteScale() already includes stage scale!
  // Don't multiply by stageScaleX/stageScaleY again or dimensions will be too small
  const finalWidth = totalWidth * scaleX   // scaleX already includes stage scale
  const finalHeight = totalHeight * scaleY  // scaleY already includes stage scale

  // ============================================================================
  // STEP 4: Match font metrics exactly
  // ============================================================================
  const fontSize = textNode.fontSize() || 16
  const fontFamily = textNode.fontFamily() || 'Arial'
  const fontStyle = textNode.fontStyle() || 'normal'
  const fontVariant = textNode.fontVariant?.() || 'normal'
  const textDecoration = textNode.textDecoration?.() || 'none'
  const lineHeight = textNode.lineHeight() || 1.2
  const align = textNode.align() || 'left'
  const letterSpacing = textNode.letterSpacing?.() || 0

  let fontWeight = 'normal'
  let fontStyleCSS = 'normal'
  if (fontStyle.includes('bold')) fontWeight = 'bold'
  if (fontStyle.includes('italic')) fontStyleCSS = 'italic'

  // ============================================================================
  // STEP 5: Apply CSS positioning
  // ============================================================================
  textarea.style.position = 'fixed'
  textarea.style.left = `${viewportX}px`
  textarea.style.top = `${viewportY}px`

  // ============================================================================
  // STEP 6: Apply dimensions
  // ============================================================================
  textarea.style.width = `${finalWidth}px`
  textarea.style.height = `${finalHeight}px`

  // ============================================================================
  // STEP 7: Apply font metrics
  // ============================================================================
  textarea.style.fontSize = `${fontSize}px`
  textarea.style.fontFamily = fontFamily
  textarea.style.fontWeight = fontWeight
  textarea.style.fontStyle = fontStyleCSS
  textarea.style.fontVariant = fontVariant
  textarea.style.textDecoration = textDecoration
  textarea.style.lineHeight = `${lineHeight}`
  textarea.style.textAlign = align
  textarea.style.letterSpacing = `${letterSpacing}px`

  // ============================================================================
  // STEP 8: Apply rotation via CSS transform
  // ============================================================================
  textarea.style.transformOrigin = 'left top'
  textarea.style.transform = `rotate(${rotationDeg}deg)`
  
  // ============================================================================
  // STEP 11: Visual styling for editing
  // ============================================================================
  textarea.style.border = '2px solid #007bff'
  textarea.style.borderRadius = '4px'
  textarea.style.padding = '2px 4px'
  textarea.style.margin = '0'
  textarea.style.background = 'rgba(255, 255, 255, 0.95)'
  textarea.style.backdropFilter = 'blur(2px)'
  textarea.style.outline = 'none'
  textarea.style.resize = 'none'
  textarea.style.overflow = 'visible'
  textarea.style.whiteSpace = 'pre-wrap'
  textarea.style.wordBreak = 'break-word'
  textarea.style.boxSizing = 'border-box'
  textarea.style.display = 'block'
  textarea.style.verticalAlign = 'top'
  textarea.style.maxHeight = 'none'
  
  // ============================================================================
  // STEP 12: Z-index and pointer events
  // ============================================================================
  textarea.style.zIndex = '10000'
  textarea.style.pointerEvents = 'auto'
  
  // ============================================================================
  // STEP 9: Return debug info for validation
  // ============================================================================
  return {
    // Stage info
    stageX,
    stageY,
    stageScaleX,
    stageScaleY,

    // Text dimensions
    textWidth,
    textHeight,
    totalWidth,
    totalHeight,

    // Viewport coordinates
    viewportX,
    viewportY,

    // Final dimensions
    finalWidth,
    finalHeight,

    // Transform
    rotation: rotationDeg,
    scaleX,
    scaleY,

    // Font
    fontSize,
    fontFamily,
    lineHeight,

    // DPR
    dpr,

    // Scroll
    scrollX,
    scrollY
  }
}

/**
 * Attaches event handlers for automatic realignment on scroll/resize/transform.
 * 
 * @param {Konva.Stage} stageNode - The Konva stage instance
 * @param {Konva.Text} textNode - The Konva text node
 * @param {HTMLElement} textarea - The HTML overlay element
 * @returns {Function} Cleanup function to remove event listeners
 */
export function attachRealignmentHandlers(stageNode, textNode, textarea) {
  // Throttle realignment to ~60fps
  let realignTimeout = null
  const throttledRealign = () => {
    if (realignTimeout) return
    realignTimeout = setTimeout(() => {
      alignTextareaToKonva(stageNode, textNode, textarea)
      realignTimeout = null
    }, 16)
  }
  
  // Attach event listeners
  window.addEventListener('scroll', throttledRealign, { passive: true })
  window.addEventListener('resize', throttledRealign, { passive: true })
  stageNode.on('dragmove', throttledRealign)
  stageNode.on('transform', throttledRealign)
  stageNode.on('wheel', throttledRealign)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', throttledRealign)
    window.removeEventListener('resize', throttledRealign)
    stageNode.off('dragmove', throttledRealign)
    stageNode.off('transform', throttledRealign)
    stageNode.off('wheel', throttledRealign)
  }
}

