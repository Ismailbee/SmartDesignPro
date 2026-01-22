 /**
 * useOfflineStorage composable
 * 
 * Provides reactive offline storage for the wedding sticker designer
 * using IndexedDB as the persistence layer.
 */

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  initDB,
  saveProject,
  getProject,
  getAllProjects,
  deleteProject,
  duplicateProject,
  saveImage,
  getImagesByProject,
  saveChatMessage,
  getChatsByProject,
  saveSetting,
  getSetting,
  setLastProjectId,
  getLastProjectId,
  createNewProject,
  fileToStorableBlob,
  type Project,
  type StoredImage,
  type ChatMessage
} from '@/services/offline/indexedDB.service'

export interface UseOfflineStorageOptions {
  autoSave?: boolean
  autoSaveDelay?: number
  onSaveStart?: () => void
  onSaveComplete?: () => void
  onSaveError?: (error: Error) => void
}

export function useOfflineStorage(options: UseOfflineStorageOptions = {}) {
  const {
    autoSave = true,
    autoSaveDelay = 1000,
    onSaveStart,
    onSaveComplete,
    onSaveError
  } = options

  // Current project state
  const currentProject = ref<Project | null>(null)
  const projectList = ref<Project[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  // Auto-save debounce timer
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Initialize the offline storage and load last project
   */
  async function initialize() {
    try {
      isLoading.value = true
      error.value = null
      
      // Initialize IndexedDB
      await initDB()
      
      // Load project list
      projectList.value = await getAllProjects()
      
      // Try to restore last project
      const lastProjectId = await getLastProjectId()
      if (lastProjectId) {
        const project = await getProject(lastProjectId)
        if (project) {
          currentProject.value = project
          console.log('✅ Restored last project:', project.name)
        }
      }
      
      // If no project, create a new one
      if (!currentProject.value) {
        await createProject()
      }
      
      isInitialized.value = true
      console.log('✅ Offline storage initialized')
    } catch (e) {
      console.error('Failed to initialize offline storage:', e)
      error.value = 'Failed to initialize offline storage'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new project
   */
  async function createProject(name?: string): Promise<Project> {
    const project = createNewProject(name)
    await saveProject(project)
    await setLastProjectId(project.id)
    
    currentProject.value = project
    projectList.value = await getAllProjects()
    
    console.log('✅ New project created:', project.name)
    return project
  }

  /**
   * Load a project by ID
   */
  async function loadProject(projectId: string): Promise<Project | null> {
    try {
      isLoading.value = true
      
      // Auto-save current project before switching
      if (currentProject.value && autoSave) {
        await saveCurrentProject()
      }
      
      const project = await getProject(projectId)
      if (project) {
        currentProject.value = project
        await setLastProjectId(projectId)
        console.log('✅ Project loaded:', project.name)
      }
      
      return project
    } catch (e) {
      console.error('Failed to load project:', e)
      error.value = 'Failed to load project'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save the current project
   */
  async function saveCurrentProject(): Promise<void> {
    if (!currentProject.value) return
    
    try {
      isSaving.value = true
      onSaveStart?.()
      
      await saveProject(currentProject.value)
      
      // Update project list
      projectList.value = await getAllProjects()
      
      onSaveComplete?.()
      console.log('✅ Project saved:', currentProject.value.name)
    } catch (e) {
      console.error('Failed to save project:', e)
      error.value = 'Failed to save project'
      onSaveError?.(e as Error)
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Schedule an auto-save (debounced)
   */
  function scheduleAutoSave() {
    if (!autoSave || !currentProject.value) return
    
    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    
    // Schedule new save
    saveTimer = setTimeout(() => {
      saveCurrentProject()
    }, autoSaveDelay)
  }

  /**
   * Update project data and trigger auto-save
   */
  function updateProject(updates: Partial<Project>) {
    if (!currentProject.value) return
    
    currentProject.value = {
      ...currentProject.value,
      ...updates,
      updatedAt: Date.now()
    }
    
    scheduleAutoSave()
  }

  /**
   * Update extracted info
   */
  function updateExtractedInfo(info: Partial<Project['extractedInfo']>) {
    if (!currentProject.value) return
    
    currentProject.value.extractedInfo = {
      ...currentProject.value.extractedInfo,
      ...info
    }
    currentProject.value.updatedAt = Date.now()
    
    scheduleAutoSave()
  }

  /**
   * Save an image to the current project
   */
  async function saveProjectImage(
    file: File | Blob,
    type: StoredImage['type']
  ): Promise<StoredImage> {
    if (!currentProject.value) {
      throw new Error('No current project')
    }
    
    const image: StoredImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: currentProject.value.id,
      blob: fileToStorableBlob(file),
      createdAt: Date.now(),
      type
    }
    
    await saveImage(image)
    return image
  }

  /**
   * Get all images for the current project
   */
  async function getProjectImages(): Promise<StoredImage[]> {
    if (!currentProject.value) return []
    return getImagesByProject(currentProject.value.id)
  }

  /**
   * Save a chat message
   */
  async function saveChatMsg(
    text: string,
    sender: 'user' | 'ai',
    options: {
      visibleInChat?: boolean
      voiceRead?: boolean
      skipSpeech?: boolean
      image?: string
      type?: 'text' | 'preview'
    } = {}
  ): Promise<number> {
    if (!currentProject.value) {
      throw new Error('No current project')
    }
    
    const message: Omit<ChatMessage, 'id'> = {
      projectId: currentProject.value.id,
      text,
      sender,
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      visibleInChat: options.visibleInChat !== false,
      voiceRead: options.voiceRead || false,
      skipSpeech: options.skipSpeech,
      image: options.image,
      type: options.type || 'text'
    }
    
    return saveChatMessage(message)
  }

  /**
   * Get all chat messages for the current project
   */
  async function getProjectChats(): Promise<ChatMessage[]> {
    if (!currentProject.value) return []
    return getChatsByProject(currentProject.value.id)
  }

  /**
   * Rename the current project
   */
  async function renameProject(newName: string) {
    if (!currentProject.value) return
    
    currentProject.value.name = newName
    currentProject.value.updatedAt = Date.now()
    
    await saveCurrentProject()
    projectList.value = await getAllProjects()
  }

  /**
   * Delete a project
   */
  async function removeProject(projectId: string) {
    await deleteProject(projectId)
    projectList.value = await getAllProjects()
    
    // If deleted current project, create new one
    if (currentProject.value?.id === projectId) {
      if (projectList.value.length > 0) {
        await loadProject(projectList.value[0].id)
      } else {
        await createProject()
      }
    }
  }

  /**
   * Duplicate a project
   */
  async function copyProject(projectId: string, newName?: string): Promise<Project> {
    const newProject = await duplicateProject(projectId, newName)
    projectList.value = await getAllProjects()
    return newProject
  }

  /**
   * Generate a thumbnail for the current project
   */
  async function updateThumbnail(
    thumbnailDataUrl: string,
    options?: { overwrite?: boolean }
  ) {
    if (!currentProject.value) return

    const shouldOverwrite = options?.overwrite === true

    const syncProjectListThumbnail = (projectId: string, thumbnail: string) => {
      const index = projectList.value.findIndex(p => p.id === projectId)
      if (index === -1) return
      projectList.value[index] = {
        ...projectList.value[index],
        thumbnail,
        updatedAt: Date.now()
      }
    }

    if (!shouldOverwrite && currentProject.value.thumbnail) {
      syncProjectListThumbnail(currentProject.value.id, currentProject.value.thumbnail)
      return
    }
    
    currentProject.value.thumbnail = thumbnailDataUrl
    currentProject.value.updatedAt = Date.now()
    
    await saveCurrentProject()

    syncProjectListThumbnail(currentProject.value.id, thumbnailDataUrl)
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (saveTimer) {
      clearTimeout(saveTimer)
      // Save immediately on unmount
      if (currentProject.value) {
        saveCurrentProject()
      }
    }
  })

  return {
    // State
    currentProject,
    projectList,
    isLoading,
    isSaving,
    isInitialized,
    error,
    
    // Project methods
    initialize,
    createProject,
    loadProject,
    saveCurrentProject,
    updateProject,
    updateExtractedInfo,
    renameProject,
    removeProject,
    copyProject,
    updateThumbnail,
    
    // Image methods
    saveProjectImage,
    getProjectImages,
    
    // Chat methods
    saveChatMsg,
    getProjectChats,
    
    // Auto-save control
    scheduleAutoSave
  }
}

export type UseOfflineStorageReturn = ReturnType<typeof useOfflineStorage>
