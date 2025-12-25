<template>
  <div class="advanced-editor" :class="{ 'voice-active': isListening }">
    <!-- Left Sidebar - Tools -->
    <aside class="sidebar left-sidebar">
      <div class="sidebar-section">
        <h3 class="section-title">Tools</h3>
        <div class="tool-grid">
          <button 
            v-for="tool in tools" 
            :key="tool.id"
            @click="selectTool(tool.id)"
            :class="['tool-btn', { active: activeTool === tool.id }]"
            :title="tool.name"
          >
            <span class="tool-icon" v-html="tool.icon"></span>
            <span class="tool-label">{{ tool.name }}</span>
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">Shapes</h3>
        <div class="shape-grid">
          <button v-for="shape in shapes" :key="shape.id" @click="addShape(shape.id)" class="shape-btn" :title="shape.name">
            <div :class="['shape-preview', shape.id]"></div>
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">Quick Actions</h3>
        <div class="action-list">
          <button @click="addTextElement" class="action-btn">
            <span>Aa</span> Add Text
          </button>
          <button @click="addHeading" class="action-btn">
            <span>H</span> Add Heading
          </button>
          <button @click="triggerImageUpload" class="action-btn">
            <span>🖼</span> Upload Image
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Canvas Area -->
    <main class="canvas-area">
      <!-- Top Toolbar -->
      <header class="top-toolbar">
        <div class="toolbar-group">
          <button @click="handleUndo" :disabled="!canUndo" class="tb-btn" title="Undo (Ctrl+Z)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button @click="handleRedo" :disabled="!canRedo" class="tb-btn" title="Redo (Ctrl+Y)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group zoom-group">
          <button @click="handleZoomOut" class="tb-btn" title="Zoom Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span class="zoom-display">{{ zoomPercent }}%</span>
          <button @click="handleZoomIn" class="tb-btn" title="Zoom In">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button @click="handleResetZoom" class="tb-btn" title="Fit to View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Selection Tools -->
        <div class="toolbar-group" v-if="hasSelection">
          <button @click="handleDuplicate" class="tb-btn" title="Duplicate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button @click="handleDelete" class="tb-btn" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <div class="toolbar-divider"></div>
          <button @click="bringForward" class="tb-btn" title="Bring Forward">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button @click="sendBackward" class="tb-btn" title="Send Backward">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        <div class="toolbar-spacer"></div>

        <!-- Voice Control -->
        <div class="toolbar-group voice-group">
          <button 
            @click="toggleVoice" 
            :class="['tb-btn voice-btn', { active: isListening, speaking: isSpeaking }]"
            :title="isListening ? 'Stop Voice Control' : 'Start Voice Control'"
          >
            <svg v-if="!isListening" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/></svg>
          </button>
          <span v-if="isListening" class="voice-status">
            <span class="pulse"></span>
            {{ transcript || 'Listening...' }}
          </span>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Animation & Export -->
        <div class="toolbar-group">
          <button @click="showAnimationPanel = !showAnimationPanel" :class="['tb-btn', { active: showAnimationPanel }]" title="Animations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button @click="playAllAnimations" class="tb-btn" title="Preview Animations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <button @click="handleExport" class="export-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </header>

      <!-- Canvas Container -->
      <div class="canvas-wrapper" ref="containerRef">
        <canvas ref="canvasRef"></canvas>
        
        <!-- Voice Feedback Overlay -->
        <div v-if="feedback.length > 0" class="voice-feedback">
          <transition-group name="feedback">
            <div 
              v-for="item in feedback" 
              :key="item.timestamp"
              :class="['feedback-item', item.type]"
            >
              <span class="feedback-icon">
                {{ item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : item.type === 'listening' ? '🎤' : 'ℹ' }}
              </span>
              {{ item.message }}
            </div>
          </transition-group>
        </div>
      </div>

      <!-- Bottom Timeline (for animations) -->
      <div v-if="showAnimationPanel" class="timeline-panel">
        <div class="timeline-header">
          <h3>Animation Timeline</h3>
          <div class="timeline-controls">
            <button @click="animationComposable?.stop()" class="tl-btn" title="Stop">
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
            </button>
            <button @click="playAllAnimations" class="tl-btn" title="Play">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
            </button>
            <span class="timeline-time">{{ formatTime(currentAnimationTime) }} / {{ formatTime(totalAnimationDuration) }}</span>
          </div>
        </div>
        <div class="timeline-track">
          <div class="timeline-ruler">
            <span v-for="i in 10" :key="i" class="ruler-mark">{{ (i - 1) * 0.5 }}s</span>
          </div>
          <div class="timeline-objects">
            <div v-for="obj in canvasObjects" :key="obj.id" class="timeline-object-row">
              <span class="object-name">{{ obj.type }}</span>
              <div class="object-keyframes">
                <!-- Animation markers would go here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Sidebar - Properties & Animations -->
    <aside class="sidebar right-sidebar">
      <!-- Object Properties -->
      <div v-if="hasSelection" class="sidebar-section">
        <h3 class="section-title">Properties</h3>
        
        <!-- Position & Size -->
        <div class="property-group">
          <label>Position</label>
          <div class="input-row">
            <div class="input-field">
              <span>X</span>
              <input type="number" v-model.number="objectX" @change="updateObjectPosition" />
            </div>
            <div class="input-field">
              <span>Y</span>
              <input type="number" v-model.number="objectY" @change="updateObjectPosition" />
            </div>
          </div>
        </div>

        <div class="property-group">
          <label>Size</label>
          <div class="input-row">
            <div class="input-field">
              <span>W</span>
              <input type="number" v-model.number="objectWidth" @change="updateObjectSize" />
            </div>
            <div class="input-field">
              <span>H</span>
              <input type="number" v-model.number="objectHeight" @change="updateObjectSize" />
            </div>
          </div>
        </div>

        <div class="property-group">
          <label>Rotation</label>
          <input type="range" v-model.number="objectAngle" @input="updateObjectAngle" min="0" max="360" />
          <span class="value-display">{{ objectAngle }}°</span>
        </div>

        <div class="property-group">
          <label>Opacity</label>
          <input type="range" v-model.number="objectOpacity" @input="updateObjectOpacity" min="0" max="1" step="0.1" />
          <span class="value-display">{{ Math.round(objectOpacity * 100) }}%</span>
        </div>

        <!-- Colors -->
        <div class="property-group colors">
          <div class="color-field">
            <label>Fill</label>
            <input type="color" v-model="objectFill" @input="updateObjectFill" />
          </div>
          <div class="color-field">
            <label>Stroke</label>
            <input type="color" v-model="objectStroke" @input="updateObjectStroke" />
          </div>
        </div>

        <!-- Text Properties (if text selected) -->
        <div v-if="selectedTextObject" class="property-group">
          <label>Font</label>
          <select v-model="textFont" @change="updateTextFont">
            <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
          </select>
          <div class="input-row">
            <input type="number" v-model.number="textSize" @change="updateTextSize" min="8" max="200" />
            <div class="text-format-btns">
              <button @click="toggleBold" :class="{ active: isBold }"><b>B</b></button>
              <button @click="toggleItalic" :class="{ active: isItalic }"><i>I</i></button>
              <button @click="toggleUnderline" :class="{ active: isUnderlined }"><u>U</u></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Animations Panel -->
      <div class="sidebar-section animations-section">
        <h3 class="section-title">Animations</h3>
        
        <div class="animation-tabs">
          <button :class="{ active: animationTab === 'entrance' }" @click="animationTab = 'entrance'">Entrance</button>
          <button :class="{ active: animationTab === 'emphasis' }" @click="animationTab = 'emphasis'">Emphasis</button>
          <button :class="{ active: animationTab === 'exit' }" @click="animationTab = 'exit'">Exit</button>
        </div>

        <div class="animation-grid">
          <button 
            v-for="preset in currentAnimationPresets" 
            :key="preset.id"
            @click="applyAnimation(preset.id)"
            class="animation-btn"
            :title="preset.name"
          >
            <span class="anim-icon">{{ preset.icon }}</span>
            <span class="anim-name">{{ preset.name }}</span>
          </button>
        </div>

        <div v-if="hasSelection" class="animation-settings">
          <div class="setting-row">
            <label>Duration</label>
            <input type="range" v-model.number="animationDuration" min="100" max="2000" step="100" />
            <span>{{ animationDuration }}ms</span>
          </div>
          <div class="setting-row">
            <label>Delay</label>
            <input type="range" v-model.number="animationDelay" min="0" max="2000" step="100" />
            <span>{{ animationDelay }}ms</span>
          </div>
        </div>
      </div>

      <!-- Layers Panel -->
      <div class="sidebar-section layers-section">
        <h3 class="section-title">Layers</h3>
        <div class="layers-list">
          <div 
            v-for="(obj, index) in reversedCanvasObjects" 
            :key="obj.id || index"
            :class="['layer-item', { selected: isObjectSelected(obj) }]"
            @click="selectLayer(obj)"
          >
            <span class="layer-icon">
              {{ getLayerIcon(obj.type) }}
            </span>
            <span class="layer-name">{{ obj.type }} {{ index + 1 }}</span>
            <button @click.stop="toggleLayerVisibility(obj)" class="layer-visibility">
              {{ obj.visible !== false ? '👁' : '👁‍🗨' }}
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Hidden file input -->
    <input type="file" ref="fileInputRef" @change="handleFileUpload" accept="image/*" style="display: none" />
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader"></div>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import {
  useFabricCanvas,
  useFabricSelection,
  useFabricHistory,
  useFabricText,
  useFabricImage,
  useFabricShapes,
  useFabricTouch,
  useFabricExport,
  useFabricKeyboard,
  useFabricAnimation,
  useFabricVoice,
  ANIMATION_PRESETS
} from '@/composables/fabric'
import type { FabricObject } from 'fabric'

