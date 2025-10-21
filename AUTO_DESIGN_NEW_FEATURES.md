# AUTO DESIGN MODULE – NEW FEATURES IMPLEMENTATION

**Date**: 2025-10-10  
**Purpose**: Document new features from updated specification  
**Status**: Ready for Implementation

---

## 📋 TABLE OF CONTENTS

1. [Socket.io Real-time Integration](#1-socketio-real-time-integration)
2. [Retouch Feature](#2-retouch-feature)
3. [Create More Feature](#3-create-more-feature)
4. [Background Selection Popup](#4-background-selection-popup)
5. [AI Text Layout Service](#5-ai-text-layout-service)
6. [Glassmorphism UI Styling](#6-glassmorphism-ui-styling)
7. [Swipe Carousel](#7-swipe-carousel)
8. [Admin Template Management](#8-admin-template-management)

---

## 1. SOCKET.IO REAL-TIME INTEGRATION

### 1.1 Overview

Replace polling with Socket.io for real-time design generation updates.

### 1.2 Frontend Implementation

**Install Dependencies** (already in package.json):
```bash
# socket.io-client@4.8.1 already installed
```

**Create Socket Service** (`src/services/socket.service.ts`):

```typescript
// src/services/socket.service.ts
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect(userId: string) {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)

    this.socket?.on(event, (...args) => callback(...args))
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const listeners = this.listeners.get(event) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
      this.socket?.off(event, callback as any)
    } else {
      this.listeners.delete(event)
      this.socket?.off(event)
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data)
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
```

**Update Pinia Store** (`src/stores/autoDesign.ts`):

```typescript
// Add to autoDesign store
import { socketService } from '@/services/socket.service'

// In store setup
function initializeSocket() {
  if (!authStore.user) return

  socketService.connect(authStore.user.id)

  // Listen for design generation progress
  socketService.on('design:progress', (data: { projectId: string, progress: number }) => {
    if (currentProject.value?.id === data.projectId) {
      generationProgress.value = data.progress
    }
  })

  // Listen for design completion
  socketService.on('design:completed', (data: { projectId: string, project: AutoDesignProject }) => {
    if (currentProject.value?.id === data.projectId) {
      currentProject.value = data.project
      isGenerating.value = false
      generationProgress.value = 100

      authStore.showNotification({
        title: 'Design Generated!',
        message: 'Your design is ready to preview',
        type: 'success'
      })
    }
  })

  // Listen for design failure
  socketService.on('design:failed', (data: { projectId: string, error: string }) => {
    if (currentProject.value?.id === data.projectId) {
      isGenerating.value = false
      error.value = data.error

      authStore.showNotification({
        title: 'Generation Failed',
        message: data.error,
        type: 'error'
      })
    }
  })
}

// Call on store initialization
onMounted(() => {
  initializeSocket()
})

// Cleanup on unmount
onUnmounted(() => {
  socketService.disconnect()
})
```

### 1.3 Backend Implementation

**Create Socket Handler** (`server/sockets/autoDesign.socket.js`):

```javascript
// server/sockets/autoDesign.socket.js
module.exports = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId
    console.log(`User ${userId} connected: ${socket.id}`)

    // Join user's personal room
    socket.join(`user:${userId}`)

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected: ${socket.id}`)
    })
  })
}

// Helper function to emit to user
function emitToUser(io, userId, event, data) {
  io.to(`user:${userId}`).emit(event, data)
}

// Export helper
module.exports.emitToUser = emitToUser
```

**Update Server** (`server/index.js`):

```javascript
// server/index.js
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Socket.io setup
require('./sockets/autoDesign.socket')(io)

// Make io available to routes
app.set('io', io)

// Routes
app.use('/api/auto-design', require('./routes/auto-design'))

// Start server
const PORT = process.env.PORT || 3002
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

**Emit Progress from Controller**:

```javascript
// server/controllers/auto-design.controller.js
const { emitToUser } = require('../sockets/autoDesign.socket')

async function generateDesign(req, res) {
  const { userId, category, inputs, files } = req.body
  const io = req.app.get('io')

  try {
    // Create project
    const project = await createProject({ userId, category, inputs, files })

    // Emit initial progress
    emitToUser(io, userId, 'design:progress', {
      projectId: project.id,
      progress: 10
    })

    // Process images
    await processImages(project)
    emitToUser(io, userId, 'design:progress', {
      projectId: project.id,
      progress: 40
    })

    // Generate design
    const design = await renderDesign(project)
    emitToUser(io, userId, 'design:progress', {
      projectId: project.id,
      progress: 80
    })

    // Save design
    project.design = design
    await project.save()

    // Emit completion
    emitToUser(io, userId, 'design:completed', {
      projectId: project.id,
      project
    })

    res.json({ success: true, projectId: project.id })
  } catch (error) {
    emitToUser(io, userId, 'design:failed', {
      projectId: project?.id,
      error: error.message
    })
    res.status(500).json({ success: false, error: error.message })
  }
}
```

---

## 2. RETOUCH FEATURE

### 2.1 Overview

Allow users to modify generated designs by changing text, colors, or images.

### 2.2 Component

**Create RetouchPanel.vue** (`src/components/auto-design/RetouchPanel.vue`):

```vue
<template>
  <div class="retouch-panel">
    <h3>Retouch Design</h3>
    
    <!-- Text Editing -->
    <div class="section">
      <h4>Edit Text</h4>
      <div v-for="(value, key) in design.inputs.text" :key="key" class="input-group">
        <label>{{ formatLabel(key) }}</label>
        <input
          v-model="editedInputs.text[key]"
          type="text"
          :placeholder="value"
        />
      </div>
    </div>

    <!-- Color Editing -->
    <div class="section">
      <h4>Edit Colors</h4>
      <ColorPicker
        v-model="editedInputs.colors.primary"
        label="Primary Color"
      />
      <ColorPicker
        v-model="editedInputs.colors.secondary"
        label="Secondary Color"
      />
    </div>

    <!-- Image Replacement -->
    <div class="section">
      <h4>Replace Images</h4>
      <div v-for="(img, index) in design.files.images" :key="index" class="image-item">
        <img :src="img.url" alt="Image" />
        <button @click="replaceImage(index)">Replace</button>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button @click="applyRetouch" class="btn-primary">Apply Changes</button>
      <button @click="cancel" class="btn-secondary">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAutoDesignStore } from '@/stores/autoDesign'
import ColorPicker from './ColorPicker.vue'
import type { AutoDesignProject } from '@/types/auto-design'

const props = defineProps<{
  design: AutoDesignProject
}>()

const emit = defineEmits<{
  close: []
  retouched: [project: AutoDesignProject]
}>()

const autoDesignStore = useAutoDesignStore()

const editedInputs = reactive({
  text: { ...props.design.inputs.text },
  colors: { ...props.design.inputs.colors }
})

function formatLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

async function applyRetouch() {
  await autoDesignStore.retouchDesign(props.design.id, editedInputs)
  emit('close')
}

function cancel() {
  emit('close')
}

function replaceImage(index: number) {
  // Implement image replacement logic
}
</script>
```

### 2.3 Store Action

```typescript
// Add to autoDesign store
async function retouchDesign(projectId: string, newInputs: any) {
  try {
    isGenerating.value = true

    const result = await autoDesignAPI.retouchDesign(projectId, newInputs)

    currentProject.value = result.project

    authStore.showNotification({
      title: 'Design Retouched!',
      message: 'Your changes have been applied',
      type: 'success'
    })
  } catch (err: any) {
    authStore.showNotification({
      title: 'Retouch Failed',
      message: err.message,
      type: 'error'
    })
  } finally {
    isGenerating.value = false
  }
}
```

### 2.4 API Endpoint

```typescript
// src/services/auto-design-api.ts
export async function retouchDesign(projectId: string, newInputs: any) {
  const response = await fetch(`${API_BASE_URL}/auto-design/retouch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, newInputs })
  })

  if (!response.ok) {
    throw new Error('Failed to retouch design')
  }

  return await response.json()
}
```

---

## 3. CREATE MORE FEATURE

### 3.1 Overview

Generate variations of the current design with different layouts or styles.

### 3.2 Component

**Create CreateMorePanel.vue**:

```vue
<template>
  <div class="create-more-panel">
    <h3>Create More Variations</h3>
    
    <div class="options">
      <label>
        <input type="checkbox" v-model="options.differentColors" />
        Different Color Schemes
      </label>
      <label>
        <input type="checkbox" v-model="options.differentLayouts" />
        Different Layouts
      </label>
      <label>
        <input type="checkbox" v-model="options.differentFonts" />
        Different Fonts
      </label>
    </div>

    <div class="quantity">
      <label>Number of Variations:</label>
      <input type="number" v-model="quantity" min="1" max="10" />
    </div>

    <button @click="generateVariations" class="btn-primary">
      Generate {{ quantity }} Variation{{ quantity > 1 ? 's' : '' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAutoDesignStore } from '@/stores/autoDesign'

const props = defineProps<{
  designId: string
}>()

const autoDesignStore = useAutoDesignStore()

const quantity = ref(3)
const options = reactive({
  differentColors: true,
  differentLayouts: true,
  differentFonts: false
})

async function generateVariations() {
  await autoDesignStore.createMoreVariations(props.designId, {
    quantity: quantity.value,
    options: options
  })
}
</script>
```

### 3.3 Store Action

```typescript
async function createMoreVariations(projectId: string, config: any) {
  try {
    isGenerating.value = true

    const result = await autoDesignAPI.createMoreVariations(projectId, config)

    // Add new variations to projects list
    projects.value.unshift(...result.variations)

    authStore.showNotification({
      title: 'Variations Created!',
      message: `${result.variations.length} new designs generated`,
      type: 'success'
    })
  } catch (err: any) {
    authStore.showNotification({
      title: 'Generation Failed',
      message: err.message,
      type: 'error'
    })
  } finally {
    isGenerating.value = false
  }
}
```

---

## 4. BACKGROUND SELECTION POPUP

### 4.1 Component

**Create BackgroundSelectionPopup.vue**:

```vue
<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="background-selection">
      <h3>Select Background</h3>

      <div class="tabs">
        <button
          :class="{ active: activeTab === 'default' }"
          @click="activeTab = 'default'"
        >
          Default Templates
        </button>
        <button
          :class="{ active: activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          Upload from Gallery
        </button>
        <button
          :class="{ active: activeTab === 'online' }"
          @click="activeTab = 'online'"
        >
          Go Online
        </button>
      </div>

      <!-- Default Templates -->
      <div v-if="activeTab === 'default'" class="template-grid">
        <div
          v-for="bg in defaultBackgrounds"
          :key="bg.id"
          class="bg-item"
          @click="selectBackground(bg.url)"
        >
          <img :src="bg.thumbnail" :alt="bg.name" />
          <span>{{ bg.name }}</span>
        </div>
      </div>

      <!-- Upload from Gallery -->
      <div v-if="activeTab === 'upload'" class="upload-section">
        <input
          type="file"
          accept="image/*"
          @change="handleFileUpload"
          ref="fileInput"
        />
        <button @click="$refs.fileInput.click()">Choose File</button>
      </div>

      <!-- Go Online (Search) -->
      <div v-if="activeTab === 'online'" class="online-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for backgrounds..."
          @keyup.enter="searchOnline"
        />
        <button @click="searchOnline">Search</button>

        <div class="search-results">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="result-item"
            @click="selectBackground(result.url)"
          >
            <img :src="result.thumbnail" :alt="result.title" />
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [url: string]
}>()

