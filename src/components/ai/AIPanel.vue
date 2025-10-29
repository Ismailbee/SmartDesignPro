<template>
  <Teleport to="body">
    <!-- AI Panel -->
    <Transition name="slide-right">
      <div v-if="isPanelOpen" class="ai-panel">
        <!-- Header -->
        <div class="ai-panel-header">
          <h2>
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Assistant
          </h2>
          <button @click="closePanel" class="close-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="ai-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.type"
            :class="['ai-tab-button', { active: activeTab === tab.type }]"
            @click="setActiveTab(tab.type)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="ai-panel-content">
          <AITextTab v-if="activeTab === 'text'" />
          <AIImageTab v-if="activeTab === 'image'" />
          <AIBackgroundTab v-if="activeTab === 'background'" />
          <AIQRCodeTab v-if="activeTab === 'qrcode'" />
        </div>

        <!-- Usage Stats Footer -->
        <div class="ai-panel-footer">
          <div class="usage-stats">
            <div class="stat-item">
              <span class="stat-icon">✍️</span>
              <span class="stat-value">{{ usageStats.textGenerations }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🖼️</span>
              <span class="stat-value">{{ usageStats.imageGenerations }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎨</span>
              <span class="stat-value">{{ usageStats.backgroundRemovals }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🔲</span>
              <span class="stat-value">{{ usageStats.qrCodesGenerated }}</span>
            </div>
          </div>
          <div class="total-cost">
            Total: ${{ usageStats.totalCost.toFixed(2) }}
          </div>
        </div>

        <!-- Error Toast -->
        <Transition name="fade">
          <div v-if="error" class="error-toast">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
            <button @click="clearError" class="toast-close">✕</button>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="isPanelOpen"
        class="ai-panel-overlay"
        @click="closePanel"
      ></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAIStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import AITextTab from './AITextTab.vue'
import AIImageTab from './AIImageTab.vue'
import AIBackgroundTab from './AIBackgroundTab.vue'
import AIQRCodeTab from './AIQRCodeTab.vue'
import type { AITabType } from '@/types/ai'

const aiStore = useAIStore()
const {
  isPanelOpen,
  activeTab,
  error,
  usageStats
} = storeToRefs(aiStore)

const tabs = computed(() => [
  { type: 'text' as AITabType, icon: '✍️', label: 'Text' },
  { type: 'image' as AITabType, icon: '🖼️', label: 'Images' },
  { type: 'background' as AITabType, icon: '🎨', label: 'BG Remove' },
  { type: 'qrcode' as AITabType, icon: '🔲', label: 'QR Code' }
])

function setActiveTab(tab: AITabType) {
  aiStore.setActiveTab(tab)
}

function closePanel() {
  aiStore.closePanel()
}

function clearError() {
  aiStore.clearError()
}

onMounted(() => {
  aiStore.loadUsageStats()
})

// Keyboard shortcut: Ctrl/Cmd + K
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      if (isPanelOpen.value) {
        closePanel()
      } else {
        aiStore.openPanel()
      }
    }
  }

  window.addEventListener('keydown', handleKeydown)

  return () => {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* AI Panel */
.ai-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 420px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* Overlay */
.ai-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  z-index: 999;
  pointer-events: auto;
  /* Changed to auto to allow modal interaction */
}

/* Header */
.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.ai-panel-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-panel-header .icon {
  width: 24px;
  height: 24px;
  stroke: url(#gradient);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Tabs */
.ai-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.ai-tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
}

.ai-tab-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.ai-tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.tab-icon {
  font-size: 24px;
}

.tab-label {
  font-size: 11px;
}

/* Content */
.ai-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Footer */
.ai-panel-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.usage-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.total-cost {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
}

/* Error Toast */
.error-toast {
  position: absolute;
  bottom: 80px;
  left: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  color: white;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.error-toast svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* Scrollbar */
.ai-panel-content::-webkit-scrollbar {
  width: 8px;
}

.ai-panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.ai-panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.ai-panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Transitions */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

