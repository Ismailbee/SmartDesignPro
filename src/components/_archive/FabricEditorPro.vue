<template>
  <div class="fabric-editor-pro" ref="editorRef">
    <!-- Floating Properties Toolbar (Canva-like - appears above canvas when element selected) -->
    <Transition name="toolbar-slide">
      <div v-if="hasSelection" class="floating-properties-toolbar">
        <!-- Text Properties -->
        <template v-if="selectedTextObject">
          <div class="toolbar-group">
            <select v-model="textFont" @change="updateTextFont" class="toolbar-select font-select">
              <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
            </select>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="decreaseFontSize" class="toolbar-btn icon-btn" title="Decrease size">
              <Minus :size="16" />
            </button>
            <input 
              type="number" 
              v-model.number="textSize" 
              @change="updateTextSize" 
              class="toolbar-input size-input"
              min="8"
              max="200"
            >
            <button @click="increaseFontSize" class="toolbar-btn icon-btn" title="Increase size">
              <Plus :size="16" />
            </button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <div class="color-picker-wrapper">
              <input type="color" v-model="textColor" @input="updateTextColor" class="color-input">
              <div class="color-preview" :style="{ backgroundColor: textColor }">
                <Palette :size="14" />
              </div>
            </div>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="toggleBold" :class="['toolbar-btn icon-btn', { active: isBold }]" title="Bold (Ctrl+B)">
              <Bold :size="16" />
            </button>
            <button @click="toggleItalic" :class="['toolbar-btn icon-btn', { active: isItalic }]" title="Italic (Ctrl+I)">
              <Italic :size="16" />
            </button>
            <button @click="toggleUnderline" :class="['toolbar-btn icon-btn', { active: isUnderlined }]" title="Underline (Ctrl+U)">
              <Underline :size="16" />
            </button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="setAlignment('left')" :class="['toolbar-btn icon-btn', { active: textAlign === 'left' }]" title="Align Left">
              <AlignLeft :size="16" />
            </button>
            <button @click="setAlignment('center')" :class="['toolbar-btn icon-btn', { active: textAlign === 'center' }]" title="Align Center">
              <AlignCenter :size="16" />
            </button>
            <button @click="setAlignment('right')" :class="['toolbar-btn icon-btn', { active: textAlign === 'right' }]" title="Align Right">
              <AlignRight :size="16" />
            </button>
          </div>
        </template>

        <!-- Shape Properties -->
        <template v-else-if="selectedShape && !selectedImage">
          <div class="toolbar-group">
            <span class="toolbar-label">Fill</span>
            <div class="color-picker-wrapper">
              <input type="color" v-model="shapeFill" @input="updateShapeFill" class="color-input">
              <div class="color-preview" :style="{ backgroundColor: shapeFill }"></div>
            </div>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <span class="toolbar-label">Stroke</span>
            <div class="color-picker-wrapper">
              <input type="color" v-model="shapeStroke" @input="updateShapeStroke" class="color-input">
              <div class="color-preview" :style="{ backgroundColor: shapeStroke }"></div>
            </div>
            <input 
              type="number" 
              v-model.number="shapeStrokeWidth" 
              @input="updateShapeStrokeWidth" 
              class="toolbar-input stroke-input"
              min="0"
              max="20"
              title="Stroke width"
            >
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <span class="toolbar-label">Opacity</span>
            <input 
              type="range" 
              v-model.number="shapeOpacity" 
              @input="updateShapeOpacity"
              class="toolbar-range"
              min="0"
              max="1"
              step="0.1"
            >
            <span class="opacity-value">{{ Math.round(shapeOpacity * 100) }}%</span>
          </div>
        </template>

        <!-- Image Properties -->
        <template v-else-if="selectedImage">
          <div class="toolbar-group">
            <span class="toolbar-label">Brightness</span>
            <input type="range" v-model.number="imageBrightness" @input="updateImageBrightness" class="toolbar-range" min="-1" max="1" step="0.1">
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <span class="toolbar-label">Contrast</span>
            <input type="range" v-model.number="imageContrast" @input="updateImageContrast" class="toolbar-range" min="-1" max="1" step="0.1">
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="toggleGrayscale" :class="['toolbar-btn', { active: imageGrayscale }]" title="Grayscale">
              <ImageIcon :size="16" />
              <span>Grayscale</span>
            </button>
            <button @click="resetImageFilters" class="toolbar-btn" title="Reset Filters">
              <RotateCcw :size="16" />
            </button>
          </div>
        </template>

        <!-- Common Actions -->
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @click="handleDuplicate" class="toolbar-btn icon-btn" title="Duplicate (Ctrl+D)">
            <Copy :size="16" />
          </button>
          <button @click="handleDelete" class="toolbar-btn icon-btn danger" title="Delete (Del)">
            <Trash2 :size="16" />
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @click="handleBringForward" class="toolbar-btn icon-btn" title="Bring Forward">
            <ArrowUp :size="16" />
          </button>
          <button @click="handleSendBackward" class="toolbar-btn icon-btn" title="Send Backward">
            <ArrowDown :size="16" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main Toolbar -->
    <div class="main-toolbar">
      <!-- Left Section - History & Zoom -->
      <div class="toolbar-section">
        <button @click="handleUndo" :disabled="!canUndo" class="toolbar-btn icon-btn" title="Undo (Ctrl+Z)">
          <Undo2 :size="18" />
        </button>
        <button @click="handleRedo" :disabled="!canRedo" class="toolbar-btn icon-btn" title="Redo (Ctrl+Y)">
          <Redo2 :size="18" />
        </button>
        
        <div class="toolbar-divider"></div>
        
        <div class="zoom-controls">
          <button @click="handleZoomOut" class="toolbar-btn icon-btn" title="Zoom Out">
            <ZoomOut :size="18" />
          </button>
          <span class="zoom-value">{{ zoomPercent }}%</span>
          <button @click="handleZoomIn" class="toolbar-btn icon-btn" title="Zoom In">
            <ZoomIn :size="18" />
          </button>
          <button @click="handleResetZoom" class="toolbar-btn icon-btn" title="Fit to Screen">
            <Maximize2 :size="18" />
          </button>
        </div>
      </div>

      <!-- Center Section - Add Elements -->
      <div class="toolbar-section center">
        <button @click="addTextElement" class="toolbar-btn" title="Add Text">
          <Type :size="18" />
          <span class="btn-label">Text</span>
        </button>
        
        <div class="dropdown-wrapper">
          <button @click="showShapesMenu = !showShapesMenu" :class="['toolbar-btn', { active: showShapesMenu }]" title="Add Shape">
            <Shapes :size="18" />
            <span class="btn-label">Shapes</span>
            <ChevronDown :size="14" class="dropdown-icon" />
          </button>
          
          <Transition name="dropdown">
            <div v-if="showShapesMenu" class="dropdown-menu" @click.stop>
              <button @click="addRectangle" class="dropdown-item">
                <Square :size="18" />
                <span>Rectangle</span>
              </button>
              <button @click="addCircle" class="dropdown-item">
                <Circle :size="18" />
                <span>Circle</span>
              </button>
              <button @click="addTriangle" class="dropdown-item">
                <Triangle :size="18" />
                <span>Triangle</span>
              </button>
              <button @click="addStar" class="dropdown-item">
                <Star :size="18" />
                <span>Star</span>
              </button>
              <button @click="addLine" class="dropdown-item">
                <Minus :size="18" />
                <span>Line</span>
              </button>
            </div>
          </Transition>
        </div>
        
        <button @click="triggerImageUpload" class="toolbar-btn" title="Add Image">
          <ImagePlus :size="18" />
          <span class="btn-label">Image</span>
        </button>
      </div>

      <!-- Right Section - Export & Voice -->
      <div class="toolbar-section">
        <!-- Voice Commands temporarily disabled for debugging
        <VoiceCommands 
          @add-text="addTextElement"
          @add-heading="() => addTextElement('Heading')"
          @add-rectangle="addRectangle"
          @add-circle="addCircle"
          @add-triangle="addTriangle"
          @add-star="addStar"
          @add-line="addLine"
          @add-image="triggerImageUpload"
          @toggle-bold="toggleBold"
          @toggle-italic="toggleItalic"
          @toggle-underline="toggleUnderline"
          @change-color="handleVoiceColorChange"
          @change-font-size="handleVoiceFontSizeChange"
          @align="handleVoiceAlign"
          @delete="handleDelete"
          @duplicate="handleDuplicate"
          @undo="handleUndo"
          @redo="handleRedo"
          @select-all="handleSelectAll"
          @deselect="handleDeselect"
          @bring-forward="handleBringForward"
          @send-backward="handleSendBackward"
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @reset-zoom="handleResetZoom"
          @export="handleExport"
        />
        
        <div class="toolbar-divider"></div>
        -->
        
        <button @click="handleExport" class="toolbar-btn export-btn" title="Download">
          <Download :size="18" />
          <span class="btn-label">Export</span>
        </button>
      </div>
    </div>

    <!-- Canvas Container -->
    <div class="canvas-wrapper" ref="containerRef" @click="handleCanvasClick">
      <canvas ref="canvasRef"></canvas>
      
      <!-- Empty State -->
      <div v-if="!hasObjects" class="empty-state">
        <div class="empty-icon">
          <Sparkles :size="48" />
        </div>
        <h3>Start Creating</h3>
        <p>Add text, shapes, or images to your design</p>
        <div class="empty-actions">
          <button @click="addTextElement" class="action-btn primary">
            <Type :size="18" />
            Add Text
          </button>
          <button @click="triggerImageUpload" class="action-btn">
            <ImagePlus :size="18" />
            Upload Image
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input type="file" ref="fileInputRef" @change="handleFileUpload" accept="image/*" style="display: none">

    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <Loader2 :size="40" class="animate-spin" />
        </div>
        <p>Loading...</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  // Lucide Icons
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Type, Shapes, ImagePlus, Download,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Palette, Plus, Minus, Copy, Trash2, ArrowUp, ArrowDown,
  Square, Circle, Triangle, Star,
  ChevronDown, Loader2, RotateCcw, Sparkles,
  Image as ImageIcon
} from 'lucide-vue-next'
// VoiceCommands temporarily disabled
// import VoiceCommands from './VoiceCommands.vue'
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
import { FabricObject } from 'fabric'

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
  setFontFamily, setFontSize, setTextColor, setTextAlign,
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

