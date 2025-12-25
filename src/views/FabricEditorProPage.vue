<template>
  <div class="editor-page">
    <!-- Sidebar -->
    <EditorSidebar
      :is-open="sidebarOpen"
      @close="sidebarOpen = false"
      @add-text="addText"
      @add-shape="addShape"
      @add-image="triggerImageUpload"
      @show-shortcuts="showShortcutsModal = true"
      @show-animations="showAnimationPanel = true"
    />

    <!-- Sidebar Overlay (Mobile) -->
    <Transition name="fade">
      <div 
        v-if="sidebarOpen && isMobile" 
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      ></div>
    </Transition>

    <!-- Main Content -->
    <div class="editor-main" :class="{ 
      'sidebar-open': sidebarOpen && !isMobile,
      'panel-open': showPropertiesPanel || showAnimationPanel 
    }">
      <!-- Header -->
      <EditorHeader
        :project-name="projectName"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :zoom-percent="zoomPercent"
        :show-grid="showGrid"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @undo="undo"
        @redo="redo"
        @add-text="addText"
        @add-image="triggerImageUpload"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @reset-zoom="resetZoom"
        @toggle-grid="toggleGrid"
        @show-shortcuts="showShortcutsModal = true"
        @export="exportDesign"
      >
        <!-- Voice Control Slot -->
        <template #voice-control>
          <VoiceControlPanel
            :is-listening="voiceState.isListening"
            :is-supported="voiceState.isSupported"
            :transcript="voiceState.transcript"
            :feedback="voiceState.feedback"
            :is-speaking="voiceState.isSpeaking"
            @toggle="toggleVoice"
          />
        </template>
      </EditorHeader>

      <!-- Canvas -->
      <EditorCanvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        :zoom="zoom"
        @ready="onCanvasReady"
        @selection-change="onSelectionChange"
        @object-selected="onObjectSelected"
      />
    </div>

    <!-- Properties Panel (Right Side / Bottom on Mobile) -->
    <PropertiesPanel
      :is-visible="showPropertiesPanel && !!selectedObject && !showAnimationPanel"
      :selected-object="selectedObject"
      :is-mobile="isMobile"
      @close="showPropertiesPanel = false"
      @update="updateObjectProperty"
      @duplicate="duplicateSelected"
      @delete="deleteSelected"
    />

    <!-- Advanced Animation Panel (Right Side / Bottom on Mobile) -->
    <AdvancedAnimationPanel
      :is-visible="showAnimationPanel"
      :selected-object="selectedObject"
      :is-mobile="isMobile"
      @close="showAnimationPanel = false"
      @apply="applyAnimation"
      @preview="previewAnimation"
      @remove="removeAnimationAtIndex"
      @removeAll="removeAllAnimations"
      @playAll="playAllAnimations"
      @stopAll="stopAllAnimations"
    />

    <!-- Hidden File Input -->
    <input 
      type="file" 
      ref="fileInput" 
      @change="handleFileUpload" 
      accept="image/*" 
      style="display: none"
    />

    <!-- Shortcuts Modal -->
    <ShortcutsModal 
      :is-open="showShortcutsModal"
      @close="showShortcutsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { EditorSidebar, EditorHeader, EditorCanvas, ShortcutsModal, PropertiesPanel, AdvancedAnimationPanel, VoiceControlPanel } from '@/components/editor'
import { useEditorShortcuts } from '@/composables/useEditorShortcuts'
import { useFabricVoice, ANIMATION_PRESETS } from '@/composables/fabric'
import type { Canvas } from 'fabric'

// Refs
const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// State
const sidebarOpen = ref(true)
const isMobile = ref(false)
const projectName = ref('Untitled Design')
const canUndo = ref(false)
const canRedo = ref(false)
const showGrid = ref(false)
const zoom = ref(1)
const hasSelection = ref(false)
const showShortcutsModal = ref(false)
const showPropertiesPanel = ref(true)
const showAnimationPanel = ref(false)
const selectedObject = ref<any>(null)

// Voice state
const voiceState = reactive({
  isListening: false,
  isSupported: false,
  transcript: '',
  feedback: [] as any[],
  isSpeaking: false
})

// Voice composable reference (initialized after canvas ready)
let voiceComposable: ReturnType<typeof useFabricVoice> | null = null

// Canvas dimensions
const canvasWidth = ref(800)
const canvasHeight = ref(600)

// Computed
const zoomPercent = computed(() => Math.round(zoom.value * 100))

