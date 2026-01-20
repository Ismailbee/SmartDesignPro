/**
 * SVG Utility Functions
 * 
 * Extracted from StickerTemplatePanel.vue to reduce file size.
 * These functions handle SVG manipulation, image positioning, and resizing.
 */

import { nextTick } from 'vue'

// ============================================
// MAKE SVG IMAGE DRAGGABLE
// ============================================

interface ImageManager {
  images: { value: Array<{ id: string; flipped: boolean; width: number; originalWidth: number; height: number; originalHeight: number }> }
  updateImage: (id: string, updates: Record<string, any>) => void
}

export function makeSVGImageDraggable(
  imageElement: SVGImageElement, 
  imageId: string, 
  svgImageManager: ImageManager
) {
  // Skip if already made draggable
  if (imageElement.getAttribute('data-draggable') === 'true') {
    return
  }

  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0
  let initialDistance = 0
  let initialScale = 1
  let baseWidth = 0
  let baseHeight = 0

  // Small boxed slots are meant to be a fixed-size frame; users should only drag to change crop position.
  const isFixedSizeSlot =
    imageElement.id === 'userImageSecondary' ||
    imageElement.id === 'userImageTertiary' ||
    imageElement.getAttribute('data-disable-scale') === 'true'

  // Add visual feedback
  imageElement.style.cursor = 'grab'
  imageElement.style.transition = 'opacity 0.2s, filter 0.2s'
  imageElement.setAttribute('data-draggable', 'true')
  
  // Hover effects
  const handleMouseEnter = () => {
    if (!isDragging) {
      imageElement.style.filter = 'brightness(1.05)'
    }
  }
  const handleMouseLeave = () => {
    if (!isDragging) {
      imageElement.style.filter = 'none'
    }
  }
  
  imageElement.addEventListener('mouseenter', handleMouseEnter)
  imageElement.addEventListener('mouseleave', handleMouseLeave)

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const ctm = svgElement.getScreenCTM()
    if (!ctm) return
    
    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(ctm.inverse())

    startX = svgPt.x
    startY = svgPt.y
    initialX = parseFloat(imageElement.getAttribute('x') || '0')
    initialY = parseFloat(imageElement.getAttribute('y') || '0')

    imageElement.style.opacity = '0.8'
    imageElement.style.cursor = 'grabbing'
    imageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const ctm = svgElement.getScreenCTM()
    if (!ctm) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(ctm.inverse())

    let dx = svgPt.x - startX
    const dy = svgPt.y - startY

    // If image is flipped, invert horizontal drag direction
    const img = svgImageManager.images.value.find(i => i.id === imageId)
    if (img && img.flipped) {
      dx = -dx
    }

    const newX = initialX + dx
    const newY = initialY + dy

    imageElement.setAttribute('x', newX.toString())
    imageElement.setAttribute('y', newY.toString())

    imageElement.setAttribute('data-user-position', 'true')
    svgImageManager.updateImage(imageId, { x: newX, y: newY, hasUserPosition: true })
    e.preventDefault()
  }

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
      imageElement.style.cursor = 'grab'
      imageElement.style.filter = 'none'
    }
  }

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging = true
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const ctm = svgElement.getScreenCTM()
      if (!ctm) return
      const svgPt = pt.matrixTransform(ctm.inverse())

      startX = svgPt.x
      startY = svgPt.y
      initialX = parseFloat(imageElement.getAttribute('x') || '0')
      initialY = parseFloat(imageElement.getAttribute('y') || '0')

      imageElement.style.opacity = '0.8'
      imageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    } else if (e.touches.length === 2) {
      // Disable pinch-resize for the small fixed-size slots.
      if (isFixedSizeSlot) {
        e.preventDefault()
        return
      }
      isDragging = false
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      initialScale = img ? (img.width / img.originalWidth) : 1.15
      
      const currentWidth = parseFloat(imageElement.getAttribute('width') || '0')
      const currentHeight = parseFloat(imageElement.getAttribute('height') || '0')
      const safeScale = initialScale > 0 ? initialScale : 1
      baseWidth = currentWidth / safeScale
      baseHeight = currentHeight / safeScale
    }
    e.preventDefault()
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const ctm = svgElement.getScreenCTM()
      if (!ctm) return
      const svgPt = pt.matrixTransform(ctm.inverse())

      let dx = svgPt.x - startX
      const dy = svgPt.y - startY

      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img && img.flipped) {
        dx = -dx
      }

      const newX = initialX + dx
      const newY = initialY + dy

      imageElement.setAttribute('x', newX.toString())
      imageElement.setAttribute('y', newY.toString())
      imageElement.setAttribute('data-user-position', 'true')
      svgImageManager.updateImage(imageId, { x: newX, y: newY, hasUserPosition: true })
    } else if (e.touches.length === 2) {
      if (isFixedSizeSlot) {
        e.preventDefault()
        return
      }
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const scaleFactor = currentDistance / initialDistance
      const newScale = Math.max(0.5, Math.min(2.5, initialScale * scaleFactor))
      
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img) {
        const adjustedWidth = baseWidth * newScale
        const adjustedHeight = baseHeight * newScale
        
        imageElement.setAttribute('width', adjustedWidth.toString())
        imageElement.setAttribute('height', adjustedHeight.toString())
        
        const currentX = parseFloat(imageElement.getAttribute('x') || '0')
        const currentY = parseFloat(imageElement.getAttribute('y') || '0')
        svgImageManager.updateImage(imageId, { 
          x: currentX,
          y: currentY,
          scale: newScale 
        } as any)
      }
    }
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
      imageElement.style.filter = 'none'
    }
  }

  // Add event listeners
  imageElement.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })
  imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
  imageElement.addEventListener('touchend', handleTouchEnd)

  // Store cleanup function
  const cleanup = () => {
    imageElement.removeEventListener('mousedown', handleMouseDown)
    imageElement.removeEventListener('mouseenter', handleMouseEnter)
    imageElement.removeEventListener('mouseleave', handleMouseLeave)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    imageElement.removeEventListener('touchstart', handleTouchStart)
    imageElement.removeEventListener('touchmove', handleTouchMove)
    imageElement.removeEventListener('touchend', handleTouchEnd)
  }

  ;(imageElement as any).__dragCleanup = cleanup
}

