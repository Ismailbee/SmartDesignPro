<template>
  <div class="chat-sidebar-container">
    <!-- Sidebar Overlay (mobile) -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>
    </Transition>

    <!-- Sidebar Panel -->
    <Transition name="slide">
      <div 
        v-if="isOpen" 
        class="sidebar-panel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Header -->
        <div class="sidebar-header">
          <h2 class="sidebar-title">Projects</h2>
          <button 
            class="new-project-btn"
            @click="createNewProject"
            :disabled="isCreating"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>

        <!-- Project List -->
        <div class="project-list">
          <div 
            v-for="project in sortedProjects" 
            :key="project.id"
            class="project-item"
            :class="{ 'active': project.id === currentProjectId }"
            @click="selectProject(project.id)"
          >
            <!-- Thumbnail -->
            <div class="project-thumbnail">
              <img 
                v-if="project.thumbnail" 
                :src="project.thumbnail" 
                :alt="project.name"
              />
              <div v-else class="thumbnail-placeholder">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                  </path>
                </svg>
              </div>
            </div>

            <!-- Project Info -->
            <div class="project-info">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-date">{{ formatDate(project.updatedAt) }}</p>
            </div>

            <!-- Actions Menu -->
            <div class="project-actions">
              <button 
                class="action-btn"
                @click.stop="toggleMenu(project.id)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                  </path>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition name="dropdown">
                <div 
                  v-if="activeMenu === project.id" 
                  class="dropdown-menu"
                  @click.stop
                >
                  <button @click="renameProjectPrompt(project)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                      </path>
                    </svg>
                    Rename
                  </button>
                  <button @click="duplicateProjectAction(project.id)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                      </path>
                    </svg>
                    Duplicate
                  </button>
                  <button 
                    class="delete-btn"
                    @click="deleteProjectPrompt(project)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                      </path>
                    </svg>
                    Delete
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="projects.length === 0" class="empty-state">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            <p>No projects yet</p>
            <button class="create-first-btn" @click="createNewProject">
              Create your first project
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="sidebar-footer">
          <button class="settings-btn" @click="openSettings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
              </path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </button>
        </div>
      </div>
    </Transition>

    <!-- Toggle Button removed - now in chat header -->

    <!-- Rename Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showRenameModal" class="modal-overlay" @click.self="closeRenameModal">
          <div class="modal-content">
            <h3>Rename Project</h3>
            <input 
              v-model="newProjectName"
              type="text"
              placeholder="Project name"
              class="rename-input"
              @keyup.enter="confirmRename"
              ref="renameInput"
            />
            <div class="modal-actions">
              <button class="cancel-btn" @click="closeRenameModal">Cancel</button>
              <button class="confirm-btn" @click="confirmRename">Rename</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
          <div class="modal-content">
            <h3>Delete Project?</h3>
            <p class="delete-warning">
              Are you sure you want to delete "{{ projectToDelete?.name }}"? 
              This action cannot be undone.
            </p>
            <div class="modal-actions">
              <button class="cancel-btn" @click="closeDeleteModal">Cancel</button>
              <button class="delete-confirm-btn" @click="confirmDelete">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { Project } from '@/services/offline/indexedDB.service'

// Props
const props = defineProps<{
  projects: Project[]
  currentProjectId: string | null
  isOpen: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'select-project', projectId: string): void
  (e: 'create-project'): void
  (e: 'rename-project', projectId: string, newName: string): void
  (e: 'duplicate-project', projectId: string): void
  (e: 'delete-project', projectId: string): void
  (e: 'open-settings'): void
}>()

// State
const activeMenu = ref<string | null>(null)
const isCreating = ref(false)
const showRenameModal = ref(false)
const showDeleteModal = ref(false)
const newProjectName = ref('')
const projectToRename = ref<Project | null>(null)
const projectToDelete = ref<Project | null>(null)
const renameInput = ref<HTMLInputElement | null>(null)

// Touch handling for swipe to close
const touchStartX = ref(0)
const touchCurrentX = ref(0)

// Computed
const sortedProjects = computed(() => {
  return [...props.projects].sort((a, b) => b.updatedAt - a.updatedAt)
})

// Methods
function openSidebar() {
  emit('update:isOpen', true)
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}

function closeSidebar() {
  emit('update:isOpen', false)
  activeMenu.value = null
}

