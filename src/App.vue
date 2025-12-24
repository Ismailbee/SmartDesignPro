<template>
  <ErrorBoundary>
    <div class="app-shell">
      <!-- Splash Screen Loading -->
      <div v-if="showSplash" class="splash-screen">
        <div class="splash-content">
          <div class="splash-logo">
            <ion-icon :icon="sparklesOutline" class="logo-icon"></ion-icon>
          </div>
          <h1 class="splash-title">SmartDesignPro</h1>
          <ion-spinner name="crescent" color="light"></ion-spinner>
          <p class="splash-text">Loading your workspace...</p>
        </div>
      </div>

      <!-- Vue Router View -->
      <router-view v-show="!showSplash" />

      <!-- Global Modals (lazy) -->
      <AuthModal v-if="isAuthModalOpen" />
    

      <!-- Success Notification -->
      <SuccessNotification
        v-if="showSuccessNotification"
        :show="showSuccessNotification"
        :title="successNotificationData.title"
        :message="successNotificationData.message"
        :type="successNotificationData.type"
        @close="closeNotification"
      />

      <!-- Toast Notifications -->
      <ToastNotification />
      
      <!-- Memory Monitor (Development) - Hidden -->
      <!-- <MemoryMonitor v-if="isDevelopment" /> -->
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import ErrorBoundary from './components/ErrorBoundary.vue'
const AuthModal = defineAsyncComponent(() => import('./components/auth/AuthModal.vue'))
const SuccessNotification = defineAsyncComponent(() => import('./components/SuccessNotification.vue'))
const ToastNotification = defineAsyncComponent(() => import('./components/ToastNotification.vue'))
import { IonSpinner, IonIcon } from '@ionic/vue'
import { sparklesOutline } from 'ionicons/icons'
// import MemoryMonitor from './components/MemoryMonitor.vue'
import { useHardwareBackButton } from './composables/useHardwareBackButton'

const authStore = useAuthStore()
const { showSuccessNotification, successNotificationData, isAuthReady, isAuthModalOpen } = storeToRefs(authStore)
const { closeNotification } = authStore

// Show memory monitor in development
const isDevelopment = import.meta.env.DEV

// Initialize hardware back button handler
useHardwareBackButton()

// Splash screen - hide once auth is ready (with minimum display time)
const showSplash = ref(true)
const splashStartTime = Date.now()
const MIN_SPLASH_TIME = 1200 // Reduced from 2000ms for faster perceived load

// Watch for auth ready state to hide splash
watch(isAuthReady, (ready) => {
  if (ready) {
    const elapsed = Date.now() - splashStartTime
    const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed)
    setTimeout(() => {
      showSplash.value = false
    }, remaining)
  }
}, { immediate: true })

// Fallback timeout in case auth state never changes
onMounted(() => {
  setTimeout(() => {
    if (showSplash.value) {
      console.warn('Splash timeout reached - forcing hide')
      showSplash.value = false
    }
  }, 5000) // Maximum 5 seconds splash
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  text-align: center;
  color: white;
}

.splash-logo {
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 80px;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.splash-title {
  font-size: 32px;
  font-weight: 700;
  margin: 20px 0;
  letter-spacing: -1px;
}

.splash-text {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 20px;
}

ion-spinner {
  --color: white;
  width: 48px;
  height: 48px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
