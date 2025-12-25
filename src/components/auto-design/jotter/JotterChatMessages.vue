template>
  <div class="chat-history" ref="chatHistoryContainer">
    <!-- Welcome Message -->
    <div v-if="messages.length === 0 && !isGeneratingPreview && !showPreview" class="chat-welcome-message">
      <div class="welcome-icon">📓</div>
      <h3>Jotter Cover Designer</h3>
      <p v-if="isAuthenticated">
        Hi{{ userName ? `, ${userName}` : '' }}! I can help you design a beautiful jotter cover. 
        Please tell me the school name, student name, class, and subject.
      </p>
      <p v-else>
        Hi! I can help you design a beautiful jotter cover. 
        Login to get started with <strong>100 FREE tokens</strong>!
      </p>
      
      <!-- Login Button for unauthenticated users -->
      <button v-if="!isAuthenticated" @click="$emit('login')" class="welcome-login-btn">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Login to Start Designing
      </button>
      
      <!-- Token display for authenticated users -->
      <div v-if="isAuthenticated" class="welcome-token-display">
        <span class="token-icon">💎</span>
        <span class="token-count">{{ tokens }} tokens available</span>
      </div>
    </div>

    <!-- Messages -->
    <div v-for="msg in messages" :key="msg.id" class="chat-message" :class="msg.sender">
      <!-- Special Preview Message -->
      <div v-if="msg.type === 'preview'" class="message-bubble svg-bubble">
        <div class="jotter-preview-container-inline" ref="previewContainers">
          <!-- Loading placeholder - will be replaced by SVG -->
          <div class="preview-loading-placeholder">
            <div class="preview-loading-spinner"></div>
            <span>Loading design...</span>
          </div>
        </div>
      </div>

      <!-- Normal Text Message -->
      <div v-else class="message-bubble">
        <!-- Loading spinner for background generation -->
        <div v-if="msg.isLoading" class="loading-message">
          <div class="loading-spinner-inline">
            <svg class="spinner-svg" viewBox="0 0 50 50">
              <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
            </svg>
          </div>
          <span>{{ msg.text }}</span>
        </div>
        <template v-else>
          <div class="message-text" v-html="formatMessageText(msg.text)"></div>
          
          <!-- Action Buttons -->
          <div v-if="msg.actions && msg.actions.length > 0" class="message-actions">
            <button 
              v-for="(action, idx) in msg.actions" 
              :key="idx"
              @click="$emit('action', action)"
              class="message-action-btn"
              :class="action.variant || 'primary'"
            >
              <span v-if="action.icon" class="action-icon">{{ action.icon }}</span>
              {{ action.label }}
            </button>
          </div>
        </template>
        <div v-if="msg.image" class="chat-image-container">
          <img :src="msg.image" class="chat-image" alt="Uploaded image" />
        </div>
      </div>
      <div class="message-time">{{ msg.time }}</div>
    </div>

    <!-- Analyzing Indicator -->
    <div v-if="isAnalyzing" class="chat-message ai">
      <div class="message-bubble analyzing">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <!-- Generating Preview Indicator -->
    <div v-if="isGeneratingPreview" class="chat-message ai">
      <div class="message-bubble generating-preview">
        <div class="generating-content">
          <div class="generating-spinner-premium">
            <div class="spinner-ring-outer"></div>
            <div class="spinner-ring-middle"></div>
            <div class="spinner-ring-inner"></div>
            <div class="spinner-core">
              <svg class="core-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="spinner-particles">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="generating-text">
            <p class="generating-title">{{ generatingMessage }}</p>
            <p class="generating-subtitle">Creating your jotter cover...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage, MessageAction } from './types'

// Props
const props = defineProps<{
  messages: ChatMessage[]
  isAnalyzing: boolean
  isGeneratingPreview: boolean
  showPreview: boolean
  generatingMessage: string
  isAuthenticated: boolean
  userName?: string
  tokens: number
}>()

// Emits
defineEmits<{
  (e: 'login'): void
  (e: 'action', action: MessageAction): void
  (e: 'scroll-to-bottom'): void
}>()

// Refs
const chatHistoryContainer = ref<HTMLDivElement | null>(null)
const previewContainers = ref<HTMLDivElement[] | HTMLDivElement | null>(null)

