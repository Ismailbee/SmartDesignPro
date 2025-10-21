 <template>
  <div class="auto-design-page min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Show Sticker Template Panel if category is sticker -->
    <StickerTemplatePanel v-if="selectedCategory === 'sticker'" />

    <!-- Show default Auto Design interface for other categories -->
    <template v-else>
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Auto Design: {{ categoryName }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create professional designs automatically
              </p>
            </div>
            <button
              @click="goBack"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
        <!-- Form Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Design Details
          </h2>

          <!-- Dynamic Text Inputs based on Template -->
          <div class="space-y-4 mb-6">
            <!-- Naming Ceremony Template Fields -->
            <template v-if="selectedCategory === 'naming-ceremony'">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  v-model="formData.text.subtitle"
                  type="text"
                  placeholder="Alhamdulillah on your"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  v-model="formData.text.title"
                  type="text"
                  placeholder="Naming ceremony"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child Name (First)
                </label>
                <input
                  v-model="formData.text.childName"
                  type="text"
                  placeholder="MUHAMMAD"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child Full Name
                </label>
                <input
                  v-model="formData.text.childFullName"
                  type="text"
                  placeholder="AL-AMIN AHMAD"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    v-model="formData.text.date"
                    type="text"
                    placeholder="5TH"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <input
                    v-model="formData.text.month"
                    type="text"
                    placeholder="OCTOBER"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    v-model="formData.text.year"
                    type="text"
                    placeholder="2025"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Courtesy Text
                </label>
                <input
                  v-model="formData.text.courtesy"
                  type="text"
                  placeholder="COURTESY: MUM"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </template>

            <!-- Default Template Fields (for other templates) -->
            <template v-else>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  v-model="formData.text.title"
                  type="text"
                  placeholder="Enter title..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  v-model="formData.text.subtitle"
                  type="text"
                  placeholder="Enter subtitle..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  v-model="formData.text.description"
                  rows="3"
                  placeholder="Enter description..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </template>
          </div>

          <!-- Color Pickers -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Colors</h3>

            <!-- Naming Ceremony Colors -->
            <template v-if="selectedCategory === 'naming-ceremony'">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Background</label>
                  <input
                    v-model="formData.colors.background"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Primary (Yellow)</label>
                  <input
                    v-model="formData.colors.primary"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Accent (Gold)</label>
                  <input
                    v-model="formData.colors.accent"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </template>

            <!-- Default Colors -->
            <template v-else>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Primary Color</label>
                  <input
                    v-model="formData.colors.primary"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Secondary Color</label>
                  <input
                    v-model="formData.colors.secondary"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Size Selector -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size
            </label>
            <select
              v-model="formData.size"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="A5">A5 (148 × 210 mm)</option>
              <option value="Letter">Letter (8.5 × 11 in)</option>
              <option value="Business Card">Business Card (3.5 × 2 in)</option>
              <option value="Custom">Custom Size</option>
            </select>
          </div>

          <!-- Logo Upload (hide for naming ceremony) -->
          <div v-if="selectedCategory !== 'naming-ceremony'" class="mb-6">
            <LogoUploader />
          </div>

          <!-- Image Upload -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ selectedCategory === 'naming-ceremony' ? 'Baby Photo' : 'Image' }}
            </h3>
            <ImageUploader />
          </div>

          <!-- Background Selection -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background
            </h3>
            <button
              @click="showBackgroundPopup = true"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ selectedBackgroundText }}
                </span>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Options -->
          <div class="mb-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="formData.options.removeBackground"
                type="checkbox"
                class="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remove Background from Images
              </span>
            </label>
          </div>

          <!-- Generate Button -->
          <button
            @click="handleGenerate"
            :disabled="isGenerating"
            class="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isGenerating">Generate Design</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating... {{ generationProgress }}%
            </span>
          </button>
        </div>

        <!-- Preview Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Preview
          </h2>

          <!-- AI Processing State -->
          <div v-if="autoDesignStore.isProcessingAI" class="flex flex-col items-center justify-center min-h-[400px]">
            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400 mb-2">{{ autoDesignStore.aiStatus }}</p>
            <div class="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-purple-500 to-pink-600 h-full transition-all duration-300"
                :style="{ width: autoDesignStore.aiProgress + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">{{ autoDesignStore.aiProgress }}%</p>
          </div>

          <!-- Loading State -->
          <div v-else-if="isGenerating" class="flex flex-col items-center justify-center min-h-[400px]">
            <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400 mb-2">Generating your design...</p>
            <div class="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300"
                :style="{ width: generationProgress + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">{{ generationProgress }}%</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!currentProject" class="flex flex-col items-center justify-center min-h-[400px] text-center">
            <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Design Yet</h3>
            <p class="text-gray-600 dark:text-gray-400 max-w-sm">
              Fill out the form and click "Generate Design" to create your professional design automatically.
            </p>
          </div>

          <!-- Preview (when available) -->
          <div v-else class="space-y-4">
            <!-- Debug info -->
            <div class="text-xs text-gray-500 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div>Status: {{ currentProject.status }}</div>
              <div>Preview URL: {{ currentProject.design?.previewUrl || 'No URL' }}</div>
            </div>

            <div class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                v-if="currentProject.design?.previewUrl"
                :src="currentProject.design.previewUrl"
                alt="Design Preview"
                class="w-full h-full object-contain"
                @error="(e) => console.error('Image load error:', e)"
                @load="() => console.log('Image loaded successfully')"
              />
              <div v-else class="flex items-center justify-center h-full text-gray-400">
                No preview URL available
              </div>
            </div>
            <div class="flex gap-3">
              <button class="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Download
              </button>
              <button class="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Edit in Canvas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-300">Phase 4 - AI Integration Complete!</h4>
            <p class="text-sm text-blue-700 dark:text-blue-400 mt-1">
              AI-powered background removal and text layout are now available! Enable "Remove Background" option to process images automatically.
            </p>
          </div>
        </div>
      </div>
      </div>

      <!-- Background Selection Popup -->
      <BackgroundSelectionPopup
        v-model="showBackgroundPopup"
        @select="handleBackgroundSelect"
      />

      <!-- Design Preview Modal -->
      <DesignPreviewModal
        v-model="autoDesignStore.showPreviewModal"
        :project="autoDesignStore.currentProject"
        @download="handleDownload"
        @send-to-editor="handleSendToEditor"
        @retouch="handleRetouch"
        @create-more="handleCreateMore"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import StickerTemplatePanel from '@/components/auto-design/StickerTemplatePanel.vue'
