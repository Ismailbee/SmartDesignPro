<template>
  <div class="sticker-page-wrapper" :class="{ 'wedding-active': selectedCategory === 'wedding' }">
    <!-- Chat Sidebar for project navigation -->
    <ChatSidebar
      :projects="projectList"
      :current-project-id="currentProject?.id ?? null"
      v-model:is-open="isSidebarOpen"
      @select-project="handleSelectProject"
      @create-project="handleCreateProject"
      @rename-project="handleRenameProject"
      @duplicate-project="handleDuplicateProject"
      @delete-project="handleDeleteProject"
      @open-settings="handleOpenSettings"
    />
    
  <div class="sticker-template-panel">
    <!-- FORM VIEW (Wedding is the only category) -->
    <div class="form-view">
        <!-- Category Selection Grid - Using extracted CategorySelector component -->
        <CategorySelector
          v-if="!selectedCategory"
          :categories="categories"
          @select="selectCategory"
        />

        <!-- Category Pills Removed -->

        <!-- Form Section (Wedding is the only category) -->
        <div class="form-section wedding-mode" v-if="selectedCategory">
          <!-- Wedding Chat Interface -->
          <div class="wedding-chat-interface">
            
            <!-- Chat Messages Component -->
            <WeddingChatMessages
          ref="weddingChatMessagesRef"
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          :is-generating-preview="isGeneratingPreview"
          :show-preview="showWeddingStickerPreview"
          :generating-message="generatingMessage"
          :is-authenticated="authStore.isAuthenticated"
          :user-name="userStore.user?.name?.split(' ')?.[0]"
          :tokens="userStore.user?.tokens ?? 0"
          :is-voice-enabled="isVoiceEnabled"
          @login="authStore.openAuthModal('login')"
          @action="handleMessageAction"
          @menu-action="handlePreviewMenuAction"
          @home="goHome"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
          @toggle-voice="toggleVoice"
        />

        <!-- Chat Input -->
        <WeddingChatInput
          v-model="chatInputText"
          :show-preview="showWeddingStickerPreview"
          @send="handleGenerateFromChat"
          @upload="triggerImageUpload"
        />
      </div>

          <!-- Hidden Wedding Preview Container (for SVG manipulation) -->
          <div v-if="showWeddingStickerPreview" class="wedding-preview-container" ref="weddingPreviewContainer" style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none;">
            <!-- SVG will be loaded here for manipulation -->
          </div>

          <!-- Edit Modal for Wedding Sticker -->
          <div v-if="showWeddingStickerPreview && showEditModal" class="wedding-preview-section">
            <label class="form-label">Edit Your Design</label>
            
            <!-- Image Controls Component -->
            <ImageControls
              :hasImages="svgImageManager.images.value.length > 0"
              :showControls="showImageControls"
              :selectedImage="selectedSVGImage"
              :isRetouching="isRetouching"
              :isRemovingBackground="isRemovingBackground"
              :backgroundRemovalProgress="backgroundRemovalProgress"
              :backgroundRemovalError="backgroundRemovalError"
              @toggle-controls="showImageControls = !showImageControls"
              @change-image="showUploadModal = true"
              @edit-description="openEditModal"
              @auto-retouch="autoRetouchImage"
              @set-scale="setImageScale"
              @scale-change="handleImageScaleChange"
              @flip="flipImage"
              @crop="retouchImage"
              @cancel-bg-removal="cancelBackgroundRemoval"
              @clear-error="backgroundRemovalError = null"
            />

            <!-- Error Message -->
            <div v-if="svgImageManager.uploadError.value" class="upload-error">
            {{ svgImageManager.uploadError.value }}
          </div>

          <!-- Export Buttons Component -->
          <ExportButtons 
            v-if="svgImageManager.images.value.length > 0 || formData.description"
            @export="(format) => exportWeddingSticker(format)"
          />
        </div>
      </div>

      <!-- Hidden file input for chat upload -->
      <input
        ref="preGeneratedImageInput"
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="hidden"
        @change="handlePreGeneratedImageSelect"
      />
    </div>

    <!-- Image Crop Modal -->
    <ImageCropModal
      :is-open="showCropModal"
      :image-src="cropImageSrc"
      :image-file="cropImageFile || undefined"
      @close="handleCropModalClose"
      @crop="handleCropComplete"
    />

    <!-- Upload Modal - Using extracted component -->
    <UploadModal
      v-if="showUploadModal"
      :is-processing="uploadModalProcessing"
      :progress="uploadModalProgress"
      :status-text="uploadModalStatusText"
      :success="uploadModalSuccess"
      :auto-remove-background="autoRemoveBackground"
      @close="closeUploadModal"
      @update:auto-remove-background="(val) => autoRemoveBackground = val"
      @file-select="handleModalFileSelect"
    />

    <!-- Edit Description Modal - Using extracted component -->
    <EditDescriptionModal
      v-if="showEditModal"
      :description="formData.description"
      :validation-warnings="validationWarnings"
      :extracted-info="editModalExtractedInfo"
      @update:description="(val) => { formData.description = val; handleDescriptionInput() }"
      @save="handleEditModalSave"
      @close="closeEditModal"
    />

    <!-- Image Swap Confirmation Modal - Using extracted component -->
    <ImageActionModal
      :show="showImageActionModal"
      @flip="flipSelectedImage"
      @swap="selectSwapMode"
      @drag="selectSmallBoxDragMode"
      @cancel="cancelImageAction"
    />
      
    <!-- Main Image Action Modal - Using extracted component -->
    <MainImageModal
      :show="showMainImageModal"
      @flip="flipMainImage"
      @drag="selectMainDragMode"
      @cancel="cancelMainImageAction"
    />
      
    <!-- Auto-Save Indicator - Using extracted component -->
    <AutoSaveIndicator
      :is-saving="isSaving"
      :show-saved="showSavedIndicator"
    />
      
    <!-- Loading Overlays - Using extracted component -->
    <LoadingOverlays
      :is-swapping="isSwapping"
      :is-flipping="isFlipping"
      :is-exporting="isExporting"
    />
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch, defineAsyncComponent, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { useDebounceFn } from '@vueuse/core'
import { ai } from '@/services/ai/ai.service'

// Import styles from external CSS file
import './sticker/styles/StickerTemplatePanel.css'

// Lazy load heavy animation library
const Vue3Lottie = defineAsyncComponent(() => 
  import('vue3-lottie').then(m => m.Vue3Lottie)
)

// TTS lazy-loading now handled by useSpeechToText composable

// Import composables (needed immediately for setup)
import { useWeddingStickerUpdater } from './sticker/composables/useWeddingStickerUpdater'
import { useSVGImageManager } from './sticker/composables/useSVGImageManager'
import { useSVGExport } from './sticker/composables/useSVGExport'
import { useDynamicSVG } from './sticker/composables/useDynamicSVG'
import { useSVGTextReplacement } from './sticker/composables/useSVGTextReplacement'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import { useImageRetouch } from '@/composables/useImageRetouch'
import { getBackgroundRefsCached } from '@/services/background/background-catalog.service'

// Lazy load heavy components for better performance
const ImageCropModal = defineAsyncComponent(() => import('@/components/modals/ImageCropModal.vue'))

// Lazy load sticker sub-components (PanelHeader removed - controls moved to WeddingChatMessages)
const CategorySelector = defineAsyncComponent(() => import('./sticker/CategorySelector.vue'))
const WeddingChatMessages = defineAsyncComponent(() => import('./sticker/WeddingChatMessages.vue'))
const WeddingChatInput = defineAsyncComponent(() => import('./sticker/WeddingChatInput.vue'))
const ImageControls = defineAsyncComponent(() => import('./sticker/ImageControls.vue'))
const UploadModal = defineAsyncComponent(() => import('./sticker/UploadModal.vue'))
const EditDescriptionModal = defineAsyncComponent(() => import('./sticker/EditDescriptionModal.vue'))
const GeneratingPreview = defineAsyncComponent(() => import('./sticker/GeneratingPreview.vue'))
const ExportButtons = defineAsyncComponent(() => import('./sticker/ExportButtons.vue'))
const SvgPreview = defineAsyncComponent(() => import('./sticker/SvgPreview.vue'))

// New extracted modal components
const ImageActionModal = defineAsyncComponent(() => import('./sticker/ImageActionModal.vue'))
const MainImageModal = defineAsyncComponent(() => import('./sticker/MainImageModal.vue'))
const LoadingOverlays = defineAsyncComponent(() => import('./sticker/LoadingOverlays.vue'))
const AutoSaveIndicator = defineAsyncComponent(() => import('./sticker/AutoSaveIndicator.vue'))
const ChatSidebar = defineAsyncComponent(() => import('./sticker/ChatSidebar.vue'))

// Import types only (no runtime cost)
import type { ChatMessage, Category, ExtractedInfo } from './sticker'

// Import extracted composables
import { useStickerExport } from './sticker/composables/useStickerExport'

// Import sticker composables (title, flourish, background management)
import {
  useTitleLibrary,
  useFlourishSystem,
  useBackgroundManager,
  // Extraction utilities (name extraction removed - use DeepSeek AI)
  extractDateFromText,
  extractCourtesyFromText,
  extractSizeFromText,
  parseAllInOneMessage,
  capitalizeWords,
  escapeRegExp,
  // AI Response Helper
  aiResponseHelper,
  // Title detection
  titlePatterns,
  titlePhraseMap,
  isPotentialTitle,
  extractTitleFromText,
  // Local extraction
  extractWeddingDetails,
  hasWeddingDetails,
  // Wedding chat composable
  useWeddingChat,
  // Speech-to-Text composable
  useSpeechToText,
  // SVG Draggable composable
  useSVGDraggable,
  // SVG Image Updater composable
  useSVGImageUpdater,
  // Wedding Preview Generation composable
  useWeddingPreviewGeneration,
  // Image Upload Flow composable
  useImageUploadFlow,
  // Upload Chat Flow composable
  useUploadChatFlow,
  // Wedding State composable
  useWeddingState,
  // Auto-save composable
  useAutoSave,
  // Content protection composable
  useContentProtection,
  // Offline storage (IndexedDB)
  useOfflineStorage,
  // Orientation handler
  useOrientationHandler,
  // Voice control
  useVoiceControl,
} from './sticker/composables'

// Import SVG utility functions (extracted for file size reduction)
import { 
  makeSVGImageDraggable as makeSVGImageDraggableUtil,
  updateSVGWithImages as updateSVGWithImagesUtil,
  handleSizeChange as handleSizeChangeUtil
} from './sticker/utils/svgUtils'

// Import image utility functions (extracted for file size reduction)
import {
  handleImageScaleChangeUtil,
  setImageScaleUtil,
  flipImageUtil,
  autoRetouchImageUtil,
  updateSelectedImagePropertyUtil,
  handlePreGenerationCropUtil,
  handlePostGenerationCropUtil,
  type CropCompleteData
} from './sticker/utils/imageUtils'

// Import chat utility functions (extracted for file size reduction)
import {
  trackImageUploadUtil,
  buildWeddingChatContextForAIUtil,
  buildWeddingChatTranscriptForAIUtil,
  parseSizeToInchesUtil,
  syncWeddingDescriptionFromStateUtil,
  addAIMessageWithTypingUtil,
  type ChatMessage as ChatMessageType
} from './sticker/utils/chatUtils'

// Import form utility functions (extracted for file size reduction)
import {
  updateDateAndCourtesyUtil,
  generateValidationWarnings,
  applyCustomHeadingUtil,
  applyHeadingFontUtil,
  COURTESY_KEYWORDS
} from './sticker/utils/formUtils'

// Import preview generation utilities (extracted for file size reduction)
import {
  GENERATING_MESSAGES,
  startGeneratingMessages,
  stopGeneratingMessages,
  hasConfirmedWeddingSize as hasConfirmedWeddingSizeUtil,
  promptForWeddingSize as promptForWeddingSizeUtil,
  setWeddingSize as setWeddingSizeUtil,
  generateWeddingPreviewUtil,
  handleGenerateMoreUtil,
  handleGenerateNewUtil,
  type GenerationContext
} from './sticker/utils/previewUtils'

