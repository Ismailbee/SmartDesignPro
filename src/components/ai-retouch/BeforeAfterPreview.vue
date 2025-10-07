<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="showBeforeAfter" class="before-after-modal" @click.self="hideComparison">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Before & After Comparison</h2>
            <button class="close-btn" @click="hideComparison">×</button>
          </div>

          <!-- Comparison View -->
          <div class="comparison-container">
            <div class="comparison-wrapper" ref="comparisonWrapper">
              <!-- Before Image -->
              <div class="before-view" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
                <div class="view-label">Before</div>
                <div class="placeholder-content">
                  <span class="placeholder-icon">📸</span>
                  <p>Original Design</p>
                </div>
              </div>

              <!-- After Image -->
              <div class="after-view">
                <div class="view-label after">After</div>
                <div class="placeholder-content">
                  <span class="placeholder-icon">✨</span>
                  <p>AI Enhanced Design</p>
                </div>
              </div>

              <!-- Slider -->
              <div
                class="slider-handle"
                :style="{ left: `${sliderPosition}%` }"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <div class="slider-line"></div>
                <div class="slider-button">
                  <span class="slider-arrow left">‹</span>
                  <span class="slider-arrow right">›</span>
                </div>
              </div>
            </div>

            <!-- Toggle Buttons -->
            <div class="toggle-buttons">
              <button
                :class="['toggle-btn', { active: viewMode === 'before' }]"
                @click="viewMode = 'before'; sliderPosition = 0"
              >
                Before
              </button>
              <button
                :class="['toggle-btn', { active: viewMode === 'split' }]"
                @click="viewMode = 'split'; sliderPosition = 50"
              >
                Split View
              </button>
              <button
                :class="['toggle-btn', { active: viewMode === 'after' }]"
                @click="viewMode = 'after'; sliderPosition = 100"
              >
                After
              </button>
            </div>
          </div>

          <!-- Changes List -->
          <div class="changes-section">
            <h3 class="changes-title">Applied Changes</h3>
            <div class="changes-list">
              <div v-for="(change, index) in appliedChanges" :key="index" class="change-item">
                <span class="change-icon">✓</span>
                <span class="change-text">{{ change }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="action-btn secondary" @click="hideComparison">
              Close
            </button>
            <button class="action-btn primary" @click="handleApplyChanges">
              Keep Changes
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIRetouchStore } from '@/stores/ai-retouch'

const aiRetouchStore = useAIRetouchStore()
const { showBeforeAfter, beforeSnapshot, afterSnapshot, appliedSuggestions, suggestions } = storeToRefs(aiRetouchStore)
const { hideComparison } = aiRetouchStore

const sliderPosition = ref(50) // 0-100
const viewMode = ref<'before' | 'split' | 'after'>('split')
const isDragging = ref(false)
const comparisonWrapper = ref<HTMLElement | null>(null)

const appliedChanges = computed(() => {
  return suggestions.value
    .filter(s => appliedSuggestions.value.includes(s.id))
    .map(s => s.title)
})

function startDrag(event: MouseEvent | TouchEvent) {
  isDragging.value = true
  viewMode.value = 'split'
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
  
  event.preventDefault()
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value || !comparisonWrapper.value) return

  const rect = comparisonWrapper.value.getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const x = clientX - rect.left
  const percentage = (x / rect.width) * 100

  sliderPosition.value = Math.max(0, Math.min(100, percentage))
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function handleApplyChanges() {
  hideComparison()
  // Changes are already applied, just close the modal
}
</script>

<style scoped>
.before-after-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.comparison-container {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.comparison-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.before-view,
.after-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.before-view {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  z-index: 2;
}

.after-view {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2));
  z-index: 1;
}

.view-label {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.8);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-label.after {
  background: rgba(34, 197, 94, 0.8);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.5;
}

.placeholder-content p {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.7;
  margin: 0;
}

.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  z-index: 3;
  transform: translateX(-50%);
}

.slider-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: white;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

.slider-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.slider-arrow {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.toggle-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.toggle-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
}

.changes-section {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 200px;
  overflow-y: auto;
}

.changes-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.change-icon {
  color: #22c55e;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .comparison-wrapper {
    aspect-ratio: 4 / 3;
  }

  .toggle-buttons {
    flex-direction: column;
  }

  .toggle-btn {
    width: 100%;
  }
}
</style>

