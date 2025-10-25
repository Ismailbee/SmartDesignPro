# ⚡ Image Crop Feature - Quick Test Guide

## 🚀 Quick Test (3 Minutes)

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Navigate to Wedding Sticker**
```
http://localhost:8100/home
→ Click "Auto Design" dropdown
→ Select "Sticker"
→ Wedding category should be selected
```

### **Step 3: Upload Image**
1. Scroll down to "Add Images to Sticker" section
2. Click the drag & drop zone (or drag an image file)
3. Select an image file (.jpg, .png, .jpeg, .webp)

### **Step 4: Crop Image**
1. Crop modal should open automatically
2. You should see:
   - ✅ Image with crop overlay
   - ✅ Aspect ratio buttons (Free, 1:1, 16:9, 4:3)
   - ✅ Zoom controls (+ / -)
   - ✅ Rotation controls (90° left/right)
   - ✅ Reset button
   - ✅ Image info (dimensions, file size)
   - ✅ Apply Crop and Cancel buttons

### **Step 5: Test Controls**

**Aspect Ratio:**
- Click "1:1" → Crop area should lock to square
- Click "16:9" → Crop area should change to widescreen
- Click "Free" → Crop area should be free-form

**Zoom:**
- Click "+" → Image should zoom in
- Click "-" → Image should zoom out

**Rotate:**
- Click "90°" left → Image should rotate counter-clockwise
- Click "90°" right → Image should rotate clockwise

**Reset:**
- Click "Reset" → Image should return to original state

### **Step 6: Apply Crop**
1. Adjust crop area to desired size
2. Click "Apply Crop" button
3. Modal should close
4. Cropped image should appear on wedding card preview

### **Step 7: Verify Position**
1. Open browser console (F12)
2. Look for log: `📍 Placeholder position found: { x: 1100, y: 2, width: 2500, height: 2500 }`
3. Look for log: `✅ Image added: user-image-1`
4. Cropped image should be at position (1100, 2)

---

## 📝 **Detailed Test Cases**

### **Test 1: Basic Upload & Crop** ✅

**Steps:**
1. Click drag & drop zone
2. Select image
3. Crop modal opens
4. Click "Apply Crop"

**Expected:**
- ✅ Modal opens with image
- ✅ Crop tools visible
- ✅ Clicking "Apply Crop" closes modal
- ✅ Image appears on wedding card

**Console Logs:**
```
📍 Placeholder position found: { x: 1100, y: 2, width: 2500, height: 2500 }
✅ Cropper initialized
🎨 Crop complete: { width: 2500, height: 2500 }
✅ Image added: user-image-1
```

---

### **Test 2: Aspect Ratio Lock** ✅

**Steps:**
1. Upload image
2. Click "1:1" button
3. Try to resize crop area

**Expected:**
- ✅ Crop area locks to square shape
- ✅ Resizing maintains 1:1 ratio

**Steps:**
1. Click "16:9" button
2. Try to resize crop area

**Expected:**
- ✅ Crop area changes to widescreen
- ✅ Resizing maintains 16:9 ratio

---

### **Test 3: Zoom Controls** ✅

**Steps:**
1. Upload image
2. Click "+" button 3 times
3. Click "-" button 2 times

**Expected:**
- ✅ Image zooms in smoothly
- ✅ Image zooms out smoothly
- ✅ Crop area remains visible

---

### **Test 4: Rotation** ✅

**Steps:**
1. Upload image
2. Click "90°" left button
3. Click "90°" right button twice

**Expected:**
- ✅ Image rotates -90° (counter-clockwise)
- ✅ Image rotates +180° (total +90° clockwise)
- ✅ Crop area adjusts to rotated image

---

### **Test 5: Reset Functionality** ✅

**Steps:**
1. Upload image
2. Zoom in, rotate, change aspect ratio
3. Click "Reset" button

**Expected:**
- ✅ Image returns to original state
- ✅ Zoom resets to default
- ✅ Rotation resets to 0°
- ✅ Aspect ratio resets to Free

---

### **Test 6: Cancel Operation** ✅

**Steps:**
1. Upload image
2. Adjust crop area
3. Click "Cancel" button

**Expected:**
- ✅ Modal closes
- ✅ No image added to wedding card
- ✅ No console logs for image addition

---

### **Test 7: Multiple Images** ✅

**Steps:**
1. Upload and crop first image
2. Upload and crop second image
3. Check wedding card preview

**Expected:**
- ✅ Both images appear on wedding card
- ✅ Images are layered correctly (behind text)
- ✅ Can select and edit each image independently

**Console Logs:**
```
✅ Image added: user-image-1
✅ Image added: user-image-2
```

---

### **Test 8: Large Image** ✅

**Steps:**
1. Upload a large image (e.g., 4000×3000px)
2. Crop to smaller area
3. Apply crop

**Expected:**
- ✅ Image loads without issues
- ✅ Cropping works smoothly
- ✅ Cropped image is high quality
- ✅ File size is reasonable

---

### **Test 9: Small Image** ✅

**Steps:**
1. Upload a small image (e.g., 500×500px)
2. Try to zoom in
3. Apply crop

**Expected:**
- ✅ Image loads correctly
- ✅ Zoom works (may show pixelation)
- ✅ Cropped image maintains quality

---

### **Test 10: Automatic Positioning** ✅

**Steps:**
1. Upload and crop image
2. Open browser DevTools
3. Inspect SVG element
4. Find `<image id="user-image-1">`

**Expected:**
```xml
<image 
  id="user-image-1" 
  x="1100" 
  y="2" 
  width="2500" 
  height="2500" 
  opacity="1" 
  xlink:href="data:image/png;base64,..."
/>
```