// Import template utilities (extracted for file size reduction)
import {
  loadWeddingStickerTemplateUtil,
  ensureDecorativeWeddingTitleUtil,
  processDescriptionInputUtil,
  applyCustomHeadingAndFont,
  resetTitleRenderCache,
  type TemplateContext
} from './sticker/utils/templateUtils'

// Import export utilities
import { exportWeddingStickerUtil, type ExportContext } from './sticker/utils/exportUtils'

const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const { updateStickerText, getSVGElements, extractNames } = useWeddingStickerUpdater()
const { applyRetouch } = useImageRetouch()
const { calculateDimensions, resizeSVG, validateForExport, PRINT_DPI, SCREEN_DPI } = useDynamicSVG()

// ========================================
// WEDDING STATE - Using composable (replaces ~200 lines of inline state)
// ========================================
const {
  // Category & View
  showMenu,
  selectedCategory,
  categories,
  
  // Preview State
  showWeddingStickerPreview,
  isGeneratingPreview,
  generatingStep,
  isDescriptionVisible,
  showEditModal,
  generatingMessage,
  isGeneratingNewBackground,
  
  // Token Tracking
  hasDesignBeenGenerated,
  TOKEN_COST_GENERATE_DESIGN,
  TOKEN_COST_EDIT_TEXT,
  TOKEN_COST_CHANGE_BACKGROUND,
  
  // Form Data
  formData,
  
  // Chat State
  chatInputText,
  chatMessages,
  isAnalyzing,
  accumulatedDescription,
  
  // Wizard Step State
  awaitingPictureDecision,
  awaitingSizeDecision,
  pictureStepComplete,
  sizeStepComplete,
  awaitingBackgroundRemovalDecision,
  awaitingTitleConfirmation,
  pendingTitle,
  awaitingImageUpdateConfirmation,
  backgroundRemovalAlreadyHandled,
  
  // Image State
  pendingImageFile,
  preGeneratedImageFile,
  preGeneratedImagePreview,
  uploadedImages,
  lastUploadedImage,
  templateDefaultTitle,
  
  // Extracted Info
  extractedInfo,
  
  // Asked Questions
  askedQuestions,
  
  // Post-generation Update State
  awaitingDateChange,
  awaitingCourtesyChange,
  pendingDateUpdate,
  pendingCourtesyUpdate,
  awaitingCourtesyInput,
  pendingCourtesyText,
  
  // Crop Modal State
  showCropModal,
  cropImageSrc,
  cropImageFile,
  isPreGenerationCrop,
  
  // Upload Modal State
  showUploadModal,
  uploadModalProcessing,
  uploadModalProgress,
  uploadModalStatusText,
  uploadModalSuccess,
  
  // Background Removal State
  autoRemoveBackground,
  backgroundRemovalError,
  
  // Image Controls
  showImageControls,
  isRetouching,
  showUploadOptions,
  
  // Animation
  loadingAnimation,
  
  // DOM Refs
  preGeneratedImageInput,
  
  // Heading State
  customHeading,
  selectedHeadingFont,
  headingStepComplete,
  
  // Utility Methods
  resetAskedQuestions,
  resetWeddingState: resetWeddingStateFromComposable
} = useWeddingState()

// Load animation on mount
fetch('/animations/loading-circle.json')
  .then(res => res.json())
  .then(data => { loadingAnimation.value = data })
  .catch(() => { /* Fallback handled in template */ })

// ========================================
// TITLE LIBRARY - Using composable
// ========================================
const {
  TITLE_LIBRARY,
  findMatchingTitle,
  renderSvgToPng,
  replaceTitleWithImage,
  restoreTitleTextElements,
  updateTitleColor,
  clearTitleImageCache,
} = useTitleLibrary()

// Shared ref for tracking current background (used by flourish system)
const currentBackgroundFileName = ref<string>('')

// ========================================
// FLOURISH SYSTEM - Using composable
// ========================================
const {
  AVAILABLE_FLOURISHES,
  DEFAULT_FLOURISH_CONFIG: FLOURISH_CONFIG,
  getRandomFlourish,
  getFlourishColorForBackground,
  insertFlourishAboveNames,
  updateFlourishColor,
  removeFlourish,
} = useFlourishSystem(currentBackgroundFileName)

// Validation Warnings
const validationWarnings = ref<string[]>([])

function updateValidationWarnings(data: any) {
  validationWarnings.value = generateValidationWarnings(data, formData.description)
}

// SVG Image Management
const svgImageManager = useSVGImageManager({
  defaultX: 100,
  defaultY: 100,
  defaultWidth: 400,
  defaultHeight: 400
})

// Image action modal state (flip or swap for small images)
const showImageActionModal = ref(false)
const pendingActionImageId = ref<string | null>(null)
const isSwapping = ref(false)
const isFlipping = ref(false)
const isExporting = ref(false)

// Auto-save indicator - using composable
const { isSaving, showSavedIndicator, triggerSaveIndicator } = useAutoSave()

// Content protection - prevent context menu on images
useContentProtection()

// ========================================
// OFFLINE STORAGE - Using composable
// ========================================
const {
  currentProject,
  projectList,
  isLoading: isLoadingProject,
  isSaving: isSavingProject,
  isInitialized: isStorageInitialized,
  initialize: initializeOfflineStorage,
  createProject,
  loadProject,
  saveCurrentProject,
  updateProject,
  updateExtractedInfo: updateProjectExtractedInfo,
  renameProject,
  removeProject,
  copyProject,
  updateThumbnail,
  saveChatMsg,
  getProjectChats,
  scheduleAutoSave,
} = useOfflineStorage({
  autoSave: true,
  autoSaveDelay: 1500,
  onSaveStart: () => { isSaving.value = true },
  onSaveComplete: () => { 
    isSaving.value = false
    triggerSaveIndicator()
  },
  onSaveError: (error) => { 
    console.error('Auto-save error:', error)
    isSaving.value = false
  }
})

// ========================================
// ORIENTATION HANDLER - Using composable
// ========================================
const {
  screenWidth,
  screenHeight,
  orientation,
  isMobile,
  isTablet,
  isDesktop,
  forceRecalculate: recalculateLayout,
} = useOrientationHandler({
  debounceMs: 200,
  onOrientationChange: (newOrientation) => {
    console.log(`📱 Orientation: ${newOrientation}, recalculating layout...`)
    // Trigger SVG resize after orientation change
    nextTick(() => {
      updateChatPreviewSVG()
    })
  },
  onResize: () => {
    // Update preview on any resize
    nextTick(() => {
      updateChatPreviewSVG()
    })
  }
})

// ========================================
// VOICE CONTROL - Using composable
// ========================================
const {
  isListening: isVoiceListening,
  isSpeaking: isVoiceSpeaking,
  isSupported: isVoiceSupported,
  startListening,
  stopListening,
  toggleListening,
  speak: speakText,
  registerCommand,
  createDefaultCommands,
} = useVoiceControl({
  language: 'en-US',
  continuous: false,
  onCommandRecognized: (command) => {
    console.log(`🎯 Voice command: ${command.name}`)
  }
})

// ========================================
// LOW-MEMORY MODE - For constrained devices
// ========================================
const isLowMemoryMode = ref(false)

// Detect low-memory conditions
onMounted(() => {
  // Check if device has limited memory (mobile or low-end)
  const checkLowMemory = () => {
    // Check for deviceMemory API (Chrome/Edge)
    const deviceMemory = (navigator as any).deviceMemory
    if (deviceMemory && deviceMemory <= 2) {
      isLowMemoryMode.value = true
      console.log('📱 Low-memory mode enabled (device memory:', deviceMemory, 'GB)')
      return
    }
    
    // Check for connection type (slow network = likely constrained device)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      const slowTypes = ['slow-2g', '2g', '3g']
      if (slowTypes.includes(connection.effectiveType)) {
        isLowMemoryMode.value = true
        console.log('📱 Low-memory mode enabled (slow connection:', connection.effectiveType, ')')
        return
      }
    }
    
    // Check viewport size (small screens typically = mobile)
    if (window.innerWidth <= 360 && window.innerHeight <= 640) {
      isLowMemoryMode.value = true
      console.log('📱 Low-memory mode enabled (small viewport)')
    }
  }
  
  checkLowMemory()
})

// Apply low-memory optimizations
const getLowMemoryImageQuality = () => isLowMemoryMode.value ? 0.6 : 0.9
const getLowMemoryMaxDimension = () => isLowMemoryMode.value ? 1024 : 2048

// Chat sidebar state
const isSidebarOpen = ref(false)

// Main image action modal state
const showMainImageModal = ref(false)
const isMainImageDragEnabled = ref(false)

// Small box drag state
const isSmallBoxDragEnabled = ref(false)
const activeSmallBoxId = ref<string | null>(null)

/**
 * Handle single click on the main image to show action options
 */
function handleMainImageClick() {
  // If drag mode is enabled, don't show modal
  if (isMainImageDragEnabled.value) return
  if (svgImageManager.images.value.length === 0) return
  showMainImageModal.value = true
}

/**
 * Flip the main image
 */
function flipMainImage() {
  const mainImage = svgImageManager.images.value[0]
  if (!mainImage) return
  
  // Toggle flip state
  svgImageManager.updateImage(mainImage.id, { flipped: !mainImage.flipped })
  
  // Update the SVG display
  nextTick(() => {
    _updateSVGWithImages?.()
    updateChatPreviewSVG()
  })
  
  showMainImageModal.value = false
}

/**
 * Cancel the main image action modal
 */
function cancelMainImageAction() {
  showMainImageModal.value = false
}

/**
 * Handle clicks on modal overlay - only close if clicking directly on overlay
 * Prevents accidental closure on mobile when tapping inside the modal
 */
function handleModalOverlayClick(event: MouseEvent | TouchEvent) {
  // Only close if the click/touch is directly on the overlay, not bubbled from children
  if (event.target === event.currentTarget) {
    cancelMainImageAction()
  }
}

/**
 * User selected drag/reposition mode for main image
 */
function selectMainDragMode() {
  showMainImageModal.value = false
  isMainImageDragEnabled.value = true
  
  // Show feedback to user
  console.log('✋ Main image drag mode enabled - drag to reposition')
}

/**
 * User selected drag/reposition mode for small box
 */
