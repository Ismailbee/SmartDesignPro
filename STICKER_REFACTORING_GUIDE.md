# Sticker Template Panel Refactoring Guide

## Overview

This document explains how to integrate the extracted components from `StickerTemplatePanel.vue` into a cleaner, more maintainable structure.

## Extracted Components

The following components have been extracted to `src/components/auto-design/sticker/`:

| Component | Purpose | Lines Saved |
|-----------|---------|-------------|
| `WeddingChatMessages.vue` | Chat message display | ~190 lines |
| `WeddingChatInput.vue` | Chat input with voice/upload | ~280 lines |
| `CategorySelector.vue` | Category selection grid | ~95 lines |
| `ImageControls.vue` | Image editing controls | ~340 lines |
| `UploadModal.vue` | Image upload modal | ~200 lines |
| `EditDescriptionModal.vue` | Text editing modal | ~150 lines |
| `PanelHeader.vue` | Header with navigation | ~85 lines |
| `GeneratingPreview.vue` | Generation loading screen | ~200 lines |
| `HelpModal.vue` | Help/guide modal | ~250 lines |
| `ExportButtons.vue` | Export PNG/SVG buttons | ~120 lines |
| `SvgPreview.vue` | SVG preview with zoom | ~230 lines |

**Total: ~2,140 lines extracted**

## Extracted Composables

The following composables have been created in `src/composables/`:

| Composable | Purpose |
|------------|---------|
| `useTextExtraction.ts` | Name, date, courtesy extraction |
| `useVoiceInput.ts` | Speech recognition and TTS |
| `useAiChatResponses.ts` | AI response generation |

## Integration Steps

### Step 1: Add Imports

At the top of `StickerTemplatePanel.vue`, add:

```typescript
// Import extracted components
import {
  WeddingChatMessages,
  WeddingChatInput,
  CategorySelector,
  ImageControls,
  UploadModal,
  EditDescriptionModal,
  PanelHeader,
  GeneratingPreview,
  HelpModal,
  ExportButtons,
  SvgPreview,
  type ChatMessage,
  type Category,
  type ExtractedInfo
} from './sticker'

// Import extracted composables
import { useTextExtraction } from '@/composables/useTextExtraction'
import { useVoiceInput } from '@/composables/useVoiceInput'
import { useAiChatResponses } from '@/composables/useAiChatResponses'
```

### Step 2: Use Composables

Replace inline logic with composables:

```typescript
// Text extraction
const {
  extractNamesFromResponse,
  extractDateFromText,
  extractCourtesyFromText,
  extractSizeFromText,
  parseAllInOneMessage
} = useTextExtraction()

// Voice input
const {
  isRecording,
  isVoiceEnabled,
  transcript,
  initSpeechRecognition,
  startRecording,
  stopRecording,
  speakMessage
} = useVoiceInput()

// AI responses
const {
  detectIntent,
  generateGreetingResponse,
  generateHelpResponse,
  analyzeUserInput
} = useAiChatResponses()
```

### Step 3: Replace Template Sections

#### Replace Header Section (Lines 7-35)

**Before:**
```vue
<div class="panel-header">
  <button @click="goBack" class="back-btn">
    <!-- SVG icon -->
  </button>
  <h2 class="panel-title">Sticker Template</h2>
  <!-- More buttons -->
</div>
```

**After:**
```vue
<PanelHeader
  title="Sticker Template"
  :is-voice-enabled="isVoiceEnabled"
  @back="goBack"
  @help="showChatHelp"
  @toggle-voice="toggleVoice"
/>
```

#### Replace Category Grid (Lines 45-62)

**Before:**
```vue
<div v-if="!selectedCategory" class="category-selection-container">
  <div class="selection-title">Select a Sticker Category</div>
  <div class="category-grid">
    <div v-for="category in categories" ...>
      <!-- Category card content -->
    </div>
  </div>
</div>
```

**After:**
```vue
<CategorySelector
  v-if="!selectedCategory"
  :categories="categories"
  @select="selectCategory"
/>
```

#### Replace Chat Messages (Lines 113-210)

**Before:**
```vue
<div class="chat-history" ref="chatHistoryContainer">
  <!-- Welcome message -->
  <!-- Messages loop -->
  <!-- Analyzing indicator -->
  <!-- Generating preview -->
</div>
```

