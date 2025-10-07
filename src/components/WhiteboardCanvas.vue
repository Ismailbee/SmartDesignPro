<template>
  <div class="whiteboard-container">
    <!-- Text Editing Overlay - OUTSIDE canvas container for absolute positioning -->
    <div
      v-if="textEditState.isEditing"
      ref="textEditOverlay"
      class="text-edit-overlay"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      tabindex="0"
      @blur="handleOverlayBlur"
      @keydown="handleTextEditKeydown"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @input="handleTextEditInput"
    ></div>

    <!-- Floating Properties Panel -->
    <FloatingPropertiesPanel
      v-if="!textEditState.isEditing"
      :selected-objects="selectedObjects"
      :canvas-container="canvasContainer"
      :zoom="stageScale"
      :is-draggable="true"
      :show-arrow="false"
      @update-object="handleObjectUpdate"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
      @bring-forward="handleBringForward"
      @send-backward="handleSendBackward"
      @close="clearSelection"
    />

    <!-- Toolbar -->
    <CanvasToolbar
      @add-image="handleAddImage"
      @add-image-url="handleAddImageURL"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @fit-stage="fitStage"
      @undo="undo"
      @redo="redo"
      @toggle-grid="toggleGrid"
      @toggle-snap="toggleSnap"
      @export-png="exportToPNG"
      @export-jpg="exportToJPG"
      @open-export-panel="openExportPanel"
      @open-ai-panel="openAIPanel"
      @save="saveToJSON"
      @load="loadFromJSON"
      :zoom="stageScale"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :grid-enabled="gridEnabled"
      :snap-enabled="snapEnabled"
    />

    <!-- Export Panel -->
    <ExportPanel
      v-model="showExportPanel"
      :project-id="currentProjectId"
      @export-complete="handleExportComplete"
    />

    <!-- Share Panel -->
    <SharePanel
      v-model="showSharePanel"
      :project-id="currentProjectId"
      :export-url="lastExportUrl"
      @link-generated="handleLinkGenerated"
      @email-sent="handleEmailSent"
    />

    <!-- Main Canvas Area -->
    <div class="canvas-container" ref="canvasContainer" @click="handleContainerClick" @keydown="handleCanvasKeydown" tabindex="0">
      <!-- Grid overlay -->
      <div 
        v-if="gridEnabled" 
        class="grid-overlay"
        :style="gridStyle"
      ></div>

      <!-- Konva Stage -->
      <v-stage
        ref="stage"
        :config="stageConfig"
        @mousedown="handleStageMouseDown"
        @mousemove="handleStageMouseMove"
        @mouseup="handleStageMouseUp"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Background Layer -->
        <v-layer ref="backgroundLayer" :config="{ listening: true }">
          <v-rect
            :config="{
              id: 'background-rect',
              x: 0,
              y: 0,
              width: stageWidth,
              height: stageHeight,
              fill: backgroundColor,
              listening: true
            }"
          />
        </v-layer>

        <!-- Main Content Layer -->
        <v-layer ref="mainLayer" :config="{ listening: true }">
          <!-- Images -->
          <v-image
            v-for="image in images"
            :key="image.id"
            :config="{
              ...image,
              id: `image-${image.id}`,
              draggable: !image.locked && image.draggable !== false,
              visible: image.visible !== false,
              listening: true
            }"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
            @click="handleImageClick"
            @mouseenter="handleImageMouseEnter"
            @mouseleave="handleImageMouseLeave"
          />

          <!-- Text Elements -->
          <v-text
            v-for="text in texts"
            :key="text.id"
            :config="{
              ...text,
              id: `text-${text.id}`,
              draggable: !text.locked && text.draggable !== false,
              visible: text.visible !== false,
              listening: true
            }"
            @transformend="handleTextTransformEnd"
            @dragend="handleTextDragEnd"
            @click="handleTextClick"
            @dblclick="handleTextDoubleClick"
            @mouseenter="handleTextMouseEnter"
            @mouseleave="handleTextMouseLeave"
          />

          <!-- Selection Rectangle -->
          <v-rect
            v-if="selectionRect.visible"
            :config="selectionRect"
          />

          <!-- Transformer -->
          <v-transformer
            ref="transformer"
            :config="transformerConfig"
          />
        </v-layer>
      </v-stage>
    </div>

    <!-- Properties Panel -->
    <div v-if="selectedImages.length > 0" class="properties-panel">
      <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <h3 class="text-xs font-semibold text-gray-700 mb-2">Properties</h3>
        <div v-if="selectedImages.length === 1" class="space-y-2">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="text-gray-500">X:</label>
              <input 
                type="number" 
                :value="Math.round(selectedImages[0].x)"
                @input="updateProperty('x', $event.target.value)"
                class="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label class="text-gray-500">Y:</label>
              <input 
                type="number" 
                :value="Math.round(selectedImages[0].y)"
                @input="updateProperty('y', $event.target.value)"
                class="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label class="text-gray-500">W:</label>
              <input 
                type="number" 
                :value="Math.round(selectedImages[0].width * selectedImages[0].scaleX)"
                @input="updateProperty('width', $event.target.value)"
                class="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label class="text-gray-500">H:</label>
              <input 
                type="number" 
                :value="Math.round(selectedImages[0].height * selectedImages[0].scaleY)"
                @input="updateProperty('height', $event.target.value)"
                class="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-1 mt-2">
          <button @click="flipHorizontal" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Flip H</button>
          <button @click="flipVertical" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Flip V</button>
          <button @click="bringForward" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">↑</button>
          <button @click="sendBackward" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">↓</button>
          <button @click="deleteSelected" class="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded">Del</button>
        </div>
      </div>
    </div>

    <!-- Layers Panel -->
    <div class="layers-panel">
      <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <h3 class="text-xs font-semibold text-gray-700 mb-2">Layers</h3>

        <!-- Image Layers -->
        <div
          v-for="image in sortedImages"
          :key="`image-${image.id}`"
          class="layer-item"
          :class="{ selected: selectedImageIds.includes(image.id) }"
          @click="selectImage(image.id)"
        >
          <input
            type="checkbox"
            :checked="image.visible !== false"
            @change="toggleVisibility(image.id)"
            class="w-3 h-3"
          />
          <span class="layer-name">{{ image.name || `Image ${image.id}` }}</span>
          <button
            @click.stop="toggleLock(image.id)"
            class="lock-btn"
          >
            <font-awesome-icon :icon="image.locked ? 'times' : 'check'" class="w-2 h-2" />
          </button>
        </div>

        <!-- Text Layers -->
        <div
          v-for="text in texts"
          :key="`text-${text.id}`"
          class="layer-item"
          :class="{ selected: selectedTextIds.includes(text.id) }"
          @click="selectText(text.id)"
        >
          <input
            type="checkbox"
            :checked="text.visible !== false"
            @change="toggleTextVisibility(text.id)"
            class="w-3 h-3"
          />
          <span class="layer-name">{{ text.name || `Text: ${text.text?.substring(0, 20)}...` }}</span>
          <button
            @click.stop="toggleTextLock(text.id)"
            class="lock-btn"
          >
            <font-awesome-icon :icon="text.locked ? 'times' : 'check'" class="w-2 h-2" />
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      multiple
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- URL Input Modal -->
    <div v-if="showUrlModal" class="modal-overlay" @click="closeUrlModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="text-sm font-semibold">Add Image from URL</h3>
          <button @click="closeUrlModal" class="close-btn">
            <font-awesome-icon icon="times" class="w-3 h-3" />
          </button>
        </div>
        <div class="modal-body">
          <label class="text-xs text-gray-600">Image URL:</label>
          <input 
            v-model="imageUrl" 
            placeholder="https://example.com/image.jpg"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm mt-1"
            @keyup.enter="addImageFromURL"
          />
          <button 
            @click="addImageFromURL" 
            :disabled="!imageUrl"
            class="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Add Image
          </button>
        </div>
      </div>
    </div>

    <!-- Collaboration Features -->
    <!-- Remote Cursors Overlay -->
    <div class="remote-cursors-overlay">
      <RemoteCursor
        v-for="cursor in remoteCursorsList"
        :key="cursor.userId"
        :cursor="cursor"
      />
    </div>

    <!-- Comment System -->
    <CommentSystem ref="commentSystemRef" />

    <!-- Activity Feed (Bottom Right) -->
    <div v-if="isConnected" class="activity-feed-container">
      <ActivityFeed ref="activityFeedRef" />
    </div>

    <!-- AI Panel -->
    <AIPanel />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import CanvasToolbar from './CanvasToolbar.vue'
