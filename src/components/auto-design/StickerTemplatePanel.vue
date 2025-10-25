<template>
  <div class="sticker-template-panel">
    <!-- FORM VIEW -->
    <Transition name="fade">
      <div v-if="viewMode === 'form'" class="form-view">
        <!-- Header -->
        <div class="panel-header">
          <button @click="goBack" class="back-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 class="panel-title">Sticker Template</h2>
          <button @click="showMenu = !showMenu" class="menu-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        <!-- Sticker Type Selection -->
        <div class="sticker-type-section">
          <div class="sticker-type-header">
            <label class="sticker-type-label">Select the styles you want <span class="optional-text">(Optional)</span></label>
          </div>
          <div class="sticker-type-checkboxes">
            <div class="checkbox-item">
              <input
                id="box-sticker"
                v-model="formData.stickerTypes.box"
                type="checkbox"
                class="sticker-checkbox"
              />
              <label for="box-sticker" class="checkbox-label">Box Sticker</label>
            </div>
            <div class="checkbox-item">
              <input
                id="circle-sticker"
                v-model="formData.stickerTypes.circle"
                type="checkbox"
                class="sticker-checkbox"
              />
              <label for="circle-sticker" class="checkbox-label">Circle Sticker</label>
            </div>
            <div class="checkbox-item">
              <input
                id="die-cut"
                v-model="formData.stickerTypes.dieCut"
                type="checkbox"
                class="sticker-checkbox"
              />
              <label for="die-cut" class="checkbox-label">Die-cut</label>
            </div>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="category-pills">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-pill', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Form Section -->
        <div class="form-section">
      <!-- Description Field -->
      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          @input="handleDescriptionInput"
          class="form-textarea"
          rows="4"
          placeholder="Enter sticker description... (e.g., Congratulations on your wedding! John and Mary, 15th April 2025, courtesy: Smith Family)"
        ></textarea>
      </div>

      <!-- Wedding Sticker Preview (shown when wedding category is selected) -->
      <div v-if="selectedCategory === 'wedding'" class="wedding-preview-section">
        <label class="form-label">Live Preview</label>
        <div class="wedding-preview-container" ref="weddingPreviewContainer">
          <!-- SVG will be loaded here -->
        </div>

        <!-- Image Upload & Management for Wedding Sticker -->
        <div class="svg-image-management">
          <label class="form-label">Add Images to Sticker</label>

          <!-- Background Removal Toggle -->
          <div class="background-removal-toggle">
            <label class="toggle-label">
              <input
                type="checkbox"
                v-model="autoRemoveBackground"
                class="toggle-checkbox"
              />
              <span class="toggle-text">Automatically remove background from uploaded images</span>
            </label>
            <p class="toggle-hint">Uses AI to remove backgrounds (may take a few seconds)</p>
          </div>

          <!-- Background Removal Processing Indicator -->
          <div v-if="isRemovingBackground" class="processing-indicator">
            <div class="processing-content">
              <ion-spinner name="crescent" class="processing-spinner"></ion-spinner>
              <div class="processing-text">
                <p class="processing-title">Removing background...</p>
                <p class="processing-progress">{{ backgroundRemovalProgress }}%</p>
              </div>
              <button @click="cancelBackgroundRemoval" class="cancel-btn">Cancel</button>
            </div>
          </div>

          <!-- Background Removal Error -->
          <div v-if="backgroundRemovalError" class="background-removal-error">
            <div class="error-content">
              <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="error-text">
                <p class="error-title">Background removal failed</p>
                <p class="error-message">{{ backgroundRemovalError }}</p>
                <p class="error-hint">Using original image instead.</p>
              </div>
              <button @click="backgroundRemovalError = null" class="error-close-btn">×</button>
            </div>
          </div>

          <!-- Drag & Drop Zone -->
          <div
            class="image-drop-zone"
            :class="{ 'is-dragging': svgImageManager.isDragging.value }"
            @dragover="svgImageManager.handleDragOver"
            @dragleave="svgImageManager.handleDragLeave"
            @drop="handleImageDrop"
            @click="triggerImageFileInput"
          >
            <div v-if="svgImageManager.isProcessing.value" class="drop-zone-content">
              <div class="loading-spinner"></div>
              <p>Processing image...</p>
            </div>
            <div v-else class="drop-zone-content">
              <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="drop-zone-text">Drag & drop images here or click to browse</p>
              <p class="drop-zone-subtext">PNG, JPG, JPEG, SVG (Max 5MB)</p>
            </div>
            <input
              ref="imageFileInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              class="hidden"
              @change="handleImageFileSelect"
            />
          </div>

          <!-- Error Message -->
          <div v-if="svgImageManager.uploadError.value" class="upload-error">
            {{ svgImageManager.uploadError.value }}
          </div>

          <!-- Image List & Controls -->
          <div v-if="svgImageManager.images.value.length > 0" class="image-list-section">
            <div class="image-list-header">
              <h4 class="image-list-title">Uploaded Images ({{ svgImageManager.images.value.length }})</h4>
              <button @click="svgImageManager.clearAllImages" class="clear-all-btn">
                Clear All
              </button>
            </div>

            <!-- Image Gallery -->
            <div class="image-gallery">
              <div
                v-for="image in svgImageManager.images.value"
                :key="image.id"
                class="image-gallery-item"
                :class="{ 'selected': svgImageManager.selectedImageId.value === image.id }"
                @click="svgImageManager.selectImage(image.id)"
              >
                <img :src="image.dataUrl" :alt="image.id" class="gallery-thumbnail" />
                <div class="gallery-item-actions">
                  <button @click.stop="svgImageManager.removeImage(image.id)" class="gallery-remove-btn" title="Remove">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div class="gallery-item-label">{{ image.id }}</div>
              </div>
            </div>

            <!-- Image Positioning Controls (hidden for wedding sticker) -->
            <div v-if="false && selectedSVGImage" class="image-controls-section">
              <h4 class="controls-title">Edit: {{ selectedSVGImage.id }}</h4>

              <div class="controls-grid">
                <!-- Position Controls -->
                <div class="control-group">
                  <label class="control-label">X Position</label>
                  <input
                    type="number"
                    :value="selectedSVGImage.x"
                    @input="handleImagePropertyInput('x', $event)"
                    class="control-input"
                  />
                </div>

                <div class="control-group">
                  <label class="control-label">Y Position</label>
                  <input
                    type="number"
                    :value="selectedSVGImage.y"
                    @input="handleImagePropertyInput('y', $event)"
                    class="control-input"
                  />
                </div>

                <!-- Size Controls -->
                <div class="control-group">
                  <label class="control-label">Width</label>
                  <input
                    type="number"
                    :value="Math.round(selectedSVGImage.width)"
                    @input="handleImagePropertyInput('width', $event)"
                    class="control-input"
                  />
                </div>

                <div class="control-group">
                  <label class="control-label">Height</label>
                  <input
                    type="number"
                    :value="Math.round(selectedSVGImage.height)"
                    @input="handleImagePropertyInput('height', $event)"
                    class="control-input"
                    :disabled="selectedSVGImage.maintainAspectRatio"
                  />
                </div>

                <!-- Rotation Control -->
                <div class="control-group">
                  <label class="control-label">Rotation (°)</label>
                  <input
                    type="number"
                    :value="selectedSVGImage.rotation"
                    @input="handleImagePropertyInput('rotation', $event)"
                    min="0"
                    max="360"
                    class="control-input"
                  />
                </div>

                <!-- Opacity Control -->
                <div class="control-group">
                  <label class="control-label">Opacity (%)</label>
                  <input
                    type="number"
                    :value="selectedSVGImage.opacity"
                    @input="handleImagePropertyInput('opacity', $event)"
                    min="0"
                    max="100"
                    class="control-input"
                  />
                </div>
              </div>

              <!-- Aspect Ratio Toggle -->
              <div class="control-group-full">
                <label class="checkbox-control">
                  <input
                    type="checkbox"
                    :checked="selectedSVGImage.maintainAspectRatio"
                    @change="handleAspectRatioToggle"
                  />
                  <span>Maintain Aspect Ratio</span>
                </label>
              </div>

              <!-- Layer Controls -->
              <div class="layer-controls">
                <h5 class="layer-controls-title">Layer Order</h5>
                <div class="layer-buttons">
                  <button @click="svgImageManager.bringToFront(selectedSVGImage.id)" class="layer-btn" title="Bring to Front">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    To Front
                  </button>
                  <button @click="svgImageManager.moveImageUp(selectedSVGImage.id)" class="layer-btn" title="Move Up">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    Up
                  </button>
                  <button @click="svgImageManager.moveImageDown(selectedSVGImage.id)" class="layer-btn" title="Move Down">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    Down
                  </button>
                  <button @click="svgImageManager.sendToBack(selectedSVGImage.id)" class="layer-btn" title="Send to Back">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    To Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Button -->
          <div v-if="svgImageManager.images.value.length > 0 || formData.description" class="export-section">
            <button @click="exportWeddingSticker('svg')" class="export-btn export-svg-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as SVG
            </button>
            <button @click="exportWeddingSticker('png')" class="export-btn export-png-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as PNG (300 DPI)
            </button>
          </div>
        </div>
      </div>

      <!-- Options -->
      <div class="options-group">
        <div class="option-item">
          <input
            id="remove-bg"
            v-model="formData.removeBackground"
            type="checkbox"
            class="option-checkbox"
          />
          <label for="remove-bg" class="option-label">Remove Background</label>
        </div>

        <div class="option-item">
          <input
            id="color-picker"
            v-model="formData.useColorPicker"
            type="checkbox"
            class="option-checkbox"
          />
          <label for="color-picker" class="option-label">Color picker</label>
        </div>
      </div>

      <!-- Color Picker (conditional) -->
      <div v-if="formData.useColorPicker" class="color-picker-section">
        <label class="form-label">Background Color</label>
        <input
          v-model="formData.backgroundColor"
          type="color"
          class="color-input"
        />
      </div>

      <!-- Custom Size (always visible) -->
      <div class="custom-size-section">
        <label for="custom-size" class="form-label">Custom Size</label>
        <input
          id="custom-size"
          v-model="formData.customSize"
          type="text"
          class="custom-size-input"
          placeholder="e.g., 4x4, 3x3, 5x5"
        />
      </div>

      <!-- Image Upload Section -->
      <div class="image-upload-section">
        <label class="form-label">Image</label>
        <div class="image-slots-container">
          <div class="image-slots">
            <div
              v-for="(image, index) in imageSlots"
              :key="index"
              class="image-slot"
            >
              <button
                v-if="image"
                @click="removeImage(index)"
                class="remove-image-btn"
              >
                ×
              </button>
              <img
                v-if="image"
                :src="image.preview"
                alt="Uploaded image"
                class="slot-image"
              />
              <label v-else :for="`image-${index}`" class="upload-label">
                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </label>
              <input
                :id="`image-${index}`"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload($event, index)"
              />
            </div>

            <!-- Add Image Slot Button -->
            <button @click="addImageSlot" class="add-image-slot-btn">
              <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

          <!-- Generate Button -->
          <button
            @click="generateDesign"
            :disabled="isGenerating"
            class="generate-btn"
          >
            <span>Generate Design</span>
          </button>
        </div>
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
              :height="300"
              :width="300"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import { Vue3Lottie } from 'vue3-lottie'
