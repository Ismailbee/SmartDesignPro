<template>
  <div class="voice-commands-container">
    <!-- Voice Button -->
    <button 
      ref="voiceBtn"
      @click="toggleVoice"
      @touchstart.prevent="handleTouchStart"
      @touchend.prevent="handleTouchEnd"
      class="voice-button"
      :class="{ 
        'listening': status === 'listening',
        'processing': status === 'processing',
        'error': status === 'error'
      }"
      :disabled="!isSupported"
      :title="isSupported ? 'Voice Commands (Hold to speak)' : 'Voice not supported'"
    >
      <!-- Animated rings -->
      <div v-if="status === 'listening'" class="voice-rings">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
      </div>
      
      <!-- Mic Icon -->
      <div class="voice-icon">
        <Mic v-if="status === 'idle' || status === 'listening'" :size="20" />
        <Loader2 v-else-if="status === 'processing'" :size="20" class="animate-spin" />
        <MicOff v-else :size="20" />
      </div>
    </button>

    <!-- Status Toast -->
    <Transition name="toast-slide">
      <div v-if="showToast" class="voice-toast" :class="toastType">
        <div class="toast-icon">
          <Mic v-if="toastType === 'listening'" :size="16" class="animate-pulse" />
          <CheckCircle v-else-if="toastType === 'success'" :size="16" />
          <AlertCircle v-else-if="toastType === 'error'" :size="16" />
          <Loader2 v-else :size="16" class="animate-spin" />
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ toastMessage }}</p>
          <p v-if="lastTranscript" class="toast-transcript">"{{ lastTranscript }}"</p>
        </div>
        <button @click="dismissToast" class="toast-close">
          <X :size="14" />
        </button>
      </div>
    </Transition>

    <!-- Help Modal -->
    <Transition name="modal-fade">
      <div v-if="showHelp" class="voice-help-overlay" @click.self="showHelp = false">
        <div class="voice-help-modal">
          <div class="help-header">
            <h3>
              <Mic :size="20" />
              Voice Commands
            </h3>
            <button @click="showHelp = false" class="close-btn">
              <X :size="20" />
            </button>
          </div>
          
          <div class="help-content">
            <div class="command-category" v-for="category in commandCategories" :key="category.name">
              <h4>{{ category.name }}</h4>
              <div class="command-list">
                <div 
                  v-for="cmd in category.commands" 
                  :key="cmd.action"
                  class="command-item"
                >
                  <span class="command-text">"{{ cmd.example }}"</span>
                  <span class="command-desc">{{ cmd.description }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="help-footer">
            <p>💡 Tip: Hold the mic button and speak clearly</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Mic, 
  MicOff, 
  Loader2, 
  X, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-vue-next'
import { voiceCommandsService, type VoiceResult } from '@/services/voice-commands.service'

// Emits
const emit = defineEmits<{
  (e: 'command', result: VoiceResult): void
  (e: 'add-text', params?: { text?: string }): void
  (e: 'add-heading', params?: { text?: string }): void
  (e: 'add-rectangle'): void
  (e: 'add-circle'): void
  (e: 'add-triangle'): void
  (e: 'add-star'): void
  (e: 'add-line'): void
  (e: 'add-image'): void
  (e: 'toggle-bold'): void
  (e: 'toggle-italic'): void
  (e: 'toggle-underline'): void
  (e: 'change-color', color: string): void
  (e: 'change-font-size', params: { size?: number, modifier?: string }): void
  (e: 'align', alignment: 'left' | 'center' | 'right'): void
  (e: 'delete'): void
  (e: 'duplicate'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'select-all'): void
  (e: 'deselect'): void
  (e: 'bring-forward'): void
  (e: 'send-backward'): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'reset-zoom'): void
  (e: 'export'): void
}>()

// State
const voiceBtn = ref<HTMLButtonElement>()
const status = ref<'listening' | 'processing' | 'idle' | 'error'>('idle')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'listening' | 'success' | 'error' | 'processing'>('listening')
const lastTranscript = ref('')
const showHelp = ref(false)
const isSupported = ref(false)

