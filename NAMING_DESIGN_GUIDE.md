# Naming Design Feature - Complete Implementation Guide

## Overview

The **Naming Design** feature is a powerful new tool that allows users to:
- 📋 Create beautiful wedding/celebration designs with names
- 🎨 Switch between multiple design themes with ONE CLICK
- ✏️ Edit SVG properties inline (fonts, colors, positioning)
- 💾 Download and save designs
- 🔄 Preserve information across design changes

---

## Architecture

### 1. **NamingPanel Component** (`src/components/auto-design/NamingPanel.vue`)

The main UI component that handles:
- Description input form
- Theme selection buttons
- Live SVG preview
- One-click design refresh button
- SVG editor toggle
- Download & save functionality

**Key Features:**
```vue
- Description field: Natural language input for names, dates, courtesy
- Theme selector: Choose from 5 design themes
- Refresh button: One-click design transformation
- Editor toggle: Access inline SVG editing
- Preview container: Real-time design visualization
```

### 2. **useNamingDesignRefresh Composable** (`src/composables/useNamingDesignRefresh.ts`)

Handles the design transformation system with:

**5 Design Themes:**
1. **Elegant** - Classic serif, gold accents, decorative border
2. **Modern** - Clean sans-serif, minimalist, accent lines
3. **Bold** - Strong typography, dark background, vibrant colors
4. **Artistic** - Hand-drawn style, decorative elements, warm tones
5. **Minimal** - Ultra-clean, negative space, simple lines

**Core Methods:**
```typescript
- getDesignThemes() - Get all available themes
- getThemeById(id) - Get specific theme configuration
- applyThemeToSVG(svg, themeId) - Apply theme to SVG
- refreshDesignTheme(svg, themeId, description) - Transform design
- loadThemeTemplate(themeId) - Load theme SVG template
- createCustomTheme(baseTheme, customizations) - Create custom theme
```

### 3. **SVG Editor**

Built-in editor for customizing:
- **Fonts**: Font family, size
- **Colors**: Text color, background color
- **Properties**: Live preview of changes

---

## Usage Guide

### For Users

#### Step 1: Access Naming Design
```
Home → Auto Design → Naming
URL: /auto-design/naming
```

#### Step 2: Enter Information
In the description field, enter:
```
John & Sarah Ahmed
15th April 2025
courtesy: Smith Family
```

The system automatically parses:
- Names (from brackets or "and"/"&")
- Dates (multiple formats supported)
- Courtesy (family name)

#### Step 3: Choose a Theme
Click one of the theme buttons:
- 🎭 Elegant
- 🏢 Modern
- 💥 Bold
- 🎨 Artistic
- ✨ Minimal

#### Step 4: One-Click Refresh
Click the **"Refresh Design"** button to transform the design to a different style while keeping the same information.

#### Step 5: Edit (Optional)
Click **"Edit SVG"** to:
- Change fonts
- Adjust font sizes
- Change text and background colors
- See changes in real-time

#### Step 6: Download or Save
- **Download**: Save as SVG file
- **Save**: Store in your library for later

---

## File Structure

```
public/svg/naming/
├── elegant/
│   └── template.svg      (Elegant theme SVG)
├── modern/
│   └── template.svg      (Modern theme SVG)
├── bold/
│   └── template.svg      (Bold theme SVG)
├── artistic/
│   └── template.svg      (Artistic theme SVG)
└── minimal/
    └── template.svg      (Minimal theme SVG)

src/
├── components/
│   └── auto-design/
│       └── NamingPanel.vue          (Main UI component)
├── composables/
│   ├── useNamingDesignRefresh.ts    (Design theme system)
│   └── useWeddingStickerUpdater.ts  (Text extraction & updating)
└── router/
    └── index.ts                      (Routing configuration)
```

---

## Theme Configuration

Each theme defines:

```typescript
interface DesignTheme {
  id: string                  // Unique identifier
  name: string               // Display name
  description: string        // Theme description
  fontFamily: string        // Primary font
  fontSize: number          // Base font size
  primaryColor: string      // Main text color
  secondaryColor: string    // Accent text color
  backgroundColor: string   // Background color
  style: 'elegant' | 'modern' | 'bold' | 'artistic' | 'minimal'
}
```

### Theme Details

| Theme | Font | Primary Color | Secondary | Background |
|-------|------|---------------|-----------|------------|
| **Elegant** | Cinzel Decorative | #2d1b00 | #b8860b | #fffacd |
| **Modern** | Montserrat | #1a1a1a | #4f46e5 | #f8f9fa |
| **Bold** | Arial Black | #ffffff | #ff6b6b | #2c3e50 |
| **Artistic** | Great Day | #4a3728 | #d4a574 | #f5e6d3 |
| **Minimal** | Georgia | #333333 | #999999 | #ffffff |

---

## Text Extraction System

The system uses `useWeddingStickerUpdater` composable to automatically extract:

### Names
```
(John & Sarah) → name1: "John", name2: "Sarah"
[Sarah Ahmed & Tom Lee] → Supports multi-word surnames
```

### Dates
Supports multiple formats:
```
"15th April 2025"
"April 15, 2025"
"15/04/2025"
"on 15th April, 2025"
```

### Courtesy
```
"courtesy: Smith Family"
"coutesy: Smith Family" (typo-tolerant)
"cut-cee: Smith Family"
```

---

## API Reference

### NamingPanel Component

**Props:** None (uses router and composables)

**Methods:**
```typescript
selectTheme(themeId: string)        // Switch to a theme
refreshDesign()                     // One-click refresh
applyFontChange()                   // Update fonts
applyColorChange()                  // Update colors
resetSVGEditor()                    // Reset to defaults
downloadDesign()                    // Export as SVG
saveToLibrary()                     // Save to database
```

### useNamingDesignRefresh Composable

```typescript
// Get all themes
const themes = getDesignThemes()

// Switch to theme
const svg = await refreshDesignTheme(currentSVG, 'modern', description)

// Load template
const template = await loadThemeTemplate('elegant')

// Create custom theme
const custom = createCustomTheme('modern', {
  name: 'My Custom',
  primaryColor: '#ff0000'
})

// Export/Import
const json = exportTheme('elegant')
const theme = importTheme(jsonString)
```

---

## SVG Template Structure

All templates follow this structure:

```xml
<svg width="800" height="600" viewBox="0 0 800 600">
  <style>
    /* Theme-specific styles */
  </style>
  
  <!-- Background -->
  <rect id="background" />
  
  <!-- Main Content Group -->
  <g id="content">
    <!-- Text Elements (all have IDs for updating) -->
    <text id="blessing-text">Alhamdulillahi</text>
    <text id="occasion-text">ON YOUR</text>
    <text id="event-type-text">WEDDING</text>
    <text id="ceremony-text">CEREMONY</text>
    
    <!-- Names Group (handles complex text positioning) -->
    <g id="wedding-names-group">
      <text id="name1-first">John</text>
      <text id="name-separator">&</text>
      <text id="name2-first">Sarah</text>
    </g>
    
    <text id="date-text">on 15th April, 2025</text>
    <text id="courtesy-text">CUT-CEE: Smith Family</text>
  </g>
</svg>
```

---

## How Theme Switching Works

### 1. User Clicks "Refresh Design"

```
refreshDesign()
  ↓
refreshDesignTheme(svg, themeId, description)
  ↓
applyThemeToSVG(svgContent, themeId)
  ├─ Update text colors & fonts
  ├─ Update background
  ├─ Modify CSS styles
  └─ Add theme identifier comment
  ↓
Return transformed SVG
  ↓
Update preview with new theme
```

### 2. Text is Preserved

- All text content remains unchanged
- Only visual styling is updated
- Font families, sizes, and colors are applied from theme config
- SVG structure and positioning are maintained

### 3. Real-Time Display

```
Input: "John & Sarah, 15th April 2025"
       └─ Parsed once, stored in state

Theme Switch: Elegant → Modern → Bold
       └─ Same parsed data, different visual styling
```

