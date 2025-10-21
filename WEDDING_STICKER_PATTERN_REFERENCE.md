# 📋 Wedding Sticker Template - Pattern Reference Card

## Quick Reference for Text Detection Patterns

---

## 🎯 Input Format

```
[BLESSING] on your [EVENT TYPE] (NAME1 NAME2) [DATE] [FAMILY NAME]
```

### **Example:**
```
congratulations on your wedding ceremony (Sarah Ahmed) 5th March 2025 Rahman Family
```

---

## 📝 Pattern Breakdown

### **1. Blessing Detection**

**Trigger Words:**
- `congratulation` (singular)
- `congratulations` (plural)
- `congrats` (short form)
- Common misspellings: `congrtulation`, `congratulaton`, etc.

**Output:** "Congratulations"

**Examples:**
```
congratulation on your...  → "Congratulations"
congratulations on your... → "Congratulations"
congrats on your...        → "Congratulations"
congrtulation on your...   → "Congratulations"
```

---

### **2. Event Type Detection**

**Pattern:** `on your [EVENT TYPE]`

**How it works:**
- Extracts text after "on your"
- Splits into event type and ceremony
- Last word = ceremony, rest = event type

**Examples:**
```
on your wedding ceremony        → Event: "WEDDING", Ceremony: "CEREMONY"
on your Quran Walimat          → Event: "QURAN", Ceremony: "WALIMAT"
on your graduation             → Event: "GRADUATION", Ceremony: ""
on your birthday celebration   → Event: "BIRTHDAY", Ceremony: "CELEBRATION"
on your engagement party       → Event: "ENGAGEMENT", Ceremony: "PARTY"
```

---

### **3. Name Detection**

**Pattern:** `(NAME1 NAME2)` or `[NAME1 NAME2]`

**Supported Formats:**
- `(Sarah Ahmed)` - Space-separated
- `[John Mary]` - Square brackets
- `(Fatima and Ibrahim)` - With "and"
- `(Aisha & Omar)` - With "&"

**Output:** Both names in UPPERCASE

**Examples:**
```
(Sarah Ahmed)           → Name1: "SARAH", Name2: "AHMED"
[John Mary]             → Name1: "JOHN", Name2: "MARY"
(Fatima and Ibrahim)    → Name1: "FATIMA", Name2: "IBRAHIM"
(Aisha & Omar)          → Name1: "AISHA", Name2: "OMAR"
```

**Fallback:** If no brackets, looks for "Name1 and Name2" or "Name1 & Name2" pattern

---

### **4. Date Detection**

**Pattern:** After closing bracket `)` or `]`, followed by a number

**Supported Formats:**
- `5th March 2025` - With ordinal suffix
- `15 April 2025` - Without suffix
- `22nd June, 2025` - With comma
- `1st January 2026` - Any month

**Output:** "on [DATE]"

**Examples:**
```
(Names) 5th March 2025     → "on 5th March 2025"
[Names] 15 April 2025      → "on 15 April 2025"
(Names) 22nd June, 2025    → "on 22nd June, 2025"
[Names] 1st January 2026   → "on 1st January 2026"
```

---

### **5. Courtesy Detection**

**Pattern:** Text after the date

**How it works:**
- Finds the date in the text
- Extracts capitalized words after the date
- Prefixes with "CUT-CEE:"

**Examples:**
```
...2025 Rahman Family      → "CUT-CEE: Rahman Family"
...2025 Smith              → "CUT-CEE: Smith"
...2025 Yusuf Ahmed Family → "CUT-CEE: Yusuf Ahmed Family"
```

**Fallback:** If no date, looks for keywords: `courtesy:`, `from:`, `by:`

---

## 🎨 Complete Examples

### **Example 1: Wedding Ceremony**
```
Input:
congratulations on your wedding ceremony (Sarah Ahmed) 5th March 2025 Rahman Family

Output:
- Blessing: "Congratulations"
- Occasion: "ON YOUR"
- Event Type: "WEDDING"
- Ceremony: "CEREMONY"
- Name1: "SARAH"
- Name2: "AHMED"
- Date: "on 5th March 2025"
- Courtesy: "CUT-CEE: Rahman Family"
```

---

