<template>
  <div class="chat-container" ref="chatContainer">
    <!-- Welcome Screen -->
    <div v-if="messages.length === 0 && !isGeneratingPreview" class="welcome-screen">
      <div class="welcome-icon">📄</div>
      <h2 class="welcome-title">Letterhead Designer</h2>
      <p class="welcome-subtitle" v-if="isAuthenticated">
        Hi{{ userName ? `, ${userName}` : '' }}! Create professional letterheads by just telling me about your organization.
      </p>
      <p class="welcome-subtitle" v-else>
        Create professional letterheads with AI. Just describe your organization!
        <br><small class="login-hint">Login to get <strong>100 FREE tokens</strong>!</small>
      </p>
      
      <!-- Login Button -->
      <button v-if="!isAuthenticated" @click="$emit('login')" class="login-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Login to Start
      </button>
      
      <!-- Token Display -->
      <div 
        v-if="isAuthenticated" 
        class="token-badge"
        @click="navigateToTokens"
        role="button"
        tabindex="0"
        @keydown.enter="navigateToTokens"
        @keydown.space.prevent="navigateToTokens"
      >
        <div class="token-badge-bg"></div>
        <div class="token-badge-shimmer"></div>
        <div class="token-icon-wrapper">
          <span class="token-icon">💎</span>
        </div>
        <span class="token-title">{{ tokens }}</span>
      </div>

      <!-- Quick Suggestions -->
      <div class="suggestions">
        <p class="suggestions-label">Kindly use this format:</p>
        <div class="suggestion-chips">
          <div 
            v-for="suggestion in suggestions" 
            :key="suggestion"
            class="suggestion-chip wipe-text"
          >
            <span class="scrolling-text">{{ suggestion }} • {{ suggestion }} • </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages List -->
    <div v-else class="messages-wrapper">
      <TransitionGroup name="message" tag="div" class="messages-list">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message"
          :class="[msg.sender]"
        >
          <!-- Avatar -->
          <div class="message-avatar" v-if="msg.sender === 'ai'">
            <span>🤖</span>
          </div>

          <!-- Message Content -->
          <div class="message-content">
          <!-- Preview Message Type -->
          <div v-if="msg.type === 'preview'" class="letterhead-direct-preview">
            <img v-if="previewImageUrl" :src="previewImageUrl" alt="Letterhead Preview" class="letterhead-preview-image" />
            <div v-else class="preview-loading">
              <div class="generating-animation">
                <div class="ring"></div>
                <span class="generating-icon">✨</span>
              </div>
              <p>{{ generatingMessage || 'Generating your letterhead...' }}</p>
            </div>
            <div v-if="previewImageUrl" class="preview-actions-direct">
              <button @click="$emit('action', 'edit')" class="preview-btn edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              <button @click="$emit('action', 'download')" class="preview-btn download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
              <button @click="$emit('action', 'regenerate_preview')" class="preview-btn regenerate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Change Design
              </button>
              <button @click="$emit('action', 'change_color')" class="preview-btn regenerate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="13.5" cy="6.5" r=".5"/>
                  <circle cx="17.5" cy="10.5" r=".5"/>
                  <circle cx="8.5" cy="7.5" r=".5"/>
                  <circle cx="6.5" cy="11.5" r=".5"/>
                  <circle cx="12.5" cy="13.5" r=".5"/>
                  <circle cx="16.5" cy="17.5" r=".5"/>
                  <circle cx="6.5" cy="15.5" r=".5"/>
                  <path d="m9 19 3-8 3 8"/>
                  <path d="m8 14-6 6h20l-6-6"/>
                </svg>
                Change Color
              </button>
              <button @click="$emit('action', 'change_style')" class="preview-btn change-style">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Change Style
              </button>
            </div>
          </div>
          
          <!-- Text Message -->
          <p v-else class="message-text">
            <span v-html="formatMessage(msg.text)"></span>
          </p>
          
          <!-- Action Buttons -->
          <div v-if="msg.actions?.length" class="message-actions">
            <button 
              v-for="action in msg.actions.filter(a => a.type !== 'stage1_correction_block')" 
              :key="action.type"
              @click="$emit('action', action.action || action.type, action.data)"
              class="action-btn"
              :class="action.variant"
            >
              {{ action.label }}
            </button>
          </div>

          <!-- Stage 1 Correction Block - Inline trigger only -->
          <div 
            v-if="msg.actions?.some(a => a.type === 'stage1_correction_block')" 
            class="correction-trigger"
            @click="$emit('action', 'show_correction_block')"
          >
            <p class="correction-message">📝 Click to edit your letterhead information</p>
          </div>

          <!-- Timestamp -->
          <span class="message-time">{{ msg.time }}</span>
        </div>

        <!-- User Avatar -->
        <div class="message-avatar" v-if="msg.sender === 'user'">
          <span>👤</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- AI Typing Indicator (Loading Box) -->
    <div v-if="isAnalyzing" class="ai-typing-indicator">
      <div class="message-avatar">
        <span>🤖</span>
      </div>
      <div class="typing-box">
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
    </div>

    <!-- Correction Block Popup -->
    <div v-if="showCorrectionBlock" class="popup-backdrop" @click="$emit('action', 'close_correction_popup')">
      <div class="correction-popup" @click.stop>
        <div class="correction-popup-header">
          <h4>Edit Letterhead Information</h4>
          <button @click="$emit('action', 'close_correction_popup')" class="close-btn">×</button>
        </div>
      
      <!-- Editable Fields -->
      <div class="correction-popup-fields">
        <div class="field-group">
          <label for="popup-edit-org-name" class="field-label">Organization Name:</label>
          <input
            id="popup-edit-org-name"
            v-model="formData.organizationName"
            type="text"
            class="field-input"
            placeholder="Enter organization name"
          />
        </div>
        <div class="field-group">
          <label for="popup-edit-rc-number" class="field-label">RC Number:</label>
          <input
            id="popup-edit-rc-number"
            v-model="formData.rcNumber"
            type="text"
            class="field-input"
            placeholder="Enter RC number"
          />
        </div>
        
        <!-- Description Field -->
        <div class="field-group">
          <label for="popup-edit-description" class="field-label">Description:</label>
          <input
            id="popup-edit-description"
            v-model="formData.description"
            type="text"
            class="field-input"
            placeholder="e.g., General printing Contracts"
          />
        </div>
        
        <!-- Motto Field -->
        <div class="field-group">
          <label for="popup-edit-motto" class="field-label">Motto:</label>
          <input
            id="popup-edit-motto"
            v-model="formData.motto"
            type="text"
            class="field-input"
            placeholder="e.g., Bringing Your Ideas To Life"
          />
        </div>
        
        <div class="field-group">
          <label for="popup-edit-office-address" class="field-label">Head Office:</label>
          <textarea
            id="popup-edit-office-address"
            v-model="formData.officeAddress"
            class="field-input field-textarea"
            rows="2"
            placeholder="e.g., Plot 22, Adeola Odeku Street, Victoria Island, Lagos"
          ></textarea>
        </div>
        <div class="field-group">
          <label for="popup-edit-other-address" class="field-label">Branch:</label>
          <textarea
            id="popup-edit-other-address"
            v-model="formData.otherAddress"
            class="field-input field-textarea"
            rows="2"
            placeholder="Enter address (optional)"
          ></textarea>
        </div>
        <div class="field-group">
          <label for="popup-edit-emails" class="field-label">Emails:</label>
          <input
            id="popup-edit-emails"
            v-model="formData.emails"
            type="text"
            class="field-input"
            placeholder="Enter email addresses (separated by commas or spaces)"
          />
        </div>
        <div class="field-group">
          <label for="popup-edit-phones" class="field-label">Phone Numbers:</label>
          <input
            id="popup-edit-phones"
            v-model="formData.phoneNumbers"
            type="text"
            class="field-input"
            placeholder="Enter phone numbers (separated by commas or spaces)"
          />
        </div>
        
        <!-- Optional Fields Toggle -->
        <div class="optional-fields-section">
          <button 
            @click="toggleOptionalFields" 
            class="optional-fields-toggle"
            type="button"
            :class="{ active: showOptionalFields }"
            title="Toggle optional fields (Our Ref, Your Ref, Date)"
          >
            <svg v-if="!showOptionalFields" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" fill="#10b981"/>
              <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2.5"/>
            </svg>
            <span class="toggle-label">Our Ref, Your Ref, Date</span>
          </button>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="correction-popup-actions">
        <input
          type="file"
          ref="logoUploadInput"
          @change="handleLogoUpload"
          accept="image/*"
          style="display: none;"
        />
        <button
          @click="$refs.logoUploadInput.click()"
          class="logo-upload-btn"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          Upload Logo
        </button>
        <button 
          @click="handleFormSubmit"
          class="correction-btn primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          Confirm
        </button>
      </div>
      </div>
    </div>
    
    <!-- Color Palette Popup -->
    <div v-if="showColorPalette" class="popup-backdrop" @click="$emit('action', 'close_color_palette')">
      <div class="color-palette-popup" @click.stop>
        <div class="color-palette-header">
          <h4>Choose Brand Color</h4>
        </div>
        <div class="color-palette-grid">
          <button 
            v-for="color in colorOptions" 
            :key="color"
            @click="$emit('select-color', color)"
            class="color-option"
            :class="{ selected: primaryBrandColor === color }"
            :style="{ backgroundColor: color }"
            :title="color"
          ></button>
        </div>
        <div class="color-palette-custom">
          <label class="custom-color-label">
            Custom Color:
            <input 
              type="color" 
              :value="primaryBrandColor || '#058A6C'"
              @input="$emit('select-color', ($event.target as HTMLInputElement).value)"
              class="custom-color-input"
            />
          </label>
        </div>
        <div class="color-palette-actions">
          <button @click="$emit('action', 'apply_color')" class="palette-btn primary">
            ✓ Apply Color
          </button>
          <button @click="$emit('action', 'close_color_palette')" class="palette-btn secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Download Menu Popup -->
    <div v-if="showDownloadMenu" class="popup-backdrop" @click="$emit('action', 'close_download_menu')">
      <div class="download-menu-popup" @click.stop>
        <div class="download-menu-header">
          <h4>Download Format</h4>
        </div>
        <div class="download-menu-options">
          <button 
            @click="handleDownloadFormat('png')"
            class="download-option"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div class="download-option-info">
              <span class="download-option-title">PNG</span>
              <span class="download-option-desc">High-res image (transparent)</span>
            </div>
          </button>
          <button 
            @click="handleDownloadFormat('jpeg')"
            class="download-option"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div class="download-option-info">
              <span class="download-option-title">JPEG</span>
              <span class="download-option-desc">High-res image (smaller)</span>
            </div>
          </button>
          <button 
            @click="handleDownloadFormat('pdf')"
            class="download-option"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div class="download-option-info">
              <span class="download-option-title">PDF</span>
              <span class="download-option-desc">High-res document</span>
            </div>
          </button>
        </div>
        <div class="download-menu-actions">
          <button @click="$emit('action', 'close_download_menu')" class="palette-btn secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Loading Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showNavigationLoading" class="navigation-loading-overlay">
          <div class="navigation-loading-content">
            <div class="navigation-loading-spinner"></div>
            <p class="navigation-loading-text">Loading Plans...</p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Download Loading Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDownloadLoading" class="navigation-loading-overlay">
          <div class="navigation-loading-content">
            <div class="navigation-loading-spinner"></div>
            <p class="navigation-loading-text">{{ downloadLoadingMessage }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Types
export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  type?: 'preview' | 'normal'
  actions?: Array<{ type: string; label: string; variant?: string }>
}

