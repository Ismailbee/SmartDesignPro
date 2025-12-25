<template>
  <div class="fabric-editor" ref="editorRef">
    <!-- Top Toolbar -->
    <div class="editor-toolbar" v-if="showToolbar">
      <!-- File Operations -->
      <div class="toolbar-section">
        <button @click="handleUndo" :disabled="!canUndo" class="toolbar-btn" title="Undo (Ctrl+Z)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button @click="handleRedo" :disabled="!canRedo" class="toolbar-btn" title="Redo (Ctrl+Y)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Zoom Controls -->
      <div class="toolbar-section zoom-controls">
        <button @click="handleZoomOut" class="toolbar-btn" title="Zoom Out">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <span class="zoom-value">{{ zoomPercent }}%</span>
        <button @click="handleZoomIn" class="toolbar-btn" title="Zoom In">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button @click="handleResetZoom" class="toolbar-btn" title="Reset Zoom">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Add Elements -->
      <div class="toolbar-section">
        <button @click="addTextElement" class="toolbar-btn" title="Add Text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
        </button>
        <button @click="showShapesMenu = !showShapesMenu" class="toolbar-btn" :class="{ active: showShapesMenu }" title="Add Shape">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><circle cx="17.5" cy="6.5" r="3.5"/><polygon points="12 14 7 22 17 22"/></svg>
        </button>
        <button @click="triggerImageUpload" class="toolbar-btn" title="Add Image">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
      </div>

      <div class="toolbar-divider" v-if="hasSelection"></div>

      <!-- Selection Operations -->
      <div class="toolbar-section" v-if="hasSelection">
        <button @click="handleDuplicate" class="toolbar-btn" title="Duplicate (Ctrl+D)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button @click="handleDelete" class="toolbar-btn" title="Delete (Del)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        <button @click="handleBringForward" class="toolbar-btn" title="Bring Forward">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button @click="handleSendBackward" class="toolbar-btn" title="Send Backward">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <div class="toolbar-spacer"></div>

      <!-- Export -->
      <div class="toolbar-section">
        <button @click="handleExport" class="toolbar-btn export-btn" title="Download">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span class="btn-label">Export</span>
        </button>
      </div>
    </div>

    <!-- Shapes Dropdown Menu -->
    <div v-if="showShapesMenu" class="shapes-menu" @click.stop>
      <button @click="addRectangle" class="shape-btn">
        <div class="shape-icon rect"></div>
        <span>Rectangle</span>
      </button>
      <button @click="addCircle" class="shape-btn">
        <div class="shape-icon circle"></div>
        <span>Circle</span>
      </button>
      <button @click="addTriangle" class="shape-btn">
        <div class="shape-icon triangle"></div>
        <span>Triangle</span>
      </button>
      <button @click="addStar" class="shape-btn">
        <div class="shape-icon star">★</div>
        <span>Star</span>
      </button>
      <button @click="addLine" class="shape-btn">
        <div class="shape-icon line"></div>
        <span>Line</span>
      </button>
    </div>

    <!-- Canvas Container -->
    <div class="canvas-container" ref="containerRef" @click="showShapesMenu = false">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- Text Properties Panel -->
    <div v-if="selectedTextObject" class="properties-panel text-properties">
      <h4>Text Properties</h4>
      
      <div class="property-row">
        <label>Font</label>
        <select v-model="textFont" @change="updateTextFont">
          <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
        </select>
      </div>
      
      <div class="property-row">
        <label>Size</label>
        <input type="number" v-model.number="textSize" @change="updateTextSize" min="8" max="200">
      </div>
      
      <div class="property-row">
        <label>Color</label>
        <input type="color" v-model="textColor" @input="updateTextColor">
      </div>
      
      <div class="property-row button-row">
        <button @click="toggleBold" :class="{ active: isBold }" class="format-btn" title="Bold">
          <strong>B</strong>
        </button>
        <button @click="toggleItalic" :class="{ active: isItalic }" class="format-btn" title="Italic">
          <em>I</em>
        </button>
        <button @click="toggleUnderline" :class="{ active: isUnderlined }" class="format-btn" title="Underline">
          <u>U</u>
        </button>
      </div>
    </div>

    <!-- Shape Properties Panel -->
    <div v-if="selectedShape && !selectedTextObject && !selectedImage" class="properties-panel shape-properties">
      <h4>Shape Properties</h4>
      
      <div class="property-row">
        <label>Fill</label>
        <input type="color" v-model="shapeFill" @input="updateShapeFill">
      </div>
      
      <div class="property-row">
        <label>Stroke</label>
        <input type="color" v-model="shapeStroke" @input="updateShapeStroke">
      </div>
      
      <div class="property-row">
        <label>Stroke Width</label>
        <input type="range" v-model.number="shapeStrokeWidth" @input="updateShapeStrokeWidth" min="0" max="20">
      </div>
      
      <div class="property-row">
        <label>Opacity</label>
        <input type="range" v-model.number="shapeOpacity" @input="updateShapeOpacity" min="0" max="1" step="0.1">
      </div>
    </div>

    <!-- Image Properties Panel -->
    <div v-if="selectedImage" class="properties-panel image-properties">
      <h4>Image Filters</h4>
      
      <div class="property-row">
        <label>Brightness</label>
        <input type="range" v-model.number="imageBrightness" @input="updateImageBrightness" min="-1" max="1" step="0.1">
      </div>
      
      <div class="property-row">
        <label>Contrast</label>
        <input type="range" v-model.number="imageContrast" @input="updateImageContrast" min="-1" max="1" step="0.1">
      </div>
      
      <div class="property-row">
        <label>Saturation</label>
        <input type="range" v-model.number="imageSaturation" @input="updateImageSaturation" min="-1" max="1" step="0.1">
      </div>
      
      <div class="property-row button-row">
        <button @click="toggleGrayscale" :class="{ active: imageGrayscale }" class="filter-btn">Grayscale</button>
        <button @click="resetImageFilters" class="filter-btn">Reset</button>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input type="file" ref="fileInputRef" @change="handleFileUpload" accept="image/*" style="display: none">

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  useFabricCanvas,
  useFabricSelection,
  useFabricHistory,
  useFabricText,
  useFabricImage,
  useFabricShapes,
  useFabricTouch,
  useFabricExport,
  useFabricKeyboard
} from '@/composables/fabric'
import type { FabricObject } from 'fabric'

