/**
 * Export Utility Functions
 * Client-side export helpers using Konva
 */

import type Konva from 'konva'
import type { ExportOptions, ExportFormat } from '@/types/export'
import { RESOLUTION_PRESETS } from '@/types/export'

/**
 * Export stage to blob
 */
export async function exportStageToBlob(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<Blob> {
  const { format, quality = 0.9, transparent = false } = options

  // Get dimensions
  const { width, height } = getExportDimensions(stage, options)

  // Get mime type
  const mimeType = getMimeType(format)

  // Configure export options
  const exportConfig: any = {
    mimeType,
    pixelRatio: getPixelRatio(options),
    width,
    height,
  }

  // Add quality for JPEG
  if (format === 'jpeg') {
    exportConfig.quality = quality
  }

  // Handle background
  if (!transparent && options.background === 'solid' && options.backgroundColor) {
    // Create temporary background
    const originalBg = stage.findOne('#background-rect') as Konva.Rect | undefined
    if (originalBg) {
      const originalFill = originalBg.fill()
      originalBg.fill(options.backgroundColor)

      const blob = await new Promise<Blob>((resolve, reject) => {
        stage.toBlob({
          ...exportConfig,
          callback: (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          },
        })
      })

      // Restore original background
      originalBg.fill(originalFill)
      return blob
    }
  }

  // Standard export
  return new Promise<Blob>((resolve, reject) => {
    stage.toBlob({
      ...exportConfig,
      callback: (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
    })
  })
}

/**
 * Export stage to data URL
 */
export function exportStageToDataURL(
  stage: Konva.Stage,
  options: ExportOptions
): string {
  const { format, quality = 0.9 } = options

  // Get dimensions
  const { width, height } = getExportDimensions(stage, options)

  // Get mime type
  const mimeType = getMimeType(format)

  // Configure export options
  const exportConfig: any = {
    mimeType,
    pixelRatio: getPixelRatio(options),
    width,
    height,
  }

  // Add quality for JPEG
  if (format === 'jpeg') {
    exportConfig.quality = quality
  }

  return stage.toDataURL(exportConfig)
}

/**
 * Export stage to SVG
 */
export function exportStageToSVG(stage: Konva.Stage): string {
  // Get stage dimensions
  const width = stage.width()
  const height = stage.height()

  // Create SVG header
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`

  // Get all layers
  const layers = stage.getLayers()

  layers.forEach((layer) => {
    svg += convertLayerToSVG(layer)
  })

  svg += '</svg>'

  return svg
}

/**
 * Convert Konva layer to SVG
 */
function convertLayerToSVG(layer: Konva.Layer): string {
  let svg = '<g>\n'

  const children = layer.getChildren()

  children.forEach((node) => {
    svg += convertNodeToSVG(node)
  })

  svg += '</g>\n'

  return svg
}

/**
 * Convert Konva node to SVG element
 */
function convertNodeToSVG(node: Konva.Node): string {
  const className = node.getClassName()

  switch (className) {
    case 'Rect':
      return convertRectToSVG(node as Konva.Rect)
    case 'Circle':
      return convertCircleToSVG(node as Konva.Circle)
    case 'Text':
      return convertTextToSVG(node as Konva.Text)
    case 'Image':
      return convertImageToSVG(node as Konva.Image)
    case 'Line':
      return convertLineToSVG(node as Konva.Line)
    default:
      return ''
  }
}

/**
 * Convert Rect to SVG
 */
function convertRectToSVG(rect: Konva.Rect): string {
  const x = rect.x()
  const y = rect.y()
  const width = rect.width()
  const height = rect.height()
  const fill = rect.fill() || 'none'
  const stroke = rect.stroke() || 'none'
  const strokeWidth = rect.strokeWidth() || 0

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />\n`
}

/**
 * Convert Circle to SVG
 */
function convertCircleToSVG(circle: Konva.Circle): string {
  const cx = circle.x()
  const cy = circle.y()
  const r = circle.radius()
  const fill = circle.fill() || 'none'
  const stroke = circle.stroke() || 'none'
  const strokeWidth = circle.strokeWidth() || 0

  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />\n`
}

/**
 * Convert Text to SVG
 */
function convertTextToSVG(text: Konva.Text): string {
  const x = text.x()
  const y = text.y()
  const content = text.text()
  const fontSize = text.fontSize()
  const fontFamily = text.fontFamily()
  const fill = text.fill() || '#000000'

  return `<text x="${x}" y="${y + fontSize}" font-size="${fontSize}" font-family="${fontFamily}" fill="${fill}">${escapeXml(content)}</text>\n`
}

/**
 * Convert Image to SVG
 */
function convertImageToSVG(image: Konva.Image): string {
  const x = image.x()
  const y = image.y()
  const width = image.width()
  const height = image.height()
  const img = image.image() as HTMLImageElement

  if (!img || !img.src) return ''

  return `<image x="${x}" y="${y}" width="${width}" height="${height}" href="${img.src}" />\n`
}

/**
 * Convert Line to SVG
 */
function convertLineToSVG(line: Konva.Line): string {
  const points = line.points()
  const stroke = line.stroke() || '#000000'
  const strokeWidth = line.strokeWidth() || 1

  if (points.length < 2) return ''

  let pathData = `M ${points[0]} ${points[1]}`
  for (let i = 2; i < points.length; i += 2) {
    pathData += ` L ${points[i]} ${points[i + 1]}`
  }

  return `<path d="${pathData}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" />\n`
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Get export dimensions based on options
 */
function getExportDimensions(
  stage: Konva.Stage,
  options: ExportOptions
): { width: number; height: number } {
  if (options.resolution === 'custom' && options.customWidth && options.customHeight) {
    return {
      width: options.customWidth,
      height: options.customHeight,
    }
  }

  const preset = RESOLUTION_PRESETS[options.resolution]
  return {
    width: preset.width,
    height: preset.height,
  }
}

/**
 * Get pixel ratio based on DPI
 */
function getPixelRatio(options: ExportOptions): number {
  if (options.dpi) {
    return options.dpi / 72 // 72 DPI is the base
  }

  const preset = RESOLUTION_PRESETS[options.resolution]
  return preset.dpi / 72
}

/**
 * Get MIME type for format
 */
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'svg':
      return 'image/svg+xml'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'image/png'
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Get file name for export
 */
export function getExportFileName(
  projectName: string,
  format: ExportFormat,
  timestamp: boolean = true
): string {
  const sanitized = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const time = timestamp ? `_${Date.now()}` : ''
  const extension = format === 'jpeg' ? 'jpg' : format

  return `${sanitized}${time}.${extension}`
}

/**
 * Estimate file size
 */
export function estimateFileSize(
  width: number,
  height: number,
  format: ExportFormat,
  quality: number = 0.9
): number {
  const pixels = width * height

  switch (format) {
    case 'png':
      // PNG: ~4 bytes per pixel (RGBA)
      return pixels * 4
    case 'jpeg':
      // JPEG: varies by quality, rough estimate
      return pixels * quality * 0.5
    case 'svg':
      // SVG: depends on complexity, rough estimate
      return pixels * 0.1
    case 'pdf':
      // PDF: similar to JPEG
      return pixels * quality * 0.6
    default:
      return pixels * 2
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

