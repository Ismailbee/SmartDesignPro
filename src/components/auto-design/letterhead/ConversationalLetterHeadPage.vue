<template>
  <div class="letterhead-chat-page" :class="{ 'dark-mode': isDark }">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
        <div class="header-title">
          <h1>Letterhead Designer</h1>
        </div>
        <div class="header-right">
          <button @click="goHome" class="home-btn" title="Go to Home">
            <font-awesome-icon :icon="['fas', 'home']" size="lg" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content" :class="{ 'single-column': true }">
      <!-- Chat Section -->
      <div class="chat-section">
        <LetterHeadChatMessages
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          :is-generating-preview="isGeneratingPreview"
          :generating-message="generatingMessage"
          :is-authenticated="isAuthenticated"
          :user-name="userName"
          :tokens="userTokens"
          :stage1-corrections="stage1Corrections"
          :preview-image-url="previewImageUrl"
          :show-color-palette="showColorPalette"
          :show-correction-block="showCorrectionBlock"
          :show-download-menu="showDownloadMenu"
          :show-font-selector="showFontSelector"
          :primary-brand-color="primaryBrandColor"
          :selected-org-font="selectedOrgFont"
          @action="handleAction"
          @update-field="updateStage1Field"
          @login="handleLogin"
          @suggestion="handleSuggestion"
          @select-color="selectColor"
          @upload-logo="handleLogoUpload"
          @form-submit="handleFormSubmit"
        />
        <LetterHeadChatInput
          v-model="userInput"
          :disabled="isAnalyzing || isGeneratingPreview"
          @send="sendMessage"
          @upload-logo="handleLogoUpload"
        />
      </div>
    </div>

    <!-- Back Navigation Loading Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBackLoading" class="back-loading-overlay">
          <div class="back-loading-content">
            <div class="back-loading-spinner"></div>
            <div class="back-loading-text">Returning to Auto Design...</div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Home Navigation Loading Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showHomeLoading" class="home-loading-overlay">
          <div class="home-loading-content">
            <div class="home-loading-spinner"></div>
            <div class="home-loading-text">Loading Home...</div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Info Panel (Mobile Toggle) -->
    <div v-if="showInfoPanel" class="info-panel">
      <div class="info-header">
        <h3>Current Information</h3>
        <button @click="showInfoPanel = false" class="close-btn">×</button>
      </div>
      <div class="info-content">
        <div v-if="extractedInfo.organizationName" class="info-item">
          <label>Organization:</label>
          <p>{{ extractedInfo.organizationName }}</p>
        </div>
        <div v-if="extractedInfo.registrationNumber" class="info-item">
          <label>RC Number:</label>
          <p>{{ extractedInfo.registrationNumber }}</p>
        </div>
        <div v-if="extractedInfo.headOffice" class="info-item">
          <label>Head Office:</label>
          <p>{{ extractedInfo.headOffice }}</p>
        </div>
        <div v-if="extractedInfo.phones.length" class="info-item">
          <label>Phones:</label>
          <p>{{ extractedInfo.phones.join(', ') }}</p>
        </div>
        <div v-if="extractedInfo.email" class="info-item">
          <label>Email:</label>
          <p>{{ extractedInfo.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
// Lazy load chat components for better performance
const LetterHeadChatMessages = defineAsyncComponent(() => import('@/components/letter-head/LetterHeadChatMessages.vue'))
const LetterHeadChatInput = defineAsyncComponent(() => import('@/components/letter-head/LetterHeadChatInput.vue'))
import { useLetterHeadChat } from '@/composables/useLetterHeadChat'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const themeStore = useThemeStore()

// Use the composable
const {
  chatMessages,
  chatInputText: userInput,
  isAnalyzing,
  isGeneratingPreview,
  generatingMessage,
  extractedInfo,
  previewImageUrl,
  showLetterHeadPreview,
  selectedFormat,
  primaryBrandColor,
  stage1Corrections,
  showColorPalette,
  showCorrectionBlock,
  showDownloadMenu,
  showFontSelector,
  selectedOrgFont,
  handleSendMessage,
  handleMessageAction,
  initializeChat,
  handleLogoUpload: composableLogoUpload,
  updateBrandColor,
  updateStage1Field,
  toggleStage1Menu,
  startStage1Editing,
  confirmStage1Corrections,
  cancelStage1Editing,
  selectColor
} = useLetterHeadChat()

// Local state
const previewSvg = computed(() => previewImageUrl.value)
const showPreview = computed(() => showLetterHeadPreview.value)
const showInfoPanel = ref(false)
const isDark = computed(() => themeStore.isDark)
const showBackLoading = ref(false)
const showHomeLoading = ref(false)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => userStore.profile?.displayName || userStore.profile?.email?.split('@')[0] || '')
const userTokens = computed(() => userStore.profile?.tokens || 0)

// Methods
function goBack() {
  // Show loading animation before navigating
  showBackLoading.value = true
  setTimeout(() => {
    // Navigate to home and trigger auto-design modal to open
    router.push({ path: '/home', query: { openAutoDesign: 'true' } })
  }, 150)
}

function goHome() {
  // Show loading animation before navigating
  showHomeLoading.value = true
  setTimeout(() => {
    router.push('/home')
  }, 150)
}

function handleLogin() {
  router.push('/auth/login')
}

function sendMessage() {
  handleSendMessage()
}

function handleSuggestion(suggestion: string) {
  userInput.value = suggestion
  handleSendMessage()
}

function handleLogoUpload(file: File) {
  composableLogoUpload(file)
}

function handleFormSubmit(formData: {
  organization_name: string
  rc_number: string
  office_address: string
  other_address: string | null
  emails: string[] | null
  phone_numbers: string[] | null
  motto: string | null
  description: string | null
  include_optional_fields: boolean
}) {
  // Update the stage1Corrections with the new form data
  updateStage1Field('organizationName', formData.organization_name)
  updateStage1Field('registrationNumber', formData.rc_number)
  updateStage1Field('headOffice', formData.office_address)
  // Don't convert null to empty string - keep it as null/undefined
  updateStage1Field('otherAddress', formData.other_address)
  updateStage1Field('emails', formData.emails || [])
  updateStage1Field('phones', formData.phone_numbers || [])
  updateStage1Field('motto', formData.motto || '')
  updateStage1Field('description', formData.description || '')
  
  // Store the optional fields preference
  updateStage1Field('includeOptionalFields', formData.include_optional_fields)
  
  // Confirm the corrections
  confirmStage1Corrections()
}

function handleAction(actionType: string, actionData?: any) {
  handleMessageAction(actionType, actionData)
}

async function generatePreview() {
  handleMessageAction('generate')
}

function regeneratePreview() {
  handleMessageAction('generate')
}

function closePreview() {
  showLetterHeadPreview.value = false
}

async function downloadLetterHead() {
  handleMessageAction(`download_${selectedFormat.value}`)
}

// Initialize on mount
onMounted(() => {
  initializeChat()
})
</script>

<style scoped>
.letterhead-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  flex: 1;
  text-align: center;
}

