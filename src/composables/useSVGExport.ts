import type { SVGImage } from './useSVGImageManager'

/**
 * SVG Export Composable
 * Handles exporting SVG with embedded images and dynamic text content
 */

export interface ExportOptions {
  filename?: string
  includeImages?: boolean
  includeText?: boolean
  format?: 'svg' | 'png'
  pngResolution?: number // DPI for PNG export, default 300
}

const DEFAULT_EXPORT_OPTIONS: Required<ExportOptions> = {
  filename: `wedding-sticker-${new Date().toISOString().split('T')[0]}.svg`,
  includeImages: true,
  includeText: true,
  format: 'svg',
  pngResolution: 300
}

export function useSVGExport() {
  /**
   * Embed images into SVG element
   */
  function embedImagesInSVG(svgElement: SVGSVGElement, images: SVGImage[]): SVGSVGElement {
    // Clone the SVG to avoid modifying the original
    const clonedSVG = svgElement.cloneNode(true) as SVGSVGElement

    // Sort images by z-index to maintain layer order
    const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

    // Find the insertion point (after background elements, before text elements)
    // We'll insert images right before the first text element
    const firstTextElement = clonedSVG.querySelector('text')
    const insertionPoint = firstTextElement || clonedSVG

    // Add each image as an <image> element
    sortedImages.forEach(img => {
      // Check if there's a placeholder/userImage element to update first
      const userImageElement = clonedSVG.querySelector('#userImage') || clonedSVG.querySelector('#placeholder-image')
      
      if (userImageElement) {
        // Update existing element instead of creating new one
        userImageElement.setAttribute('x', img.x.toString())
        userImageElement.setAttribute('y', img.y.toString())
        userImageElement.setAttribute('width', img.width.toString())
        userImageElement.setAttribute('height', img.height.toString())
        userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
        userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
        userImageElement.setAttribute('href', img.dataUrl)
        
        // Apply rotation if needed
        if (img.rotation !== 0) {
          const centerX = img.x + img.width / 2
          const centerY = img.y + img.height / 2
          userImageElement.setAttribute('transform', `rotate(${img.rotation} ${centerX} ${centerY})`)
        } else {
          userImageElement.removeAttribute('transform')
        }
        
        // Ensure clip-path and preserveAspectRatio are set
        if (userImageElement.id === 'userImage') {
             if (!userImageElement.hasAttribute('clip-path')) {
                userImageElement.setAttribute('clip-path', 'url(#imageClip)')
             }
             if (!userImageElement.hasAttribute('preserveAspectRatio')) {
                userImageElement.setAttribute('preserveAspectRatio', 'xMinYMin slice')
             }
        }
        
        return // Skip creating new element
      }

      const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      
      // Set attributes
      imageElement.setAttribute('id', img.id)
      imageElement.setAttribute('x', img.x.toString())
      imageElement.setAttribute('y', img.y.toString())
      imageElement.setAttribute('width', img.width.toString())
      imageElement.setAttribute('height', img.height.toString())
      imageElement.setAttribute('opacity', (img.opacity / 100).toString())
      imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)

      // Apply rotation if needed
      if (img.rotation !== 0) {
        const centerX = img.x + img.width / 2
        const centerY = img.y + img.height / 2
        imageElement.setAttribute('transform', `rotate(${img.rotation} ${centerX} ${centerY})`)
      }

      // Insert before first text element or append to SVG
      if (firstTextElement) {
        clonedSVG.insertBefore(imageElement, firstTextElement)
      } else {
        clonedSVG.appendChild(imageElement)
      }
    })

    return clonedSVG
  }

  /**
   * Ensure fonts are embedded in SVG
   */
  function ensureFontsEmbedded(svgElement: SVGSVGElement): void {
    // Check if fonts are already embedded
    const existingStyle = svgElement.querySelector('defs style')
    if (existingStyle && existingStyle.textContent?.includes('@import')) {
      // Fonts already embedded
      return
    }

    // Add font imports to defs
    let defs = svgElement.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svgElement.insertBefore(defs, svgElement.firstChild)
    }

    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleElement.setAttribute('type', 'text/css')
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap');
      
      text {
        font-family: 'Lato', 'Arial', 'Helvetica', sans-serif;
      }
      
      .serif-font {
        font-family: 'Playfair Display', 'Times New Roman', 'Georgia', serif;
      }
    `
    defs.insertBefore(styleElement, defs.firstChild)
  }

  /**
   * Serialize SVG to string
   */
  function serializeSVG(svgElement: SVGSVGElement): string {
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svgElement)

    // Add XML declaration
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString

    return svgString
  }

  /**
   * Download file
   */
  function downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  /**
   * Export SVG as SVG file
   */
  function exportAsSVG(
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: Partial<ExportOptions> = {}
  ): void {
    const config = { ...DEFAULT_EXPORT_OPTIONS, ...options }

    try {
      // Clone and embed images
      let exportSVG = svgElement.cloneNode(true) as SVGSVGElement

      if (config.includeImages && images.length > 0) {
        exportSVG = embedImagesInSVG(exportSVG, images)
      }

      // Ensure fonts are embedded
      ensureFontsEmbedded(exportSVG)

      // Serialize to string
      const svgString = serializeSVG(exportSVG)

      // Download
      downloadFile(svgString, config.filename, 'image/svg+xml')

      console.log('✅ SVG exported successfully:', config.filename)
    } catch (error) {
      console.error('❌ Failed to export SVG:', error)
      throw error
    }
  }

  /**
   * Export SVG as PNG file
   */
  async function exportAsPNG(
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const config = { ...DEFAULT_EXPORT_OPTIONS, ...options }

    try {
      // Clone and embed images
      let exportSVG = svgElement.cloneNode(true) as SVGSVGElement

      if (config.includeImages && images.length > 0) {
        exportSVG = embedImagesInSVG(exportSVG, images)
      }

      // Ensure fonts are embedded
      ensureFontsEmbedded(exportSVG)

      // Get SVG dimensions
      const viewBox = exportSVG.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 800, 600]
      const svgWidth = viewBox[2]
      const svgHeight = viewBox[3]

      // Calculate canvas dimensions based on DPI
      const scale = config.pngResolution / 96 // 96 DPI is standard screen resolution
      const canvasWidth = svgWidth * scale
      const canvasHeight = svgHeight * scale

      // Serialize SVG
      const svgString = serializeSVG(exportSVG)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create image from SVG
      const img = new Image()
      img.width = canvasWidth
      img.height = canvasHeight

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas')
          canvas.width = canvasWidth
          canvas.height = canvasHeight

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Draw SVG on canvas
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

          // Convert to PNG blob
          canvas.toBlob((blob) => {
            if (blob) {
              const pngFilename = config.filename.replace(/\.svg$/, '.png')
              downloadFile(blob, pngFilename, 'image/png')
              console.log('✅ PNG exported successfully:', pngFilename)
              resolve()
            } else {
              reject(new Error('Failed to create PNG blob'))
            }
          }, 'image/png')

          // Clean up
          URL.revokeObjectURL(svgUrl)
        }

        img.onerror = () => {
          URL.revokeObjectURL(svgUrl)
          reject(new Error('Failed to load SVG image'))
        }

        img.src = svgUrl
      })
    } catch (error) {
      console.error('❌ Failed to export PNG:', error)
      throw error
    }
  }

  /**
   * Export with automatic format detection
   */
  async function exportSVG(
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const config = { ...DEFAULT_EXPORT_OPTIONS, ...options }

    if (config.format === 'png') {
      await exportAsPNG(svgElement, images, options)
    } else {
      exportAsSVG(svgElement, images, options)
    }
  }

  /**
   * Get SVG preview as data URL
   */
  async function getSVGPreviewDataUrl(
    svgElement: SVGSVGElement,
    images: SVGImage[]
  ): Promise<string> {
    try {
      // Clone and embed images
      const exportSVG = embedImagesInSVG(svgElement, images)

      // Serialize to string
      const svgString = serializeSVG(exportSVG)

      // Convert to data URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read blob'))
        reader.readAsDataURL(svgBlob)
      })

      return dataUrl
    } catch (error) {
      console.error('❌ Failed to get SVG preview:', error)
      throw error
    }
  }

  /**
   * Validate SVG before export
   */
  function validateSVG(svgElement: SVGSVGElement): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if SVG element exists
    if (!svgElement) {
      errors.push('SVG element not found')
      return { valid: false, errors }
    }

    // Check if SVG has viewBox
    if (!svgElement.getAttribute('viewBox')) {
      errors.push('SVG missing viewBox attribute')
    }

    // Check if SVG has content
    if (svgElement.children.length === 0) {
      errors.push('SVG has no content')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  return {
    exportSVG,
    exportAsSVG,
    exportAsPNG,
    getSVGPreviewDataUrl,
    validateSVG
  }
}

