# 🎨 Building a Canva-Like Template System for SmartDesignPro

## 📋 Table of Contents
1. [Current System Analysis](#current-system-analysis)
2. [Gap Analysis vs Canva](#gap-analysis-vs-canva)
3. [Implementation Roadmap](#implementation-roadmap)
4. [Template Data Structure](#template-data-structure)
5. [Code Examples](#code-examples)
6. [Technical Recommendations](#technical-recommendations)

---

## 1. Current System Analysis

### ✅ What You Already Have

#### **A. Template Data Structure** (`src/types/auto-design.ts`)
```typescript
interface Template {
  id: string
  name: string
  category: string
  dimensions: { width, height, unit, dpi }
  fields: Array<{ name, type, label, required }>
  layout: { layers: Array<{ type, id, x, y, width, height, properties }> }
  assets: { backgrounds, fonts }
  published: boolean
}
```

**Strengths:**
- ✅ Well-structured template definition
- ✅ Layer-based architecture
- ✅ Support for text, image, shape, background layers
- ✅ Dimension and DPI configuration

**Limitations:**
- ❌ Layers are static definitions, not Konva objects
- ❌ No support for groups or nested layers
- ❌ Limited property definitions (no animations, effects)

#### **B. Marketplace System** (`src/stores/marketplace.ts`)
```typescript
- Template browsing with filters (category, sortBy, accessLevel)
- Template preview modal
- Template cards with thumbnails
- User library (saved/purchased templates)
- Pagination and infinite scroll
```

**Strengths:**
- ✅ Complete marketplace UI
- ✅ Template filtering and search
- ✅ User library management
- ✅ Access control (free/premium/exclusive)

**Limitations:**
- ❌ Not integrated with the design editor
- ❌ Templates can't be loaded into Konva canvas
- ❌ No "Use Template" functionality

#### **C. Konva Canvas** (`src/components/WhiteboardCanvas.vue`)
```typescript
- Full Konva.js integration with v-stage, v-layer
- Image, text, shape rendering
- Drag-and-drop, transform, rotate
- Layer management (z-index, visibility, locking)
- Selection, multi-select, transformer
- Export to PNG/JPG/JSON
- Undo/redo history
```

**Strengths:**
- ✅ Professional-grade canvas implementation
- ✅ Complete element manipulation
- ✅ Layer management
- ✅ Export functionality

**Limitations:**
- ❌ No template loading mechanism
- ❌ Can't import template layers as Konva objects
- ❌ No template-to-canvas bridge

#### **D. SVG Templates** (`Folder Templete/wedding-sticker.svg`)
```xml
- Static SVG files with element IDs
- Text replacement via ID matching
- Professional designs with gradients, filters
```

**Strengths:**
- ✅ High-quality professional designs
- ✅ Print-ready quality

**Limitations:**
- ❌ Not editable in Konva canvas
- ❌ Can't be manipulated as layers
- ❌ Limited to text replacement only

---

## 2. Gap Analysis vs Canva

### 🎯 Canva Features You're Missing

| Feature | Canva | Your System | Gap |
|---------|-------|-------------|-----|
| **Template Gallery in Editor** | ✅ Sidebar with templates | ❌ Separate marketplace | Need integration |
| **Drag-and-Drop Templates** | ✅ Drag to canvas | ❌ No drag support | Need DnD system |
| **Editable Template Elements** | ✅ All elements editable | ❌ Only text replacement | Need layer conversion |
| **Template Categories** | ✅ 100+ categories | ✅ Basic categories | Need expansion |
| **Search & Filters** | ✅ Advanced search | ✅ Basic filters | Need improvement |
| **Element Library** | ✅ Shapes, icons, stickers | ❌ Limited shapes | Need asset library |
| **Text Styles** | ✅ Preset text styles | ❌ Manual styling | Need style presets |
| **Color Palettes** | ✅ Preset palettes | ✅ Basic color picker | Need palette system |
| **Image Replacement** | ✅ Click to replace | ❌ Manual upload | Need smart replacement |
| **Save Custom Templates** | ✅ Save to library | ❌ No save feature | Need save system |
| **Template Versioning** | ✅ Version history | ❌ No versioning | Need version control |
| **Collaborative Editing** | ✅ Real-time collab | ✅ Basic collab | Already implemented! |

---

## 3. Implementation Roadmap

### 🚀 Phase 1: Template-to-Canvas Bridge (Week 1-2)

**Goal:** Load template layers into Konva canvas as editable objects

**Tasks:**
1. Create `TemplateLoader` service to convert template layers to Konva objects
2. Add `loadTemplate()` method to WhiteboardCanvas
3. Implement layer-to-Konva conversion for each type (text, image, shape)
4. Handle template dimensions and scaling

**Files to Create/Modify:**
- `src/services/template-loader.service.ts` (NEW)
- `src/components/WhiteboardCanvas.vue` (MODIFY)
- `src/stores/editor.ts` (MODIFY)

### 🚀 Phase 2: Template Gallery Sidebar (Week 2-3)

**Goal:** Add template browser inside the design editor

**Tasks:**
1. Create `TemplateSidebar.vue` component
2. Add template categories and search
3. Implement template thumbnails with lazy loading
4. Add "Use Template" button

**Files to Create:**
- `src/components/editor/TemplateSidebar.vue`
- `src/components/editor/TemplateGalleryCard.vue`
- `src/components/editor/TemplateCategoryFilter.vue`

### 🚀 Phase 3: Drag-and-Drop System (Week 3-4)

**Goal:** Drag templates from sidebar to canvas

**Tasks:**
1. Implement HTML5 Drag and Drop API
2. Create drop zone on canvas
3. Handle template instantiation on drop
4. Add visual feedback during drag

**Files to Modify:**
- `src/components/editor/TemplateSidebar.vue`
- `src/components/WhiteboardCanvas.vue`

### 🚀 Phase 4: Smart Element Replacement (Week 4-5)

**Goal:** Click-to-replace for images and text

**Tasks:**
1. Add "Replace Image" button on image selection
2. Implement smart text editing (double-click)
3. Create image upload modal for replacement
4. Add placeholder detection

**Files to Create:**
- `src/components/editor/ImageReplacementModal.vue`
- `src/utils/template-helpers.ts`

### 🚀 Phase 5: Element Library (Week 5-6)

**Goal:** Add library of shapes, icons, stickers

**Tasks:**
1. Create element library database
2. Build `ElementLibrary.vue` component
3. Add categories (shapes, icons, illustrations, stickers)
4. Implement search and filters

**Files to Create:**
- `src/data/element-library.ts`
- `src/components/editor/ElementLibrary.vue`
- `src/components/editor/ElementCard.vue`

### 🚀 Phase 6: Text Styles & Color Palettes (Week 6-7)

**Goal:** Preset text styles and color combinations

**Tasks:**
1. Define text style presets (heading, subheading, body)
2. Create color palette library
3. Add "Apply Style" functionality
4. Implement palette swapping

**Files to Create:**
- `src/data/text-styles.ts`
- `src/data/color-palettes.ts`
- `src/components/editor/TextStylePanel.vue`
- `src/components/editor/ColorPalettePanel.vue`

### 🚀 Phase 7: Save Custom Templates (Week 7-8)

**Goal:** Save user-customized templates to library

**Tasks:**
1. Add "Save as Template" button
2. Generate template thumbnail
3. Save to Firebase/database
4. Add to user's template library

**Files to Create:**
- `src/services/template-save.service.ts`
- `src/components/editor/SaveTemplateModal.vue`

### 🚀 Phase 8: Advanced Features (Week 8-12)

**Tasks:**
1. Template versioning
2. Template sharing
3. Template marketplace (sell templates)
4. AI-powered template suggestions
5. Responsive templates (auto-resize)

---

## 4. Template Data Structure

### 📊 Enhanced Template Schema

```typescript
// src/types/template.ts

export interface CanvaTemplate {
  // Basic Info
  id: string
  name: string
  description: string
  category: TemplateCategory
  tags: string[]
  
  // Metadata
  author: {
    id: string
    name: string
    avatar?: string
  }
  stats: {
    views: number
    uses: number
    likes: number
    downloads: number
  }
  
  // Access Control
  accessLevel: 'free' | 'premium' | 'exclusive'
  price?: number
  
  // Dimensions
  dimensions: {
    width: number
    height: number
    unit: 'px' | 'in' | 'cm' | 'mm'
    dpi: number
  }
  
  // Canvas Configuration
  canvas: {
    backgroundColor: string
    backgroundImage?: string
    backgroundPattern?: string
  }
  
  // Layers (Konva-compatible)
  layers: TemplateLayer[]
  
  // Assets
  assets: {
    images: TemplateImage[]
    fonts: string[]
    colors: string[]
    icons: string[]
  }
  
  // Customization
  customizable: {
    text: boolean
    images: boolean
    colors: boolean
    layout: boolean
  }
  
  // Placeholders
  placeholders: {
    text: TextPlaceholder[]
    images: ImagePlaceholder[]
  }
  
  // Presets
  colorPalettes: ColorPalette[]
  textStyles: TextStyle[]
  
  // Metadata
  thumbnail: string
  previewUrl: string
  version: number
  createdAt: Date
  updatedAt: Date
  published: boolean
}

export interface TemplateLayer {
  id: string
  name: string
  type: 'text' | 'image' | 'shape' | 'group' | 'background'
  
  // Position & Transform
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  
  // Visibility & Interaction
  visible: boolean
  locked: boolean
  draggable: boolean
  selectable: boolean
  
  // Layer Order
  zIndex: number
  
  // Type-specific Properties
  properties: TextProperties | ImageProperties | ShapeProperties | GroupProperties
  
  // Effects
  effects?: {
    shadow?: ShadowEffect
    blur?: number
    opacity?: number
    filters?: string[]
  }
  
  // Animation (future)
  animation?: {
    type: string
    duration: number
    delay: number
  }
}

export interface TextProperties {
  text: string
  fontFamily: string
  fontSize: number
  fontStyle: 'normal' | 'italic'
  fontWeight: 'normal' | 'bold' | number
  fill: string
  stroke?: string
  strokeWidth?: number
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  lineHeight: number
  letterSpacing: number
  textDecoration?: 'underline' | 'line-through'
  
  // Placeholder info
  isPlaceholder?: boolean
  placeholderText?: string
}

export interface ImageProperties {
  src: string
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
  filters?: string[]
  
  // Placeholder info
  isPlaceholder?: boolean
  placeholderType?: 'portrait' | 'landscape' | 'square' | 'logo'
}

export interface ShapeProperties {
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'line'
  fill: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
  
  // Shape-specific
  sides?: number // for polygon
  innerRadius?: number // for star
  points?: number[] // for custom shapes
}

export interface GroupProperties {
  children: string[] // IDs of child layers
}

export interface ColorPalette {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
}

export interface TextStyle {
  id: string
  name: string
  category: 'heading' | 'subheading' | 'body' | 'caption'
  properties: Partial<TextProperties>
}

export interface TextPlaceholder {
  layerId: string
  label: string
  defaultText: string
  maxLength?: number
  required: boolean
}

export interface ImagePlaceholder {
  layerId: string
  label: string
  type: 'portrait' | 'landscape' | 'square' | 'logo'
  required: boolean
  aspectRatio?: number
}
```

---

## 5. Code Examples

### Example 1: Template Loader Service

```typescript
// src/services/template-loader.service.ts

import Konva from 'konva'
import type { CanvaTemplate, TemplateLayer } from '@/types/template'
import { loadImage } from '@/utils/konva-helpers'

export class TemplateLoaderService {
  /**
   * Load template into Konva stage
   */
  async loadTemplate(template: CanvaTemplate, stage: Konva.Stage): Promise<void> {
    // Clear existing layers (optional)
    // stage.destroyChildren()
    
    // Create main layer
    const mainLayer = new Konva.Layer()
    
    // Set canvas background
    if (template.canvas.backgroundColor) {
      const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: template.dimensions.width,
        height: template.dimensions.height,
        fill: template.canvas.backgroundColor
      })
      mainLayer.add(bg)
    }
    
    // Load all layers
    for (const layer of template.layers) {
      const konvaNode = await this.createKonvaNode(layer)
      if (konvaNode) {
        mainLayer.add(konvaNode)
      }
    }
    
    stage.add(mainLayer)
    mainLayer.batchDraw()
  }
  
  /**
   * Convert template layer to Konva node
   */
  private async createKonvaNode(layer: TemplateLayer): Promise<Konva.Node | null> {
    const baseConfig = {
      id: layer.id,
      name: layer.name,
      x: layer.x,
      y: layer.y,
      rotation: layer.rotation,
      scaleX: layer.scaleX,
      scaleY: layer.scaleY,
      visible: layer.visible,
      draggable: layer.draggable,
      listening: layer.selectable
    }
    
    switch (layer.type) {
      case 'text':
        return this.createTextNode(layer, baseConfig)
      
      case 'image':
        return await this.createImageNode(layer, baseConfig)
      
      case 'shape':
        return this.createShapeNode(layer, baseConfig)
      
      case 'group':
        return this.createGroupNode(layer, baseConfig)
      
      default:
        return null
    }
  }
  
  /**
   * Create text node
   */
  private createTextNode(layer: TemplateLayer, baseConfig: any): Konva.Text {
    const props = layer.properties as TextProperties
    
    return new Konva.Text({
      ...baseConfig,
      text: props.text,
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      fontStyle: props.fontStyle,
      fill: props.fill,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      align: props.align,
      verticalAlign: props.verticalAlign,
      lineHeight: props.lineHeight,
      letterSpacing: props.letterSpacing,
      width: layer.width,
      height: layer.height
    })
  }
  
  /**
   * Create image node
   */
  private async createImageNode(layer: TemplateLayer, baseConfig: any): Promise<Konva.Image> {
    const props = layer.properties as ImageProperties
    
    // Load image
    const imageElement = await loadImage(props.src)
    
    return new Konva.Image({
      ...baseConfig,
      image: imageElement,
      width: layer.width,
      height: layer.height,
      crop: props.cropX ? {
        x: props.cropX,
        y: props.cropY,
        width: props.cropWidth,
        height: props.cropHeight
      } : undefined
    })
  }
  
  /**
   * Create shape node
   */
  private createShapeNode(layer: TemplateLayer, baseConfig: any): Konva.Shape {
    const props = layer.properties as ShapeProperties
    
    switch (props.shapeType) {
      case 'rectangle':
        return new Konva.Rect({
          ...baseConfig,
          width: layer.width,
          height: layer.height,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth,
          cornerRadius: props.cornerRadius
        })
      
      case 'circle':
        return new Konva.Circle({
          ...baseConfig,
          radius: layer.width / 2,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth
        })
      
      case 'ellipse':
        return new Konva.Ellipse({
          ...baseConfig,
          radiusX: layer.width / 2,
          radiusY: layer.height / 2,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth
        })
      
      case 'star':
        return new Konva.Star({
          ...baseConfig,
          numPoints: props.sides || 5,
          innerRadius: props.innerRadius || layer.width / 4,
          outerRadius: layer.width / 2,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth
        })
      
      default:
        return new Konva.Rect({
          ...baseConfig,
          width: layer.width,
          height: layer.height,
          fill: props.fill
        })
    }
  }
  
  /**
   * Create group node
   */
  private createGroupNode(layer: TemplateLayer, baseConfig: any): Konva.Group {
    return new Konva.Group(baseConfig)
  }
}

export const templateLoaderService = new TemplateLoaderService()
```

### Example 2: Template Sidebar Component

```vue
<!-- src/components/editor/TemplateSidebar.vue -->
<template>
  <div class="template-sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <h3>Templates</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

    <!-- Search -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search templates..."
        @input="handleSearch"
      />
    </div>

    <!-- Categories -->
    <div class="categories">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="{ active: selectedCategory === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Templates Grid -->
    <div class="templates-grid" ref="gridRef">
      <TemplateGalleryCard
        v-for="template in filteredTemplates"
        :key="template.id"
        :template="template"
        :draggable="true"
        @dragstart="handleDragStart($event, template)"
        @click="handleTemplateClick(template)"
      />

      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore && !isLoading" ref="loadMoreTrigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMarketplaceStore } from '@/stores/marketplace'
import { useEditorStore } from '@/stores/editor'
import { templateLoaderService } from '@/services/template-loader.service'
import TemplateGalleryCard from './TemplateGalleryCard.vue'
import type { CanvaTemplate } from '@/types/template'

const emit = defineEmits(['close', 'template-selected'])

const marketplaceStore = useMarketplaceStore()
const editorStore = useEditorStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const gridRef = ref<HTMLElement>()
const loadMoreTrigger = ref<HTMLElement>()

const categories = [
  { id: 'all', name: 'All' },
  { id: 'social-media', name: 'Social Media' },
  { id: 'business', name: 'Business' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'personal', name: 'Personal' },
  { id: 'events', name: 'Events' }
]

const filteredTemplates = computed(() => {
  let templates = marketplaceStore.templates

  // Filter by category
  if (selectedCategory.value !== 'all') {
    templates = templates.filter(t => t.category === selectedCategory.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return templates
})

const isLoading = computed(() => marketplaceStore.isLoading)
const hasMore = computed(() => marketplaceStore.hasMore)

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
  marketplaceStore.setFilter('category', categoryId)
  marketplaceStore.fetchTemplates()
}

function handleSearch() {
  // Debounced search
  // Implementation depends on your debounce utility
}

function handleDragStart(event: DragEvent, template: CanvaTemplate) {
  if (!event.dataTransfer) return

  // Set drag data
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify(template))

  // Create drag image (thumbnail)
  const img = new Image()
  img.src = template.thumbnail
  event.dataTransfer.setDragImage(img, 50, 50)
}

async function handleTemplateClick(template: CanvaTemplate) {
  try {
    // Load template into canvas
    await editorStore.loadTemplate(template)
    emit('template-selected', template)
  } catch (error) {
    console.error('Failed to load template:', error)
  }
}

// Infinite scroll
onMounted(() => {
  if (!loadMoreTrigger.value) return

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
      marketplaceStore.fetchTemplates(true) // Load more
    }
  })

  observer.observe(loadMoreTrigger.value)
})

// Initial load
onMounted(() => {
  marketplaceStore.fetchTemplates()
})
</script>

<style scoped>
.template-sidebar {
  width: 320px;
  height: 100%;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  padding: 12px 16px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.categories {
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid #e5e7eb;
}

.categories button {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.categories button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.templates-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-content: start;
}

.loading {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### Example 3: Template Gallery Card

```vue
<!-- src/components/editor/TemplateGalleryCard.vue -->
<template>
  <div
    class="template-card"
    :draggable="draggable"
    @dragstart="$emit('dragstart', $event)"
    @click="$emit('click')"
  >
    <!-- Thumbnail -->
    <div class="thumbnail">
      <img :src="template.thumbnail" :alt="template.name" loading="lazy" />

      <!-- Overlay on hover -->
      <div class="overlay">
        <button class="use-btn" @click.stop="$emit('use', template)">
          Use Template
        </button>
      </div>

      <!-- Access Level Badge -->
      <div class="badge" :class="template.accessLevel">
        {{ template.accessLevel }}
      </div>
    </div>

    <!-- Info -->
    <div class="info">
      <h4>{{ template.name }}</h4>
      <div class="stats">
        <span>{{ formatNumber(template.stats.uses) }} uses</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CanvaTemplate } from '@/types/template'

interface Props {
  template: CanvaTemplate
  draggable?: boolean
}

defineProps<Props>()

defineEmits(['dragstart', 'click', 'use'])

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<style scoped>
.template-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.thumbnail {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #f3f4f6;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.template-card:hover .overlay {
  opacity: 1;
}

.use-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.free {
  background: #10b981;
  color: white;
}

.badge.premium {
  background: #f59e0b;
  color: white;
}

.badge.exclusive {
  background: #8b5cf6;
  color: white;
}

.info {
  padding: 12px;
}

.info h4 {
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #111827;
}

.stats {
  font-size: 11px;
  color: #6b7280;
}
</style>
```
