import { logger } from './logger'

/**
 * Export Konva stage to blob with high DPI support
 */
export const exportStageToBlob = (stage: any, mimeType = 'image/png', pixelRatio = 2): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Create high-resolution canvas
      const canvas = stage.toCanvas({
        pixelRatio,
        mimeType,
        quality: 0.9
      })

      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      }, mimeType, 0.9)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export Konva stage to data URL with high DPI support
 */
export const exportStageToDataURL = (stage: any, mimeType = 'image/png', pixelRatio = 2): string | null => {
  try {
    return stage.toDataURL({
      pixelRatio,
      mimeType,
      quality: 0.9
    })
  } catch (error) {
    logger.error('Export to data URL failed:', error)
    return null
  }
}

/**
 * Snap coordinates to grid
 */
export const snapToGrid = (pos: { x: number; y: number }, gridSize = 20) => {
  return {
    x: Math.round(pos.x / gridSize) * gridSize,
    y: Math.round(pos.y / gridSize) * gridSize
  }
}

interface AlignmentGuide {
  type: 'vertical' | 'horizontal'
  x?: number
  y?: number
  x1?: number
  x2?: number
  y1?: number
  y2?: number
}

/**
 * Get alignment guides for smart snapping
 */
export const getAlignmentGuides = (activeNode: any, stage: any, snapDistance = 5): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = []
  const activeBox = activeNode.getClientRect()
  const activeCenterX = activeBox.x + activeBox.width / 2
  const activeCenterY = activeBox.y + activeBox.height / 2

  // Get all other nodes
  const nodes = stage.find('Image').filter((node: any) => node !== activeNode)
  
  nodes.forEach((node: any) => {
    const box = node.getClientRect()
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    
    // Vertical alignment guides
    if (Math.abs(activeCenterX - centerX) < snapDistance) {
      guides.push({
        type: 'vertical',
        x: centerX,
        y1: Math.min(activeBox.y, box.y),
        y2: Math.max(activeBox.y + activeBox.height, box.y + box.height)
      })
    }
    
    if (Math.abs(activeBox.x - box.x) < snapDistance) {
      guides.push({
        type: 'vertical',
        x: box.x,
        y1: Math.min(activeBox.y, box.y),
        y2: Math.max(activeBox.y + activeBox.height, box.y + box.height)
      })
    }
    
    if (Math.abs(activeBox.x + activeBox.width - box.x - box.width) < snapDistance) {
      guides.push({
        type: 'vertical',
        x: box.x + box.width,
        y1: Math.min(activeBox.y, box.y),
        y2: Math.max(activeBox.y + activeBox.height, box.y + box.height)
      })
    }
    
    // Horizontal alignment guides
    if (Math.abs(activeCenterY - centerY) < snapDistance) {
      guides.push({
        type: 'horizontal',
        y: centerY,
        x1: Math.min(activeBox.x, box.x),
        x2: Math.max(activeBox.x + activeBox.width, box.x + box.width)
      })
    }
    
    if (Math.abs(activeBox.y - box.y) < snapDistance) {
      guides.push({
        type: 'horizontal',
        y: box.y,
        x1: Math.min(activeBox.x, box.x),
        x2: Math.max(activeBox.x + activeBox.width, box.x + box.width)
      })
    }
    
    if (Math.abs(activeBox.y + activeBox.height - box.y - box.height) < snapDistance) {
      guides.push({
        type: 'horizontal',
        y: box.y + box.height,
        x1: Math.min(activeBox.x, box.x),
        x2: Math.max(activeBox.x + activeBox.width, box.x + box.width)
      })
    }
  })
  
  return guides
}

/**
 * Apply snapping to position based on guides
 */
export const applySnapping = (pos: { x: number; y: number }, guides: AlignmentGuide[], snapDistance = 5) => {
  let snappedX = pos.x
  let snappedY = pos.y

  guides.forEach(guide => {
    if (guide.type === 'vertical' && guide.x !== undefined && Math.abs(pos.x - guide.x) < snapDistance) {
      snappedX = guide.x
    }
    if (guide.type === 'horizontal' && guide.y !== undefined && Math.abs(pos.y - guide.y) < snapDistance) {
      snappedY = guide.y
    }
  })

  return { x: snappedX, y: snappedY }
}

/**
 * Calculate optimal image size for canvas
 */
export const calculateImageSize = (imageWidth: number, imageHeight: number, maxWidth = 400, maxHeight = 400) => {
  const ratio = Math.min(maxWidth / imageWidth, maxHeight / imageHeight)
  
  if (ratio < 1) {
    return {
      width: imageWidth * ratio,
      height: imageHeight * ratio
    }
  }
  
  return {
    width: imageWidth,
    height: imageHeight
  }
}

/**
 * Load image from URL with error handling
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    
    img.src = src
  })
}

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = undefined
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Create thumbnail from image
 */
export const createThumbnail = (image: HTMLImageElement, maxSize = 200): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const { width, height } = calculateImageSize(image.width, image.height, maxSize, maxSize)

  canvas.width = width
  canvas.height = height

  ctx.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.8)
}

/**
 * Performance optimization: Cache Konva nodes
 */
export const cacheNode = (node: any, scale = 1): void => {
  node.cache({
    pixelRatio: scale
  })
}

/**
 * Performance optimization: Clear cache when needed
 */
export const clearCache = (node: any): void => {
  node.clearCache()
}
