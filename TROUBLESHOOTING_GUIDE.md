# 🔧 Troubleshooting Guide

## ✅ **Expected Console Output**

When background removal is working correctly, you should see:

```
⚙️  MODNet Configuration:
   Resolution: 384x384
   Normalization: MEAN=[0.485, 0.456, 0.406], STD=[0.229, 0.224, 0.225]
   Smoothing: Enabled (radius=1)
   Enhancement: Disabled (preserves foreground)

🔄 Attempting MODNet ONNX Runtime (fastest method)...
✅ ONNX Runtime loaded successfully
📦 WASM paths configured: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/
🔧 Threading mode: Single-threaded (for compatibility)
✅ Successfully loaded model from: https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx

📊 Alpha Mask Stats (Raw Model Output):
   Min: 0.002, Max: 0.998, Avg: 0.456

✅ Background removed with MODNet in 400ms
```

---

## ⚠️ **Common Warnings (Safe to Ignore)**

### **1. Multi-Threading Warning**

```
env.wasm.numThreads is set to 4, but this will not work unless you enable crossOriginIsolated mode.
WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading.
```

**Status:** ✅ **FIXED** (Changed to single-threaded mode)  
**Impact:** None - Single-threaded mode works perfectly  
**Performance:** ~400ms (still fast)  
**Action Required:** None

**If you still see this warning:**
- Clear browser cache (Ctrl+Shift+R)
- Verify `numThreads` is set to 1 in `src/lib/modnet-bg-removal.ts` line 140

---

### **2. Socket Connection Errors**

```
GET http://localhost:3003/socket.io/?EIO=4&transport=polling&t=33fkxt1f net::ERR_CONNECTION_REFUSED
Socket connection error: TransportError: xhr poll error
Max reconnection attempts reached
```

**Status:** ⚠️ **Unrelated to background removal**  
**Cause:** Backend server not running  
**Impact:** None on background removal (MODNet runs in browser)  
**Action Required:** None (unless you need socket functionality)

**To fix (if needed):**
- Start backend server: `npm run server` or similar
- Check backend server port (should be 3003)

---

## ❌ **Actual Issues**

### **Issue 1: Model Loading Fails**

**Symptoms:**
```
❌ Failed to load model from any URL:
https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx: failed to load external data file
```

**Causes:**
1. No internet connection
2. Hugging Face CDN is down
3. CORS issues
4. Firewall blocking requests

**Solutions:**

**Solution 1: Check Internet Connection**
```bash
# Test if you can reach Hugging Face
curl -I https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx
```

**Solution 2: Try Alternative Model URL**

In `src/lib/modnet-bg-removal.ts` line 29:
```typescript
// Try quantized model (smaller, faster)
MODEL_URL: 'https://huggingface.co/Xenova/modnet/resolve/main/onnx/model_quantized.onnx',
```

**Solution 3: Download Model Locally**

```bash
# Download model to public folder
mkdir -p public/models
wget https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx -O public/models/modnet.onnx

# Update MODEL_URL in src/lib/modnet-bg-removal.ts
MODEL_URL: '/models/modnet.onnx',
```

---

### **Issue 2: Foreground Still Being Cut**

**Symptoms:**
- Parts of person missing (hair, fingers, etc.)
- Alpha mask stats show unusual values

**Diagnostic Steps:**

**Step 1: Check Console for Alpha Stats**
```
📊 Alpha Mask Stats (Raw Model Output):
   Min: 0.XXX, Max: 0.XXX, Avg: 0.XXX
```

**Expected Values:**
- Min: 0.000 - 0.050 (background should be close to 0)
- Max: 0.950 - 1.000 (foreground should be close to 1)
- Avg: 0.400 - 0.600 (balanced mix)

**Problematic Values:**
- Min > 0.1: Model may be failing, everything looks like foreground
- Max < 0.9: Model may be failing, everything looks like background
- Avg < 0.2 or > 0.8: Model output is biased

**Step 2: Verify Configuration**
```
⚙️  MODNet Configuration:
   Enhancement: Disabled (preserves foreground)  ← Should be "Disabled"
```

**If Enhancement is Enabled:**
```typescript
// In src/lib/modnet-bg-removal.ts line 54
ENABLE_ENHANCEMENT: false,  // Change to false
```

**Step 3: Check Normalization**
```
Normalization: MEAN=[0.485, 0.456, 0.406], STD=[0.229, 0.224, 0.225]
```

**If values are different:**
```typescript
// In src/lib/modnet-bg-removal.ts lines 49-50
MEAN: [0.485, 0.456, 0.406], // ImageNet mean (RGB)
STD: [0.229, 0.224, 0.225],  // ImageNet std (RGB)
```

---

### **Issue 3: Processing Too Slow (>1000ms)**

**Symptoms:**
```
✅ Background removed with MODNet in 1200ms  ← Too slow
```

**Diagnostic Steps:**

**Step 1: Check Resolution**
```
Resolution: 384x384  ← Should be 384x384
```

**If resolution is 512 or higher:**
```typescript
// In src/lib/modnet-bg-removal.ts line 45
INPUT_SIZE: 384,  // Change from 512 to 384
```

**Step 2: Check for Redundant Processing**

Look for these in console:
- Multiple smoothing passes
- Gamma correction
- Enhancement enabled

**Step 3: Verify Browser Performance**

