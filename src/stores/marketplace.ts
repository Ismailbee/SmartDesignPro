/**
 * Template Marketplace Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Template,
  TemplateFilters,
  TemplateCategory,
  TemplateSortBy,
  TemplateAccessLevel,
  TemplateUploadData,
  UserTemplateLibrary
} from '@/types/marketplace'
import * as marketplaceApi from '@/services/marketplace-api'
import { useAuthStore } from './auth'

export const useMarketplaceStore = defineStore('marketplace', () => {
  // State
  const templates = ref<Template[]>([])
  const selectedTemplate = ref<Template | null>(null)
  const filters = ref<TemplateFilters>({
    category: 'all',
    sortBy: 'popular'
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(12)
  const total = ref(0)
  const hasMore = ref(true)

  // User library
  const userLibrary = ref<UserTemplateLibrary | null>(null)

  // Modal states
  const isPreviewOpen = ref(false)
  const isUploadModalOpen = ref(false)
  const isMarketplaceOpen = ref(false)

  // Computed
  const filteredTemplates = computed(() => templates.value)
  
  const featuredTemplates = computed(() => 
    templates.value.filter(t => t.isFeatured).slice(0, 6)
  )

  const freeTemplates = computed(() =>
    templates.value.filter(t => t.accessLevel === 'free')
  )

  const premiumTemplates = computed(() =>
    templates.value.filter(t => t.accessLevel === 'premium')
  )

  const exclusiveTemplates = computed(() =>
    templates.value.filter(t => t.accessLevel === 'exclusive')
  )

  const isTemplateSaved = computed(() => (templateId: string) => {
    return userLibrary.value?.savedTemplates.includes(templateId) || false
  })

  const isTemplatePurchased = computed(() => (templateId: string) => {
    return userLibrary.value?.purchasedTemplates.includes(templateId) || false
  })

  // Actions

  /**
   * Fetch templates with current filters
   */
  async function fetchTemplates(loadMore = false) {
    isLoading.value = true
    error.value = null

    try {
      const currentPage = loadMore ? page.value + 1 : 1
      
      const response = await marketplaceApi.fetchTemplates({
        ...filters.value,
        page: currentPage,
        pageSize: pageSize.value
      })

      if (loadMore) {
        templates.value = [...templates.value, ...response.templates]
      } else {
        templates.value = response.templates
      }

      page.value = response.page
      total.value = response.total
      hasMore.value = response.hasMore
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single template
   */
  async function fetchTemplate(id: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await marketplaceApi.fetchTemplate(id)
      selectedTemplate.value = response.template
      return response.template
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload new template
   */
  async function uploadTemplate(data: TemplateUploadData) {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      throw new Error('You must be logged in to upload templates')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await marketplaceApi.uploadTemplate(
        data,
        authStore.user.id,
        authStore.userDisplayName
      )

      // Add to user's uploaded templates
      if (userLibrary.value) {
        userLibrary.value.uploadedTemplates.push(response.template.id)
      }

      return response.template
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update template
   */
  async function updateTemplate(id: string, updates: Partial<Template>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await marketplaceApi.updateTemplate(id, updates)
      
      // Update in list
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = response.template
      }

      // Update selected if it's the same
      if (selectedTemplate.value?.id === id) {
        selectedTemplate.value = response.template
      }

      return response.template
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete template
   */
  async function deleteTemplate(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await marketplaceApi.deleteTemplate(id)
      
      // Remove from list
      templates.value = templates.value.filter(t => t.id !== id)
      
      // Clear selected if it's the same
      if (selectedTemplate.value?.id === id) {
        selectedTemplate.value = null
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Like/unlike template
   */
  async function toggleLike(templateId: string) {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      throw new Error('You must be logged in to like templates')
    }

    try {
      const response = await marketplaceApi.toggleLikeTemplate(templateId, authStore.user.id)
      
      // Update template likes count
      const template = templates.value.find(t => t.id === templateId)
      if (template) {
        template.likes += response.liked ? 1 : -1
      }

      if (selectedTemplate.value?.id === templateId) {
        selectedTemplate.value.likes += response.liked ? 1 : -1
      }

      return response.liked
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  /**
   * Purchase template
   */
  async function purchaseTemplate(templateId: string) {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      throw new Error('You must be logged in to purchase templates')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await marketplaceApi.purchaseTemplate(templateId, authStore.user.id)
      
      // Add to purchased templates
      if (userLibrary.value) {
        userLibrary.value.purchasedTemplates.push(templateId)
      }

      // Update downloads count
      const template = templates.value.find(t => t.id === templateId)
      if (template) {
        template.downloads += 1
      }

      if (selectedTemplate.value?.id === templateId) {
        selectedTemplate.value.downloads += 1
      }

      return response.purchaseId
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save template to library
   */
  async function saveToLibrary(templateId: string) {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      throw new Error('You must be logged in to save templates')
    }

    try {
      await marketplaceApi.saveTemplateToLibrary(authStore.user.id, templateId)
      
      // Add to saved templates
      if (userLibrary.value) {
        if (!userLibrary.value.savedTemplates.includes(templateId)) {
          userLibrary.value.savedTemplates.push(templateId)
        }
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  /**
   * Load user library
   */
  async function loadUserLibrary() {
    const authStore = useAuthStore()
    
    if (!authStore.user) return

    try {
      userLibrary.value = await marketplaceApi.getUserLibrary(authStore.user.id)
    } catch (err: any) {
      console.error('Failed to load user library:', err)
    }
  }

  /**
   * Set filter
   */
  function setFilter(key: keyof TemplateFilters, value: any) {
    filters.value = { ...filters.value, [key]: value }
    page.value = 1
    fetchTemplates()
  }

  /**
   * Set category filter
   */
  function setCategory(category: TemplateCategory) {
    setFilter('category', category)
  }

  /**
   * Set sort
   */
  function setSort(sortBy: TemplateSortBy) {
    setFilter('sortBy', sortBy)
  }

  /**
   * Set access level filter
   */
  function setAccessLevel(accessLevel: TemplateAccessLevel | undefined) {
    setFilter('accessLevel', accessLevel)
  }

  /**
   * Set search query
   */
  function setSearch(search: string) {
    setFilter('search', search)
  }

  /**
   * Clear filters
   */
  function clearFilters() {
    filters.value = {
      category: 'all',
      sortBy: 'popular'
    }
    page.value = 1
    fetchTemplates()
  }

  /**
   * Open preview modal
   */
  function openPreview(template: Template) {
    selectedTemplate.value = template
    isPreviewOpen.value = true
  }

  /**
   * Close preview modal
   */
  function closePreview() {
    isPreviewOpen.value = false
  }

  /**
   * Open upload modal
   */
  function openUploadModal() {
    isUploadModalOpen.value = true
  }

  /**
   * Close upload modal
   */
  function closeUploadModal() {
    isUploadModalOpen.value = false
  }

  /**
   * Open marketplace
   */
  function openMarketplace() {
    isMarketplaceOpen.value = true
    if (templates.value.length === 0) {
      fetchTemplates()
    }
  }

  /**
   * Close marketplace
   */
  function closeMarketplace() {
    isMarketplaceOpen.value = false
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    templates,
    selectedTemplate,
    filters,
    isLoading,
    error,
    page,
    pageSize,
    total,
    hasMore,
    userLibrary,
    isPreviewOpen,
    isUploadModalOpen,
    isMarketplaceOpen,

    // Computed
    filteredTemplates,
    featuredTemplates,
    freeTemplates,
    premiumTemplates,
    exclusiveTemplates,
    isTemplateSaved,
    isTemplatePurchased,

    // Actions
    fetchTemplates,
    fetchTemplate,
    uploadTemplate,
    updateTemplate,
    deleteTemplate,
    toggleLike,
    purchaseTemplate,
    saveToLibrary,
    loadUserLibrary,
    setFilter,
    setCategory,
    setSort,
    setAccessLevel,
    setSearch,
    clearFilters,
    openPreview,
    closePreview,
    openUploadModal,
    closeUploadModal,
    openMarketplace,
    closeMarketplace,
    clearError
  }
})

