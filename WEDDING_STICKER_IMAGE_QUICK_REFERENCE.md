# 🖼️ Wedding Sticker Image Management - Quick Reference

## 🎯 Quick Start

### **1. Upload Images**
- **Drag & Drop:** Drag images into the drop zone
- **Click to Browse:** Click drop zone → Select files → Open
- **Supported:** PNG, JPG, JPEG, SVG (Max 5MB each)

### **2. Select Image**
- Click on thumbnail in gallery
- Selected image has blue border

### **3. Position Image**
- **X Position:** Horizontal placement
- **Y Position:** Vertical placement
- **Width:** Image width (auto-adjusts height if aspect ratio locked)
- **Height:** Image height
- **Rotation:** 0-360 degrees
- **Opacity:** 0-100%

### **4. Manage Layers**
- **To Front:** Highest layer
- **Up:** Move up one layer
- **Down:** Move down one layer
- **To Back:** Lowest layer

### **5. Export**
- **SVG:** Vector format with embedded images
- **PNG:** High-res raster (300 DPI)

---

## 📋 Controls Reference

| Control | Purpose | Range |
|---------|---------|-------|
| X Position | Horizontal placement | Any number |
| Y Position | Vertical placement | Any number |
| Width | Image width in pixels | > 0 |
| Height | Image height in pixels | > 0 |
| Rotation | Rotation angle | 0-360° |
| Opacity | Transparency | 0-100% |
| Aspect Ratio | Lock width/height ratio | ☑/☐ |

---

## 🎨 Layer Order

```
Top Layer (Front)
    ↑
    │  Text Elements (always on top)
    │  ├─ Blessing Text
    │  ├─ Event Type Text
    │  ├─ Names, Date, Courtesy
    │
    │  User Images (z-index order)
    │  ├─ user-image-3 (z-index: 2)
    │  ├─ user-image-2 (z-index: 1)
    │  └─ user-image-1 (z-index: 0)
    │
    │  Background Elements
    │  └─ Wave layers, rectangles
    ↓
Bottom Layer (Back)
```

---

## 🔧 Common Tasks

### **Center an Image**
```
SVG Width: 2996.9
Center X: 1498.45

For 400px wide image:
X Position = 1498.45 - (400 / 2) = 1298.45
```

### **Make Image Semi-Transparent**
```
Opacity: 50%  (50% transparent)
Opacity: 75%  (25% transparent)
Opacity: 100% (fully opaque)
```

### **Rotate Image**
```
Rotation: 0°   (no rotation)
Rotation: 90°  (quarter turn)
Rotation: 180° (upside down)
Rotation: 270° (three-quarter turn)
```

### **Scale Image Proportionally**
```
1. Check "Maintain Aspect Ratio"
2. Change Width only
3. Height adjusts automatically
```

---

## 📊 Default Values

| Property | Default Value |
|----------|---------------|
| X Position | 100 |
| Y Position | 100 |
| Width | 300-400 (scaled from original) |
| Height | 300-400 (scaled from original) |
| Rotation | 0° |
| Opacity | 100% |
| Aspect Ratio | Locked (☑) |
| Z-Index | Auto (based on upload order) |

---

## ⚠️ Limitations

| Limit | Value |
|-------|-------|
| Max File Size | 5MB per image |
| Allowed Types | PNG, JPG, JPEG, SVG |
| Max Images | Unlimited (but keep reasonable for performance) |
| Export PNG DPI | 300 DPI (fixed) |

---

## 🎯 Tips & Tricks

### **Tip 1: Position Photos Below Names**
```
Names are at Y: 1100 and Y: 1280
Position photos at Y: 900 or lower
```

### **Tip 2: Use Opacity for Watermarks**
```
Set Opacity: 20-30% for subtle watermark effect
```

### **Tip 3: Layer Order Matters**
```
Images added first are at the back
Images added last are at the front
Use layer controls to rearrange
```

### **Tip 4: Maintain Aspect Ratio**
```
Keep "Maintain Aspect Ratio" checked to avoid distortion
Uncheck only if you need to stretch/squash the image
```

### **Tip 5: Test Before Export**
```
Preview looks exactly like the export
What you see is what you get!
```

---

## 🚀 Keyboard Shortcuts

Currently no keyboard shortcuts implemented, but you can:
- **Tab:** Navigate between input fields
- **Enter:** Confirm input value
- **Esc:** Deselect image (click outside)

---

## 📁 Export File Names

| Format | Filename Pattern |
|--------|------------------|
| SVG | `wedding-sticker-YYYY-MM-DD.svg` |
| PNG | `wedding-sticker-YYYY-MM-DD.png` |

Example: `wedding-sticker-2025-01-21.svg`

---

## ✅ Checklist

### **Before Export:**
- [ ] All images uploaded and positioned
- [ ] Text content is correct
- [ ] Fonts are applied correctly (check event type length)
- [ ] Layer order is correct
- [ ] Opacity and rotation are as desired
- [ ] Preview looks good

### **After Export:**
- [ ] File downloaded successfully
- [ ] Open file to verify content
- [ ] Check that all images are embedded
- [ ] Check that all text is correct
- [ ] Check that fonts are preserved

---

## 🐛 Troubleshooting

### **Image Not Uploading?**
- Check file size (max 5MB)
- Check file type (PNG, JPG, JPEG, SVG only)
- Try a different image

### **Image Not Visible in Preview?**
- Check if image is behind text (use "Bring to Front")
- Check opacity (should be > 0%)
- Check position (might be outside viewBox)

### **Export Not Working?**
- Check browser console for errors
- Try refreshing the page
- Try exporting as different format (SVG vs PNG)

### **PNG Export is Blurry?**
- PNG is exported at 300 DPI (high quality)
- If still blurry, try SVG export instead
- SVG is vector format (infinite resolution)

---

## 📚 Quick Examples

### **Example 1: Two Photos Side by Side**
```
Photo 1:
- X: 500, Y: 900
- Width: 350, Height: 350

Photo 2:
- X: 1600, Y: 900
- Width: 350, Height: 350
```

### **Example 2: Background Image**
```
Background:
- X: 0, Y: 0
- Width: 2996.9, Height: 1685.75
- Opacity: 30%
- Layer: Send to Back
```

### **Example 3: Logo in Corner**
```
Logo:
- X: 2700, Y: 50
- Width: 200, Height: 200
- Opacity: 100%
- Layer: Bring to Front
```

---

## 🎉 Summary

### **Upload:**
Drag & drop or click to browse

### **Position:**
X, Y, Width, Height, Rotation, Opacity

### **Layers:**
To Front, Up, Down, To Back

### **Export:**
SVG (vector) or PNG (300 DPI)

**That's it! Start creating amazing wedding stickers with custom images!** 🎨✨