// Props
const props = defineProps<{
  messages: ChatMessage[]
  isAnalyzing?: boolean
  isGeneratingPreview?: boolean
  generatingMessage?: string
  isAuthenticated?: boolean
  userName?: string
  tokens?: number
  previewImageUrl?: string
  showColorPalette?: boolean
  showCorrectionBlock?: boolean
  showDownloadMenu?: boolean
  primaryBrandColor?: string
  stage1Corrections?: {
    organizationName: string
    registrationNumber: string
    headOffice: string
    otherAddress: string
    emails: string[]
    phones: string[]
    description: string
    motto: string
    isEditing: boolean
    showMenu: boolean
    editedFields: Set<string>
  }
}>()

// Emits
const emit = defineEmits<{
  (e: 'action', actionType: string): void
  (e: 'update-field', field: string, value: string): void
  (e: 'login'): void
  (e: 'suggestion', suggestion: string): void
  (e: 'upload-logo', file: File): void
  (e: 'form-submit', data: {
    organization_name: string
    rc_number: string
    office_address: string
    other_address: string | null
    emails: string[] | null
    phone_numbers: string[] | null
    description: string | null
    motto: string | null
    include_optional_fields: boolean
  }): void
}>()

// Refs
const chatContainer = ref<HTMLDivElement | null>(null)
const showNavigationLoading = ref(false)
const showDownloadLoading = ref(false)
const downloadLoadingMessage = ref('Preparing download...')

