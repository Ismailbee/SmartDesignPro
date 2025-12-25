<template>
  <div class="ai-chat-footer">
    <!-- Chat Input Container -->
    <div class="chat-input-container">
      <button 
        @click="showUploadOptions = !showUploadOptions" 
        class="chat-add-btn" 
        :class="{ 'active': showUploadOptions }"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      
      <div class="chat-input-wrapper">
        <input 
          v-model="inputText"
          @keydown.enter="handleEnterKey"
          @paste="handlePaste"
          @input="$emit('update:modelValue', inputText)"
          type="text" 
          :placeholder="isRecording ? '🎤 Listening... Speak now!' : (showPreview ? 'Ask me anything or make changes...' : 'What can I help with?')"
          class="chat-input"
          :class="{ 'recording': isRecording }"
        />
      </div>

      <button 
        @click="$emit('toggle-voice')" 
        class="chat-voice-btn" 
        :class="{ 'recording': isRecording, 'pulse': isRecording }"
      >
        <svg v-if="!isRecording" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        <svg v-else class="w-6 h-6 recording-icon" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>

      <button 
        @click="$emit('send')" 
        class="chat-send-btn" 
        :disabled="!inputText.trim()"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="transform: rotate(0deg); margin-left: 2px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>

    <!-- Upload Options Popup -->
    <div v-if="showUploadOptions" class="upload-options-popup">
      <button @click="handleUploadClick" class="upload-option-btn">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span>Upload Picture</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props
const props = defineProps<{
  modelValue: string
  showPreview: boolean
  isRecording: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'toggle-voice'): void
  (e: 'upload'): void
  (e: 'paste', event: ClipboardEvent): void
}>()

// Local state
const inputText = ref(props.modelValue)
const showUploadOptions = ref(false)

// Sync with parent
watch(() => props.modelValue, (newVal) => {
  inputText.value = newVal
})

watch(inputText, (newVal) => {
  emit('update:modelValue', newVal)
})

// Handlers
function handleEnterKey(e: KeyboardEvent) {
  if (!e.shiftKey && inputText.value.trim()) {
    e.preventDefault()
    emit('send')
  }
}

function handlePaste(e: ClipboardEvent) {
  emit('paste', e)
}

function handleUploadClick() {
  showUploadOptions.value = false
  emit('upload')
}
</script>

<style scoped>
.ai-chat-footer {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e8e8e8;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  flex-shrink: 0;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.chat-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 25px;
  padding: 4px 8px;
}

.chat-add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-add-btn:hover {
  background: #e8e8e8;
}

.chat-add-btn.active {
  background: #667eea;
  color: white;
  transform: rotate(45deg);
}

.chat-input-wrapper {
  flex: 1;
}

.chat-input {
  width: 100%;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  outline: none;
}

.chat-input::placeholder {
  color: #999;
}

.chat-input.recording {
  color: #e53935;
}

.chat-input.recording::placeholder {
  color: #e53935;
}

.chat-voice-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-voice-btn:hover {
  background: #e8e8e8;
}

.chat-voice-btn.recording {
  background: #ffebee;
  color: #e53935;
}

.chat-voice-btn.pulse {
  animation: voicePulse 1.5s ease-in-out infinite;
}

@keyframes voicePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(229, 57, 53, 0); }
}

.recording-icon {
  color: #e53935;
}

.chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.chat-send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Upload options popup */
.upload-options-popup {
  position: absolute;
  bottom: 100%;
  left: 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 10;
}

.upload-option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.95rem;
  color: #333;
}

.upload-option-btn:hover {
  background: #f5f5f5;
}

.upload-option-btn svg {
  color: #667eea;
}

/* Icon sizes */
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
.w-6 { width: 1.5rem; }
.h-6 { height: 1.5rem; }
</style>