---

## Advanced Features

### Custom Themes

Create a custom theme based on existing theme:

```typescript
const customTheme = createCustomTheme('modern', {
  name: 'My Wedding',
  primaryColor: '#c0c0c0',  // Silver
  secondaryColor: '#ffb700', // Gold
  backgroundColor: '#1a1a2e'  // Dark blue
})
```

### Export/Import Themes

```typescript
// Export current theme as JSON
const json = exportTheme('elegant')
// → { id: 'elegant', name: 'Elegant', ... }

// Save to file, share, or store in database

// Import theme from JSON
const importedTheme = importTheme(jsonString)
```

### Dynamic SVG Editing

Users can edit SVG properties in real-time:
- Font family (dropdown: Arial, Georgia, Cinzel, etc.)
- Font size (slider: 20-150px)
- Text color (color picker)
- Background color (color picker)

All changes are reflected instantly in the preview.

---

## Integration with Existing Features

### Reuses Wedding Sticker Logic
- Text extraction from `useWeddingStickerUpdater`
- Date parsing
- Name extraction (with "&" or "and" separator)
- SVG element manipulation

### Router Integration
- Route: `/auto-design/naming`
- Accessible from: Auto Design page
- Parent: AutoDesignPage component shows NamingPanel when category === 'naming'

### Authentication
- Currently: `requiresAuth: false` (for testing)
- Can be changed to `true` for production

---

## Styling Guide

### CSS Classes

```css
.naming-panel            /* Main container */
.form-view              /* Form layout */
.panel-header           /* Top header with back button */
.form-section           /* Form controls */
.theme-selector         /* Theme button grid */
.refresh-btn            /* One-click refresh button */
.naming-preview-container /* SVG preview area */
.svg-editor-section     /* Editor panel */
.editor-group           /* Editor control group */
.editor-control         /* Individual editor control */
.color-picker           /* Color input */
.action-buttons         /* Download/Save buttons */
.status-message         /* Success/Error notifications */
```

### Color Scheme
- Primary: #4f46e5 (Indigo)
- Success: #10b981 (Green)
- Error: #dc2626 (Red)
- Background: #f8f9fa (Light gray)

---

## Future Enhancements

1. **More Themes**
   - Vintage, Luxury, Romantic, etc.
   - User-created custom themes

2. **Advanced Editing**
   - Positioning/transform controls
   - Text shadow/effects
   - Custom decorative elements

3. **Template Library**
   - Save designs to user library
   - Share templates with others
   - Rating/trending system

4. **Export Formats**
   - PDF with watermark
   - PNG/JPG with transparency
   - Multiple sizes (for printing)

5. **AI Integration**
   - Auto-generate design variations
   - Suggest themes based on description
   - Color harmony suggestions

---

## Troubleshooting

### SVG Not Loading
1. Check `public/svg/naming/{theme}/template.svg` exists
2. Check browser console for 404 errors
3. Verify CORS configuration

### Text Not Updating
1. Verify element IDs in SVG match expected names
2. Check text extraction logic in useWeddingStickerUpdater
3. Check browser console for parsing errors

### Design Not Refreshing
1. Click "Refresh Design" button (ensure SVG is loaded first)
2. Check theme is selected
3. Try switching themes

### Colors Not Applying
1. Open SVG editor
2. Ensure SVG has `<style>` section with theme classes
3. Check color format (hex #RRGGBB)

---

## Contributing

To add a new theme:

1. Create SVG file: `public/svg/naming/{theme-id}/template.svg`
2. Add theme configuration to `useNamingDesignRefresh.ts`
3. Update theme selector UI if needed
4. Test theme switching and text extraction

---

## Support

For issues or questions:
- Check browser console (F12 → Console tab)
- Review implementation files
- Test with sample data: `"John & Sarah, 15th April 2025, courtesy: Smith Family"`

---

**Version:** 1.0.0  
**Last Updated:** November 25, 2025  
**Status:** Production Ready ✅