import FloatingPropertiesPanel from './FloatingPropertiesPanel.vue'
import ExportPanel from './ExportPanel.vue'
import SharePanel from './SharePanel.vue'
import RemoteCursor from './collaboration/RemoteCursor.vue'
import CommentSystem from './collaboration/CommentSystem.vue'
import ActivityFeed from './collaboration/ActivityFeed.vue'
import AIPanel from './ai/AIPanel.vue'
import { useWhiteboardStore } from '@/stores/whiteboard'
import { useCollaborationStore } from '@/stores/collaboration'
import { useAIStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import { exportStageToBlob, exportStageToDataURL, snapToGrid } from '@/utils/konva-helpers'

// Props
const props = defineProps({
  width: { type: Number, default: 1200 },
  height: { type: Number, default: 800 },
  backgroundColor: { type: String, default: '#ffffff' },
  gridSize: { type: Number, default: 20 }
})

// Emits
const emit = defineEmits([
  'text-edit-start',
  'text-edit-commit',
  'text-edit-cancel',
  'text-selected'
])

// Store
const store = useWhiteboardStore()

// Collaboration Store
const collaborationStore = useCollaborationStore()
const { remoteCursorsList, isConnected, canEdit } = storeToRefs(collaborationStore)

// AI Store
const aiStore = useAIStore()

// Refs
const stage = ref(null)
const transformer = ref(null)
const canvasContainer = ref(null)
const fileInput = ref(null)
const backgroundLayer = ref(null)
const mainLayer = ref(null)
const commentSystemRef = ref(null)
const activityFeedRef = ref(null)

// Reactive state
const stageWidth = ref(props.width)
const stageHeight = ref(props.height)
const stageScale = ref(0.66) // Default zoom: 66%
const stageX = ref(0)
const stageY = ref(0)
const backgroundColor = ref(props.backgroundColor)
const gridEnabled = ref(false)
const snapEnabled = ref(false)
const showUrlModal = ref(false)
const imageUrl = ref('')

// Export & Share state
const showExportPanel = ref(false)
const showSharePanel = ref(false)
const currentProjectId = ref('project-' + Date.now())
const lastExportUrl = ref('')

// Selection state
const selectedImageIds = ref([])
const selectionRect = reactive({
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fill: 'rgba(0, 162, 255, 0.15)',
  stroke: '#00a2ff',
  strokeWidth: 2,
  dash: []
})

// Touch/mouse state for pan/zoom
const lastPointerPosition = ref(null)
const isPanning = ref(false)
const isSelecting = ref(false)
const selectionStart = ref(null)

// Stage config
const stageConfig = computed(() => ({
  width: canvasContainer.value?.clientWidth || 800,
  height: canvasContainer.value?.clientHeight || 600,
  scaleX: stageScale.value,
  scaleY: stageScale.value,
  x: stageX.value,
  y: stageY.value,
  draggable: false,
  listening: true // Enable mouse events
}))

// Transformer config with Canva-style handles
const transformerConfig = computed(() => ({
  // Rotation handle
  rotateAnchorOffset: 40,
  rotateEnabled: true,
  rotateAnchorCursor: 'grab',

  // Corner and edge anchors - Canva style (only corners for resize)
  enabledAnchors: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],

  // Anchor styling - Canva-like appearance
  anchorSize: 12,
  anchorStroke: '#00a2ff',
  anchorFill: '#ffffff',
  anchorStrokeWidth: 2,
  anchorCornerRadius: 2,

  // Border styling - Canva-like selection border
  borderStroke: '#00a2ff',
  borderStrokeWidth: 2,
  borderDash: [0, 0], // Solid line

  // Padding around selection
  padding: 0,

  // Keep aspect ratio with shift key
  keepRatio: false,
  centeredScaling: false,

  // Prevent negative scaling
  boundBoxFunc: (oldBox, newBox) => {
    // Minimum size constraints
    const minWidth = 10
    const minHeight = 10

    if (Math.abs(newBox.width) < minWidth || Math.abs(newBox.height) < minHeight) {
      return oldBox
    }
    return newBox
  }
}))

// Grid style
const gridStyle = computed(() => {
  const size = props.gridSize * stageScale.value
  return {
    backgroundImage: `
      linear-gradient(to right, #e0e0e0 1px, transparent 1px),
      linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${stageX.value % size}px ${stageY.value % size}px`,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }
})

// Computed properties
const images = computed(() => store.images)
const texts = computed(() => store.texts)
const selectedImages = computed(() =>
  images.value.filter(img => selectedImageIds.value.includes(img.id))
)
const selectedTexts = computed(() =>
  texts.value.filter(text => selectedTextIds.value.includes(text.id))
)
const sortedImages = computed(() =>
  [...images.value].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
)
const canUndo = computed(() => store.canUndo)
const canRedo = computed(() => store.canRedo)

// Computed property for FloatingPropertiesPanel - combines selected images and texts
const selectedObjects = computed(() => {
  const objects = []

  // Add selected images
  selectedImages.value.forEach(img => {
    objects.push({
      ...img,
      type: img.shapeType ? 'shape' : 'image'
    })
  })

  // Add selected texts
  selectedTexts.value.forEach(text => {
    objects.push({
      ...text,
      type: 'text'
    })
  })

  return objects
})

// Methods
const handleAddImage = () => {
  fileInput.value?.click()
}

const handleAddImageURL = () => {
  showUrlModal.value = true
  imageUrl.value = ''
}

const closeUrlModal = () => {
  showUrlModal.value = false
  imageUrl.value = ''
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  for (const file of files) {
    await addImageFromFile(file)
  }
  event.target.value = '' // Reset input
}

const addImageFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate initial size (max 400px)
        const maxSize = 400
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width *= ratio
          height *= ratio
        }

        const imageObj = {
          id: Date.now() + Math.random(),
          image: img,
          x: (stageWidth.value - width) / 2,
          y: (stageHeight.value - height) / 2,
          width,
          height,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          draggable: true,
          name: file.name,
          src: e.target.result, // Store data URL for saving
          zIndex: images.value.length
        }

        store.addImage(imageObj)
        selectImage(imageObj.id, false)
        resolve()
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const addImageFromURL = async () => {
  if (!imageUrl.value) return

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl.value
    })

    const maxSize = 400
    let { width, height } = img
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height)
      width *= ratio
      height *= ratio
    }

    const imageObj = {
      id: Date.now() + Math.random(),
      image: img,
      x: (stageWidth.value - width) / 2,
      y: (stageHeight.value - height) / 2,
      width,
      height,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      draggable: true,
      name: imageUrl.value.split('/').pop() || 'Image',
      src: imageUrl.value, // Store URL for saving
      zIndex: images.value.length
    }

    store.addImage(imageObj)
    selectImage(imageObj.id, false)
    closeUrlModal()
  } catch (error) {
    console.error('Failed to load image from URL:', error)
    // Could emit an event to show a toast notification instead
    console.warn('Failed to load image from URL. Please check the URL and try again.')
  }
}

// Add image from asset (for templates and uploads)
const addImageFromUrl = (asset) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Calculate initial size (max 400px)
      const maxSize = 400
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width *= ratio
        height *= ratio
      }

      const imageObj = {
        id: Date.now() + Math.random(),
        image: img,
        x: (stageWidth.value - width) / 2,
        y: (stageHeight.value - height) / 2,
        width,
        height,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        src: asset.url || asset.thumbnail,
        name: asset.name || 'Image',
        visible: true,
        locked: false,
        draggable: true,
        zIndex: images.value.length
      }

      store.addImage(imageObj)
      selectImage(imageObj.id, false)
      resolve()
    }
    img.onerror = () => {
      console.error('Failed to load image:', asset)
      resolve()
    }

    // Handle both URLs and data URLs
    const imageSrc = asset.url || asset.thumbnail
    if (imageSrc.startsWith('data:')) {
      // For data URLs (uploaded files), no need for CORS
      img.src = imageSrc
    } else {
      // For external URLs, handle CORS
      img.crossOrigin = 'anonymous'
      img.src = imageSrc
    }
  })
}

// Add text to canvas
const addText = (text = 'Double-click to edit', style = {}) => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  // Get stage center position
  const centerX = stageWidth.value / 2
  const centerY = stageHeight.value / 2

  const textConfig = {
    id: Date.now().toString(),
    x: centerX - 100, // Offset to center the text
    y: centerY - 12,
    // CRITICAL: Don't set width for multi-line text to work properly
    // Konva will auto-calculate width based on content
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    text: text,
    fontSize: style.fontSize ? parseInt(style.fontSize) : 24,
    fontFamily: style.fontFamily || 'Arial',
    fill: style.color || '#000000',
    align: 'left',
    draggable: true,
    visible: true,
    locked: false,
    zIndex: 1
  }

  // Add to store
  store.addText(textConfig)
  console.log('Added text:', textConfig)

  // Automatically start editing the new text
  nextTick(() => {
    focusTextForEdit(textConfig.id)
  })
}