// Navigate to tokens and plans page
function navigateToTokens() {
  // Show loading overlay
  showNavigationLoading.value = true
  
  // Wait for animation to be visible, then navigate
  setTimeout(() => {
    router.push({ 
      path: '/tokens-and-plans',
      query: { from: 'letterhead' }
    })
  }, 150) // Small delay to show loading starts
}

// Handle download with loading overlay
function handleDownloadFormat(format: 'png' | 'jpeg' | 'pdf') {
  // Set format-specific message
  const formatMessages = {
    png: 'Preparing PNG download...',
    jpeg: 'Preparing JPEG download...',
    pdf: 'Preparing PDF download...'
  }
  downloadLoadingMessage.value = formatMessages[format]
  
  // Show loading overlay immediately
  showDownloadLoading.value = true
  
  // Trigger download action immediately
  emit('action', 'download_format', { format })
  
  // Hide loading after showing briefly
  setTimeout(() => {
    showDownloadLoading.value = false
  }, 1500) // Show for 1.5 seconds
}

// Suggestions
const suggestions = [
  "My organization name is Maxrange Enterprises Description: General printing Contracts Motto: Bringing Your Ideas To Life Branch: Garki Area 11, Abuja. Head Office: Plot 22, Adeola Odeku Street, Victoria Island, Lagos. RC: 1549321 Tel: 090****, 081**** Email: info@maxrange.com, maxrange@gmail.com"
]

