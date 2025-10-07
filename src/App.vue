<template>
  <ErrorBoundary>
    <div id="app">
      <!-- Vue Router View -->
      <router-view />

      <!-- Global Modals -->
      <AuthModal />
      <MarketplacePanel />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from './components/ErrorBoundary.vue'
import AuthModal from './components/auth/AuthModal.vue'
import MarketplacePanel from './components/marketplace/MarketplacePanel.vue'
</script>