// Add shape to canvas
const addShape = (shapeType) => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  // Get stage center position
  const centerX = stageWidth.value / 2
  const centerY = stageHeight.value / 2

  let shapeConfig = {
    id: `shape-${Date.now()}`,
    x: centerX - 50,
    y: centerY - 50,
    fill: '#3B82F6', // Default blue color
    stroke: '#1E40AF',
    strokeWidth: 2,
    draggable: true
  }

  // Create shape based on type
  switch (shapeType) {
    case 'rectangle':
      shapeConfig = { ...shapeConfig, width: 100, height: 60 }
      break
    case 'circle':
      shapeConfig = { ...shapeConfig, radius: 50 }
      break
    case 'triangle':
      // Triangle as a line with points
      shapeConfig = {
        ...shapeConfig,
        points: [0, 50, 50, 0, 100, 50], // Triangle points
        closed: true
      }
      break
    case 'star':
      // Star shape points
      const starPoints = []
      const outerRadius = 50
      const innerRadius = 25
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / 5
        starPoints.push(radius * Math.cos(angle), radius * Math.sin(angle))
      }
      shapeConfig = { ...shapeConfig, points: starPoints, closed: true }
      break
  }

  // Add shape as an image-like object to the store for now
  // In a full implementation, you'd want a separate shapes array
  const shapeAsImage = {
    ...shapeConfig,
    src: `data:shape/${shapeType}`, // Placeholder src
    width: shapeConfig.width || 100,
    height: shapeConfig.height || 100,
    shapeType: shapeType,
    shapeConfig: shapeConfig
  }

  store.addImage(shapeAsImage)
  console.log('Added shape:', shapeType, shapeConfig)
}

// Apply filters to selected image
const applyFilters = (filters) => {
  if (selectedImageIds.value.length === 0) {
    console.warn('Please select an image to apply filters')
    return
  }

  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  selectedImageIds.value.forEach(imageId => {
    const node = stageNode.findOne(`#image-${imageId}`)
    if (node) {
      // Apply CSS filters to the Konva node
      const filterString = [
        `grayscale(${filters.grayscale || 0}%)`,
        `sepia(${filters.sepia || 0}%)`,
        `brightness(${filters.brightness || 100}%)`,
        `contrast(${filters.contrast || 100}%)`,
        `blur(${filters.blur || 0}px)`,
        `hue-rotate(${filters.hueRotate || 0}deg)`
      ].join(' ')

      // Store filter info in the image data
      const imageData = images.value.find(img => img.id === imageId)
      if (imageData) {
        store.updateImageWithHistory(imageId, {
          ...imageData,
          filters: filters,
          filterString: filterString
        })
      }
    }
  })

  console.log('Applied filters:', filters)
}

// Apply crop to selected image
const applyCrop = (dimensions) => {
  if (selectedImageIds.value.length === 0) {
    console.warn('Please select an image to crop')
    return
  }

  // For now, just log the crop dimensions
  // Full implementation would require canvas manipulation
  console.log('Crop dimensions:', dimensions)
  console.info('Crop functionality requires additional implementation')
}

// Add cropped image to canvas
const addCroppedImage = (imageData) => {
  // Convert blob/string to image and add to canvas
  if (imageData instanceof Blob) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const asset = {
        url: e.target?.result,
        name: 'Cropped Image',
        type: 'upload'
      }
      addImageFromUrl(asset)
    }
    reader.readAsDataURL(imageData)
  } else if (typeof imageData === 'string') {
    const asset = {
      url: imageData,
      name: 'Cropped Image',
      type: 'upload'
    }
    addImageFromUrl(asset)
  }
}

// Apply color to selected objects
const applyColor = (color) => {
  if (selectedImageIds.value.length === 0) {
    // Set as default color for new objects
    console.log('Set default color:', color)
    return
  }

  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  selectedImageIds.value.forEach(imageId => {
    const imageData = images.value.find(img => img.id === imageId)
    if (imageData && imageData.shapeType) {
      // Apply color to shape
      store.updateImageWithHistory(imageId, {
        ...imageData,
        fill: color
      })
    }
  })

  console.log('Applied color to selected objects:', color)
}

// Selection methods
const selectImage = (id, multiSelect = false) => {
  if (multiSelect) {
    if (selectedImageIds.value.includes(id)) {
      selectedImageIds.value = selectedImageIds.value.filter(i => i !== id)
    } else {
      selectedImageIds.value.push(id)
    }
  } else {
    selectedImageIds.value = [id]
  }
  updateTransformer()
}

// Text selection and editing
const selectedTextIds = ref([])

// Text editing overlay state
const textEditOverlay = ref(null)
const textEditState = reactive({
  isEditing: false,
  textId: null,
  initialText: '',
  currentText: '',
  isComposing: false,
  screenX: 0,
  screenY: 0,
  stageScale: 1,
  overlayWidth: 200,
  overlayHeight: 24,
  fontSize: 24,
  fontFamily: 'Arial',
  color: '#000000'
})

// Get actual rendered position of text element using Konva's transform system
const getTextElementScreenPosition = (textId) => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) {
    console.error('Stage node not found')
    return null
  }

  const textNode = stageNode.findOne(`#text-${textId}`)
  if (!textNode) {
    console.error('Text node not found:', textId)
    return null
  }

  // Get text data for consistent positioning
  const textData = texts.value.find(t => t.id === textId)
  if (!textData) {
    console.error('Text data not found:', textId)
    return null
  }

  // CRITICAL FIX: Force Konva to update text metrics before getting position
  // This ensures the text node has calculated its actual rendered size
  textNode.getLayer()?.batchDraw()

  // Get stage container's screen position relative to viewport
  const stageContainer = stageNode.container()
  const stageRect = stageContainer.getBoundingClientRect()

  // Use text data coordinates (world coordinates) and apply stage transform
  const stageTransform = stageNode.getAbsoluteTransform()

  // Apply stage transform to text world coordinates
  const screenPos = stageTransform.point({
    x: textData.x,
    y: textData.y
  })

  // Final screen coordinates relative to viewport (for fixed positioning)
  const finalX = stageRect.left + screenPos.x
  const finalY = stageRect.top + screenPos.y

  // Get text node dimensions - Konva auto-calculates these for text without width/height constraints
  // Use getWidth() and getHeight() which return the actual rendered size
  const textWidth = Math.max(textNode.getWidth ? textNode.getWidth() : textNode.width() * textNode.scaleX(), 200)
  const textHeight = Math.max(textNode.getHeight ? textNode.getHeight() : textNode.height() * textNode.scaleY(), textData.fontSize || 24)

  console.debug('Text screen position calculation:', {
    textId,
    stageRect: { left: stageRect.left, top: stageRect.top },
    worldPos: { x: textData.x, y: textData.y },
    screenPos,
    final: { x: finalX, y: finalY },
    dimensions: { width: textWidth, height: textHeight },
    stageScale: stageNode.scaleX()
  })

  return {
    x: finalX,
    y: finalY,
    width: textWidth,
    height: textHeight,
    stageScale: stageNode.scaleX()
  }
}

// Update overlay position using actual rendered position
const updateOverlayPosition = () => {
  if (!textEditState.isEditing || !textEditState.textId) return

  const position = getTextElementScreenPosition(textEditState.textId)
  if (!position) return

  // Update stored screen coordinates with actual rendered position
  textEditState.screenX = position.x
  textEditState.screenY = position.y
  textEditState.stageScale = position.stageScale

  console.debug('Updated overlay position:', position)
}

// Position update system (only on demand, not continuous)
const startPositionUpdates = () => {
  // Position is calculated once and stored, no continuous updates during typing
  // This prevents overlay jumping while user is typing
  console.debug('Position updates started (static mode)')
}

const stopPositionUpdates = () => {
  console.debug('Position updates stopped')
}