// Computed
const zoomPercent = computed(() => Math.round(zoom.value * 100))
const hasObjects = computed(() => canvas.value && canvas.value.getObjects().length > 0)

// Font list
const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
]

// Text properties
const textFont = ref('Arial')
const textSize = ref(24)
const textColor = ref('#000000')
const textAlign = ref<'left' | 'center' | 'right'>('left')
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

// Watchers for property sync
watch(selectedTextObject, (obj) => {
  if (obj) {
    textFont.value = obj.fontFamily as string || 'Arial'
    textSize.value = obj.fontSize as number || 24
    textColor.value = obj.fill as string || '#000000'
    textAlign.value = (obj.textAlign as 'left' | 'center' | 'right') || 'left'
  }
})

watch(selectedShape, (obj) => {
  if (obj) {
    shapeFill.value = obj.fill as string || '#4A90D9'
    shapeStroke.value = obj.stroke as string || '#333333'
    shapeStrokeWidth.value = obj.strokeWidth as number || 2
    shapeOpacity.value = obj.opacity as number || 1
  }
})

watch(selectedImage, () => {
  imageBrightness.value = currentFilters.value.brightness
  imageContrast.value = currentFilters.value.contrast
  imageSaturation.value = currentFilters.value.saturation
})

// Event Handlers
const handleUndo = () => undo()
const handleRedo = () => redo()
const handleZoomIn = () => setZoom(zoom.value * 1.2)
const handleZoomOut = () => setZoom(zoom.value / 1.2)
const handleResetZoom = () => { setZoom(1); setPan(0, 0) }
const handleDuplicate = () => duplicateSelected()
const handleDelete = () => deleteSelected()
const handleBringForward = () => bringForward()
const handleSendBackward = () => sendBackward()
const handleSelectAll = () => selectAll()
const handleDeselect = () => clearSelection()