// Color palette options
const colorOptions = [
  '#058A6C', // Teal (default)
  '#3B82F6', // Blue  
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
  '#DC2626', // Dark Red
  '#059669'  // Dark Green
]

// Form data for correction popup
const formData = reactive({
  organizationName: '',
  rcNumber: '',
  officeAddress: '',
  otherAddress: '',
  emails: '',
  phoneNumbers: '',
  motto: '',
  description: '',
  ourRef: '',
  yourRef: '',
  date: ''
})

const showOptionalFields = ref(true)

function toggleOptionalFields() {
  showOptionalFields.value = !showOptionalFields.value
}

// Initialize form data when correction popup opens
watch(() => props.showCorrectionBlock, (isOpen) => {
  if (isOpen && props.stage1Corrections) {
    formData.organizationName = props.stage1Corrections.organizationName || ''
    formData.rcNumber = props.stage1Corrections.registrationNumber || ''
    formData.officeAddress = props.stage1Corrections.headOffice || ''
    formData.otherAddress = props.stage1Corrections.otherAddress || ''
    formData.emails = props.stage1Corrections.emails?.join(', ') || ''
    formData.phoneNumbers = props.stage1Corrections.phones?.join(', ') || ''
    formData.motto = props.stage1Corrections.motto || ''
    formData.description = props.stage1Corrections.description || ''
    
    // Initialize showOptionalFields based on includeOptionalFields preference
    // Use the actual value from stage1Corrections, default to true if not set
    showOptionalFields.value = props.stage1Corrections.includeOptionalFields !== undefined 
      ? props.stage1Corrections.includeOptionalFields 
      : true
  }
})