```javascript
// Test browser performance
console.log('Hardware Concurrency:', navigator.hardwareConcurrency)
console.log('Memory:', navigator.deviceMemory, 'GB')
```

**Low-end device optimization:**
```typescript
// In src/lib/modnet-bg-removal.ts
INPUT_SIZE: 256,  // Faster on low-end devices
ENABLE_SMOOTHING: false,  // Disable for speed
```

---

### **Issue 4: Jagged Edges**

**Symptoms:**
- Edges look pixelated or jagged
- Hair looks choppy
- Clothing edges are rough

**Solutions:**

**Solution 1: Enable Smoothing**
```typescript
// In src/lib/modnet-bg-removal.ts line 53
ENABLE_SMOOTHING: true,  // Should be true
```

**Solution 2: Increase Smoothing Radius**
```typescript
// In src/lib/modnet-bg-removal.ts line 55
SMOOTHING_RADIUS: 2,  // Increase from 1 to 2 for smoother edges
```

**Solution 3: Increase Resolution**
```typescript
// In src/lib/modnet-bg-removal.ts line 45
INPUT_SIZE: 448,  // Increase from 384 to 448
```

---

### **Issue 5: Background Not Fully Removed**

**Symptoms:**
- Background remnants visible
- Partial background removal
- Alpha mask stats show low max values

**Solutions:**

**Solution 1: Check Alpha Stats**
```
📊 Alpha Mask Stats (Raw Model Output):
   Max: 0.XXX  ← Should be close to 1.0
```

**If Max < 0.9:**
- Model may not be working correctly
- Try alternative model URL
- Check normalization values

**Solution 2: Enable Enhancement (Use with Caution)**
```typescript
// In src/lib/modnet-bg-removal.ts line 54
ENABLE_ENHANCEMENT: true,  // Enable to clean background
```

**Warning:** This may cut foreground. Monitor results carefully.

**Solution 3: Increase Resolution**
```typescript
// In src/lib/modnet-bg-removal.ts line 45
INPUT_SIZE: 512,  // Higher resolution for better accuracy
```

---

## 🧪 **Diagnostic Checklist**

### **Before Reporting Issues:**

- [ ] **Clear browser cache** (Ctrl+Shift+R)
- [ ] **Check console output** (F12 → Console)
- [ ] **Verify configuration** (Resolution, Enhancement, Smoothing)
- [ ] **Check alpha stats** (Min, Max, Avg values)
- [ ] **Test with different images** (Simple vs complex backgrounds)
- [ ] **Check internet connection** (Model loads from CDN)
- [ ] **Verify normalization** (ImageNet standard values)
- [ ] **Check processing time** (Should be ~400ms)

### **Information to Provide:**

When reporting issues, include:

1. **Console output** (full log from background removal)
2. **Alpha mask stats** (Min, Max, Avg values)
3. **Configuration** (Resolution, Enhancement, Smoothing)
4. **Processing time** (from console log)
5. **Browser and version** (Chrome 120, Firefox 121, etc.)
6. **Test image characteristics** (resolution, complexity)
7. **Visual description** (what's wrong with the result)

---

## 📊 **Performance Expectations**

### **Normal Performance:**

| Device Type | Expected Time | Status |
|-------------|---------------|--------|
| **High-end Desktop** | 250-350ms | ✅ Excellent |
| **Mid-range Laptop** | 350-450ms | ✅ Good |
| **Low-end Laptop** | 450-600ms | ✅ Acceptable |
| **Mobile (High-end)** | 500-700ms | ✅ Good |
| **Mobile (Low-end)** | 700-1000ms | ⚠️ Slow |

### **If Performance is Outside These Ranges:**

**Too Fast (<200ms):**
- Model may not be running (check console for errors)
- Fallback to @imgly may be failing silently
- Check that MODNet is actually being used

**Too Slow (>1000ms):**
- Resolution may be too high (check INPUT_SIZE)
- Enhancement may be enabled (check ENABLE_ENHANCEMENT)
- Multiple smoothing passes may be running
- Browser may be throttling (check CPU usage)

---

## 🔧 **Quick Fixes**

### **Reset to Default Configuration:**

```typescript
// In src/lib/modnet-bg-removal.ts

// Lines 45-55
INPUT_SIZE: 384,
MEAN: [0.485, 0.456, 0.406],
STD: [0.229, 0.224, 0.225],
ENABLE_SMOOTHING: true,
ENABLE_ENHANCEMENT: false,
SMOOTHING_RADIUS: 1,
DEBUG_LOGGING: true,
LOG_ALPHA_STATS: true,

// Lines 140-145
ortInstance.env.wasm.numThreads = 1
ortInstance.env.wasm.simd = true
ortInstance.env.wasm.proxy = false
```

### **Clear All Caches:**

```bash
# Clear browser cache
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

---

## 📞 **Getting Help**

If issues persist after trying these solutions:

1. **Check documentation files:**
   - FINAL_SOLUTION_SUMMARY.md
   - FOREGROUND_CUTTING_FIX.md
   - PERFORMANCE_BENCHMARKS.md

2. **Gather diagnostic information** (see checklist above)

3. **Test with simple image first** (solid background, clear subject)

4. **Verify basic functionality** (model loads, inference runs)

---

**Most issues can be resolved by:**
- ✅ Clearing browser cache
- ✅ Verifying configuration
- ✅ Checking console output
- ✅ Testing with different images

**Good luck!** 🎉

