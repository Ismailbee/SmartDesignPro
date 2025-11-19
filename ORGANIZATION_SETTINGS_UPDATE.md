# Organization Settings - User Editable Fields

## Summary
Successfully updated both **InvoicePage.vue** and **ReceiptPage.vue** to allow users to customize organization details that were previously hardcoded.

## Changes Made

### 1. InvoicePage.vue

#### Added Organization Settings Section
- New collapsible settings panel in the Quick Fill Form
- Located between "LPO Number" and "Customer Address" fields
- Blue-themed card with clear visual separation

#### Editable Fields:
1. **Organization Logo**
   - File upload input accepting image files (PNG, JPG, etc.)
   - Preview of uploaded logo
   - File validation (5MB max size, image types only)
   - Default: `/images/ican-logo.png`

2. **Organization Name**
   - Textarea input for multi-line names
   - Default: "Institute of Chartered Accountants of Nigeria (ICAN)"
   - Automatically displayed in invoice header

3. **Organization Address**
   - Textarea input for multi-line addresses
   - Default: "Federal University of Technology, Bosso Campus, Minna"
   - Displayed in invoice header

4. **Organization Phone**
   - Text input for phone number
   - Default: "+234 1 234 5678"
   - Displayed in invoice header with "Tel:" prefix

#### Script Updates:
- Changed `organizationName` from hardcoded string to reactive ref
- Changed `organizationAddress` and `organizationPhone` to reactive refs
- Added `handleLogoUpload` function with validation:
  - Checks file type (must be image)
  - Checks file size (max 5MB)
  - Converts image to base64 data URL for preview and export
- Updated invoice preview template to use dynamic variables

### 2. ReceiptPage.vue

#### Added Organization Settings Section
- Identical settings panel as InvoicePage.vue
- Located after "Amount (Naira)" field
- Same blue-themed design for consistency

#### Editable Fields:
- Same 4 fields as InvoicePage.vue with identical functionality

#### Script Updates:
- Changed `organizationName` from hardcoded constant to reactive ref
- Added `handleLogoUpload` function (same implementation as InvoicePage)
- Updated receipt preview template to use dynamic variables

## Features

### Logo Upload
```javascript
const handleLogoUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      logoDataUrl.value = e.target?.result;
    };
    reader.readAsDataURL(file);
  }
};
```

### UI Components
- File upload input with custom styling
- Preview images for uploaded logos
- Textarea inputs for multi-line text
- Text input for phone number
- Help text explaining the purpose
- SVG icon for visual identification

### Preview Integration
All changes are immediately reflected in the document preview:
- Logo appears in header
- Organization name displays with custom styling
- Address and phone show in designated areas
- Changes persist during export (PDF/JPEG)

## User Benefits

1. **Customization**: Users can now brand their invoices/receipts with their own organization details
2. **Flexibility**: No need for developer intervention to change organization info
3. **Visual Feedback**: Instant preview of changes before exporting
4. **Validation**: Built-in checks prevent invalid files or oversized images
5. **Consistency**: Same interface in both Invoice and Receipt pages

## Technical Notes

- Organization settings are stored in component state (reactive refs)
- Logo images are converted to base64 data URLs
- Settings persist during component lifecycle
- No backend storage - values reset on page reload
- Export functions (PDF/JPEG) include the custom organization details

## Default Values

Both pages initialize with ICAN (Institute of Chartered Accountants of Nigeria) defaults:
- **Name**: "Institute of Chartered Accountants of Nigeria (ICAN)"
- **Address**: Various (differs between Invoice and Receipt pages)
- **Phone**: "+234 1 234 5678"
- **Logo**: "/images/ican-logo.png"

Users can change these at any time without affecting other users or sessions.

## Styling

- Blue-themed card (bg-blue-50/dark:bg-blue-900/20)
- Consistent with existing form design
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Proper spacing and visual hierarchy
- Dark mode support

## Known Issues

The linting warnings about attribute ordering (e.g., "Attribute 'class' should go before '@click'") are Vue style guide preferences and do not affect functionality. These can be ignored or fixed in a future update.

## Testing Checklist

- [x] Logo upload works with PNG files
- [x] Logo upload works with JPG files
- [x] File size validation (5MB limit)
- [x] File type validation (images only)
- [x] Logo preview displays correctly
- [x] Organization name updates in preview
- [x] Organization address updates in preview
- [x] Organization phone updates in preview
- [x] Changes persist during PDF export
- [x] Changes persist during JPEG export
- [x] Mobile responsiveness
- [x] Dark mode support
- [x] Both Invoice and Receipt pages updated

## Future Enhancements

Potential improvements for future versions:
1. Save organization settings to localStorage for persistence
2. Multiple organization profiles (switchable)
3. Export/import organization settings
4. Integration with backend API for cloud storage
5. Logo cropping/resizing tool
6. More customization options (colors, fonts, etc.)
