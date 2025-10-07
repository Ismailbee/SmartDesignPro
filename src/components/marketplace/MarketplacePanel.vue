<template>
  <Teleport to="body">
    <Transition name="marketplace-fade">
      <div v-if="isMarketplaceOpen" class="marketplace-overlay" @click.self="closeMarketplace">
        <div class="marketplace-panel">
          <!-- Header -->
          <div class="marketplace-header">
            <div class="header-content">
              <div class="header-title">
                <span class="title-icon">🎨</span>
                <h2>Template Marketplace</h2>
              </div>
              <p class="header-subtitle">Discover professionally designed templates</p>
            </div>
            <button class="close-btn" @click="closeMarketplace" aria-label="Close">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="search-section">
            <div class="search-bar">
              <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search templates..."
                class="search-input"
                @input="handleSearch"
              />
              <button v-if="searchQuery" class="clear-search" @click="clearSearch">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Quick Filters -->
            <div class="quick-filters">
              <button
                v-for="sortOption in sortOptions"
                :key="sortOption.value"
                :class="['filter-btn', { active: filters.sortBy === sortOption.value }]"
                @click="setSort(sortOption.value)"
              >
                <span>{{ sortOption.icon }}</span>
                <span>{{ sortOption.label }}</span>
              </button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="marketplace-content">
            <!-- Left Sidebar - Categories -->
            <div class="sidebar-left">
              <div class="sidebar-section">
                <h3 class="sidebar-title">Categories</h3>
                <div class="category-list">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    :class="['category-btn', { active: filters.category === category.id }]"
                    @click="setCategory(category.id)"
                  >
                    <span class="category-icon">{{ category.icon }}</span>
                    <span class="category-name">{{ category.name }}</span>
                  </button>
                </div>
              </div>

              <div class="sidebar-section">
                <h3 class="sidebar-title">Access Level</h3>
                <div class="access-filters">
                  <button
                    :class="['access-btn', { active: !filters.accessLevel }]"
                    @click="setAccessLevel(undefined)"
                  >
                    All
                  </button>
                  <button
                    :class="['access-btn free', { active: filters.accessLevel === 'free' }]"
                    @click="setAccessLevel('free')"
                  >
                    Free
                  </button>
                  <button
                    :class="['access-btn premium', { active: filters.accessLevel === 'premium' }]"
                    @click="setAccessLevel('premium')"
                  >
                    Premium
                  </button>
                  <button
                    :class="['access-btn exclusive', { active: filters.accessLevel === 'exclusive' }]"
                    @click="setAccessLevel('exclusive')"
                  >
                    Exclusive
                  </button>
                </div>
              </div>

              <div class="sidebar-section">
                <button class="upload-btn" @click="openUploadModal">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload Template</span>
                </button>
              </div>
            </div>

            <!-- Main Grid -->
            <div class="templates-grid-container">
              <!-- Loading State -->
              <div v-if="isLoading && templates.length === 0" class="loading-state">
                <div class="loading-spinner">
                  <svg class="animate-spin w-12 h-12" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>Loading templates...</p>
                </div>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="error-state">
                <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchTemplates()">Try Again</button>
              </div>

              <!-- Empty State -->
              <div v-else-if="templates.length === 0" class="empty-state">
                <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No templates found</p>
                <button class="clear-filters-btn" @click="clearFilters">Clear Filters</button>
              </div>

              <!-- Templates Grid -->
              <div v-else class="templates-grid">
                <TemplateCard
                  v-for="template in templates"
                  :key="template.id"
                  :template="template"
                  @preview="openPreview"
                  @use="handleUseTemplate"
                  @save="handleSaveTemplate"
                  @like="handleLikeTemplate"
                />
              </div>

              <!-- Load More -->
              <div v-if="hasMore && !isLoading" class="load-more-section">
                <button class="load-more-btn" @click="loadMore">
                  Load More Templates
                </button>
              </div>

              <!-- Loading More -->
              <div v-if="isLoading && templates.length > 0" class="loading-more">
                <svg class="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            <!-- Right Sidebar - Featured -->
            <div class="sidebar-right">
              <div class="sidebar-section">
                <h3 class="sidebar-title">Featured</h3>
                <div class="featured-list">
                  <div
                    v-for="template in featuredTemplates.slice(0, 3)"
                    :key="template.id"
                    class="featured-item"
                    @click="openPreview(template)"
                  >
                    <img :src="template.thumbnailUrl" :alt="template.title" class="featured-thumb" />
                    <div class="featured-info">
                      <p class="featured-title">{{ template.title }}</p>
                      <div class="featured-stats">
                        <span>❤️ {{ template.likes }}</span>
                        <span>⬇️ {{ template.downloads }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="sidebar-section">
                <h3 class="sidebar-title">Stats</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ total }}</div>
                    <div class="stat-label">Templates</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ freeTemplates.length }}</div>
                    <div class="stat-label">Free</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ premiumTemplates.length }}</div>
                    <div class="stat-label">Premium</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ exclusiveTemplates.length }}</div>
                    <div class="stat-label">Exclusive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Modal -->
        <TemplatePreviewModal />

        <!-- Upload Modal -->
        <TemplateUploadModal />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '@/stores/marketplace'
import { TEMPLATE_CATEGORIES } from '@/types/marketplace'
import type { TemplateCategory, TemplateSortBy, TemplateAccessLevel, Template } from '@/types/marketplace'
import TemplateCard from './TemplateCard.vue'
import TemplatePreviewModal from './TemplatePreviewModal.vue'
import TemplateUploadModal from './TemplateUploadModal.vue'

const marketplaceStore = useMarketplaceStore()
const {
  templates,
  filters,
  isLoading,
  error,
  hasMore,
  total,
  isMarketplaceOpen,
  featuredTemplates,
  freeTemplates,
  premiumTemplates,
  exclusiveTemplates
} = storeToRefs(marketplaceStore)

const {
  fetchTemplates,
  setCategory,
  setSort,
  setAccessLevel,
  setSearch,
  clearFilters,
  closeMarketplace,
  openPreview,
  openUploadModal,
  toggleLike,
  saveToLibrary
} = marketplaceStore

const searchQuery = ref('')

const categories = computed(() => Object.values(TEMPLATE_CATEGORIES))

const sortOptions = [
  { value: 'popular' as TemplateSortBy, label: 'Popular', icon: '🔥' },
  { value: 'newest' as TemplateSortBy, label: 'Newest', icon: '✨' },
  { value: 'trending' as TemplateSortBy, label: 'Trending', icon: '📈' },
  { value: 'price-low' as TemplateSortBy, label: 'Price: Low', icon: '💰' },
  { value: 'price-high' as TemplateSortBy, label: 'Price: High', icon: '💎' }
]

let searchTimeout: number | null = null

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    setSearch(searchQuery.value)
  }, 500)
}

function clearSearch() {
  searchQuery.value = ''
  setSearch('')
}

function loadMore() {
  fetchTemplates(true)
}

function handleUseTemplate(template: Template) {
  console.log('Use template:', template)
  // TODO: Implement template usage
}

async function handleSaveTemplate(template: Template) {
  try {
    await saveToLibrary(template.id)
  } catch (err) {
    console.error('Failed to save template:', err)
  }
}

async function handleLikeTemplate(template: Template) {
  try {
    await toggleLike(template.id)
  } catch (err) {
    console.error('Failed to like template:', err)
  }
}

onMounted(() => {
  if (templates.value.length === 0) {
    fetchTemplates()
  }
})
</script>

<style scoped src="./marketplace-styles.css"></style>

