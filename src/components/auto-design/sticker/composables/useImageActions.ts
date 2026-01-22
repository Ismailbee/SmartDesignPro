/**
 * useImageActions composable
 * Handles image flip, swap, and drag mode actions
 */
import { ref, type Ref } from 'vue'
import type { useSVGImageManager } from './useSVGImageManager'

export interface ImageActionsOptions {
  svgImageManager: ReturnType<typeof useSVGImageManager>
  onFlipStart?: () => void
  onFlipEnd?: () => void
}

export function useImageActions(options: ImageActionsOptions) {
  const { svgImageManager, onFlipStart, onFlipEnd } = options

  // Modal states
  const showImageActionModal = ref(false)
  const showMainImageModal = ref(false)
  const pendingActionImageId = ref<string | null>(null)

  // Loading states
  const isSwapping = ref(false)
  const isFlipping = ref(false)

  // Drag mode states
  const isMainImageDragEnabled = ref(false)
  const isSmallBoxDragEnabled = ref(false)
  const activeSmallBoxId = ref<string | null>(null)

  /**
   * Handle single click on the main image to show action options
   */
  function handleMainImageClick() {
    if (isMainImageDragEnabled.value) return
    if (svgImageManager.images.value.length === 0) return
    showMainImageModal.value = true
  }

  /**
   * Flip the main image
   */
  async function flipMainImage() {
    const mainImage = svgImageManager.images.value[0]
    if (!mainImage) return
    
    showMainImageModal.value = false
    isFlipping.value = true
    onFlipStart?.()
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      svgImageManager.updateImage(mainImage.id, { flipped: !mainImage.flipped })
    } finally {
      isFlipping.value = false
      onFlipEnd?.()
    }
  }

  /**
   * Cancel main image action modal
   */
  function cancelMainImageAction() {
    showMainImageModal.value = false
  }

  /**
   * User selected drag/reposition mode for main image
   */
  function selectMainDragMode() {
    showMainImageModal.value = false
    isMainImageDragEnabled.value = true
    console.log('✋ Main image drag mode enabled - drag to reposition')
  }

  /**
   * Handle single click on a small image to show action options
   * Only shows for non-main images (index > 0)
   */
  function handleImageClick(imageId: string) {
    const index = svgImageManager.images.value.findIndex(img => img.id === imageId)
    if (index <= 0) {
      // Main image click
      handleMainImageClick()
      return
    }
    
    // Small image click
    if (isSmallBoxDragEnabled.value) return
    
    pendingActionImageId.value = imageId
    showImageActionModal.value = true
  }

  /**
   * Flip a small/secondary image
   */
  async function flipSmallImage() {
    if (!pendingActionImageId.value) return
    
    const image = svgImageManager.images.value.find(img => img.id === pendingActionImageId.value)
    if (!image) return
    
    showImageActionModal.value = false
    isFlipping.value = true
    onFlipStart?.()
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      svgImageManager.updateImage(image.id, { flipped: !image.flipped })
    } finally {
      isFlipping.value = false
      onFlipEnd?.()
      pendingActionImageId.value = null
    }
  }

  /**
   * User selected drag/reposition mode for small box
   */
  function selectSmallBoxDragMode() {
    if (!pendingActionImageId.value) return
    
    const index = svgImageManager.images.value.findIndex(img => img.id === pendingActionImageId.value)
    const groupId = index === 1 ? 'secondary-image-group' : index === 2 ? 'tertiary-image-group' : null
    
    if (groupId) {
      activeSmallBoxId.value = groupId
      isSmallBoxDragEnabled.value = true
      console.log(`✋ Small box drag mode enabled for ${groupId}`)
    }
    
    showImageActionModal.value = false
    pendingActionImageId.value = null
  }

  /**
   * Cancel image action modal
   */
  function cancelImageAction() {
    showImageActionModal.value = false
    pendingActionImageId.value = null
  }

  /**
   * Exit drag mode for main image
   */
  function exitMainDragMode() {
    isMainImageDragEnabled.value = false
  }

  /**
   * Exit drag mode for small box
   */
  function exitSmallBoxDragMode() {
    isSmallBoxDragEnabled.value = false
    activeSmallBoxId.value = null
  }

  return {
    // Modal states
    showImageActionModal,
    showMainImageModal,
    pendingActionImageId,
    
    // Loading states
    isSwapping,
    isFlipping,
    
    // Drag mode states
    isMainImageDragEnabled,
    isSmallBoxDragEnabled,
    activeSmallBoxId,
    
    // Actions
    handleMainImageClick,
    flipMainImage,
    cancelMainImageAction,
    selectMainDragMode,
    handleImageClick,
    flipSmallImage,
    selectSmallBoxDragMode,
    cancelImageAction,
    exitMainDragMode,
    exitSmallBoxDragMode
  }
}