// Touch handling for mobile (hold to speak)
let touchTimeout: ReturnType<typeof setTimeout> | null = null

const handleTouchStart = () => {
  touchTimeout = setTimeout(() => {
    voiceCommandsService.start()
  }, 200)
}

const handleTouchEnd = () => {
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }
  if (status.value === 'listening') {
    voiceCommandsService.stop()
  }
}

const toggleVoice = () => {
  voiceCommandsService.toggle()
}

const dismissToast = () => {
  showToast.value = false
}

// Command categories for help
const commandCategories = [
  {
    name: '📝 Text',
    commands: [
      { action: 'ADD_TEXT', example: 'Add text', description: 'Add new text' },
      { action: 'TOGGLE_BOLD', example: 'Make it bold', description: 'Toggle bold' },
      { action: 'TOGGLE_ITALIC', example: 'Italic', description: 'Toggle italic' },
      { action: 'CHANGE_COLOR', example: 'Make it red', description: 'Change color' },
      { action: 'ALIGN_CENTER', example: 'Center text', description: 'Align text' }
    ]
  },
  {
    name: '🔷 Shapes',
    commands: [
      { action: 'ADD_RECTANGLE', example: 'Add rectangle', description: 'Add rectangle' },
      { action: 'ADD_CIRCLE', example: 'Add circle', description: 'Add circle' },
      { action: 'ADD_TRIANGLE', example: 'Add triangle', description: 'Add triangle' },
      { action: 'ADD_STAR', example: 'Add star', description: 'Add star' }
    ]
  },
  {
    name: '✏️ Editing',
    commands: [
      { action: 'DELETE', example: 'Delete', description: 'Delete selection' },
      { action: 'DUPLICATE', example: 'Duplicate', description: 'Copy selected' },
      { action: 'UNDO', example: 'Undo', description: 'Undo last action' },
      { action: 'REDO', example: 'Redo', description: 'Redo action' }
    ]
  },
  {
    name: '🔍 View',
    commands: [
      { action: 'ZOOM_IN', example: 'Zoom in', description: 'Zoom in canvas' },
      { action: 'ZOOM_OUT', example: 'Zoom out', description: 'Zoom out canvas' },
      { action: 'EXPORT', example: 'Export', description: 'Download design' }
    ]
  }
]

// Process voice command
const processVoiceCommand = (result: VoiceResult) => {
  emit('command', result)
  
  if (!result.success) {
    showFeedback('error', "Didn't catch that. Try again?")
    return
  }

  showFeedback('success', `${result.command}`)
  
  // Map actions to emits
  switch (result.action) {
    case 'ADD_TEXT':
      emit('add-text', result.parameters)
      break
    case 'ADD_HEADING':
      emit('add-heading', result.parameters)
      break
    case 'ADD_RECTANGLE':
      emit('add-rectangle')
      break
    case 'ADD_CIRCLE':
      emit('add-circle')
      break
    case 'ADD_TRIANGLE':
      emit('add-triangle')
      break
    case 'ADD_STAR':
      emit('add-star')
      break
    case 'ADD_LINE':
      emit('add-line')
      break
    case 'ADD_IMAGE':
      emit('add-image')
      break
    case 'TOGGLE_BOLD':
      emit('toggle-bold')
      break
    case 'TOGGLE_ITALIC':
      emit('toggle-italic')
      break
    case 'TOGGLE_UNDERLINE':
      emit('toggle-underline')
      break
    case 'CHANGE_COLOR':
      if (result.parameters?.color) {
        emit('change-color', result.parameters.color)
      }
      break
    case 'CHANGE_FONT_SIZE':
      emit('change-font-size', { 
        size: result.parameters?.size, 
        modifier: result.parameters?.sizeModifier 
      })
      break
    case 'ALIGN_LEFT':
      emit('align', 'left')
      break
    case 'ALIGN_CENTER':
      emit('align', 'center')
      break
    case 'ALIGN_RIGHT':
      emit('align', 'right')
      break
    case 'DELETE':
      emit('delete')
      break
    case 'DUPLICATE':
      emit('duplicate')
      break
    case 'UNDO':
      emit('undo')
      break
    case 'REDO':
      emit('redo')
      break
    case 'SELECT_ALL':
      emit('select-all')
      break
    case 'DESELECT':
      emit('deselect')
      break
    case 'BRING_FORWARD':
      emit('bring-forward')
      break
    case 'SEND_BACKWARD':
      emit('send-backward')
      break
    case 'ZOOM_IN':
      emit('zoom-in')
      break
    case 'ZOOM_OUT':
      emit('zoom-out')
      break
    case 'RESET_ZOOM':
      emit('reset-zoom')
      break
    case 'EXPORT':
      emit('export')
      break
    case 'SHOW_HELP':
      showHelp.value = true
      break
  }
}

