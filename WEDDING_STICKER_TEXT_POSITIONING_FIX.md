# 🔧 Wedding Sticker - Text Positioning Fix

## 🐛 Problem Description

After adding `text-anchor="middle"` to center-align text elements, the text was not positioning correctly. Instead of being centered, the text appeared on the left side of the SVG.

---

## 🔍 Root Cause

The `text-anchor="middle"` attribute centers text **relative to the x coordinate** of the text element.

### **The Issue:**
- If a text element's `x` attribute is set to `0` or a left-aligned position
- Adding `text-anchor="middle"` will center the text around that left position
- Result: Text appears on the left side, not in the center of the SVG

### **Example:**
```svg
<!-- WRONG: Text centered around x=0 (left side) -->
<text x="0" text-anchor="middle">WEDDING</text>

<!-- CORRECT: Text centered around x=1498.45 (center of 2996.9 width) -->
<text x="1498.45" text-anchor="middle">WEDDING</text>
```

---

## ✅ Solution

For `text-anchor="middle"` to work correctly, each text element's `x` coordinate must be set to the **horizontal center** of the SVG canvas.

### **Steps:**
1. Get the SVG canvas width from the `viewBox` or `width` attribute
2. Calculate the center x position: `centerX = width / 2`
3. Set each text element's `x` attribute to the center position
4. Keep `text-anchor="middle"` to center the text around that position

---

## 🔧 Implementation

### **1. New Helper Function: `getSVGCenterX()`**

```typescript
const getSVGCenterX = (svgElement: SVGSVGElement | null): number => {
  if (!svgElement) {
    return 1498.45 // Default center for 2996.9 width
  }

  // Try to get width from viewBox first
  if (svgElement.viewBox && svgElement.viewBox.baseVal) {
    const width = svgElement.viewBox.baseVal.width
    if (width > 0) {
      return width / 2
    }
  }

  // Fallback: try to get from width attribute
  const widthAttr = svgElement.getAttribute('width')
  if (widthAttr) {
    const width = parseFloat(widthAttr)
    if (!isNaN(width) && width > 0) {
      return width / 2
    }
  }

  // Default fallback
  return 1498.45 // Center of 2996.9 width
}
```

### **2. Updated Function Signature**

```typescript
// Before
const updateStickerText = (description: string, elements: WeddingStickerElements): WeddingStickerData => {
  // ...
}

// After
const updateStickerText = (
  description: string, 
  elements: WeddingStickerElements, 
  svgElement: SVGSVGElement | null = null
): WeddingStickerData => {
  // Get the center X position for proper text alignment
  const centerX = getSVGCenterX(svgElement)
  // ...
}
```

### **3. Updated Text Element Updates**

```typescript
// Example: Event Type Text
if (elements.eventTypeText) {
  elements.eventTypeText.textContent = data.eventType
  
  // Apply dynamic font size
  const fontSize = calculateEventTypeFontSize(data.eventType)
  elements.eventTypeText.setAttribute('font-size', fontSize.toString())
  
  // Set x position to center (NEW!)
  elements.eventTypeText.setAttribute('x', centerX.toString())
  
  // Center-align the text
  elements.eventTypeText.setAttribute('text-anchor', 'middle')
  
  console.log(`🎪 Event Type updated: "${data.eventType}" with font-size: ${fontSize}px (centered at x=${centerX})`)
}
```

### **4. All Text Elements Updated**

Each of the 8 text elements now gets:
1. `x` attribute set to `centerX`
2. `text-anchor` attribute set to `"middle"`

**Elements:**
- ✅ `#blessing-text`
- ✅ `#occasion-text`
- ✅ `#event-type-text`
- ✅ `#ceremony-text`
- ✅ `#name1-text`
- ✅ `#name2-text`
- ✅ `#date-text`
- ✅ `#courtesy-text`

---

## 📝 Component Updates

### **StickerTemplatePanel.vue**

**Added SVG element reference:**
```typescript
let svgElement: SVGSVGElement | null = null
```

**Updated loadWeddingStickerTemplate:**
```typescript
svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
if (svgElement) {
  svgElements = getSVGElements(svgElement)
  
  if (formData.description) {
    updateStickerText(formData.description, svgElements, svgElement) // Pass svgElement
  }
}
```

**Updated handleDescriptionInput:**
```typescript
function handleDescriptionInput() {
  if (selectedCategory.value === 'wedding' && svgElements && svgElement) {
    updateStickerText(formData.description, svgElements, svgElement) // Pass svgElement
  }
}
```

---

## 🎨 Visual Comparison

### **Before Fix (Text on Left)**
```
┌─────────────────────────────┐
│                             │
│ Congratulations             │  ← Left side (x=0, text-anchor=middle)
│ ON YOUR                     │  ← Left side
│ GRADUATION                  │  ← Left side
│                             │
└─────────────────────────────┘
```

### **After Fix (Text Centered)**
```
┌─────────────────────────────┐
│                             │
│    Congratulations          │  ← Centered (x=1498.45, text-anchor=middle)
│       ON YOUR               │  ← Centered
│     GRADUATION              │  ← Centered
│                             │
└─────────────────────────────┘
```

---

## 🧪 How to Test

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Navigate to Wedding Sticker**
1. Go to `http://localhost:8100/home`
2. Click **Auto Design** → **Sticker**
3. Select **Wedding** category

