/**
 * Wedding Preview Generation Composable
 * 
 * Handles the generation and regeneration of wedding sticker previews.
 * Extracted from StickerTemplatePanel.vue for better maintainability.
 */

import { ref, computed, nextTick, type Ref, type ComputedRef } from 'vue'
import type { ChatMessage } from './useSpeechToText'

// Types
export interface GenerationDependencies {
  // Refs
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  chatPreviewContainer: ComputedRef<HTMLElement | HTMLElement[] | null>
  showWeddingStickerPreview: Ref<boolean>
  isGeneratingPreview: Ref<boolean>
  generatingStep: Ref<number>
  generatingMessage: Ref<string>
  chatMessages: Ref<ChatMessage[]>
  formData: { description: string; customSize?: string }
  accumulatedDescription: Ref<string>
  extractedInfo: Ref<{
    title: string | null
    date: string | null
    courtesy: string | null
    size: string | null
    names: { name1: string | null; name2: string | null }
  }>
  validationWarnings: Ref<string[]>
  isDescriptionVisible: Ref<boolean>
  hasDesignBeenGenerated: Ref<boolean>
  preGeneratedImageFile: Ref<File | null>
  autoRemoveBackground: Ref<boolean>
  sizeStepComplete: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  isAnalyzing: Ref<boolean>
  currentBackgroundFileName: Ref<string>

  // Token costs
  TOKEN_COST_GENERATE_DESIGN: number

  // Functions from other composables
  scrollToBottom: () => void
  loadWeddingBackgroundManifest: () => Promise<void>
  getPersistedWeddingBackground: () => string | null
  getRandomBackground: () => string | null
  setPersistedWeddingBackground: (bg: string) => void
  availableBackgrounds: Ref<string[]>
  loadWeddingStickerTemplate: () => Promise<void>
  processDescriptionInput: () => Promise<void>
  applyNewBackground: (bg: string) => Promise<void>
  updateChatPreviewSVG: () => void
  handleSizeChange: (w: number, h: number) => Promise<void>
  updateSVGWithImages: () => void
  makeSVGImageDraggable: (el: SVGImageElement, id: string) => void
  extractNames: (desc: string) => { name1: string | null; name2: string | null }
  deductTokensForAction: (amount: number, reason: string) => Promise<boolean>

  // SVG Image Manager
  svgImageManager: {
    images: Ref<Array<{ id: string; dataUrl: string }>>
    addImage: (file: File, svg: SVGSVGElement) => Promise<{ id: string; dataUrl: string } | null>
  }

  // Background removal
  removeBackground: (file: File, options: any) => Promise<{ blob: Blob }>
  isBackgroundRemovalSupported: () => boolean

  // Auth/User stores
  authStore: {
    isAuthenticated: boolean
    user: { id?: string } | null
    showNotification: (opts: { title: string; message: string; type: string }) => void
  }
}

export interface UseWeddingPreviewGenerationReturn {
  // State
  generatingMessages: string[]
  generatingMessage: Ref<string>
  
  // Functions
  startGeneratingMessages: () => void
  stopGeneratingMessages: () => void
  hasConfirmedWeddingSize: () => boolean
  promptForWeddingSize: () => void
  setWeddingSize: (size: string) => void
  parseSizeToInches: (size: string) => { w: number; h: number } | null
  requestWeddingPreviewGeneration: () => void
  generateWeddingPreview: () => Promise<void>
  handleGenerateMore: () => Promise<void>
  handleGenerateNew: () => Promise<void>
}

