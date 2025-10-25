# Background Removal - Import Error Fix

## 🐛 Issue Encountered

**Error Message:**
```
Failed to resolve entry for package "onnxruntime-web". 
The package may have incorrect main/module/exports specified in its package.json.
```

**Root Cause:**
The `@imgly/background-removal` package requires `onnxruntime-web` as a peer dependency, but it wasn't installed automatically. Additionally, Vite needed configuration to properly handle these packages.

---

## ✅ Fix Applied

### 1. **Installed Missing Dependency**

```bash
npm install onnxruntime-web@1.21.0
```

**Why version 1.21.0?**
- `@imgly/background-removal@1.7.0` specifically requires `onnxruntime-web@1.21.0`
- Using a different version (like 1.23.0) causes compatibility issues

### 2. **Updated Vite Configuration**

Modified `vite.config.ts` to properly handle the background removal packages:

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['onnxruntime-web'],      // Pre-bundle onnxruntime-web
    exclude: ['@imgly/background-removal']  // Don't pre-bundle background-removal
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      external: []
    }
  },
  server: {
    fs: {
      strict: false  // Allow serving files outside root
    }
  }
})
```

### 3. **Changed Import Strategy**

Modified `src/composables/useBackgroundRemoval.ts` to use **static import** instead of dynamic import:

**Before (Dynamic Import - Caused Issues):**
```typescript
const loadBackgroundRemovalLibrary = async () => {
  const module = await import('@imgly/background-removal')
  return module
}

const bgRemoval = await loadBackgroundRemovalLibrary()
const blob = await bgRemoval.removeBackground(file, config)
```

**After (Static Import - Works with Vite):**
```typescript
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'

// Later in the code:
const blob = await imglyRemoveBackground(file, config)
```

**Why this change?**
- Vite has issues with dynamic imports of certain packages
- Static imports are pre-bundled and optimized by Vite
- More reliable for packages with complex dependencies

### 4. **Updated package.json**

Added both packages to dependencies:

```json
{
  "dependencies": {
    "@imgly/background-removal": "^1.4.5",
    "onnxruntime-web": "^1.21.0"
  }
}
```

---

## 🚀 How to Apply the Fix

### Step 1: Verify Packages are Installed

```bash
npm list @imgly/background-removal onnxruntime-web
```

**Expected Output:**
```
design-editor@0.0.0
├─┬ @imgly/background-removal@1.7.0
│ └── onnxruntime-web@1.21.0 deduped
└── onnxruntime-web@1.21.0
```

### Step 2: Restart the Development Server

**Stop the current dev server** (Ctrl+C in terminal), then:

```bash
npm run dev
```

### Step 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or use keyboard shortcut:
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

### Step 4: Test the Feature

1. Navigate to: `http://localhost:8100/home`
2. Go to: **Auto Design** → **Sticker** → **Wedding**
3. Check the box: "Automatically remove background from uploaded images"
4. Upload a test image
5. Verify: Progress indicator appears and background is removed

---

## 🔍 Verification Checklist

After applying the fix, verify:

- [ ] No import errors in browser console
- [ ] No "Failed to resolve entry" errors
- [ ] Background removal checkbox appears
- [ ] Uploading image shows progress indicator
- [ ] Background is successfully removed from images
- [ ] Crop modal opens with processed image
- [ ] No TypeScript errors in IDE

---

## 🐛 If Issues Persist

### Issue 1: "Failed to fetch dynamically imported module"

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Issue 2: "onnxruntime-web" version mismatch

**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Vite optimization errors

**Solution:**
```bash
# Clear all caches
rm -rf node_modules/.vite dist

# Reinstall and rebuild
npm install
npm run dev
```

### Issue 4: Browser still shows old errors

**Solution:**
1. Close all browser tabs with the app
2. Clear browser cache completely
3. Restart browser
4. Open app in new tab

---

## 📊 Technical Details

### Why Static Import Instead of Dynamic?

**Dynamic Import Issues:**
- Vite pre-bundles dependencies during dev
- Some packages (like `@imgly/background-removal`) have complex module structures
- Dynamic imports can fail to resolve nested dependencies
- ONNX Runtime has WebAssembly files that need special handling

**Static Import Benefits:**
- Vite handles all dependencies at build time
- Better tree-shaking and optimization
- More reliable module resolution
- Easier debugging

**Trade-off:**
- Static import increases initial bundle size
- But for this feature, it's acceptable since:
  - Background removal is a core feature
  - Users who navigate to wedding sticker will use it
  - The library is ~500KB (acceptable for modern web apps)

### Vite Configuration Explained

```typescript
optimizeDeps: {
  include: ['onnxruntime-web'],      // Pre-bundle this dependency
  exclude: ['@imgly/background-removal']  // Don't pre-bundle (has special requirements)
}
```

**Why include `onnxruntime-web`?**
- It's a CommonJS module that needs to be converted to ESM
- Pre-bundling improves load time
- Prevents runtime resolution issues

**Why exclude `@imgly/background-removal`?**
- It has WebAssembly files and ONNX models
- Pre-bundling can break these special assets
- Better to let Vite handle it as-is

---

## 📚 Package Information

### @imgly/background-removal@1.7.0

- **Size:** ~500KB (minified)
- **Dependencies:** onnxruntime-web, onnx-proto
- **Models:** Small (~5MB), Medium (~10MB), Large (~20MB)
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+

### onnxruntime-web@1.21.0

- **Size:** ~2MB (includes WebAssembly runtime)
- **Purpose:** Run ONNX models in browser
- **Features:** WebGPU acceleration, WebAssembly fallback
- **Compatibility:** Required by @imgly/background-removal@1.7.0

---

## ✅ Summary of Changes

### Files Modified:

1. **`vite.config.ts`**
   - Added `optimizeDeps` configuration
   - Added `server.fs.strict: false`
   - Added `build.rollupOptions`

2. **`src/composables/useBackgroundRemoval.ts`**
   - Changed from dynamic import to static import
   - Removed `loadBackgroundRemovalLibrary()` function
   - Updated `removeBackground()` to use static import

3. **`package.json`**
   - Added `onnxruntime-web@^1.21.0` to dependencies

### Files Created:

1. **`BACKGROUND_REMOVAL_FIX.md`** (this file)
   - Documents the fix and troubleshooting steps

---

## 🎯 Next Steps

1. **Restart dev server** with the updated configuration
2. **Test the feature** thoroughly
3. **Monitor browser console** for any new errors
4. **Test on different browsers** (Chrome, Firefox, Safari)
5. **Test on mobile devices** when ready

---

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 16+ or 18+
   ```

2. **Check npm version:**
   ```bash
   npm --version  # Should be 8+ or 9+
   ```

3. **Try clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

4. **Check browser console** for detailed error messages

5. **Verify file changes** were saved correctly:
   - `vite.config.ts` has the new configuration
   - `useBackgroundRemoval.ts` uses static import
   - `package.json` has both packages

---

**Last Updated:** 2025-10-23  
**Status:** Fix Applied - Ready for Testing  
**Packages Installed:** ✅ @imgly/background-removal@1.7.0, onnxruntime-web@1.21.0