### **Step 3: Test Text Positioning**

Type this example:
```
Congratulations on your graduation ceremony (John Mary) 15th June 2025 Smith
```

### **Step 4: Visual Inspection**

**Check that:**
- ✅ All text is centered horizontally in the SVG
- ✅ Text doesn't appear on the left side
- ✅ Text stays centered when font size changes (long event types)

### **Step 5: Inspect SVG Elements**

1. Open DevTools (F12)
2. Inspect a text element (e.g., `#event-type-text`)
3. Verify attributes:
   ```html
   <text 
     id="event-type-text" 
     x="1498.45"           <!-- Center position -->
     text-anchor="middle"  <!-- Center alignment -->
     font-size="150"       <!-- Dynamic font size -->
   >
     GRADUATION
   </text>
   ```

### **Step 6: Check Console**

Look for messages like:
```
✨ Blessing updated: "Congratulations" (centered at x=1498.45)
🎪 Event Type updated: "GRADUATION" with font-size: 150px (centered at x=1498.45)
```

---

## ✅ Testing Checklist

### **Visual Verification**
- [ ] Blessing text is centered in SVG
- [ ] Occasion text is centered in SVG
- [ ] Event type text is centered in SVG (even with reduced font)
- [ ] Ceremony text is centered in SVG
- [ ] Name texts are centered in SVG
- [ ] Date text is centered in SVG
- [ ] Courtesy text is centered in SVG

### **Technical Verification**
- [ ] All text elements have `x` attribute set to center (e.g., `1498.45`)
- [ ] All text elements have `text-anchor="middle"`
- [ ] Console shows "(centered at x=...)" messages
- [ ] SVG viewBox width is correctly detected

### **Edge Cases**
- [ ] Short event types (≤8 chars) are centered
- [ ] Long event types (≥9 chars) are centered with reduced font
- [ ] Different blessing words are centered
- [ ] Long courtesy names are centered

---

## 🐛 Troubleshooting

### **Text Still on Left Side**
- Check if `x` attribute is being set correctly
- Inspect element in DevTools: should have `x="1498.45"` (or similar)
- Verify `getSVGCenterX()` is returning correct value
- Check console for center position logs

### **Text Not Centered Properly**
- Verify SVG viewBox width is correct
- Check if `getSVGCenterX()` is calculating correctly
- Inspect SVG element's viewBox attribute
- Try manually setting `x` to half of SVG width

### **Console Shows Wrong Center Position**
- Check SVG viewBox: `<svg viewBox="0 0 2996.9 1685.75">`
- Width should be 2996.9, center should be 1498.45
- If different, verify `getSVGCenterX()` logic

---

## 📊 Technical Details

### **SVG Coordinate System**

```
SVG viewBox="0 0 2996.9 1685.75"
├── Width: 2996.9
├── Height: 1685.75
├── Center X: 2996.9 / 2 = 1498.45
└── Center Y: 1685.75 / 2 = 842.875
```

### **Text Anchor Values**

| Value | Description | X Position Effect |
|-------|-------------|-------------------|
| `start` | Left-aligned | Text starts at x position |
| `middle` | Center-aligned | Text centered at x position |
| `end` | Right-aligned | Text ends at x position |

### **Our Implementation**

```typescript
// For center alignment:
x = centerX (1498.45)
text-anchor = "middle"

// Result: Text is centered at the horizontal center of the SVG
```

---

## 💡 Key Learnings

### **1. `text-anchor` Alone Is Not Enough**
- `text-anchor="middle"` only centers text around the `x` position
- You must also set `x` to the center of the SVG

### **2. SVG Width Detection**
- Try `viewBox.baseVal.width` first (most reliable)
- Fallback to `width` attribute
- Always have a default value

### **3. Dynamic Updates**
- Must update both `x` and `text-anchor` together
- Order doesn't matter, but both are required
- Console logging helps verify correct values

---

## 🎯 Summary

### **What Was Fixed:**
- ✅ Added `getSVGCenterX()` helper function
- ✅ Updated `updateStickerText()` to accept SVG element
- ✅ Set `x` attribute to center position for all text elements
- ✅ Kept `text-anchor="middle"` for proper centering
- ✅ Updated component to pass SVG element reference

### **Result:**
- ✅ All text is now properly centered in the SVG
- ✅ Text stays centered when font size changes
- ✅ Professional, balanced appearance
- ✅ Works with any SVG width

### **Console Output:**
```
✨ Blessing updated: "Congratulations" (centered at x=1498.45)
🎪 Event Type updated: "GRADUATION" with font-size: 150px (centered at x=1498.45)
```

---

## 🎉 Ready to Test!

The text positioning issue is now fixed! All text elements are properly centered in the SVG.

**Test it by:**
1. Typing different descriptions
2. Using short and long event types
3. Inspecting SVG elements in DevTools
4. Verifying `x` attribute and visual centering

**Everything should be perfectly centered now!** ✨🎯

---

## 📝 Files Modified

1. **`src/composables/useWeddingStickerUpdater.ts`**
   - Added `getSVGCenterX()` function
   - Updated `updateStickerText()` signature
   - Set `x` attribute for all text elements

2. **`src/components/auto-design/StickerTemplatePanel.vue`**
   - Added `svgElement` reference
   - Updated `loadWeddingStickerTemplate()`
   - Updated `handleDescriptionInput()`

**Happy Testing!** 🚀