function selectSmallBoxDragMode() {
  if (!pendingActionImageId.value) return
  
  // Determine which group this image belongs to
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
 * Handle single click on a small image to show action options
 * Only shows for non-main images (index > 0)
 */
function handleImageClick(imageId: string) {
  const index = svgImageManager.images.value.findIndex(img => img.id === imageId)
  if (index <= 0) {
    // Main image - no action needed
    return
  }
  
  // Show action modal
  pendingActionImageId.value = imageId
  showImageActionModal.value = true
}

/**
 * Flip the selected small image
 */
function flipSelectedImage() {
  if (!pendingActionImageId.value) return
  
  const image = svgImageManager.images.value.find(img => img.id === pendingActionImageId.value)
  if (!image) return
  
  // Show loading
  isFlipping.value = true
  showImageActionModal.value = false
  
  // Toggle flip state
  svgImageManager.updateImage(pendingActionImageId.value, { flipped: !image.flipped })
  
  // Update the SVG display
  nextTick(() => {
    _updateSVGWithImages?.()
    updateChatPreviewSVG()
    
    // Hide loading after update
    setTimeout(() => {
      isFlipping.value = false
    }, 300)
  })
  
  pendingActionImageId.value = null
}

/**
 * User selected swap mode - execute the swap
 */
async function selectSwapMode() {
  if (!pendingActionImageId.value) return
  
  showImageActionModal.value = false
  isSwapping.value = true
  
  // Small delay for visual feedback
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const success = svgImageManager.swapWithMain(pendingActionImageId.value)
  if (success) {
    // Update SVG with new image positions in the main container
    await nextTick()
    _updateSVGWithImages?.()
    
    // Wait for DOM to update
    await nextTick()
    
    // Update the chat preview (the visible preview in the chat) to reflect the swap
    updateChatPreviewSVG()
    
    console.log('🔄 Swap complete - preview updated')
  }
  
  isSwapping.value = false
  pendingActionImageId.value = null
}

/**
 * Cancel the image action
 */
function cancelImageAction() {
  showImageActionModal.value = false
  pendingActionImageId.value = null
}

// NOTE: isRetouching, showImageControls, showUploadOptions provided by useWeddingState composable

// SVG Text Replacement (for Nikkah graphics)
const { handleReplacement, resetReplacement, restoreOriginalElements, replacementState } = useSVGTextReplacement()

// SVG Export
const { exportSVG } = useSVGExport()

// Background Removal
const {
  removeBackground,
  isProcessing: isRemovingBackground,
  progress: backgroundRemovalProgress,
  error: bgRemovalError,
  cancelProcessing: cancelBackgroundRemoval,
  isSupported: isBackgroundRemovalSupported
} = useBackgroundRemoval()

// Wedding sticker refs
const weddingPreviewContainer = ref<HTMLDivElement | null>(null)
// WeddingChatMessages component ref
const weddingChatMessagesRef = ref<InstanceType<typeof WeddingChatMessages> | null>(null)
// Computed property to get chatPreviewContainer from the component
const chatPreviewContainer = computed(() => {
  if (!weddingChatMessagesRef.value) return null
  return weddingChatMessagesRef.value.previewContainers
})
// Computed property to get chatHistoryContainer from the component
const chatHistoryContainer = computed(() => {
  if (!weddingChatMessagesRef.value) return null
  // WeddingChatMessages exposes `chatContainer`
  return weddingChatMessagesRef.value.chatContainer
})
const imageFileInput = ref<HTMLInputElement | null>(null)
let svgElements: ReturnType<typeof getSVGElements> | null = null

// ========================================
// BACKGROUND MANAGER - Using composable
// ========================================
// Forward declaration for updateSVGWithImages (defined later in file)
let _updateSVGWithImages: (() => void) | undefined

// Persistence key based on user ID
const backgroundPersistenceKey = computed(() => {
  const userId = authStore.user?.id || 'anon'
  return `weddingSticker:selectedBackground:${userId}`
})

const {
  availableBackgrounds,
  currentBackgroundIndex,
  currentBackgroundFileName: bgManagerBackgroundFileName,
  usedBackgroundsInSession,
  getPersistedWeddingBackground,
  setPersistedWeddingBackground,
  loadWeddingBackgroundManifest,
  getBackgroundColorConfig,
  getTitleColorForBackground,
  getRandomBackground,
  applyNewBackground,
  updateChatPreviewSVG,
  currentBackgroundPaletteKey,
  LIGHT_BG_COLORS,
  DARK_BG_COLORS,
  RED_GOLD_BG_COLORS,
} = useBackgroundManager({
  weddingPreviewContainer,
  chatPreviewContainer: chatPreviewContainer as Ref<HTMLElement | HTMLElement[] | null>,
  postProcessChatPreviewSvg: (clonedSvg) => {
    // Enable dragging for the fixed-size small slots inside the chat preview clone.
    // This must be re-attached on every update because cloneNode strips listeners.
    try {
      const masterSvg = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement | null
      if (!masterSvg) return

      // Drag handler for main image only
      const attachImageDrag = (
        imageElId: 'userImage' | 'placeholder-image'
      ) => {
        const previewImageEl = clonedSvg.querySelector(`#${imageElId}`) as SVGImageElement | null
        if (!previewImageEl) return

        // Avoid attaching multiple times on the same node.
        if (previewImageEl.getAttribute('data-preview-draggable') === 'true') return
        previewImageEl.setAttribute('data-preview-draggable', 'true')

        previewImageEl.style.pointerEvents = 'all'
        previewImageEl.style.cursor = 'pointer'

        let dragging = false
        let startX = 0
        let startY = 0
        let initialX = 0
        let initialY = 0
        let pointerId: number | null = null

        const toSvgPoint = (svg: SVGSVGElement, clientX: number, clientY: number) => {
          const pt = svg.createSVGPoint()
          pt.x = clientX
          pt.y = clientY
          return pt.matrixTransform(svg.getScreenCTM()?.inverse())
        }

        const onPointerDown = (e: PointerEvent) => {
          // If drag mode is not enabled, show modal instead
          if (!isMainImageDragEnabled.value) {
            e.preventDefault()
            e.stopPropagation()
            handleMainImageClick()
            return
          }

          // Only primary button for mouse; for touch, button is usually 0.
          if (e.pointerType === 'mouse' && e.button !== 0) return

          const svg = previewImageEl.ownerSVGElement
          if (!svg) return

          dragging = true
          pointerId = e.pointerId
          previewImageEl.setPointerCapture(e.pointerId)

          const p = toSvgPoint(svg, e.clientX, e.clientY)
          startX = p.x
          startY = p.y
          initialX = parseFloat(previewImageEl.getAttribute('x') || '0')
          initialY = parseFloat(previewImageEl.getAttribute('y') || '0')

          previewImageEl.style.cursor = 'grabbing'
          previewImageEl.style.opacity = '0.9'
          e.preventDefault()
        }

        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return
          if (pointerId !== null && e.pointerId !== pointerId) return

          const svg = previewImageEl.ownerSVGElement
          if (!svg) return

          const p = toSvgPoint(svg, e.clientX, e.clientY)
          let dx = p.x - startX
          const dy = p.y - startY

          // Main image is always at index 0
          const mainImageId = svgImageManager.images.value[0]?.id
          const imageDataId = previewImageEl.getAttribute('data-image-id') || mainImageId || ''
          const img = svgImageManager.images.value.find(i => i.id === imageDataId)
          if (img?.flipped) dx = -dx

          const newX = initialX + dx
          const newY = initialY + dy

          // Update preview element immediately
          previewImageEl.setAttribute('x', String(newX))
          previewImageEl.setAttribute('y', String(newY))
          previewImageEl.setAttribute('data-user-position', 'true')

          // Persist in manager state
          if (imageDataId) {
            svgImageManager.updateImage(imageDataId, { x: newX, y: newY, hasUserPosition: true } as any)
          }

          // Mirror into the hidden master SVG so export + future clones keep the position.
          const masterEl = masterSvg.querySelector(`#${imageElId}`) as SVGImageElement | null
          if (masterEl) {
            masterEl.setAttribute('x', String(newX))
            masterEl.setAttribute('y', String(newY))
            masterEl.setAttribute('data-user-position', 'true')
          }

          e.preventDefault()
        }

        const endDrag = (e?: PointerEvent) => {
          if (!dragging) return
          dragging = false
          pointerId = null
          
          // Disable drag mode after drag ends so next click shows modal again
          isMainImageDragEnabled.value = false
          previewImageEl.style.cursor = 'pointer'
          previewImageEl.style.opacity = '1'
          if (e) {
            try { previewImageEl.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
          }
        }

        // Update cursor based on drag mode
        watch(isMainImageDragEnabled, (enabled) => {
          previewImageEl.style.cursor = enabled ? 'grab' : 'pointer'
        })

        previewImageEl.addEventListener('pointerdown', onPointerDown)
        previewImageEl.addEventListener('pointermove', onPointerMove)
        previewImageEl.addEventListener('pointerup', endDrag)
        previewImageEl.addEventListener('pointercancel', endDrag)
      }

      // Click-only handler for small images (no drag, just modal trigger)
      const attachSmallImageClickHandler = (
        imageElId: 'userImageSecondary' | 'userImageTertiary'
      ) => {
        const previewImageEl = clonedSvg.querySelector(`#${imageElId}`) as SVGImageElement | null
        if (!previewImageEl) return

        // Skip if group is hidden
        const groupId = imageElId === 'userImageSecondary' ? 'secondary-image-group' : 'tertiary-image-group'
        const group = clonedSvg.querySelector(`#${groupId}`) as SVGGElement | null
        const display = group?.getAttribute('display')
        if (display === 'none') return

        // Avoid attaching multiple times
        if (previewImageEl.getAttribute('data-click-handler') === 'true') return
        previewImageEl.setAttribute('data-click-handler', 'true')

        previewImageEl.style.pointerEvents = 'all'
        previewImageEl.style.cursor = 'pointer'

        // Track if we're in the middle of a drag to prevent click
        let didDrag = false

        // Watch for drag mode changes to update cursor
        watch([isSmallBoxDragEnabled, activeSmallBoxId], ([enabled, activeId]) => {
          if (enabled && activeId === groupId) {
            previewImageEl.style.cursor = 'grab'
            didDrag = false // Reset when entering drag mode
          } else {
            previewImageEl.style.cursor = 'pointer'
          }
        })

        // Track pointer movement to detect drag
        previewImageEl.addEventListener('pointermove', () => {
          if (isSmallBoxDragEnabled.value && activeSmallBoxId.value === groupId) {
            didDrag = true
          }
        })

        previewImageEl.addEventListener('click', (e) => {
          // If drag mode is enabled OR we just finished dragging, don't show modal
          if (isSmallBoxDragEnabled.value && activeSmallBoxId.value === groupId) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          
          // If we just dragged, don't show modal (small delay to allow drag to complete)
          if (didDrag) {
            e.preventDefault()
            e.stopPropagation()
            didDrag = false
            return
          }
          
          e.preventDefault()
          e.stopPropagation()
          
          const fallbackId = imageElId === 'userImageSecondary'
            ? svgImageManager.images.value[1]?.id
            : svgImageManager.images.value[2]?.id

          const imageDataId = previewImageEl.getAttribute('data-image-id') || fallbackId || ''
          if (imageDataId) {
            handleImageClick(imageDataId)
          }
        })
      }

      // Drag handler for small box - attached to IMAGE but moves the GROUP
      const attachSmallBoxDrag = (
        imageElId: 'userImageSecondary' | 'userImageTertiary',
        groupId: 'secondary-image-group' | 'tertiary-image-group'
      ) => {
        const previewImageEl = clonedSvg.querySelector(`#${imageElId}`) as SVGImageElement | null
        const groupEl = clonedSvg.querySelector(`#${groupId}`) as SVGGElement | null
        if (!previewImageEl || !groupEl) return

        // Skip if group is hidden
        const display = groupEl.getAttribute('display')
        if (display === 'none') return

        // Also get the master SVG group for syncing
        const masterGroupEl = masterSvg?.querySelector(`#${groupId}`) as SVGGElement | null

        // Avoid attaching multiple times
        if (previewImageEl.getAttribute('data-box-draggable') === 'true') return
        previewImageEl.setAttribute('data-box-draggable', 'true')

        let dragging = false
        let startX = 0
        let startY = 0
        let initialTranslateX = 0
        let initialTranslateY = 0
        let pointerId: number | null = null

        const toSvgPoint = (svg: SVGSVGElement, clientX: number, clientY: number) => {
          const pt = svg.createSVGPoint()
          pt.x = clientX
          pt.y = clientY
          return pt.matrixTransform(svg.getScreenCTM()?.inverse())
        }

        // Parse existing transform to get translate values
        const parseTransform = (el: SVGGElement): { x: number, y: number } => {
          const transform = el.getAttribute('transform') || ''
          const match = transform.match(/translate\(\s*([-\d.]+)\s*,?\s*([-\d.]+)?\s*\)/)
          if (match) {
            return { x: parseFloat(match[1]) || 0, y: parseFloat(match[2]) || 0 }
          }
          return { x: 0, y: 0 }
        }

        const onPointerDown = (e: PointerEvent) => {
          // Only allow drag if drag mode is enabled for this group
          if (!isSmallBoxDragEnabled.value || activeSmallBoxId.value !== groupId) {
            return // Let the click event handle showing modal
          }

          // Only primary button for mouse
          if (e.pointerType === 'mouse' && e.button !== 0) return

          const svg = groupEl.ownerSVGElement
          if (!svg) return

          dragging = true
          pointerId = e.pointerId
          previewImageEl.setPointerCapture(e.pointerId)

          const p = toSvgPoint(svg, e.clientX, e.clientY)
          startX = p.x
          startY = p.y
          
          const currentTransform = parseTransform(groupEl)
          initialTranslateX = currentTransform.x
          initialTranslateY = currentTransform.y

          previewImageEl.style.cursor = 'grabbing'
          groupEl.style.opacity = '0.9'
          e.preventDefault()
          e.stopPropagation()
        }

        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return
          if (pointerId !== null && e.pointerId !== pointerId) return

          const svg = groupEl.ownerSVGElement
          if (!svg) return

          const p = toSvgPoint(svg, e.clientX, e.clientY)
          const dx = p.x - startX
          const dy = p.y - startY

          const newX = initialTranslateX + dx
          const newY = initialTranslateY + dy

          // Update the GROUP transform (moves both frame and image together)
          groupEl.setAttribute('transform', `translate(${newX}, ${newY})`)

          // Mirror to master SVG for export
          if (masterGroupEl) {
            masterGroupEl.setAttribute('transform', `translate(${newX}, ${newY})`)
          }

          e.preventDefault()
        }

        const endDrag = (e?: PointerEvent) => {
          if (!dragging) return
          
          // Get the final position before resetting state
          const finalTransform = parseTransform(groupEl)
          
          dragging = false
          pointerId = null
          
          // Save the position to the image manager so it persists across flip/swap
          const imageIndex = groupId === 'secondary-image-group' ? 1 : 2
          const imageData = svgImageManager.images.value[imageIndex]
          if (imageData) {
            // Store group transform on the image data
            svgImageManager.updateImage(imageData.id, {
              groupTranslateX: finalTransform.x,
              groupTranslateY: finalTransform.y
            } as any)
            console.log(`📍 Saved small box position: ${groupId}`, finalTransform)
          }
          
          // Disable drag mode after drag ends
          isSmallBoxDragEnabled.value = false
          activeSmallBoxId.value = null
          previewImageEl.style.cursor = 'pointer'
          groupEl.style.opacity = '1'
          if (e) {
            try { previewImageEl.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
          }
        }

        previewImageEl.addEventListener('pointerdown', onPointerDown)
        previewImageEl.addEventListener('pointermove', onPointerMove)
        previewImageEl.addEventListener('pointerup', endDrag)
        previewImageEl.addEventListener('pointercancel', endDrag)
      }

      // Main image drag only (small boxes don't have drag, only click for flip/swap)
      attachImageDrag('userImage')
      attachImageDrag('placeholder-image')

      // Small boxed slots - click handler for modal AND drag handler for reposition
      attachSmallImageClickHandler('userImageSecondary')
      attachSmallImageClickHandler('userImageTertiary')

      // Small box drag - attached to image but moves the group
      attachSmallBoxDrag('userImageSecondary', 'secondary-image-group')
      attachSmallBoxDrag('userImageTertiary', 'tertiary-image-group')
    } catch (e) {
      console.warn('⚠️ Failed to enable chat preview dragging', e)
    }
  },
  clearTitleImageCache,
  updateSVGWithImages: () => _updateSVGWithImages?.(),
  updateTitleColor,
  flourishSystem: {
    getFlourishColorForBackground,
    updateFlourishColor,
  },
  persistenceKey: backgroundPersistenceKey,
})

// Sync background filename to our shared ref (for flourish system)
watch(bgManagerBackgroundFileName, (newVal) => {
  currentBackgroundFileName.value = newVal
  // Trigger auto-save on background change
  if (newVal) {
    triggerProjectAutoSave()
  }
}, { immediate: true })

// Auto-save watchers - trigger save on design changes
watch(() => svgImageManager.images.value, () => {
  // Only trigger if there are images (not on initial load)
  if (svgImageManager.images.value.length > 0) {
    triggerProjectAutoSave()
  }
}, { deep: true })

watch(() => extractedInfo.value, () => {
  // Trigger save when extracted info changes
  if (extractedInfo.value.title || extractedInfo.value.names?.name1 || extractedInfo.value.names?.name2) {
    updateProjectExtractedInfo(extractedInfo.value)
  }
}, { deep: true })

// NOTE: State refs (showMenu, selectedCategory, showWeddingStickerPreview, etc.)
// are now provided by useWeddingState composable above

// Handle action button clicks in messages
function handleMessageAction(action: { type: string; label?: string; route?: string }) {
  if (uploadChatFlow.handleUploadChatAction(action.type)) {
    return
  }

  switch (action.type) {
    case 'login':
      // Navigate to login page (same as "Get Started" button on home page)
      router.push('/login')
      break
    case 'register':
      // Navigate to register page
      router.push('/register')
      break
    case 'buy-tokens':
      router.push('/tokens-and-plans')
      break
    case 'navigate':
      if (action.route) {
        router.push(action.route)
      }
      break
    case 'upload':
    case 'add_photo':
      // Upload behavior depends on whether we already have a preview:
      // - Before preview: pick the main photo (preGeneratedImageInput)
      // - After preview: add more photos (opens UploadModal)
      if (showWeddingStickerPreview.value) {
        showUploadModal.value = true
      } else {
        triggerImageUpload()
      }
      break
    case 'generate_preview':
    case 'generate':
      // Generate the sticker (used by useWeddingChat composable)
      requestWeddingPreviewGeneration()
      break
    case 'regenerate':
      // Regenerate with a new random background
      regenerateWithNewBackground()
      break
    case 'edit':
      // Open the edit modal
      showEditModal.value = true
      break
    case 'download':
      // Download the sticker as PNG
      exportWeddingSticker('png')
      break
    default:
      break
  }
}

// Wedding size confirmation helpers - using extracted utilities
function hasConfirmedWeddingSize(): boolean {
  return hasConfirmedWeddingSizeUtil(extractedInfo, sizeStepComplete)
}

function promptForWeddingSize(): void {
  promptForWeddingSizeUtil(awaitingSizeDecision, isAnalyzing, chatMessages, scrollToBottom)
}

function setWeddingSize(sizeRaw: string): void {
  setWeddingSizeUtil(
    sizeRaw,
    extractedInfo,
    formData,
    sizeStepComplete,
    awaitingSizeDecision,
    showWeddingStickerPreview,
    handleSizeChange,
    syncWeddingDescriptionFromState
  )
}

function requestWeddingPreviewGeneration(): void {
  // Always sync description from state before generating
  // This ensures customHeading and extractedInfo are included in the description
  syncWeddingDescriptionFromState()
  
  if (!hasConfirmedWeddingSize()) {
    promptForWeddingSize()
    return
  }
  generateWeddingPreview()
}

// Token deduction helper function
async function deductTokensForAction(amount: number, reason: string): Promise<boolean> {
  // Token system temporarily disabled for development
  return true
}

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  // Ensure update is processed
  processDescriptionInput()
}

