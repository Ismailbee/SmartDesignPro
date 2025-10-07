import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface WhiteboardImage {
  id: string | number
  x: number
  y: number
  width: number
  height: number
  scaleX: number
  scaleY: number
  rotation: number
  src: string
  name?: string
  visible?: boolean
  locked?: boolean
  zIndex?: number
  image?: HTMLImageElement
  draggable?: boolean
}

export interface WhiteboardText {
  id: string | number
  x: number
  y: number
  width?: number  // Optional - Konva auto-calculates if not set
  height?: number // Optional - Konva auto-calculates if not set
  scaleX: number
  scaleY: number
  rotation: number
  text: string
  fontSize: number
  fontFamily: string
  fill: string
  align: string
  name?: string
  visible?: boolean
  locked?: boolean
  zIndex?: number
  draggable?: boolean
}

export const useWhiteboardStore = defineStore('whiteboard', () => {
  // State
  const images = ref<WhiteboardImage[]>([])
  const texts = ref<WhiteboardText[]>([])
  const history = ref<{ images: WhiteboardImage[], texts: WhiteboardText[] }[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50
  const stageConfig = ref({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
  })

  // Computed
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Helper to create state snapshot
  const createSnapshot = (): { images: WhiteboardImage[], texts: WhiteboardText[] } => {
    return {
      images: JSON.parse(JSON.stringify(images.value.map(img => ({
        ...img,
        image: undefined // Don't store image object in history
      })))),
      texts: JSON.parse(JSON.stringify(texts.value))
    }
  }

  // Helper to save state to history
  const saveToHistory = () => {
    // Remove any history after current index (when undoing then making new changes)
    history.value = history.value.slice(0, historyIndex.value + 1)
    
    // Add new snapshot
    history.value.push(createSnapshot())
    historyIndex.value = history.value.length - 1
    
    // Limit history size
    if (history.value.length > maxHistorySize) {
      history.value.shift()
      historyIndex.value--
    }
  }

  // Actions
  const addImage = (imageObj: WhiteboardImage) => {
    images.value.push(imageObj)
    saveToHistory()
  }

  const removeImage = (id: string | number) => {
    const index = images.value.findIndex(img => img.id === id)
    if (index !== -1) {
      images.value.splice(index, 1)
      saveToHistory()
    }
  }

  const updateImage = (id: string | number, updates: Partial<WhiteboardImage>) => {
    const image = images.value.find(img => img.id === id)
    if (image) {
      Object.assign(image, updates)
      // Don't save to history for every small transform change
      // History is saved on transformend/dragend events
    }
  }

  const updateImageWithHistory = (id: string | number, updates: Partial<WhiteboardImage>) => {
    updateImage(id, updates)
    saveToHistory()
  }

  const clearImages = () => {
    images.value = []
    saveToHistory()
  }

  // Text actions
  const addText = (textObj: WhiteboardText) => {
    texts.value.push(textObj)
    saveToHistory()
  }

  const removeText = (id: string | number) => {
    const index = texts.value.findIndex(text => text.id === id)
    if (index !== -1) {
      texts.value.splice(index, 1)
      saveToHistory()
    }
  }

  const updateText = (id: string | number, updates: Partial<WhiteboardText>) => {
    const text = texts.value.find(t => t.id === id)
    if (text) {
      Object.assign(text, updates)
    }
  }

  const updateTextWithHistory = (id: string | number, updates: Partial<WhiteboardText>) => {
    updateText(id, updates)
    saveToHistory()
  }

  const clearTexts = () => {
    texts.value = []
    saveToHistory()
  }

  const undo = () => {
    if (!canUndo.value) return

    historyIndex.value--
    const snapshot = history.value[historyIndex.value]

    // Restore images (need to reload image objects)
    images.value = snapshot.images.map(imgData => ({
      ...imgData,
      image: undefined // Will be restored by component
    }))

    // Restore texts
    texts.value = [...snapshot.texts]
  }

  const redo = () => {
    if (!canRedo.value) return

    historyIndex.value++
    const snapshot = history.value[historyIndex.value]

    // Restore images
    images.value = snapshot.images.map(imgData => ({
      ...imgData,
      image: undefined // Will be restored by component
    }))

    // Restore texts
    texts.value = [...snapshot.texts]
  }

  const setImages = (newImages: WhiteboardImage[]) => {
    images.value = newImages
    saveToHistory()
  }

  const updateStageConfig = (config: Partial<typeof stageConfig.value>) => {
    Object.assign(stageConfig.value, config)
  }

  // Initialize with empty history
  if (history.value.length === 0) {
    saveToHistory()
  }

  return {
    // State
    images,
    texts,
    stageConfig,

    // Computed
    canUndo,
    canRedo,

    // Actions
    addImage,
    removeImage,
    updateImage,
    updateImageWithHistory,
    clearImages,
    addText,
    removeText,
    updateText,
    updateTextWithHistory,
    clearTexts,
    undo,
    redo,
    setImages,
    updateStageConfig
  }
})
