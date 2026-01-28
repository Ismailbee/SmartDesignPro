/**
 * useContentProtection composable
 * Prevents context menu (long-press) on images for content protection
 */
import { onMounted, onBeforeUnmount } from 'vue'

export interface ContentProtectionOptions {
  /** Selector for elements to protect */
  selectors?: string[]
  /** Enable/disable protection */
  enabled?: boolean
}

const DEFAULT_SELECTORS = [
  'img',
  'svg',
  '.wedding-preview-container',
  '.preview-image-container',
  '.sticker-template-panel img'
]

export function useContentProtection(options: ContentProtectionOptions = {}) {
  const { selectors = DEFAULT_SELECTORS, enabled = true } = options

  let cleanupFn: (() => void) | null = null

  function preventContextMenu(e: MouseEvent) {
    const target = e.target as HTMLElement
    
    // Check if target matches any protected selector
    const isProtected = selectors.some(selector => {
      if (target.tagName.toLowerCase() === selector.toLowerCase()) return true
      if (target.closest(selector)) return true
      return false
    })
    
    if (isProtected) {
      e.preventDefault()
      return false
    }
  }

  function setup() {
    if (!enabled) return

    document.addEventListener('contextmenu', preventContextMenu)
    
    cleanupFn = () => {
      document.removeEventListener('contextmenu', preventContextMenu)
    }
  }

  function cleanup() {
    if (cleanupFn) {
      cleanupFn()
      cleanupFn = null
    }
  }

  // Auto-setup on mount
  onMounted(() => {
    setup()
  })

  // Auto-cleanup on unmount
  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    setup,
    cleanup
  }
}