import LogoUploader from '@/components/auto-design/LogoUploader.vue'
import ImageUploader from '@/components/auto-design/ImageUploader.vue'
import BackgroundSelectionPopup from '@/components/auto-design/BackgroundSelectionPopup.vue'
import DesignPreviewModal from '@/components/auto-design/DesignPreviewModal.vue'
import * as autoDesignApi from '@/services/auto-design-api'

const route = useRoute()
const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()

const selectedCategory = ref<string>('')
const showBackgroundPopup = ref(false)
const selectedBackground = ref<{ type: string; value: string } | null>(null)

const categoryName = computed(() => {
  return selectedCategory.value
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const selectedBackgroundText = computed(() => {
  if (!selectedBackground.value) return 'Select Background'
  if (selectedBackground.value.type === 'default') return 'Default Background'
  if (selectedBackground.value.type === 'custom') return 'Custom Background'
  if (selectedBackground.value.type === 'online') return 'Online Background'
  return 'Select Background'
})

const formData = computed(() => autoDesignStore.formData)
const isGenerating = computed(() => autoDesignStore.isGenerating)
const generationProgress = computed(() => autoDesignStore.generationProgress)
const currentProject = computed(() => autoDesignStore.currentProject)

onMounted(() => {
  // Get category from URL query parameter
  const category = route.query.category as string
  if (category) {
    selectedCategory.value = category
    autoDesignStore.setCategory(category)
  } else {
    // Default category if none specified
    selectedCategory.value = 'business-card'
    autoDesignStore.setCategory('business-card')
  }

  // Initialize Socket.io connection
  autoDesignStore.initializeSocket()
})

function handleBackgroundSelect(type: string, value: string) {
  selectedBackground.value = { type, value }
  autoDesignStore.updateFormData('options.backgroundType', type)
  autoDesignStore.updateFormData('options.customBackground', value)

  authStore.showNotification({
    title: 'Background Selected',
    message: 'Background has been applied to your design',
    type: 'success'
  })
}

async function handleGenerate() {
  try {
    await autoDesignStore.generateDesign()
  } catch (error: any) {
    authStore.showNotification({
      title: 'Generation Failed',
      message: error.message || 'Failed to generate design',
      type: 'error'
    })
  }
}

function goBack() {
  router.push('/home')
}

async function handleDownload(format: 'png' | 'jpeg' | 'pdf') {
  if (!autoDesignStore.currentProject) return

  try {
    const blob = await autoDesignApi.downloadDesign(autoDesignStore.currentProject.id, format)

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `design-${autoDesignStore.currentProject.id}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    authStore.showNotification({
      title: 'Download Started',
      message: `Downloading design as ${format.toUpperCase()}`,
      type: 'success'
    })
  } catch (error: any) {
    authStore.showNotification({
      title: 'Download Failed',
      message: error.message || 'Failed to download design',
      type: 'error'
    })
  }
}

function handleSendToEditor() {
  if (!autoDesignStore.currentProject) return
  autoDesignStore.sendToEditor(autoDesignStore.currentProject)
}

function handleRetouch() {
  authStore.showNotification({
    title: 'Coming Soon',
    message: 'Retouch feature will be available in Phase 6',
    type: 'info'
  })
}

function handleCreateMore() {
  authStore.showNotification({
    title: 'Coming Soon',
    message: 'Create More feature will be available in Phase 6',
    type: 'info'
  })
}
</script>

<style scoped>
/* Custom scrollbar for dark mode */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>