// Handle generate more - using extracted utility
async function handleGenerateMore() {
  await handleGenerateMoreUtil(
    chatMessages,
    isGeneratingPreview,
    generatingMessage,
    getRandomBackground,
    applyNewBackground,
    updateChatPreviewSVG,
    scrollToBottom
  )
}

// Handle generate new - using extracted utility
async function handleGenerateNew() {
  await handleGenerateNewUtil(
    weddingPreviewContainer,
    chatPreviewContainer,
    chatMessages,
    isGeneratingPreview,
    generatingMessage,
    getRandomBackground,
    applyNewBackground,
    scrollToBottom
  )
}

// Handle preview menu actions (from 3-dot menu on preview)
function handlePreviewMenuAction(action: string) {
  if (action === 'generate') {
    handleGenerateMore()
  } else if (action === 'generate-new') {
    handleGenerateNew()
  } else if (action === 'edit') {
    openEditModal()
  } else if (action === 'download') {
    exportWeddingSticker('png')
  }
}

// Computed property for edit modal extracted info
const editModalExtractedInfo = computed(() => ({
  heading: customHeading.value || '',
  name1: extractedInfo.value.names.name1 || '',
  name2: extractedInfo.value.names.name2 || '',
  date: extractedInfo.value.date || '',
  courtesy: extractedInfo.value.courtesy || ''
}))

// Handle save from edit modal - update SVG directly
async function handleEditModalSave(data: { heading: string; name1: string; name2: string; date: string; courtesy: string }) {
  // STRICT: Only allow simple A & B (single word each) as a couple.
  // If user typed a full name in name1 and name2 is accidentally populated (often with the surname),
  // treat it as a single name by clearing name2.
  const name1Trimmed = (data.name1 || '').trim()
  const name2Trimmed = (data.name2 || '').trim()
  const isSingleWord = (value: string) => !!value && !/\s/.test(value)
  const isStrictCouple = isSingleWord(name1Trimmed) && isSingleWord(name2Trimmed)

  // Common accidental case: name2 equals the last token of name1 (e.g., "Yahaya Suleiman" + "Suleiman")
  const lastToken = name1Trimmed.split(/\s+/).filter(Boolean).slice(-1)[0] || ''
  const looksLikeSurnameDup = !!name2Trimmed && !!lastToken && name2Trimmed.toLowerCase() === lastToken.toLowerCase()

  if (name1Trimmed && name2Trimmed && (!isStrictCouple || looksLikeSurnameDup)) {
    data.name2 = ''
  }

  // Update extracted info
  extractedInfo.value.names.name1 = data.name1 || null
  extractedInfo.value.names.name2 = data.name2 || null
  extractedInfo.value.date = data.date || null
  extractedInfo.value.courtesy = data.courtesy || null
  customHeading.value = data.heading || null
  
  // Rebuild description from parts
  // NOTE: Name extraction has been removed - DeepSeek AI should be used for names
  // Names are passed directly from the form data
  const parts: string[] = []
  if (data.heading) parts.push(data.heading)
  if (data.name1 && data.name2) {
    parts.push(`(${data.name1} & ${data.name2})`)
  } else if (data.name1) {
    parts.push(`(${data.name1})`)
  }
  if (data.date) parts.push(data.date)
  if (data.courtesy) parts.push(`courtesy: ${data.courtesy}`)
  
  const newDescription = parts.join(', ')
  formData.description = newDescription
  accumulatedDescription.value = newDescription
  
  // Trigger full update through processDescriptionInput which handles
  // the decorative SVG system with proper fonts and positioning
  await processDescriptionInput()
  
  // Sync to chat preview after update
  await nextTick()
  updateChatPreviewSVG()

  // Persist changes (SVG + extracted info + thumbnail)
  updateProjectExtractedInfo(extractedInfo.value)
  await persistCurrentDesignSnapshot({ forceThumbnail: true })

  // Close modal
  showEditModal.value = false
  
  // Show confirmation
  authStore.showNotification({
    title: 'Updated!',
    message: 'Your design has been updated.',
    type: 'success'
  })
}

// Chat footer handlers
function triggerImageUpload() {
  showUploadOptions.value = false
  if (selectedCategory.value === 'wedding') {
    if (showWeddingStickerPreview.value) {
      showUploadModal.value = true
    } else {
      preGeneratedImageInput.value?.click()
    }
  }
}

// Voice functions now come from useSpeechToText composable:
// - toggleVoiceInput, stopVoiceRecording, stopVoiceRecordingAndSend
// - checkIfMobile, toggleVoice, speakMessage, stopAllSpeech
// - isRecording, isVoiceEnabled, isMobileDevice, interimTranscript

