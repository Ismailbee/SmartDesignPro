<template>
  <Transition name="modal">
    <div v-if="isOpen" class="shortcuts-overlay" @click.self="$emit('close')">
      <div class="shortcuts-modal">
        <div class="modal-header">
          <h2>
            <Keyboard :size="22" />
            Keyboard Shortcuts
          </h2>
          <button class="close-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="shortcuts-grid">
            <div v-for="category in categories" :key="category.name" class="shortcut-category">
              <h3>{{ category.name }}</h3>
              <div class="shortcut-list">
                <div v-for="shortcut in category.shortcuts" :key="shortcut.action" class="shortcut-item">
                  <span class="shortcut-action">{{ shortcut.action }}</span>
                  <div class="shortcut-keys">
                    <kbd v-for="(key, i) in shortcut.keys" :key="i">{{ key }}</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p>Pro tip: Press <kbd>?</kbd> anytime to show this panel</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Keyboard, X } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const categories = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], action: 'Undo' },
      { keys: ['Ctrl', 'Y'], action: 'Redo' },
      { keys: ['Ctrl', 'S'], action: 'Save' },
      { keys: ['Ctrl', 'E'], action: 'Export' },
      { keys: ['Esc'], action: 'Deselect' },
    ]
  },
  {
    name: 'Edit',
    shortcuts: [
      { keys: ['Ctrl', 'C'], action: 'Copy' },
      { keys: ['Ctrl', 'V'], action: 'Paste' },
      { keys: ['Ctrl', 'X'], action: 'Cut' },
      { keys: ['Ctrl', 'D'], action: 'Duplicate' },
      { keys: ['Del'], action: 'Delete' },
      { keys: ['Ctrl', 'A'], action: 'Select All' },
    ]
  },
  {
    name: 'View',
    shortcuts: [
      { keys: ['Ctrl', '+'], action: 'Zoom In' },
      { keys: ['Ctrl', '-'], action: 'Zoom Out' },
      { keys: ['Ctrl', '0'], action: 'Reset Zoom' },
      { keys: ['Ctrl', 'G'], action: 'Toggle Grid' },
    ]
  },
  {
    name: 'Text',
    shortcuts: [
      { keys: ['Ctrl', 'B'], action: 'Bold' },
      { keys: ['Ctrl', 'I'], action: 'Italic' },
      { keys: ['Ctrl', 'U'], action: 'Underline' },
      { keys: ['T'], action: 'Add Text' },
    ]
  },
  {
    name: 'Layers',
    shortcuts: [
      { keys: ['Ctrl', ']'], action: 'Bring Forward' },
      { keys: ['Ctrl', '['], action: 'Send Backward' },
      { keys: ['R'], action: 'Add Rectangle' },
    ]
  },
]
</script>

<style scoped>
.shortcuts-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.shortcuts-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  padding: 8px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.shortcut-category h3 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6366f1;
  margin: 0 0 12px 0;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.shortcut-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.shortcut-action {
  font-size: 13px;
  color: #374151;
}

.shortcut-keys {
  display: flex;
  gap: 4px;
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-footer p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

.modal-footer kbd {
  margin: 0 4px;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .shortcuts-modal,
.modal-leave-to .shortcuts-modal {
  transform: translateY(30px) scale(0.95);
}

@media (max-width: 640px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>
