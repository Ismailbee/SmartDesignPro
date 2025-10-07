<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isPreviewOpen && selectedTemplate" class="preview-modal-overlay" @click.self="closePreview">
        <div class="preview-modal">
          <!-- Close Button -->
          <button class="modal-close-btn" @click="closePreview">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="preview-content">
            <!-- Left: Image Preview -->
            <div class="preview-image-section">
              <div class="image-container" :style="{ transform: `scale(${zoomLevel})` }">
                <img :src="selectedTemplate.previewUrl" :alt="selectedTemplate.title" class="preview-image" />
              </div>

              <!-- Zoom Controls -->
              <div class="zoom-controls">
                <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 0.5">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
                <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                <button class="zoom-btn" @click="resetZoom">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Right: Template Details -->
            <div class="preview-details-section">
              <!-- Header -->
              <div class="details-header">
                <div>
                  <h2 class="template-title">{{ selectedTemplate.title }}</h2>
                  <p class="template-creator">by {{ selectedTemplate.createdByName }}</p>
                </div>
                <div :class="['access-badge', selectedTemplate.accessLevel]">
                  {{ accessLevelLabel }}
                </div>
              </div>

              <!-- Description -->
              <div class="details-section">
                <h3 class="section-title">Description</h3>
                <p class="template-description">{{ selectedTemplate.description }}</p>
              </div>

              <!-- Stats -->
              <div class="details-section">
                <h3 class="section-title">Stats</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{{ selectedTemplate.downloads.toLocaleString() }} downloads</span>
                  </div>
                  <div class="stat-item">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ selectedTemplate.likes.toLocaleString() }} likes</span>
                  </div>
                  <div class="stat-item">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{{ selectedTemplate.views.toLocaleString() }} views</span>
                  </div>
                </div>
              </div>

              <!-- Details -->
              <div class="details-section">
                <h3 class="section-title">Details</h3>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Dimensions:</span>
                    <span class="detail-value">{{ selectedTemplate.width }} × {{ selectedTemplate.height }}px</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Format:</span>
                    <span class="detail-value">{{ selectedTemplate.format.toUpperCase() }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">{{ categoryName }}</span>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div class="details-section">
                <h3 class="section-title">Tags</h3>
                <div class="tags-list">
                  <span v-for="tag in selectedTemplate.tags" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Price & Actions -->
              <div class="details-footer">
                <div class="price-section">
                  <span v-if="selectedTemplate.price === 0" class="price-free">FREE</span>
                  <span v-else class="price-amount">₦{{ selectedTemplate.price }}</span>
                </div>

                <div class="action-buttons">
                  <button class="btn-secondary" @click="handleSave">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Save to Library</span>
                  </button>
                  <button class="btn-primary" @click="handleUse">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '@/stores/marketplace'
import { TEMPLATE_CATEGORIES, ACCESS_LEVEL_LABELS } from '@/types/marketplace'

const marketplaceStore = useMarketplaceStore()
const { isPreviewOpen, selectedTemplate } = storeToRefs(marketplaceStore)
const { closePreview, saveToLibrary } = marketplaceStore

const zoomLevel = ref(1)

const accessLevelLabel = computed(() => 
  selectedTemplate.value ? ACCESS_LEVEL_LABELS[selectedTemplate.value.accessLevel] : ''
)

const categoryName = computed(() => 
  selectedTemplate.value ? TEMPLATE_CATEGORIES[selectedTemplate.value.category].name : ''
)

function zoomIn() {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.25)
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.25)
  }
}

function resetZoom() {
  zoomLevel.value = 1
}

async function handleSave() {
  if (selectedTemplate.value) {
    try {
      await saveToLibrary(selectedTemplate.value.id)
      alert('Template saved to your library!')
    } catch (error) {
      alert('Failed to save template. Please try again.')
    }
  }
}

function handleUse() {
  if (selectedTemplate.value) {
    console.log('Use template:', selectedTemplate.value)
    // TODO: Implement template usage
    alert('Template usage will be implemented soon!')
    closePreview()
  }
}
</script>

<style scoped>
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.preview-modal {
  position: relative;
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.preview-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  height: 90vh;
  max-height: 800px;
}

.preview-image-section {
  position: relative;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px;
}

.image-container {
  transition: transform 0.3s ease;
  max-width: 100%;
  max-height: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  border-radius: 8px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-level {
  font-weight: 600;
  color: #1a202c;
  min-width: 50px;
  text-align: center;
}

.preview-details-section {
  background: white;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.template-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.template-creator {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.access-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.access-badge.free {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.access-badge.premium {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.access-badge.exclusive {
  background: rgba(159, 122, 234, 0.1);
  color: #9f7aea;
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.template-description {
  font-size: 15px;
  line-height: 1.6;
  color: #4a5568;
  margin: 0;
}

.stats-grid,
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item,
.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-size: 14px;
}

.detail-label {
  font-weight: 600;
  color: #718096;
}

.detail-value {
  color: #1a202c;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.details-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.price-section {
  margin-bottom: 16px;
}

.price-free {
  font-size: 24px;
  font-weight: 700;
  color: #48bb78;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.btn-secondary:hover {
  background: rgba(102, 126, 234, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

