/**
 * IndexedDB Service for Offline Storage
 * 
 * Provides persistent offline storage for:
 * - Projects (designs)
 * - Images (as Blobs)
 * - Chats (including voice-only messages)
 * - Settings (user preferences)
 * 
 * Data persists after refresh and browser close.
 */

const DB_NAME = 'WeddingStickerDB'
const DB_VERSION = 1

// Object store names
export const STORES = {
  PROJECTS: 'projects',
  IMAGES: 'images',
  CHATS: 'chats',
  SETTINGS: 'settings'
} as const

// Type definitions
export interface Project {
  id: string
  name: string
  thumbnail?: string // Base64 or blob URL
  createdAt: number
  updatedAt: number
  extractedInfo: {
    title: string | null
    names: { name1: string | null; name2: string | null }
    date: string | null
    courtesy: string | null
  }
  backgroundFileName: string | null
  svgContent: string | null
  description: string | null
  imagePositions: Array<{
    id: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    flipped: boolean
  }>
}

export interface StoredImage {
  id: string
  projectId: string
  blob: Blob
  url?: string // Object URL for display
  createdAt: number
  type: 'main' | 'secondary' | 'tertiary' | 'background'
}

export interface ChatMessage {
  id: number
  projectId: string
  text: string
  sender: 'user' | 'ai'
  time: string
  timestamp: number
  image?: string
  type?: 'text' | 'preview'
  visibleInChat: boolean
  voiceRead: boolean
  skipSpeech?: boolean
}

export interface AppSettings {
  key: string
  value: any
  updatedAt: number
}

let db: IDBDatabase | null = null

/**
 * Initialize the IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('✅ IndexedDB initialized successfully')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Projects store - keyed by id, indexed by updatedAt
      if (!database.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = database.createObjectStore(STORES.PROJECTS, { keyPath: 'id' })
        projectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        projectStore.createIndex('name', 'name', { unique: false })
      }

      // Images store - keyed by id, indexed by projectId
      if (!database.objectStoreNames.contains(STORES.IMAGES)) {
        const imageStore = database.createObjectStore(STORES.IMAGES, { keyPath: 'id' })
        imageStore.createIndex('projectId', 'projectId', { unique: false })
        imageStore.createIndex('type', 'type', { unique: false })
      }

      // Chats store - keyed by id, indexed by projectId and timestamp
      if (!database.objectStoreNames.contains(STORES.CHATS)) {
        const chatStore = database.createObjectStore(STORES.CHATS, { keyPath: 'id', autoIncrement: true })
        chatStore.createIndex('projectId', 'projectId', { unique: false })
        chatStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      // Settings store - keyed by key
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }

      console.log('✅ IndexedDB schema created/upgraded')
    }
  })
}

/**
 * Get database instance (initializes if needed)
 */
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    await initDB()
  }
  return db!
}

// ==================== PROJECTS ====================

/**
 * Save a project to IndexedDB
 */
