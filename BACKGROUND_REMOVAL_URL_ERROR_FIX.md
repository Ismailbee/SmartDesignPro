# Background Removal - "Invalid base URL" Error Fix

## 🐛 Error Encountered

**Error Message:**
```
Background removal failed
Failed to construct 'URL': Invalid base URL
Using original image instead.
```

**What This Means:**
The `@imgly/background-removal` library is trying to load ONNX model files from a URL, but the URL configuration is invalid or the path doesn't exist.

---

## ✅ Fix Applied

### **Updated Configuration**

Modified `src/composables/useBackgroundRemoval.ts` to **remove the custom `publicPath`** and let the library use its **default CDN**:

**Before (Caused Error):**
```typescript
const config = {
  publicPath: '/models/', // Local path - doesn't exist
  model: 'medium',
  // ...
}
```

**After (Fixed):**
```typescript
const config = {
  // No publicPath specified - uses default CDN
  // Default: https://staticimgly.com/@imgly/background-removal-data/...
  debug: false,
  model: 'medium',
  // ...
}
```

---

## 🚀 How to Test the Fix

### **Step 1: Refresh the Browser**

The code has been updated. Simply **hard refresh** your browser:

- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

### **Step 2: Test Background Removal**

1. Navigate to: `http://localhost:8100/home`
2. Go to: **Auto Design** → **Sticker** → **Wedding**
3. ✅ Check: "Automatically remove background from uploaded images"
4. Upload a test image
5. **Watch the browser console** (F12) for detailed logs

### **Step 3: Check Console Logs**

You should see:

**✅ Success:**
```
🎨 Starting background removal...
📊 Quality: medium, Format: image/png, Max: 2048px
🔄 Processing image...
📋 Background removal config: { model: 'medium', outputFormat: 'image/png', quality: 0.9 }
⏳ download: 1/1 (20%)
⏳ inference: 50/100 (55%)
⏳ inference: 100/100 (90%)
✅ Background removed successfully in 3245ms
📐 Output dimensions: 2048×1365
```

**❌ If Still Failing:**
```
❌ Background removal failed: [error details]
Error name: [error type]
Error message: [specific message]
💡 [Helpful hint about the error]
```

---

## 🔍 Understanding the Default CDN

### **Where Models are Loaded From**

When you don't specify `publicPath`, the library uses:

```
https://staticimgly.com/@imgly/background-removal-data/1.7.0/models/
```

**Model Files:**
- `small.onnx` (~5MB) - Fast, lower quality
- `medium.onnx` (~10MB) - Balanced (default)
- `large.onnx` (~20MB) - Slow, highest quality

**First Load:**
- Models are downloaded from CDN
- Cached in browser memory
- Subsequent loads are instant

**Network Requirements:**
- ✅ Internet connection required for first use
- ✅ Models cached after first download
- ✅ Works offline after initial load

---

## 🐛 If Error Persists

### **Issue 1: Network/Firewall Blocking CDN**

**Symptoms:**
```
Failed to fetch
Network error
CORS error
```

**Solutions:**

**A. Check Internet Connection**
```bash
# Test if CDN is accessible
curl https://staticimgly.com/@imgly/background-removal-data/1.7.0/models/medium.onnx
```

**B. Check Firewall/Proxy**
- Corporate firewall might block `staticimgly.com`
- Try on different network (mobile hotspot)
- Contact IT to whitelist the domain

**C. Use Alternative CDN**

Update `useBackgroundRemoval.ts`:
```typescript
const config = {
  publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.7.0/models/',
  // ... rest of config
}
```

### **Issue 2: CORS Policy Error**

**Symptoms:**
```
Access to fetch at '...' from origin 'http://localhost:8100' has been blocked by CORS policy
```

**Solution:**

This shouldn't happen with the default CDN (it has CORS enabled), but if it does:

**A. Verify Vite Config**

Check `vite.config.ts` has:
```typescript
server: {
  fs: {
    strict: false
  }
}
```

**B. Use Proxy (if needed)**

Add to `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/models': {
      target: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/models/, '/models')
    }
  }
}
```

Then update config:
```typescript
const config = {
  publicPath: '/models/',
  // ...
}
```

### **Issue 3: Browser Compatibility**

**Symptoms:**
```
WebAssembly is not supported
ONNX Runtime initialization failed
```

**Solution:**

**A. Check Browser Version**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**B. Enable WebAssembly**
- Usually enabled by default
- Check browser settings
- Try different browser

