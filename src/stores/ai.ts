/**
 * AI Store
 * Manages AI feature state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AITabType,
  AITextType,
  AITone,
  AITextLength,
  AILanguage,
  AIImageStyle,
  AIImageResolution,
  AIBackgroundOutputType,
  QRCodeType,
  QRDotStyle,
  QRCornerStyle,
  QRErrorCorrection,
  AITextResult,
  AIImageResult,
  AIBackgroundResult,
  AIQRCodeResult,
  AIUsageStats,
  AITextGenerateOptions,
  AIImageGenerateOptions,
  AIBackgroundRemoveOptions,
  AIQRCodeOptions
} from '@/types/ai'
import {
  generateText,
  rewriteText,
  translateText,
  generateImage,
  getImageStatus,
  removeBackground,
  generateQRCode,
  getUsageStats,
  pollGenerationStatus
} from '@/services/ai-api'

export const useAIStore = defineStore('ai', () => {
  // Panel state
  const isPanelOpen = ref(false)
  const activeTab = ref<AITabType>('text')
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  // Text generation state
  const textPrompt = ref('')
  const textType = ref<AITextType>('headline')
  const textTone = ref<AITone>('friendly')
  const textLength = ref<AITextLength>('medium')
  const textLanguage = ref<AILanguage>('en')
  const textResults = ref<AITextResult[]>([])

  // Image generation state
  const imagePrompt = ref('')
  const imageNegativePrompt = ref('')
  const imageStyle = ref<AIImageStyle>('illustration')
  const imageResolution = ref<AIImageResolution>('medium')
  const imageCustomWidth = ref(1024)
  const imageCustomHeight = ref(1024)
  const imageSeed = ref<number | undefined>(undefined)
  const imageGuidanceScale = ref(7.5)
  const imageSteps = ref(50)
  const imageBatchSize = ref(1)
  const imageResults = ref<AIImageResult[]>([])
  const currentImageGeneration = ref<string | null>(null)

  // Background removal state
  const bgImageUrl = ref('')
  const bgOutputType = ref<AIBackgroundOutputType>('transparent')
  const bgBackgroundColor = ref('#ffffff')
  const bgBlurAmount = ref(10)
  const bgAIPrompt = ref('')
  const bgEdgeRefinement = ref(5)
  const bgFeathering = ref(2)
  const bgResults = ref<AIBackgroundResult[]>([])

  // QR code state
  const qrData = ref('')
  const qrType = ref<QRCodeType>('url')
  const qrSize = ref(512)
  const qrForegroundColor = ref('#000000')
  const qrBackgroundColor = ref('#ffffff')
  const qrLogoUrl = ref('')
  const qrDotStyle = ref<QRDotStyle>('square')
  const qrCornerStyle = ref<QRCornerStyle>('square')
  const qrErrorCorrection = ref<QRErrorCorrection>('M')
  const qrResults = ref<AIQRCodeResult[]>([])

  // Usage stats
  const usageStats = ref<AIUsageStats>({
    textGenerations: 0,
    imageGenerations: 0,
    backgroundRemovals: 0,
    qrCodesGenerated: 0,
    totalCost: 0
  })

  // Computed
  const hasTextResults = computed(() => textResults.value.length > 0)
  const hasImageResults = computed(() => imageResults.value.length > 0)
  const hasBgResults = computed(() => bgResults.value.length > 0)
  const hasQRResults = computed(() => qrResults.value.length > 0)

  const canGenerateText = computed(() => {
    return textPrompt.value.trim().length > 0 && !isGenerating.value
  })

  const canGenerateImage = computed(() => {
    return imagePrompt.value.trim().length > 0 && !isGenerating.value
  })

  const canRemoveBackground = computed(() => {
    return bgImageUrl.value.length > 0 && !isGenerating.value
  })

  const canGenerateQR = computed(() => {
    return qrData.value.trim().length > 0 && !isGenerating.value
  })

  // Actions
  function openPanel(tab?: AITabType) {
    isPanelOpen.value = true
    if (tab) {
      activeTab.value = tab
    }
  }

  function closePanel() {
    isPanelOpen.value = false
  }

  function setActiveTab(tab: AITabType) {
    activeTab.value = tab
  }

  function clearError() {
    error.value = null
  }

  // Text generation actions
  async function generateTextContent(): Promise<void> {
    if (!canGenerateText.value) return

    isGenerating.value = true
    error.value = null

    try {
      const options: AITextGenerateOptions = {
        prompt: textPrompt.value,
        type: textType.value,
        tone: textTone.value,
        language: textLanguage.value,
        length: textLength.value,
        variations: 3
      }

      const results = await generateText(options)
      textResults.value.unshift(...results)

      // Update usage stats
      usageStats.value.textGenerations += results.length
      if (results[0]?.cost) {
        usageStats.value.totalCost += results[0].cost * results.length
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Text generation failed'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  async function rewriteTextContent(text: string, action: string): Promise<AITextResult> {
    isGenerating.value = true
    error.value = null

    try {
      const result = await rewriteText({
        text,
        action: action as any,
        tone: textTone.value
      })

      textResults.value.unshift(result)
      usageStats.value.textGenerations++

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Text rewrite failed'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  async function translateTextContent(text: string, targetLanguage: AILanguage): Promise<AITextResult> {
    isGenerating.value = true
    error.value = null

    try {
      const result = await translateText({
        text,
        sourceLanguage: textLanguage.value,
        targetLanguage
      })

      textResults.value.unshift(result)
      usageStats.value.textGenerations++

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Translation failed'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  // Image generation actions
  async function generateImageContent(): Promise<void> {
    if (!canGenerateImage.value) return

    isGenerating.value = true
    error.value = null

    try {
      const options: AIImageGenerateOptions = {
        prompt: imagePrompt.value,
        negativePrompt: imageNegativePrompt.value || undefined,
        style: imageStyle.value,
        resolution: imageResolution.value,
        width: imageResolution.value === 'custom' ? imageCustomWidth.value : undefined,
        height: imageResolution.value === 'custom' ? imageCustomHeight.value : undefined,
        seed: imageSeed.value,
        guidanceScale: imageGuidanceScale.value,
        steps: imageSteps.value,
        batchSize: imageBatchSize.value
      }

      const result = await generateImage(options)
      imageResults.value.unshift(result)
      currentImageGeneration.value = result.id

      // Poll for completion if processing
      if (result.status === 'processing') {
        await pollGenerationStatus(result.id, 'image', (status) => {
          // Update result with progress
          const index = imageResults.value.findIndex(r => r.id === result.id)
          if (index !== -1) {
            imageResults.value[index].status = status.status as any
          }
        })

        // Refresh result after completion
        const index = imageResults.value.findIndex(r => r.id === result.id)
        if (index !== -1) {
          imageResults.value[index].status = 'complete'
        }
      }

      // Update usage stats
      usageStats.value.imageGenerations++
      if (result.cost) {
        usageStats.value.totalCost += result.cost
      }

      currentImageGeneration.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Image generation failed'
      currentImageGeneration.value = null
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  // Background removal actions
  async function removeImageBackground(): Promise<void> {
    if (!canRemoveBackground.value) return

    isGenerating.value = true
    error.value = null

    try {
      const options: AIBackgroundRemoveOptions = {
        imageUrl: bgImageUrl.value,
        outputType: bgOutputType.value,
        backgroundColor: bgBackgroundColor.value,
        blurAmount: bgBlurAmount.value,
        aiPrompt: bgAIPrompt.value || undefined,
        edgeRefinement: bgEdgeRefinement.value,
        feathering: bgFeathering.value
      }

      const result = await removeBackground(options)
      bgResults.value.unshift(result)

      // Update usage stats
      usageStats.value.backgroundRemovals++
      if (result.cost) {
        usageStats.value.totalCost += result.cost
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Background removal failed'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  // QR code generation actions
  async function generateQRCodeContent(): Promise<void> {
    if (!canGenerateQR.value) return

    isGenerating.value = true
    error.value = null

    try {
      const options: AIQRCodeOptions = {
        data: qrData.value,
        type: qrType.value,
        size: qrSize.value,
        foregroundColor: qrForegroundColor.value,
        backgroundColor: qrBackgroundColor.value,
        logoUrl: qrLogoUrl.value || undefined,
        dotStyle: qrDotStyle.value,
        cornerStyle: qrCornerStyle.value,
        errorCorrection: qrErrorCorrection.value
      }

      const result = await generateQRCode(options)
      qrResults.value.unshift(result)

      // Update usage stats
      usageStats.value.qrCodesGenerated++
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'QR code generation failed'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  // Result management
  function deleteTextResult(id: string) {
    textResults.value = textResults.value.filter(r => r.id !== id)
  }

  function deleteImageResult(id: string) {
    imageResults.value = imageResults.value.filter(r => r.id !== id)
  }

  function deleteBgResult(id: string) {
    bgResults.value = bgResults.value.filter(r => r.id !== id)
  }

  function deleteQRResult(id: string) {
    qrResults.value = qrResults.value.filter(r => r.id !== id)
  }

  function clearAllResults() {
    textResults.value = []
    imageResults.value = []
    bgResults.value = []
    qrResults.value = []
  }

  // Load usage stats
  async function loadUsageStats() {
    try {
      const stats = await getUsageStats()
      usageStats.value = stats
    } catch (err) {
      console.error('Failed to load usage stats:', err)
    }
  }

  return {
    // State
    isPanelOpen,
    activeTab,
    isGenerating,
    error,
    textPrompt,
    textType,
    textTone,
    textLength,
    textLanguage,
    textResults,
    imagePrompt,
    imageNegativePrompt,
    imageStyle,
    imageResolution,
    imageCustomWidth,
    imageCustomHeight,
    imageSeed,
    imageGuidanceScale,
    imageSteps,
    imageBatchSize,
    imageResults,
    currentImageGeneration,
    bgImageUrl,
    bgOutputType,
    bgBackgroundColor,
    bgBlurAmount,
    bgAIPrompt,
    bgEdgeRefinement,
    bgFeathering,
    bgResults,
    qrData,
    qrType,
    qrSize,
    qrForegroundColor,
    qrBackgroundColor,
    qrLogoUrl,
    qrDotStyle,
    qrCornerStyle,
    qrErrorCorrection,
    qrResults,
    usageStats,

    // Computed
    hasTextResults,
    hasImageResults,
    hasBgResults,
    hasQRResults,
    canGenerateText,
    canGenerateImage,
    canRemoveBackground,
    canGenerateQR,

    // Actions
    openPanel,
    closePanel,
    setActiveTab,
    clearError,
    generateTextContent,
    rewriteTextContent,
    translateTextContent,
    generateImageContent,
    removeImageBackground,
    generateQRCodeContent,
    deleteTextResult,
    deleteImageResult,
    deleteBgResult,
    deleteQRResult,
    clearAllResults,
    loadUsageStats
  }
})

