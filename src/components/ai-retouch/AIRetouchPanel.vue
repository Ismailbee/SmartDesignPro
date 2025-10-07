<template>
  <teleport to="body">
    <transition name="slide-right">
      <div v-if="isOpen" class="ai-retouch-panel-overlay" @click.self="closePanel">
        <div class="ai-retouch-panel">
          <!-- Header -->
          <div class="panel-header">
            <div class="header-content">
              <span class="header-icon">✨</span>
              <h2 class="header-title">AI Retouch</h2>
            </div>
            <button class="close-btn" @click="closePanel" title="Close">
              <span>×</span>
            </button>
          </div>

          <!-- Processing Indicator -->
          <div v-if="isProcessing" class="processing-banner">
            <div class="spinner-small"></div>
            <span>{{ processingMessage }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-banner">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
            <button @click="error = null" class="dismiss-btn">×</button>
          </div>

          <!-- Content -->
          <div class="panel-content">
            <!-- Quick Actions -->
            <section class="section">
              <h3 class="section-title">Quick Actions</h3>
              <div class="quick-actions-grid">
                <button
                  class="action-card"
                  @click="handleOneClickRetouch"
                  :disabled="isProcessing"
                >
                  <span class="card-icon">⚡</span>
                  <span class="card-title">One-Click Retouch</span>
                  <span class="card-desc">Apply all improvements</span>
                </button>

                <button
                  class="action-card"
                  @click="handleColorSuggestions"
                  :disabled="isProcessing"
                >
                  <span class="card-icon">🎨</span>
                  <span class="card-title">Color Palette</span>
                  <span class="card-desc">Harmonious colors</span>
                </button>

                <button
                  class="action-card"
                  @click="handleLayoutOptimization"
                  :disabled="isProcessing"
                >
                  <span class="card-icon">📐</span>
                  <span class="card-title">Fix Layout</span>
                  <span class="card-desc">Align & space elements</span>
                </button>

                <button
                  class="action-card"
                  @click="handleFontSuggestions"
                  :disabled="isProcessing"
                >
                  <span class="card-icon">🔤</span>
                  <span class="card-title">Font Pairing</span>
                  <span class="card-desc">Professional fonts</span>
                </button>
              </div>
            </section>

            <!-- Feature Toggles -->
            <section class="section">
              <h3 class="section-title">Features</h3>
              <div class="features-list">
                <div
                  v-for="feature in availableFeatures"
                  :key="feature.id"
                  class="feature-item"
                >
                  <label class="feature-label">
                    <input
                      type="checkbox"
                      :checked="enabledFeatures.includes(feature.id)"
                      @change="toggleFeature(feature.id)"
                      class="feature-checkbox"
                    />
                    <span class="feature-icon">{{ feature.icon }}</span>
                    <div class="feature-info">
                      <span class="feature-name">{{ feature.name }}</span>
                      <span class="feature-desc">{{ feature.description }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            <!-- Intensity Slider -->
            <section class="section">
              <h3 class="section-title">Intensity</h3>
              <div class="intensity-control">
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="intensity"
                  @input="setIntensity(($event.target as HTMLInputElement).valueAsNumber)"
                  class="intensity-slider"
                />
                <span class="intensity-value">{{ intensity }}%</span>
              </div>
            </section>

            <!-- Suggestions -->
            <section v-if="hasSuggestions" class="section">
              <div class="section-header">
                <h3 class="section-title">Suggestions ({{ suggestions.length }})</h3>
                <button @click="clearSuggestions" class="clear-btn">Clear All</button>
              </div>

              <div class="suggestions-list">
                <div
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                  class="suggestion-card"
                  :class="{ applied: suggestion.applied }"
                >
                  <div class="suggestion-header">
                    <span class="suggestion-icon">{{ getFeatureIcon(suggestion.feature) }}</span>
                    <div class="suggestion-info">
                      <h4 class="suggestion-title">{{ suggestion.title }}</h4>
                      <p class="suggestion-desc">{{ suggestion.description }}</p>
                    </div>
                    <span class="confidence-badge">{{ suggestion.confidence }}%</span>
                  </div>

                  <div class="suggestion-actions">
                    <button
                      v-if="!suggestion.applied"
                      @click="applySuggestion(suggestion.id)"
                      class="apply-btn"
                    >
                      Apply
                    </button>
                    <button
                      v-else
                      @click="revertSuggestion(suggestion.id)"
                      class="revert-btn"
                    >
                      Revert
                    </button>
                    <button
                      v-if="suggestion.feature === 'color-palette'"
                      @click="showPalettePreview(suggestion)"
                      class="preview-btn"
                    >
                      Preview
                    </button>
                  </div>

                  <!-- Color Palette Preview -->
                  <div v-if="suggestion.feature === 'color-palette' && suggestion.data" class="palette-preview">
                    <div
                      v-for="(color, index) in suggestion.data.colors"
                      :key="index"
                      class="color-swatch"
                      :style="{ backgroundColor: color }"
                      :title="color"
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Empty State -->
            <div v-if="!hasSuggestions && !isProcessing" class="empty-state">
              <span class="empty-icon">✨</span>
              <h3 class="empty-title">No Suggestions Yet</h3>
              <p class="empty-desc">Click a quick action above to get AI-powered suggestions</p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="panel-footer">
            <button
              v-if="hasAppliedSuggestions"
              @click="showComparison"
              class="footer-btn secondary"
            >
              <span>👁️</span>
              <span>Before/After</span>
            </button>
            <button
              v-if="hasAppliedSuggestions"
              @click="resetAll"
              class="footer-btn danger"
            >
              <span>↺</span>
              <span>Reset All</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIRetouchStore } from '@/stores/ai-retouch'
import type { AIRetouchFeature, AISuggestion } from '@/types/ai-retouch'
import { AI_FEATURES } from '@/types/ai-retouch'

const aiRetouchStore = useAIRetouchStore()
const {
  isOpen,
  isProcessing,
  error,
  suggestions,
  intensity,
  enabledFeatures,
  hasSuggestions,
  hasAppliedSuggestions
} = storeToRefs(aiRetouchStore)

const {
  closePanel,
  applyOneClickRetouch,
  getColorPaletteSuggestions,
  getFontPairingSuggestions,
  optimizeDesignLayout,
  applySuggestion,
  revertSuggestion,
  clearSuggestions,
  resetAll,
  toggleFeature,
  setIntensity,
  showComparison
} = aiRetouchStore

const processingMessage = computed(() => {
  return 'Analyzing your design...'
})

const availableFeatures = computed(() => {
  return Object.entries(AI_FEATURES).map(([id, data]) => ({
    id: id as AIRetouchFeature,
    ...data
  }))
})

function getFeatureIcon(feature: AIRetouchFeature): string {
  return AI_FEATURES[feature]?.icon || '✨'
}

function handleOneClickRetouch() {
  emit('one-click-retouch')
}

function handleColorSuggestions() {
  emit('color-suggestions')
}

function handleLayoutOptimization() {
  emit('layout-optimization')
}

function handleFontSuggestions() {
  emit('font-suggestions')
}

function showPalettePreview(suggestion: AISuggestion) {
  // TODO: Implement palette preview modal
  console.log('Show palette preview:', suggestion)
}

const emit = defineEmits<{
  'one-click-retouch': []
  'color-suggestions': []
  'layout-optimization': []
  'font-suggestions': []
}>()
</script>

<style scoped src="./ai-retouch-styles.css"></style>