// Props
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  backgroundColor?: string
}>(), {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
})

// Emits
const emit = defineEmits<{
  (e: 'canvas-ready'): void
  (e: 'save', data: object): void
}>()

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// UI State
const isLoading = ref(false)
const activeTool = ref('select')
const showAnimationPanel = ref(false)
const animationTab = ref<'entrance' | 'emphasis' | 'exit'>('entrance')
const animationDuration = ref(500)
const animationDelay = ref(0)

// Initialize all composables
const canvasComposable = useFabricCanvas()
const { canvas, zoom, initCanvas, disposeCanvas, setZoom, resizeCanvas } = canvasComposable

const selectionComposable = useFabricSelection(canvasComposable)
const { selectedObjects, activeObject, hasSelection, deleteSelected, duplicateSelected, bringForward, sendBackward, clearSelection } = selectionComposable

const historyComposable = useFabricHistory(canvasComposable)
const { canUndo, canRedo, undo, redo } = historyComposable

const textComposable = useFabricText(canvasComposable, selectionComposable)
const { selectedTextObject, addText, addTextbox, setFontFamily, setFontSize, setTextColor, toggleBold, toggleItalic, toggleUnderline, currentStyle: textStyle } = textComposable

const imageComposable = useFabricImage(canvasComposable, selectionComposable)
const { addImageFromFile } = imageComposable

