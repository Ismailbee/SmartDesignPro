# ⚡ Wedding Sticker - Updated System Quick Test

## 🚀 Quick Test (2 Minutes)

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Navigate**
```
http://localhost:8100/home → Auto Design → Sticker → Wedding
```

### **Step 3: Open Browser Console**
Press `F12` to see console logs

---

## 📝 **Test Examples**

### **Test 1: Bracket-Based Name Extraction** ✅

**Input:**
```
Congratulations on your wedding (Sarah Ahmed)
```

**Expected:**
- 👤 Name 1: "SARAH"
- 👤 Name 2: "AHMED"
- 🔤 Original font (both names ≤ 7 chars)

**Console:**
```
👤 Name 1 updated: "SARAH"
👤 Name 2 updated: "AHMED"
🔤 Name 1 font reset to original (5 chars)
🔤 Name 2 font reset to original (5 chars)
```

---

### **Test 2: Long Name - Font Change** ✅

**Input:**
```
Congratulations on your wedding (Elizabeth Mohammed)
```

**Expected:**
- 👤 Name 1: "ELIZABETH" (9 chars)
- 👤 Name 2: "MOHAMMED" (8 chars)
- 🔤 AlternateGothic2 BT font for BOTH names

**Console:**
```
👤 Name 1 updated: "ELIZABETH"
👤 Name 2 updated: "MOHAMMED"
🔤 Name 1 font changed to AlternateGothic2 BT (9 chars)
🔤 Name 2 font changed to AlternateGothic2 BT (8 chars)
```

---

### **Test 3: One Long Name - Both Fonts Change** ✅

**Input:**
```
Congratulations on your wedding (Elizabeth Ali)
```

**Expected:**
- 👤 Name 1: "ELIZABETH" (9 chars)
- 👤 Name 2: "ALI" (3 chars)
- 🔤 AlternateGothic2 BT font for BOTH names (because Elizabeth > 7)

**Console:**
```
👤 Name 1 updated: "ELIZABETH"
👤 Name 2 updated: "ALI"
🔤 Name 1 font changed to AlternateGothic2 BT (9 chars)
🔤 Name 2 font changed to AlternateGothic2 BT (3 chars)
```

---

### **Test 4: Exactly 8 Characters - Font Change** ✅

**Input:**
```
Congratulations on your wedding (Mohammed Ali)
```

**Expected:**
- 👤 Name 1: "MOHAMMED" (8 chars)
- 👤 Name 2: "ALI" (3 chars)
- 🔤 AlternateGothic2 BT font for BOTH names (because Mohammed = 8 > 7)

**Console:**
```
👤 Name 1 updated: "MOHAMMED"
👤 Name 2 updated: "ALI"
🔤 Name 1 font changed to AlternateGothic2 BT (8 chars)
🔤 Name 2 font changed to AlternateGothic2 BT (3 chars)
```

---

### **Test 5: Newline Does NOT Extract Names** ❌

**Input:** (Press Enter after "wedding")
```
Congratulations on your wedding
Sarah Ahmed
```

**Expected:**
- 👤 Name 1: "HANNATU" (default - NOT extracted)
- 👤 Name 2: "HARUNA" (default - NOT extracted)
- ❌ No name extraction logs

**Console:**
```
✨ Blessing updated: "Congratulations"
🎪 Event Type updated: "WEDDING"
(No name update logs)
```

---

### **Test 6: Plain Text Does NOT Extract Names** ❌

**Input:**
```
Congratulations on your wedding Sarah Ahmed
```

**Expected:**
- 👤 Name 1: "HANNATU" (default - NOT extracted)
- 👤 Name 2: "HARUNA" (default - NOT extracted)
- ❌ No name extraction logs

---

### **Test 7: Courtesy with "the family"** ✅

**Input:**
```
Congratulations on your wedding (Sarah Ahmed) courtesy: the family
```

**Expected:**
- 🏠 Courtesy: "CUT-CEE: the family"

**Console:**
```
🏠 Courtesy updated: "CUT-CEE: the family"
```

---

### **Test 8: Cut-cee with "anything"** ✅

**Input:**
```
Congratulations on your wedding (John Mary) cut-cee: anything
```

**Expected:**
- 🏠 Courtesy: "CUT-CEE: anything"

**Console:**
```
🏠 Courtesy updated: "CUT-CEE: anything"
```

