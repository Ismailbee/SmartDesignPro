<template>
  <div class="ai-qrcode-tab">
    <!-- Input Section -->
    <div class="input-section">
      <!-- QR Type Selector -->
      <div class="form-group">
        <label>QR Code Type</label>
        <select v-model="qrType" class="select-input">
          <option value="url">Website URL</option>
          <option value="text">Plain Text</option>
          <option value="email">Email Address</option>
          <option value="phone">Phone Number</option>
          <option value="sms">SMS Message</option>
          <option value="wifi">WiFi Credentials</option>
          <option value="vcard">Contact Card</option>
          <option value="event">Calendar Event</option>
        </select>
      </div>

      <!-- Data Input -->
      <div class="form-group">
        <label>{{ getDataLabel(qrType) }}</label>
        <textarea
          v-model="qrData"
          :placeholder="getDataPlaceholder(qrType)"
          rows="3"
          class="prompt-input"
          :disabled="isGenerating"
        ></textarea>
      </div>

      <!-- Size Selector -->
      <div class="form-group">
        <label>Size</label>
        <div class="size-grid">
          <button
            v-for="size in sizes"
            :key="size.value"
            :class="['size-btn', { active: qrSize === size.value }]"
            @click="qrSize = size.value"
          >
            {{ size.label }}
          </button>
        </div>
      </div>

      <!-- Colors -->
      <div class="form-row">
        <div class="form-group">
          <label>Foreground Color</label>
          <div class="color-picker-row">
            <input
              v-model="qrForegroundColor"
              type="color"
              class="color-input"
            />
            <input
              v-model="qrForegroundColor"
              type="text"
              class="text-input"
              placeholder="#000000"
            />
          </div>
        </div>
        <div class="form-group">
          <label>Background Color</label>
          <div class="color-picker-row">
            <input
              v-model="qrBackgroundColor"
              type="color"
              class="color-input"
            />
            <input
              v-model="qrBackgroundColor"
              type="text"
              class="text-input"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      <!-- Advanced Options -->
      <details class="advanced-options">
        <summary>Advanced Options</summary>
        <div class="advanced-content">
          <!-- Dot Style -->
          <div class="form-group">
            <label>Dot Style</label>
            <div class="style-grid">
              <button
                v-for="style in dotStyles"
                :key="style.value"
                :class="['style-btn', { active: qrDotStyle === style.value }]"
                @click="qrDotStyle = style.value"
              >
                {{ style.label }}
              </button>
            </div>
          </div>

          <!-- Corner Style -->
          <div class="form-group">
            <label>Corner Style</label>
            <div class="style-grid">
              <button
                v-for="style in cornerStyles"
                :key="style.value"
                :class="['style-btn', { active: qrCornerStyle === style.value }]"
                @click="qrCornerStyle = style.value"
              >
                {{ style.label }}
              </button>
            </div>
          </div>

          <!-- Error Correction -->
          <div class="form-group">
            <label>Error Correction</label>
            <select v-model="qrErrorCorrection" class="select-input">
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <!-- Logo Upload -->
          <div class="form-group">
            <label>Logo (Optional)</label>
            <div class="logo-upload">
              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                @change="handleLogoUpload"
                style="display: none"
              />
              <button @click="triggerLogoInput" class="btn-upload">
                {{ qrLogoUrl ? 'Change Logo' : 'Upload Logo' }}
              </button>
              <button
                v-if="qrLogoUrl"
                @click="clearLogo"
                class="btn-clear-logo"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </details>

      <!-- Generate Button -->
      <button
        @click="generate"
        :disabled="!canGenerateQR || isGenerating"
        class="btn-generate"
      >
        <svg v-if="!isGenerating" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <svg v-else class="spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
        </svg>
        {{ isGenerating ? 'Generating...' : 'Generate QR Code' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="hasQRResults" class="results-section">
      <div class="results-header">
        <h3>Results ({{ qrResults.length }})</h3>
        <button @click="clearResults" class="btn-clear">Clear All</button>
      </div>

      <div class="results-grid">
        <AIResultCard
          v-for="result in qrResults"
          :key="result.id"
          :result="result"
          type="qrcode"
          @use="useResult"
          @delete="deleteResult"
          @download="downloadResult"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔲</div>
      <p class="empty-title">No QR codes generated yet</p>
      <p class="empty-description">
        Create custom QR codes for URLs, text, WiFi, and more
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAIStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import AIResultCard from './AIResultCard.vue'
import type { AIQRCodeResult, QRCodeType } from '@/types/ai'
import { uploadImage, downloadContent } from '@/services/ai-api'

const aiStore = useAIStore()
const {
  qrData,
  qrType,
  qrSize,
  qrForegroundColor,
  qrBackgroundColor,
  qrLogoUrl,
  qrDotStyle,
  qrCornerStyle,
  qrErrorCorrection,
  qrResults,
  isGenerating,
  canGenerateQR,
  hasQRResults
} = storeToRefs(aiStore)

const logoInput = ref<HTMLInputElement | null>(null)

const sizes = [
  { value: 256, label: 'Small' },
  { value: 512, label: 'Medium' },
  { value: 1024, label: 'Large' },
  { value: 2048, label: 'Print' }
]

const dotStyles = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circular', label: 'Circular' },
  { value: 'diamond', label: 'Diamond' }
]

const cornerStyles = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra' }
]