// Main wedding preview generation - using extracted utility
async function generateWeddingPreview() {
  const ctx: GenerationContext = {
    weddingPreviewContainer,
    chatPreviewContainer,
    showWeddingStickerPreview,
    isGeneratingPreview,
    generatingStep,
    generatingMessage,
    chatMessages,
    formData,
    accumulatedDescription,
    extractedInfo,
    validationWarnings,
    isDescriptionVisible,
    hasDesignBeenGenerated,
    preGeneratedImageFile,
    autoRemoveBackground,
    sizeStepComplete,
    awaitingSizeDecision,
    isAnalyzing,
    currentBackgroundFileName,
    availableBackgrounds,
    TOKEN_COST_GENERATE_DESIGN,
    scrollToBottom,
    loadWeddingBackgroundManifest,
    getPersistedWeddingBackground,
    getRandomBackground,
    setPersistedWeddingBackground,
    loadWeddingStickerTemplate,
    processDescriptionInput,
    applyNewBackground,
    updateChatPreviewSVG,
    handleSizeChange,
    updateSVGWithImages,
    makeSVGImageDraggable,
    extractNames,
    deductTokensForAction,
    updateValidationWarnings,
    updateStickerText,
    svgImageManager,
    removeBackground,
    isBackgroundRemovalSupported,
    authStore
  }
  await generateWeddingPreviewUtil(ctx)
  
  // CRITICAL: Apply custom heading AFTER generation completes
  // This ensures the custom heading overrides any default values
  if (customHeading.value) {
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      applyCustomHeadingUtil(svgElement, customHeading.value)
      
      // Wait for DOM to update before syncing to chat preview
      await nextTick()
      
      // Also sync to chat preview
      updateChatPreviewSVG()
    } else {
      console.warn('Post-generation: no SVG element found to apply custom heading')
    }
  }

  // If the user uploaded 2–3 photos before generation, inject the extra ones now.
  // Doing this after generation avoids the preview util clearing images later.
  await nextTick()
  await addPreGenerationExtrasToPreview()
  await nextTick()
  updateChatPreviewSVG()

  // Persist the generated SVG + thumbnail (important for Home → return)
  await persistCurrentDesignSnapshot({ forceThumbnail: true })
}

// Regenerate with a new random background (keeps same text/image)
async function regenerateWithNewBackground() {
  const newBackground = getRandomBackground()
  if (!newBackground) {
    console.warn('⚠️ No backgrounds available for regeneration')
    return
  }
  
  // Apply the new background
  await applyNewBackground(newBackground)
  
  // Update the chat preview
  updateChatPreviewSVG()

  // Persist regenerated state + thumbnail
  await persistCurrentDesignSnapshot({ forceThumbnail: true })
  
  // Add a chat message about the change with typing indicator
  addAIMessageWithTyping(`✨ New background applied! Click **New** again to try another style.`)
}

// NOTE: State refs provided by useWeddingState composable (crop, upload, form, chat, categories)

// Track image uploads - wrapper for extracted utility
function trackImageUpload(file: File) {
  trackImageUploadUtil(file, {
    chatMessages,
    uploadedImages,
    lastUploadedImage,
    awaitingImageChoice: awaitingPictureDecision,
    awaitingImageUpdateConfirmation,
    pendingImageFile,
    showWeddingStickerPreview,
    scrollToBottom
  })
}

// showChatHelp - displays help message in chat
function showChatHelp() {
  const helpText = "Let me show you how it works!\n\n1. Type your details or upload a picture\n2. Use two fingers to resize images on mobile\n3. Click the voice icon to hear me speak!\n\nIt's easy! Let's go!"

  addAIMessageWithTyping(helpText)
}

// Setup auto-speak watcher for AI messages (using composable)
onMounted(() => {
  setupAutoSpeakWatcher()
  initializeVoice()
})

// Initialize offline storage on mount
onMounted(async () => {
  try {
    await initializeOfflineStorage()
    console.log('✅ Offline storage initialized')
    
    // Load chat messages for current project
    await loadChatMessagesFromStorage()

    // Restore extracted info for the current project (important on full page reload).
    if (currentProject.value?.extractedInfo) {
      extractedInfo.value = {
        ...extractedInfo.value,
        ...currentProject.value.extractedInfo,
        names: {
          ...extractedInfo.value.names,
          ...(currentProject.value.extractedInfo.names || {})
        }
      }
    }

    // Prefer restoring from the saved SVG snapshot.
    const restoredFromSvg = await restoreDesignFromSavedProject()
    
    // Check if there's a preview message and restore the design
    const hasPreviewMessage = chatMessages.value.some(msg => msg.type === 'preview')
    if (!restoredFromSvg && hasPreviewMessage && !showWeddingStickerPreview.value) {
      console.log('🔄 Restoring design from saved session...')
      // Set the preview flag to show the design
      showWeddingStickerPreview.value = true
      hasDesignBeenGenerated.value = true
      
      // Wait for DOM to update, then restore the SVG
      await nextTick()
      await nextTick()
      
      // Restore the background and design if persisted
      const persistedBg = getPersistedWeddingBackground()
      if (persistedBg) {
        await loadWeddingBackgroundManifest()
        const bgItem = availableBackgrounds.value.find(bg => 
          `${bg.src.type}:${bg.id}` === persistedBg || bg.id === persistedBg || bg.fileName === persistedBg
        )
        if (bgItem) {
          await loadWeddingStickerTemplate()
          await applyNewBackground(bgItem)
          setTimeout(() => {
            updateChatPreviewSVG()
            console.log('✅ Design restored from saved session')
          }, 500)
        }
      }
    }
    
    // Register voice commands after initialization
    const voiceCommands = createDefaultCommands({
      onFlip: flipMainImage,
      onSave: saveCurrentProject,
      onExport: () => exportWeddingSticker('png'),
      onNewBackground: () => handleMessageAction({ type: 'regenerate' })
    })
    
    voiceCommands.forEach(cmd => registerCommand(cmd))
    console.log('✅ Voice commands registered')
  } catch (e) {
    console.error('Failed to initialize offline storage:', e)
  }
})

async function inlineSvgImagesAsDataUrls(svgEl: SVGSVGElement): Promise<void> {
  const images = Array.from(svgEl.querySelectorAll('image')) as SVGImageElement[]
  const toDataUrl = async (href: string): Promise<string | null> => {
    try {
      const resp = await fetch(href, { cache: 'no-cache' })
      if (!resp.ok) return null
      const blob = await resp.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  for (const img of images) {
    const href = (img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '').trim()
    if (!href || href.startsWith('data:')) continue

    // Convert blob:/http(s):/relative(/...) URLs to data URLs so they survive reload.
    // Relative paths should be same-origin and safe to fetch.
    const dataUrl = await toDataUrl(href)
    if (!dataUrl) continue
    img.setAttribute('href', dataUrl)
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
  }
}

// NOTE: accumulatedDescription, awaiting states, pendingImageFile, uploadedImages,
// customHeading, selectedHeadingFont, extractedInfo all provided by useWeddingState composable

// Sync title with customHeading when either changes
watch(() => extractedInfo.value.title, (newTitle) => {
  if (newTitle && newTitle !== customHeading.value) {
    customHeading.value = newTitle
    headingStepComplete.value = true
  }
})
watch(customHeading, (newHeading) => {
  if (newHeading && newHeading !== extractedInfo.value.title) {
    extractedInfo.value.title = newHeading
  }
})

// Auto-save chat messages when new messages are added (debounced)
// Watch length changes only to avoid deep watching every property change
let chatSaveTimer: ReturnType<typeof setTimeout> | null = null
watch(() => chatMessages.value.length, () => {
  if (chatSaveTimer) clearTimeout(chatSaveTimer)
  chatSaveTimer = setTimeout(() => {
    saveChatMessagesToStorage()
  }, 2000) // Save after 2 seconds of no changes
})

// WEDDING CHAT COMPOSABLE - Forward declaration for title/names/date/courtesy detection
let weddingChatProcessor: ReturnType<typeof useWeddingChat> | null = null

// NOTE: State provided by useWeddingState; AI utilities from composables

let scrollTimer: ReturnType<typeof setTimeout> | null = null
const scrollToBottom = () => {
  // Debounce scroll to prevent multiple rapid scrolls (e.g., after multi-image upload)
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    if (weddingChatMessagesRef.value?.scrollToBottom) {
      weddingChatMessagesRef.value.scrollToBottom()
    } else {
      nextTick(() => {
        if (chatHistoryContainer.value) {
          chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
        }
      })
    }
    scrollTimer = null
  }, 100) // 100ms debounce
}

/**
 * Add an AI message with typing indicator animation
 * Shows three dots for 1 second, then reveals the actual message
 */
function addAIMessageWithTyping(
  text: string, 
  options?: {
    image?: string
    type?: 'text' | 'preview'
    actions?: ChatMessageType['actions']
    typingDelay?: number
  }
): Promise<void> {
  return addAIMessageWithTypingUtil(text, chatMessages, scrollToBottom, options as any)
}

// Upload-related chat flow (multi-photo crop → choose main → bg removal for all)
const uploadChatFlow = useUploadChatFlow({
  chatMessages: chatMessages as any,
  scrollToBottom,
  showNotification: (opts) => authStore.showNotification(opts),
  autoRemoveBackground,
  preGeneratedImageFile,
  pendingImageFile,
  pictureStepComplete,
  extractedInfo: extractedInfo as any,
  sizeStepComplete,
  awaitingSizeDecision,
  accumulatedDescription,
  formData,
  requestWeddingPreviewGeneration,
})

const { pendingPreGenerationExtraCroppedFiles } = uploadChatFlow

// SPEECH-TO-TEXT & TTS - Forward reference for sendMessage
let _sendMessageRef: (() => void) | null = null
const sendMessageWrapper = () => {
  if (_sendMessageRef) _sendMessageRef()
}

// Initialize speech composable with all required dependencies
const speechHandler = useSpeechToText({
  chatInputText,
  chatMessages: chatMessages as any,
  sendMessage: sendMessageWrapper,
  scrollToBottom,
  showNotification: (opts) => authStore.showNotification(opts),
  selectedCategory: selectedCategory as any,
})

// Destructure what we need from the composable
const {
  isRecording,
  isVoiceEnabled,
  isMobileDevice,
  interimTranscript,
  toggleVoiceInput,
  stopVoiceRecording,
  stopVoiceRecordingAndSend,
  toggleVoice,
  speakMessage,
  stopAllSpeech,
  initializeVoice,
  setupAutoSpeakWatcher,
  checkIfMobile,
} = speechHandler

// Initialize the wedding chat composable for proper title/names/date/courtesy detection
weddingChatProcessor = useWeddingChat({
  extractedInfo: extractedInfo as any,  // Cast to expected ExtractedInfo type
  chatMessages: chatMessages as any,
  isAnalyzing,
  showPreview: showWeddingStickerPreview,
  hasPhoto: computed(() => !!preGeneratedImageFile.value || svgImageManager.images.value.length > 0),
  awaitingPictureDecision,
  awaitingSizeDecision,
  awaitingBackgroundRemovalDecision,
  awaitingTitleConfirmation,
  pendingTitle,
  templateDefaultTitle,
  onGenerate: () => requestWeddingPreviewGeneration(),
  onScrollToBottom: scrollToBottom,
  onUploadPicture: () => triggerImageUpload(),
  onSetSize: (size: string) => setWeddingSize(size),
  onBackgroundRemovalDecision: (shouldRemoveBackground: boolean) => {
    // Move image from pendingImageFile to preGeneratedImageFile
    if (pendingImageFile.value) {
      preGeneratedImageFile.value = pendingImageFile.value
      console.log('📸 onBackgroundRemovalDecision: set preGeneratedImageFile from pendingImageFile', {
        shouldRemoveBackground,
        fileName: preGeneratedImageFile.value.name,
        fileSize: preGeneratedImageFile.value.size
      })
      
      // Set the auto-remove background flag based on user decision
      autoRemoveBackground.value = shouldRemoveBackground
      
      // Clear pending
      pendingImageFile.value = null
      pictureStepComplete.value = true
      
      // Add confirmation message with typing indicator
      addAIMessageWithTyping(shouldRemoveBackground 
        ? "Got it! I'll remove the background from your image. 🎨" 
        : "Okay! I'll keep the background as is. 📸")
      
      // Check if we can proceed to generation
      const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
      const hasSize = sizeStepComplete.value || extractedInfo.value.size
      
      setTimeout(async () => {
        if (hasAllInfo && hasSize) {
          await addAIMessageWithTyping("Perfect! Let me create your sticker now! 🎨")
          formData.description = accumulatedDescription.value
          setTimeout(() => requestWeddingPreviewGeneration(), 300)
        } else if (hasAllInfo && !sizeStepComplete.value) {
          await addAIMessageWithTyping("What size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)")
          awaitingSizeDecision.value = true
          scrollToBottom()
        }
      }, 500)
    }
  },
  onTitleConfirmed: async (confirmedTitle: string) => {
    // ALWAYS set customHeading - even if SVG doesn't exist yet
    // This ensures the title is used when the preview is generated later
    customHeading.value = confirmedTitle
    headingStepComplete.value = true
    
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (!svgElement) {
      return
    }
    
    // IMPORTANT:
    // For wedding stickers we keep the decorative title style (t1.svg) and rewrite its internal <text> nodes.
    // Do NOT replace with a PNG/image title, because that prevents custom-heading edits and ignores our group transform.
    await ensureDecorativeWeddingTitleUtil(svgElement)
    applyCustomHeadingUtil(svgElement, confirmedTitle)
    applyHeadingFontUtil(svgElement, selectedHeadingFont.value)

    // Sync the updated SVG to the visible chat preview
    updateChatPreviewSVG()
  },
})

