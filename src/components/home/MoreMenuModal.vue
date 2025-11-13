<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <!-- Header with Close Button -->
          <div class="modal-header">
              <div class="header-content">
                <div class="header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <div class="header-text">
                  <h2 class="modal-title">More Options</h2>
                  <p class="modal-subtitle">Discover all features and resources</p>
                </div>
              </div>
              <button class="close-button" aria-label="Close menu" @click="closeModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Content Grid -->
            <div class="modal-content">
              <!-- Account & Rewards Section -->
              <div class="menu-section">
                <div class="section-header">
                  <div class="section-icon-wrapper account">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="section-title">Account & Rewards</h3>
                </div>
                <div class="menu-grid">
                  <button class="menu-card" @click="handleMenuClick('referral')">
                    <div class="card-icon gift">🎁</div>
                    <div class="card-content">
                      <h4 class="card-title">Refer & Earn</h4>
                      <p class="card-desc">Invite friends and earn rewards</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-card" @click="handleMenuClick('subscription')">
                    <div class="card-icon diamond">💎</div>
                    <div class="card-content">
                      <h4 class="card-title">Upgrade Plan</h4>
                      <p class="card-desc">Unlock premium features</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-card" @click="handleMenuClick('tokens-and-plans')">
                    <div class="card-icon token">🪙</div>
                    <div class="card-content">
                      <h4 class="card-title">Tokens & Plans</h4>
                      <p class="card-desc">Manage your credits</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-card" @click="handleMenuClick('notifications')">
                    <div class="card-icon notification">🔔</div>
                    <div class="card-content">
                      <h4 class="card-title">Notifications</h4>
                      <p class="card-desc">View all your alerts</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Help & Support Section -->
              <div class="menu-section">
                <div class="section-header">
                  <div class="section-icon-wrapper support">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 class="section-title">Help & Support</h3>
                </div>
                <div class="menu-grid">
                  <button class="menu-card" @click="handleMenuClick('suggest')">
                    <div class="card-icon idea">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div class="card-content">
                      <h4 class="card-title">Suggest Feature</h4>
                      <p class="card-desc">Share your ideas with us</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-card" @click="handleMenuClick('help')">
                    <div class="card-icon question">❓</div>
                    <div class="card-content">
                      <h4 class="card-title">Help Center</h4>
                      <p class="card-desc">Find answers quickly</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-card" @click="handleMenuClick('support')">
                    <div class="card-icon chat">💬</div>
                    <div class="card-content">
                      <h4 class="card-title">Contact Support</h4>
                      <p class="card-desc">We're here to help</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-card" @click="handleMenuClick('faq')">
                    <div class="card-icon book">📖</div>
                    <div class="card-content">
                      <h4 class="card-title">FAQ</h4>
                      <p class="card-desc">Common questions</p>
                    </div>
                    <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Legal & Settings Section -->
              <div class="menu-section">
                <div class="section-header">
                  <div class="section-icon-wrapper legal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="section-title">Legal & Settings</h3>
                </div>
                <div class="menu-list">
                  <button class="menu-list-item" @click="handleMenuClick('terms')">
                    <span class="list-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <span class="list-text">Terms of Service</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-list-item" @click="handleMenuClick('privacy')">
                    <span class="list-icon">🔒</span>
                    <span class="list-text">Privacy Policy</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-list-item" @click="handleMenuClick('privacy-settings')">
                    <span class="list-icon">⚙️</span>
                    <span class="list-text">Privacy Settings</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-list-item" @click="handleMenuClick('cookies')">
                    <span class="list-icon">🍪</span>
                    <span class="list-text">Cookie Policy</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-list-item" @click="handleMenuClick('about')">
                    <span class="list-icon">ℹ️</span>
                    <span class="list-text">About Us</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Resources Section -->
              <div class="menu-section">
                <div class="section-header">
                  <div class="section-icon-wrapper resources">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 class="section-title">Resources</h3>
                </div>
                <div class="menu-list">
                  <button class="menu-list-item" @click="handleMenuClick('rate')">
                    <span class="list-icon">⭐</span>
                    <span class="list-text">Rate App</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button class="menu-list-item" @click="handleMenuClick('videos')">
                    <span class="list-icon">🎬</span>
                    <span class="list-text">Tutorial Videos</span>
                    <svg class="list-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <div class="footer-content">
                <p class="footer-text">Need immediate assistance?</p>
                <button class="footer-button" @click="handleMenuClick('support')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat with Support
                </button>
              </div>
            </div>
          </div>
        </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

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
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
  padding: 20px;
}

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 24px;
  max-width: 1100px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
  position: relative;
  opacity: 1;
  transform: scale(1);
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  flex-shrink: 0;
}

