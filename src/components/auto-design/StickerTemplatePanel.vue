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

  <!-- AI Chat Area - Footer - Using extracted WeddingChatInput component -->
  <WeddingChatInput
    v-if="selectedCategory === 'wedding'"
    v-model="chatInputText"
    :show-preview="showWeddingStickerPreview"
    :is-recording="isRecording"
    @send="handleGenerateFromChat"
    @toggle-voice="toggleVoiceInput"
    @upload="triggerImageUpload"
    @paste="handlePaste"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { FEATURES } from '@/config/environment'
import { Vue3Lottie } from 'vue3-lottie'
import { useWeddingStickerUpdater } from '@/composables/useWeddingStickerUpdater'
import { useSVGImageManager } from '@/composables/useSVGImageManager'
import { useSVGExport } from '@/composables/useSVGExport'
import { useDynamicSVG } from '@/composables/useDynamicSVG'
import { useSVGTextReplacement } from '@/composables/useSVGTextReplacement'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import { useImageRetouch } from '@/composables/useImageRetouch'
import { SvgLayoutManager } from '@/services/svg-layout.service'
// Graduation template and Konva removed - wedding only with SVG
// Lazy load heavy components for better performance
const ImageCropModal = defineAsyncComponent(() => import('@/components/ImageCropModal.vue'))
import SmartCameraInput from './SmartCameraInput.vue'
import SmartTextarea from './SmartTextarea.vue'
import { IonSpinner } from '@ionic/vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { TextToSpeech } from '@capacitor-community/text-to-speech'

// Import extracted sticker components
import {
  PanelHeader,
  CategorySelector,
  WeddingChatMessages,
  WeddingChatInput,
  ImageControls,
  UploadModal,
  EditDescriptionModal,
  HelpModal,
  GeneratingPreview,
  ExportButtons,
  SvgPreview,
  type ChatMessage,
  type Category,
  type ExtractedInfo
} from './sticker'

// Import extracted composables
import { useTextExtraction } from '@/composables/useTextExtraction'
import { useVoiceInput } from '@/composables/useVoiceInput'
import { useAiChatResponses } from '@/composables/useAiChatResponses'

const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const { updateStickerText, getSVGElements, extractNames } = useWeddingStickerUpdater()
const { applyRetouch } = useImageRetouch()
const { calculateDimensions, resizeSVG, validateForExport, PRINT_DPI, SCREEN_DPI } = useDynamicSVG()

// ========================================
// TITLE LIBRARY - Pre-designed SVG titles
// ========================================
interface TitleEntry {
  keywords: string[];      // Keywords to match (all must be present)
  svgPath: string;         // Path to the SVG file (for color flexibility)
  fallbackText: string;    // Text to show if image fails
  position?: { x: number; y: number; width: number; height: number };
  scale?: number;
}

const TITLE_LIBRARY: TitleEntry[] = [
  // Specific: "Alhamdulillah wedding" - your first title design
  // SVG is used for color flexibility, then rendered to PNG for reliable export
  {
    keywords: ['alhamdulillah', 'wedding'],
    svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
    fallbackText: 'Alhamdulillahi on Your Wedding Ceremony',
    position: { x: -100, y: -20, width: 1800, height: 900 },
    scale: 1.0
  },
  // Default wedding fallback
  {
    keywords: ['wedding'],
    svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
    fallbackText: 'Alhamdulillahi on Your Wedding Ceremony',
    position: { x: -100, y: -20, width: 1800, height: 900 },
    scale: 1.0
  },
]

/**
 * Find matching title SVG based on user input
 * More specific matches (more keywords) take priority
 */
function findMatchingTitle(input: string): TitleEntry | null {
  const normalizedInput = input.toLowerCase()
  
  // Sort by number of keywords (descending) to prioritize more specific matches
  const sortedLibrary = [...TITLE_LIBRARY].sort((a, b) => b.keywords.length - a.keywords.length)
  
  for (const entry of sortedLibrary) {
    // Check if ALL keywords are present in the input
    const allKeywordsMatch = entry.keywords.every(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    )
    
    if (allKeywordsMatch) {
      console.log('🎯 Title Library Match:', entry.fallbackText, 'for input:', input)
      return entry
    }
  }
  
  console.log('⚠️ No title match found for:', input)
  return null
}

/**
 * Replace title text elements with a pre-rendered PNG image
 * Loads SVG, applies color, renders to PNG for reliable export
 */
interface TitleImageConfig {
  svgPath: string;
  targetElementIds: string[];
  position: { x: number; y: number; width: number; height: number };
  scale: number;
  color?: string;  // Optional color override for the title
}

// Cache for pre-rendered title images (keyed by svgPath + color)
const titleImageCache = new Map<string, string>()

// Clear title image cache (call when background changes to force re-render with new color)
function clearTitleImageCache(): void {
  titleImageCache.clear()
  console.log('🗑️ Title image cache cleared')
}

async function renderSvgToPng(svgUrl: string, width: number, height: number, color?: string): Promise<string> {
  const cacheKey = `${svgUrl}-${color || 'default'}-${width}x${height}`
  
  // Check cache first
  if (titleImageCache.has(cacheKey)) {
    console.log('📦 Using cached title PNG:', cacheKey)
    return titleImageCache.get(cacheKey)!
  }
  
  console.log('🎨 Rendering SVG to PNG:', svgUrl, 'color:', color, 'size:', width, 'x', height)
  
  // Fetch the SVG
  const response = await fetch(svgUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.status}`)
  }
  let svgText = await response.text()
  
  // Parse and modify SVG for color if specified
  if (color) {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgElement = svgDoc.querySelector('svg')
    
    if (svgElement) {
      // Update fill colors in styles (CSS within SVG)
      const styles = svgElement.querySelectorAll('style')
      styles.forEach(style => {
        if (style.textContent) {
          style.textContent = style.textContent
            .replace(/fill:\s*#[0-9A-Fa-f]{3,8}/gi, `fill:${color}`)
            .replace(/fill:\s*rgb\([^)]+\)/gi, `fill:${color}`)
            .replace(/fill:\s*rgba\([^)]+\)/gi, `fill:${color}`)
        }
      })
      
      // Update fill attributes on ALL elements with fill attribute
      const fillElements = svgElement.querySelectorAll('[fill]')
      fillElements.forEach(el => {
        const currentFill = el.getAttribute('fill')
        // Replace any color (hex, rgb, named) except 'none' and gradients
        if (currentFill && currentFill !== 'none' && !currentFill.startsWith('url(')) {
          el.setAttribute('fill', color)
        }
      })
      
      // Also update any inline style fill colors
      const styledElements = svgElement.querySelectorAll('[style]')
      styledElements.forEach(el => {
        const style = el.getAttribute('style')
        if (style && style.includes('fill')) {
          const newStyle = style
            .replace(/fill:\s*#[0-9A-Fa-f]{3,8}/gi, `fill:${color}`)
            .replace(/fill:\s*rgb\([^)]+\)/gi, `fill:${color}`)
            .replace(/fill:\s*rgba\([^)]+\)/gi, `fill:${color}`)
          el.setAttribute('style', newStyle)
        }
      })
      
      // Handle g (group) elements that may have fill
      const gElements = svgElement.querySelectorAll('g[fill]')
      gElements.forEach(g => {
        const currentFill = g.getAttribute('fill')
        if (currentFill && currentFill !== 'none' && !currentFill.startsWith('url(')) {
          g.setAttribute('fill', color)
        }
      })
      
      // Serialize back
      const serializer = new XMLSerializer()
      svgText = serializer.serializeToString(svgElement)
    }
  }
  
  // Create blob URL from (possibly modified) SVG
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const svgBlobUrl = URL.createObjectURL(svgBlob)
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(svgBlobUrl)
      reject(new Error('SVG to PNG render timeout'))
    }, 10000)
    
    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          URL.revokeObjectURL(svgBlobUrl)
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        const pngDataUrl = canvas.toDataURL('image/png')
        
        URL.revokeObjectURL(svgBlobUrl)
        
        // Cache the result
        titleImageCache.set(cacheKey, pngDataUrl)
        console.log('✅ SVG rendered to PNG, size:', pngDataUrl.length, 'bytes')
        
        resolve(pngDataUrl)
      } catch (e) {
        URL.revokeObjectURL(svgBlobUrl)
        reject(e)
      }
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(svgBlobUrl)
      reject(new Error('Failed to load SVG for rendering'))
    }
    
    img.src = svgBlobUrl
  })
}

async function replaceTitleWithImage(svgElement: SVGSVGElement, config: TitleImageConfig): Promise<void> {
  console.log('🖼️ Replacing title with pre-rendered PNG:', config.svgPath)
  
  // Remove any existing title replacement
  const existingReplacement = svgElement.querySelector('#wedding-title-replacement')
  if (existingReplacement) {
    existingReplacement.remove()
    console.log('🗑️ Removed existing title replacement')
  }
  
  // Remove original text elements
  config.targetElementIds.forEach(id => {
    const element = svgElement.querySelector(`#${id}`)
    if (element) {
      console.log(`🗑️ Removing original text: #${id}`)
      element.remove()
    }
  })
  
  // Calculate final dimensions
  const finalWidth = config.position.width * config.scale
  const finalHeight = config.position.height * config.scale
  
  // Build full URL for the SVG
  const fullUrl = config.svgPath.startsWith('/') 
    ? window.location.origin + config.svgPath 
    : config.svgPath
  
  try {
    // Render SVG to PNG with optional color
    const pngDataUrl = await renderSvgToPng(fullUrl, finalWidth, finalHeight, config.color)
    
    // Create image element with the PNG data URL
    const titleImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    titleImage.setAttribute('id', 'wedding-title-replacement')
    titleImage.setAttribute('x', String(config.position.x))
    titleImage.setAttribute('y', String(config.position.y))
    titleImage.setAttribute('width', String(finalWidth))
    titleImage.setAttribute('height', String(finalHeight))
    titleImage.setAttribute('href', pngDataUrl)
    titleImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
    titleImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    // Store the SVG path for potential color updates later
    titleImage.setAttribute('data-svg-path', config.svgPath)
    titleImage.setAttribute('data-color', config.color || '')
    
    // Insert the image into the SVG
    const namesGroup = svgElement.querySelector('#wedding-names-group')
    if (namesGroup) {
      svgElement.insertBefore(titleImage, namesGroup)
    } else {
      svgElement.appendChild(titleImage)
    }
    
    console.log('✅ Title PNG image inserted into SVG')
  } catch (error) {
    console.error('❌ Failed to render title:', error)
    // Fallback: use SVG directly (may not export properly but will show in preview)
    const titleImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    titleImage.setAttribute('id', 'wedding-title-replacement')
    titleImage.setAttribute('x', String(config.position.x))
    titleImage.setAttribute('y', String(config.position.y))
    titleImage.setAttribute('width', String(finalWidth))
    titleImage.setAttribute('height', String(finalHeight))
    titleImage.setAttribute('href', fullUrl)
    titleImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', fullUrl)
    titleImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    const namesGroup = svgElement.querySelector('#wedding-names-group')
    if (namesGroup) {
      svgElement.insertBefore(titleImage, namesGroup)
    } else {
      svgElement.appendChild(titleImage)
    }
    console.log('⚠️ Fallback: Using SVG URL directly')
  }
}

/**
 * Update the title color (re-renders the title with new color)
 */
async function updateTitleColor(svgElement: SVGSVGElement, newColor: string): Promise<void> {
  const titleImage = svgElement.querySelector('#wedding-title-replacement') as SVGImageElement
  if (!titleImage) {
    console.log('⚠️ No title image to update color')
    return
  }
  
  const svgPath = titleImage.getAttribute('data-svg-path')
  if (!svgPath) {
    console.log('⚠️ Title image missing SVG path, cannot update color')
    return
  }
  
  const width = parseFloat(titleImage.getAttribute('width') || '1800')
  const height = parseFloat(titleImage.getAttribute('height') || '900')
  
  const fullUrl = svgPath.startsWith('/') 
    ? window.location.origin + svgPath 
    : svgPath
  
  try {
    const pngDataUrl = await renderSvgToPng(fullUrl, width, height, newColor)
    titleImage.setAttribute('href', pngDataUrl)
    titleImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
    titleImage.setAttribute('data-color', newColor)
    console.log('✅ Title color updated to:', newColor)
  } catch (error) {
    console.error('❌ Failed to update title color:', error)
  }
}

// ========================================
// FLOURISH SYSTEM - Decorative element above names
// ========================================

// Available flourish SVGs - will be randomly selected
const AVAILABLE_FLOURISHES = [
  '/assets/flourish/Yellow Green Pastel Islamic Frame Islamic Perspective on Daily Life Presentation.svg',
]

// Get a random flourish SVG path
function getRandomFlourish(): string {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_FLOURISHES.length)
  console.log(`🌸 Selected flourish ${randomIndex + 1}/${AVAILABLE_FLOURISHES.length}: ${AVAILABLE_FLOURISHES[randomIndex]}`)
  return AVAILABLE_FLOURISHES[randomIndex]
}

// Flourish position config (above names, aligned left - not overlapping image area)
const FLOURISH_CONFIG = {
  position: { x: 150, y: 780, width: 1200, height: 300 }, // Larger size, positioned left, above names
  scale: 1.0
}

/**
 * Get flourish color based on current background
 * Returns a color that complements the background
 */
function getFlourishColorForBackground(backgroundFileName?: string): string {
  const bgFile = backgroundFileName || currentBackgroundFileName.value
  if (!bgFile) {
    return '#FFD700' // Default gold
  }
  
  const lowerName = bgFile.toLowerCase()
  
  // Beige Gold Gradient - Dark gold/bronze
  if (lowerName.includes('beige gold gradient')) {
    return '#B8860B' // Dark Goldenrod
  }
  
  // Blue Futuristic - Cyan or electric blue
  if (lowerName.includes('blue futuristic')) {
    return '#00CED1' // Dark Turquoise
  }
  
  // Blue Yellow Modern - Yellow/amber accent
  if (lowerName.includes('blue yellow modern')) {
    return '#F59E0B' // Amber
  }
  
  // Deep Green - Gold
  if (lowerName.includes('deep green')) {
    return '#FFD700' // Gold
  }
  
  // Red and Gold Chinese themes - Gold
  if (lowerName.includes('red and gold chinese new year')) {
    return '#FFD700' // Gold
  }
  
  if (lowerName.includes('red and gold classic lunar chinese')) {
    return '#FFD700' // Gold
  }
  
  if (lowerName.includes('red and gold modern chinese')) {
    return '#FFD700' // Gold
  }
  
  // Red and Gold Simple Elegant - Gold
  if (lowerName.includes('red and gold simple elegant')) {
    return '#DAA520' // Goldenrod
  }
  
  // BackgroundColour.svg - Dark blue to contrast with yellow/gold background
  if (lowerName.includes('backgroundcolour')) {
    return '#000066' // Dark blue (matches the accent shapes in the background)
  }
  
  // Default: Gold
  return '#FFD700'
}

/**
 * Insert flourish SVG above the names
 * Renders SVG to PNG with the appropriate color for the background
 */
async function insertFlourishAboveNames(svgElement: SVGSVGElement, color?: string): Promise<void> {
  console.log('🌸 Inserting flourish above names...')
  
  // Remove any existing flourish
  const existingFlourish = svgElement.querySelector('#wedding-flourish')
  if (existingFlourish) {
    existingFlourish.remove()
    console.log('🗑️ Removed existing flourish')
  }
  
  // Get the color based on background
  const flourishColor = color || getFlourishColorForBackground()
  console.log('🎨 Flourish color:', flourishColor)
  
  // Calculate final dimensions
  const finalWidth = FLOURISH_CONFIG.position.width * FLOURISH_CONFIG.scale
  const finalHeight = FLOURISH_CONFIG.position.height * FLOURISH_CONFIG.scale
  
  // Get a random flourish SVG
  const randomFlourishPath = getRandomFlourish()
  
  // Build full URL
  const fullUrl = randomFlourishPath.startsWith('/') 
    ? window.location.origin + randomFlourishPath 
    : randomFlourishPath
  
  try {
    // Render SVG to PNG with color
    const pngDataUrl = await renderSvgToPng(fullUrl, finalWidth, finalHeight, flourishColor)
    
    // Create image element
    const flourishImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    flourishImage.setAttribute('id', 'wedding-flourish')
    flourishImage.setAttribute('x', String(FLOURISH_CONFIG.position.x))
    flourishImage.setAttribute('y', String(FLOURISH_CONFIG.position.y))
    flourishImage.setAttribute('width', String(finalWidth))
    flourishImage.setAttribute('height', String(finalHeight))
    flourishImage.setAttribute('href', pngDataUrl)
    flourishImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
    flourishImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    flourishImage.setAttribute('data-svg-path', randomFlourishPath)
    flourishImage.setAttribute('data-color', flourishColor)
    
    // Find the names group and insert flourish before it (above in visual layer)
    const namesGroup = svgElement.querySelector('#wedding-names-group')
    if (namesGroup) {
      svgElement.insertBefore(flourishImage, namesGroup)
      console.log('✅ Flourish inserted above names group')
    } else {
      // Fallback: append to SVG
      svgElement.appendChild(flourishImage)
      console.log('✅ Flourish appended to SVG (names group not found)')
    }
    
    console.log(`✅ Flourish inserted at (${FLOURISH_CONFIG.position.x}, ${FLOURISH_CONFIG.position.y}) size: ${finalWidth}x${finalHeight}`)
  } catch (error) {
    console.error('❌ Failed to insert flourish:', error)
  }
}

/**
 * Update flourish color (re-renders with new color)
 */
async function updateFlourishColor(svgElement: SVGSVGElement, newColor: string): Promise<void> {
  const flourishImage = svgElement.querySelector('#wedding-flourish') as SVGImageElement
  if (!flourishImage) {
    console.log('⚠️ No flourish to update color')
    return
  }
  
  // Get the SVG path from the data attribute (stored when flourish was created)
  const svgPath = flourishImage.getAttribute('data-svg-path')
  if (!svgPath) {
    console.log('⚠️ Flourish missing SVG path, cannot update color')
    return
  }
  
  const width = parseFloat(flourishImage.getAttribute('width') || '1100')
  const height = parseFloat(flourishImage.getAttribute('height') || '275')
  
  const fullUrl = svgPath.startsWith('/') 
    ? window.location.origin + svgPath 
    : svgPath
  
  try {
    const pngDataUrl = await renderSvgToPng(fullUrl, width, height, newColor)
    flourishImage.setAttribute('href', pngDataUrl)
    flourishImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
    flourishImage.setAttribute('data-color', newColor)
    console.log('✅ Flourish color updated to:', newColor)
  } catch (error) {
    console.error('❌ Failed to update flourish color:', error)
  }
}

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

const { exportSVG } = useSVGExport()

// Retouch state
const isRetouching = ref(false)

// Toggle for image editing controls
const showImageControls = ref(false)

// Chat footer states
const showUploadOptions = ref(false)

// SVG Text Replacement (for Nikkah graphics)
const { handleReplacement, resetReplacement, restoreOriginalElements, replacementState } = useSVGTextReplacement()

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
  return weddingChatMessagesRef.value.chatHistoryContainer
})
const imageFileInput = ref<HTMLInputElement | null>(null)
let svgElements: ReturnType<typeof getSVGElements> | null = null

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
function handleMessageAction(action: { type: string; label: string; route?: string }) {
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
    default:
      console.log('Unknown action:', action.type)
  }
}

