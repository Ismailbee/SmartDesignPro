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

// Lazy load heavy animation library
const Vue3Lottie = defineAsyncComponent(() => 
  import('vue3-lottie').then(m => m.Vue3Lottie)
)

// Lazy load Capacitor TTS - only when needed on native platforms
let TextToSpeech: any = null
const loadTextToSpeech = async () => {
  // Only load on actual native platforms (APK/IPA), not web
  const isNativePlatform = typeof window !== 'undefined' &&
                            (window as any).Capacitor?.isNativePlatform &&
                            (window as any).Capacitor.isNativePlatform()
  
  if (!isNativePlatform) {
    // Return null on web to prevent "not implemented" errors
    return null
  }
  
  if (!TextToSpeech) {
    try {
      const module = await import('@capacitor-community/text-to-speech')
      TextToSpeech = module.TextToSpeech
    } catch (e) {
      console.warn('TextToSpeech module not available:', e)
      return null
    }
  }
  return TextToSpeech
}

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

// TODO: TECH DEBT - Speech functionality in this file duplicates ./sticker/composables/useSpeechToText.ts
// The local speech functions (toggleVoiceInput, speakMessage, stopAllSpeech, etc.) should be
// replaced with useSpeechToText composable. This requires restructuring initialization order
// since sendMessage and scrollToBottom are defined later in this file.
// See: toggleVoiceInput (~line 1015), speakMessage (~line 2020), initSpeechRecognition (~line 1860)

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
} from './sticker/composables'

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
  const warnings: string[] = []
  
  // Only show warnings if user has started typing (description is not empty)
  if (formData.description.trim()) {
    if (!data.date) {
      warnings.push('You did not include the date.')
    }
    if (!data.courtesy) {
      warnings.push('You did not include the courtesy.')
    }
    // Check names. 
    if (!data.name1 && !data.name2) {
      warnings.push('You did not include the name')
    }
  }
  
  validationWarnings.value = warnings
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
      console.log('Unknown action:', action.type)
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
  // ?? TEMPORARILY DISABLED: Token system bypassed for development
  // TODO: Re-enable token system when backend API is ready
  console.log(`?? Token system DISABLED - Would deduct ${amount} tokens for: ${reason}`)
  return true
  
  /* ORIGINAL TOKEN LOGIC - COMMENTED OUT FOR NOW
  // ?? OFFLINE MODE: Skip token checks entirely
  if (!FEATURES.TOKENS_ENABLED) {
    console.log('?? Offline mode: Skipping token deduction for:', reason)
    return true
  }
  
  // Check if user is authenticated - REQUIRE LOGIN
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    console.log('?? Token deduction blocked - user not authenticated')
    authStore.showNotification({
      title: 'Login Required',
      message: 'Please login or create an account to generate designs.',
      type: 'info'
    })
    // Show a chat message prompting user to login with action buttons
    chatMessages.value.push({
      id: Date.now(),
      text: "Hey there!\n\nTo create beautiful designs, you'll need to login or create a free account first.\n\nBenefits of signing up:\n� Get 100 FREE tokens to start!\n� Save your designs\n� Access all features",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'login', label: 'Login Now', variant: 'primary' }
      ]
    })
    scrollToBottom()
    return false
  }
  
  // Check if user has enough tokens (local check)
  const currentTokens = userStore.user?.tokens ?? 0
  
  if (currentTokens === 0) {
    authStore.showNotification({
      title: 'No Tokens Available',
      message: "You don't have any tokens! Buy tokens to create amazing designs.",
      type: 'info'
    })
    // Show a chat message guiding user to buy tokens with action button
    chatMessages.value.push({
      id: Date.now(),
      text: "Oops! You've run out of tokens.\n\nTo continue creating beautiful designs, you'll need to purchase more tokens.\n\nToken Packages Available:\n� 100 tokens - ?100\n� 500 tokens - ?500\n� 1000 tokens - ?1000 (Best Value!)",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'buy-tokens', label: 'Buy Tokens Now', variant: 'primary' }
      ]
    })
    scrollToBottom()
    return false
  }
  
  if (currentTokens < amount) {
    authStore.showNotification({
      title: 'Insufficient Tokens',
      message: `You need ${amount} tokens but only have ${currentTokens}. Please purchase more tokens.`,
      type: 'info'
    })
    // Show a chat message guiding user to buy tokens with action button
    chatMessages.value.push({
      id: Date.now(),
      text: `You need ${amount} tokens for this action, but you only have ${currentTokens} tokens.\n\nGet more tokens to continue designing!\n\nTip: Larger token packages offer better value!`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'buy-tokens', label: 'Buy More Tokens', variant: 'primary' }
      ]
    })
    scrollToBottom()
    return false
  }
  
  try {
    await userStore.deductUserTokens(authStore.user.id, amount)
    console.log(`?? Deducted ${amount} tokens for: ${reason}. New balance: ${userStore.user?.tokens}`)
    return true
  } catch (error: any) {
    console.error('? Token deduction API failed:', error)
    
    // If the backend is unavailable, deduct locally and allow the action
    // This prevents blocking users when server is down
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.message?.includes('not found') ||
        error.message?.includes('404') ||
        error.message?.includes('500')) {
      console.log('?? Backend unavailable, deducting tokens locally')
      // Deduct locally - backend will sync later
      userStore.updateTokens(-amount)
      authStore.showNotification({
        title: 'Tokens Used',
        message: `Used ${amount} tokens for: ${reason}`,
        type: 'success'
      })
      return true
    }
    
    // For other errors, show error and block
    authStore.showNotification({
      title: 'Token Error',
      message: error.message || 'Failed to deduct tokens. Please try again.',
      type: 'error'
    })
    return false
  }
  END OF COMMENTED OUT TOKEN LOGIC */
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
        
        console.log(`? Updated ${previewContainers.length} preview(s) with new design`)
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
  console.log('?? Edit modal save:', data)
  
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

function toggleVoiceInput() {
  // Check if speech recognition is supported
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  
  // Detect if on mobile
  const isMobile = checkIfMobile()
  
  // Haptic feedback for mobile (vibrate on tap)
  if (isMobile && navigator.vibrate) {
    navigator.vibrate(50) // Short vibration
  }
  
  if (!SpeechRecognition) {
    // On mobile, provide more helpful message
    if (isMobile) {
      authStore.showNotification({
        title: 'Voice Input',
        message: 'Voice input requires microphone permission. Please allow access in your device settings.',
        type: 'info'
      })
    } else {
      authStore.showNotification({
        title: 'Voice Input Not Supported',
        message: 'Your browser does not support voice input. Please try Chrome, Edge, or Safari.',
        type: 'error'
      })
    }
    return
  }
  
  // If already recording, stop it
  if (isRecording.value && speechRecognition.value) {
    speechRecognition.value.stop()
    isRecording.value = false
    
    // Haptic feedback when stopping
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(100) // Longer vibration to indicate stop
    }
    
    // Remove listening message
    const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
    if (listeningMsgIndex !== -1) {
      chatMessages.value.splice(listeningMsgIndex, 1)
    }
    
    // Auto-send if text was captured AND not already sent
    if (chatInputText.value.trim() && !voiceMessageSent.value) {
      voiceMessageSent.value = true // Mark as sent
      
      // Auto-send immediately
      setTimeout(() => {
        sendMessage()
      }, 50) // Almost instant
    }
    return
  }
  
  // Initialize recognition if not already done
  if (!speechRecognition.value) {
    speechRecognition.value = initSpeechRecognition()
  }
  
  if (!speechRecognition.value) {
    authStore.showNotification({
      title: 'Voice Input Error',
      message: isMobile 
        ? 'Could not access microphone. Please check app permissions in your device settings.'
        : 'Could not initialize voice recognition. Please try again.',
      type: 'error'
    })
    return
  }
  
  // Start recording
  try {
    speechRecognition.value.start()
    
    // Haptic feedback when recording starts
    if (isMobile && navigator.vibrate) {
      navigator.vibrate([50, 30, 50]) // Double vibration pattern
    }
    
    // Show toast notification - different message for mobile
    authStore.showNotification({
      title: '?? Listening...',
      message: isMobile ? 'Speak clearly into your phone!' : 'Speak now! Say your message clearly.',
      type: 'info'
    })
    
    // Add a listening indicator to chat
    chatMessages.value.push({
      id: Date.now(),
      text: isMobile ? '?? Listening... Speak into your phone!' : '?? Listening... Speak now!',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true
    })
    scrollToBottom()
    
    // On mobile, set a timeout to auto-stop if user doesn't speak (prevent hanging)
    if (isMobile) {
      setTimeout(() => {
        if (isRecording.value && !chatInputText.value.trim()) {
          stopVoiceRecording()
          authStore.showNotification({
            title: 'Voice Timeout',
            message: "I didn't hear anything. Tap the mic and try again!",
            type: 'info'
          })
        }
      }, 10000) // 10 second timeout on mobile
    }
    
  } catch (error) {
    console.error('Failed to start voice recognition:', error)
    authStore.showNotification({
      title: 'Voice Input Error',
      message: isMobile 
        ? 'Microphone access denied. Please allow microphone permission in Settings > Apps > [This App] > Permissions.'
        : 'Could not start voice recognition. Please check microphone permissions.',
      type: 'error'
    })
  }
}

// Stop voice recording and remove listening message
function stopVoiceRecording() {
  if (speechRecognition.value && isRecording.value) {
    speechRecognition.value.stop()
    isRecording.value = false
  }
  
  // Remove the "Listening..." message
  const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
  if (listeningMsgIndex !== -1) {
    chatMessages.value.splice(listeningMsgIndex, 1)
  }
}

// Stop voice recording AND automatically send the message
function stopVoiceRecordingAndSend() {
  if (speechRecognition.value && isRecording.value) {
    speechRecognition.value.stop()
    isRecording.value = false
  }
  
  // Remove the "Listening..." message
  const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
  if (listeningMsgIndex !== -1) {
    chatMessages.value.splice(listeningMsgIndex, 1)
  }
  
  // Auto-send if there's text AND we haven't already sent
  if (chatInputText.value.trim() && !voiceMessageSent.value) {
    voiceMessageSent.value = true // Mark as sent to prevent duplicates
    
    // Haptic feedback before sending
    if (navigator.vibrate) {
      navigator.vibrate(30) // Quick single vibration
    }
    
    // Send immediately
    setTimeout(() => {
      sendMessage()
    }, 50) // Almost instant
  }
}

// AI Chat handler
function handleChatClick() {
  authStore.showNotification({
    title: 'AI Assistant',
    message: 'Coming Soon! Our AI assistant will help you create amazing designs.',
    type: 'info'
  })
}

