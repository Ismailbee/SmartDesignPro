# 🎨 Canva Template System - Part 2: Advanced Features

## Example 4: Integrating Template Sidebar with WhiteboardCanvas

```typescript
// src/stores/editor.ts - Add these methods

import { templateLoaderService } from '@/services/template-loader.service'
import type { CanvaTemplate } from '@/types/template'

export const useEditorStore = defineStore('editor', () => {
  // ... existing code ...
  
  const currentTemplate = ref<CanvaTemplate | null>(null)
  const templatePlaceholders = ref<Map<string, any>>(new Map())
  
  /**
   * Load template into canvas
   */
  async function loadTemplate(template: CanvaTemplate) {
    try {
      // Get stage reference (you'll need to pass this from WhiteboardCanvas)
      const stage = getStageInstance()
      if (!stage) throw new Error('Stage not initialized')
      
      // Clear current design (with confirmation)
      if (images.value.length > 0 || texts.value.length > 0) {
        const confirmed = confirm('Loading a template will clear your current design. Continue?')
        if (!confirmed) return
      }
      
      // Clear canvas
      images.value = []
      texts.value = []
      shapes.value = []
      
      // Load template
      await templateLoaderService.loadTemplate(template, stage)
      
      // Store template reference
      currentTemplate.value = template
      
      // Extract placeholders
      extractPlaceholders(template)
      
      // Save to history
      saveToHistory()
      
      return true
    } catch (error) {
      console.error('Failed to load template:', error)
      throw error
    }
  }
  
  /**
   * Extract placeholders from template
   */
  function extractPlaceholders(template: CanvaTemplate) {
    templatePlaceholders.value.clear()
    
    // Text placeholders
    template.placeholders.text.forEach(placeholder => {
      templatePlaceholders.value.set(placeholder.layerId, {
        type: 'text',
        ...placeholder
      })
    })
    
    // Image placeholders
    template.placeholders.images.forEach(placeholder => {
      templatePlaceholders.value.set(placeholder.layerId, {
        type: 'image',
        ...placeholder
      })
    })
  }
  
  /**
   * Replace placeholder image
   */
  async function replacePlaceholderImage(layerId: string, imageFile: File) {
    const placeholder = templatePlaceholders.value.get(layerId)
    if (!placeholder || placeholder.type !== 'image') return
    
    // Upload image
    const imageUrl = await uploadImage(imageFile)
    
    // Update image layer
    const imageLayer = images.value.find(img => img.id === layerId)
    if (imageLayer) {
      updateImage(layerId, { src: imageUrl })
      saveToHistory()
    }
  }
  
  /**
   * Update placeholder text
   */
  function updatePlaceholderText(layerId: string, newText: string) {
    const placeholder = templatePlaceholders.value.get(layerId)
    if (!placeholder || placeholder.type !== 'text') return
    
    // Validate max length
    if (placeholder.maxLength && newText.length > placeholder.maxLength) {
      newText = newText.substring(0, placeholder.maxLength)
    }
    
    // Update text layer
    const textLayer = texts.value.find(text => text.id === layerId)
    if (textLayer) {
      updateText(layerId, { text: newText })
      saveToHistory()
    }
  }
  
  /**
   * Apply color palette to template
   */
  function applyColorPalette(palette: ColorPalette) {
    if (!currentTemplate.value) return
    
    // Update all layers with palette colors
    texts.value.forEach(text => {
      if (text.fill === currentTemplate.value?.canvas.backgroundColor) {
        updateText(text.id, { fill: palette.colors.background })
      }
      // Add more color mapping logic
    })
    
    shapes.value.forEach(shape => {
      if (shape.fill === currentTemplate.value?.canvas.backgroundColor) {
        updateShape(shape.id, { fill: palette.colors.background })
      }
    })
    
    saveToHistory()
  }
  
  /**
   * Save current design as template
   */
  async function saveAsTemplate(templateData: Partial<CanvaTemplate>) {
    try {
      // Generate thumbnail
      const stage = getStageInstance()
      if (!stage) throw new Error('Stage not initialized')
      
      const thumbnail = stage.toDataURL({ pixelRatio: 0.5 })
      const previewUrl = stage.toDataURL({ pixelRatio: 1 })
      
      // Convert current layers to template format
      const layers: TemplateLayer[] = [
        ...texts.value.map(text => convertTextToTemplateLayer(text)),
        ...images.value.map(img => convertImageToTemplateLayer(img)),
        ...shapes.value.map(shape => convertShapeToTemplateLayer(shape))
      ]
      
      // Create template object
      const template: CanvaTemplate = {
        id: generateId(),
        name: templateData.name || 'Untitled Template',
        description: templateData.description || '',
        category: templateData.category || 'custom',
        tags: templateData.tags || [],
        author: {
          id: authStore.user?.id || '',
          name: authStore.user?.name || 'Anonymous'
        },
        stats: {
          views: 0,
          uses: 0,
          likes: 0,
          downloads: 0
        },
        accessLevel: templateData.accessLevel || 'free',
        dimensions: {
          width: stageWidth.value,
          height: stageHeight.value,
          unit: 'px',
          dpi: 72
        },
        canvas: {
          backgroundColor: backgroundColor.value
        },
        layers,
        assets: {
          images: images.value.map(img => ({ src: img.src })),
          fonts: [...new Set(texts.value.map(t => t.fontFamily))],
          colors: extractColors(),
          icons: []
        },
        customizable: {
          text: true,
          images: true,
          colors: true,
          layout: true
        },
        placeholders: {
          text: extractTextPlaceholders(),
          images: extractImagePlaceholders()
        },
        colorPalettes: [],
        textStyles: [],
        thumbnail,
        previewUrl,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        published: false
      }
      
      // Save to database
      await marketplaceApi.uploadTemplate(template)
      
      return template
    } catch (error) {
      console.error('Failed to save template:', error)
      throw error
    }
  }
  
  // Helper functions
  function convertTextToTemplateLayer(text: any): TemplateLayer {
    return {
      id: text.id,
      name: text.text.substring(0, 20),
      type: 'text',
      x: text.x,
      y: text.y,
      width: text.width,
      height: text.height,
      rotation: text.rotation || 0,
      scaleX: text.scaleX || 1,
      scaleY: text.scaleY || 1,
      visible: text.visible !== false,
      locked: text.locked || false,
      draggable: text.draggable !== false,
      selectable: true,
      zIndex: text.zIndex || 0,
      properties: {
        text: text.text,
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        fontStyle: text.fontStyle || 'normal',
        fontWeight: text.fontWeight || 'normal',
        fill: text.fill,
        stroke: text.stroke,
        strokeWidth: text.strokeWidth,
        align: text.align || 'left',
        verticalAlign: text.verticalAlign || 'top',
        lineHeight: text.lineHeight || 1.2,
        letterSpacing: text.letterSpacing || 0
      }
    }
  }
  
  function convertImageToTemplateLayer(image: any): TemplateLayer {
    return {
      id: image.id,
      name: 'Image',
      type: 'image',
      x: image.x,
      y: image.y,
      width: image.width,
      height: image.height,
      rotation: image.rotation || 0,
      scaleX: image.scaleX || 1,
      scaleY: image.scaleY || 1,
      visible: image.visible !== false,
      locked: image.locked || false,
      draggable: image.draggable !== false,
      selectable: true,
      zIndex: image.zIndex || 0,
      properties: {
        src: image.src,
        cropX: image.cropX,
        cropY: image.cropY,
        cropWidth: image.cropWidth,
        cropHeight: image.cropHeight,
        filters: image.filters
      }
    }
  }
  
  function convertShapeToTemplateLayer(shape: any): TemplateLayer {
    return {
      id: shape.id,
      name: shape.shapeType || 'Shape',
      type: 'shape',
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      rotation: shape.rotation || 0,
      scaleX: shape.scaleX || 1,
      scaleY: shape.scaleY || 1,
      visible: shape.visible !== false,
      locked: shape.locked || false,
      draggable: shape.draggable !== false,
      selectable: true,
      zIndex: shape.zIndex || 0,
      properties: {
        shapeType: shape.shapeType || 'rectangle',
        fill: shape.fill,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        cornerRadius: shape.cornerRadius,
        sides: shape.sides,
        innerRadius: shape.innerRadius
      }
    }
  }
  
  function extractColors(): string[] {
    const colors = new Set<string>()
    
    texts.value.forEach(text => {
      if (text.fill) colors.add(text.fill)
      if (text.stroke) colors.add(text.stroke)
    })
    
    shapes.value.forEach(shape => {
      if (shape.fill) colors.add(shape.fill)
      if (shape.stroke) colors.add(shape.stroke)
    })
    
    return Array.from(colors)
  }
  
  function extractTextPlaceholders(): TextPlaceholder[] {
    return texts.value
      .filter(text => text.text.includes('[') && text.text.includes(']'))
      .map(text => ({
        layerId: text.id,
        label: text.text.replace(/\[|\]/g, ''),
        defaultText: text.text,
        required: false
      }))
  }
  
  function extractImagePlaceholders(): ImagePlaceholder[] {
    return images.value
      .filter(img => img.isPlaceholder)
      .map(img => ({
        layerId: img.id,
        label: img.placeholderLabel || 'Image',
        type: img.placeholderType || 'square',
        required: false,
        aspectRatio: img.width / img.height
      }))
  }
  
  return {
    // ... existing exports ...
    currentTemplate,
    templatePlaceholders,
    loadTemplate,
    replacePlaceholderImage,
    updatePlaceholderText,
    applyColorPalette,
    saveAsTemplate
  }
})
```

