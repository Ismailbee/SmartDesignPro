# 🎨 Template System - Quick Reference Card

## 📚 Documentation Files

| File | Purpose | Lines | Time to Read |
|------|---------|-------|--------------|
| **TEMPLATE_SYSTEM_SUMMARY.md** | Overview & roadmap | 300 | 10 min |
| **QUICK_START_TEMPLATE_SYSTEM.md** | 1-hour implementation | 300 | 15 min |
| **CANVA_TEMPLATE_SYSTEM_GUIDE.md** | Complete guide | 1,052 | 45 min |
| **CANVA_TEMPLATE_SYSTEM_PART2.md** | Advanced features | 300 | 20 min |
| **CANVA_TEMPLATE_SYSTEM_PART3.md** | Technical recommendations | 300 | 20 min |

**Total:** 2,252 lines of documentation

---

## ⚡ Quick Start (1 Hour)

### Step 1: Create Template Loader (15 min)
```bash
# Create file: src/services/template-loader.service.ts
# Copy code from QUICK_START_TEMPLATE_SYSTEM.md
```

### Step 2: Update Editor Store (10 min)
```typescript
// Add to src/stores/editor.ts
async function loadSVGTemplate(svgUrl: string) { ... }
```

### Step 3: Update WhiteboardCanvas (15 min)
```typescript
// Add to src/components/WhiteboardCanvas.vue
async function handleLoadTemplate(event: CustomEvent) { ... }
```

### Step 4: Add Button (10 min)
```vue
<!-- Add to src/components/Toolbar.vue -->
<button @click="$emit('load-template')">Load Template</button>
```

### Step 5: Connect (10 min)
```typescript
// Add to src/components/DesignEditor.vue
async function handleLoadTemplate() {
  await editorStore.loadSVGTemplate('/Folder Templete/wedding-sticker.svg')
}
```

### Step 6: Test! (5 min)
```bash
npm run dev
# Click "Load Template" button
# Wedding sticker should load!
```

---

## 🎯 Implementation Phases

| Phase | Goal | Duration | Priority |
|-------|------|----------|----------|
| **1** | Template-to-Canvas Bridge | 1-2 weeks | 🔥 CRITICAL |
| **2** | Template Gallery Sidebar | 1 week | 🔥 HIGH |
| **3** | Drag-and-Drop System | 1 week | 🔥 HIGH |
| **4** | Smart Element Replacement | 1 week | ⚠️ MEDIUM |
| **5** | Element Library | 1 week | ⚠️ MEDIUM |
| **6** | Text Styles & Color Palettes | 1 week | ⚠️ MEDIUM |
| **7** | Save Custom Templates | 1 week | ⚠️ MEDIUM |
| **8** | Advanced Features | 4 weeks | ℹ️ LOW |

**Total:** 8-12 weeks

---

## 📊 Template Data Structure

```typescript
interface CanvaTemplate {
  // Basic
  id: string
  name: string
  category: string
  tags: string[]
  
  // Access
  accessLevel: 'free' | 'premium' | 'exclusive'
  
  // Dimensions
  dimensions: { width, height, unit, dpi }
  
  // Layers (Konva-compatible)
  layers: TemplateLayer[]
  
  // Assets
  assets: { images, fonts, colors }
  
  // Placeholders
  placeholders: { text, images }
  
  // Metadata
  thumbnail: string
  previewUrl: string
}

interface TemplateLayer {
  id: string
  type: 'text' | 'image' | 'shape' | 'group'
  x: number
  y: number
  width: number
  height: number
  properties: TextProperties | ImageProperties | ShapeProperties
}
```

---

## 🛠️ Key Services

### TemplateLoaderService
```typescript
// Load template into Konva canvas
await templateLoaderService.loadTemplate(template, stage)
```

### TemplateSaverService
```typescript
// Save current design as template
await templateSaverService.saveAsTemplate(templateData)
```

### TemplateConverterService
```typescript
// Convert SVG to template layers
const layers = await templateConverterService.convertSVG(svgString)
```

### ThumbnailGeneratorService
```typescript
// Generate template thumbnail
const thumbnail = await thumbnailGeneratorService.generate(stage)
```

---

## 🎨 Component Structure

```
src/components/editor/
├── TemplateSidebar.vue          # Main template browser
├── TemplateGalleryCard.vue      # Template card with thumbnail
├── TemplateCategoryFilter.vue   # Category filter buttons
├── TemplateSearchBar.vue        # Search input
├── ElementLibrary.vue           # Shapes, icons, stickers
├── TextStylePanel.vue           # Text style presets
├── ColorPalettePanel.vue        # Color palette presets
└── SaveTemplateModal.vue        # Save custom template
```

---

## 📦 Recommended Libraries

```bash
# Template Management
npm install lodash-es uuid date-fns

# Image Processing
npm install browser-image-compression cropperjs

# Performance
npm install vue-virtual-scroller

# Search
npm install fuse.js

# Drag-and-Drop (optional)
npm install @dnd-kit/core
```