type WeddingAssistantActionName =
  | 'none'
  | 'open_login'
  | 'generate_preview'
  | 'open_edit'
  | 'download_png'
  | 'regenerate'
  | 'set_size'
  | 'ask_upload'

interface WeddingAssistantDecision {
  message: string
  action?: {
    name: WeddingAssistantActionName
    args?: Record<string, unknown>
  }
  updates?: {
    heading?: string | null
    name1?: string | null
    name2?: string | null
    date?: string | null
    courtesy?: string | null
    size?: string | null
  }
  buttons?: Array<{ type: string; label: string; variant?: string }>
}

function syncWeddingDescriptionFromState() {
  syncWeddingDescriptionFromStateUtil(
    customHeading.value,
    extractedInfo.value,
    accumulatedDescription,
    formData
  )
}

function buildWeddingChatContextForAI() {
  return buildWeddingChatContextForAIUtil(
    authStore.isAuthenticated,
    userStore.user?.tokens ?? 0,
    showWeddingStickerPreview.value,
    customHeading.value,
    extractedInfo.value,
    !!preGeneratedImageFile.value
  )
}

function buildWeddingChatTranscriptForAI(maxMessages = 10): string {
  return buildWeddingChatTranscriptForAIUtil(chatMessages.value as any, maxMessages)
}

function parseSizeToInches(size: string): { w: number; h: number } | null {
  return parseSizeToInchesUtil(size)
}

// analyzeMessage uses weddingChatProcessor and local extraction
async function analyzeMessage(lastUserMessage: string) {
  if (!lastUserMessage || typeof lastUserMessage !== 'string') {
    return
  }

  // Use wedding chat composable for processing
  if (weddingChatProcessor) {
    const handled = await weddingChatProcessor.processMessage(lastUserMessage)
    if (handled) {
      syncWeddingDescriptionFromState()
      isAnalyzing.value = false
      return
    }
  }

  // Fallback: Try local extraction
  const localResult = extractWeddingDetails(lastUserMessage, {
    hasName: !!extractedInfo.value.names.name1,
    hasDate: !!extractedInfo.value.date
  })

  if (localResult.foundSomething) {
    if (localResult.title && !customHeading.value) {
      customHeading.value = localResult.title
      headingStepComplete.value = true
    }
    if (localResult.name1) extractedInfo.value.names.name1 = localResult.name1
    if (localResult.name2) extractedInfo.value.names.name2 = localResult.name2
    if (localResult.date) extractedInfo.value.date = localResult.date
    if (localResult.courtesy) extractedInfo.value.courtesy = localResult.courtesy

    syncWeddingDescriptionFromState()

    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date

    let responseText = ''
    if (hasName && hasDate) {
      responseText = `Got it! I've noted your details. Generating your sticker now...`
      setTimeout(() => generateWeddingPreview(), 500)
    } else {
      const missing: string[] = []
      if (!hasName) missing.push("bride's and groom's names")
      if (!hasDate) missing.push('wedding date')
      responseText = `I still need: ${missing.join(' and ')}.`
    }

    isAnalyzing.value = false
    addAIMessageWithTyping(responseText)
    return
  }

  // No extraction - ask for info
  isAnalyzing.value = false
  const hasName = !!extractedInfo.value.names.name1
  const hasDate = !!extractedInfo.value.date
  const missing: string[] = []
  if (!hasName) missing.push('names')
  if (!hasDate) missing.push('date')

  const responseText2 = missing.length > 0
    ? `Please share the ${missing.join(', ')} for your wedding sticker.`
    : 'I have all your details! Would you like to generate your wedding sticker?'

  addAIMessageWithTyping(responseText2)
}

function isLikelyGibberishInput(text: string): boolean {
  const raw = (text || '').trim()
  if (raw.length < 6) return false

  // If it has spaces, it's more likely a real sentence.
  if (/\s/.test(raw)) return false

  // Only consider mostly-letter inputs (avoid flagging dates/sizes like "10x12").
  const letters = raw.match(/[a-z]/gi) || []
  const nonLetters = raw.match(/[^a-z]/gi) || []
  if (letters.length === 0) return false
  if (nonLetters.length / raw.length > 0.25) return false

  const lower = raw.toLowerCase()
  const vowels = (lower.match(/[aeiou]/g) || []).length
  const vowelRatio = vowels / Math.max(1, letters.length)

  // Count max consecutive consonants.
  let maxConsecutiveConsonants = 0
  let current = 0
  for (const ch of lower) {
    if (/[a-z]/.test(ch) && !/[aeiou]/.test(ch)) {
      current += 1
      if (current > maxConsecutiveConsonants) maxConsecutiveConsonants = current
    } else {
      current = 0
    }
  }

  // Detect long repeated characters like "aaaaaa" or "ssssss".
  const hasLongRepeat = /(.)\1{4,}/.test(lower)

  // Heuristic: very low vowels and long consonant runs.
  if (hasLongRepeat) return true
  if (vowels === 0 && letters.length >= 6) return true
  if (maxConsecutiveConsonants >= 5 && vowelRatio < 0.25) return true
  if (letters.length >= 10 && vowelRatio < 0.2) return true

  return false
}


async function sendMessage() {
  const text = chatInputText.value.trim()
  if (!text) return

  stopVoiceRecording()

  // Add User Message
  chatMessages.value.push({
    id: Date.now(),
    text,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  chatInputText.value = ''
  scrollToBottom()

  // If the user typed gibberish, ask for clarification instead of processing.
  if (isLikelyGibberishInput(text)) {
    isAnalyzing.value = false
    addAIMessageWithTyping(
      "I didn’t understand that. Please can you clarify what you mean? For example: your names, wedding date, sticker size, or upload a photo."
    )
    return
  }

  isAnalyzing.value = true
  debouncedAnalyzeMessage(text)
}

// Connect the sendMessage wrapper for speech composable
_sendMessageRef = sendMessage

// Debounced version of analyzeMessage for performance
const debouncedAnalyzeMessage = useDebounceFn(async (text: string) => {
  await analyzeMessage(text)
}, 250, { maxWait: 1500 })

// Handle size change - wrapper for extracted utility
async function handleSizeChange(widthInches: number, heightInches: number) {
  await handleSizeChangeUtil(widthInches, heightInches, {
    weddingPreviewContainer,
    updateSVGWithImagesFn: updateSVGWithImages,
    updateChatPreviewSVG
  })
}

function handleEnterKey(e: KeyboardEvent) {
  if (selectedCategory.value === 'wedding') {
    e.preventDefault()
    sendMessage()
  }
  // Otherwise let it bubble or do nothing (SmartTextarea might handle it)
}

function handlePaste(e: ClipboardEvent) {
  if (selectedCategory.value !== 'wedding') return

  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile()
      if (blob) {
        // Handle the pasted image
        e.preventDefault()
        
        // Use the same logic as file selection
        cropImageSrc.value = URL.createObjectURL(blob)
        cropImageFile.value = blob
        isPreGenerationCrop.value = true
        showCropModal.value = true
        
        authStore.showNotification({
          title: 'Image Pasted',
          message: 'Image detected from clipboard!',
          type: 'success'
        })
        return
      }
    }
  }
}

function handleGenerateFromChat() {
  // Wedding is the only category - always use sendMessage
  sendMessage()
}

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
}

// Reset ALL wedding-related state - uses composable + clears SVG images
function resetWeddingState() {
  resetWeddingStateFromComposable()
  svgImageManager.clearAllImages()
}

function goBack() {
  if (selectedCategory.value) {
    // Reset ALL wedding state and go back to category selection
    resetWeddingState()
    selectedCategory.value = null
  } else {
    // Navigate to home immediately
    router.push('/home')
  }
}

// Navigate to home page directly
async function goHome() {
  // Persist the latest design snapshot + thumbnail before leaving.
  // This avoids coming back to a fallback template (e.g. name02.svg).
  await persistCurrentDesignSnapshot({ forceThumbnail: true })
  await saveChatMessagesToStorage()
  router.push('/home')
}

// Track which message IDs have been saved to prevent duplicates
const savedMessageIds = new Set<string | number>()

// Save current chat messages to IndexedDB
async function saveChatMessagesToStorage() {
  if (!chatMessages.value.length) return
  
  try {
    for (const msg of chatMessages.value) {
      // Only save if message hasn't been saved yet (check by ID)
      const msgId = msg.id?.toString() || `${msg.time}-${msg.sender}`
      if (!savedMessageIds.has(msgId)) {
        await saveChatMsg(msg.text, msg.sender, {
          visibleInChat: msg.visibleInChat,
          voiceRead: msg.voiceRead,
          skipSpeech: msg.skipSpeech,
          image: msg.image,
          type: msg.type
        })
        savedMessageIds.add(msgId)
      }
    }
    console.log('✅ Chat messages saved to storage')
  } catch (e) {
    console.error('Failed to save chat messages:', e)
  }
}

// Load chat messages from IndexedDB for current project
async function loadChatMessagesFromStorage() {
  try {
    // Clear the saved IDs set since we're loading fresh
    savedMessageIds.clear()
    
    const storedMessages = await getProjectChats()
    if (storedMessages.length > 0) {
      // Filter to only show visible messages
      chatMessages.value = storedMessages.map(msg => {
        const msgId = msg.id?.toString() || `${msg.time}-${msg.sender}`
        // Mark as already saved
        savedMessageIds.add(msgId)
        return {
          id: msg.id?.toString() || Date.now().toString(),
          sender: msg.sender,
          text: msg.text,
          time: msg.time,
          visibleInChat: msg.visibleInChat !== false,
          voiceRead: msg.voiceRead,
          skipSpeech: msg.skipSpeech,
          image: msg.image,
          type: msg.type
        }
      })
      console.log('✅ Loaded', storedMessages.length, 'chat messages from storage')
    }
  } catch (e) {
    console.error('Failed to load chat messages:', e)
  }
}

// ========================================
// SIDEBAR HANDLERS
// ========================================

/**
 * Handle selecting a project from the sidebar
 */
async function handleSelectProject(projectId: string) {
  // Save current chat messages first
  await saveChatMessagesToStorage()
  
  // Persist current design snapshot before switching projects
  await persistCurrentDesignSnapshot({ forceThumbnail: true })
  
  // Clear current chat messages and saved IDs before loading new project
  chatMessages.value = []
  savedMessageIds.clear()
  
  // Load the selected project
  await loadProject(projectId)
  
  // If project has saved state, restore it
  if (currentProject.value) {
    // Restore extracted info
    if (currentProject.value.extractedInfo) {
      extractedInfo.value = {
        ...extractedInfo.value,
        ...currentProject.value.extractedInfo,
        names: {
          ...extractedInfo.value.names,
          ...(currentProject.value.extractedInfo.names || {})
        }
      }
    }
    
    // Load chat messages for this project
    await loadChatMessagesFromStorage()

    // Restore the last generated SVG (if saved)
    await restoreDesignFromSavedProject()
    
    console.log('✅ Project restored:', currentProject.value.name)
  }
}

