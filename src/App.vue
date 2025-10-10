<template>
  <ErrorBoundary>
    <div id="app">
      <!-- Vue Router View -->
      <router-view />

      <!-- Global Modals -->
      <AuthModal />
      <MarketplacePanel />

      <!-- Success Notification -->
      <SuccessNotification
        :show="showSuccessNotification"
        :title="successNotificationData.title"
        :message="successNotificationData.message"
        :type="successNotificationData.type"
        @close="closeNotification"
      />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import ErrorBoundary from './components/ErrorBoundary.vue'
import AuthModal from './components/auth/AuthModal.vue'
import MarketplacePanel from './components/marketplace/MarketplacePanel.vue'
import SuccessNotification from './components/SuccessNotification.vue'

const authStore = useAuthStore()
const { showSuccessNotification, successNotificationData } = storeToRefs(authStore)
const { closeNotification } = authStore
</script>
