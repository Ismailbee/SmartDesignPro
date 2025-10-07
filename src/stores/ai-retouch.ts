/**
 * AI Retouch Store
 * Manages AI-powered design retouch state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AIRetouchState,
  AIRetouchFeature,
  AISuggestion,
  ProcessingStatus,
  RetouchSettings,
  ColorPalette,
  FontPairing
} from '@/types/ai-retouch'
import {
  applyAIRetouch,
  optimizeLayout,
  analyzeColors,
  getFontPairings,
  generateLocalColorPalettes,
  calculateOptimalSpacing,
  detectAlignmentIssues
} from '@/services/ai-retouch-api'

export const useAIRetouchStore = defineStore('ai-retouch', () => {
  // State
  const isOpen = ref(false)
  const isProcessing = ref(false)
  const processingStatus = ref<ProcessingStatus>('idle')
  const currentFeature = ref<AIRetouchFeature | null>(null)
  const suggestions = ref<AISuggestion[]>([])
  const appliedSuggestions = ref<string[]>([])
  const history = ref<AISuggestion[]>([])
  const error = ref<string | null>(null)
  const showBeforeAfter = ref(false)
  const beforeSnapshot = ref<string | null>(null)
  const afterSnapshot = ref<string | null>(null)
  const intensity = ref(75) // Default 75%
  const enabledFeatures = ref<AIRetouchFeature[]>([
    'color-palette',
    'font-pairing',
    'smart-alignment',
    'auto-spacing'
  ])

  // Settings
  const settings = ref<RetouchSettings>({
    autoSave: false,
    showPreview: true,
    confirmBeforeApply: true,
    defaultIntensity: 75,
    enabledFeatures: [
      'color-palette',
      'font-pairing',
      'smart-alignment',
      'auto-spacing'
    ],
    premiumEnabled: false
  })

  // Computed
  const hasSuggestions = computed(() => suggestions.value.length > 0)
  const hasAppliedSuggestions = computed(() => appliedSuggestions.value.length > 0)
  const canUndo = computed(() => history.value.length > 0)

  // Actions

  /**
   * Open AI Retouch panel
   */
  function openPanel() {
    isOpen.value = true
    error.value = null
  }

  /**
   * Close AI Retouch panel
   */
  function closePanel() {
    isOpen.value = false
    currentFeature.value = null
  }

  /**
   * Toggle panel
   */
  function togglePanel() {
    if (isOpen.value) {
      closePanel()
    } else {
      openPanel()
    }
  }

  /**
   * Apply one-click retouch
   */
  async function applyOneClickRetouch(designData: any) {
    isProcessing.value = true
    processingStatus.value = 'processing'
    error.value = null

    try {
      // Capture before snapshot
      beforeSnapshot.value = await captureCanvasSnapshot()

      const response = await applyAIRetouch({
        designData,
        options: {
          features: enabledFeatures.value,
          intensity: intensity.value,
          preserveOriginal: true,
          autoApply: false
        }
      })

      suggestions.value = response.suggestions
      processingStatus.value = 'success'

      // Show before/after if preview is enabled
      if (settings.value.showPreview) {
        showBeforeAfter.value = true
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to apply AI retouch'
      processingStatus.value = 'error'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Optimize layout
   */
  async function optimizeDesignLayout(elements: any[], canvasSize: { width: number; height: number }) {
    isProcessing.value = true
    currentFeature.value = 'smart-alignment'
    error.value = null

    try {
      const response = await optimizeLayout({
        elements,
        canvasSize,
        options: {
          alignment: enabledFeatures.value.includes('smart-alignment'),
          spacing: enabledFeatures.value.includes('auto-spacing'),
          balance: enabledFeatures.value.includes('balance-detection'),
          layering: enabledFeatures.value.includes('auto-layering')
        }
      })

      // Create suggestion from layout optimization
      const suggestion: AISuggestion = {
        id: `layout-${Date.now()}`,
        feature: 'smart-alignment',
        title: 'Layout Optimization',
        description: `${response.adjustments.length} adjustments suggested`,
        confidence: response.score,
        data: response.adjustments,
        applied: false,
        createdAt: new Date().toISOString()
      }

      suggestions.value.push(suggestion)
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to optimize layout'
      throw err
    } finally {
      isProcessing.value = false
      currentFeature.value = null
    }
  }

  /**
   * Get color palette suggestions
   */
  async function getColorPaletteSuggestions(colors: string[]) {
    isProcessing.value = true
    currentFeature.value = 'color-palette'
    error.value = null

    try {
      // Use local generation for now (can switch to API later)
      const palettes = generateLocalColorPalettes(colors, 4)

      // Create suggestions from palettes
      const newSuggestions = palettes.map((palette, index) => ({
        id: `palette-${Date.now()}-${index}`,
        feature: 'color-palette' as AIRetouchFeature,
        title: palette.name,
        description: palette.description,
        confidence: 85,
        data: palette,
        applied: false,
        createdAt: new Date().toISOString()
      }))

      suggestions.value.push(...newSuggestions)
      return palettes
    } catch (err: any) {
      error.value = err.message || 'Failed to get color suggestions'
      throw err
    } finally {
      isProcessing.value = false
      currentFeature.value = null
    }
  }

  /**
   * Get font pairing suggestions
   */
  async function getFontPairingSuggestions(currentFonts: string[]) {
    isProcessing.value = true
    currentFeature.value = 'font-pairing'
    error.value = null

    try {
      // For now, return mock data (can integrate with API later)
      const mockPairings: FontPairing[] = [
        {
          id: 'modern-1',
          name: 'Modern Professional',
          heading: 'Montserrat',
          subheading: 'Lato',
          body: 'Open Sans',
          description: 'Clean and professional for business designs',
          category: 'professional'
        },
        {
          id: 'elegant-1',
          name: 'Elegant Classic',
          heading: 'Playfair Display',
          subheading: 'Lora',
          body: 'Merriweather',
          description: 'Sophisticated and timeless',
          category: 'elegant'
        },
        {
          id: 'playful-1',
          name: 'Playful Modern',
          heading: 'Poppins',
          subheading: 'Nunito',
          body: 'Quicksand',
          description: 'Fun and friendly for creative projects',
          category: 'playful'
        }
      ]

      const newSuggestions = mockPairings.map((pairing, index) => ({
        id: `font-${Date.now()}-${index}`,
        feature: 'font-pairing' as AIRetouchFeature,
        title: pairing.name,
        description: pairing.description,
        confidence: 80,
        data: pairing,
        applied: false,
        createdAt: new Date().toISOString()
      }))

      suggestions.value.push(...newSuggestions)
      return mockPairings
    } catch (err: any) {
      error.value = err.message || 'Failed to get font suggestions'
      throw err
    } finally {
      isProcessing.value = false
      currentFeature.value = null
    }
  }

  /**
   * Apply a suggestion
   */
  function applySuggestion(suggestionId: string) {
    const suggestion = suggestions.value.find(s => s.id === suggestionId)
    if (!suggestion) return

    // Mark as applied
    suggestion.applied = true
    appliedSuggestions.value.push(suggestionId)

    // Add to history
    history.value.push({ ...suggestion })
  }

  /**
   * Revert a suggestion
   */
  function revertSuggestion(suggestionId: string) {
    const suggestion = suggestions.value.find(s => s.id === suggestionId)
    if (!suggestion) return

    // Mark as not applied
    suggestion.applied = false
    appliedSuggestions.value = appliedSuggestions.value.filter(id => id !== suggestionId)

    // Remove from history
    history.value = history.value.filter(s => s.id !== suggestionId)
  }

  /**
   * Clear all suggestions
   */
  function clearSuggestions() {
    suggestions.value = []
    appliedSuggestions.value = []
  }

  /**
   * Reset all applied changes
   */
  function resetAll() {
    suggestions.value.forEach(s => s.applied = false)
    appliedSuggestions.value = []
    history.value = []
    showBeforeAfter.value = false
    beforeSnapshot.value = null
    afterSnapshot.value = null
  }

  /**
   * Toggle feature
   */
  function toggleFeature(feature: AIRetouchFeature) {
    const index = enabledFeatures.value.indexOf(feature)
    if (index > -1) {
      enabledFeatures.value.splice(index, 1)
    } else {
      enabledFeatures.value.push(feature)
    }
  }

  /**
   * Set intensity
   */
  function setIntensity(value: number) {
    intensity.value = Math.max(0, Math.min(100, value))
  }

  /**
   * Capture canvas snapshot (placeholder)
   */
  async function captureCanvasSnapshot(): Promise<string> {
    // This should capture the current canvas state
    // For now, return empty string
    return ''
  }

  /**
   * Show before/after comparison
   */
  function showComparison() {
    showBeforeAfter.value = true
  }

  /**
   * Hide before/after comparison
   */
  function hideComparison() {
    showBeforeAfter.value = false
  }

  return {
    // State
    isOpen,
    isProcessing,
    processingStatus,
    currentFeature,
    suggestions,
    appliedSuggestions,
    history,
    error,
    showBeforeAfter,
    beforeSnapshot,
    afterSnapshot,
    intensity,
    enabledFeatures,
    settings,

    // Computed
    hasSuggestions,
    hasAppliedSuggestions,
    canUndo,

    // Actions
    openPanel,
    closePanel,
    togglePanel,
    applyOneClickRetouch,
    optimizeDesignLayout,
    getColorPaletteSuggestions,
    getFontPairingSuggestions,
    applySuggestion,
    revertSuggestion,
    clearSuggestions,
    resetAll,
    toggleFeature,
    setIntensity,
    showComparison,
    hideComparison
  }
})