function selectProject(projectId: string) {
  emit('select-project', projectId)
  closeSidebar()
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(15)
  }
}

function createNewProject() {
  isCreating.value = true
  emit('create-project')
  setTimeout(() => {
    isCreating.value = false
    closeSidebar()
  }, 300)
}

function toggleMenu(projectId: string) {
  activeMenu.value = activeMenu.value === projectId ? null : projectId
}

function renameProjectPrompt(project: Project) {
  projectToRename.value = project
  newProjectName.value = project.name
  showRenameModal.value = true
  activeMenu.value = null
  
  nextTick(() => {
    renameInput.value?.focus()
    renameInput.value?.select()
  })
}

function closeRenameModal() {
  showRenameModal.value = false
  projectToRename.value = null
  newProjectName.value = ''
}

function confirmRename() {
  if (projectToRename.value && newProjectName.value.trim()) {
    emit('rename-project', projectToRename.value.id, newProjectName.value.trim())
    closeRenameModal()
  }
}

function duplicateProjectAction(projectId: string) {
  emit('duplicate-project', projectId)
  activeMenu.value = null
}

function deleteProjectPrompt(project: Project) {
  projectToDelete.value = project
  showDeleteModal.value = true
  activeMenu.value = null
}

function closeDeleteModal() {
  showDeleteModal.value = false
  projectToDelete.value = null
}

function confirmDelete() {
  if (projectToDelete.value) {
    emit('delete-project', projectToDelete.value.id)
    closeDeleteModal()
  }
}

function openSettings() {
  emit('open-settings')
  closeSidebar()
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m ago`
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}d ago`
  }
  
  // Default format
  return date.toLocaleDateString()
}

// Swipe to close handling
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchMove(e: TouchEvent) {
  touchCurrentX.value = e.touches[0].clientX
}

function handleTouchEnd() {
  const swipeDistance = touchStartX.value - touchCurrentX.value
  // Swipe left to close (at least 80px)
  if (swipeDistance > 80) {
    closeSidebar()
  }
  touchStartX.value = 0
  touchCurrentX.value = 0
}

// Close menu when clicking outside
watch(() => props.isOpen, (open) => {
  if (!open) {
    activeMenu.value = null
  }
})
</script>

<style scoped>
.chat-sidebar-container {
  position: relative;
  z-index: 1000;
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1001;
}

/* Panel - Premium Dark Glass */
.sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 300px;
  max-width: 85vw;
  background: linear-gradient(165deg, 
    rgba(30, 30, 50, 0.98) 0%, 
    rgba(20, 20, 40, 0.99) 50%,
    rgba(15, 15, 35, 1) 100%);
  z-index: 1002;
  display: flex;
  flex-direction: column;
  box-shadow: 
    4px 0 30px rgba(0, 0, 0, 0.4),
    inset -1px 0 0 rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

/* Header - Elegant */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.3px;
}

.new-project-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.new-project-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.new-project-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Project List - Scrollable */
.project-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.project-list::-webkit-scrollbar {
  width: 6px;
}

.project-list::-webkit-scrollbar-track {
  background: transparent;
}

.project-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-bottom: 6px;
  border: 1px solid transparent;
}

.project-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.project-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

/* Thumbnail - Enhanced */
.project-thumbnail {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: rgba(255, 255, 255, 0.5);
}

/* Project Info - Enhanced */
.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
}

.project-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  font-weight: 500;
}

/* Actions */
.project-actions {
  position: relative;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Dropdown Menu - Premium */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: linear-gradient(165deg, rgba(45, 45, 70, 0.98) 0%, rgba(35, 35, 60, 0.99) 100%);
  border-radius: 12px;
  padding: 6px;
  min-width: 150px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dropdown-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.dropdown-menu .delete-btn {
  color: #ff6b6b;
}

.dropdown-menu .delete-btn:hover {
  background: rgba(255, 107, 107, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.create-first-btn {
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Toggle Button */
.sidebar-toggle-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s;
}

.sidebar-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: #2a2a4a;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.rename-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.rename-input:focus {
  border-color: #667eea;
}

.delete-warning {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.delete-confirm-btn {
  background: #ff6b6b;
  border: none;
  color: white;
}

.delete-confirm-btn:hover {
  background: #ff5252;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 380px) {
  .sidebar-panel {
    width: 100%;
    max-width: none;
  }
}
</style>