// Handle form submit
const handleFormSubmit = () => {
  // Parse emails and phone numbers
  const parseMultipleValues = (value: string): string[] | null => {
    if (!value.trim()) return null
    return value.split(/[,\s]+/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
  }
  
  // Create structured JSON output
  const result = {
    organization_name: formData.organizationName.trim(),
    rc_number: formData.rcNumber.trim(),
    office_address: formData.officeAddress.trim(),
    other_address: formData.otherAddress.trim() || null,
    emails: parseMultipleValues(formData.emails),
    phone_numbers: parseMultipleValues(formData.phoneNumbers),
    motto: formData.motto.trim() || null,
    description: formData.description.trim() || null,
    include_optional_fields: showOptionalFields.value
  }
  
  // Log the structured output (for debugging)
  console.log('Form submission result:', result)
  
  // Emit the result to parent component
  emit('form-submit', result)
}

// Format message (convert line breaks to <br>)
function formatMessage(text: string): string {
  return text.replace(/\n/g, '<br>')
}

// Auto-scroll to bottom
watch(() => props.messages.length, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { immediate: true })

// Scroll on analyzing state change
watch(() => props.isAnalyzing, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
})

// Logo upload handling
const logoUploadInput = ref<HTMLInputElement | null>(null)

// Computed property to check if logo is uploaded
const hasLogo = computed(() => {
  // This should check if a logo has been uploaded
  // You might want to get this from a prop or store
  return false // Placeholder - implement based on your logo state management
})

// Handle logo upload
const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Emit the logo upload event to parent with the file
    emit('upload-logo', file)
    // Clear the input for next use
    target.value = ''
  }
}

// Expose scroll method
defineExpose({
  scrollToBottom: () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  }
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  background: transparent;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px 20px;
  background: transparent;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  max-width: 500px;
  margin-bottom: 24px;
}

.login-hint {
  color: #10b981;
  font-weight: 600;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

.token-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 16px;
  margin-bottom: 20px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.token-badge-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%);
  border-radius: 16px;
  z-index: 0;
  transition: all 0.4s ease;
}

.token-badge-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255, 255, 255, 0.1) 45%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 55%,
    transparent 80%
  );
  background-size: 200% 100%;
  z-index: 1;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.token-badge:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.4),
    0 4px 12px rgba(6, 182, 212, 0.2);
}

.token-badge:hover .token-badge-bg {
  filter: brightness(1.1);
}

.token-badge:active {
  transform: translateY(-1px) scale(0.98);
}

/* Navigation Loading Overlay */
.navigation-loading-overlay {
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
  .navigation-loading-overlay {
    background: rgba(17, 24, 39, 0.95);
  }
}

.navigation-loading-content {
  text-align: center;
}

.navigation-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@media (prefers-color-scheme: dark) {
  .navigation-loading-spinner {
    border-color: #374151;
    border-top-color: #818cf8;
  }
}

.navigation-loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

