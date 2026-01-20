/**
 * Image Upload Flow Composable
 * 
 * Handles all image upload, crop, and modal logic for the wedding sticker panel.
 * Extracted to reduce StickerTemplatePanel.vue file size.
 * 
 * Key features:
 * - Crop modal state management
 * - Upload modal state management
 * - Pre-generation image handling
 * - Background removal integration
 * - Post-crop flow with chat integration
 */

import { ref, type Ref } from 'vue'
import type { ChatMessage } from '../types'

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CropCompleteData {
  dataUrl: string
  blob: Blob
  width: number
  height: number
}

export interface UploadedImage {
  file: File
  timestamp: number
  used: boolean
}

export interface ExtractedInfoRef {
  title: string | null
  date: string | null
  courtesy: string | null
  size: string | null
  names: { name1: string | null; name2: string | null }
}

export interface UseImageUploadFlowOptions {
  // External refs
  chatMessages: Ref<ChatMessage[]>
  extractedInfo: Ref<ExtractedInfoRef>
  accumulatedDescription: Ref<string>
  formData: { description: string }
  
  // State refs
  showWeddingStickerPreview: Ref<boolean>
  sizeStepComplete: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  awaitingBackgroundRemovalDecision: Ref<boolean>
  awaitingImageUpdateConfirmation: Ref<boolean>
  pictureStepComplete: Ref<boolean>
  
  // Image refs
  preGeneratedImageFile: Ref<File | null>
  preGeneratedImagePreview: Ref<string | null>
  pendingImageFile: Ref<File | null>
  uploadedImages: Ref<UploadedImage[]>
  
  // Background removal
  autoRemoveBackground: Ref<boolean>
  backgroundRemovalAlreadyHandled: Ref<boolean>
  isBackgroundRemovalSupported: () => boolean
  removeBackground: (file: File, options: any) => Promise<{ blob: Blob }>
  
  // SVG Image Manager
  svgImageManager: {
    clearAllImages: () => void
    addImage: (file: File, svgElement: SVGSVGElement) => Promise<void>
    removeImage: (id: string) => void
    moveImageDown: (id: string) => void
    images: Ref<any[]>
    selectedImageId: Ref<string | null>
    updateImage: (id: string, updates: any) => void
    getSelectedImage: () => any
  }
  
  // Container ref
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  
  // Callbacks
  scrollToBottom: () => void
  updateSVGWithImages: () => void
  generateWeddingPreview: () => Promise<void>
  showNotification: (opts: { title: string; message: string; type: string }) => void
  trackImageUpload: (file: File) => void
}

export interface UseImageUploadFlowReturn {
  // Crop modal state
  showCropModal: Ref<boolean>
  cropImageSrc: Ref<string>
  cropImageFile: Ref<File | null>
  isPreGenerationCrop: Ref<boolean>
  
  // Upload modal state
  showUploadModal: Ref<boolean>
  uploadModalProcessing: Ref<boolean>
  uploadModalProgress: Ref<number>
  uploadModalStatusText: Ref<string>
  uploadModalSuccess: Ref<boolean>
  
  // Pre-generated image input ref
  preGeneratedImageInput: Ref<HTMLInputElement | null>
  
  // Background removal error
  backgroundRemovalError: Ref<string | null>
  
  // Methods
  handleImageDrop: (event: DragEvent) => Promise<void>
  handleImageFileSelect: (event: Event) => Promise<void>
  handleCropComplete: (data: CropCompleteData) => Promise<void>
  handleCropModalClose: () => void
  closeUploadModal: () => void
  handleModalFileSelect: (event: Event) => Promise<void>
  handlePreGeneratedImageSelect: (event: Event) => void
  triggerImageUpload: () => void
}

// ============================================================================
// Main Composable
// ============================================================================

