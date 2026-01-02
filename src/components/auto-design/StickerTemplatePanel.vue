<template>
  <div class="sticker-page-wrapper" :class="{ 'wedding-active': selectedCategory === 'wedding' }">
  <div class="sticker-template-panel">
    <!-- FORM VIEW -->
    <Transition name="fade">
      <div v-if="viewMode === 'form'" class="form-view">
        <!-- Header - Using extracted PanelHeader component -->
        <PanelHeader
          title="Sticker Template"
          :is-voice-enabled="isVoiceEnabled"
          @back="goBack"
          @help="showChatHelp"
          @toggle-voice="toggleVoice"
        />



        <!-- Category Selection Grid - Using extracted CategorySelector component -->
        <CategorySelector
          v-if="!selectedCategory"
          :categories="categories"
          @select="selectCategory"
        />

        <!-- Category Pills Removed -->

        <!-- Form Section -->
        <div class="form-section" :class="{ 'wedding-mode': selectedCategory === 'wedding' }" v-if="selectedCategory">
          <!-- Smart Camera Input (Hidden for Wedding) -->
          <div v-if="isDescriptionVisible && selectedCategory !== 'wedding'" class="form-group">
            <SmartCameraInput 
              @update:description="handleDescriptionUpdate" 
              :initial-text="formData.description"
            />
          </div>

      <!-- Description Field (Hidden for Wedding) -->
      <div v-if="isDescriptionVisible && selectedCategory !== 'wedding'" class="form-group">
        <label for="description" class="form-label">Description</label>
        <SmartTextarea
          id="description"
          v-model="formData.description"
          @input="handleDescriptionInput"
          @keydown="handleDescriptionKeydown"
          class="form-textarea"
          data-explain="description-textarea"
          rows="4"
          placeholder="Enter sticker description... (e.g., Congratulations on your wedding! John and Mary, 15th April 2025, courtesy: Smith Family)"
        />

        <!-- Validation Warnings -->
        <div v-if="validationWarnings.length > 0" class="validation-warnings-container">
          <div class="warning-header">
            <svg class="w-5 h-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-amber-800 font-medium">Please check the following:</span>
          </div>
          <ul class="warning-list">
            <li v-for="(warning, index) in validationWarnings" :key="index" class="warning-list-item">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Wedding Chat Interface -->
      <div v-if="selectedCategory === 'wedding'" class="wedding-chat-interface">
        
        <!-- Chat Messages Component -->
        <WeddingChatMessages
          ref="weddingChatMessagesRef"
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          :is-generating-preview="isGeneratingPreview"
          :show-preview="showWeddingStickerPreview"
          :generating-message="generatingMessage"
          :is-authenticated="authStore.isAuthenticated"
          :user-name="userStore.user?.name?.split(' ')[0]"
          :tokens="userStore.user?.tokens ?? 0"
          @login="authStore.openAuthModal('login')"
          @action="handleMessageAction"
          @menu-action="handlePreviewMenuAction"
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
      <!-- Using visibility:hidden and position:absolute to keep SVG in DOM flow for proper rendering -->
      <div v-if="selectedCategory === 'wedding' && showWeddingStickerPreview" class="wedding-preview-container" ref="weddingPreviewContainer" style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none;">
        <!-- SVG will be loaded here for manipulation -->
      </div>

      <!-- Edit Modal for Wedding Sticker -->
      <div v-if="selectedCategory === 'wedding' && showWeddingStickerPreview && showEditModal" class="wedding-preview-section">
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

          <!-- Drag & Drop Zone Removed -->

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
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="hidden"
        @change="handlePreGeneratedImageSelect"
      />
    </div>
    </Transition>

    <!-- PREVIEW VIEW -->
    <Transition name="fade">
      <div v-if="viewMode === 'preview'" class="preview-view">
        <!-- Preview Header -->
        <div class="preview-header">
          <button @click="backToForm" class="back-to-form-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="ml-2">Edit Design</span>
          </button>
          <h2 class="preview-title">Your Sticker Design</h2>
          <div class="preview-actions">
            <button class="action-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Preview Content -->
        <div class="preview-content">
          <!-- Loading Animation -->
          <div v-if="isGenerating" class="loading-container">
            <Vue3Lottie
              :animationData="loadingAnimation"
              :height="80"
              :width="80"
            />
            <p class="loading-text">Creating your amazing sticker design...</p>
            <p class="loading-subtext">This will only take a moment</p>
          </div>

          <!-- Generated Preview -->
          <div v-else-if="previewUrl" class="preview-result">
            <div class="preview-image-container">
              <img :src="previewUrl" alt="Sticker Preview" class="generated-image" />
            </div>
            <div class="preview-info">
              <h3 class="preview-info-title">Design Details</h3>
              <div class="preview-info-item">
                <span class="info-label">Category:</span>
                <span class="info-value">{{ getCategoryName(selectedCategory) }}</span>
              </div>
              <div class="preview-info-item">
                <span class="info-label">Size:</span>
                <span class="info-value">{{ formData.customSize }}</span>
              </div>
              <div class="preview-info-item">
                <span class="info-label">Background:</span>
                <span class="info-value">{{ formData.removeBackground ? 'Removed' : 'Included' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch, defineAsyncComponent, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { FEATURES } from '@/config/environment'
import { IonSpinner } from '@ionic/vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { ai } from '@/services/ai/ai.service'
import { extractFirstJsonBlock, safeJsonParse } from '@/services/ai/json.util'

// Import styles from external CSS file
import './sticker/styles/StickerTemplatePanel.css'

// Lazy load heavy animation library
const Vue3Lottie = defineAsyncComponent(() => 
  import('vue3-lottie').then(m => m.Vue3Lottie)
)

// TTS lazy-loading now handled by useSpeechToText composable

// Import composables (needed immediately for setup)
import { useWeddingStickerUpdater } from '@/composables/useWeddingStickerUpdater'
import { useSVGImageManager } from '@/composables/useSVGImageManager'
import { useSVGExport } from '@/composables/useSVGExport'
import { useDynamicSVG } from '@/composables/useDynamicSVG'
import { useSVGTextReplacement } from '@/composables/useSVGTextReplacement'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import { useImageRetouch } from '@/composables/useImageRetouch'
import { getBackgroundRefsCached } from '@/services/background-catalog.service'

// Lazy load heavy components for better performance
const ImageCropModal = defineAsyncComponent(() => import('@/components/modals/ImageCropModal.vue'))
const SmartCameraInput = defineAsyncComponent(() => import('./SmartCameraInput.vue'))
const SmartTextarea = defineAsyncComponent(() => import('@/components/ui/SmartTextarea.vue'))

// Lazy load sticker sub-components
const PanelHeader = defineAsyncComponent(() => import('./sticker/PanelHeader.vue'))
const CategorySelector = defineAsyncComponent(() => import('./sticker/CategorySelector.vue'))
const WeddingChatMessages = defineAsyncComponent(() => import('./sticker/WeddingChatMessages.vue'))
const WeddingChatInput = defineAsyncComponent(() => import('./sticker/WeddingChatInput.vue'))
const ImageControls = defineAsyncComponent(() => import('./sticker/ImageControls.vue'))
const UploadModal = defineAsyncComponent(() => import('./sticker/UploadModal.vue'))
const EditDescriptionModal = defineAsyncComponent(() => import('./sticker/EditDescriptionModal.vue'))
const HelpModal = defineAsyncComponent(() => import('./sticker/HelpModal.vue'))
const GeneratingPreview = defineAsyncComponent(() => import('./sticker/GeneratingPreview.vue'))
const ExportButtons = defineAsyncComponent(() => import('./sticker/ExportButtons.vue'))
const SvgPreview = defineAsyncComponent(() => import('./sticker/SvgPreview.vue'))

// Import types only (no runtime cost)
import type { ChatMessage, Category, ExtractedInfo } from './sticker'

// Import extracted composables
import { useTextExtraction } from '@/composables/useTextExtraction'
import { useAiChatResponses } from '@/composables/useAiChatResponses'
import { useStickerExport } from '@/composables/useStickerExport'

// Import sticker composables (title, flourish, background management, spell correction, intent detection)
import {
  useTitleLibrary,
  useFlourishSystem,
  useBackgroundManager,
  useSpellCorrection,
  correctSpelling as correctSpellingComposable,
  findFuzzyMatch as findFuzzyMatchComposable,
  levenshteinDistance as levenshteinDistanceComposable,
  COMMON_MISSPELLINGS,
  useIntentDetection,
  detectIntent as detectIntentComposable,
  isPositiveConfirmation,
  isNegativeConfirmation,
  extractTargetField,
  type TitleEntry,
  type TitleImageConfig,
  type UserIntent,
  type IntentResult,
  type SpellCorrectionResult,
  type BackgroundColorConfig,
  // Extraction utilities
  extractNamesFromResponse,
  extractDateFromText,
  extractCourtesyFromText,
  extractSizeFromText,
  extractNamesFromBrackets,
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
  // Local extraction (replaces inline tryLocalExtraction)
  extractWeddingDetails,
  hasWeddingDetails,
  // Wedding chat composable for proper title/names/date/courtesy detection
  useWeddingChat,
  // Speech-to-Text composable
  useSpeechToText,
  // SVG Draggable composable
  useSVGDraggable,
  // SVG Image Updater composable
  useSVGImageUpdater,
  // Wedding Preview Generation composable
  useWeddingPreviewGeneration,
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
  handleMultipleImageUploadsUtil,
  addUserMessageUtil,
  addAIMessageUtil,
  buildWeddingChatContextForAIUtil,
  buildWeddingChatTranscriptForAIUtil,
  parseSizeToInchesUtil,
  syncWeddingDescriptionFromStateUtil,
  resetAskedQuestionsUtil,
  resetWeddingStateUtil,
  type ChatMessage as ChatMessageType,
  type TrackedImage
} from './sticker/utils/chatUtils'

// Import form utility functions (extracted for file size reduction)
import {
  updateDateAndCourtesyUtil,
  handleDescriptionKeydownUtil,
  generateValidationWarnings,
  applyCustomHeadingUtil,
  applyHeadingFontUtil,
  COURTESY_KEYWORDS
} from './sticker/utils/formUtils'

const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const { updateStickerText, getSVGElements, extractNames } = useWeddingStickerUpdater()
const { applyRetouch } = useImageRetouch()
const { calculateDimensions, resizeSVG, validateForExport, PRINT_DPI, SCREEN_DPI } = useDynamicSVG()


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

// Retouch state
const isRetouching = ref(false)

// Toggle for image editing controls
const showImageControls = ref(false)

// Chat footer states
const showUploadOptions = ref(false)

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
  LIGHT_BG_COLORS,
  DARK_BG_COLORS,
  RED_GOLD_BG_COLORS,
} = useBackgroundManager({
  weddingPreviewContainer,
  chatPreviewContainer: chatPreviewContainer as Ref<HTMLElement | HTMLElement[] | null>,
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
}, { immediate: true })

const showMenu = ref(false)
// Wedding is pre-selected as the only category
const selectedCategory = ref<string | null>('wedding')
const lastFormScrollPosition = ref(0)
const previewUrl = ref('')
const isGenerating = ref(false)
const viewMode = ref<'form' | 'preview'>('form')

// Wedding warning banner state
const showWeddingStickerPreview = ref(false)
const isGeneratingPreview = ref(false)
const generatingStep = ref(0) // Track current step: 1=Preparing, 2=Applying design, 3=Processing image, 4=Final touches
const isDescriptionVisible = ref(true)
const showEditModal = ref(false)

// Token deduction tracking
const hasDesignBeenGenerated = ref(false) // Track if initial design was generated (15 tokens)
const TOKEN_COST_GENERATE_DESIGN = 15
const TOKEN_COST_EDIT_TEXT = 5 // Name, date, courtesy, title changes
const TOKEN_COST_CHANGE_BACKGROUND = 10

// Generating message for loading animation
const generatingMessages = [
  'Creating your beautiful design...',
  'Preparing your wedding sticker...',
  'Adding the finishing touches...',
  'Almost there...',
  'Making it perfect for you...'
]
const generatingMessage = ref(generatingMessages[0])
let generatingMessageInterval: ReturnType<typeof setInterval> | null = null

// Cycle through generating messages
function startGeneratingMessages() {
  let index = 0
  generatingMessage.value = generatingMessages[0]
  generatingMessageInterval = setInterval(() => {
    index = (index + 1) % generatingMessages.length
    generatingMessage.value = generatingMessages[index]
  }, 2000)
}

function stopGeneratingMessages() {
  if (generatingMessageInterval) {
    clearInterval(generatingMessageInterval)
    generatingMessageInterval = null
  }
}

// Helper to format message text (convert markdown-like syntax to HTML)
function formatMessageText(text: string): string {
  if (!text) return ''
  // Convert **text** to bold
  let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, '<br>')
  return formatted
}

