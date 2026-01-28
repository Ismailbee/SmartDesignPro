/**
 * useOrientationHandler composable
 * 
 * Handles device orientation changes and triggers layout recalculations.
 * Provides debounced resize handling and orientation state.
 */

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

export type Orientation = 'portrait' | 'landscape'

export interface UseOrientationHandlerOptions {
  /** Debounce delay for resize events (ms) */
  debounceMs?: number
  /** Callback when orientation changes */
  onOrientationChange?: (orientation: Orientation) => void
  /** Callback when resize occurs (debounced) */
  onResize?: (width: number, height: number) => void
}

export function useOrientationHandler(options: UseOrientationHandlerOptions = {}) {
  const { debounceMs = 150, onOrientationChange, onResize } = options

  // Screen dimensions
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)
  
  // Orientation state
  const orientation = ref<Orientation>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  )
  
  // Previous orientation for detecting changes
  const previousOrientation = ref<Orientation>(orientation.value)
  
  // Is currently resizing
  const isResizing = ref(false)
  
  // Debounce timer
  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  
  // Device info
  const isMobile = computed(() => screenWidth.value < 768)
  const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024)
  const isDesktop = computed(() => screenWidth.value >= 1024)
  
  // Safe area (for notch devices)
  const safeAreaInsets = ref({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  /**
   * Update safe area insets from CSS env()
   */
  function updateSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement)
    safeAreaInsets.value = {
      top: parseInt(style.getPropertyValue('--sat') || '0') || 0,
      right: parseInt(style.getPropertyValue('--sar') || '0') || 0,
      bottom: parseInt(style.getPropertyValue('--sab') || '0') || 0,
      left: parseInt(style.getPropertyValue('--sal') || '0') || 0
    }
  }

  /**
   * Handle resize event (debounced)
   */
  function handleResize() {
    isResizing.value = true
    
    // Clear existing timer
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    
    // Debounce the actual handling
    resizeTimer = setTimeout(() => {
      // Update dimensions
      screenWidth.value = window.innerWidth
      screenHeight.value = window.innerHeight
      
      // Determine new orientation
      const newOrientation: Orientation = 
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      
      // Check if orientation changed
      if (newOrientation !== orientation.value) {
        previousOrientation.value = orientation.value
        orientation.value = newOrientation
        
        console.log(`📱 Orientation changed: ${previousOrientation.value} → ${newOrientation}`)
        
        // Haptic feedback on orientation change
        if (navigator.vibrate) {
          navigator.vibrate(10)
        }
        
        // Callback
        onOrientationChange?.(newOrientation)
      }
      
      // Update safe area
      updateSafeAreaInsets()
      
      // Resize callback
      onResize?.(screenWidth.value, screenHeight.value)
      
      isResizing.value = false
      resizeTimer = null
    }, debounceMs)
  }

  /**
   * Handle orientation change event (for mobile devices)
   */
  function handleOrientationChange() {
    // Screen orientation API
    if (screen.orientation) {
      const type = screen.orientation.type
      const newOrientation: Orientation = 
        type.includes('landscape') ? 'landscape' : 'portrait'
      
      if (newOrientation !== orientation.value) {
        previousOrientation.value = orientation.value
        orientation.value = newOrientation
        
        // Also update dimensions after a short delay (to let the browser update)
        setTimeout(() => {
          screenWidth.value = window.innerWidth
          screenHeight.value = window.innerHeight
          updateSafeAreaInsets()
          onOrientationChange?.(newOrientation)
        }, 100)
      }
    }
  }

  /**
   * Force a layout recalculation
   */
  function forceRecalculate() {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    updateSafeAreaInsets()
  }

  /**
   * Lock orientation (if supported)
   */
  async function lockOrientation(lockTo: OrientationLockType): Promise<boolean> {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock(lockTo)
        console.log(`🔒 Orientation locked to: ${lockTo}`)
        return true
      }
    } catch (e) {
      console.warn('Orientation lock not supported:', e)
    }
    return false
  }

  /**
   * Unlock orientation
   */
  function unlockOrientation() {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock()
        console.log('🔓 Orientation unlocked')
      }
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Get optimal container size based on orientation
   */
  function getOptimalContainerSize() {
    const padding = isMobile.value ? 16 : 32
    const availableWidth = screenWidth.value - (padding * 2)
    const availableHeight = screenHeight.value - (padding * 2)
    
    return {
      width: availableWidth,
      height: availableHeight,
      maxWidth: Math.min(availableWidth, 600),
      maxHeight: Math.min(availableHeight, 800)
    }
  }

  // Setup listeners
  onMounted(() => {
    // Initial safe area update
    updateSafeAreaInsets()
    
    // Set CSS custom properties for safe area
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)')
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)')
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)')
    
    // Add event listeners
    window.addEventListener('resize', handleResize, { passive: true })
    
    // Screen orientation API
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange)
    }
    
    // Visual viewport (for keyboard handling on mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true })
    }
  })

  // Cleanup
  onBeforeUnmount(() => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    
    window.removeEventListener('resize', handleResize)
    
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', handleOrientationChange)
    } else {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize)
    }
  })

  return {
    // State
    screenWidth,
    screenHeight,
    orientation,
    previousOrientation,
    isResizing,
    safeAreaInsets,
    
    // Computed
    isMobile,
    isTablet,
    isDesktop,
    
    // Methods
    forceRecalculate,
    lockOrientation,
    unlockOrientation,
    getOptimalContainerSize
  }
}

export type UseOrientationHandlerReturn = ReturnType<typeof useOrientationHandler>