**Verify:**
- ✅ x="1100" (from placeholder)
- ✅ y="2" (from placeholder)
- ✅ width="2500" (from placeholder)
- ✅ height="2500" (from placeholder)
- ✅ xlink:href contains base64 data

---

## 🎯 **Success Checklist**

### **Upload:**
- [ ] Drag & drop zone clickable
- [ ] File picker opens
- [ ] Accepts .jpg, .png, .jpeg, .webp
- [ ] Rejects invalid file types
- [ ] Shows error for files > 5MB

### **Crop Modal:**
- [ ] Opens automatically after file selection
- [ ] Shows image with crop overlay
- [ ] Crop area is draggable
- [ ] Crop area is resizable
- [ ] All controls visible

### **Aspect Ratio:**
- [ ] "Free" button works
- [ ] "1:1" button locks to square
- [ ] "16:9" button locks to widescreen
- [ ] "4:3" button locks to standard
- [ ] Active button highlighted

### **Zoom:**
- [ ] "+" button zooms in
- [ ] "-" button zooms out
- [ ] Zoom is smooth
- [ ] Can zoom multiple times

### **Rotation:**
- [ ] "90° left" rotates counter-clockwise
- [ ] "90° right" rotates clockwise
- [ ] Can rotate multiple times
- [ ] Crop area adjusts to rotation

### **Reset:**
- [ ] "Reset" button visible
- [ ] Resets zoom
- [ ] Resets rotation
- [ ] Resets aspect ratio
- [ ] Resets crop area

### **Image Info:**
- [ ] Shows original dimensions
- [ ] Shows file size
- [ ] Updates correctly

### **Apply Crop:**
- [ ] "Apply Crop" button enabled
- [ ] Clicking closes modal
- [ ] Image appears on wedding card
- [ ] Image positioned at (1100, 2)
- [ ] Image size is 2500×2500

### **Cancel:**
- [ ] "Cancel" button visible
- [ ] Clicking closes modal
- [ ] No image added
- [ ] Object URL cleaned up

### **Console Logs:**
- [ ] "📍 Placeholder position found"
- [ ] "✅ Cropper initialized"
- [ ] "🎨 Crop complete"
- [ ] "✅ Image added"

---

## 🐛 **Troubleshooting**

### **Modal Doesn't Open:**
1. Check browser console for errors
2. Verify `cropperjs` is installed: `npm list cropperjs`
3. Check if file is valid image type
4. Try refreshing the page

### **Crop Tools Don't Work:**
1. Check if image loaded completely
2. Look for Cropper.js errors in console
3. Try clicking "Reset" button
4. Try closing and reopening modal

### **Image Not Positioned Correctly:**
1. Check SVG template has `#placeholder-image` element
2. Verify placeholder has x, y, width, height attributes
3. Check console for "Placeholder position found" log
4. Inspect SVG in DevTools to verify image element

### **Image Quality Poor:**
1. Check original image resolution
2. Verify crop quality setting (should be 0.95)
3. Try uploading higher resolution image
4. Check if image is being scaled down too much

### **Modal Styling Issues:**
1. Check if Cropper.js CSS is loaded
2. Verify Ionic styles are applied
3. Check browser console for CSS errors
4. Try different browser

---

## 💡 **Pro Tips**

1. **High-Quality Images:** Upload images at least 2500×2500px for best results
2. **Aspect Ratio:** Use "1:1" for square crops, "Free" for custom shapes
3. **Zoom Before Crop:** Zoom in to focus on specific area
4. **Rotate First:** Rotate image before adjusting crop area
5. **Reset Often:** Use "Reset" button if crop area gets messy
6. **Multiple Images:** Upload multiple images for layered effects
7. **Console Logs:** Keep DevTools open to see detailed logs

---

## 🎨 **Example Workflow**

### **Creating a Wedding Sticker:**

1. **Start:**
   - Navigate to Wedding Sticker page
   - Enter description: "Congratulations on your wedding (Sarah Ahmed) on 6th March, 2025 courtesy: the family"

2. **Upload Portrait:**
   - Click drag & drop zone
   - Select portrait photo
   - Crop modal opens

3. **Crop Portrait:**
   - Click "1:1" for square crop
   - Zoom in to focus on faces
   - Adjust crop area to center faces
   - Click "Apply Crop"

4. **Verify:**
   - Portrait appears on wedding card
   - Text overlays portrait correctly
   - Names, date, courtesy text all visible

5. **Download:**
   - Click "Download SVG" or "Download PNG"
   - Save final wedding sticker

---

## ✅ **Expected Results**

**After completing all tests, you should have:**
- ✅ Working image upload system
- ✅ Functional crop modal with all controls
- ✅ Images automatically positioned at (1100, 2)
- ✅ Images sized at 2500×2500
- ✅ Images layered behind text
- ✅ High-quality cropped images
- ✅ Smooth user experience

**Console should show:**
```
📍 Placeholder position found: { x: 1100, y: 2, width: 2500, height: 2500 }
✅ Cropper initialized
🎨 Crop complete: { width: 2500, height: 2500 }
✅ Image added: user-image-1 { x: 1100, y: 2, width: 2500, height: 2500 }
```

**SVG should contain:**
```xml
<image id="user-image-1" x="1100" y="2" width="2500" height="2500" opacity="1" xlink:href="data:image/png;base64,..."/>
```

---

## 🚀 **Ready to Test!**

Start the server and follow the steps above. The image crop feature should work seamlessly with automatic positioning from the SVG placeholder element!

**Happy Testing!** 🎨✨📸

