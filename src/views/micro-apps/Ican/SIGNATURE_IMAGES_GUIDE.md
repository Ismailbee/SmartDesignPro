# 📝 SIGNATURE IMAGES SETUP GUIDE

## 🎯 Overview
The receipt now supports displaying signature images (PNG/JPEG) for Signature 1 and Signature 2 positions. This guide shows you how to add them.

---

## 🖼️ How Signatures Work

### Current Setup:
- **Signature 1**: Left side of bottom section
- **Signature 2**: Right side of bottom section
- **Display**: Shows image above the name field
- **Fallback**: Shows "No signature" placeholder if no image is set

---

## 🔧 ADDING SIGNATURE IMAGES

### File Location:
```
src/pages/ReceiptPage.vue
```

### Find This Section (around line 241):
```javascript
// Signature images (Developer can set signature images here - PNG/JPEG)
const signatureImage1 = ref(''); // Signature 1 image: ref('/images/signature1.png')
const signatureImage2 = ref(''); // Signature 2 image: ref('/images/signature2.png')
```

---

## 📝 METHOD 1: Use Images from Public Folder (Recommended)

### Step 1: Prepare Your Signature Images
- **Format**: PNG with transparent background (best) or JPEG
- **Size**: Recommended 300x100px to 400x150px
- **File size**: Keep under 50KB each
- **Quality**: High resolution for clear printing

### Step 2: Place Images in Public Folder
```
Place your signature images here:
public/images/signature1.png
public/images/signature2.png
```

### Step 3: Update the Code
```javascript
// In ReceiptPage.vue (around line 241)
const signatureImage1 = ref('/images/signature1.png');
const signatureImage2 = ref('/images/signature2.png');
```

### Step 4: Save and Test
- Save the file (Ctrl+S)
- Refresh your browser
- Navigate to Receipt Page
- You should see the signature images

---

## 📝 METHOD 2: Use Images from Assets Folder

### Step 1: Place Images in Assets
```
Place your signature images here:
src/assets/images/signature1.png
src/assets/images/signature2.png
```

### Step 2: Import at Top of Script
```javascript
// Add these imports at the top of <script> section (after other imports)
import signature1Img from '@/assets/images/signature1.png';
import signature2Img from '@/assets/images/signature2.png';
```

### Step 3: Update the Code
```javascript
const signatureImage1 = ref(signature1Img);
const signatureImage2 = ref(signature2Img);
```

---

## 📝 METHOD 3: Use Base64 Encoded Images

### Step 1: Convert Images to Base64
- Use an online converter: https://www.base64-image.de/
- Upload your signature PNG/JPEG
- Copy the base64 string

### Step 2: Update the Code
```javascript
const signatureImage1 = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...');
const signatureImage2 = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...');
```

**Advantage**: Images embedded in code, no external files needed
**Disadvantage**: Makes code file larger

---

## 📝 METHOD 4: Use External URLs

```javascript
const signatureImage1 = ref('https://yourdomain.com/signatures/signature1.png');
const signatureImage2 = ref('https://yourdomain.com/signatures/signature2.png');
```

**Note**: Requires internet connection and may not work in PDF export

---

## 🎨 SIGNATURE IMAGE SPECIFICATIONS

### Recommended Dimensions:
```
Width:  300-400px
Height: 100-150px
Ratio:  3:1 to 4:1 (landscape orientation)
```

### File Formats:
1. **PNG** (Best - supports transparency)
   - Transparent background recommended
   - Clear signature lines
   - File size: 20-50KB

2. **JPEG** (Good - smaller file size)
   - White background
   - High quality (90%+)
   - File size: 10-30KB

3. **SVG** (Advanced - scalable)
   - Perfect quality at any size
   - Requires special handling

---

## 🖼️ HOW SIGNATURES DISPLAY

### In the Receipt:
```
┌─────────────────────────────────────────┐
│                                         │
│ [Signature 1]  [₦ Amount]  [Signature 2]│
│    [Name]         Box         [Name]     │
│   Signature                 Signature    │
└─────────────────────────────────────────┘
```

### Visual Styling:
- **Border**: Light gray border around image
- **Padding**: 1px padding, white background
- **Rounded**: Slightly rounded corners
- **Max Width**: 120px (maintains aspect ratio)
- **Height**: 64px (h-16)

### Without Images:
```
┌─────────────────────────────────────────┐
│                                         │
│ [No signature] [₦ Amount] [No signature]│
│    [Name]         Box        [Name]     │
│   Signature                 Signature   │
└─────────────────────────────────────────┘
```

---

## 💡 EXAMPLE CONFIGURATIONS

### Example 1: Both Signatures Set
```javascript
const signatureImage1 = ref('/images/director-signature.png');
const signatureImage2 = ref('/images/accountant-signature.png');

const signature1 = ref(''); // Name will be entered by user
const signature2 = ref(''); // Name will be entered by user
```

### Example 2: Only One Signature
```javascript
const signatureImage1 = ref('/images/ceo-signature.png');
const signatureImage2 = ref(''); // No image, shows placeholder

const signature1 = ref('');
const signature2 = ref('');
```

