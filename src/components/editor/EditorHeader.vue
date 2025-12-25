<template>
  <header class="editor-header">
    <!-- Left: Menu & Logo -->
    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')" title="Toggle Sidebar">
        <Menu :size="20" />
      </button>
      <div class="project-info">
        <input 
          v-model="editableName"
          class="project-name-input"
          @blur="saveName"
          @keyup.enter="($event.target as HTMLInputElement).blur()"
        />
        <span class="save-status" :class="{ saved: isSaved }">
          <Check v-if="isSaved" :size="12" />
          {{ isSaved ? 'Saved' : 'Saving...' }}
        </span>
      </div>
    </div>

    <!-- Center: Tools -->
    <div class="header-center">
      <div class="tool-group">
        <button 
          class="tool-btn" 
          @click="$emit('undo')" 
          :disabled="!canUndo" 
          title="Undo (Ctrl+Z)"
        >
          <Undo2 :size="18" />
        </button>
        <button 
          class="tool-btn" 
          @click="$emit('redo')" 
          :disabled="!canRedo" 
          title="Redo (Ctrl+Y)"
        >
          <Redo2 :size="18" />
        </button>
      </div>
      
      <div class="divider"></div>
      
      <div class="tool-group">
        <button class="tool-btn" @click="$emit('add-text')" title="Add Text (T)">
          <Type :size="18" />
        </button>
        <button class="tool-btn" @click="$emit('add-image')" title="Add Image">
          <ImagePlus :size="18" />
        </button>
      </div>
      
      <div class="divider"></div>
      
      <div class="tool-group zoom-group">
        <button class="tool-btn" @click="$emit('zoom-out')" title="Zoom Out (Ctrl+-)">
          <ZoomOut :size="18" />
        </button>
        <button class="zoom-value" @click="$emit('reset-zoom')" title="Reset Zoom (Ctrl+0)">
          {{ zoomPercent }}%
        </button>
        <button class="tool-btn" @click="$emit('zoom-in')" title="Zoom In (Ctrl++)">
          <ZoomIn :size="18" />
        </button>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="header-right">
      <!-- Voice Control Slot -->
      <slot name="voice-control"></slot>
      
      <button 
        class="tool-btn" 
        @click="$emit('toggle-grid')" 
        :class="{ active: showGrid }" 
        title="Toggle Grid (Ctrl+G)"
      >
        <Grid3x3 :size="18" />
      </button>
      <button 
        class="tool-btn" 
        @click="$emit('show-shortcuts')" 
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard :size="18" />
      </button>
      <button class="action-btn primary" @click="$emit('export')">
        <Download :size="16" />
        <span>Export</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Menu, Undo2, Redo2, Type, ImagePlus,
  ZoomIn, ZoomOut, Grid3x3, Download, Keyboard, Check
} from 'lucide-vue-next'

const props = defineProps<{
  projectName?: string
  canUndo?: boolean
  canRedo?: boolean
  zoomPercent?: number
  showGrid?: boolean
}>()

defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'add-text'): void
  (e: 'add-image'): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'reset-zoom'): void
  (e: 'toggle-grid'): void
  (e: 'show-shortcuts'): void
  (e: 'export'): void
  (e: 'update:projectName', name: string): void
}>()

const editableName = ref(props.projectName || 'Untitled Design')
const isSaved = ref(true)

watch(() => props.projectName, (newName) => {
  if (newName) editableName.value = newName
})

const saveName = () => {
  isSaved.value = false
  setTimeout(() => {
    isSaved.value = true
  }, 500)
}
</script>

<style scoped>
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
  transform: scale(1.05);
}

.menu-btn:active {
  transform: scale(0.95);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 8px;
}

.project-name-input {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  background: transparent;
  border: none;
  padding: 2px 6px;
  margin: -2px -6px;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s;
}

.project-name-input:hover {
  background: #f3f4f6;
}

.project-name-input:focus {
  background: #f3f4f6;
  box-shadow: 0 0 0 2px #6366f1;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  transition: all 0.3s;
}

.save-status.saved {
  color: #10b981;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tool-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, #6366f1 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s;
}

.tool-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #1f2937;
  transform: translateY(-1px);
}

.tool-btn:hover:not(:disabled)::after {
  opacity: 0.1;
  transform: scale(1);
}

.tool-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #6366f1;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 8px;
}

.zoom-group {
  background: #f9fafb;
  border-radius: 8px;
  padding: 2px;
}

.zoom-value {
  min-width: 50px;
  padding: 6px 8px;
  background: none;
  border: none;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.zoom-value:hover {
  background: #e5e7eb;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  position: relative;
  overflow: hidden;
}

.action-btn.primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.action-btn.primary:hover::before {
  left: 100%;
}

@media (max-width: 768px) {
  .project-info {
    display: none;
  }
  
  .header-center {
    gap: 2px;
  }
  
  .divider {
    margin: 0 4px;
  }
  
  .action-btn span {
    display: none;
  }
  
  .action-btn {
    padding: 8px 12px;
  }
  
  .zoom-value {
    min-width: 40px;
    padding: 4px 6px;
  }
}

@media (max-width: 480px) {
  .tool-group:not(:first-child):not(:last-child) {
    display: none;
  }
  
  .divider {
    display: none;
  }
}

@media (pointer: coarse) {
  .tool-btn,
  .menu-btn {
    width: 42px;
    height: 42px;
  }
}
</style>