/**
 * Handle creating a new project
 */
async function handleCreateProject() {
  // Save current chat messages first
  await saveChatMessagesToStorage()
  
  // Persist current design snapshot before creating a new project
  await persistCurrentDesignSnapshot({ forceThumbnail: true })
  
  // Clear saved message IDs for new project
  savedMessageIds.clear()
  
  // Create new project
  await createProject()
  
  // Reset wedding state for clean start (this also clears chatMessages)
  resetWeddingState()
  
  console.log('✅ New project created')
}

/**
 * Handle renaming a project
 */
async function handleRenameProject(projectId: string, newName: string) {
  if (currentProject.value?.id === projectId) {
    await renameProject(newName)
  }
}

/**
 * Handle duplicating a project
 */
async function handleDuplicateProject(projectId: string) {
  await copyProject(projectId)
}

/**
 * Handle deleting a project
 */
async function handleDeleteProject(projectId: string) {
  await removeProject(projectId)
}

/**
 * Handle opening settings
 */
function handleOpenSettings() {
  // TODO: Implement settings modal
  console.log('Opening settings...')
}

/**
 * Trigger auto-save when project state changes
 */
function triggerProjectAutoSave() {
  if (!currentProject.value) return
  
  // Update project with current state
  updateProject({
    backgroundFileName: currentBackgroundFileName.value || null,
    description: (formData.description || accumulatedDescription.value || null) as any,
    extractedInfo: extractedInfo.value
  })
  
  // Generate thumbnail (debounced)
  generateThumbnailDebounced()
}

function getChatPreviewSvgElement(): SVGSVGElement | null {
  const previewContainer = Array.isArray(chatPreviewContainer.value)
    ? chatPreviewContainer.value[0]
    : chatPreviewContainer.value
  if (!previewContainer) return null
  return previewContainer.querySelector('svg') as SVGSVGElement | null
}

function serializeSvg(svgEl: SVGSVGElement): string {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(svgEl)
}

async function persistCurrentDesignSnapshot(options: { forceThumbnail?: boolean } = {}) {
  if (!currentProject.value) return

  const hadSavedSvgBefore = !!currentProject.value.svgContent

  try {
    // Prefer the full "master" SVG (export container). Fall back to the chat preview SVG.
    const masterSvg = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement | null
    const svgEl = masterSvg || getChatPreviewSvgElement()
    let svgContent: string | null = null
    if (svgEl) {
      const cloned = svgEl.cloneNode(true) as SVGSVGElement
      await inlineSvgImagesAsDataUrls(cloned)
      svgContent = serializeSvg(cloned)
    }

    updateProject({
      svgContent,
      backgroundFileName: currentBackgroundFileName.value || null,
      description: (formData.description || accumulatedDescription.value || null) as any,
      extractedInfo: extractedInfo.value
    })

    // Save immediately (don’t rely only on debounced autosave when navigating).
    await saveCurrentProject()

    if (options.forceThumbnail) {
      // Overwrite only on the FIRST saved generation. After that, keep the first generated thumbnail.
      await generateThumbnail({ overwrite: !hadSavedSvgBefore })
    } else {
      generateThumbnailDebounced()
    }
  } catch (e) {
    console.warn('Failed to persist design snapshot:', e)
  }
}

async function restoreDesignFromSavedProject(): Promise<boolean> {
  const project = currentProject.value
  if (!project?.svgContent) return false

  try {
    showWeddingStickerPreview.value = true
    hasDesignBeenGenerated.value = true

    if (project.backgroundFileName) {
      currentBackgroundFileName.value = project.backgroundFileName
    }

    // Wait for containers to exist.
    await nextTick()
    await nextTick()

    if (weddingPreviewContainer.value) {
      weddingPreviewContainer.value.innerHTML = project.svgContent
    }

    await nextTick()
    updateChatPreviewSVG()
    return true
  } catch (e) {
    console.warn('Failed to restore design from saved project:', e)
    return false
  }
}

// Thumbnail generation timer
let thumbnailTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Generate a thumbnail from the current preview (debounced)
 */
const generateThumbnailDebounced = () => {
  if (thumbnailTimer) {
    clearTimeout(thumbnailTimer)
  }
  
  thumbnailTimer = setTimeout(() => {
    generateThumbnail()
  }, 2000) // Wait 2 seconds after last change
}

/**
 * Generate thumbnail from the chat preview SVG
 */
async function generateThumbnail(options: { overwrite?: boolean } = {}) {
  if (!currentProject.value) return
  
  try {
    // Prefer the master SVG so thumbnails work even if the chat preview hasn't mounted yet.
    const svgElement = (weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement | null)
      || (getChatPreviewSvgElement() as SVGSVGElement | null)
    if (!svgElement) return
    
    // Clone SVG for thumbnail
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement
    
    // Set smaller size for thumbnail
    const thumbnailSize = 200
    clonedSvg.setAttribute('width', String(thumbnailSize))
    clonedSvg.setAttribute('height', String(thumbnailSize))
    
    // Serialize to string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clonedSvg)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    // Draw to canvas
    const img = new Image()
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = thumbnailSize
      canvas.height = thumbnailSize
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }
      
      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, thumbnailSize, thumbnailSize)
      
      // Draw image
      ctx.drawImage(img, 0, 0, thumbnailSize, thumbnailSize)
      
      // Get data URL (low quality for small file size). If canvas export fails
      // (can happen with certain embedded images), fall back to SVG data URL.
      let thumbnailDataUrl: string
      try {
        thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.6)
      } catch {
        thumbnailDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
      }
      
      // Update project thumbnail
      await updateThumbnail(thumbnailDataUrl, { overwrite: options.overwrite === true })
      
      // Cleanup
      URL.revokeObjectURL(url)
      console.log('📸 Thumbnail generated')
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  } catch (e) {
    console.warn('Failed to generate thumbnail:', e)
  }
}

// Wedding Sticker Functions - using extracted template utilities
async function loadWeddingStickerTemplate() {
  const ctx: TemplateContext = {
    weddingPreviewContainer,
    formData,
    accumulatedDescription,
    customHeading,
    selectedHeadingFont,
    selectedCategory,
    currentBackgroundFileName,
    currentBackgroundPaletteKey,
    resetReplacement,
    getSVGElements,
    findMatchingTitle,
    getTitleColorForBackground,
    getFlourishColorForBackground,
    replaceTitleWithImage,
    restoreTitleTextElements,
    insertFlourishAboveNames,
    updateStickerText,
    updateValidationWarnings,
    updateSVGWithImages,
    applyCustomHeadingUtil,
    applyHeadingFontUtil,
    authStore,
    setSvgElements: (elements: any) => { svgElements = elements },
    getSvgElementsRef: () => svgElements
  }
  await loadWeddingStickerTemplateUtil(ctx)
  
  // Set the default template title - this is the title shown on the SVG template
  // The current template uses "Alhamdulillah On Your Wedding Ceremony" as the default
  templateDefaultTitle.value = 'Alhamdulillah On Your Wedding Ceremony'
}

// Helper function to update only date and courtesy (not names) when title SVG is active
function updateDateAndCourtesy(description: string, svgElems: any) {
  updateDateAndCourtesyUtil(description, svgElems)
}

// Debounced input handler to prevent UI freezing during typing
const handleDescriptionInput = useDebounceFn(() => {
  processDescriptionInput()
}, 50)

// Process description input - using extracted template utility
async function processDescriptionInput() {
  const ctx: TemplateContext = {
    weddingPreviewContainer,
    formData,
    accumulatedDescription,
    customHeading,
    selectedHeadingFont,
    selectedCategory,
    currentBackgroundFileName,
    currentBackgroundPaletteKey,
    resetReplacement,
    getSVGElements,
    findMatchingTitle,
    getTitleColorForBackground,
    getFlourishColorForBackground,
    replaceTitleWithImage,
    restoreTitleTextElements,
    insertFlourishAboveNames,
    updateStickerText,
    updateValidationWarnings,
    updateSVGWithImages,
    applyCustomHeadingUtil,
    applyHeadingFontUtil,
    authStore,
    setSvgElements: (elements: any) => { svgElements = elements },
    getSvgElementsRef: () => svgElements
  }
  await processDescriptionInputUtil(ctx)
}

// SVG Image Management Functions
const selectedSVGImage = computed(() => svgImageManager.getSelectedImage())

async function handleImageDrop(event: DragEvent) {
  // Get SVG element to read placeholder position
  const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
  
  // Clear existing images to prevent accumulation/duplication
  svgImageManager.clearAllImages()
  
  await svgImageManager.handleDrop(event, svgElement)

  // Update SVG preview with new images
  updateSVGWithImages()
}

async function handleImageFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    // For now, only handle the first file with cropping
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

    // Step 2: Create object URL for the image (original or processed)
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

// Image crop modal handlers - refactored to use utilities
async function handleCropComplete(data: CropCompleteData) {
  isApplyingCrop.value = true

  if (isPreGenerationCrop.value) {
    if (isPreGenerationMultiCropping.value) {
      const current = cropImageFile.value
      if (!current) {
        isApplyingCrop.value = false
        return
      }

      const croppedFile = new File([data.blob], current.name, {
        type: 'image/png',
        lastModified: Date.now()
      })

      uploadChatFlow.recordPreGenerationCrop(croppedFile, data.dataUrl)

      // Mark this file as processed (we always crop the first queue item)
      preGenerationCropQueue.value.shift()

      const next = preGenerationCropQueue.value[0]
      if (next) {
        // Continue cropping next photo after the modal closes
        setTimeout(() => {
          startPreGenerationCrop(next)
          isApplyingCrop.value = false
        }, CROP_MODAL_REOPEN_DELAY_MS)
        return
      }

      // Finished cropping all selected photos — ask which should be the main picture
      uploadChatFlow.promptForMainPhotoChoice()

      // Reset multi-crop mode
      isPreGenerationMultiCropping.value = false
      preGenerationCropQueue.value = []

      setTimeout(() => {
        isApplyingCrop.value = false
      }, CROP_MODAL_REOPEN_DELAY_MS)
      return
    }

    // Use utility for pre-generation crop handling
    const deps = {
      svgImageManager,
      weddingPreviewContainer,
      updateSVGWithImagesFn: updateSVGWithImages,
      scrollToBottom,
      showNotification: (opts: any) => authStore.showNotification(opts),
      chatMessages,
      uploadedImages,
      preGeneratedImageFile,
      pictureStepComplete,
      pendingImageFile,
      extractedInfo,
      sizeStepComplete,
      awaitingSizeDecision,
      awaitingBackgroundRemovalDecision,
      backgroundRemovalAlreadyHandled,
      accumulatedDescription,
      formData,
      generateWeddingPreviewFn: generateWeddingPreview
    }
    
    handlePreGenerationCropUtil(data, cropImageFile, deps)
    
    // Reset state
    isPreGenerationCrop.value = false
    showCropModal.value = false
    if (cropImageSrc.value) {
      URL.revokeObjectURL(cropImageSrc.value)
      cropImageSrc.value = ''
    }
    cropImageFile.value = null
    isApplyingCrop.value = false
    return
  }

  // Post-generation crop - use utility
  await handlePostGenerationCropUtil(data, cropImageFile, {
    svgImageManager,
    weddingPreviewContainer,
    updateSVGWithImagesFn: updateSVGWithImages
  })

  // Clean up
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
  }
  cropImageFile.value = null

  // If user selected multiple files, continue the queue after the modal closes.
  const next = postGenerationCropQueue.value.shift()
  if (next) {
    // Defer until after the current modal close handler runs,
    // otherwise it may revoke the next image URL.
    setTimeout(() => {
      startPostGenerationCrop(next)
      isApplyingCrop.value = false
    }, CROP_MODAL_REOPEN_DELAY_MS)
    return
  }

  // Crop is done applying; if the user cancels the next one, we should clear the queue.
  isApplyingCrop.value = false
}

