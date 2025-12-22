# ICAN Micro-App Data Flow Architecture

## Overview
The ICAN micro-app now uses a **localStorage-based architecture** for all invoice, receipt, and activity tracking. This eliminates the need for external Firebase databases and ensures all data is stored locally in the browser.

## Data Flow

### 1. Document Creation & Export (Preview Pages)

#### PreviewIcanInvoice.vue
**Location**: `src/views/micro-apps/Ican/src/pages/InvoiceIcan/PreviewIcanInvoice.vue`

**What it does**:
- When users export invoices (PDF), it logs the activity to localStorage
- Stores invoice preview data for future reference
- Tracks: document number, export format, page count, member info

**Activity Logging** (Lines 5850, 6131):
```javascript
await logActivity(member.branch || route.query.branch, {
  action: `Invoice Exported (PDF)`,
  memberName: member.name || 'Unknown Member',
  type: 'export',
  details: {
    documentNumber,
    exportFormat: 'pdf',
    exportType,
    pageCount
  }
});
```

**Data Stored**:
- `ican_activities_{branchName}` - Array of activity logs
- `invoicePreviewData` - Current invoice preview data

#### PreviewIcanReceipt.vue
**Location**: `src/views/micro-apps/Ican/src/pages/ReceiptIcan/PreviewIcanReceipt.vue`

**What it does**:
- When users export receipts (PDF), it logs the activity to localStorage
- Stores receipt preview data for future reference
- Tracks: document number, export format, page count, member info

**Activity Logging** (Lines 5582, 5863):
```javascript
await logActivity(member.branch || route.query.branch, {
  action: `Receipt Exported (PDF)`,
  memberName: member.name || 'Unknown Member',
  type: 'export',
  details: {
    documentNumber,
    exportFormat: 'pdf',
    exportType,
    pageCount
  }
});
```

**Data Stored**:
- `ican_activities_{branchName}` - Array of activity logs
- `invoicePreviewData` - Current receipt preview data (uses same key as invoices)

### 2. Data Retrieval Functions (API Service)

#### Location: `src/views/micro-apps/Ican/src/api-service.ts`

#### logActivity()
**Purpose**: Store activity logs in localStorage
**Storage Key**: `ican_activities_{branchName}`
**Data Structure**:
```typescript
{
  id: string;              // activity_{timestamp}_{random}
  branch: string;          // Branch name
  timestamp: string;       // ISO timestamp
  action: string;          // E.g., "Invoice Exported (PDF)"
  memberName: string;      // Member who performed action
  type: string;            // 'export', 'create', etc.
  details: {
    documentNumber: string;
    exportFormat: string;
    exportType: string;
    pageCount: number;
  }
}
```

#### getActivities()
**Purpose**: Retrieve activity logs for a branch
**Returns**: Array of ActivityLog objects (up to specified limit)

#### getAllInvoices()
**Purpose**: Get all invoices from activities
**How it works**:
1. Reads `ican_activities_{branchName}` from localStorage
2. Filters activities where `type === 'export'` and action contains "invoice"
3. Creates invoice records from these activities
4. Returns array of invoice objects with document numbers, amounts, timestamps

#### getAllReceipts()
**Purpose**: Get all receipts from activities
**How it works**:
1. Reads `ican_activities_{branchName}` from localStorage
2. Filters activities where `type === 'export'` and action contains "receipt"
3. Creates receipt records from these activities
4. Returns array of receipt objects with document numbers, amounts, timestamps

### 3. Dashboard Display

#### Location: `src/views/micro-apps/Ican/src/pages/DashboardPage.vue`

**What it does**:
- Displays statistics from localStorage data
- Shows recent activities
- Calculates revenue from invoice/receipt activities

**Data Sources**:
```javascript
// All from localStorage via api-service.ts
const [icanResult, localStorageInvoices, localStorageReceipts] = await Promise.all([
  getDashboardData(branchName.value),
  getAllInvoices(branchName.value),
  getAllReceipts(branchName.value)
]);
```

**Metrics Displayed**:
- **Active Invoices**: Count of invoice export activities
- **Active Receipts**: Count of receipt export activities
- **Monthly Revenue**: Sum of amounts from all invoice + receipt activities
- **Recent Activities**: Last 10 activities from localStorage
- **Total Members**: From ICAN dashboard data
- **Pending Tasks**: From ICAN dashboard data

## Data Storage Keys

All data is stored in browser localStorage with these keys:

| Key | Purpose | Set By | Read By |
|-----|---------|--------|---------|
| `ican_activities_{branchName}` | Activity logs (exports, creates) | logActivity() in preview pages | getActivities(), getAllInvoices(), getAllReceipts() |
| `invoicePreviewData` | Current invoice/receipt preview data | Preview pages | getAllInvoices(), getAllReceipts() |
| `generateInvoiceFormData` | Invoice form input data | IcanInvoice.vue | PreviewIcanInvoice.vue |
| `authenticatedMember` | Current logged-in member | (legacy) | Preview pages for branch info |

## Complete Flow Example

### Creating and Tracking an Invoice

1. **User fills form** in [IcanInvoice.vue](src/views/micro-apps/Ican/src/pages/InvoiceIcan/IcanInvoice.vue)
   - Form data saved to `generateInvoiceFormData`
   
2. **User clicks preview** → navigates to [PreviewIcanInvoice.vue](src/views/micro-apps/Ican/src/pages/InvoiceIcan/PreviewIcanInvoice.vue)
   - Preview page loads form data from localStorage
   - Displays invoice preview
   
3. **User exports PDF**
   - `logActivity()` called → stores to `ican_activities_{branchName}`
   - Invoice preview data saved to `invoicePreviewData`
   
4. **User views dashboard** → [DashboardPage.vue](src/views/micro-apps/Ican/src/pages/DashboardPage.vue)
   - Calls `getAllInvoices(branchName)`
   - Reads activities from `ican_activities_{branchName}`
   - Counts invoice exports
   - Calculates total revenue
   - Displays stats

## Key Advantages

✅ **No External Database Required**: All data in localStorage
✅ **Fast Performance**: No network requests for data
✅ **Simple Architecture**: Clear data flow from preview → localStorage → dashboard
✅ **Branch Isolation**: Data separated by branch name in storage keys
✅ **Activity Tracking**: Comprehensive logging of all user actions
✅ **Offline Capable**: Works without internet connection

## Important Notes

1. **localStorage Limits**: Maximum 50 activities per branch (automatically trimmed)
2. **Branch-Based Storage**: All data keyed by branch name for multi-branch support
3. **Preview Pages are Source of Truth**: Invoice/receipt data comes from preview page exports
4. **No Firebase Dependency**: Dashboard reads from localStorage only, not Firebase database
5. **SmartDesignPro Integration**: Uses SmartDesignPro's localStorage structure

## Troubleshooting

### Dashboard shows zero invoices/receipts
- Check if preview pages are logging activities correctly
- Verify localStorage key `ican_activities_{branchName}` exists
- Confirm branch name matches between preview and dashboard

### Revenue not calculating
- Ensure `invoicePreviewData` contains `grandTotal` or `amount` fields
- Check that activities have proper `details.documentNumber`

### Activities not appearing
- Verify `logActivity()` is called after export
- Check browser console for localStorage errors
- Ensure branch name is being passed correctly
