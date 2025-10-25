# Background Removal Feature - Setup & Usage Guide

## 📋 Overview

This document provides comprehensive instructions for setting up and using the automatic background removal feature for the wedding sticker template in the SmartDesignPro application.

**Feature Highlights:**
- ✅ **Client-side processing** - No backend server required
- ✅ **AI-powered** - Uses ONNX Runtime with WebGPU acceleration
- ✅ **Mobile optimized** - Works on Ionic WebView
- ✅ **User-friendly** - Simple toggle to enable/disable
- ✅ **Fallback support** - Uses original image if removal fails
- ✅ **Progress tracking** - Real-time progress indicators

---

## 🚀 Installation

### Step 1: Install Dependencies

Run the following command to install the required package:

```bash
npm install @imgly/background-removal@^1.4.5
```

Or if you're using yarn:

```bash
yarn add @imgly/background-removal@^1.4.5
```

### Step 2: Download ONNX Models (Optional)

The background removal library uses ONNX models for AI processing. By default, these models are loaded from a CDN. For better performance and offline support, you can download them locally:

1. Create a `public/models/` directory:
   ```bash
   mkdir -p public/models
   ```

2. Download the models from the [@imgly/background-removal repository](https://github.com/imgly/background-removal-js/tree/main/public/models)

3. Place the following files in `public/models/`:
   - `small.onnx` (fast, lower quality)
   - `medium.onnx` (balanced, recommended)
   - `large.onnx` (slow, highest quality)

**Note:** If you skip this step, models will be loaded from CDN automatically.

### Step 3: Verify Installation

Start the development server:

```bash
npm run dev
```

Navigate to the wedding sticker section and verify the "Automatically remove background" checkbox appears.

---

## 🎯 Usage

### For End Users

1. **Navigate to Wedding Sticker:**
   - Go to Home → Auto Design → Sticker → Wedding

2. **Enable Background Removal:**
   - Check the box: "Automatically remove background from uploaded images"

3. **Upload an Image:**
   - Click the drag & drop zone or drag an image
   - Wait for background removal to complete (progress shown)
   - Crop the image as needed
   - Image is added to the sticker with transparent background

4. **Disable if Needed:**
   - Uncheck the box to upload images without background removal

### Processing Time

Typical processing times on different devices:

| Device Type | Image Size | Processing Time |
|-------------|-----------|-----------------|
| Desktop (Chrome) | 1024×1024 | 2-4 seconds |
| Desktop (Chrome) | 2048×2048 | 4-8 seconds |
| Mobile (iOS Safari) | 1024×1024 | 5-10 seconds |
| Mobile (Android Chrome) | 1024×1024 | 6-12 seconds |

**Tip:** For faster processing on mobile, use smaller images (< 1024×1024).

---

## 🔧 Technical Details

### Architecture

The background removal feature consists of three main components:

1. **`useBackgroundRemoval.ts`** - Core composable with background removal logic
2. **`StickerTemplatePanel.vue`** - UI integration with toggle and progress indicators
3. **`@imgly/background-removal`** - Third-party library for AI processing

### Processing Flow

```
User uploads image
    ↓
Check if auto-removal enabled
    ↓
Resize image if > 2048px (mobile optimization)
    ↓
Load ONNX model (cached after first load)
    ↓
Process image with AI (20-90% progress)
    ↓
Convert to PNG with transparency
    ↓
Pass to crop modal
    ↓
Add to wedding sticker
```

### Configuration Options

The background removal can be configured in `StickerTemplatePanel.vue`:

```typescript
const result = await removeBackground(file, {
  quality: 'medium',        // 'fast' | 'medium' | 'high'
  outputFormat: 'image/png', // 'image/png' | 'image/webp'
  maxDimensions: 2048,       // Max width/height for processing
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`)
  }
})
```

**Quality Settings:**
- `fast` - Uses small model (~5MB), fastest processing, lower accuracy
- `medium` - Uses medium model (~10MB), balanced (recommended)
- `high` - Uses large model (~20MB), slowest processing, highest accuracy

### Browser Compatibility

The feature requires the following browser capabilities:

- ✅ WebAssembly support
- ✅ Canvas API
- ✅ Blob API
- ✅ FileReader API

**Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

**Unsupported Browsers:**
- Internet Explorer (all versions)
- Opera Mini
- UC Browser (older versions)

The feature automatically detects browser support and shows an error if unsupported.

---

## 🐛 Troubleshooting

### Issue: "Background removal library not available"

**Cause:** The `@imgly/background-removal` package is not installed.

**Solution:**
```bash
npm install @imgly/background-removal@^1.4.5
```

### Issue: "Background removal is not supported in this browser"

**Cause:** Browser doesn't support required features (WebAssembly, Canvas, etc.)

**Solution:**
- Update browser to latest version
- Use a modern browser (Chrome, Firefox, Safari)
- Disable the feature and use original images

### Issue: Processing takes too long (>30 seconds)

**Cause:** Image is too large or device is slow.

**Solution:**
- Reduce image size before uploading (< 1024×1024 recommended)
- Use 'fast' quality setting instead of 'medium'
- Disable background removal for large images

### Issue: Background removal fails with error

**Cause:** Various reasons (network issues, corrupted image, memory issues)

**Solution:**
- Check browser console for detailed error
- Try a different image
- Reduce image size
- Disable background removal and use original image

### Issue: Models fail to load from CDN

**Cause:** Network issues or CDN unavailable

**Solution:**
- Download models locally to `public/models/` (see Installation Step 2)
- Check internet connection
- Try again later

---

## 🎨 Customization

### Change Default Quality

Edit `StickerTemplatePanel.vue`:

```typescript
const result = await removeBackground(file, {
  quality: 'fast', // Change to 'fast' for faster processing
  // ... other options
})
```

### Change Max Dimensions

Edit `StickerTemplatePanel.vue`:

```typescript
const result = await removeBackground(file, {
  maxDimensions: 1024, // Reduce to 1024 for mobile optimization
  // ... other options
})
```

### Disable Auto-Enable

By default, the checkbox is unchecked. To enable by default:

```typescript
const autoRemoveBackground = ref(true) // Change from false to true
```

### Custom Progress Indicator

Modify the progress callback in `StickerTemplatePanel.vue`:

```typescript
onProgress: (progress) => {
  console.log(`Custom progress: ${progress}%`)
  // Add custom logic here
}
```

---

## 📊 Performance Optimization

### For Mobile Devices

1. **Reduce max dimensions:**
   ```typescript
   maxDimensions: 1024 // Instead of 2048
   ```

2. **Use fast quality:**
   ```typescript
   quality: 'fast' // Instead of 'medium'
   ```

3. **Compress images before upload:**
   - Use image compression tools
   - Reduce resolution to 1024×1024 or less

### For Desktop

1. **Use medium or high quality:**
   ```typescript
   quality: 'medium' // or 'high'
   ```

2. **Allow larger dimensions:**
   ```typescript
   maxDimensions: 2048 // or 4096
   ```

### General Tips

- **Cache models locally** - Download to `public/models/` for faster loading
- **Lazy load library** - The library is dynamically imported only when needed
- **Show progress** - Keep users informed with progress indicators
- **Provide fallback** - Always allow users to proceed with original image

---

## 🔒 Security & Privacy

**Data Privacy:**
- ✅ All processing happens **client-side** in the browser
- ✅ No images are sent to external servers
- ✅ No data is stored or transmitted
- ✅ ONNX models are loaded from CDN or local files

**Security:**
- ✅ No backend API required
- ✅ No authentication needed
- ✅ No sensitive data exposure
- ✅ Works offline (if models are cached locally)

---

## 📚 Additional Resources

- **Library Documentation:** https://github.com/imgly/background-removal-js
- **ONNX Runtime:** https://onnxruntime.ai/
- **WebGPU Support:** https://caniuse.com/webgpu
- **Performance Blog:** https://img.ly/blog/browser-background-removal-using-onnx-runtime-webgpu/

---

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check browser console for detailed error messages
2. Verify browser compatibility
3. Try with a different image
4. Disable background removal and use original images
5. Contact development team with error details

---

**Last Updated:** 2025-10-23  
**Version:** 1.0.0  
**Author:** SmartDesignPro Development Team