---

## 🚀 Performance Tips

### 1. Virtual Scrolling
```vue
<RecycleScroller :items="templates" :item-size="200">
  <template #default="{ item }">
    <TemplateCard :template="item" />
  </template>
</RecycleScroller>
```

### 2. Lazy Loading
```vue
<img :src="placeholder" :data-src="template.thumbnail" loading="lazy" />
```

### 3. Template Caching
```typescript
const cache = new Map<string, CanvaTemplate>()
if (cache.has(id)) return cache.get(id)
```

### 4. Debounced Search
```typescript
const debouncedSearch = useDebounce(searchQuery, 500)
```

---

## 🎯 Success Criteria

✅ Wedding sticker template loads into canvas  
✅ All text elements are editable  
✅ All images are replaceable  
✅ Template maintains original styling  
✅ Drag-and-drop works smoothly  
✅ Template gallery loads <2s  
✅ Search returns results <100ms  
✅ Can save custom templates  

---

## 🐛 Common Issues

### Template not loading?
```typescript
// Check console for errors
// Verify SVG path: '/Folder Templete/wedding-sticker.svg'
// Ensure SVG is valid XML
```

### Text not appearing?
```typescript
// Check text color vs background
// Verify font-size is reasonable
// Check x, y coordinates are within bounds
```

### Images not showing?
```typescript
// Check CORS policy
// Verify image paths
// Use crossOrigin="anonymous"
```

### Drag-and-drop not working?
```typescript
// Ensure draggable="true"
// Check event.dataTransfer is set
// Verify drop zone has @drop handler
```

---

## 📈 Metrics to Track

- Template load time: <2s
- Search response time: <100ms
- Template thumbnail size: <200KB
- Bundle size increase: <500KB
- Lighthouse score: 90+
- Template cache hit rate: >80%

---

## 🎨 SVG Template Best Practices

### 1. Use IDs for editable elements
```xml
<text id="title">Title Text</text>
<text id="subtitle">Subtitle Text</text>
<image id="portrait" href="placeholder.jpg"/>
```

### 2. Use placeholders
```xml
<text id="name">[Enter Name]</text>
<text id="date">[DD/MM/YYYY]</text>
```

### 3. Use viewBox for scalability
```xml
<svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid meet">
```

### 4. Group related elements
```xml
<g id="header-group">
  <text id="title">...</text>
  <text id="subtitle">...</text>
</g>
```

---

## 🔄 Workflow

```
1. User browses templates in sidebar
2. User clicks/drags template
3. Template loads into Konva canvas
4. User edits text, replaces images
5. User applies color palette
6. User saves as custom template
7. Template appears in user's library
```

---

## 📚 Learning Resources

**Konva.js:**
- Docs: https://konvajs.org/docs/
- Examples: https://konvajs.org/docs/sandbox/

**Vue 3:**
- Composition API: https://vuejs.org/guide/
- TypeScript: https://vuejs.org/guide/typescript/

**SVG:**
- MDN: https://developer.mozilla.org/en-US/docs/Web/SVG
- Spec: https://www.w3.org/TR/SVG2/

---

## ✅ Checklist

### Phase 1: Template-to-Canvas Bridge
- [ ] Create TemplateLoaderService
- [ ] Add loadTemplate() to editor store
- [ ] Update WhiteboardCanvas
- [ ] Test with wedding-sticker.svg
- [ ] Add image support
- [ ] Add shape support
- [ ] Handle template scaling

### Phase 2: Template Gallery
- [ ] Create TemplateSidebar component
- [ ] Add template categories
- [ ] Implement search
- [ ] Add lazy loading
- [ ] Implement infinite scroll

### Phase 3: Drag-and-Drop
- [ ] Add HTML5 DnD to sidebar
- [ ] Create drop zone on canvas
- [ ] Add visual feedback
- [ ] Test drag-and-drop flow

### Phase 4: Element Replacement
- [ ] Add "Replace Image" button
- [ ] Create image upload modal
- [ ] Implement smart text editing
- [ ] Add placeholder detection

### Phase 5: Element Library
- [ ] Create element database
- [ ] Build ElementLibrary component
- [ ] Add shapes, icons, stickers
- [ ] Implement search

### Phase 6: Styles & Palettes
- [ ] Define text style presets
- [ ] Create color palette library
- [ ] Add "Apply Style" button
- [ ] Implement palette swapping

### Phase 7: Save Templates
- [ ] Add "Save as Template" button
- [ ] Generate thumbnail
- [ ] Save to Firebase
- [ ] Add to user library

---

## 🎉 You're Ready!

**Start with:** `QUICK_START_TEMPLATE_SYSTEM.md`  
**Then read:** `TEMPLATE_SYSTEM_SUMMARY.md`  
**Deep dive:** `CANVA_TEMPLATE_SYSTEM_GUIDE.md`  

**You have everything you need to build a Canva-like template system!** 🚀

Good luck! 🎨✨
