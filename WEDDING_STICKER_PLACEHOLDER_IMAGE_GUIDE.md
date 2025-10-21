# 📍 Wedding Sticker - Placeholder Image Positioning System

## ✅ Implementation Complete

A placeholder image system has been added to the wedding sticker template that allows you to manually define the exact position and size where all uploaded images should appear!

---

## 🎯 What Was Implemented

### **1. Placeholder Image Element in SVG Template** ✅
- Added `<image id="placeholder-image">` element to the SVG template
- Located at: `public/templates/wedding-sticker/template`
- Positioned after wave layers, before text elements
- Invisible by default (opacity="0", empty href)

### **2. Automatic Position Detection** ✅
- Image manager reads placeholder's X, Y, width, and height attributes
- All uploaded images automatically use these values as defaults
- Works for both drag-and-drop and file browser uploads

### **3. Manual Positioning Control** ✅
- You can manually edit the placeholder's attributes in the SVG file
- Changes apply immediately to all future uploads
- Users can still adjust positions using the UI controls after upload

---

## 📁 Files Modified

### **1. `public/templates/wedding-sticker/template`**
**Added placeholder image element:**
```xml
<!-- Placeholder image - Adjust x, y, width, height to position where uploaded images should appear -->
<image id="placeholder-image" x="1200" y="800" width="400" height="400" opacity="0" href=""/>
```

**Current default position:**
- X: 1200 (horizontal position)
- Y: 800 (vertical position)
- Width: 400 pixels
- Height: 400 pixels
- Opacity: 0 (invisible)
- Href: "" (no image source)

### **2. `src/composables/useSVGImageManager.ts`**
**Added new function:**
```typescript
function getPlaceholderAttributes(svgElement?: SVGSVGElement | null): {
  x: number
  y: number
  width: number
  height: number
}
```

**Updated function:**
```typescript
async function addImage(file: File, svgElement?: SVGSVGElement | null): Promise<SVGImage | null>
```

**Updated function:**
```typescript
async function handleDrop(event: DragEvent, svgElement?: SVGSVGElement | null)
```

### **3. `src/components/auto-design/StickerTemplatePanel.vue`**
**Added new function:**
```typescript
async function handleImageDrop(event: DragEvent)
```

**Updated function:**
```typescript
async function handleImageFileSelect(event: Event)
```

---

## 🎨 How It Works

### **Step 1: Placeholder in Template**
The SVG template contains a placeholder image element:
```xml
<image id="placeholder-image" x="1200" y="800" width="400" height="400" opacity="0" href=""/>
```

### **Step 2: Position Detection**
When a user uploads an image:
1. The image manager finds the `#placeholder-image` element
2. Reads its `x`, `y`, `width`, and `height` attributes
3. Uses these values as the default position for the uploaded image

### **Step 3: Image Positioning**
The uploaded image is positioned at:
- **X Position:** Same as placeholder's `x` attribute
- **Y Position:** Same as placeholder's `y` attribute
- **Width:** Scaled to fit within placeholder's `width` (maintains aspect ratio)
- **Height:** Scaled to fit within placeholder's `height` (maintains aspect ratio)

### **Step 4: User Adjustments**
After upload, users can still:
- Adjust X and Y position using the controls
- Resize width and height
- Rotate the image
- Change opacity
- Manage layer order

---

## 🔧 How to Customize Placeholder Position

### **Method 1: Edit SVG File Directly**

1. Open `public/templates/wedding-sticker/template` in a text editor
2. Find the line with `id="placeholder-image"`
3. Modify the attributes:

```xml
<!-- Example: Position image in center -->
<image id="placeholder-image" x="1298" y="800" width="400" height="400" opacity="0" href=""/>

<!-- Example: Position image on left side -->
<image id="placeholder-image" x="500" y="900" width="350" height="350" opacity="0" href=""/>

<!-- Example: Position image on right side -->
<image id="placeholder-image" x="2100" y="900" width="350" height="350" opacity="0" href=""/>

<!-- Example: Large background image -->
<image id="placeholder-image" x="0" y="0" width="2996.9" height="1685.75" opacity="0" href=""/>
```

4. Save the file
5. Refresh the browser
6. Upload a new image to test the new position

### **Method 2: Use SVG Editor (Illustrator, Inkscape)**

1. Open `public/templates/wedding-sticker/template` in SVG editor
2. Add a rectangle or image at the desired position
3. Note the X, Y, width, and height values
4. Update the placeholder element with these values
5. Save and test

---

## 📊 Position Reference

### **SVG Canvas Dimensions:**
- **ViewBox:** 0 0 2996.9 1685.75
- **Width:** 2996.9 pixels
- **Height:** 1685.75 pixels
- **Center X:** 1498.45
- **Center Y:** 842.875

