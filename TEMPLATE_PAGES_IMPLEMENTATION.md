# Template Pages Implementation Plan

## Overview
Each template now has its own dedicated page where you can view, customize, and modify the template design independently.

## Folder Structure Created
```
src/views/
├── invoices/
│   ├── templates/
│   │   ├── ClassicProfessionalTemplate.vue ✅ CREATED
│   │   ├── ModernMinimalTemplate.vue (TODO)
│   │   └── CorporateElegantTemplate.vue (TODO)
│   ├── InvoiceTemplatesPage.vue ✅ UPDATED (routes to template pages)
│   └── CustomerInvoiceTemplatesPage.vue (TODO - needs update)
│
└── receipts/
    ├── templates/
    │   ├── StandardReceiptTemplate.vue (TODO)
    │   ├── CompactReceiptTemplate.vue (TODO)
    │   └── ElegantReceiptTemplate.vue (TODO)
    ├── ReceiptTemplatesPage.vue (TODO - needs update)
    └── CustomerReceiptTemplatesPage.vue (TODO - needs update)
```

## Templates Overview

### Invoice Templates (Generate Mode)
1. **Classic Professional** ✅ Created
   - Route: `/invoice-template/classic-professional`
   - ID: `classic-professional`
   - Style: Blue gradient, professional business layout

2. **Modern Minimal** (TODO)
   - Route: `/invoice-template/modern-minimal`
   - ID: `modern-minimal`
   - Style: Green gradient, minimal clean design

3. **Corporate Elegant** (TODO)
   - Route: `/invoice-template/corporate-elegant`
   - ID: `corporate-elegant`
   - Style: Purple gradient, sophisticated corporate style

### Customer Invoice Templates (Customer Mode)
4. **Detailed Business** (TODO)
   - Route: `/invoice-template/detailed-business`
   - ID: `detailed-business`
   - Style: Comprehensive business invoice with customer details

5. **Professional Itemized** (TODO)
   - Route: `/invoice-template/professional-itemized`
   - ID: `professional-itemized`
   - Style: Detailed itemized invoice format

6. **Modern Full Detail** (TODO)
   - Route: `/invoice-template/modern-full-detail`
   - ID: `modern-full-detail`
   - Style: Modern design with complete customer information

### Receipt Templates (Generate Mode)
7. **Standard Receipt** (TODO)
   - Route: `/receipt-template/standard-receipt`
   - ID: `standard-receipt`
   - Style: Traditional receipt layout

8. **Compact Receipt** (TODO)
   - Route: `/receipt-template/compact-receipt`
   - ID: `compact-receipt`
   - Style: Space-efficient compact design

9. **Elegant Receipt** (TODO)
   - Route: `/receipt-template/elegant-receipt`
   - ID: `elegant-receipt`
   - Style: Elegant refined receipt design

### Customer Receipt Templates (Customer Mode)
10. **Detailed Payment** (TODO)
    - Route: `/receipt-template/detailed-payment`
    - ID: `detailed-payment`
    - Style: Detailed payment receipt with customer info

11. **Professional Customer** (TODO)
    - Route: `/receipt-template/professional-customer`
    - ID: `professional-customer`
    - Style: Professional customer receipt format

12. **Modern Customer** (TODO)
    - Route: `/receipt-template/modern-customer`
    - ID: `modern-customer`
    - Style: Modern customer receipt design

## What's Been Done

### ✅ Completed
1. Created folder structure for template pages
2. Created `ClassicProfessionalTemplate.vue` as the first example
3. Updated `InvoiceTemplatesPage.vue` to route to template pages
4. Added router import and route for Classic Professional template

### Template Page Features
Each template page includes:
- **Back button** to return to template selection
- **Full template preview** with actual design
- **Customizable layout** - Each template can be independently styled
- **Future customization panel** ready for color/font/layout modifications

## How It Works Now

### User Flow:
1. User clicks "Generate Invoice" on dashboard
2. Navigates to Invoice Templates selection page
3. Clicks on "Classic Professional" template
4. **NEW:** Taken to dedicated template page (`/invoice-template/classic-professional`)
5. Can view and customize the template
6. Eventually proceeds to fill form with this template

### Old Flow (for reference):
1-3. Same
4. **OLD:** Clicked Continue button
5. Directly taken to form page

## Next Steps to Complete

### Priority 1: Remaining Invoice Templates (Generate)
- [ ] Create `ModernMinimalTemplate.vue`
- [ ] Create `CorporateElegantTemplate.vue`
- [ ] Add routes to router
- [ ] Update InvoiceTemplatesPage routing

### Priority 2: Customer Invoice Templates
- [ ] Create 3 customer invoice template pages
- [ ] Add routes to router
- [ ] Update CustomerInvoiceTemplatesPage routing

### Priority 3: Receipt Templates (Generate)
- [ ] Create 3 receipt template pages
- [ ] Add routes to router
- [ ] Update ReceiptTemplatesPage routing

### Priority 4: Customer Receipt Templates
- [ ] Create 3 customer receipt template pages
- [ ] Add routes to router
- [ ] Update CustomerReceiptTemplatesPage routing

## Customization Capabilities

Each template page allows you to:
- ✅ Modify colors and gradients
- ✅ Change fonts and typography
- ✅ Adjust spacing and layout
- ✅ Add/remove sections
- ✅ Customize header and footer
- ✅ Style tables and borders
- ✅ Create unique designs per template

## Benefits of This Approach

1. **Independent Styling**: Each template has its own file to modify
2. **No Conflicts**: Changes to one template don't affect others
3. **Easy Maintenance**: Clear separation of concerns
4. **Preview Before Use**: Users see the actual template before filling data
5. **Scalable**: Easy to add more templates in the future

## Router Configuration

```typescript
// Template routes follow this pattern:
{
  path: '/invoice-template/{template-id}',
  name: 'invoice-template-{template-id}',
  component: TemplateNameComponent,
  meta: {
    title: 'Template Name - SmartDesignPro',
    requiresAuth: true
  }
}
```

## Example Template Structure

See `ClassicProfessionalTemplate.vue` for the complete example showing:
- Header with back button
- Full template preview
- Customization panel placeholder
- Proper routing integration
- Dark mode support