// Static overlay style (non-reactive to prevent position jumping)
const getOverlayStyle = () => {
  if (!textEditState.isEditing) {
    return { display: 'none' }
  }

  const screenX = textEditState.screenX
  const screenY = textEditState.screenY
  const overlayWidth = textEditState.overlayWidth
  const overlayHeight = textEditState.overlayHeight

  return {
    position: 'fixed',
    left: '0px',
    top: '0px',
    transformOrigin: '0 0',
    transform: `translate3d(${Math.round(screenX)}px, ${Math.round(screenY)}px, 0)`,
    width: `${Math.max(overlayWidth, 100)}px`,
    fontSize: `${textEditState.fontSize}px`,
    fontFamily: textEditState.fontFamily,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: textEditState.color,
    border: '2px solid #007bff',
    borderRadius: '4px',
    padding: '2px 4px',
    margin: '0',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(2px)',
    zIndex: 1000,
    outline: 'none',
    resize: 'none',
    overflow: 'visible',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    direction: 'ltr',
    unicodeBidi: 'embed',
    lineHeight: '1.2',
    boxSizing: 'border-box',
    display: 'block',
    textAlign: 'left',
    verticalAlign: 'top',
    minHeight: `${Math.max(overlayHeight, textEditState.fontSize * 1.2)}px`,
    maxHeight: 'none',
    height: 'auto'
  }
}

// Computed style that only shows/hides overlay
const textEditOverlayStyle = computed(() => {
  return textEditState.isEditing ? {} : { display: 'none' }
})

const selectText = (id, multiSelect = false) => {
  if (multiSelect) {
    if (selectedTextIds.value.includes(id)) {
      selectedTextIds.value = selectedTextIds.value.filter(i => i !== id)
    } else {
      selectedTextIds.value.push(id)
    }
  } else {
    selectedTextIds.value = [id]
    selectedImageIds.value = [] // Clear image selection
  }
  updateTransformer()
}

// Start text editing with overlay (accurate positioning)
const startTextEdit = (id, clickX = null) => {
  console.debug('=== startEdit ===', id, 'isEditing:', textEditState.isEditing)

  if (textEditState.isEditing && textEditState.textId === id) {
    console.debug('Already editing this text, refocusing overlay')
    nextTick(() => {
      if (textEditOverlay.value) {
        textEditOverlay.value.focus()
      }
    })
    return
  }

  if (textEditState.isEditing) {
    console.debug('Finishing existing edit before starting new one')
    commitTextEdit() // Finish any existing edit
  }

  const textData = texts.value.find(t => t.id === id)
  if (!textData) {
    console.error('Text data not found for id:', id)
    return
  }

  console.debug('Text data found:', textData)

  const stageNode = stage.value?.getNode()
  const textNode = stageNode?.findOne(`#text-${id}`)

  if (!textNode || !stageNode) {
    console.error('Text node or stage not found', { textNode: !!textNode, stageNode: !!stageNode })
    return
  }

  console.debug('Text node found, visible:', textNode.visible())

  // Set up editing state FIRST (before getting position to ensure text is available)
  textEditState.isEditing = true
  textEditState.textId = id
  textEditState.initialText = textData.text
  textEditState.currentText = textData.text
  textEditState.isComposing = false // Reset composition state
  textEditState.fontSize = textData.fontSize || 24
  textEditState.fontFamily = textData.fontFamily || 'Arial'
  textEditState.color = textData.fill || '#000000'
  // Start with a reasonable minimum width for the overlay
  textEditState.overlayWidth = 200
  textEditState.overlayHeight = textData.fontSize || 24

  // FIX for Issue 3: Hide transformer when starting to edit
  updateTransformer()

  // CRITICAL FIX: Wait for Konva to fully render the text node before getting position
  // This fixes the positioning issue on first edit
  nextTick(() => {
    // Force a redraw to ensure text node is fully rendered
    const stageNode = stage.value?.getNode()
    const textNode = stageNode?.findOne(`#text-${id}`)
    if (textNode) {
      textNode.getLayer()?.batchDraw()
    }

    // Increased delay to ensure rendering is complete
    // 100ms gives Konva more time to fully render, especially for newly created text
    setTimeout(() => {
      // Get actual rendered position using Konva's transform system
      const position = getTextElementScreenPosition(id)
      if (!position) {
        console.error('Could not get text element screen position')
        resetTextEditState()
        return
      }

      console.debug('startEdit position (after render delay):', position)

      // Update position in state
      textEditState.screenX = position.x
      textEditState.screenY = position.y
      textEditState.stageScale = position.stageScale

      console.debug('Updated textEditState position:', {
        screenX: textEditState.screenX,
        screenY: textEditState.screenY,
        stageScale: textEditState.stageScale
      })

      // Update dimensions from actual rendered size
      if (position.width && position.height) {
        textEditState.overlayWidth = Math.max(position.width, 100)
        textEditState.overlayHeight = Math.max(position.height, 24)
        console.debug('Updated overlay dimensions:', {
          width: textEditState.overlayWidth,
          height: textEditState.overlayHeight
        })
      }

      // Text node will be hidden via template visibility binding

      // Start continuous position updates for zoom/pan support
      startPositionUpdates()

      // Emit edit start event
      emit('text-edit-start', { id, initialText: textData.text })

      // Focus overlay after position is calculated
      nextTick(() => {
        const overlay = textEditOverlay.value
        if (overlay) {
          console.debug('overlay-created', id, 'at position:', position)

          // Apply static style directly to prevent position jumping
          const style = getOverlayStyle()

          // Apply styles one by one to ensure they stick
          overlay.style.position = style.position
          overlay.style.left = style.left
          overlay.style.top = style.top
          overlay.style.transform = style.transform
          overlay.style.transformOrigin = style.transformOrigin
          overlay.style.width = style.width
          overlay.style.fontSize = style.fontSize
          overlay.style.fontFamily = style.fontFamily
          overlay.style.color = style.color
          overlay.style.zIndex = style.zIndex
          overlay.style.display = style.display

          console.debug('Applied overlay style:', {
            transform: overlay.style.transform,
            position: overlay.style.position,
            left: overlay.style.left,
            top: overlay.style.top
          })

          // Set text content and focus
          // CRITICAL: Use innerText to preserve line breaks, or convert \n to <br>
          if (textEditState.currentText.includes('\n')) {
            // Convert \n to <br> for contenteditable div
            overlay.innerHTML = textEditState.currentText.split('\n').map(line => {
              // Escape HTML to prevent XSS
              const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              return escaped
            }).join('<br>')
          } else {
            overlay.textContent = textEditState.currentText
          }
          overlay.focus()

          // Debug position after applying style
          setTimeout(() => {
            debugOverlayPosition()
          }, 0)

          // Simple text selection - select all for now
          setTimeout(() => {
            try {
              const selection = window.getSelection()
              const range = document.createRange()
              range.selectNodeContents(overlay)
              selection?.removeAllRanges()
              selection?.addRange(range)
            } catch (error) {
              console.error('Error selecting text:', error)
            }
          }, 10)
        } else {
          console.error('Overlay not found')
        }
      })
    }, 100) // 100ms delay to ensure Konva has finished rendering (increased from 50ms)
  })
}

// Set caret position based on click coordinates (improved)
const setCaretFromClick = (clickX) => {
  if (!textEditOverlay.value) return

  const overlay = textEditOverlay.value
  const rect = overlay.getBoundingClientRect()

  // Convert click position to overlay-relative coordinates
  const relativeX = clickX - rect.left
  const relativeY = rect.height / 2 // Middle of the text line

  // Use browser APIs for precise caret positioning
  let range = null

  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(rect.left + relativeX, rect.top + relativeY)
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(rect.left + relativeX, rect.top + relativeY)
    if (pos) {
      range = document.createRange()
      range.setStart(pos.offsetNode, pos.offset)
      range.collapse(true)
    }
  }

  if (range) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  } else {
    // Fallback: position based on relative X
    setCaretFallback(relativeX)
  }
}