### **Text Element Positions (for reference):**
| Element | Y Position | Purpose |
|---------|-----------|---------|
| Blessing | 372.07 | "Alhamdulillahi" / "Congratulations" |
| Occasion | 443.52 | "ON YOUR" |
| Event Type | 621.11 | "WEDDING" / "GRADUATION" |
| Ceremony | 750.44 | "CEREMONY" |
| Name 1 | 1100 | First name |
| Name 2 | 1280 | Second name |
| Date | 1410 | Date text |
| Courtesy | 1600 | Courtesy text |

### **Suggested Placeholder Positions:**

#### **Position 1: Center Below Event Type**
```xml
<image id="placeholder-image" x="1298" y="800" width="400" height="400" opacity="0" href=""/>
```
- Centered horizontally
- Below "CEREMONY" text
- Above names

#### **Position 2: Left Side**
```xml
<image id="placeholder-image" x="500" y="900" width="350" height="350" opacity="0" href=""/>
```
- Left side of canvas
- Aligned with names vertically

#### **Position 3: Right Side**
```xml
<image id="placeholder-image" x="2100" y="900" width="350" height="350" opacity="0" href=""/>
```
- Right side of canvas
- Aligned with names vertically

#### **Position 4: Small Corner Logo**
```xml
<image id="placeholder-image" x="2700" y="50" width="200" height="200" opacity="0" href=""/>
```
- Top-right corner
- Small size for logo/watermark

#### **Position 5: Full Background**
```xml
<image id="placeholder-image" x="0" y="0" width="2996.9" height="1685.75" opacity="0" href=""/>
```
- Covers entire canvas
- For background images

---

## 🎯 Example Use Cases

### **Use Case 1: Wedding Photo in Center**
**Goal:** Position couple's photo in the center, below the event type

**Placeholder Settings:**
```xml
<image id="placeholder-image" x="1298" y="850" width="400" height="400" opacity="0" href=""/>
```

**Calculation:**
- Center X = 1498.45
- Image width = 400
- X position = 1498.45 - (400 / 2) = 1298.45 ≈ 1298

**Result:**
- All uploaded photos appear centered at Y=850
- 400x400 pixel size (scaled to fit if larger)

### **Use Case 2: Graduation Photo on Left**
**Goal:** Position graduate's photo on the left side

**Placeholder Settings:**
```xml
<image id="placeholder-image" x="500" y="900" width="350" height="350" opacity="0" href=""/>
```

**Result:**
- All uploaded photos appear on left at X=500, Y=900
- 350x350 pixel size

### **Use Case 3: Company Logo in Corner**
**Goal:** Position company logo in top-right corner

**Placeholder Settings:**
```xml
<image id="placeholder-image" x="2700" y="50" width="200" height="200" opacity="0" href=""/>
```

**Result:**
- All uploaded logos appear in top-right corner
- 200x200 pixel size

---

## ✅ Features

### **Automatic Positioning:**
- ✅ All uploaded images use placeholder position
- ✅ Works for drag-and-drop uploads
- ✅ Works for file browser uploads
- ✅ Maintains aspect ratio when scaling

### **Manual Control:**
- ✅ Edit placeholder attributes in SVG file
- ✅ Changes apply to all future uploads
- ✅ Users can still adjust after upload

### **Flexibility:**
- ✅ One placeholder for consistent positioning
- ✅ Users can override position using UI controls
- ✅ Supports any position within SVG canvas

---

## 🔍 Console Logging

When an image is uploaded, you'll see this in the browser console:
```
📍 Placeholder position found: { x: 1200, y: 800, width: 400, height: 400 }
```

This confirms the placeholder attributes were read successfully.

---

## ⚠️ Important Notes

### **1. Placeholder is Invisible**
- The placeholder has `opacity="0"` and empty `href=""`
- It won't appear in the preview or exported files
- It only serves as a position reference

### **2. Aspect Ratio is Maintained**
- Uploaded images are scaled to fit within placeholder dimensions
- Aspect ratio is always preserved
- Images won't be stretched or distorted

### **3. Users Can Override**
- The placeholder sets the DEFAULT position
- Users can still adjust X, Y, width, height using the UI controls
- This provides both consistency and flexibility

### **4. Refresh Required**
- After editing the placeholder in the SVG file
- Refresh the browser to load the new position
- New uploads will use the updated position

---

## 🎉 Summary

### **What You Can Do:**
1. ✅ Edit the placeholder's `x`, `y`, `width`, `height` attributes in the SVG template
2. ✅ All uploaded images automatically use these values as defaults
3. ✅ Users can still adjust positions manually if needed
4. ✅ Ensures consistent image placement across all stickers

### **Current Default Position:**
- X: 1200
- Y: 800
- Width: 400
- Height: 400

### **To Change Position:**
1. Open `public/templates/wedding-sticker/template`
2. Find `<image id="placeholder-image" ...>`
3. Edit `x`, `y`, `width`, `height` attributes
4. Save file
5. Refresh browser
6. Upload image to test

**Perfect for ensuring all wedding stickers have consistent photo placement!** 📍✨🎯

