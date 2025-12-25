# Reports & Member Management Pages

## Overview
Implemented full-featured pages for branch administrators to manage members and review analytics directly from the dashboard shortcuts.

## New Pages

### MemberManagementPage.vue
**Path:** `src/pages/MemberManagementPage.vue`

- Firebase-synced member roster with search, role filters, and sorting
- Summary cards highlight total members, unique roles, recent activity, and remaining slots
- Drawer snapshot for each member showing metadata and recent activity timeline
- Quick actions to open the member console with context
- Supports dark mode, responsive layouts, and animated transitions

### ReportsAnalyticsPage.vue
**Path:** `src/pages/ReportsAnalyticsPage.vue`

- KPI cards tracking revenue, invoices, engagement, and processing SLAs
- Forecasted revenue trend chart with dynamic time ranges (7/30/90 days)
- Activity mix visualization derived from Firebase activity logs
- Operational highlights with trends for invoices, receipts, and member actions
- Insight signals feed plus recent activity timeline
- Export to JSON for offline reporting

## Router Updates
- Added `MemberManagement` route pointing to `/member-management`
- Added `Reports` route pointing to `/reports`
- Both routes require core branch access (protected route set)
- Dashboard shortcut handlers now navigate to the new pages

## Data Sources
- Reuses existing Firebase helpers: `getAllMembers`, `getMemberActivities`
- Pulls branch statistics from `${API_BASE}/dashboard/:branch`, with graceful fallback if API unavailable
- Generates trend projections client-side when historical data is limited

## UX Enhancements
- Branch-less users receive guided call-to-action back to dashboard
- Consistent design language with dashboard (glassmorphism, gradients, motion)
- Accessible controls (keyboard friendly, color contrast, small-screen support)
- Export button enables quick sharing of analytics snapshots

## Testing Checklist
1. Navigate to `Member Directory` tile on dashboard → loads member management view
2. Search, filter, and sort interactions update list without errors
3. Selecting a member opens the snapshot drawer with activity list
4. Manage Member button routes to `MemberLogin` preserving branch context
5. `Reports & Analytics` tile opens analytics view with KPI data
6. Refresh button re-fetches stats and timeline without duplicates
7. Export Summary downloads JSON with current metrics
8. Dark mode renders both pages without contrast issues

## Next Steps (optional)
- Connect real historical metrics endpoints for richer analytics
- Add role-based permissions to restrict management functions
- Integrate charting library for interactive visuals when requirements expand
