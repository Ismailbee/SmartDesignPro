# 🚀 Signature Feature - Quick Start Guide

## ⚡ Getting Started in 3 Steps

### Step 1: Navigate to Signature Page
From your branch dashboard, click the **"Create Signature"** purple card.

### Step 2: Draw Your Signature
1. Use your mouse or finger to draw on the white canvas
2. Adjust **Pen Size** (1-10px) with the slider
3. Change **Pen Color** if needed
4. Use **Undo** to remove last stroke
5. Click **Clear** to start over

### Step 3: Save Your Signature
1. Click **"💾 Save Signature"**
2. Enter a name (optional)
3. Your signature is saved to the cloud!

---

## 🎯 Quick Actions

| Action | How To |
|--------|--------|
| **Create New Signature** | Dashboard → Create Signature card |
| **Set as Primary** | Signature page → Click "Set as Primary" |
| **Download Signature** | Signature page → Click download icon |
| **Delete Signature** | Signature page → Click trash icon → Confirm |
| **Use in Invoice** | Quick Actions → "Use in Invoice" button |
| **Use in Receipt** | Quick Actions → "Use in Receipt" button |

---

## 📱 Mobile Tips

- Use your **finger or stylus** for best results
- Draw smoothly - the canvas captures every movement
- Increase pen size (3-5px) for finger drawing
- Use landscape mode for more space

---

## 💡 Pro Tips

1. **First signature is primary** - The first signature you save is automatically set as primary
2. **Name your signatures** - Use names like "Formal", "Casual", "Initials" for easy identification
3. **Practice before saving** - Use Clear button to start over until you're happy
4. **Download backups** - Download signatures as PNG files for backup

---

## 🔧 Component Integration

### Using SignatureCanvas in Your Code:

```vue
<template>
  <SignatureCanvas
    ref="signatureCanvas"
    width="100%"
    height="400px"
    @update="onSignatureUpdate"
  />
  <button @click="save">Save</button>
</template>

<script>
import SignatureCanvas from '@/components/SignatureCanvas.vue';
import { saveSignature } from '@/firebase/database';

export default {
  components: { SignatureCanvas },
  setup() {
    const signatureCanvas = ref(null);
    
    const onSignatureUpdate = (dataURL) => {
      console.log('Signature updated');
    };
    
    const save = async () => {
      const dataURL = signatureCanvas.value.getSignatureDataURL();
      await saveSignature(branchId, {
        dataURL,
        name: 'My Signature',
        isPrimary: false
      });
    };
    
    return { signatureCanvas, onSignatureUpdate, save };
  }
};
</script>
```

---

## 🔥 Firebase Functions Quick Reference

```javascript
import { 
  saveSignature, 
  getAllSignatures, 
  getPrimarySignature,
  updateSignature,
  deleteSignature 
} from '@/firebase/database';

// Save signature
await saveSignature('branch123', {
  dataURL: 'data:image/png;base64...',
  name: 'John Signature',
  isPrimary: false
});

// Get all signatures
const { success, data } = await getAllSignatures('branch123');

// Get primary signature
const { success, data } = await getPrimarySignature('branch123');

// Set as primary
await updateSignature('branch123', 'sig_id', { isPrimary: true });

// Delete
await deleteSignature('branch123', 'sig_id');
```

---

## ❓ FAQ

**Q: How many signatures can I save?**  
A: Unlimited, but we recommend keeping 5-10 for best organization.

**Q: Can I edit an existing signature?**  
A: Not directly, but you can create a new one and delete the old one.

**Q: What format are signatures saved in?**  
A: PNG format as base64 data URLs in Firebase Firestore.

**Q: Will signatures work offline?**  
A: Drawing works offline, but saving requires internet connection.

**Q: Can I use the same signature on invoices and receipts?**  
A: Yes! Saved signatures can be used on both.

---

## 🎨 Customization Options

### Canvas Size:
```vue
<SignatureCanvas width="1000px" height="500px" />
```

### Pen Settings (Default):
- **Size**: 2px (range: 1-10px)
- **Color**: Black (#000000)

### Canvas Background:
- **Light mode**: White (#FFFFFF)
- **Dark mode**: Slate-800 (#1e293b)

---

## ✅ Checklist for Production

- [ ] Test signature creation on desktop
- [ ] Test signature creation on mobile
- [ ] Verify Firebase saves correctly
- [ ] Check primary signature selection
- [ ] Test download functionality
- [ ] Test delete with confirmation
- [ ] Verify dark mode appearance
- [ ] Check touch events on tablet

---

## 🚀 What's Next?

The signature feature is complete! Next steps:

1. **Integrate into Invoice Page**
   - Add signature selector dropdown
   - Load saved signatures
   - Insert into invoice template

2. **Integrate into Receipt Page**
   - Same as invoice integration
   - Display signature on printed receipts

3. **Advanced Features** (Future)
   - Import signature from image
   - Multiple signature styles
   - Signature templates

---

## 📞 Need Help?

Check these files for implementation details:
- `SIGNATURE_FEATURE_GUIDE.md` - Complete technical guide
- `src/components/SignatureCanvas.vue` - Canvas component
- `src/pages/SignaturePage.vue` - Signature page
- `src/firebase/database.js` - Firebase functions

---

**🎉 You're all set! Start creating beautiful digital signatures for your invoices and receipts.**