export async function saveProject(project: Project): Promise<void> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readwrite')
    const store = transaction.objectStore(STORES.PROJECTS)
    
    // Update timestamp
    project.updatedAt = Date.now()
    
    const request = store.put(project)
    
    request.onsuccess = () => {
      console.log('✅ Project saved:', project.id)
      resolve()
    }
    
    request.onerror = () => {
      console.error('Failed to save project:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Get a project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECTS)
    const request = store.get(id)
    
    request.onsuccess = () => {
      resolve(request.result || null)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Get all projects, sorted by most recently updated
 */
export async function getAllProjects(): Promise<Project[]> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECTS)
    const index = store.index('updatedAt')
    const request = index.openCursor(null, 'prev') // Descending order
    
    const projects: Project[] = []
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        projects.push(cursor.value)
        cursor.continue()
      } else {
        resolve(projects)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Delete a project and its associated images/chats
 */
export async function deleteProject(id: string): Promise<void> {
  const database = await getDB()
  
  // Delete project
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readwrite')
    const store = transaction.objectStore(STORES.PROJECTS)
    const request = store.delete(id)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  
  // Delete associated images
  await deleteImagesByProject(id)
  
  // Delete associated chats
  await deleteChatsByProject(id)
  
  console.log('✅ Project and associated data deleted:', id)
}

/**
 * Duplicate a project
 */
export async function duplicateProject(id: string, newName?: string): Promise<Project> {
  const original = await getProject(id)
  if (!original) {
    throw new Error('Project not found')
  }
  
  const newProject: Project = {
    ...original,
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newName || `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  await saveProject(newProject)
  
  // Also duplicate images
  const images = await getImagesByProject(id)
  for (const image of images) {
    await saveImage({
      ...image,
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: newProject.id,
      createdAt: Date.now()
    })
  }
  
  return newProject
}

// ==================== IMAGES ====================

/**
 * Save an image blob to IndexedDB
 */
export async function saveImage(image: StoredImage): Promise<void> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.IMAGES], 'readwrite')
    const store = transaction.objectStore(STORES.IMAGES)
    const request = store.put(image)
    
    request.onsuccess = () => {
      console.log('✅ Image saved:', image.id)
      resolve()
    }
    
    request.onerror = () => {
      console.error('Failed to save image:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Get an image by ID
 */
export async function getImage(id: string): Promise<StoredImage | null> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.IMAGES], 'readonly')
    const store = transaction.objectStore(STORES.IMAGES)
    const request = store.get(id)
    
    request.onsuccess = () => {
      const image = request.result
      if (image && image.blob) {
        // Create object URL for display
        image.url = URL.createObjectURL(image.blob)
      }
      resolve(image || null)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Get all images for a project
 */
export async function getImagesByProject(projectId: string): Promise<StoredImage[]> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.IMAGES], 'readonly')
    const store = transaction.objectStore(STORES.IMAGES)
    const index = store.index('projectId')
    const request = index.getAll(projectId)
    
    request.onsuccess = () => {
      const images = request.result || []
      // Create object URLs for display
      images.forEach(img => {
        if (img.blob) {
          img.url = URL.createObjectURL(img.blob)
        }
      })
      resolve(images)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Delete all images for a project
 */
async function deleteImagesByProject(projectId: string): Promise<void> {
  const database = await getDB()
  const images = await getImagesByProject(projectId)
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.IMAGES], 'readwrite')
    const store = transaction.objectStore(STORES.IMAGES)
    
    let completed = 0
    const total = images.length
    
    if (total === 0) {
      resolve()
      return
    }
    
    images.forEach(image => {
      // Revoke object URL if exists
      if (image.url) {
        URL.revokeObjectURL(image.url)
      }
      
      const request = store.delete(image.id)
      request.onsuccess = () => {
        completed++
        if (completed === total) resolve()
      }
      request.onerror = () => reject(request.error)
    })
  })
}

// ==================== CHATS ====================

/**
 * Save a chat message
 */
export async function saveChatMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CHATS], 'readwrite')
    const store = transaction.objectStore(STORES.CHATS)
    
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now()
    }
    
    const request = store.add(messageWithTimestamp)
    
    request.onsuccess = () => {
      resolve(request.result as number)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Get all chat messages for a project
 */
export async function getChatsByProject(projectId: string): Promise<ChatMessage[]> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CHATS], 'readonly')
    const store = transaction.objectStore(STORES.CHATS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)
    
    request.onsuccess = () => {
      const messages = request.result || []
      // Sort by timestamp
      messages.sort((a, b) => a.timestamp - b.timestamp)
      resolve(messages)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Delete all chats for a project
 */
async function deleteChatsByProject(projectId: string): Promise<void> {
  const database = await getDB()
  const chats = await getChatsByProject(projectId)
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CHATS], 'readwrite')
    const store = transaction.objectStore(STORES.CHATS)
    
    let completed = 0
    const total = chats.length
    
    if (total === 0) {
      resolve()
      return
    }
    
    chats.forEach(chat => {
      const request = store.delete(chat.id)
      request.onsuccess = () => {
        completed++
        if (completed === total) resolve()
      }
      request.onerror = () => reject(request.error)
    })
  })
}

// ==================== SETTINGS ====================

/**
 * Save a setting
 */
export async function saveSetting(key: string, value: any): Promise<void> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SETTINGS], 'readwrite')
    const store = transaction.objectStore(STORES.SETTINGS)
    
    const setting: AppSettings = {
      key,
      value,
      updatedAt: Date.now()
    }
    
    const request = store.put(setting)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get a setting by key
 */
export async function getSetting<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SETTINGS], 'readonly')
    const store = transaction.objectStore(STORES.SETTINGS)
    const request = store.get(key)
    
    request.onsuccess = () => {
      const result = request.result as AppSettings | undefined
      resolve(result?.value ?? defaultValue)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  const database = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SETTINGS], 'readwrite')
    const store = transaction.objectStore(STORES.SETTINGS)
    const request = store.delete(key)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert a File/Blob to a storable format
 */
export function fileToStorableBlob(file: File | Blob): Blob {
  return new Blob([file], { type: file.type })
}

/**
 * Create a new project with default values
 */
export function createNewProject(name?: string): Project {
  const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = Date.now()
  
  return {
    id,
    name: name || `Design ${new Date().toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now,
    extractedInfo: {
      title: null,
      names: { name1: null, name2: null },
      date: null,
      courtesy: null
    },
    backgroundFileName: null,
    svgContent: null,
    description: null,
    imagePositions: []
  }
}

/**
 * Get the last opened project ID from settings
 */
export async function getLastProjectId(): Promise<string | null> {
  return getSetting<string>('lastProjectId', null) ?? null
}

/**
 * Set the last opened project ID
 */
export async function setLastProjectId(projectId: string): Promise<void> {
  return saveSetting('lastProjectId', projectId)
}

/**
 * Clear all data (for debugging/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = await getDB()
  
  const stores = [STORES.PROJECTS, STORES.IMAGES, STORES.CHATS, STORES.SETTINGS]
  
  for (const storeName of stores) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  console.log('✅ All IndexedDB data cleared')
}

/**
 * Get database storage estimate
 */
export async function getStorageEstimate(): Promise<{ used: number; quota: number } | null> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    }
  }
  return null
}

// Initialize on import
initDB().catch(console.error)
