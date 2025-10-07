<template>
  <div class="retouch-button-container">
    <!-- Floating Retouch Button -->
    <button
      class="retouch-button"
      @click="handleClick"
      :disabled="isProcessing"
      :title="isProcessing ? 'Processing...' : 'AI Retouch'"
    >
      <div class="button-content">
        <span v-if="!isProcessing" class="icon">✨</span>
        <div v-else class="spinner"></div>
        <span class="label">{{ isProcessing ? 'Processing...' : 'AI Retouch' }}</span>
      </div>

      <!-- Pulse animation when suggestions available -->
      <div v-if="hasSuggestions && !isOpen" class="pulse-ring"></div>
    </button>

    <!-- Quick Actions Menu (appears on hover) -->
    <transition name="slide-up">
      <div v-if="showQuickActions" class="quick-actions">
        <button
          v-for="action in quickActions"
          :key="action.id"
          class="quick-action-btn"
          @click="handleQuickAction(action.id)"
          :title="action.description"
        >
          <span class="action-icon">{{ action.icon }}</span>
          <span class="action-label">{{ action.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIRetouchStore } from '@/stores/ai-retouch'

const aiRetouchStore = useAIRetouchStore()
const { isOpen, isProcessing, hasSuggestions } = storeToRefs(aiRetouchStore)
const { togglePanel, applyOneClickRetouch, getColorPaletteSuggestions, optimizeDesignLayout } = aiRetouchStore

const showQuickActions = ref(false)

const quickActions = [
  {
    id: 'one-click',
    label: 'One-Click Retouch',
    icon: '⚡',
    description: 'Apply all AI improvements'
  },
  {
    id: 'colors',
    label: 'Color Palette',
    icon: '🎨',
    description: 'Suggest color schemes'
  },
  {
    id: 'layout',
    label: 'Fix Layout',
    icon: '📐',
    description: 'Optimize alignment & spacing'
  },
  {
    id: 'panel',
    label: 'Open Panel',
    icon: '⚙️',
    description: 'Full retouch controls'
  }
]

function handleClick() {
  if (isProcessing.value) return
  showQuickActions.value = !showQuickActions.value
}

function handleQuickAction(actionId: string) {
  showQuickActions.value = false

  switch (actionId) {
    case 'one-click':
      emit('one-click-retouch')
      break
    case 'colors':
      emit('color-suggestions')
      break
    case 'layout':
      emit('layout-optimization')
      break
    case 'panel':
      togglePanel()
      break
  }
}

const emit = defineEmits<{
  'one-click-retouch': []
  'color-suggestions': []
  'layout-optimization': []
}>()
</script>

<style scoped>
.retouch-button-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.retouch-button {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.retouch-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
}

.retouch-button:active {
  transform: scale(0.95);
}

.retouch-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
}

.icon {
  font-size: 24px;
  line-height: 1;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.label {
  font-size: 9px;
  font-weight: 600;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pulse-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid #667eea;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0;
    transform: scale(1.2);
  }
}

/* Quick Actions Menu */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 180px;
}

.quick-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(-4px);
}

.action-icon {
  font-size: 18px;
  line-height: 1;
}

.action-label {
  flex: 1;
  text-align: left;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 768px) {
  .retouch-button-container {
    bottom: 24px;
    right: 24px;
  }

  .retouch-button {
    width: 56px;
    height: 56px;
  }

  .icon {
    font-size: 20px;
  }

  .label {
    font-size: 8px;
  }

  .quick-actions {
    padding: 8px;
  }

  .quick-action-btn {
    padding: 10px 12px;
    font-size: 13px;
    min-width: 160px;
  }
}
</style>