const activeTab = ref<'default' | 'upload' | 'online'>('default')
const searchQuery = ref('')
const searchResults = ref([])

const defaultBackgrounds = ref([
  { id: 1, name: 'Gradient Blue', url: '/bg/gradient-blue.jpg', thumbnail: '/bg/gradient-blue-thumb.jpg' },
  { id: 2, name: 'Solid White', url: '/bg/white.jpg', thumbnail: '/bg/white-thumb.jpg' },
  // ... more backgrounds
])

function selectBackground(url: string) {
  emit('select', url)
  emit('close')
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // Upload file and get URL
    const url = await uploadBackground(file)
    selectBackground(url)
  }
}

async function searchOnline() {
  // Call Unsplash or Pexels API
  const results = await fetch(`https://api.unsplash.com/search/photos?query=${searchQuery.value}`)
  searchResults.value = await results.json()
}
</script>
```

---

## 5. AI TEXT LAYOUT SERVICE

### 5.1 Backend Service

**Create AI Text Layout Service** (`server/services/text-layout-ai.service.js`):

```javascript
// server/services/text-layout-ai.service.js
const { Configuration, OpenAIApi } = require('openai')

// Free alternative: Use rule-based system
class TextLayoutService {
  /**
   * Calculate optimal text layout
   */
  calculateLayout(text, containerWidth, containerHeight, options = {}) {
    const {
      minFontSize = 12,
      maxFontSize = 72,
      lineHeightRatio = 1.2,
      padding = 20
    } = options

    // Calculate optimal font size
    const fontSize = this.calculateOptimalFontSize(
      text,
      containerWidth - padding * 2,
      containerHeight - padding * 2,
      minFontSize,
      maxFontSize
    )

    // Calculate line height
    const lineHeight = fontSize * lineHeightRatio

    // Calculate alignment
    const alignment = this.calculateAlignment(text, containerWidth)

    return {
      fontSize,
      lineHeight,
      alignment,
      padding,
      letterSpacing: fontSize > 48 ? -0.02 : 0,
      wordSpacing: 0
    }
  }

