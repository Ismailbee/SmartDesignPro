<template>
  <!-- Main Image Action Modal -->
  <Teleport to="body">
    <div v-if="show" class="swap-confirmation-overlay" @click.stop="handleOverlayClick" @touchend.stop="handleOverlayClick">
      <div class="swap-confirmation-modal" @click.stop @touchend.stop>
        <div class="swap-modal-icon">🖼️</div>
        <h3 class="swap-modal-title">Main Image Options</h3>
        <p class="swap-modal-text">
          Choose an action for the main image
        </p>
        <div class="swap-modal-actions image-action-buttons">
          <button class="swap-btn swap-btn-flip" @click.stop="$emit('flip')">
            <span class="btn-icon">↔️</span>
            Flip Image
          </button>
          <button class="swap-btn swap-btn-drag" @click.stop="$emit('drag')">
            <span class="btn-icon">✋</span>
            Reposition
          </button>
          <button class="swap-btn swap-btn-cancel" @click.stop="$emit('cancel')">Cancel</button>
          <p class="swap-modal-hint">💡 Tip: Click Reposition to drag the image</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'flip'): void
  (e: 'drag'): void
  (e: 'cancel'): void
}>()

function handleOverlayClick(event: MouseEvent | TouchEvent) {
  if (event.target === event.currentTarget) {
    emit('cancel')
  }
}
</script>

<style scoped>
.swap-confirmation-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.swap-confirmation-modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.swap-modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.swap-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.swap-modal-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.swap-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-action-buttons {
  gap: 8px;
}

.swap-btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.swap-btn-flip {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.swap-btn-flip:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

.swap-btn-drag {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.swap-btn-drag:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.swap-btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.swap-btn-cancel:hover {
  background: #e5e7eb;
}

.btn-icon {
  font-size: 16px;
}

.swap-modal-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0 0;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .swap-confirmation-modal {
    background: #1f2937;
  }
  
  .swap-modal-title {
    color: #f9fafb;
  }
  
  .swap-modal-text {
    color: #9ca3af;
  }
  
  .swap-btn-cancel {
    background: #374151;
    color: #d1d5db;
  }
  
  .swap-btn-cancel:hover {
    background: #4b5563;
  }
  
  .swap-modal-hint {
    color: #6b7280;
    border-top-color: #374151;
  }
}
</style>
