<template>
  <!-- Auto-Save Indicator -->
  <Teleport to="body">
    <div 
      class="auto-save-indicator" 
      :class="{ 
        'saving': isSaving, 
        'saved': showSaved && !isSaving,
        'hidden': !isSaving && !showSaved 
      }"
    >
      <div v-if="isSaving" class="save-spinner"></div>
      <span v-if="isSaving">Saving...</span>
      <span v-else-if="showSaved">✔ Saved locally</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isSaving: boolean
  showSaved: boolean
}>()
</script>

<style scoped>
.auto-save-indicator {
  position: fixed;
  bottom: 80px;
  right: 16px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.auto-save-indicator.saving {
  background: rgba(59, 130, 246, 0.9);
}

.auto-save-indicator.saved {
  background: rgba(34, 197, 94, 0.9);
}

.auto-save-indicator.hidden {
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
}

.save-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
