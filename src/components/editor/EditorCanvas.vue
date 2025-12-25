<template>
  <div 
    class="canvas-area"
    ref="canvasAreaRef"
    @mousedown="handleAreaMouseDown"
    @touchstart="handleAreaTouchStart"
  >
    <div class="canvas-frame" :style="canvasFrameStyle">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import { 
  useFabricCanvas, 
  useFabricSelection, 
  useFabricHistory, 
  useFabricText, 
  useFabricShapes, 
  useFabricImage, 
  useFabricAnimation,
  useFabricExport,
  ANIMATION_PRESETS
} from '@/composables/fabric'
import type { FabricObject } from 'fabric'

const props = withDefaults(defineProps<{
  width?: number
  height?: number
  backgroundColor?: string
  zoom?: number
}>(), {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  zoom: 1
})

const emit = defineEmits<{
  (e: 'ready', canvas: any): void
  (e: 'selection-change', hasSelection: boolean): void
  (e: 'object-modified'): void
  (e: 'object-selected', obj: FabricObject | null): void
}>()

const canvasAreaRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const canvasFrameStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  transform: `scale(${props.zoom})`,
}))

// Initialize composables
const canvasComposable = useFabricCanvas()
const { canvas, initCanvas, disposeCanvas, setZoom } = canvasComposable

const selectionComposable = useFabricSelection(canvasComposable)
const { 
  selectedObjects, 
  activeObject, 
  hasSelection, 
  deleteSelected, 
  duplicateSelected, 
  bringForward, 
  sendBackward,
  clearSelection 
} = selectionComposable

const historyComposable = useFabricHistory(canvasComposable)
const { canUndo, canRedo, undo: historyUndo, redo: historyRedo } = historyComposable

const textComposable = useFabricText(canvasComposable, selectionComposable)
const { 
  selectedTextObject, 
  addText: addTextbox, 
  setFontFamily, 
  setFontSize, 
  setTextColor, 
  toggleBold: textToggleBold, 
  toggleItalic: textToggleItalic, 
  toggleUnderline: textToggleUnderline 
} = textComposable

const shapesComposable = useFabricShapes(canvasComposable, selectionComposable)
const { addRect, addCircle, addTriangle, addStar, addLine, addHexagon, setFillColor, setStrokeColor } = shapesComposable

const imageComposable = useFabricImage(canvasComposable, selectionComposable)
const { addImageFromFile, addImageFromURL } = imageComposable

const animationComposable = useFabricAnimation(canvasComposable)
const { 
  previewAnimation, 
  play: playAllAnimations, 
  stop: stopAllAnimations, 
  removeAnimation,
  addAnimation,
  animateObject
} = animationComposable

const exportComposable = useFabricExport(canvasComposable)
const { downloadImage: exportDownload, toDataURL: exportToDataURL, toJSON } = exportComposable

// Clipboard for copy/paste
let clipboard: FabricObject | null = null

// Initialize canvas on mount
const setupCanvas = () => {
  if (!canvasRef.value) return

  initCanvas(canvasRef.value, canvasAreaRef.value || undefined)

  if (canvas.value) {
    // Set canvas dimensions
    canvas.value.setWidth(props.width)
    canvas.value.setHeight(props.height)
    if (props.backgroundColor) {
      canvas.value.backgroundColor = props.backgroundColor
    }

    // Selection events
    canvas.value.on('selection:created', (e: any) => {
      emit('selection-change', true)
      emit('object-selected', e.selected?.[0] || null)
    })
    canvas.value.on('selection:updated', (e: any) => {
      emit('selection-change', true)
      emit('object-selected', e.selected?.[0] || null)
    })
    canvas.value.on('selection:cleared', () => {
      emit('selection-change', false)
      emit('object-selected', null)
    })
    canvas.value.on('object:modified', () => emit('object-modified'))

    emit('ready', canvas.value)
  }
}

// Handle mouse down outside canvas to deselect
const handleAreaMouseDown = (e: MouseEvent) => {
  if (!canvas.value) return
  const target = e.target as HTMLElement
  if (target === canvasAreaRef.value) {
    clearSelection()
  }
}

const handleAreaTouchStart = (e: TouchEvent) => {
  if (!canvas.value) return
  const target = e.target as HTMLElement
  if (target === canvasAreaRef.value) {
    clearSelection()
  }
}

// Public methods
const addText = (text = 'Double-click to edit') => {
  addTextbox(text, {
    left: props.width / 2 - 100,
    top: props.height / 2 - 20,
    width: 200,
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#333333',
  })
}

const addShape = (type: string) => {
  const centerX = props.width / 2 - 50
  const centerY = props.height / 2 - 50

  switch (type) {
    case 'rect':
      addRect({ left: centerX, top: centerY, width: 100, height: 100, fill: '#6366f1', rx: 8, ry: 8 })
      break
    case 'circle':
      addCircle({ left: centerX, top: centerY, radius: 50, fill: '#8b5cf6' })
      break
    case 'triangle':
      addTriangle({ left: centerX, top: centerY, width: 100, height: 100, fill: '#ec4899' })
      break
    case 'star':
      addStar(5, 50, 25, { left: centerX, top: centerY, fill: '#f59e0b' })
      break
    case 'hexagon':
      addHexagon(50, { left: centerX, top: centerY, fill: '#10b981' })
      break
    case 'line':
      addLine([centerX, centerY + 50, centerX + 100, centerY + 50], { stroke: '#333333', strokeWidth: 3 })
      break
  }
}

