/**
 * Storage Handler Utility
 * Handles browser storage with graceful fallbacks for tracking prevention
 */

interface StorageHandler {
  setItem: (key: string, value: string) => boolean
  getItem: (key: string) => string | null
  removeItem: (key: string) => boolean
  clear: () => boolean
  isAvailable: () => boolean
}

/**
 * Create a storage handler with fallback to memory storage
 * when browser storage is blocked by tracking prevention
 */
export function createStorageHandler(storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): StorageHandler {
  // Memory storage fallback
  const memoryStorage = new Map<string, string>()
  
  const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage
  
  // Test if storage is available
  function testStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)
      return true
    } catch (error) {
      console.warn(`${storageType} is not available, falling back to memory storage:`, error)
      return false
    }
  }
  
  const isStorageAvailable = testStorageAvailable()
  
  return {
    setItem: (key: string, value: string): boolean => {
      try {
        if (isStorageAvailable) {
          storage.setItem(key, value)
        } else {
          memoryStorage.set(key, value)
        }
        return true
      } catch (error) {
        console.warn(`Failed to set storage item ${key}:`, error)
        // Fallback to memory storage
        try {
          memoryStorage.set(key, value)
          return true
        } catch (memError) {
          console.error('Memory storage also failed:', memError)
          return false
        }
      }
    },
    
    getItem: (key: string): string | null => {
      try {
        if (isStorageAvailable) {
          return storage.getItem(key)
        } else {
          return memoryStorage.get(key) || null
        }
      } catch (error) {
        console.warn(`Failed to get storage item ${key}:`, error)
        return memoryStorage.get(key) || null
      }
    },
    
    removeItem: (key: string): boolean => {
      try {
        if (isStorageAvailable) {
          storage.removeItem(key)
        } else {
          memoryStorage.delete(key)
        }
        return true
      } catch (error) {
        console.warn(`Failed to remove storage item ${key}:`, error)
        memoryStorage.delete(key)
        return false
      }
    },
    
    clear: (): boolean => {
      try {
        if (isStorageAvailable) {
          storage.clear()
        } else {
          memoryStorage.clear()
        }
        return true
      } catch (error) {
        console.warn('Failed to clear storage:', error)
        memoryStorage.clear()
        return false
      }
    },
    
    isAvailable: (): boolean => {
      return isStorageAvailable
    }
  }
}

// Create default instances
export const localStorageHandler = createStorageHandler('localStorage')
export const sessionStorageHandler = createStorageHandler('sessionStorage')

/**
 * Safe storage wrapper that suppresses storage-related console errors
 */
export class SafeStorage {
  private handler: StorageHandler
  
  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.handler = createStorageHandler(storageType)
  }
  
  set(key: string, value: any): boolean {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
      return this.handler.setItem(key, serializedValue)
    } catch (error) {
      // Silently fail for tracking prevention scenarios
      return false
    }
  }
  
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const value = this.handler.getItem(key)
      if (value === null) return defaultValue || null
      
      try {
        return JSON.parse(value)
      } catch {
        // If not JSON, return as string
        return value as T
      }
    } catch (error) {
      return defaultValue || null
    }
  }
  
  remove(key: string): boolean {
    return this.handler.removeItem(key)
  }
  
  clear(): boolean {
    return this.handler.clear()
  }
  
  isAvailable(): boolean {
    return this.handler.isAvailable()
  }
}

// Export default instances
export const safeLocalStorage = new SafeStorage('localStorage')
export const safeSessionStorage = new SafeStorage('sessionStorage')