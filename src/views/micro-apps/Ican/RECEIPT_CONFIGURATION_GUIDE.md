# 🔧 RECEIPT PAGE - DEVELOPER CONFIGURATION GUIDE

## 📝 Overview
The Receipt Page now has **fixed organization details** that users cannot change. Only you (the developer) can modify the logo, organization name, address, and phone number.

---

## 🎯 What Changed

### ✅ **Removed User Controls:**
- ❌ Logo upload button (removed)
- ❌ Organization name input (removed)
- ❌ Address textarea (removed)
- ❌ Phone input (removed)

### ✅ **Added Fixed Content:**
- ✅ Organization Name: **Institute of Chartered Accountants of Nigeria (ICAN)**
- ✅ Address: Developer-controlled (you set it in code)
- ✅ Phone: Developer-controlled (you set it in code)
- ✅ Logo: Developer-controlled (you set it in code)

---

## 🛠️ HOW TO CONFIGURE

### File Location:
```
src/pages/ReceiptPage.vue
```

### Find This Section (around line 235):
```javascript
setup() {
  const router = useRouter();
  const receiptStore = useReceiptStore();
  const financeStore = useFinanceStore();

  // Fixed organization details (Developer only - users cannot change these)
  const organizationName = 'Institute of Chartered Accountants of Nigeria (ICAN)';
  const organizationAddress = ref('Plot 16, Professional Centre, Idowu Taylor Street, Victoria Island, Lagos');
  const organizationPhone = ref('+234 1 234 5678');
  
  // Logo data (Developer can set a default logo here)
  const logoDataUrl = ref(''); // You can set a default logo URL here: ref('/path/to/logo.png')
```

---

## 📝 CONFIGURATION OPTIONS

### 1. **Change Organization Name**
```javascript
// Current:
const organizationName = 'Institute of Chartered Accountants of Nigeria (ICAN)';

// To change:
const organizationName = 'Your Organization Name Here';
```

---

### 2. **Change Address**
```javascript
// Current:
const organizationAddress = ref('Plot 16, Professional Centre, Idowu Taylor Street, Victoria Island, Lagos');

// To change:
const organizationAddress = ref('Your full address here');

// Multi-line address example:
const organizationAddress = ref(`Plot 16, Professional Centre,
Idowu Taylor Street, Victoria Island,
Lagos, Nigeria`);
```

---

### 3. **Change Phone Number**
```javascript
// Current:
const organizationPhone = ref('+234 1 234 5678');

// To change:
const organizationPhone = ref('+234 XXX XXX XXXX');

// Multiple phones example:
const organizationPhone = ref('+234 1 234 5678, +234 801 234 5678');
```

---

### 4. **Add Organization Logo**

#### Option A: Use a Logo from Public Folder
```javascript
// Step 1: Place your logo in the public folder
// Example: public/images/ican-logo.png

// Step 2: Update the code
const logoDataUrl = ref('/images/ican-logo.png');
```

#### Option B: Use a Logo from Assets Folder
```javascript
// Step 1: Place your logo in src/assets/images/ican-logo.png

// Step 2: Import at the top of script section
import icanLogo from '@/assets/images/ican-logo.png';

// Step 3: Update the code
const logoDataUrl = ref(icanLogo);
```

#### Option C: Use Base64 Encoded Logo
```javascript
// Use an online converter to convert your image to base64
const logoDataUrl = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...');
```

#### Option D: Use External URL
```javascript
const logoDataUrl = ref('https://yourdomain.com/logo.png');
```

---

## 📐 Logo Size Recommendations

The logo is displayed with:
```vue
<img :src="logoDataUrl" alt="ICAN Logo" class="h-16 w-auto object-contain" />
```

**Recommended Logo Specifications:**
- **Height**: 64px (h-16 = 4rem = 64px)
- **Width**: Auto (maintains aspect ratio)
- **Format**: PNG with transparent background (best)
- **Alternative formats**: JPG, SVG
- **File size**: Keep under 100KB for fast loading

**Ideal Dimensions:**
- 200px x 64px (landscape)
- 64px x 64px (square)
- 100px x 64px (rectangular)

---

## 🎨 EXAMPLE CONFIGURATIONS

### Example 1: Lagos Branch
```javascript
const organizationName = 'Institute of Chartered Accountants of Nigeria (ICAN)';
const organizationAddress = ref('Plot 16, Professional Centre, Idowu Taylor Street, Victoria Island, Lagos');
const organizationPhone = ref('+234 1 234 5678');
const logoDataUrl = ref('/images/ican-logo.png');
```

### Example 2: Kaduna Branch
```javascript
const organizationName = 'Institute of Chartered Accountants of Nigeria (ICAN)';
const organizationAddress = ref('23 Ali Akilu Road, GRA, Kaduna, Kaduna State');
const organizationPhone = ref('+234 62 234 567');
const logoDataUrl = ref('/images/ican-logo.png');
```

### Example 3: Without Logo
```javascript
const organizationName = 'Institute of Chartered Accountants of Nigeria (ICAN)';
const organizationAddress = ref('Plot 16, Professional Centre, Idowu Taylor Street, Victoria Island, Lagos');
const organizationPhone = ref('+234 1 234 5678');
const logoDataUrl = ref(''); // Empty = no logo displayed
```