// Fallback caret positioning
const setCaretFallback = (relativeX) => {
  if (!textEditOverlay.value) return

  const overlay = textEditOverlay.value
  const rect = overlay.getBoundingClientRect()

  // Simple positioning based on relative position
  if (relativeX > rect.width * 0.8) {
    // Place caret at end
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(overlay)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  } else if (relativeX < rect.width * 0.2) {
    // Place caret at beginning
    const range = document.createRange()
    const selection = window.getSelection()
    range.setStart(overlay.firstChild || overlay, 0)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  } else {
    // Place caret in middle
    const textLength = overlay.textContent?.length || 0
    const position = Math.round((relativeX / rect.width) * textLength)
    const range = document.createRange()
    const selection = window.getSelection()
    const textNode = overlay.firstChild || overlay
    range.setStart(textNode, Math.min(position, textLength))
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

// Commit text edit
const commitTextEdit = () => {
  if (!textEditState.isEditing || !textEditState.textId) return

  const overlay = textEditOverlay.value
  if (!overlay) return

  const textData = texts.value.find(t => t.id === textEditState.textId)
  if (!textData) return

  // Get final text from overlay (preserve line breaks, don't trim)
  // CRITICAL FIX: Use innerText to preserve line breaks from contenteditable
  // innerText preserves \n from <br> tags, textContent does not
  const rawText = overlay.innerText || overlay.textContent || ''
  const newText = rawText || 'Double-click to edit'

  console.debug('commitEdit', textEditState.textId, 'rawText:', JSON.stringify(rawText), 'newText:', JSON.stringify(newText), 'lineBreaks:', newText.split('\n').length - 1)

  // Update the text in store - let Konva auto-calculate dimensions
  const updatedTextData = {
    ...textData,
    text: newText
  }

  // CRITICAL FIX: Remove width/height constraints to allow Konva to auto-size
  // This is essential for multi-line text to render properly
  delete updatedTextData.width
  delete updatedTextData.height

  console.debug('commitEdit - updating text:', {
    id: textEditState.textId,
    text: newText,
    lineCount: newText.split('\n').length
  })

  store.updateTextWithHistory(textEditState.textId, updatedTextData)

  // Force Konva to recalculate text dimensions
  nextTick(() => {
    const stageNode = stage.value?.getNode()
    const textNode = stageNode?.findOne(`#text-${textEditState.textId}`)
    if (textNode) {
      // Remove width/height from Konva node to allow auto-sizing
      textNode.width(undefined)
      textNode.height(undefined)
      // Force Konva to recalculate text layout
      textNode.getLayer()?.batchDraw()
      console.debug('Konva text node updated - auto-sizing enabled')
    }
  })

  // Emit commit event
  emit('text-edit-commit', { id: textEditState.textId, newText })

  // Reset editing state (text node will become visible via template)
  resetTextEditState()
}

// Cancel text edit
const cancelTextEdit = () => {
  if (!textEditState.isEditing || !textEditState.textId) return

  console.debug('cancelEdit', textEditState.textId)

  // Emit cancel event
  emit('text-edit-cancel', { id: textEditState.textId })

  // Reset editing state (text node will become visible via template)
  resetTextEditState()
}

// Reset text editing state
const resetTextEditState = () => {
  console.debug('overlay-destroyed', textEditState.textId)

  // Stop position updates
  stopPositionUpdates()

  textEditState.isEditing = false
  textEditState.textId = null
  textEditState.initialText = ''
  textEditState.currentText = ''
  textEditState.isComposing = false
  textEditState.screenX = 0
  textEditState.screenY = 0
  textEditState.stageScale = 1

  // FIX for Issue 3: Restore transformer after editing completes
  nextTick(() => {
    updateTransformer()
  })
}

// Handle overlay blur (delayed commit to allow for re-focus)
const handleOverlayBlur = (e) => {
  // FIX for Issue 1: Prevent blur event from affecting other elements
  e.stopPropagation()

  // Use setTimeout to allow for immediate re-focus (e.g., clicking same text)
  setTimeout(() => {
    // Only commit if we're still editing and overlay doesn't have focus
    if (textEditState.isEditing && document.activeElement !== textEditOverlay.value) {
      commitTextEdit()
    }
  }, 100)
}

// Legacy editText function for backward compatibility
const editText = (id) => {
  startTextEdit(id)
}

// Text editing overlay event handlers
const handleTextEditKeydown = (e) => {
  if (textEditState.isComposing) return // Don't handle during IME composition

  console.debug('Text edit keydown:', e.key, 'shiftKey:', e.shiftKey, 'ctrlKey:', e.ctrlKey)

  // Handle Ctrl+A (Select All) - FIX for Issue 2
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    // Allow default behavior to select all text in the overlay
    console.debug('Ctrl+A - selecting all text in overlay')
    // Don't prevent default - let browser handle select all
    return
  }

  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Shift+Enter commits the edit
      e.preventDefault()
      commitTextEdit()
    } else {
      // Enter creates a new line - allow default contenteditable behavior
      console.debug('Creating new line with Enter')
      // Don't prevent default - let contenteditable handle the line break

      // Update overlay height to accommodate new line
      setTimeout(() => {
        const overlay = textEditOverlay.value
        if (overlay) {
          const lineHeight = textEditState.fontSize * 1.2 // Match CSS line-height
          // Use innerText to count actual line breaks
          const text = overlay.innerText || overlay.textContent || ''
          const lines = text.split('\n').length
          const newHeight = Math.max(lines * lineHeight, textEditState.fontSize)
          textEditState.overlayHeight = newHeight
          console.debug('Updated overlay height for new line:', newHeight, 'lines:', lines)
        }
      }, 0)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelTextEdit()
  }
}

const handleTextEditInput = (e) => {
  // Let browser handle native editing, only sync on commit
  // Use innerText to preserve line breaks
  if (!textEditState.isComposing) {
    textEditState.currentText = e.target.innerText || e.target.textContent || ''
  }
}

const handleCompositionStart = () => {
  textEditState.isComposing = true
}

const handleCompositionEnd = (e) => {
  textEditState.isComposing = false
  // Use innerText to preserve line breaks
  textEditState.currentText = e.target.innerText || e.target.textContent || ''
}

// Focus text for editing (public API)
const focusTextForEdit = (id) => {
  startTextEdit(id)
}

// Debug function to check overlay position
const debugOverlayPosition = () => {
  const overlay = textEditOverlay.value
  if (overlay) {
    const rect = overlay.getBoundingClientRect()
    console.log('🔍 Overlay DOM position:', {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      transform: overlay.style.transform,
      position: overlay.style.position,
      visible: overlay.style.display !== 'none'
    })
  }

  if (textEditState.isEditing) {
    console.log('📍 Text edit state position:', {
      screenX: textEditState.screenX,
      screenY: textEditState.screenY,
      textId: textEditState.textId,
      isEditing: textEditState.isEditing
    })

    // Also check the text element position
    const textData = texts.value.find(t => t.id === textEditState.textId)
    if (textData) {
      console.log('📝 Text data position:', {
        x: textData.x,
        y: textData.y,
        text: textData.text
      })
    }
  }
}

// Simple test function for immediate debugging
const quickTest = () => {
  console.log('🧪 Quick Test - Current state:')
  console.log('Texts:', texts.value.length)
  console.log('Editing:', textEditState.isEditing)

  if (texts.value.length === 0) {
    console.log('➕ Adding test text...')
    addText('Test Text')
    return
  }

  const firstText = texts.value[0]
  console.log('🎯 Editing first text:', firstText.id)
  startTextEdit(firstText.id)
}

// Ultimate debug function - shows everything
const ultimateDebug = () => {
  console.log('🔬 ULTIMATE DEBUG - Complete Analysis:')

  // 1. Check texts
  console.log('📝 Texts:', texts.value.map(t => ({ id: t.id, x: t.x, y: t.y, text: t.text })))

  // 2. Check editing state
  console.log('✏️ Edit State:', {
    isEditing: textEditState.isEditing,
    textId: textEditState.textId,
    screenX: textEditState.screenX,
    screenY: textEditState.screenY
  })

  // 3. Check overlay
  const overlay = textEditOverlay.value
  if (overlay) {
    const rect = overlay.getBoundingClientRect()
    console.log('🎯 Overlay:', {
      visible: overlay.style.display !== 'none',
      position: overlay.style.position,
      transform: overlay.style.transform,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    })
  }

  // 4. Check stage
  const stageNode = stage.value?.getNode()
  if (stageNode) {
    const stageRect = stageNode.container().getBoundingClientRect()
    console.log('🎭 Stage:', {
      rect: { left: stageRect.left, top: stageRect.top, width: stageRect.width, height: stageRect.height },
      scale: stageNode.scaleX(),
      position: { x: stageNode.x(), y: stageNode.y() }
    })
  }
}

// Test function for debugging re-entry positioning
const testTextEdit = () => {
  console.log('=== TESTING TEXT EDIT ===')
  console.log('Current texts:', texts.value)
  console.log('Text edit state:', textEditState)

  // Add a test text if none exists
  if (texts.value.length === 0) {
    console.log('Adding test text...')
    addText('Test Text for Editing')
    return
  }

  // Try to edit the first text
  const firstText = texts.value[0]
  console.log('Trying to edit first text:', firstText)

  // Test re-entry by editing twice
  console.log('=== FIRST EDIT ===')
  startTextEdit(firstText.id)

  setTimeout(() => {
    console.log('=== FIRST EDIT POSITION ===')
    debugOverlayPosition()

    console.log('=== COMMITTING FIRST EDIT ===')
    commitTextEdit()

    setTimeout(() => {
      console.log('=== RE-ENTRY EDIT ===')
      startTextEdit(firstText.id)

      setTimeout(() => {
        console.log('=== RE-ENTRY POSITION ===')
        debugOverlayPosition()
      }, 100)
    }, 100)
  }, 1000)
}

