<template>
  <div class="naming-panel">
    <!-- FORM VIEW -->
    <Transition name="fade">
      <div v-if="viewMode === 'form'" class="form-view">
        <!-- Header -->
        <div class="panel-header">
          <button @click="goBack" class="back-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 class="panel-title">Naming Design</h2>
          <button @click="showMenu = !showMenu" class="menu-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <!-- Description Field -->
          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              @input="handleDescriptionInput"
              class="form-textarea"
              rows="4"
              placeholder="Enter names and details... (e.g., John & Sarah Ahmed, 15th April 2025, courtesy: Smith Family)"
            ></textarea>
          </div>

          <!-- Design Theme Selector -->
          <div class="form-group">
            <label class="form-label">Design Theme</label>
            <div class="theme-selector">
              <button
                v-for="theme in designThemes"
                :key="theme.id"
                :class="['theme-btn', { active: selectedTheme === theme.id }]"
                @click="selectTheme(theme.id)"
                :title="theme.description"
              >
                {{ theme.name }}
              </button>
            </div>
          </div>

          <!-- One-Click Design Refresh Button -->
          <div class="form-group">
            <button @click="refreshDesign" class="refresh-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Design
            </button>
          </div>

          <!-- Live Preview -->
          <div class="preview-section">
            <label class="form-label">Live Preview</label>
            <div class="naming-preview-container" ref="namingPreviewContainer">
              <!-- SVG will be loaded here -->
            </div>
          </div>

          <!-- SVG Editor Toggle -->
          <div class="form-group">
            <button @click="showSVGEditor = !showSVGEditor" class="editor-toggle-btn">
              {{ showSVGEditor ? '✕ Close Editor' : '✎ Edit SVG' }}
            </button>
          </div>

          <!-- SVG Editor -->
          <Transition name="slide">
            <div v-if="showSVGEditor" class="svg-editor-section">
              <h3 class="editor-title">Edit SVG Properties</h3>
              
              <!-- Font Settings -->
              <div class="editor-group">
                <h4>Fonts</h4>
                <div class="editor-control">
                  <label>Font Family</label>
                  <select v-model="svgEditorState.fontFamily" @change="applyFontChange" class="editor-input">
                    <option value="Cinzel Decorative">Cinzel Decorative</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Great Day Personal Use">Great Day Personal Use</option>
                  </select>
                </div>
                <div class="editor-control">
                  <label>Font Size</label>
                  <input v-model.number="svgEditorState.fontSize" @change="applyFontChange" type="range" min="20" max="150" class="editor-slider" />
                  <span>{{ svgEditorState.fontSize }}px</span>
                </div>
              </div>

              <!-- Color Settings -->
              <div class="editor-group">
                <h4>Colors</h4>
                <div class="editor-control">
                  <label>Text Color</label>
                  <div class="color-picker">
                    <input v-model="svgEditorState.textColor" @change="applyColorChange" type="color" class="editor-color" />
                    <span>{{ svgEditorState.textColor }}</span>
                  </div>
                </div>
                <div class="editor-control">
                  <label>Background Color</label>
                  <div class="color-picker">
                    <input v-model="svgEditorState.bgColor" @change="applyColorChange" type="color" class="editor-color" />
                    <span>{{ svgEditorState.bgColor }}</span>
                  </div>
                </div>
              </div>

              <!-- Reset Editor -->
              <div class="editor-group">
                <button @click="resetSVGEditor" class="reset-btn">Reset to Default</button>
              </div>
            </div>
          </Transition>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button @click="downloadDesign" class="action-btn download-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button @click="saveToLibrary" class="action-btn save-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V5" />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Status Message -->
    <Transition name="slide">
      <div v-if="statusMessage" :class="['status-message', statusMessage.type]">
        {{ statusMessage.text }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNamingDesignRefresh } from '@/composables/useNamingDesignRefresh'
import { useWeddingStickerUpdater } from '@/composables/useWeddingStickerUpdater'

const router = useRouter()
const authStore = useAuthStore()
const { refreshDesignTheme, getDesignThemes } = useNamingDesignRefresh()
const { updateStickerText, getSVGElements } = useWeddingStickerUpdater()

// State
const viewMode = ref<'form' | 'editing'>('form')
const showMenu = ref(false)
const showSVGEditor = ref(false)
const namingPreviewContainer = ref<HTMLDivElement | null>(null)

const formData = reactive({
  description: '',
  names: '',
  date: '',
  courtesy: ''
})

const designThemes = getDesignThemes()
const selectedTheme = ref('elegant')
let currentSVGElement: SVGSVGElement | null = null
let svgElements: ReturnType<typeof getSVGElements> | null = null

const svgEditorState = reactive({
  fontFamily: 'Cinzel Decorative',
  fontSize: 84,
  textColor: '#000000',
  bgColor: '#FFFFFF'
})

const statusMessage = ref<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

// Methods
function goBack() {
  router.push('/auto-design')
}

function selectTheme(themeId: string) {
  selectedTheme.value = themeId
  loadNamingTemplate()
}

async function handleDescriptionInput() {
  // Auto-parse description for names, dates, courtesy
  if (formData.description && svgElements) {
    await updateStickerText(formData.description, svgElements)
  }
}

