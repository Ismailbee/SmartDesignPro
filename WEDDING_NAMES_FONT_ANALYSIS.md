# 📊 Wedding Sticker Names - Font & Sizing Analysis

## Executive Summary

This document provides a comprehensive analysis of the naming logic, text structure, and font sizing behavior in the wedding sticker SVG template (`public/svg/weddingStiker/template.svg`), with specific focus on the `#wedding-names-group` element.

---

## 1️⃣ Structure Analysis

### **SVG Template Structure**

The wedding names are contained within a group element with the following hierarchy:

```xml
<g id="wedding-names-group" transform="translate(270, 950) scale(3)">
  <text id="name1-first" x="10" y="42" class="fil0 fnt0">Suleiman </text>
  <text id="name-separator" x="-2.11" y="124.72" class="fil1 fnt1">&amp; </text>
  <text id="name2-first" x="60" y="118.01" class="fil0 fnt0">Ramatu </text>
  <text id="name1-last" x="98" y="72" class="fil1 fnt2">ABDULLAHI </text>
  <text id="name2-last" x="120" y="147.3" class="fil1 fnt2">YUNUSA </text>
</g>
```

### **Element Breakdown**

| Element ID | Content | Purpose | Position (x, y) |
|------------|---------|---------|-----------------|
| `name1-first` | "Suleiman" | First person's first name | (10, 42) |
| `name1-last` | "ABDULLAHI" | First person's last name | (98, 72) |
| `name-separator` | "&" | Separator between couples | (-2.11, 124.72) |
| `name2-first` | "Ramatu" | Second person's first name | (60, 118.01) |
| `name2-last` | "YUNUSA" | Second person's last name | (120, 147.3) |

### **Group Transform**

- **Translation**: `translate(270, 950)` - Positions the entire group
- **Scale**: `scale(3)` - Enlarges all elements by 3x
- **Original ViewBox**: `0 0 275.89 143.67` (from source SVG)

---

## 2️⃣ Font Family Identification

### **CSS Class Definitions (Lines 23-29)**

```xml
<style>
  .fil0 {fill:#FEFEFE}
  .fil1 {fill:#FFF212}
  .fnt2 {font-weight:bold;font-size:28.06px;font-family:'Campton Book'}
  .fnt0 {font-weight:normal;font-size:68.31px;font-family:'Times New Roman'}
  .fnt1 {font-weight:normal;font-size:84.02px;font-family:'Times New Roman'}
</style>
```

### **Font Assignment by Element**

| Element | Class | Font Family | Font Size | Font Weight | Fill Color |
|---------|-------|-------------|-----------|-------------|------------|
| `name1-first` | `fil0 fnt0` | **Times New Roman** | 68.31px | normal | #FEFEFE (white) |
| `name1-last` | `fil1 fnt2` | **Campton Book** | 28.06px | bold | #FFF212 (yellow) |
| `name-separator` | `fil1 fnt1` | **Times New Roman** | 84.02px | normal | #FFF212 (yellow) |
| `name2-first` | `fil0 fnt0` | **Times New Roman** | 68.31px | normal | #FEFEFE (white) |
| `name2-last` | `fil1 fnt2` | **Campton Book** | 28.06px | bold | #FFF212 (yellow) |

### **✅ Font Preservation Status**

