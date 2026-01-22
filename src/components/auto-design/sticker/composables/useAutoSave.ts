/**
 * useAutoSave composable
 * Manages auto-save indicator state and triggers
 */
import { ref, watch, type Ref } from 'vue'

export interface AutoSaveOptions {
  /** Delay before showing "saved" indicator (ms) */
  saveDelay?: number
  /** How long to show "saved" indicator (ms) */
  savedDuration?: number
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const { saveDelay = 500, savedDuration = 2000 } = options

  const isSaving = ref(false)
  const showSavedIndicator = ref(false)
  let saveIndicatorTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Trigger the save indicator animation
   * Shows "Saving..." then "✔ Saved locally"
   */
  function triggerSaveIndicator() {
    isSaving.value = true
    showSavedIndicator.value = false
    
    // Simulate save delay (IndexedDB operations are fast but give visual feedback)
    setTimeout(() => {
      isSaving.value = false
      showSavedIndicator.value = true
      
      // Clear previous timeout
      if (saveIndicatorTimeout) clearTimeout(saveIndicatorTimeout)
      
      // Hide after duration
      saveIndicatorTimeout = setTimeout(() => {
        showSavedIndicator.value = false
      }, savedDuration)
    }, saveDelay)
  }

  /**
   * Create a watcher that triggers save indicator on changes
   * @param source - Reactive source to watch
   * @param condition - Optional condition to check before triggering
   */
  function watchForSave<T>(
    source: Ref<T> | (() => T),
    condition?: (value: T) => boolean
  ) {
    watch(source, (newValue) => {
      if (condition ? condition(newValue) : true) {
        triggerSaveIndicator()
      }
    }, { deep: true })
  }

  /**
   * Cleanup timeouts
   */
  function cleanup() {
    if (saveIndicatorTimeout) {
      clearTimeout(saveIndicatorTimeout)
      saveIndicatorTimeout = null
    }
  }

  return {
    isSaving,
    showSavedIndicator,
    triggerSaveIndicator,
    watchForSave,
    cleanup
  }
}