function getDataLabel(type: QRCodeType): string {
  const labels: Record<QRCodeType, string> = {
    url: 'Website URL',
    text: 'Text Content',
    email: 'Email Address',
    phone: 'Phone Number',
    sms: 'SMS Message',
    wifi: 'WiFi Credentials (SSID:Password)',
    vcard: 'Contact Information',
    event: 'Event Details'
  }
  return labels[type]
}

function getDataPlaceholder(type: QRCodeType): string {
  const placeholders: Record<QRCodeType, string> = {
    url: 'https://example.com',
    text: 'Enter any text...',
    email: 'contact@example.com',
    phone: '+1234567890',
    sms: '+1234567890:Hello!',
    wifi: 'MyNetwork:MyPassword',
    vcard: 'Name:John Doe\nEmail:john@example.com\nPhone:+1234567890',
    event: 'Event Name\nDate: 2024-01-01\nLocation: Venue'
  }
  return placeholders[type]
}

function triggerLogoInput() {
  logoInput.value?.click()
}

async function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  try {
    const imageUrl = await uploadImage(file)
    qrLogoUrl.value = imageUrl
  } catch (error) {
    console.error('Logo upload failed:', error)
  }
}

function clearLogo() {
  qrLogoUrl.value = ''
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

async function generate() {
  try {
    await aiStore.generateQRCodeContent()
  } catch (error) {
    console.error('QR code generation failed:', error)
  }
}

function useResult(result: AIQRCodeResult) {
  // TODO: Emit event to add QR code to canvas
  console.log('Use result:', result)
}

function deleteResult(result: AIQRCodeResult) {
  aiStore.deleteQRResult(result.id)
}

async function downloadResult(result: AIQRCodeResult) {
  try {
    await downloadContent(result.qrCodeUrl, `qr-code-${result.id}.png`)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

function clearResults() {
  if (confirm('Clear all QR code results?')) {
    qrResults.value = []
  }
}
</script>

<style scoped>
.ai-qrcode-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Size Grid */
.size-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.size-btn {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.size-btn:hover {
  background: rgba(255, 255, 255, 0.7);
}

.size-btn.active {
  background: #667eea;
  color: white;
  border-color: transparent;
}

/* Style Grid */
.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.style-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.style-btn:hover {
  background: rgba(255, 255, 255, 0.7);
}

.style-btn.active {
  background: #667eea;
  color: white;
  border-color: transparent;
}

/* Color Picker */
.color-picker-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 36px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  cursor: pointer;
}

/* Logo Upload */
.logo-upload {
  display: flex;
  gap: 8px;
}

.btn-upload {
  flex: 1;
  padding: 10px 16px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: rgba(102, 126, 234, 0.2);
}

.btn-clear-logo {
  padding: 10px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-logo:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Reuse common styles */
.input-section,
.form-group,
.form-row,
.select-input,
.prompt-input,
.text-input,
.advanced-options,
.advanced-content,
.btn-generate,
.spinner,
.results-section,
.results-header,
.btn-clear,
.results-grid,
.empty-state,
.empty-icon,
.empty-title,
.empty-description {
  /* Inherit from previous tabs */
}
</style>

