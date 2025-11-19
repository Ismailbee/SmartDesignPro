<template>
  <div class="image-cropper">
    <!-- File Input Section -->
    <div class="file-input-section" v-if="!imageLoaded">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="file-input"
      />
      <button
        @click="$refs.fileInput.click()"
        class="upload-button"
      >
        <font-awesome-icon icon="cloud-arrow-up" class="upload-icon" />
        Select Image to Crop
      </button>
    </div>

    <!-- Cropper Section -->
    <div class="cropper-section" v-if="imageLoaded">
      <!-- Main cropper area -->
      <div class="cropper-wrapper">
        <img ref="cropperImage" :src="imageSrc" alt="Crop image" />
      </div>

      <!-- Preview pane -->
      <div class="preview-section" v-if="showPreview">
        <h4>Preview</h4>
        <div ref="previewContainer" class="preview-container"></div>
      </div>

      <!-- Controls -->
      <div class="controls-section">
        <!-- Zoom Control -->
        <div class="control-group">
          <label class="control-label">Zoom</label>
          <input
            type="range"
            :min="0"
            :max="200"
            :step="1"
            :value="zoomPercentage"
            @input="handleZoomChange"
            class="zoom-slider"
          />
          <span class="zoom-value">{{ zoomPercentage }}%</span>
        </div>

        <!-- Aspect Ratio Controls -->
        <div class="control-group">
          <label class="control-label">Aspect Ratio</label>
          <div class="aspect-ratio-buttons">
            <button
              v-for="ratio in aspectRatios"
              :key="ratio.label"
              @click="setAspectRatio(ratio.value)"
              :class="['aspect-btn', { active: currentAspectRatio === ratio.value }]"
            >
              {{ ratio.label }}
            </button>
          </div>
        </div>

        <!-- Transform Controls -->
        <div class="control-group">
          <label class="control-label">Transform</label>
          <div class="transform-buttons">
            <button @click="rotateLeft" class="transform-btn">
              <font-awesome-icon icon="undo" />
              Rotate L
            </button>
            <button @click="rotateRight" class="transform-btn">
              <font-awesome-icon icon="redo" />
              Rotate R
            </button>
            <button @click="flipHorizontal" class="transform-btn">
              <font-awesome-icon icon="arrows-alt-h" />
              Flip H
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="resetImage" class="action-btn secondary">
            Reset
          </button>
          <button @click="selectNewImage" class="action-btn secondary">
            New Image
          </button>
          <button @click="cropImage" class="action-btn primary">
            <font-awesome-icon icon="crop" />
            Crop & Add to Canvas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Cropper from 'cropperjs'

// Props
const props = defineProps({
  aspectRatio: {
    type: Number,
    default: NaN
  },
  initialZoom: {
    type: Number,
    default: 1
  },
  showPreview: {
    type: Boolean,
    default: true
  },
  outputFormat: {
    type: String,
    default: 'blob',
    validator: (value) => ['blob', 'base64'].includes(value)
  }
})

// Emits
const emit = defineEmits(['cropped', 'cancel'])

// Refs
const fileInput = ref(null)
const cropperImage = ref(null)
const previewContainer = ref(null)

// Reactive data
const imageLoaded = ref(false)
const imageSrc = ref('')
const cropper = ref(null)
const currentZoom = ref(props.initialZoom)
const currentAspectRatio = ref(props.aspectRatio)
const zoomPercentage = ref(0)
const baseFitScale = ref(1)
const currentRotation = ref(0) // Track current rotation in degrees

// Aspect ratio presets
const aspectRatios = [
  { label: 'Free', value: NaN },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '16:9', value: 16/9 },
  { label: '3:2', value: 3/2 },
  { label: '2:3', value: 2/3 }
]

// Methods
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    console.warn('Selected file is not an image')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result
    imageLoaded.value = true
    nextTick(() => {
      initializeCropper()
    })
  }
  reader.onerror = () => {
    console.error('Failed to read file')
  }
  reader.readAsDataURL(file)
}