// Canvas event handlers
const onCanvasReady = (canvas: Canvas) => {
  console.log('Canvas ready:', canvas)
  
  // Initialize voice control with canvas composables
  if (canvasRef.value) {
    console.log('Canvas ref available, initializing voice control')
    
    const { 
      canvasComposable, 
      selectionComposable, 
      historyComposable, 
      textComposable, 
      shapesComposable, 
      imageComposable,
      animationComposable 
    } = canvasRef.value
    
    console.log('Composables:', { canvasComposable, selectionComposable, animationComposable })
    
    voiceComposable = useFabricVoice(
      canvasComposable,
      selectionComposable,
      historyComposable,
      textComposable,
      shapesComposable,
      imageComposable,
      animationComposable
    )
    
    // Sync voice state
    voiceState.isSupported = voiceComposable.isSupported.value
    console.log('Voice supported:', voiceState.isSupported)
    
    // Watch voice composable state changes
    watch(() => voiceComposable?.isListening.value, (val) => {
      voiceState.isListening = val || false
    })
    watch(() => voiceComposable?.transcript.value, (val) => {
      voiceState.transcript = val || ''
    })
    watch(() => voiceComposable?.feedback.value, (val) => {
      voiceState.feedback = val || []
    }, { deep: true })
    watch(() => voiceComposable?.isSpeaking.value, (val) => {
      voiceState.isSpeaking = val || false
    })
  } else {
    console.warn('Canvas ref not available')
  }
}

const onSelectionChange = (selected: boolean) => {
  hasSelection.value = selected
  if (!selected) {
    selectedObject.value = null
  }
}

const onObjectSelected = (obj: any) => {
  selectedObject.value = obj
  showPropertiesPanel.value = true
}

// Update object property from Properties Panel
const updateObjectProperty = (property: string, value: any) => {
  if (canvasRef.value) {
    canvasRef.value.updateSelectedProperty(property, value)
  }
}

// Map AnimationPanel ids to composable preset ids
const getPresetId = (animationId: string): string => {
  const idMap: Record<string, string> = {
    // Entrance
    'fadeIn': 'fade-in',
    'slideUp': 'slide-up',
    'slideDown': 'slide-down',
    'slideLeft': 'slide-left',
    'slideRight': 'slide-right',
    'zoomIn': 'zoom-in',
    'bounceIn': 'bounce-in',
    'flipIn': 'flip-in',
    'rotateIn': 'rotate-in',
    'expandIn': 'zoom-in',
    'dropIn': 'slide-down',
    'wipeIn': 'fade-in',
    'pop': 'pop',
    // Emphasis
    'pulse': 'pulse',
    'bounce': 'bounce-in',
    'shake': 'shake',
    'swing': 'wiggle',
    'tada': 'pulse',
    'wobble': 'wiggle',
    'jello': 'rubber-band',
    'heartbeat': 'pulse',
    'flash': 'flash',
    'rubberBand': 'rubber-band',
    'spin': 'rotate-in',
    'float': 'float',
    'wiggle': 'wiggle',
    // Exit
    'fadeOut': 'fade-out',
    'slideOutUp': 'slide-out-up',
    'slideOutDown': 'slide-out-down',
    'slideOutLeft': 'slide-out-up',
    'slideOutRight': 'slide-out-down',
    'zoomOut': 'zoom-out',
    'bounceOut': 'zoom-out',
    'flipOut': 'flip-in',
    'rotateOut': 'rotate-in',
    'shrinkOut': 'shrink',
    'rollOut': 'rotate-in',
    'hinge': 'fade-out'
  }
  return idMap[animationId] || animationId
}

// Preview animation on canvas (live preview while adjusting settings)
const previewAnimation = (animation: any) => {
  if (!canvasRef.value || !selectedObject.value) return
  
  const presetId = animation.id
  const duration = (animation.settings?.duration || 0.5) * 1000
  const delay = (animation.settings?.delay || 0) * 1000
  
  canvasRef.value.applyAnimation(presetId, { duration, delay })
}

// Apply animation to selected object using canvas composable
const applyAnimation = (animation: any) => {
  if (!canvasRef.value || !selectedObject.value) return
  
  const presetId = animation.id
  const duration = (animation.settings?.duration || 0.5) * 1000
  const delay = (animation.settings?.delay || 0) * 1000
  
  // Use the canvas's applyAnimation method which uses the composable
  canvasRef.value.applyAnimation(presetId, { duration, delay })
}

