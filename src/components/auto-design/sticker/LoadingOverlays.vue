<template>
  <!-- Loading Overlays Container -->
  <Teleport to="body">
    <!-- Swapping Loading Overlay -->
    <div v-if="isSwapping" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Swapping images...</p>
    </div>
    
    <!-- Flipping Loading Overlay -->
    <div v-if="isFlipping" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Flipping image...</p>
    </div>
    
    <!-- Exporting Loading Overlay -->
    <div v-if="isExporting" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Preparing download...</p>
    </div>
    
    <!-- Custom Loading Overlay -->
    <div v-if="customLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ customMessage }}</p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isSwapping?: boolean
  isFlipping?: boolean
  isExporting?: boolean
  customLoading?: boolean
  customMessage?: string
}>()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  backdrop-filter: blur(6px);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  color: white;
  font-size: 16px;
  font-weight: 500;
}
</style>
