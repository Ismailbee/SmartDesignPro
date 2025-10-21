# 🎨 Naming Ceremony Template Customization Guide

## 📐 Template Layout (4" × 2.5" = 1200px × 750px)

```
┌─────────────────────────────────────────────────────────────┐
│  ○ (decoration)                                             │
│                                                              │
│   ┌─────┐         Alhamdulillah on your (subtitle)         │
│   │     │                                                    │
│   │ 👶  │         Naming Ceremony (title)                   │
│   │     │                                                    │
│   └─────┘         MUHAMMAD (child name)                     │
│  (photo)          AL-AMIN AHMAD (full name)                 │
│                                                              │
│                   5TH OCTOBER 2025 (date)                   │
│                                                              │
│                   COURTESY: MUM                              │
│                                             ○ (decoration)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Customization Points

### 1. **Canvas Size** (Lines 15-17)
```javascript
const width = 4 * 300  // 1200px (4 inches at 300 DPI)
const height = 2.5 * 300  // 750px (2.5 inches at 300 DPI)
```

**To change size:**
- For 5" × 3": `const width = 5 * 300; const height = 3 * 300`
- For 6" × 4": `const width = 6 * 300; const height = 4 * 300`

---

### 2. **Colors** (Lines 23-25)
```javascript
const bgColor = inputs.colors?.background || '#8b1538'  // Maroon
const primaryColor = inputs.colors?.primary || '#FFD700'  // Gold
const accentColor = inputs.colors?.accent || '#DAA520'  // Dark gold
```

**Color scheme examples:**
- **Blue & Gold**: `#1e3a8a` (bg), `#fbbf24` (primary), `#f59e0b` (accent)
- **Pink & Rose Gold**: `#be185d` (bg), `#f9a8d4` (primary), `#ec4899` (accent)
- **Green & Gold**: `#065f46` (bg), `#fcd34d` (primary), `#f59e0b` (accent)

---

### 3. **Background Gradient** (Lines 27-32)
```javascript
const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2)
gradient.addColorStop(0, bgColor)
gradient.addColorStop(1, darkenColor(bgColor, 0.3))
```

**Gradient types:**
- **Linear (top to bottom)**: `ctx.createLinearGradient(0, 0, 0, height)`
- **Linear (left to right)**: `ctx.createLinearGradient(0, 0, width, 0)`
- **Radial (current)**: Creates a circular gradient from center

---

### 4. **Decorative Elements** (Lines 34-46)
```javascript
// Top-left corner decoration
ctx.fillStyle = primaryColor
ctx.globalAlpha = 0.2  // 20% opacity
ctx.beginPath()
ctx.arc(0, 0, 150, 0, Math.PI * 2)  // Circle at top-left
ctx.fill()

// Bottom-right corner decoration
ctx.arc(width, height, 150, 0, Math.PI * 2)  // Circle at bottom-right
```

**Customization options:**
- Change `150` to make circles bigger/smaller
- Change `0.2` to make them more/less transparent
- Add more decorations (stars, patterns, etc.)

---

### 5. **Baby Photo** (Lines 48-88)

**Position & Size:**
```javascript
const photoSize = 180        // Photo diameter (change this!)
const photoX = 120           // X position from left
const photoY = height / 2    // Y position (centered vertically)
```

**Border:**
```javascript
ctx.strokeStyle = primaryColor  // Border color
ctx.lineWidth = 4               // Border thickness
```

**To move photo to the right:**
```javascript
const photoX = width - 200  // 200px from right edge
```

---

### 6. **Text Positioning** (Lines 90-133)

**Layout variables:**
```javascript
const textStartX = 280    // Where text starts (X position)
const centerY = height / 2  // Vertical center
```

**Individual text elements:**

#### Subtitle (Line 95-99)
```javascript
const subtitle = inputs.text?.subtitle || 'Alhamdulillah on your'
ctx.fillStyle = primaryColor
ctx.font = 'italic 24px Arial'
ctx.fillText(subtitle, textStartX, centerY - 120)
```
- **Position**: `centerY - 120` (120px above center)
- **Font**: `italic 24px Arial`
- **Color**: Gold (primaryColor)