async function loadNamingTemplate() {
  if (!namingPreviewContainer.value) return

  try {
    showMessage('Loading design...', 'info')

    const response = await fetch(`/svg/naming/${selectedTheme.value}/template.svg`)
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`)
    }

    const svgText = await response.text()
    namingPreviewContainer.value.innerHTML = svgText

    await nextTick()
    const svgElement = namingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      currentSVGElement = svgElement
      svgElements = getSVGElements(svgElement)

      // Apply current description
      if (formData.description) {
        await updateStickerText(formData.description, svgElements)
      }

      showMessage('Design loaded successfully', 'success')
    }
  } catch (error) {
    console.error('Failed to load naming template:', error)
    showMessage('Failed to load design', 'error')
  }
}

async function refreshDesign() {
  if (!currentSVGElement || !svgElements) {
    showMessage('Please load a design first', 'error')
    return
  }

  try {
    showMessage('Refreshing design...', 'info')
    const refreshedSVG = await refreshDesignTheme(
      currentSVGElement.outerHTML,
      selectedTheme.value,
      formData.description
    )

    if (namingPreviewContainer.value && refreshedSVG) {
      namingPreviewContainer.value.innerHTML = refreshedSVG
      await nextTick()

      const svgElement = namingPreviewContainer.value.querySelector('svg') as SVGSVGElement
      if (svgElement) {
        currentSVGElement = svgElement
        svgElements = getSVGElements(svgElement)
        showMessage('Design refreshed!', 'success')
      }
    }
  } catch (error) {
    console.error('Failed to refresh design:', error)
    showMessage('Failed to refresh design', 'error')
  }
}

function applyFontChange() {
  if (!currentSVGElement) return

  const textElements = currentSVGElement.querySelectorAll('text')
  textElements.forEach(text => {
    text.setAttribute('font-family', svgEditorState.fontFamily)
    text.setAttribute('font-size', `${svgEditorState.fontSize}px`)
  })

  showMessage('Font updated', 'success')
}

function applyColorChange() {
  if (!currentSVGElement) return

  const textElements = currentSVGElement.querySelectorAll('text')
  textElements.forEach(text => {
    text.setAttribute('fill', svgEditorState.textColor)
  })

  // Update background
  const background = currentSVGElement.querySelector('rect')
  if (background) {
    background.setAttribute('fill', svgEditorState.bgColor)
  }

  showMessage('Colors updated', 'success')
}

function resetSVGEditor() {
  svgEditorState.fontFamily = 'Cinzel Decorative'
  svgEditorState.fontSize = 84
  svgEditorState.textColor = '#000000'
  svgEditorState.bgColor = '#FFFFFF'
  applyFontChange()
  applyColorChange()
  showMessage('Reset to defaults', 'success')
}

async function downloadDesign() {
  if (!currentSVGElement) {
    showMessage('Please create a design first', 'error')
    return
  }

  try {
    const svgData = new XMLSerializer().serializeToString(currentSVGElement)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `naming-${Date.now()}.svg`
    link.click()
    URL.revokeObjectURL(url)
    showMessage('Design downloaded!', 'success')
  } catch (error) {
    console.error('Download failed:', error)
    showMessage('Failed to download design', 'error')
  }
}

async function saveToLibrary() {
  if (!currentSVGElement || !formData.description) {
    showMessage('Please complete the design first', 'error')
    return
  }

  try {
    // This would save to a database/library (to be implemented)
    showMessage('Design saved to library!', 'success')
  } catch (error) {
    console.error('Save failed:', error)
    showMessage('Failed to save design', 'error')
  }
}

function showMessage(text: string, type: 'success' | 'error' | 'info') {
  statusMessage.value = { text, type }
  setTimeout(() => {
    statusMessage.value = null
  }, 3000)
}

// Initialize
async function initialize() {
  await loadNamingTemplate()
}

initialize()
</script>

<style scoped>
.naming-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.form-view {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 15px;
}

.back-btn,
.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover,
.menu-btn:hover {
  background-color: #e9ecef;
}

.panel-title {
  flex: 1;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-textarea {
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.theme-btn {
  padding: 10px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.theme-btn:hover {
  border-color: #4f46e5;
  background: #f0f4ff;
}

.theme-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.refresh-btn:hover {
  transform: translateY(-2px);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.naming-preview-container {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.naming-preview-container svg {
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
}

.editor-toggle-btn {
  padding: 10px 16px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  transition: all 0.2s;
}

.editor-toggle-btn:hover {
  background: #e9ecef;
  border-color: #4f46e5;
}

.svg-editor-section {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.editor-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.editor-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-group h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.editor-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-control label {
  min-width: 120px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.editor-input,
.editor-slider {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
}

.editor-slider {
  padding: 0;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.editor-color {
  width: 50px;
  height: 40px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
}

.reset-btn {
  padding: 10px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #b91c1c;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.download-btn {
  background: #3b82f6;
  color: white;
}

.download-btn:hover {
  background: #2563eb;
}

.save-btn {
  background: #10b981;
  color: white;
}

.save-btn:hover {
  background: #059669;
}

.status-message {
  padding: 12px 20px;
  text-align: center;
  font-weight: 600;
  animation: slideDown 0.3s ease-out;
}

.status-message.success {
  background: #d1fae5;
  color: #065f46;
  border-top: 3px solid #10b981;
}

.status-message.error {
  background: #fee2e2;
  color: #7f1d1d;
  border-top: 3px solid #dc2626;
}

.status-message.info {
  background: #dbeafe;
  color: #0c2d6b;
  border-top: 3px solid #3b82f6;
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
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }

  .theme-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .naming-preview-container {
    min-height: 250px;
  }
}
</style>
