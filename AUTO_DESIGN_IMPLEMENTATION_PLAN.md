# AUTO DESIGN MODULE – DETAILED IMPLEMENTATION PLAN

**Project**: SmartDesignPro  
**Module**: Auto Design System  
**Date**: 2025-10-10  
**Status**: Ready to Implement

---

## TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Frontend Components](#5-frontend-components)
6. [State Management](#6-state-management)
7. [Routing Configuration](#7-routing-configuration)
8. [File Structure](#8-file-structure)
9. [Implementation Steps](#9-implementation-steps)
10. [Code Examples](#10-code-examples)

---

## 1. OVERVIEW

### 1.1 Feature Summary

The Auto Design module allows users to:
1. Select a design category from the header dropdown
2. Fill out a dynamic form with text, colors, and images
3. Upload logos and images with background removal
4. Generate professional designs automatically
5. Preview, download, or send designs to the main editor
6. Access design history and manage past projects

### 1.2 User Flow

```
Home Page
    ↓
Click "Auto Design" → Select Category (e.g., "Business Card")
    ↓
Navigate to /auto-design?category=business-card
    ↓
Fill Form (text, colors, size, images, logo)
    ↓
Click "Generate Design"
    ↓
[Loading with progress indicator]
    ↓
Preview Modal (Download, Edit, Send to Editor)
    ↓
Design saved to history
```

---

## 2. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue 3)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   HomePage   │───▶│AutoDesignPage│───▶│DesignEditor  │ │
│  │  (Dropdown)  │    │   (Form)     │    │  (Canvas)    │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                             │                               │
│                             ▼                               │
│                    ┌─────────────────┐                     │
│                    │  Pinia Stores   │                     │
│                    │  - autoDesign   │                     │
│                    │  - auth         │                     │
│                    │  - editor       │                     │
│                    └─────────────────┘                     │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │   Auth   │    │ Firestore│    │  Storage │             │
│  │  (Users) │    │(Projects)│    │ (Images) │             │
│  └──────────┘    └──────────┘    └──────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  NODE.JS API SERVER                          │
│                  (localhost:3002)                            │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐            │
│  │  /api/auto-design/generate                 │            │
│  │  /api/auto-design/projects                 │            │
│  │  /api/auto-design/templates                │            │
│  │  /api/ai/bg-remove (existing)              │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICES                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │  Remove.bg API   │    │  Template Engine │             │
│  │  (Bg Removal)    │    │  (Konva.js)      │             │
│  └──────────────────┘    └──────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. DATABASE SCHEMA

### 3.1 Firestore Collections

#### Collection: `autoDesignProjects`

```typescript
interface AutoDesignProject {
  id: string                    // Auto-generated document ID
  userId: string                // Reference to user
  category: string              // "Business Card", "Flyer", etc.
  subCategory?: string          // "Wedding", "Corporate", etc.
  templateId?: string           // Reference to template (if using templates)
  
  // User Inputs
  inputs: {
    text: {
      [key: string]: string     // Dynamic text fields
      // Example: { title: "John Doe", subtitle: "CEO" }
    }
    colors: {
      primary: string           // Hex color
      secondary: string         // Hex color
    }
    size: string                // "A4", "A5", "Business Card", etc.
    customDimensions?: {
      width: number
      height: number
      unit: 'in' | 'cm' | 'px'
    }
    options: {
      removeBackground: boolean
      backgroundType: 'default' | 'custom' | 'online'
      customBackground?: string // URL if custom
    }
  }
  
  // Uploaded Files
  files: {
    logo?: {
      url: string
      originalName: string
      size: number
      processedUrl?: string     // After background removal
    }
    images: Array<{
      url: string
      originalName: string
      size: number
      processedUrl?: string
    }>
  }
  
  // Generated Design
  design: {
    previewUrl?: string         // Low-res preview
    fullUrl?: string            // High-res final design
    pdfUrl?: string             // PDF version
    dimensions: {
      width: number
      height: number
      dpi: number
    }
  }
  
  // Metadata
  status: 'draft' | 'processing' | 'completed' | 'failed'
  progress?: number             // 0-100 for processing
  error?: string                // Error message if failed
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### Collection: `templates` (Phase 2)

```typescript
interface Template {
  id: string
  name: string
  category: string
  subCategory?: string
  
  dimensions: {
    width: number
    height: number
    unit: 'in' | 'cm' | 'px'
    dpi: number
  }
  
  fields: Array<{
    name: string
    type: 'text' | 'image' | 'color'
    label: string
    placeholder?: string
    required: boolean
    maxLength?: number
  }>
  
  layout: {
    layers: Array<{
      type: 'text' | 'image' | 'shape' | 'background'
      id: string
      x: number
      y: number
      width: number
      height: number
      properties: any           // Layer-specific properties
    }>
  }
  
  assets: {
    backgrounds?: string[]      // URLs to background images
    fonts?: string[]            // Font family names
  }
  
  published: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 4. API ENDPOINTS

### 4.1 Auto Design API

**Base URL**: `http://localhost:3002/api/auto-design`

#### POST `/generate`
Generate a design from user inputs

**Request**:
```typescript
{
  userId: string
  category: string
  inputs: {
    text: Record<string, string>
    colors: { primary: string, secondary: string }
    size: string
    options: object
  }
  files: {
    logo?: { url: string }
    images?: Array<{ url: string }>
  }
}
```

**Response**:
```typescript
{
  success: boolean
  projectId: string
  status: 'processing' | 'completed'
  previewUrl?: string
  fullUrl?: string
}
```

#### GET `/projects`
Get user's design history

**Query Params**:
- `userId`: string (required)
- `category`: string (optional filter)
- `limit`: number (default: 20)
- `offset`: number (default: 0)

**Response**:
```typescript
{
  success: boolean
  projects: AutoDesignProject[]
  total: number
  hasMore: boolean
}
```

#### GET `/projects/:id`
Get single project details

**Response**:
```typescript
{
  success: boolean
  project: AutoDesignProject
}
```

#### DELETE `/projects/:id`
Delete a project

**Response**:
```typescript
{
  success: boolean
  message: string
}
```

#### GET `/templates`
Get available templates

**Query Params**:
- `category`: string (optional filter)

**Response**:
```typescript
{
  success: boolean
  templates: Template[]
}
```

#### GET `/status/:projectId`
Get generation status (for polling)

**Response**:
```typescript
{
  success: boolean
  status: 'processing' | 'completed' | 'failed'
  progress: number
  previewUrl?: string
  fullUrl?: string
  error?: string
}
```

### 4.2 Existing AI API (Reuse)

#### POST `/api/ai/bg-remove`
Remove background from image (already exists)

**Request**:
```typescript
{
  imageUrl: string
  options?: {
    format: 'png' | 'jpg'
    quality: number
  }
}
```

**Response**:
```typescript
{
  success: boolean
  resultUrl: string
  originalUrl: string
}
```

#### POST `/api/ai/upload`
Upload image to server (already exists)

**Request**: FormData with `image` file

**Response**:
```typescript
{
  success: boolean
  imageUrl: string
}
```

---

## 5. FRONTEND COMPONENTS

### 5.1 Component Hierarchy

```
AutoDesignPage.vue (Main Container)
├── DesignForm.vue (Form Section)
│   ├── TemplateSelector.vue (Sub-category dropdown)
│   ├── TextInputs.vue (Dynamic text fields)
│   ├── ColorPicker.vue (Color selection)
│   ├── SizeSelector.vue (Size dropdown)
│   ├── ImageUploader.vue (Multi-image upload)
│   │   └── ImagePreviewCarousel.vue
│   └── LogoUploader.vue (Single logo upload)
│       └── ImageCropper.vue (Reuse existing)
│
├── DesignPreviewModal.vue (Preview & Actions)
│   ├── PreviewCanvas.vue (Design display)
│   └── ActionButtons.vue (Download, Edit, Share)
│
└── DesignHistoryPanel.vue (Sidebar/Panel)
    ├── HistoryFilters.vue (Search, filter)
    └── HistoryCard.vue (Individual project card)
```

### 5.2 Component Specifications

#### `AutoDesignPage.vue`
**Location**: `src/views/AutoDesignPage.vue`

**Responsibilities**:
- Detect category from URL query parameter
- Manage overall page layout
- Coordinate between form, preview, and history
- Handle loading states
- Display notifications

**Props**: None (reads from route)

**State**:
- `selectedCategory`: string
- `isGenerating`: boolean
- `showPreview`: boolean
- `showHistory`: boolean

#### `DesignForm.vue`
**Location**: `src/components/auto-design/DesignForm.vue`

**Responsibilities**:
- Render dynamic form based on category
- Validate user inputs
- Handle form submission
- Manage file uploads

**Props**:
- `category`: string
- `template`: Template | null

**Emits**:
- `submit`: (formData) => void
- `cancel`: () => void

#### `ImageUploader.vue`
**Location**: `src/components/auto-design/ImageUploader.vue`

**Responsibilities**:
- Multi-file selection (up to 99 images)
- Drag & drop support
- Preview carousel
- Individual image removal
- File validation (size, format)
- Upload to Firebase Storage

**Props**:
- `maxFiles`: number (default: 99)
- `maxSizeMB`: number (default: 5)
- `acceptedFormats`: string[] (default: ['image/jpeg', 'image/png'])

**Emits**:
- `upload`: (files: File[]) => void
- `remove`: (index: number) => void

#### `ColorPicker.vue`
**Location**: `src/components/auto-design/ColorPicker.vue`

**Responsibilities**:
- Color selection UI
- Preset color palettes
- Custom color input
- Color preview

**Props**:
- `modelValue`: string (hex color)
- `label`: string
- `presets`: string[] (optional)

**Emits**:
- `update:modelValue`: (color: string) => void

#### `DesignPreviewModal.vue`
**Location**: `src/components/auto-design/DesignPreviewModal.vue`

**Responsibilities**:
- Full-screen design preview
- Zoom controls
- Download options (PNG, JPEG, PDF)
- Send to editor
- Share functionality

**Props**:
- `show`: boolean
- `design`: AutoDesignProject

**Emits**:
- `close`: () => void
- `download`: (format: string) => void
- `sendToEditor`: () => void
- `share`: () => void

#### `DesignHistoryPanel.vue`
**Location**: `src/components/auto-design/DesignHistoryPanel.vue`

**Responsibilities**:
- Display user's design history
- Search and filter
- Grid/list view toggle
- Pagination or infinite scroll
- Quick actions (preview, delete, duplicate)

**Props**:
- `show`: boolean

**Emits**:
- `select`: (project: AutoDesignProject) => void
- `delete`: (projectId: string) => void

---

## 6. STATE MANAGEMENT

### 6.1 Pinia Store: `autoDesign.ts`

**Location**: `src/stores/autoDesign.ts`

**State**:
```typescript
{
  // Current Design
  selectedCategory: string | null
  selectedTemplate: Template | null
  formData: {
    text: Record<string, string>
    colors: { primary: string, secondary: string }
    size: string
    customDimensions: { width: number, height: number, unit: string } | null
    options: {
      removeBackground: boolean
      backgroundType: 'default' | 'custom' | 'online'
      customBackground: string | null
    }
  }
  uploadedFiles: {
    logo: File | null
    images: File[]
  }
  
  // Generation State
  isGenerating: boolean
  generationProgress: number
  currentProject: AutoDesignProject | null
  
  // History
  projects: AutoDesignProject[]
  projectsLoading: boolean
  projectsTotal: number
  projectsHasMore: boolean
  
  // UI State
  showPreviewModal: boolean
  showHistoryPanel: boolean
  
  // Error Handling
  error: string | null
}
```

**Actions**:
```typescript
// Category & Template
setCategory(category: string): void
setTemplate(template: Template): void

// Form Data
updateFormData(field: string, value: any): void
resetFormData(): void

// File Upload
setLogo(file: File): void
addImages(files: File[]): void
removeImage(index: number): void

// Design Generation
async generateDesign(): Promise<void>
async pollGenerationStatus(projectId: string): Promise<void>

// History Management
async fetchProjects(filters?: object): Promise<void>
async loadMoreProjects(): Promise<void>
async deleteProject(projectId: string): Promise<void>

// Preview & Actions
openPreview(project: AutoDesignProject): void
closePreview(): void
async downloadDesign(format: 'png' | 'jpg' | 'pdf'): Promise<void>
sendToEditor(project: AutoDesignProject): void

// UI
toggleHistoryPanel(): void
setError(error: string | null): void
```

---

## 7. ROUTING CONFIGURATION

### 7.1 Route Definition

**File**: `src/router/index.ts`

**Add Route**:
```typescript
{
  path: '/auto-design',
  name: 'auto-design',
  component: () => import('@/views/AutoDesignPage.vue'),
  meta: {
    title: 'Auto Design - SmartDesignPro',
    requiresAuth: true
  }
}
```

### 7.2 Update AutoDesignDropdown

**File**: `src/components/home/AutoDesignDropdown.vue`

**Change**:
```typescript
// OLD
router.push({
  path: '/editor',
  query: { template: category.toLowerCase().replace(/\s+/g, '-') }
})

// NEW
router.push({
  path: '/auto-design',
  query: { category: category.toLowerCase().replace(/\s+/g, '-') }
})
```

---

## 8. FILE STRUCTURE

### 8.1 Complete File Tree

```
src/
├── views/
│   └── AutoDesignPage.vue                    # 🆕 Main page
│
├── components/
│   └── auto-design/                          # 🆕 New folder
│       ├── DesignForm.vue                    # 🆕 Form component
│       ├── TextInputs.vue                    # 🆕 Dynamic text fields
│       ├── ColorPicker.vue                   # 🆕 Color selection
│       ├── SizeSelector.vue                  # 🆕 Size dropdown
│       ├── TemplateSelector.vue              # 🆕 Sub-category selector
│       ├── ImageUploader.vue                 # 🆕 Multi-image upload
│       ├── ImagePreviewCarousel.vue          # 🆕 Image carousel
│       ├── LogoUploader.vue                  # 🆕 Logo upload
│       ├── DesignPreviewModal.vue            # 🆕 Preview modal
│       ├── DesignHistoryPanel.vue            # 🆕 History panel
│       ├── HistoryFilters.vue                # 🆕 Search/filter
│       ├── HistoryCard.vue                   # 🆕 Project card
│       └── auto-design-styles.css            # 🆕 Shared styles
│
├── stores/
│   └── autoDesign.ts                         # 🆕 Pinia store
│
├── services/
│   └── auto-design-api.ts                    # 🆕 API service
│
├── types/
│   └── auto-design.ts                        # 🆕 TypeScript types
│
├── data/
│   └── templates.ts                          # 🆕 Template definitions
│
└── router/
    └── index.ts                              # ✏️ Add route
```

### 8.2 Backend File Structure

```
server/
├── routes/
│   └── auto-design.js                        # 🆕 API routes
│
├── controllers/
│   └── auto-design.controller.js             # 🆕 Business logic
│
├── services/
│   ├── template-renderer.js                  # 🆕 Design generation
│   ├── background-removal.js                 # 🆕 AI bg removal
│   └── firebase-storage.js                   # 🆕 File upload
│
└── models/
    └── AutoDesignProject.js                  # 🆕 Data model
```

---

## 9. IMPLEMENTATION STEPS

### Phase 1: Foundation (Week 1)

**Step 1.1**: Create Route
```bash
# Edit src/router/index.ts
# Add /auto-design route
```

**Step 1.2**: Create AutoDesignPage.vue
```bash
# Create src/views/AutoDesignPage.vue
# Basic layout with header, form area, preview area
```

**Step 1.3**: Create Pinia Store
```bash
# Create src/stores/autoDesign.ts
# Define state, getters, actions
```

**Step 1.4**: Update AutoDesignDropdown
```bash
# Edit src/components/home/AutoDesignDropdown.vue
# Change navigation to /auto-design?category={name}
```

**Step 1.5**: Create TypeScript Types
```bash
# Create src/types/auto-design.ts
# Define interfaces for AutoDesignProject, Template, etc.
```

**Step 1.6**: Create DesignForm Component
```bash
# Create src/components/auto-design/DesignForm.vue
# Basic form with text inputs
```

**Step 1.7**: Test Navigation
```bash
# Run dev server
# Click Auto Design dropdown
# Verify navigation to /auto-design?category=business-card
# Verify category is detected
```

### Phase 2: File Upload (Week 2)

**Step 2.1**: Create ImageUploader Component
```bash
# Create src/components/auto-design/ImageUploader.vue
# Implement drag & drop, file selection
```

**Step 2.2**: Create LogoUploader Component
```bash
# Create src/components/auto-design/LogoUploader.vue
# Single file upload with preview
```

**Step 2.3**: Integrate Firebase Storage
```bash
# Create src/services/firebase-storage.ts
# Implement upload functions
```

**Step 2.4**: Add File Validation
```bash
# Add size, format validation
# Show error messages
```

**Step 2.5**: Create Image Preview Carousel
```bash
# Create src/components/auto-design/ImagePreviewCarousel.vue
# Swipeable carousel for uploaded images
```

**Step 2.6**: Test File Upload
```bash
# Upload images and logo
# Verify Firebase Storage upload
# Check preview functionality
```

### Phase 3: Design Generation (Week 3)

**Step 3.1**: Create Template Definitions
```bash
# Create src/data/templates.ts
# Define 5-10 basic templates
```

**Step 3.2**: Create Backend API
```bash
# Create server/routes/auto-design.js
# Implement /generate endpoint
```

**Step 3.3**: Create Template Renderer
```bash
# Create server/services/template-renderer.js
# Use Konva.js to render designs
```

**Step 3.4**: Create API Service
```bash
# Create src/services/auto-design-api.ts
# Implement generateDesign() function
```

**Step 3.5**: Create Preview Modal
```bash
# Create src/components/auto-design/DesignPreviewModal.vue
# Full-screen preview with actions
```

**Step 3.6**: Implement Download
```bash
# Add download functionality (PNG, JPEG, PDF)
# Use file-saver library
```

**Step 3.7**: Test Generation Flow
```bash
# Fill form, generate design
# Verify preview modal
# Test download
```

### Phase 4: AI Integration (Week 4)

**Step 4.1**: Set Up Background Removal
```bash
# Choose: Remove.bg API or rembg
# Add API key to .env
```

**Step 4.2**: Create Background Removal Service
```bash
# Create server/services/background-removal.js
# Integrate with chosen service
```

**Step 4.3**: Add Progress Indicators
```bash
# Implement polling for generation status
# Show progress bar
```

**Step 4.4**: Add Error Handling
```bash
# Handle API errors
# Show user-friendly error messages
```

**Step 4.5**: Test AI Features
```bash
# Upload image with background
# Enable "Remove Background"
# Verify background is removed
```

### Phase 5: History & Management (Week 5)

**Step 5.1**: Create History Panel
```bash
# Create src/components/auto-design/DesignHistoryPanel.vue
# Grid layout with project cards
```

**Step 5.2**: Implement Firestore CRUD
```bash
# Add fetchProjects() to store
# Add deleteProject() to store
```

**Step 5.3**: Add Search & Filter
```bash
# Create src/components/auto-design/HistoryFilters.vue
# Filter by category, date
```

**Step 5.4**: Implement "Send to Editor"
```bash
# Add sendToEditor() action
# Integrate with editor store
```

**Step 5.5**: Test History Features
```bash
# Generate multiple designs
# Verify history panel
# Test search, filter, delete
# Test "Send to Editor"
```

### Phase 6: Polish & Testing (Week 6)

**Step 6.1**: Add Animations
```bash
# Add Vue transitions
# Smooth loading states
```

**Step 6.2**: Responsive Design
```bash
# Test on mobile, tablet, desktop
# Adjust layouts for small screens
```

**Step 6.3**: Cross-Browser Testing
```bash
# Test on Chrome, Firefox, Safari, Edge
# Fix browser-specific issues
```

**Step 6.4**: Performance Optimization
```bash
# Optimize image uploads
# Lazy load components
# Code splitting
```

**Step 6.5**: Security Audit
```bash
# Validate all inputs
# Sanitize user data
# Check Firebase security rules
```

**Step 6.6**: Documentation
```bash
# User guide
# Developer documentation
# API documentation
```

---

## 10. CODE EXAMPLES

### 10.1 AutoDesignPage.vue (Skeleton)

```vue
<template>
  <div class="auto-design-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Auto Design: {{ categoryName }}</h1>
      <button @click="toggleHistory" class="history-button">
        History
      </button>
    </header>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Form Section -->
      <div class="form-section">
        <DesignForm
          :category="selectedCategory"
          @submit="handleGenerate"
        />
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <div v-if="isGenerating" class="loading-state">
          <div class="spinner"></div>
          <p>Generating your design...</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        <div v-else-if="currentDesign" class="preview-container">
          <img :src="currentDesign.design.previewUrl" alt="Preview" />
          <div class="preview-actions">
            <button @click="openPreviewModal">View Full</button>
            <button @click="downloadDesign">Download</button>
            <button @click="sendToEditor">Edit in Canvas</button>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Fill out the form and click "Generate" to create your design</p>
        </div>
      </div>
    </div>

    <!-- History Panel (Sidebar) -->
    <DesignHistoryPanel
      :show="showHistory"
      @close="toggleHistory"
      @select="handleSelectProject"
    />

    <!-- Preview Modal -->
    <DesignPreviewModal
      :show="showPreviewModal"
      :design="currentDesign"
      @close="closePreviewModal"
      @download="handleDownload"
      @sendToEditor="handleSendToEditor"
    />

    <!-- Notifications -->
    <SuccessNotification
      :show="authStore.showSuccessNotification"
      :title="authStore.successNotificationData.title"
      :message="authStore.successNotificationData.message"
      :type="authStore.successNotificationData.type"
      @close="authStore.showSuccessNotification = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import DesignForm from '@/components/auto-design/DesignForm.vue'
import DesignHistoryPanel from '@/components/auto-design/DesignHistoryPanel.vue'
import DesignPreviewModal from '@/components/auto-design/DesignPreviewModal.vue'
import SuccessNotification from '@/components/SuccessNotification.vue'

const route = useRoute()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()

const selectedCategory = ref<string>('')
const showHistory = ref(false)
const showPreviewModal = ref(false)

const categoryName = computed(() => {
  return selectedCategory.value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const isGenerating = computed(() => autoDesignStore.isGenerating)
const progress = computed(() => autoDesignStore.generationProgress)
const currentDesign = computed(() => autoDesignStore.currentProject)

onMounted(() => {
  // Get category from URL query parameter
  const category = route.query.category as string
  if (category) {
    selectedCategory.value = category
    autoDesignStore.setCategory(category)
  }
  
  // Fetch user's design history
  autoDesignStore.fetchProjects()
})

const handleGenerate = async (formData: any) => {
  try {
    await autoDesignStore.generateDesign()
    authStore.showNotification({
      title: 'Design Generated!',
      message: 'Your design is ready to preview',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Generation Failed',
      message: error.message || 'Failed to generate design',
      type: 'error'
    })
  }
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

const openPreviewModal = () => {
  showPreviewModal.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
}

const downloadDesign = async () => {
  await autoDesignStore.downloadDesign('png')
}

const sendToEditor = () => {
  autoDesignStore.sendToEditor(currentDesign.value)
}

const handleSelectProject = (project: any) => {
  autoDesignStore.currentProject = project
  showHistory.value = false
}

const handleDownload = async (format: string) => {
  await autoDesignStore.downloadDesign(format)
}

const handleSendToEditor = () => {
  autoDesignStore.sendToEditor(currentDesign.value)
  closePreviewModal()
}
</script>

<style scoped>
.auto-design-page {
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.page-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px 40px;
  max-width: 1600px;
  margin: 0 auto;
}

.form-section,
.preview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.progress-bar {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
  transition: width 0.3s ease;
}

@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

### 10.2 Pinia Store (autoDesign.ts)

```typescript
// src/stores/autoDesign.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'
import { useEditorStore } from './editor'
import * as autoDesignAPI from '@/services/auto-design-api'
import type { AutoDesignProject, Template, FormData } from '@/types/auto-design'

export const useAutoDesignStore = defineStore('autoDesign', () => {
  const router = useRouter()
  const authStore = useAuthStore()
  const editorStore = useEditorStore()

  // State
  const selectedCategory = ref<string | null>(null)
  const selectedTemplate = ref<Template | null>(null)

  const formData = ref<FormData>({
    text: {},
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2'
    },
    size: 'A4',
    customDimensions: null,
    options: {
      removeBackground: false,
      backgroundType: 'default',
      customBackground: null
    }
  })

  const uploadedFiles = ref<{
    logo: File | null
    images: File[]
  }>({
    logo: null,
    images: []
  })

  const isGenerating = ref(false)
  const generationProgress = ref(0)
  const currentProject = ref<AutoDesignProject | null>(null)

  const projects = ref<AutoDesignProject[]>([])
  const projectsLoading = ref(false)
  const projectsTotal = ref(0)
  const projectsHasMore = ref(false)

  const showPreviewModal = ref(false)
  const showHistoryPanel = ref(false)

  const error = ref<string | null>(null)

  // Computed
  const hasUnsavedChanges = computed(() => {
    return Object.keys(formData.value.text).length > 0 ||
           uploadedFiles.value.logo !== null ||
           uploadedFiles.value.images.length > 0
  })

  // Actions

  /**
   * Set selected category
   */
  function setCategory(category: string) {
    selectedCategory.value = category
    resetFormData()
  }

  /**
   * Set selected template
   */
  function setTemplate(template: Template) {
    selectedTemplate.value = template
  }

  /**
   * Update form data field
   */
  function updateFormData(field: string, value: any) {
    if (field.startsWith('text.')) {
      const textField = field.replace('text.', '')
      formData.value.text[textField] = value
    } else if (field.startsWith('colors.')) {
      const colorField = field.replace('colors.', '') as 'primary' | 'secondary'
      formData.value.colors[colorField] = value
    } else if (field === 'size') {
      formData.value.size = value
    } else if (field.startsWith('options.')) {
      const optionField = field.replace('options.', '')
      formData.value.options[optionField] = value
    }
  }

  /**
   * Reset form data
   */
  function resetFormData() {
    formData.value = {
      text: {},
      colors: {
        primary: '#06b6d4',
        secondary: '#0891b2'
      },
      size: 'A4',
      customDimensions: null,
      options: {
        removeBackground: false,
        backgroundType: 'default',
        customBackground: null
      }
    }
    uploadedFiles.value = {
      logo: null,
      images: []
    }
  }

  /**
   * Set logo file
   */
  function setLogo(file: File) {
    uploadedFiles.value.logo = file
  }

  /**
   * Add images
   */
  function addImages(files: File[]) {
    const currentCount = uploadedFiles.value.images.length
    const maxFiles = 99
    const availableSlots = maxFiles - currentCount

    if (availableSlots <= 0) {
      authStore.showNotification({
        title: 'Maximum Images Reached',
        message: `You can only upload up to ${maxFiles} images`,
        type: 'error'
      })
      return
    }

    const filesToAdd = files.slice(0, availableSlots)
    uploadedFiles.value.images.push(...filesToAdd)

    if (files.length > availableSlots) {
      authStore.showNotification({
        title: 'Some Images Skipped',
        message: `Only ${availableSlots} images were added due to the limit`,
        type: 'info'
      })
    }
  }

  /**
   * Remove image at index
   */
  function removeImage(index: number) {
    uploadedFiles.value.images.splice(index, 1)
  }

  /**
   * Generate design
   */
  async function generateDesign() {
    if (!selectedCategory.value) {
      throw new Error('No category selected')
    }

    if (!authStore.user) {
      throw new Error('User not authenticated')
    }

    try {
      isGenerating.value = true
      generationProgress.value = 0
      error.value = null

      // Step 1: Upload files (20% progress)
      generationProgress.value = 10
      const uploadedFileUrls = await uploadFiles()
      generationProgress.value = 20

      // Step 2: Generate design (80% progress)
      const result = await autoDesignAPI.generateDesign({
        userId: authStore.user.id,
        category: selectedCategory.value,
        inputs: formData.value,
        files: uploadedFileUrls
      })

      generationProgress.value = 40

      // Step 3: Poll for completion
      if (result.status === 'processing') {
        await pollGenerationStatus(result.projectId)
      } else {
        currentProject.value = result.project
        generationProgress.value = 100
      }

      // Refresh history
      await fetchProjects()

    } catch (err: any) {
      error.value = err.message || 'Failed to generate design'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Upload files to Firebase Storage
   */
  async function uploadFiles() {
    const urls: any = {}

    // Upload logo
    if (uploadedFiles.value.logo) {
      const logoUrl = await autoDesignAPI.uploadFile(uploadedFiles.value.logo)

      // Remove background if option is enabled
      if (formData.value.options.removeBackground) {
        const processedUrl = await autoDesignAPI.removeBackground(logoUrl)
        urls.logo = { url: logoUrl, processedUrl }
      } else {
        urls.logo = { url: logoUrl }
      }
    }

    // Upload images
    if (uploadedFiles.value.images.length > 0) {
      urls.images = []
      for (const image of uploadedFiles.value.images) {
        const imageUrl = await autoDesignAPI.uploadFile(image)

        if (formData.value.options.removeBackground) {
          const processedUrl = await autoDesignAPI.removeBackground(imageUrl)
          urls.images.push({ url: imageUrl, processedUrl })
        } else {
          urls.images.push({ url: imageUrl })
        }
      }
    }

    return urls
  }

  /**
   * Poll generation status
   */
  async function pollGenerationStatus(projectId: string) {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    return new Promise<void>((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await autoDesignAPI.getGenerationStatus(projectId)

          // Update progress
          generationProgress.value = 40 + (status.progress || 0) * 0.6

          if (status.status === 'completed') {
            currentProject.value = status.project
            generationProgress.value = 100
            resolve()
            return
          }

          if (status.status === 'failed') {
            reject(new Error(status.error || 'Generation failed'))
            return
          }

          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            reject(new Error('Generation timeout'))
          }
        } catch (err) {
          reject(err)
        }
      }

      poll()
    })
  }

  /**
   * Fetch user's projects
   */
  async function fetchProjects(filters?: any) {
    if (!authStore.user) return

    try {
      projectsLoading.value = true
      const result = await autoDesignAPI.getProjects({
        userId: authStore.user.id,
        ...filters
      })

      projects.value = result.projects
      projectsTotal.value = result.total
      projectsHasMore.value = result.hasMore
    } catch (err: any) {
      console.error('Failed to fetch projects:', err)
    } finally {
      projectsLoading.value = false
    }
  }

  /**
   * Load more projects (pagination)
   */
  async function loadMoreProjects() {
    if (!authStore.user || !projectsHasMore.value || projectsLoading.value) return

    try {
      projectsLoading.value = true
      const result = await autoDesignAPI.getProjects({
        userId: authStore.user.id,
        offset: projects.value.length
      })

      projects.value.push(...result.projects)
      projectsHasMore.value = result.hasMore
    } catch (err: any) {
      console.error('Failed to load more projects:', err)
    } finally {
      projectsLoading.value = false
    }
  }

  /**
   * Delete project
   */
  async function deleteProject(projectId: string) {
    try {
      await autoDesignAPI.deleteProject(projectId)

      // Remove from local state
      projects.value = projects.value.filter(p => p.id !== projectId)
      projectsTotal.value--

      authStore.showNotification({
        title: 'Project Deleted',
        message: 'Design project has been deleted',
        type: 'success'
      })
    } catch (err: any) {
      authStore.showNotification({
        title: 'Delete Failed',
        message: err.message || 'Failed to delete project',
        type: 'error'
      })
      throw err
    }
  }

  /**
   * Open preview modal
   */
  function openPreview(project: AutoDesignProject) {
    currentProject.value = project
    showPreviewModal.value = true
  }

  /**
   * Close preview modal
   */
  function closePreview() {
    showPreviewModal.value = false
  }

  /**
   * Download design
   */
  async function downloadDesign(format: 'png' | 'jpg' | 'pdf') {
    if (!currentProject.value) return

    try {
      const url = format === 'pdf'
        ? currentProject.value.design.pdfUrl
        : currentProject.value.design.fullUrl

      if (!url) {
        throw new Error('Design file not available')
      }

      await autoDesignAPI.downloadFile(url, `design-${currentProject.value.id}.${format}`)

      authStore.showNotification({
        title: 'Download Started',
        message: `Downloading design as ${format.toUpperCase()}`,
        type: 'success'
      })
    } catch (err: any) {
      authStore.showNotification({
        title: 'Download Failed',
        message: err.message || 'Failed to download design',
        type: 'error'
      })
    }
  }

  /**
   * Send design to editor
   */
  function sendToEditor(project: AutoDesignProject) {
    if (!project.design.fullUrl) return

    // Add design as image to canvas
    editorStore.addObject({
      type: 'image',
      src: project.design.fullUrl,
      x: 0,
      y: 0,
      width: project.design.dimensions.width,
      height: project.design.dimensions.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: editorStore.canvasState.objects.length
    })

    // Navigate to editor
    router.push('/editor')

    authStore.showNotification({
      title: 'Sent to Editor',
      message: 'Design has been added to the canvas',
      type: 'success'
    })
  }

  /**
   * Toggle history panel
   */
  function toggleHistoryPanel() {
    showHistoryPanel.value = !showHistoryPanel.value
  }

  /**
   * Set error
   */
  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  return {
    // State
    selectedCategory,
    selectedTemplate,
    formData,
    uploadedFiles,
    isGenerating,
    generationProgress,
    currentProject,
    projects,
    projectsLoading,
    projectsTotal,
    projectsHasMore,
    showPreviewModal,
    showHistoryPanel,
    error,

    // Computed
    hasUnsavedChanges,

    // Actions
    setCategory,
    setTemplate,
    updateFormData,
    resetFormData,
    setLogo,
    addImages,
    removeImage,
    generateDesign,
    pollGenerationStatus,
    fetchProjects,
    loadMoreProjects,
    deleteProject,
    openPreview,
    closePreview,
    downloadDesign,
    sendToEditor,
    toggleHistoryPanel,
    setError
  }
})
```

### 10.3 API Service (auto-design-api.ts)

```typescript
// src/services/auto-design-api.ts
import { storage } from '@/config/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { AutoDesignProject } from '@/types/auto-design'

const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3002/api'

/**
 * Generate design from user inputs
 */
export async function generateDesign(data: {
  userId: string
  category: string
  inputs: any
  files: any
}): Promise<{ projectId: string; status: string; project?: AutoDesignProject }> {
  const response = await fetch(`${API_BASE_URL}/auto-design/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to generate design')
  }

  return await response.json()
}

/**
 * Get generation status
 */
export async function getGenerationStatus(projectId: string): Promise<{
  status: 'processing' | 'completed' | 'failed'
  progress: number
  project?: AutoDesignProject
  error?: string
}> {
  const response = await fetch(`${API_BASE_URL}/auto-design/status/${projectId}`)

  if (!response.ok) {
    throw new Error('Failed to get generation status')
  }

  return await response.json()
}

/**
 * Get user's projects
 */
export async function getProjects(params: {
  userId: string
  category?: string
  limit?: number
  offset?: number
}): Promise<{
  projects: AutoDesignProject[]
  total: number
  hasMore: boolean
}> {
  const queryParams = new URLSearchParams({
    userId: params.userId,
    limit: String(params.limit || 20),
    offset: String(params.offset || 0)
  })

  if (params.category) {
    queryParams.append('category', params.category)
  }

  const response = await fetch(`${API_BASE_URL}/auto-design/projects?${queryParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }

  return await response.json()
}

/**
 * Get single project
 */
export async function getProject(projectId: string): Promise<AutoDesignProject> {
  const response = await fetch(`${API_BASE_URL}/auto-design/projects/${projectId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }

  const data = await response.json()
  return data.project
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auto-design/projects/${projectId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete project')
  }
}

/**
 * Upload file to Firebase Storage
 */
export async function uploadFile(file: File): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`
  const fileRef = storageRef(storage, `auto-design/${fileName}`)

  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)

  return url
}

/**
 * Remove background from image
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/ai/bg-remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  })

  if (!response.ok) {
    throw new Error('Failed to remove background')
  }

  const data = await response.json()
  return data.resultUrl
}

/**
 * Download file
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  const blob = await response.blob()

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  URL.revokeObjectURL(link.href)
}

/**
 * Get available templates
 */
export async function getTemplates(category?: string): Promise<any[]> {
  const queryParams = category ? `?category=${category}` : ''
  const response = await fetch(`${API_BASE_URL}/auto-design/templates${queryParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch templates')
  }

  const data = await response.json()
  return data.templates
}
```

### 10.4 TypeScript Types (auto-design.ts)

```typescript
// src/types/auto-design.ts
import type { Timestamp } from 'firebase/firestore'

export interface AutoDesignProject {
  id: string
  userId: string
  category: string
  subCategory?: string
  templateId?: string

  inputs: {
    text: Record<string, string>
    colors: {
      primary: string
      secondary: string
    }
    size: string
    customDimensions?: {
      width: number
      height: number
      unit: 'in' | 'cm' | 'px'
    }
    options: {
      removeBackground: boolean
      backgroundType: 'default' | 'custom' | 'online'
      customBackground?: string
    }
  }

  files: {
    logo?: {
      url: string
      originalName: string
      size: number
      processedUrl?: string
    }
    images: Array<{
      url: string
      originalName: string
      size: number
      processedUrl?: string
    }>
  }

  design: {
    previewUrl?: string
    fullUrl?: string
    pdfUrl?: string
    dimensions: {
      width: number
      height: number
      dpi: number
    }
  }

  status: 'draft' | 'processing' | 'completed' | 'failed'
  progress?: number
  error?: string

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Template {
  id: string
  name: string
  category: string
  subCategory?: string

  dimensions: {
    width: number
    height: number
    unit: 'in' | 'cm' | 'px'
    dpi: number
  }

  fields: Array<{
    name: string
    type: 'text' | 'image' | 'color'
    label: string
    placeholder?: string
    required: boolean
    maxLength?: number
  }>

  layout: {
    layers: Array<{
      type: 'text' | 'image' | 'shape' | 'background'
      id: string
      x: number
      y: number
      width: number
      height: number
      properties: any
    }>
  }

  assets: {
    backgrounds?: string[]
    fonts?: string[]
  }

  published: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FormData {
  text: Record<string, string>
  colors: {
    primary: string
    secondary: string
  }
  size: string
  customDimensions: {
    width: number
    height: number
    unit: 'in' | 'cm' | 'px'
  } | null
  options: {
    removeBackground: boolean
    backgroundType: 'default' | 'custom' | 'online'
    customBackground: string | null
  }
}

export interface DesignCategory {
  id: string
  name: string
  icon?: string
  description?: string
  subCategories?: string[]
}
```

### 10.5 Template Definitions (templates.ts)

```typescript
// src/data/templates.ts
import type { Template } from '@/types/auto-design'

export const templates: Template[] = [
  {
    id: 'business-card-modern',
    name: 'Modern Business Card',
    category: 'Business Card',
    dimensions: {
      width: 3.5,
      height: 2,
      unit: 'in',
      dpi: 300
    },
    fields: [
      {
        name: 'fullName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true,
        maxLength: 50
      },
      {
        name: 'title',
        type: 'text',
        label: 'Job Title',
        placeholder: 'CEO & Founder',
        required: true,
        maxLength: 50
      },
      {
        name: 'phone',
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: false,
        maxLength: 20
      },
      {
        name: 'email',
        type: 'text',
        label: 'Email',
        placeholder: 'john@company.com',
        required: true,
        maxLength: 50
      },
      {
        name: 'website',
        type: 'text',
        label: 'Website',
        placeholder: 'www.company.com',
        required: false,
        maxLength: 50
      },
      {
        name: 'address',
        type: 'text',
        label: 'Address',
        placeholder: '123 Main St, City, State',
        required: false,
        maxLength: 100
      }
    ],
    layout: {
      layers: [
        {
          type: 'background',
          id: 'bg-1',
          x: 0,
          y: 0,
          width: 1050,
          height: 600,
          properties: {
            fill: 'primary'
          }
        },
        {
          type: 'image',
          id: 'logo-1',
          x: 50,
          y: 50,
          width: 150,
          height: 150,
          properties: {
            source: 'logo',
            fit: 'contain'
          }
        },
        {
          type: 'text',
          id: 'name-1',
          x: 220,
          y: 80,
          width: 800,
          height: 60,
          properties: {
            source: 'fullName',
            fontSize: 48,
            fontWeight: 'bold',
            color: '#ffffff',
            align: 'left'
          }
        },
        {
          type: 'text',
          id: 'title-1',
          x: 220,
          y: 150,
          width: 800,
          height: 40,
          properties: {
            source: 'title',
            fontSize: 24,
            fontWeight: 'normal',
            color: '#e0e0e0',
            align: 'left'
          }
        },
        {
          type: 'shape',
          id: 'divider-1',
          x: 50,
          y: 250,
          width: 950,
          height: 2,
          properties: {
            fill: 'secondary',
            opacity: 0.5
          }
        },
        {
          type: 'text',
          id: 'phone-1',
          x: 50,
          y: 300,
          width: 450,
          height: 30,
          properties: {
            source: 'phone',
            fontSize: 18,
            color: '#ffffff',
            align: 'left',
            icon: 'phone'
          }
        },
        {
          type: 'text',
          id: 'email-1',
          x: 550,
          y: 300,
          width: 450,
          height: 30,
          properties: {
            source: 'email',
            fontSize: 18,
            color: '#ffffff',
            align: 'left',
            icon: 'email'
          }
        },
        {
          type: 'text',
          id: 'website-1',
          x: 50,
          y: 350,
          width: 450,
          height: 30,
          properties: {
            source: 'website',
            fontSize: 18,
            color: '#ffffff',
            align: 'left',
            icon: 'globe'
          }
        },
        {
          type: 'text',
          id: 'address-1',
          x: 550,
          y: 350,
          width: 450,
          height: 30,
          properties: {
            source: 'address',
            fontSize: 18,
            color: '#ffffff',
            align: 'left',
            icon: 'location'
          }
        }
      ]
    },
    assets: {
      backgrounds: [],
      fonts: ['Inter', 'Roboto', 'Open Sans']
    },
    published: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },

  // Add more templates for other categories...
  {
    id: 'flyer-event',
    name: 'Event Flyer',
    category: 'Flyer',
    dimensions: {
      width: 8.5,
      height: 11,
      unit: 'in',
      dpi: 300
    },
    fields: [
      {
        name: 'eventTitle',
        type: 'text',
        label: 'Event Title',
        placeholder: 'Summer Music Festival',
        required: true,
        maxLength: 100
      },
      {
        name: 'date',
        type: 'text',
        label: 'Date',
        placeholder: 'July 15, 2025',
        required: true,
        maxLength: 50
      },
      {
        name: 'time',
        type: 'text',
        label: 'Time',
        placeholder: '6:00 PM - 11:00 PM',
        required: true,
        maxLength: 50
      },
      {
        name: 'location',
        type: 'text',
        label: 'Location',
        placeholder: 'Central Park, New York',
        required: true,
        maxLength: 100
      },
      {
        name: 'description',
        type: 'text',
        label: 'Description',
        placeholder: 'Join us for an unforgettable evening...',
        required: false,
        maxLength: 500
      }
    ],
    layout: {
      layers: [
        // Define flyer layout...
      ]
    },
    assets: {
      backgrounds: ['/assets/flyer-bg-1.jpg', '/assets/flyer-bg-2.jpg'],
      fonts: ['Montserrat', 'Playfair Display']
    },
    published: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  }
]

/**
 * Get template by category
 */
export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter(t => t.category === category)
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id)
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map(t => t.category)))
}
```