async function generateWeddingPreview() {
  console.log('🔷 generateWeddingPreview called')
  console.log('   - authStore.isAuthenticated:', authStore.isAuthenticated)
  console.log('   - authStore.user?.id:', authStore.user?.id)
  console.log('   - formData.description:', formData.description)
  console.log('   - accumulatedDescription:', accumulatedDescription.value)
  console.log('   - extractedInfo:', JSON.stringify(extractedInfo.value))
  
  // Check if user is logged in FIRST before doing anything else
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    console.log('❌ Generation blocked: User not authenticated')
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
  console.log('   - resolvedDescription:', resolvedDescription)

  if (!resolvedDescription) {
    console.log('❌ Generation blocked: No description')
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
    console.log('❌ Generation paused: size not confirmed')
    promptForWeddingSize()
    return
  }

  // Check requirements: Must have names OR a picture
  const { name1, name2 } = extractNames(formData.description)
  console.log('   - extractNames result:', { name1, name2 })
  const hasNames = !!(name1 || name2)
  const hasPicture = !!preGeneratedImageFile.value
  console.log('   - hasNames:', hasNames, ', hasPicture:', hasPicture)

  if (!hasNames && !hasPicture) {
    console.log('❌ Generation blocked: No names and no picture')
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

  console.log('✅ All checks passed, proceeding with generation...')
  
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
          console.log(`?? Applying initial size: ${w}x${h} inches`)
          
          // Ensure container is available before resizing
          if (weddingPreviewContainer.value) {
            await handleSizeChange(w, h)
          } else {
            console.warn('?? weddingPreviewContainer not ready for initial resize, skipping.')
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
      console.log('?? Pre-selected background for title color:', initialBackground)
    }
    
    // Now load the template - title will use the correct color based on pre-selected background
    await loadWeddingStickerTemplate()
    
    // Process the description to update the SVG with names, date, courtesy
    await processDescriptionInput()

    // Apply the background image (already selected above)
    if (initialBackground) {
      console.log('?? Applying background image:', initialBackground)
      await applyNewBackground(initialBackground)
      
      // Wait for background image to fully load before continuing
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('? Background loaded, continuing...')
    }

    // Clear the input field now that we've processed the description
    formData.description = ''

    // Handle pre-uploaded image if exists
    if (preGeneratedImageFile.value) {
      generatingStep.value = 3 // Step 3: Processing image
      await nextTick() // Ensure DOM is ready
      
      if (!weddingPreviewContainer.value) {
        console.error('? weddingPreviewContainer not available')
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
            console.warn('Background removal failed, using original image', error)
          }
        }

        // Add image to SVG
        console.log('?? About to add image to SVG manager:', {
          fileName: fileToProcess.name,
          fileSize: fileToProcess.size,
          fileType: fileToProcess.type
        })
        
        const addedImage = await svgImageManager.addImage(fileToProcess, svgElement)
        
        console.log('?? Image added to SVG manager:', {
          success: !!addedImage,
          imageId: addedImage?.id,
          dataUrlLength: addedImage?.dataUrl?.length || 0,
          imagesInManager: svgImageManager.images.value.length
        })
        
        updateSVGWithImages()
        
        // Wait for DOM to update after image is applied
        await nextTick()
        
        // Additional delay to ensure image is fully rendered
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log('? User image render delay complete')
        
        // Debug: Log image element status
        const imgElement = svgElement.querySelector('#userImage, #placeholder-image') as SVGImageElement
        if (imgElement) {
          console.log('??? Image element after update:', {
            hasHref: !!imgElement.getAttribute('href'),
            hrefLength: imgElement.getAttribute('href')?.length || 0,
            hasXlinkHref: !!imgElement.getAttributeNS('http://www.w3.org/1999/xlink', 'href'),
            id: imgElement.id,
            x: imgElement.getAttribute('x'),
            y: imgElement.getAttribute('y'),
            width: imgElement.getAttribute('width'),
            height: imgElement.getAttribute('height'),
            opacity: imgElement.getAttribute('opacity'),
            clipPath: imgElement.getAttribute('clip-path')
          })
          
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
              console.log('?? Fixed: Moved userImage after background-image for correct z-order')
            }
          }
          
          // Ensure opacity is set to 1
          if (!imgElement.getAttribute('opacity') || imgElement.getAttribute('opacity') === '0') {
            imgElement.setAttribute('opacity', '1')
            console.log('🔧 Fixed: Set userImage opacity to 1')
          }
          
          // CRITICAL FIX: If href is still empty, directly set from svgImageManager
          const currentHref = imgElement.getAttribute('href')
          if (!currentHref || currentHref === '') {
            const latestImage = svgImageManager.images.value[svgImageManager.images.value.length - 1]
            if (latestImage?.dataUrl) {
              console.log('🔧 CRITICAL FIX: Setting image href directly from svgImageManager')
              imgElement.setAttribute('href', latestImage.dataUrl)
              imgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', latestImage.dataUrl)
              console.log('✅ Image href set, length:', latestImage.dataUrl.length)
            } else {
              console.error('❌ No image data available in svgImageManager')
            }
          }
        } else {
          console.warn('⚠️ No image element found in SVG after updateSVGWithImages')
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
    console.log('? showWeddingStickerPreview set to true for Download button visibility')
    
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
      text: "Your design is ready! Looking great! ??\n\n?? **Tip:** You can drag the image to reposition it. Click 'Edit' for more options!",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    // Ensure SVG is visible and properly rendered
    await nextTick()
    await nextTick() // Double nextTick for chat container
    
    // Additional delay to ensure all images and elements are fully rendered
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('? Final render delay complete')
    
    // Copy the SVG from main container to chat container
    // Note: chatPreviewContainer is an array because it's in a v-for loop
    if (weddingPreviewContainer.value) {
      const svgElement = weddingPreviewContainer.value.querySelector('svg')
      
      // Debug: Check image element in source SVG before cloning
      const sourceImgEl = svgElement?.querySelector('#userImage, #placeholder-image, image') as SVGImageElement
      console.log('?? Source SVG image check before clone:', {
        hasImageElement: !!sourceImgEl,
        imageId: sourceImgEl?.id,
        hasHref: !!sourceImgEl?.getAttribute('href'),
        hrefLength: sourceImgEl?.getAttribute('href')?.length || 0,
        hasXlinkHref: !!sourceImgEl?.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      })
      
      console.log('?? Checking weddingPreviewContainer for SVG...', {
        hasContainer: !!weddingPreviewContainer.value,
        hasSVG: !!svgElement,
        svgDimensions: svgElement ? { width: svgElement.getAttribute('width'), height: svgElement.getAttribute('height') } : null
      })
      
      if (svgElement) {
        // Get the last preview container (the one we just added)
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        console.log('?? Preview containers found:', previewContainers.length)
        
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
              console.log(`?? Preview aspect ratio set to: ${aspectRatio.toFixed(2)} (${vbWidth}x${vbHeight})`)
            }
          }
          
          // Debug: Check image in cloned SVG before appending
          const clonedImgEl = clonedSVG.querySelector('#userImage, #placeholder-image, image') as SVGImageElement
          console.log('??? Cloned SVG image check:', {
            hasImageElement: !!clonedImgEl,
            imageId: clonedImgEl?.id,
            hasHref: !!clonedImgEl?.getAttribute('href'),
            hrefLength: clonedImgEl?.getAttribute('href')?.length || 0,
            hrefPreview: clonedImgEl?.getAttribute('href')?.substring(0, 50)
          })
          
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
          
          console.log('? SVG successfully cloned to chat container', {
            viewBox: viewBox,
            containerSize: { width: targetContainer.offsetWidth, height: targetContainer.offsetHeight }
          })
          
          // Verify the SVG was actually added
          if (!targetContainer.querySelector('svg')) {
            console.error('? SVG clone failed - retrying...')
            // Try again with a small delay
            await new Promise(resolve => setTimeout(resolve, 50))
            targetContainer.appendChild(clonedSVG.cloneNode(true))
          }
          
          // Attach drag/pinch handlers to images in cloned SVG
          // Note: Event listeners don't clone, so we need to re-attach them
          const imageElements = clonedSVG.querySelectorAll('image')
          imageElements.forEach((imgEl) => {
            // Remove the data-draggable attribute so handlers can be re-attached
            imgEl.removeAttribute('data-draggable')
            
            // Get image id - try data-image-id first, then fall back to id attribute
            const imageId = imgEl.getAttribute('data-image-id') || imgEl.id || 'user-image-1'
            if (imageId) {
              makeSVGImageDraggable(imgEl as SVGImageElement, imageId)
              console.log('?? Attached draggable to image:', imageId)
            }
          })
          
          // Force a layout recalculation
          void targetContainer.offsetHeight
        } else {
          console.error('? Chat preview container not available in array')
        }
      } else {
        console.error('? SVG not found in weddingPreviewContainer')
        
        // Try to show a fallback in the last preview container
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
    } else {
      console.error('? weddingPreviewContainer not available')
    }
    
    // Scroll to bottom to show the generated SVG
    scrollToBottom()
    
  } catch (error) {
    console.error('Generation failed:', error)
    // Reset state on error so user can try again
    showWeddingStickerPreview.value = false
    
    authStore.showNotification({
      title: 'Generation Failed',
      message: 'Something went wrong. Please try again.',
      type: 'error'
    })
  } finally {
    isGeneratingPreview.value = false
    generatingStep.value = 0 // Reset step
    stopGeneratingMessages() // Stop cycling through loading messages
    // Ensure final scroll after animation completes
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

// Track image uploads
function trackImageUpload(file: File) {
  const timestamp = Date.now()
  uploadedImages.value.push({ file, timestamp, used: false })
  lastUploadedImage.value = file
  
  console.log('📷 Image uploaded:', { total: uploadedImages.value.length, timestamp })
  
  // Handle multiple image uploads
  handleMultipleImageUploads()
}

// Handle multiple image uploads with AI confirmation
function handleMultipleImageUploads() {
  const unusedImages = uploadedImages.value.filter(img => !img.used)
  
  // Pre-generation: Multiple images uploaded
  if (!showWeddingStickerPreview.value && unusedImages.length > 1) {
    const firstImage = unusedImages[0]
    const latestImage = unusedImages[unusedImages.length - 1]
    const timeDiff = Math.round((latestImage.timestamp - firstImage.timestamp) / 1000)
    
    awaitingImageChoice.value = true

    const aiMessage = `Multiple pictures uploaded. Use FIRST or NEW one?`

    chatMessages.value.push({
      id: Date.now(),
      text: aiMessage,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }

  // Post-generation: New image uploaded after design is created
  if (showWeddingStickerPreview.value && lastUploadedImage.value) {
    awaitingImageUpdateConfirmation.value = true
    pendingImageFile.value = lastUploadedImage.value

    const aiMessage = "I see you've uploaded a new picture! Would you like me to replace the current image in your design? Say 'yes' or 'no'!"
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiMessage,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
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

// Lottie animation data for loading
const loadingAnimation = {
  "v": "5.7.4",
  "fr": 60,
  "ip": 0,
  "op": 180,
  "w": 500,
  "h": 500,
  "nm": "Design Loading",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Circle 1",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": {
          "a": 1,
          "k": [
            { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [0] },
            { "t": 180, "s": [360] }
          ]
        },
        "p": { "a": 0, "k": [250, 250, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": { "a": 0, "k": [200, 200] },
              "p": { "a": 0, "k": [0, 0] }
            },
            {
              "ty": "st",
              "c": { "a": 0, "k": [0.259, 0.714, 0.831, 1] },
              "o": { "a": 0, "k": 100 },
              "w": { "a": 0, "k": 8 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ]
    }
  ]
}

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

// ============================================================================
// SPEECH-TO-TEXT (STT) - Voice Input Feature
// Supports both Web browsers AND Mobile apps (iOS/Android via Capacitor)
// AUTO-SEND: Message is sent automatically after speech recognition completes
// ============================================================================
const isRecording = ref(false)
const speechRecognition = ref<any>(null)
const interimTranscript = ref('')
const isMobileDevice = ref(false)
const voiceMessageSent = ref(false) // Flag to prevent duplicate sends

// Check if running on mobile (Capacitor)
function checkIfMobile(): boolean {
  // Check for Capacitor native platform
  const isCapacitor = typeof (window as any).Capacitor !== 'undefined' && 
                      (window as any).Capacitor.isNativePlatform && 
                      (window as any).Capacitor.isNativePlatform()
  
  // Also check user agent for mobile browsers
  const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return isCapacitor || isMobileBrowser
}

// Initialize Speech Recognition (Works on Web and Mobile)
function initSpeechRecognition() {
  isMobileDevice.value = checkIfMobile()
  
  // Check if browser supports Web Speech API
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    console.warn('?? Speech Recognition not supported in this browser/device')
    return null
  }
  
  const recognition = new SpeechRecognition()
  
  // Configuration - optimized for mobile
  recognition.continuous = !isMobileDevice.value // On mobile, single utterance works better
  recognition.interimResults = true // Show results as user speaks
  recognition.lang = 'en-US' // Default language (supports multiple languages)
  recognition.maxAlternatives = 1
  
  // Event: When speech is recognized
  recognition.onresult = (event: any) => {
    let finalTranscript = ''
    let interim = ''
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interim += transcript
      }
    }
    
    // Update input with interim results (shows text as user speaks)
    if (interim) {
      interimTranscript.value = interim
      // Show interim in input field - but don't duplicate
      const baseText = chatInputText.value.replace(interimTranscript.value, '').trim()
      chatInputText.value = baseText ? `${baseText} ${interim}`.trim() : interim
    }
    
    // When speech is final, add to input
    if (finalTranscript) {
      const baseText = chatInputText.value.replace(interimTranscript.value, '').trim()
      chatInputText.value = baseText ? `${baseText} ${finalTranscript}`.trim() : finalTranscript
      interimTranscript.value = ''
      console.log('?? Recognized:', finalTranscript)
      
      // Auto-stop and auto-send after recognition
      voiceMessageSent.value = false // Reset flag
      setTimeout(() => {
        stopVoiceRecordingAndSend()
      }, 300) // Quick send after speech ends
    }
  }
  
  // Event: Recognition started
  recognition.onstart = () => {
    console.log('?? Voice recognition started')
    isRecording.value = true
    voiceMessageSent.value = false // Reset the sent flag when starting new recording
  }
  
  // Event: Recognition ended
  recognition.onend = () => {
    console.log('?? Voice recognition ended')
    isRecording.value = false
    
    // Remove any listening messages
    const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
    if (listeningMsgIndex !== -1) {
      chatMessages.value.splice(listeningMsgIndex, 1)
    }
    
    // Auto-send if there's text AND we haven't already sent it
    if (chatInputText.value.trim() && !voiceMessageSent.value) {
      voiceMessageSent.value = true
      setTimeout(() => {
        sendMessage()
      }, 100) // Fast send
    }
  }
  
  // Event: Error occurred
  recognition.onerror = (event: any) => {
    console.error('?? Speech recognition error:', event.error)
    isRecording.value = false
    
    // Remove listening message on error
    const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
    if (listeningMsgIndex !== -1) {
      chatMessages.value.splice(listeningMsgIndex, 1)
    }
    
    let errorMessage = 'Voice input error'
    switch (event.error) {
      case 'no-speech':
        errorMessage = "I didn't hear anything. Tap the mic and try again!"
        break
      case 'audio-capture':
        errorMessage = 'No microphone found. Please check your device settings.'
        break
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone permission in your device settings.'
        break
      case 'network':
        errorMessage = 'Network error. Please check your internet connection.'
        break
      case 'aborted':
        // User stopped recording - no need to show error
        return
      case 'service-not-allowed':
        errorMessage = 'Speech service not available. Please try again later.'
        break
      default:
        errorMessage = `Voice error: ${event.error}`
    }
    
    authStore.showNotification({
      title: 'Voice Input',
      message: errorMessage,
      type: 'error'
    })
  }
  
  return recognition
}

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
const isVoiceEnabled = ref(true) // Enabled by default

// Voice / TTS Logic
function toggleVoice() {
  isVoiceEnabled.value = !isVoiceEnabled.value
  if (isVoiceEnabled.value) {
    // Announce voice is on
    speakMessage("Voice guidance enabled. I will read my messages to you.")
  } else {
    // Stop any ongoing speech safely
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis?.cancel()
      }
      // Stop native TTS (lazy loaded)
      loadTextToSpeech().then(TTS => TTS?.stop?.()).catch(() => {})
    } catch (error) {
      // Ignore errors when stopping speech
    }
  }
}

function speakMessage(text: string) {
  if (!isVoiceEnabled.value) return
  
  // Cancel any ongoing speech first to prevent overlap/duplicates
  stopAllSpeech()
  
  // Remove emojis and special characters before speaking
  // This regex removes most emojis and special unicode characters
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols (sun, moon, etc)
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Mahjong Tiles
    .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '') // Playing Cards
    .replace(/\*\*/g, '')                    // Remove markdown bold markers
    .replace(/\s+/g, ' ')                    // Clean up extra whitespace
    .trim()
  
  // On mobile (Android/iOS via Capacitor), try native TTS first since Web Speech API
  // often doesn't work properly in WebView
  const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                   (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.())
  
  if (isMobile) {
    // Try native TTS first on mobile
    tryNativeTTS(cleanText).catch(() => {
      // Fallback to web speech if native TTS fails
      console.log('Native TTS failed, trying web speech...')
      tryWebSpeech(cleanText)
    })
  } else {
    // On desktop, use web speech synthesis
    tryWebSpeech(cleanText)
  }
}

// Helper function to stop all ongoing speech
function stopAllSpeech() {
  try {
    // Stop web speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    // Stop native TTS (Capacitor) if available - lazy loaded
    loadTextToSpeech().then(TTS => TTS?.stop?.()).catch(() => {})
  } catch (e) {
    // Ignore errors
  }
}

async function tryNativeTTS(text: string) {
  try {
    // Only attempt on native platforms
    const isNativePlatform = typeof window !== 'undefined' &&
                              (window as any).Capacitor?.isNativePlatform &&
                              (window as any).Capacitor.isNativePlatform()
    
    if (!isNativePlatform) {
      throw new Error('Not on native platform')
    }
    
    console.log('🔊 Attempting native TTS...')
    const TTS = await loadTextToSpeech()
    if (!TTS) throw new Error('TTS not available')
    
    await TTS.speak({
      text: text,
      lang: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient'
    })
    console.log('✅ Native TTS successful')
  } catch (error) {
    console.warn('❌ Native TTS failed:', error)
    // Not available, will fallback to web speech
    throw error
  }
}