export function useImageUploadFlow(options: UseImageUploadFlowOptions): UseImageUploadFlowReturn {
  const {
    chatMessages,
    extractedInfo,
    accumulatedDescription,
    formData,
    showWeddingStickerPreview,
    sizeStepComplete,
    awaitingSizeDecision,
    awaitingBackgroundRemovalDecision,
    awaitingImageUpdateConfirmation,
    pictureStepComplete,
    preGeneratedImageFile,
    preGeneratedImagePreview,
    pendingImageFile,
    uploadedImages,
    autoRemoveBackground,
    backgroundRemovalAlreadyHandled,
    isBackgroundRemovalSupported,
    removeBackground,
    svgImageManager,
    weddingPreviewContainer,
    scrollToBottom,
    updateSVGWithImages,
    generateWeddingPreview,
    showNotification,
    trackImageUpload
  } = options

  // ============================================================================
  // Crop Modal State
  // ============================================================================
  const showCropModal = ref(false)
  const cropImageSrc = ref('')
  const cropImageFile = ref<File | null>(null)
  const isPreGenerationCrop = ref(false)

  // ============================================================================
  // Upload Modal State
  // ============================================================================
  const showUploadModal = ref(false)
  const uploadModalProcessing = ref(false)
  const uploadModalProgress = ref(0)
  const uploadModalStatusText = ref('Preparing...')
  const uploadModalSuccess = ref(false)

  // ============================================================================
  // Pre-generated Image Input
  // ============================================================================
  const preGeneratedImageInput = ref<HTMLInputElement | null>(null)

  // ============================================================================
  // Background Removal Error
  // ============================================================================
  const backgroundRemovalError = ref<string | null>(null)

  const MAX_UPLOAD_IMAGES = 3

  async function addImageWithLimit(file: File, svgElement: SVGSVGElement): Promise<void> {
    // Preserve the first image as the main image.
    // When exceeding max, replace the last slot (tertiary, then secondary).
    while (svgImageManager.images.value.length >= MAX_UPLOAD_IMAGES) {
      const last = svgImageManager.images.value[svgImageManager.images.value.length - 1]
      if (!last?.id) break
      svgImageManager.removeImage(last.id)
    }

    await svgImageManager.addImage(file, svgElement)
  }

  // ============================================================================
  // Helper: Get current time string
  // ============================================================================
  function getTimeString(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // ============================================================================
  // Trigger Image Upload
  // ============================================================================
  function triggerImageUpload(): void {
    preGeneratedImageInput.value?.click()
  }

  // ============================================================================
  // Image Drop Handler
  // ============================================================================
  async function handleImageDrop(event: DragEvent): Promise<void> {
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement

    if (!svgElement) return

    // Allow dropping multiple files; keep up to MAX_UPLOAD_IMAGES.
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await addImageWithLimit(files[i], svgElement)
      }
    }
    
    // Update SVG preview with new images
    updateSVGWithImages()
  }

  // ============================================================================
  // Image File Select Handler
  // ============================================================================
  async function handleImageFileSelect(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement
    const files = target.files

    if (files && files.length > 0) {
      let file = files[0]

      // Step 1: Remove background if enabled
      if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
        try {
          backgroundRemovalError.value = null

          const result = await removeBackground(file, {
            quality: 'high',
            outputFormat: 'image/png',
            maxDimensions: 2048
          })

          uploadModalProgress.value = 80

          // Convert blob to File
          file = new File([result.blob], file.name.replace(/\.[^/.]+$/, '.png'), {
            type: 'image/png',
            lastModified: Date.now()
          })

          uploadModalStatusText.value = 'Background removed!'
        } catch (error: any) {
          backgroundRemovalError.value = error.message || 'Failed to remove background'
          // Continue with original image
        }
      } else if (autoRemoveBackground.value && !isBackgroundRemovalSupported()) {
        backgroundRemovalError.value = 'Background removal is not supported in this browser'
      }

      // Step 2: Create object URL for the image
      const imageUrl = URL.createObjectURL(file)

      // Step 3: Set crop modal data
      cropImageSrc.value = imageUrl
      cropImageFile.value = file
      showCropModal.value = true
    }

    // Reset input
    if (target) {
      target.value = ''
    }
  }

  // ============================================================================
  // Crop Complete Handler
  // ============================================================================
  async function handleCropComplete(data: CropCompleteData): Promise<void> {
    if (isPreGenerationCrop.value) {
      // Handle pre-generation crop
      if (cropImageFile.value) {
        const croppedFile = new File([data.blob], cropImageFile.value.name, {
          type: 'image/png',
          lastModified: Date.now()
        })

        // Mark this image as used in the tracking array
        const uploadIndex = uploadedImages.value.findIndex(img => img.file === cropImageFile.value)
        if (uploadIndex >= 0) {
          uploadedImages.value[uploadIndex].used = true
        }

        // Add cropped image message to chat
        chatMessages.value.push({
          id: Date.now(),
          text: 'Image cropped',
          sender: 'user',
          time: getTimeString(),
          image: data.dataUrl
        })
        scrollToBottom()

        // Reset state
        isPreGenerationCrop.value = false
        showCropModal.value = false

        // Clean up object URL
        if (cropImageSrc.value) {
          URL.revokeObjectURL(cropImageSrc.value)
          cropImageSrc.value = ''
        }
        cropImageFile.value = null

        // Check if BG removal was already handled
        if (backgroundRemovalAlreadyHandled.value) {
          // BG removal done - use image directly for generation
          preGeneratedImageFile.value = croppedFile
          pictureStepComplete.value = true
          backgroundRemovalAlreadyHandled.value = false
          pendingImageFile.value = null
          
          setTimeout(() => {
            const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
            const hasSize = sizeStepComplete.value || extractedInfo.value.size
            
            if (hasAllInfo && hasSize) {
              chatMessages.value.push({
                id: Date.now(),
                text: "Perfect! Your image is ready! Let me create your sticker now! 🎨",
                sender: 'ai',
                time: getTimeString()
              })
              scrollToBottom()
              formData.description = accumulatedDescription.value
              setTimeout(() => generateWeddingPreview(), 300)
            } else if (hasAllInfo && !sizeStepComplete.value) {
              chatMessages.value.push({
                id: Date.now(),
                text: "Perfect! Your image is ready! 📸\n\nWhat size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)",
                sender: 'ai',
                time: getTimeString()
              })
              awaitingSizeDecision.value = true
              scrollToBottom()
            } else {
              chatMessages.value.push({
                id: Date.now(),
                text: "Perfect! Your image is ready! 📸\n\n💡 **Tip:** You can drag the image to reposition it after the design is generated!",
                sender: 'ai',
                time: getTimeString()
              })
              scrollToBottom()
            }
          }, 300)
        } else {
          // BG removal not done yet - ask about it
          pendingImageFile.value = croppedFile
          setTimeout(() => {
            chatMessages.value.push({
              id: Date.now(),
              text: "Nice crop! Would you like me to remove the background from this image? Say 'yes' or 'no'.",
              sender: 'ai',
              time: getTimeString()
            })
            scrollToBottom()
            awaitingBackgroundRemovalDecision.value = true
          }, 500)
        }
      }
      return
    }

    // Post-generation crop (for existing images in preview)
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement

    if (!svgElement || !cropImageFile.value) {
      return
    }

    // Create a new File object from the cropped blob
    const croppedFile = new File([data.blob], cropImageFile.value.name, {
      type: 'image/png',
      lastModified: Date.now()
    })

    // Clear existing images to prevent accumulation/duplication
    const currentImages = svgImageManager.images.value

    // Default behavior for multi-image: add into the next available slot
    if (currentImages.length < MAX_UPLOAD_IMAGES) {
      await addImageWithLimit(croppedFile, svgElement)
    } else {
      // At max capacity: replace the currently selected image (or last)
      const selectedId = svgImageManager.selectedImageId.value
      const replaceId = selectedId || currentImages[currentImages.length - 1]?.id
      if (replaceId) {
        const index = currentImages.findIndex((img: any) => img?.id === replaceId)
        svgImageManager.removeImage(replaceId)
        await svgImageManager.addImage(croppedFile, svgElement)

        // Move the newly-added image back into the original slot index.
        const newId = svgImageManager.selectedImageId.value
        if (newId && index >= 0) {
          while (currentImages.findIndex((img: any) => img?.id === newId) > index) {
            svgImageManager.moveImageDown(newId)
          }
        }
      } else {
        await addImageWithLimit(croppedFile, svgElement)
      }
    }

    // Update SVG preview with new images
    updateSVGWithImages()

    // Clean up
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
    cropImageFile.value = null
  }

  // ============================================================================
  // Crop Modal Close Handler
  // ============================================================================
  function handleCropModalClose(): void {
    showCropModal.value = false
    isPreGenerationCrop.value = false

    // Clean up object URL
    if (cropImageSrc.value) {
      URL.revokeObjectURL(cropImageSrc.value)
      cropImageSrc.value = ''
    }
    cropImageFile.value = null
  }

  // ============================================================================
  // Upload Modal Close
  // ============================================================================
  function closeUploadModal(): void {
    if (!uploadModalProcessing.value) {
      showUploadModal.value = false
      uploadModalSuccess.value = false
    }
  }

  // ============================================================================
  // Modal File Select Handler
  // ============================================================================
  async function handleModalFileSelect(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement
    const files = target.files

    if (files && files.length > 0) {
      const file = files[0]

      // Start processing
      uploadModalProcessing.value = true
      uploadModalProgress.value = 0
      uploadModalStatusText.value = 'Uploading image...'
      uploadModalSuccess.value = false

      try {
        // Simulate upload progress
        uploadModalProgress.value = 30
        await new Promise(resolve => setTimeout(resolve, 300))

        // Store file for later processing
        pendingImageFile.value = file
        
        uploadModalProgress.value = 100
        uploadModalStatusText.value = 'Image uploaded!'
        uploadModalSuccess.value = true

        // Close modal
        setTimeout(() => {
          closeUploadModal()
          uploadModalProcessing.value = false
          
          if (showWeddingStickerPreview.value) {
            // Image update flow for existing preview
            chatMessages.value.push({
              id: Date.now(),
              text: "New picture! Use this one? (yes/no)",
              sender: 'ai',
              time: getTimeString(),
              image: URL.createObjectURL(file)
            })
            scrollToBottom()
            awaitingImageUpdateConfirmation.value = true
          } else {
            // Normal flow (before generation)
            awaitingBackgroundRemovalDecision.value = true
            chatMessages.value.push({
              id: Date.now(),
              text: "Great! Picture received! Would you like me to remove the background? Say 'yes' or 'no'!",
              sender: 'ai',
              time: getTimeString()
            })
            scrollToBottom()
          }
        }, 500)

      } catch (error) {
        uploadModalProcessing.value = false
        uploadModalProgress.value = 0
        
        showNotification({
          title: 'Upload Failed',
          message: 'Failed to process image. Please try again.',
          type: 'error'
        })
      }
    }

    // Reset input
    if (target) {
      target.value = ''
    }
  }

  // ============================================================================
  // Pre-Generated Image Select Handler
  // ============================================================================
  function handlePreGeneratedImageSelect(event: Event): void {
    const target = event.target as HTMLInputElement
    const files = target.files

    if (files && files.length > 0) {
      const file = files[0]

      // Track the image upload for AI management
      trackImageUpload(file)

      // Store the file for after cropping
      pendingImageFile.value = file

      // Open crop modal IMMEDIATELY
      const imageUrl = URL.createObjectURL(file)
      cropImageSrc.value = imageUrl
      cropImageFile.value = file
      isPreGenerationCrop.value = true
      showCropModal.value = true
    }

    // Reset input
    if (target) {
      target.value = ''
    }
  }

  // ============================================================================
  // Return
  // ============================================================================
  return {
    // Crop modal state
    showCropModal,
    cropImageSrc,
    cropImageFile,
    isPreGenerationCrop,
    
    // Upload modal state
    showUploadModal,
    uploadModalProcessing,
    uploadModalProgress,
    uploadModalStatusText,
    uploadModalSuccess,
    
    // Pre-generated image input ref
    preGeneratedImageInput,
    
    // Background removal error
    backgroundRemovalError,
    
    // Methods
    handleImageDrop,
    handleImageFileSelect,
    handleCropComplete,
    handleCropModalClose,
    closeUploadModal,
    handleModalFileSelect,
    handlePreGeneratedImageSelect,
    triggerImageUpload
  }
}
