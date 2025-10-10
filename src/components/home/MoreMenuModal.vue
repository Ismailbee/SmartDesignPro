<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <Transition name="modal-scale">
          <div v-if="isOpen" class="modal-container" @click.stop>
            <!-- Close Button -->
            <button class="close-button" @click="closeModal" aria-label="Close menu">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Modal Header -->
            <div class="modal-header">
              <h2 class="modal-title">More Options</h2>
              <p class="modal-subtitle">Explore additional features and resources</p>
            </div>

            <!-- Modal Content Grid -->
            <div class="modal-content">
              <!-- Left Section - Legal & Settings -->
              <div class="menu-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Legal & Settings
                </h3>
                <div class="menu-items">
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('terms')">
                    <span class="item-icon">📜</span>
                    <span class="item-text">Terms of Service</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('privacy')">
                    <span class="item-icon">🔒</span>
                    <span class="item-text">Privacy Policy</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('privacy-settings')">
                    <span class="item-icon">⚙️</span>
                    <span class="item-text">Privacy Settings</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('cookies')">
                    <span class="item-icon">🍪</span>
                    <span class="item-text">Cookie Policy</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('about')">
                    <span class="item-icon">ℹ️</span>
                    <span class="item-text">About Us</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Right Section - User Actions -->
              <div class="menu-section">
                <h3 class="section-title">
                  <svg class="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Help & Support
                </h3>
                <div class="menu-items">
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('suggest')">
                    <span class="item-icon">💡</span>
                    <span class="item-text">Suggest a Feature</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('help')">
                    <span class="item-icon">❓</span>
                    <span class="item-text">Help Center</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('rate')">
                    <span class="item-icon">⭐</span>
                    <span class="item-text">Rate App</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('schedule')">
                    <span class="item-icon">📅</span>
                    <span class="item-text">Schedule/Booking</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('support')">
                    <span class="item-icon">💬</span>
                    <span class="item-text">Contact Support</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href="#" class="menu-item" @click.prevent="handleMenuClick('faq')">
                    <span class="item-icon">📖</span>
                    <span class="item-text">FAQ</span>
                    <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  navigate: [action: string]
}>()

const closeModal = () => {
  emit('close')
}

const handleMenuClick = (action: string) => {
  console.log('Menu action:', action)
  emit('navigate', action)
  closeModal()
}

// Handle Escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

// Prevent body scroll when modal is open
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.modal-header {
  padding: 40px 40px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.modal-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.modal-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 40px;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.section-icon {
  width: 22px;
  height: 22px;
  color: #06b6d4;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background: rgba(6, 182, 212, 0.08);
  transform: translateX(4px);
}

.item-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #334155;
}

.item-arrow {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  opacity: 0;
  transition: all 0.2s ease;
}

.menu-item:hover .item-arrow {
  opacity: 1;
  transform: translateX(2px);
}

/* Modal animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Scrollbar */
.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    border-radius: 16px;
    max-height: 85vh;
  }

  .modal-header {
    padding: 30px 24px 16px;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-subtitle {
    font-size: 14px;
  }

  .modal-content {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 24px;
  }

  .section-title {
    font-size: 16px;
  }

  .menu-item {
    padding: 12px 14px;
  }

  .item-text {
    font-size: 14px;
  }
}
</style>

