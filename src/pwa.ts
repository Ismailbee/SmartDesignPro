import { registerSW } from 'virtual:pwa-register'

// App version for cache busting (update this on each deployment)
export const APP_VERSION = '2.0.0'

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return

  // In dev, a previously-installed SW can serve stale bundles and break HMR.
  // Unregister any SWs and skip registration.
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.all(regs.map(r => r.unregister())))
      .catch(() => {})
    return
  }

  // Check for version mismatch on load - force update if old version detected
  const storedVersion = localStorage.getItem('app_version')
  if (storedVersion && storedVersion !== APP_VERSION) {
    console.log(`[PWA] Version mismatch: ${storedVersion} -> ${APP_VERSION}, clearing caches...`)
    clearAllCaches().then(() => {
      localStorage.setItem('app_version', APP_VERSION)
      window.location.reload()
    })
    return
  }
  localStorage.setItem('app_version', APP_VERSION)

  // Auto-update SW in the background
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      // Check for updates every 30 seconds for faster deployment pickup
      const intervalMs = 30_000
      setInterval(() => {
        registration.update().catch(() => {})
      }, intervalMs)

      // Also check immediately on visibility change (user returns to tab)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {})
        }
      })
    },
    onNeedRefresh() {
      console.log('[PWA] New version available, reloading...')
      // Clear old caches before reload
      clearAllCaches().then(() => {
        window.location.reload()
      })
    },
    onOfflineReady() {
      console.log('[PWA] App ready for offline use')
    },
  })
}

// Clear all browser caches (except IndexedDB which has user data)
async function clearAllCaches(): Promise<void> {
  try {
    // Clear Cache API caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => {
          // Keep remote-images cache as it's user content
          if (cacheName === 'remote-images') return Promise.resolve()
          console.log(`[PWA] Deleting cache: ${cacheName}`)
          return caches.delete(cacheName)
        })
      )
    }
    
    // Clear sessionStorage (not localStorage - it has settings)
    sessionStorage.clear()
    
    console.log('[PWA] Caches cleared successfully')
  } catch (error) {
    console.warn('[PWA] Error clearing caches:', error)
  }
}