const initializeCropper = () => {
  if (!cropperImage.value) {
    console.error('Cropper image element not found')
    return
  }

  // Destroy existing cropper
  if (cropper.value) {
    cropper.value.destroy()
  }

  try {
    cropper.value = new Cropper(cropperImage.value, {
      aspectRatio: currentAspectRatio.value,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.6, // Smaller initial crop area
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      zoomOnWheel: false,
      wheelZoomRatio: 0.1,
      ready() {
        // Force immediate auto-sizing with delay
        setTimeout(() => {
          autoSizeImageToContainer()
        }, 150)
        updatePreview()
      },
      zoom() {
        updatePreview()
        // Prevent extreme zoom levels
        const imageData = cropper.value?.getImageData()
        if (imageData && imageData.ratio > 3) {
          cropper.value.zoomTo(3)
        } else if (imageData && imageData.ratio < 0.1) {
          cropper.value.zoomTo(0.1)
        }
      },
      crop() {
        updatePreview()
      }
    })
  } catch (error) {
    console.error('Failed to initialize cropper:', error)
  }
}

// Aggressive auto-sizing function for initial image load
const autoSizeImageToContainer = () => {
  if (!cropper.value) return
  
  console.log('🔧 Auto-sizing image to fit container...')
  
  try {
    const containerData = cropper.value.getContainerData()
    const imageData = cropper.value.getImageData()
    
    if (!containerData || !imageData) {
      console.warn('Missing container or image data')
      return
    }
    
    // Calculate available space (80% of container for safety margin)
    const availableWidth = containerData.width * 0.8
    const availableHeight = containerData.height * 0.8
    
    // Calculate scale needed for both dimensions
    const widthScale = availableWidth / imageData.naturalWidth
    const heightScale = availableHeight / imageData.naturalHeight
    
    // Use the smaller scale to ensure complete visibility
    const optimalScale = Math.min(widthScale, heightScale)
    
    // Clamp scale to reasonable bounds
    const finalScale = Math.max(Math.min(optimalScale, 1.0), 0.05)
    
    console.log('📏 Container size:', containerData.width, 'x', containerData.height)
    console.log('📷 Image size:', imageData.naturalWidth, 'x', imageData.naturalHeight)
    console.log('🎯 Auto-calculated scale:', finalScale)
    
    // Store the base scale for zoom calculations
    baseFitScale.value = finalScale
    
    // Apply the scale
    cropper.value.zoomTo(finalScale)
    
    // Center the image after scaling
    setTimeout(() => {
      const scaledImageData = cropper.value.getImageData()
      const centerX = (containerData.width - scaledImageData.width) / 2
      const centerY = (containerData.height - scaledImageData.height) / 2
      cropper.value.moveTo(centerX, centerY)
      
      // Reset zoom percentage to 0
      zoomPercentage.value = 0
      currentZoom.value = finalScale
    }, 75)
    
  } catch (error) {
    console.error('❌ Error in auto-sizing:', error)
    // Fallback to original fit method
    fitImageToContainer()
  }
}

const updatePreview = () => {
  if (!props.showPreview || !cropper.value || !previewContainer.value) return

  const canvas = cropper.value.getCroppedCanvas({
    width: 100,
    height: 100
  })

  if (canvas) {
    previewContainer.value.innerHTML = ''
    previewContainer.value.appendChild(canvas)
  }
}

