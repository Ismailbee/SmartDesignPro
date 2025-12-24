<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Select Background</h2>
            <button @click="close" class="close-button">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="tabs-container">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-button"
              :class="{ active: activeTab === tab.id }"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Default Backgrounds -->
            <div v-if="activeTab === 'default'" class="default-backgrounds">
              <div class="background-grid">
                <button
                  v-for="bg in defaultBackgrounds"
                  :key="bg.id"
                  @click="selectBackground('default', bg.value)"
                  class="background-option"
                  :class="{ selected: selectedBg === bg.value }"
                  :style="{ background: bg.value }"
                >
                  <div class="selected-indicator">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- Custom Upload -->
            <div v-else-if="activeTab === 'custom'" class="custom-upload">
              <div
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                class="upload-area"
                :class="{ dragging: isDragging }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />

                <div v-if="!customBackground" class="upload-content">
                  <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="upload-text">Click to upload or drag and drop</p>
                  <p class="upload-hint">PNG, JPG up to 10MB</p>
                </div>

                <div v-else class="preview-container">
                  <img :src="customBackgroundUrl" alt="Custom background" class="preview-image" />
                  <button @click.stop="removeCustomBackground" class="remove-button">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Online Backgrounds -->
            <div v-else-if="activeTab === 'online'" class="online-backgrounds">
              <div class="search-container">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search backgrounds..."
                  class="search-input"
                />
              </div>
              <div class="background-grid">
                <button
                  v-for="bg in filteredOnlineBackgrounds"
                  :key="bg.id"
                  @click="selectBackground('online', bg.url)"
                  class="background-option online"
                  :class="{ selected: selectedBg === bg.url }"
                >
                  <img :src="bg.url" :alt="bg.name" class="background-image" />
                  <div class="selected-indicator">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button @click="close" class="cancel-button">Cancel</button>
            <button @click="apply" class="apply-button">Apply Background</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', type: string, value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = ref<'default' | 'custom' | 'online'>('default')
const selectedBg = ref<string | null>(null)
const selectedType = ref<string>('default')
const isDragging = ref(false)
const customBackground = ref<File | null>(null)
const customBackgroundUrl = ref<string | null>(null)
const searchQuery = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const tabs = [
  { id: 'default', label: 'Default' },
  { id: 'custom', label: 'Custom Upload' },
  { id: 'online', label: 'Local Library' }
]

const defaultBackgrounds = [
  { id: 1, value: '#ffffff', name: 'White' },
  { id: 2, value: '#000000', name: 'Black' },
  { id: 3, value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple Gradient' },
  { id: 4, value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink Gradient' },
  { id: 5, value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue Gradient' },
  { id: 6, value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green Gradient' },
  { id: 7, value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Sunset' },
  { id: 8, value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Ocean' }
]

type BackgroundManifestItem = {
  id: string
  name: string
  category?: string
  file: string
}

// Local backgrounds from the /svg/background folder - works offline and on mobile
const onlineBackgrounds = ref<Array<{ id: string; name: string; url: string }>>([])

async function loadBackgroundManifest() {
  try {
    const res = await fetch('/svg/background/backgrounds.json', { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to load backgrounds.json (${res.status})`)
    const items = (await res.json()) as BackgroundManifestItem[]
    onlineBackgrounds.value = (items || []).map((it) => ({
      id: it.id,
      name: it.name,
      url: encodeURI(`/svg/background/${it.file}`)
    }))
  } catch (e) {
    console.warn('⚠️ Could not load /svg/background/backgrounds.json. Falling back to empty library.', e)
    onlineBackgrounds.value = []
  }
}

onMounted(() => {
  loadBackgroundManifest()
})

const filteredOnlineBackgrounds = computed(() => {
  if (!searchQuery.value) return onlineBackgrounds.value
  return onlineBackgrounds.value.filter(bg =>
    bg.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function close() {
  emit('update:modelValue', false)
}

function selectBackground(type: string, value: string) {
  selectedType.value = type
  selectedBg.value = value
}

function apply() {
  if (selectedBg.value) {
    emit('select', selectedType.value, selectedBg.value)
    close()
  }
}

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
  if (!file.type.startsWith('image/')) return
  
  customBackground.value = file
  if (customBackgroundUrl.value) {
    URL.revokeObjectURL(customBackgroundUrl.value)
  }
  customBackgroundUrl.value = URL.createObjectURL(file)
  selectBackground('custom', customBackgroundUrl.value)
}

function removeCustomBackground() {
  if (customBackgroundUrl.value) {
    URL.revokeObjectURL(customBackgroundUrl.value)
  }
  customBackground.value = null
  customBackgroundUrl.value = null
  selectedBg.value = null
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
}

.close-button {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.tabs-container {
  @apply flex border-b border-gray-200 dark:border-gray-700 px-6;
}

.tab-button {
  @apply px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-900 dark:hover:text-white transition-colors;
}

.tab-button.active {
  @apply text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400;
}

.tab-content {
  @apply flex-1 overflow-y-auto p-6;
}

.background-grid {
  @apply grid grid-cols-4 gap-4;
}

.background-option {
  @apply relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all cursor-pointer;
}

.background-option.selected {
  @apply border-cyan-600 ring-2 ring-cyan-600;
}

.background-option.online {
  @apply p-0;
}

.background-image {
  @apply w-full h-full object-cover;
}

.selected-indicator {
  @apply absolute inset-0 bg-cyan-600/20 flex items-center justify-center text-white opacity-0 transition-opacity;
}

.background-option.selected .selected-indicator {
  @apply opacity-100;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-all;
}

.upload-area.dragging {
  @apply border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20;
}

.upload-icon {
  @apply w-12 h-12 text-gray-400 mx-auto mb-3;
}

.upload-text {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-1;
}

.upload-hint {
  @apply text-xs text-gray-500;
}

.preview-container {
  @apply relative;
}

.preview-image {
  @apply w-full h-64 object-cover rounded-lg;
}

.remove-button {
  @apply mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors;
}

.search-container {
  @apply mb-4;
}

.search-input {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700;
}

.cancel-button {
  @apply px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.apply-button {
  @apply px-6 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  @apply transition-opacity duration-200;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  @apply opacity-0;
}
</style>