const shapesComposable = useFabricShapes(canvasComposable, selectionComposable)
const { addRect, addCircle, addTriangle, addStar, addLine, addHexagon, setFillColor, setStrokeColor } = shapesComposable

const touchComposable = useFabricTouch(canvasComposable)
const exportComposable = useFabricExport(canvasComposable)
const { downloadImage, toJSON } = exportComposable

const keyboardComposable = useFabricKeyboard(canvasComposable, selectionComposable, historyComposable, textComposable)

const animationComposable = useFabricAnimation(canvasComposable)
const { entrancePresets, emphasisPresets, exitPresets, previewAnimation, play: playAnimations, isPlaying, currentTime: currentAnimationTime, totalDuration: totalAnimationDuration } = animationComposable

const voiceComposable = useFabricVoice(
  canvasComposable, selectionComposable, historyComposable, 
  textComposable, shapesComposable, imageComposable, animationComposable
)
const { isListening, transcript, feedback, isSpeaking, toggleListening, isSupported: voiceSupported } = voiceComposable

// Tools definition
const tools = [
  { id: 'select', name: 'Select', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>' },
  { id: 'text', name: 'Text', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>' },
  { id: 'draw', name: 'Draw', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>' },
  { id: 'image', name: 'Image', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' }
]

// Shapes definition  
const shapes = [
  { id: 'rect', name: 'Rectangle' },
  { id: 'circle', name: 'Circle' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'star', name: 'Star' },
  { id: 'line', name: 'Line' },
  { id: 'hexagon', name: 'Hexagon' }
]

// Fonts
const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS']

// Computed
const zoomPercent = computed(() => Math.round(zoom.value * 100))

const currentAnimationPresets = computed(() => {
  switch (animationTab.value) {
    case 'entrance': return entrancePresets.value
    case 'emphasis': return emphasisPresets.value
    case 'exit': return exitPresets.value
    default: return entrancePresets.value
  }
})

const canvasObjects = computed(() => {
  if (!canvas.value) return []
  return canvas.value.getObjects().map((obj, i) => ({
    id: (obj as any).id || `obj_${i}`,
    type: obj.type || 'object',
    visible: obj.visible,
    obj
  }))
})

const reversedCanvasObjects = computed(() => [...canvasObjects.value].reverse())

// Object properties
const objectX = ref(0)
const objectY = ref(0)
const objectWidth = ref(100)
const objectHeight = ref(100)
const objectAngle = ref(0)
const objectOpacity = ref(1)
const objectFill = ref('#4A90D9')
const objectStroke = ref('#000000')
const textFont = ref('Arial')
const textSize = ref(24)
const isBold = computed(() => textStyle.value.fontWeight === 'bold')
const isItalic = computed(() => textStyle.value.fontStyle === 'italic')
const isUnderlined = computed(() => textStyle.value.underline)

// Watch active object to update properties
watch(activeObject, (obj) => {
  if (obj) {
    objectX.value = Math.round(obj.left || 0)
    objectY.value = Math.round(obj.top || 0)
    objectWidth.value = Math.round((obj.width || 0) * (obj.scaleX || 1))
    objectHeight.value = Math.round((obj.height || 0) * (obj.scaleY || 1))
    objectAngle.value = Math.round(obj.angle || 0)
    objectOpacity.value = obj.opacity || 1
    objectFill.value = (obj.fill as string) || '#4A90D9'
    objectStroke.value = (obj.stroke as string) || '#000000'
  }
})

watch(selectedTextObject, (obj) => {
  if (obj) {
    textFont.value = (obj.fontFamily as string) || 'Arial'
    textSize.value = (obj.fontSize as number) || 24
  }
})

// Methods
const selectTool = (toolId: string) => {
  activeTool.value = toolId
  if (toolId === 'text') addTextElement()
  else if (toolId === 'image') triggerImageUpload()
}

const addShape = (shapeId: string) => {
  switch (shapeId) {
    case 'rect': addRect(); break
    case 'circle': addCircle(); break
    case 'triangle': addTriangle(); break
    case 'star': addStar(); break
    case 'line': addLine(); break
    case 'hexagon': addHexagon(); break
  }
}

const addTextElement = () => addTextbox('Double-click to edit')
const addHeading = () => addText('Heading', { fontSize: 48, fontWeight: 'bold' })

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

// Object property updates
const updateObjectPosition = () => {
  if (!activeObject.value || !canvas.value) return
  activeObject.value.set({ left: objectX.value, top: objectY.value })
  canvas.value.requestRenderAll()
}

const updateObjectSize = () => {
  if (!activeObject.value || !canvas.value) return
  const scaleX = objectWidth.value / (activeObject.value.width || 1)
  const scaleY = objectHeight.value / (activeObject.value.height || 1)
  activeObject.value.set({ scaleX, scaleY })
  canvas.value.requestRenderAll()
}

const updateObjectAngle = () => {
  if (!activeObject.value || !canvas.value) return
  activeObject.value.set({ angle: objectAngle.value })
  canvas.value.requestRenderAll()
}

const updateObjectOpacity = () => {
  if (!activeObject.value || !canvas.value) return
  activeObject.value.set({ opacity: objectOpacity.value })
  canvas.value.requestRenderAll()
}

const updateObjectFill = () => {
  if (!activeObject.value || !canvas.value) return
  activeObject.value.set({ fill: objectFill.value })
  canvas.value.requestRenderAll()
}

const updateObjectStroke = () => {
  if (!activeObject.value || !canvas.value) return
  activeObject.value.set({ stroke: objectStroke.value })
  canvas.value.requestRenderAll()
}

const updateTextFont = () => setFontFamily(textFont.value)
const updateTextSize = () => setFontSize(textSize.value)

// Toolbar handlers
const handleUndo = () => undo()
const handleRedo = () => redo()
const handleZoomIn = () => setZoom(zoom.value * 1.2)
const handleZoomOut = () => setZoom(zoom.value / 1.2)
const handleResetZoom = () => setZoom(1)
const handleDuplicate = () => duplicateSelected()
const handleDelete = () => deleteSelected()
const handleExport = () => downloadImage('design', { format: 'png' })

// Voice control
const toggleVoice = () => toggleListening()

// Animations
const applyAnimation = (presetId: string) => {
  if (!activeObject.value) return
  previewAnimation(activeObject.value, presetId)
}

const playAllAnimations = () => playAnimations()

// Layer functions
const isObjectSelected = (obj: any) => {
  return activeObject.value === obj.obj
}

const selectLayer = (obj: any) => {
  if (canvas.value) {
    canvas.value.setActiveObject(obj.obj)
    canvas.value.requestRenderAll()
  }
}

const toggleLayerVisibility = (obj: any) => {
  obj.obj.visible = !obj.obj.visible
  canvas.value?.requestRenderAll()
}

const getLayerIcon = (type: string) => {
  const icons: Record<string, string> = {
    'rect': '⬜', 'circle': '⚪', 'triangle': '🔺', 'i-text': 'Aa', 'textbox': 'Aa',
    'image': '🖼', 'path': '〰️', 'polygon': '⬡', 'line': '—'
  }
  return icons[type] || '◇'
}

const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`

// Resize handler
const handleResize = () => {
  if (!containerRef.value || !canvas.value) return
  const rect = containerRef.value.getBoundingClientRect()
  resizeCanvas(rect.width, rect.height)
}

// Initialize
onMounted(() => {
  if (!canvasRef.value || !containerRef.value) return

  canvasComposable.containerRef.value = containerRef.value
  const rect = containerRef.value.getBoundingClientRect()

  canvasComposable.config.value.width = rect.width || props.width
  canvasComposable.config.value.height = rect.height || props.height
  canvasComposable.config.value.backgroundColor = props.backgroundColor

  initCanvas(canvasRef.value, containerRef.value)

  const resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(containerRef.value)

  emit('canvas-ready')

  onUnmounted(() => {
    resizeObserver.disconnect()
    disposeCanvas()
  })
})

// Expose API
defineExpose({
  canvas, addText, addTextbox, addRect, addCircle, addTriangle,
  undo, redo, deleteSelected, duplicateSelected, toJSON, downloadImage
})
</script>

<style scoped>
.advanced-editor {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #0f0f1a;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* Sidebars */
.sidebar {
  width: 260px;
  background: #1a1a2e;
  border-right: 1px solid #2a2a4a;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-sidebar {
  border-right: none;
  border-left: 1px solid #2a2a4a;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid #2a2a4a;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  margin: 0 0 12px 0;
}

/* Tool Grid */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 8px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #303052;
  color: #fff;
}

.tool-btn.active {
  background: #4A90D9;
  border-color: #4A90D9;
  color: #fff;
}

.tool-icon {
  width: 24px;
  height: 24px;
}

.tool-icon svg {
  width: 100%;
  height: 100%;
}

.tool-label {
  font-size: 11px;
}

/* Shape Grid */
.shape-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.shape-btn {
  aspect-ratio: 1;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.shape-btn:hover {
  background: #303052;
  border-color: #4A90D9;
}

.shape-preview {
  width: 24px;
  height: 24px;
}

.shape-preview.rect { background: #4A90D9; border-radius: 2px; }
.shape-preview.circle { background: #4A90D9; border-radius: 50%; }
.shape-preview.triangle { 
  width: 0; height: 0; background: none;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid #4A90D9;
}
.shape-preview.star { color: #4A90D9; font-size: 24px; }
.shape-preview.star::before { content: '★'; }
.shape-preview.line { 
  width: 24px; height: 2px; 
  background: #4A90D9; 
  transform: rotate(-45deg);
}
.shape-preview.hexagon { 
  background: #4A90D9; 
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

/* Action List */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 8px;
  color: #ccc;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #303052;
  color: #fff;
}

.action-btn span:first-child {
  width: 24px;
  text-align: center;
  font-size: 16px;
}

/* Main Canvas Area */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Toolbar */
.top-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1a1a2e;
  border-bottom: 1px solid #2a2a4a;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #3a3a5a;
  margin: 0 8px;
}

.toolbar-spacer {
  flex: 1;
}

.tb-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.tb-btn:hover:not(:disabled) {
  background: #252542;
  color: #fff;
}

.tb-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tb-btn.active {
  background: #4A90D9;
  color: #fff;
}

.tb-btn svg {
  width: 20px;
  height: 20px;
}

.zoom-display {
  min-width: 50px;
  text-align: center;
  font-size: 12px;
  color: #888;
}

/* Voice Button */
.voice-btn.active {
  background: #e74c3c;
  color: #fff;
  animation: pulse-glow 1.5s infinite;
}

.voice-btn.speaking {
  background: #27ae60;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(231, 76, 60, 0.2);
  border-radius: 12px;
  font-size: 12px;
  color: #e74c3c;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #e74c3c;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #4A90D9;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #357ABD;
}

.export-btn svg {
  width: 18px;
  height: 18px;
}

/* Canvas Wrapper */
.canvas-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #252535;
  overflow: hidden;
}

.canvas-wrapper canvas {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Voice Feedback */
.voice-feedback {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.feedback-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.feedback-item.success { border-left: 3px solid #27ae60; }
.feedback-item.error { border-left: 3px solid #e74c3c; }
.feedback-item.info { border-left: 3px solid #3498db; }
.feedback-item.listening { border-left: 3px solid #f39c12; }

.feedback-enter-active, .feedback-leave-active {
  transition: all 0.3s ease;
}

.feedback-enter-from, .feedback-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Timeline Panel */
.timeline-panel {
  background: #1a1a2e;
  border-top: 1px solid #2a2a4a;
  padding: 12px 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tl-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #252542;
  border: none;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
}

.tl-btn:hover {
  background: #303052;
  color: #fff;
}

.tl-btn svg {
  width: 14px;
  height: 14px;
}

.timeline-time {
  font-size: 11px;
  color: #888;
}

.timeline-track {
  background: #252542;
  border-radius: 8px;
  padding: 8px;
}

.timeline-ruler {
  display: flex;
  border-bottom: 1px solid #3a3a5a;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.ruler-mark {
  flex: 1;
  font-size: 10px;
  color: #666;
}

.timeline-objects {
  max-height: 100px;
  overflow-y: auto;
}

.timeline-object-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.object-name {
  width: 80px;
  color: #888;
}

.object-keyframes {
  flex: 1;
  height: 20px;
  background: #1a1a2e;
  border-radius: 4px;
}

/* Right Sidebar Properties */
.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: block;
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  padding: 0 8px;
}

.input-field span {
  font-size: 11px;
  color: #666;
}

.input-field input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  padding: 8px 0;
  outline: none;
}

.property-group input[type="range"] {
  width: 100%;
  margin: 4px 0;
}

.value-display {
  font-size: 11px;
  color: #888;
  text-align: right;
}

.property-group.colors {
  display: flex;
  gap: 12px;
}

.color-field {
  flex: 1;
}

.color-field input[type="color"] {
  width: 100%;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.property-group select {
  width: 100%;
  padding: 8px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  margin-bottom: 8px;
}

.text-format-btns {
  display: flex;
  gap: 4px;
}

.text-format-btns button {
  width: 32px;
  height: 32px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
}

.text-format-btns button:hover {
  background: #303052;
  color: #fff;
}

.text-format-btns button.active {
  background: #4A90D9;
  border-color: #4A90D9;
  color: #fff;
}

/* Animation Section */
.animation-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.animation-tabs button {
  flex: 1;
  padding: 8px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  color: #888;
  font-size: 11px;
  cursor: pointer;
}

.animation-tabs button:hover {
  background: #303052;
  color: #fff;
}

.animation-tabs button.active {
  background: #4A90D9;
  border-color: #4A90D9;
  color: #fff;
}

.animation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.animation-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #252542;
  border: 1px solid #3a3a5a;
  border-radius: 8px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.animation-btn:hover {
  background: #303052;
  border-color: #4A90D9;
  color: #fff;
}

.anim-icon {
  font-size: 20px;
}

.anim-name {
  font-size: 10px;
  text-align: center;
}

.animation-settings {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #3a3a5a;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.setting-row label {
  width: 60px;
  color: #888;
}

.setting-row input {
  flex: 1;
}

.setting-row span {
  width: 50px;
  text-align: right;
  color: #888;
}

/* Layers Section */
.layers-list {
  max-height: 200px;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.layer-item:hover {
  background: #252542;
}

.layer-item.selected {
  background: rgba(74, 144, 217, 0.2);
  border: 1px solid #4A90D9;
}

.layer-icon {
  font-size: 16px;
}

.layer-name {
  flex: 1;
  font-size: 12px;
  color: #ccc;
}

.layer-visibility {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.6;
}

.layer-visibility:hover {
  opacity: 1;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid #333;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Voice Active State */
.advanced-editor.voice-active {
  outline: 2px solid #e74c3c;
  outline-offset: -2px;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .left-sidebar {
    width: 60px;
  }
  
  .tool-label, .section-title {
    display: none;
  }
  
  .tool-grid {
    grid-template-columns: 1fr;
  }
  
  .action-list {
    display: none;
  }
  
  .right-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .advanced-editor {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #2a2a4a;
    overflow-x: auto;
  }
  
  .sidebar-section {
    flex-shrink: 0;
    padding: 8px;
    border-bottom: none;
    border-right: 1px solid #2a2a4a;
  }
  
  .right-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: auto;
    max-height: 40vh;
    border-left: none;
    border-top: 1px solid #2a2a4a;
  }
  
  .timeline-panel {
    display: none;
  }
}
</style>