const handleCanvasClick = () => {
  showShapesMenu.value = false
}

// Text handlers
const updateTextFont = () => setFontFamily(textFont.value)
const updateTextSize = () => setFontSize(textSize.value)
const updateTextColor = () => setTextColor(textColor.value)
const setAlignment = (align: 'left' | 'center' | 'right') => {
  textAlign.value = align
  setTextAlign?.(align)
}
const increaseFontSize = () => {
  textSize.value = Math.min(200, textSize.value + 2)
  updateTextSize()
}
const decreaseFontSize = () => {
  textSize.value = Math.max(8, textSize.value - 2)
  updateTextSize()
}

// Shape handlers
const updateShapeFill = () => setFillColor(shapeFill.value)
const updateShapeStroke = () => setStrokeColor(shapeStroke.value)
const updateShapeStrokeWidth = () => setStrokeWidth(shapeStrokeWidth.value)
const updateShapeOpacity = () => setOpacity(shapeOpacity.value)

// Image handlers
const updateImageBrightness = () => setBrightness(imageBrightness.value)
const updateImageContrast = () => setContrast(imageContrast.value)
const resetImageFilters = () => {
  resetFilters()
  imageBrightness.value = 0
  imageContrast.value = 0
  imageSaturation.value = 0
}

// Voice command handlers
const handleVoiceColorChange = (color: string) => {
  if (selectedTextObject.value) {
    textColor.value = color
    updateTextColor()
  } else if (selectedShape.value) {
    shapeFill.value = color
    updateShapeFill()
  }
}