import { useWeddingStickerUpdater } from '@/composables/useWeddingStickerUpdater'
import { useSVGImageManager } from '@/composables/useSVGImageManager'
import { useSVGExport } from '@/composables/useSVGExport'
import { useSVGTextReplacement } from '@/composables/useSVGTextReplacement'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import ImageCropModal from '@/components/ImageCropModal.vue'
import { IonSpinner } from '@ionic/vue'

const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()
const { updateStickerText, getSVGElements } = useWeddingStickerUpdater()

// SVG Image Management
const svgImageManager = useSVGImageManager({
  defaultX: 100,
  defaultY: 100,
  defaultWidth: 400,
  defaultHeight: 400
})

const { exportSVG } = useSVGExport()

// SVG Text Replacement (for Nikkah graphics)
const { handleReplacement, resetReplacement } = useSVGTextReplacement()

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
const imageFileInput = ref<HTMLInputElement | null>(null)
let svgElements: ReturnType<typeof getSVGElements> | null = null

const showMenu = ref(false)
const selectedCategory = ref('naming')
const previewUrl = ref('')
const isGenerating = ref(false)
const viewMode = ref<'form' | 'preview'>('form')

// Image crop modal state
const showCropModal = ref(false)
const cropImageSrc = ref('')
const cropImageFile = ref<File | null>(null)

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
  { id: 'naming', name: 'Naming' },
  { id: 'wedding', name: 'Wedding' },
  { id: 'graduation', name: 'Graduation' },
  { id: 'association', name: 'Association' },
  { id: 'organization', name: 'Organization' },
  { id: 'product-business-1', name: 'Product/Business' },
  { id: 'product-business-2', name: 'Product/Business' },
  { id: 'product-business-3', name: 'Product/Business' }
]

