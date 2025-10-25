# MODNet Model Loading - Test Guide

## 🧪 Quick Test

The model loading has been fixed with a fallback mechanism. Here's how to test it:

---

## ✅ What Changed

### Before
- Single model URL from Hugging Face
- Failed if that URL was unreachable
- No fallback mechanism

### After
- **Primary:** jsDelivr CDN (more reliable)
- **Fallback 1:** Hugging Face CDN
- **Fallback 2:** Local path (if downloaded)
- **Automatic retry** if one URL fails

---

## 🚀 Test Now

### Step 1: Clear Browser Cache

```
Chrome: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Shift+Delete
```

Or use DevTools:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty cache and hard refresh"

### Step 2: Upload an Image

1. Go to: `http://localhost:8100/home`
2. Navigate to: **Auto Design** → **Sticker** → **Wedding**
3. Check: ✅ "Automatically remove background from uploaded images"
4. Upload a portrait image

### Step 3: Check Console

Open DevTools (F12) → Console and look for:

**Success:**
```
🔍 WebGPU available: true/false
📥 Primary model URL: https://cdn.jsdelivr.net/...
🔄 Attempting to create session with webgpu...
🔄 Trying to load model from: https://cdn.jsdelivr.net/...
✅ Successfully loaded model from: https://cdn.jsdelivr.net/...
✅ Session created successfully with webgpu
📋 Input names: ['input']
📋 Output names: ['output']
```

**If jsDelivr fails, it will try Hugging Face:**
```
⚠️  Failed to load from https://cdn.jsdelivr.net/...
🔄 Trying to load model from: https://huggingface.co/...
✅ Successfully loaded model from: https://huggingface.co/...
```

---

## 🔍 Troubleshooting

### Issue: Still Getting "Failed to create inference session"

**Check 1: Network Tab**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "model.onnx"
4. Check if any requests are made
5. Check response status (should be 200)

**Check 2: Console Errors**
1. Look for detailed error messages
2. Check if it's a CORS error
3. Check if it's a network timeout

**Check 3: Try Different Browser**
- Chrome (best WebGPU support)
- Firefox (good WASM support)
- Safari (WASM only)

### Issue: "magic word 00 61 73 6d" Error

This means the URL returned HTML instead of ONNX binary.

**Solutions:**
1. Check internet connection
2. Try different browser
3. Clear browser cache
4. Wait a few seconds and retry

### Issue: Very Slow First Load

**This is normal!** The model is downloading (~25MB).

**Solutions:**
1. Wait for download to complete (5-10 seconds)
2. Subsequent loads will be instant (cached)
3. Use local model for faster first load (see below)

---

## 📥 Optional: Download Model Locally

If you want to avoid the initial download, download the model locally:

### Step 1: Create Directory

```bash
mkdir -p public/models
```

### Step 2: Download Model

```bash
# Using curl
curl -L https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx \
  -o public/models/modnet.onnx

# Or using wget
wget https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx \
  -O public/models/modnet.onnx
```

### Step 3: Update Configuration

Edit `src/lib/modnet-bg-removal.ts`:

```typescript
export const CONFIG = {
  // Change to local path
  MODEL_URL: '/models/modnet.onnx',
  // ... rest of config
}
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

**Benefits:**
- ✅ No initial download wait
- ✅ Works offline
- ✅ Faster first load

---

## 📊 Expected Performance

### First Load (Model Download)
- **Time:** 5-10 seconds
- **Network:** ~25MB download
- **Cache:** Automatic browser caching

### Subsequent Loads
- **Time:** Instant (< 100ms)
- **Network:** No download needed
- **Cache:** From browser cache

### Processing Time
- **512×512:** 200-400ms (WebGPU) or 400-800ms (WASM)
- **1024×1024:** 400-800ms (WebGPU) or 800-1600ms (WASM)
- **2048×2048:** 800-1600ms (WebGPU) or 1600-3200ms (WASM)

---

## ✅ Success Indicators

After uploading an image, you should see:

1. ✅ **Progress indicator** (0-100%)
2. ✅ **Processing time** in console (< 2 seconds for 1024px)
3. ✅ **Execution provider** logged (webgpu or wasm)
4. ✅ **Result image** with transparent background
5. ✅ **No errors** in console

---

## 🎯 Model URLs (Priority Order)

The system will try these URLs in order:

1. **jsDelivr CDN** (Primary - most reliable)
   ```
   https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx
   ```

2. **Hugging Face CDN** (Fallback 1)
   ```
   https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx
   ```

3. **Local Path** (Fallback 2 - if downloaded)
   ```
   /models/modnet.onnx
   ```

---

## 🔧 Advanced: Custom Model URL

To use a different model URL:

Edit `src/lib/modnet-bg-removal.ts`:

```typescript
export const CONFIG = {
  MODEL_URL: 'https://your-custom-url/model.onnx',
  // ... rest of config
}
```

The fallback mechanism will still try the other URLs if this one fails.

---

## 📞 Still Having Issues?

### Check These First

1. **Internet connection** - Model needs to download
2. **Browser compatibility** - Chrome/Firefox/Safari/Edge
3. **Browser cache** - Clear and hard refresh
4. **Console errors** - Check DevTools console
5. **Network tab** - Check if model.onnx is downloading

### Common Solutions

1. **Try different browser** - Chrome has best WebGPU support
2. **Wait longer** - First load takes 5-10 seconds
3. **Hard refresh** - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Download locally** - See "Download Model Locally" section above
5. **Check firewall** - Some networks block CDN access

---

## 🎉 You're Ready!

The model loading is now fixed with automatic fallback. Just:

1. ✅ Clear browser cache
2. ✅ Upload an image
3. ✅ Watch the magic happen! ✨

---

**Last Updated:** 2025-10-23  
**Version:** 1.0.1 (with fallback mechanism)

