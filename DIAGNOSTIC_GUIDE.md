# 🔬 MODNet Background Removal - Diagnostic Guide

## 📋 **How to Diagnose Issues**

Follow these steps to identify and fix MODNet performance or functionality issues:

---

## **Step 1: Open Diagnostic Test Page**

### **Option A: Use Built-in Diagnostic Tool**
1. Make sure dev server is running: `npm run dev`
2. Open browser: `http://localhost:5173/test-modnet.html`
3. Click all test buttons in order:
   - ✅ Run Environment Check
   - ✅ Test ONNX Runtime
   - ✅ Test Model Loading
   - ✅ Remove Background (upload an image first)

### **Option B: Test in Wedding Sticker**
1. Open: `http://localhost:5173/home`
2. Navigate: **Auto Design** → **Sticker** → **Wedding**
3. Open browser console: Press `F12`
4. Upload a portrait image
5. Watch console output

---

## **Step 2: Check Console Output**

### **✅ Success Pattern (MODNet Working)**

```
🔄 Attempting MODNet ONNX Runtime (fastest method)...
🚀 Initializing MODNet background removal...
✅ ONNX Runtime loaded successfully
📦 WASM paths configured: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/
🔍 WebGPU available: false
📥 Primary model URL: https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx
🔄 Attempting to create session with wasm...
🔄 Trying to load model from: https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx
✅ Successfully loaded model from: https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx
✅ Session created successfully with wasm
📋 Input names: ['input']
📋 Output names: ['output']
✅ MODNet initialization complete
✅ Background removed with MODNet in 350ms  ← Should be 200-800ms
```

**Expected Time:** 200-800ms  
**Status:** ✅ Working perfectly!

---

### **❌ Failure Pattern 1: MODNet Fails, @imgly Works**

```
🔄 Attempting MODNet ONNX Runtime (fastest method)...
❌ Failed to load ONNX Runtime: [error message]
❌ MODNet failed: [error]
🔄 Attempting @imgly/background-removal fallback...
✅ Background removed with @imgly fallback in 1500ms
```

**Expected Time:** 1000-3000ms  
**Status:** ⚠️ MODNet not working, but @imgly fallback is working  
**Action:** See "Common Issues" section below

---

### **❌ Failure Pattern 2: All Methods Fail**

```
🔄 Attempting MODNet ONNX Runtime (fastest method)...
❌ MODNet failed: [error]
🔄 Attempting @imgly/background-removal fallback...
❌ @imgly fallback also failed: [error]
🔄 Attempting server fallback...
❌ Server fallback also failed: [error]
Background removal failed. MODNet error: [error]. @imgly fallback error: [error]. Server error: [error]
```

**Status:** ❌ Complete failure  
**Action:** See "Critical Issues" section below

---

## **Step 3: Identify the Issue**

### **Common Issues**

#### **Issue 1: WASM Files Not Loading**

**Symptoms:**
```
❌ Failed to load ONNX Runtime: Failed to fetch
TypeError: Failed to fetch
```

**Causes:**
- No internet connection
- CDN blocked by firewall/antivirus
- CORS issues

**Solutions:**
1. Check internet connection
2. Try different network
3. Disable antivirus temporarily
4. Check browser console for CORS errors

---

#### **Issue 2: Model Download Fails**

**Symptoms:**
```
🔄 Trying to load model from: https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx
⚠️ Failed to load from [URL]: Failed to fetch
❌ All execution providers failed
```

**Causes:**
- CDN temporarily down
- Network issues
- Model URL changed

**Solutions:**
1. Wait and retry (CDN might be temporarily down)
2. Check if URL is accessible: Open in new tab
3. Try alternative model URL (see CONFIG.MODEL_URL)

---

#### **Issue 3: WASM Execution Fails**

**Symptoms:**
```
✅ Successfully loaded model from: [URL]
❌ Failed with wasm: [error]
```

**Causes:**
- Browser doesn't support WASM
- WASM features disabled
- Memory issues

**Solutions:**
1. Update browser to latest version
2. Enable WebAssembly in browser settings
3. Close other tabs to free memory
4. Try different browser (Chrome/Edge recommended)

---

#### **Issue 4: Slow Performance (>1000ms)**

**Symptoms:**
```
✅ Background removed with MODNet in 1400ms  ← Too slow!
```

**Causes:**
- Single-threaded execution
- Large input size
- Slow device
- Proxy/worker issues

**Solutions:**

**Solution A: Check Thread Configuration**
```typescript
// In src/lib/modnet-bg-removal.ts line 128
ortInstance.env.wasm.numThreads = navigator.hardwareConcurrency || 4
```
Should show in console:
```
✅ Threads: 4 (or 8, depending on CPU)
```

**Solution B: Check Input Size**
```typescript
// In src/lib/modnet-bg-removal.ts line 44
INPUT_SIZE: 256  // Should be 256 for speed, not 512
```

**Solution C: Check Proxy Setting**
```typescript
// In src/lib/modnet-bg-removal.ts line 133
ortInstance.env.wasm.proxy = true  // Should be true for web worker
```

**Solution D: Reduce Quality for Speed**
```typescript
// Change INPUT_SIZE from 256 to 128 for 4x faster (lower quality)
INPUT_SIZE: 128
```

---

#### **Issue 5: @imgly Fallback Always Used**