const formData = reactive({
  description: '',
  removeBackground: false,
  useColorPicker: false,
  backgroundColor: '#ffffff',
  customSize: '4x4',
  stickerTypes: {
    box: false,
    circle: false,
    dieCut: false
  }
})

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
  console.log('Loading template for:', categoryId)
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

    // Get selected sticker types
    const selectedStickerTypes = Object.entries(formData.stickerTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type, _]) => type)
    autoDesignStore.updateFormData('options.stickerTypes', selectedStickerTypes)

    // Upload images
    for (const imageSlot of uploadedImages) {
      autoDesignStore.uploadedFiles.images.push(imageSlot.file)
    }

    // Generate design
    await autoDesignStore.generateDesign()

    // Show preview
    if (autoDesignStore.currentProject?.designUrl) {
      previewUrl.value = autoDesignStore.currentProject.designUrl
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
}

function getCategoryName(categoryId: string): string {
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : categoryId
}

function goBack() {
  router.push('/home')
}

// Wedding Sticker Functions
async function loadWeddingStickerTemplate() {
  if (!weddingPreviewContainer.value) return

  try {
    // Reset replacement state when loading new template
    resetReplacement()

    // Fetch the SVG template
    const response = await fetch('/templates/wedding-sticker/template.svg')
    const svgText = await response.text()

    // Insert SVG into container
    weddingPreviewContainer.value.innerHTML = svgText

    // Get SVG element and its text elements
    await nextTick()
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      svgElements = getSVGElements(svgElement)

      // Apply current description if any
      if (formData.description) {
        updateStickerText(formData.description, svgElements)

        // Check if replacement should be applied
        await handleReplacement(formData.description, svgElement, {
          keywords: ['congratulation', 'nikkah'],
          svgFiles: [
            '/weddigTitlesNiKkah/Nikkah.svg',
            '/weddigTitlesNiKkah/Nikkah1.svg',
            '/weddigTitlesNiKkah/Nikkah2.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 850.45,
            y: 372.07,
            width: 850,
            height: 378
          }
        })
      }
    }
  } catch (error) {
    console.error('Failed to load wedding sticker template:', error)
  }
}

