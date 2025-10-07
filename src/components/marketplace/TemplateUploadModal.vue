<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isUploadModalOpen" class="upload-modal-overlay" @click.self="handleClose">
        <div class="upload-modal">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Upload Template</h2>
            <button class="close-btn" @click="handleClose">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="upload-form">
            <!-- File Upload -->
            <div class="form-section">
              <label class="form-label">Template File *</label>
              <div
                class="file-dropzone"
                :class="{ 'drag-over': isDragging, 'has-file': formData.file }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.pdf,.json"
                  @change="handleFileSelect"
                  hidden
                />
                <div v-if="!formData.file" class="dropzone-content">
                  <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="dropzone-text">Drag & drop your template file here</p>
                  <p class="dropzone-subtext">or click to browse</p>
                  <p class="dropzone-formats">Supported: SVG, PNG, JPG, PDF, JSON</p>
                </div>
                <div v-else class="file-preview">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="file-info">
                    <p class="file-name">{{ formData.file.name }}</p>
                    <p class="file-size">{{ formatFileSize(formData.file.size) }}</p>
                  </div>
                  <button type="button" class="remove-file-btn" @click.stop="removeFile">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Thumbnail Upload (Optional) -->
            <div class="form-section">
              <label class="form-label">Thumbnail (Optional)</label>
              <div class="thumbnail-upload" @click="triggerThumbnailInput">
                <input
                  ref="thumbnailInput"
                  type="file"
                  accept="image/*"
                  @change="handleThumbnailSelect"
                  hidden
                />
                <div v-if="!formData.thumbnail" class="thumbnail-placeholder">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Add thumbnail</p>
                </div>
                <div v-else class="thumbnail-preview">
                  <img :src="thumbnailPreview" alt="Thumbnail" />
                  <button type="button" class="remove-thumbnail-btn" @click.stop="removeThumbnail">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Title -->
            <div class="form-section">
              <label class="form-label" for="title">Title *</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="Enter template title"
                required
              />
            </div>

            <!-- Description -->
            <div class="form-section">
              <label class="form-label" for="description">Description *</label>
              <textarea
                id="description"
                v-model="formData.description"
                class="form-textarea"
                placeholder="Describe your template"
                rows="4"
                required
              ></textarea>
            </div>

            <!-- Category -->
            <div class="form-section">
              <label class="form-label" for="category">Category *</label>
              <select id="category" v-model="formData.category" class="form-select" required>
                <option value="">Select a category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Tags -->
            <div class="form-section">
              <label class="form-label" for="tags">Tags</label>
              <div class="tags-input-container">
                <div class="tags-list">
                  <span v-for="(tag, index) in formData.tags" :key="index" class="tag">
                    {{ tag }}
                    <button type="button" @click="removeTag(index)" class="remove-tag-btn">×</button>
                  </span>
                </div>
                <input
                  v-model="tagInput"
                  type="text"
                  class="tag-input"
                  placeholder="Add tags (press Enter)"
                  @keydown.enter.prevent="addTag"
                />
              </div>
              <p class="form-hint">Press Enter to add tags</p>
            </div>

            <!-- Access Level & Price -->
            <div class="form-row">
              <div class="form-section">
                <label class="form-label" for="accessLevel">Access Level *</label>
                <select id="accessLevel" v-model="formData.accessLevel" class="form-select" required>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>

              <div class="form-section">
                <label class="form-label" for="price">Price (₦)</label>
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  class="form-input"
                  placeholder="0"
                  min="0"
                  :disabled="formData.accessLevel === 'free'"
                />
              </div>
            </div>

            <!-- Dimensions -->
            <div class="form-row">
              <div class="form-section">
                <label class="form-label" for="width">Width (px) *</label>
                <input
                  id="width"
                  v-model.number="formData.width"
                  type="number"
                  class="form-input"
                  placeholder="800"
                  min="1"
                  required
                />
              </div>

              <div class="form-section">
                <label class="form-label" for="height">Height (px) *</label>
                <input
                  id="height"
                  v-model.number="formData.height"
                  type="number"
                  class="form-input"
                  placeholder="600"
                  min="1"
                  required
                />
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-message">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="success-message">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ success }}</span>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="handleClose" :disabled="isUploading">
                Cancel
              </button>
              <button type="submit" class="btn-submit" :disabled="isUploading || !formData.file">
                <svg v-if="isUploading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isUploading ? 'Uploading...' : 'Upload Template' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '@/stores/marketplace'
import { useAuthStore } from '@/stores/auth'
import { TEMPLATE_CATEGORIES } from '@/types/marketplace'
import type { TemplateCategory, TemplateAccessLevel } from '@/types/marketplace'

const marketplaceStore = useMarketplaceStore()
const authStore = useAuthStore()
const { isUploadModalOpen } = storeToRefs(marketplaceStore)
const { closeUploadModal, uploadTemplate } = marketplaceStore

const fileInput = ref<HTMLInputElement | null>(null)
const thumbnailInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const tagInput = ref('')
const thumbnailPreview = ref<string | null>(null)

const formData = ref({
  file: null as File | null,
  thumbnail: null as File | null,
  title: '',
  description: '',
  category: '' as TemplateCategory | '',
  tags: [] as string[],
  accessLevel: 'free' as TemplateAccessLevel,
  price: 0,
  width: 800,
  height: 600
})

const categories = computed(() => 
  Object.values(TEMPLATE_CATEGORIES).filter(cat => cat.id !== 'all')
)

// Auto-set price to 0 for free templates
watch(() => formData.value.accessLevel, (newLevel) => {
  if (newLevel === 'free') {
    formData.value.price = 0
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

function triggerThumbnailInput() {
  thumbnailInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.value.file = target.files[0]
  }
}

function handleThumbnailSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.value.thumbnail = target.files[0]
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

function handleFileDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    formData.value.file = files[0]
  }
}

function removeFile() {
  formData.value.file = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function removeThumbnail() {
  formData.value.thumbnail = null
  thumbnailPreview.value = null
  if (thumbnailInput.value) {
    thumbnailInput.value.value = ''
  }
}

function addTag() {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

function removeTag(index: number) {
  formData.value.tags.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleSubmit() {
  if (!authStore.isAuthenticated) {
    error.value = 'You must be logged in to upload templates'
    return
  }

  if (!formData.value.file) {
    error.value = 'Please select a template file'
    return
  }

  if (!formData.value.category) {
    error.value = 'Please select a category'
    return
  }

  isUploading.value = true
  error.value = null
  success.value = null

  try {
    await uploadTemplate({
      file: formData.value.file,
      thumbnail: formData.value.thumbnail || undefined,
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.category as TemplateCategory,
      tags: formData.value.tags,
      accessLevel: formData.value.accessLevel,
      price: formData.value.price,
      width: formData.value.width,
      height: formData.value.height
    })

    success.value = 'Template uploaded successfully! Pending admin approval.'
    
    // Reset form after 2 seconds
    setTimeout(() => {
      resetForm()
      closeUploadModal()
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to upload template'
  } finally {
    isUploading.value = false
  }
}

function resetForm() {
  formData.value = {
    file: null,
    thumbnail: null,
    title: '',
    description: '',
    category: '',
    tags: [],
    accessLevel: 'free',
    price: 0,
    width: 800,
    height: 600
  }
  thumbnailPreview.value = null
  error.value = null
  success.value = null
}

function handleClose() {
  if (!isUploading.value) {
    resetForm()
    closeUploadModal()
  }
}
</script>

<style scoped src="./upload-modal-styles.css"></style>