const fitImageToContainer = () => {
  if (!cropper.value) return
  
  // Save current rotation before reset
  const savedRotation = currentRotation.value
  
  // Reset to default first (this will reset rotation to 0)
  cropper.value.reset()
  
  // Reapply the saved rotation if any
  if (savedRotation !== 0) {
    cropper.value.rotateTo(savedRotation)
  }
  
  // Now get dimensions AFTER rotation is applied
  const containerData = cropper.value.getContainerData()
  const imageData = cropper.value.getImageData()
  
  // Calculate the ratio to fit the image within the container
  // When rotated 90 or 270 degrees, dimensions are swapped
  const isRotated90or270 = savedRotation === 90 || savedRotation === 270
  const effectiveWidth = isRotated90or270 ? imageData.naturalHeight : imageData.naturalWidth
  const effectiveHeight = isRotated90or270 ? imageData.naturalWidth : imageData.naturalHeight
  
  const containerRatio = containerData.width / containerData.height
  const imageRatio = effectiveWidth / effectiveHeight
  
  // Use more conservative scaling with proper bounds checking
  let scale;
  if (imageRatio > containerRatio) {
    // Image is wider - fit to width with safety margin
    scale = Math.min((containerData.width * 0.85) / effectiveWidth, (containerData.height * 0.85) / effectiveHeight)
  } else {
    // Image is taller - fit to height with safety margin  
    scale = Math.min((containerData.height * 0.85) / effectiveHeight, (containerData.width * 0.85) / effectiveWidth)
  }
  
  // Ensure scale is within reasonable bounds
  baseFitScale.value = Math.max(Math.min(scale, 2.0), 0.1)
  
  // Apply the calculated scale
  cropper.value.zoomTo(baseFitScale.value)
  
  // Center the image by moving it to the center of the container
  setTimeout(() => {
    const updatedContainerData = cropper.value.getContainerData();
    const updatedImageData = cropper.value.getImageData();
    
    // Calculate center position
    const centerX = (updatedContainerData.width - updatedImageData.width) / 2;
    const centerY = (updatedContainerData.height - updatedImageData.height) / 2;
    
    // Move image to center
    cropper.value.moveTo(centerX, centerY);
  }, 50)
  
  // Reset zoom to 0%
  zoomPercentage.value = 0
  currentZoom.value = baseFitScale.value
}

const handleZoomChange = (event) => {
  const newZoomPercentage = parseInt(event.target.value)
  zoomPercentage.value = newZoomPercentage
  
  if (cropper.value) {
    if (newZoomPercentage === 0) {
      fitImageToContainer()
    } else {
      // Calculate zoom: 0% = fit, 1-200% = zoom in
      const zoomMultiplier = 1 + (newZoomPercentage / 100) * 2
      const ratio = baseFitScale.value * zoomMultiplier
      currentZoom.value = ratio
      cropper.value.zoomTo(ratio)
    }
  }
}

const setAspectRatio = (ratio) => {
  currentAspectRatio.value = ratio
  if (cropper.value) {
    cropper.value.setAspectRatio(ratio)
  }
}

// Enhanced rotation function that always fits the image after rotation
const rotateAndFit = (degrees) => {
  if (cropper.value) {
    // Update rotation tracking
    currentRotation.value = (currentRotation.value + degrees) % 360;
    if (currentRotation.value < 0) currentRotation.value += 360;
    
    // Get current scale before rotation to maintain relative size
    const currentImageData = cropper.value.getImageData();
    const currentContainerData = cropper.value.getContainerData();
    
    // Perform rotation
    cropper.value.rotate(degrees);
    
    // Always fit the image after rotation with proper scaling
    setTimeout(() => {
      const containerData = cropper.value.getContainerData();
      const imageData = cropper.value.getImageData();
      
      // Calculate effective dimensions considering rotation
      const isRotated90or270 = currentRotation.value === 90 || currentRotation.value === 270;
      const effectiveWidth = isRotated90or270 ? imageData.naturalHeight : imageData.naturalWidth;
      const effectiveHeight = isRotated90or270 ? imageData.naturalWidth : imageData.naturalHeight;
      
      const containerRatio = containerData.width / containerData.height;
      const imageRatio = effectiveWidth / effectiveHeight;
      
      // Calculate proper fit scale with safety margins
      let scale;
      if (imageRatio > containerRatio) {
        scale = Math.min((containerData.width * 0.85) / effectiveWidth, (containerData.height * 0.85) / effectiveHeight);
      } else {
        scale = Math.min((containerData.height * 0.85) / effectiveHeight, (containerData.width * 0.85) / effectiveWidth);
      }
      
      // Ensure reasonable scale bounds
      scale = Math.max(Math.min(scale, 2.0), 0.1);
      
      baseFitScale.value = scale;
      cropper.value.zoomTo(scale);
      
      // Center the image
      setTimeout(() => {
        const finalImageData = cropper.value.getImageData();
        const centerX = (containerData.width - finalImageData.width) / 2;
        const centerY = (containerData.height - finalImageData.height) / 2;
        cropper.value.moveTo(centerX, centerY);
      }, 25);
      
      zoomPercentage.value = 0;
    }, 75);
  }
};