---

## 🖼️ HOW TO ADD YOUR LOGO

### Step-by-Step Guide:

#### Method 1: Public Folder (Recommended)
```bash
# 1. Create images folder in public directory
# Location: public/images/

# 2. Place your logo file there
# Example: public/images/ican-logo.png

# 3. Update the code
const logoDataUrl = ref('/images/ican-logo.png');

# 4. Save and refresh browser
```

#### Method 2: Assets Folder
```bash
# 1. Create images folder in assets
# Location: src/assets/images/

# 2. Place your logo file there
# Example: src/assets/images/ican-logo.png

# 3. Import at top of <script> section (after other imports)
import icanLogo from '@/assets/images/ican-logo.png';

# 4. Update the code
const logoDataUrl = ref(icanLogo);

# 5. Save and refresh browser
```

---

## 🔍 TESTING YOUR CHANGES

### After Making Changes:

1. **Save the file** (`Ctrl+S`)
2. **Refresh your browser** (The dev server should auto-reload)
3. **Navigate to Receipt Page**
4. **Check the header** - you should see:
   - Your logo (if configured)
   - Organization name
   - Address
   - Phone number

### Verify:
- ✅ Logo displays correctly (if set)
- ✅ Organization name appears
- ✅ Address is readable
- ✅ Phone number is formatted
- ✅ Users CANNOT edit these fields
- ✅ Export PDF/JPEG includes these details

---

## 🎯 CURRENT CONFIGURATION

**As of now, the receipt page has:**

```
Organization: Institute of Chartered Accountants of Nigeria (ICAN)
Address: Plot 16, Professional Centre, Idowu Taylor Street, Victoria Island, Lagos
Phone: +234 1 234 5678
Logo: Not set (you need to add one)
```

**Users can only edit:**
- Date
- Receipt number
- Received from
- Amount (Naira and Kobo)
- Payment for
- Signature name

---

## 📋 QUICK CHECKLIST

Before deploying, verify:

- [ ] Logo file is in correct location
- [ ] Logo displays at correct size
- [ ] Organization name is correct
- [ ] Address is complete and accurate
- [ ] Phone number is correct format
- [ ] Test PDF export - logo/text appears correctly
- [ ] Test JPEG export - logo/text appears correctly
- [ ] Verify on different screen sizes
- [ ] Check dark mode (if applicable)

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: Logo Not Displaying
**Problem:** `logoDataUrl` is empty or path is wrong

**Solution:**
```javascript
// Check the path is correct
const logoDataUrl = ref('/images/ican-logo.png'); // For public folder
// OR
import logo from '@/assets/images/ican-logo.png'; // For assets folder
const logoDataUrl = ref(logo);
```

---

### Issue 2: Logo Too Large/Small
**Problem:** Logo doesn't fit nicely

**Solution:** Adjust the CSS class:
```vue
<!-- Current -->
<img :src="logoDataUrl" alt="ICAN Logo" class="h-16 w-auto object-contain" />

<!-- Smaller logo -->
<img :src="logoDataUrl" alt="ICAN Logo" class="h-12 w-auto object-contain" />

<!-- Larger logo -->
<img :src="logoDataUrl" alt="ICAN Logo" class="h-20 w-auto object-contain" />
```

---

### Issue 3: Address Too Long
**Problem:** Address wraps awkwardly

**Solution:** Use shorter text or adjust CSS:
```javascript
// Shorter version
const organizationAddress = ref('Professional Centre, Victoria Island, Lagos');

// OR add line breaks in template (ReceiptPage.vue around line 70)
<p class="text-xs text-center mt-1 px-4">
  {{ organizationAddress }}
</p>
```

---

### Issue 4: Logo Not in PDF Export
**Problem:** Logo shows on screen but not in PDF

**Solution:** Use base64 encoding or ensure logo is accessible:
```javascript
// Convert your logo to base64 (use online converter)
const logoDataUrl = ref('data:image/png;base64,iVBORw0KGg...');
```

---

## 🎓 ADVANCED CUSTOMIZATION

### Different Logos Per Branch
```javascript
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const branch = computed(() => route.query.branch || '');

const logoDataUrl = computed(() => {
  switch(branch.value) {
    case 'Kaduna': return '/images/kaduna-logo.png';
    case 'Minna': return '/images/minna-logo.png';
    case 'Kano': return '/images/kano-logo.png';
    default: return '/images/ican-logo.png';
  }
});

const organizationAddress = computed(() => {
  switch(branch.value) {
    case 'Kaduna': return '23 Ali Akilu Road, GRA, Kaduna';
    case 'Minna': return '15 Paiko Road, Minna, Niger State';
    default: return 'Professional Centre, Victoria Island, Lagos';
  }
});
```

---

## ✅ SUMMARY

**What You Control (Developer):**
- ✅ Logo image
- ✅ Organization name
- ✅ Address
- ✅ Phone number

**What Users Control:**
- ✅ Receipt details (date, amount, recipient, etc.)
- ❌ Cannot change branding

**To Update:**
1. Edit `src/pages/ReceiptPage.vue`
2. Find the setup() function
3. Update the constants
4. Save and test

---

*Your organization branding is now protected and consistent across all receipts!* 🎉
