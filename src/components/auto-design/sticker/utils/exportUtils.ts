/**
 * Export Utilities
 * 
 * Handles wedding sticker export functionality (SVG/PNG).
 * Extracted from StickerTemplatePanel.vue for file size reduction.
 */

import type { Ref } from 'vue'

// ============================================================================
// Types
// ============================================================================

export interface SVGImage {
  id: string
  file: File
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  maintainAspectRatio: boolean
  originalWidth: number
  originalHeight: number
  flipped: boolean
  isRetouched?: boolean
}

export interface ExportContext {
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  svgImageManager: {
    images: Ref<SVGImage[]>
  }
  exportSVG: (
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: { filename: string; format: 'svg' | 'png'; pngResolution: number }
  ) => Promise<void>
  validateForExport: (svgElement: SVGSVGElement) => { valid: boolean; warnings: string[] }
  PRINT_DPI: number
  showNotification: (opts: { title: string; message: string; type: string }) => void
}

// ============================================================================
// Export Wedding Sticker
// ============================================================================

/**
 * Export the wedding sticker as SVG or PNG
 */
export async function exportWeddingStickerUtil(
  format: 'svg' | 'png',
  ctx: ExportContext
): Promise<void> {
  const {
    weddingPreviewContainer,
    svgImageManager,
    exportSVG,
    validateForExport,
    PRINT_DPI,
    showNotification
  } = ctx

  if (!weddingPreviewContainer.value) {
    showNotification({
      title: 'Export Error',
      message: 'No sticker to export',
      type: 'error'
    })
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    showNotification({
      title: 'Export Error',
      message: 'SVG element not found',
      type: 'error'
    })
    return
  }

  try {
    const filename = `wedding-sticker-${new Date().toISOString().split('T')[0]}`

    // Validate SVG is properly configured for export
    validateForExport(svgElement)

    // IMPORTANT: Never mutate the live SVG in the editor during export.
    // Changing width/height can affect CSS-driven font sizes and layout (causing text jumps).
    const svgForExport = svgElement.cloneNode(true) as SVGSVGElement

    // Get stored export dimensions (set by handleSizeChange)
    const exportWidthPx = svgForExport.getAttribute('data-export-width-px')
    const exportHeightPx = svgForExport.getAttribute('data-export-height-px')
    const exportWidth = svgForExport.getAttribute('data-export-width')
    const exportHeight = svgForExport.getAttribute('data-export-height')

    // Apply pixel dimensions for canvas export (critical for PNG)
    if (exportWidthPx && exportHeightPx) {
      svgForExport.setAttribute('width', exportWidthPx)
      svgForExport.setAttribute('height', exportHeightPx)
      // Remove CSS constraints that might interfere with the export canvas sizing
      svgForExport.style.width = ''
      svgForExport.style.height = ''
    } else if (exportWidth && exportHeight) {
      // Fallback to inch dimensions
      svgForExport.setAttribute('width', exportWidth)
      svgForExport.setAttribute('height', exportHeight)
      svgForExport.style.width = ''
      svgForExport.style.height = ''
    } else {
      // No custom size set - calculate from viewBox to preserve aspect ratio
      const viewBox = svgForExport.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
      if (viewBox && viewBox.length >= 4) {
        const vbWidth = viewBox[2]
        const vbHeight = viewBox[3]
        // Calculate high-res export dimensions at 300 DPI equivalent
        const scale = PRINT_DPI / 96
        const calculatedWidth = Math.round(vbWidth * scale)
        const calculatedHeight = Math.round(vbHeight * scale)
        svgForExport.setAttribute('width', String(calculatedWidth))
        svgForExport.setAttribute('height', String(calculatedHeight))
        svgForExport.style.width = ''
        svgForExport.style.height = ''
      }
    }

    // Ensure preserveAspectRatio is set for distortion-free export
    if (!svgForExport.getAttribute('preserveAspectRatio')) {
      svgForExport.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    await exportSVG(svgForExport, svgImageManager.images.value, {
      filename: format === 'svg' ? `${filename}.svg` : `${filename}.png`,
      format,
      pngResolution: PRINT_DPI
    })

    showNotification({
      title: 'Download Successful',
      message: `Sticker downloaded as ${format.toUpperCase()}`,
      type: 'success'
    })
  } catch (error) {
    showNotification({
      title: 'Export Failed',
      message: error instanceof Error ? error.message : 'Failed to export sticker',
      type: 'error'
    })
  }
}
