# 🚀 Wedding Sticker Template - Quick Test Guide

## ⚡ Quick Start (2 Minutes)

### **Step 1: Start the Server**
```bash
npm run dev
```

### **Step 2: Open the App**
Navigate to: `http://localhost:8100/home`

### **Step 3: Access Sticker Template**
1. Click **"Auto Design"** dropdown
2. Select **"Sticker"**

### **Step 4: Select Wedding Category**
1. Click the **"Wedding"** category pill
2. The wedding sticker preview will appear below the description field

### **Step 5: Test Real-time Updates**

Copy and paste these examples into the description field and watch the preview update instantly!

---

## 📝 Test Examples

### **Example 1: Complete Wedding Details**
```
Congratulations on your wedding! Sarah and Ahmed, 15th April 2025, courtesy: Rahman Family
```

**Expected Updates:**
- ✅ Blessing: "Congratulations"
- ✅ Event: "WEDDING CEREMONY"
- ✅ Names: "SARAH" & "AHMED"
- ✅ Date: "on 15th April 2025"
- ✅ Courtesy: "CUT-CEE: Rahman Family"

---

### **Example 2: Different Format**
```
Wedding ceremony for Fatima & Ibrahim on 20th June, 2025. From: Yusuf Family
```

**Expected Updates:**
- ✅ Blessing: "Congratulations"
- ✅ Event: "WEDDING CEREMONY"
- ✅ Names: "FATIMA" & "IBRAHIM"
- ✅ Date: "on 20th June, 2025"
- ✅ Courtesy: "CUT-CEE: Yusuf Family"

---

### **Example 3: Minimal Input**
```
Congratulations! Aisha and Omar wedding
```

**Expected Updates:**
- ✅ Blessing: "Congratulations"
- ✅ Event: "WEDDING CEREMONY"
- ✅ Names: "AISHA" & "OMAR"
- ✅ Date: (keeps default)
- ✅ Courtesy: (keeps default)

---

### **Example 4: With "By" Keyword**
```
Wedding of Zainab and Hassan on 10th August 2025, by: Ibrahim Family
```

**Expected Updates:**
- ✅ Blessing: "Congratulations"
- ✅ Event: "WEDDING CEREMONY"
- ✅ Names: "ZAINAB" & "HASSAN"
- ✅ Date: "on 10th August 2025"
- ✅ Courtesy: "CUT-CEE: Ibrahim Family"

---

### **Example 5: Different Date Format**
```
Congratulations on your marriage! John & Mary, 1st January, 2026. Courtesy: Smith Family
```

**Expected Updates:**
- ✅ Blessing: "Congratulations"
- ✅ Event: "WEDDING CEREMONY"
- ✅ Names: "JOHN" & "MARY"
- ✅ Date: "on 1st January, 2026"
- ✅ Courtesy: "CUT-CEE: Smith Family"

---

## 🎯 What to Look For

### **Real-time Updates**
- Type slowly and watch each field update as you type
- The preview should update **instantly** (no delay)

### **Smart Detection**
- Wedding keywords trigger event type change
- Dates are automatically extracted and formatted
- Names are capitalized automatically
- Courtesy/family names are prefixed with "CUT-CEE:"

### **Visual Feedback**
- The SVG preview should be visible and clear
- Text should be properly positioned
- Colors should match the design (waves, text colors)

---

## 🐛 Troubleshooting

### **Preview Not Showing**
1. Make sure you selected the "Wedding" category
2. Check browser console for errors (F12)
3. Verify the SVG file exists at: `public/templates/wedding-sticker/template.svg`

### **Text Not Updating**
1. Make sure you're typing in the description field
2. Check that the wedding category is selected
3. Open browser console and look for errors

### **SVG Not Loading**
1. Check the network tab (F12 → Network)
2. Look for request to `/templates/wedding-sticker/template.svg`
3. Should return 200 OK

---

## 📸 Expected Visual

The preview should show:
- **Background:** Light gray with colorful wave layers
- **Top Text:** "Congratulations" (or "Alhamdulillahi" by default)
- **Middle Text:** "ON YOUR WEDDING CEREMONY"
- **Names:** Two large names in white and yellow
- **Date:** Below names in white
- **Courtesy:** At bottom in yellow

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ Preview appears when you select "Wedding" category
- ✅ Text updates as you type (real-time)
- ✅ Wedding keywords change the blessing text
- ✅ Dates are extracted and formatted correctly
- ✅ Names are detected and capitalized
- ✅ Courtesy/family names are prefixed properly

---

## 🎉 Quick Test Checklist

- [ ] Server running on http://localhost:8100
- [ ] Navigated to /home
- [ ] Clicked Auto Design → Sticker
- [ ] Selected "Wedding" category
- [ ] Preview container visible
- [ ] Typed test description
- [ ] Blessing text updated
- [ ] Event type changed to "WEDDING"
- [ ] Names extracted and displayed
- [ ] Date extracted and formatted
- [ ] Courtesy text updated
- [ ] All updates happened in real-time

---

## 🚀 Next Steps

Once you've confirmed it's working:

1. **Try your own descriptions** - Get creative!
2. **Test edge cases** - What happens with unusual input?
3. **Check responsiveness** - Resize the browser window
4. **Test on mobile** - Open on your phone

---

## 💡 Pro Tips

1. **Type slowly** to see each update happen
2. **Use different name formats** (and, &, comma)
3. **Try different date formats** (with/without commas)
4. **Test different courtesy keywords** (courtesy, from, by)
5. **Mix and match** - Combine different patterns

---

## 📞 Need Help?

If something isn't working:

1. **Check the console** (F12 → Console)
2. **Check the network** (F12 → Network)
3. **Verify file paths** - Make sure all files exist
4. **Clear cache** - Hard refresh (Ctrl+Shift+R)

---

## 🎯 Expected Behavior

**Input:**
```
Congratulations on your wedding! Sarah and Ahmed, 15th April 2025, courtesy: Rahman Family
```

**Output in Preview:**
```
Congratulations
ON YOUR
WEDDING
CEREMONY

SARAH
AHMED

on 15th April 2025

CUT-CEE: Rahman Family
```

---

## ✨ That's It!

The wedding sticker template system is ready to use. Start typing and watch the magic happen! 🎉

**Happy Testing!** 🚀

