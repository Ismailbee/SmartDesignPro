<template>
  <div class="image-uploader">
    <div class="uploader-header">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Images ({{ images.length }}/99)
      </h3>
      <button
        v-if="images.length > 0"
        @click="clearAll"
        class="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
      >
        Clear All
      </button>
    </div>

    <!-- Upload Area -->
    <div
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="upload-area"
      :class="{ 'dragging': isDragging, 'disabled': images.length >= 99 }"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />

      <div class="upload-content">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="upload-text">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="upload-hint">
          PNG, JPG, GIF up to 10MB (Max 99 images)
        </p>
      </div>
    </div>

    <!-- Image Preview Carousel -->
    <div v-if="images.length > 0" class="image-carousel-container">
      <ImagePreviewCarousel
        :images="images"
        @remove="removeImage"
      />
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
import { ref, computed } from 'vue'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import ImagePreviewCarousel from './ImagePreviewCarousel.vue'

const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

const images = computed(() => autoDesignStore.uploadedFiles.images)

function triggerFileInput() {
  if (images.value.length >= 99) {
    authStore.showNotification({
      title: 'Maximum Images Reached',
      message: 'You can only upload up to 99 images',
      type: 'error'
    })
    return
  }
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

function handleFiles(files: File[]) {
  // Filter only image files
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    authStore.showNotification({
      title: 'Invalid Files',
      message: 'Please select only image files',
      type: 'error'
    })
    return
  }

  // Check file sizes (max 10MB per file)
  const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024)
  if (oversizedFiles.length > 0) {
    authStore.showNotification({
      title: 'Files Too Large',
      message: `${oversizedFiles.length} file(s) exceed 10MB limit`,
      type: 'error'
    })
    return
  }

  // Add images to store
  autoDesignStore.addImages(imageFiles)

  // Simulate upload progress (in Phase 3, this will be real Firebase upload)
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

function removeImage(index: number) {
  autoDesignStore.removeImage(index)
}

function clearAll() {
  if (confirm('Are you sure you want to remove all images?')) {
    while (images.value.length > 0) {
      autoDesignStore.removeImage(0)
    }
  }
}
</script>

<style scoped>
.image-uploader {
  @apply space-y-4;
}

.uploader-header {
  @apply flex items-center justify-between;
}

.upload-area {
  @apply relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-all duration-200;
}

.upload-area:hover:not(.disabled) {
  @apply border-cyan-500 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-900/10;
}

.upload-area.dragging {
  @apply border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 scale-105;
}

.upload-area.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.upload-content {
  @apply flex flex-col items-center;
}

.upload-icon {
  @apply w-12 h-12 text-gray-400 dark:text-gray-500 mb-3;
}

.upload-text {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-1;
}

.upload-hint {
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.image-carousel-container {
  @apply mt-4;
}

.upload-progress {
  @apply mt-4;
}

.progress-bar-container {
  @apply w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600 dark:text-gray-400 text-center mt-2;
}
</style>