// Props
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  backgroundColor?: string
  showToolbar?: boolean
  initialData?: string | object
}>(), {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  showToolbar: true
})

// Emits
const emit = defineEmits<{
  (e: 'canvas-ready'): void
  (e: 'selection-change', objects: FabricObject[]): void
  (e: 'object-modified', object: FabricObject): void
  (e: 'state-change'): void
}>()

// Refs
const editorRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// UI State
const showShapesMenu = ref(false)
const isLoading = ref(false)

// Initialize Composables
const canvasComposable = useFabricCanvas()
const { 
  canvas, zoom, panX, panY,
  initCanvas, disposeCanvas, setZoom, setPan, resizeCanvas
} = canvasComposable

const selectionComposable = useFabricSelection(canvasComposable)
const {
  selectedObjects, activeObject, hasSelection,
  deleteSelected, duplicateSelected, selectAll, clearSelection,
  bringToFront, sendToBack, bringForward, sendBackward
} = selectionComposable

const historyComposable = useFabricHistory(canvasComposable)
const { canUndo, canRedo, undo, redo, saveState } = historyComposable

const textComposable = useFabricText(canvasComposable, selectionComposable)
const {
  selectedTextObject, isEditing, currentStyle: textStyle,
  addText, addTextbox,
  setFontFamily, setFontSize, setTextColor,
  toggleBold, toggleItalic, toggleUnderline
} = textComposable

const imageComposable = useFabricImage(canvasComposable, selectionComposable)
const {
  selectedImage, currentFilters, isLoading: imageLoading,
  addImageFromFile, addImageFromURL,
  setBrightness, setContrast, setSaturation, toggleGrayscale, resetFilters
} = imageComposable

const shapesComposable = useFabricShapes(canvasComposable, selectionComposable)
const {
  currentStyle: shapeStyle,
  addRect, addCircle: addCircleShape, addTriangle: addTriangleShape,
  addStar: addStarShape, addLine: addLineShape,
  setFillColor, setStrokeColor, setStrokeWidth, setOpacity
} = shapesComposable

const touchComposable = useFabricTouch(canvasComposable)

const exportComposable = useFabricExport(canvasComposable)
const { downloadImage, toJSON, loadFromJSON } = exportComposable