// Make test function available globally for browser console
if (typeof window !== 'undefined') {
  window.testTextEdit = testTextEdit
}

// Canvas keyboard handler for accessibility
const handleCanvasKeydown = (e) => {
  // Don't interfere if we're already editing
  if (textEditState.isEditing) return

  // Enter key starts editing on selected text
  if (e.key === 'Enter' && selectedTextIds.value.length === 1) {
    e.preventDefault()
    console.debug('Starting edit via Enter key')
    startTextEdit(selectedTextIds.value[0])
  }

  // Tab key for navigation between text objects
  if (e.key === 'Tab') {
    e.preventDefault()
    const textIds = texts.value.map(t => t.id)
    if (textIds.length === 0) return

    const currentIndex = selectedTextIds.value.length === 1
      ? textIds.indexOf(selectedTextIds.value[0])
      : -1

    const nextIndex = e.shiftKey
      ? (currentIndex <= 0 ? textIds.length - 1 : currentIndex - 1)
      : (currentIndex >= textIds.length - 1 ? 0 : currentIndex + 1)

    selectText(textIds[nextIndex], false)
    emit('text-selected', { id: textIds[nextIndex] })
  }
}

const selectAll = () => {
  selectedImageIds.value = images.value.map(img => img.id)
  selectedTextIds.value = texts.value.map(text => text.id)
  updateTransformer()
}

const clearSelection = () => {
  selectedImageIds.value = []
  selectedTextIds.value = []
  updateTransformer()
}

const updateTransformer = async () => {
  await nextTick()
  const transformerNode = transformer.value?.getNode()
  const stageNode = stage.value?.getNode()

  if (!transformerNode || !stageNode) {
    console.warn('Transformer or stage not found', {
      hasTransformer: !!transformerNode,
      hasStage: !!stageNode
    })
    return
  }

  // FIX for Issue 3: Hide transformer when editing text
  if (textEditState.isEditing) {
    console.debug('Hiding transformer during text editing')
    transformerNode.nodes([])
    return
  }

  if (selectedImageIds.value.length === 0 && selectedTextIds.value.length === 0) {
    console.debug('No selection - hiding transformer')
    transformerNode.nodes([])
  } else {
    const selectedNodes = [
      ...selectedImageIds.value.map(id => stageNode.findOne(`#image-${id}`)),
      ...selectedTextIds.value.map(id => stageNode.findOne(`#text-${id}`))
    ].filter(Boolean)

    console.debug('Updating transformer with nodes:', {
      selectedImageIds: selectedImageIds.value,
      selectedTextIds: selectedTextIds.value,
      foundNodes: selectedNodes.length,
      nodeIds: selectedNodes.map(n => n?.id())
    })

    transformerNode.nodes(selectedNodes)

    // Force transformer to update and redraw
    transformerNode.getLayer()?.batchDraw()
  }
}

// Helper function to get stage pointer position
const getStagePointer = (stageRef, eventLike) => {
  const stage = stageRef.value?.getNode()
  if (!stage) return null

  const container = canvasContainer.value
  if (!container) return null

  // If no event provided, fall back to stage pointer but still apply transform
  if (!eventLike) {
    const pos = stage.getPointerPosition()
    if (!pos) return null
    const transform = stage.getAbsoluteTransform().copy().invert()
    return transform.point(pos)
  }

  // Extract DOM event from Konva event or use directly
  const domEvent = eventLike.evt || eventLike
  if (!domEvent) return null

  // Handle touch events by using first touch, or changedTouches for touchend
  let clientX, clientY
  if (domEvent.touches && domEvent.touches.length > 0) {
    clientX = domEvent.touches[0].clientX
    clientY = domEvent.touches[0].clientY
  } else if (domEvent.changedTouches && domEvent.changedTouches.length > 0) {
    clientX = domEvent.changedTouches[0].clientX
    clientY = domEvent.changedTouches[0].clientY
  } else {
    clientX = domEvent.clientX
    clientY = domEvent.clientY
  }

  if (clientX === undefined || clientY === undefined) return null

  // Get container bounds and compute CSS scaling factor
  const rect = container.getBoundingClientRect()
  const scaleX = stage.width() / rect.width
  const scaleY = stage.height() / rect.height

  // Convert DOM coordinates to container-relative coordinates accounting for CSS scaling
  const containerX = (clientX - rect.left) * scaleX
  const containerY = (clientY - rect.top) * scaleY

  // Apply inverse stage transform to get stage coordinates (accounts for pan/zoom)
  const transform = stage.getAbsoluteTransform().copy().invert()
  return transform.point({ x: containerX, y: containerY })
}

// Event handlers
const handleStageMouseDown = (e) => {
  // Skip if clicking on transformer
  if (e.target === transformer.value?.getNode()) return

  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  // Check if clicked on empty area (stage or background)
  const isEmptyClick = e.target === stageNode ||
                       e.target.attrs?.id === 'background-rect' ||
                       (e.target.getParent() && e.target.getParent() === backgroundLayer.value?.getNode())

  if (isEmptyClick) {
    // Start selection rectangle using corrected pointer position
    const pos = getStagePointer(stage, e)
    if (pos) {
      isSelecting.value = true
      selectionStart.value = { x: pos.x, y: pos.y }
      selectionRect.visible = false
      clearSelection()
    }
  }
}

const handleStageMouseMove = (e) => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  const pos = getStagePointer(stage, e)
  if (!pos) return

  // Broadcast cursor position to collaborators
  if (isConnected.value && canEdit.value) {
    collaborationStore.updateCursorPosition(pos.x, pos.y)
  }

  if (!isSelecting.value || !selectionStart.value) return

  // Only show selection rectangle if we've moved a minimum distance
  const minDistance = 5
  const distance = Math.sqrt(
    Math.pow(pos.x - selectionStart.value.x, 2) +
    Math.pow(pos.y - selectionStart.value.y, 2)
  )

  if (distance > minDistance) {
    selectionRect.visible = true
    selectionRect.x = Math.min(selectionStart.value.x, pos.x)
    selectionRect.y = Math.min(selectionStart.value.y, pos.y)
    selectionRect.width = Math.abs(pos.x - selectionStart.value.x)
    selectionRect.height = Math.abs(pos.y - selectionStart.value.y)

    // Batch draw for performance during drag
    const mainLayerNode = mainLayer.value?.getNode()
    if (mainLayerNode) {
      mainLayerNode.batchDraw()
    } else {
      stageNode.batchDraw()
    }
  }
}

const handleStageMouseUp = () => {
  const stageNode = stage.value?.getNode()

  if (isSelecting.value && stageNode) {
    // Hide selection rect on tiny drags
    if (!selectionRect.visible || selectionRect.width < 3 || selectionRect.height < 3) {
      isSelecting.value = false
      selectionRect.visible = false
      selectionStart.value = null
      return
    }

    // Select images within rectangle using stage coordinates
    const selected = []
    images.value.forEach(img => {
      const node = stageNode.findOne(`#image-${img.id}`)
      if (node) {
        const box = node.getClientRect()
        // Check if image is completely within selection rectangle
        if (
          box.x >= selectionRect.x &&
          box.y >= selectionRect.y &&
          box.x + box.width <= selectionRect.x + selectionRect.width &&
          box.y + box.height <= selectionRect.y + selectionRect.height
        ) {
          selected.push(img.id)
        }
      }
    })

    if (selected.length > 0) {
      selectedImageIds.value = selected
      updateTransformer()
    } else {
      clearSelection()
    }
  }

  // Reset selection state
  isSelecting.value = false
  selectionRect.visible = false
  selectionStart.value = null

  // Re-enable stage dragging for panning
  if (stageNode) {
    stageNode.draggable(false) // Keep false to prevent accidental stage dragging
  }
}

const handleContainerClick = (e) => {
  // This helps ensure the canvas gets focus for keyboard events
  if (canvasContainer.value) {
    canvasContainer.value.focus()
  }
}

const handleImageClick = (e) => {
  // Prevent event bubbling to stage
  e.cancelBubble = true

  const id = e.target.id().replace('image-', '')
  const multiSelect = e.evt.shiftKey

  // Only select if we're not in the middle of a selection drag
  if (!isSelecting.value) {
    selectImage(id, multiSelect)
  }
}

const handleImageMouseEnter = (e) => {
  const container = canvasContainer.value
  if (container) {
    container.style.cursor = 'pointer'
  }
}

const handleImageMouseLeave = (e) => {
  const container = canvasContainer.value
  if (container) {
    container.style.cursor = 'default'
  }
}