const handleVoiceFontSizeChange = (params: { size?: number, modifier?: string }) => {
  if (params.size) {
    textSize.value = params.size
  } else if (params.modifier === 'increase') {
    textSize.value = Math.min(200, textSize.value + 4)
  } else if (params.modifier === 'decrease') {
    textSize.value = Math.max(8, textSize.value - 4)
  }
  updateTextSize()
}

const handleVoiceAlign = (alignment: 'left' | 'center' | 'right') => {
  setAlignment(alignment)
}

// Add elements
const addTextElement = (text?: string | PointerEvent) => {
  const textContent = typeof text === 'string' ? text : 'Double-click to edit'
  addTextbox(textContent)
  showShapesMenu.value = false
}

const addRectangle = () => { addRect(); showShapesMenu.value = false }
const addCircle = () => { addCircleShape(); showShapesMenu.value = false }
const addTriangle = () => { addTriangleShape(); showShapesMenu.value = false }
const addStar = () => { addStarShape(); showShapesMenu.value = false }
const addLine = () => { addLineShape(); showShapesMenu.value = false }

// Image upload
const triggerImageUpload = () => fileInputRef.value?.click()
const handleFileUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    isLoading.value = true
    await addImageFromFile(file)
    isLoading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
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

// Initialize
onMounted(async () => {
  if (!canvasRef.value || !containerRef.value) return

  canvasComposable.containerRef.value = containerRef.value

  const rect = containerRef.value.getBoundingClientRect()
  const width = rect.width || props.width
  const height = rect.height || props.height

  canvasComposable.config.value.width = width
  canvasComposable.config.value.height = height
  canvasComposable.config.value.backgroundColor = props.backgroundColor

  initCanvas(canvasRef.value, containerRef.value)

  if (props.initialData) {
    await loadFromJSON(props.initialData)
  }

  const resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(containerRef.value)

  emit('canvas-ready')

  onUnmounted(() => {
    resizeObserver.disconnect()
    disposeCanvas()
  })
})

// Watch selection changes
watch(selectedObjects, (objects) => {
  emit('selection-change', objects)
})

// Expose public API
defineExpose({
  canvas, addText, addTextbox, addRect,
  addCircle: addCircleShape, addTriangle: addTriangleShape,
  addImageFromURL, addImageFromFile,
  undo, redo, deleteSelected, duplicateSelected,
  selectAll, clearSelection, toJSON, loadFromJSON,
  downloadImage, setZoom, setPan
})
</script>

<style scoped>
/* ========================================
   FABRIC EDITOR PRO - Clean Modern UI
   ======================================== */

.fabric-editor-pro {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}