### **Example 2: Quran Walimat**
```
Input:
congrats on your Quran Walimat [Fatima Ibrahim] 10th April 2025 Yusuf Family

Output:
- Blessing: "Congratulations"
- Occasion: "ON YOUR"
- Event Type: "QURAN"
- Ceremony: "WALIMAT"
- Name1: "FATIMA"
- Name2: "IBRAHIM"
- Date: "on 10th April 2025"
- Courtesy: "CUT-CEE: Yusuf Family"
```

---

### **Example 3: Graduation**
```
Input:
congratulation on your graduation (John Mary) 15th June 2025 Smith

Output:
- Blessing: "Congratulations"
- Occasion: "ON YOUR"
- Event Type: "GRADUATION"
- Ceremony: ""
- Name1: "JOHN"
- Name2: "MARY"
- Date: "on 15th June 2025"
- Courtesy: "CUT-CEE: Smith"
```

---

### **Example 4: Birthday Celebration**
```
Input:
congrats on your birthday celebration (Aisha & Omar) 20th July 2025 Hassan Family

Output:
- Blessing: "Congratulations"
- Occasion: "ON YOUR"
- Event Type: "BIRTHDAY"
- Ceremony: "CELEBRATION"
- Name1: "AISHA"
- Name2: "OMAR"
- Date: "on 20th July 2025"
- Courtesy: "CUT-CEE: Hassan Family"
```

---

## 🔧 Pattern Priority

When multiple patterns match, the system uses this priority:

1. **Bracket-based name detection** (highest priority)
2. **Date after brackets**
3. **Courtesy after date**
4. **Fallback patterns** (lowest priority)

---

## ✅ Best Practices

### **For Best Results:**

1. **Use the standard format:**
   ```
   [blessing] on your [event] (name1 name2) [date] [family]
   ```

2. **Put names in brackets:**
   ```
   (Sarah Ahmed) or [John Mary]
   ```

3. **Include "on your" before event type:**
   ```
   on your wedding ceremony
   ```

4. **Use proper date format:**
   ```
   5th March 2025 or 15 April 2025
   ```

5. **Add family name after date:**
   ```
   ...2025 Rahman Family
   ```

---

## 🎯 Quick Templates

### **Wedding:**
```
congratulations on your wedding ceremony (Bride Groom) 5th March 2025 Family Name
```

### **Quran Walimat:**
```
congratulations on your Quran Walimat (Child Parent) 10th April 2025 Family Name
```

### **Graduation:**
```
congratulations on your graduation (Graduate Name) 15th June 2025 Family Name
```

### **Birthday:**
```
congratulations on your birthday celebration (Birthday Person) 20th July 2025 Family Name
```

### **Engagement:**
```
congratulations on your engagement party (Partner1 Partner2) 25th August 2025 Family Name
```

---

## 🐛 Common Issues

### **Event Type Not Detected**
❌ `congratulations wedding ceremony`
✅ `congratulations on your wedding ceremony`

### **Names Not Detected**
❌ `Sarah Ahmed`
✅ `(Sarah Ahmed)` or `[Sarah Ahmed]`

### **Date Not Detected**
❌ `March 5th 2025`
✅ `5th March 2025`

### **Courtesy Not Detected**
❌ `...2025 rahman family` (lowercase)
✅ `...2025 Rahman Family` (capitalized)

---

## 📊 Regex Patterns (Technical)

For developers:

```javascript
// Congratulations (flexible)
/congr[ae]t[us]?l?[aeiou]*t?[io]*[on]*s?/i

// Event Type
/on\s+your\s+([^.,\n()[\]]+)/i

// Names in Brackets
/[\(\[]([^\)\]]+)[\)\]]/

// Date After Brackets
/[\)\]]\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|...|December)[,.]?\s*\d{4})/i

// Courtesy After Date
/\d{4}\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
```

---

## ✨ Summary

**Input Format:**
```
[blessing] on your [event] (names) [date] [family]
```

**Example:**
```
congratulations on your wedding ceremony (Sarah Ahmed) 5th March 2025 Rahman Family
```

**Output:**
- ✅ Flexible blessing detection
- ✅ Dynamic event type extraction
- ✅ Bracket-based name detection
- ✅ Smart date detection
- ✅ Intelligent courtesy detection

---

**Use this reference card to create perfect wedding sticker descriptions!** 🎉