const rotateLeft = () => {
  if (cropper.value) {
    rotateAndFit(-90);
  }
}

const rotateRight = () => {
  if (cropper.value) {
    rotateAndFit(90);
  }
}

const flipHorizontal = () => {
  if (cropper.value) {
    const imageData = cropper.value.getImageData()
    cropper.value.scaleX(-imageData.scaleX)
  }
}

const resetImage = () => {
  if (cropper.value) {
    cropper.value.reset()
    setTimeout(() => {
      fitImageToContainer()
      zoomPercentage.value = 0
    }, 50)
  }
}

const selectNewImage = () => {
  imageLoaded.value = false
  imageSrc.value = ''
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getCroppedImage = () => {
  return new Promise((resolve, reject) => {
    if (!cropper.value) {
      reject(new Error('Cropper not initialized'))
      return
    }

    try {
      const canvas = cropper.value.getCroppedCanvas({
        maxWidth: 2048,
        maxHeight: 2048,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })

      if (!canvas) {
        reject(new Error('Failed to get cropped canvas'))
        return
      }

      if (props.outputFormat === 'base64') {
        const dataURL = canvas.toDataURL('image/png', 0.9)
        resolve(dataURL)
      } else {
        // Output as blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            // Fallback to base64 if toBlob fails
            const dataURL = canvas.toDataURL('image/png', 0.9)
            resolve(dataURL)
          }
        }, 'image/png', 0.9)
      }
    } catch (error) {
      reject(error)
    }
  })
}

const cropImage = async () => {
  try {
    const result = await getCroppedImage()
    emit('cropped', result)
  } catch (error) {
    console.error('Failed to crop image:', error)
  }
}

// Watch for aspect ratio prop changes
watch(() => props.aspectRatio, (newRatio) => {
  currentAspectRatio.value = newRatio
  if (cropper.value) {
    cropper.value.setAspectRatio(newRatio)
  }
})

// Expose methods
defineExpose({
  getCroppedImage
})

// Lifecycle
onUnmounted(() => {
  if (cropper.value) {
    cropper.value.destroy()
  }
})
</script>