**After:**
```vue
<WeddingChatMessages
  ref="chatHistoryContainer"
  :messages="chatMessages"
  :is-analyzing="isAnalyzing"
  :is-generating="isGeneratingPreview"
  :auth-store="authStore"
  :user-store="userStore"
  @action="handleMessageAction"
/>
```

#### Replace Chat Input

**Before:**
```vue
<div class="chat-input-area">
  <button @click="openUploadModal" class="upload-btn">...</button>
  <input type="text" v-model="userInput" ... />
  <button @click="sendChatMessage">...</button>
</div>
```

**After:**
```vue
<WeddingChatInput
  v-model="userInput"
  :is-recording="isRecording"
  :is-analyzing="isAnalyzing"
  :disabled="!authStore.isAuthenticated"
  @send="sendChatMessage"
  @upload="openUploadModal"
  @toggle-voice="toggleRecording"
/>
```

#### Replace Image Controls

**After:**
```vue
<ImageControls
  v-if="selectedImage && showWeddingStickerPreview"
  :selected-image="selectedImage"
  :is-processing="isProcessingImage"
  :removal-progress="backgroundRemovalProgress"
  @scale-change="handleImageScale"
  @flip="handleImageFlip"
  @crop="handleImageCrop"
  @retouch="handleAutoRetouch"
  @remove-bg="handleBackgroundRemoval"
/>
```

#### Replace Upload Modal

**After:**
```vue
<UploadModal
  v-if="showUploadModal"
  :is-processing="uploadModalProcessing"
  :progress="uploadModalProgress"
  :success="uploadModalSuccess"
  :remove-background="removeBackgroundOnUpload"
  @close="closeUploadModal"
  @file-select="handleModalFileSelect"
  @toggle-remove-bg="removeBackgroundOnUpload = !removeBackgroundOnUpload"
/>
```

#### Replace Export Section

**After:**
```vue
<ExportButtons
  v-if="showWeddingStickerPreview"
  :show-svg-option="true"
  :show-share-option="true"
  @export="exportWeddingSticker"
  @share="shareDesign"
/>
```

### Step 4: Remove Duplicate Code

After integrating components, remove the corresponding:
1. Template sections that are now handled by components
2. Scoped CSS for those sections (components have their own styles)
3. Helper functions that are now in composables

### Step 5: Testing Checklist

After integration, test:

- [ ] Category selection works
- [ ] Chat messages display correctly
- [ ] Voice input works
- [ ] Image upload works
- [ ] Background removal works
- [ ] Image controls (scale, flip, crop) work
- [ ] Export PNG/SVG works
- [ ] Help modal displays
- [ ] Generating preview shows progress
- [ ] All existing functionality preserved

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Lines in StickerTemplatePanel.vue | 10,944 | ~7,500 |
| Reusable components | 0 | 11 |
| Testable units | 1 (whole file) | 11+ |
| Maximum function complexity | High | Reduced |

## File Structure After Refactoring

```
src/
├── components/
│   └── auto-design/
│       ├── StickerTemplatePanel.vue (refactored, ~7,500 lines)
│       └── sticker/
│           ├── index.ts
│           ├── types.ts
│           ├── WeddingChatMessages.vue
│           ├── WeddingChatInput.vue
│           ├── CategorySelector.vue
│           ├── ImageControls.vue
│           ├── UploadModal.vue
│           ├── EditDescriptionModal.vue
│           ├── PanelHeader.vue
│           ├── GeneratingPreview.vue
│           ├── HelpModal.vue
│           ├── ExportButtons.vue
│           └── SvgPreview.vue
├── composables/
│   ├── useTextExtraction.ts
│   ├── useVoiceInput.ts
│   ├── useAiChatResponses.ts
│   └── ... (existing composables)
```

## Next Steps (Future Improvements)

1. **Phase 2**: Extract SVG manipulation logic into `useSvgManipulation.ts`
2. **Phase 3**: Extract template loading into `useTemplateLoader.ts`
3. **Phase 4**: Create dedicated stores for design state
4. **Phase 5**: Add unit tests for extracted components
5. **Phase 6**: Further split remaining large sections