const keyboardComposable = useFabricKeyboard(
  canvasComposable,
  selectionComposable,
  historyComposable,
  textComposable
)

// Computed zoom percentage for display
const zoomPercent = computed(() => Math.round(zoom.value * 100))

// Font list
const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
]

// Text properties
const textFont = ref('Arial')
const textSize = ref(24)
const textColor = ref('#000000')
const isBold = computed(() => textStyle.value.fontWeight === 'bold')
const isItalic = computed(() => textStyle.value.fontStyle === 'italic')
const isUnderlined = computed(() => textStyle.value.underline)

// Shape properties
const shapeFill = ref('#4A90D9')
const shapeStroke = ref('#333333')
const shapeStrokeWidth = ref(2)
const shapeOpacity = ref(1)

// Image properties
const imageBrightness = ref(0)
const imageContrast = ref(0)
const imageSaturation = ref(0)
const imageGrayscale = computed(() => currentFilters.value.grayscale)

// Selected shape (non-text, non-image)
const selectedShape = computed(() => {
  if (!activeObject.value) return null
  if (selectedTextObject.value) return null
  if (selectedImage.value) return null
  return activeObject.value
})

// Update text properties when selection changes
watch(selectedTextObject, (obj) => {
  if (obj) {
    textFont.value = obj.fontFamily as string || 'Arial'
    textSize.value = obj.fontSize as number || 24
    textColor.value = obj.fill as string || '#000000'
  }
})

// Update shape properties when selection changes
watch(selectedShape, (obj) => {
  if (obj) {
    shapeFill.value = obj.fill as string || '#4A90D9'
    shapeStroke.value = obj.stroke as string || '#333333'
    shapeStrokeWidth.value = obj.strokeWidth as number || 2
    shapeOpacity.value = obj.opacity as number || 1
  }
})

// Update image properties when selection changes
watch(selectedImage, () => {
  imageBrightness.value = currentFilters.value.brightness
  imageContrast.value = currentFilters.value.contrast
  imageSaturation.value = currentFilters.value.saturation
})

// Event handlers
const handleUndo = () => undo()
const handleRedo = () => redo()
const handleZoomIn = () => setZoom(zoom.value * 1.2)
const handleZoomOut = () => setZoom(zoom.value / 1.2)
const handleResetZoom = () => { setZoom(1); setPan(0, 0) }
const handleDuplicate = () => duplicateSelected()
const handleDelete = () => deleteSelected()
const handleBringForward = () => bringForward()
const handleSendBackward = () => sendBackward()

// Add elements
const addTextElement = () => {
  addTextbox('Double-click to edit')
  showShapesMenu.value = false
}

const addRectangle = () => {
  addRect()
  showShapesMenu.value = false
}

const addCircle = () => {
  addCircleShape()
  showShapesMenu.value = false
}

const addTriangle = () => {
  addTriangleShape()
  showShapesMenu.value = false
}

const addStar = () => {
  addStarShape()
  showShapesMenu.value = false
}

const addLine = () => {
  addLineShape()
  showShapesMenu.value = false
}

// Image upload
const triggerImageUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    isLoading.value = true
    await addImageFromFile(file)
    isLoading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

// Text property updates
const updateTextFont = () => setFontFamily(textFont.value)
const updateTextSize = () => setFontSize(textSize.value)
const updateTextColor = () => setTextColor(textColor.value)

// Shape property updates
const updateShapeFill = () => setFillColor(shapeFill.value)
const updateShapeStroke = () => setStrokeColor(shapeStroke.value)
const updateShapeStrokeWidth = () => setStrokeWidth(shapeStrokeWidth.value)
const updateShapeOpacity = () => setOpacity(shapeOpacity.value)

// Image filter updates
const updateImageBrightness = () => setBrightness(imageBrightness.value)
const updateImageContrast = () => setContrast(imageContrast.value)
const updateImageSaturation = () => setSaturation(imageSaturation.value)
const resetImageFilters = () => {
  resetFilters()
  imageBrightness.value = 0
  imageContrast.value = 0
  imageSaturation.value = 0
}

// Export
const handleExport = async () => {
  await downloadImage('design', { format: 'png', quality: 1 })
}

// Resize handler
const handleResize = () => {
  if (!containerRef.value || !canvas.value) return
  const rect = containerRef.value.getBoundingClientRect()
  resizeCanvas(rect.width, rect.height)
}