const addImage = async (file: File) => {
  await addImageFromFile(file)
}

const undo = () => {
  historyUndo()
}

const redo = () => {
  historyRedo()
}

const copy = () => {
  if (!canvas.value) return
  const active = canvas.value.getActiveObject()
  if (!active) return
  active.clone().then((cloned: FabricObject) => {
    clipboard = cloned
  })
}

const paste = () => {
  if (!canvas.value || !clipboard) return
  clipboard.clone().then((cloned: FabricObject) => {
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20,
    })
    canvas.value?.add(cloned)
    canvas.value?.setActiveObject(cloned)
    canvas.value?.renderAll()
  })
}

const cut = () => {
  copy()
  deleteSelected()
}

const duplicate = () => {
  duplicateSelected()
}

const selectAll = () => {
  if (!canvas.value) return
  canvas.value.discardActiveObject()
  const objects = canvas.value.getObjects()
  if (objects.length > 0) {
    // Use fabric's ActiveSelection
    const ActiveSelection = (canvas.value as any).constructor.util?.classRegistry?.getClass('ActiveSelection') 
      || (window as any).fabric?.ActiveSelection
    if (ActiveSelection) {
      const selection = new ActiveSelection(objects, { canvas: canvas.value })
      canvas.value.setActiveObject(selection)
      canvas.value.renderAll()
    }
  }
}

const toggleBold = () => {
  textToggleBold()
}

const toggleItalic = () => {
  textToggleItalic()
}

const toggleUnderline = () => {
  textToggleUnderline()
}

// Animation methods
const applyAnimation = (presetId: string, options?: { duration?: number; delay?: number }) => {
  if (!activeObject.value) {
    console.warn('No active object to animate')
    return
  }
  console.log('Applying animation:', presetId, 'to object:', activeObject.value)
  previewAnimation(activeObject.value, presetId)
}

const previewAnimations = () => {
  playAllAnimations()
}

const stopAnimations = () => {
  stopAllAnimations()
}

const removeObjectAnimation = () => {
  // Clear animations from current object if any
  if (!activeObject.value) return
  const objId = (activeObject.value as any).id
  if (objId) {
    removeAnimation(objId)
  }
}

// Update selected object property
const updateSelectedProperty = (property: string, value: any) => {
  if (!canvas.value) return
  const active = canvas.value.getActiveObject()
  if (active) {
    active.set(property as keyof FabricObject, value)
    canvas.value.renderAll()
  }
}

// Get selected object
const getSelectedObject = () => {
  if (!canvas.value) return null
  return canvas.value.getActiveObject()
}

const toDataURL = (format = 'png', quality = 1) => {
  return exportToDataURL({ format: format as 'png' | 'jpeg', quality })
}

const downloadImage = (filename = 'design', format = 'png') => {
  exportDownload(filename, { format: format as 'png' | 'jpeg' })
}

// Watch for zoom changes
watch(() => props.zoom, (newZoom) => {
  setZoom(newZoom)
})

onMounted(() => {
  setupCanvas()
})

onUnmounted(() => {
  disposeCanvas()
})

defineExpose({
  canvas,
  canvasComposable,
  selectionComposable,
  historyComposable,
  textComposable,
  shapesComposable,
  imageComposable,
  animationComposable,
  exportComposable,
  addText,
  addShape,
  addImage,
  undo,
  redo,
  canUndo,
  canRedo,
  deleteSelected,
  duplicateSelected,
  duplicate,
  selectAll,
  copy,
  paste,
  cut,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  bringForward,
  sendBackward,
  applyAnimation,
  previewAnimations,
  stopAnimations,
  removeAnimation: removeObjectAnimation,
  setFontFamily,
  setFontSize,
  setTextColor,
  setFillColor,
  setStrokeColor,
  toDataURL,
  downloadImage,
  updateSelectedProperty,
  getSelectedObject,
  hasSelection,
  activeObject,
  selectedTextObject,
})
</script>

<style scoped>
.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  overflow: auto;
  padding: 40px;
  position: relative;
  min-height: 0;
}

.canvas-frame {
  background: #ffffff;
  flex-shrink: 0;
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  animation: canvasAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  max-width: 100%;
  max-height: 100%;
}

@keyframes canvasAppear {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.canvas-frame::before {
  content: '';
  position: absolute;
  inset: -1px;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  pointer-events: none;
}

.canvas-frame canvas {
  display: block;
  border-radius: 1px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .canvas-area {
    padding: 16px;
    align-items: flex-start;
    padding-top: 20px;
  }

  .canvas-frame {
    transform-origin: top center;
  }
}

@media (max-width: 480px) {
  .canvas-area {
    padding: 10px;
    padding-top: 16px;
  }
}

/* Touch-friendly for mobile */
@media (pointer: coarse) {
  .canvas-area {
    touch-action: pan-x pan-y pinch-zoom;
  }
}
</style>
