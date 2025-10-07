<template>
  <div class="whiteboard-toolbar bg-white border-b border-gray-200 px-3 py-2">
    <div class="flex items-center justify-between">
      <!-- Left side tools -->
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('add-image')"
          class="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <font-awesome-icon icon="images" class="w-3 h-3" />
          <span>Add Image</span>
        </button>
        
        <div class="w-px h-4 bg-gray-300"></div>
        
        <button
          @click="$emit('undo')"
          :disabled="!canUndo"
          class="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
          title="Undo"
        >
          <font-awesome-icon icon="undo" class="w-3 h-3" />
        </button>
        
        <button
          @click="$emit('redo')"
          :disabled="!canRedo"
          class="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
          title="Redo"
        >
          <font-awesome-icon icon="redo" class="w-3 h-3" />
        </button>
        
        <div class="w-px h-4 bg-gray-300"></div>
        
        <button
          @click="$emit('toggle-grid')"
          :class="[
            'p-1 text-xs rounded transition-colors',
            gridEnabled 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          ]"
          title="Toggle Grid"
        >
          <font-awesome-icon icon="th" class="w-3 h-3" />
        </button>
        
        <button
          @click="$emit('toggle-snap')"
          :class="[
            'p-1 text-xs rounded transition-colors',
            snapEnabled 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          ]"
          title="Toggle Snap"
        >
          <font-awesome-icon icon="magnet" class="w-3 h-3" />
        </button>
      </div>

      <!-- Center - Zoom controls -->
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('zoom-out')"
          class="p-1 text-gray-600 hover:text-gray-800"
          title="Zoom Out"
        >
          <font-awesome-icon icon="search-minus" class="w-3 h-3" />
        </button>
        
        <span class="text-xs text-gray-600 min-w-[40px] text-center">
          {{ Math.round(zoom * 100) }}%
        </span>
        
        <button
          @click="$emit('zoom-in')"
          class="p-1 text-gray-600 hover:text-gray-800"
          title="Zoom In"
        >
          <font-awesome-icon icon="search-plus" class="w-3 h-3" />
        </button>
        
        <button
          @click="$emit('fit-stage')"
          class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
          title="Fit to Screen"
        >
          Fit
        </button>
      </div>

      <!-- Right side - Export/Save -->
      <div class="flex items-center space-x-2">
        <div class="relative">
          <button
            @click="showExportMenu = !showExportMenu"
            class="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
          >
            <font-awesome-icon icon="download" class="w-3 h-3" />
            <span>Export</span>
            <font-awesome-icon icon="chevron-down" class="w-2 h-2" />
          </button>
          
          <!-- Export dropdown -->
          <div
            v-if="showExportMenu"
            class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]"
          >
            <button
              @click="exportPNG"
              class="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              Export PNG
            </button>
            <button
              @click="exportJPG"
              class="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              Export JPG
            </button>
          </div>
        </div>
        
        <button
          @click="$emit('save')"
          class="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
        >
          <font-awesome-icon icon="save" class="w-3 h-3" />
          <span>Save</span>
        </button>
        
        <button
          @click="$emit('load')"
          class="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
        >
          <font-awesome-icon icon="folder-open" class="w-3 h-3" />
          <span>Load</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Props
defineProps<{
  zoom: number
  canUndo: boolean
  canRedo: boolean
  gridEnabled: boolean
  snapEnabled: boolean
}>()

// Emits
const emit = defineEmits<{
  'add-image': []
  'zoom-in': []
  'zoom-out': []
  'fit-stage': []
  'undo': []
  'redo': []
  'toggle-grid': []
  'toggle-snap': []
  'export-png': []
  'export-jpg': []
  'save': []
  'load': []
}>()

// Local state
const showExportMenu = ref(false)

// Methods
const exportPNG = () => {
  showExportMenu.value = false
  emit('export-png')
}

const exportJPG = () => {
  showExportMenu.value = false
  emit('export-jpg')
}

// Close dropdown when clicking outside
const handleClickOutside = () => {
  if (showExportMenu.value) {
    showExportMenu.value = false
  }
}

// Lifecycle management for event listeners
onMounted(() => {
  console.log('WhiteboardToolbar mounted')
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom styles for compact toolbar */
.whiteboard-toolbar {
  min-height: 48px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
