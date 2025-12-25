<template>
  <div class="chat-history" ref="chatHistoryContainer">
    <!-- Welcome Message -->
    <div v-if="messages.length === 0 && !isGeneratingPreview && !showPreview" class="chat-welcome-message">
      <div class="welcome-icon">💍</div>
      <h3>Wedding Sticker Designer</h3>
      <p class="welcome-tagline" v-if="isAuthenticated">
        Hi{{ userName ? `, ${userName}` : '' }}! Create beautiful wedding stickers in seconds! ✨
      </p>
      <p class="welcome-tagline" v-else>
        Create beautiful wedding stickers in seconds! ✨
        <br><small>Login to get <strong>100 FREE tokens</strong>!</small>
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
        <!-- 3-dot menu for preview actions -->
        <div class="preview-menu">
          <button @click="toggleMenu" class="preview-menu-btn">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </button>
          <div v-if="showMenu" class="preview-menu-dropdown">
            <button @click="handleAction('edit')" class="menu-option">✏️ Edit</button>
            <button @click="handleAction('download')" class="menu-option">⬇️ Download</button>
          </div>
        </div>
        <div class="wedding-preview-container-inline" ref="previewContainers">
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

    <!-- Generating Preview Indicator - OUTSIDE the bubble -->
    <div v-if="isGeneratingPreview" class="generating-indicator-container">
      <div class="generating-indicator">
        <div class="generating-spinner-simple">
          <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="generating-label">{{ generatingMessage }}</span>
      </div>
    </div>
    
    <!-- Generate New Button - OUTSIDE below all messages when preview exists -->
    <div v-if="hasPreview && !isGeneratingPreview" class="generate-new-container">
      <button @click="handleAction('generate-new')" class="generate-new-btn">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Generate New
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

// Types
export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  type?: 'preview' | 'text'
  isLoading?: boolean
  image?: string
  actions?: Array<{
    type: string
    label: string
    variant?: string
    icon?: string
    route?: string
  }>
}

export interface MessageAction {
  type: string
  label: string
  variant?: string
  icon?: string
  route?: string
}

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
const emit = defineEmits<{
  (e: 'login'): void
  (e: 'action', action: MessageAction): void
  (e: 'scroll-to-bottom'): void
  (e: 'menu-action', action: string): void
}>()

// Refs
const chatHistoryContainer = ref<HTMLDivElement | null>(null)
const previewContainers = ref<HTMLDivElement[] | HTMLDivElement | null>(null)
const showMenu = ref(false)

// Computed - check if there's a preview message
const hasPreview = computed(() => props.messages.some(m => m.type === 'preview'))

// Toggle menu
function toggleMenu() {
  showMenu.value = !showMenu.value
}

// Handle menu action
function handleAction(action: string) {
  showMenu.value = false
  emit('menu-action', action)
}

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
  min-height: 0;
  background: white;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.welcome-token-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 20px;
  font-size: 0.9rem;
  color: #5c6bc0;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  stroke: #667eea;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
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

/* Preview Menu - Small 3-dot */
.preview-menu {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 20;
}

.preview-menu-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: 0.7;
}

.preview-menu-btn:hover {
  opacity: 1;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.preview-menu-btn .dot {
  width: 3px;
  height: 3px;
  background: #555;
  border-radius: 50%;
}

.preview-menu-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 140px;
  z-index: 100;
}

.menu-option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #333;
  text-align: left;
  transition: background 0.15s ease;
}

.menu-option:hover {
  background: #f5f5f5;
}

/* Generate New Button - Outside, simple & professional */
.generate-new-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  margin-top: 8px;
}

.generate-new-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #fff;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-new-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.generate-new-btn:active {
  background: #f0f0f0;
}

.generate-new-btn .btn-icon {
  width: 16px;
  height: 16px;
}

/* Generating Indicator - Simple inline style */
.generating-indicator-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.generating-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 8px;
}

.generating-spinner-simple {
  width: 20px;
  height: 20px;
}

.generating-spinner-simple .spinner-icon {
  width: 100%;
  height: 100%;
  color: #667eea;
  animation: spin 1s linear infinite;
}

.generating-label {
  font-size: 0.875rem;
  color: #555;
  font-weight: 500;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* SVG bubble for preview */
.message-bubble.svg-bubble {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* SVG bubble for preview */
.message-bubble.svg-bubble {
  position: relative;
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
}

.wedding-preview-container-inline {
  position: relative;
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
.wedding-preview-container-inline :deep(svg) {
  max-width: 100%;
  max-height: 280px;
  height: auto;
  width: auto;
  display: block;
}

/* Ensure images inside SVG are visible */
.wedding-preview-container-inline :deep(svg image) {
  opacity: 1 !important;
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
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Welcome tagline */
.welcome-tagline {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.welcome-tagline small {
  font-size: 0.85rem;
  color: #888;
}
</style>
