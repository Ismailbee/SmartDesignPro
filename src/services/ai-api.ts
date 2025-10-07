/**
 * AI API Service
 * Handles all AI-related API calls
 */

import type {
  AITextGenerateOptions,
  AITextRewriteOptions,
  AITextTranslateOptions,
  AIImageGenerateOptions,
  AIBackgroundRemoveOptions,
  AIQRCodeOptions,
  AITextResult,
  AIImageResult,
  AIBackgroundResult,
  AIQRCodeResult,
  AIGenerationStatus,
  AIUsageStats
} from '@/types/ai'

const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3002/api/ai'

/**
 * Generate text with AI
 */
export async function generateText(options: AITextGenerateOptions): Promise<AITextResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/text/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Text generation failed')
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Generate text error:', error)
    throw error
  }
}

/**
 * Rewrite text with AI
 */
export async function rewriteText(options: AITextRewriteOptions): Promise<AITextResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/text/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Text rewrite failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Rewrite text error:', error)
    throw error
  }
}

/**
 * Translate text
 */
export async function translateText(options: AITextTranslateOptions): Promise<AITextResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/text/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Translation failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Translate text error:', error)
    throw error
  }
}

/**
 * Generate image with AI
 */
export async function generateImage(options: AIImageGenerateOptions): Promise<AIImageResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Image generation failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Generate image error:', error)
    throw error
  }
}

/**
 * Get image generation status
 */
export async function getImageStatus(imageId: string): Promise<AIGenerationStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/image/status/${imageId}`)

    if (!response.ok) {
      throw new Error('Failed to get image status')
    }

    return await response.json()
  } catch (error) {
    console.error('Get image status error:', error)
    throw error
  }
}

/**
 * Remove background from image
 */
export async function removeBackground(options: AIBackgroundRemoveOptions): Promise<AIBackgroundResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/bg-remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Background removal failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Remove background error:', error)
    throw error
  }
}

/**
 * Generate QR code
 */
export async function generateQRCode(options: AIQRCodeOptions): Promise<AIQRCodeResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/qrcode/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'QR code generation failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Generate QR code error:', error)
    throw error
  }
}

/**
 * Validate QR code data
 */
export async function validateQRCode(data: string, type: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/qrcode/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, type }),
    })

    if (!response.ok) {
      return false
    }

    const result = await response.json()
    return result.valid
  } catch (error) {
    console.error('Validate QR code error:', error)
    return false
  }
}

/**
 * Get AI usage statistics
 */
export async function getUsageStats(): Promise<AIUsageStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/usage/stats`)

    if (!response.ok) {
      throw new Error('Failed to get usage stats')
    }

    return await response.json()
  } catch (error) {
    console.error('Get usage stats error:', error)
    throw error
  }
}

/**
 * Upload image for processing
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Image upload failed')
    }

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error('Upload image error:', error)
    throw error
  }
}

/**
 * Download generated content
 */
export async function downloadContent(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(downloadUrl)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Download content error:', error)
    throw error
  }
}

/**
 * Poll for generation status
 */
export async function pollGenerationStatus(
  id: string,
  type: 'image' | 'background',
  onProgress?: (status: AIGenerationStatus) => void
): Promise<AIGenerationStatus> {
  const maxAttempts = 60 // 5 minutes max (5s intervals)
  let attempts = 0

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const endpoint = type === 'image' 
          ? `${API_BASE_URL}/image/status/${id}`
          : `${API_BASE_URL}/bg-remove/status/${id}`

        const response = await fetch(endpoint)
        
        if (!response.ok) {
          throw new Error('Failed to get status')
        }

        const status: AIGenerationStatus = await response.json()

        if (onProgress) {
          onProgress(status)
        }

        if (status.status === 'complete') {
          resolve(status)
          return
        }

        if (status.status === 'failed') {
          reject(new Error(status.error || 'Generation failed'))
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          reject(new Error('Generation timeout'))
        }
      } catch (error) {
        reject(error)
      }
    }

    poll()
  })
}

/**
 * Cancel ongoing generation
 */
export async function cancelGeneration(id: string, type: 'image' | 'background'): Promise<void> {
  try {
    const endpoint = type === 'image'
      ? `${API_BASE_URL}/image/cancel/${id}`
      : `${API_BASE_URL}/bg-remove/cancel/${id}`

    const response = await fetch(endpoint, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to cancel generation')
    }
  } catch (error) {
    console.error('Cancel generation error:', error)
    throw error
  }
}