---

### **Test 9: Misspelled "coutesy"** ✅

**Input:**
```
Congratulations on your wedding (Sarah Ahmed) coutesy: the organizers
```

**Expected:**
- 🏠 Courtesy: "CUT-CEE: the organizers"

**Console:**
```
🏠 Courtesy updated: "CUT-CEE: the organizers"
```

---

### **Test 10: Complete Example** ✅

**Input:**
```
Congratulations on your wedding ceremony (Elizabeth Mohammed) on 6th March, 2025 courtesy: the family
```

**Expected:**
- ✨ Blessing: "Congratulations"
- 🎪 Event Type: "WEDDING"
- 🎭 Ceremony: "CEREMONY"
- 👤 Name 1: "ELIZABETH" (AlternateGothic2 BT)
- 👤 Name 2: "MOHAMMED" (AlternateGothic2 BT)
- 📅 Date: "on 6th March, 2025"
- 🏠 Courtesy: "CUT-CEE: the family"

**Console:**
```
✨ Blessing updated: "Congratulations" (original font)
🎪 Event Type updated: "WEDDING" (original font)
✅ Ceremony text shown: "CEREMONY"
👤 Name 1 updated: "ELIZABETH"
👤 Name 2 updated: "MOHAMMED"
🔤 Name 1 font changed to AlternateGothic2 BT (9 chars)
🔤 Name 2 font changed to AlternateGothic2 BT (8 chars)
📅 Date updated: "on 6th March, 2025"
🏠 Courtesy updated: "CUT-CEE: the family"
```

---

## ✅ **Testing Checklist**

### **Name Extraction:**
- [ ] Names extracted from brackets `(Sarah Ahmed)`
- [ ] Names extracted from square brackets `[John Mary]`
- [ ] Names with "and" work: `(Sarah and Ahmed)`
- [ ] Names with "&" work: `(John & Mary)`
- [ ] Newline does NOT extract names
- [ ] Plain text does NOT extract names

### **Font Change:**
- [ ] Short names (≤7 chars) use original font
- [ ] Long names (>7 chars) trigger AlternateGothic2 BT
- [ ] Font changes for BOTH names when one is long
- [ ] Exactly 8 characters triggers font change
- [ ] Console logs show character count

### **Courtesy Text:**
- [ ] "courtesy:" accepts any text
- [ ] "coutesy:" (misspelling) works
- [ ] "cut-cee:" accepts any text
- [ ] Original capitalization preserved
- [ ] Output format: "CUT-CEE: [text]"

---

## 🎯 **Success Criteria**

You'll know it's working when:
- ✅ Names ONLY extracted from brackets
- ✅ Pressing Enter does NOT extract names
- ✅ Font changes to AlternateGothic2 BT when name > 7 chars
- ✅ BOTH names change font (not just the long one)
- ✅ Courtesy accepts any text after keyword
- ✅ Console shows all extraction logs

---

## 🐛 **Troubleshooting**

### **Names Not Extracted:**
1. Make sure names are inside brackets: `(Name1 Name2)`
2. Check browser console for errors
3. Verify brackets are `()` or `[]`

### **Font Not Changing:**
1. Check name length (must be > 7 characters)
2. Look for console logs showing character count
3. Verify font "AlternateGothic2 BT" is available

### **Courtesy Not Detected:**
1. Check keyword spelling: "courtesy:", "coutesy:", "cut-cee:"
2. Make sure there's a colon after keyword
3. Verify there's text after the colon

---

## 💡 **Pro Tips**

1. **Use Brackets:** Always put names in brackets for extraction
2. **Check Console:** Open F12 to see detailed logs
3. **Test Font Change:** Try names like "Elizabeth", "Mohammed", "Christopher"
4. **Test Courtesy:** Try different text after keywords

---

## 🚀 **Quick Reference**

### **Name Extraction:**
- ✅ `(Sarah Ahmed)` → Works
- ❌ `Sarah Ahmed` → Does NOT work
- ❌ Newline → Does NOT work

### **Font Change Threshold:**
- ≤ 7 chars → Original font
- > 7 chars → AlternateGothic2 BT

### **Courtesy Keywords:**
- `courtesy:` → Works
- `coutesy:` → Works (misspelling)
- `cut-cee:` → Works

**Happy Testing!** 🎯✨📝