  calculateOptimalFontSize(text, width, height, min, max) {
    // Binary search for optimal font size
    let low = min
    let high = max
    let optimal = min

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const fits = this.textFits(text, width, height, mid)

      if (fits) {
        optimal = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return optimal
  }

  textFits(text, width, height, fontSize) {
    // Estimate text dimensions
    const avgCharWidth = fontSize * 0.6
    const lineHeight = fontSize * 1.2
    const charsPerLine = Math.floor(width / avgCharWidth)
    const lines = Math.ceil(text.length / charsPerLine)
    const totalHeight = lines * lineHeight

    return totalHeight <= height
  }

  calculateAlignment(text, containerWidth) {
    // Simple heuristic: short text = center, long text = left
    return text.length < 50 ? 'center' : 'left'
  }
}

module.exports = new TextLayoutService()
```

### 5.2 API Endpoint

```javascript
// server/routes/auto-design.js
const textLayoutService = require('../services/text-layout-ai.service')

router.post('/ai/textlayout', async (req, res) => {
  try {
    const { text, containerWidth, containerHeight, options } = req.body

    const layout = textLayoutService.calculateLayout(
      text,
      containerWidth,
      containerHeight,
      options
    )

    res.json({ success: true, layout })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
```

---

## 6. GLASSMORPHISM UI STYLING

### 6.1 Tailwind CSS Configuration

**Add to `tailwind.config.js`**:

```javascript
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      }
    }
  }
}
```

### 6.2 CSS Utilities

**Create `src/assets/glassmorphism.css`**:

```css
/* Glassmorphism Utilities */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-hover {
  transition: all 0.3s ease;
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.5);
  transform: translateY(-2px);
}