// Handle action button clicks in messages
function handleMessageAction(action: { type: string; label?: string; route?: string }) {
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
      // Trigger image upload (used by useWeddingChat composable)
      triggerImageUpload()
      break
    case 'generate_preview':
    case 'generate':
      // Generate the sticker (used by useWeddingChat composable)
      requestWeddingPreviewGeneration()
      break
    default:
      break
  }
}

function hasConfirmedWeddingSize(): boolean {
  const size = String((extractedInfo as any)?.value?.size ?? '').trim()
  return !!(sizeStepComplete as any)?.value || !!size
}

function promptForWeddingSize(): void {
  if ((awaitingSizeDecision as any)?.value) return
  ;(awaitingSizeDecision as any).value = true
  ;(isAnalyzing as any).value = false

  ;(chatMessages as any).value.push({
    id: Date.now(),
    text: "What size would you like the sticker? (e.g., '3x3' or type 'default' for 4x4 inches)",
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

function setWeddingSize(sizeRaw: string): void {
  const normalized = String(sizeRaw ?? '').trim()
  ;(extractedInfo as any).value.size = normalized || null
  ;(formData as any).customSize = normalized
  ;(sizeStepComplete as any).value = !!normalized
  ;(awaitingSizeDecision as any).value = false

  // Keep chat summary in sync
  try {
    syncWeddingDescriptionFromState()
  } catch {
    // no-op
  }

  // If preview already exists, apply the resize immediately.
  if ((showWeddingStickerPreview as any)?.value) {
    const parsed = parseSizeToInches(normalized)
    if (parsed) {
      handleSizeChange(parsed.w, parsed.h)
    }
  }
}

function requestWeddingPreviewGeneration(): void {
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

// Handle generate more - regenerate with new random background and update all previews
async function handleGenerateMore() {
  // Add a message to chat
  chatMessages.value.push({
    id: Date.now(),
    text: "Generate another design",
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  
  // Show loading state
  isGeneratingPreview.value = true
  generatingMessage.value = 'Creating a fresh design...'
  
  // Apply a new random background
  const newBackground = getRandomBackground()
  if (newBackground) {
    await new Promise(resolve => setTimeout(resolve, 500))
    generatingMessage.value = 'Applying new style...'
    
    await applyNewBackground(newBackground)
    
    await new Promise(resolve => setTimeout(resolve, 300))
    generatingMessage.value = 'Updating preview...'
    
    // Wait for DOM to update
    await nextTick()
    await nextTick()
    
    // Update all existing preview containers
    updateChatPreviewSVG()
    
    // Hide loading and add confirmation message
    isGeneratingPreview.value = false
    
    chatMessages.value.push({
      id: Date.now() + 1,
      text: "Here's a new design variation! ?? Like this one better?",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    scrollToBottom()
  } else {
    isGeneratingPreview.value = false
  }
}

// Handle generate new - updates ALL existing previews with new design
async function handleGenerateNew() {
  // Show generating state with professional loading
  isGeneratingPreview.value = true
  generatingMessage.value = 'Creating new design...'
  
  // Apply a new random background
  const newBackground = getRandomBackground()
  if (newBackground) {
    // Simulate professional generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Update generating message
    generatingMessage.value = 'Applying new style...'
    
    // Apply the new background to the master SVG
    await applyNewBackground(newBackground)
    
    // Another short delay for polish
    await new Promise(resolve => setTimeout(resolve, 400))
    generatingMessage.value = 'Finalizing design...'
    
    // Wait for DOM to update
    await nextTick()
    await nextTick()
    
    // Small delay for render
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // UPDATE ALL EXISTING preview containers with the new design
    if (weddingPreviewContainer.value) {
      const masterSvg = weddingPreviewContainer.value.querySelector('svg')
      if (masterSvg) {
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        // Update ALL preview containers with the new design
        previewContainers.forEach((container) => {
          if (container) {
            // Remove any existing SVG or loading placeholder
            const existingSvg = container.querySelector('svg')
            if (existingSvg) existingSvg.remove()
            
            const loadingPlaceholder = container.querySelector('.preview-loading-placeholder')
            if (loadingPlaceholder) loadingPlaceholder.remove()
            
            // Clone the master SVG
            const clonedSvg = masterSvg.cloneNode(true) as SVGSVGElement
            
            // Get viewBox to calculate aspect ratio
            const viewBox = clonedSvg.getAttribute('viewBox')
            if (viewBox) {
              const parts = viewBox.split(/\s+|,/)
              if (parts.length >= 4) {
                const vbWidth = parseFloat(parts[2])
                const vbHeight = parseFloat(parts[3])
                const aspectRatio = vbWidth / vbHeight
                container.style.aspectRatio = String(aspectRatio)
              }
            }
            
            // Style the cloned SVG
            clonedSvg.style.display = 'block'
            clonedSvg.style.width = '100%'
            clonedSvg.style.maxWidth = '100%'
            clonedSvg.style.height = 'auto'
            clonedSvg.removeAttribute('width')
            clonedSvg.removeAttribute('height')
            
            // Append to container
            container.appendChild(clonedSvg)
          }
        })
      }
    }
    
    // Add a brief message about the updated design
    chatMessages.value.push({
      id: Date.now(),
      text: "Your design has been updated with a fresh new look! ???",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    // Hide generating state
    isGeneratingPreview.value = false
  } else {
    // No new background available
    isGeneratingPreview.value = false
  }
  
  // Scroll to see the result
  scrollToBottom()
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
  // Update extracted info
  extractedInfo.value.names.name1 = data.name1 || null
  extractedInfo.value.names.name2 = data.name2 || null
  extractedInfo.value.date = data.date || null
  extractedInfo.value.courtesy = data.courtesy || null
  customHeading.value = data.heading || null
  
  // Rebuild description from parts
  // Use brackets for names so extractNames in useWeddingStickerUpdater can detect them
  // and trigger the decorative SVG system with proper fonts
  const parts: string[] = []
  if (data.heading) parts.push(data.heading)
  if (data.name1 && data.name2) {
    parts.push(`(${data.name1} & ${data.name2})`)  // Use brackets for extractNames to detect
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
    preGeneratedImageInput.value?.click()
  }
}

// Voice functions now come from useSpeechToText composable:
// - toggleVoiceInput, stopVoiceRecording, stopVoiceRecordingAndSend
// - checkIfMobile, toggleVoice, speakMessage, stopAllSpeech
// - isRecording, isVoiceEnabled, isMobileDevice, interimTranscript

// AI Chat handler
function handleChatClick() {
  authStore.showNotification({
    title: 'AI Assistant',
    message: 'Coming Soon! Our AI assistant will help you create amazing designs.',
    type: 'info'
  })
}

async function generateWeddingPreview() {
  // Check if user is logged in FIRST before doing anything else
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    authStore.showNotification({
      title: 'Login Required',
      message: 'Please login or create an account to generate designs.',
      type: 'info'
    })
    chatMessages.value.push({
      id: Date.now(),
      text: "Hold on!\n\nYou need to login or create a free account to generate your design.\n\nWhy sign up?\n💎 Get 100 FREE tokens instantly!\n💾 Save and download your designs\n🎨 Access premium features",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'login', label: 'Login to Continue', variant: 'primary' }
      ]
    })
    scrollToBottom()
    return
  }

  // Chat flow often builds `accumulatedDescription`; prefer that if form input is empty.
  const resolvedDescription = (formData.description || '').trim() || (accumulatedDescription.value || '').trim()

  if (!resolvedDescription) {
    chatMessages.value.push({
      id: Date.now(),
      text: "Please provide your details first.\n\nExample:\n(John & Mary) 8th March 2025 courtesy: Smith family",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // Keep both in sync so downstream logic always reads the same thing.
  formData.description = resolvedDescription
  accumulatedDescription.value = resolvedDescription

  // Require size confirmation before generating.
  if (!hasConfirmedWeddingSize()) {
    promptForWeddingSize()
    return
  }

  // Check requirements: Must have names OR a picture
  const { name1, name2 } = extractNames(formData.description)
  const hasNames = !!(name1 || name2)
  const hasPicture = !!preGeneratedImageFile.value

  if (!hasNames && !hasPicture) {
    authStore.showNotification({
      title: 'Missing Information',
      message: 'Please include at least a Name in the description or upload a Picture to generate the preview.',
      type: 'info'
    })
    
    // Ensure validation warnings are shown
    const data = await updateStickerText(formData.description, {} as any)
    updateValidationWarnings(data)
    
    return
  }

  // Deduct tokens for initial design generation (15 tokens) if not already generated
  if (!hasDesignBeenGenerated.value) {
    const canProceed = await deductTokensForAction(TOKEN_COST_GENERATE_DESIGN, 'Generate initial design')
    if (!canProceed) {
      return // Stop if token deduction failed
    }
    hasDesignBeenGenerated.value = true // Mark as generated to prevent double-charging
  }

  isGeneratingPreview.value = true
  generatingStep.value = 1 // Step 1: Preparing text
  startGeneratingMessages() // Start cycling through loading messages
  showWeddingStickerPreview.value = true // Ensure container exists in DOM (even if hidden)

  try {
    // Ensure backgrounds list is loaded before selecting/persisting.
    await loadWeddingBackgroundManifest()

    // Wait for DOM to create the container element
    await nextTick()
    await nextTick() // Double nextTick to ensure Vue has fully rendered the component
    
    // Brief delay for "AI processing" feel - gives time for components to initialize
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    generatingStep.value = 2 // Step 2: Applying design
    
    // Apply custom size FIRST if specified (CRITICAL: This prevents stretching by adjusting viewBox)
    // Size must be applied before background so background matches new dimensions
    if (formData.customSize) {
       const sizeMatch = formData.customSize.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)/i)
       if (sizeMatch) {
          const w = parseFloat(sizeMatch[1])
          const h = parseFloat(sizeMatch[2])
          
          // Ensure container is available before resizing
          if (weddingPreviewContainer.value) {
            await handleSizeChange(w, h)
          }
       }
    }

    // CRITICAL: Choose background FIRST so title knows what color to use.
    // Best practice: random once, then persist per user so refresh doesn't change it.
    const persisted = getPersistedWeddingBackground()
    const initialBackground =
      persisted && availableBackgrounds.value.includes(persisted) ? persisted : getRandomBackground()
    if (initialBackground) {
      currentBackgroundFileName.value = initialBackground
      setPersistedWeddingBackground(initialBackground)
    }
    
    // Now load the template - title will use the correct color based on pre-selected background
    await loadWeddingStickerTemplate()
    
    // Process the description to update the SVG with names, date, courtesy
    await processDescriptionInput()

    // Apply the background image (already selected above)
    if (initialBackground) {
      await applyNewBackground(initialBackground)
      
      // Wait for background image to fully load before continuing
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Clear the input field now that we've processed the description
    formData.description = ''

    // Handle pre-uploaded image if exists
    if (preGeneratedImageFile.value) {
      generatingStep.value = 3 // Step 3: Processing image
      await nextTick() // Ensure DOM is ready
      
      if (!weddingPreviewContainer.value) {
        return
      }
      
      const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
      if (svgElement) {
        let fileToProcess = preGeneratedImageFile.value

        // Remove background if requested
        if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
          try {
            const result = await removeBackground(fileToProcess, {
              quality: 'high',
              outputFormat: 'image/png',
              maxDimensions: 2048
            })
            
            fileToProcess = new File([result.blob], fileToProcess.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png',
              lastModified: Date.now()
            })
          } catch (error) {
            // Continue with original image if background removal fails
          }
        }

        // Add image to SVG
        const addedImage = await svgImageManager.addImage(fileToProcess, svgElement)
        
        updateSVGWithImages()
        
        // Wait for DOM to update after image is applied
        await nextTick()
        
        // Additional delay to ensure image is fully rendered
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Ensure correct z-order: user image should be AFTER background image in DOM
        const imgElement = svgElement.querySelector('#userImage, #placeholder-image') as SVGImageElement
        if (imgElement) {
          // CRITICAL FIX: Ensure user image is positioned AFTER background image in DOM
          const bgImage = svgElement.querySelector('#background-image')
          if (bgImage && bgImage.parentNode === imgElement.parentNode) {
            // Check if userImage comes before background-image (wrong order)
            const children = Array.from(svgElement.children)
            const bgIndex = children.indexOf(bgImage)
            const userIndex = children.indexOf(imgElement)
            if (userIndex < bgIndex) {
              // Move userImage after background-image
              bgImage.after(imgElement)
            }
          }
          
          // Ensure opacity is set to 1
          if (!imgElement.getAttribute('opacity') || imgElement.getAttribute('opacity') === '0') {
            imgElement.setAttribute('opacity', '1')
          }
          
          // CRITICAL FIX: If href is still empty, directly set from svgImageManager
          const currentHref = imgElement.getAttribute('href')
          if (!currentHref || currentHref === '') {
            const latestImage = svgImageManager.images.value[svgImageManager.images.value.length - 1]
            if (latestImage?.dataUrl) {
              imgElement.setAttribute('href', latestImage.dataUrl)
              imgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', latestImage.dataUrl)
            }
          }
        }
      }
    }
    
    // Check for warnings to show appropriate notification
    generatingStep.value = 4 // Step 4: Final touches
    if (validationWarnings.value.length > 0) {
      authStore.showNotification({
        title: 'Preview Generated',
        message: 'Preview ready, but some details are missing. Please check the warnings below.',
        type: 'info'
      })
    } else {
      // Only show success notification if it's the first generation
      // or if we are not in a "silent update" mode
      if (!showWeddingStickerPreview.value) {
        authStore.showNotification({
          title: 'Preview Generated',
          message: 'Your wedding sticker preview is ready!',
          type: 'success'
        })
      }
    }
    
    // Hide description field on success
    isDescriptionVisible.value = false
    
    // CRITICAL: Ensure preview flag is true to show Download/Edit buttons
    showWeddingStickerPreview.value = true
    
    // Add the preview message to the chat history
    chatMessages.value.push({
      id: Date.now(),
      text: '',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'preview'
    })

    // Add guidance message
    chatMessages.value.push({
      id: Date.now() + 1,
      text: "Your design is ready! Looking great! 🎉\n\n💡 **Tip:** You can drag the image to reposition it. Click 'Edit' for more options!",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    // Ensure SVG is visible and properly rendered
    await nextTick()
    await nextTick() // Double nextTick for chat container
    
    // Additional delay to ensure all images and elements are fully rendered
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Copy the SVG from main container to chat container
    // Note: chatPreviewContainer is an array because it's in a v-for loop
    if (weddingPreviewContainer.value) {
      const svgElement = weddingPreviewContainer.value.querySelector('svg')
      
      if (svgElement) {
        // Get the last preview container (the one we just added)
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        const targetContainer = previewContainers[previewContainers.length - 1]
        
        if (targetContainer) {
          // Clone the SVG and insert it into the chat preview
          const clonedSVG = svgElement.cloneNode(true) as SVGSVGElement
          
          // Get viewBox to calculate aspect ratio for proper preview frame
          const viewBox = clonedSVG.getAttribute('viewBox')
          if (viewBox) {
            const parts = viewBox.split(/\s+|,/)
            if (parts.length >= 4) {
              const vbWidth = parseFloat(parts[2])
              const vbHeight = parseFloat(parts[3])
              const aspectRatio = vbWidth / vbHeight
              
              // Set container aspect ratio to match SVG design
              targetContainer.style.aspectRatio = String(aspectRatio)
            }
          }
          
          // Ensure cloned SVG has proper display styles
          clonedSVG.style.display = 'block'
          clonedSVG.style.width = '100%'
          clonedSVG.style.maxWidth = '100%'
          clonedSVG.style.height = 'auto'
          // Remove fixed width/height attributes so it scales with container
          clonedSVG.removeAttribute('width')
          clonedSVG.removeAttribute('height')
          
          targetContainer.innerHTML = ''
          targetContainer.appendChild(clonedSVG)
          
          // Verify the SVG was actually added
          if (!targetContainer.querySelector('svg')) {
            // Try again with a small delay
            await new Promise(resolve => setTimeout(resolve, 50))
            targetContainer.appendChild(clonedSVG.cloneNode(true))
          }
          
          // Attach drag/pinch handlers to images in cloned SVG
          const imageElements = clonedSVG.querySelectorAll('image')
          imageElements.forEach((imgEl) => {
            imgEl.removeAttribute('data-draggable')
            const imageId = imgEl.getAttribute('data-image-id') || imgEl.id || 'user-image-1'
            if (imageId) {
              makeSVGImageDraggable(imgEl as SVGImageElement, imageId)
            }
          })
          
          void targetContainer.offsetHeight
        }
      } else {
        // Show fallback if SVG not found
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        const targetContainer = previewContainers[previewContainers.length - 1]
        
        if (targetContainer) {
          targetContainer.innerHTML = `
            <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#fee"/>
              <text x="50%" y="45%" text-anchor="middle" font-size="16" fill="#c00">SVG Failed to Load</text>
              <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#666">Please try again</text>
            </svg>
          `
        }
      }
    }
    
    // Scroll to bottom to show the generated SVG
    scrollToBottom()
    
  } catch (error) {
    // Reset state on error so user can try again
    showWeddingStickerPreview.value = false
    
    authStore.showNotification({
      title: 'Generation Failed',
      message: 'Something went wrong. Please try again.',
      type: 'error'
    })
  } finally {
    isGeneratingPreview.value = false
    generatingStep.value = 0
    stopGeneratingMessages()
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
}

// Image crop modal state
const showCropModal = ref(false)
const cropImageSrc = ref('')
const cropImageFile = ref<File | null>(null)
const isPreGenerationCrop = ref(false)

// Upload modal state
const showUploadModal = ref(false)
const modalFileInput = ref<HTMLInputElement | null>(null)
const uploadModalProcessing = ref(false)
const uploadModalProgress = ref(0)
const uploadModalStatusText = ref('Preparing...')
const uploadModalSuccess = ref(false)

// Pre-generation image upload state
const preGeneratedImageFile = ref<File | null>(null)
const preGeneratedImagePreview = ref<string | null>(null)
const preGeneratedImageInput = ref<HTMLInputElement | null>(null)

// Extraction utilities imported from composables:
// capitalizeWords, escapeRegExp, extractNamesFromResponse, extractDateFromText,
// extractCourtesyFromText, extractSizeFromText, extractNamesFromBrackets, parseAllInOneMessage

// Track image uploads - wrapper for extracted utility
function trackImageUpload(file: File) {
  trackImageUploadUtil(file, {
    chatMessages,
    uploadedImages,
    lastUploadedImage,
    awaitingImageChoice,
    awaitingImageUpdateConfirmation,
    pendingImageFile,
    showWeddingStickerPreview,
    scrollToBottom
  })
}

// Handle multiple image uploads - wrapper (logic is in trackImageUploadUtil)
function handleMultipleImageUploads() {
  handleMultipleImageUploadsUtil({
    chatMessages,
    uploadedImages,
    lastUploadedImage,
    awaitingImageChoice,
    awaitingImageUpdateConfirmation,
    pendingImageFile,
    showWeddingStickerPreview,
    scrollToBottom
  })
}

// Smart Camera Handler
function handleDescriptionUpdate(newText: string) {
  formData.description = newText
  // Trigger the input handler to update the preview immediately
  handleDescriptionInput()
}

// Background removal state
const autoRemoveBackground = ref(false)
const backgroundRemovalError = ref<string | null>(null)

// Lottie animation - loaded from external file for cleaner code
const loadingAnimation = ref<object | null>(null)
fetch('/animations/loading-circle.json')
  .then(res => res.json())
  .then(data => { loadingAnimation.value = data })
  .catch(() => { /* Fallback handled in template */ })

const categories = [
  { id: 'wedding', name: 'Wedding', icon: '??', gradient: 'linear-gradient(135deg, #f093fb 0%, #a855f7 100%)' }
]

const formData = reactive({
  description: '',
  removeBackground: false,
  useColorPicker: false,
  backgroundColor: '#ffffff',
  customSize: '4x4',
  svgWidth: 400,
  svgHeight: 400
})

// Separate chat input state to prevent real-time SVG updates during chat
const chatInputText = ref('')

// Chat Logic for Wedding Category
const chatMessages = ref<Array<{ 
  id: number; 
  text: string; 
  sender: 'user' | 'ai'; 
  time: string; 
  image?: string; 
  type?: 'text' | 'preview'; 
  isLoading?: boolean;
  actions?: Array<{ type: string; label: string; icon?: string; variant?: 'primary' | 'secondary' }>;
}>>([])
const isAnalyzing = ref(false)

// showChatHelp - displays help message in chat
function showChatHelp() {
  const helpText = "Let me show you how it works!\n\n1. Type your details or upload a picture\n2. Use two fingers to resize images on mobile\n3. Click the voice icon to hear me speak!\n\nIt's easy! Let's go!"

  chatMessages.value.push({
    id: Date.now(),
    text: helpText,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

// Setup auto-speak watcher for AI messages (using composable)
onMounted(() => {
  setupAutoSpeakWatcher()
  initializeVoice()
})


const accumulatedDescription = ref('')
const awaitingPictureDecision = ref(false)
const awaitingSizeDecision = ref(false)
const pictureStepComplete = ref(false)
const sizeStepComplete = ref(false)
const awaitingBackgroundRemovalDecision = ref(false)
const awaitingImageUpdateConfirmation = ref(false)
const pendingImageFile = ref<File | null>(null)
const backgroundRemovalAlreadyHandled = ref(false) // Track if BG removal was already processed for current image

// Enhanced AI state management
const awaitingNameInput = ref(false)
const awaitingImageChoice = ref(false)
const uploadedImages = ref<Array<{ file: File; timestamp: number; used: boolean }>>([])
const lastUploadedImage = ref<File | null>(null)
const nameExtractionAttempts = ref(0)

// Custom heading and font state
const awaitingHeadingInput = ref(false)
const awaitingFontChoice = ref(false)
const customHeading = ref<string | null>(null)
const selectedHeadingFont = ref<'playfair' | 'lato' | null>(null)
const headingStepComplete = ref(false)
const awaitingTitleConfirmation = ref(false)
const pendingTitle = ref<string | null>(null)

// Track extracted information to prevent re-asking
// Note: title is synced with customHeading for useWeddingChat composable compatibility
const extractedInfo = ref({
  title: null as string | null,  // Synced with customHeading
  date: null as string | null,
  courtesy: null as string | null,
  size: null as string | null,
  names: { name1: null as string | null, name2: null as string | null }
})

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

// ============================================================================
// WEDDING CHAT COMPOSABLE - Handles title/names/date/courtesy detection
// ============================================================================
// Forward declaration - will be initialized after scrollToBottom is defined
let weddingChatProcessor: ReturnType<typeof useWeddingChat> | null = null

// ============================================================================
// PROGRESS STATE - Track what info has been collected for visual feedback
// ============================================================================
const progressState = computed(() => ({
  hasNames: !!(extractedInfo.value.names.name1 || extractedInfo.value.names.name2),
  hasDate: !!extractedInfo.value.date,
  hasCourtesy: !!extractedInfo.value.courtesy,
  hasPhoto: !!preGeneratedImageFile.value || svgImageManager.images.value.length > 0
}))

// ============================================================================
// SMART AI STATE - Track what questions have been asked to prevent repetition
// ============================================================================
const askedQuestions = ref({
  picture: false,
  size: false,
  backgroundRemoval: false,
  heading: false,
  names: false,
  date: false,
  courtesy: false
})

// Reset asked questions - wrapper for extracted utility
function resetAskedQuestions() {
  resetAskedQuestionsUtil(askedQuestions)
}

// Handle example usage from welcome screen
function handleUseExample(text: string) {
  if (text) {
    chatInputText.value = text
    // Auto-send the example
    setTimeout(() => {
      sendMessage()
    }, 100)
  } else {
    // Empty text means "upload photo" - trigger file input
    triggerImageUpload()
  }
}

// State for smart updates (post-generation)
const awaitingDateChange = ref(false)
const awaitingCourtesyChange = ref(false)
const pendingDateUpdate = ref<string | null>(null)
const pendingCourtesyUpdate = ref<string | null>(null)

// State for "generate another" background loading
const isGeneratingNewBackground = ref(false)

// State for courtesy input when AI asks
const awaitingCourtesyInput = ref(false)
const pendingCourtesyText = ref<string | null>(null) // Stores what user typed when we ask for confirmation

// ============================================================================
// AI UTILITIES - Now imported from composables:
// - aiResponseHelper: Response templates
// - titlePatterns, titlePhraseMap, isPotentialTitle, extractTitleFromText: Title detection
// - extractNamesFromBrackets, parseAllInOneMessage: Extraction utilities
// ============================================================================

const scrollToBottom = () => {
  // Use the component's scrollToBottom method if available
  if (weddingChatMessagesRef.value?.scrollToBottom) {
    weddingChatMessagesRef.value.scrollToBottom()
  } else {
    // Fallback for direct access
    nextTick(() => {
      if (chatHistoryContainer.value) {
        chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
      }
    })
  }
}

// ============================================================================
// SPEECH-TO-TEXT & TTS - Using composable (replaces ~400 lines of inline code)
// ============================================================================
// Forward reference for sendMessage - will be defined later but needed by speech composable
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
  awaitingPictureDecision: awaitingImageChoice,
  awaitingSizeDecision,
  onGenerate: () => requestWeddingPreviewGeneration(),
  onScrollToBottom: scrollToBottom,
  onUploadPicture: () => triggerImageUpload(),
  onSetSize: (size: string) => setWeddingSize(size),
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
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // No extraction - ask for info
  isAnalyzing.value = false
  const hasName = !!extractedInfo.value.names.name1
  const hasDate = !!extractedInfo.value.date
  const missing: string[] = []
  if (!hasName) missing.push('names')
  if (!hasDate) missing.push('date')

  const responseText = missing.length > 0
    ? `Please share the ${missing.join(', ')} for your wedding sticker.`
    : 'I have all your details! Would you like to generate your wedding sticker?'

  chatMessages.value.push({
    id: Date.now(),
    text: responseText,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
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

  isAnalyzing.value = true
  debouncedAnalyzeMessage(text)
}

// Connect the sendMessage wrapper for speech composable
_sendMessageRef = sendMessage

// Debounced version of analyzeMessage for performance
const debouncedAnalyzeMessage = useDebounceFn(async (text: string) => {
  await analyzeMessage(text)
}, 250, { maxWait: 1500 })

// Throttled scroll for smoother performance
const throttledScrollToBottom = useThrottleFn(() => {
  if (weddingChatMessagesRef.value?.scrollToBottom) {
    weddingChatMessagesRef.value.scrollToBottom()
  } else if (chatHistoryContainer.value) {
    chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
  }
}, 100)

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
  if (selectedCategory.value === 'wedding') {
    // Always use sendMessage for wedding chat - it handles both initial generation and post-generation messages
    sendMessage()
  } else {
    // Fallback for other categories if they use this button
    generateDesign()
  }
}

const imageSlots = ref<Array<{ file: File; preview: string } | null>>([
  null
])

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
  // Load category-specific template
  loadCategoryTemplate(categoryId)
}

function loadCategoryTemplate(categoryId: string) {
  // Load template based on category
  // TODO: Integrate with template system
}

function handleImageUpload(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageSlots.value[index] = {
        file,
        preview: e.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

function removeImage(index: number) {
  imageSlots.value.splice(index, 1)
  // Ensure at least one slot remains
  if (imageSlots.value.length === 0) {
    imageSlots.value.push(null)
  }
}

function addImageSlot() {
  imageSlots.value.push(null)
}

async function generateDesign() {
  try {
    // Validate
    if (!formData.description) {
      authStore.showNotification({
        title: 'Validation Error',
        message: 'Please enter a description',
        type: 'error'
      })
      return
    }

    // Remember scroll position before switching view
    lastFormScrollPosition.value = window.scrollY || window.pageYOffset || 0

    // Switch to preview mode and start generating
    viewMode.value = 'preview'
    isGenerating.value = true

    // Prepare form data
    const uploadedImages = imageSlots.value.filter((slot): slot is { file: File; preview: string } => slot !== null)

    // Set category in store
    autoDesignStore.setCategory('sticker')

    // Update form data
    autoDesignStore.updateFormData('text.description', formData.description)
    autoDesignStore.updateFormData('options.removeBackground', formData.removeBackground)
    autoDesignStore.updateFormData('options.backgroundColor', formData.backgroundColor)
    autoDesignStore.updateFormData('size', formData.customSize)

    // Upload images
    for (const imageSlot of uploadedImages) {
      autoDesignStore.uploadedFiles.images.push(imageSlot.file)
    }

    // Generate design
    await autoDesignStore.generateDesign()

    // Show preview
    if (autoDesignStore.currentProject?.design?.previewUrl) {
      previewUrl.value = autoDesignStore.currentProject.design.previewUrl
    }

    authStore.showNotification({
      title: 'Success',
      message: 'Sticker design generated successfully!',
      type: 'success'
    })

  } catch (error: any) {
    authStore.showNotification({
      title: 'Generation Failed',
      message: error.message || 'Failed to generate sticker design',
      type: 'error'
    })
    viewMode.value = 'form'
  } finally {
    isGenerating.value = false
  }
}

function backToForm() {
  viewMode.value = 'form'
  nextTick(() => {
    window.scrollTo({ top: lastFormScrollPosition.value, behavior: 'smooth' })
  })
}

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return ''
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : categoryId
}

// Reset ALL wedding-related state - wrapper for extracted utility
function resetWeddingState() {
  resetWeddingStateUtil({
    extractedInfo,
    customHeading,
    selectedHeadingFont,
    headingStepComplete,
    awaitingTitleConfirmation,
    pendingTitle,
    awaitingHeadingInput,
    awaitingFontChoice,
    accumulatedDescription,
    formData,
    sizeStepComplete,
    awaitingSizeDecision,
    chatMessages,
    preGeneratedImageFile,
    preGeneratedImagePreview,
    pendingImageFile,
    awaitingBackgroundRemovalDecision,
    uploadedImages,
    lastUploadedImage,
    hasDesignBeenGenerated,
    showWeddingStickerPreview,
    isGeneratingPreview,
    isAnalyzing,
    askedQuestions,
    svgImageManager
  })
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

// Wedding Sticker Functions
async function loadWeddingStickerTemplate() {
  if (!weddingPreviewContainer.value) {
    return
  }

  try {
    // Reset replacement state when loading new template
    resetReplacement()

    // Load SVG template from external file
    const response = await fetch('/templates/wedding-sticker-base.svg')
    const svgText = await response.text()

    // Insert SVG into container
    weddingPreviewContainer.value.innerHTML = svgText
    
    // Force immediate DOM update
    await nextTick()
    await nextTick() // Double nextTick to ensure Vue has fully updated
    
    // Force a reflow to ensure the browser has rendered
    if (weddingPreviewContainer.value) {
      void weddingPreviewContainer.value.offsetHeight
    }

    // Get SVG element and its text elements
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    
    if (!svgElement) {
      return
    }
    
    if (svgElement) {
      // Set responsive dimensions based on viewBox aspect ratio
      const viewBox = svgElement.getAttribute('viewBox')
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(Number)
        if (parts.length >= 4) {
          svgElement.setAttribute('width', '100%')
          svgElement.removeAttribute('height')
          svgElement.setAttribute('data-original-viewbox', viewBox)
        }
      } else if (!svgElement.hasAttribute('viewBox')) {
        const width = svgElement.getAttribute('width') || '2996.9'
        const height = svgElement.getAttribute('height') || '1685.75'
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
      }

      svgElements = getSVGElements(svgElement)

      // Use Title Library to find matching title SVG based on description or custom heading
      const textToMatch = customHeading.value || accumulatedDescription.value || formData.description || 'wedding'
      const matchedTitle = findMatchingTitle(textToMatch)
      
      try {
        // Get title color based on current background
        const titleColor = getTitleColorForBackground()
        
        if (matchedTitle) {
          await replaceTitleWithImage(svgElement, {
            svgPath: matchedTitle.svgPath,
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
            scale: matchedTitle.scale || 1.0,
            color: titleColor
          })
        } else {
          await replaceTitleWithImage(svgElement, {
            svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: { x: -30, y: 50, width: 1800, height: 900 },
            scale: 1.0,
            color: titleColor
          })
        }
        
        // Insert flourish above names with matching color
        const flourishColor = getFlourishColorForBackground()
        await insertFlourishAboveNames(svgElement, flourishColor)
      } catch (handleReplacementError) {
        // Continue without title replacement
      }

      // Apply current description if any (for names, date, etc.)
      if (formData.description) {
        await handleNamesWithTitleSVG(formData.description, svgElements)
      }
    }
  } catch (error) {
    authStore.showNotification({
      title: 'Template Load Failed',
      message: 'Failed to load wedding sticker template.',
      type: 'error'
    })
  }
}

// State to track crop context.
// const isPreGenerationCrop = ref(false)

// Helper function to update only date and courtesy (not names) when title SVG is active
function updateDateAndCourtesy(description: string, svgElements: any) {
  updateDateAndCourtesyUtil(description, svgElements)
}

// Helper function to handle names when title SVG is active (use decorative name02.svg)
async function handleNamesWithTitleSVG(description: string, svgElements: any) {
  const safeDescription = typeof description === 'string' ? description : String(description || '')
  const data = await updateStickerText(safeDescription, svgElements)
  return data
}

// Auto-completion handler for description field
function handleDescriptionKeydown(event: KeyboardEvent) {
  handleDescriptionKeydownUtil(event, formData.description, (val) => { formData.description = val })
}

// Debounced input handler to prevent UI freezing during typing
const handleDescriptionInput = useDebounceFn(() => {
  processDescriptionInput()
}, 50)

// Cache keys to avoid expensive re-renders during real-time updates
let lastWeddingTitleRenderKey = ''
let lastWeddingFlourishRenderKey = ''

/**
 * Apply custom heading and font to the SVG heading elements
 */
function applyCustomHeadingAndFont(svgElement: SVGSVGElement) {
  if (!customHeading.value && !selectedHeadingFont.value) return
  applyCustomHeadingUtil(svgElement, customHeading.value)
  applyHeadingFontUtil(svgElement, selectedHeadingFont.value)
}

async function processDescriptionInput() {
  // Perform validation even if SVG elements are not loaded yet
  if (selectedCategory.value === 'wedding' && !svgElements) {
    // Pass null elements structure to avoid errors while validating
    const stickerData = await updateStickerText(formData.description, getSVGElements(null))
    updateValidationWarnings(stickerData)
  }
  
  // Update wedding sticker preview in real-time
  if (selectedCategory.value === 'wedding' && svgElements) {
    // Handle SVG text replacement for title graphic
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      let stickerData: any = null

      // Use Title Library to find matching title SVG
      const customHeadingText = (customHeading.value ?? '').trim()
      const textToMatch = customHeadingText || accumulatedDescription.value || formData.description
      const matchedTitle = findMatchingTitle(textToMatch)
      
      // Get title color based on current background
      const titleColor = getTitleColorForBackground()

      const headingElementIds = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']
      const hasCustomHeading = customHeadingText.length > 0

      // If user provided a custom heading, ALWAYS show the editable text heading.
      // Title graphics are only for the default/auto heading flow.
      if (hasCustomHeading) {
        restoreTitleTextElements(svgElement, headingElementIds)
        lastWeddingTitleRenderKey = `text|${customHeadingText}`
      } else {
      
      const desiredTitle = matchedTitle
        ? {
            svgPath: matchedTitle.svgPath,
            fallbackText: matchedTitle.fallbackText,
            position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
            scale: matchedTitle.scale || 1.0
          }
        : {
            svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
            fallbackText: 'Default wedding title',
            position: { x: -30, y: 50, width: 1800, height: 900 },
            scale: 1.0
          }

      const titleCacheKey = [
        desiredTitle.svgPath,
        titleColor,
        desiredTitle.position.x,
        desiredTitle.position.y,
        desiredTitle.position.width,
        desiredTitle.position.height,
        desiredTitle.scale
      ].join('|')

      const hasTitleReplacement = !!svgElement.querySelector('#wedding-title-replacement')
      if (!hasTitleReplacement || titleCacheKey !== lastWeddingTitleRenderKey) {
        lastWeddingTitleRenderKey = titleCacheKey

        if (matchedTitle) {
        // Pre-render SVG to PNG for reliable export (allows color changes)
        await replaceTitleWithImage(svgElement, {
          svgPath: matchedTitle.svgPath,
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
          scale: matchedTitle.scale || 1.0,
          color: titleColor
        })
        } else {
          // No match found - use default wedding title
          await replaceTitleWithImage(svgElement, {
            svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
            targetElementIds: headingElementIds,
            position: { x: -30, y: 50, width: 1800, height: 900 },
            scale: 1.0,
            color: titleColor
          })
        }
      }
      }
      
      // Insert flourish above names with matching color
      const flourishColor = getFlourishColorForBackground()
      const flourishCacheKey = [flourishColor, currentBackgroundFileName.value || ''].join('|')
      const hasFlourish = !!svgElement.querySelector('#wedding-flourish')
      if (!hasFlourish || flourishCacheKey !== lastWeddingFlourishRenderKey) {
        lastWeddingFlourishRenderKey = flourishCacheKey
        await insertFlourishAboveNames(svgElement, flourishColor)
      }
      
      // Update names, date, and courtesy
      stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      
      // Update validation warnings
      if (stickerData) {
        updateValidationWarnings(stickerData)
      }

      // Apply custom heading and font if set
      applyCustomHeadingAndFont(svgElement)
    }
  }

  // Update SVG with embedded images in real-time
  updateSVGWithImages()
}

// SVG Image Management Functions
const selectedSVGImage = computed(() => svgImageManager.getSelectedImage())

function triggerImageFileInput() {
  imageFileInput.value?.click()
}

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

// Image crop modal handlers
async function handleCropComplete(data: { dataUrl: string; blob: Blob; width: number; height: number }) {

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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

      // Check if BG removal was already handled (user said yes and it was processed)
      if (backgroundRemovalAlreadyHandled.value) {
        // BG removal done - use image directly for generation
        preGeneratedImageFile.value = croppedFile
        pictureStepComplete.value = true
        backgroundRemovalAlreadyHandled.value = false // Reset for next image
        pendingImageFile.value = null
        
        setTimeout(() => {
          // Check if we have all info to proceed
          const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
          const hasSize = sizeStepComplete.value || extractedInfo.value.size
          
          if (hasAllInfo && hasSize) {
            // Has everything - generate!
            chatMessages.value.push({
              id: Date.now(),
              text: "Perfect! Your image is ready! Let me create your sticker now! ??",
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            formData.description = accumulatedDescription.value
            setTimeout(() => generateWeddingPreview(), 300)
          } else if (hasAllInfo && !sizeStepComplete.value) {
            // Has names, date, courtesy but needs size
            chatMessages.value.push({
              id: Date.now(),
              text: "Perfect! Your image is ready! ??\n\nWhat size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)",
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            awaitingSizeDecision.value = true
            scrollToBottom()
          } else {
            // Still missing some info
            chatMessages.value.push({
              id: Date.now(),
              text: "Perfect! Your image is ready! ??\n\n?? **Tip:** You can drag the image to reposition it after the design is generated!",
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          awaitingBackgroundRemovalDecision.value = true
        }, 500)
      }
    }
    return
  }

  // Get SVG element to read placeholder position
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
  svgImageManager.clearAllImages()

  // Add the cropped image using the existing image manager
  await svgImageManager.addImage(croppedFile, svgElement)

  // Update SVG preview with new images
  updateSVGWithImages()

  // Clean up
  URL.revokeObjectURL(cropImageSrc.value)
  cropImageSrc.value = ''
  cropImageFile.value = null
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
}

function handleImagePropertyInput(property: string, event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)

  if (selectedSVGImage.value) {
    updateSelectedImageProperty(property, value)
  }
}

function handleAspectRatioToggle(event: Event) {
  const target = event.target as HTMLInputElement
  const checked = target.checked

  if (selectedSVGImage.value) {
    updateSelectedImageProperty('maintainAspectRatio', checked)
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

async function exportWeddingSticker(format: 'svg' | 'png') {
  if (!weddingPreviewContainer.value) {
    authStore.showNotification({
      title: 'Export Error',
      message: 'No sticker to export',
      type: 'error'
    })
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    authStore.showNotification({
      title: 'Export Error',
      message: 'SVG element not found',
      type: 'error'
    })
    return
  }

  try {
    const filename = `wedding-sticker-${new Date().toISOString().split('T')[0]}`

    // Validate SVG is properly configured for export
    const validation = validateForExport(svgElement)

    // Get stored export dimensions (set by handleSizeChange)
    const exportWidthPx = svgElement.getAttribute('data-export-width-px')
    const exportHeightPx = svgElement.getAttribute('data-export-height-px')
    const exportWidth = svgElement.getAttribute('data-export-width')
    const exportHeight = svgElement.getAttribute('data-export-height')
    const originalStyleWidth = svgElement.style.width
    const originalStyleHeight = svgElement.style.height

    // Apply pixel dimensions for canvas export (critical for PNG)
    if (exportWidthPx && exportHeightPx) {
      svgElement.setAttribute('width', exportWidthPx)
      svgElement.setAttribute('height', exportHeightPx)
      // Remove CSS constraints that might interfere with the export canvas sizing
      svgElement.style.width = ''
      svgElement.style.height = ''
    } else if (exportWidth && exportHeight) {
      // Fallback to inch dimensions
      svgElement.setAttribute('width', exportWidth)
      svgElement.setAttribute('height', exportHeight)
      svgElement.style.width = ''
      svgElement.style.height = ''
    } else {
      // No custom size set - calculate from viewBox to preserve aspect ratio
      const viewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
      if (viewBox && viewBox.length >= 4) {
        const vbWidth = viewBox[2]
        const vbHeight = viewBox[3]
        // Calculate high-res export dimensions at 300 DPI equivalent
        const scale = PRINT_DPI / 96
        const calculatedWidth = Math.round(vbWidth * scale)
        const calculatedHeight = Math.round(vbHeight * scale)
        svgElement.setAttribute('width', String(calculatedWidth))
        svgElement.setAttribute('height', String(calculatedHeight))
        svgElement.style.width = ''
        svgElement.style.height = ''
      }
    }

    // Ensure preserveAspectRatio is set for distortion-free export
    if (!svgElement.getAttribute('preserveAspectRatio')) {
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    await exportSVG(svgElement, svgImageManager.images.value, {
      filename: format === 'svg' ? `${filename}.svg` : `${filename}.png`,
      format,
      pngResolution: PRINT_DPI // Use 300 DPI from useDynamicSVG
    })

    // Restore responsive display settings
    if (exportWidthPx || exportWidth) {
      svgElement.setAttribute('width', '100%')
      svgElement.removeAttribute('height')
      svgElement.style.width = originalStyleWidth || '100%'
      svgElement.style.height = originalStyleHeight || 'auto'
    }

    authStore.showNotification({
      title: 'Download Successful',
      message: `Sticker downloaded as ${format.toUpperCase()}`,
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Export Failed',
      message: error instanceof Error ? error.message : 'Failed to export sticker',
      type: 'error'
    })
  }
}

// Watch for category changes to load wedding template
watch(selectedCategory, async (newCategory) => {
  if (newCategory === 'wedding') {
    // Load wedding template
    await nextTick()
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
function closeUploadModal() {
  if (!uploadModalProcessing.value) {
    showUploadModal.value = false
    uploadModalSuccess.value = false
  }
}

function triggerModalFileInput() {
  modalFileInput.value?.click()
}

async function handleModalFileSelect(event: Event) {
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
        
        // If preview is already shown, ask if user wants to use this image
        if (showWeddingStickerPreview.value) {
          awaitingBackgroundRemovalDecision.value = true // Reuse this flag or create a new one? 
          // Actually, let's use a specific flow for this.
          // We can reuse awaitingBackgroundRemovalDecision but the prompt is different.
          
          chatMessages.value.push({
            id: Date.now(),
            text: "New picture! Use this one? (yes/no)",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            image: URL.createObjectURL(file)
          })
          scrollToBottom()

          // We need a way to know we are in "confirm image update" mode.
          // Let's use a new state or piggyback on awaitingBackgroundRemovalDecision with a context check?
          // For simplicity, let's add a new state variable: awaitingImageUpdateConfirmation
          awaitingImageUpdateConfirmation.value = true

        } else {
          // Normal flow (before generation)
          // Ask user about background removal
          awaitingBackgroundRemovalDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: "Great! Picture received! Would you like me to remove the background? Say 'yes' or 'no'!",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
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

// Pre-generation image upload handlers
function triggerPreGeneratedImageInput() {
  preGeneratedImageInput.value?.click()
}

function handlePreGeneratedImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    // Track the image upload for AI management
    trackImageUpload(file)

    // Store the file for after cropping
    pendingImageFile.value = file

    // Open crop modal IMMEDIATELY (before sending to chat)
    // Create image URL for crop modal
    const imageUrl = URL.createObjectURL(file)
    cropImageSrc.value = imageUrl
    cropImageFile.value = file
    isPreGenerationCrop.value = true
    showCropModal.value = true

    // The chat message will be sent AFTER cropping is complete
    // See handleCropComplete for the post-crop flow
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

// Handle crop completion (Updated for Chat)


function removePreGeneratedImage() {
  preGeneratedImageFile.value = null
  if (preGeneratedImagePreview.value) {
    URL.revokeObjectURL(preGeneratedImagePreview.value)
    preGeneratedImagePreview.value = null
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

  // Load wedding template (only category available)
  loadCategoryTemplate('wedding')
  
  nextTick(() => {
    loadWeddingStickerTemplate()
  })
})

// Cleanup on unmount to prevent memory leaks and improve navigation speed
onBeforeUnmount(() => {
  // Stop any ongoing speech synthesis immediately
  try {
    window.speechSynthesis?.cancel()
  } catch (e) {}
  
  // Stop speech recognition
  try {
    speechRecognition.value?.stop()
  } catch (e) {}
  speechRecognition.value = null
  
  // Clear intervals and timeouts
  stopGeneratingMessages()
  if (speakTimeout) {
    clearTimeout(speakTimeout)
    speakTimeout = null
  }
  
  // Revoke any object URLs
  if (preGeneratedImagePreview.value) {
    URL.revokeObjectURL(preGeneratedImagePreview.value)
    preGeneratedImagePreview.value = null
  }
})
</script>