const showFeedback = (type: 'listening' | 'success' | 'error' | 'processing', message: string) => {
  toastType.value = type
  toastMessage.value = message
  showToast.value = true
  
  // Auto-hide after delay
  setTimeout(() => {
    if (status.value !== 'listening') {
      showToast.value = false
    }
  }, 3000)
}

// Lifecycle
onMounted(() => {
  isSupported.value = voiceCommandsService.isSupported()
  
  voiceCommandsService.onStatus((newStatus, message) => {
    status.value = newStatus
    
    if (newStatus === 'listening') {
      showFeedback('listening', 'Listening...')
    } else if (newStatus === 'processing' && message) {
      showFeedback('processing', message)
    } else if (newStatus === 'error' && message) {
      showFeedback('error', message)
    } else if (newStatus === 'idle') {
      setTimeout(() => {
        showToast.value = false
      }, 1000)
    }
  })
  
  voiceCommandsService.onCommand((result) => {
    lastTranscript.value = result.transcript
    processVoiceCommand(result)
  })
})

onUnmounted(() => {
  voiceCommandsService.stop()
})
</script>

<style scoped>
.voice-commands-container {
  position: relative;
}

/* Voice Button */
.voice-button {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  overflow: visible;
}

.voice-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.voice-button:active:not(:disabled) {
  transform: scale(0.95);
}

.voice-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #6b7280;
}

.voice-button.listening {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.5);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.voice-button.processing {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.voice-button.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 4px 20px rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 4px 30px rgba(34, 197, 94, 0.8); }
}

/* Animated Rings */
.voice-rings {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(34, 197, 94, 0.4);
  animation: ring-expand 1.5s ease-out infinite;
}

.ring-2 { animation-delay: 0.3s; }
.ring-3 { animation-delay: 0.6s; }

@keyframes ring-expand {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.voice-icon {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Toast */
.voice-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.voice-toast.listening {
  border-color: rgba(34, 197, 94, 0.3);
}

.voice-toast.success {
  border-color: rgba(34, 197, 94, 0.3);
}

.voice-toast.error {
  border-color: rgba(239, 68, 68, 0.3);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
}

.voice-toast.error .toast-icon {
  color: #ef4444;
}

.voice-toast.processing .toast-icon {
  color: #f59e0b;
}

.toast-content {
  flex: 1;
}

.toast-message {
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.toast-transcript {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin: 4px 0 0 0;
  font-style: italic;
}

.toast-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Toast Animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Help Modal */
.voice-help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 16px;
}

.voice-help-modal {
  background: linear-gradient(165deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.help-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.command-category {
  margin-bottom: 20px;
}

.command-category:last-child {
  margin-bottom: 0;
}

.command-category h4 {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
}

.command-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.command-text {
  color: #a78bfa;
  font-size: 13px;
  font-weight: 500;
}

.command-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.help-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.help-footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin: 0;
  text-align: center;
}

/* Modal Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .voice-help-modal,
.modal-fade-leave-to .voice-help-modal {
  transform: scale(0.95);
}

/* Utility */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .voice-button {
    width: 40px;
    height: 40px;
  }
  
  .voice-toast {
    bottom: 80px;
    left: 16px;
    right: 16px;
    transform: none;
  }
  
  .toast-slide-enter-from,
  .toast-slide-leave-to {
    transform: translateY(20px);
  }
  
  .voice-help-modal {
    max-height: 90vh;
  }
}
</style>