#### Title (Line 101-105)
```javascript
const title = inputs.text?.title || 'Naming Ceremony'
ctx.fillStyle = '#FFFFFF'
ctx.font = 'bold 48px Arial'
ctx.fillText(title, textStartX, centerY - 70)
```
- **Position**: `centerY - 70` (70px above center)
- **Font**: `bold 48px Arial`
- **Color**: White

#### Child Name (Line 108-113)
```javascript
const childName = inputs.text?.childName || 'MUHAMMAD'
ctx.fillStyle = primaryColor
ctx.font = 'bold 36px Arial'
ctx.fillText(childName, textStartX, centerY)
```
- **Position**: `centerY` (at center)
- **Font**: `bold 36px Arial`
- **Color**: Gold

#### Child Full Name (Line 115-117)
```javascript
ctx.fillStyle = '#FFFFFF'
ctx.font = 'bold 32px Arial'
ctx.fillText(childFullName, textStartX, centerY + 40)
```
- **Position**: `centerY + 40` (40px below center)
- **Font**: `bold 32px Arial`
- **Color**: White

#### Date (Line 119-127)
```javascript
const dateText = `${date} ${month} ${year}`
ctx.fillStyle = accentColor
ctx.font = 'bold 20px Arial'
ctx.fillText(dateText, textStartX, centerY + 90)
```
- **Position**: `centerY + 90` (90px below center)
- **Font**: `bold 20px Arial`
- **Color**: Dark gold (accentColor)

#### Courtesy (Line 129-133)
```javascript
const courtesy = inputs.text?.courtesy || 'COURTESY: MUM'
ctx.fillStyle = primaryColor
ctx.font = 'italic 18px Arial'
ctx.fillText(courtesy, textStartX, centerY + 130)
```
- **Position**: `centerY + 130` (130px below center)
- **Font**: `italic 18px Arial`
- **Color**: Gold

---

## 🎨 Quick Customization Examples

### Example 1: Move text to center
```javascript
const textStartX = width / 2  // Center horizontally
ctx.textAlign = 'center'      // Center-align text
```

### Example 2: Bigger title
```javascript
ctx.font = 'bold 64px Arial'  // Change from 48px to 64px
```

### Example 3: Add a border around the whole design
```javascript
ctx.strokeStyle = primaryColor
ctx.lineWidth = 10
ctx.strokeRect(10, 10, width - 20, height - 20)
```

### Example 4: Add more decorative stars
```javascript
// Add stars around the photo
for (let i = 0; i < 5; i++) {
  const angle = (i * Math.PI * 2) / 5
  const x = photoX + Math.cos(angle) * 120
  const y = photoY + Math.sin(angle) * 120
  
  ctx.fillStyle = primaryColor
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, Math.PI * 2)
  ctx.fill()
}
```

---

## 📝 How to Apply Your Changes

1. **Edit** `template-renderer.cjs`
2. **Save** the file
3. **Restart** the backend server:
   ```bash
   # Kill the current server (Ctrl+C)
   # Then restart:
   node auto-design-server.cjs
   ```
4. **Generate** a new design in the browser
5. **See** your changes!

---

## 🎯 Common Adjustments

| What you want | What to change |
|---------------|----------------|
| Bigger photo | Increase `photoSize` (line 61) |
| Move photo right | Increase `photoX` (line 62) |
| Bigger title | Increase font size in line 104 |
| Different colors | Change hex codes in lines 23-25 |
| More spacing | Adjust `centerY + X` values |
| Different font | Change `'Arial'` to another font |
| Add border | Add `ctx.strokeRect()` code |

---

## 💡 Pro Tips

1. **Test incrementally**: Make one change at a time
2. **Use console.log()**: Add logging to debug positions
3. **Check the output**: Generated files are in `auto-design-uploads/preview-*.png`
4. **Coordinate system**: (0,0) is top-left, (width, height) is bottom-right
5. **Font sizes**: At 300 DPI, fonts appear smaller than on screen

---

## 🚀 Next Steps

Want to add:
- Custom fonts?
- Background images?
- More complex decorations?
- Patterns or textures?

Just let me know and I'll help you implement it!

