# 🎯 Wedding Sticker Workflow Analysis & Implementation Plan

## 📋 Current Implementation Review

### **1. Existing Wedding Sticker Text Positioning Logic**

#### **Location:** `src/composables/useWeddingStickerUpdater.ts`

This is your **main text positioning logic** file. It contains:

**Key Functions:**
- `extractFirstWord()` - Extracts blessing text from description
- `extractEventType()` - Extracts event type from "on your [EVENT TYPE]" pattern
- `extractNames()` - Extracts names from brackets `[Name1 and Name2]`
- `extractDate()` - Extracts date from description
- `extractCourtesy()` - Extracts courtesy/family name
- `updateStickerText()` - **Main function** that applies all text updates to SVG elements
- `getSVGElements()` - Gets SVG text elements by their IDs

**SVG Element IDs Used:**
```typescript
{
  blessingText: '#blessing-text',      // "Alhamdulillahi"
  occasionText: '#occasion-text',      // "ON YOUR"
  eventTypeText: '#event-type-text',   // "WEDDING"
  ceremonyText: '#ceremony-text',      // "CEREMONY"
  name1Text: '#name1-text',            // First name
  name2Text: '#name2-text',            // Second name
  dateText: '#date-text',              // Date
  courtesyText: '#courtesy-text'       // "CUT-CEE: Family Name"
}
```

**Text Positioning Coordinates (from SVG template):**
```xml
<text id="blessing-text" x="850.45" y="372.07" />
<text id="occasion-text" x="850.45" y="443.52" />
<text id="event-type-text" x="850.45" y="621.11" />
<text id="ceremony-text" x="850.45" y="750.44" />
<text id="name1-text" x="850.45" y="1100" />
<text id="name2-text" x="850.45" y="1280" />
<text id="date-text" x="850.45" y="1410" />
<text id="courtesy-text" x="850.45" y="1600" />
```

---

### **2. Current SVG Template Locations**

You have **TWO copies** of the wedding sticker template:

1. **Local:** `public/templates/wedding-sticker/template.svg`
2. **CloudFront:** `https://d27paqapg0ahqm.cloudfront.net/weddingStiker/template.svg`

Both contain the same SVG structure with editable text elements.

---

### **3. Current Workflow (PROBLEM)**

**Current Implementation in `StickerTemplatePanel.vue`:**

```typescript
// Lines 1114-1137
watch(selectedCategory, async (newCategory) => {
  if (newCategory === 'wedding') {
    await nextTick()
    await loadWeddingStickerTemplate()  // ❌ Loads IMMEDIATELY
  }
})

onMounted(() => {
  if (selectedCategory.value === 'wedding') {
    nextTick(() => {
      loadWeddingStickerTemplate()  // ❌ Loads IMMEDIATELY
    })
  }
})
```

**Problem:** The SVG template loads **immediately** when the wedding category is selected, NOT after clicking "Generate".

---

## 🎯 Desired Workflow (YOUR REQUIREMENTS)

### **Step-by-Step Flow:**

1. ✅ User navigates to Home page
2. ✅ User clicks "Auto Design"
3. ✅ User selects "Sticker" category
4. ✅ User chooses "Wedding Sticker" template
5. ✅ User fills in description field
6. ✅ User clicks "Generate" button
7. **🔥 ONLY NOW:** Load SVG from CloudFront
8. **🔥 ONLY NOW:** Apply text positioning logic
9. **🔥 ONLY NOW:** Display customized wedding sticker

---

## 🔧 Implementation Plan

### **Files to Modify:**

1. **`src/components/auto-design/StickerTemplatePanel.vue`**
   - Remove immediate SVG loading on category selection
   - Add SVG loading to `handleGenerate()` function
   - Apply text positioning logic after SVG loads

2. **`src/composables/useWeddingStickerUpdater.ts`**
   - Already perfect! No changes needed.

3. **`cloudfront-urls.json`** (Reference)
   - Use CloudFront URL: `https://d27paqapg0ahqm.cloudfront.net/weddingStiker/template.svg`

---

## 📝 Detailed Implementation Steps

### **Step 1: Remove Immediate Loading**

**File:** `src/components/auto-design/StickerTemplatePanel.vue`

**Remove these watchers/hooks:**
```typescript
// ❌ REMOVE THIS
watch(selectedCategory, async (newCategory) => {
  if (newCategory === 'wedding') {
    await nextTick()
    await loadWeddingStickerTemplate()
  }
})

// ❌ REMOVE THIS
onMounted(() => {
  if (selectedCategory.value === 'wedding') {
    nextTick(() => {
      loadWeddingStickerTemplate()
    })
  }
})
```

---

### **Step 2: Modify `handleGenerate()` Function**

**Add wedding sticker generation logic:**

```typescript
async function handleGenerate() {
  try {
    isGenerating.value = true

    // Validate form
    if (!formData.description) {
      authStore.showNotification({
        title: 'Validation Error',
        message: 'Please enter a description',
        type: 'error'
      })
      return
    }

    // Switch to preview mode
    viewMode.value = 'preview'

    // 🔥 NEW: Handle wedding sticker generation
    if (selectedCategory.value === 'wedding') {
      await generateWeddingSticker()
      return
    }

    // Existing logic for other sticker types...
    // (keep existing code)

  } catch (error: any) {
    console.error('Failed to generate design:', error)
    authStore.showNotification({
      title: 'Generation Failed',
      message: error.message || 'Failed to generate sticker design',
      type: 'error'
    })
    viewMode.value = 'form'
  } finally {
    isGenerating.value = false
  }
}
```

