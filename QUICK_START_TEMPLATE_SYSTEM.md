# ⚡ Quick Start: Implement Template System in 1 Hour

## 🎯 Goal
Get a basic template loading system working with your existing wedding-sticker.svg template.

---

## Step 1: Create Template Loader Service (15 minutes)

Create `src/services/template-loader.service.ts`:

```typescript
import Konva from 'konva'
import type { CanvaTemplate } from '@/types/template'

export class TemplateLoaderService {
  async loadSVGTemplate(svgUrl: string, stage: Konva.Stage): Promise<void> {
    try {
      // Fetch SVG
      const response = await fetch(svgUrl)
      const svgText = await response.text()
      
      // Parse SVG
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgText, 'image/svg+xml')
      const svg = doc.querySelector('svg')
      
      if (!svg) throw new Error('Invalid SVG')
      
      // Get dimensions
      const width = parseFloat(svg.getAttribute('width') || '800')
      const height = parseFloat(svg.getAttribute('height') || '1000')
      
      // Create layer
      const layer = new Konva.Layer()
      
      // Add background
      const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width,
        height,
        fill: '#1e3a5f'
      })
      layer.add(bg)
      
      // Parse text elements
      svg.querySelectorAll('text').forEach((textEl) => {
        const text = new Konva.Text({
          id: textEl.id,
          x: parseFloat(textEl.getAttribute('x') || '0'),
          y: parseFloat(textEl.getAttribute('y') || '0'),
          text: textEl.textContent || '',
          fontSize: parseFloat(textEl.getAttribute('font-size') || '16'),
          fontFamily: textEl.getAttribute('font-family') || 'Arial',
          fill: textEl.getAttribute('fill') || '#000',
          draggable: true
        })
        layer.add(text)
      })
      
      // Add layer to stage
      stage.add(layer)
      layer.draw()
      
    } catch (error) {
      console.error('Failed to load SVG template:', error)
      throw error
    }
  }
}

export const templateLoaderService = new TemplateLoaderService()
```

---

## Step 2: Add Load Template Method to Editor Store (10 minutes)

Update `src/stores/editor.ts`:

```typescript
import { templateLoaderService } from '@/services/template-loader.service'

export const useEditorStore = defineStore('editor', () => {
  // ... existing code ...
  
  // Add this method
  async function loadSVGTemplate(svgUrl: string) {
    try {
      // You'll need to get the stage instance from WhiteboardCanvas
      // For now, we'll emit an event
      
      // Clear current design
      images.value = []
      texts.value = []
      shapes.value = []
      
      // Emit event to load template
      window.dispatchEvent(new CustomEvent('load-template', { 
        detail: { svgUrl } 
      }))
      
      return true
    } catch (error) {
      console.error('Failed to load template:', error)
      throw error
    }
  }
  
  return {
    // ... existing exports ...
    loadSVGTemplate
  }
})
```

---

## Step 3: Update WhiteboardCanvas to Handle Template Loading (15 minutes)

Update `src/components/WhiteboardCanvas.vue`:

```typescript
// Add to script setup
onMounted(() => {
  // ... existing code ...
  
  // Listen for template load events
  window.addEventListener('load-template', handleLoadTemplate)
})

onUnmounted(() => {
  window.removeEventListener('load-template', handleLoadTemplate)
})

async function handleLoadTemplate(event: CustomEvent) {
  const { svgUrl } = event.detail
  const stageNode = stage.value?.getNode()
  
  if (!stageNode) return
  
  try {
    await templateLoaderService.loadSVGTemplate(svgUrl, stageNode)
    
    authStore.showNotification({
      title: 'Template Loaded',
      message: 'Template loaded successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to load template',
      type: 'error'
    })
  }
}
```

---

## Step 4: Add "Load Template" Button to Toolbar (10 minutes)

Update `src/components/Toolbar.vue`:

```vue
<template>
  <div class="toolbar">
    <!-- ... existing buttons ... -->
    
    <!-- Add this button -->
    <button 
      @click="$emit('load-template')" 
      class="toolbar-btn"
      title="Load Template"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>Load Template</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['load-template', /* ... other emits */])
</script>
```

---

## Step 5: Connect Everything in DesignEditor (10 minutes)

Update `src/components/DesignEditor.vue`:

```vue
<template>
  <div class="flex h-screen bg-gray-100">
    <!-- ... existing code ... -->
    
    <Toolbar
      @load-template="handleLoadTemplate"
      <!-- ... other props and events ... -->
    />
    
    <!-- ... rest of template ... -->
  </div>
</template>

<script setup lang="ts">
// ... existing imports ...
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()

async function handleLoadTemplate() {
  try {
    // Load your wedding sticker template
    await editorStore.loadSVGTemplate('/Folder Templete/wedding-sticker.svg')
  } catch (error) {
    console.error('Failed to load template:', error)
  }
}
</script>
```

---

## Step 6: Test It! (5 minutes)

1. Start your dev server:
```bash
npm run dev
```

2. Open the Design Editor

3. Click the "Load Template" button

4. Your wedding-sticker.svg should load into the canvas!

---

## 🎉 What You Just Built

✅ Template loader service  
✅ SVG parsing and conversion to Konva  
✅ Template loading into canvas  
✅ Basic text element support  
✅ Event-based communication  

---

## 🚀 Next Steps

### Immediate Improvements (Next 2 hours)

1. **Add Image Support**
```typescript
// In template-loader.service.ts
svg.querySelectorAll('image').forEach(async (imgEl) => {
  const imageObj = new Image()
  imageObj.src = imgEl.getAttribute('href') || ''
  
  imageObj.onload = () => {
    const konvaImage = new Konva.Image({
      id: imgEl.id,
      x: parseFloat(imgEl.getAttribute('x') || '0'),
      y: parseFloat(imgEl.getAttribute('y') || '0'),
      width: parseFloat(imgEl.getAttribute('width') || '100'),
      height: parseFloat(imgEl.getAttribute('height') || '100'),
      image: imageObj,
      draggable: true
    })
    layer.add(konvaImage)
    layer.draw()
  }
})
```

2. **Add Shape Support**
```typescript
// Parse rectangles
svg.querySelectorAll('rect').forEach((rectEl) => {
  const rect = new Konva.Rect({
    id: rectEl.id,
    x: parseFloat(rectEl.getAttribute('x') || '0'),
    y: parseFloat(rectEl.getAttribute('y') || '0'),
    width: parseFloat(rectEl.getAttribute('width') || '100'),
    height: parseFloat(rectEl.getAttribute('height') || '100'),
    fill: rectEl.getAttribute('fill') || '#000',
    draggable: true
  })
  layer.add(rect)
})

// Parse circles
svg.querySelectorAll('circle').forEach((circleEl) => {
  const circle = new Konva.Circle({
    id: circleEl.id,
    x: parseFloat(circleEl.getAttribute('cx') || '0'),
    y: parseFloat(circleEl.getAttribute('cy') || '0'),
    radius: parseFloat(circleEl.getAttribute('r') || '50'),
    fill: circleEl.getAttribute('fill') || '#000',
    draggable: true
  })
  layer.add(circle)
})
```

3. **Add Template Selection Modal**
```vue
<!-- src/components/TemplateSelectionModal.vue -->
<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Select Template</h2>
      
      <div class="templates-grid">
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="template-card"
          @click="$emit('select', template)"
        >
          <img :src="template.thumbnail" :alt="template.name" />
          <p>{{ template.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  templates: Array<{ id: string; name: string; thumbnail: string; svgUrl: string }>
}>()

defineEmits(['close', 'select'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.template-card {
  cursor: pointer;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.template-card img {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 4px;
}

.template-card p {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
}
</style>
```

---

## 📚 Resources

**Documentation:**
- [Konva.js Docs](https://konvajs.org/docs/)
- [SVG Specification](https://www.w3.org/TR/SVG2/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

**Your Files:**
- `CANVA_TEMPLATE_SYSTEM_GUIDE.md` - Complete guide
- `CANVA_TEMPLATE_SYSTEM_PART2.md` - Advanced features
- `CANVA_TEMPLATE_SYSTEM_PART3.md` - Technical recommendations

---

## 🐛 Troubleshooting

**Template not loading?**
- Check browser console for errors
- Verify SVG file path is correct
- Ensure SVG is valid XML

**Text not appearing?**
- Check text color (might be same as background)
- Verify font-size is reasonable
- Check x, y coordinates are within canvas bounds

**Images not showing?**
- Check CORS policy for image URLs
- Verify image paths are correct
- Use `crossOrigin="anonymous"` for external images

---

## ✅ Success Criteria

You've successfully implemented the template system if:
- ✅ Wedding sticker template loads into canvas
- ✅ Text elements are editable and draggable
- ✅ Template maintains original styling
- ✅ No console errors

**Congratulations! You now have a working template system!** 🎉

Next: Follow the full guide to add drag-and-drop, template gallery, and more advanced features.
