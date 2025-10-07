<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Left Sidebar -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      :active-tab="store.activeTab"
      :assets="store.sampleAssets"
      :color-palette="store.colorPalette"
      @toggle-sidebar="handleToggleSidebar"
      @change-tab="handleChangeTab"
      @add-image="handleAddImage"
      @add-text="handleAddText"
      @add-shape="handleAddShape"
      @select-color="handleSelectColor"
      @add-styled-text="handleAddStyledText"
      @apply-filters="handleApplyFilters"
      @apply-crop="handleApplyCrop"
      @add-cropped-image="handleAddCroppedImage"
    />

    <!-- AI Retouch Components -->
    <RetouchButton
      @one-click-retouch="handleOneClickRetouch"
      @color-suggestions="handleColorSuggestions"
      @layout-optimization="handleLayoutOptimization"
    />
    <AIRetouchPanel
      @one-click-retouch="handleOneClickRetouch"
      @color-suggestions="handleColorSuggestions"
      @layout-optimization="handleLayoutOptimization"
      @font-suggestions="handleFontSuggestions"
    />
    <BeforeAfterPreview />
    <AILoadingIndicator
      :is-visible="aiRetouchStore.isProcessing"
      :title="'AI Processing'"
      :message="'Analyzing your design...'"
    />

      <!-- Top Toolbar -->
      <Toolbar
        :can-undo="store.canUndo"
        :can-redo="store.canRedo"
        :zoom="store.zoom"
        @new-design="handleNewDesign"
        @save="handleSave"
        @undo="store.undo"
        @redo="store.redo"
        @zoom-change="store.zoom = $event"
        @export="handleExport"
      />
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">

      
      <div class="flex-1 flex flex-col">
        <WhiteboardCanvas
          ref="whiteboardRef"
          key="main-whiteboard"
          :width="500"
          :height="700"
          background-color="#ffffff"
          :grid-size="20"
          @text-edit-start="handleTextEditStart"
          @text-edit-commit="handleTextEditCommit"
          @text-edit-cancel="handleTextEditCancel"
          @text-selected="handleTextSelected"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useAIRetouchStore } from '@/stores/ai-retouch'
import { logger } from '@/utils/logger'

// Components
import Sidebar from './Sidebar.vue'
import Toolbar from './Toolbar.vue'
import WhiteboardCanvas from './WhiteboardCanvas.vue'
import RetouchButton from './ai-retouch/RetouchButton.vue'
import AIRetouchPanel from './ai-retouch/AIRetouchPanel.vue'
import BeforeAfterPreview from './ai-retouch/BeforeAfterPreview.vue'
import AILoadingIndicator from './ai-retouch/AILoadingIndicator.vue'

const store = useEditorStore()
const aiRetouchStore = useAIRetouchStore()

// Refs
const whiteboardRef = ref<InstanceType<typeof WhiteboardCanvas> | null>(null)
const sidebarCollapsed = ref(false)

// Lifecycle
onMounted(() => {
  logger.debug('DesignEditor mounted, activeTab:', store.activeTab)
  store.loadFromStorage()
})

onUnmounted(() => {
  // Cleanup if needed
})

// Simple event handlers for sidebar compatibility
function handleToggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  logger.debug('Sidebar toggled, collapsed:', sidebarCollapsed.value)
}

function handleChangeTab(tabId: string) {
  store.activeTab = tabId as typeof store.activeTab
}

function handleAddImage(asset: any) {
  // Add template image to the whiteboard
  logger.debug('DesignEditor: Adding image from', asset.type || 'template', asset.name)
  whiteboardRef.value?.addImageFromUrl(asset)
}

function handleAddText() {
  // Add text to the whiteboard
  whiteboardRef.value?.addText()
}

function handleAddShape(shapeType: string) {
  // Add shape to the whiteboard
  logger.debug('DesignEditor: Adding shape:', shapeType)
  whiteboardRef.value?.addShape?.(shapeType)
}

function handleSelectColor(color: string) {
  // Apply color to selected object or set as default
  logger.debug('DesignEditor: Selected color:', color)
  whiteboardRef.value?.applyColor?.(color)
}

function handleAddStyledText(style: any) {
  // Add styled text to the whiteboard
  logger.debug('DesignEditor: Adding styled text:', style)
  whiteboardRef.value?.addText?.(style.name, style.style)
}

function handleApplyFilters(filters: any) {
  // Apply filters to selected image on canvas
  logger.debug('DesignEditor: Applying filters:', filters)
  whiteboardRef.value?.applyFilters?.(filters)
}

function handleApplyCrop(dimensions: any) {
  // Apply crop to selected image on canvas
  logger.debug('DesignEditor: Applying crop:', dimensions)
  whiteboardRef.value?.applyCrop?.(dimensions)
}

function handleAddCroppedImage(imageData: Blob | string) {
  // Add cropped image to canvas
  logger.debug('DesignEditor: Adding cropped image')
  whiteboardRef.value?.addCroppedImage?.(imageData)
}

function handleNewDesign() {
  if (confirm('Are you sure you want to create a new design? All unsaved changes will be lost.')) {
    // Clear whiteboard
    if (whiteboardRef.value) {
      whiteboardRef.value.clearSelection()
    }
  }
}

function handleSave() {
  // Save whiteboard
  if (whiteboardRef.value) {
    whiteboardRef.value.saveToJSON()
  }
}

function handleExport() {
  // Export whiteboard
  if (whiteboardRef.value) {
    whiteboardRef.value.exportToPNG()
  }
}

// Text editing event handlers
function handleTextEditStart(event: { id: string, initialText: string }) {
  logger.debug('Text edit started:', event)
}

function handleTextEditCommit(event: { id: string, newText: string }) {
  logger.debug('Text edit committed:', event)
}

function handleTextEditCancel(event: { id: string }) {
  logger.debug('Text edit cancelled:', event)
}

function handleTextSelected(event: { id: string }) {
  logger.debug('Text selected:', event)
}

// AI Retouch Handlers
async function handleOneClickRetouch() {
  try {
    // Get current design data from whiteboard
    const designData = {
      elements: [], // TODO: Get from whiteboard
      canvasSize: { width: 500, height: 700 },
      backgroundColor: '#ffffff'
    }

    await aiRetouchStore.applyOneClickRetouch(designData)
  } catch (error) {
    logger.error('One-click retouch failed:', error)
  }
}

async function handleColorSuggestions() {
  try {
    // Extract colors from current design
    const colors = ['#667eea', '#764ba2'] // TODO: Extract from whiteboard
    await aiRetouchStore.getColorPaletteSuggestions(colors)
    aiRetouchStore.openPanel()
  } catch (error) {
    logger.error('Color suggestions failed:', error)
  }
}

async function handleLayoutOptimization() {
  try {
    // Get elements from whiteboard
    const elements = [] // TODO: Get from whiteboard
    const canvasSize = { width: 500, height: 700 }

    await aiRetouchStore.optimizeDesignLayout(elements, canvasSize)
    aiRetouchStore.openPanel()
  } catch (error) {
    logger.error('Layout optimization failed:', error)
  }
}

async function handleFontSuggestions() {
  try {
    // Get current fonts from design
    const currentFonts = ['Arial'] // TODO: Extract from whiteboard
    await aiRetouchStore.getFontPairingSuggestions(currentFonts)
  } catch (error) {
    logger.error('Font suggestions failed:', error)
  }
}
</script>