function tryWebSpeech(text: string) {
  // Check if speechSynthesis is available
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not available')
    return
  }
  
  try {
    // Cancel any current speech safely
    if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
      window.speechSynthesis?.cancel()
    }
    
    // Small delay to ensure cancellation is processed
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Get voices safely
        const voices = window.speechSynthesis?.getVoices() || []
        
        // If no voices yet, try to wait for them (but don't break if not supported)
        if (voices.length === 0) {
          const voicesHandler = () => {
            try {
              const loadedVoices = window.speechSynthesis?.getVoices() || []
              if (loadedVoices.length > 0) {
                setVoiceAndSpeak(utterance, loadedVoices)
              } else {
                // Just speak with default voice
                window.speechSynthesis?.speak(utterance)
              }
            } catch (err) {
              console.warn('Voice loading error:', err)
            }
          }
          
          if (window.speechSynthesis?.addEventListener) {
            window.speechSynthesis?.addEventListener('voiceschanged', voicesHandler, { once: true })
            // Fallback timeout in case voiceschanged never fires
            setTimeout(() => {
              window.speechSynthesis?.removeEventListener('voiceschanged', voicesHandler)
              window.speechSynthesis?.speak(utterance)
            }, 1000)
          } else {
            window.speechSynthesis?.speak(utterance)
          }
        } else {
          setVoiceAndSpeak(utterance, voices)
        }
      } catch (error) {
        console.warn('Speech synthesis error:', error)
      }
    }, 100)
  } catch (error) {
    console.warn('Speech synthesis not available:', error)
  }
}

function setVoiceAndSpeak(utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[]) {
  try {
    // Prefer a clear English voice
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0]
    
    if (preferredVoice) utterance.voice = preferredVoice
    
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    if (window.speechSynthesis) {
      window.speechSynthesis?.speak(utterance)
    }
  } catch (error) {
    console.warn('Speech synthesis error:', error)
  }
}

// Initialize voice on mount
onMounted(() => {
  try {
    // Wait for voices to load - but don't break if not supported
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis?.onvoiceschanged !== undefined) {
        window.speechSynthesis!.onvoiceschanged = () => {
          // Voices loaded
        }
      }
    }
  } catch (error) {
    console.warn('Speech synthesis initialization failed:', error)
  }
})

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