// Initialize canvas
onMounted(async () => {
  if (!canvasRef.value || !containerRef.value) return

  // Set container ref for touch handling
  canvasComposable.containerRef.value = containerRef.value

  // Get container dimensions
  const rect = containerRef.value.getBoundingClientRect()
  const width = rect.width || props.width
  const height = rect.height || props.height

  // Update canvas config before initialization
  canvasComposable.config.value.width = width
  canvasComposable.config.value.height = height
  canvasComposable.config.value.backgroundColor = props.backgroundColor

  // Initialize canvas
  initCanvas(canvasRef.value, containerRef.value)

  // Load initial data if provided
  if (props.initialData) {
    await loadFromJSON(props.initialData)
  }

  // Setup resize observer
  const resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(containerRef.value)

  emit('canvas-ready')

  // Cleanup on unmount
  onUnmounted(() => {
    resizeObserver.disconnect()
    disposeCanvas()
  })
})

// Watch selection changes
watch(selectedObjects, (objects) => {
  emit('selection-change', objects)
})

// Public API for parent components
defineExpose({
  canvas,
  addText,
  addTextbox,
  addRect,
  addCircle: addCircleShape,
  addTriangle: addTriangleShape,
  addImageFromURL,
  addImageFromFile,
  undo,
  redo,
  deleteSelected,
  duplicateSelected,
  selectAll,
  clearSelection,
  toJSON,
  loadFromJSON,
  downloadImage,
  setZoom,
  setPan
})
</script>

<style scoped>
.fabric-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #2d2d2d;
  overflow: hidden;
}

/* Toolbar Styles */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #444;
  margin: 0 4px;
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 18px;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: rgba(74, 144, 217, 0.3);
  color: #4A90D9;
}

.toolbar-btn.export-btn {
  background: #4A90D9;
  padding: 8px 16px;
}

.toolbar-btn.export-btn:hover {
  background: #357ABD;
}

.btn-label {
  font-size: 14px;
  font-weight: 500;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-value {
  min-width: 48px;
  text-align: center;
  color: #aaa;
  font-size: 12px;
}

/* Shapes Menu */
.shapes-menu {
  position: absolute;
  top: 56px;
  left: 200px;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.shape-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.shape-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.shape-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-icon.rect {
  background: #4A90D9;
  border-radius: 2px;
}

.shape-icon.circle {
  background: #4A90D9;
  border-radius: 50%;
}

.shape-icon.triangle {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 18px solid #4A90D9;
}

.shape-icon.star {
  color: #4A90D9;
  font-size: 20px;
}

.shape-icon.line {
  width: 20px;
  height: 2px;
  background: #4A90D9;
  transform: rotate(-45deg);
}

/* Canvas Container */
.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  min-height: 400px;
}

.canvas-container canvas {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: #ffffff;
}

/* Properties Panel */
.properties-panel {
  position: absolute;
  right: 16px;
  top: 70px;
  width: 220px;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  z-index: 50;
}

.properties-panel h4 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.property-row label {
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
}

.property-row input,
.property-row select {
  padding: 8px;
  background: #2d2d3d;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
}

.property-row input[type="color"] {
  padding: 2px;
  height: 32px;
  cursor: pointer;
}

.property-row input[type="range"] {
  padding: 0;
  cursor: pointer;
}

.button-row {
  flex-direction: row;
  gap: 8px;
}

.format-btn,
.filter-btn {
  flex: 1;
  padding: 8px;
  background: #2d2d3d;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.format-btn:hover,
.filter-btn:hover {
  background: #3d3d4d;
}

.format-btn.active,
.filter-btn.active {
  background: #4A90D9;
  border-color: #4A90D9;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 16px;
  color: #fff;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 6px 8px;
    gap: 4px;
  }

  .toolbar-btn {
    padding: 6px;
    font-size: 16px;
  }

  .btn-label {
    display: none;
  }

  .toolbar-divider {
    margin: 0 2px;
  }

  .zoom-value {
    min-width: 40px;
    font-size: 11px;
  }

  .shapes-menu {
    left: 8px;
    right: 8px;
    width: auto;
  }

  .properties-panel {
    left: 8px;
    right: 8px;
    width: auto;
    top: auto;
    bottom: 8px;
  }
}

@media (max-width: 480px) {
  .editor-toolbar {
    justify-content: space-between;
  }

  .properties-panel {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