@media (prefers-color-scheme: dark) {
  .navigation-loading-text {
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

/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.token-icon-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  z-index: 2;
  backdrop-filter: blur(8px);
}

.token-icon {
  font-size: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.token-title {
  position: relative;
  font-size: 18px;
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

@keyframes gradientWipe {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

/* Suggestions */
.suggestions {
  width: 100%;
  max-width: 600px;
  margin-top: 32px;
}

.suggestions-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.dark-mode .suggestions-label {
  color: #ffffff;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.suggestion-chip {
  padding: 10px 18px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  color: #475569;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.suggestion-chip.wipe-text {
  color: #475569;
  border: 1px solid #e2e8f0;
  width: 400px;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.suggestion-chip.wipe-text .scrolling-text {
  display: inline-block;
  animation: scrollLeft 50s linear infinite;
}

@keyframes scrollLeft {
  0% { 
    transform: translateX(0%);
  }
  100% { 
    transform: translateX(-50%);
  }
}

.suggestion-chip:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Messages */
.messages-wrapper {
  display: flex;
  flex-direction: column;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.message {
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.message-content {
  max-width: 65%;
  background: white;
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

.message-text {
  color: #1e293b;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
}

.message.user .message-text {
  color: white;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
  display: block;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Message Actions */
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* AI Typing Indicator */
.ai-typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
}

.ai-typing-indicator .message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.typing-box {
  background: white;
  padding: 12px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .typing-box {
  background: #2d3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.typing-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.typing-dots .dot {
  width: 8px;
  height: 8px;
  background: #06b6d4;
  border-radius: 50%;
  animation: typingDotPulse 1.4s infinite ease-in-out;
}

.typing-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDotPulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0) scale(0.8);
  }
  30% {
    opacity: 1;
    transform: translateY(-6px) scale(1.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Analyzing State (legacy - keeping for compatibility) */
.analyzing-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 16px;
}

.analyzing-animation {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #06b6d4;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.analyzing-text {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Generating State */
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.generating-animation {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.ring {
  width: 80px;
  height: 80px;
  border: 4px solid #e2e8f0;
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generating-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  animation: pulse 1.5s ease-in-out infinite;
}

.generating-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* Transitions */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Correction Block */
.correction-block {
  margin-top: 16px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.correction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.correction-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.correction-menu-btn {
  padding: 8px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #64748b;
}

.correction-menu-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.correction-menu-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.correction-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 150px;
}

.menu-item {
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: #f3f4f6;
}

.correction-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.field-value {
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #111827;
  font-size: 14px;
}

.field-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
  color: #1f2937;
}

.field-input::placeholder {
  color: #9ca3af;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input.edited {
  border-color: #f59e0b;
  background: #fffbeb;
}

.field-textarea {
  resize: vertical;
  min-height: 50px;
}

.correction-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.correction-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  min-height: 40px;
}

.correction-btn.primary {
  background: #3b82f6;
  color: white;
}

.correction-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.correction-btn.primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.correction-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.correction-btn.secondary:hover {
  background: #e5e7eb;
}

/* Direct Preview Styles - no container wrapper */
.letterhead-direct-preview {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-actions-direct {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  margin-top: 12px;
  flex-wrap: wrap;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  flex: 0 0 120px;
  justify-content: center;
}

/* Responsive breakpoints for buttons */
@media (max-width: 640px) {
  .preview-actions-direct {
    gap: 6px;
    padding: 12px 8px;
    flex-wrap: wrap;
  }
  
  .preview-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    min-width: 70px;
    gap: 4px;
  }
  
  .preview-btn svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .preview-actions-direct {
    gap: 4px;
    padding: 10px 4px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 280px;
    margin: 12px auto 0;
  }
  
  .preview-btn {
    padding: 8px 6px;
    font-size: 0.75rem;
    min-width: unset;
    justify-content: center;
    gap: 3px;
  }
  
  .preview-btn svg {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 320px) {
  .preview-actions-direct {
    grid-template-columns: 1fr;
    max-width: 200px;
    gap: 6px;
  }
  
  .preview-btn {
    width: 100%;
    padding: 10px 8px;
    font-size: 0.8rem;
  }
}

.preview-btn.edit {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.preview-btn.download {
  background: var(--color-success, #10b981);
  color: white;
}

.preview-btn.regenerate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.preview-btn.change-style {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.preview-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.preview-loading {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.letterhead-preview-image {
  max-width: 100%;
  width: auto;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary, #e5e7eb);
  border-top: 3px solid var(--primary-color, #0ea5e9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Color Palette Popup */
.popup-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-palette-popup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  max-width: 320px;
  width: 90vw;
  border: 1px solid #e5e7eb;
}

/* Correction Popup - Same styling as color palette */
.correction-popup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  max-width: 500px;
  width: 90vw;
  border: 1px solid #e5e7eb;
  max-height: 80vh;
  overflow-y: auto;
}

.correction-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.correction-popup-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.correction-popup-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

/* Optional Fields Section */
.optional-fields-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.optional-fields-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #6b7280;
  width: auto;
}

.optional-fields-toggle:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.optional-fields-toggle.active {
  background: #ecfdf5;
  border-color: #10b981;
  color: #059669;
}

.optional-fields-toggle svg {
  flex-shrink: 0;
}

.optional-fields-toggle svg circle {
  stroke: #9ca3af;
  fill: transparent;
}

.optional-fields-toggle.active svg circle {
  fill: #10b981;
  stroke: #10b981;
}

.toggle-label {
  font-weight: 500;
}

.optional-fields-container {
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  width: fit-content;
}

.optional-field-item {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  padding: 2px 0;
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.correction-popup-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.correction-trigger {
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.correction-trigger:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.correction-message {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.color-palette-header {
  text-align: center;
  margin-bottom: 20px;
}

.color-palette-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.color-palette-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #374151;
  transform: scale(1.1);
}

.color-option.selected::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.color-palette-custom {
  margin-bottom: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.custom-color-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.custom-color-input {
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-palette-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.palette-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.palette-btn.primary {
  background: #3b82f6;
  color: white;
}

.palette-btn.primary:hover {
  background: #2563eb;
}

.palette-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.palette-btn.secondary:hover {
  background: #e5e7eb;
}

/* Download Menu Popup */
.download-menu-popup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  max-width: 320px;
  width: 90vw;
  border: 1px solid #e5e7eb;
}

.download-menu-header {
  text-align: center;
  margin-bottom: 20px;
}

.download-menu-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.download-menu-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.download-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.download-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-1px);
}

.download-option svg {
  color: #6b7280;
  flex-shrink: 0;
}

.download-option:hover svg {
  color: #3b82f6;
}

.download-option-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.download-option-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.download-option-desc {
  font-size: 13px;
  color: #6b7280;
}

.download-menu-actions {
  display: flex;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .correction-block {
    margin-left: -10px;
    margin-right: -10px;
    padding: 16px;
  }
  
  .correction-actions {
    flex-direction: column;
  }
  
  .correction-btn {
    justify-content: center;
  }
  
  .preview-actions {
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px;
  }
  
  .preview-btn {
    flex: 1;
    min-width: 0;
    padding: 10px 8px;
    font-size: 0.8rem;
    text-align: center;
    justify-content: center;
  }
  
  .preview-btn svg {
    width: 14px;
    height: 14px;
  }
  
  /* Correction popup medium screens */
  .correction-popup {
    width: 95vw;
    max-width: 450px;
    padding: 20px;
  }
  
  .correction-popup-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .logo-upload-btn,
  .correction-btn {
    flex: 1;
    min-width: 120px;
    padding: 10px 12px;
    font-size: 14px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .preview-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .preview-btn {
    width: 100%;
    padding: 12px;
    font-size: 0.9rem;
  }
  
  /* Correction popup responsive */
  .correction-popup {
    width: 95vw;
    max-width: none;
    margin: 20px 10px;
    padding: 20px;
  }
  
  .correction-popup-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .logo-upload-btn,
  .correction-btn {
    width: 100%;
    padding: 12px 16px;
    justify-content: center;
    font-size: 16px;
    min-height: 48px;
  }
}

/* Logo Upload Button Styles (in actions section) */
.logo-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logo-upload-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.logo-upload-btn svg {
  width: 16px;
  height: 16px;
}

/* Dark mode styles */
.dark-mode .welcome-subtitle {
  color: white;
}

.dark-mode .generating-text {
  color: white;
}
</style>