## Example 5: Drag-and-Drop Implementation

```vue
<!-- src/components/WhiteboardCanvas.vue - Add drag-and-drop -->
<template>
  <div 
    class="canvas-container" 
    ref="canvasContainer"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <!-- ... existing canvas code ... -->
    
    <!-- Drop Zone Indicator -->
    <div v-if="isDragOver" class="drop-zone-indicator">
      <div class="drop-message">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <p>Drop template here</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ... existing imports ...
import type { CanvaTemplate } from '@/types/template'

const isDragOver = ref(false)

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(event: DragEvent) {
  // Only hide if leaving the container, not child elements
  if (event.target === canvasContainer.value) {
    isDragOver.value = false
  }
}

async function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  
  if (!event.dataTransfer) return
  
  try {
    // Get template data
    const templateData = event.dataTransfer.getData('application/json')
    if (!templateData) return
    
    const template: CanvaTemplate = JSON.parse(templateData)
    
    // Load template
    await store.loadTemplate(template)
    
    // Show success message
    authStore.showNotification({
      title: 'Template Loaded',
      message: `${template.name} has been loaded successfully`,
      type: 'success'
    })
  } catch (error) {
    console.error('Failed to load template:', error)
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to load template',
      type: 'error'
    })
  }
}
</script>

<style scoped>
.drop-zone-indicator {
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.1);
  border: 3px dashed #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
}

.drop-message {
  text-align: center;
  color: #3b82f6;
}

.drop-message .icon {
  width: 64px;
  height: 64px;
  fill: currentColor;
  margin: 0 auto 12px;
}

.drop-message p {
  font-size: 18px;
  font-weight: 600;
}
</style>
```
