# ⚡ Nikkah SVG Replacement - Quick Test Guide

## 🚀 **30-Second Test**

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Navigate**
```
http://localhost:8100/home → Auto Design → Sticker → Wedding
```

### **Step 3: Test Replacement**

Copy and paste this into the description field:

```
Congratulations on your nikkah ceremony (Ahmed Fatima) 15th March 2025 Rahman Family
```

**Expected Result:**
- ✅ "Alhamdulillahi ON YOUR WEDDING CEREMONY" text disappears
- ✅ Nikkah SVG graphic appears in its place
- ✅ Names, date, and courtesy text still update normally

---

## 📝 **Test Cases**

### **Test 1: Trigger Replacement** ✅

**Input:**
```
Congratulations on your nikkah ceremony
```

**Expected:**
- ✅ Nikkah SVG appears
- ✅ Console: `✅ SVG text replaced with: /weddigTitlesNiKkah/Nikkah.svg`

---

### **Test 2: Restore Original** 🔄

**Input:**
```
Congratulations on your wedding ceremony
```
(Remove "nikkah")

**Expected:**
- ✅ Nikkah SVG disappears
- ✅ Original text reappears
- ✅ Console: `🔄 Original text elements restored`

---

### **Test 3: Case Insensitive** 🔤

**Input:**
```
CONGRATULATION on your NIKKAH
```

**Expected:**
- ✅ Replacement triggers (case doesn't matter)

---

### **Test 4: Partial Keywords** ❌

**Input:**
```
Congratulations on your wedding
```
(Missing "nikkah")

**Expected:**
- ❌ No replacement
- ✅ Original text remains

---

### **Test 5: Full Example** 🎉

**Input:**
```
Congratulation on your nikkah ceremony (Muhammad Aisha) 20th April 2025 Ibrahim Family
```

**Expected:**
- ✅ Nikkah SVG appears
- ✅ Name 1: "MUHAMMAD"
- ✅ Name 2: "AISHA"
- ✅ Date: "on 20th April 2025"
- ✅ Courtesy: "CUT-CEE: Ibrahim Family"

---

## 🔍 **Visual Check**

### **Before (No Keywords):**
```
Alhamdulillahi
   ON YOUR
   WEDDING
  CEREMONY
```

### **After (With "congratulation" + "nikkah"):**
```
[Nikkah SVG Graphic]
  WEDDING
  NIKKAH
```

---

## 🐛 **Debugging**

Open browser console (F12) and look for:

**Success Messages:**
```
✅ SVG text replaced with: /weddigTitlesNiKkah/Nikkah.svg
📐 Scaled dimensions: 850.44×364.67 (scale: 1.18)
```

**Restoration Messages:**
```
🔄 Original text elements restored
```

**Error Messages (if any):**
```
❌ Failed to fetch SVG: [url]
❌ Invalid SVG file
```

---

## ✅ **Quick Checklist**

- [ ] Server running (`npm run dev`)
- [ ] Navigated to Wedding sticker
- [ ] Typed "Congratulations on your nikkah ceremony"
- [ ] Nikkah SVG appeared
- [ ] Removed "nikkah" from description
- [ ] Original text restored
- [ ] Names, date, courtesy still update correctly
- [ ] No console errors

---

## 🎯 **Keywords to Remember**

**Both required (case-insensitive):**
1. `congratulation` (or `congratulations`)
2. `nikkah`

**Examples that work:**
- ✅ "Congratulations on your nikkah"
- ✅ "Congratulation nikkah ceremony"
- ✅ "CONGRATULATION NIKKAH"
- ✅ "congratulation on your wedding nikkah"

**Examples that DON'T work:**
- ❌ "Congratulations on your wedding" (no "nikkah")
- ❌ "Nikkah ceremony" (no "congratulation")
- ❌ "Welcome on your nikkah" (no "congratulation")

---

## 🎨 **Random SVG Selection**

The system randomly selects from 3 SVG files:
1. `/weddigTitlesNiKkah/Nikkah.svg`
2. `/weddigTitlesNiKkah/Nikkah1.svg`
3. `/weddigTitlesNiKkah/Nikkah2.svg`

**To test random selection:**
1. Type the trigger keywords
2. Reload the page
3. Type the trigger keywords again
4. Check console to see which SVG was selected

---

**That's it! The feature is ready to use!** 🎉✨