---

### **Step 3: Create `generateWeddingSticker()` Function**

**Add this new function:**

```typescript
async function generateWeddingSticker() {
  try {
    console.log('🎨 Generating wedding sticker...')

    // 1. Load SVG from CloudFront
    const cloudfrontUrl = 'https://d27paqapg0ahqm.cloudfront.net/weddingStiker/template.svg'
    
    const response = await fetch(cloudfrontUrl)
    if (!response.ok) {
      throw new Error('Failed to load wedding template from CloudFront')
    }

    const svgText = await response.text()
    console.log('✅ SVG loaded from CloudFront')

    // 2. Insert SVG into preview container
    if (!weddingPreviewContainer.value) {
      throw new Error('Preview container not found')
    }

    weddingPreviewContainer.value.innerHTML = svgText
    await nextTick()

    // 3. Get SVG element and text elements
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (!svgElement) {
      throw new Error('SVG element not found')
    }

    const svgElements = getSVGElements(svgElement)
    console.log('✅ SVG elements retrieved')

    // 4. Apply text positioning logic
    updateStickerText(formData.description, svgElements)
    console.log('✅ Text positioning applied')

    // 5. Check if replacement should be applied (for Nikkah, etc.)
    await handleReplacement(formData.description, svgElement, {
      keywords: ['congratulation', 'nikkah'],
      svgFiles: [
        '/weddigTitlesNiKkah/Nikkah.svg',
        '/weddigTitlesNiKkah/Nikkah1.svg',
        '/weddigTitlesNiKkah/Nikkah2.svg'
      ],
      targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
      position: {
        x: 850.45,
        y: 372.07,
        width: 850,
        height: 378
      }
    })
    console.log('✅ Replacement logic applied')

    // 6. Convert SVG to data URL for preview
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    // 7. Set preview URL
    previewUrl.value = svgUrl
    console.log('✅ Preview URL set')

    // 8. Show success notification
    authStore.showNotification({
      title: 'Success',
      message: 'Wedding sticker generated successfully!',
      type: 'success'
    })

  } catch (error: any) {
    console.error('❌ Failed to generate wedding sticker:', error)
    throw error
  }
}
```

---

### **Step 4: Update Preview Section**

**Modify the preview section to show the wedding sticker:**

```vue
<!-- Preview Section -->
<div v-if="viewMode === 'preview'" class="preview-section">
  <div class="preview-header">
    <h2 class="preview-title">Preview</h2>
    <button @click="backToForm" class="back-button">
      ← Back to Form
    </button>
  </div>

  <div class="preview-content">
    <!-- Loading State -->
    <div v-if="isGenerating" class="preview-loading">
      <div class="spinner"></div>
      <p>Generating your wedding sticker...</p>
    </div>

    <!-- Wedding Sticker Preview -->
    <div v-else-if="selectedCategory === 'wedding' && previewUrl" class="wedding-sticker-preview">
      <img :src="previewUrl" alt="Wedding Sticker Preview" class="wedding-preview-image" />
      
      <div class="preview-actions">
        <button @click="downloadWeddingSticker" class="download-button">
          Download PNG
        </button>
        <button @click="sendToEditor" class="editor-button">
          Send to Editor
        </button>
      </div>
    </div>

    <!-- Other sticker types preview -->
    <div v-else-if="previewUrl" class="preview-result">
      <!-- Existing preview code -->
    </div>
  </div>
</div>
```

---

### **Step 5: Add Download Function**

```typescript
async function downloadWeddingSticker() {
  try {
    if (!previewUrl.value) return

    // Convert SVG to PNG using canvas
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 2996.9  // SVG viewBox width
      canvas.height = 1685.75  // SVG viewBox height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      // Download as PNG
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wedding-sticker-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    }

    img.src = previewUrl.value
  } catch (error) {
    console.error('Failed to download:', error)
    authStore.showNotification({
      title: 'Download Failed',
      message: 'Failed to download wedding sticker',
      type: 'error'
    })
  }
}
```

---

## 📊 Summary of Changes

| File | Changes | Purpose |
|------|---------|---------|
| `StickerTemplatePanel.vue` | Remove immediate loading watchers | Prevent SVG loading before Generate |
| `StickerTemplatePanel.vue` | Modify `handleGenerate()` | Add wedding sticker generation logic |
| `StickerTemplatePanel.vue` | Add `generateWeddingSticker()` | Load SVG from CloudFront & apply text |
| `StickerTemplatePanel.vue` | Add `downloadWeddingSticker()` | Enable PNG download |
| `StickerTemplatePanel.vue` | Update preview template | Show wedding sticker preview |

---

## ✅ Benefits of This Approach

1. **Delayed Loading** - SVG only loads after clicking "Generate"
2. **CloudFront Integration** - Uses CloudFront URL for fast, reliable loading
3. **Automatic Text Application** - All text positioning logic applied automatically
4. **Existing Logic Reuse** - Uses your existing `useWeddingStickerUpdater` composable
5. **Clean Separation** - Wedding sticker logic separated from other sticker types
6. **Download Support** - Users can download the customized sticker as PNG

---

## 🚀 Next Steps

Would you like me to:
1. **Implement these changes** in the codebase?
2. **Test the workflow** to ensure it works correctly?
3. **Add additional features** (e.g., edit mode, multiple templates)?

Let me know and I'll proceed with the implementation!