// Text event handlers
const handleTextClick = (e) => {
  console.log('Text clicked:', e.target.id())

  // Prevent event bubbling to stage
  e.cancelBubble = true

  const id = e.target.id().replace('text-', '')
  const multiSelect = e.evt.shiftKey

  console.log('Text ID:', id, 'Selected texts:', selectedTextIds.value)

  // Only select if we're not in the middle of a selection drag
  if (!isSelecting.value) {
    // FIX: Only select on single click, don't start editing
    // User must double-click to edit
    console.log('Selecting text')
    selectText(id, multiSelect)

    // Emit text selected event
    emit('text-selected', { id })
  }
}

const handleTextDoubleClick = (e) => {
  console.log('Text double-clicked:', e.target.id())

  const id = e.target.id().replace('text-', '')

  // Get click position for caret placement
  const clickX = e.evt.offsetX

  console.log('Starting edit from double-click, ID:', id, 'clickX:', clickX)

  // Start editing with click position
  startTextEdit(id, clickX)
}

// Mouse hover handlers for better UX
const handleTextMouseEnter = (e) => {
  const container = canvasContainer.value
  if (container && !textEditState.isEditing) {
    container.style.cursor = 'pointer'
  }
}

const handleTextMouseLeave = (e) => {
  const container = canvasContainer.value
  if (container) {
    container.style.cursor = 'default'
  }
}

const handleTextDragEnd = (e) => {
  const id = e.target.id().replace('text-', '')
  const textData = texts.value.find(t => t.id === id)
  if (textData) {
    store.updateTextWithHistory(id, {
      ...textData,
      x: e.target.x(),
      y: e.target.y()
    })
  }
}

const handleTextTransformEnd = (e) => {
  const id = e.target.id().replace('text-', '')
  const textData = texts.value.find(t => t.id === id)
  if (textData) {
    store.updateTextWithHistory(id, {
      ...textData,
      x: e.target.x(),
      y: e.target.y(),
      scaleX: e.target.scaleX(),
      scaleY: e.target.scaleY(),
      rotation: e.target.rotation()
    })
  }
}

const handleTransformEnd = (e) => {
  const id = e.target.id().replace('image-', '')
  const node = e.target

  const updatedImage = {
    x: node.x(),
    y: node.y(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
    rotation: node.rotation()
  }

  store.updateImage(id, updatedImage)
  store.saveToHistory()
}

const handleDragEnd = (e) => {
  const id = e.target.id().replace('image-', '')
  let { x, y } = e.target.position()

  // Apply snapping if enabled
  if (snapEnabled.value) {
    const snapped = snapToGrid({ x, y }, props.gridSize)
    x = snapped.x
    y = snapped.y
    e.target.position({ x, y })
  }

  store.updateImage(id, { x, y })
  store.saveToHistory()
}

// Zoom and pan
const handleWheel = (e) => {
  e.evt.preventDefault()

  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  const oldScale = stageScale.value
  const pointer = stageNode.getPointerPosition()

  const scaleBy = 1.1
  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

  // Limit zoom
  const clampedScale = Math.max(0.1, Math.min(5, newScale))

  const mousePointTo = {
    x: (pointer.x - stageX.value) / oldScale,
    y: (pointer.y - stageY.value) / oldScale
  }

  stageScale.value = clampedScale
  stageX.value = pointer.x - mousePointTo.x * clampedScale
  stageY.value = pointer.y - mousePointTo.y * clampedScale

  // Update overlay position if editing (manual update on zoom/pan)
  if (textEditState.isEditing) {
    const position = getTextElementScreenPosition(textEditState.textId)
    if (position) {
      textEditState.screenX = position.x
      textEditState.screenY = position.y
      textEditState.stageScale = position.stageScale

      // Apply updated position directly to overlay
      const overlay = textEditOverlay.value
      if (overlay) {
        const style = getOverlayStyle()
        Object.assign(overlay.style, style)
      }
    }
  }
}

const zoomIn = () => {
  const newScale = Math.min(5, stageScale.value * 1.2)
  zoomToCenter(newScale)
}

const zoomOut = () => {
  const newScale = Math.max(0.1, stageScale.value / 1.2)
  zoomToCenter(newScale)
}

const zoomToCenter = (newScale) => {
  const container = canvasContainer.value
  if (!container) return

  const centerX = container.clientWidth / 2
  const centerY = container.clientHeight / 2

  const mousePointTo = {
    x: (centerX - stageX.value) / stageScale.value,
    y: (centerY - stageY.value) / stageScale.value
  }

  stageScale.value = newScale
  stageX.value = centerX - mousePointTo.x * newScale
  stageY.value = centerY - mousePointTo.y * newScale

  // Update overlay position if editing (manual update on zoom)
  if (textEditState.isEditing) {
    const position = getTextElementScreenPosition(textEditState.textId)
    if (position) {
      textEditState.screenX = position.x
      textEditState.screenY = position.y
      textEditState.stageScale = position.stageScale

      // Apply updated position directly to overlay
      const overlay = textEditOverlay.value
      if (overlay) {
        const style = getOverlayStyle()
        Object.assign(overlay.style, style)
      }
    }
  }
}

const fitStage = () => {
  const container = canvasContainer.value
  if (!container) return

  // Set to 66% zoom instead of auto-fit
  const scale = 0.66

  stageScale.value = scale
  stageX.value = (container.clientWidth - stageWidth.value * scale) / 2
  stageY.value = (container.clientHeight - stageHeight.value * scale) / 2
}

// Touch handling for mobile
const handleTouchStart = (e) => {
  if (e.evt.touches.length === 2) {
    isPanning.value = true
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]
    lastPointerPosition.value = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
      distance: Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
    }
  }
}

const handleTouchMove = (e) => {
  if (e.evt.touches.length === 2 && isPanning.value && lastPointerPosition.value) {
    e.evt.preventDefault()

    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]
    const currentPos = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
      distance: Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
    }

    // Handle pinch zoom
    const scaleChange = currentPos.distance / lastPointerPosition.value.distance
    const newScale = Math.max(0.1, Math.min(5, stageScale.value * scaleChange))

    // Handle pan
    const dx = currentPos.x - lastPointerPosition.value.x
    const dy = currentPos.y - lastPointerPosition.value.y

    stageScale.value = newScale
    stageX.value += dx
    stageY.value += dy

    lastPointerPosition.value = currentPos
  }
}

const handleTouchEnd = () => {
  isPanning.value = false
  lastPointerPosition.value = null
}

// Transform operations
const flipHorizontal = () => {
  selectedImages.value.forEach(img => {
    store.updateImage(img.id, { scaleX: -img.scaleX })
  })
  store.saveToHistory()
}

const flipVertical = () => {
  selectedImages.value.forEach(img => {
    store.updateImage(img.id, { scaleY: -img.scaleY })
  })
  store.saveToHistory()
}

const bringForward = () => {
  selectedImages.value.forEach(img => {
    const newZIndex = Math.max(...images.value.map(i => i.zIndex || 0)) + 1
    store.updateImage(img.id, { zIndex: newZIndex })
  })
  store.saveToHistory()
}

const sendBackward = () => {
  selectedImages.value.forEach(img => {
    const newZIndex = Math.min(...images.value.map(i => i.zIndex || 0)) - 1
    store.updateImage(img.id, { zIndex: newZIndex })
  })
  store.saveToHistory()
}

const deleteSelected = () => {
  selectedImageIds.value.forEach(id => {
    store.removeImage(id)
  })
  selectedTextIds.value.forEach(id => {
    store.removeText(id)
  })
  clearSelection()
}

// Properties update
const updateProperty = (prop, value) => {
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return

  selectedImages.value.forEach(img => {
    if (prop === 'width') {
      store.updateImage(img.id, { scaleX: numValue / img.width })
    } else if (prop === 'height') {
      store.updateImage(img.id, { scaleY: numValue / img.height })
    } else {
      store.updateImage(img.id, { [prop]: numValue })
    }
  })
  store.saveToHistory()
}

// FloatingPropertiesPanel event handlers
const handleObjectUpdate = (id, updates) => {
  console.debug('Updating object:', id, updates)

  // Find if it's an image or text
  const imageData = images.value.find(img => img.id === id)
  const textData = texts.value.find(text => text.id === id)

  if (imageData) {
    store.updateImageWithHistory(id, { ...imageData, ...updates })
  } else if (textData) {
    store.updateTextWithHistory(id, { ...textData, ...updates })
  }
}