.header-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.header-text {
  flex: 1;
}

.modal-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.close-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #475569;
}

/* Modal Content */
.modal-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 40px;
}

/* Menu Section */
.menu-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.section-icon-wrapper.account {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.section-icon-wrapper.support {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.section-icon-wrapper.legal {
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
}

.section-icon-wrapper.resources {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.section-icon-wrapper svg {
  width: 22px;
  height: 22px;
  color: #1e293b;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Menu Grid (Card Style) */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.menu-card:hover::before {
  opacity: 1;
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.card-icon svg {
  width: 24px;
  height: 24px;
  color: #1e293b;
}

.card-icon.gift {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.card-icon.diamond {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.card-icon.token {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
}

.card-icon.notification {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

.card-icon.idea {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.card-icon.question {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.card-icon.chat {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.card-icon.book {
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
}

.card-content {
  flex: 1;
  text-align: left;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.card-arrow {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.menu-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #667eea;
}

/* Menu List (Compact Style) */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-list-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.list-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
}

.list-icon svg {
  width: 16px;
  height: 16px;
  color: #475569;
}

.list-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.list-arrow {
  width: 16px;
  height: 16px;
  color: #cbd5e1;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.menu-list-item:hover .list-arrow {
  opacity: 1;
  transform: translateX(2px);
  color: #667eea;
}

/* Modal Footer */
.modal-footer {
  border-top: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 24px 40px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.footer-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

.footer-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.footer-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.footer-button svg {
  width: 18px;
  height: 18px;
}

/* Modal Animations */
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

/* Hide Scrollbar while maintaining scroll functionality */
.modal-container::-webkit-scrollbar {
  display: none;
  width: 0px;
}

.modal-container::-webkit-scrollbar-track {
  display: none;
}

.modal-container::-webkit-scrollbar-thumb {
  display: none;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  display: none;
}

/* Responsive Design */
@media (max-width: 900px) {
  .modal-content {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px;
  }
}

@media (max-width: 768px) {
  .modal-header {
    padding: 24px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .header-icon svg {
    width: 24px;
    height: 24px;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-subtitle {
    font-size: 13px;
  }

  .close-button {
    width: 40px;
    height: 40px;
  }

  .modal-content {
    padding: 24px;
    gap: 28px;
  }

  .section-title {
    font-size: 16px;
  }

  .menu-card {
    padding: 14px;
  }

  .card-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-desc {
    font-size: 12px;
  }

  .menu-list-item {
    padding: 10px 14px;
  }

  .list-text {
    font-size: 13px;
  }

  .modal-footer {
    padding: 20px 24px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    border-radius: 20px;
  }

  .modal-header {
    padding: 20px;
  }

  .header-content {
    gap: 12px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .header-icon svg {
    width: 20px;
    height: 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-content {
    padding: 20px;
    gap: 24px;
  }

  .menu-section {
    gap: 16px;
  }

  .section-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .section-icon-wrapper svg {
    width: 18px;
    height: 18px;
  }

  .menu-grid {
    gap: 10px;
  }

  .menu-card {
    padding: 12px;
    gap: 12px;
  }

  .modal-footer {
    padding: 16px 20px;
  }
}
</style>