.header-title h1 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.back-btn,
.home-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover,
.home-btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

/* Main Content */
.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  padding: 0;
  background: transparent;
}

.page-content.single-column {
  max-width: 1000px;
}

/* Chat Section */
.chat-section {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  min-height: 0; /* Important for flex items to shrink */
}

/* Preview Section */
.preview-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.svg-preview {
  width: 100%;
  max-width: 600px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  display: block;
}

.preview-placeholder {
  text-align: center;
  color: #94a3b8;
}

.placeholder-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.preview-placeholder p {
  font-size: 16px;
  margin: 0;
}

/* Color Controls */
.color-controls {
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.color-control-group {
  margin-bottom: 16px;
}

.color-control-group:last-child {
  margin-bottom: 0;
}

.color-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.color-input {
  width: 40px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: border-color 0.2s;
}

.color-input:hover {
  border-color: #10b981;
}

.color-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.color-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #6b7280;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  min-width: 70px;
  text-align: center;
}

.preview-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-button.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.action-button.secondary:hover {
  background: #e2e8f0;
}

/* Info Panel */
.info-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-header .close-btn {
  font-size: 24px;
  width: 32px;
  height: 32px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.info-item p {
  font-size: 14px;
  color: #1e293b;
  margin: 0;
}

/* Responsive */
@media (min-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr 500px;
    gap: 20px;
    padding: 20px;
  }
  
  .preview-section {
    display: flex !important;
  }
  
  .info-panel {
    display: none;
  }
}

@media (max-width: 1023px) {
  .preview-section {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    border-radius: 0;
  }
  
  .chat-section {
    border-radius: 0;
  }
}

/* Dark Mode Styles */
.letterhead-chat-page.dark-mode {
  background: #0f172a;
}

.dark-mode .page-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

.dark-mode .header-title h1 {
  color: #f1f5f9;
}

.dark-mode .back-btn,
.dark-mode .home-btn {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.dark-mode .back-btn:hover,
.dark-mode .home-btn:hover {
  background: #475569;
}

.dark-mode .chat-section {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .preview-section {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .preview-header h3 {
  color: #f1f5f9;
}

.dark-mode .close-btn {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.dark-mode .close-btn:hover {
  background: #475569;
}

.dark-mode .preview-content {
  background: #0f172a;
}

.dark-mode .action-button.secondary {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.dark-mode .action-button.secondary:hover {
  background: #475569;
}

.dark-mode .info-panel {
  background: #1e293b;
  border-top-color: #334155;
}

.dark-mode .info-header h3 {
  color: #f1f5f9;
}

.dark-mode .info-item {
  background: #0f172a;
}

.dark-mode .info-item label {
  color: #94a3b8;
}

.dark-mode .info-item p {
  color: #e2e8f0;
}

/* Back Navigation Loading Overlay */
.back-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

@media (prefers-color-scheme: dark) {
  .back-loading-overlay {
    background: rgba(17, 24, 39, 0.95);
  }
}

.back-loading-content {
  text-align: center;
}

.back-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@media (prefers-color-scheme: dark) {
  .back-loading-spinner {
    border-color: #374151;
    border-top-color: #818cf8;
  }
}

.back-loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

@media (prefers-color-scheme: dark) {
  .back-loading-text {
    color: #e5e7eb;
  }
}

/* Home Navigation Loading Overlay */
.home-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

@media (prefers-color-scheme: dark) {
  .home-loading-overlay {
    background: rgba(17, 24, 39, 0.95);
  }
}

.home-loading-content {
  text-align: center;
}

.home-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@media (prefers-color-scheme: dark) {
  .home-loading-spinner {
    border-color: #374151;
    border-top-color: #818cf8;
  }
}

.home-loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

@media (prefers-color-scheme: dark) {
  .home-loading-text {
    color: #e5e7eb;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Fade transition for overlays */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
