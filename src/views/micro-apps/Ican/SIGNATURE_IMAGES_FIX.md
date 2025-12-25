# Signature Images Not Working - Fix Guide

## 🔍 Problem
The signature images (`signature1.png` and `signature2.png`) are not displaying in the Invoice and Receipt pages.

## ✅ Solution Applied

### What Was Fixed

**InvoicePage.vue:**
- ✅ Moved signature image refs **inside** the `setup()` function
- ✅ Changed from empty strings (`''`) to actual paths (`'/images/signature1.png'`)
- ✅ Removed duplicate declarations outside the component

**ReceiptPage.vue:**
- ✅ Already correctly configured (signatures are inside `setup()` function)

### File Locations Verified

Your signature images are located at:
```
public/
├── images/
│   ├── signature1.png ✅ EXISTS
│   ├── signature2.png ✅ EXISTS
│   ├── ican-logo.png ✅ EXISTS
│   └── ican-web-logo.png ✅ EXISTS
```

---

## 🛠️ Troubleshooting Steps

If signatures still don't show after the fix, try these steps:

### Step 1: Clear Browser Cache

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page (`Ctrl + F5`)

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"
4. Refresh (`Ctrl + F5`)

### Step 2: Verify Image Files

1. Navigate to `public/images/` folder
2. Check that `signature1.png` and `signature2.png` exist
3. Try opening them directly to ensure they're valid images
4. Check file permissions (should be readable)

### Step 3: Check Image Paths in Browser

1. Open the Invoice or Receipt page
2. Right-click → "Inspect" (F12)
3. Go to "Network" tab
4. Refresh the page
5. Look for requests to `/images/signature1.png` and `/images/signature2.png`
6. Check if they return:
   - ✅ **200 OK** - Image loaded successfully
   - ❌ **404 Not Found** - Path is wrong
   - ❌ **403 Forbidden** - Permission issue

### Step 4: Test Image URLs Directly

Open these URLs in your browser:
```
http://localhost:5173/images/signature1.png
http://localhost:5173/images/signature2.png
```

Replace `localhost:5173` with your actual dev server address.

If you see a 404 error, the path is incorrect.

### Step 5: Check Console for Errors

1. Open DevTools (`F12`)
2. Go to "Console" tab
3. Look for errors like:
   ```
   Failed to load resource: net::ERR_FILE_NOT_FOUND
   GET http://localhost:5173/images/signature1.png 404 (Not Found)
   ```

---

## 📝 How to Replace Signature Images

### Option 1: Replace Existing Files

1. Navigate to `public/images/` folder
2. Replace `signature1.png` with your signature image
3. Replace `signature2.png` with your signature image
4. **Important:** Keep the same filenames or update the code

### Option 2: Use Different Filenames

If you want to use different filenames:

**InvoicePage.vue** (around line 805):
```javascript
// Change these paths to your image filenames
const signatureImage1 = ref('/images/your-signature-1.png');
const signatureImage2 = ref('/images/your-signature-2.png');
```

**ReceiptPage.vue** (around line 452):
```javascript
// Change these paths to your image filenames
const signatureImage1 = ref('/images/your-signature-1.png');
const signatureImage2 = ref('/images/your-signature-2.png');
```

### Option 3: Use External URLs

You can also use external image URLs:

```javascript
const signatureImage1 = ref('https://example.com/path/to/signature1.png');
const signatureImage2 = ref('https://example.com/path/to/signature2.png');
```

---

## 🎨 Image Requirements

### Recommended Specifications

**File Format:**
- ✅ PNG (with transparency)
- ✅ JPEG/JPG
- ❌ Avoid: GIF, BMP, WebP (may have compatibility issues)

**Image Size:**
- Width: 200-400 pixels
- Height: 80-150 pixels
- File size: < 500 KB for faster loading

**Background:**
- Transparent background (PNG) works best
- White background is acceptable
- Avoid colored backgrounds

**Image Quality:**
- High resolution for PDF exports
- Clear and legible
- Black or dark blue ink recommended

### Sample Image Dimensions

```
Invoice Signatures:
- Signature 1: max-width: 80px, height: auto
- Signature 2: max-width: 100px, height: auto

Receipt Signatures:
- Signature 1: max-width: 120px, height: auto
- Signature 2: max-width: 120px, height: auto
```

---

## 🔧 Advanced Fixes

### Fix 1: Add Error Handling

If images fail to load, show a fallback:

**InvoicePage.vue** (in template, around line 265):
```vue
<!-- Signature 1 with error handling -->
<div v-if="signatureImage1">
  <img 
    :src="signatureImage1" 
    alt="Signature 1" 
    class="h-7 w-auto object-contain max-w-[100px]"
    @error="handleImageError('signature1')"
  />
</div>
```

**Add handler in setup():**
```javascript
const handleImageError = (imageName) => {
  console.error(`Failed to load ${imageName} image`);
  if (imageName === 'signature1') {
    signatureImage1.value = ''; // Hide broken image
  } else if (imageName === 'signature2') {
    signatureImage2.value = ''; // Hide broken image
  }
};
```