**C. Check Console for Specific Error**
```javascript
// Test WebAssembly support
console.log('WebAssembly supported:', typeof WebAssembly !== 'undefined')
```

### **Issue 4: Memory Issues (Mobile)**

**Symptoms:**
```
Out of memory
Page crashed
Browser tab freezes
```

**Solution:**

**A. Reduce Image Size**

Update `useBackgroundRemoval.ts`:
```typescript
maxDimensions: 1024, // Instead of 2048
```

**B. Use Fast Quality**

Update `StickerTemplatePanel.vue`:
```typescript
quality: 'fast', // Instead of 'medium'
```

**C. Close Other Tabs**
- Background removal uses ~200-400MB RAM
- Close unnecessary browser tabs
- Restart browser if needed

---

## 📊 Debugging Checklist

When testing, verify:

- [ ] Browser console shows config log: `📋 Background removal config: ...`
- [ ] No "Invalid base URL" errors
- [ ] Network tab shows model downloads (first time only)
- [ ] Progress updates from 0% to 100%
- [ ] Success message: `✅ Background removed successfully`
- [ ] Crop modal opens with processed image
- [ ] Background is transparent (checkered pattern visible)

---

## 🎯 Alternative: Download Models Locally

If CDN access is consistently problematic, you can host models locally:

### **Step 1: Download Models**

```bash
# Create models directory
mkdir -p public/models

# Download models (choose one or all)
curl -o public/models/small.onnx https://staticimgly.com/@imgly/background-removal-data/1.7.0/models/small.onnx
curl -o public/models/medium.onnx https://staticimgly.com/@imgly/background-removal-data/1.7.0/models/medium.onnx
curl -o public/models/large.onnx https://staticimgly.com/@imgly/background-removal-data/1.7.0/models/large.onnx
```

### **Step 2: Update Configuration**

Update `useBackgroundRemoval.ts`:
```typescript
const config = {
  publicPath: window.location.origin + '/models/',
  model: quality === 'fast' ? 'small' : quality === 'high' ? 'large' : 'medium',
  // ... rest of config
}
```

### **Step 3: Verify Files**

Check that files exist:
```
public/
  models/
    small.onnx   (~5MB)
    medium.onnx  (~10MB)
    large.onnx   (~20MB)
```

### **Benefits:**
- ✅ No internet required after initial setup
- ✅ Faster loading (no CDN latency)
- ✅ Works behind firewalls
- ✅ Full offline support

### **Drawbacks:**
- ❌ Larger repository size (~25MB total)
- ❌ Slower initial page load
- ❌ Need to update models manually

---

## 🔍 Advanced Debugging

### **Enable Debug Mode**

Update `useBackgroundRemoval.ts`:
```typescript
const config = {
  debug: true, // Enable detailed logging
  // ...
}
```

This will show:
- Model loading progress
- ONNX Runtime initialization
- Inference steps
- Memory usage
- Performance metrics

### **Check Network Tab**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR** or **Fetch**
4. Upload an image
5. Look for requests to:
   - `staticimgly.com` (model downloads)
   - `.onnx` files
   - `.wasm` files

**Expected:**
- First load: Multiple requests for model files
- Subsequent loads: No requests (cached)

### **Check Memory Usage**

1. Open DevTools (F12)
2. Go to **Performance** tab
3. Start recording
4. Upload image and process
5. Stop recording
6. Check memory graph

**Expected:**
- Memory spike during processing (~200-400MB)
- Memory released after completion
- No memory leaks

---

## ✅ Summary

### **What Was Fixed:**

1. ✅ Removed custom `publicPath` configuration
2. ✅ Let library use default CDN (`staticimgly.com`)
3. ✅ Added detailed error logging
4. ✅ Added helpful error hints

### **What to Do:**

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Test background removal** with a sample image
3. **Check console** for detailed logs
4. **Report any new errors** with console output

### **Expected Result:**

- ✅ No "Invalid base URL" errors
- ✅ Models load from CDN
- ✅ Background removal works
- ✅ Progress indicator shows 0-100%
- ✅ Transparent background in output

---

## 🆘 Still Having Issues?

If the error persists after trying these fixes:

1. **Share the full console output** (F12 → Console)
2. **Share the Network tab** (F12 → Network → filter by "onnx")
3. **Try a different browser** (Chrome recommended)
4. **Try a different network** (mobile hotspot)
5. **Check if CDN is accessible** from your location

---

**Last Updated:** 2025-10-23  
**Status:** Fix Applied - Default CDN Configuration  
**Next Step:** Hard refresh browser and test