// Format message text (convert markdown to HTML)
function formatMessageText(text: string): string {
  if (!text) return ''
  let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\n/g, '<br>')
  return formatted
}

// Get preview containers as array (since ref in v-for returns array)
function getPreviewContainers(): HTMLDivElement[] {
  if (!previewContainers.value) return []
  return Array.isArray(previewContainers.value) 
    ? previewContainers.value 
    : [previewContainers.value]
}

// Scroll to bottom
function scrollToBottom() {
  nextTick(() => {
    if (chatHistoryContainer.value) {
      chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
    }
  })
}

// Watch messages and scroll
watch(() => props.messages.length, () => {
  scrollToBottom()
})

// Expose scroll method and refs
defineExpose({
  scrollToBottom,
  chatHistoryContainer,
  previewContainers,
  getPreviewContainers
})
</script>

<style scoped>
.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.chat-welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.chat-welcome-message .welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chat-welcome-message h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.chat-welcome-message p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}

.welcome-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.welcome-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.welcome-token-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2E7D32;
  font-weight: 500;
}

.token-icon {
  font-size: 1.1rem;
}

.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.chat-message.user {
  align-self: flex-end;
}

.chat-message.ai {
  align-self: flex-start;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-message.user .message-bubble {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.ai .message-bubble {
  background: #f0f2f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

.chat-message.user .message-time {
  text-align: right;
}

/* Analyzing dots */
.message-bubble.analyzing {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Loading message */
.loading-message {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-spinner-inline {
  width: 20px;
  height: 20px;
}

.spinner-svg {
  animation: rotate 2s linear infinite;
}

.spinner-path {
  stroke: #4CAF50;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

/* Message actions */
.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.message-action-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.message-action-btn.primary {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
}

.message-action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.message-action-btn.secondary {
  background: #e8e8e8;
  color: #333;
}

.message-action-btn.secondary:hover {
  background: #ddd;
}

/* Chat image */
.chat-image-container {
  margin-top: 8px;
}

.chat-image {
  max-width: 200px;
  border-radius: 12px;
}

/* Generating preview */
.message-bubble.generating-preview {
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%);
  padding: 20px;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.generating-spinner-premium {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring-outer,
.spinner-ring-middle,
.spinner-ring-inner {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.spinner-ring-outer {
  inset: 0;
  border-top-color: #4CAF50;
  animation: spin 1.5s linear infinite;
}

.spinner-ring-middle {
  inset: 6px;
  border-right-color: #2E7D32;
  animation: spin 1.2s linear infinite reverse;
}

.spinner-ring-inner {
  inset: 12px;
  border-bottom-color: #81C784;
  animation: spin 1s linear infinite;
}

.spinner-core {
  position: absolute;
  inset: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.core-icon {
  width: 16px;
  height: 16px;
  color: #4CAF50;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.spinner-particles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #4CAF50;
  border-radius: 50%;
  animation: particle 1.5s linear infinite;
}

.spinner-particles span:nth-child(1) { top: 0; left: 50%; animation-delay: 0s; }
.spinner-particles span:nth-child(2) { top: 15%; right: 15%; animation-delay: 0.25s; }
.spinner-particles span:nth-child(3) { top: 50%; right: 0; animation-delay: 0.5s; }
.spinner-particles span:nth-child(4) { bottom: 15%; right: 15%; animation-delay: 0.75s; }
.spinner-particles span:nth-child(5) { bottom: 0; left: 50%; animation-delay: 1s; }
.spinner-particles span:nth-child(6) { bottom: 15%; left: 15%; animation-delay: 1.25s; }

@keyframes particle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.generating-text {
  text-align: center;
}

.generating-title {
  font-weight: 600;
  color: #333;
  margin: 0;
}

.generating-subtitle {
  font-size: 0.85rem;
  color: #888;
  margin: 4px 0 0;
}

/* SVG bubble for preview */
.message-bubble.svg-bubble {
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
}

.jotter-preview-container-inline {
  min-height: 150px;
  max-height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: #fafafa;
}

/* Make SVG responsive inside the container */
.jotter-preview-container-inline :deep(svg) {
  max-width: 100%;
  max-height: 280px;
  height: auto;
  width: auto;
  display: block;
}

.preview-loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #888;
}

.preview-loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f0f0f0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