**First Names (name1-first, name2-first):**
- ✅ **Times New Roman** is correctly applied
- Font size: 68.31px (before 3x scale = ~205px after scale)
- Color: White (#FEFEFE)

**Last Names (name1-last, name2-last):**
- ❌ **NOT Times New Roman** - Uses "Campton Book" instead
- Font size: 28.06px (before 3x scale = ~84px after scale)
- Color: Yellow (#FFF212)

**Separator (&):**
- ✅ **Times New Roman** is correctly applied
- Font size: 84.02px (before 3x scale = ~252px after scale)
- Color: Yellow (#FFF212)

---

## 3️⃣ Current Dynamic Font Logic

### **Implementation Location**
`src/composables/useWeddingStickerUpdater.ts` (Lines 623-660)

### **Current Behavior**

The system currently implements **font-family switching** (NOT font-size reduction):

```typescript
// Check if either name is longer than 7 characters
if (name1Length > 7 || name2Length > 7) {
  // Apply AlternateGothic2 BT font to BOTH name elements
  if (elements.name1First) elements.name1First.setAttribute('font-family', 'AlternateGothic2 BT')
  if (elements.name1Last) elements.name1Last.setAttribute('font-family', 'AlternateGothic2 BT')
  if (elements.name2First) elements.name2First.setAttribute('font-family', 'AlternateGothic2 BT')
  if (elements.name2Last) elements.name2Last.setAttribute('font-family', 'AlternateGothic2 BT')
} else {
  // Reset to original font if both names are 7 characters or less
  if (elements.name1First) elements.name1First.removeAttribute('font-family')
  if (elements.name1Last) elements.name1Last.removeAttribute('font-family')
  if (elements.name2First) elements.name2First.removeAttribute('font-family')
  if (elements.name2Last) elements.name2Last.removeAttribute('font-family')
}
```

### **Current Logic Summary**

| Name Length | Action | Font Family |
|-------------|--------|-------------|
| ≤ 7 characters | Keep original | Times New Roman (from SVG class) |
| > 7 characters | Change font | AlternateGothic2 BT |

**⚠️ Critical Finding:**
- Current implementation changes **font-family**, NOT **font-size**
- Threshold is **7 characters**, NOT **9 characters** as requested
- Position coordinates are NOT modified (correct behavior)

---

## 4️⃣ Gap Analysis: Requirements vs. Current Implementation

### **Requirement 1: Times New Roman Preservation**
- ✅ **PARTIAL**: First names use Times New Roman
- ❌ **FAIL**: Last names use Campton Book
- ❌ **FAIL**: Long names (>7 chars) switch to AlternateGothic2 BT

### **Requirement 2: Dynamic Font Sizing for Names > 9 Characters**
- ❌ **NOT IMPLEMENTED**: System changes font-family, not font-size
- ❌ **WRONG THRESHOLD**: Uses 7 characters instead of 9
- ❌ **MISSING**: No proportional font-size reduction logic

### **Requirement 3: Position Preservation**
- ✅ **CORRECT**: x, y coordinates are never modified
- ✅ **CORRECT**: Only font attributes are changed

### **Requirement 4: Alphabetic Character Counting**
- ❌ **NOT IMPLEMENTED**: Current logic counts ALL characters (including spaces, punctuation)
- Should count only letters: `name.replace(/[^a-zA-Z]/g, '').length`

---

## 5️⃣ Recommended Implementation

### **New Function: Calculate Dynamic Font Size**

```typescript
/**
 * Calculate appropriate font size for name elements based on alphabetic character count
 * Names with 9+ letters get proportionally reduced font size
 * Position (x, y) coordinates remain unchanged
 * 
 * @param text - The name text to measure
 * @param baseFontSize - Original font size from SVG (68.31px for first names, 28.06px for last names)
 * @returns Calculated font size in pixels
 */
const calculateNameFontSize = (text: string, baseFontSize: number): number => {
  // Count only alphabetic characters (ignore spaces, punctuation)
  const letterCount = text.replace(/[^a-zA-Z]/g, '').length
  
  if (letterCount <= 9) {
    // Short names: keep original size
    return baseFontSize
  } else {
    // Long names: reduce proportionally
    // Formula: newSize = baseSize * (9 / letterCount)
    // Example: 12 letters → 68.31 * (9/12) = 51.23px
    const scaleFactor = 9 / letterCount
    return baseFontSize * scaleFactor
  }
}
```

### **Application Logic**

```typescript
// Update first names with dynamic sizing
if (name1First && elements.name1First) {
  elements.name1First.textContent = name1First
  
  // Calculate and apply font size (keep Times New Roman)
  const fontSize = calculateNameFontSize(name1First, 68.31)
  elements.name1First.setAttribute('font-size', `${fontSize}px`)
  
  // Ensure Times New Roman is preserved
  elements.name1First.setAttribute('font-family', 'Times New Roman')
  
  console.log(`👤 Name 1 First: "${name1First}" (${name1First.replace(/[^a-zA-Z]/g, '').length} letters, ${fontSize.toFixed(2)}px)`)
}

// Similar logic for name1Last, name2First, name2Last
// Use baseFontSize = 28.06 for last names
```

---

## 6️⃣ Implementation Plan

### **Step 1: Add Font Size Calculation Function**
Location: `src/composables/useWeddingStickerUpdater.ts`

```typescript
const calculateNameFontSize = (text: string, baseFontSize: number): number => {
  const letterCount = text.replace(/[^a-zA-Z]/g, '').length
  return letterCount <= 9 ? baseFontSize : baseFontSize * (9 / letterCount)
}
```

### **Step 2: Update Name Elements with Dynamic Sizing**
Replace lines 573-596 with new logic that:
- Sets `textContent`
- Calculates font size using `calculateNameFontSize()`
- Sets `font-size` attribute
- Preserves `font-family="Times New Roman"`
- Does NOT modify x, y coordinates

### **Step 3: Remove Old Font-Family Switching Logic**
Remove or comment out lines 623-660 (the >7 character AlternateGothic2 BT logic)

### **Step 4: Update SVG Template (Optional)**
Change last name font from Campton Book to Times New Roman:
```xml
<!-- Before -->
.fnt2 {font-weight:bold;font-size:28.06px;font-family:'Campton Book'}

<!-- After -->
.fnt2 {font-weight:bold;font-size:28.06px;font-family:'Times New Roman'}
```

---

## 7️⃣ Testing Scenarios

| Name | Letter Count | Expected Font Size | Expected Font Family |
|------|--------------|-------------------|---------------------|
| "Sarah" | 5 | 68.31px (100%) | Times New Roman |
| "Elizabeth" | 9 | 68.31px (100%) | Times New Roman |
| "Christopher" | 11 | 55.89px (81.8%) | Times New Roman |
| "Bartholomew" | 11 | 55.89px (81.8%) | Times New Roman |
| "Al" | 2 | 68.31px (100%) | Times New Roman |

**Formula Verification:**
- Christopher: 68.31 × (9/11) = 55.89px ✅
- Bartholomew: 68.31 × (9/11) = 55.89px ✅

---

## 8️⃣ Summary

### **Current State**
- ✅ First names use Times New Roman
- ❌ Last names use Campton Book (should be Times New Roman)
- ❌ Font-family switching at 7 characters (should be font-size reduction at 9)
- ✅ Position coordinates preserved correctly

### **Required Changes**
1. Implement `calculateNameFontSize()` function
2. Apply dynamic font-size to all name elements
3. Preserve Times New Roman for ALL name elements
4. Use 9-letter threshold (not 7-character)
5. Count only alphabetic characters
6. Remove font-family switching logic

### **Files to Modify**
- `src/composables/useWeddingStickerUpdater.ts` (main logic)
- `public/svg/weddingStiker/template.svg` (optional: fix last name font)

---

**Would you like me to implement these changes now?** 🚀