// ============================================
// MAKE SVG GROUP DRAGGABLE (for small image boxes)
// ============================================

export function makeSVGGroupDraggable(
  groupElement: SVGGElement,
  imageId: string,
  svgImageManager: ImageManager
) {
  if (groupElement.getAttribute('data-group-draggable') === 'true') {
    return
  }

  let isDragging = false
  let startX = 0
  let startY = 0
  let initialTranslateX = 0
  let initialTranslateY = 0

  // Parse existing transform to get translate values
  function getTranslate(): { x: number; y: number } {
    const transform = groupElement.getAttribute('transform') || ''
    const match = transform.match(/translate\(\s*([\d.-]+)\s*,?\s*([\d.-]*)\s*\)/)
    if (match) {
      return { x: parseFloat(match[1]) || 0, y: parseFloat(match[2]) || 0 }
    }
    return { x: 0, y: 0 }
  }

  function setTranslate(x: number, y: number) {
    groupElement.setAttribute('transform', `translate(${x}, ${y})`)
  }

  groupElement.style.cursor = 'grab'
  groupElement.setAttribute('data-group-draggable', 'true')

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    const svgElement = groupElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    startX = svgPt.x
    startY = svgPt.y
    const current = getTranslate()
    initialTranslateX = current.x
    initialTranslateY = current.y

    groupElement.style.cursor = 'grabbing'
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const svgElement = groupElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    const dx = svgPt.x - startX
    const dy = svgPt.y - startY

    const newX = initialTranslateX + dx
    const newY = initialTranslateY + dy

    setTranslate(newX, newY)

    // Store position in image manager
    svgImageManager.updateImage(imageId, { 
      groupTranslateX: newX, 
      groupTranslateY: newY,
      hasUserPosition: true 
    })
    e.preventDefault()
  }

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false
      groupElement.style.cursor = 'grab'
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging = true
      const svgElement = groupElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const ctm = svgElement.getScreenCTM()
      if (!ctm) return
      const svgPt = pt.matrixTransform(ctm.inverse())

      startX = svgPt.x
      startY = svgPt.y
      const current = getTranslate()
      initialTranslateX = current.x
      initialTranslateY = current.y
    }
    e.preventDefault()
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const svgElement = groupElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const ctm = svgElement.getScreenCTM()
      if (!ctm) return
      const svgPt = pt.matrixTransform(ctm.inverse())

      const dx = svgPt.x - startX
      const dy = svgPt.y - startY

      const newX = initialTranslateX + dx
      const newY = initialTranslateY + dy

      setTranslate(newX, newY)

      svgImageManager.updateImage(imageId, { 
        groupTranslateX: newX, 
        groupTranslateY: newY,
        hasUserPosition: true 
      })
    }
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    isDragging = false
  }

  groupElement.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  groupElement.addEventListener('touchstart', handleTouchStart, { passive: false })
  groupElement.addEventListener('touchmove', handleTouchMove, { passive: false })
  groupElement.addEventListener('touchend', handleTouchEnd)

  // Mark as draggable and store cleanup function
  groupElement.setAttribute('data-group-draggable', 'true')
  
  const cleanup = () => {
    groupElement.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    groupElement.removeEventListener('touchstart', handleTouchStart)
    groupElement.removeEventListener('touchmove', handleTouchMove)
    groupElement.removeEventListener('touchend', handleTouchEnd)
  }
  ;(groupElement as any).__groupDragCleanup = cleanup
}

