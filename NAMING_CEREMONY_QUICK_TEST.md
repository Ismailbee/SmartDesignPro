# 🧪 Naming Ceremony Template - Quick Test Guide

## ⚡ QUICK START (5 Minutes)

Follow these steps to test the naming ceremony template:

---

## 📋 STEP 1: Start the Application

### **Frontend (if not running):**

```powershell
npm run dev
```

Should see:
```
VITE v5.0.8  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### **Backend (if not running):**

```powershell
.\start-backend.ps1
```

OR manually:

```powershell
npm install express cors socket.io multer
node auto-design-server.cjs
```

Should see:
```
🚀 Auto Design Server running on http://localhost:3003
📁 Uploads directory: C:\...\auto-design-uploads
🔌 Socket.io ready for connections
```

---

## 📋 STEP 2: Navigate to Naming Ceremony

1. **Open browser**: `http://localhost:5173`

2. **Login** (if not logged in)

3. **Click "Auto Design"** in the header

4. **Select "Naming Ceremony"** (should be first in the list)

5. **You should see** the Auto Design page with naming ceremony form

---

## 📋 STEP 3: Fill in the Form

### **Text Fields:**

Fill in these example values:

```
Subtitle: Alhamdulillah on your
Title: Naming ceremony
Child Name (First): MUHAMMAD
Child Full Name: AL-AMIN AHMAD
Date: 5TH
Month: OCTOBER
Year: 2025
Courtesy Text: COURTESY: MUM
```

### **Colors:**

Use these default colors (or customize):

```
Background Color: #8b1538 (Maroon)
Primary Color: #FFD700 (Gold)
Accent Color: #DAA520 (Dark Gold)
```

### **Baby Photo:**

Upload any baby photo (or use a test image)

---

## 📋 STEP 4: Generate Design

1. **Click "Generate Design"** button

2. **Watch the progress:**
   - Purple progress bar (if background removal enabled)
   - Cyan progress bar (design generation)

3. **Wait for completion** (should take 5-10 seconds)

4. **Preview should appear** in the right panel

---

## 📋 STEP 5: Verify Results

### **Check the Form:**

- ✅ All 8 text fields visible
- ✅ 3 color pickers visible
- ✅ Baby photo upload visible
- ✅ Logo upload hidden (not needed for naming ceremony)
- ✅ Generate button enabled

### **Check the Preview:**

- ✅ Design preview appears
- ✅ All text is visible
- ✅ Baby photo is displayed
- ✅ Colors are applied correctly
- ✅ Layout looks professional

---

## 🐛 TROUBLESHOOTING

### **Issue 1: "Naming Ceremony" not in dropdown**

**Solution:**
- Refresh the page
- Check `src/components/home/AutoDesignDropdown.vue`
- Verify "Naming Ceremony" is in the categories array

### **Issue 2: Form fields not showing**

**Solution:**
- Check browser console for errors
- Verify `selectedCategory === 'naming-ceremony'` condition
- Check `src/views/AutoDesignPage.vue`

### **Issue 3: Colors not working**

**Solution:**
- Check `src/types/auto-design.ts` has `background` and `accent` fields
- Verify `src/stores/autoDesign.ts` has default color values
- Check browser console for TypeScript errors

### **Issue 4: Backend not connecting**

**Solution:**
- Verify backend is running on port 3003
- Check `http://localhost:3003/health` in browser
- Restart backend server
- Check firewall settings

### **Issue 5: Generation fails**

**Solution:**
- Check backend terminal for errors
- Verify all required fields are filled
- Check baby photo is uploaded
- Try without background removal first

---

## ✅ SUCCESS CRITERIA

Your test is successful if:

1. ✅ "Naming Ceremony" appears in Auto Design dropdown
2. ✅ Form shows 8 text fields + 3 color pickers + baby photo upload
3. ✅ All fields can be filled without errors
4. ✅ "Generate Design" button works
5. ✅ Progress bar shows during generation
6. ✅ Preview appears after generation
7. ✅ No console errors

---

## 🎯 WHAT TO TEST

### **Basic Functionality:**

- [ ] Navigate to naming ceremony template
- [ ] Fill in all text fields
- [ ] Upload baby photo
- [ ] Change colors
- [ ] Generate design
- [ ] View preview

### **Edge Cases:**

- [ ] Very long names
- [ ] Special characters in names
- [ ] Different date formats
- [ ] Large baby photos (>5MB)
- [ ] Different color combinations
- [ ] Empty fields (should show validation)

### **UI/UX:**

- [ ] Form is responsive
- [ ] Color pickers work smoothly
- [ ] File upload shows preview
- [ ] Progress bar animates correctly
- [ ] Preview modal opens/closes
- [ ] Download buttons work

---

## 📊 EXPECTED BEHAVIOR

### **When you select "Naming Ceremony":**

1. URL changes to: `/auto-design?category=naming-ceremony`
2. Page title shows: "Auto Design: Naming Ceremony"
3. Form shows naming ceremony specific fields
4. Logo upload is hidden
5. Image upload label says "Baby Photo"
6. 3 color pickers appear (Background, Primary, Accent)

### **When you click "Generate Design":**

1. Button becomes disabled
2. Loading state appears
3. Progress bar starts at 0%
4. Progress updates every ~800ms
5. Messages change (Initializing → Processing → Finalizing)
6. Preview appears on completion
7. Button re-enables

---

## 🎨 VISUAL VERIFICATION

### **The generated design should have:**

- ✅ Maroon/burgundy background
- ✅ "Alhamdulillah on your" in white script font (top left)
- ✅ Stars decoration (top)
- ✅ "Naming ceremony" in large yellow text
- ✅ "MUHAMMAD" in large white text
- ✅ "AL-AMIN AHMAD" in yellow text
- ✅ Date circle with white background (left side)
- ✅ Baby photo in circular frame (right side)
- ✅ Floral decorations around photo
- ✅ "COURTESY: MUM" in yellow box (bottom right)
- ✅ Decorative elements (waves, patterns)

---

## 🚀 NEXT STEPS AFTER TESTING

### **If everything works:**

1. ✅ Mark template as complete
2. ✅ Create more template variations
3. ✅ Add to production
4. ✅ Share with users

### **If issues found:**

1. 🐛 Document the issue
2. 🔧 Fix the bug
3. 🧪 Re-test
4. ✅ Verify fix works

---

## 📝 TEST REPORT TEMPLATE

After testing, fill this out:

```
Date: ___________
Tester: ___________

✅ PASSED TESTS:
- [ ] Navigation works
- [ ] Form displays correctly
- [ ] All fields editable
- [ ] Colors changeable
- [ ] Photo upload works
- [ ] Generate button works
- [ ] Preview appears
- [ ] Download works

❌ FAILED TESTS:
- [ ] Issue 1: ___________
- [ ] Issue 2: ___________

📝 NOTES:
___________
___________
```

---

## 🎉 READY TO TEST!

Everything is set up and ready. Just follow the steps above and you'll have a beautiful naming ceremony invitation in minutes!

**Good luck with testing! 🚀**