<style scoped>
.image-cropper {
  padding: 20px;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.file-input-section {
  text-align: center;
  padding: 40px 20px;
}

.file-input {
  display: none;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upload-button:hover {
  background: #2563eb;
}

.upload-icon {
  font-size: 16px;
}

.cropper-section {
  display: flex;
  flex-direction: row;
  gap: 24px;
  height: 100%;
  flex: 1;
}

.cropper-wrapper {
  flex: 2;
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cropper-wrapper img {
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-fit: contain;
}

.preview-section {
  text-align: center;
}

.preview-section h4 {
  margin: 0 0 10px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.preview-container {
  display: inline-block;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in preview container */
}

.preview-container canvas {
  display: block;
}

.controls-section {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zoom-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.zoom-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.zoom-value {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.aspect-ratio-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.aspect-btn {
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.aspect-btn:hover {
  background: #f3f4f6;
}

.aspect-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.transform-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.transform-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 14px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.transform-btn:hover {
  background: #f3f4f6;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .cropper-section {
    flex-direction: column;
    gap: 16px;
  }

  .cropper-wrapper {
    flex: none;
    min-height: 300px;
  }

  .controls-section {
    flex: none;
    min-width: auto;
    max-width: none;
    padding: 16px;
  }
}

@media (min-width: 480px) {
  .action-buttons {
    flex-direction: row;
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
  }
}

/* Cropper.js essential styles */
.cropper-container {
  direction: ltr;
  font-size: 0;
  line-height: 0;
  position: relative;
  -ms-touch-action: none;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.cropper-container img {
  display: block;
  image-orientation: 0deg;
  max-height: 100%;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  object-fit: contain;
  width: auto;
  height: auto;
}

.cropper-wrap-box,
.cropper-canvas,
.cropper-drag-box,
.cropper-crop-box,
.cropper-modal {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.cropper-wrap-box,
.cropper-canvas {
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in cropper canvas */
}

.cropper-drag-box {
  background-color: #fff;
  opacity: 0;
}

.cropper-modal {
  background-color: #000;
  opacity: 0.5;
}

.cropper-view-box {
  display: block;
  height: 100%;
  outline: 1px solid #39f;
  outline-color: rgba(51, 153, 255, 0.75);
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in cropper drag box */
  width: 100%;
}

.cropper-dashed {
  border: 0 dashed #eee;
  display: block;
  opacity: 0.5;
  position: absolute;
}

.cropper-dashed.dashed-h {
  border-bottom-width: 1px;
  border-top-width: 1px;
  height: calc(100% / 3);
  left: 0;
  top: calc(100% / 3);
  width: 100%;
}

.cropper-dashed.dashed-v {
  border-left-width: 1px;
  border-right-width: 1px;
  height: 100%;
  left: calc(100% / 3);
  top: 0;
  width: calc(100% / 3);
}

.cropper-center {
  display: block;
  height: 0;
  left: 50%;
  opacity: 0.75;
  position: absolute;
  top: 50%;
  width: 0;
}

.cropper-center::before,
.cropper-center::after {
  background-color: #eee;
  content: ' ';
  display: block;
  position: absolute;
}

.cropper-center::before {
  height: 1px;
  left: -3px;
  top: 0;
  width: 7px;
}

.cropper-center::after {
  height: 7px;
  left: 0;
  top: -3px;
  width: 1px;
}

.cropper-face,
.cropper-line,
.cropper-point {
  display: block;
  height: 100%;
  opacity: 0.1;
  position: absolute;
  width: 100%;
}

.cropper-face {
  background-color: #fff;
  left: 0;
  top: 0;
}

.cropper-line {
  background-color: #39f;
}

.cropper-line.line-e {
  cursor: ew-resize;
  right: -3px;
  top: 0;
  width: 5px;
}

.cropper-line.line-n {
  cursor: ns-resize;
  height: 5px;
  left: 0;
  top: -3px;
}

.cropper-line.line-w {
  cursor: ew-resize;
  left: -3px;
  top: 0;
  width: 5px;
}

.cropper-line.line-s {
  bottom: -3px;
  cursor: ns-resize;
  height: 5px;
  left: 0;
}

.cropper-point {
  background-color: #39f;
  height: 5px;
  opacity: 0.75;
  width: 5px;
}

.cropper-point.point-e {
  cursor: ew-resize;
  margin-top: -3px;
  right: -3px;
  top: 50%;
}

.cropper-point.point-n {
  cursor: ns-resize;
  left: 50%;
  margin-left: -3px;
  top: -3px;
}

.cropper-point.point-w {
  cursor: ew-resize;
  left: -3px;
  margin-top: -3px;
  top: 50%;
}

.cropper-point.point-s {
  bottom: -3px;
  cursor: ns-resize;
  left: 50%;
  margin-left: -3px;
}

.cropper-point.point-ne {
  cursor: nesw-resize;
  right: -3px;
  top: -3px;
}

.cropper-point.point-nw {
  cursor: nwse-resize;
  left: -3px;
  top: -3px;
}

.cropper-point.point-sw {
  bottom: -3px;
  cursor: nesw-resize;
  left: -3px;
}

.cropper-point.point-se {
  bottom: -3px;
  cursor: nwse-resize;
  right: -3px;
}

.cropper-invisible {
  opacity: 0;
}

.cropper-bg {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
}

.cropper-hide {
  display: block;
  height: 0;
  position: absolute;
  width: 0;
}

.cropper-hidden {
  display: none !important;
}

.cropper-move {
  cursor: move;
}

.cropper-crop {
  cursor: crosshair;
}

.cropper-disabled .cropper-drag-box,
.cropper-disabled .cropper-face,
.cropper-disabled .cropper-line,
.cropper-disabled .cropper-point {
  cursor: not-allowed;
}
</style>