### Fix 2: Lazy Load Images

For better performance, use lazy loading:

```vue
<img 
  :src="signatureImage1" 
  alt="Signature 1"
  loading="lazy"
  class="h-7 w-auto object-contain max-w-[100px]"
/>
```

### Fix 3: Preload Images

Add to `public/index.html` in `<head>`:

```html
<link rel="preload" href="/images/signature1.png" as="image">
<link rel="preload" href="/images/signature2.png" as="image">
```

---

## 🧪 Testing Checklist

- [ ] Images exist in `public/images/` folder
- [ ] Browser cache cleared (`Ctrl + Shift + Delete`)
- [ ] Page refreshed with hard reload (`Ctrl + F5`)
- [ ] Network tab shows 200 OK for signature images
- [ ] No console errors related to images
- [ ] Images display correctly in Invoice page
- [ ] Images display correctly in Receipt page
- [ ] Images export correctly in PDF
- [ ] Images export correctly in JPEG

---

## 📊 Current Configuration

### InvoicePage.vue (Line ~805)

```javascript
// Logo and Signature Images
const logoDataUrl = ref('/images/ican-logo.png');
const signatureImage1 = ref('/images/signature1.png'); // ✅ FIXED
const signatureImage2 = ref('/images/signature2.png'); // ✅ FIXED
```

### ReceiptPage.vue (Line ~452)

```javascript
// Logo and Signature Images
const logoDataUrl = ref('/images/ican-logo.png');
const signatureImage1 = ref('/images/signature1.png'); // ✅ Already correct
const signatureImage2 = ref('/images/signature2.png'); // ✅ Already correct
```

### Template Usage (Both Pages)

```vue
<!-- Signature 1 -->
<div v-if="signatureImage1">
  <img :src="signatureImage1" alt="Signature 1" class="h-7 w-auto object-contain" />
</div>

<!-- Signature 2 -->
<div v-if="signatureImage2">
  <img :src="signatureImage2" alt="Signature 2" class="h-7 w-auto object-contain" />
</div>
```

---

## 🚀 Quick Test

Run this in your browser console (F12 → Console) while on the Invoice/Receipt page:

```javascript
// Test if signature refs are accessible
console.log('Signature 1:', document.querySelector('img[alt="Signature 1"]'));
console.log('Signature 2:', document.querySelector('img[alt="Signature 2"]'));

// Test if images are loading
fetch('/images/signature1.png')
  .then(res => console.log('Signature 1 Status:', res.status, res.ok ? '✅' : '❌'))
  .catch(err => console.error('Signature 1 Error:', err));

fetch('/images/signature2.png')
  .then(res => console.log('Signature 2 Status:', res.status, res.ok ? '✅' : '❌'))
  .catch(err => console.error('Signature 2 Error:', err));
```

Expected output:
```
Signature 1: <img src="/images/signature1.png" alt="Signature 1" ...>
Signature 2: <img src="/images/signature2.png" alt="Signature 2" ...>
Signature 1 Status: 200 ✅
Signature 2 Status: 200 ✅
```

---

## ❓ Still Not Working?

### Check These Common Issues

**Issue 1: Wrong Image Format**
- Some image viewers show PNG as valid but browser can't render it
- Try opening in browser directly
- Re-save as PNG using proper image editor

**Issue 2: File Permissions**
- Windows: Right-click → Properties → Security → Check "Read" permission
- Ensure file is not locked or corrupted

**Issue 3: Vite Server Not Serving Public Files**
- Restart dev server: `npm run dev`
- Check `vite.config.js` has `publicDir: 'public'`

**Issue 4: Build vs Dev Environment**
- Works in dev but not in production build?
- Run `npm run build` and test the built version
- Check if images are copied to `dist/images/`

**Issue 5: Path Casing**
- Windows is case-insensitive but Linux/Mac are not
- Ensure exact case: `signature1.png` not `Signature1.PNG`

---

## 📞 Support

If signatures still don't work after trying all steps:

1. **Take a screenshot** of the browser console (F12)
2. **Check Network tab** for 404 errors
3. **Verify files exist** in `public/images/`
4. **Try a different browser** (Chrome, Firefox, Edge)
5. **Restart the dev server**: `npm run dev`

---

## ✅ Summary of Changes Made

| File | Line | Change | Status |
|------|------|--------|--------|
| InvoicePage.vue | ~679-682 | Removed duplicate signature refs outside component | ✅ Fixed |
| InvoicePage.vue | ~805-806 | Updated signature paths from `''` to `'/images/signature1.png'` | ✅ Fixed |
| ReceiptPage.vue | ~452-453 | Already correct (no changes needed) | ✅ Already OK |

---

**Last Updated:** October 17, 2025  
**Status:** ✅ Fixes Applied - Ready to Test  
**Version:** 1.0.0