// ============================================
// UPDATE SVG WITH IMAGES
// ============================================

interface SVGImage {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  opacity: number
  zIndex: number
  flipped: boolean
  rotation: number
}

interface UpdateSVGDeps {
  weddingPreviewContainer: { value: HTMLDivElement | null }
  svgImageManager: { 
    images: { value: SVGImage[] }
    updateImage: (id: string, updates: Record<string, any>) => void
  }
  formData: { customSize?: string }
  preGeneratedImageFile: { value: File | null }
  makeSVGImageDraggableFn: (el: SVGImageElement, id: string) => void
}

export function updateSVGWithImages(deps: UpdateSVGDeps) {
  const { weddingPreviewContainer, svgImageManager, formData, preGeneratedImageFile, makeSVGImageDraggableFn } = deps
  
  console.log('🖼️ updateSVGWithImages called:', {
    hasContainer: !!weddingPreviewContainer.value,
    imagesCount: svgImageManager.images.value.length,
    hasPreGeneratedFile: !!preGeneratedImageFile.value
  })
  
  if (!weddingPreviewContainer.value) {
    console.warn('⚠️ updateSVGWithImages: no weddingPreviewContainer')
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.warn('⚠️ updateSVGWithImages: no SVG element in container')
    return
  }

  const images = svgImageManager.images.value
  console.log('🖼️ updateSVGWithImages: images array:', images.map(img => ({
    id: img.id,
    hasDataUrl: !!img.dataUrl,
    dataUrlLength: img.dataUrl?.length || 0
  })))

  function updateSmallSlot(slotGroupId: string, slotImageId: string, img: SVGImage | undefined) {
    const group = svgElement.querySelector(`#${slotGroupId}`) as SVGGElement | null
    const imageEl = svgElement.querySelector(`#${slotImageId}`) as SVGImageElement | null
    if (!group || !imageEl) return

    // Cache the template slot geometry once so we can restore it if user pinch-scaled accidentally.
    if (!imageEl.getAttribute('data-slot-base-width')) {
      imageEl.setAttribute('data-slot-base-x', imageEl.getAttribute('x') || '0')
      imageEl.setAttribute('data-slot-base-y', imageEl.getAttribute('y') || '0')
      imageEl.setAttribute('data-slot-base-width', imageEl.getAttribute('width') || '0')
      imageEl.setAttribute('data-slot-base-height', imageEl.getAttribute('height') || '0')
    }

    if (!img?.dataUrl) {
      group.setAttribute('display', 'none')
      imageEl.setAttribute('href', '')
      imageEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '')
      imageEl.removeAttribute('data-image-id')
      return
    }

    group.removeAttribute('display')
    group.setAttribute('visibility', 'visible')

    // Ensure the frame rect remains visible with thick border
    const frameRect = group.querySelector('rect') as SVGRectElement | null
    if (frameRect) {
      frameRect.removeAttribute('display')
      frameRect.setAttribute('visibility', 'visible')
      frameRect.setAttribute('stroke-width', '20')
      frameRect.setAttribute('stroke-opacity', '1')
    }

    imageEl.setAttribute('opacity', (img.opacity / 100).toString())
    imageEl.setAttribute('href', img.dataUrl)
    imageEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    // Use xMidYMin slice to anchor at TOP (heads visible, crop from bottom)
    imageEl.setAttribute('preserveAspectRatio', 'xMidYMin slice')
    imageEl.removeAttribute('display')
    imageEl.setAttribute('visibility', 'visible')
    imageEl.setAttribute('data-image-id', img.id)

    // Lock small-slot image size to the template frame by default.
    // Users can drag to adjust crop position, but we don't want pinch-resize here.
    const baseW = parseFloat(imageEl.getAttribute('data-slot-base-width') || '')
    const baseH = parseFloat(imageEl.getAttribute('data-slot-base-height') || '')
    if (Number.isFinite(baseW) && baseW > 0) imageEl.setAttribute('width', String(baseW))
    if (Number.isFinite(baseH) && baseH > 0) imageEl.setAttribute('height', String(baseH))

    // Check if user has repositioned the group
    const hasGroupPosition = (img as any).groupTranslateX !== undefined && (img as any).groupTranslateY !== undefined

    // If the user hasn't dragged this slot AND hasn't repositioned the group, reset to base x/y (prevents drift).
    if (!(img as any).hasUserPosition && !hasGroupPosition) {
      const baseX = parseFloat(imageEl.getAttribute('data-slot-base-x') || '')
      const baseY = parseFloat(imageEl.getAttribute('data-slot-base-y') || '')
      if (Number.isFinite(baseX)) imageEl.setAttribute('x', String(baseX))
      if (Number.isFinite(baseY)) imageEl.setAttribute('y', String(baseY))
      imageEl.removeAttribute('data-user-position')
      // Reset group transform only if no saved group position
      group.removeAttribute('transform')
    }

    // If the user has moved the group, restore the transform
    if (hasGroupPosition) {
      group.setAttribute('transform', `translate(${(img as any).groupTranslateX}, ${(img as any).groupTranslateY})`)
    }

    // Apply flip transform to the image element if flipped
    if (img.flipped) {
      const imgX = parseFloat(imageEl.getAttribute('x') || '0')
      const imgWidth = parseFloat(imageEl.getAttribute('width') || '100')
      const centerX = imgX + imgWidth / 2
      imageEl.setAttribute('transform', `translate(${centerX}, 0) scale(-1, 1) translate(-${centerX}, 0)`)
    } else {
      imageEl.removeAttribute('transform')
    }

    // Make the entire group draggable (frame + image move together)
    if (!group.hasAttribute('data-group-draggable')) {
      group.style.pointerEvents = 'all'
      makeSVGGroupDraggable(group, img.id, svgImageManager)
    }
  }

  // Always keep the small slots in sync (if the current template includes them).
  updateSmallSlot('secondary-image-group', 'userImageSecondary', images[1])
  updateSmallSlot('tertiary-image-group', 'userImageTertiary', images[2])
  
  // Check for userImage element
  let userImageElement = svgElement.querySelector('#userImage') || svgElement.querySelector('#placeholder-image')
  console.log('🖼️ updateSVGWithImages: found userImageElement?', !!userImageElement, userImageElement?.id)
  
  // Create if needed
  if (!userImageElement && images.length > 0) {
    userImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    userImageElement.setAttribute('id', 'userImage')
    // Insert ABOVE background layers (not as first child).
    const bgImage = svgElement.querySelector('#background-image')
    const firstText = svgElement.querySelector('text')
    if (bgImage && bgImage.parentNode === svgElement) {
      bgImage.after(userImageElement)
    } else if (firstText && firstText.parentNode === svgElement) {
      svgElement.insertBefore(userImageElement, firstText)
    } else {
      svgElement.appendChild(userImageElement)
    }
  }
  
  if (userImageElement && images.length > 0) {
    // Stable ordering: first image is main, second/third are small slots.
    const img = images[0]

    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number)
    const svgWidth = viewBox ? viewBox[2] : parseFloat(svgElement.getAttribute('width') || '400')
    const svgHeight = viewBox ? viewBox[3] : parseFloat(svgElement.getAttribute('height') || '400')
    
    const isLargeTemplate = svgWidth > 1000
    const origTemplateWidth = 2996.9
    const origTemplateHeight = 1685.75

    let frameX: number, frameY: number, frameWidth: number, frameHeight: number

    if (isLargeTemplate) {
      const origFrameX = 1400
      const origFrameY = 0
      const origFrameWidth = 1580
      const origFrameHeight = 1685.75
      
      const scaleX = svgWidth / origTemplateWidth
      const scaleY = svgHeight / origTemplateHeight
      
      const contentWrapper = svgElement.querySelector('#content-wrapper')
      let offsetX = 0
      let offsetY = 0
      if (contentWrapper) {
        const transform = contentWrapper.getAttribute('transform')
        if (transform) {
          const translateMatch = transform.match(/translate\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/)
          if (translateMatch) {
            offsetX = parseFloat(translateMatch[1])
            offsetY = parseFloat(translateMatch[2])
          }
        }
      }
      
      frameX = origFrameX * scaleX + offsetX
      frameY = origFrameY * scaleY + offsetY
      frameWidth = origFrameWidth * scaleX
      frameHeight = origFrameHeight * scaleY
    } else {
      const existingWidth = parseFloat(userImageElement.getAttribute('width') || '0')
      const existingHeight = parseFloat(userImageElement.getAttribute('height') || '0')
      
      if (existingWidth > 0 && existingHeight > 0) {
        frameX = parseFloat(userImageElement.getAttribute('x') || '0')
        frameY = parseFloat(userImageElement.getAttribute('y') || '0')
        frameWidth = existingWidth
        frameHeight = existingHeight
      } else {
        frameWidth = svgWidth * 0.5
        frameHeight = svgHeight * 0.5
        frameX = (svgWidth - frameWidth) / 2
        frameY = (svgHeight - frameHeight) / 2
      }
    }
    
    const hasCustomSize = formData.customSize && formData.customSize !== ''
    
    let adjustedWidth: number
    let adjustedHeight: number
    let adjustedX: number
    let adjustedY: number
    
    // IMPORTANT: The clip-path defines the visible frame area.
    // We should NOT expand/move the clip rect to match the image size; that would remove the crop.
    // Keep the clip rect fixed to the frame (full height for this template), and move the image behind it.
    if (hasCustomSize && isLargeTemplate) {
      adjustedHeight = svgHeight
      const frameAspect = frameWidth / frameHeight
      adjustedWidth = adjustedHeight * frameAspect
      adjustedX = frameX + (frameWidth - adjustedWidth) / 2
      adjustedY = 0
    } else {
      const scale = (img.width / img.originalWidth) || 1.15
      adjustedWidth = frameWidth * scale
      adjustedHeight = frameHeight * scale
      adjustedX = frameX - (adjustedWidth - frameWidth) / 2
      adjustedY = 0
    }

    const clipPathRect = svgElement.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
    if (clipPathRect && isLargeTemplate) {
      clipPathRect.setAttribute('x', frameX.toString())
      clipPathRect.setAttribute('y', '0')
      clipPathRect.setAttribute('width', frameWidth.toString())
      clipPathRect.setAttribute('height', svgHeight.toString())
    }

    // Respect manual drag positioning if the user moved the image.
    if ((img as any).hasUserPosition && Number.isFinite(img.x) && Number.isFinite(img.y)) {
      adjustedX = img.x
      adjustedY = img.y
      userImageElement.setAttribute('data-user-position', 'true')
    }
    
    if (!img.dataUrl || img.dataUrl.length < 100) {
      console.error('Invalid dataUrl for image:', img.id)
      return
    }
    
    console.log('🖼️ updateSVGWithImages: setting image attributes', {
      id: img.id,
      dataUrlLength: img.dataUrl?.length || 0,
      dataUrlStart: img.dataUrl?.substring(0, 50) || 'none',
      x: adjustedX,
      y: adjustedY,
      width: adjustedWidth,
      height: adjustedHeight
    })
    
    userImageElement.setAttribute('x', adjustedX.toString())
    userImageElement.setAttribute('y', adjustedY.toString())
    userImageElement.setAttribute('width', adjustedWidth.toString())
    userImageElement.setAttribute('height', adjustedHeight.toString())
    userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
    userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    userImageElement.setAttribute('href', img.dataUrl)
    
    // Verify the href was actually set
    const verifyHref = userImageElement.getAttribute('href')
    console.log('🖼️ updateSVGWithImages: verified href set?', {
      hrefLength: verifyHref?.length || 0,
      hrefStart: verifyHref?.substring(0, 50) || 'none'
    })
    
    userImageElement.setAttribute('data-image-id', img.id)
    
    // Make the main image group draggable (not just the image)
    const mainImageGroup = svgElement.querySelector('#main-image-group') as SVGGElement | null
    if (mainImageGroup && !mainImageGroup.hasAttribute('data-group-draggable')) {
      mainImageGroup.style.pointerEvents = 'all'
      makeSVGGroupDraggable(mainImageGroup, img.id, svgImageManager)
    } else if (!userImageElement.hasAttribute('data-draggable')) {
      // Fallback for templates without main-image-group
      makeSVGImageDraggableFn(userImageElement as SVGImageElement, img.id)
    }
    
    // Restore main image group transform if user moved it
    if (mainImageGroup && (img as any).groupTranslateX !== undefined && (img as any).groupTranslateY !== undefined) {
      mainImageGroup.setAttribute('transform', `translate(${(img as any).groupTranslateX}, ${(img as any).groupTranslateY})`)
    }
    
    // No clipPath for main image - use meet to show full image without cropping
    userImageElement.removeAttribute('clip-path')
    userImageElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    const transforms: string[] = []
    const displayCenterX = adjustedX + adjustedWidth / 2
    const displayCenterY = adjustedY + adjustedHeight / 2

    if (img.flipped) {
      transforms.push(`translate(${displayCenterX}, 0) scale(-1, 1) translate(-${displayCenterX}, 0)`)
    }
    
    if (img.rotation !== 0) {
      transforms.push(`rotate(${img.rotation} ${displayCenterX} ${displayCenterY})`)
    }
    
    if (transforms.length > 0) {
      userImageElement.setAttribute('transform', transforms.join(' '))
    } else {
      userImageElement.removeAttribute('transform')
    }

    const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
    existingImages.forEach(img => img.remove())
    
    return
  }

  // Fallback behavior
  const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
  existingImages.forEach(img => img.remove())

  if (images.length === 0) return

  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)
  const placeholderImage = svgElement.querySelector('#placeholder-image')
  const firstTextElement = svgElement.querySelector('text')
  let insertionPoint = placeholderImage || firstTextElement

  sortedImages.forEach(img => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')

    imageElement.setAttribute('id', img.id)
    imageElement.setAttribute('x', img.x.toString())
    imageElement.setAttribute('y', img.y.toString())
    imageElement.setAttribute('width', img.width.toString())
    imageElement.setAttribute('height', img.height.toString())
    imageElement.setAttribute('opacity', (img.opacity / 100).toString())
    imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    
    const transforms: string[] = []
    
    if (img.flipped) {
      const centerX = img.x + img.width / 2
      transforms.push(`translate(${centerX}, 0) scale(-1, 1) translate(-${centerX}, 0)`)
    }
    
    if (img.rotation !== 0) {
      const centerX = img.x + img.width / 2
      const centerY = img.y + img.height / 2
      transforms.push(`rotate(${img.rotation} ${centerX} ${centerY})`)
    }
    
    if (transforms.length > 0) {
      imageElement.setAttribute('transform', transforms.join(' '))
    }

    if (insertionPoint && insertionPoint.parentNode === svgElement) {
      svgElement.insertBefore(imageElement, insertionPoint)
    } else {
      svgElement.appendChild(imageElement)
    }
  })
}

