<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <button
              class="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg shadow-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              @click="handleBack"
            >
              <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Letter Head Templates</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose a template to start designing your letterhead</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors flex items-center gap-2"
              @click="handleCreateBlank"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Blank
            </button>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Bar -->
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search templates..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <!-- Category Filter -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="corporate">Corporate</option>
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
          </select>
        </div>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
          @click="selectTemplate(template)"
        >
          <!-- Template Preview -->
          <div class="relative aspect-[8.5/11] bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <img
              v-if="template.backgroundImage"
              :src="template.backgroundImage"
              :alt="template.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <!-- Overlay on Hover -->
            <div class="absolute inset-0 bg-purple-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <button class="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                Use Template
              </button>
            </div>

            <!-- Premium Badge -->
            <div v-if="template.isPremium" class="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              PRO
            </div>
          </div>

          <!-- Template Info -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{{ template.name }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">{{ template.description }}</p>
            
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {{ template.category }}
              </span>
              
              <div class="flex items-center gap-1 text-yellow-500">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">{{ template.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTemplates.length === 0" class="text-center py-16">
        <svg class="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No templates found</h3>
        <p class="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('all')

interface LetterHeadTemplate {
  id: string
  name: string
  description: string
  category: string
  backgroundImage?: string
  headerStyle: 'centered' | 'left' | 'split'
  accentColor: string
  isPremium: boolean
  rating: number
}

// Sample templates - you can expand this
const templates = ref<LetterHeadTemplate[]>([
  {
    id: 'blank',
    name: 'Blank Template',
    description: 'Start from scratch with a clean canvas',
    category: 'classic',
    backgroundImage: '/templates/letterhead-previews/blank.svg',
    headerStyle: 'centered',
    accentColor: '#3B82F6',
    isPremium: false,
    rating: 4.5
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue-themed letterhead',
    category: 'corporate',
    backgroundImage: '/templates/letterhead-previews/corporate-blue.svg',
    headerStyle: 'split',
    accentColor: '#1E40AF',
    isPremium: false,
    rating: 4.8
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'Stylish gradient design for creative professionals',
    category: 'modern',
    backgroundImage: '/templates/letterhead-previews/modern-gradient.svg',
    headerStyle: 'centered',
    accentColor: '#8B5CF6',
    isPremium: true,
    rating: 4.9
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    description: 'Timeless design with elegant borders',
    category: 'classic',
    backgroundImage: '/templates/letterhead-previews/classic-elegant.svg',
    headerStyle: 'centered',
    accentColor: '#059669',
    isPremium: false,
    rating: 4.7
  },
  {
    id: 'creative-artistic',
    name: 'Creative Artistic',
    description: 'Bold and artistic design for creatives',
    category: 'creative',
    backgroundImage: '/templates/letterhead-previews/creative-artistic.svg',
    headerStyle: 'left',
    accentColor: '#DC2626',
    isPremium: true,
    rating: 4.6
  },
  {
    id: 'professional-minimal',
    name: 'Professional Minimal',
    description: 'Clean and minimal professional design',
    category: 'professional',
    backgroundImage: '/templates/letterhead-previews/professional-minimal.svg',
    headerStyle: 'left',
    accentColor: '#0F172A',
    isPremium: false,
    rating: 4.8
  },
  {
    id: 'corporate-gold',
    name: 'Corporate Gold',
    description: 'Luxurious gold-accented corporate design',
    category: 'corporate',
    backgroundImage: '/templates/letterhead-previews/corporate-gold.svg',
    headerStyle: 'split',
    accentColor: '#D97706',
    isPremium: true,
    rating: 4.9
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Futuristic design for tech companies',
    category: 'modern',
    backgroundImage: '/templates/letterhead-previews/modern-tech.svg',
    headerStyle: 'centered',
    accentColor: '#06B6D4',
    isPremium: true,
    rating: 4.7
  },
  {
    id: 'creative-colorful',
    name: 'Creative Colorful',
    description: 'Vibrant and colorful design',
    category: 'creative',
    backgroundImage: '/templates/letterhead-previews/creative-colorful.svg',
    headerStyle: 'centered',
    accentColor: '#EC4899',
    isPremium: false,
    rating: 4.5
  }
])

// Filtered templates based on search and category
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || template.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const selectTemplate = (template: LetterHeadTemplate) => {
  // Navigate to letterhead page with template data
  router.push({
    name: 'letterhead',
    query: {
      templateId: template.id,
      headerStyle: template.headerStyle,
      accentColor: encodeURIComponent(template.accentColor),
      backgroundImage: template.backgroundImage ? encodeURIComponent(template.backgroundImage) : ''
    }
  })
}

const handleCreateBlank = () => {
  router.push({ name: 'letterhead' })
}

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