/* Main Toolbar - Hidden when showToolbar is false */
.main-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e7;
  flex-shrink: 0;
  z-index: 100;
  gap: 8px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-section.center {
  flex: 1;
  justify-content: center;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e5e7;
  margin: 0 6px;
}

/* Toolbar Buttons */
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.toolbar-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #6366f1;
}

.toolbar-btn.icon-btn {
  padding: 8px;
  min-width: 36px;
}

.toolbar-btn.danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.toolbar-btn.export-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
}

.toolbar-btn.export-btn:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-label {
  display: block;
}

/* Zoom Controls */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-value {
  min-width: 50px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

/* Dropdown */
.dropdown-wrapper {
  position: relative;
}

.dropdown-icon {
  transition: transform 0.2s;
}

.toolbar-btn.active .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  z-index: 200;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* Floating Properties Toolbar */
.floating-properties-toolbar {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  z-index: 150;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  gap: 4px;
  max-width: 95vw;
  overflow-x: auto;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-label {
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  margin-right: 4px;
  white-space: nowrap;
}

.toolbar-select {
  padding: 6px 10px;
  background: #f9fafb;
  border: 1px solid #e5e5e7;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  min-width: 100px;
}

.toolbar-select:focus {
  outline: none;
  border-color: #6366f1;
}

.font-select {
  min-width: 130px;
}

.toolbar-input {
  padding: 6px 8px;
  background: #f9fafb;
  border: 1px solid #e5e5e7;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  text-align: center;
}

.toolbar-input:focus {
  outline: none;
  border-color: #6366f1;
}

.size-input {
  width: 50px;
}

.stroke-input {
  width: 45px;
}

.toolbar-range {
  width: 80px;
  cursor: pointer;
}

.opacity-value {
  color: #6b7280;
  font-size: 11px;
  min-width: 35px;
  text-align: right;
}

/* Color Picker */
.color-picker-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
}

.color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-preview {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 2px solid #e5e5e7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  pointer-events: none;
}

/* Toolbar Slide Animation */
.toolbar-slide-enter-active,
.toolbar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-slide-enter-from,
.toolbar-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* Canvas Wrapper */
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  background-image: 
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.canvas-wrapper canvas {
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  background: #ffffff;
}

/* Empty State */
.empty-state {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  pointer-events: none;
}

.empty-icon {
  color: #6366f1;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state h3 {
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 24px 0;
}

.empty-actions {
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.loading-spinner {
  color: #6366f1;
}

.loading-overlay p {
  margin-top: 16px;
  color: white;
  font-size: 14px;
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-toolbar {
    padding: 6px 8px;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .toolbar-section {
    gap: 2px;
  }
  
  .toolbar-section.center {
    order: 3;
    width: 100%;
    justify-content: center;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .btn-label {
    display: none;
  }
  
  .toolbar-btn {
    padding: 8px;
  }
  
  .toolbar-divider {
    height: 20px;
    margin: 0 4px;
  }
  
  .zoom-value {
    min-width: 40px;
    font-size: 11px;
  }
  
  .floating-properties-toolbar {
    top: auto;
    bottom: 8px;
    padding: 6px 10px;
    border-radius: 10px;
    gap: 2px;
  }
  
  .toolbar-select {
    min-width: 80px;
    padding: 5px 8px;
    font-size: 12px;
  }
  
  .font-select {
    min-width: 100px;
  }
  
  .toolbar-input {
    padding: 5px 6px;
    font-size: 12px;
  }
  
  .size-input {
    width: 40px;
  }
  
  .toolbar-range {
    width: 60px;
  }
  
  .dropdown-menu {
    left: auto;
    right: 0;
    transform: none;
  }
}

@media (max-width: 480px) {
  .floating-properties-toolbar {
    left: 8px;
    right: 8px;
    transform: none;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .toolbar-label {
    display: none;
  }
  
  .empty-actions {
    flex-direction: column;
  }
}

/* Touch-friendly sizing for Android */
@media (pointer: coarse) {
  .toolbar-btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .toolbar-btn.icon-btn {
    padding: 10px;
  }
  
  .dropdown-item {
    min-height: 48px;
    padding: 12px 14px;
  }
  
  .toolbar-select,
  .toolbar-input {
    min-height: 40px;
  }
}
</style>
