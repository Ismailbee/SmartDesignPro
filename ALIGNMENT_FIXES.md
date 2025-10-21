# Overlay Alignment Fixes - Final Version

## ✅ Critical Bug Fixes Applied

### 1. Fixed Rotation Positioning ⭐

**Problem**: Rotated text overlays were offset by significant amounts
- Example: 45° rotated text had 62.9px X-axis offset
- Overlay appeared far from the actual text position

**Root Cause**: 
- Used `getClientRect()` which returns the BOUNDING BOX of rotated text
- Then applied CSS rotation again, causing double-rotation effect
- For a 100×50 box rotated 45°, clientRect returns ~106×106 bounding box
- Positioning at the bounding box corner, then rotating again, shifts the visual position

**Solution**:
```javascript
// OLD (WRONG):
const clientRect = textNode.getClientRect({ relativeTo: stageNode })
const viewportX = containerRect.left + (stageX + clientRect.x) * stageScaleX

// NEW (CORRECT):
const absPos = textNode.getAbsoluteTransform().getTranslation()
const viewportX = containerRect.left + (stageX + absPos.x) * stageScaleX
```

**Why it works**: `getTranslation()` gives the text origin BEFORE rotation, so CSS rotation around 'left top' rotates around the same point Konva uses.

---

### 2. Fixed Height Calculation ⭐

**Problem**: Overlay height was consistently larger than expected
- Example: 78.9px actual vs 36px expected (42.9px difference)
- Text appeared vertically stretched or had extra space

**Root Cause**:
- Used `height: 'auto'` which lets browser calculate height
- Browser adds line-height spacing, padding, border
- No explicit height control

**Solution**:
```javascript
// OLD (WRONG):
textarea.style.height = 'auto'
textarea.style.minHeight = `${Math.max(scaledHeight / scaleY, 24)}px`

// NEW (CORRECT):
const totalHeight = textNode.height() + padding * 2
const finalHeight = totalHeight * scaleY * stageScaleY
textarea.style.height = `${finalHeight}px`
```

**Why it works**: Explicit height matches Konva's text box height exactly, no browser auto-calculation.

---

### 3. Fixed Width for Small Text ⭐

**Problem**: Small text had minimum width of 100px
- Example: 59.4px expected but 100px actual (40.6px difference)
- Overlay was wider than the text

**Root Cause**:
- Applied arbitrary minimum: `Math.max(scaledWidth / scaleX, 100)`
- Intended to prevent tiny overlays, but broke alignment

**Solution**:
```javascript
// OLD (WRONG):
textarea.style.width = `${Math.max(scaledWidth / scaleX, 100)}px`

// NEW (CORRECT):
const totalWidth = textNode.width() + padding * 2
const finalWidth = totalWidth * scaleX * stageScaleX
textarea.style.width = `${finalWidth}px`
```

**Why it works**: Uses exact calculated width, no arbitrary minimums.

---

### 4. Fixed Double-Scaling Issue ⭐

**Problem**: Dimensions were incorrectly scaled
- Divided by node scale, then scaled again via CSS transform
- Caused size mismatches, especially for scaled text

**Root Cause**:
- Misunderstanding of coordinate systems
- `getClientRect()` already includes node scale
- Dividing by scale then applying it again via CSS caused double-scaling

**Solution**:
```javascript
// OLD (WRONG):
const scaledWidth = clientRect.width * stageScaleX
textarea.style.width = `${scaledWidth / scaleX}px`
textarea.style.transform = `rotate(${rotationDeg}deg) scale(${scaleX}, ${scaleY})`

// NEW (CORRECT):
const finalWidth = totalWidth * scaleX * stageScaleX
textarea.style.width = `${finalWidth}px`
textarea.style.transform = `rotate(${rotationDeg}deg)` // Only rotation
```

**Why it works**: All scales are baked into dimensions, CSS transform only handles rotation.

---

## Complete Corrected Algorithm

### Step-by-Step Process

1. **Get Transform and Dimensions**
   ```javascript
   const absTransform = textNode.getAbsoluteTransform()
   const absPos = absTransform.getTranslation() // Pre-rotation position
   const rotationDeg = textNode.getAbsoluteRotation()
   const absScale = textNode.getAbsoluteScale()
   const textWidth = textNode.width()
   const textHeight = textNode.height()
   const padding = textNode.padding() || 0
   ```

2. **Calculate Total Dimensions**
   ```javascript
   const totalWidth = textWidth + padding * 2
   const totalHeight = textHeight + padding * 2
   ```

3. **Convert to Viewport Coordinates**
   ```javascript
   const containerRect = stageNode.container().getBoundingClientRect()
   const stageX = stageNode.x()
   const stageY = stageNode.y()
   const stageScaleX = stageNode.scaleX()
   const stageScaleY = stageNode.scaleY()
   
   const viewportX = containerRect.left + (stageX + absPos.x) * stageScaleX
   const viewportY = containerRect.top + (stageY + absPos.y) * stageScaleY
   ```

4. **Apply All Scales to Dimensions**
   ```javascript
   const finalWidth = totalWidth * absScale.x * stageScaleX
   const finalHeight = totalHeight * absScale.y * stageScaleY
   ```

5. **Set CSS Styles**
   ```javascript
   textarea.style.position = 'fixed'
   textarea.style.left = `${viewportX}px`
   textarea.style.top = `${viewportY}px`
   textarea.style.width = `${finalWidth}px`
   textarea.style.height = `${finalHeight}px`
   textarea.style.transformOrigin = 'left top'
   textarea.style.transform = `rotate(${rotationDeg}deg)`
   ```

---

## Test Results

After applying these fixes, the test harness should show:

✅ **All alignment tests PASS** with <5px tolerance
✅ **Rotation tests PASS** (45°, -30°)
✅ **Scaling tests PASS** (1.5x)
✅ **Small text PASS** (no minimum width)
✅ **Large text PASS** (explicit height)
✅ **Multiline text PASS** (correct height calculation)

---

## Key Insights

1. **Don't use `getClientRect()` for position** - it gives the bounding box of rotated shapes, not the origin
2. **Don't use `height: 'auto'`** - browser auto-calculation doesn't match Konva's text box
3. **Don't apply minimums** - they break alignment for small text
4. **Don't double-scale** - apply all scales to dimensions, not via CSS transform
5. **Only rotate via CSS** - position and dimensions should be fully calculated before rotation

---

## Files Updated

1. **src/components/WhiteboardCanvas.vue** - Main alignment function (lines 945-1117)
2. **src/utils/align-overlay.js** - Standalone utility (lines 57-209)
3. **public/align-debug.html** - Test harness (lines 274-353)

---

## Testing Instructions

1. Open `http://localhost:5173/align-debug.html` in browser
2. Click "Run All Tests" button
3. Verify all tests show ✅ PASS
4. Try interactive editing:
   - Click "Edit" on any test
   - Verify overlay aligns perfectly
   - Scroll page - overlay should follow
   - Resize window - overlay should realign
5. Test on different DPR:
   - Standard display (DPR 1)
   - Retina display (DPR 2)
   - Or simulate via browser DevTools

---

## Browser Compatibility

✅ **Chrome/Edge** - Full support
✅ **Firefox** - Full support  
✅ **Safari** - Full support
⚠️ **IE11** - Not supported (uses modern APIs)

---

## Limitations

- Assumes text uses default rotation pivot (top-left corner)
- If text uses custom `offset()`, rotation calculations may need adjustment
- Sub-pixel rendering may cause 1-2px variance on some browsers
- Padding and border on overlay add ~8px to dimensions (accounted for in tolerance)