// Token deduction helper function
async function deductTokensForAction(amount: number, reason: string): Promise<boolean> {
  // 📱 OFFLINE MODE: Skip token checks entirely
  if (!FEATURES.TOKENS_ENABLED) {
    console.log('📱 Offline mode: Skipping token deduction for:', reason)
    return true
  }
  
  // Check if user is authenticated - REQUIRE LOGIN
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    console.log('💎 Token deduction blocked - user not authenticated')
    authStore.showNotification({
      title: 'Login Required',
      message: 'Please login or create an account to generate designs.',
      type: 'info'
    })
    // Show a chat message prompting user to login with action buttons
    chatMessages.value.push({
      id: Date.now(),
      text: "Hey there!\n\nTo create beautiful designs, you'll need to login or create a free account first.\n\nBenefits of signing up:\n• Get 100 FREE tokens to start!\n• Save your designs\n• Access all features",
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
      text: "Oops! You've run out of tokens.\n\nTo continue creating beautiful designs, you'll need to purchase more tokens.\n\nToken Packages Available:\n• 100 tokens - ₦100\n• 500 tokens - ₦500\n• 1000 tokens - ₦1000 (Best Value!)",
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
    console.log(`💎 Deducted ${amount} tokens for: ${reason}. New balance: ${userStore.user?.tokens}`)
    return true
  } catch (error: any) {
    console.error('❌ Token deduction API failed:', error)
    
    // If the backend is unavailable, deduct locally and allow the action
    // This prevents blocking users when server is down
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.message?.includes('not found') ||
        error.message?.includes('404') ||
        error.message?.includes('500')) {
      console.log('💎 Backend unavailable, deducting tokens locally')
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
}

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  // Ensure update is processed
  processDescriptionInput()
}

// Handle generate more - regenerate with new random background
async function handleGenerateMore() {
  // Add a message to chat
  chatMessages.value.push({
    id: Date.now(),
    text: "Generate another design",
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  
  // Apply a new random background
  const newBackground = getRandomBackground()
  if (newBackground) {
    chatMessages.value.push({
      id: Date.now() + 1,
      text: "Creating a fresh new design for you... ✨",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true
    })
    
    await applyNewBackground(newBackground)
    
    // Update the loading message
    const loadingMsg = chatMessages.value.find(m => m.isLoading)
    if (loadingMsg) {
      loadingMsg.isLoading = false
      loadingMsg.text = "Here's a new design variation! 🎨 Like this one better?"
    }
    
    scrollToBottom()
  }
}

// Handle generate new - creates a NEW design BELOW the existing one (keeps previous designs)
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
    
    // Hide generating state before adding preview
    isGeneratingPreview.value = false
    
    // ADD A NEW PREVIEW MESSAGE BELOW (don't update existing ones)
    // This keeps previous designs visible and adds the new one below
    chatMessages.value.push({
      id: Date.now(),
      text: '',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'preview'
    })
    
    // Add a brief message about the new design
    chatMessages.value.push({
      id: Date.now() + 1,
      text: "Here's another design for you! 🎨",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    // Wait for the new preview container to be created
    await nextTick()
    await nextTick()
    
    // Small delay for container to fully render
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Clone the master SVG to ONLY the new (last) preview container
    if (weddingPreviewContainer.value) {
      const masterSvg = weddingPreviewContainer.value.querySelector('svg')
      if (masterSvg) {
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        // Get the LAST container (the newly added one)
        const newContainer = previewContainers[previewContainers.length - 1]
        
        if (newContainer) {
          // Remove any loading placeholder
          const loadingPlaceholder = newContainer.querySelector('.preview-loading-placeholder')
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
              newContainer.style.aspectRatio = String(aspectRatio)
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
          newContainer.appendChild(clonedSvg)
          console.log('✅ New design added below existing one')
        }
      }
    }
  } else {
    // No new background available
    isGeneratingPreview.value = false
  }
  
  // Scroll to see the new result
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
  console.log('📝 Edit modal save:', data)
  
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
      title: '🎤 Listening...',
      message: isMobile ? 'Speak clearly into your phone!' : 'Speak now! Say your message clearly.',
      type: 'info'
    })
    
    // Add a listening indicator to chat
    chatMessages.value.push({
      id: Date.now(),
      text: isMobile ? '🎤 Listening... Speak into your phone!' : '🎤 Listening... Speak now!',
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
  // Check if user is logged in FIRST before doing anything else
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    authStore.showNotification({
      title: 'Login Required',
      message: 'Please login or create an account to generate designs.',
      type: 'info'
    })
    chatMessages.value.push({
      id: Date.now(),
      text: "Hold on!\n\nYou need to login or create a free account to generate your design.\n\nWhy sign up?\n• Get 100 FREE tokens instantly!\n• Save and download your designs\n• Access premium features",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'login', label: 'Login to Continue', variant: 'primary' }
      ]
    })
    scrollToBottom()
    return
  }

  if (!formData.description.trim()) {
    authStore.showNotification({
      title: 'Description Required',
      message: 'Please enter a description for your wedding sticker',
      type: 'info'
    })
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
          console.log(`📏 Applying initial size: ${w}x${h} inches`)
          
          // Ensure container is available before resizing
          if (weddingPreviewContainer.value) {
            await handleSizeChange(w, h)
          } else {
            console.warn('⚠️ weddingPreviewContainer not ready for initial resize, skipping.')
          }
       }
    }

    // CRITICAL: Select random background FIRST so title knows what color to use
    // This ensures the title color matches the background from the start
    const initialBackground = getRandomBackground()
    if (initialBackground) {
      currentBackgroundFileName.value = initialBackground
      console.log('🎨 Pre-selected background for title color:', initialBackground)
    }
    
    // Now load the template - title will use the correct color based on pre-selected background
    await loadWeddingStickerTemplate()
    
    // Process the description to update the SVG with names, date, courtesy
    await processDescriptionInput()

    // Apply the background image (already selected above)
    if (initialBackground) {
      console.log('🎨 Applying background image:', initialBackground)
      await applyNewBackground(initialBackground)
      
      // Wait for background image to fully load before continuing
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('⏳ Background loaded, continuing...')
    }

    // Clear the input field now that we've processed the description
    formData.description = ''

    // Handle pre-uploaded image if exists
    if (preGeneratedImageFile.value) {
      generatingStep.value = 3 // Step 3: Processing image
      await nextTick() // Ensure DOM is ready
      
      if (!weddingPreviewContainer.value) {
        console.error('❌ weddingPreviewContainer not available')
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
        console.log('📷 About to add image to SVG manager:', {
          fileName: fileToProcess.name,
          fileSize: fileToProcess.size,
          fileType: fileToProcess.type
        })
        
        const addedImage = await svgImageManager.addImage(fileToProcess, svgElement)
        
        console.log('📷 Image added to SVG manager:', {
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
        console.log('⏳ User image render delay complete')
        
        // Debug: Log image element status
        const imgElement = svgElement.querySelector('#userImage, #placeholder-image') as SVGImageElement
        if (imgElement) {
          console.log('🖼️ Image element after update:', {
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
              console.log('🔧 Fixed: Moved userImage after background-image for correct z-order')
            }
          }
          
          // Ensure opacity is set to 1
          if (!imgElement.getAttribute('opacity') || imgElement.getAttribute('opacity') === '0') {
            imgElement.setAttribute('opacity', '1')
            console.log('🔧 Fixed: Set userImage opacity to 1')
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
    console.log('✅ showWeddingStickerPreview set to true for Download button visibility')
    
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
    console.log('⏳ Final render delay complete')
    
    // Copy the SVG from main container to chat container
    // Note: chatPreviewContainer is an array because it's in a v-for loop
    if (weddingPreviewContainer.value) {
      const svgElement = weddingPreviewContainer.value.querySelector('svg')
      
      // Debug: Check image element in source SVG before cloning
      const sourceImgEl = svgElement?.querySelector('#userImage, #placeholder-image, image') as SVGImageElement
      console.log('🔍 Source SVG image check before clone:', {
        hasImageElement: !!sourceImgEl,
        imageId: sourceImgEl?.id,
        hasHref: !!sourceImgEl?.getAttribute('href'),
        hrefLength: sourceImgEl?.getAttribute('href')?.length || 0,
        hasXlinkHref: !!sourceImgEl?.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      })
      
      console.log('🔍 Checking weddingPreviewContainer for SVG...', {
        hasContainer: !!weddingPreviewContainer.value,
        hasSVG: !!svgElement,
        svgDimensions: svgElement ? { width: svgElement.getAttribute('width'), height: svgElement.getAttribute('height') } : null
      })
      
      if (svgElement) {
        // Get the last preview container (the one we just added)
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        console.log('🔍 Preview containers found:', previewContainers.length)
        
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
              console.log(`📐 Preview aspect ratio set to: ${aspectRatio.toFixed(2)} (${vbWidth}x${vbHeight})`)
            }
          }
          
          // Debug: Check image in cloned SVG before appending
          const clonedImgEl = clonedSVG.querySelector('#userImage, #placeholder-image, image') as SVGImageElement
          console.log('🖼️ Cloned SVG image check:', {
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
          
          console.log('✅ SVG successfully cloned to chat container', {
            viewBox: viewBox,
            containerSize: { width: targetContainer.offsetWidth, height: targetContainer.offsetHeight }
          })
          
          // Verify the SVG was actually added
          if (!targetContainer.querySelector('svg')) {
            console.error('❌ SVG clone failed - retrying...')
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
              console.log('🎯 Attached draggable to image:', imageId)
            }
          })
          
          // Force a layout recalculation
          void targetContainer.offsetHeight
        } else {
          console.error('❌ Chat preview container not available in array')
        }
      } else {
        console.error('❌ SVG not found in weddingPreviewContainer')
        
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
      console.error('❌ weddingPreviewContainer not available')
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

// Helper function to capitalize first letter of each word and strip trailing numbers (typos)
function capitalizeWords(str: string): string {
  return str.split(' ')
    .map(word => {
      // Remove trailing numbers from each word (handles typos like "Yahaya4" -> "Yahaya")
      const cleanWord = word.replace(/\d+$/, '')
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
    })
    .join(' ')
}

// Enhanced Name Extraction Function - NOW CASE INSENSITIVE
function extractNamesFromResponse(text: string): { name1: string | null; name2: string | null } {
  // FIRST: Check if this is just a request phrase - don't extract names from it
  const requestPhrasePatterns = [
    /^i\s+want\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^i\s+need\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^i\s+would\s+like\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^i\s+(?:want|need|would\s+like)\s+(?:to\s+)?(?:create|make|design|get)/i,
    /^(?:create|make|design|get)\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^(?:can|could)\s+(?:you|i)\s+(?:help|make|create|design|get)/i,
    /^please\s+(?:help|make|create|design|get)/i,
    /^help\s+(?:me\s+)?(?:make|create|design|get)/i,
    /^i\s+want\s+(?:a\s+)?(?:stiker|sticker)\s+design/i,
    /(?:sticker|stiker)\s+design/i,
    // Color/style requests - DON'T extract names from these
    /^i\s+want\s+(?:a\s+)?(?:\w+)\s+(?:color|colour|design|style|theme|background)/i,
    /^i\s+(?:want|need|like|prefer)\s+(?:a\s+)?(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\b/i,
    /\b(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\s+(?:color|colour|design|style|theme|background)/i
  ]
  
  for (const pattern of requestPhrasePatterns) {
    if (pattern.test(text.trim())) {
      console.log('[extractNamesFromResponse] Skipping - detected request phrase:', text)
      return { name1: null, name2: null }
    }
  }

  // PRE-PROCESS: Remove date portion to avoid "Hauwa on" being captured as "Hauwa On"
  // Match patterns like "on 6th January" or "on March 7" and remove them for name extraction
  let textForNames = text
    .replace(/\s+on\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/gi, ' ')
    .trim()

  // Priority 0: Check for names inside brackets/parentheses first (e.g., "(Sarah & Michael)" or "(sarah & michael)")
  const bracketPattern = /\(([^)]+)\)/
  const bracketMatch = textForNames.match(bracketPattern)

  if (bracketMatch && bracketMatch[1]) {
    const bracketContent = bracketMatch[1].trim()
    // Check for two names with "and" or "&" (case insensitive)
    const bracketAndPattern = /(.+?)\s*(?:and|&)\s*(.+)/i
    const bracketAndMatch = bracketContent.match(bracketAndPattern)

    if (bracketAndMatch) {
      return { 
        name1: capitalizeWords(bracketAndMatch[1].trim()), 
        name2: capitalizeWords(bracketAndMatch[2].trim()) 
      }
    }
    // Single name in brackets
    return { name1: capitalizeWords(bracketContent), name2: null }
  }

  // Pattern 1: Name and Name or Name & Name (CASE INSENSITIVE)
  // PRIORITY: Look for & pattern FIRST - this is most explicit way users indicate names
  const skipWordsBeforeAnd = ['is', 'are', 'the', 'couple', 'name', 'names', 'my', 'our', 'their', 'for', 'of', 'to', 'from', 'with', 'ceremony', 'wedding', 'congratulation', 'congratulations', 'on', 'your', 'alhamdulillahi', 'beautiful', 'save']
  
  // Try & pattern first (most explicit)
  const ampersandPattern = /\b([a-zA-Z][a-zA-Z'-]+)\s*&\s*([a-zA-Z][a-zA-Z'-]+)\b/i
  const ampersandMatch = textForNames.match(ampersandPattern)
  if (ampersandMatch) {
    const name1 = ampersandMatch[1].trim()
    const name2 = ampersandMatch[2].trim()
    // Make sure neither is a skip word
    if (!skipWordsBeforeAnd.includes(name1.toLowerCase()) && !skipWordsBeforeAnd.includes(name2.toLowerCase())) {
      console.log('[extractNamesFromResponse] Found names via &:', name1, name2)
      return { 
        name1: capitalizeWords(name1), 
        name2: capitalizeWords(name2) 
      }
    }
  }
  
  // Then try 'and' pattern
  const andPattern = /\b([a-zA-Z][a-zA-Z0-9'-]*(?:\s+[a-zA-Z][a-zA-Z0-9'-]*)?)\s+(?:and|n)\s+([a-zA-Z][a-zA-Z0-9'-]*(?:\s+[a-zA-Z][a-zA-Z0-9'-]*)?)\b/i
  const andMatch = textForNames.match(andPattern)

  if (andMatch) {
    const firstWord = andMatch[1].trim().toLowerCase()
    // Skip if first captured word is a common skip word
    if (!skipWordsBeforeAnd.includes(firstWord)) {
      return { 
        name1: capitalizeWords(andMatch[1].trim()), 
        name2: capitalizeWords(andMatch[2].trim()) 
      }
    }
    // If first word was a skip word, try to find the NEXT match after removing the prefix
    const cleanedText = textForNames.replace(new RegExp(`\\b${andMatch[1]}\\s+(?:and|&|n)\\s+`, 'i'), '')
    const secondTry = cleanedText.match(/\b([a-zA-Z][a-zA-Z'-]+)\s*(?:and|&|n)\s*([a-zA-Z][a-zA-Z'-]+)\b/i)
    if (secondTry) {
      return {
        name1: capitalizeWords(secondTry[1].trim()),
        name2: capitalizeWords(secondTry[2].trim())
      }
    }
  }

  // Pattern 2: Two consecutive words that look like names
  const twoNamesPattern = /\b([a-zA-Z][a-zA-Z'-]{1,})\s+([a-zA-Z][a-zA-Z'-]{1,})\b/i
  const twoNamesMatch = textForNames.match(twoNamesPattern)

  // Only use this pattern if the words don't look like common English words
  const commonWords = [
    // Basic English words - including 'on' to prevent extraction
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 'him', 'let', 'put', 'say', 'she', 'too', 'use', 'from', 'with', 'this', 'that', 'have', 'will', 'your', 'make', 'like', 'just', 'over', 'such', 'into', 'year', 'also', 'back', 'been', 'come', 'could', 'what', 'when', 'more', 'some', 'than', 'them', 'then', 'these', 'would', 'about', 'after', 'could', 'first', 'other', 'their', 'there', 'which', 'would',
    // Short common words - INCLUDING 'on'
    'to', 'a', 'i', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'if', 'in', 'me', 'of', 'on', 'or', 'so', 'up', 'us', 'we',
    // Wedding/sticker context words
    'wedding', 'sticker', 'stiker', 'design', 'designs', 'please', 'courtesy', 'family', 'picture', 'image', 'photo', 'template', 'templates',
    // Colors
    'purple', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'black', 'white', 'gold', 'silver', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'violet', 'indigo', 'teal', 'maroon', 'navy', 'beige', 'cream', 'coral', 'lavender', 'turquoise', 'burgundy', 'rose', 'peach', 'mint', 'olive', 'tan', 'ivory', 'aqua', 'lime', 'crimson', 'scarlet', 'amber', 'bronze', 'copper', 'ruby', 'emerald', 'sapphire', 'pearl', 'platinum', 'champagne', 'wine', 'plum', 'mauve', 'lilac', 'fuchsia', 'chartreuse', 'salmon', 'rust',
    // Design/style words
    'color', 'colour', 'style', 'theme', 'background', 'font', 'size', 'shape', 'border', 'frame', 'layout', 'format', 'look', 'fancy', 'elegant', 'simple', 'modern', 'classic', 'traditional', 'beautiful', 'nice', 'pretty', 'cool', 'awesome', 'great', 'best', 'perfect', 'amazing',
    // Greeting/conversation words
    'hi', 'hello', 'hey', 'my', 'is', 'information', 'info', 'details', 'here', 'name', 'names', 'date', 'it', 'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank', 'good', 'morning', 'afternoon', 'evening', 'night',
    // Request verbs
    'want', 'need', 'create', 'looking', 'help', 'assist', 'give', 'show', 'wanted', 'wanting', 'needs', 'needed', 'needing', 'love', 'doing', 'making', 'getting', 'having', 'using', 'going', 'coming', 'thinking', 'try', 'trying', 'start', 'starting', 'work', 'working',
    // Change/update verbs
    'change', 'changed', 'changing', 'update', 'updated', 'updating', 'edit', 'edited', 'editing', 'modify', 'modified', 'modifying', 'replace', 'replaced', 'replacing', 'set', 'setting', 'alter', 'altered', 'altering', 'correct', 'corrected', 'correcting', 'fix', 'fixed', 'fixing', 'switch', 'switched', 'switching', 'different', 'another'
  ]
  
  if (twoNamesMatch) {
    const word1 = twoNamesMatch[1].toLowerCase()
    const word2 = twoNamesMatch[2].toLowerCase()
    
    // Skip if both words are common English words
    if (!commonWords.includes(word1) && !commonWords.includes(word2)) {
      return { 
        name1: capitalizeWords(twoNamesMatch[1]), 
        name2: capitalizeWords(twoNamesMatch[2]) 
      }
    }
  }

  // Pattern 3: Single name
  const words = textForNames.split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z'-]/g, '')
    if (cleanWord.length >= 2 && !commonWords.includes(cleanWord.toLowerCase())) {
      if (/^[a-zA-Z][a-zA-Z'-]+$/.test(cleanWord)) {
        return { name1: capitalizeWords(cleanWord), name2: null }
      }
    }
  }

  return { name1: null, name2: null }
}

// Extract date from text
function extractDateFromText(text: string): string | null {
  console.log('📅 extractDateFromText input:', text)
  
  const datePatterns = [
    // Match dates like "6th of March, 2023" or "6th of march 2023" (with "of" keyword)
    /\d{1,2}(?:st|nd|rd|th)?\s+of\s+(?:Jan(?:uary|aury|urary)?|Feb(?:ruary|uary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?[,\s]+\d{2,4}/i,
    // Match dates like "5th January, 2023" or "5th January 2023" (with or without comma)
    // Also handles common typos like "Janauary", "Janurary", etc.
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary|aury|urary|auary)?|Feb(?:ruary|uary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?[,\s]+\d{2,5}/i,
    // Match dates like "6th Jan., 2023" or "6th jan. 2023" (with period after month abbreviation)
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?[,\s]+\d{2,5}/i,
    // Match dates like "January 6th, 2023" or "January 6, 2023" (month first)
    /(?:Jan(?:uary|aury|urary|auary)?|Feb(?:ruary|uary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?[,\s]+\d{2,5}/i,
    // Match numeric dates like "12/25/2023" or "12-25-2023"
    /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,5}/,
    // Match dates with short year like "6th January, 23" or typos like "20203"
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary|aury|urary|auary)?|Feb(?:ruary|uary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?[,\s]+\d{1,5}/i,
  ]
  
  for (let i = 0; i < datePatterns.length; i++) {
    const pattern = datePatterns[i]
    const match = text.match(pattern)
    console.log(`📅 Pattern ${i + 1}:`, pattern.source, '-> Match:', match ? match[0] : 'null')
    if (match) {
      console.log('📅 Date matched:', match[0])
      return match[0]
    }
  }
  console.log('📅 No date pattern matched')
  return null
}

// Extract courtesy from text - ONLY when explicitly provided with specific keywords
// STRICT MODE: Only matches very explicit courtesy patterns to avoid false positives
function extractCourtesyFromText(text: string): string | null {
  console.log('🎁 extractCourtesyFromText input:', text)
  
  // Skip if this looks like a heading/title input (not courtesy)
  const isHeadingInput = /\b(heading|title|header|congratulations|happy|wedding|best wishes|wishing you)\b/i.test(text)
  if (isHeadingInput && !/\b(courtesy|cut-cee|from the .+ family|from .+ family)\b/i.test(text)) {
    console.log('🎁 Skipping - looks like heading input')
    return null // This is a heading, not courtesy
  }
  
  // STRICT: Only match if the message explicitly indicates courtesy/sender info
  // Must contain one of these keywords to even try extraction
  // Also check for "change the courtesy" pattern
  const hasCourtesyKeyword = /\b(courtesy|cut-cee)\b/i.test(text) || 
                            /\bfrom\s+(the\s+)?[a-zA-Z][a-zA-Z]*\s+(family|families)\b/i.test(text) ||
                            /\b(change|update|edit)\s+(the\s+)?courtesy/i.test(text)

  console.log('🎁 Has courtesy keyword:', hasCourtesyKeyword)
  
  if (!hasCourtesyKeyword) {
    console.log('🎁 No courtesy keyword found')
    return null // No courtesy keyword found, don't extract
  }

  const courtesyPatterns = [
    // Match "change the courtesy: Name" or "change the courtesy to Name" - handles user updates
    // Very permissive - captures everything after courtesy: until end of line
    /(?:change|update|edit)\s+(?:the\s+)?courtesy\s*[:\s]+(?:to\s+)?(.+?)(?:\s*$|\n|!)/i,
    // Match "courtesy of Name" or "courtesy: Name" (most explicit) - PRIORITY 1
    // More permissive - captures until end of string or newline
    /courtesy\s*(?:of|:)\s*(.+?)$/im,
    // Match "courtesy Name" (without of/:) - requires text after  
    /courtesy\s+([a-zA-Z][a-zA-Z\s&'.-]+?)(?:\s*$|\n|!)/i,
    // Match "cut-cee: Name" or "cut-cee Name" (Nigerian variation)
    /cut-cee\s*[:\s]+(.+?)(?:\s*$|\n|!)/i,
    // Match "from the [Name] Family" ONLY (must end with "family")
    /from\s+the\s+([A-Za-z][A-Za-z\s&'.-]+\s+(?:family|families))(?:\s*$|\n|,|\.(?!\w)|!)/i,
    // Match "from [Name] Family" (without "the", must end with "family")
    /from\s+([A-Za-z][A-Za-z\s&'.-]+\s+(?:family|families))(?:\s*$|\n|,|\.(?!\w)|!)/i,
    // Match "gift from Name" or "sticker from Name" or "card from Name"
    /(?:gift|sticker|card)\s+from\s+([A-Za-z][A-Za-z\s&'.-]+?)(?:\s*$|\n|,|\.(?!\w)|!)/i,
  ]

  for (let i = 0; i < courtesyPatterns.length; i++) {
    const pattern = courtesyPatterns[i]
    const match = text.match(pattern)
    console.log(`🎁 Pattern ${i + 1}:`, pattern.source, '-> Match:', match ? match[0] : 'null', 'Capture:', match ? match[1] : 'null')
    if (match && match[1]) {
      // Build the courtesy string with "courtesy" prefix for consistency
      let name = match[1].trim()

      // Clean up trailing punctuation
      name = name.replace(/[.,!?:;]+$/, '').trim()

      // Skip if it's too short (likely a false positive) - need at least 3 chars
      if (name.length < 3) {
        console.log('🎁 Skipping - name too short:', name)
        continue
      }

      // Skip common false positives - expanded list
      const falsePositives = [
        'the', 'a', 'an', 'way', 'now', 'then', 'here', 'there',
        'me', 'you', 'us', 'them', 'him', 'her', 'it', 'this', 'that',
        'what', 'when', 'where', 'why', 'how', 'who', 'whom',
        'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank',
        'my', 'your', 'our', 'their', 'his', 'her', 'its'
      ]
      if (falsePositives.includes(name.toLowerCase())) {
        console.log('🎁 Skipping - false positive:', name)
        continue
      }

      // Skip if name starts with common non-name words (but NOT "the" as "the X family" is valid)
      const badStarts = ['a ', 'an ', 'my ', 'your ', 'our ', 'their ']
      const lowerName = name.toLowerCase()
      if (badStarts.some(start => lowerName.startsWith(start))) {
        // Remove the prefix and continue
        name = name.replace(/^(a|an|my|your|our|their)\s+/i, '').trim()
        console.log('🎁 Removed prefix, new name:', name)
        if (name.length < 3) continue
      }
      
      // Clean up any trailing quotes that might have slipped through
      name = name.replace(/["']+$/, '').trim()

      console.log('🎁 Courtesy extracted:', `courtesy: ${name}`)
      return `courtesy: ${name}`
    }
  }
  return null
}

// Extract size from text
function extractSizeFromText(text: string): string | null {
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
  if (sizeMatch) {
    const width = parseFloat(sizeMatch[1])
    const height = parseFloat(sizeMatch[2])
    return `${width}x${height} in`
  }
  return null
}

// Track image uploads
function trackImageUpload(file: File) {
  const timestamp = Date.now()
  uploadedImages.value.push({ file, timestamp, used: false })
  lastUploadedImage.value = file
  
  console.log('📸 Image uploaded:', { total: uploadedImages.value.length, timestamp })
  
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
  { id: 'wedding', name: 'Wedding', icon: '💍', gradient: 'linear-gradient(135deg, #f093fb 0%, #a855f7 100%)' }
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
    console.warn('⚠️ Speech Recognition not supported in this browser/device')
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
      console.log('🎤 Recognized:', finalTranscript)
      
      // Auto-stop and auto-send after recognition
      voiceMessageSent.value = false // Reset flag
      setTimeout(() => {
        stopVoiceRecordingAndSend()
      }, 300) // Quick send after speech ends
    }
  }
  
  // Event: Recognition started
  recognition.onstart = () => {
    console.log('🎤 Voice recognition started')
    isRecording.value = true
    voiceMessageSent.value = false // Reset the sent flag when starting new recording
  }
  
  // Event: Recognition ended
  recognition.onend = () => {
    console.log('🎤 Voice recognition ended')
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
    console.error('🎤 Speech recognition error:', event.error)
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
      TextToSpeech.stop().catch(() => {}) // Also stop native TTS if running
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
    // Stop native TTS (Capacitor) if available
    TextToSpeech.stop().catch(() => {})
  } catch (e) {
    // Ignore errors
  }
}

async function tryNativeTTS(text: string) {
  try {
    console.log('🔊 Attempting native TTS...')
    await TextToSpeech.speak({
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
const extractedInfo = ref({
  date: null as string | null,
  courtesy: null as string | null,
  size: null as string | null,
  names: { name1: null as string | null, name2: null as string | null }
})

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
// BACKGROUND TEMPLATES - Available backgrounds for "generate another" feature
// ============================================================================
// List of available background images in public/svg/background folder
// These should match the actual files in the folder
// NOTE: Backgrounds are picked RANDOMLY on each design generation
// NOTE: SVG backgrounds may not render properly in <image> elements on some browsers
//       PNG backgrounds are more reliable for cross-platform compatibility
const availableBackgrounds = [
  // Light backgrounds
  'Beige Gold Gradient Islamic Modern Group Project Presentation.png',
  // Dark backgrounds
  'Deep Green bg-1.png',
  'Blue Futuristic Background Instagram Post (5 x 3 in).png',
  // Red and Gold backgrounds
  'Red and Gold Simple Elegant Islamic Background Poster.png',
  'Red and Gold Chinese New Year Background Instagram Post (5 x 3 in).png',
  'Red and Gold Classic Lunar Chinese Background Flyer (5 x 3 in).png',
  'Dark-Baground/Red and Gold Modern Chinese Background Flyer.png',
  // SVG backgrounds (from backgrondMix folder)
  'backgrondMix/backgroundColour.svg',
]

// Background color configurations
// Defines what text colors to use for each background type
interface BackgroundColorConfig {
  // Title colors (blessing, occasion, event type, ceremony)
  titleColor: string
  eventTypeColor: string  // WEDDING, NIKKAH, etc.
  ceremonyColor: string   // CEREMONY
  // Names colors
  name1Color: string
  name2Color: string
  separatorColor: string  // The "&" between names
  // Date and courtesy colors
  dateColor: string
  courtesyColor: string
}

// Light backgrounds - need dark text for titles, black names
const LIGHT_BG_COLORS: BackgroundColorConfig = {
  titleColor: '#000000',      // Black titles
  eventTypeColor: '#104C6E',  // Dark blue event type
  ceremonyColor: '#CC0000',   // Red ceremony
  name1Color: '#000000',      // Black names
  name2Color: '#000000',
  separatorColor: '#FFD700',  // Gold separator
  dateColor: '#000000',       // Black date
  courtesyColor: '#333333',   // Dark gray courtesy
}

// Dark backgrounds (Deep Green) - need white/yellow text
const DARK_BG_COLORS: BackgroundColorConfig = {
  titleColor: '#FFFFFF',      // White titles
  eventTypeColor: '#FFFF00',  // Yellow event type
  ceremonyColor: '#FFFF00',   // Yellow ceremony
  name1Color: '#FEFEFE',      // White names
  name2Color: '#FEFEFE',
  separatorColor: '#FFF212',  // Bright yellow separator
  dateColor: '#FFFF00',       // Yellow date
  courtesyColor: '#FFFFFF',   // White courtesy
}

// Red and Gold background - white/yellow titles, dark names
const RED_GOLD_BG_COLORS: BackgroundColorConfig = {
  titleColor: '#FFFFFF',      // White titles (Alhamdulillahi, ON YOUR)
  eventTypeColor: '#FFD700',  // Gold event type (WEDDING)
  ceremonyColor: '#FFD700',   // Gold ceremony
  name1Color: '#FEFEFE',      // White names (visible on red)
  name2Color: '#FEFEFE',
  separatorColor: '#FFD700',  // Gold separator
  dateColor: '#FFD700',       // Gold date
  courtesyColor: '#FFFFFF',   // White courtesy
}

// Function to get color config for a background
function getBackgroundColorConfig(backgroundFileName: string): BackgroundColorConfig {
  const lowerName = backgroundFileName.toLowerCase()
  
  // Deep Green - dark background, needs light text everywhere
  if (lowerName.includes('deep green')) {
    return DARK_BG_COLORS
  }
  
  // Blue Futuristic - dark blue background, needs light text
  if (lowerName.includes('blue futuristic')) {
    return {
      ...DARK_BG_COLORS,
      titleColor: '#FFFFFF',      // White titles
      eventTypeColor: '#00BFFF',  // Light blue event type
      ceremonyColor: '#00BFFF',   // Light blue ceremony
      name1Color: '#FFFFFF',      // White names
      name2Color: '#FFFFFF',
      separatorColor: '#00BFFF',  // Light blue separator
      dateColor: '#00BFFF',       // Light blue date
      courtesyColor: '#FFFFFF',   // White courtesy
    }
  }
  
  // Red and Gold Simple Elegant - white/yellow titles, white/yellow date/courtesy
  if (lowerName.includes('red and gold simple elegant islamic background poster.png') ||
      lowerName === 'red and gold simple elegant islamic background poster.png') {
    return RED_GOLD_BG_COLORS
  }
  
  // Red and Gold Chinese New Year - red/gold Chinese theme
  if (lowerName.includes('red and gold chinese new year')) {
    return {
      ...RED_GOLD_BG_COLORS,
      titleColor: '#FFD700',      // Gold titles
      eventTypeColor: '#FFFFFF',  // White event type
      ceremonyColor: '#FFFFFF',   // White ceremony
      name1Color: '#FFD700',      // Gold names
      name2Color: '#FFD700',
      separatorColor: '#FFFFFF',  // White separator
      dateColor: '#FFD700',       // Gold date
      courtesyColor: '#FFFFFF',   // White courtesy
    }
  }
  
  // Red and Gold Classic Lunar Chinese - traditional Chinese colors
  if (lowerName.includes('red and gold classic lunar chinese')) {
    return {
      ...RED_GOLD_BG_COLORS,
      titleColor: '#FFD700',      // Gold titles
      eventTypeColor: '#FFFFFF',  // White event type
      ceremonyColor: '#FFFFFF',   // White ceremony
      name1Color: '#FFD700',      // Gold names
      name2Color: '#FFD700',
      separatorColor: '#FFFFFF',  // White separator
      dateColor: '#FFD700',       // Gold date
      courtesyColor: '#FFFFFF',   // White courtesy
    }
  }
  
  // Red and Gold Modern Chinese - modern Chinese aesthetic
  if (lowerName.includes('red and gold modern chinese')) {
    return {
      ...RED_GOLD_BG_COLORS,
      titleColor: '#FFFFFF',      // White titles
      eventTypeColor: '#FFD700',  // Gold event type
      ceremonyColor: '#FFD700',   // Gold ceremony
      name1Color: '#FFFFFF',      // White names
      name2Color: '#FFFFFF',
      separatorColor: '#FFD700',  // Gold separator
      dateColor: '#FFD700',       // Gold date
      courtesyColor: '#FFFFFF',   // White courtesy
    }
  }
  
  // Beige Gold Gradient - light background, black names and BLACK titles
  if (lowerName.includes('beige gold gradient')) {
    return {
      ...LIGHT_BG_COLORS,
      titleColor: '#000000',      // Black title (Alhamdulillahi, ON YOUR)
      eventTypeColor: '#000000',  // Black event type (WEDDING)
      ceremonyColor: '#000000',   // Black ceremony
      name1Color: '#000000',
      name2Color: '#000000',
      separatorColor: '#B8860B',  // Dark gold separator
      dateColor: '#000000',
      courtesyColor: '#333333',
    }
  }
  
  // Blue Yellow Modern - light background
  if (lowerName.includes('blue yellow modern')) {
    return {
      ...LIGHT_BG_COLORS,
      eventTypeColor: '#1E40AF',  // Blue event type
      name1Color: '#000000',
      name2Color: '#000000',
      separatorColor: '#F59E0B',  // Yellow/amber separator
      dateColor: '#1E40AF',
      courtesyColor: '#333333',
    }
  }
  
  // BackgroundColour.svg - Yellow/Gold background with dark blue accents at bottom
  // Names, date, and courtesy appear on the dark blue section, so they need to be WHITE/GOLD to be visible
  if (lowerName.includes('backgroundcolour')) {
    return {
      titleColor: '#000066',      // Dark blue titles (matching the accent)
      eventTypeColor: '#000066',  // Dark blue event type
      ceremonyColor: '#000066',   // Dark blue ceremony
      name1Color: '#FFFFFF',      // WHITE names (visible on dark blue section)
      name2Color: '#FFFFFF',      // WHITE names (visible on dark blue section)
      separatorColor: '#FFD700',  // Gold separator (visible on dark blue)
      dateColor: '#FFD700',       // GOLD date (visible on dark blue area)
      courtesyColor: '#FFFFFF',   // White courtesy (on dark blue area)
    }
  }
  
  // Default - light background colors
  return LIGHT_BG_COLORS
}

// Track current background index to avoid repeating when user requests another
const currentBackgroundIndex = ref(-1) // -1 means no background applied yet
// Track current background filename for color detection
const currentBackgroundFileName = ref<string>('')
// Track used backgrounds to avoid repetition in session
const usedBackgroundsInSession = ref<number[]>([])

/**
 * Get the title color based on current background
 * Dark backgrounds: WHITE or LIGHT GOLD
 * Light backgrounds: BLACK
 */
function getTitleColorForBackground(backgroundFileName?: string): string {
  const bgFile = backgroundFileName || currentBackgroundFileName.value
  console.log('🔍 getTitleColorForBackground called with:', bgFile)
  
  if (!bgFile) {
    // No background set yet, use white as default (safe for most backgrounds)
    console.log('🎨 No background set, using default WHITE')
    return '#FFFFFF' // White
  }
  
  const lowerName = bgFile.toLowerCase()
  
  // === LIGHT BACKGROUNDS - Use BLACK title ===
  
  // Beige Gold Gradient - Light beige background
  if (lowerName.includes('beige gold gradient')) {
    console.log('🎨 Light bg (beige gold) -> BLACK')
    return '#000000' // Black
  }
  
  // === DARK BACKGROUNDS - Use WHITE title ===
  
  // Deep Green - Very dark green background
  if (lowerName.includes('deep green')) {
    console.log('🎨 Dark bg (deep green) -> WHITE')
    return '#FFFFFF' // White
  }
  
  // Blue Futuristic - Dark blue background
  if (lowerName.includes('blue futuristic')) {
    console.log('🎨 Dark bg (blue futuristic) -> WHITE')
    return '#FFFFFF' // White
  }
  
  // BackgroundColour.svg - Yellow/Gold background with dark blue accents
  if (lowerName.includes('backgroundcolour')) {
    console.log('🎨 Light bg (backgroundColour - yellow) -> DARK BLUE')
    return '#000066' // Dark Blue (matching the accent color)
  }
  
  // === RED BACKGROUNDS - Use LIGHT GOLD title ===
  
  // Red and Gold Simple Elegant Islamic
  if (lowerName.includes('red and gold simple elegant')) {
    console.log('🎨 Red bg (simple elegant) -> LIGHT GOLD')
    return '#FFE4B5' // Light Gold (Moccasin)
  }
  
  // Red and Gold Chinese New Year
  if (lowerName.includes('red and gold chinese new year')) {
    console.log('🎨 Red bg (chinese new year) -> LIGHT GOLD')
    return '#FFE4B5' // Light Gold (Moccasin)
  }
  
  // Red and Gold Classic Lunar Chinese
  if (lowerName.includes('red and gold classic lunar')) {
    console.log('🎨 Red bg (classic lunar) -> LIGHT GOLD')
    return '#FFE4B5' // Light Gold (Moccasin)
  }
  
  // Red and Gold Modern Chinese
  if (lowerName.includes('red and gold modern chinese')) {
    console.log('🎨 Red bg (modern chinese) -> WHITE')
    return '#FFFFFF' // White
  }
  
  // === FALLBACK DETECTION ===
  console.log('🎨 Using fallback detection for:', lowerName)
  
  // Dark backgrounds - use White
  if (lowerName.includes('dark') || lowerName.includes('deep') || lowerName.includes('black') || lowerName.includes('futuristic')) {
    console.log('🎨 Fallback: dark bg -> WHITE')
    return '#FFFFFF' // White
  }
  
  // Red backgrounds - use Light Gold
  if (lowerName.includes('red')) {
    console.log('🎨 Fallback: red bg -> LIGHT GOLD')
    return '#FFE4B5' // Light Gold
  }
  
  // Light backgrounds - use Black
  if (lowerName.includes('white') || lowerName.includes('light') || lowerName.includes('beige') || lowerName.includes('pastel') || lowerName.includes('gold')) {
    console.log('🎨 Fallback: light bg -> BLACK')
    return '#000000' // Black
  }
  
  // Default: White (visible on most backgrounds)
  console.log('🎨 Default -> WHITE')
  return '#FFFFFF'
}

// Function to get a random background (different from current)
// Uses Fisher-Yates style selection to ensure variety
function getRandomBackground(): string {
  if (availableBackgrounds.length === 0) return ''
  if (availableBackgrounds.length === 1) return availableBackgrounds[0]
  
  // Get list of unused backgrounds in this session
  const unusedIndices = availableBackgrounds
    .map((_, index) => index)
    .filter(index => !usedBackgroundsInSession.value.includes(index))
  
  // If all backgrounds have been used, reset the session tracking
  if (unusedIndices.length === 0) {
    usedBackgroundsInSession.value = [currentBackgroundIndex.value] // Keep current to avoid immediate repeat
    const availableIndices = availableBackgrounds
      .map((_, index) => index)
      .filter(index => index !== currentBackgroundIndex.value)
    const newIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    currentBackgroundIndex.value = newIndex
    usedBackgroundsInSession.value.push(newIndex)
    console.log(`🎲 Background cycle reset. Selected: ${availableBackgrounds[newIndex]}`)
    return availableBackgrounds[newIndex]
  }
  
  // Pick a random unused background
  const randomUnusedIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)]
  currentBackgroundIndex.value = randomUnusedIndex
  usedBackgroundsInSession.value.push(randomUnusedIndex)
  
  console.log(`🎲 Random background selected: ${availableBackgrounds[randomUnusedIndex]} (index: ${randomUnusedIndex})`)
  return availableBackgrounds[randomUnusedIndex]
}

// Function to apply a new background to the SVG template
async function applyNewBackground(backgroundFileName: string): Promise<void> {
  if (!weddingPreviewContainer.value) {
    console.error('❌ weddingPreviewContainer not available')
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.error('❌ SVG element not found')
    return
  }

  // Handle backgrounds from different folders
  // If filename includes a path separator, use it as-is under /svg/
  // Otherwise, assume it's in the default /svg/background/ folder
  const backgroundUrl = backgroundFileName.includes('/') 
    ? `/svg/${backgroundFileName}` 
    : `/svg/background/${backgroundFileName}`
  console.log(`🎨 Applying new background: ${backgroundUrl}`)
  
  // Track current background filename for title color detection
  currentBackgroundFileName.value = backgroundFileName
  
  // Clear title cache to force re-render with new background color
  clearTitleImageCache()

  // Get SVG dimensions from CURRENT viewBox (may have been resized)
  const viewBox = svgElement.getAttribute('viewBox')
  let svgWidth = 2996.89
  let svgHeight = 1685.75
  if (viewBox) {
    const parts = viewBox.split(/\s+|,/)
    if (parts.length >= 4) {
      svgWidth = parseFloat(parts[2])
      svgHeight = parseFloat(parts[3])
    }
  }
  
  console.log(`📐 Background will cover: ${svgWidth}x${svgHeight}`)

  // Find existing background elements
  const existingBgRect = svgElement.querySelector('rect[fill="#F8F8F8"]')
  const existingBgImage = svgElement.querySelector('#background-image')
  
  // Find wave path elements (they have specific fill colors) - use broader selector
  // Also find paths that might have been modified
  const wavePaths = svgElement.querySelectorAll('path[fill="#FFCC29"], path[fill="url(#g1)"], path[fill="#507C95"], path[fill="#104C6E"], path[d*="776.51"], path[d*="539.04"], path[d*="616.09"]')

  console.log(`🌊 Found ${wavePaths.length} wave paths to hide`)

  // Remove or hide wave paths - use both style and attribute for reliability
  wavePaths.forEach((path, index) => {
    const pathEl = path as SVGPathElement
    pathEl.style.display = 'none'
    pathEl.style.visibility = 'hidden'
    pathEl.setAttribute('opacity', '0')
    console.log(`  - Hidden wave path ${index + 1}`)
  })

  // Hide the default background rect
  if (existingBgRect) {
    const rectEl = existingBgRect as SVGRectElement
    rectEl.style.display = 'none'
    rectEl.style.visibility = 'hidden'
    rectEl.setAttribute('opacity', '0')
    console.log('🎨 Hidden default background rect')
  }

  // Check if we already have a background image element
  if (existingBgImage) {
    // Update existing background image with new URL and dimensions
    existingBgImage.setAttribute('href', backgroundUrl)
    existingBgImage.setAttribute('xlink:href', backgroundUrl)
    existingBgImage.setAttribute('width', String(svgWidth))
    existingBgImage.setAttribute('height', String(svgHeight))
    console.log('🎨 Updated existing background image')
  } else {
    // Create new background image element
    const bgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    bgImage.setAttribute('id', 'background-image')
    bgImage.setAttribute('x', '0')
    bgImage.setAttribute('y', '0')
    bgImage.setAttribute('width', String(svgWidth))
    bgImage.setAttribute('height', String(svgHeight))
    bgImage.setAttribute('href', backgroundUrl)
    bgImage.setAttribute('xlink:href', backgroundUrl)
    bgImage.setAttribute('preserveAspectRatio', 'xMidYMid slice')

    // Insert as the first child after defs (before other elements)
    const defs = svgElement.querySelector('defs')
    if (defs && defs.nextSibling) {
      svgElement.insertBefore(bgImage, defs.nextSibling)
    } else {
      svgElement.insertBefore(bgImage, svgElement.firstChild)
    }
  }

  // Update title colors based on background type
  // Get the appropriate color configuration for this background
  const colorConfig = getBackgroundColorConfig(backgroundFileName)
  
  const blessingText = svgElement.querySelector('#blessing-text') as SVGTextElement
  const occasionText = svgElement.querySelector('#occasion-text') as SVGTextElement
  const eventTypeText = svgElement.querySelector('#event-type-text') as SVGTextElement
  const ceremonyText = svgElement.querySelector('#ceremony-text') as SVGTextElement
  const dateText = svgElement.querySelector('#date-text') as SVGTextElement
  const courtesyText = svgElement.querySelector('#courtesy-text') as SVGTextElement
  
  // Names group
  const name1First = svgElement.querySelector('#name1-first') as SVGTextElement
  const name2First = svgElement.querySelector('#name2-first') as SVGTextElement
  const nameSeparator = svgElement.querySelector('#name-separator') as SVGTextElement
  
  // Also try to find names inside the wedding-names-group
  const namesGroup = svgElement.querySelector('#wedding-names-group')
  const name1InGroup = namesGroup?.querySelector('text:nth-child(1)') as SVGTextElement
  const name2InGroup = namesGroup?.querySelector('text:nth-child(2)') as SVGTextElement
  const separatorInGroup = namesGroup?.querySelector('text:nth-child(3)') as SVGTextElement

  console.log('🎨 Name elements found:', {
    name1First: !!name1First,
    name2First: !!name2First,
    nameSeparator: !!nameSeparator,
    namesGroup: !!namesGroup,
    name1InGroup: !!name1InGroup,
    name2InGroup: !!name2InGroup,
    separatorInGroup: !!separatorInGroup,
    colorConfig: colorConfig
  })

  // Apply title colors
  if (blessingText) blessingText.setAttribute('fill', colorConfig.titleColor)
  if (occasionText) occasionText.setAttribute('fill', colorConfig.titleColor)
  if (eventTypeText) eventTypeText.setAttribute('fill', colorConfig.eventTypeColor)
  if (ceremonyText) ceremonyText.setAttribute('fill', colorConfig.ceremonyColor)
  
  // Apply name colors - try both by ID and by group child position
  // CRITICAL: Apply to ALL found name elements to ensure colors are set
  const name1Elements = [name1First, name1InGroup].filter(Boolean)
  const name2Elements = [name2First, name2InGroup].filter(Boolean)
  const separatorElements = [nameSeparator, separatorInGroup].filter(Boolean)
  
  name1Elements.forEach(el => {
    if (el) {
      el.setAttribute('fill', colorConfig.name1Color)
      console.log(`🎨 Set name1 fill to: ${colorConfig.name1Color}`)
    }
  })
  
  name2Elements.forEach(el => {
    if (el) {
      el.setAttribute('fill', colorConfig.name2Color)
      console.log(`🎨 Set name2 fill to: ${colorConfig.name2Color}`)
    }
  })
  
  separatorElements.forEach(el => {
    if (el) {
      el.setAttribute('fill', colorConfig.separatorColor)
      console.log(`🎨 Set separator fill to: ${colorConfig.separatorColor}`)
    }
  })
  
  // Fallback: apply to all text elements inside wedding-names-group
  if (namesGroup) {
    const allNamesText = namesGroup.querySelectorAll('text')
    allNamesText.forEach((textEl, index) => {
      const currentFill = textEl.getAttribute('fill')
      if (index === 0 || textEl.id === 'name1-first') {
        textEl.setAttribute('fill', colorConfig.name1Color)
        console.log(`🎨 Names group text[${index}] (${textEl.id}): ${currentFill} → ${colorConfig.name1Color}`)
      } else if (index === 1 || textEl.id === 'name2-first') {
        textEl.setAttribute('fill', colorConfig.name2Color)
        console.log(`🎨 Names group text[${index}] (${textEl.id}): ${currentFill} → ${colorConfig.name2Color}`)
      } else if (textEl.id === 'name-separator' || textEl.textContent === '&') {
        textEl.setAttribute('fill', colorConfig.separatorColor)
        console.log(`🎨 Names group text[${index}] (${textEl.id}): ${currentFill} → ${colorConfig.separatorColor}`)
      }
    })
    console.log(`🎨 Applied colors to ${allNamesText.length} text elements in names group`)
  }
  
  // Apply date and courtesy colors
  if (dateText) dateText.setAttribute('fill', colorConfig.dateColor)
  if (courtesyText) courtesyText.setAttribute('fill', colorConfig.courtesyColor)

  // Adjust title position for specific backgrounds
  // backgroundColour.svg needs titles moved up slightly
  const lowerBgName = backgroundFileName.toLowerCase()
  if (lowerBgName.includes('backgroundcolour')) {
    // Move all title elements up by 30 pixels for this background
    const titleElements = [blessingText, occasionText, eventTypeText, ceremonyText]
    titleElements.forEach(el => {
      if (el) {
        const currentY = parseFloat(el.getAttribute('y') || '0')
        el.setAttribute('y', String(currentY - 30))
      }
    })
    console.log('📍 Adjusted title positions up for backgroundColour.svg')
  }

  // Also find text elements by content as fallback (in case IDs changed)
  const allTextElements = svgElement.querySelectorAll('text')
  allTextElements.forEach((textEl) => {
    const content = textEl.textContent?.toLowerCase() || ''
    const id = textEl.getAttribute('id') || ''
    
    // Skip if already handled by ID
    if (id && ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text', 
               'name1-first', 'name2-first', 'name-separator', 'date-text', 'courtesy-text'].includes(id)) {
      return
    }
    
    // Top titles - Alhamdulillahi, Congratulations, ON YOUR
    if (content.includes('alhamdulillah') || content.includes('congratulation') || content.includes('on your')) {
      textEl.setAttribute('fill', colorConfig.titleColor)
    }
    // Main event type - WEDDING, NIKKAH
    else if (content === 'wedding' || content === 'nikkah') {
      textEl.setAttribute('fill', colorConfig.eventTypeColor)
    }
    // Ceremony
    else if (content === 'ceremony') {
      textEl.setAttribute('fill', colorConfig.ceremonyColor)
    }
  })
  
  console.log(`🎨 Applied colors for background: ${backgroundFileName}`, colorConfig)

  // Ensure proper element ordering: background -> user image -> text elements
  // This ensures user image shows above background but text shows above everything
  
  // First, ensure user image is visible and properly positioned in the layer order
  const userImage = svgElement.querySelector('#userImage') as SVGImageElement
  if (userImage) {
    // Make sure user image has the clip-path
    if (!userImage.getAttribute('clip-path')) {
      userImage.setAttribute('clip-path', 'url(#imageClip)')
    }
    
    // Move user image after the background image (so it's visible above the background)
    const bgImage = svgElement.querySelector('#background-image')
    if (bgImage && bgImage.nextSibling !== userImage) {
      bgImage.after(userImage)
      console.log('🖼️ User image moved after background image')
    }
    
    console.log('🖼️ User image found with href:', userImage.getAttribute('href') || userImage.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
  }

  // Move all text elements to the end (on top of everything)
  const textElements = [
    svgElement.querySelector('#blessing-text'),
    svgElement.querySelector('#occasion-text'),
    svgElement.querySelector('#event-type-text'),
    svgElement.querySelector('#ceremony-text'),
    svgElement.querySelector('#wedding-names-group'),
    svgElement.querySelector('#date-text'),
    svgElement.querySelector('#courtesy-text'),
  ]

  textElements.forEach((el) => {
    if (el) {
      svgElement.appendChild(el)
    }
  })
  console.log('📝 Text elements moved to top layer')

  // Refresh the images to ensure they are displayed correctly after background change
  updateSVGWithImages()

  // Update the chat preview container as well
  await nextTick()
  updateChatPreviewSVG()
  
  // Update title PNG color based on new background
  const titleColor = getTitleColorForBackground(backgroundFileName)
  console.log(`🎨 Updating title color to: ${titleColor} for background: ${backgroundFileName}`)
  await updateTitleColor(svgElement, titleColor)
  
  // Update flourish color based on new background
  const flourishColor = getFlourishColorForBackground(backgroundFileName)
  console.log(`🌸 Updating flourish color to: ${flourishColor} for background: ${backgroundFileName}`)
  await updateFlourishColor(svgElement, flourishColor)
  
  console.log(`✅ Background applied successfully: ${backgroundFileName}`)
}

// Helper to update chat preview SVG with current state
function updateChatPreviewSVG(): void {
  const previewContainers = Array.isArray(chatPreviewContainer.value) 
    ? chatPreviewContainer.value 
    : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])

  if (!weddingPreviewContainer.value) return
  const masterSvg = weddingPreviewContainer.value.querySelector('svg')
  if (!masterSvg) return

  previewContainers.forEach((container) => {
    if (container) {
      // Clone the master SVG to update chat preview
      const existingSvg = container.querySelector('svg')
      if (existingSvg) {
        existingSvg.remove()
      }
      const clonedSvg = masterSvg.cloneNode(true) as SVGSVGElement
      
      // Get viewBox to calculate aspect ratio
      const viewBox = clonedSvg.getAttribute('viewBox')
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/)
        if (parts.length >= 4) {
          const vbWidth = parseFloat(parts[2])
          const vbHeight = parseFloat(parts[3])
          const aspectRatio = vbWidth / vbHeight
          
          // Set container aspect ratio to match SVG
          container.style.aspectRatio = String(aspectRatio)
        }
      }
      
      // Set SVG to fill container while preserving aspect ratio
      clonedSvg.style.width = '100%'
      clonedSvg.style.height = 'auto'
      clonedSvg.style.maxWidth = '100%'
      clonedSvg.style.display = 'block'
      clonedSvg.removeAttribute('width')
      clonedSvg.removeAttribute('height')
      
      container.appendChild(clonedSvg)
    }
  })
}

// ============================================================================
// AI RESPONSE HELPER - Professional, Clear English with Friendly Tone
// ============================================================================

// ============================================================================
// INTENT DETECTION SYSTEM
// ============================================================================
type UserIntent = 
  | 'provide_info'      // User is providing requested information
  | 'change_request'    // User wants to modify something
  | 'question'          // User is asking a question
  | 'confirmation'      // User is confirming (yes/no)
  | 'greeting'          // User is greeting
  | 'thanks'            // User is expressing gratitude
  | 'help_request'      // User needs help
  | 'cancel'            // User wants to cancel/start over
  | 'download'          // User wants to download

interface IntentResult {
  intent: UserIntent
  confidence: number  // 0-1 scale
  entities: {
    hasNames?: boolean
    hasDate?: boolean
    hasCourtesy?: boolean
    hasSize?: boolean
    targetField?: string  // What field they want to change
  }
}

function detectIntent(message: string): IntentResult {
  const lowerMsg = message.toLowerCase().trim()
  const result: IntentResult = {
    intent: 'provide_info',
    confidence: 0.5,
    entities: {}
  }

  // PRIORITY 1: Detect greeting intent FIRST (before confirmation check)
  // This ensures "hi", "hello", "hey" are treated as greetings, not confirmations
  const greetingPatterns = /^(hi+|hello+|hey+|good morning|good afternoon|good evening|assalam|salam|salaam|as-salamu|wa alaikum|hii+|helo+|hola|howdy|greetings)/i
  if (greetingPatterns.test(lowerMsg)) {
    result.intent = 'greeting'
    result.confidence = 0.95
    return result
  }

  // PRIORITY 2: Detect confirmation intent (for yes/no responses)
  const confirmationPatterns = /^(yes|yeah|yep|sure|ok|okay|no|nope|nah|please|alright|fine|correct|right|definitely|absolutely|of course)$/i
  if (confirmationPatterns.test(lowerMsg)) {
    const isPositive = /^(yes|yeah|yep|sure|ok|okay|please|alright|fine|correct|right|definitely|absolutely|of course)$/i.test(lowerMsg)
    result.intent = 'confirmation'
    result.confidence = 0.95
    result.entities.targetField = isPositive ? 'positive' : 'negative'
    return result
  }

  // Detect greeting intent (also check for greetings anywhere in message)
  const greetingAnywhere = /\b(hi there|hello there|good morning|good afternoon|good evening|assalam|salam|salaam)\b/i
  if (greetingAnywhere.test(lowerMsg)) {
    result.intent = 'greeting'
    result.confidence = 0.9
    return result
  }

  // Detect thanks intent
  const thanksPatterns = /\b(thank|thanks|thx|appreciate|grateful|awesome|great job|perfect|amazing|wonderful|beautiful|love it|looks great)\b/i
  if (thanksPatterns.test(lowerMsg)) {
    result.intent = 'thanks'
    result.confidence = 0.85
    return result
  }

  // Detect change/edit request intent
  const changePatterns = /\b(change|update|edit|modify|replace|make it|set the|use|switch|different|alter|correct|fix)\b/i
  if (changePatterns.test(lowerMsg)) {
    result.intent = 'change_request'
    result.confidence = 0.85
    
    // Detect what they want to change
    if (/\b(name|names|couple|bride|groom)\b/i.test(lowerMsg)) {
      result.entities.targetField = 'names'
    } else if (/\b(date|day|when)\b/i.test(lowerMsg)) {
      result.entities.targetField = 'date'
    } else if (/\b(courtesy|from|sender|family)\b/i.test(lowerMsg)) {
      result.entities.targetField = 'courtesy'
    } else if (/\b(size|dimension|inches|inch)\b/i.test(lowerMsg)) {
      result.entities.targetField = 'size'
    } else if (/\b(picture|photo|image|pic)\b/i.test(lowerMsg)) {
      result.entities.targetField = 'picture'
    } else if (/\b(heading|title|text)\b/i.test(lowerMsg)) {
      result.entities.targetField = 'heading'
    }
    return result
  }

  // Detect question intent
  const questionPatterns = /(\?$|\b(what|how|when|where|who|why|which|can you|could you|would you|is it|are you|do you|does it)\b)/i
  if (questionPatterns.test(lowerMsg)) {
    result.intent = 'question'
    result.confidence = 0.8
    return result
  }

  // Detect help request
  const helpPatterns = /\b(help|assist|guide|how do|how to|stuck|confused|don't understand|what should)\b/i
  if (helpPatterns.test(lowerMsg)) {
    result.intent = 'help_request'
    result.confidence = 0.85
    return result
  }

  // Detect cancel intent
  const cancelPatterns = /\b(cancel|start over|restart|reset|clear|new design|begin again|forget)\b/i
  if (cancelPatterns.test(lowerMsg)) {
    result.intent = 'cancel'
    result.confidence = 0.9
    return result
  }

  // Detect download intent
  const downloadPatterns = /\b(download|save|export|get the|send me)\b/i
  if (downloadPatterns.test(lowerMsg)) {
    result.intent = 'download'
    result.confidence = 0.85
    return result
  }

  // Default: providing information - check what entities are present
  result.intent = 'provide_info'
  result.confidence = 0.6
  
  // Check for entities in the message (CASE INSENSITIVE for names)
  // Matches: "john and mary", "John & Mary", "(sarah and mike)", etc.
  result.entities.hasNames = /\b([a-zA-Z][a-zA-Z'-]+)\s+(?:and|&|n)\s+([a-zA-Z][a-zA-Z'-]+)\b/i.test(message) || /\(([^)]+)\)/.test(message)
  result.entities.hasDate = /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(message) || /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(message)
  result.entities.hasCourtesy = /\b(courtesy|from the|from .+ family)\b/i.test(message)
  result.entities.hasSize = /\d+(?:\.\d+)?\s*(?:x|by)\s*\d+(?:\.\d+)?/i.test(message)

  // Increase confidence if entities detected
  if (result.entities.hasNames || result.entities.hasDate || result.entities.hasCourtesy || result.entities.hasSize) {
    result.confidence = 0.8
  }

  return result
}

// ============================================================================
// FUZZY SPELL CORRECTION WITH LEVENSHTEIN DISTANCE
// ============================================================================

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  
  // Create a matrix
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  // Fill in the rest
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        )
      }
    }
  }
  
  return dp[m][n]
}

// Extended dictionary for fuzzy matching
const commonMisspellings: Record<string, string> = {
  // Islamic/Religious terms
  'alhadullia': 'Alhamdulillah',
  'alhamdulila': 'Alhamdulillah',
  'alhamdullilah': 'Alhamdulillah',
  'alhamdulilah': 'Alhamdulillah',
  'alhamduillah': 'Alhamdulillah',
  'alhamdulliah': 'Alhamdulillah',
  'alhamduliah': 'Alhamdulillah',
  'mashallah': 'Masha Allah',
  'mashaallah': 'Masha Allah',
  'inshallah': 'Insha Allah',
  'inshaallah': 'Insha Allah',
  
  // Courtesy variations
  'courtesay': 'courtesy',
  'courtsey': 'courtesy',
  'courtesey': 'courtesy',
  'curtesy': 'courtesy',
  'cortesy': 'courtesy',
  'courtisy': 'courtesy',
  
  // Wedding related
  'weding': 'wedding',
  'weddin': 'wedding',
  'weddng': 'wedding',
  'weeding': 'wedding',
  'mariage': 'marriage',
  'marrage': 'marriage',
  'marriag': 'marriage',
  'marraige': 'marriage',
  'anniversery': 'anniversary',
  'aniversary': 'anniversary',
  'anniversay': 'anniversary',
  'aniversery': 'anniversary',
  'anniverary': 'anniversary',
  
  // Congratulations variations
  'congradulations': 'congratulations',
  'congatulations': 'congratulations',
  'congrats': 'congratulations',
  'congratualations': 'congratulations',
  'congraulatons': 'congratulations',
  'congradulation': 'congratulations',
  'congrads': 'congratulations',
  
  // Names/Titles
  'fiance': 'fiancé',
  'fiancee': 'fiancée',
  'fianc': 'fiancé',
  
  // Event terms
  'recpetion': 'reception',
  'recepton': 'reception',
  'recption': 'reception',
  'receptions': 'reception',
  'cereomny': 'ceremony',
  'cermony': 'ceremony',
  'ceremoney': 'ceremony',
  'ceremmony': 'ceremony',
  'cerimony': 'ceremony',
  
  // Common words
  'beautifull': 'beautiful',
  'beautful': 'beautiful',
  'beutiful': 'beautiful',
  'happyness': 'happiness',
  'hapiness': 'happiness',
  'occassion': 'occasion',
  'ocasion': 'occasion',
  'occation': 'occasion',
  'celabration': 'celebration',
  'celebraton': 'celebration',
  'celebraion': 'celebration',
  'blessings': 'blessings',
  'blesings': 'blessings',
  'blssings': 'blessings',
  'togather': 'together',
  'togehter': 'together',
  'togeter': 'together',
  'speciall': 'special',
  'specail': 'special',
  'speical': 'special',
  'wonderfull': 'wonderful',
  'wonderfule': 'wonderful',
  'wonerful': 'wonderful',
  
  // Family terms
  'familly': 'family',
  'famaly': 'family',
  'famliy': 'family',
  
  // Date/Time related
  'januray': 'January',
  'janurary': 'January',
  'febuary': 'February',
  'feburary': 'February',
  'febrary': 'February',
  'wendsday': 'Wednesday',
  'wensday': 'Wednesday',
  'wedensday': 'Wednesday',
  'saturday': 'Saturday',
  'saterday': 'Saturday',
  'satuday': 'Saturday',
  
  // Action words
  'plese': 'please',
  'pleasse': 'please',
  'pls': 'please',
  'thankyou': 'thank you',
  'thnks': 'thanks',
  'thanx': 'thanks'
}

// Dictionary words for fuzzy matching (correct spellings)
const dictionaryWords = Object.values(commonMisspellings).filter((v, i, a) => a.indexOf(v) === i)

// Find best fuzzy match for a word
function findFuzzyMatch(word: string, threshold: number = 0.3): string | null {
  const lowerWord = word.toLowerCase()
  
  // First check exact match in misspellings dictionary
  if (commonMisspellings[lowerWord]) {
    return commonMisspellings[lowerWord]
  }
  
  // Skip if word is too short (less than 4 chars) to avoid false positives
  if (lowerWord.length < 4) return null
  
  // Skip if word is a common English word that shouldn't be corrected
  const skipWords = ['and', 'the', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 'him', 'let', 'put', 'say', 'she', 'too', 'use']
  if (skipWords.includes(lowerWord)) return null
  
  let bestMatch: string | null = null
  let bestDistance = Infinity
  
  // Check against all dictionary words
  for (const dictWord of dictionaryWords) {
    const distance = levenshteinDistance(lowerWord, dictWord.toLowerCase())
    const maxLength = Math.max(lowerWord.length, dictWord.length)
    const similarity = 1 - (distance / maxLength)
    
    // Only consider if similarity is above threshold
    if (similarity >= (1 - threshold) && distance < bestDistance) {
      bestDistance = distance
      bestMatch = dictWord
    }
  }
  
  // Also check against all misspelling keys
  for (const [misspelled, correct] of Object.entries(commonMisspellings)) {
    const distance = levenshteinDistance(lowerWord, misspelled)
    const maxLength = Math.max(lowerWord.length, misspelled.length)
    const similarity = 1 - (distance / maxLength)
    
    if (similarity >= (1 - threshold) && distance < bestDistance) {
      bestDistance = distance
      bestMatch = correct
    }
  }
  
  return bestMatch
}

// Function to correct common misspellings with fuzzy matching
function correctSpelling(text: string): { corrected: string; suggestions: string[]; intentResult?: IntentResult } {
  let corrected = text
  const suggestions: string[] = []

  // Split into words while preserving punctuation positions
  const wordPattern = /\b([a-zA-Z]+)\b/g
  let match

  while ((match = wordPattern.exec(text)) !== null) {
    const word = match[1]
    const cleanWord = word.toLowerCase()
    
    // First try exact match
    if (commonMisspellings[cleanWord]) {
      const correctWord = commonMisspellings[cleanWord]
      // Preserve original case if word was capitalized
      const replacement = word[0] === word[0].toUpperCase() 
        ? correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        : correctWord
      corrected = corrected.replace(new RegExp(`\\b${word}\\b`, 'g'), replacement)
      suggestions.push(`"${word}" → "${replacement}"`)
    } else {
      // Try fuzzy matching
      const fuzzyMatch = findFuzzyMatch(word, 0.25) // 25% difference threshold
      if (fuzzyMatch && fuzzyMatch.toLowerCase() !== cleanWord) {
        // Preserve original case
        const replacement = word[0] === word[0].toUpperCase()
          ? fuzzyMatch.charAt(0).toUpperCase() + fuzzyMatch.slice(1)
          : fuzzyMatch.toLowerCase()
        corrected = corrected.replace(new RegExp(`\\b${word}\\b`, 'g'), replacement)
        suggestions.push(`"${word}" → "${replacement}" (fuzzy)`)
      }
    }
  }

  // Also run intent detection
  const intentResult = detectIntent(corrected)

  return { corrected, suggestions, intentResult }
}

// Extract names from text inside brackets ()
function extractNamesFromBrackets(text: string): string | null {
  // Pattern to match text inside parentheses
  const bracketPattern = /\(([^)]+)\)/
  const match = text.match(bracketPattern)

  if (match && match[1]) {
    const bracketContent = match[1].trim()
    // Check if it looks like names (contains & or "and")
    if (bracketContent.includes('&') || bracketContent.toLowerCase().includes(' and ')) {
      return bracketContent
    }
    // Could also be a single name
    if (/^[A-Za-z\s]+$/.test(bracketContent)) {
      return bracketContent
    }
  }

  return null
}

// Parse all-in-one message to extract names, date, and courtesy
function parseAllInOneMessage(text: string): {
  names: { name1: string | null; name2: string | null };
  date: string | null;
  courtesy: string | null;
} {
  console.log('🔍 parseAllInOneMessage input:', text)
  
  // First try to extract names from brackets
  const bracketNames = extractNamesFromBrackets(text)
  let names = { name1: null as string | null, name2: null as string | null }

  if (bracketNames) {
    // Parse the bracket content for two names
    const andPattern = /(.+?)\s*(?:and|&)\s*(.+)/i
    const andMatch = bracketNames.match(andPattern)
    if (andMatch) {
      names.name1 = andMatch[1].trim()
      names.name2 = andMatch[2].trim()
    } else {
      names.name1 = bracketNames
    }
    console.log('🔍 Names from brackets:', names)
  } else {
    // Fall back to regular name extraction
    names = extractNamesFromResponse(text)
    console.log('🔍 Names from response:', names)
  }

  const date = extractDateFromText(text)
  console.log('🔍 Date extracted:', date)
  
  const courtesy = extractCourtesyFromText(text)
  console.log('🔍 Courtesy extracted:', courtesy)

  console.log('🔍 parseAllInOneMessage result:', { names, date, courtesy })
  return { names, date, courtesy }
}

// Title/Heading detection patterns
const titlePatterns = [
  /congratulation[s]?\s+on\s+your\s+wedding/i,
  /congratulation[s]?\s+on\s+your\s+wedding\s+ceremony/i,
  /beautiful\s+beginning/i,
  /conjugal\s+bliss/i,
  /save\s+the\s+date/i,
  /alhamdulillah[i]?\s+on\s+your\s+wedding/i,
  /alhamdulillah[i]?\s+on\s+your\s+wedding\s+ceremony/i,
  /alhamdulillah[i]?\s+on\s+your\s+(?:qur'?anic\s+)?walima/i,
  /alhamdulillah[i]?\s+on\s+your\s+(?:qur'?anic\s+)?graduation/i,
  /thank[s]?\s+for\s+attending/i,
  /best\s+wishes/i,
  /happy\s+wedding/i,
  /with\s+love/i
]

// Map of patterns to their display titles
const titlePhraseMap: { pattern: RegExp; display: string }[] = [
  { pattern: /congratulation[s]?\s+on\s+your\s+wedding\s+ceremony/i, display: 'Congratulations On Your Wedding Ceremony' },
  { pattern: /congratulation[s]?\s+on\s+your\s+wedding/i, display: 'Congratulations On Your Wedding' },
  { pattern: /beautiful\s+beginning/i, display: 'Beautiful Beginning' },
  { pattern: /conjugal\s+bliss/i, display: 'Conjugal Bliss' },
  { pattern: /save\s+the\s+date/i, display: 'Save The Date' },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+qur'?anic\s+walima/i, display: "Alhamdulillahi On Your Qur'anic Walima" },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+qur'?anic\s+graduation/i, display: "Alhamdulillahi On Your Qur'anic Graduation" },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+wedding\s+ceremony/i, display: 'Alhamdulillahi On Your Wedding Ceremony' },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+wedding/i, display: 'Alhamdulillahi On Your Wedding' },
  { pattern: /thank[s]?\s+for\s+attending/i, display: 'Thanks For Attending' },
  { pattern: /best\s+wishes/i, display: 'Best Wishes' },
  { pattern: /happy\s+wedding/i, display: 'Happy Wedding' },
  { pattern: /with\s+love/i, display: 'With Love' },
]

function isPotentialTitle(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return titlePatterns.some(pattern => pattern.test(lower))
}

// Extract title phrase from text and return the formatted display version
function extractTitleFromText(text: string): string | null {
  const lower = text.toLowerCase().trim()
  for (const { pattern, display } of titlePhraseMap) {
    if (pattern.test(lower)) {
      return display
    }
  }
  return null
}

const aiResponseHelper = {
  // Random picker helper
  pick: (arr: string[]) => arr[Math.floor(Math.random() * arr.length)],

  // Short, clean greetings - just ask for information
  greetings: {
    morning: [
      "Good morning! Please provide your information."
    ],
    afternoon: [
      "Good afternoon! Please provide your information."
    ],
    evening: [
      "Good evening! Please provide your information."
    ],
    general: [
      "Hello! Please provide your information."
    ],
    salam: [
      "Wa alaikum assalam! Please provide your information."
    ]
  },

  // Professional confirmations
  confirmations: [
    "Got it!",
    "Noted!",
    "Perfect!",
    "Received!",
    "Understood!",
    "Great!"
  ],

  // Processing messages
  processing: [
    "Creating your design...",
    "Generating your sticker...",
    "Almost ready..."
  ],

  // Asking for names
  askNames: [
    "Please provide the names.",
    "What are the names?"
  ],

  // Asking for date
  askDate: [
    "What's the date?",
    "Please provide the date."
  ],

  // Asking for courtesy
  askCourtesy: [
    "Please provide the courtesy.",
    "Who is it from?"
  ],

  // Success messages
  success: [
    "Your sticker is ready!",
    "Design complete!",
    "Done! Here's your sticker!"
  ],

  // Picture-related responses
  pictureAsk: [
    "Would you like to add a photo?"
  ],

  pictureReceived: [
    "Photo received!",
    "Great! Adding photo to design."
  ],

  // Size-related
  sizeAsk: [
    "What size? (e.g., 3x3 or 4x4 inches)"
  ],

  sizeConfirm: (size: string) => [
    `Size set to ${size}!`
  ],

  // Multiple images detected
  multipleImages: [
    "Multiple pictures! Use FIRST or NEW one?"
  ],

  // Error handling
  errors: {
    noInfo: [
      "Please provide: names, date, and courtesy."
    ],
    unclear: [
      "Please provide: names, date, and courtesy."
    ],
    patience: [
      "Just a moment!",
      "Creating your design..."
    ]
  },

  // Fun responses for casual chat
  jokes: [
    "Love is in the air! 💕"
  ],

  // Casual responses
  casual: {
    thanks: [
      "You're welcome!",
      "Glad to help!"
    ],
    howAreYou: [
      "Ready to help!",
      "What can I create for you?"
    ],
    goodbye: [
      "Goodbye!",
      "See you later!"
    ]
  },

  // Get appropriate greeting
  getGreeting: (message: string, userName: string): string => {
    const lower = message.toLowerCase()
    const h = aiResponseHelper

    if (lower.includes('salam') || lower.includes('assalam')) {
      return h.pick(h.greetings.salam)
    }
    if (lower.includes('good morning')) {
      return h.pick(h.greetings.morning)
    }
    if (lower.includes('good afternoon')) {
      return h.pick(h.greetings.afternoon)
    }
    if (lower.includes('good evening')) {
      return h.pick(h.greetings.evening)
    }

    const greeting = h.pick(h.greetings.general)
    return greeting.replace('{name}', userName)
  }
}

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

async function sendMessage() {
  const text = chatInputText.value.trim()
  if (!text) return

  // Stop voice recording if active
  stopVoiceRecording()

  // Check if user is logged in when they start providing wedding details
  // Allow basic greetings but require login for actual design info
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|salam|assalamu alaikum|hola|bonjour)$/i.test(text.trim())
  const isQuestion = /^(help|how|what|can you|could you|\?)/.test(text.toLowerCase())
  
  // If user is providing actual wedding info (names, dates, etc.) and not logged in, prompt login
  if (!authStore.isAuthenticated && !isGreeting && !isQuestion && !showWeddingStickerPreview.value) {
    // Check if this message contains wedding details
    const hasWeddingInfo = parseAllInOneMessage(text)
    const containsDetails = hasWeddingInfo.names.name1 || hasWeddingInfo.date || hasWeddingInfo.courtesy
    
    if (containsDetails) {
      // Add their message first so they see it
      chatMessages.value.push({
        id: Date.now(),
        text: text,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      
      // Clear input
      chatInputText.value = ''
      
      // Show login prompt with action buttons
      setTimeout(() => {
        chatMessages.value.push({
          id: Date.now(),
          text: "I love those details!\n\nBut before I can create your design, you'll need to login or create a free account.\n\nIt's quick and easy!\n• Get 100 FREE tokens instantly\n• Save your beautiful designs\n• Access all premium features",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'login', label: 'Login to Continue', variant: 'primary' }
          ]
        })
        scrollToBottom()
      }, 800)
      
      return
    }
  }

  // Add User Message
  chatMessages.value.push({
    id: Date.now(),
    text: text,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  // Accumulate description ONLY if we haven't generated the preview yet
  // This ensures that after generation, chat messages don't accidentally become part of the sticker text
  if (!showWeddingStickerPreview.value) {
    // Check if this is a vague/meta message that shouldn't be processed for info extraction
    // Expanded to include more unclear inputs that shouldn't trigger extraction
    // IMPORTANT: Only mark as vague if the ENTIRE message is just the vague phrase
    const vaguePatterns = /^(this is|here is|here's|my info|my information|my details|the info|the information|the details|i have|got it|okay|ok|yes|no|sure|thanks|thank you|hi|hello|hey|good morning|good afternoon|good evening|um+|uh+|hmm+|err+|please|help|do it|make it|create|design|sticker|wedding)$/i
    
    // Only mark as vague if it's EXACTLY the intro phrase with nothing substantial after
    // "this is my information: John & Mary..." should NOT be vague
    const isJustIntroPhrase = /^(this is|here is|here's)\s+(my|the)\s+(info|information|details)\s*[:\s]*$/i.test(text.trim())
    
    const isVagueInput = vaguePatterns.test(text.trim()) || 
      isJustIntroPhrase ||
      /^[^a-zA-Z0-9]+$/.test(text.trim()) || // Only symbols
      text.trim().length < 3 // Too short to be meaningful
    
    // Skip extraction if we're waiting for heading input - user's response is a heading, not wedding details
    const isAwaitingHeadingResponse = awaitingHeadingInput.value
    
    // EARLY TITLE DETECTION: Check if this message contains a title/heading phrase
    // This should be detected BEFORE other extraction to avoid title being parsed as names
    let titleDetectedInThisMessage = false
    let textWithoutTitle = text // Text with title removed for further extraction
    
    if (!isVagueInput && !headingStepComplete.value && !awaitingTitleConfirmation.value) {
      const detectedTitle = extractTitleFromText(text)
      if (detectedTitle) {
        console.log('🎯 Early title detection found:', detectedTitle)
        // Store the title and mark heading as complete
        customHeading.value = detectedTitle
        headingStepComplete.value = true
        titleDetectedInThisMessage = true
        
        // Remove the title phrase from text for further extraction
        // This prevents "congratulation on your wedding ceremony" being parsed as names
        // but still allows "Abdullahi & Amina on 7th march" to be extracted
        textWithoutTitle = text
          .replace(/congratulation[s]?\s+on\s+your\s+wedding\s+ceremony/gi, '')
          .replace(/congratulation[s]?\s+on\s+your\s+wedding/gi, '')
          .replace(/beautiful\s+beginning/gi, '')
          .replace(/conjugal\s+bliss/gi, '')
          .replace(/save\s+the\s+date/gi, '')
          .replace(/alhamdulillah[i]?\s+on\s+your\s+(?:qur'?anic\s+)?walima/gi, '')
          .replace(/alhamdulillah[i]?\s+on\s+your\s+(?:qur'?anic\s+)?graduation/gi, '')
          .replace(/alhamdulillah[i]?\s+on\s+your\s+wedding\s+ceremony/gi, '')
          .replace(/alhamdulillah[i]?\s+on\s+your\s+wedding/gi, '')
          .replace(/thank[s]?\s+for\s+attending/gi, '')
          .replace(/best\s+wishes/gi, '')
          .replace(/happy\s+wedding/gi, '')
          .replace(/with\s+love/gi, '')
          .trim()
        
        console.log('📝 Title set. Text for further extraction:', textWithoutTitle)
      }
    }
    
    // Extract names/date/courtesy from the text (with title removed if detected)
    if (!isVagueInput && !isAwaitingHeadingResponse) {
      // Use the text with title removed for extraction
      const textToExtract = titleDetectedInThisMessage ? textWithoutTitle : text
      
      // Only proceed if there's still text to extract from
      if (textToExtract.trim().length > 2) {
        // Use parseAllInOneMessage for comprehensive extraction from a single message
        const allInOne = parseAllInOneMessage(textToExtract)

        // Only process if parseAllInOneMessage actually found something meaningful
        // This prevents random text from being added to description
        const hasValidExtraction = allInOne.names.name1 || allInOne.date || allInOne.courtesy

        // Build formatted description parts
        const formattedParts: string[] = []

        if (hasValidExtraction) {
          // Extract and format names IN BRACKETS so updateStickerText can extract them
          if (allInOne.names.name1 && !extractedInfo.value.names.name1) {
            extractedInfo.value.names = allInOne.names
            // Add names in bracket format for SVG extraction
            if (allInOne.names.name2) {
              formattedParts.push(`(${allInOne.names.name1} and ${allInOne.names.name2})`)
            } else {
              formattedParts.push(`(${allInOne.names.name1})`)
            }
          }

          // Extract date if found
          if (allInOne.date && !extractedInfo.value.date) {
            extractedInfo.value.date = allInOne.date
            formattedParts.push(allInOne.date)
          }

          // Extract courtesy if found
          if (allInOne.courtesy && !extractedInfo.value.courtesy) {
            extractedInfo.value.courtesy = allInOne.courtesy
            formattedParts.push(allInOne.courtesy)
          }
          
          // REMAINING TEXT HEADING DETECTION
          // If we extracted names, date, and courtesy but no known title was detected,
          // check if there's remaining text that could be a custom heading
          if (!titleDetectedInThisMessage && !headingStepComplete.value && 
              allInOne.names.name1 && allInOne.date && allInOne.courtesy) {
            
            // Remove extracted content from text to find remaining text
            let remainingText = textToExtract
            
            // Remove names pattern (Name & Name or Name and Name)
            if (allInOne.names.name2) {
              remainingText = remainingText.replace(new RegExp(`\\b${allInOne.names.name1}\\s*[&]\\s*${allInOne.names.name2}\\b`, 'gi'), '')
              remainingText = remainingText.replace(new RegExp(`\\b${allInOne.names.name1}\\s+and\\s+${allInOne.names.name2}\\b`, 'gi'), '')
            } else if (allInOne.names.name1) {
              remainingText = remainingText.replace(new RegExp(`\\b${allInOne.names.name1}\\b`, 'gi'), '')
            }
            
            // Remove date
            if (allInOne.date) {
              remainingText = remainingText.replace(allInOne.date, '')
            }
            
            // Remove courtesy patterns
            remainingText = remainingText.replace(/courtesy\s*(?:of|:)\s*.+$/im, '')
            remainingText = remainingText.replace(/from\s+(?:the\s+)?[a-zA-Z\s&'.-]+\s+(?:family|families)/gi, '')
            
            // Remove common filler words
            remainingText = remainingText.replace(/\b(on|the|and|of|for|to|from|with|used|this|is|are|my|our|their|your)\b/gi, '')
            
            // Clean up whitespace and punctuation
            remainingText = remainingText.replace(/[,.:;!?]+/g, ' ').replace(/\s+/g, ' ').trim()
            
            console.log('🎯 Remaining text after extraction:', remainingText)
            
            // If there's meaningful remaining text (at least 3 chars, at least 2 words), treat as potential heading
            const words = remainingText.split(/\s+/).filter(w => w.length >= 2)
            if (remainingText.length >= 3 && words.length >= 1) {
              // Capitalize the remaining text as a heading
              const potentialHeading = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
              console.log('🎯 Potential heading detected:', potentialHeading)
              
              // Store as pending title for confirmation
              pendingTitle.value = potentialHeading
              awaitingTitleConfirmation.value = true
              
              // Show the confirmation message immediately
              isAnalyzing.value = true
              setTimeout(() => {
                isAnalyzing.value = false
                const confirmMsg = `I found "${potentialHeading}" - is this the heading you want to use? (yes/no)`
                chatMessages.value.push({
                  id: Date.now(),
                  text: confirmMsg,
                  sender: 'ai',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })
                scrollToBottom()
              }, 1500)
              
              // Clear input and return early - don't call analyzeMessage
              chatInputText.value = ''
              return
            }
          }
        }

        // Also check for size - track if we found size as structured data
        const extractedSize = extractSizeFromText(text)
        let foundSize = false
        if (extractedSize && !extractedInfo.value.size) {
          extractedInfo.value.size = extractedSize
          formData.customSize = extractedSize
          foundSize = true // Size is structured data, should not be added to description
        }

        // If we extracted structured data (including size), use formatted parts
        // DON'T add raw text to description - only add properly extracted data
        if (formattedParts.length > 0) {
          accumulatedDescription.value += (accumulatedDescription.value ? ' ' : '') + formattedParts.join(' ')
          console.log('📝 Formatted description added:', formattedParts.join(' '))
        }
        
        if (foundSize && formattedParts.length === 0) {
          console.log('📏 Only size extracted, not adding to description:', extractedSize)
        }
        
        // If nothing was extracted, don't add raw text to avoid garbage in description
        if (!hasValidExtraction && !foundSize) {
          console.log('📝 No valid data extracted from message, not adding to description:', textToExtract)
        }
      } else {
        console.log('📝 Text too short after title removal, skipping extraction')
      }
    } else if (isAwaitingHeadingResponse) {
      // User is providing heading input - don't extract as wedding details
      console.log('📝 Awaiting heading input, skipping extraction:', text)
    } else {
      // Vague input - don't add to accumulated description
      console.log('📝 Vague input detected, skipping extraction:', text)
    }
  } else {
    // After preview is shown, messages are chat-only and don't update the SVG
    console.log('📝 Preview already shown, message is chat-only:', text)
  }

  // Clear Input
  chatInputText.value = ''
  scrollToBottom()

  // Start Analysis with debouncing to prevent rapid fire
  isAnalyzing.value = true
  
  // Debounced AI analysis - prevents rapid successive calls
  debouncedAnalyzeMessage(text)
}

// Debounced version of analyzeMessage for performance
const debouncedAnalyzeMessage = useDebounceFn(async (text: string) => {
  await analyzeMessage(text)
}, 800, { maxWait: 2000 })

// Throttled scroll for smoother performance
const throttledScrollToBottom = useThrottleFn(() => {
  if (weddingChatMessagesRef.value?.scrollToBottom) {
    weddingChatMessagesRef.value.scrollToBottom()
  } else if (chatHistoryContainer.value) {
    chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
  }
}, 100)

async function handleSizeChange(widthInches: number, heightInches: number) {
  console.log(`📏 Resizing to ${widthInches}x${heightInches} inches`)

  if (!weddingPreviewContainer.value) {
    console.error('❌ weddingPreviewContainer not available for resize')
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.error('❌ SVG element not found for resize')
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

  console.log(`📏 Original: ${origWidth}x${origHeight}, New viewBox: ${newViewBoxWidth.toFixed(0)}x${newViewBoxHeight.toFixed(0)}`)
  console.log(`📏 Export: ${widthPixels}x${heightPixels}px (${widthInches}x${heightInches}" at ${DPI} DPI)`)

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
    
    console.log(`📐 Updating clip-path rect:`)
    console.log(`   x: ${origClipX} → ${newClipX.toFixed(1)}`)
    console.log(`   y: ${origClipY} → ${newClipY}`)
    console.log(`   width: ${origClipWidth} → ${newClipWidth.toFixed(1)}`)
    console.log(`   height: ${origClipHeight} → ${newClipHeight.toFixed(1)}`)
    
    clipPathRect.setAttribute('x', String(newClipX))
    clipPathRect.setAttribute('y', String(newClipY))
    clipPathRect.setAttribute('width', String(newClipWidth))
    clipPathRect.setAttribute('height', String(newClipHeight))
  } else {
    console.warn('⚠️ clipPath#imageClip rect not found')
  }

  // 12. Scale the wave paths to extend to the new SVG height
  // The wave paths are decorative curves at the bottom - they need to extend to fill the new height
  const wavePaths = svgElement.querySelectorAll('path[fill="#FFCC29"], path[fill="url(#g1)"], path[fill="#507C95"], path[fill="#104C6E"]')
  if (wavePaths.length > 0) {
    const heightRatio = newViewBoxHeight / origHeight
    console.log(`🌊 Scaling ${wavePaths.length} wave paths by height ratio: ${heightRatio.toFixed(2)}`)
    
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
    console.log(`📝 Repositioning text elements by ${textOffset.toFixed(1)}px (30% of ${heightDelta.toFixed(1)}px)`)
    
    // Move date text down slightly
    const dateTextEl = svgElement.querySelector('#date-text') as SVGTextElement
    if (dateTextEl) {
      const currentY = parseFloat(dateTextEl.getAttribute('y') || '1480')
      const newY = currentY + textOffset
      dateTextEl.setAttribute('y', String(newY))
      console.log(`   Date text: y ${currentY} → ${newY}`)
    }
    
    // Move courtesy text down slightly
    const courtesyTextEl = svgElement.querySelector('#courtesy-text') as SVGTextElement
    if (courtesyTextEl) {
      const currentY = parseFloat(courtesyTextEl.getAttribute('y') || '1600')
      const newY = currentY + textOffset
      courtesyTextEl.setAttribute('y', String(newY))
      console.log(`   Courtesy text: y ${currentY} → ${newY}`)
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
        console.log(`   Names group: translate y ${currentY} → ${newY}`)
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
    console.log(`🎨 Updated background image to ${newViewBoxWidth}x${newViewBoxHeight}`)
  }

  // Force refresh
  await nextTick()
  
  // Update image dimensions after clip-path is resized
  updateSVGWithImages()
  
  // Update the chat preview container with the resized SVG
  updateChatPreviewSVG()

  console.log(`✅ Size change complete: ${widthInches}x${heightInches} inches`)
}

async function analyzeMessage(lastUserMessage: string) {
  isAnalyzing.value = false

  // Apply fuzzy text matching / spell correction + intent detection
  const { corrected: correctedMessage, suggestions, intentResult } = correctSpelling(lastUserMessage)

  // Log intent detection for debugging
  console.log('🧠 Intent detected:', intentResult?.intent, 'confidence:', intentResult?.confidence, 'entities:', intentResult?.entities)

  // If corrections were made, notify the user
  if (suggestions.length > 0 && correctedMessage !== lastUserMessage) {
    console.log('🔤 Spell corrections applied:', suggestions)
    // Update the accumulated description with corrected text
    if (!showWeddingStickerPreview.value) {
      // Replace the last message in accumulated description with corrected version
      const lastMsgIndex = accumulatedDescription.value.lastIndexOf(lastUserMessage)
      if (lastMsgIndex !== -1) {
        accumulatedDescription.value =
          accumulatedDescription.value.substring(0, lastMsgIndex) +
          correctedMessage +
          accumulatedDescription.value.substring(lastMsgIndex + lastUserMessage.length)
      }
    }
  }

  const fullText = accumulatedDescription.value
  const lowerMessage = correctedMessage.toLowerCase() // Use corrected message
  const userName = authStore.user?.name || authStore.user?.email?.split('@')[0] || 'there'

  let aiResponse = ''

  // Handle intents with high confidence first (before state machine)
  if (intentResult && intentResult.confidence >= 0.85) {
    // Handle greeting intent
    if (intentResult.intent === 'greeting') {
      const hour = new Date().getHours()
      let greetingType: 'morning' | 'afternoon' | 'evening' | 'general' = 'general'
      if (hour >= 5 && hour < 12) greetingType = 'morning'
      else if (hour >= 12 && hour < 17) greetingType = 'afternoon'
      else if (hour >= 17 && hour < 21) greetingType = 'evening'
      
      // Check for salam
      if (/\b(salam|assalam|salaam)\b/i.test(lowerMessage)) {
        aiResponse = aiResponseHelper.pick(aiResponseHelper.greetings.salam)
      } else {
        aiResponse = aiResponseHelper.pick(aiResponseHelper.greetings[greetingType])
      }
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    // Handle thanks intent
    if (intentResult.intent === 'thanks') {
      aiResponse = aiResponseHelper.pick(aiResponseHelper.casual.thanks)
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    // Handle help request
    if (intentResult.intent === 'help_request') {
      aiResponse = `Hi ${userName}! Please provide your information.`
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
  }
  
  // Handle color/design preference requests EARLY (before extraction attempts)
  // This catches messages like "i want a purple design", "i need a blue sticker", etc.
  const colorDesignPattern = /\b(?:i\s+)?(?:want|need|like|prefer|would\s+like)\s+(?:a\s+)?(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey|elegant|simple|modern|classic|beautiful|nice|fancy)\s*(?:color|colour|design|style|theme|sticker|background)?/i
  const colorMentionPattern = /\b(purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\s+(design|sticker|color|colour|theme|style|background)/i
  const justColorRequest = /^i\s+want\s+(?:a\s+)?(purple|red|blue|green|yellow|pink|orange|black|white|gold|silver)\b/i
  
  if ((colorDesignPattern.test(lowerMessage) || colorMentionPattern.test(lowerMessage) || justColorRequest.test(lowerMessage)) && !showWeddingStickerPreview.value) {
    // Extract the color mentioned
    const colorMatch = lowerMessage.match(/\b(purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey|elegant|simple|modern|classic)\b/i)
    const colorPreference = colorMatch ? colorMatch[1] : 'custom'
    
    aiResponse = `Great choice! I'll use a ${colorPreference} style. Please provide your information.`
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // Handle intents with high confidence (continued)
  if (intentResult && intentResult.confidence >= 0.85) {
    // Handle cancel/restart intent
    if (intentResult.intent === 'cancel') {
      aiResponse = `No problem! Please provide your information.`
      // Reset state
      accumulatedDescription.value = ''
      extractedInfo.value = { date: null, courtesy: null, size: null, names: { name1: null, name2: null } }
      awaitingNameInput.value = false
      awaitingPictureDecision.value = false
      awaitingSizeDecision.value = false
      headingStepComplete.value = false
      pictureStepComplete.value = false
      sizeStepComplete.value = false
      showWeddingStickerPreview.value = false
      preGeneratedImageFile.value = null
      backgroundRemovalAlreadyHandled.value = false
      // Reset background tracking for fresh variety
      currentBackgroundIndex.value = -1
      usedBackgroundsInSession.value = []
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    // Handle download intent (only after preview is shown)
    if (intentResult.intent === 'download' && showWeddingStickerPreview.value) {
      aiResponse = `Great choice! Click the **Download** button below the preview to save your sticker. You can choose between SVG (for editing) or PNG (for printing/sharing)!`
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
  }
  
  // Priority 1: Handle Image Choice (Multiple Uploads)
  if (awaitingImageChoice.value) {
    const wantsNew = lowerMessage.includes('new') || lowerMessage.includes('latest') || lowerMessage.includes('second') || lowerMessage.includes('yes')
    const wantsFirst = lowerMessage.includes('first') || lowerMessage.includes('original') || lowerMessage.includes('no')

    if (wantsNew && lastUploadedImage.value) {
      preGeneratedImageFile.value = lastUploadedImage.value
      uploadedImages.value.forEach(img => img.used = false)
      const lastIndex = uploadedImages.value.length - 1
      if (lastIndex >= 0) uploadedImages.value[lastIndex].used = true

      aiResponse = "Perfect! I'll use the new picture you just uploaded!"
    } else if (wantsFirst && uploadedImages.value.length > 0) {
      preGeneratedImageFile.value = uploadedImages.value[0].file
      uploadedImages.value[0].used = true

      aiResponse = "Got it! I'll use the first picture you uploaded. Great choice!"
    } else {
      aiResponse = "Which image: 'new' or 'first'?"
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    awaitingImageChoice.value = false
    pictureStepComplete.value = true

    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()

    // Check if we have all info to proceed
    const hasDate = /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/i.test(fullText)
    const hasCourtesy = /(?:courtesy|from|by)/i.test(fullText)
    const hasNames = /(?:and|&)/i.test(fullText) || extractNamesFromResponse(fullText).name1

    if (hasNames && hasDate && hasCourtesy) {
      // Proceed to size or generation
      if (!sizeStepComplete.value) {
        setTimeout(() => {
          aiResponse = aiResponseHelper.pick(aiResponseHelper.sizeAsk)
          awaitingSizeDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        }, 500)
      }
    }
    return
  }

  // Priority 1.5: Handle Title/Heading Confirmation
  if (awaitingTitleConfirmation.value) {
    const wantsAsTitle = lowerMessage.includes('yes') || lowerMessage.includes('use it') || lowerMessage.includes('ok') || lowerMessage === 'y'
    const doesntWant = lowerMessage.includes('no') || lowerMessage === 'n'

    if (wantsAsTitle && pendingTitle.value) {
      customHeading.value = pendingTitle.value
      headingStepComplete.value = true
      awaitingTitleConfirmation.value = false
      pendingTitle.value = null

      // Check if we already have all other info (names, date, courtesy)
      const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
      
      if (hasAllInfo) {
        // All info present, proceed to picture step
        if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
          aiResponse = `Perfect! Using "${customHeading.value}" as your heading. Would you like to add a picture to your design?`
          awaitingPictureDecision.value = true
        } else {
          aiResponse = `Perfect! Using "${customHeading.value}" as your heading. Creating your design now...`
          // Trigger generation after a short delay
          setTimeout(() => generateWeddingPreview(), 300)
        }
      } else {
        aiResponse = `Got it! Using "${customHeading.value}" as your heading. Now please provide your details.`
      }
    } else if (doesntWant) {
      awaitingTitleConfirmation.value = false
      pendingTitle.value = null
      awaitingHeadingInput.value = true

      aiResponse = "No problem! Please provide your heading."
    } else {
      // User typed something else - treat it as the actual heading
      customHeading.value = lastUserMessage
      headingStepComplete.value = true
      awaitingTitleConfirmation.value = false
      pendingTitle.value = null

      // Check if we already have all other info (names, date, courtesy)
      const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
      
      if (hasAllInfo) {
        // All info present, proceed to picture step
        if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
          aiResponse = `Perfect! Using "${customHeading.value}" as your heading. Would you like to add a picture to your design?`
          awaitingPictureDecision.value = true
        } else {
          aiResponse = `Perfect! Using "${customHeading.value}" as your heading. Creating your design now...`
          // Trigger generation after a short delay
          setTimeout(() => generateWeddingPreview(), 300)
        }
      } else {
        aiResponse = `Got it! Using "${customHeading.value}" as your heading. Now please provide your details.`
      }
    }

    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }
  
  // Priority 2: Handle Date Change Confirmation (Post-Generation)
  if (awaitingDateChange.value) {
    if (lowerMessage.includes('yes') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      if (pendingDateUpdate.value) {
        // Update the accumulated description
        const oldDate = extractedInfo.value.date
        if (oldDate) {
          accumulatedDescription.value = accumulatedDescription.value.replace(oldDate, pendingDateUpdate.value)
        } else {
          accumulatedDescription.value += ' ' + pendingDateUpdate.value
        }

        extractedInfo.value.date = pendingDateUpdate.value
        formData.description = accumulatedDescription.value

        // Update the SVG without regenerating
        await processDescriptionInput()

        aiResponse = `Done! Date updated to ${pendingDateUpdate.value}!`
      }
    } else {
      aiResponse = "Okay! I'll keep the original date."
    }

    awaitingDateChange.value = false
    pendingDateUpdate.value = null

    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // Priority 3: Handle Courtesy Change Confirmation (Post-Generation)
  if (awaitingCourtesyChange.value) {
    if (lowerMessage.includes('yes') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      if (pendingCourtesyUpdate.value) {
        // Update the accumulated description
        const oldCourtesy = extractedInfo.value.courtesy
        if (oldCourtesy) {
          accumulatedDescription.value = accumulatedDescription.value.replace(oldCourtesy, pendingCourtesyUpdate.value)
        } else {
          accumulatedDescription.value += ' ' + pendingCourtesyUpdate.value
        }

        extractedInfo.value.courtesy = pendingCourtesyUpdate.value
        formData.description = accumulatedDescription.value

        // Update the SVG without regenerating
        await processDescriptionInput()

        aiResponse = `Done! Courtesy message updated! Looking great!`
      }
    } else {
      aiResponse = "Okay! I'll keep the original courtesy message."
    }

    awaitingCourtesyChange.value = false
    pendingCourtesyUpdate.value = null

    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // Priority 3.5: Handle Courtesy Input Confirmation (when AI asked for courtesy and user responds)
  if (awaitingCourtesyInput.value) {
    // Check if user is confirming the pending courtesy text
    const isConfirmingYes = /^(yes|yeah|yep|sure|ok|okay|correct|right|that'?s? (it|right|correct)|exactly)$/i.test(lowerMessage.trim())
    const isConfirmingNo = /^(no|nope|nah|wrong|not that|change it)$/i.test(lowerMessage.trim())
    
    if (pendingCourtesyText.value && isConfirmingYes) {
      // User confirmed the courtesy text
      extractedInfo.value.courtesy = pendingCourtesyText.value
      accumulatedDescription.value += ` courtesy: ${pendingCourtesyText.value}`
      
      awaitingCourtesyInput.value = false
      pendingCourtesyText.value = null
      
      aiResponse = `Perfect! I'll use "${extractedInfo.value.courtesy}" as the courtesy. `
      
      // Check what's next
      if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
        aiResponse += 'Would you like to add a photo?'
        awaitingPictureDecision.value = true
      } else if (!sizeStepComplete.value) {
        aiResponse += "What size would you like? (e.g., '3x3' or 'default' for 4x4)"
        awaitingSizeDecision.value = true
      }
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    } else if (pendingCourtesyText.value && isConfirmingNo) {
      // User said no, ask for the correct courtesy
      pendingCourtesyText.value = null
      aiResponse = "No problem! Please provide the correct courtesy name."
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    } else {
      // User provided new text - either accept it directly or ask for confirmation
      const trimmedMessage = lastUserMessage.trim()
      
      // Check if it looks like a courtesy (has family, or is just a name)
      const looksLikeCourtesy = trimmedMessage.length >= 3 && 
        !trimmedMessage.match(/^(yes|no|ok|hi|hello|hey|help)/i)
      
      if (looksLikeCourtesy) {
        // Check if they included "courtesy:" prefix - if so, extract and use directly
        const explicitCourtesy = extractCourtesyFromText(trimmedMessage)
        if (explicitCourtesy) {
          extractedInfo.value.courtesy = explicitCourtesy
          accumulatedDescription.value += ` courtesy: ${explicitCourtesy}`
          awaitingCourtesyInput.value = false
          pendingCourtesyText.value = null
          
          aiResponse = `Got it! Courtesy set to "${explicitCourtesy}". `
          
          // Check what's next
          if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
            aiResponse += 'Would you like to add a photo?'
            awaitingPictureDecision.value = true
          } else if (!sizeStepComplete.value) {
            aiResponse += "What size would you like? (e.g., '3x3' or 'default' for 4x4)"
            awaitingSizeDecision.value = true
          }
          
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else {
          // No explicit courtesy prefix - ask for confirmation
          pendingCourtesyText.value = trimmedMessage
          aiResponse = `Is "${trimmedMessage}" the courtesy you want to use? (yes/no)`
          
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
      }
    }
  }
  
  // Priority 4: Handle Name Input (After AI asks for name)
  if (awaitingNameInput.value) {
    const extracted = extractNamesFromResponse(lastUserMessage)
    const extractedDate = extractDateFromText(lastUserMessage)
    const extractedCourtesy = extractCourtesyFromText(lastUserMessage)
    
    if (extracted.name1) {
      // Build the description with extracted info
      const descriptionParts: string[] = []

      // Add names IN BRACKET FORMAT so updateStickerText can extract them
      if (extracted.name2) {
        descriptionParts.push(`(${extracted.name1} and ${extracted.name2})`)
        aiResponse = `Great! I have ${extracted.name1} and ${extracted.name2}.`
      } else {
        descriptionParts.push(`(${extracted.name1})`)
        aiResponse = `Got it! I have ${extracted.name1}.`
      }

      if (extractedDate) {
        descriptionParts.push(extractedDate)
        aiResponse += ` Date: ${extractedDate}.`
      }

      if (extractedCourtesy) {
        descriptionParts.push(extractedCourtesy)
        aiResponse += ` ${extractedCourtesy}.`
      }

      // Update accumulated description
      accumulatedDescription.value += (accumulatedDescription.value ? ' ' : '') + descriptionParts.join(' ')
      
      // Store extracted info
      extractedInfo.value.names = extracted
      if (extractedDate) extractedInfo.value.date = extractedDate
      if (extractedCourtesy) extractedInfo.value.courtesy = extractedCourtesy
      
      // Check for size in the message
      const extractedSize = extractSizeFromText(lastUserMessage)
      if (extractedSize) {
        extractedInfo.value.size = extractedSize
        formData.customSize = extractedSize
      }
      
      awaitingNameInput.value = false
      nameExtractionAttempts.value = 0
      
      // Check what info we still need based on extractedInfo (not fullText)
      const needsDate = !extractedInfo.value.date
      const needsCourtesy = !extractedInfo.value.courtesy
      
      // SINGLE COMBINED RESPONSE - no more conflicting setTimeout messages
      if (needsDate || needsCourtesy) {
        // We still need date or courtesy - add to the same response
        const missing: string[] = []
        if (needsDate) missing.push('date')
        if (needsCourtesy) missing.push('courtesy')
        aiResponse += ` Please also provide ${missing.join(' and ')}.`
      } else {
        // Has everything (names, date, courtesy)
        if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
          aiResponse += ` Add a picture?`
          awaitingPictureDecision.value = true
        } else {
          // Has picture too, ask about size or proceed
          pictureStepComplete.value = true
          if (!extractedInfo.value.size && !sizeStepComplete.value) {
            aiResponse += ` What size would you like the sticker to be? (e.g., say '3x3' for inches, or 'default' for 4x4)`
            awaitingSizeDecision.value = true
          } else {
            // Has everything including size, generate!
            aiResponse += ` Let me create your sticker now!`
            formData.description = accumulatedDescription.value
            setTimeout(() => generateWeddingPreview(), 300)
          }
        }
      }
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    } else {
      // Failed to extract name
      nameExtractionAttempts.value++

      if (nameExtractionAttempts.value >= 2) {
        aiResponse = "I couldn't find the names. Please use a format like: 'John and Mary' or 'Sarah & Ahmed'."
      } else {
        aiResponse = "I couldn't quite catch the names. Please type them like this: 'John and Mary' or 'Fatima & Ahmed'."
      }

      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
  }

  // Handle Image Update Confirmation (Post-Generation)
  if (awaitingImageUpdateConfirmation.value) {
    if (lowerMessage === 'yes' || lowerMessage.includes('yes please') || lowerMessage.includes('sure') || lowerMessage.includes('ok')) {
       aiResponse = "Great! Updating your sticker with the new picture..."

       // Apply the image
       if (pendingImageFile.value && weddingPreviewContainer.value) {
          const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
          if (svgElement) {
             await svgImageManager.addImage(pendingImageFile.value, svgElement)
             updateSVGWithImages()
          }
       }
       pendingImageFile.value = null
    } else {
       aiResponse = "Okay, I'll skip that picture."
       pendingImageFile.value = null
    }
    awaitingImageUpdateConfirmation.value = false
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // Handle Background Removal Decision - NEW FLOW: Remove BG first, THEN crop
  if (awaitingBackgroundRemovalDecision.value) {
    const wantsRemoval = lowerMessage === 'yes' || lowerMessage.includes('yes please') || lowerMessage.includes('remove')

    awaitingBackgroundRemovalDecision.value = false

    if (!pendingImageFile.value) {
      aiResponse = "No image found! Please upload an image first."
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    if (wantsRemoval) {
      // User wants background removal - run it FIRST, then open crop modal
      aiResponse = "Perfect! Removing the background now... This may take a few seconds."
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()

      try {
        // Run background removal
        const result = await removeBackground(pendingImageFile.value, {
          quality: 'high',
          outputFormat: 'image/png',
          onProgress: (prog) => {
            console.log(`🖼️ Background removal progress: ${Math.round(prog * 100)}%`)
          }
        })

        // Result contains blob directly (no success property)
        if (result.blob) {
          // Create a new file from the background-removed image
          const bgRemovedFile = new File([result.blob], pendingImageFile.value!.name.replace(/\.[^/.]+$/, '_nobg.png'), {
            type: 'image/png',
            lastModified: Date.now()
          })

          // Set background removal flag so it's NOT done again at generation
          autoRemoveBackground.value = false
          backgroundRemovalAlreadyHandled.value = true // Mark BG removal as done

          // Open crop modal with the background-removed image
          cropImageSrc.value = URL.createObjectURL(result.blob)
          cropImageFile.value = bgRemovedFile
          isPreGenerationCrop.value = true
          showCropModal.value = true

          // Clear pending image
          pendingImageFile.value = null

          chatMessages.value.push({
            id: Date.now(),
            text: "Background removed! Now you can crop your image to fit perfectly.",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        } else {
          throw new Error('Background removal failed - no result')
        }
      } catch (error) {
        console.error('Background removal failed:', error)

        // Fall back to opening crop modal with original image
        if (!pendingImageFile.value) return
        cropImageSrc.value = URL.createObjectURL(pendingImageFile.value)
        cropImageFile.value = pendingImageFile.value
        isPreGenerationCrop.value = true
        showCropModal.value = true
        pendingImageFile.value = null

        chatMessages.value.push({
          id: Date.now(),
          text: "Sorry, background removal didn't work this time. You can still crop your image!",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
      }
      return
    } else {
      // User doesn't want background removal - use the already cropped image directly
      autoRemoveBackground.value = false
      backgroundRemovalAlreadyHandled.value = true // Mark BG decision as made (they said no)

      // The image was already cropped, so use it directly for generation
      if (pendingImageFile.value) {
        preGeneratedImageFile.value = pendingImageFile.value
        pictureStepComplete.value = true
        pendingImageFile.value = null

        // Check if we have all info to proceed
        const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
        const hasSize = sizeStepComplete.value || extractedInfo.value.size
        
        if (hasAllInfo && hasSize) {
          // Has everything - generate!
          chatMessages.value.push({
            id: Date.now(),
            text: "Perfect! Your image is ready! Let me create your sticker now! 🎨",
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
            text: "Perfect! Your image is ready! 📸\n\nWhat size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          awaitingSizeDecision.value = true
          scrollToBottom()
        } else {
          // Still missing some info
          chatMessages.value.push({
            id: Date.now(),
            text: "Perfect! Your image is ready! 📸\n\n💡 **Tip:** You can drag the image to reposition it after the design is generated!",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        }
      }
      return
    }
  }

  // Check for required fields ONLY if preview hasn't been generated yet
  // After generation, all messages are just chat responses
  if (showWeddingStickerPreview.value) {
    // Handle "generate another" / "new background" / "another design" requests
    const generateAnotherPatterns = /\b(generate\s+another|another\s+(design|one|version)|new\s+background|different\s+background|change\s+background|try\s+another|next\s+(design|one)|random\s+background)\b/i
    if (generateAnotherPatterns.test(lowerMessage)) {
      // Deduct tokens for background change (10 tokens)
      const canProceed = await deductTokensForAction(TOKEN_COST_CHANGE_BACKGROUND, 'Change background')
      if (!canProceed) {
        chatMessages.value.push({
          id: Date.now(),
          text: "Sorry, you don't have enough tokens to change the background. Please purchase more tokens to continue.",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        isAnalyzing.value = false
        return
      }
      
      // Get a random background and apply it
      const randomBackground = getRandomBackground()
      
      if (randomBackground) {
        // Show loading spinner message
        isGeneratingNewBackground.value = true
        const loadingResponse = '🎨 Generating a new background design... Please wait!'
        chatMessages.value.push({
          id: Date.now(),
          text: loadingResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLoading: true
        })
        scrollToBottom()
        
        // Wait 6 seconds with loading spinner then apply background
        await new Promise(resolve => setTimeout(resolve, 6000))
        
        await applyNewBackground(randomBackground)
        isGeneratingNewBackground.value = false
        
        // Remove loading message and add completion message
        const loadingMsgIndex = chatMessages.value.findIndex(m => m.isLoading)
        if (loadingMsgIndex !== -1) {
          chatMessages.value.splice(loadingMsgIndex, 1)
        }
        
        const bgName = randomBackground.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')
        const aiResponse = `Done! I've applied a new background design: "${bgName}". 🎨\n\nWant me to try another one? Just say "generate another"!`
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      } else {
        const aiResponse = "Sorry, I couldn't find any background templates. Please add some background images to the /svg/background folder."
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
      scrollToBottom()
      isAnalyzing.value = false
      return
    }

    // Check if user explicitly wants to change something (direct update without confirmation)
    const wantsToChange = lowerMessage.includes('change') || lowerMessage.includes('update') ||
                          lowerMessage.includes('replace') || lowerMessage.includes('make it') ||
                          lowerMessage.includes('set the') || lowerMessage.includes('use')
    
    // ONLY extract and check for changes if user explicitly wants to change something
    if (wantsToChange) {
      const newDate = extractDateFromText(lastUserMessage)
      const newCourtesy = extractCourtesyFromText(lastUserMessage)
      
      // IMPORTANT: Check date FIRST before names to prevent "change the date" extracting "Change" as a name
      // Handle direct date changes
      if (newDate && newDate !== extractedInfo.value.date) {
        // Deduct tokens for date change (5 tokens)
        const canProceed = await deductTokensForAction(TOKEN_COST_EDIT_TEXT, 'Change date')
        if (!canProceed) {
          chatMessages.value.push({
            id: Date.now(),
            text: "Sorry, you don't have enough tokens to make this change. Please purchase more tokens to continue editing.",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
        
        // Direct update - user explicitly wants to change date
        const oldDate = extractedInfo.value.date
        if (oldDate) {
          accumulatedDescription.value = accumulatedDescription.value.replace(oldDate, newDate)
        } else {
          accumulatedDescription.value += ' ' + newDate
        }
        extractedInfo.value.date = newDate
        formData.description = accumulatedDescription.value
        
        // Update SVG with new date
        await processDescriptionInput()
        
        // Format the date with "on" prefix if not already present
        const formattedDate = newDate.toLowerCase().startsWith('on ') ? newDate : `on ${newDate}`
        
        // Update the master SVG in weddingPreviewContainer
        const masterSvgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
        if (masterSvgElement) {
          const dateTextEl = masterSvgElement.querySelector('#date-text') as SVGTextElement
          if (dateTextEl) {
            dateTextEl.textContent = formattedDate
            console.log('📅 Master SVG date updated:', formattedDate)
          }
        }
        
        // ALSO update the cloned SVG in chatPreviewContainer for immediate visual feedback
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        previewContainers.forEach((container) => {
          if (container) {
            const chatSvg = container.querySelector('svg') as SVGSVGElement
            if (chatSvg) {
              const chatDateEl = chatSvg.querySelector('#date-text') as SVGTextElement
              if (chatDateEl) {
                chatDateEl.textContent = formattedDate
                console.log('📅 Chat preview SVG date updated:', formattedDate)
              }
            }
          }
        })

        const aiResponse = `Done! I've updated the date to ${newDate}. Your design has been refreshed!`
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }

      // Handle direct courtesy changes - normalize both for comparison to avoid repeated updates
      const normalizeCourtesy = (c: string | null) => c?.toLowerCase().replace(/courtesy[:\s]*/i, '').replace(/\s+/g, ' ').trim() || ''
      const normalizedNew = normalizeCourtesy(newCourtesy)
      const normalizedExisting = normalizeCourtesy(extractedInfo.value.courtesy)
      
      if (newCourtesy && normalizedNew !== normalizedExisting) {
        // Deduct tokens for courtesy change (5 tokens)
        const canProceed = await deductTokensForAction(TOKEN_COST_EDIT_TEXT, 'Change courtesy')
        if (!canProceed) {
          chatMessages.value.push({
            id: Date.now(),
            text: "Sorry, you don't have enough tokens to make this change. Please purchase more tokens to continue editing.",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
        
        // Direct update - user explicitly wants to change courtesy
        const oldCourtesy = extractedInfo.value.courtesy
        if (oldCourtesy) {
          accumulatedDescription.value = accumulatedDescription.value.replace(oldCourtesy, newCourtesy)
        } else {
          accumulatedDescription.value += ' ' + newCourtesy
        }
        extractedInfo.value.courtesy = newCourtesy
        formData.description = accumulatedDescription.value
        
        // Update SVG with new courtesy
        await processDescriptionInput()
        
        // Format with "Courtesy:" prefix if not already present
        const formattedCourtesy = newCourtesy.toLowerCase().startsWith('courtesy') ? newCourtesy : `Courtesy: ${newCourtesy}`
        
        // Update the master SVG in weddingPreviewContainer
        const masterSvgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
        if (masterSvgElement) {
          const courtesyTextEl = masterSvgElement.querySelector('#courtesy-text') as SVGTextElement
          if (courtesyTextEl) {
            courtesyTextEl.textContent = formattedCourtesy
            console.log('🎭 Master SVG courtesy updated:', formattedCourtesy)
          }
        }
        
        // ALSO update the cloned SVG in chatPreviewContainer for immediate visual feedback
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        previewContainers.forEach((container) => {
          if (container) {
            const chatSvg = container.querySelector('svg') as SVGSVGElement
            if (chatSvg) {
              const chatCourtesyEl = chatSvg.querySelector('#courtesy-text') as SVGTextElement
              if (chatCourtesyEl) {
                chatCourtesyEl.textContent = formattedCourtesy
                console.log('🎭 Chat preview SVG courtesy updated:', formattedCourtesy)
              }
            }
          }
        })

        const aiResponse = `Done! I've updated the courtesy to "${newCourtesy}". Your design has been refreshed!`
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }

      // Handle picture/photo/image change requests - BEFORE name extraction
      // to prevent "i want to change the picture" from extracting "To" as a name
      if (lowerMessage.includes('picture') || lowerMessage.includes('photo') || lowerMessage.includes('image')) {
        const aiResponse = 'Sure! Please upload the new picture you want to use. Just click the image button or paste an image!'
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }

      // Handle "change the name" requests - check if user is ASKING to change names without providing them
      // Patterns like: "i want to change the name", "change the name", "update the names"
      const isAskingToChangeName = /\b(change|update|edit|modify)\s+(the\s+)?(name|names)\b/i.test(lastUserMessage) &&
        !/\b(change|update|edit|modify)\s+(the\s+)?(name|names)\s+(to|from)\s+[A-Z]/i.test(lastUserMessage)
      
      if (isAskingToChangeName) {
        // User wants to change names but hasn't provided new names yet - ask for them
        const aiResponse = 'What are the new names?'
        awaitingNameInput.value = true
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }

      // Handle direct name changes - ONLY if no date, courtesy, or picture was detected
      // This prevents "change the date" or "change the picture" from extracting random words as names
      const newNames = extractNamesFromResponse(lastUserMessage)
      if (newNames.name1) {
        // Deduct tokens for name change (5 tokens)
        const canProceed = await deductTokensForAction(TOKEN_COST_EDIT_TEXT, 'Change names')
        if (!canProceed) {
          chatMessages.value.push({
            id: Date.now(),
            text: "Sorry, you don't have enough tokens to make this change. Please purchase more tokens to continue editing.",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
        
        // Direct update - user explicitly wants to change names
        extractedInfo.value.names = newNames
        
        // Update accumulated description to include names in a format extractNames can detect
        // This ensures the decorative SVG system will pick up the new names
        if (newNames.name2) {
          // Try to replace existing name patterns (both with and without brackets)
          const bracketPattern = /\([^)]*(?:&|and)[^)]*\)/gi
          const plainPattern = /\b[A-Z][a-z]+\s*(?:&|and)\s*[A-Z][a-z]+\b/gi
          const newNameString = `(${newNames.name1} & ${newNames.name2})`
          
          if (bracketPattern.test(accumulatedDescription.value)) {
            accumulatedDescription.value = accumulatedDescription.value.replace(bracketPattern, newNameString)
          } else if (plainPattern.test(accumulatedDescription.value)) {
            accumulatedDescription.value = accumulatedDescription.value.replace(plainPattern, newNameString)
          } else {
            // No existing name pattern found - append names to description
            accumulatedDescription.value += ` ${newNameString}`
          }
          console.log('📝 Updated accumulated description with new names:', accumulatedDescription.value)
        }
        await processDescriptionInput()
        
        // Note: Don't directly update SVG textContent here - let processDescriptionInput handle it
        // through the decorative SVG system to preserve fonts
        
        // Just sync the chat preview after processDescriptionInput has updated the main SVG
        await nextTick()
        updateChatPreviewSVG()

        const aiResponse = `Done! I've updated the names to ${newNames.name1}${newNames.name2 ? ` and ${newNames.name2}` : ''}. Your design has been refreshed!`
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }
    }
    
    // Preview is already shown - handle as chat message only
    // Provide contextual AI response based on message content
    // Note: aiResponse is already declared at the function level

    if (lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('edit')) {
      // Smart change detection - check what specifically they want to change
      if (lowerMessage.includes('picture') || lowerMessage.includes('photo') || lowerMessage.includes('image')) {
        aiResponse = 'Upload the new picture.'
      } else if (lowerMessage.includes('date')) {
        aiResponse = 'What\'s the new date?'
      } else if (lowerMessage.includes('name')) {
        aiResponse = 'What are the new names?'
        awaitingNameInput.value = true
      } else if (lowerMessage.includes('courtesy') || lowerMessage.includes('from')) {
        aiResponse = 'What\'s the new courtesy?'
      } else if (lowerMessage.includes('size')) {
        aiResponse = 'What size would you like?'
        awaitingSizeDecision.value = true
      } else if (lowerMessage.includes('heading') || lowerMessage.includes('title')) {
        aiResponse = 'What should the heading say?'
        awaitingHeadingInput.value = true
      } else {
        aiResponse = 'What would you like to change?'
      }
    } else if (lowerMessage.includes('download') || lowerMessage.includes('save')) {
      aiResponse = 'Click the Download button below the preview!'
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('perfect')) {
      aiResponse = aiResponseHelper.pick(aiResponseHelper.casual.thanks)
    } else {
      aiResponse = 'Your design is ready!'
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    isAnalyzing.value = false
    return
  }
  
  // Check what we have so far using extractedInfo
  const hasNames = extractedInfo.value.names.name1 !== null
  const hasDate = extractedInfo.value.date !== null
  const hasCourtesy = extractedInfo.value.courtesy !== null
  
  // 1. Check for COMPLETE details first
  if (hasNames && hasDate && hasCourtesy) {
    // Step 0: Handle Custom Heading (NEW - Ask before picture)
    if (!headingStepComplete.value) {
      // Font choice step removed - using default font
      if (awaitingHeadingInput.value) {
        // User is providing a custom heading
        const wantsDefault = lowerMessage.includes('default') || lowerMessage.includes('keep') ||
                            lowerMessage.includes('original') || lowerMessage.includes('skip') ||
                            lowerMessage === 'no' || lowerMessage.includes('no thanks')

        if (wantsDefault) {
          customHeading.value = null // Keep default
          aiResponse = "No problem! I'll keep the default heading."
          awaitingHeadingInput.value = false
          headingStepComplete.value = true
        } else if (lastUserMessage.trim().length > 3) {
          // User provided a custom heading
          customHeading.value = lastUserMessage.trim()
          awaitingHeadingInput.value = false
          headingStepComplete.value = true
          
          // Proceed to picture step immediately
          if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
            aiResponse = `Perfect! Using "${customHeading.value}" as your heading. Would you like to add a picture to your design?`
            awaitingPictureDecision.value = true
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            return
          } else {
            aiResponse = `Perfect! Using "${customHeading.value}" as your heading. Creating your design now...`
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            setTimeout(() => generateWeddingPreview(), 300)
            return
          }
        } else {
          aiResponse = "Please enter a heading for your sticker (e.g., 'Congratulations on your wedding!') or say 'default' to keep the original."
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }

        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        // Fall through to picture step
      } else {
        // First time - ask about custom heading
        if (!showWeddingStickerPreview.value) {
          aiResponse = `${aiResponseHelper.pick(aiResponseHelper.confirmations)} Would you like a custom heading? (or say 'default')`
          awaitingHeadingInput.value = true

          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
      }
    }

    // Step 1: Handle Picture Decision
    // Check if we already have a picture uploaded (via UI or previous chat)
    if (preGeneratedImageFile.value) {
      pictureStepComplete.value = true
    }

    if (!pictureStepComplete.value) {
      if (awaitingPictureDecision.value) {
        const hasYes = lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('sure') || lowerMessage.includes('yep')
        const hasNo = lowerMessage.includes('no') || lowerMessage.includes('nope') || lowerMessage.includes('not')

        if (hasYes) {
          aiResponse = `Great! Please upload your picture using the image button!`
          awaitingPictureDecision.value = false
          // We don't set pictureStepComplete to true here because we want them to actually upload it
          // But we can set a flag to remind them if they try to proceed without it

          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else if (hasNo) {
          aiResponse = `No problem! We'll continue without a picture. It will still look great!`
          awaitingPictureDecision.value = false
          pictureStepComplete.value = true
          askedQuestions.value.picture = true

          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()

          // Fall through to next step (Size)
        } else {
          // Unclear response - but don't ask repeatedly
          if (!askedQuestions.value.picture) {
            aiResponse = "Please answer Yes or No! Do you have a picture you'd like to use?"
            askedQuestions.value.picture = true
          } else {
            // Already asked twice, proceed without picture
            aiResponse = "No worries! Let's continue without a picture."
            awaitingPictureDecision.value = false
            pictureStepComplete.value = true
          }
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          if (!pictureStepComplete.value) return
        }
      } else {
        // Ask about picture if not already asked - PREVENT REPETITION
        if (!showWeddingStickerPreview.value && !askedQuestions.value.picture) {
          aiResponse = `Would you like to add a picture to your design? 📸`
          awaitingPictureDecision.value = true
          askedQuestions.value.picture = true

          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else if (!showWeddingStickerPreview.value) {
          // Already asked about picture, skip to size
          pictureStepComplete.value = true
        }
      }
    }

    // Step 2: Handle Size Decision (skip if already provided) - PREVENT REPETITION
    if (pictureStepComplete.value && !sizeStepComplete.value) {
      // Check if size was already provided
      if (extractedInfo.value.size) {
        formData.customSize = extractedInfo.value.size
        sizeStepComplete.value = true
        askedQuestions.value.size = true
        // Don't ask, just proceed to generation
        aiResponse = aiResponseHelper.pick(aiResponseHelper.processing)

        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()

        formData.description = fullText
        setTimeout(() => {
          generateWeddingPreview()
        }, 1000)
        return
      }
      
      if (awaitingSizeDecision.value) {
        // Check for size in message
        const sizeMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
        const isDefault = lowerMessage.includes('default') || lowerMessage.includes('standard') || lowerMessage.includes('normal') || lowerMessage.includes('skip')

        if (sizeMatch) {
           const width = parseFloat(sizeMatch[1])
           const height = parseFloat(sizeMatch[2])
           formData.customSize = `${width}x${height} in`
           aiResponse = aiResponseHelper.pick(aiResponseHelper.sizeConfirm(`${width}x${height}`))
           awaitingSizeDecision.value = false
           sizeStepComplete.value = true
           askedQuestions.value.size = true
        } else if (isDefault) {
           formData.customSize = '4x4'
           aiResponse = "Perfect! Using the classic 4x4 inch size! ✨"
           awaitingSizeDecision.value = false
           sizeStepComplete.value = true
           askedQuestions.value.size = true
        } else if (askedQuestions.value.size) {
           // Already asked once, use default and proceed
           formData.customSize = '4x4'
           aiResponse = "I'll use the standard 4x4 inch size! 📐"
           awaitingSizeDecision.value = false
           sizeStepComplete.value = true
        } else {
           aiResponse = "What size? (e.g., '3x3') Or say 'default' for 4x4 inches!"
           askedQuestions.value.size = true
           chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }

        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()

        // Fall through to Generation
      } else {
        // Ask about size - PREVENT REPETITION
        if (!askedQuestions.value.size) {
          aiResponse = "What size would you like? 📐 (e.g., '4x4' or say 'default')"
          awaitingSizeDecision.value = true
          askedQuestions.value.size = true

          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else {
          // Already asked, use default
          formData.customSize = '4x4'
          sizeStepComplete.value = true
        }
      }
    }

    // If we're here, all steps are complete. Proceed with generation.
    // ONLY generate if preview hasn't been shown yet - prevents validation errors when user types after generation
    if (!showWeddingStickerPreview.value) {
      aiResponse = aiResponseHelper.pick(aiResponseHelper.processing)
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()

      // Trigger Generation
      // Set the full description back to formData so the generator uses it
      formData.description = fullText 
      
      setTimeout(() => {
        generateWeddingPreview()
      }, 1000)
    }
    // If preview is already shown, just ignore this path and let the chat response flow handle it
    return
  }

  // 2. Check for Greetings & Questions
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hola', 'bonjour', 'salam', 'assalamu alaikum', 'namaste']
  const isGreeting = greetings.some(g => lowerMessage.includes(g))
  
  // Check if this is a question/command - use word boundaries to avoid false matches
  // e.g. "November" should NOT match "no", "show" should NOT match "how"
  const isQuestion = lowerMessage.includes('?') || 
                     /\bhow\b/.test(lowerMessage) || 
                     /\bwhat\b/.test(lowerMessage) || 
                     /\bhelp\b/.test(lowerMessage) ||
                     /\bguide\b/.test(lowerMessage) ||
                     /\bupdate\b/.test(lowerMessage) ||
                     /\bchange\b/.test(lowerMessage) ||
                     /\byes\b/.test(lowerMessage) ||
                     /\bno\b/.test(lowerMessage) ||
                     lowerMessage.includes('can you') ||
                     lowerMessage.includes('could you') ||
                     lowerMessage.includes('would you')

  const hasAnyInfo = hasNames || hasDate || hasCourtesy

  // Check for "continue" or "skip" commands to proceed with partial info
  if ((lowerMessage.includes('continue') || lowerMessage.includes('skip') || lowerMessage.includes('proceed')) && !showWeddingStickerPreview.value) {
    if (extractedInfo.value.names.name1) {
      // Has at least a name, can proceed
      if (!pictureStepComplete.value && !preGeneratedImageFile.value) {
        aiResponse = `Alright! Do you have a picture you'd like to use in your design?`
        awaitingPictureDecision.value = true
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      } else {
        // Proceed to generation
        formData.description = fullText
        setTimeout(() => generateWeddingPreview(), 300)
        return
      }
    }
  }

  // Check for size change request
  const sizeMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
  if (sizeMatch) {
     const width = parseFloat(sizeMatch[1])
     const height = parseFloat(sizeMatch[2])

     if (!isNaN(width) && !isNaN(height)) {
        formData.customSize = `${width}x${height} in`

        if (showWeddingStickerPreview.value) {
           await handleSizeChange(width, height)
           aiResponse = `Done! I've resized your design to ${width} x ${height} inches!`
        } else {
           aiResponse = `Got it! The design will be ${width} x ${height} inches. What else would you like?`
        }

        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
     }
  }

  // Check for specific questions and requests
  if (lowerMessage.includes('color') || lowerMessage.includes('colour')) {
    aiResponse = "What colors would you like?"
  } else if (lowerMessage.includes('size') || lowerMessage.includes('dimension')) {
    aiResponse = "What size would you like?"
  } else if (lowerMessage.includes('example') || lowerMessage.includes('sample')) {
    aiResponse = "Example: 'Sarah & Michael, 20th June 2025, courtesy: Johnson Family'"
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pay')) {
    aiResponse = "For pricing, please check with the team."
  } else if (lowerMessage.includes('download') || lowerMessage.includes('save')) {
    aiResponse = "Click the 'Export' button to download your sticker!"
  } else if (lowerMessage.includes('redo') || lowerMessage.includes('start over') || lowerMessage.includes('again') || lowerMessage.includes('new design') || lowerMessage.includes('fresh start')) {
    // Reset state for new generation
    showWeddingStickerPreview.value = false
    accumulatedDescription.value = ''
    formData.description = ''
    svgImageManager.clearAllImages()
    preGeneratedImageFile.value = null
    pendingImageFile.value = null
    pictureStepComplete.value = false
    sizeStepComplete.value = false
    awaitingPictureDecision.value = false
    awaitingSizeDecision.value = false
    backgroundRemovalAlreadyHandled.value = false
    // Reset heading and font state
    awaitingHeadingInput.value = false
    awaitingFontChoice.value = false
    customHeading.value = null
    selectedHeadingFont.value = null
    headingStepComplete.value = false
    // Reset background tracking for fresh variety
    currentBackgroundIndex.value = -1
    usedBackgroundsInSession.value = []
    // Reset extracted info
    extractedInfo.value = {
      date: null,
      courtesy: null,
      size: null,
      names: { name1: null, name2: null }
    }
    // Reset asked questions tracking to prevent repetition issues
    resetAskedQuestions()

    aiResponse = "Fresh start! 🎨 Tell me the couple's names, wedding date, and courtesy to begin!"
  } else if (lowerMessage.includes('thank')) {
    aiResponse = aiResponseHelper.pick(aiResponseHelper.casual.thanks)
  } else if (isQuestion) {
     // Check if user is asking what information is needed
     if (lowerMessage.includes('what') && (lowerMessage.includes('information') || lowerMessage.includes('info') || lowerMessage.includes('need') || lowerMessage.includes('require'))) {
        aiResponse = "I need the following information to create your wedding sticker:\n\n" +
          "📝 **Names** - The couple's names (e.g., Aisha & Khalid)\n" +
          "📅 **Date** - Wedding date (e.g., on 25th December 2025)\n" +
          "👨‍👩‍👧 **Courtesy** - Family name (e.g., courtesy: The Abdullahi's)\n" +
          "📐 **Size** - Sticker size (e.g., 4x2.5 inches)\n" +
          "🖼️ **Picture** - Optional photo of the couple\n\n" +
          "You can type all at once or one at a time!"
     } else if (lowerMessage.includes('how')) {
        aiResponse = "Just tell me the couple's **names**, **wedding date**, and **family name** (courtesy). For example:\n\n" +
          "\"Aisha & Khalid, on 25th December 2025, courtesy: The Abdullahi's\"\n\n" +
          "You can also add a size like \"4x2.5 inches\" and upload a photo!"
     } else if (lowerMessage.includes('what')) {
        aiResponse = "I can help you create a beautiful wedding sticker! Just provide:\n\n" +
          "• Couple's names\n• Wedding date\n• Family courtesy\n• Size (optional)\n• Photo (optional)"
     } else if (lowerMessage.includes('update') || lowerMessage.includes('change')) {
        // If we have a preview, update it directly
        if (showWeddingStickerPreview.value) {
          aiResponse = "Sure! Updating your design now... Please wait!"

          setTimeout(() => {
            processDescriptionInput()
          }, 500)
        } else {
          aiResponse = "Just type the new info you'd like to change, and I'll update it automatically!"
        }
     } else if (lowerMessage === 'yes' || lowerMessage.includes('yes please')) {
        // Handle confirmation for image update or general adjustments
        if (showWeddingStickerPreview.value) {
           aiResponse = "Great! Updating your design now..."
           setTimeout(() => {
             generateWeddingPreview()
           }, 1000)

           chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else {
           aiResponse = "Please provide your information."
        }
     } else if (lowerMessage === 'no' || lowerMessage.includes('no thanks')) {
        aiResponse = "Alright!"
     } else {
        aiResponse = aiResponseHelper.pick(aiResponseHelper.errors.noInfo)
     }
  } else if (isGreeting && !hasAnyInfo) {
     // Use friendly greetings
     aiResponse = aiResponseHelper.getGreeting(lastUserMessage, userName)
  } else if (customHeading.value && !extractedInfo.value.names.name1 && !extractedInfo.value.date && !extractedInfo.value.courtesy) {
     // Title was detected but no other info yet - acknowledge the title and ask for more
     aiResponse = `Got it! I'll use "${customHeading.value}" as your heading.\n\nPlease provide names, date and courtesy.`
  } else if (lowerMessage.includes('dont have') || lowerMessage.includes('don\'t have') || lowerMessage.includes('not now') || lowerMessage.includes('cancel') || lowerMessage.includes('leave it')) {
     aiResponse = "No problem!"
  } else if (lowerMessage.includes('thank')) {
     aiResponse = aiResponseHelper.pick(aiResponseHelper.casual.thanks)
  } else if (lowerMessage.includes('how are you') || lowerMessage.includes('how you dey') || lowerMessage.includes('how far')) {
     aiResponse = aiResponseHelper.pick(aiResponseHelper.casual.howAreYou)
  } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('later')) {
     aiResponse = aiResponseHelper.pick(aiResponseHelper.casual.goodbye)
  } else if (lowerMessage.includes('joke') || lowerMessage.includes('funny') || lowerMessage.includes('make me laugh')) {
     aiResponse = aiResponseHelper.pick(aiResponseHelper.jokes)
  } else {
    // If user provides info but it's incomplete or just an update
    if (showWeddingStickerPreview.value) {
       // Only update if user explicitly requests changes with keywords
       const isUpdateRequest = lowerMessage.includes('change') || 
                               lowerMessage.includes('update') || 
                               lowerMessage.includes('modify') ||
                               lowerMessage.includes('edit') ||
                               lowerMessage.includes('fix') ||
                               lowerMessage.includes('replace')
       
       if (isUpdateRequest) {
         aiResponse = "I've updated your design with the new details."
         setTimeout(() => {
           processDescriptionInput()
         }, 500)
       } else {
         // User is just chatting, don't auto-update
         aiResponse = "Got it! Let me know if you need changes."
       }
    } else {
      // 3. Standard Missing Fields Logic - Enhanced Name Detection
      const missingFields: string[] = []
      
      // IMPORTANT: Check if the input is vague/unclear first - don't try to extract from gibberish
      const isUnclearInput = !lastUserMessage.trim() || 
        lastUserMessage.trim().length < 3 ||
        /^[^a-zA-Z0-9]*$/.test(lastUserMessage) || // Only symbols/punctuation
        /^(um+|uh+|hmm+|err+|ah+|oh+|eh+|huh+)$/i.test(lastUserMessage.trim()) // Filler words
      
      // Check if this is a vague reference without actual data
      const isVagueReference = /^(this is|here is|here's|my info|my information|my details|the info|the information|the details|i have|got|okay|ok|alright|yes|no|sure|maybe|please|help me|do it|make it|create|design|sticker|wedding)$/i.test(lastUserMessage.trim()) ||
        /^(this is|here is|here's|i have)\s+(my|the|some)?\s*(info|information|details|data|stuff)?$/i.test(lastUserMessage.trim())
      
      // If input is unclear or vague, don't try to extract - just guide the user
      if (isUnclearInput || isVagueReference) {
        aiResponse = `Sure! Please provide:\n\n` +
          `• Names (e.g., John & Mary)\n` +
          `• Date (e.g., 25th Dec 2025)\n` +
          `• Courtesy (e.g., The Smith Family)\n\n` +
          `You can share everything in one message!`
        
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }
      
      // Try to extract any missing info from the current message first
      if (!extractedInfo.value.date) {
        const newDate = extractDateFromText(lastUserMessage)
        if (newDate) {
          extractedInfo.value.date = newDate
          accumulatedDescription.value += ' ' + newDate
        }
      }
      
      if (!extractedInfo.value.courtesy) {
        const newCourtesy = extractCourtesyFromText(lastUserMessage)
        if (newCourtesy) {
          extractedInfo.value.courtesy = newCourtesy
          accumulatedDescription.value += ' ' + newCourtesy
        }
      }
      
      // Check for names using enhanced extraction
      const extractedNames = extractNamesFromResponse(lastUserMessage)
      if (extractedNames.name1 && !extractedInfo.value.names.name1) {
        extractedInfo.value.names = extractedNames
        // Add names to accumulated description IN BRACKET FORMAT so updateStickerText can extract them
        if (extractedNames.name2) {
          accumulatedDescription.value += ' (' + extractedNames.name1 + ' and ' + extractedNames.name2 + ')'
        } else {
          accumulatedDescription.value += ' (' + extractedNames.name1 + ')'
        }
      }
      
      // Now check what's still missing based on extractedInfo
      const hasNamesEnhanced = extractedInfo.value.names.name1 !== null
      const hasDateEnhanced = extractedInfo.value.date !== null
      const hasCourtesyEnhanced = extractedInfo.value.courtesy !== null
      
      // If we just got all the info, proceed!
      if (hasNamesEnhanced && hasDateEnhanced && hasCourtesyEnhanced) {
        // FIRST: Check if heading is needed
        if (!headingStepComplete.value && !awaitingTitleConfirmation.value) {
          // Check for known title phrases first
          const detectedTitle = extractTitleFromText(lastUserMessage)
          if (detectedTitle) {
            pendingTitle.value = detectedTitle
            awaitingTitleConfirmation.value = true
            aiResponse = `Is "${detectedTitle}" your heading? (yes/no or type your own)`
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            return
          }
          
          // If no known title detected, try to find remaining text as potential heading
          // Remove extracted info from the message to see what's left
          let remainingText = lastUserMessage
          
          // Remove names
          if (extractedInfo.value.names.name1) {
            remainingText = remainingText.replace(new RegExp(extractedInfo.value.names.name1, 'gi'), '')
          }
          if (extractedInfo.value.names.name2) {
            remainingText = remainingText.replace(new RegExp(extractedInfo.value.names.name2, 'gi'), '')
          }
          // Remove & and 'and' connectors
          remainingText = remainingText.replace(/\s*&\s*/g, ' ').replace(/\s+and\s+/gi, ' ')
          
          // Remove date
          if (extractedInfo.value.date) {
            remainingText = remainingText.replace(new RegExp(extractedInfo.value.date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
          }
          // Remove common date patterns
          remainingText = remainingText
            .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[,.]?\s*\d{0,4}\b/gi, '')
            .replace(/\bon\s+/gi, ' ')
          
          // Remove courtesy
          if (extractedInfo.value.courtesy) {
            remainingText = remainingText.replace(new RegExp(extractedInfo.value.courtesy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
          }
          // Remove common courtesy patterns
          remainingText = remainingText
            .replace(/\bcourtesy[:\s]*/gi, '')
            .replace(/\bthe\s+\w+\s+family\b/gi, '')
          
          // Clean up remaining text
          remainingText = remainingText
            .replace(/[()[\]]/g, '') // Remove brackets
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
          
          // If there's meaningful remaining text (more than 3 chars), ask if it's the heading
          if (remainingText.length > 3 && !/^(and|the|on|of|for|with|from|to|in|at)$/i.test(remainingText)) {
            // Capitalize first letter of each word for display
            const formattedHeading = remainingText
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
            
            pendingTitle.value = formattedHeading
            awaitingTitleConfirmation.value = true
            aiResponse = `Is "${formattedHeading}" the heading you want to use? (yes/no)`
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            return
          }
        }
        
        // Has everything now, check picture and size
        if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
          aiResponse = aiResponseHelper.pick(aiResponseHelper.pictureAsk)
          awaitingPictureDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else {
          pictureStepComplete.value = true
          if (!extractedInfo.value.size && !sizeStepComplete.value) {
            aiResponse = aiResponseHelper.pick(aiResponseHelper.sizeAsk)
            awaitingSizeDecision.value = true
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            return
          } else {
            // Has everything, generate!
            aiResponse = aiResponseHelper.pick(aiResponseHelper.processing) + " " + aiResponseHelper.pick(aiResponseHelper.success)
            formData.description = accumulatedDescription.value
            setTimeout(() => generateWeddingPreview(), 300)
            return
          }
        }
      }

      if (!hasNamesEnhanced) {
        missingFields.push('names')

        // If ONLY name is missing, trigger enhanced name extraction mode
        if (hasDateEnhanced || hasCourtesyEnhanced || fullText.trim().length > 10) {
          awaitingNameInput.value = true
          nameExtractionAttempts.value = 0
          aiResponse = aiResponseHelper.pick(aiResponseHelper.askNames)

          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
      }

      if (!hasDateEnhanced) missingFields.push('date')
      if (!hasCourtesyEnhanced) missingFields.push('courtesy')

      // Special case: If ONLY courtesy is missing, set awaiting flag
      if (hasNamesEnhanced && hasDateEnhanced && !hasCourtesyEnhanced) {
        awaitingCourtesyInput.value = true
        aiResponse = `${aiResponseHelper.pick(aiResponseHelper.confirmations)} Please provide the courtesy.`
        
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }

      // Special case: User uploaded a picture but hasn't provided text details
      if (preGeneratedImageFile.value && missingFields.length === 3) {
         aiResponse = `${aiResponseHelper.pick(aiResponseHelper.pictureReceived)} Please provide names, date, and courtesy.`
      } else if (missingFields.length === 1) {
        // If only courtesy is missing, set the flag
        if (!hasCourtesyEnhanced) {
          awaitingCourtesyInput.value = true
        }
        aiResponse = `${aiResponseHelper.pick(aiResponseHelper.confirmations)} Please provide ${missingFields[0]}.`
      } else if (missingFields.length > 0) {
        // Just ask for missing fields
        aiResponse = `Please provide ${missingFields.join(' and ')}.`
      } else {
        aiResponse = aiResponseHelper.pick(aiResponseHelper.confirmations)
      }
    }
  }

  // FALLBACK: If no response was generated, check if the message could be a title/heading
  if (!aiResponse || aiResponse.trim() === '') {
    // Check if message looks like a potential title/heading
    if (isPotentialTitle(lastUserMessage) && !headingStepComplete.value) {
      pendingTitle.value = lastUserMessage
      awaitingTitleConfirmation.value = true
      aiResponse = `Do you want to use "${lastUserMessage}" as your heading? (yes/no)`
    } else if (lastUserMessage.length > 5 && lastUserMessage.length < 60 && !headingStepComplete.value) {
      // Message is short enough to be a title but not detected as a known pattern
      pendingTitle.value = lastUserMessage
      awaitingTitleConfirmation.value = true
      aiResponse = `Do you want to use "${lastUserMessage}" as your heading? (yes/no)`
    } else {
      // Simple fallback - just ask for details
      aiResponse = "Please provide your details."
    }
  }

  chatMessages.value.push({
    id: Date.now(),
    text: aiResponse,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
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
  console.log('🎯 Category selected:', categoryId)
  
  selectedCategory.value = categoryId
  console.log('✅ selectedCategory.value set to:', selectedCategory.value)
  console.log('📋 Should show form now:', !!selectedCategory.value)
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

function goBack() {
  if (selectedCategory.value) {
    selectedCategory.value = null
  } else {
    router.push('/home')
  }
}

// Wedding Sticker Functions
async function loadWeddingStickerTemplate() {
  if (!weddingPreviewContainer.value) {
    console.error('❌ weddingPreviewContainer.value is null!')
    return
  }

  console.log('🔄 Loading wedding sticker template...')

  try {
    // Reset replacement state when loading new template
    resetReplacement()

    // 🔥 INLINE SVG TEMPLATE - No server fetch needed
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
    console.log(`✅ Using inline SVG template`)

    console.log('📝 SVG text length:', svgText.length)
    console.log('📝 First 200 chars:', svgText.substring(0, 200))

    // Insert SVG into container
    weddingPreviewContainer.value.innerHTML = svgText
    console.log('✅ SVG inserted into container')
    
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
      console.error('❌ SVG element not found after insertion!')
      console.error('Container HTML:', weddingPreviewContainer.value.innerHTML.substring(0, 200))
      return
    }
    
    console.log('✅ SVG element found:', svgElement)
    
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
          console.log(`📐 SVG viewBox: ${vbWidth}x${vbHeight} (aspect: ${(vbWidth/vbHeight).toFixed(2)})`)
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
      
      console.log('🔍 SVG Element before handleReplacement:', svgElement)
      console.log('🔍 SVG Element IDs found:', {
        blessingText: !!svgElement.querySelector('#blessing-text'),
        occasionText: !!svgElement.querySelector('#occasion-text'),
        eventTypeText: !!svgElement.querySelector('#event-type-text'),
        ceremonyText: !!svgElement.querySelector('#ceremony-text')
      })
      
      try {
        // Get title color based on current background
        const titleColor = getTitleColorForBackground()
        console.log('🎨 Title color for current background:', titleColor)
        
        if (matchedTitle) {
          console.log('🎯 Title Library match found:', matchedTitle.fallbackText)
          console.log('🎯 Using SVG:', matchedTitle.svgPath)
          
          // Pre-render SVG to PNG for reliable export (allows color changes)
          await replaceTitleWithImage(svgElement, {
            svgPath: matchedTitle.svgPath,
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: matchedTitle.position || { x: -30, y: 50, width: 1800, height: 900 },
            scale: matchedTitle.scale || 1.0,
            color: titleColor
          })
        } else {
          console.log('⚠️ No title match, using default wedding title')
          // Use default SVG title
          await replaceTitleWithImage(svgElement, {
            svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: { x: -30, y: 50, width: 1800, height: 900 },
            scale: 1.0,
            color: titleColor
          })
        }
        console.log('✅ handleReplacement completed successfully')
        console.log('🔍 Title replacement group exists:', !!svgElement.querySelector('#wedding-title-replacement'))
        
        // Insert flourish above names with matching color
        const flourishColor = getFlourishColorForBackground()
        await insertFlourishAboveNames(svgElement, flourishColor)
      } catch (handleReplacementError) {
        console.error('❌ handleReplacement failed:', handleReplacementError)
      }

      // Apply current description if any (for names, date, etc.)
      if (formData.description) {
        await handleNamesWithTitleSVG(formData.description, svgElements)
      }

      // Show success notification
      authStore.showNotification({
        title: 'Template Loaded',
        message: `Wedding sticker template loaded from ${successSource}`,
        type: 'success'
      })
    }
  } catch (error) {
    console.error('❌ Failed to load wedding sticker template:', error)
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
  console.log('🔍 updateDateAndCourtesy called with:', { description, svgElements: !!svgElements })
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
    console.log('📅 Date updated:', dateText)
  }

  // Update courtesy if found
  const courtesyData = extractCourtesy(description)
  if (courtesyData && svgElements.courtesyText) {
    svgElements.courtesyText.textContent = `${courtesyData.prefix} ${courtesyData.text}`
    console.log('🎭 Courtesy updated:', courtesyData)
  }
}

// Helper function to handle names when title SVG is active (use decorative name02.svg)
async function handleNamesWithTitleSVG(description: string, svgElements: any) {
  console.log('🔍 handleNamesWithTitleSVG called with:', { description })
  
  // Always call updateStickerText to ensure date and courtesy are updated
  // regardless of whether names are present or not
  const data = await updateStickerText(description, svgElements)
  
  // Extract names from parentheses for logging purposes
  const nameMatch = description.match(/\(([^)]+)\)/)?.[1]
  
  if (nameMatch) {
    const names = nameMatch.split(/\s*[&and]+\s*/i).map(name => name.trim())
    if (names.length === 2 && svgElements?.weddingNamesGroup) {
      console.log('✅ Two names detected, decorative SVG injection handled by updateStickerText')
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
    console.log('✅ Auto-paired parentheses')
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
      
      console.log(`✅ Auto-completed "${lastWord}" to "${match.complete}"`)
    }
  }
}

// Debounced input handler to prevent UI freezing during typing
const handleDescriptionInput = useDebounceFn(() => {
  processDescriptionInput()
}, 50)

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

    console.log('📝 Applied custom heading:', customHeading.value)
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

    console.log('🎨 Applied heading font:', selectedHeadingFont.value, fontFamily)
  }
}

async function processDescriptionInput() {
  console.log('🔄 processDescriptionInput triggered:', { 
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
      // Check accumulated description OR custom heading for title match
      const textToMatch = customHeading.value || accumulatedDescription.value || formData.description
      const matchedTitle = findMatchingTitle(textToMatch)
      
      // Get title color based on current background
      const titleColor = getTitleColorForBackground()
      console.log('🎨 Title color for current background:', titleColor)
      
      if (matchedTitle) {
        console.log('🎯 Using Title Library match:', matchedTitle.fallbackText)
        console.log('🎯 SVG Path:', matchedTitle.svgPath)
        
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
        console.log('⚠️ No title match, using default wedding title')
        // Use default SVG title
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
              text: "Perfect! Your image is ready! Let me create your sticker now! 🎨",
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
              text: "Perfect! Your image is ready! 📸\n\nWhat size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)",
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            awaitingSizeDecision.value = true
            scrollToBottom()
          } else {
            // Still missing some info
            chatMessages.value.push({
              id: Date.now(),
              text: "Perfect! Your image is ready! 📸\n\n💡 **Tip:** You can drag the image to reposition it after the design is generated!",
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
  if (!weddingPreviewContainer.value) return

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) return

  const images = svgImageManager.images.value
  
  console.log('🔄 updateSVGWithImages called:', {
    imagesCount: images.length,
    hasImages: images.length > 0,
    firstImageDataUrlLength: images[0]?.dataUrl?.length || 0
  })
  
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
      
      console.log(`📸 Frame scaled: x=${frameX.toFixed(0)}, y=${frameY.toFixed(0)}, w=${frameWidth.toFixed(0)}, h=${frameHeight.toFixed(0)}`)
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
        console.log(`📐 Clip-path adjusted: x=${clipX.toFixed(0)}, y=${clipY}, w=${clipWidth.toFixed(0)}, h=${clipHeight.toFixed(1)}`)
      }
    }
    
    console.log(`🖼️ Image update: x=${adjustedX.toFixed(1)}, y=${adjustedY.toFixed(1)}, w=${adjustedWidth.toFixed(1)}, h=${adjustedHeight.toFixed(1)}`)
    console.log(`🖼️ Image dataUrl length: ${img.dataUrl?.length || 0}`)
    
    userImageElement.setAttribute('x', adjustedX.toString())
    userImageElement.setAttribute('y', adjustedY.toString())
    userImageElement.setAttribute('width', adjustedWidth.toString())
    userImageElement.setAttribute('height', adjustedHeight.toString())
    userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
    userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    userImageElement.setAttribute('href', img.dataUrl)
    
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
      console.warn('⚠️ SVG validation issues:', validation.issues)
      // Continue anyway but log the issues
    }

    // Get stored export dimensions (set by handleSizeChange)
    const exportWidthPx = svgElement.getAttribute('data-export-width-px')
    const exportHeightPx = svgElement.getAttribute('data-export-height-px')
    const exportWidth = svgElement.getAttribute('data-export-width')
    const exportHeight = svgElement.getAttribute('data-export-height')
    const originalStyleWidth = svgElement.style.width
    const originalStyleHeight = svgElement.style.height

    console.log('📤 Starting export:', {
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
      console.log(`📏 Set export dimensions: ${exportWidthPx} × ${exportHeightPx}px`)
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
        console.log(`📏 Calculated export from viewBox: ${calculatedWidth} × ${calculatedHeight}px (viewBox: ${vbWidth}x${vbHeight})`)
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

  // Set category
  autoDesignStore.setCategory('sticker')

  // Load wedding template (only category available)
  loadCategoryTemplate('wedding')
  
  nextTick(() => {
    loadWeddingStickerTemplate()
  })
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
  overflow: auto;
  min-height: 0;
}

/* Wedding chat mode - remove padding and border radius for full-height chat */
.form-section.wedding-mode {
  padding: 0;
  border-radius: 0;
  overflow: hidden;
}

/* Wedding chat interface layout */
.wedding-chat-interface {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: white;
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
  content: "•";
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

/* Add bottom padding to main container to account for fixed footer */
.form-section,
.wedding-preview-section {
  margin-bottom: 80px;
}

@media (max-width: 768px) {
  .form-section,
  .wedding-preview-section {
    margin-bottom: 70px;
  }
}
</style>