// Watch for new AI messages to speak them
// IMPORTANT: This is the ONLY place that should trigger voice announcements for the wedding chat
// The speakMessage function should NOT be called directly elsewhere to avoid duplicates
let lastSpokenMessageId: number | null = null
let speakTimeout: ReturnType<typeof setTimeout> | null = null
watch(() => chatMessages.value.length, (newLen, oldLen) => {
  if (newLen > oldLen && isVoiceEnabled.value && selectedCategory.value === 'wedding') {
    const lastMsg = chatMessages.value[newLen - 1]
    // Prevent duplicate announcements by tracking the last spoken message ID
    if (lastMsg.sender === 'ai' && lastMsg.id !== lastSpokenMessageId) {
      // Clear any pending speech timeout to prevent duplicates
      if (speakTimeout) {
        clearTimeout(speakTimeout)
        speakTimeout = null
      }
      // Cancel any ongoing speech first
      stopAllSpeech()
      
      lastSpokenMessageId = lastMsg.id
      // Small delay to ensure cancellation is processed before speaking
      speakTimeout = setTimeout(() => {
        speakMessage(lastMsg.text)
      }, 150)
    }
  }
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

// Reset asked questions when starting fresh
function resetAskedQuestions() {
  askedQuestions.value = {
    picture: false,
    size: false,
    backgroundRemoval: false,
    heading: false,
    names: false,
    date: false,
    courtesy: false
  }
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
  const parts: string[] = []
  if (customHeading.value) parts.push(customHeading.value)

  const n1 = extractedInfo.value.names.name1
  const n2 = extractedInfo.value.names.name2
  if (n1 && n2) parts.push(`(${n1} & ${n2})`)
  else if (n1) parts.push(`(${n1})`)

  if (extractedInfo.value.date) parts.push(extractedInfo.value.date)
  if (extractedInfo.value.courtesy) parts.push(`courtesy: ${extractedInfo.value.courtesy}`)

  const desc = parts.join(', ')
  accumulatedDescription.value = desc
  formData.description = desc
}

function buildWeddingChatContextForAI() {
  const state = {
    authenticated: !!authStore.isAuthenticated,
    tokens: userStore.user?.tokens ?? 0,
    hasPreview: !!showWeddingStickerPreview.value,
    heading: customHeading.value ?? null,
    details: {
      name1: extractedInfo.value.names.name1 ?? null,
      name2: extractedInfo.value.names.name2 ?? null,
      date: extractedInfo.value.date ?? null,
      courtesy: extractedInfo.value.courtesy ?? null,
      size: extractedInfo.value.size ?? null
    },
    hasPhoto: !!preGeneratedImageFile.value
  }

  return JSON.stringify(state, null, 2)
}

function buildWeddingChatTranscriptForAI(maxMessages = 10): string {
  const items = chatMessages.value
    .filter(m => m && (m as any).sender && !(m as any).isLoading && (m as any).type !== 'preview')
    .slice(-maxMessages)
    .map(m => {
      const role = (m as any).sender === 'user' ? 'User' : 'Assistant'
      const text = String((m as any).text ?? '').trim()
      return `${role}: ${text}`
    })

  return items.join('\n')
}

function parseSizeToInches(size: string): { w: number; h: number } | null {
  const m = size.trim().match(/(\d+(?:\.\d+)?)\s*[x�]\s*(\d+(?:\.\d+)?)/i)
  if (!m) return null
  const w = Number(m[1])
  const h = Number(m[2])
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
  return { w, h }
}

// Using extractWeddingDetails from composables instead of inline tryLocalExtraction
// This provides better pattern matching and title extraction

let weddingChatRequestId = 0

async function analyzeMessageWithOllama(lastUserMessage: string) {
  // Ensure message is a string
  if (!lastUserMessage || typeof lastUserMessage !== 'string') {
    console.error('analyzeMessageWithOllama called with non-string:', lastUserMessage)
    return
  }
  const reqId = ++weddingChatRequestId
  const context = buildWeddingChatContextForAI()
  const transcript = buildWeddingChatTranscriptForAI()
  const isAuthed = !!authStore.isAuthenticated
  const lowerMsg = lastUserMessage.trim().toLowerCase()

  // --- USE WEDDING CHAT COMPOSABLE FIRST ---
  // This handles title-only, names-only, date-only, courtesy-only detection
  // and provides proper responses asking for missing information
  if (weddingChatProcessor) {
    const handled = await weddingChatProcessor.processMessage(lastUserMessage)
    if (handled) {
      // Sync the state after composable processes
      syncWeddingDescriptionFromState()
      return
    }
  }

  // --- Quick greeting shortcut (avoid Ollama call for simple greetings) ---
  const isSimpleGreeting = /^(hi+|hello+|hey+|hiya|yo|good\s*(morning|afternoon|evening|day)|assalamualaikum|salam|greetings?)[\s!.?]*$/i.test(lowerMsg)
  if (isSimpleGreeting) {
    isAnalyzing.value = false
    const hour = new Date().getHours()
    let greet = 'Hello!'
    if (hour >= 5 && hour < 12) greet = 'Good morning!'
    else if (hour >= 12 && hour < 17) greet = 'Good afternoon!'
    else if (hour >= 17 && hour < 21) greet = 'Good evening!'
    if (/salam/i.test(lowerMsg)) greet = 'Wa alaikum assalam!'

    // Check if we already have some info to personalize the greeting
    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date
    
    let responseText = ''
    if (hasName && hasDate) {
      responseText = `${greet} ?? Welcome back! I still have your details saved. Would you like me to generate your sticker?`
    } else if (hasName || hasDate) {
      const have = hasName ? `the names (${extractedInfo.value.names.name1}${extractedInfo.value.names.name2 ? ' & ' + extractedInfo.value.names.name2 : ''})` : `the date (${extractedInfo.value.date})`
      const need = !hasName ? 'the bride\'s and groom\'s names' : 'the wedding date'
      responseText = `${greet} ?? I remember ${have}. Just need ${need} to create your sticker!`
    } else {
      responseText = `${greet} ?? I'm here to help create your wedding sticker!\n\nJust tell me the couple's names and wedding date, and I'll design something beautiful for you!`
    }

    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- "Who are you?" / "What are you?" questions ---
  const isWhoAreYou = /\b(who\s*(are\s*you|r\s*u|is\s*this)|what\s*(are\s*you|r\s*u|is\s*this(\s*app|\s*thing)?)|what\s*do\s*you\s*do|ur\s*name|your\s*name|introduce\s*yourself|tell\s*me\s*about\s*(you|yourself)|wats?\s*(dis|this))\b/i.test(lowerMsg)
  if (isWhoAreYou) {
    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: `Hey there! ?? I'm your wedding sticker assistant!\n\nTell me the couple's names and when the big day is ? I'll create a beautiful sticker design for you! ??`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- How are you / casual chat ---
  const isHowAreYou = /\b(how\s*(are\s*you|r\s*u|u\s*doing|ya\s*doing)|how'?s\s*(it\s*going|things|life|everything)|what'?s\s*(up|good|new)|sup|wassup|how\s*do\s*you\s*do)\b/i.test(lowerMsg)
  if (isHowAreYou) {
    isAnalyzing.value = false
    const responses = [
      `I'm doing wonderful, thanks for asking! ?? Ready to help create something special for you!`,
      `Great, thank you! ?? So excited to help with your wedding sticker today!`,
      `Feeling creative and ready to help! ?? Got a wedding to celebrate?`
    ]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    chatMessages.value.push({
      id: Date.now(),
      text: randomResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- General questions (what can you do, capabilities) ---
  const isCapabilityQuestion = /\b(what\s*can\s*you\s*(do|make|create|help)|wha?t\s*(u|you)\s*do|your\s*capabilities|features|how\s*does\s*(this|it)\s*work|wat\s*can\s*u\s*do|show\s*me\s*what\s*you\s*can)\b/i.test(lowerMsg)
  if (isCapabilityQuestion) {
    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: `I create beautiful wedding stickers! ???\n\nJust share:\n? The couple's names\n? Wedding date\n\nI'll design a gorgeous sticker you can download and share! You can also pick colors or styles if you'd like.`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Non-wedding request detection (flyer, poster, logo, banner, etc.) ---
  const isNonWeddingRequest = /\b(flyer|poster|logo|banner|business\s*card|brochure|menu|certificate|resume|cv|letterhead|book\s*cover|album|birthday|anniversary|graduation|baby\s*shower|funeral|naming\s*ceremony)\b/i.test(lowerMsg)
  if (isNonWeddingRequest && !/wedding/i.test(lowerMsg)) {
    isAnalyzing.value = false
    const friendlyResponses = [
      `I appreciate you thinking of me! ?? But I specialize only in wedding stickers.\n\nIf you have a wedding coming up, I'd love to help create something beautiful!`,
      `That sounds like a lovely project! Unfortunately, I only create wedding stickers. ??\n\nGot a wedding to celebrate? I'm your assistant!`,
      `I wish I could help with that! But my specialty is wedding stickers only. ??\n\nKnow someone getting married? I'd love to help!`
    ]
    const randomResponse = friendlyResponses[Math.floor(Math.random() * friendlyResponses.length)]
    chatMessages.value.push({
      id: Date.now(),
      text: randomResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Vague design request ("I want a beautiful design", "make something nice") ---
  const isVagueDesignRequest = /\b(beautiful|nice|pretty|good|amazing|lovely|stunning|cool|awesome)\s*(design|sticker|thing|something|one)?\b/i.test(lowerMsg) && !/(name|bride|groom|date|wedding)/i.test(lowerMsg)
  if (isVagueDesignRequest) {
    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: `I'd love to create something beautiful for you! ??\n\nJust tell me:\n? Who's getting married? (couple's names)\n? When's the wedding?`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Background Removal Decision Handler (YES) ---
  const isAffirmative = /^(yes|yeah|yep|yup|sure|ok|okay|alright|definitely|of course|absolutely|let'?s go|let'?s do it|please|do it)[\s!.?]*$/i.test(lowerMsg)
  if (isAffirmative && awaitingBackgroundRemovalDecision.value && pendingImageFile.value) {
    isAnalyzing.value = false
    awaitingBackgroundRemovalDecision.value = false
    
    chatMessages.value.push({
      id: Date.now(),
      text: "Removing background... This may take a moment. ⏳",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    
    try {
      const fileToProcess = pendingImageFile.value
      const result = await removeBackground(fileToProcess, {
        quality: 'balanced',
        outputFormat: 'image/png'
      })
      
      if (result && result.blob) {
        // Create new file from processed blob
        const processedFile = new File([result.blob], fileToProcess.name.replace(/\.[^/.]+$/, '_nobg.png'), {
          type: 'image/png',
          lastModified: Date.now()
        })
        
        // Get SVG element
        const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
        if (svgElement) {
          svgImageManager.clearAllImages()
          await svgImageManager.addImage(processedFile, svgElement)
          updateSVGWithImages()
        }
        
        // Store for generation
        preGeneratedImageFile.value = processedFile
        preGeneratedImagePreview.value = result.dataUrl
        
        chatMessages.value.push({
          id: Date.now(),
          text: "Background removed! ✨ Your image is ready!\n\n📌 **Tip:** You can drag the image to reposition it after the design is generated!",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } as any)
      } else {
        throw new Error('Background removal returned no result')
      }
    } catch (error) {
      console.error('Background removal failed:', error)
      chatMessages.value.push({
        id: Date.now(),
        text: "Sorry, I couldn't remove the background. Using the original image instead. 📷",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } as any)
      
      // Use original image
      const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
      if (svgElement && pendingImageFile.value) {
        svgImageManager.clearAllImages()
        await svgImageManager.addImage(pendingImageFile.value, svgElement)
        updateSVGWithImages()
        preGeneratedImageFile.value = pendingImageFile.value
        preGeneratedImagePreview.value = URL.createObjectURL(pendingImageFile.value)
      }
    }
    
    pendingImageFile.value = null
    scrollToBottom()
    return
  }

  // --- Affirmative shortcut (yes/yeah/sure/ok) - generic ---
  if (isAffirmative) {
    isAnalyzing.value = false
    // Check if we already have some info collected
    const hasName1 = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date
    
    let responseText = ''
    if (showWeddingStickerPreview.value) {
      responseText = 'Your sticker is ready! You can download it or make edits. 🎉'
    } else if (hasName1 && hasDate) {
      if (!hasConfirmedWeddingSize()) {
        responseText = "What size would you like the sticker? (e.g., '3x3' or type 'default' for 4x4 inches)"
        awaitingSizeDecision.value = true
      } else {
        responseText = 'Got it! Generating your wedding sticker now... 🎨'
        setTimeout(() => generateWeddingPreview(), 100)
      }
    } else {
      const missing: string[] = []
      if (!hasName1) missing.push('bride\'s and groom\'s names')
      if (!hasDate) missing.push('wedding date')
      responseText = missing.length > 0 
        ? `I still need: ${missing.join(' and ')}. 📝`
        : 'Let\'s create your wedding sticker!\n\nTell me:\n📍 Bride\'s name\n📍 Groom\'s name\n📍 Wedding date'
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Change request shortcut (I want to change X) ---
  const changeMatch = lowerMsg.match(/(?:change|update|edit|modify)\s+(?:the\s+)?(\w+)/i)
  if (changeMatch) {
    const field = changeMatch[1].toLowerCase()
    isAnalyzing.value = false
    let responseText = ''
    
    if (field.includes('name')) {
      responseText = 'Sure! What are the new names? (e.g., "John & Sarah")'
    } else if (field.includes('date')) {
      responseText = 'Sure! What is the new date? (e.g., "June 15, 2025")'
    } else if (field.includes('message') || field.includes('courtesy') || field.includes('text')) {
      responseText = 'Sure! What is the new courtesy message?'
    } else {
      responseText = `Sure! Please share the new ${field} you'd like to use.`
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Background Removal Decision Handler (NO) ---
  const isNegative = /^(no|nope|nah|not now|not yet|maybe later|later|never mind|nevermind|skip|keep it|keep background)[\s!.?]*$/i.test(lowerMsg)
  if (isNegative && awaitingBackgroundRemovalDecision.value && pendingImageFile.value) {
    isAnalyzing.value = false
    awaitingBackgroundRemovalDecision.value = false
    
    // Use the original image without background removal
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement && pendingImageFile.value) {
      svgImageManager.clearAllImages()
      await svgImageManager.addImage(pendingImageFile.value, svgElement)
      updateSVGWithImages()
      preGeneratedImageFile.value = pendingImageFile.value
      preGeneratedImagePreview.value = URL.createObjectURL(pendingImageFile.value)
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: "Got it! Keeping the original background. 📷 Your image is ready!\n\n📌 **Tip:** You can drag the image to reposition it after the design is generated!",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    
    pendingImageFile.value = null
    scrollToBottom()
    return
  }

  // --- Negative shortcut (no/nope/not now) - generic ---
  if (isNegative) {
    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: 'No problem! Just let me know whenever you\'re ready to create a wedding sticker. I\'m here to help! 😊',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Thanks shortcut ---
  const isThanks = /^(thanks?|thank you|thx|ty|cheers|appreciate it|awesome|great|perfect|cool)[\s!.?]*$/i.test(lowerMsg)
  if (isThanks) {
    isAnalyzing.value = false
    const hasPreview = showWeddingStickerPreview.value
    const responseText = hasPreview 
      ? 'You\'re welcome! Your sticker looks great. Feel free to download it or let me know if you\'d like any changes!'
      : 'You\'re welcome! Let me know if you need anything else for your wedding sticker.'
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Help shortcut ---
  const isHelp = /^(help|help\s*me|i\s*need\s*help|what can you do|how does this work|instructions?|guide\s*me|how\s*to\s*use)[\s!.?]*$/i.test(lowerMsg)
  if (isHelp) {
    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: `Happy to help! 🎉 Here's how it works:\n\n1️⃣ Tell me the couple's names (e.g., "John & Sarah")\n2️⃣ Share the wedding date\n3️⃣ I'll create a beautiful sticker!\n\nYou can also add a custom message or pick your favorite colors. Ready when you are! 💒`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- Start Over / New Sticker / Fresh Start shortcut ---
  const isStartOver = /\b(start\s*(over|fresh|again|new)|new\s*(sticker|wedding|design)|different\s*(wedding|couple|sticker)|reset|clear|another\s*(one|sticker|wedding))\b/i.test(lowerMsg)
  if (isStartOver) {
    isAnalyzing.value = false
    
    // Reset all wedding state
    resetWeddingState()
    
    chatMessages.value.push({
      id: Date.now(),
      text: `Fresh start! 🔄 I've cleared everything.\n\nTell me about the new wedding - who's getting married and when?`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  // --- LOCAL EXTRACTION: Try to extract wedding details without Ollama ---
  const localExtraction = extractWeddingDetails(lastUserMessage, {
    hasName: !!extractedInfo.value.names.name1,
    hasDate: !!extractedInfo.value.date
  })
  if (localExtraction.foundSomething) {
    isAnalyzing.value = false
    
    // Apply extracted info (composable uses title, name1, name2, date, courtesy)
    if (localExtraction.title && !customHeading.value) {
      customHeading.value = localExtraction.title
      headingStepComplete.value = true
    }
    if (localExtraction.name1) extractedInfo.value.names.name1 = localExtraction.name1
    if (localExtraction.name2) extractedInfo.value.names.name2 = localExtraction.name2
    if (localExtraction.date) extractedInfo.value.date = localExtraction.date
    if (localExtraction.courtesy) extractedInfo.value.courtesy = localExtraction.courtesy
    
    syncWeddingDescriptionFromState()
    
    // Check what we have now
    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date
    
    let responseText = ''
    if (hasName && hasDate) {
      responseText = `Great! ??\n? Bride: ${extractedInfo.value.names.name1}\n? Groom: ${extractedInfo.value.names.name2 || 'Not specified'}\n? Date: ${extractedInfo.value.date}\n\nGenerating your sticker now...`
      // Auto-generate preview
      setTimeout(() => generateWeddingPreview(), 500)
    } else {
      const collected: string[] = []
      const missing: string[] = []
      if (hasName) {
        if (extractedInfo.value.names.name2) {
          collected.push(`Bride: ${extractedInfo.value.names.name1}`)
          collected.push(`Groom: ${extractedInfo.value.names.name2}`)
        } else {
          collected.push(`Name: ${extractedInfo.value.names.name1}`)
        }
      }
      if (hasDate) collected.push(`Date: ${extractedInfo.value.date}`)
      if (!hasName) missing.push('bride\'s and groom\'s names')
      if (!hasDate) missing.push('wedding date')
      
      responseText = collected.length > 0 
        ? `Got it! ??\n? ${collected.join('\n? ')}\n\nI still need: ${missing.join(' and ')}.`
        : `To create your sticker, I need:\n? Bride's name\n? Groom's name\n? Wedding date`
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as any)
    scrollToBottom()
    return
  }

  const task = [
    'You are a friendly wedding sticker assistant. Respond naturally like a helpful human.',
    'Keep responses SHORT (1-2 sentences), warm, and use emoji sparingly.',
    'ONLY help with wedding stickers. Politely decline other requests.',
    'Required info: couple names (name1=bride, name2=groom) and wedding date.',
    'Optional: courtesy (custom message/venue), color preferences.',
    'If info missing, ask friendly follow-up questions.',
    'Never mention AI, models, JSON, or technical terms.',
    'Output JSON: {"message":"your reply","updates":{"name1":null,"name2":null,"date":null,"courtesy":null}}'
  ].join('\n')

  // Build conversation context from recent messages
  const recentMessages = chatMessages.value.slice(-6).map(m => 
    `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`
  ).join('\n')

  try {
    const system = 'You are a friendly, conversational wedding sticker assistant. Chat naturally, be warm and helpful. JSON output only.'

    const aiText = await ai.chatText({
      system,
      user: `${task}\n\nConversation:\n${recentMessages}\n\nUser: ${lastUserMessage}`,
      maxTokens: 150  // Slightly more for natural responses
    })

    console.log('Ollama response:', aiText)

    let rawDecision: any | null = null
    const direct = safeJsonParse<any>(aiText)
    if (direct.ok) {
      rawDecision = direct.value
      console.log('? Direct JSON parse succeeded')
    } else {
      console.log('?? Direct parse failed, trying extraction...')
      const extracted = extractFirstJsonBlock(aiText)
      console.log('?? Extracted JSON block:', extracted)
      if (extracted) {
        const parsed = safeJsonParse<any>(extracted)
        if (parsed.ok) {
          rawDecision = parsed.value
          console.log('? Extracted JSON parse succeeded')
        }
      }
    }

    // Ignore stale responses
    if (reqId !== weddingChatRequestId) return

    // If JSON parsing failed, try to extract just the message from the text
    if (!rawDecision) {
      isAnalyzing.value = false
      console.log('? No valid JSON found, using fallback')
      // Try to find a quoted message in the response
      const msgMatch = aiText.match(/"message"\s*:\s*"([^"]+)"/i)
      let fallbackText = msgMatch?.[1] || ''
      
      // If no message found, or response looks like JSON/code, use contextual fallback
      const looksLikeCode = /^[\{\[\x60]|json|structure|format|returned|here is/i.test(fallbackText || aiText || '')
      if (!fallbackText || looksLikeCode) {
        const hasName = !!extractedInfo.value.names.name1
        const hasDate = !!extractedInfo.value.date
        const hasCourtesy = !!extractedInfo.value.courtesy
        if (hasName && hasDate && hasCourtesy) {
          fallbackText = 'I have all your details! Ready to generate your wedding sticker?'
        } else {
          const need: string[] = []
          if (!hasName) need.push('names')
          if (!hasDate) need.push('date')
          if (!hasCourtesy) need.push('courtesy message')
          fallbackText = need.length > 0 
            ? 'Please share the ' + need.join(', ') + ' for your wedding sticker.'
            : 'How can I help with your wedding sticker?'
        }
      }
      
      chatMessages.value.push({
        id: Date.now(),
        text: fallbackText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } as any)
      scrollToBottom()
      return
    }

    const decision: WeddingAssistantDecision = {
      // Some small models forget `message` and use `text`/`reply`/`answer`.
      message: String(
        rawDecision?.message ??
          rawDecision?.text ??
          rawDecision?.reply ??
          rawDecision?.answer ??
          ''
      ),
      action: {
        name: (rawDecision?.action?.name ?? 'none') as WeddingAssistantActionName,
        args: (rawDecision?.action?.args ?? {}) as Record<string, unknown>
      },
      // tolerate common model mistakes: update/button singular
      updates: (rawDecision?.updates ?? rawDecision?.update ?? undefined) as any,
      buttons: (rawDecision?.buttons ?? rawDecision?.button ?? undefined) as any
    }

    // Enforce authentication UI rules (don�t allow login button spam)
    const modelButtons = Array.isArray(decision.buttons) ? decision.buttons : []
    if (isAuthed) {
      decision.buttons = modelButtons.filter(b => (b as any)?.type !== 'login')
      if (decision.action?.name === 'open_login') decision.action.name = 'none'
    } else {
      if (decision.action?.name === 'open_login') {
        decision.buttons = [{ type: 'login', label: 'Login', variant: 'primary' }]
      } else {
        decision.buttons = modelButtons.filter(b => (b as any)?.type !== 'login')
      }
    }

    // Apply extracted updates
    if (decision.updates) {
      if (decision.updates.heading !== undefined) {
        customHeading.value = decision.updates.heading
        headingStepComplete.value = !!decision.updates.heading
      }
      if (decision.updates.name1 !== undefined) extractedInfo.value.names.name1 = decision.updates.name1
      if (decision.updates.name2 !== undefined) extractedInfo.value.names.name2 = decision.updates.name2
      if (decision.updates.date !== undefined) extractedInfo.value.date = decision.updates.date
      if (decision.updates.courtesy !== undefined) extractedInfo.value.courtesy = decision.updates.courtesy
      if (decision.updates.size !== undefined) {
        extractedInfo.value.size = decision.updates.size
        formData.customSize = decision.updates.size ?? ''
      }

      syncWeddingDescriptionFromState()

      // If preview already exists, update SVG text immediately (no regeneration)
      if (showWeddingStickerPreview.value) {
        await processDescriptionInput()
        updateChatPreviewSVG()
      }
    }

    isAnalyzing.value = false

    // Push assistant message
    // Prefer the structured `decision.message`, but if it's empty, fall back to raw AI text.
    let msgText =
      (decision.message || '').toString().trim() ||
      ''
    
    // Filter out JSON-like or placeholder responses  
    const badPatterns = /^(your reply|your response|<write|message here|here is|revised|\{|\[|json|structure|\`\`\`)|(\[new_name\]|\[name\]|\[date\]|\[message\])/i
    if (!msgText || badPatterns.test(msgText)) {
      const hasName = !!extractedInfo.value.names.name1
      const hasDate = !!extractedInfo.value.date  
      const hasCourtesy = !!extractedInfo.value.courtesy
      if (hasName && hasDate && hasCourtesy) {
        msgText = 'I have all your details! Ready to generate your wedding sticker?'
      } else {
        const need: string[] = []
        if (!hasName) need.push('names')
        if (!hasDate) need.push('date')
        if (!hasCourtesy) need.push('courtesy message')
        msgText = need.length > 0 
          ? 'Please share the ' + need.join(', ') + ' for your wedding sticker.'
          : 'How can I help with your wedding sticker?'
      }
    }
    
    const _unused =
      'I�m here � tell me what you want to design.'
    chatMessages.value.push({
      id: Date.now(),
      text: msgText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: Array.isArray(decision.buttons) ? decision.buttons : undefined
    } as any)
    scrollToBottom()

    const actionName = decision.action?.name ?? 'none'
    const actionArgs = decision.action?.args ?? {}

    // Execute actions (when applicable)
    if (actionName === 'open_login') {
      authStore.openAuthModal('login')
      return
    }

    if (actionName === 'ask_upload') {
      return
    }

    if (actionName === 'set_size') {
      const size = (actionArgs as any).size as string | undefined
      if (size) {
        setWeddingSize(size)
        const parsed = parseSizeToInches(String(size))
        if (parsed) await handleSizeChange(parsed.w, parsed.h)
      }
      return
    }

    if (actionName === 'generate_preview') {
      // Guard: ensure we have minimum required fields
      const hasNames = !!extractedInfo.value.names.name1
      const hasDate = !!extractedInfo.value.date
      const hasCourtesy = !!extractedInfo.value.courtesy
      if (!hasNames || !hasDate || !hasCourtesy) return
      requestWeddingPreviewGeneration()
      return
    }

    if (actionName === 'open_edit') {
      if (!showWeddingStickerPreview.value) return
      openEditModal()
      return
    }

    if (actionName === 'download_png') {
      if (!showWeddingStickerPreview.value) return
      exportWeddingSticker('png')
      return
    }

    if (actionName === 'regenerate') {
      if (!showWeddingStickerPreview.value) return
      await handleGenerateNew()
      return
    }
  } catch (e) {
    if (reqId !== weddingChatRequestId) return
    console.log('?? Ollama unavailable, using local extraction')
    
    // Try local extraction when Ollama fails
    const localResult = extractWeddingDetails(lastUserMessage, {
      hasName: !!extractedInfo.value.names.name1,
      hasDate: !!extractedInfo.value.date
    })
    
    // Apply any extracted data (composable uses title, name1, name2, date, courtesy)
    if (localResult.title && !customHeading.value) {
      customHeading.value = localResult.title
      headingStepComplete.value = true
    }
    if (localResult.name1) extractedInfo.value.names.name1 = localResult.name1
    if (localResult.name2) extractedInfo.value.names.name2 = localResult.name2
    if (localResult.date) extractedInfo.value.date = localResult.date
    if (localResult.courtesy) extractedInfo.value.courtesy = localResult.courtesy
    
    // If something was found, sync and update
    if (localResult.foundSomething) {
      syncWeddingDescriptionFromState()
      if (showWeddingStickerPreview.value) {
        await processDescriptionInput()
        updateChatPreviewSVG()
      }
    }
    
    // Generate a friendly response
    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date
    const hasCourtesy = !!extractedInfo.value.courtesy
    
    let responseText = ''
    if (localResult.foundSomething) {
      const noted: string[] = []
      if (localResult.name1) noted.push(`Names: ${localResult.name1}${localResult.name2 ? ' & ' + localResult.name2 : ''}`)
      if (localResult.date) noted.push(`Date: ${localResult.date}`)
      if (localResult.courtesy) noted.push(`Message: ${localResult.courtesy}`)
      
      const missing: string[] = []
      if (!hasName) missing.push('names')
      if (!hasDate) missing.push('date')
      if (!hasCourtesy) missing.push('courtesy message')
      
      if (hasName && hasDate && hasCourtesy) {
        responseText = `Got it! I've noted:\n? ${noted.join('\n? ')}\n\nReady to generate your wedding sticker?`
      } else {
        responseText = `Got it! I've noted:\n? ${noted.join('\n? ')}\n\nI still need: ${missing.join(', ')}.`
      }
    } else {
      // Nothing extracted - provide guidance
      const missing: string[] = []
      if (!hasName) missing.push('names (e.g., "John & Sarah")')
      if (!hasDate) missing.push('date (e.g., "June 15, 2025")')
      if (!hasCourtesy) missing.push('courtesy message (e.g., "With love from the family")')
      
      if (missing.length > 0) {
        responseText = `Please share the ${missing.join(', ')} for your wedding sticker.`
      } else {
        responseText = 'I have all your details! Would you like to generate your wedding sticker?'
      }
    }
    
    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
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

async function handleSizeChange(widthInches: number, heightInches: number) {
  console.log(`?? Resizing to ${widthInches}x${heightInches} inches`)

  if (!weddingPreviewContainer.value) {
    console.error('? weddingPreviewContainer not available for resize')
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.error('? SVG element not found for resize')
    return
  }

  // Get ORIGINAL viewBox dimensions (store them if not already stored)
  let originalViewBox = svgElement.getAttribute('data-original-viewbox')?.split(/\s+|,/).map(Number)

  if (!originalViewBox || originalViewBox.length !== 4) {
    // First time - store the original viewBox
    const currentViewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
    if (currentViewBox && currentViewBox.length === 4) {
      svgElement.setAttribute('data-original-viewbox', currentViewBox.join(' '))
      originalViewBox = currentViewBox
    } else {
      const w = parseFloat(svgElement.getAttribute('width') || '1600')
      const h = parseFloat(svgElement.getAttribute('height') || '1600')
      originalViewBox = [0, 0, w, h]
      svgElement.setAttribute('data-original-viewbox', originalViewBox.join(' '))
    }
  }

  const origWidth = originalViewBox[2]
  const origHeight = originalViewBox[3]

  // Convert inches to pixels at 300 DPI for print quality
  const DPI = 300
  const widthPixels = widthInches * DPI
  const heightPixels = heightInches * DPI

  // Calculate aspect ratios
  const origAspectRatio = origWidth / origHeight
  const newAspectRatio = widthInches / heightInches

  // 1. Store physical size for export (in pixels and inches)
  svgElement.setAttribute('data-export-width', `${widthInches}in`)
  svgElement.setAttribute('data-export-height', `${heightInches}in`)
  svgElement.setAttribute('data-export-width-px', `${widthPixels}`)
  svgElement.setAttribute('data-export-height-px', `${heightPixels}`)

  // 2. Calculate uniform scale factor to fit content in new dimensions
  // We use the SMALLER scale to ensure content fits (no overflow)
  const scaleToFitWidth = widthPixels / origWidth
  const scaleToFitHeight = heightPixels / origHeight
  const uniformScale = Math.min(scaleToFitWidth, scaleToFitHeight)

  // 3. Calculate the new viewBox dimensions that match the new aspect ratio
  // Keep the viewBox proportional to the new physical dimensions
  let newViewBoxWidth: number
  let newViewBoxHeight: number

  if (newAspectRatio > origAspectRatio) {
    // New aspect is wider - extend width
    newViewBoxHeight = origHeight
    newViewBoxWidth = origHeight * newAspectRatio
  } else {
    // New aspect is taller - extend height
    newViewBoxWidth = origWidth
    newViewBoxHeight = origWidth / newAspectRatio
  }

  // 4. Update ViewBox to match new aspect ratio
  svgElement.setAttribute('viewBox', `0 0 ${newViewBoxWidth} ${newViewBoxHeight}`)

  // 5. Set explicit width/height for proper scaling during export
  svgElement.setAttribute('width', `${widthPixels}`)
  svgElement.setAttribute('height', `${heightPixels}`)

  // 6. For display, use responsive sizing
  svgElement.style.width = '100%'
  svgElement.style.height = 'auto'
  svgElement.style.maxWidth = '100%'
  svgElement.style.display = 'block'

  console.log(`?? Original: ${origWidth}x${origHeight}, New viewBox: ${newViewBoxWidth.toFixed(0)}x${newViewBoxHeight.toFixed(0)}`)
  console.log(`?? Export: ${widthPixels}x${heightPixels}px (${widthInches}x${heightInches}" at ${DPI} DPI)`)

  // 7. Calculate content offset to center it in the new viewBox
  const contentOffsetX = (newViewBoxWidth - origWidth) / 2
  const contentOffsetY = (newViewBoxHeight - origHeight) / 2

  // 8. Find or create a content wrapper group
  let contentWrapper = svgElement.querySelector('#content-wrapper') as SVGGElement

  if (!contentWrapper) {
    // Create a wrapper group for all content
    contentWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    contentWrapper.setAttribute('id', 'content-wrapper')

    // Move all children into the wrapper (except defs)
    const children = Array.from(svgElement.children)
    children.forEach(child => {
      if (child.tagName !== 'defs' && child.id !== 'content-wrapper') {
        contentWrapper.appendChild(child)
      }
    })
    svgElement.appendChild(contentWrapper)
  }

  // 9. Apply transform to center content in the new viewBox
  // This keeps all content centered when aspect ratio changes
  if (contentOffsetX !== 0 || contentOffsetY !== 0) {
    contentWrapper.setAttribute('transform', `translate(${contentOffsetX}, ${contentOffsetY})`)
  } else {
    contentWrapper.removeAttribute('transform')
  }

  // 10. Update background rects to fill the new viewBox
  const bgRects = svgElement.querySelectorAll('rect')
  bgRects.forEach(rect => {
    const rectW = parseFloat(rect.getAttribute('width') || '0')
    const rectH = parseFloat(rect.getAttribute('height') || '0')
    const rectX = parseFloat(rect.getAttribute('x') || '0')
    const rectY = parseFloat(rect.getAttribute('y') || '0')

    // Check if this is a full-size background rect
    if (Math.abs(rectW - origWidth) < 10 && Math.abs(rectH - origHeight) < 10) {
      // This is a background rect - make it fill the new viewBox
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '0')
      rect.setAttribute('width', String(newViewBoxWidth))
      rect.setAttribute('height', String(newViewBoxHeight))

      // Move it out of the content wrapper to the SVG root (so it's behind everything)
      if (rect.parentElement === (contentWrapper as unknown as HTMLElement)) {
        svgElement.insertBefore(rect, contentWrapper)
      }
    }
  })
  
  // 11. Update the clip-path (imageClip) to match new SVG dimensions
  // Original SVG: viewBox="0 0 2996.9 1685.75"
  // Original clip rect: x="1400" y="0" width="1580" height="1685.75" (full height)
  const clipPathRect = svgElement.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
  if (clipPathRect) {
    // Original clip values from template.svg (now starting from y=0)
    const origClipX = 1400
    const origClipY = 0
    const origClipWidth = 1580
    const origClipHeight = 1685.75  // Full SVG height
    
    // Calculate scale factors
    const scaleX = newViewBoxWidth / origWidth
    const scaleY = newViewBoxHeight / origHeight
    
    // Scale clip rect proportionally
    // For height: we want to span from top (y=0) to bottom of SVG
    // For width: scale proportionally based on width change
    const newClipX = origClipX * scaleX + contentOffsetX
    const newClipY = 0 // Start from very top
    const newClipWidth = origClipWidth * scaleX
    const newClipHeight = newViewBoxHeight // Span full SVG height
    
    console.log(`?? Updating clip-path rect:`)
    console.log(`   x: ${origClipX} ? ${newClipX.toFixed(1)}`)
    console.log(`   y: ${origClipY} ? ${newClipY}`)
    console.log(`   width: ${origClipWidth} ? ${newClipWidth.toFixed(1)}`)
    console.log(`   height: ${origClipHeight} ? ${newClipHeight.toFixed(1)}`)
    
    clipPathRect.setAttribute('x', String(newClipX))
    clipPathRect.setAttribute('y', String(newClipY))
    clipPathRect.setAttribute('width', String(newClipWidth))
    clipPathRect.setAttribute('height', String(newClipHeight))
  } else {
    console.warn('?? clipPath#imageClip rect not found')
  }

  // 12. Scale the wave paths to extend to the new SVG height
  // The wave paths are decorative curves at the bottom - they need to extend to fill the new height
  const wavePaths = svgElement.querySelectorAll('path[fill="#FFCC29"], path[fill="url(#g1)"], path[fill="#507C95"], path[fill="#104C6E"]')
  if (wavePaths.length > 0) {
    const heightRatio = newViewBoxHeight / origHeight
    console.log(`?? Scaling ${wavePaths.length} wave paths by height ratio: ${heightRatio.toFixed(2)}`)
    
    wavePaths.forEach((path, index) => {
      const d = path.getAttribute('d')
      if (d) {
        // Scale the Y coordinates and heights in the path data
        // The paths end with values like "v909.24H0z" - we need to scale the vertical values
        const scaledD = d.replace(/v([\d.]+)/g, (match, val) => {
          const scaledVal = parseFloat(val) * heightRatio
          return `v${scaledVal.toFixed(2)}`
        }).replace(/H0z$/, `H0z`) // Keep the horizontal close
        
        // Also scale the starting Y position in commands like "M0 776.51c..."
        // And the Y values in cubic bezier curves
        const finalD = scaledD.replace(/([MmCcSsQqTtAaLlHhVv])([\d.-]+)\s+([\d.-]+)/g, (match, cmd, x, y) => {
          if (cmd === 'M' || cmd === 'm' || cmd === 'c' || cmd === 'C') {
            // For move and curve commands, scale Y coordinates
            return `${cmd}${x} ${(parseFloat(y) * heightRatio).toFixed(2)}`
          }
          return match
        })
        
        path.setAttribute('d', finalD)
        console.log(`   Wave ${index + 1} scaled`)
      }
    })
  }

  // 13. Reposition text elements (names, date, courtesy) to move down slightly with the new height
  // When the SVG gets taller, these text elements should move down just a bit to stay in the wave area
  // We use a small fraction (30%) of the height delta to avoid moving too far down
  const heightDelta = newViewBoxHeight - origHeight // How much taller the SVG is now
  if (heightDelta > 0) {
    // Move text down by only 30% of the height increase - enough to adjust but not too far
    const textOffset = heightDelta * 0.3
    console.log(`?? Repositioning text elements by ${textOffset.toFixed(1)}px (30% of ${heightDelta.toFixed(1)}px)`)
    
    // Move date text down slightly
    const dateTextEl = svgElement.querySelector('#date-text') as SVGTextElement
    if (dateTextEl) {
      const currentY = parseFloat(dateTextEl.getAttribute('y') || '1480')
      const newY = currentY + textOffset
      dateTextEl.setAttribute('y', String(newY))
      console.log(`   Date text: y ${currentY} ? ${newY}`)
    }
    
    // Move courtesy text down slightly
    const courtesyTextEl = svgElement.querySelector('#courtesy-text') as SVGTextElement
    if (courtesyTextEl) {
      const currentY = parseFloat(courtesyTextEl.getAttribute('y') || '1600')
      const newY = currentY + textOffset
      courtesyTextEl.setAttribute('y', String(newY))
      console.log(`   Courtesy text: y ${currentY} ? ${newY}`)
    }
    
    // Move wedding names group down slightly
    const weddingNamesGroup = svgElement.querySelector('#wedding-names-group') as SVGGElement
    if (weddingNamesGroup) {
      const transform = weddingNamesGroup.getAttribute('transform') || 'translate(400, 900) scale(2.5)'
      // Parse the current translate values
      const translateMatch = transform.match(/translate\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/)
      if (translateMatch) {
        const currentX = parseFloat(translateMatch[1])
        const currentY = parseFloat(translateMatch[2])
        const newY = currentY + textOffset
        const newTransform = transform.replace(/translate\([^)]+\)/, `translate(${currentX}, ${newY})`)
        weddingNamesGroup.setAttribute('transform', newTransform)
        console.log(`   Names group: translate y ${currentY} ? ${newY}`)
      }
    }
  }

  // 14. Update background image dimensions to match new viewBox
  const bgImage = svgElement.querySelector('#background-image') as SVGImageElement
  if (bgImage) {
    bgImage.setAttribute('width', String(newViewBoxWidth))
    bgImage.setAttribute('height', String(newViewBoxHeight))
    bgImage.setAttribute('x', '0')
    bgImage.setAttribute('y', '0')
    console.log(`?? Updated background image to ${newViewBoxWidth}x${newViewBoxHeight}`)
  }

  // Force refresh
  await nextTick()
  
  // Update image dimensions after clip-path is resized
  updateSVGWithImages()
  
  // Update the chat preview container with the resized SVG
  updateChatPreviewSVG()

  console.log(`? Size change complete: ${widthInches}x${heightInches} inches`)
}

async function analyzeMessage(lastUserMessage: string) {
  await analyzeMessageWithOllama(lastUserMessage)
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
  console.log('?? Category selected:', categoryId)
  
  selectedCategory.value = categoryId
  console.log('? selectedCategory.value set to:', selectedCategory.value)
  console.log('?? Should show form now:', !!selectedCategory.value)
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
    console.error('Failed to generate design:', error)
    authStore.showNotification({
      title: 'Generation Failed',
      message: error.message || 'Failed to generate sticker design',
      type: 'error'
    })
    // Go back to form on error
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

// Reset ALL wedding-related state for fresh start
function resetWeddingState() {
  // Clear extracted info (names, date, courtesy, etc.)
  extractedInfo.value = {
    title: null,
    date: null,
    courtesy: null,
    size: null,
    names: { name1: null, name2: null }
  }
  
  // Clear heading state
  customHeading.value = null
  selectedHeadingFont.value = null
  headingStepComplete.value = false
  awaitingTitleConfirmation.value = false
  pendingTitle.value = null
  awaitingHeadingInput.value = false
  awaitingFontChoice.value = false
  
  // Clear accumulated description
  accumulatedDescription.value = ''
  formData.description = ''
  formData.customSize = ''

  // Require size again for a fresh start
  sizeStepComplete.value = false
  awaitingSizeDecision.value = false
  
  // Clear chat messages
  chatMessages.value = []
  
  // Clear image state
  preGeneratedImageFile.value = null
  preGeneratedImagePreview.value = null
  pendingImageFile.value = null
  awaitingBackgroundRemovalDecision.value = false
  uploadedImages.value = []
  lastUploadedImage.value = null
  
  // Reset flags
  hasDesignBeenGenerated.value = false
  showWeddingStickerPreview.value = false
  isGeneratingPreview.value = false
  isAnalyzing.value = false
  
  // Reset asked questions
  resetAskedQuestions()
  
  // Clear SVG images
  svgImageManager.clearAllImages()
  
  console.log('🔄 Wedding state reset complete')
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
    console.error('? weddingPreviewContainer.value is null!')
    return
  }

  console.log('?? Loading wedding sticker template...')

  try {
    // Reset replacement state when loading new template
    resetReplacement()

    // ?? INLINE SVG TEMPLATE - No server fetch needed
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 2996.9 1685.75" preserveAspectRatio="xMidYMid meet">
  
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&amp;family=Lato:wght@400;700&amp;display=swap');
      
      text {
        font-family: 'Lato', 'Arial', 'Helvetica', sans-serif;
      }
      
      .serif-font {
        font-family: 'Playfair Display', 'Times New Roman', 'Georgia', serif;
      }
    </style>
    
    <!-- Gradient for wave layer -->
    <linearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFCC29;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF9900;stop-opacity:1" />
    </linearGradient>

    <!-- Clip path for image - Full-height rectangular box -->
    <clipPath id="imageClip">
      <rect x="1400" y="0" width="1580" height="1685.75" rx="0" ry="0"/>
    </clipPath>
  </defs>
  
  <!-- Background -->
  <rect fill="#F8F8F8" width="2996.89" height="1685.75"/>
  
  <!-- Wave layers -->
  <path fill="#FFCC29" d="M0 776.51c926.95 695.48 1904.9-707.13 2996.89 0v909.24H0z"/>
  <path fill="url(#g1)" d="M0 776.51c926.95 695.48 1904.9-640.76 2996.89 66.37v842.88H0z"/>
  <path fill="#507C95" d="M0 539.04c926.95 695.49 1904.9-177.45 2996.89 529.68v617.04H0z"/>
  <path fill="#104C6E" d="M0 616.09c926.95 695.48 1904.9-254.49 2996.89 452.63v617.04H0z"/>

  <!-- User image with clip path applied - starts from top of clip area -->
  <image id="userImage" x="1400" y="0" width="1580" height="1685.75" 
         opacity="1" 
         href="" 
         clip-path="url(#imageClip)"
         preserveAspectRatio="xMidYMid slice"/>

  <!-- Editable text elements with IDs -->
  <text id="blessing-text" class="serif-font" x="850.45" y="350" text-anchor="middle" font-size="160" fill="#000">Alhamdulillahi</text>
  <text id="occasion-text" x="850.45" y="420" text-anchor="middle" font-size="45" font-weight="bold" fill="#000">ON YOUR</text>
  <text id="event-type-text" class="serif-font" x="850.45" y="570" text-anchor="middle" font-size="180" font-weight="bold" fill="#104C6E">WEDDING</text>
  <text id="ceremony-text" x="850.45" y="690" text-anchor="middle" font-size="130" font-weight="bold" fill="red">CEREMONY</text>
  
  <!-- New Wedding Names - Clean version positioned on the left side, not overlapping image -->
  <g id="wedding-names-group" transform="translate(450, 950) scale(2.0)">
    <text id="name1-first" x="0" y="85" fill="#000000" font-size="84.15" font-weight="bold">Muhammad</text>
    <text id="name2-first" x="60" y="160" fill="#000000" font-size="84.15" font-weight="bold">Hauwawu</text>
    <text id="name-separator" x="-20" y="160.4" fill="#B8860B" font-size="84.15" font-weight="bold">&amp;</text>
  </g>
  <text id="date-text" x="750" y="1450" text-anchor="middle" font-size="100" font-weight="bold" fill="#000000">8th March, 2025</text>
  <text id="courtesy-text" x="750" y="1580" text-anchor="middle" font-size="85" font-weight="bold" fill="#333333">Courtesy: Maijama'a Famiy</text>
</svg>`

    const successSource = 'Inline Template'
    console.log(`? Using inline SVG template`)

    console.log('?? SVG text length:', svgText.length)
    console.log('?? First 200 chars:', svgText.substring(0, 200))

    // Insert SVG into container
    weddingPreviewContainer.value.innerHTML = svgText
    console.log('? SVG inserted into container')
    
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
      console.error('? SVG element not found after insertion!')
      console.error('Container HTML:', weddingPreviewContainer.value.innerHTML.substring(0, 200))
      return
    }
    
    console.log('? SVG element found:', svgElement)
    
    if (svgElement) {
      // Set responsive dimensions based on viewBox aspect ratio (NOT fixed 400x400)
      // The viewBox controls the content - width/height should match the aspect ratio
      const viewBox = svgElement.getAttribute('viewBox')
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(Number)
        if (parts.length >= 4) {
          const vbWidth = parts[2]
          const vbHeight = parts[3]
          // Set width="100%" for responsive display, keep aspect ratio via viewBox
          svgElement.setAttribute('width', '100%')
          svgElement.removeAttribute('height') // Let aspect ratio determine height
          // Store original dimensions for export
          svgElement.setAttribute('data-original-viewbox', viewBox)
          console.log(`?? SVG viewBox: ${vbWidth}x${vbHeight} (aspect: ${(vbWidth/vbHeight).toFixed(2)})`)
        }
      } else if (!svgElement.hasAttribute('viewBox')) {
        // Only set default viewBox if none exists
        const width = svgElement.getAttribute('width') || '2996.9'
        const height = svgElement.getAttribute('height') || '1685.75'
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
      }

      svgElements = getSVGElements(svgElement)

      // Use Title Library to find matching title SVG based on description or custom heading
      const textToMatch = customHeading.value || accumulatedDescription.value || formData.description || 'wedding'
      const matchedTitle = findMatchingTitle(textToMatch)
      
      console.log('?? SVG Element before handleReplacement:', svgElement)
      console.log('?? SVG Element IDs found:', {
        blessingText: !!svgElement.querySelector('#blessing-text'),
        occasionText: !!svgElement.querySelector('#occasion-text'),
        eventTypeText: !!svgElement.querySelector('#event-type-text'),
        ceremonyText: !!svgElement.querySelector('#ceremony-text')
      })
      
      try {
        // Get title color based on current background
        const titleColor = getTitleColorForBackground()
        console.log('?? Title color for current background:', titleColor)
        
        if (matchedTitle) {
          console.log('?? Title Library match found:', matchedTitle.fallbackText)
          console.log('?? Using SVG:', matchedTitle.svgPath)
          
          // Pre-render SVG to PNG for reliable export (allows color changes)
          await replaceTitleWithImage(svgElement, {
            svgPath: matchedTitle.svgPath,
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
            scale: matchedTitle.scale || 1.0,
            color: titleColor
          })
        } else {
          console.log('?? No title match, using default wedding title')
          // Use default SVG title
          await replaceTitleWithImage(svgElement, {
            svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: { x: -30, y: 50, width: 1800, height: 900 },
            scale: 1.0,
            color: titleColor
          })
        }
        console.log('? handleReplacement completed successfully')
        console.log('?? Title replacement group exists:', !!svgElement.querySelector('#wedding-title-replacement'))
        
        // Insert flourish above names with matching color
        const flourishColor = getFlourishColorForBackground()
        await insertFlourishAboveNames(svgElement, flourishColor)
      } catch (handleReplacementError) {
        console.error('? handleReplacement failed:', handleReplacementError)
      }

      // Apply current description if any (for names, date, etc.)
      if (formData.description) {
        await handleNamesWithTitleSVG(formData.description, svgElements)
      }

      // Note: Don't show a toast here; this runs during generation and would be noisy.
    }
  } catch (error) {
    console.error('? Failed to load wedding sticker template:', error)
    authStore.showNotification({
      title: 'Template Load Failed',
      message: 'Failed to load wedding sticker template. Please check the console for details.',
      type: 'error'
    })
  }
}

// State to track crop context.
// const isPreGenerationCrop = ref(false)

// Helper function to update only date and courtesy (not names) when title SVG is active
function updateDateAndCourtesy(description: string, svgElements: any) {
  console.log('?? updateDateAndCourtesy called with:', { description, svgElements: !!svgElements })
  // Extract date from description
  const extractDate = (desc: string): string | null => {
    // Match patterns like "15th March 2025", "March 15, 2025", "2025-03-15"
    const datePatterns = [
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s*\d{4})/i,
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}/i,
      /\d{4}-\d{2}-\d{2}/,
      /\d{1,2}\/\d{1,2}\/\d{4}/
    ]
    
    for (const pattern of datePatterns) {
      const match = desc.match(pattern)
      if (match) return match[0].trim()
    }
    return null
  }

  // Extract courtesy from description  
  const extractCourtesy = (desc: string): { text: string, prefix: string } | null => {
    const courtesyPattern = /courtesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const courtesyMatch = desc.match(courtesyPattern)
    if (courtesyMatch) return { text: courtesyMatch[1].trim(), prefix: 'Courtesy:' }
    
    const cutCeePattern = /cut-cee:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const cutCeeMatch = desc.match(cutCeePattern)
    if (cutCeeMatch) return { text: cutCeeMatch[1].trim(), prefix: 'CUT-CEE:' }
    
    return null
  }

  // Update date if found
  const dateText = extractDate(description)
  if (dateText && svgElements.dateText) {
    svgElements.dateText.textContent = dateText
    console.log('?? Date updated:', dateText)
  }

  // Update courtesy if found
  const courtesyData = extractCourtesy(description)
  if (courtesyData && svgElements.courtesyText) {
    svgElements.courtesyText.textContent = `${courtesyData.prefix} ${courtesyData.text}`
    console.log('?? Courtesy updated:', courtesyData)
  }
}

// Helper function to handle names when title SVG is active (use decorative name02.svg)
async function handleNamesWithTitleSVG(description: string, svgElements: any) {
  // Ensure description is a string
  const safeDescription = typeof description === 'string' ? description : String(description || '')
  console.log('🔍 handleNamesWithTitleSVG called with:', { description: safeDescription })
  
  // Always call updateStickerText to ensure date and courtesy are updated
  // regardless of whether names are present or not
  const data = await updateStickerText(safeDescription, svgElements)
  
  // Extract names from parentheses for logging purposes
  const nameMatch = safeDescription.match(/\(([^)]+)\)/)?.[1]
  
  if (nameMatch) {
    const names = nameMatch.split(/\s*[&and]+\s*/i).map(name => name.trim())
    if (names.length === 2 && svgElements?.weddingNamesGroup) {
      console.log('? Two names detected, decorative SVG injection handled by updateStickerText')
    }
  }
  
  return data
}

// Auto-completion handler for description field
function handleDescriptionKeydown(event: KeyboardEvent) {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = formData.description.substring(0, cursorPos)
  
  // Auto-pair parentheses
  if (event.key === '(') {
    event.preventDefault()
    const textAfterCursor = formData.description.substring(cursorPos)
    formData.description = textBeforeCursor + '()' + textAfterCursor
    // Position cursor between parentheses
    setTimeout(() => {
      textarea.selectionStart = cursorPos + 1
      textarea.selectionEnd = cursorPos + 1
    }, 0)
    console.log('? Auto-paired parentheses')
  }
  
  // Auto-complete courtesy keywords
  if (event.key === ' ' || event.key === 'Tab') {
    const lastWord = textBeforeCursor.split(/\s+/).pop()?.toLowerCase() || ''
    
    // List of courtesy keyword variations to auto-complete
    const courtesyKeywords = [
      { trigger: 'cour', complete: 'courtesy:' },
      { trigger: 'court', complete: 'courtesy:' },
      { trigger: 'courte', complete: 'courtesy:' },
      { trigger: 'courtes', complete: 'courtesy:' },
      { trigger: 'coutesy', complete: 'courtesy:' },
      { trigger: 'coutees', complete: 'courtesy:' },
      { trigger: 'cut', complete: 'cut-cee:' },
      { trigger: 'cutcee', complete: 'cut-cee:' },
      { trigger: 'cut-cee', complete: 'cut-cee:' },
      { trigger: 'cutc', complete: 'cut-cee:' },
    ]
    
    const match = courtesyKeywords.find(k => lastWord === k.trigger)
    
    if (match) {
      event.preventDefault()
      // Replace the trigger word with the complete keyword
      const wordsBeforeLast = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length)
      const textAfterCursor = formData.description.substring(cursorPos)
      formData.description = wordsBeforeLast + match.complete + ' ' + textAfterCursor
      
      // Position cursor after the completed keyword
      setTimeout(() => {
        const newPos = wordsBeforeLast.length + match.complete.length + 1
        textarea.selectionStart = newPos
        textarea.selectionEnd = newPos
      }, 0)
      
      console.log(`? Auto-completed "${lastWord}" to "${match.complete}"`)
    }
  }
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
 * This function updates the blessing, occasion, eventType, and ceremony text elements
 * with the user's custom heading and selected font
 */
function applyCustomHeadingAndFont(svgElement: SVGSVGElement) {
  if (!customHeading.value && !selectedHeadingFont.value) {
    return // Nothing to apply
  }

  // Get heading elements
  const blessingText = svgElement.querySelector('#blessing-text') as SVGTextElement
  const occasionText = svgElement.querySelector('#occasion-text') as SVGTextElement
  const eventTypeText = svgElement.querySelector('#event-type-text') as SVGTextElement
  const ceremonyText = svgElement.querySelector('#ceremony-text') as SVGTextElement

  const headingElements = [blessingText, occasionText, eventTypeText, ceremonyText].filter(el => el !== null)

  // Apply custom heading if set
  if (customHeading.value) {
    // Parse the custom heading into parts
    const headingParts = customHeading.value.split(/\s+/)

    // Distribute heading across available elements
    if (headingParts.length >= 4 && blessingText && occasionText && eventTypeText && ceremonyText) {
      // 4+ words: distribute across all elements
      blessingText.textContent = headingParts[0]
      occasionText.textContent = headingParts.slice(1, 3).join(' ').toUpperCase()
      eventTypeText.textContent = headingParts[3].toUpperCase()
      ceremonyText.textContent = headingParts.slice(4).join(' ').toUpperCase() || ''
    } else if (headingParts.length === 3 && blessingText && occasionText && eventTypeText) {
      // 3 words
      blessingText.textContent = headingParts[0]
      occasionText.textContent = headingParts[1].toUpperCase()
      eventTypeText.textContent = headingParts[2].toUpperCase()
      if (ceremonyText) ceremonyText.textContent = ''
    } else if (headingParts.length === 2 && blessingText && occasionText) {
      // 2 words
      blessingText.textContent = headingParts[0]
      occasionText.textContent = headingParts[1].toUpperCase()
      if (eventTypeText) eventTypeText.textContent = ''
      if (ceremonyText) ceremonyText.textContent = ''
    } else if (headingParts.length === 1 && blessingText) {
      // 1 word
      blessingText.textContent = headingParts[0]
      if (occasionText) occasionText.textContent = ''
      if (eventTypeText) eventTypeText.textContent = ''
      if (ceremonyText) ceremonyText.textContent = ''
    }

    console.log('?? Applied custom heading:', customHeading.value)
  }

  // Apply selected font if set
  if (selectedHeadingFont.value) {
    const fontFamily = selectedHeadingFont.value === 'playfair'
      ? "'Playfair Display', Georgia, serif"
      : "'Lato', 'Helvetica Neue', Arial, sans-serif"

    headingElements.forEach(el => {
      if (el) {
        el.style.fontFamily = fontFamily
        // Adjust font weight for better appearance
        el.style.fontWeight = selectedHeadingFont.value === 'playfair' ? '700' : '400'
      }
    })

    console.log('?? Applied heading font:', selectedHeadingFont.value, fontFamily)
  }
}

async function processDescriptionInput() {
  console.log('?? processDescriptionInput triggered:', { 
    description: formData.description, 
    category: selectedCategory.value, 
    hasSvgElements: !!svgElements 
  })

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
      // Use trimmed custom heading text when present (avoids nullable refs)
      const customHeadingText = (customHeading.value ?? '').trim()
      const textToMatch = customHeadingText || accumulatedDescription.value || formData.description
      const matchedTitle = findMatchingTitle(textToMatch)
      
      // Get title color based on current background
      const titleColor = getTitleColorForBackground()
      console.log('?? Title color for current background:', titleColor)

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
        console.log('?? Using Title Library match:', matchedTitle.fallbackText)
        console.log('?? SVG Path:', matchedTitle.svgPath)
        
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
          console.log('?? No title match, using default wedding title')
          await replaceTitleWithImage(svgElement, {
            svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
            targetElementIds: headingElementIds,
            position: { x: -30, y: 50, width: 1800, height: 900 },
            scale: 1.0,
            color: titleColor
          })
        }
      } else {
        console.log('? Title unchanged, skipping re-render')
      }
      }
      
      // Insert flourish above names with matching color
      const flourishColor = getFlourishColorForBackground()
      const flourishCacheKey = [flourishColor, currentBackgroundFileName.value || ''].join('|')
      const hasFlourish = !!svgElement.querySelector('#wedding-flourish')
      if (!hasFlourish || flourishCacheKey !== lastWeddingFlourishRenderKey) {
        lastWeddingFlourishRenderKey = flourishCacheKey
        await insertFlourishAboveNames(svgElement, flourishColor)
      } else {
        console.log('? Flourish unchanged, skipping re-render')
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
    console.error('SVG element or crop image file not found')
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
  // This will automatically read the placeholder position from the SVG
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

function handleImageScaleChange(eventOrScale: Event | number) {
  let scale: number
  
  if (typeof eventOrScale === 'number') {
    scale = eventOrScale
  } else {
    const target = eventOrScale.target as HTMLInputElement
    scale = parseFloat(target.value)
  }
  
  if (svgImageManager.selectedImageId.value) {
    const selectedImage = svgImageManager.images.value.find(
      img => img.id === svgImageManager.selectedImageId.value
    )
    if (selectedImage) {
      // Apply scale by adjusting width/height proportionally
      const newWidth = selectedImage.originalWidth * scale
      const newHeight = selectedImage.originalHeight * scale
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, { width: newWidth, height: newHeight })
      updateSVGWithImages()
    }
  }
}

function setImageScale(scale: number) {
  if (svgImageManager.selectedImageId.value) {
    const selectedImage = svgImageManager.images.value.find(
      img => img.id === svgImageManager.selectedImageId.value
    )
    if (selectedImage) {
      // Apply scale by adjusting width/height proportionally
      const newWidth = selectedImage.originalWidth * scale
      const newHeight = selectedImage.originalHeight * scale
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, { width: newWidth, height: newHeight })
      updateSVGWithImages()
    }
  }
}

function flipImage() {
  if (!svgImageManager.selectedImageId.value) {
    return
  }

  const selectedImage = svgImageManager.images.value.find(
    img => img.id === svgImageManager.selectedImageId.value
  )

  if (!selectedImage) {
    return
  }

  // Toggle flip state
  selectedImage.flipped = !selectedImage.flipped

  // Update SVG to reflect the change
  updateSVGWithImages()
}

async function autoRetouchImage() {
  const selectedImage = svgImageManager.getSelectedImage()
  
  if (!selectedImage) {
    authStore.showNotification({
      title: 'No Image Selected',
      message: 'Please select an image to enhance',
      type: 'info'
    })
    return
  }

  // Check if image has already been retouched
  if (selectedImage.isRetouched) {
    authStore.showNotification({
      title: 'Already Enhanced',
      message: 'This image has already been retouched',
      type: 'info'
    })
    return
  }

  try {
    isRetouching.value = true
    
    // Apply automatic retouch
    const retouchedDataUrl = await applyRetouch(selectedImage.dataUrl)
    
    // Update the image in the manager and mark as retouched
    if (svgImageManager.selectedImageId.value) {
      // Update dataUrl directly on the image object since it's excluded from updateImage
      selectedImage.dataUrl = retouchedDataUrl
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, {
        isRetouched: true
      })
      
      // Update SVG preview
      updateSVGWithImages()
      
      authStore.showNotification({
        title: 'Image Enhanced',
        message: 'Your image has been automatically retouched',
        type: 'success'
      })
    }
    
  } catch (error) {
    console.error('Auto retouch failed:', error)
    authStore.showNotification({
      title: 'Retouch Failed',
      message: 'Failed to enhance image. Please try again.',
      type: 'error'
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
    console.error('Failed to open retouch:', error)
    authStore.showNotification({
      title: 'Retouch Error',
      message: 'Failed to open image for retouching',
      type: 'error'
    })
  }
}

// Make SVG image draggable
function makeSVGImageDraggable(imageElement: SVGImageElement, imageId: string) {
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0
  let initialDistance = 0
  let initialScale = 1
  let baseWidth = 0
  let baseHeight = 0

  // Add visual feedback - make it clear the image is draggable
  imageElement.style.cursor = 'grab'
  imageElement.style.transition = 'opacity 0.2s, filter 0.2s'
  imageElement.setAttribute('data-draggable', 'true')
  
  // Add hover effect to indicate draggability
  imageElement.addEventListener('mouseenter', () => {
    if (!isDragging) {
      imageElement.style.filter = 'brightness(1.05)'
    }
  })
  imageElement.addEventListener('mouseleave', () => {
    if (!isDragging) {
      imageElement.style.filter = 'none'
    }
  })

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    startX = svgPt.x
    startY = svgPt.y
    initialX = parseFloat(imageElement.getAttribute('x') || '0')
    initialY = parseFloat(imageElement.getAttribute('y') || '0')

    imageElement.style.opacity = '0.8'
    imageElement.style.cursor = 'grabbing'
    imageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    let dx = svgPt.x - startX
    const dy = svgPt.y - startY

    // If image is flipped, invert horizontal drag direction
    const img = svgImageManager.images.value.find(i => i.id === imageId)
    if (img && img.flipped) {
      dx = -dx
    }

    const newX = initialX + dx
    const newY = initialY + dy

    imageElement.setAttribute('x', newX.toString())
    imageElement.setAttribute('y', newY.toString())

    // Update the image manager with new position
    svgImageManager.updateImage(imageId, { x: newX, y: newY })

    e.preventDefault()
  }

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
      imageElement.style.cursor = 'grab'
      imageElement.style.filter = 'none'
    }
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - drag
      isDragging = true
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

      startX = svgPt.x
      startY = svgPt.y
      initialX = parseFloat(imageElement.getAttribute('x') || '0')
      initialY = parseFloat(imageElement.getAttribute('y') || '0')

      imageElement.style.opacity = '0.8'
      imageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    } else if (e.touches.length === 2) {
      // Two finger - pinch to zoom
      isDragging = false
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      // Calculate scale from current dimensions vs original dimensions
      initialScale = img ? (img.width / img.originalWidth) : 1.15
      
      // Calculate base dimensions from current element size and scale
      const currentWidth = parseFloat(imageElement.getAttribute('width') || '0')
      const currentHeight = parseFloat(imageElement.getAttribute('height') || '0')
      
      // Avoid division by zero or invalid scale
      const safeScale = initialScale > 0 ? initialScale : 1
      baseWidth = currentWidth / safeScale
      baseHeight = currentHeight / safeScale
    }
    e.preventDefault()
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Single touch - drag
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

      let dx = svgPt.x - startX
      const dy = svgPt.y - startY

      // If image is flipped, invert horizontal drag direction
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img && img.flipped) {
        dx = -dx
      }

      const newX = initialX + dx
      const newY = initialY + dy

      imageElement.setAttribute('x', newX.toString())
      imageElement.setAttribute('y', newY.toString())

      // Update the image manager with new position
      svgImageManager.updateImage(imageId, { x: newX, y: newY })
    } else if (e.touches.length === 2) {
      // Two finger - pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const scaleFactor = currentDistance / initialDistance
      const newScale = Math.max(0.5, Math.min(2.5, initialScale * scaleFactor))
      
      // Update image scale
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img) {
        // Use calculated base dimensions instead of hardcoded values
        const adjustedWidth = baseWidth * newScale
        const adjustedHeight = baseHeight * newScale
        
        imageElement.setAttribute('width', adjustedWidth.toString())
        imageElement.setAttribute('height', adjustedHeight.toString())
        
        // Update in manager (will trigger re-render)
        const currentX = parseFloat(imageElement.getAttribute('x') || '0')
        const currentY = parseFloat(imageElement.getAttribute('y') || '0')
        svgImageManager.updateImage(imageId, { 
          x: currentX,
          y: currentY,
          scale: newScale 
        } as any)
      }
    }
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
      imageElement.style.filter = 'none'
    }
  }

  // Add event listeners
  imageElement.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  // Touch events
  imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })
  imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
  imageElement.addEventListener('touchend', handleTouchEnd)

  // Store cleanup function
  const cleanup = () => {
    imageElement.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    imageElement.removeEventListener('touchstart', handleTouchStart)
    imageElement.removeEventListener('touchmove', handleTouchMove)
    imageElement.removeEventListener('touchend', handleTouchEnd)
  }

  // Store cleanup reference on element
  ;(imageElement as any).__dragCleanup = cleanup
}

function updateSVGWithImages() {
  if (!weddingPreviewContainer.value) {
    console.warn('⚠️ updateSVGWithImages: weddingPreviewContainer not available')
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.warn('⚠️ updateSVGWithImages: SVG element not found')
    return
  }

  const images = svgImageManager.images.value
  
  console.log('📸 updateSVGWithImages called:', {
    imagesCount: images.length,
    hasImages: images.length > 0,
    firstImageDataUrlLength: images[0]?.dataUrl?.length || 0,
    firstImageId: images[0]?.id || 'none',
    allImageIds: images.map(i => i.id)
  })
  
  // If no images in manager but we have preGeneratedImageFile, add it
  if (images.length === 0 && preGeneratedImageFile.value) {
    console.warn('⚠️ No images in svgImageManager but preGeneratedImageFile exists - this should not happen!')
    console.log('📷 preGeneratedImageFile:', preGeneratedImageFile.value.name, preGeneratedImageFile.value.size)
  }
  
  // Check for the specific userImage element we want to control (or fallback to placeholder-image)
  let userImageElement = svgElement.querySelector('#userImage') || svgElement.querySelector('#placeholder-image')
  
  // If no image element exists, create one
  if (!userImageElement && images.length > 0) {
    userImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    userImageElement.setAttribute('id', 'userImage')
    // Insert as first child so it's behind text
    if (svgElement.firstChild) {
      svgElement.insertBefore(userImageElement, svgElement.firstChild)
    } else {
      svgElement.appendChild(userImageElement)
    }
  }
  
  if (userImageElement && images.length > 0) {
    // We are in "replace placeholder" mode
    // Use the LAST image to populate #userImage (in case multiple were added, we want the latest)
    const img = images[images.length - 1]

    // Determine frame dimensions based on SVG size
    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number)
    const svgWidth = viewBox ? viewBox[2] : parseFloat(svgElement.getAttribute('width') || '400')
    const svgHeight = viewBox ? viewBox[3] : parseFloat(svgElement.getAttribute('height') || '400')
    
    // Check if this is the large template (width > 1000)
    const isLargeTemplate = svgWidth > 1000
    
    // Original template dimensions for scaling calculations
    const origTemplateWidth = 2996.9
    const origTemplateHeight = 1685.75

    let frameX, frameY, frameWidth, frameHeight

    if (isLargeTemplate) {
      // Original FIXED frame position from SVG template
      const origFrameX = 1400
      const origFrameY = 0  // Now starts from top
      const origFrameWidth = 1580
      const origFrameHeight = 1685.75  // Full SVG height
      
      // Scale frame position and size based on viewBox changes
      const scaleX = svgWidth / origTemplateWidth
      const scaleY = svgHeight / origTemplateHeight
      
      // Check if content wrapper has a transform (offset)
      const contentWrapper = svgElement.querySelector('#content-wrapper')
      let offsetX = 0
      let offsetY = 0
      if (contentWrapper) {
        const transform = contentWrapper.getAttribute('transform')
        if (transform) {
          const translateMatch = transform.match(/translate\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/)
          if (translateMatch) {
            offsetX = parseFloat(translateMatch[1])
            offsetY = parseFloat(translateMatch[2])
          }
        }
      }
      
      // Apply scaling and offset
      frameX = origFrameX * scaleX + offsetX
      frameY = origFrameY * scaleY + offsetY
      frameWidth = origFrameWidth * scaleX
      frameHeight = origFrameHeight * scaleY
      
      console.log(`?? Frame scaled: x=${frameX.toFixed(0)}, y=${frameY.toFixed(0)}, w=${frameWidth.toFixed(0)}, h=${frameHeight.toFixed(0)}`)
    } else {
      // Use centered position for fallback/smaller templates
      // Default to 50% width/height centered
      const existingWidth = parseFloat(userImageElement.getAttribute('width') || '0')
      const existingHeight = parseFloat(userImageElement.getAttribute('height') || '0')
      
      if (existingWidth > 0 && existingHeight > 0) {
        // Use existing element dimensions
        frameX = parseFloat(userImageElement.getAttribute('x') || '0')
        frameY = parseFloat(userImageElement.getAttribute('y') || '0')
        frameWidth = existingWidth
        frameHeight = existingHeight
      } else {
        // Create centered frame
        frameWidth = svgWidth * 0.5
        frameHeight = svgHeight * 0.5
        frameX = (svgWidth - frameWidth) / 2
        frameY = (svgHeight - frameHeight) / 2
      }
    }
    
    // Check if user has specified a custom size - if so, span image to full SVG height
    const hasCustomSize = formData.customSize && formData.customSize !== ''
    
    // Use custom scale from image if available, otherwise default to 1.15
    // If custom size specified, scale image to fill the SVG height
    let adjustedWidth: number
    let adjustedHeight: number
    let adjustedX: number
    let adjustedY: number
    
    if (hasCustomSize && isLargeTemplate) {
      // Span image to full SVG height
      adjustedHeight = svgHeight
      // Maintain aspect ratio based on frame dimensions
      const frameAspect = frameWidth / frameHeight
      adjustedWidth = adjustedHeight * frameAspect
      
      // Center horizontally in the right half of the SVG (where image goes)
      adjustedX = frameX + (frameWidth - adjustedWidth) / 2
      adjustedY = 0 // Start from top
      
      // Remove clip-path when custom size to show full image
      userImageElement.removeAttribute('clip-path')
    } else {
      // Calculate scale from current dimensions vs original dimensions
      const scale = (img.width / img.originalWidth) || 1.15
      adjustedWidth = frameWidth * scale
      adjustedHeight = frameHeight * scale
      
      // Center the enlarged image within the frame
      adjustedX = frameX - (adjustedWidth - frameWidth) / 2
      // Position image starting from top of frame (y=0 for the clip area)
      // This prevents cutting from the top of the image
      adjustedY = 0
      
      // Update clip-path to match the adjusted image position for proper visibility
      const clipPathRect = svgElement.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
      if (clipPathRect && isLargeTemplate) {
        // Expand clip rect to match the scaled and repositioned image
        // The clip rect needs to start where the image starts (adjustedX) and be as wide as the scaled image
        const clipX = adjustedX  // Match image X position
        const clipY = 0
        const clipWidth = adjustedWidth  // Match image width
        const clipHeight = svgHeight
        clipPathRect.setAttribute('x', clipX.toString())
        clipPathRect.setAttribute('y', clipY.toString())
        clipPathRect.setAttribute('width', clipWidth.toString())
        clipPathRect.setAttribute('height', clipHeight.toString())
        console.log(`?? Clip-path adjusted: x=${clipX.toFixed(0)}, y=${clipY}, w=${clipWidth.toFixed(0)}, h=${clipHeight.toFixed(1)}`)
      }
    }
    
    console.log(`📍 Image update: x=${adjustedX.toFixed(1)}, y=${adjustedY.toFixed(1)}, w=${adjustedWidth.toFixed(1)}, h=${adjustedHeight.toFixed(1)}`)
    console.log(`📍 Image dataUrl length: ${img.dataUrl?.length || 0}`)
    
    // CRITICAL: Verify dataUrl is valid before setting
    if (!img.dataUrl || img.dataUrl.length < 100) {
      console.error('❌ Invalid or missing dataUrl for image:', img.id, 'length:', img.dataUrl?.length || 0)
      return
    }
    
    userImageElement.setAttribute('x', adjustedX.toString())
    userImageElement.setAttribute('y', adjustedY.toString())
    userImageElement.setAttribute('width', adjustedWidth.toString())
    userImageElement.setAttribute('height', adjustedHeight.toString())
    userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
    userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    userImageElement.setAttribute('href', img.dataUrl)
    
    // Verify the href was actually set
    const verifyHref = userImageElement.getAttribute('href')
    if (!verifyHref || verifyHref.length < 100) {
      console.error('❌ CRITICAL: href was not set correctly! Retrying...')
      // Force set again
      userImageElement.setAttribute('href', img.dataUrl)
      userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    } else {
      console.log('✅ Image href set successfully, length:', verifyHref.length)
    }
    
    // Add data attribute for drag identification
    userImageElement.setAttribute('data-image-id', img.id)
    
    // Make image draggable - only attach if not already attached
    if (!userImageElement.hasAttribute('data-draggable')) {
      makeSVGImageDraggable(userImageElement as SVGImageElement, img.id)
    }
    
    // Ensure clip-path and preserveAspectRatio are set as requested
    if (!userImageElement.hasAttribute('clip-path')) {
        // Only set default clip-path if it's the userImage element AND we are on large template
        if (userImageElement.id === 'userImage' && isLargeTemplate) {
            userImageElement.setAttribute('clip-path', 'url(#imageClip)')
        }
    }
    // Use 'xMidYMin slice' to fill the frame but prioritize showing the top of the image
    // This prevents cutting from the top which is important for portrait/face photos
    userImageElement.setAttribute('preserveAspectRatio', 'xMidYMin slice')

    // Build transform attribute
    const transforms: string[] = []
    
    // Compute visual center based on the DISPLAYED image dimensions
    // This ensures flip happens around the actual visible center
    const displayCenterX = adjustedX + adjustedWidth / 2
    const displayCenterY = adjustedY + adjustedHeight / 2

    // Apply flip if needed (around visual center of displayed image)
    if (img.flipped) {
      transforms.push(`translate(${displayCenterX}, 0) scale(-1, 1) translate(-${displayCenterX}, 0)`)
    }
    
    // Apply rotation around same center
    if (img.rotation !== 0) {
      transforms.push(`rotate(${img.rotation} ${displayCenterX} ${displayCenterY})`)
    }
    
    if (transforms.length > 0) {
      userImageElement.setAttribute('transform', transforms.join(' '))
    } else {
      userImageElement.removeAttribute('transform')
    }

    // Also remove any old style "user-image-*" elements just in case
    const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
    existingImages.forEach(img => img.remove())
    
    return
  }

  // Fallback to old behavior if #userImage is not found
  // Remove existing user images
  const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
  existingImages.forEach(img => img.remove())

  if (images.length === 0) return

  // Sort by z-index
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

  // Find insertion point - look for placeholder image or any text element
  const placeholderImage = svgElement.querySelector('#placeholder-image')
  const firstTextElement = svgElement.querySelector('text')
  let insertionPoint = placeholderImage || firstTextElement

  // Add each image
  sortedImages.forEach(img => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')

    imageElement.setAttribute('id', img.id)
    imageElement.setAttribute('x', img.x.toString())
    imageElement.setAttribute('y', img.y.toString())
    imageElement.setAttribute('width', img.width.toString())
    imageElement.setAttribute('height', img.height.toString())
    imageElement.setAttribute('opacity', (img.opacity / 100).toString())
    imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    
    // NO clip path - show the full image as-is
    // NO preserveAspectRatio manipulation - let it display naturally

    // Build transform attribute
    const transforms: string[] = []
    
    // Apply flip if needed
    if (img.flipped) {
      const centerX = img.x + img.width / 2
      // Flip horizontally around center point
      transforms.push(`translate(${centerX}, 0) scale(-1, 1) translate(-${centerX}, 0)`)
    }
    
    // Apply rotation
    if (img.rotation !== 0) {
      const centerX = img.x + img.width / 2
      const centerY = img.y + img.height / 2
      transforms.push(`rotate(${img.rotation} ${centerX} ${centerY})`)
    }
    
    if (transforms.length > 0) {
      imageElement.setAttribute('transform', transforms.join(' '))
    }

    // Insert before insertion point or append to SVG
    if (insertionPoint && insertionPoint.parentNode === svgElement) {
      svgElement.insertBefore(imageElement, insertionPoint)
    } else {
      svgElement.appendChild(imageElement)
    }
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
    if (!validation.valid) {
      console.warn('?? SVG validation issues:', validation.issues)
      // Continue anyway but log the issues
    }

    // Get stored export dimensions (set by handleSizeChange)
    const exportWidthPx = svgElement.getAttribute('data-export-width-px')
    const exportHeightPx = svgElement.getAttribute('data-export-height-px')
    const exportWidth = svgElement.getAttribute('data-export-width')
    const exportHeight = svgElement.getAttribute('data-export-height')
    const originalStyleWidth = svgElement.style.width
    const originalStyleHeight = svgElement.style.height

    console.log('?? Starting export:', {
      format,
      imagesCount: svgImageManager.images.value.length,
      hasDataUrl: svgImageManager.images.value[0]?.dataUrl?.length || 0,
      exportWidthPx,
      exportHeightPx,
      exportWidth,
      exportHeight
    })

    // Apply pixel dimensions for canvas export (critical for PNG)
    if (exportWidthPx && exportHeightPx) {
      svgElement.setAttribute('width', exportWidthPx)
      svgElement.setAttribute('height', exportHeightPx)
      // Remove CSS constraints that might interfere with the export canvas sizing
      svgElement.style.width = ''
      svgElement.style.height = ''
      console.log(`?? Set export dimensions: ${exportWidthPx} � ${exportHeightPx}px`)
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
        // Base scale: viewBox dimensions at 300 DPI for print quality
        const scale = PRINT_DPI / 96 // 300/96 = 3.125
        const calculatedWidth = Math.round(vbWidth * scale)
        const calculatedHeight = Math.round(vbHeight * scale)
        svgElement.setAttribute('width', String(calculatedWidth))
        svgElement.setAttribute('height', String(calculatedHeight))
        svgElement.style.width = ''
        svgElement.style.height = ''
        console.log(`?? Calculated export from viewBox: ${calculatedWidth} � ${calculatedHeight}px (viewBox: ${vbWidth}x${vbHeight})`)
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
    console.error('Export failed:', error)
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
      console.error('Upload failed:', error)
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

<style scoped>
/* Wedding sticker styles */

.wedding-preview-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wedding-preview-container svg {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
  min-height: auto;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Page wrapper for proper layout */
.sticker-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  background: #f9fafb;
}

.sticker-page-wrapper.wedding-active {
  background: white;
}

.sticker-template-panel {
  flex: 1;
  min-height: 0;
  background: transparent;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-view {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Wedding mode - full width chat */
.sticker-page-wrapper.wedding-active .form-view {
  max-width: 100%;
}

.preview-view {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

/* Panel header styles moved to PanelHeader.vue */

/* Category selection styles moved to CategorySelector.vue */

.form-section {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* Wedding chat mode - remove padding and border radius for full-height chat */
.form-section.wedding-mode {
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
}

/* Wedding chat interface layout */
.wedding-chat-interface {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary, white);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

/* Options, color picker, custom size styles removed - not used in template */

/* Image upload section, generate button styles removed - not used in template */

/* Preview View Styles */
.preview-view {
  min-height: calc(100vh - 40px);
  background: white;
  border-radius: 16px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in modal content */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.back-to-form-btn {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-to-form-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.preview-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-content {
  padding: 40px;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-text {
  margin-top: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.loading-subtext {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

/* Generating preview animation styles removed - not used in template */

.preview-result {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: start;
}

.preview-image-container {
  background: #f9fafb;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.generated-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.preview-info {
  background: #f9fafb;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preview-info-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.preview-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.preview-info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* Wedding Sticker Preview */
.wedding-preview-section {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.wedding-preview-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  position: relative;
  overflow: hidden;
}

.wedding-preview-container svg {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
  min-height: auto;
}

/* Wedding photo konva host and controls styles removed - not used in template */

/* Pre-upload preview styles removed - not used in template */

/* Validation Warnings */
.validation-warnings-container {
  margin-top: 12px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.warning-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #92400e;
  font-weight: 600;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list-item {
  padding: 4px 0;
  padding-left: 24px;
  color: #92400e;
  font-size: 0.9rem;
  position: relative;
}

.warning-list-item:before {
  content: "�";
  position: absolute;
  left: 8px;
  color: #fbbf24;
  font-weight: bold;
}

/* Edit description, image scale, image drop zone, retouch button styles removed - not used in template */

/* Processing indicator, background removal error, svg image management styles removed - not used in template */

.upload-error {
  margin: 12px 0;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.9rem;
}

/* Edit modal styles moved to EditDescriptionModal.vue component */

/* Responsive */
@media (max-width: 1024px) {
  .preview-result {
    grid-template-columns: 1fr;
  }

  .preview-content {
    padding: 20px;
  }

  .wedding-preview-container {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .preview-header {
    padding: 16px;
  }

  .preview-title {
    font-size: 18px;
  }

  .back-to-form-btn span {
    display: none;
  }

  .wedding-preview-section {
    padding: 8px;
  }

  .wedding-preview-container {
    padding: 0;
    max-width: 100%;
    margin: 0;
    border-radius: 4px;
    overflow-x: hidden;
    display: flex;
    justify-content: center;
    overflow: hidden;
    position: relative;
    height: auto !important;
    max-width: 100%;
  }
}

/* Styles moved to child components */

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  /* Form sections mobile */
  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    font-size: 14px;
    margin-bottom: 6px;
  }

  /* Preview mobile */
  .wedding-preview-container {
    max-width: 100%;
    overflow-x: auto;
  }

  .wedding-preview-container svg {
    max-width: 100%;
    height: auto;
  }
}

@media (max-width: 480px) {
  /* Adjust SVG container for very small screens */
  .wedding-preview-container {
    padding: 0;
  }

  .form-textarea {
    font-size: 13px;
    padding: 10px;
  }
}

/* Safe area support for notched devices */
@supports (padding: max(0px)) {
  .preview-header,
  .form-section {
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }
}

/* Fix for iOS input zoom */
@media (max-width: 768px) {
  input[type="text"],
  input[type="range"],
  textarea,
  select {
    font-size: 16px !important;
  }
}

/* Smooth scrolling for mobile */
@media (max-width: 768px) {
  .wedding-preview-container,
  .preview-view {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}

/* Chat styles are now in WeddingChatMessages.vue component */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Add bottom padding to main container to account for fixed footer (non-wedding only) */
.sticker-page-wrapper:not(.wedding-active) .form-section,
.sticker-page-wrapper:not(.wedding-active) .wedding-preview-section {
  margin-bottom: 80px;
}

@media (max-width: 768px) {
  .sticker-page-wrapper:not(.wedding-active) .form-section,
  .sticker-page-wrapper:not(.wedding-active) .wedding-preview-section {
    margin-bottom: 70px;
  }
}
</style>