**Symptoms:**
```
🔄 Attempting MODNet ONNX Runtime (fastest method)...
❌ MODNet failed: [some error]
🔄 Attempting @imgly/background-removal fallback...
✅ Background removed with @imgly fallback in 1500ms
```

**Causes:**
- MODNet initialization failing
- ONNX Runtime not loading
- Model not loading

**Solutions:**
1. Check console for specific MODNet error
2. Run diagnostic test: `http://localhost:5173/test-modnet.html`
3. Check "Test ONNX Runtime" and "Test Model Loading"
4. Fix the specific error shown

---

### **Critical Issues**

#### **Critical Issue 1: No Internet Connection**

**Symptoms:**
```
❌ Failed to load ONNX Runtime: TypeError: Failed to fetch
❌ @imgly fallback also failed: TypeError: Failed to fetch
```

**Solution:**
- Connect to internet (required for CDN model loading)
- Or download models locally (see "Offline Setup" below)

---

#### **Critical Issue 2: Browser Not Supported**

**Symptoms:**
```
❌ WebAssembly: false
❌ Worker: false
```

**Solution:**
- Update browser to latest version
- Use Chrome, Edge, or Firefox
- Safari may have limited support

---

#### **Critical Issue 3: Memory Issues**

**Symptoms:**
```
❌ Failed with wasm: Out of memory
```

**Solution:**
- Close other tabs/applications
- Reduce INPUT_SIZE to 128
- Use smaller images
- Restart browser

---

## **Step 4: Performance Benchmarks**

### **Expected Performance by Device**

| Device Type | CPU Cores | Expected Time | Status |
|-------------|-----------|---------------|--------|
| **High-end Desktop** | 8-16 | 200-400ms | ⚡⚡⚡ Excellent |
| **Mid-range Desktop** | 4-8 | 300-600ms | ⚡⚡ Very Good |
| **Laptop** | 4 | 400-800ms | ⚡ Good |
| **Mobile (Modern)** | 4-8 | 500-1000ms | ✅ Acceptable |
| **Mobile (Old)** | 2-4 | 800-1500ms | ⚠️ Slow |

### **Performance by Configuration**

| INPUT_SIZE | Threads | Proxy | Expected Time | Quality |
|------------|---------|-------|---------------|---------|
| **128** | All | Yes | 100-300ms | Fair |
| **256** | All | Yes | 200-800ms | Good ⭐ |
| **384** | All | Yes | 400-1200ms | Better |
| **512** | All | Yes | 800-2000ms | Best |
| **256** | 1 | No | 800-1600ms | Good (slow) |

**⭐ Recommended:** INPUT_SIZE: 256, All threads, Proxy: true

---

## **Step 5: Quick Fixes**

### **Quick Fix 1: Hard Refresh**
```
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```
Clears cache and reloads all resources.

### **Quick Fix 2: Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### **Quick Fix 3: Restart Dev Server**
```bash
# Kill server
Ctrl+C

# Restart
npm run dev
```

### **Quick Fix 4: Reinstall Dependencies**
```bash
npm install onnxruntime-web@latest
npm install @imgly/background-removal@latest
```

---

## **Offline Setup (Advanced)**

If you need to work offline:

### **Step 1: Download ONNX Model**
```bash
# Download model
curl -o public/models/modnet.onnx https://cdn.jsdelivr.net/gh/Xenova/transformers.js@2.6.0/models/modnet/model.onnx

# Create directory if needed
mkdir -p public/models
```

### **Step 2: Download WASM Files**
```bash
# Download WASM files
cd public
mkdir -p onnx-wasm
cd onnx-wasm
curl -O https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort-wasm.wasm
curl -O https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort-wasm-simd.wasm
curl -O https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort-wasm-threaded.wasm
curl -O https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort-wasm-simd-threaded.wasm
```

### **Step 3: Update Configuration**
```typescript
// In src/lib/modnet-bg-removal.ts

// Change MODEL_URL (line 29)
MODEL_URL: '/models/modnet.onnx',

// Change WASM paths (line 125)
ortInstance.env.wasm.wasmPaths = '/onnx-wasm/'
```

---

## **Diagnostic Checklist**

Use this checklist to systematically diagnose issues:

- [ ] Dev server running (`npm run dev`)
- [ ] Browser console open (F12)
- [ ] Internet connection active
- [ ] Tested diagnostic page (`/test-modnet.html`)
- [ ] Environment check passed
- [ ] ONNX Runtime loads successfully
- [ ] Model loads successfully
- [ ] Background removal works
- [ ] Processing time < 800ms
- [ ] Console shows "Background removed with MODNet"
- [ ] No fallback to @imgly

---

## **Getting Help**

If issues persist:

1. **Capture Console Output:**
   - Open console (F12)
   - Clear console
   - Reproduce issue
   - Copy ALL console output

2. **Check Configuration:**
   - INPUT_SIZE: 256
   - numThreads: 4-8
   - proxy: true
   - EXECUTION_PROVIDERS: ['wasm']

3. **Test Environment:**
   - Browser: Chrome/Edge (latest)
   - OS: Windows/Mac/Linux
   - Internet: Connected
   - RAM: >4GB available

---

**Status:** 📋 Diagnostic Guide Ready  
**Test Page:** http://localhost:5173/test-modnet.html  
**Expected Performance:** 200-800ms with MODNet  
**Fallback Performance:** 1000-3000ms with @imgly

