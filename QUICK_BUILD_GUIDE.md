# 🚀 Quick Build & Test Guide

## Rebuild Your APK (3 Steps)

### Step 1: Build Project
```powershell
npm run build
```

### Step 2: Sync Capacitor
```powershell
npx cap sync android
```

### Step 3: Build APK
```powershell
npx cap open android
```
Then in Android Studio:
**Build > Build Bundle(s) / APK(s) > Build APK(s)**

---

## What's Fixed ✅

### 1. Export to File Manager
**Before**: Files download but not visible ❌  
**Now**: Files appear in Documents folder ✅

### 2. Share via Social Media
**Before**: Only text link shared ❌  
**Now**: Actual IMAGE attached ✅

---

## Test Checklist

After installing new APK on your phone:

### Export Tests:
- [ ] Export PDF → Check Documents folder
- [ ] Export JPEG → Check Documents folder
- [ ] Files visible in file manager?

### Share Tests:
- [ ] Share to WhatsApp → Image preview shows?
- [ ] Share to Telegram → Image preview shows?
- [ ] Share to Email → Image attached?

---

## What Changed in Code

### Invoice File:
`src/views/micro-apps/Ican/src/pages/InvoiceIcan/PreviewIcanInvoice.vue`
- Added: Capacitor Filesystem & Share imports
- Updated: `shareToSocialMedia()` function

### Receipt File:
`src/views/micro-apps/Ican/src/pages/ReceiptIcan/PreviewIcanReceipt.vue`
- Added: Capacitor Filesystem & Share imports
- Updated: `shareToSocialMedia()` function

### Plugins Installed:
- `@capacitor/filesystem` - For saving files
- `@capacitor/share` - For native sharing

---

## Expected Results

### When you click "Share via WhatsApp":

**Before:**
```
Message: "Check out this invoice... [long link]"
No image 😞
```

**After:**
```
📸 [Invoice Image Preview]
✅ Ready to send!
```

### When you click "Export PDF":

**Before:**
```
File downloads... but where? 🤔
Can't find in file manager ❌
```

**After:**
```
File saved to Documents ✅
Found in: File Manager > Documents > invoice-xxxxx.jpg
```

---

## Troubleshooting

**Q: Still seeing links instead of images?**  
A: Make sure you installed the **NEW APK** after rebuilding

**Q: Files not in file manager?**  
A: Check: File Manager > Documents folder

**Q: Need to uninstall old app?**  
A: Yes, uninstall first then install new APK

---

## Need More Help?

See detailed guides:
- [APK_FIX_COMPLETE.md](./APK_FIX_COMPLETE.md) - Full summary
- [CAPACITOR_SHARE_FIX.md](./CAPACITOR_SHARE_FIX.md) - Technical details

---

**Ready? Build your APK now!** 🚀
