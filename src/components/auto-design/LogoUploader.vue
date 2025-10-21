<template>
  <div class="logo-uploader">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Logo (Optional)
    </h3>

    <!-- Upload Area (when no logo) -->
    <div
      v-if="!logo"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="upload-area"
      :class="{ 'dragging': isDragging }"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />

      <div class="upload-content">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="upload-text">
          <span class="font-semibold">Upload Logo</span>
        </p>
        <p class="upload-hint">
          PNG, JPG, SVG up to 5MB
        </p>
      </div>
    </div>

    <!-- Logo Preview (when logo exists) -->
    <div v-else class="logo-preview-card">
      <!-- Remove Button -->
      <button
        @click="removeLogo"
        class="remove-button"
        title="Remove logo"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Logo Image -->
      <div class="logo-preview">
        <img
          :src="logoUrl"
          :alt="logo.name"
          class="preview-img"
        />
      </div>

      <!-- Logo Info -->
      <div class="logo-info">
        <p class="logo-name">{{ logo.name }}</p>
        <p class="logo-size">{{ formatFileSize(logo.size) }}</p>
      </div>

      <!-- Replace Button -->
      <button
        @click="triggerFileInput"
        class="replace-button"
      >
        Replace Logo
      </button>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="progress-text">Uploading... {{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'

const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const logoUrl = ref<string | null>(null)

const logo = computed(() => autoDesignStore.uploadedFiles.logo)

// Watch for logo changes and create/revoke object URLs
watch(logo, (newLogo, oldLogo) => {
  // Revoke old URL
  if (logoUrl.value) {
    URL.revokeObjectURL(logoUrl.value)
    logoUrl.value = null
  }

  // Create new URL
  if (newLogo) {
    logoUrl.value = URL.createObjectURL(newLogo)
  }
}, { immediate: true })

onUnmounted(() => {
  if (logoUrl.value) {
    URL.revokeObjectURL(logoUrl.value)
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    handleFile(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    handleFile(event.dataTransfer.files[0])
  }
}

function handleFile(file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    authStore.showNotification({
      title: 'Invalid File',
      message: 'Please select an image file',
      type: 'error'
    })
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    authStore.showNotification({
      title: 'File Too Large',
      message: 'Logo must be less than 5MB',
      type: 'error'
    })
    return
  }

  // Set logo in store
  autoDesignStore.setLogo(file)

  // Simulate upload progress
  simulateUpload()
}

function simulateUpload() {
  uploading.value = true
  uploadProgress.value = 0

  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploading.value = false
      uploadProgress.value = 0
    }
  }, 100)
}

function removeLogo() {
  autoDesignStore.setLogo(null as any)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.logo-uploader {
  @apply space-y-2;
}

.upload-area {
  @apply relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-all duration-200;
}

.upload-area:hover {
  @apply border-cyan-500 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-900/10;
}

.upload-area.dragging {
  @apply border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 scale-105;
}

.upload-content {
  @apply flex flex-col items-center;
}

.upload-icon {
  @apply w-10 h-10 text-gray-400 dark:text-gray-500 mb-2;
}

.upload-text {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-1;
}

.upload-hint {
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.logo-preview-card {
  @apply relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md;
}

.remove-button {
  @apply absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors duration-200 shadow-lg;
}

.logo-preview {
  @apply w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden;
}

.preview-img {
  @apply max-w-full max-h-full object-contain p-4;
}

.logo-info {
  @apply p-3 border-t border-gray-200 dark:border-gray-600;
}

.logo-name {
  @apply text-sm font-medium text-gray-900 dark:text-white truncate mb-1;
}

.logo-size {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.replace-button {
  @apply w-full py-2 px-4 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200;
}

.upload-progress {
  @apply mt-2;
}

.progress-bar-container {
  @apply w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600 dark:text-gray-400 text-center mt-1;
}
</style>

