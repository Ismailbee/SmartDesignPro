<template>
  <div class="voice-control" :class="{ active: isListening, speaking: isSpeaking }">
    <!-- Voice Button -->
    <button 
      @click="toggleListening" 
      class="voice-btn"
      :title="isListening ? 'Stop Voice Control (V)' : 'Start Voice Control (V)'"
      :disabled="!isSupported"
    >
      <Mic v-if="!isListening" :size="20" />
      <MicOff v-else :size="20" />
      <span class="btn-label">{{ isListening ? 'Stop' : 'Voice' }}</span>
    </button>

    <!-- Voice Status Indicator -->
    <Transition name="slide-fade">
      <div v-if="isListening" class="voice-status">
        <span class="pulse-indicator"></span>
        <span class="transcript">{{ transcript || 'Listening...' }}</span>
      </div>
    </Transition>

    <!-- Voice Feedback Toast -->
    <Transition name="fade">
      <div v-if="latestFeedback" class="voice-feedback" :class="latestFeedback.type">
        <component :is="getFeedbackIcon(latestFeedback.type)" :size="16" />
        <span>{{ latestFeedback.message }}</span>
      </div>
    </Transition>

    <!-- Help Tooltip -->
    <Transition name="fade">
      <div v-if="showHelp" class="voice-help">
        <div class="help-header">
          <HelpCircle :size="16" />
          <span>Voice Commands</span>
          <button @click="showHelp = false" class="close-help">
            <X :size="14" />
          </button>
        </div>
        <div class="help-content">
          <div class="command-group">
            <h4>Add Elements</h4>
            <ul>
              <li>"Add text" / "Add a circle"</li>
              <li>"Create rectangle" / "Draw star"</li>
              <li>"Write Hello World"</li>
            </ul>
          </div>
          <div class="command-group">
            <h4>Edit</h4>
            <ul>
              <li>"Make it red" / "Color blue"</li>
              <li>"Make it bold" / "Size 24"</li>
              <li>"Delete" / "Duplicate"</li>
            </ul>
          </div>
          <div class="command-group">
            <h4>Animate</h4>
            <ul>
              <li>"Animate with fade in"</li>
              <li>"Add bounce" / "Slide up"</li>
              <li>"Play animation"</li>
            </ul>
          </div>
          <div class="command-group">
            <h4>General</h4>
            <ul>
              <li>"Undo" / "Redo"</li>
              <li>"Zoom in" / "Zoom out"</li>
              <li>"Select all" / "Help"</li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Mic, MicOff, HelpCircle, X, Check, AlertCircle, Info, Volume2 } from 'lucide-vue-next'

interface VoiceFeedback {
  type: 'success' | 'error' | 'info' | 'listening'
  message: string
  timestamp: number
}

const props = defineProps<{
  isListening: boolean
  isSupported: boolean
  transcript: string
  feedback: VoiceFeedback[]
  isSpeaking: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const showHelp = ref(false)

const latestFeedback = computed(() => {
  if (props.feedback.length === 0) return null
  return props.feedback[props.feedback.length - 1]
})

const toggleListening = () => {
  emit('toggle')
}

const getFeedbackIcon = (type: string) => {
  switch (type) {
    case 'success': return Check
    case 'error': return AlertCircle
    case 'listening': return Mic
    default: return Info
  }
}

// Keyboard shortcut for voice (V key)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
      e.preventDefault()
      toggleListening()
    }
  }
  // H key for help
  if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
      showHelp.value = !showHelp.value
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.voice-control {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #555;
  font-size: 13px;
  font-weight: 500;
}

.voice-btn:hover:not(:disabled) {
  background: #ebebeb;
  border-color: #d0d0d0;
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-control.active .voice-btn {
  background: #ef4444;
  border-color: #dc2626;
  color: white;
}

.voice-control.speaking .voice-btn {
  background: #3b82f6;
  border-color: #2563eb;
  color: white;
}

.btn-label {
  display: none;
}

@media (min-width: 640px) {
  .btn-label {
    display: inline;
  }
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #dc2626;
  max-width: 200px;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.transcript {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voice-feedback {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.voice-feedback.success {
  background: #10b981;
  color: white;
}

.voice-feedback.error {
  background: #ef4444;
  color: white;
}

.voice-feedback.info {
  background: #3b82f6;
  color: white;
}

.voice-feedback.listening {
  background: #f59e0b;
  color: white;
}

.voice-help {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #333;
}

.close-help {
  margin-left: auto;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
}

.close-help:hover {
  background: #e9ecef;
}

.help-content {
  padding: 12px 16px;
  max-height: 300px;
  overflow-y: auto;
}

.command-group {
  margin-bottom: 12px;
}

.command-group:last-child {
  margin-bottom: 0;
}

.command-group h4 {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.command-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.command-group li {
  font-size: 13px;
  color: #555;
  padding: 3px 0;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