async function handleDescriptionInput() {
  // Update wedding sticker preview in real-time
  if (selectedCategory.value === 'wedding' && svgElements) {
    updateStickerText(formData.description, svgElements)

    // Handle SVG text replacement for Nikkah graphics
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      await handleReplacement(formData.description, svgElement, {
        keywords: ['congratulation', 'nikkah'],
        svgFiles: [
          '/weddigTitlesNiKkah/Nikkah.svg',
          '/weddigTitlesNiKkah/Nikkah1.svg',
          '/weddigTitlesNiKkah/Nikkah2.svg'
        ],
        targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
        position: {
          x: 850.45,  // Center x position (same as original text)
          y: 372.07,  // Top y position (blessing-text y)
          width: 850,  // Approximate width for scaling
          height: 378  // Total height (750.44 - 372.07)
        }
      })
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
  await svgImageManager.handleDrop(event, svgElement)

  // Update SVG preview with new images
  updateSVGWithImages()
}

async function handleImageFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  console.log('📸 handleImageFileSelect called', { filesCount: files?.length })

  if (files && files.length > 0) {
    // For now, only handle the first file with cropping
    let file = files[0]

    console.log('📸 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Step 1: Remove background if enabled
    if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
      try {
        backgroundRemovalError.value = null
        console.log('🎨 Starting background removal...')

        const result = await removeBackground(file, {
          quality: 'medium',
          outputFormat: 'image/png',
          maxDimensions: 2048,
          onProgress: (progress) => {
            console.log(`⏳ Background removal progress: ${progress}%`)
          }
        })

        // Convert blob to File
        file = new File([result.blob], file.name.replace(/\.[^/.]+$/, '.png'), {
          type: 'image/png',
          lastModified: Date.now()
        })

        console.log('✅ Background removed successfully')
        console.log(`📐 Processed image: ${result.width}×${result.height}, ${result.processingTime}ms`)

      } catch (error: any) {
        console.error('❌ Background removal failed:', error)
        backgroundRemovalError.value = error.message || 'Failed to remove background'
        // Continue with original image
        console.log('⚠️ Continuing with original image')
      }
    } else if (autoRemoveBackground.value && !isBackgroundRemovalSupported()) {
      backgroundRemovalError.value = 'Background removal is not supported in this browser'
      console.warn('⚠️ Background removal not supported')
    }

    // Step 2: Create object URL for the image (original or processed)
    const imageUrl = URL.createObjectURL(file)

    console.log('📸 Object URL created:', imageUrl)

    // Step 3: Set crop modal data
    cropImageSrc.value = imageUrl
    cropImageFile.value = file
    showCropModal.value = true

    console.log('📸 Crop modal state set:', {
      showCropModal: showCropModal.value,
      cropImageSrc: cropImageSrc.value,
      hasCropImageFile: !!cropImageFile.value
    })
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

// Image crop modal handlers
async function handleCropComplete(data: { dataUrl: string; blob: Blob; width: number; height: number }) {
  console.log('🎨 Crop complete:', { width: data.width, height: data.height })

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

function updateSVGWithImages() {
  if (!weddingPreviewContainer.value) return

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) return

  // Remove existing user images
  const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
  existingImages.forEach(img => img.remove())

  // Add current images
  const images = svgImageManager.images.value
  if (images.length === 0) return

  // Sort by z-index
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

  // Find insertion point (before first text element)
  const firstTextElement = svgElement.querySelector('text')

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

    // Apply rotation
    if (img.rotation !== 0) {
      const centerX = img.x + img.width / 2
      const centerY = img.y + img.height / 2
      imageElement.setAttribute('transform', `rotate(${img.rotation} ${centerX} ${centerY})`)
    }

    // Insert before first text or append
    if (firstTextElement) {
      svgElement.insertBefore(imageElement, firstTextElement)
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

    await exportSVG(svgElement, svgImageManager.images.value, {
      filename: format === 'svg' ? `${filename}.svg` : `${filename}.png`,
      format,
      pngResolution: 300
    })

    authStore.showNotification({
      title: 'Export Successful',
      message: `Sticker exported as ${format.toUpperCase()}`,
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
    await nextTick()
    await loadWeddingStickerTemplate()
  }
})

onMounted(() => {
  // Clear previous form data
  autoDesignStore.resetFormData()

  // Set category
  autoDesignStore.setCategory('sticker')

  // Load default template
  loadCategoryTemplate('naming')

  // Load wedding template if wedding category is selected
  if (selectedCategory.value === 'wedding') {
    nextTick(() => {
      loadWeddingStickerTemplate()
    })
  }
})
</script>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.sticker-template-panel {
  min-height: 100vh;
  background: #f9fafb;
  padding: 16px;
  position: relative;
  display: flex;
  justify-content: center;
}

.form-view {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.preview-view {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn,
.menu-btn {
  padding: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover,
.menu-btn:hover {
  background: #f3f4f6;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

/* Sticker Type Section */
.sticker-type-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sticker-type-header {
  margin-bottom: 16px;
}

.sticker-type-label {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: block;
}

.optional-text {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  font-style: italic;
}

.sticker-type-checkboxes {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.2s;
  flex: 1;
  min-width: 0;
}

.checkbox-item:hover {
  background: #f9fafb;
}

.sticker-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
  flex-shrink: 0;
}

.checkbox-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .sticker-type-checkboxes {
    gap: 4px;
  }

  .checkbox-item {
    gap: 4px;
    padding: 6px 8px;
  }

  .checkbox-label {
    font-size: 12px;
  }

  .sticker-checkbox {
    width: 14px;
    height: 14px;
  }
}

.category-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 8px;
}

.category-pill {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.category-pill.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.category-pill:hover:not(.active) {
  border-color: #9ca3af;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-box {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
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

.options-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-label {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.color-picker-section,
.custom-size-section {
  margin-bottom: 20px;
}

.color-input {
  width: 80px;
  height: 48px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
}

.custom-size-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.image-upload-section {
  margin-bottom: 24px;
}

.image-slots-container {
  overflow-x: auto;
  padding-bottom: 8px;
}

.image-slots {
  display: flex;
  gap: 12px;
  min-width: min-content;
}

.image-slot {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.add-image-slot-btn {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-image-slot-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
}

.upload-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.slot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden {
  display: none;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background: #2563eb;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Preview View Styles */
.preview-view {
  min-height: calc(100vh - 40px);
  background: white;
  border-radius: 16px;
  overflow: hidden;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.wedding-preview-container svg {
  width: 100%;
  height: auto;
  display: block;
}

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
    padding: 12px;
  }

  .wedding-preview-container {
    padding: 12px;
  }
}

/* SVG Image Management Styles */
.svg-image-management {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
}

.image-drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  margin-top: 12px;
}

.image-drop-zone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.image-drop-zone.is-dragging {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.02);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-zone-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.drop-zone-subtext {
  font-size: 14px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-error {
  margin-top: 12px;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

.image-list-section {
  margin-top: 24px;
}

.image-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.image-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.clear-all-btn {
  padding: 6px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #fecaca;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.image-gallery-item {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.image-gallery-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-gallery-item.selected {
  border-color: #3b82f6;
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gallery-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item-actions {
  position: absolute;
  top: 4px;
  right: 4px;
}

.gallery-remove-btn {
  padding: 4px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.gallery-remove-btn:hover {
  background: rgba(220, 38, 38, 1);
}

.gallery-item-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-controls-section {
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.controls-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group-full {
  margin-bottom: 16px;
}

.control-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.control-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.control-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.checkbox-control {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-control input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.layer-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.layer-controls-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.layer-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.layer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.export-section {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.export-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.export-svg-btn {
  background: #3b82f6;
  color: white;
}

.export-svg-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.export-png-btn {
  background: #10b981;
  color: white;
}

.export-png-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@media (max-width: 640px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }

  .layer-buttons {
    grid-template-columns: 1fr;
  }

  .export-section {
    flex-direction: column;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}

/* Background Removal Styles */
.background-removal-toggle {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #0c4a6e;
  font-weight: 500;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #0284c7;
}

.toggle-text {
  flex: 1;
}

.toggle-hint {
  margin: 8px 0 0 28px;
  font-size: 12px;
  color: #0369a1;
  font-style: italic;
}

.processing-indicator {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(251, 191, 36, 0.1);
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.processing-spinner {
  width: 32px;
  height: 32px;
  color: #d97706;
}

.processing-text {
  flex: 1;
}

.processing-title {
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 4px 0;
}

.processing-progress {
  font-size: 13px;
  color: #b45309;
  margin: 0;
  font-weight: 500;
}

.cancel-btn {
  padding: 6px 12px;
  background: white;
  color: #d97706;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
}

.background-removal-error {
  margin-bottom: 16px;
  padding: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  width: 24px;
  height: 24px;
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-text {
  flex: 1;
}

.error-title {
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 4px 0;
}

.error-message {
  font-size: 13px;
  color: #b91c1c;
  margin: 0 0 4px 0;
}

.error-hint {
  font-size: 12px;
  color: #dc2626;
  margin: 0;
  font-style: italic;
}

.error-close-btn {
  padding: 4px 8px;
  background: transparent;
  color: #dc2626;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s;
}

.error-close-btn:hover {
  color: #991b1b;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 4px;
}
</style>

