<template>
  <div class="ai-background-tab">
    <!-- Input Section -->
    <div class="input-section">
      <label class="section-label">Upload Image</label>
      
      <!-- File Upload -->
      <div class="upload-area" @click="triggerFileInput">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileUpload"
          style="display: none"
        />
        <div v-if="!bgImageUrl" class="upload-placeholder">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p>Click to upload image</p>
          <span>PNG, JPG up to 10MB</span>
        </div>
        <div v-else class="upload-preview">
          <img :src="bgImageUrl" alt="Preview" />
          <button @click.stop="clearImage" class="btn-clear-image">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Output Type -->
      <div class="form-group">
        <label>Output Type</label>
        <div class="output-type-grid">
          <button
            :class="['output-type-btn', { active: bgOutputType === 'transparent' }]"
            @click="bgOutputType = 'transparent'"
          >
            <span class="type-icon">🔳</span>
            <span class="type-name">Transparent</span>
          </button>
          <button
            :class="['output-type-btn', { active: bgOutputType === 'solid' }]"
            @click="bgOutputType = 'solid'"
          >
            <span class="type-icon">🎨</span>
            <span class="type-name">Solid Color</span>
          </button>
          <button
            :class="['output-type-btn', { active: bgOutputType === 'blur' }]"
            @click="bgOutputType = 'blur'"
          >
            <span class="type-icon">💫</span>
            <span class="type-name">Blur</span>
          </button>
          <button
            :class="['output-type-btn', { active: bgOutputType === 'ai-generated' }]"
            @click="bgOutputType = 'ai-generated'"
          >
            <span class="type-icon">✨</span>
            <span class="type-name">AI Background</span>
          </button>
        </div>
      </div>

      <!-- Solid Color Picker -->
      <div v-if="bgOutputType === 'solid'" class="form-group">
        <label>Background Color</label>
        <div class="color-picker-row">
          <input
            v-model="bgBackgroundColor"
            type="color"
            class="color-input"
          />
          <input
            v-model="bgBackgroundColor"
            type="text"
            class="text-input"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <!-- Blur Amount -->
      <div v-if="bgOutputType === 'blur'" class="form-group">
        <label>Blur Amount: {{ bgBlurAmount }}px</label>
        <input
          v-model.number="bgBlurAmount"
          type="range"
          min="0"
          max="50"
          step="1"
          class="slider"
        />
      </div>

      <!-- AI Background Prompt -->
      <div v-if="bgOutputType === 'ai-generated'" class="form-group">
        <label>Background Description</label>
        <textarea
          v-model="bgAIPrompt"
          placeholder="E.g., Sunset beach scene, mountains in background..."
          rows="3"
          class="prompt-input"
        ></textarea>
      </div>

      <!-- Advanced Options -->
      <details class="advanced-options">
        <summary>Advanced Options</summary>
        <div class="advanced-content">
          <div class="form-group">
            <label>Edge Refinement: {{ bgEdgeRefinement }}</label>
            <input
              v-model.number="bgEdgeRefinement"
              type="range"
              min="0"
              max="10"
              step="1"
              class="slider"
            />
            <div class="slider-labels">
              <span>Sharp</span>
              <span>Smooth</span>
            </div>
          </div>

          <div class="form-group">
            <label>Feathering: {{ bgFeathering }}px</label>
            <input
              v-model.number="bgFeathering"
              type="range"
              min="0"
              max="10"
              step="1"
              class="slider"
            />
          </div>
        </div>
      </details>

      <!-- Remove Background Button -->
      <button
        @click="removeBackground"
        :disabled="!canRemoveBackground || isGenerating"
        class="btn-generate"
      >
        <svg v-if="!isGenerating" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else class="spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
        </svg>
        {{ isGenerating ? 'Processing...' : 'Remove Background' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="hasBgResults" class="results-section">
      <div class="results-header">
        <h3>Results ({{ bgResults.length }})</h3>
        <button @click="clearResults" class="btn-clear">Clear All</button>
      </div>

      <div class="results-grid">
        <AIResultCard
          v-for="result in bgResults"
          :key="result.id"
          :result="result"
          type="background"
          @use="useResult"
          @delete="deleteResult"
          @download="downloadResult"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎨</div>
      <p class="empty-title">No backgrounds removed yet</p>
      <p class="empty-description">
        Upload an image and remove its background with one click
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAIStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import AIResultCard from './AIResultCard.vue'
import type { AIBackgroundResult } from '@/types/ai'
import { uploadImage, downloadContent } from '@/services/ai-api'

const aiStore = useAIStore()
const {
  bgImageUrl,
  bgOutputType,
  bgBackgroundColor,
  bgBlurAmount,
  bgAIPrompt,
  bgEdgeRefinement,
  bgFeathering,
  bgResults,
  isGenerating,
  canRemoveBackground,
  hasBgResults
} = storeToRefs(aiStore)

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  try {
    const imageUrl = await uploadImage(file)
    bgImageUrl.value = imageUrl
  } catch (error) {
    console.error('Image upload failed:', error)
  }
}

function clearImage() {
  bgImageUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function removeBackground() {
  try {
    await aiStore.removeImageBackground()
  } catch (error) {
    console.error('Background removal failed:', error)
  }
}

function useResult(result: AIBackgroundResult) {
  // TODO: Emit event to add image to canvas
  console.log('Use result:', result)
}

function deleteResult(result: AIBackgroundResult) {
  aiStore.deleteBgResult(result.id)
}

async function downloadResult(result: AIBackgroundResult) {
  try {
    await downloadContent(result.processedImageUrl, `bg-removed-${result.id}.png`)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

function clearResults() {
  if (confirm('Clear all background removal results?')) {
    bgResults.value = []
  }
}
</script>

<style scoped>
.ai-background-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Upload Area */
.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.upload-placeholder svg {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

.upload-placeholder p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.upload-placeholder span {
  font-size: 12px;
  color: #6b7280;
}

.upload-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.upload-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-clear-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-image:hover {
  background: rgba(239, 68, 68, 0.9);
}

.btn-clear-image svg {
  width: 18px;
  height: 18px;
}

/* Output Type Grid */
.output-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.output-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 11px;
}

.output-type-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}

.output-type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.type-icon {
  font-size: 24px;
}

.type-name {
  font-size: 11px;
  font-weight: 600;
}

/* Color Picker */
.color-picker-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
}

/* Reuse common styles */
.input-section,
.section-label,
.prompt-input,
.form-group,
.text-input,
.slider,
.slider-labels,
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