/* Frosted Modal Overlay */
.frosted-overlay {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Smooth Transitions */
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover Scaling */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

### 6.3 Usage Example

```vue
<template>
  <div class="glass rounded-xl p-6 glass-hover">
    <h3 class="text-white">Glassmorphism Card</h3>
    <p class="text-gray-200">Beautiful frosted glass effect</p>
  </div>
</template>
```

---

## 7. SWIPE CAROUSEL

### 7.1 Install Swiper

```bash
npm install swiper
```

### 7.2 Component

**Update ImagePreviewCarousel.vue**:

```vue
<template>
  <div class="swipe-carousel">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="10"
      :navigation="true"
      :pagination="{ clickable: true }"
      :scrollbar="{ draggable: true }"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index">
        <div class="image-slide">
          <img :src="image.url" :alt="`Image ${index + 1}`" />
          <button @click="removeImage(index)" class="remove-btn">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Scrollbar } from 'swiper/modules'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

const props = defineProps<{
  images: Array<{ url: string }>
}>()

const emit = defineEmits<{
  remove: [index: number]
}>()

const modules = [Navigation, Pagination, Scrollbar]

function onSwiper(swiper: any) {
  console.log('Swiper initialized:', swiper)
}

function onSlideChange() {
  console.log('Slide changed')
}

function removeImage(index: number) {
  emit('remove', index)
}
</script>
```

---

## 8. ADMIN TEMPLATE MANAGEMENT

### 8.1 Component

**Create AdminTemplateManager.vue** (`src/views/admin/AdminTemplateManager.vue`):

```vue
<template>
  <div class="admin-template-manager">
    <h2>Template Management</h2>

    <!-- Upload New Template -->
    <div class="upload-section glass p-6 rounded-xl">
      <h3>Upload New Template</h3>
      <form @submit.prevent="uploadTemplate">
        <input v-model="newTemplate.name" placeholder="Template Name" required />
        <select v-model="newTemplate.category" required>
          <option value="">Select Category</option>
          <option value="Business Card">Business Card</option>
          <option value="Flyer">Flyer</option>
          <!-- ... more categories -->
        </select>
        <input type="file" @change="handleTemplateFile" accept=".json" />
        <button type="submit">Upload Template</button>
      </form>
    </div>

    <!-- Template List -->
    <div class="template-list">
      <div v-for="template in templates" :key="template.id" class="template-card glass">
        <h4>{{ template.name }}</h4>
        <p>Category: {{ template.category }}</p>
        <p>Status: {{ template.published ? 'Published' : 'Draft' }}</p>
        <div class="actions">
          <button @click="togglePublish(template.id)">
            {{ template.published ? 'Unpublish' : 'Publish' }}
          </button>
          <button @click="editTemplate(template.id)">Edit</button>
          <button @click="deleteTemplate(template.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as autoDesignAPI from '@/services/auto-design-api'

const templates = ref([])
const newTemplate = ref({
  name: '',
  category: '',
  file: null
})

onMounted(async () => {
  templates.value = await autoDesignAPI.getTemplates()
})

async function uploadTemplate() {
  // Upload template logic
}

async function togglePublish(templateId: string) {
  await autoDesignAPI.toggleTemplatePublish(templateId)
  // Refresh list
}

function editTemplate(templateId: string) {
  // Navigate to edit page
}

async function deleteTemplate(templateId: string) {
  if (confirm('Are you sure?')) {
    await autoDesignAPI.deleteTemplate(templateId)
    // Refresh list
  }
}
</script>
```

### 8.2 API Endpoints

```typescript
// src/services/auto-design-api.ts

export async function toggleTemplatePublish(templateId: string) {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/publish`, {
    method: 'PATCH'
  })
  return await response.json()
}

export async function deleteTemplate(templateId: string) {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    method: 'DELETE'
  })
  return await response.json()
}
```

---

**Status**: All new features documented and ready for implementation! 🚀