export function useWeddingPreviewGeneration(deps: GenerationDependencies): UseWeddingPreviewGenerationReturn {
  // Generating messages for loading animation
  const generatingMessages = [
    'Creating your beautiful design...',
    'Preparing your wedding sticker...',
    'Adding the finishing touches...',
    'Almost there...',
    'Making it perfect for you...'
  ]
  
  let generatingMessageInterval: ReturnType<typeof setInterval> | null = null

  // Cycle through generating messages
  function startGeneratingMessages() {
    let index = 0
    deps.generatingMessage.value = generatingMessages[0]
    generatingMessageInterval = setInterval(() => {
      index = (index + 1) % generatingMessages.length
      deps.generatingMessage.value = generatingMessages[index]
    }, 2000)
  }

  function stopGeneratingMessages() {
    if (generatingMessageInterval) {
      clearInterval(generatingMessageInterval)
      generatingMessageInterval = null
    }
  }

  function hasConfirmedWeddingSize(): boolean {
    const size = String(deps.extractedInfo.value?.size ?? '').trim()
    return !!deps.sizeStepComplete.value || !!size
  }

  function promptForWeddingSize(): void {
    if (deps.awaitingSizeDecision.value) return
    deps.awaitingSizeDecision.value = true
    deps.isAnalyzing.value = false

    deps.chatMessages.value.push({
      id: Date.now(),
      text: "What size would you like the sticker? (e.g., '3x3' or type 'default' for 4x4 inches)",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    deps.scrollToBottom()
  }

  function setWeddingSize(sizeRaw: string): void {
    const normalized = String(sizeRaw ?? '').trim()
    deps.extractedInfo.value.size = normalized || null
    deps.formData.customSize = normalized
    deps.sizeStepComplete.value = !!normalized
    deps.awaitingSizeDecision.value = false

    // If preview already exists, apply the resize immediately
    if (deps.showWeddingStickerPreview.value) {
      const parsed = parseSizeToInches(normalized)
      if (parsed) {
        deps.handleSizeChange(parsed.w, parsed.h)
      }
    }
  }

  function parseSizeToInches(size: string): { w: number; h: number } | null {
    const match = size.match(/(\d+(?:\.\d+)?)\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)/i)
    if (match) {
      return { w: parseFloat(match[1]), h: parseFloat(match[2]) }
    }
    return null
  }

  function requestWeddingPreviewGeneration(): void {
    if (!hasConfirmedWeddingSize()) {
      promptForWeddingSize()
      return
    }
    generateWeddingPreview()
  }

  async function generateWeddingPreview() {
    console.log('🔷 generateWeddingPreview called')
    
    // Check if user is logged in FIRST
    if (!deps.authStore.isAuthenticated || !deps.authStore.user?.id) {
      console.log('❌ Generation blocked: User not authenticated')
      deps.authStore.showNotification({
        title: 'Login Required',
        message: 'Please login or create an account to generate designs.',
        type: 'info'
      })
      deps.chatMessages.value.push({
        id: Date.now(),
        text: "Hold on!\n\nYou need to login or create a free account to generate your design.\n\nWhy sign up?\n💎 Get 100 FREE tokens instantly!\n💾 Save and download your designs\n🎨 Access premium features",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'login', label: 'Login to Continue', variant: 'primary' }
        ]
      })
      deps.scrollToBottom()
      return
    }

    // Resolve description
    const resolvedDescription = (deps.formData.description || '').trim() || (deps.accumulatedDescription.value || '').trim()

    if (!resolvedDescription) {
      deps.chatMessages.value.push({
        id: Date.now(),
        text: "Please provide your details first.\n\nExample:\n(John & Mary) 8th March 2025 courtesy: Smith family",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      deps.scrollToBottom()
      return
    }

    deps.formData.description = resolvedDescription
    deps.accumulatedDescription.value = resolvedDescription

    // Require size confirmation
    if (!hasConfirmedWeddingSize()) {
      promptForWeddingSize()
      return
    }

    // Check requirements: Must have names OR a picture
    const { name1, name2 } = deps.extractNames(deps.formData.description)
    const hasNames = !!(name1 || name2)
    const hasPicture = !!deps.preGeneratedImageFile.value

    if (!hasNames && !hasPicture) {
      deps.authStore.showNotification({
        title: 'Missing Information',
        message: 'Please include at least a Name in the description or upload a Picture to generate the preview.',
        type: 'info'
      })
      return
    }

    // Deduct tokens for initial design generation
    if (!deps.hasDesignBeenGenerated.value) {
      const canProceed = await deps.deductTokensForAction(deps.TOKEN_COST_GENERATE_DESIGN, 'Generate initial design')
      if (!canProceed) return
      deps.hasDesignBeenGenerated.value = true
    }

    deps.isGeneratingPreview.value = true
    deps.generatingStep.value = 1
    startGeneratingMessages()
    deps.showWeddingStickerPreview.value = true

    try {
      await deps.loadWeddingBackgroundManifest()
      await nextTick()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 1000))

      deps.generatingStep.value = 2

      // Apply custom size if specified
      if (deps.formData.customSize) {
        const sizeMatch = deps.formData.customSize.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)/i)
        if (sizeMatch && deps.weddingPreviewContainer.value) {
          const w = parseFloat(sizeMatch[1])
          const h = parseFloat(sizeMatch[2])
          await deps.handleSizeChange(w, h)
        }
      }

      // Choose background
      const persisted = deps.getPersistedWeddingBackground()
      const initialBackground = persisted && deps.availableBackgrounds.value.includes(persisted) 
        ? persisted 
        : deps.getRandomBackground()
      
      if (initialBackground) {
        deps.currentBackgroundFileName.value = initialBackground
        deps.setPersistedWeddingBackground(initialBackground)
      }

      await deps.loadWeddingStickerTemplate()
      await deps.processDescriptionInput()

      if (initialBackground) {
        await deps.applyNewBackground(initialBackground)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      deps.formData.description = ''

      // Handle pre-uploaded image
      if (deps.preGeneratedImageFile.value) {
        deps.generatingStep.value = 3
        await nextTick()

        const svgElement = deps.weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
        if (svgElement) {
          let fileToProcess = deps.preGeneratedImageFile.value

          if (deps.autoRemoveBackground.value && deps.isBackgroundRemovalSupported()) {
            try {
              const result = await deps.removeBackground(fileToProcess, {
                quality: 'high',
                outputFormat: 'image/png',
                maxDimensions: 2048
              })
              fileToProcess = new File([result.blob], fileToProcess.name.replace(/\.[^/.]+$/, '.png'), {
                type: 'image/png',
                lastModified: Date.now()
              })
            } catch (error) {
              console.warn('Background removal failed, using original image', error)
            }
          }

          await deps.svgImageManager.addImage(fileToProcess, svgElement)
          deps.updateSVGWithImages()
          await nextTick()
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }

      deps.generatingStep.value = 4
      deps.isDescriptionVisible.value = false
      deps.showWeddingStickerPreview.value = true

      // Add preview message
      deps.chatMessages.value.push({
        id: Date.now(),
        text: '',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'preview'
      })

      deps.chatMessages.value.push({
        id: Date.now() + 1,
        text: "Your design is ready! Looking great! 🎉\n\n💡 **Tip:** You can drag the image to reposition it. Click 'Edit' for more options!",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      await nextTick()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      // Copy SVG to chat container
      if (deps.weddingPreviewContainer.value) {
        const svgElement = deps.weddingPreviewContainer.value.querySelector('svg')
        if (svgElement) {
          const previewContainers = Array.isArray(deps.chatPreviewContainer.value)
            ? deps.chatPreviewContainer.value
            : (deps.chatPreviewContainer.value ? [deps.chatPreviewContainer.value] : [])

          const targetContainer = previewContainers[previewContainers.length - 1]
          if (targetContainer) {
            const clonedSVG = svgElement.cloneNode(true) as SVGSVGElement
            
            const viewBox = clonedSVG.getAttribute('viewBox')
            if (viewBox) {
              const parts = viewBox.split(/\s+|,/)
              if (parts.length >= 4) {
                const vbWidth = parseFloat(parts[2])
                const vbHeight = parseFloat(parts[3])
                targetContainer.style.aspectRatio = String(vbWidth / vbHeight)
              }
            }

            clonedSVG.style.display = 'block'
            clonedSVG.style.width = '100%'
            clonedSVG.style.maxWidth = '100%'
            clonedSVG.style.height = 'auto'
            clonedSVG.removeAttribute('width')
            clonedSVG.removeAttribute('height')

            targetContainer.innerHTML = ''
            targetContainer.appendChild(clonedSVG)

            // Re-attach drag handlers
            const imageElements = clonedSVG.querySelectorAll('image')
            imageElements.forEach((imgEl) => {
              imgEl.removeAttribute('data-draggable')
              const imageId = imgEl.getAttribute('data-image-id') || imgEl.id || 'user-image-1'
              if (imageId) {
                deps.makeSVGImageDraggable(imgEl as SVGImageElement, imageId)
              }
            })
          }
        }
      }

      deps.scrollToBottom()

    } catch (error) {
      console.error('Generation failed:', error)
      deps.showWeddingStickerPreview.value = false
      deps.authStore.showNotification({
        title: 'Generation Failed',
        message: 'Something went wrong. Please try again.',
        type: 'error'
      })
    } finally {
      deps.isGeneratingPreview.value = false
      deps.generatingStep.value = 0
      stopGeneratingMessages()
      setTimeout(() => deps.scrollToBottom(), 100)
    }
  }

  async function handleGenerateMore() {
    deps.chatMessages.value.push({
      id: Date.now(),
      text: "Generate another design",
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    deps.isGeneratingPreview.value = true
    deps.generatingMessage.value = 'Creating a fresh design...'

    const newBackground = deps.getRandomBackground()
    if (newBackground) {
      await new Promise(resolve => setTimeout(resolve, 500))
      deps.generatingMessage.value = 'Applying new style...'

      await deps.applyNewBackground(newBackground)

      await new Promise(resolve => setTimeout(resolve, 300))
      deps.generatingMessage.value = 'Updating preview...'

      await nextTick()
      await nextTick()

      deps.updateChatPreviewSVG()
      deps.isGeneratingPreview.value = false

      deps.chatMessages.value.push({
        id: Date.now() + 1,
        text: "Here's a new design variation! 🎨 Like this one better?",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      deps.scrollToBottom()
    } else {
      deps.isGeneratingPreview.value = false
    }
  }

  async function handleGenerateNew() {
    deps.isGeneratingPreview.value = true
    deps.generatingMessage.value = 'Creating new design...'

    const newBackground = deps.getRandomBackground()
    if (newBackground) {
      await new Promise(resolve => setTimeout(resolve, 800))
      deps.generatingMessage.value = 'Applying new style...'

      await deps.applyNewBackground(newBackground)

      await new Promise(resolve => setTimeout(resolve, 400))
      deps.generatingMessage.value = 'Finalizing design...'

      await nextTick()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // Update all preview containers
      if (deps.weddingPreviewContainer.value) {
        const masterSvg = deps.weddingPreviewContainer.value.querySelector('svg')
        if (masterSvg) {
          const previewContainers = Array.isArray(deps.chatPreviewContainer.value)
            ? deps.chatPreviewContainer.value
            : (deps.chatPreviewContainer.value ? [deps.chatPreviewContainer.value] : [])

          previewContainers.forEach((container) => {
            if (container) {
              const existingSvg = container.querySelector('svg')
              if (existingSvg) existingSvg.remove()

              const clonedSvg = masterSvg.cloneNode(true) as SVGSVGElement
              const viewBox = clonedSvg.getAttribute('viewBox')
              if (viewBox) {
                const parts = viewBox.split(/\s+|,/)
                if (parts.length >= 4) {
                  const vbWidth = parseFloat(parts[2])
                  const vbHeight = parseFloat(parts[3])
                  container.style.aspectRatio = String(vbWidth / vbHeight)
                }
              }

              clonedSvg.style.display = 'block'
              clonedSvg.style.width = '100%'
              clonedSvg.style.maxWidth = '100%'
              clonedSvg.style.height = 'auto'
              clonedSvg.removeAttribute('width')
              clonedSvg.removeAttribute('height')

              container.appendChild(clonedSvg)
            }
          })
        }
      }

      deps.chatMessages.value.push({
        id: Date.now(),
        text: "Your design has been updated with a fresh new look! ✨🎨",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      deps.isGeneratingPreview.value = false
    } else {
      deps.isGeneratingPreview.value = false
    }

    deps.scrollToBottom()
  }

  return {
    generatingMessages,
    generatingMessage: deps.generatingMessage,
    startGeneratingMessages,
    stopGeneratingMessages,
    hasConfirmedWeddingSize,
    promptForWeddingSize,
    setWeddingSize,
    parseSizeToInches,
    requestWeddingPreviewGeneration,
    generateWeddingPreview,
    handleGenerateMore,
    handleGenerateNew,
  }
}
