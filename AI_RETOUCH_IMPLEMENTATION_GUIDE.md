# 🔧 AI Retouch - Implementation Guide

## 📋 **Table of Contents**

1. [Architecture Overview](#architecture-overview)
2. [Components](#components)
3. [State Management](#state-management)
4. [API Endpoints](#api-endpoints)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Advanced Features](#advanced-features)

---

## 🏗️ **Architecture Overview**

### **System Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vue 3)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ RetouchButton│  │AIRetouchPanel│  │BeforeAfter   │  │
│  │  Component   │  │  Component   │  │  Preview     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │ AI Retouch Store│                     │
│                  │     (Pinia)     │                     │
│                  └────────┬────────┘                     │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  AI Retouch API │                     │
│                  │    Service      │                     │
│                  └────────┬────────┘                     │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼─────────────────────────────┐
│              Backend (Express.js)                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Color Harmony │  │   Layout     │  │     Font     │  │
│  │  Algorithms  │  │Optimization  │  │   Pairing    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │    Image     │  │  Background  │                    │
│  │ Enhancement  │  │ Enhancement  │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### **Data Flow**

1. **User Action** → Clicks floating button or panel action
2. **Component** → Emits event to parent (DesignEditor)
3. **Handler** → Calls AI Retouch Store action
4. **Store** → Calls AI Retouch API Service
5. **API Service** → Makes HTTP request to backend
6. **Backend** → Processes request with AI algorithms
7. **Response** → Returns suggestions to frontend
8. **Store** → Updates state with suggestions
9. **Component** → Renders suggestions in UI
10. **User** → Reviews and applies suggestions

---

## 🧩 **Components**

### **1. RetouchButton.vue**

**Purpose:** Floating action button for quick AI retouch access

**Location:** `src/components/ai-retouch/RetouchButton.vue`

**Props:** None

**Emits:**
- `one-click-retouch` - Trigger full AI retouch
- `color-suggestions` - Get color palette suggestions
- `layout-optimization` - Optimize layout

**Features:**
- Glassmorphic floating button
- Quick actions menu on click
- Pulse animation when suggestions available
- Loading spinner during processing

**Usage:**
```vue
<RetouchButton
  @one-click-retouch="handleOneClickRetouch"
  @color-suggestions="handleColorSuggestions"
  @layout-optimization="handleLayoutOptimization"
/>
```

---

### **2. AIRetouchPanel.vue**

**Purpose:** Full AI retouch control panel with all features

**Location:** `src/components/ai-retouch/AIRetouchPanel.vue`

**Props:** None (uses Pinia store)

**Emits:**
- `one-click-retouch`
- `color-suggestions`
- `layout-optimization`
- `font-suggestions`

**Features:**
- Quick action cards
- Feature toggles (checkboxes)
- Intensity slider (0-100%)
- Suggestions list with apply/revert
- Color palette preview
- Empty state
- Before/After button
- Reset all button

**Sections:**
1. **Header** - Title and close button
2. **Processing Banner** - Shows during AI processing
3. **Error Banner** - Displays errors
4. **Quick Actions** - 4 action cards
5. **Features** - Toggle switches for 9 features
6. **Intensity** - Slider control
7. **Suggestions** - List of AI suggestions
8. **Footer** - Before/After and Reset buttons

---

### **3. BeforeAfterPreview.vue**

**Purpose:** Modal for comparing before/after states

**Location:** `src/components/ai-retouch/BeforeAfterPreview.vue`

**Props:** None (uses Pinia store)

**Features:**
- Split-screen comparison
- Draggable slider
- Toggle buttons (Before | Split | After)
- Applied changes list
- Keep/Close actions

**Interaction:**
- Drag slider to reveal before/after
- Click toggle buttons for instant switch
- Review list of applied changes
- Click "Keep Changes" to confirm

---

### **4. AILoadingIndicator.vue**

**Purpose:** Loading overlay during AI processing

**Location:** `src/components/ai-retouch/AILoadingIndicator.vue`

**Props:**
- `isVisible: boolean` - Show/hide indicator
- `title: string` - Loading title
- `message: string` - Loading message
- `progress: number` - Progress percentage (0-100)
- `showProgress: boolean` - Show progress bar

**Features:**
- Animated spinner with 3 rings
- Sparkle icon animation
- Optional progress bar
- Glassmorphic overlay

---

## 🗄️ **State Management**

### **AI Retouch Store (Pinia)**

**Location:** `src/stores/ai-retouch.ts`

**State:**
```typescript
{
  isOpen: boolean                    // Panel open/closed
  isProcessing: boolean              // AI processing status
  processingStatus: ProcessingStatus // idle | processing | success | error
  currentFeature: AIRetouchFeature   // Currently processing feature
  suggestions: AISuggestion[]        // AI suggestions
  appliedSuggestions: string[]       // IDs of applied suggestions
  history: AISuggestion[]            // History of suggestions
  error: string | null               // Error message
  showBeforeAfter: boolean           // Show comparison modal
  beforeSnapshot: string | null      // Before state snapshot
  afterSnapshot: string | null       // After state snapshot
  intensity: number                  // Intensity level (0-100)
  enabledFeatures: AIRetouchFeature[] // Enabled features
  settings: RetouchSettings          // User settings
}
```

**Actions:**
- `openPanel()` - Open AI retouch panel
- `closePanel()` - Close AI retouch panel
- `togglePanel()` - Toggle panel open/closed
- `applyOneClickRetouch(designData)` - Apply all AI improvements
- `optimizeDesignLayout(elements, canvasSize)` - Optimize layout
- `getColorPaletteSuggestions(colors)` - Get color palettes
- `getFontPairingSuggestions(fonts)` - Get font pairings
- `applySuggestion(id)` - Apply a suggestion
- `revertSuggestion(id)` - Revert a suggestion
- `clearSuggestions()` - Clear all suggestions
- `resetAll()` - Reset all changes
- `toggleFeature(feature)` - Toggle feature on/off
- `setIntensity(value)` - Set intensity level
- `showComparison()` - Show before/after modal
- `hideComparison()` - Hide before/after modal

**Computed:**
- `hasSuggestions` - Has any suggestions
- `hasAppliedSuggestions` - Has applied suggestions
- `canUndo` - Can undo changes

---

## 🌐 **API Endpoints**

### **Backend Server**

**Base URL:** `http://localhost:3005/api`

### **1. GET /api/ai/color-palette**

Get color palette suggestions based on current colors.

**Query Parameters:**
- `colors` (required) - Comma-separated hex colors (e.g., `#667eea,#764ba2`)
- `count` (optional) - Number of palettes to return (default: 4)

**Response:**
```json
{
  "currentPalette": {
    "id": "current",
    "name": "Current",
    "colors": ["#667eea", "#764ba2"],
    "description": "Your current color scheme",
    "harmony": "custom"
  },
  "suggestions": [
    {
      "id": "complementary",
      "name": "Complementary",
      "colors": ["#667eea", "#ea9f67", "#8a9eea", "#ea7f47", "#4668ea"],
      "description": "Colors opposite on the color wheel",
      "harmony": "complementary"
    }
  ],
  "analysis": {
    "harmony": "custom",
    "contrast": 75,
    "accessibility": true
  }
}
```

---

### **2. GET /api/ai/font-pairing**

Get font pairing suggestions.

**Query Parameters:**
- `currentFonts` (optional) - Comma-separated font names
- `designType` (optional) - Design type: `business`, `creative`, `minimal`, `bold`

**Response:**
```json
{
  "currentPairing": {
    "id": "current",
    "name": "Current Fonts",
    "heading": "Arial",
    "subheading": "Arial",
    "body": "Arial",
    "description": "Your current font selection",
    "category": "custom"
  },
  "suggestions": [
    {
      "id": "modern-professional",
      "name": "Modern Professional",
      "heading": "Montserrat",
      "subheading": "Lato",
      "body": "Open Sans",
      "description": "Clean and professional",
      "category": "professional"
    }
  ],
  "analysis": {
    "readability": 85,
    "hierarchy": true,
    "consistency": true
  }
}
```

---

### **3. POST /api/ai/layout**

Optimize layout alignment and spacing.

**Request Body:**
```json
{
  "elements": [
    { "id": "el1", "x": 100, "y": 100, "width": 200, "height": 100 },
    { "id": "el2", "x": 102, "y": 250, "width": 200, "height": 100 }
  ],
  "canvasSize": { "width": 800, "height": 600 },
  "options": {
    "alignment": true,
    "spacing": true,
    "balance": true,
    "layering": true
  }
}
```

**Response:**
```json
{
  "adjustments": [
    {
      "elementId": "el2",
      "property": "x",
      "oldValue": 102,
      "newValue": 100,
      "reason": "Align vertically with nearby elements"
    }
  ],
  "preview": null,
  "score": 90,
  "issues": ["vertical-misalignment: 2.0px difference"],
  "success": true
}
```

---

### **4. POST /api/ai/retouch**

Apply comprehensive AI retouch.

**Request Body:**
```json
{
  "designData": {
    "elements": [],
    "canvasSize": { "width": 800, "height": 600 },
    "backgroundColor": "#ffffff"
  },
  "options": {
    "features": ["color-palette", "font-pairing", "smart-alignment"],
    "intensity": 75,
    "preserveOriginal": true,
    "autoApply": false
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "id": "color-1234567890-0",
      "feature": "color-palette",
      "title": "Complementary",
      "description": "Colors opposite on the color wheel",
      "confidence": 85,
      "data": { /* palette data */ },
      "applied": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "preview": null,
  "processingTime": 1234,
  "success": true,
  "message": "Generated 3 suggestions"
}
```

---

### **5. POST /api/ai/enhance-image**

Enhance image contrast, brightness, etc.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "enhancements": {
    "contrast": true,
    "brightness": true,
    "saturation": false,
    "sharpness": true
  },
  "intensity": 75
}
```

**Response:**
```json
{
  "enhancedImageUrl": "https://example.com/enhanced-image.jpg",
  "adjustments": {
    "contrast": 37.5,
    "brightness": 22.5,
    "saturation": 0,
    "sharpness": 45
  },
  "success": true
}
```

---

### **6. POST /api/ai/enhance-background**

Apply background effects.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "effect": "blur",
  "intensity": 75
}
```

**Response:**
```json
{
  "enhancedImageUrl": "https://example.com/blurred-bg.jpg",
  "effect": "blur",
  "success": true
}
```

---

## 🔌 **Integration Guide**

### **Step 1: Add to DesignEditor**

```vue
<template>
  <div class="design-editor">
    <!-- Existing components -->
    
    <!-- AI Retouch Components -->
    <RetouchButton
      @one-click-retouch="handleOneClickRetouch"
      @color-suggestions="handleColorSuggestions"
      @layout-optimization="handleLayoutOptimization"
    />
    <AIRetouchPanel
      @one-click-retouch="handleOneClickRetouch"
      @color-suggestions="handleColorSuggestions"
      @layout-optimization="handleLayoutOptimization"
      @font-suggestions="handleFontSuggestions"
    />
    <BeforeAfterPreview />
    <AILoadingIndicator
      :is-visible="aiRetouchStore.isProcessing"
    />
  </div>
</template>

<script setup lang="ts">
import { useAIRetouchStore } from '@/stores/ai-retouch'
import RetouchButton from './ai-retouch/RetouchButton.vue'
import AIRetouchPanel from './ai-retouch/AIRetouchPanel.vue'
import BeforeAfterPreview from './ai-retouch/BeforeAfterPreview.vue'
import AILoadingIndicator from './ai-retouch/AILoadingIndicator.vue'

const aiRetouchStore = useAIRetouchStore()

async function handleOneClickRetouch() {
  const designData = {
    elements: getCanvasElements(),
    canvasSize: getCanvasSize(),
    backgroundColor: getBackgroundColor()
  }
  await aiRetouchStore.applyOneClickRetouch(designData)
}

// Implement other handlers...
</script>
```

---

## 🎨 **Customization**

### **Change Colors**

Edit `src/components/ai-retouch/ai-retouch-styles.css`:

```css
/* Change primary gradient */
.retouch-button {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* Change panel background */
.ai-retouch-panel {
  background: rgba(your-r, your-g, your-b, 0.15);
}
```

### **Add Custom Features**

1. Add feature to `src/types/ai-retouch.ts`:
```typescript
export type AIRetouchFeature =
  | 'color-palette'
  | 'your-custom-feature' // Add here
```

2. Add to `AI_FEATURES` object:
```typescript
export const AI_FEATURES = {
  'your-custom-feature': {
    name: 'Your Feature',
    icon: '🎯',
    description: 'Your feature description'
  }
}
```

3. Implement backend endpoint
4. Add store action
5. Add UI in panel

---

## 🚀 **Advanced Features**

### **Custom AI Models**

Replace local algorithms with ML models:

```typescript
// In ai-retouch-api.ts
import * as ort from 'onnxruntime-web'

async function runONNXModel(input: any) {
  const session = await ort.InferenceSession.create('model.onnx')
  const tensor = new ort.Tensor('float32', input)
  const results = await session.run({ input: tensor })
  return results
}
```

### **Cloud AI Integration**

```typescript
// Integrate with OpenAI, Replicate, etc.
async function enhanceWithCloudAI(designData: any) {
  const response = await fetch('https://api.openai.com/v1/...', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ /* ... */ })
  })
  return response.json()
}
```

---

**For more details, see `AI_RETOUCH_QUICK_START.md`**

