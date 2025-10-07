<template>
  <div class="canvas-toolbar">
    <div class="toolbar-section">
      <button @click="$emit('add-image')" class="toolbar-btn">
        <font-awesome-icon icon="images" class="w-3 h-3" />
        <span class="btn-text">Add Image</span>
      </button>
      
      <button @click="$emit('add-image-url')" class="toolbar-btn">
        <font-awesome-icon icon="folder-open" class="w-3 h-3" />
        <span class="btn-text">Add URL</span>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button @click="$emit('undo')" :disabled="!canUndo" class="toolbar-btn">
        <font-awesome-icon icon="undo" class="w-3 h-3" />
        <span class="btn-text">Undo</span>
      </button>
      
      <button @click="$emit('redo')" :disabled="!canRedo" class="toolbar-btn">
        <font-awesome-icon icon="redo" class="w-3 h-3" />
        <span class="btn-text">Redo</span>
      </button>
    </div>

    <div class="toolbar-section">
      <button @click="$emit('zoom-out')" class="toolbar-btn">
        <font-awesome-icon icon="search-minus" class="w-3 h-3" />
      </button>
      
      <div class="zoom-display">{{ Math.round(zoom * 100) }}%</div>
      
      <button @click="$emit('zoom-in')" class="toolbar-btn">
        <font-awesome-icon icon="search-plus" class="w-3 h-3" />
      </button>
      
      <button @click="$emit('fit-stage')" class="toolbar-btn">
        <font-awesome-icon icon="th" class="w-3 h-3" />
        <span class="btn-text">Fit</span>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button 
        @click="$emit('toggle-grid')" 
        :class="['toolbar-btn', { active: gridEnabled }]"
      >
        <font-awesome-icon icon="th" class="w-3 h-3" />
        <span class="btn-text">Grid</span>
      </button>
      
      <button 
        @click="$emit('toggle-snap')" 
        :class="['toolbar-btn', { active: snapEnabled }]"
      >
        <font-awesome-icon icon="magnet" class="w-3 h-3" />
        <span class="btn-text">Snap</span>
      </button>
    </div>

    <div class="toolbar-section">
      <div class="dropdown" ref="exportDropdown">
        <button @click="toggleExportMenu" class="toolbar-btn">
          <font-awesome-icon icon="download" class="w-3 h-3" />
          <span class="btn-text">Quick Export</span>
          <font-awesome-icon icon="chevron-down" class="w-2 h-2 ml-1" />
        </button>

        <div v-if="showExportMenu" class="dropdown-menu">
          <button @click="exportPNG" class="dropdown-item">
            <font-awesome-icon icon="images" class="w-3 h-3 mr-2" />
            PNG (High Quality)
          </button>
          <button @click="exportJPG" class="dropdown-item">
            <font-awesome-icon icon="images" class="w-3 h-3 mr-2" />
            JPG (Compressed)
          </button>
        </div>
      </div>

      <button @click="$emit('open-export-panel')" class="toolbar-btn toolbar-btn-primary">
        <font-awesome-icon icon="file-export" class="w-3 h-3" />
        <span class="btn-text">Export & Share</span>
      </button>

      <button @click="$emit('open-ai-panel')" class="toolbar-btn toolbar-btn-ai">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="btn-text">AI Assistant</span>
      </button>

      <div class="toolbar-divider"></div>

      <button @click="$emit('save')" class="toolbar-btn">
        <font-awesome-icon icon="save" class="w-3 h-3" />
        <span class="btn-text">Save</span>
      </button>

      <button @click="$emit('load')" class="toolbar-btn">
        <font-awesome-icon icon="folder-open" class="w-3 h-3" />
        <span class="btn-text">Load</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
defineProps({
  zoom: { type: Number, default: 1 },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  gridEnabled: { type: Boolean, default: false },
  snapEnabled: { type: Boolean, default: false }
})

// Emits
const emit = defineEmits([
  'add-image', 'add-image-url', 'zoom-in', 'zoom-out', 'fit-stage', 'undo', 'redo',
  'toggle-grid', 'toggle-snap', 'export-png', 'export-jpg', 'save', 'load', 'open-export-panel', 'open-ai-panel'
])

// Local state
const showExportMenu = ref(false)
const exportDropdown = ref(null)

// Methods
const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const exportPNG = () => {
  showExportMenu.value = false
  emit('export-png')
}

const exportJPG = () => {
  showExportMenu.value = false
  emit('export-jpg')
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (exportDropdown.value && !exportDropdown.value.contains(event.target)) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 10;
  min-height: 48px;
  width: 100%;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.toolbar-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.toolbar-btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.toolbar-btn-ai {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.toolbar-btn-ai:hover {
  background: linear-gradient(135deg, #5568d3, #6a3f8f);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 4px;
}

.zoom-display {
  padding: 6px 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  min-width: 50px;
  text-align: center;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 180px;
  margin-top: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item:first-child {
  border-radius: 6px 6px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 6px 6px;
}

@media (max-width: 768px) {
  .canvas-toolbar {
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .toolbar-btn {
    padding: 4px 6px;
  }
  
  .btn-text {
    display: none;
  }
  
  .toolbar-section {
    gap: 2px;
  }
  
  .zoom-display {
    font-size: 10px;
    padding: 4px 6px;
    min-width: 40px;
  }
}
</style>