function handleCropModalClose() {
  showCropModal.value = false
  isPreGenerationCrop.value = false

  // Clean up object URL
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
  }
  cropImageFile.value = null

  // If the user cancelled (not applying a crop), drop any queued crops.
  if (!isApplyingCrop.value) {
    postGenerationCropQueue.value = []
    const hadPreGenerationQueue = isPreGenerationMultiCropping.value || preGenerationCropQueue.value.length > 0
    if (hadPreGenerationQueue) {
      isPreGenerationMultiCropping.value = false
      preGenerationCropQueue.value = []
      uploadChatFlow.resetUploadChatState()
    }
  }
}

function updateSelectedImageProperty(property: string, value: any) {
  if (svgImageManager.selectedImageId.value) {
    svgImageManager.updateImage(svgImageManager.selectedImageId.value, { [property]: value })

    // Update SVG preview
    updateSVGWithImages()
  }
}

// Image scale change - wrapper for extracted utility
function handleImageScaleChange(eventOrScale: Event | number) {
  handleImageScaleChangeUtil(eventOrScale, { svgImageManager, updateSVGWithImagesFn: updateSVGWithImages })
}

// Set image scale - wrapper for extracted utility
function setImageScale(scale: number) {
  setImageScaleUtil(scale, { svgImageManager, updateSVGWithImagesFn: updateSVGWithImages })
}

// Flip image - wrapper for extracted utility
function flipImage() {
  flipImageUtil({ svgImageManager, updateSVGWithImagesFn: updateSVGWithImages })
}

// Auto retouch image - wrapper for extracted utility
async function autoRetouchImage() {
  isRetouching.value = true
  try {
    await autoRetouchImageUtil({
      svgImageManager,
      weddingPreviewContainer,
      updateSVGWithImagesFn: updateSVGWithImages,
      showNotification: (opts) => authStore.showNotification(opts),
      applyRetouch
    })
  } finally {
    isRetouching.value = false
  }
}

async function retouchImage() {
  const selectedImage = svgImageManager.getSelectedImage()
  
  if (!selectedImage) {
    authStore.showNotification({
      title: 'No Image Selected',
      message: 'Please select an image to retouch',
      type: 'info'
    })
    return
  }

  try {
    // Open the crop modal with the selected image for retouching
    cropImageSrc.value = selectedImage.dataUrl
    cropImageFile.value = selectedImage.file
    showCropModal.value = true
    
  } catch (error) {
    authStore.showNotification({
      title: 'Retouch Error',
      message: 'Failed to open image for retouching',
      type: 'error'
    })
  }
}

// Make SVG image draggable - wrapper for extracted utility
function makeSVGImageDraggable(imageElement: SVGImageElement, imageId: string) {
  makeSVGImageDraggableUtil(imageElement, imageId, svgImageManager)
}

// Update SVG with images - wrapper for extracted utility
function updateSVGWithImages() {
  updateSVGWithImagesUtil({
    weddingPreviewContainer,
    svgImageManager,
    formData,
    preGeneratedImageFile,
    makeSVGImageDraggableFn: makeSVGImageDraggable
  })
}

// Wire up forward reference for Background Manager composable
_updateSVGWithImages = updateSVGWithImages

// Export wedding sticker - using extracted utility
async function exportWeddingSticker(format: 'svg' | 'png') {
  isExporting.value = true
  
  try {
    const ctx: ExportContext = {
      weddingPreviewContainer,
      svgImageManager,
      exportSVG,
      validateForExport,
      PRINT_DPI,
      showNotification: (opts) => authStore.showNotification(opts)
    }
    await exportWeddingStickerUtil(format, ctx)
  } finally {
    isExporting.value = false
  }
}

// Watch for category changes to load wedding template
watch(selectedCategory, async (newCategory) => {
  if (newCategory === 'wedding') {
    // Load wedding template
    await nextTick()
    // If we already have a saved SVG snapshot (or we're already showing the preview),
    // don't overwrite it with the base template on reload.
    if (currentProject.value?.svgContent || showWeddingStickerPreview.value || hasDesignBeenGenerated.value) {
      return
    }
    await loadWeddingStickerTemplate()
  }
})

// Watch for SVG size changes
watch([() => formData.svgWidth, () => formData.svgHeight], ([newWidth, newHeight]) => {
  if (selectedCategory.value === 'wedding' && weddingPreviewContainer.value) {
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      svgElement.setAttribute('width', newWidth.toString())
      svgElement.setAttribute('height', newHeight.toString())
    }
  }
})

// Upload Modal Functions
const MAX_UPLOAD_IMAGES = 3
const CROP_MODAL_REOPEN_DELAY_MS = 350
const postGenerationCropQueue = ref<File[]>([])
const isApplyingCrop = ref(false)
const isPreGenerationMultiCropping = ref(false)
const preGenerationCropQueue = ref<File[]>([])

function startPostGenerationCrop(file: File) {
  // This crop is for adding a new photo slot; avoid replacing a currently selected image.
  svgImageManager.selectImage(null)

  // Ensure any previous object URL is cleaned up before starting a new crop
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
  }

  cropImageSrc.value = URL.createObjectURL(file)
  cropImageFile.value = file
  isPreGenerationCrop.value = false
  showCropModal.value = true
}

function enqueuePostGenerationCrops(files: File[]) {
  const currentCount = svgImageManager.images.value.length
  const remainingSlots = Math.max(0, MAX_UPLOAD_IMAGES - currentCount)

  // If already at capacity, allow replacing only one slot per action.
  const maxToQueue = remainingSlots > 0 ? remainingSlots : 1
  const toQueue = files.slice(0, maxToQueue)
  const skipped = files.length - toQueue.length

  postGenerationCropQueue.value.push(...toQueue)

  if (skipped > 0) {
    authStore.showNotification({
      title: 'Extra photos skipped',
      message: `You can use up to ${MAX_UPLOAD_IMAGES} photos per sticker.`,
      type: 'info'
    })
  }

  if (!showCropModal.value && postGenerationCropQueue.value.length > 0) {
    const next = postGenerationCropQueue.value.shift()
    if (next) startPostGenerationCrop(next)
  }
}

async function addPreGenerationExtrasToPreview(): Promise<void> {
  if (!showWeddingStickerPreview.value) return
  if (pendingPreGenerationExtraCroppedFiles.value.length === 0) return
  if (!weddingPreviewContainer.value) return

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) return

  const extras = pendingPreGenerationExtraCroppedFiles.value.slice(0, MAX_UPLOAD_IMAGES - 1)
  pendingPreGenerationExtraCroppedFiles.value = []

  uploadChatFlow.announceAddingExtrasToPreview(extras.length)

  for (const file of extras) {
    let fileToProcess = file
    if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
      try {
        const result = await removeBackground(fileToProcess, {
          quality: isLowMemoryMode.value ? 'medium' : 'high',
          outputFormat: 'image/png',
          maxDimensions: getLowMemoryMaxDimension()
        })
        fileToProcess = new File([result.blob], fileToProcess.name.replace(/\.[^/.]+$/, '.png'), {
          type: 'image/png',
          lastModified: Date.now()
        })
      } catch (error) {
        // Continue with original image
      }
    }

    await svgImageManager.addImage(fileToProcess, svgElement)
  }

  updateSVGWithImages()
}

// Note: extra (2nd/3rd) photos are injected after generation completes.

function startPreGenerationCrop(file: File) {
  // Ensure any previous object URL is cleaned up before starting a new crop
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
  }

  cropImageSrc.value = URL.createObjectURL(file)
  cropImageFile.value = file
  isPreGenerationCrop.value = true
  showCropModal.value = true
}

function closeUploadModal() {
  if (!uploadModalProcessing.value) {
    showUploadModal.value = false
    uploadModalSuccess.value = false
  }
}

async function handleModalFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const selectedFiles = Array.from(files)

    // Start processing
    uploadModalProcessing.value = true
    uploadModalProgress.value = 0
    uploadModalStatusText.value = 'Uploading image...'
    uploadModalSuccess.value = false

    try {
      // Simulate upload progress
      uploadModalProgress.value = 30
      await new Promise(resolve => setTimeout(resolve, 300))

      // Store first file for compatibility with any legacy flows
      pendingImageFile.value = selectedFiles[0]
      
      uploadModalProgress.value = 100
      uploadModalStatusText.value = 'Image uploaded!'
      uploadModalSuccess.value = true

      // Close modal
      setTimeout(() => {
        closeUploadModal()
        uploadModalProcessing.value = false
        
        if (showWeddingStickerPreview.value) {
          // Post-generation: add 2nd/3rd images (or replace one) via sequential crop.
          enqueuePostGenerationCrops(selectedFiles)

        } else {
          // Normal flow (before generation)
          // Ask user about background removal
          awaitingBackgroundRemovalDecision.value = true
          addAIMessageWithTyping("Great! Picture received! Would you like me to remove the background? Say 'yes' or 'no'!")
        }
      }, 500)

    } catch (error) {
      uploadModalProcessing.value = false
      uploadModalProgress.value = 0
      
      authStore.showNotification({
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

function handlePreGeneratedImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const allSelected = Array.from(files)
    const selectedFiles = allSelected.slice(0, MAX_UPLOAD_IMAGES)

    if (allSelected.length > MAX_UPLOAD_IMAGES) {
      authStore.showNotification({
        title: 'Too many photos',
        message: `You can use up to ${MAX_UPLOAD_IMAGES} photos. I’ll use the first ${MAX_UPLOAD_IMAGES}.`,
        type: 'info'
      })
    }

    if (selectedFiles.length > 1) {
      isPreGenerationMultiCropping.value = true
      preGenerationCropQueue.value = [...selectedFiles]
      uploadChatFlow.resetUploadChatState()
      uploadChatFlow.announcePreGenerationCroppingStart(selectedFiles.length)

      // Track only the first file to avoid duplicate “multiple upload” prompts
      trackImageUpload(selectedFiles[0])
      pendingImageFile.value = selectedFiles[0]

      startPreGenerationCrop(selectedFiles[0])
    } else {
      const file = selectedFiles[0]

      // Track the image upload for AI management
      trackImageUpload(file)

      // Store the file for after cropping
      pendingImageFile.value = file

      startPreGenerationCrop(file)
    }

    // The chat message will be sent AFTER cropping is complete
    // See handleCropComplete for the post-crop flow
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

onMounted(() => {
  // Clear previous form data
  autoDesignStore.resetFormData()

  // Load the background manifest so both the random picker and the UI use the same list
  // (falls back to a hardcoded list if the JSON can't be fetched)
  loadWeddingBackgroundManifest()

  // Set category
  autoDesignStore.setCategory('sticker')

  // Load wedding template
  nextTick(() => {
    loadWeddingStickerTemplate()
  })

  // Content protection is now handled by useContentProtection composable
})

// Cleanup on unmount to prevent memory leaks and improve navigation speed
onBeforeUnmount(() => {
  // Stop any ongoing speech synthesis and recognition using composable methods
  stopAllSpeech()
  stopVoiceRecording()
  
  // Clear generating messages interval
  stopGeneratingMessages()
  
  // Clear chat save timer
  if (chatSaveTimer) {
    clearTimeout(chatSaveTimer)
    chatSaveTimer = null
  }
  
  // Clear scroll timer to prevent memory leak
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }
  
  // Save chat messages before unmount
  saveChatMessagesToStorage()
  
  // Content protection cleanup is handled automatically by useContentProtection composable
  
  // Revoke any object URLs
  if (preGeneratedImagePreview.value) {
    URL.revokeObjectURL(preGeneratedImagePreview.value)
    preGeneratedImagePreview.value = null
  }
  
  // Cleanup draggable group event listeners to prevent memory leaks
  if (weddingPreviewContainer.value) {
    const draggableGroups = weddingPreviewContainer.value.querySelectorAll('[data-group-draggable="true"]')
    draggableGroups.forEach((group) => {
      const cleanup = (group as any).__groupDragCleanup
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
  }
})
</script>