const handleDuplicate = (id) => {
  console.debug('Duplicating object:', id)

  // Find if it's an image or text
  const imageData = images.value.find(img => img.id === id)
  const textData = texts.value.find(text => text.id === id)

  if (imageData) {
    const newImage = {
      ...imageData,
      id: Date.now().toString(),
      x: imageData.x + 20,
      y: imageData.y + 20
    }
    store.addImage(newImage)
  } else if (textData) {
    const newText = {
      ...textData,
      id: Date.now().toString(),
      x: textData.x + 20,
      y: textData.y + 20
    }
    store.addText(newText)
  }

  store.saveToHistory()
}

const handleDelete = (id) => {
  console.debug('Deleting object:', id)

  // Find if it's an image or text
  const imageData = images.value.find(img => img.id === id)
  const textData = texts.value.find(text => text.id === id)

  if (imageData) {
    store.removeImage(id)
    selectedImageIds.value = selectedImageIds.value.filter(i => i !== id)
  } else if (textData) {
    store.removeText(id)
    selectedTextIds.value = selectedTextIds.value.filter(i => i !== id)
  }

  updateTransformer()
  store.saveToHistory()
}

const handleBringForward = (id) => {
  console.debug('Bringing forward:', id)

  // Find if it's an image or text
  const imageData = images.value.find(img => img.id === id)
  const textData = texts.value.find(text => text.id === id)

  if (imageData) {
    const newZIndex = (imageData.zIndex || 0) + 1
    store.updateImageWithHistory(id, { ...imageData, zIndex: newZIndex })
  } else if (textData) {
    const newZIndex = (textData.zIndex || 0) + 1
    store.updateTextWithHistory(id, { ...textData, zIndex: newZIndex })
  }
}

const handleSendBackward = (id) => {
  console.debug('Sending backward:', id)

  // Find if it's an image or text
  const imageData = images.value.find(img => img.id === id)
  const textData = texts.value.find(text => text.id === id)

  if (imageData) {
    const newZIndex = Math.max(0, (imageData.zIndex || 0) - 1)
    store.updateImageWithHistory(id, { ...imageData, zIndex: newZIndex })
  } else if (textData) {
    const newZIndex = Math.max(0, (textData.zIndex || 0) - 1)
    store.updateTextWithHistory(id, { ...textData, zIndex: newZIndex })
  }
}

// Layer operations
const toggleVisibility = (id) => {
  const img = images.value.find(i => i.id === id)
  store.updateImage(id, { visible: !(img.visible !== false) })
}

const toggleLock = (id) => {
  const img = images.value.find(i => i.id === id)
  store.updateImage(id, { locked: !img.locked, draggable: img.locked })
}

const toggleTextVisibility = (id) => {
  const text = texts.value.find(t => t.id === id)
  store.updateText(id, { visible: !(text.visible !== false) })
}

const toggleTextLock = (id) => {
  const text = texts.value.find(t => t.id === id)
  store.updateText(id, { locked: !text.locked, draggable: text.locked })
}

// Grid and snap
const toggleGrid = () => {
  gridEnabled.value = !gridEnabled.value
}

const toggleSnap = () => {
  snapEnabled.value = !snapEnabled.value
}

// Undo/Redo
const undo = () => store.undo()
const redo = () => store.redo()

// Export functions
const exportToPNG = async () => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  try {
    const blob = await exportStageToBlob(stageNode, 'image/png', 2)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'whiteboard.png'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const exportToJPG = async () => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  try {
    const blob = await exportStageToBlob(stageNode, 'image/jpeg', 2)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'whiteboard.jpg'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

// Export Panel handlers
const openExportPanel = () => {
  showExportPanel.value = true
}

// AI Panel handlers
const openAIPanel = () => {
  aiStore.openPanel()
}

const handleExportComplete = (result) => {
  console.log('Export complete:', result)
  if (result.downloadUrl) {
    lastExportUrl.value = result.downloadUrl
  }
  // Optionally open share panel after export
  // showSharePanel.value = true
}

const handleLinkGenerated = (link) => {
  console.log('Share link generated:', link)
  // Show success toast notification
}

const handleEmailSent = () => {
  console.log('Email sent successfully')
  // Show success toast notification
}

// Save/Load
const saveToJSON = () => {
  const data = {
    stage: {
      width: stageWidth.value,
      height: stageHeight.value,
      backgroundColor: backgroundColor.value
    },
    images: images.value.map(img => ({
      ...img,
      image: undefined // Remove image object, keep src
    }))
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'whiteboard.json'
  a.click()
  URL.revokeObjectURL(url)

  // Also save to localStorage
  localStorage.setItem('whiteboard-data', json)
}

const loadFromJSON = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await loadData(data)
    } catch (error) {
      console.error('Load failed:', error)
    }
  }
  input.click()
}

const loadData = async (data) => {
  // Clear current state
  store.clearImages()
  clearSelection()

  // Load stage settings
  if (data.stage) {
    stageWidth.value = data.stage.width || props.width
    stageHeight.value = data.stage.height || props.height
    backgroundColor.value = data.stage.backgroundColor || props.backgroundColor
  }

  // Load images
  if (data.images) {
    for (const imgData of data.images) {
      await loadImageFromData(imgData)
    }
  }
}

const loadImageFromData = (imgData) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const imageObj = {
        ...imgData,
        image: img
      }
      store.addImage(imageObj)
      resolve()
    }
    img.onerror = () => {
      console.error('Failed to load image:', imgData.src)
      resolve()
    }
    img.src = imgData.src
  })
}

// Keyboard shortcuts
const handleKeyDown = (e) => {
  if (e.target.tagName === 'INPUT') return

  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    e.preventDefault()
    selectAll()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    deleteSelected()
  }
}

// Lifecycle
onMounted(() => {
  // Load from localStorage if available
  const saved = localStorage.getItem('whiteboard-data')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      loadData(data)
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
  }

  // Add keyboard listeners
  window.addEventListener('keydown', handleKeyDown)

  // Add resize observer to handle container size changes
  if (canvasContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        // Force stage to recalculate dimensions
        const stageNode = stage.value?.getNode()
        if (stageNode && canvasContainer.value) {
          stageNode.width(canvasContainer.value.clientWidth)
          stageNode.height(canvasContainer.value.clientHeight)
          stageNode.batchDraw()
        }
      })
    })
    resizeObserver.observe(canvasContainer.value)
  }

  // Fit stage initially
  nextTick(() => {
    fitStage()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Watch for image changes to update node IDs
watch(images, () => {
  nextTick(() => {
    const stageNode = stage.value?.getNode()
    if (!stageNode) return

    images.value.forEach(img => {
      const node = stageNode.findOne(`#image-${img.id}`)
      if (node) {
        node.setAttrs({
          id: `image-${img.id}`,
          draggable: !img.locked && img.draggable !== false,
          visible: img.visible !== false
        })
      }
    })
  })
}, { deep: true })

// Expose methods for parent components
defineExpose({
  exportToPNG,
  exportToJPG,
  saveToJSON,
  loadFromJSON,
  selectAll,
  clearSelection,
  fitStage,
  addImageFromUrl,
  addText,
  addShape,
  applyColor,
  applyFilters,
  applyCrop,
  addCroppedImage,
  focusTextForEdit,
  startTextEdit,
  commitTextEdit,
  cancelTextEdit,
  testTextEdit,
  debugOverlayPosition,
  quickTest,
  ultimateDebug
})
</script>

<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  height: 80%;
  background: #f5f5f5;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #e0e0e0;
  min-height: 400px;
  width: 100%;
  cursor: default;
  outline: none;
}

.canvas-container:focus {
  outline: none;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.properties-panel {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 200px;
  z-index: 100;
}

.layers-panel {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 200px;
  max-height: 250px;
  z-index: 100;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 11px;
}

.layer-item:hover {
  background-color: #f0f0f0;
}

.layer-item.selected {
  background-color: #e3f2fd;
}

.layer-name {
  flex: 1;
  margin-left: 6px;
  font-size: 11px;
}

.lock-btn {
  padding: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 16px;
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
}

@media (max-width: 768px) {
  .properties-panel,
  .layers-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    width: auto;
    border-radius: 12px 12px 0 0;
    transform: translateY(calc(100% - 40px));
    transition: transform 0.3s ease;
  }

  .properties-panel:hover,
  .layers-panel:hover {
    transform: translateY(0);
  }
}

/* Text editing overlay styles */
.text-edit-overlay {
  /* Position will be set by JavaScript - don't override */
  border: 2px solid #007bff;
  border-radius: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
  z-index: 1000;
  outline: none;
  resize: none;
  overflow: visible; /* Allow multi-line text to show */
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  /* NO transition - prevents position jumping */
}

.text-edit-overlay:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Collaboration Features */
.remote-cursors-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}

.activity-feed-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
