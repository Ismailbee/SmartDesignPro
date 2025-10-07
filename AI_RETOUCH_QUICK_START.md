# 🚀 AI Retouch - Quick Start Guide

## ⚡ Get Started in 3 Minutes

### **Step 1: Start the AI Retouch Server**

```bash
node ai-retouch-server.js
```

You should see:
```
============================================================
✨ AI Retouch Server
============================================================
🚀 Server running on http://localhost:3005
📊 Health check: http://localhost:3005/health
============================================================
```

### **Step 2: Start Your Frontend**

```bash
npm run dev
```

### **Step 3: Use AI Retouch**

1. **Open the Design Editor** - Click "Start Your Project" from home page
2. **Look for the Floating Button** - Bottom-right corner with ✨ icon
3. **Click the Button** - Opens quick actions menu
4. **Choose an Action:**
   - ⚡ **One-Click Retouch** - Apply all AI improvements
   - 🎨 **Color Palette** - Get color scheme suggestions
   - 📐 **Fix Layout** - Optimize alignment & spacing
   - ⚙️ **Open Panel** - Full retouch controls

---

## 🎨 **Features Overview**

### **Quick Actions (Floating Button)**

| Action | What It Does | Time |
|--------|--------------|------|
| One-Click Retouch | Applies all AI improvements automatically | ~2s |
| Color Palette | Suggests 4 harmonious color schemes | ~1s |
| Fix Layout | Aligns elements and fixes spacing | ~1s |
| Open Panel | Opens full AI retouch control panel | Instant |

### **AI Retouch Panel (Full Controls)**

Access via the ⚙️ button or the "🎨 Marketplace" button in the editor header.

**Available Features:**
- ✅ Color Palette Suggestions (Complementary, Analogous, Triadic, Monochromatic)
- ✅ Font Pairing Recommendations (5 professional combinations)
- ✅ Smart Alignment (Auto-align elements to grid)
- ✅ Auto Spacing (Consistent padding & margins)
- ✅ Balance Detection (Identify overcrowded areas)
- ✅ Content-Aware Scaling (Intelligent image resizing)
- ✅ Auto Layering (Optimize z-index hierarchy)
- ✅ Contrast & Brightness Enhancement
- ✅ Background Effects (Blur, fade, gradient)

---

## 🎯 **Common Use Cases**

### **1. Improve Color Scheme**

1. Click floating ✨ button
2. Select "🎨 Color Palette"
3. Browse 4 suggested palettes
4. Click "Apply" on your favorite
5. Done! Colors updated instantly

### **2. Fix Misaligned Elements**

1. Click floating ✨ button
2. Select "📐 Fix Layout"
3. Review suggested adjustments
4. Click "Apply" to fix alignment
5. Elements snap to perfect alignment

### **3. Get Professional Font Pairings**

1. Open AI Retouch Panel (⚙️ button)
2. Click "🔤 Font Pairing" quick action
3. Browse 5 professional combinations
4. Click "Apply" on your choice
5. Fonts updated across design

### **4. One-Click Enhancement**

1. Click floating ✨ button
2. Select "⚡ One-Click Retouch"
3. Wait 2 seconds for AI processing
4. Review all suggestions
5. Click "Apply All" or select individual improvements

---

## 🎨 **Understanding Color Palettes**

### **Complementary**
- Colors opposite on the color wheel
- High contrast, vibrant
- Best for: Bold designs, call-to-action buttons

### **Analogous**
- Adjacent colors on the color wheel
- Harmonious, pleasing
- Best for: Calm designs, backgrounds

### **Triadic**
- Three evenly spaced colors
- Balanced, vibrant
- Best for: Playful designs, infographics

### **Monochromatic**
- Variations of a single color
- Elegant, simple
- Best for: Minimal designs, professional documents

### **Split Complementary**
- Base color + two adjacent to complement
- Balanced contrast
- Best for: Sophisticated designs

---

## 🔤 **Font Pairing Categories**

