<template>
  <ErrorBoundary>
    <div id="app">
      <!-- Vue Router View -->
      <router-view />

      <!-- Global Modals -->
      <AuthModal />
    

      <!-- Success Notification -->
      <SuccessNotification
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
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import ErrorBoundary from './components/ErrorBoundary.vue'
import AuthModal from './components/auth/AuthModal.vue'
import SuccessNotification from './components/SuccessNotification.vue'
import ToastNotification from './components/ToastNotification.vue'
// import MemoryMonitor from './components/MemoryMonitor.vue'
import { useHardwareBackButton } from './composables/useHardwareBackButton'

const authStore = useAuthStore()
const { showSuccessNotification, successNotificationData } = storeToRefs(authStore)
const { closeNotification } = authStore

// Show memory monitor in development
const isDevelopment = import.meta.env.DEV

// Initialize hardware back button handler
useHardwareBackButton()
</script>
