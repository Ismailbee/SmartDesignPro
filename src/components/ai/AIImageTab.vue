<template>
  <div class="ai-image-tab">
    <!-- Input Section -->
    <div class="input-section">
      <label class="section-label">Describe the image you want</label>
      <textarea
        v-model="imagePrompt"
        placeholder="E.g., A futuristic city at sunset with flying cars..."
        rows="3"
        class="prompt-input"
        :disabled="isGenerating"
      ></textarea>

      <!-- Negative Prompt -->
      <div class="form-group">
        <label>Negative Prompt (Optional)</label>
        <input
          v-model="imageNegativePrompt"
          type="text"
          placeholder="What to avoid (e.g., blurry, low quality)"
          class="text-input"
          :disabled="isGenerating"
        />
      </div>

      <!-- Style Presets -->
      <div class="form-group">
        <label>Style</label>
        <div class="style-grid">
          <button
            v-for="preset in stylePresets"
            :key="preset.style"
            :class="['style-btn', { active: imageStyle === preset.style }]"
            @click="imageStyle = preset.style"
            :disabled="isGenerating"
          >
            <span class="style-icon">{{ preset.icon }}</span>
            <span class="style-name">{{ preset.name }}</span>
          </button>
        </div>
      </div>

      <!-- Resolution -->
      <div class="form-group">
        <label>Resolution</label>
        <div class="resolution-tabs">
          <button
            v-for="preset in resolutionPresets"
            :key="preset.resolution"
            :class="['resolution-tab', { active: imageResolution === preset.resolution }]"
            @click="imageResolution = preset.resolution"
            :disabled="isGenerating"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Custom Dimensions -->
      <div v-if="imageResolution === 'custom'" class="form-row">
        <div class="form-group">
          <label>Width (px)</label>
          <input
            v-model.number="imageCustomWidth"
            type="number"
            min="256"
            max="2048"
            step="64"
            class="text-input"
          />
        </div>
        <div class="form-group">
          <label>Height (px)</label>
          <input
            v-model.number="imageCustomHeight"
            type="number"
            min="256"
            max="2048"
            step="64"
            class="text-input"
          />
        </div>
      </div>

      <!-- Advanced Options (Collapsible) -->
      <details class="advanced-options">
        <summary>Advanced Options</summary>
        <div class="advanced-content">
          <div class="form-group">
            <label>Guidance Scale: {{ imageGuidanceScale }}</label>
            <input
              v-model.number="imageGuidanceScale"
              type="range"
              min="1"
              max="20"
              step="0.5"
              class="slider"
            />
            <div class="slider-labels">
              <span>Creative</span>
              <span>Precise</span>
            </div>
          </div>

          <div class="form-group">
            <label>Steps: {{ imageSteps }}</label>
            <input
              v-model.number="imageSteps"
              type="range"
              min="20"
              max="100"
              step="5"
              class="slider"
            />
            <div class="slider-labels">
              <span>Fast</span>
              <span>Quality</span>
            </div>
          </div>

          <div class="form-group">
            <label>Seed (Optional)</label>
            <input
              v-model.number="imageSeed"
              type="number"
              placeholder="Random"
              class="text-input"
            />
          </div>

          <div class="form-group">
            <label>Batch Size</label>
            <select v-model.number="imageBatchSize" class="select-input">
              <option :value="1">1 image</option>
              <option :value="2">2 images</option>
              <option :value="3">3 images</option>
              <option :value="4">4 images</option>
            </select>
          </div>
        </div>
      </details>

      <!-- Generate Button -->
      <button
        @click="generate"
        :disabled="!canGenerateImage || isGenerating"
        class="btn-generate"
      >
        <svg v-if="!isGenerating" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <svg v-else class="spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
        </svg>
        {{ isGenerating ? 'Generating...' : 'Generate Image' }}
      </button>

      <!-- Estimated Cost -->
      <div class="cost-estimate">
        Estimated cost: ${{ estimatedCost.toFixed(3) }}
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasImageResults" class="results-section">
      <div class="results-header">
        <h3>Results ({{ imageResults.length }})</h3>
        <button @click="clearResults" class="btn-clear">Clear All</button>
      </div>

      <div class="results-grid">
        <AIResultCard
          v-for="result in imageResults"
          :key="result.id"
          :result="result"
          type="image"
          @use="useResult"
          @delete="deleteResult"
          @download="downloadResult"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p class="empty-title">No images generated yet</p>
      <p class="empty-description">
        Describe what you want to see and let AI create it for you
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAIStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import { STYLE_PRESETS, RESOLUTION_PRESETS, estimateImageCost } from '@/types/ai'
import AIResultCard from './AIResultCard.vue'
import type { AIImageResult } from '@/types/ai'
import { downloadContent } from '@/services/ai-api'

const aiStore = useAIStore()
const {
  imagePrompt,
  imageNegativePrompt,
  imageStyle,
  imageResolution,
  imageCustomWidth,
  imageCustomHeight,
  imageSeed,
  imageGuidanceScale,
  imageSteps,
  imageBatchSize,
  imageResults,
  isGenerating,
  canGenerateImage,
  hasImageResults
} = storeToRefs(aiStore)

const stylePresets = computed(() => Object.values(STYLE_PRESETS))
const resolutionPresets = computed(() => Object.values(RESOLUTION_PRESETS))

const estimatedCost = computed(() => {
  return estimateImageCost({
    prompt: imagePrompt.value,
    style: imageStyle.value,
    resolution: imageResolution.value,
    batchSize: imageBatchSize.value
  })
})

async function generate() {
  try {
    await aiStore.generateImageContent()
  } catch (error) {
    console.error('Image generation failed:', error)
  }
}

function useResult(result: AIImageResult) {
  // TODO: Emit event to add image to canvas
  console.log('Use result:', result)
}

function deleteResult(result: AIImageResult) {
  aiStore.deleteImageResult(result.id)
}

async function downloadResult(result: AIImageResult) {
  try {
    await downloadContent(result.imageUrl, `ai-image-${result.id}.png`)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

function clearResults() {
  if (confirm('Clear all image results?')) {
    imageResults.value = []
  }
}
</script>

<style scoped>
.ai-image-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Style Grid */
.style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.style-btn {
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

.style-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}

.style-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.style-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.style-icon {
  font-size: 24px;
}

.style-name {
  font-size: 11px;
  font-weight: 600;
}

/* Resolution Tabs */
.resolution-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.resolution-tab {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.resolution-tab:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.7);
}

.resolution-tab.active {
  background: #667eea;
  color: white;
  border-color: transparent;
}

.resolution-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Advanced Options */
.advanced-options {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
}

.advanced-options summary {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.advanced-content {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
}

/* Cost Estimate */
.cost-estimate {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

/* Reuse styles from AITextTab */
.input-section,
.section-label,
.prompt-input,
.form-group,
.form-row,
.text-input,
.select-input,
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
  /* Inherit from AITextTab */
}
</style>