### Example 3: Different Signatures per Branch
```javascript
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const branch = computed(() => route.query.branch || '');

const signatureImage1 = computed(() => {
  switch(branch.value) {
    case 'Kaduna': return '/images/kaduna-sig1.png';
    case 'Minna': return '/images/minna-sig1.png';
    case 'Kano': return '/images/kano-sig1.png';
    default: return '/images/default-sig1.png';
  }
});

const signatureImage2 = computed(() => {
  switch(branch.value) {
    case 'Kaduna': return '/images/kaduna-sig2.png';
    case 'Minna': return '/images/minna-sig2.png';
    case 'Kano': return '/images/kano-sig2.png';
    default: return '/images/default-sig2.png';
  }
});
```

---

## 🎯 CREATING SIGNATURE IMAGES

### Option 1: Scan Physical Signature
1. Sign on white paper with black pen
2. Scan at 300 DPI
3. Use image editor (Photoshop, GIMP, etc.)
4. Remove background (make transparent)
5. Crop to signature only
6. Resize to ~400x150px
7. Save as PNG

### Option 2: Digital Signature
1. Use digital signature pad
2. Export as PNG
3. Resize if needed
4. Ensure transparent background

### Option 3: Generate Online
1. Use online signature generator
2. Download as PNG
3. Ensure quality is good
4. Test in receipt

---

## 🧪 TESTING YOUR SIGNATURES

### Checklist:
- [ ] Signature images placed in correct folder
- [ ] File paths updated in code
- [ ] File names match exactly (case-sensitive)
- [ ] Images load in browser
- [ ] Images display at correct size
- [ ] Images appear in PDF export
- [ ] Images appear in JPEG export
- [ ] Transparent backgrounds work correctly
- [ ] Names can be typed below signatures
- [ ] Layout looks balanced

### Test Process:
1. **Save** the ReceiptPage.vue file
2. **Refresh** browser
3. **Navigate** to Receipt Page
4. **Check** if signature images appear
5. **Fill** in name fields below signatures
6. **Export** as PDF - verify signatures included
7. **Export** as JPEG - verify signatures included

---

## 🚨 TROUBLESHOOTING

### Problem 1: Images Don't Appear
**Possible Causes:**
- Wrong file path
- File doesn't exist
- Typo in filename
- Case sensitivity (signature1.PNG vs signature1.png)

**Solution:**
```javascript
// Check exact file location
// Public folder: /images/signature1.png
// Assets folder: require import statement

// Verify file exists:
// public/images/signature1.png
```

---

### Problem 2: Images Too Large/Small
**Solution:** Adjust the CSS classes:
```vue
<!-- Current -->
<img :src="signatureImage1" class="h-16 w-auto object-contain max-w-[120px]" />

<!-- Make larger -->
<img :src="signatureImage1" class="h-20 w-auto object-contain max-w-[160px]" />

<!-- Make smaller -->
<img :src="signatureImage1" class="h-12 w-auto object-contain max-w-[100px]" />
```

---

### Problem 3: Images Not in PDF Export
**Problem:** Images show on screen but not in exported PDF

**Solution:** Use base64 encoding:
```javascript
// Convert image to base64 first
const signatureImage1 = ref('data:image/png;base64,iVBORw0KGgoAAAA...');
```

---

### Problem 4: Background Not Transparent
**Problem:** White box around signature

**Solutions:**
1. Re-save image with transparent background (PNG only)
2. Use image editor to remove background
3. Convert to PNG from JPEG

---

## 📋 QUICK REFERENCE

### File Paths:
```javascript
// Public folder
const signatureImage1 = ref('/images/signature1.png');

// Assets folder (with import)
import sig1 from '@/assets/images/signature1.png';
const signatureImage1 = ref(sig1);

// Base64
const signatureImage1 = ref('data:image/png;base64,...');

// External URL
const signatureImage1 = ref('https://domain.com/sig1.png');

// No image (show placeholder)
const signatureImage1 = ref('');
```

### Image Specs:
- **Format**: PNG (transparent) or JPEG
- **Size**: 300-400px × 100-150px
- **File Size**: 20-50KB
- **Resolution**: 72-150 DPI
- **Background**: Transparent (PNG) or White (JPEG)

---

## ✅ CHECKLIST BEFORE DEPLOYMENT

- [ ] Signature images prepared at correct size
- [ ] Images saved in correct location
- [ ] File paths updated in code
- [ ] Tested on Receipt Page
- [ ] Tested in PDF export
- [ ] Tested in JPEG export
- [ ] Images look professional
- [ ] File sizes optimized
- [ ] Backup copies of signature files saved
- [ ] Documentation updated

---

## 🎉 RESULT

After following this guide, your receipts will have:
- ✅ Professional signature images
- ✅ Proper positioning and sizing
- ✅ Clean appearance in exports
- ✅ Name fields below signatures
- ✅ Consistent branding

---

**Your receipts are now ready with professional signatures!** 🎯
