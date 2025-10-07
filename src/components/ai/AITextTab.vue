<template>
  <div class="ai-text-tab">
    <!-- Input Section -->
    <div class="input-section">
      <label class="section-label">What do you want to write?</label>
      <textarea
        v-model="textPrompt"
        placeholder="E.g., Write a catchy headline for a coffee shop..."
        rows="4"
        class="prompt-input"
        :disabled="isGenerating"
      ></textarea>

      <!-- Type Selector -->
      <div class="form-group">
        <label>Content Type</label>
        <select v-model="textType" class="select-input">
          <option value="headline">Headline</option>
          <option value="caption">Caption</option>
          <option value="description">Description</option>
          <option value="ad-copy">Ad Copy</option>
          <option value="social-post">Social Media Post</option>
        </select>
      </div>

      <!-- Tone Selector -->
      <div class="form-group">
        <label>Tone</label>
        <select v-model="textTone" class="select-input">
          <option value="friendly">Friendly</option>
          <option value="professional">Professional</option>
          <option value="playful">Playful</option>
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
          <option value="persuasive">Persuasive</option>
        </select>
      </div>

      <!-- Length & Language -->
      <div class="form-row">
        <div class="form-group">
          <label>Length</label>
          <select v-model="textLength" class="select-input">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
        <div class="form-group">
          <label>Language</label>
          <select v-model="textLanguage" class="select-input">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.flag }} {{ lang.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Generate Button -->
      <button
        @click="generate"
        :disabled="!canGenerateText || isGenerating"
        class="btn-generate"
      >
        <svg v-if="!isGenerating" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <svg v-else class="spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
        </svg>
        {{ isGenerating ? 'Generating...' : 'Generate Text' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="hasTextResults" class="results-section">
      <div class="results-header">
        <h3>Results ({{ textResults.length }})</h3>
        <button @click="clearResults" class="btn-clear">Clear All</button>
      </div>

      <div class="results-grid">
        <AIResultCard
          v-for="result in textResults"
          :key="result.id"
          :result="result"
          type="text"
          @use="useResult"
          @delete="deleteResult"
          @copy="copyResult"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">✍️</div>
      <p class="empty-title">No text generated yet</p>
      <p class="empty-description">
        Enter a prompt above and click "Generate Text" to create AI-powered content
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAIStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import { LANGUAGES } from '@/types/ai'
import AIResultCard from './AIResultCard.vue'
import type { AITextResult } from '@/types/ai'

const aiStore = useAIStore()
const {
  textPrompt,
  textType,
  textTone,
  textLength,
  textLanguage,
  textResults,
  isGenerating,
  canGenerateText,
  hasTextResults
} = storeToRefs(aiStore)

const languages = computed(() => Object.values(LANGUAGES))

async function generate() {
  try {
    await aiStore.generateTextContent()
  } catch (error) {
    console.error('Text generation failed:', error)
  }
}

function useResult(result: AITextResult) {
  // Copy text to clipboard and emit event to add to canvas
  navigator.clipboard.writeText(result.text)
  // TODO: Emit event to add text to canvas
  console.log('Use result:', result)
}

function deleteResult(result: AITextResult) {
  aiStore.deleteTextResult(result.id)
}

function copyResult(result: AITextResult) {
  navigator.clipboard.writeText(result.text)
}

function clearResults() {
  if (confirm('Clear all text results?')) {
    textResults.value = []
  }
}
</script>

<style scoped>
.ai-text-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Input Section */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.prompt-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
}

.prompt-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.prompt-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.select-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.9);
}

.btn-generate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate svg {
  width: 18px;
  height: 18px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Results Section */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.btn-clear {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: rgba(239, 68, 68, 0.2);
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.empty-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  max-width: 280px;
}
</style>