// ============================================
// HANDLE SIZE CHANGE
// ============================================

interface SizeChangeDeps {
  weddingPreviewContainer: { value: HTMLDivElement | null }
  updateSVGWithImagesFn: () => void
  updateChatPreviewSVG: () => void
}

export async function handleSizeChange(
  widthInches: number, 
  heightInches: number,
  deps: SizeChangeDeps
) {
  const { weddingPreviewContainer, updateSVGWithImagesFn, updateChatPreviewSVG } = deps
  
  if (!weddingPreviewContainer.value) return

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) return

  // Get/store original viewBox
  let originalViewBox = svgElement.getAttribute('data-original-viewbox')?.split(/\s+|,/).map(Number)

  if (!originalViewBox || originalViewBox.length !== 4) {
    const currentViewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
    if (currentViewBox && currentViewBox.length === 4) {
      svgElement.setAttribute('data-original-viewbox', currentViewBox.join(' '))
      originalViewBox = currentViewBox
    } else {
      const w = parseFloat(svgElement.getAttribute('width') || '1600')
      const h = parseFloat(svgElement.getAttribute('height') || '1600')
      originalViewBox = [0, 0, w, h]
      svgElement.setAttribute('data-original-viewbox', originalViewBox.join(' '))
    }
  }

  const origWidth = originalViewBox[2]
  const origHeight = originalViewBox[3]

  const DPI = 300
  const widthPixels = widthInches * DPI
  const heightPixels = heightInches * DPI

  const origAspectRatio = origWidth / origHeight
  const newAspectRatio = widthInches / heightInches

  svgElement.setAttribute('data-export-width', `${widthInches}in`)
  svgElement.setAttribute('data-export-height', `${heightInches}in`)
  svgElement.setAttribute('data-export-width-px', `${widthPixels}`)
  svgElement.setAttribute('data-export-height-px', `${heightPixels}`)

  let newViewBoxWidth: number
  let newViewBoxHeight: number

  // Preserve the original template geometry and only expand the canvas.
  // This avoids cumulative transforms/path edits that can drift the design over repeated size changes.
  if (newAspectRatio > origAspectRatio) {
    newViewBoxHeight = origHeight
    newViewBoxWidth = origHeight * newAspectRatio
  } else {
    newViewBoxWidth = origWidth
    newViewBoxHeight = origWidth / newAspectRatio
  }

  // Center the original content in the new aspect ratio by shifting the viewBox origin.
  // This avoids introducing wrapper transforms that complicate export and text positioning.
  const viewBoxMinX = (origWidth - newViewBoxWidth) / 2
  const viewBoxMinY = (origHeight - newViewBoxHeight) / 2

  svgElement.setAttribute('viewBox', `${viewBoxMinX} ${viewBoxMinY} ${newViewBoxWidth} ${newViewBoxHeight}`)

  // For the live preview, keep the SVG responsive. Do NOT set huge pixel width/height here;
  // we only store export dimensions as metadata for the exporter.
  svgElement.removeAttribute('width')
  svgElement.removeAttribute('height')
  svgElement.style.width = '100%'
  svgElement.style.height = 'auto'
  svgElement.style.maxWidth = '100%'
  svgElement.style.display = 'block'

  // Update background rects
  const bgRects = svgElement.querySelectorAll('rect')
  bgRects.forEach(rect => {
    const rectW = parseFloat(rect.getAttribute('width') || '0')
    const rectH = parseFloat(rect.getAttribute('height') || '0')
    if (Math.abs(rectW - origWidth) < 10 && Math.abs(rectH - origHeight) < 10) {
      rect.setAttribute('x', String(viewBoxMinX))
      rect.setAttribute('y', String(viewBoxMinY))
      rect.setAttribute('width', String(newViewBoxWidth))
      rect.setAttribute('height', String(newViewBoxHeight))

      // Ensure the background is not inside any wrapper/group so it covers the full canvas.
      // Use parentNode for correct SVG typings (parentElement can be HTMLElement-typed).
      if (rect.parentNode && rect.parentNode !== svgElement) {
        rect.parentNode.removeChild(rect)
        const defs = svgElement.querySelector('defs')
        if (defs && defs.nextSibling) svgElement.insertBefore(rect, defs.nextSibling)
        else svgElement.insertBefore(rect, svgElement.firstChild)
      }
    }
  })

  // Update background image
  const bgImage = svgElement.querySelector('#background-image') as SVGImageElement
  if (bgImage) {
    bgImage.setAttribute('width', String(newViewBoxWidth))
    bgImage.setAttribute('height', String(newViewBoxHeight))
    bgImage.setAttribute('x', String(viewBoxMinX))
    bgImage.setAttribute('y', String(viewBoxMinY))

    // Ensure it's at root so it isn't affected by any transforms.
    // Use parentNode for correct SVG typings.
    if (bgImage.parentNode && bgImage.parentNode !== svgElement) {
      bgImage.parentNode.removeChild(bgImage)
      const defs = svgElement.querySelector('defs')
      if (defs && defs.nextSibling) svgElement.insertBefore(bgImage, defs.nextSibling)
      else svgElement.insertBefore(bgImage, svgElement.firstChild)
    }
  }

  await nextTick()
  updateSVGWithImagesFn()
  updateChatPreviewSVG()
}