// Remove animation at specific index
const removeAnimationAtIndex = (index: number) => {
  // Currently just clears animations from object
  if (canvasRef.value) {
    canvasRef.value.removeAnimation()
  }
}

// Remove all animations from selected object
const removeAllAnimations = () => {
  if (canvasRef.value) {
    canvasRef.value.removeAnimation()
  }
}

// Play all animations (preview all)
const playAllAnimations = () => {
  if (canvasRef.value) {
    canvasRef.value.previewAnimations()
  }
}

// Stop all animations
const stopAllAnimations = () => {
  if (canvasRef.value) {
    canvasRef.value.stopAnimations()
  }
}

// Remove animation from selected object (legacy)
const removeAnimation = () => {
  if (canvasRef.value) {
    canvasRef.value.removeAnimation()
  }
}

// Voice control
const toggleVoice = () => {
  if (voiceComposable) {
    voiceComposable.toggleListening()
  }
}

// Duplicate selected object
const duplicateSelected = () => {
  canvasRef.value?.duplicate()
}

// Actions
const addText = () => {
  canvasRef.value?.addText()
  if (isMobile.value) sidebarOpen.value = false
}

const addShape = (type: string) => {
  canvasRef.value?.addShape(type)
  if (isMobile.value) sidebarOpen.value = false
}

const triggerImageUpload = () => {
  fileInput.value?.click()
  if (isMobile.value) sidebarOpen.value = false
}

const handleFileUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    await canvasRef.value?.addImage(file)
  }
  if (fileInput.value) fileInput.value.value = ''
}

const undo = () => {
  canvasRef.value?.undo()
}

const redo = () => {
  canvasRef.value?.redo()
}

const zoomIn = () => {
  zoom.value = Math.min(3, zoom.value * 1.2)
}

const zoomOut = () => {
  zoom.value = Math.max(0.25, zoom.value / 1.2)
}

const resetZoom = () => {
  zoom.value = 1
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const exportDesign = () => {
  canvasRef.value?.downloadImage('my-design', 'png')
}

const deleteSelected = () => {
  canvasRef.value?.deleteSelected()
}

const selectAll = () => {
  canvasRef.value?.selectAll()
}

const duplicate = () => {
  canvasRef.value?.duplicate()
}

const copySelected = () => {
  canvasRef.value?.copy()
}

const pasteClipboard = () => {
  canvasRef.value?.paste()
}

const cutSelected = () => {
  canvasRef.value?.cut()
}

const toggleBold = () => {
  canvasRef.value?.toggleBold()
}

const toggleItalic = () => {
  canvasRef.value?.toggleItalic()
}

const toggleUnderline = () => {
  canvasRef.value?.toggleUnderline()
}

// Register keyboard shortcuts
useEditorShortcuts({
  undo,
  redo,
  delete: deleteSelected,
  selectAll,
  duplicate,
  copy: copySelected,
  paste: pasteClipboard,
  cut: cutSelected,
  bold: toggleBold,
  italic: toggleItalic,
  underline: toggleUnderline,
  zoomIn,
  zoomOut,
  toggleGrid,
  showHelp: () => { showShortcutsModal.value = true },
  exportDesign
})

// Handle responsive
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    sidebarOpen.value = false
    // Auto-scale zoom to fit canvas on mobile
    autoFitZoom()
  }
}

// Auto-fit zoom for mobile
const autoFitZoom = () => {
  const viewportWidth = window.innerWidth - 32 // padding
  const viewportHeight = window.innerHeight - 120 // header height + padding
  
  const scaleX = viewportWidth / canvasWidth.value
  const scaleY = viewportHeight / canvasHeight.value
  
  // Use the smaller scale to fit the canvas
  const fitScale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 100%
  zoom.value = Math.max(0.3, Math.min(fitScale, 1)) // Clamp between 30% and 100%
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: #f5f5f5;
  overflow: hidden;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.25s ease;
  overflow: hidden;
}

.editor-main.sidebar-open {
  margin-left: 240px;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .editor-page {
    flex-direction: column;
  }

  .editor-main {
    flex: 1;
    min-height: 0;
  }

  .editor-main.sidebar-open {
    margin-left: 0;
  }

  .editor-main.panel-open {
    /* Reduce height when panel is showing at bottom */
    flex: 0 0 auto;
    height: calc(100dvh - 380px);
  }
}

@media (max-width: 480px) {
  .editor-main.panel-open {
    height: calc(100dvh - 340px);
  }
}

@supports (padding: env(safe-area-inset-top)) {
  .editor-page {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