| Category | Heading | Subheading | Body | Best For |
|----------|---------|------------|------|----------|
| **Modern Professional** | Montserrat | Lato | Open Sans | Business, Corporate |
| **Elegant Classic** | Playfair Display | Lora | Merriweather | Luxury, Weddings |
| **Playful Modern** | Poppins | Nunito | Quicksand | Creative, Fun |
| **Bold Impact** | Bebas Neue | Oswald | Roboto | Posters, Headlines |
| **Minimal Clean** | Inter | Work Sans | Source Sans Pro | Tech, Startups |

---

## 📐 **Layout Optimization**

### **What Gets Fixed:**

1. **Vertical Alignment**
   - Elements aligned to same X position
   - Threshold: 5px difference

2. **Horizontal Alignment**
   - Elements aligned to same Y position
   - Threshold: 5px difference

3. **Spacing**
   - Consistent padding between elements
   - Based on canvas size (2% of smallest dimension)

4. **Balance**
   - Detects overcrowded areas
   - Suggests element redistribution

### **Layout Quality Score:**

- **90-100**: Excellent - Minimal issues
- **70-89**: Good - Minor adjustments needed
- **50-69**: Fair - Several improvements suggested
- **0-49**: Poor - Major layout issues detected

---

## ⚙️ **Intensity Control**

The intensity slider (0-100%) controls how strong AI suggestions are applied:

- **0-25%**: Subtle changes, barely noticeable
- **26-50%**: Moderate changes, balanced
- **51-75%**: Strong changes, noticeable (Default: 75%)
- **76-100%**: Maximum changes, dramatic

**Tip:** Start at 75% and adjust based on your preference.

---

## 👁️ **Before/After Comparison**

After applying suggestions:

1. Click "👁️ Before/After" button in panel footer
2. Use slider to compare before and after
3. Toggle buttons: Before | Split View | After
4. Review "Applied Changes" list
5. Click "Keep Changes" or "Close"

---

## 🔄 **Undo/Revert Changes**

### **Revert Individual Suggestion:**
1. Find the suggestion in the panel
2. Click "Revert" button
3. Change is undone immediately

### **Reset All Changes:**
1. Click "↺ Reset All" in panel footer
2. Confirm action
3. All AI changes are reverted

---

## 🎯 **Tips & Best Practices**

### **✅ DO:**
- Start with "One-Click Retouch" for quick improvements
- Review suggestions before applying
- Use intensity slider to fine-tune changes
- Compare before/after to see improvements
- Save your design before major changes

### **❌ DON'T:**
- Apply all suggestions blindly
- Set intensity to 100% without testing
- Forget to save before experimenting
- Ignore the layout quality score
- Skip the before/after comparison

---

## 🐛 **Troubleshooting**

### **Server Not Starting?**

```bash
# Check if port 3005 is in use
netstat -ano | findstr :3005

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart server
node ai-retouch-server.js
```

### **No Suggestions Appearing?**

1. Check browser console for errors
2. Verify server is running on port 3005
3. Check network tab for failed API calls
4. Ensure design has elements to analyze

### **Floating Button Not Visible?**

1. Check if you're in the Design Editor view
2. Look at bottom-right corner
3. Try refreshing the page
4. Check browser zoom level (should be 100%)

### **Changes Not Applying?**

1. Check if suggestion is marked as "Applied"
2. Verify intensity is not set to 0%
3. Check browser console for errors
4. Try reverting and re-applying

---

## 📊 **Performance**

### **Processing Times:**

| Feature | Time | Notes |
|---------|------|-------|
| Color Palette | ~500ms | Local processing |
| Font Pairing | ~300ms | Local processing |
| Layout Optimization | ~1s | Depends on element count |
| One-Click Retouch | ~2s | Combines all features |
| Image Enhancement | ~3-5s | Server processing |

### **Optimization Tips:**

- Use local processing for faster results
- Limit elements to <50 for best performance
- Close other browser tabs during processing
- Use Chrome/Edge for best performance

---

## 🎊 **You're Ready!**

**Start enhancing your designs with AI!** 🚀✨

**Next Steps:**
1. Read `AI_RETOUCH_IMPLEMENTATION_GUIDE.md` for technical details
2. Explore advanced features in the full panel
3. Experiment with different intensity levels
4. Share your AI-enhanced designs!

**Happy Designing! 🎨**

