/**
 * Image Retouch Logic
 * This composable provides automatic image enhancement and retouching
 */

export function useImageRetouch() {
  
  /**
   * Apply automatic retouch to an image
   * @param imageDataUrl - Base64 data URL of the image
   * @returns Promise with retouched image data URL
   */
  async function applyRetouch(imageDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          // Create canvas for image processing
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw original image
          ctx.drawImage(img, 0, 0)
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Apply retouch enhancements
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            
            // 1. Brightness enhancement (+10%)
            const brightnessFactor = 1.1
            
            // 2. Contrast enhancement (+15%)
            const contrastFactor = 1.15
            const contrastOffset = 128 * (1 - contrastFactor)
            
            // 3. Saturation boost (+20%)
            const gray = 0.299 * r + 0.587 * g + 0.114 * b
            const saturationFactor = 1.2
            
            // Apply brightness
            let newR = r * brightnessFactor
            let newG = g * brightnessFactor
            let newB = b * brightnessFactor
            
            // Apply contrast
            newR = newR * contrastFactor + contrastOffset
            newG = newG * contrastFactor + contrastOffset
            newB = newB * contrastFactor + contrastOffset
            
            // Apply saturation
            newR = gray + (newR - gray) * saturationFactor
            newG = gray + (newG - gray) * saturationFactor
            newB = gray + (newB - gray) * saturationFactor
            
            // 4. Slight sharpening effect
            const sharpenFactor = 1.05
            newR = gray + (newR - gray) * sharpenFactor
            newG = gray + (newG - gray) * sharpenFactor
            newB = gray + (newB - gray) * sharpenFactor
            
            // Clamp values to 0-255
            data[i] = Math.min(255, Math.max(0, newR))
            data[i + 1] = Math.min(255, Math.max(0, newG))
            data[i + 2] = Math.min(255, Math.max(0, newB))
            // Alpha channel (data[i + 3]) remains unchanged
          }
          
          // Apply smoothing filter (simple blur for skin smoothing)
          const smoothedData = applySmoothing(data, canvas.width, canvas.height)
          
          // Put processed data back
          for (let i = 0; i < data.length; i++) {
            imageData.data[i] = smoothedData[i]
          }
          
          ctx.putImageData(imageData, 0, 0)
          
          // Convert to data URL
          const retouchedDataUrl = canvas.toDataURL('image/png', 0.95)
          resolve(retouchedDataUrl)
          
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = imageDataUrl
    })
  }
  
  /**
   * Apply smoothing filter for skin smoothing effect
   */
  function applySmoothing(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data)
    const radius = 1 // Small radius for subtle smoothing
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0, g = 0, b = 0, count = 0
        
        // Average surrounding pixels
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            r += data[idx]
            g += data[idx + 1]
            b += data[idx + 2]
            count++
          }
        }
        
        const idx = (y * width + x) * 4
        
        // Blend original with smoothed (70% original, 30% smoothed)
        const blendFactor = 0.3
        result[idx] = data[idx] * (1 - blendFactor) + (r / count) * blendFactor
        result[idx + 1] = data[idx + 1] * (1 - blendFactor) + (g / count) * blendFactor
        result[idx + 2] = data[idx + 2] * (1 - blendFactor) + (b / count) * blendFactor
        result[idx + 3] = data[idx + 3] // Keep alpha unchanged
      }
    }
    
    return result
  }
  
  return {
    applyRetouch
  }
}
