# 🧪 Quick Test Guide - Signature Integration

## Test the Complete Workflow

### Prerequisites
- Make sure you're logged in with a member account
- You should have `authenticatedMember` in localStorage with a `branch` property

---

## ✅ Test 1: Create Signature from Invoice Page

**Steps:**
1. Navigate to `/invoice` page
2. Scroll down to "Digital Signatures" section (purple box)
3. Click the **"Create New"** button (purple button with "+" icon)
4. You should be redirected to `/signature` page
5. Draw a signature on the canvas
6. Click **"Save Signature"** button (purple)
7. You should see a prompt: 
   > ✅ Signature saved successfully!
   > 
   > Would you like to return to Invoice page to use this signature?
8. Click **OK**
9. ✅ **Expected Result**: You're back on Invoice page
10. ✅ **Expected Result**: Your new signature appears in both dropdown menus
11. ✅ **Expected Result**: Select it from either dropdown and see the preview below

---

## ✅ Test 2: Create Signature from Receipt Page

**Steps:**
1. Navigate to `/receipt` page
2. Scroll down to "Digital Signatures" section
3. Click the **"Create New"** button
4. Draw a signature
5. Click **"Save Signature"**
6. You should see a prompt:
   > ✅ Signature saved successfully!
   > 
   > Would you like to return to Receipt page to use this signature?
7. Click **OK**
8. ✅ **Expected Result**: You're back on Receipt page
9. ✅ **Expected Result**: New signature is in the dropdown
10. ✅ **Expected Result**: Can select and use it

---

## ✅ Test 3: Use Existing Signatures

**Steps:**
1. Go to Invoice or Receipt page
2. Click dropdown under "Signature 1 (Left)"
3. ✅ **Expected Result**: See all your branch's saved signatures
4. Select a signature
5. ✅ **Expected Result**: Preview image appears below dropdown
6. Repeat for "Signature 2 (Right)"
7. ✅ **Expected Result**: Both signatures show in preview
8. Export PDF/JPEG
9. ✅ **Expected Result**: Both signatures appear at bottom of document

---

## ✅ Test 4: Delete Signature

**Steps:**
1. Go to `/signature` page directly
2. ✅ **Expected Result**: See all saved signatures in right panel
3. Click the **X** button on a signature
4. Confirm deletion
5. ✅ **Expected Result**: Signature is removed from list
6. Go back to Invoice page
7. ✅ **Expected Result**: Deleted signature no longer appears in dropdown

---

## ✅ Test 5: Back Button Navigation

**From Invoice:**
1. Go to Invoice page
2. Click "Create New" signature
3. On Signature page, click **"Back"** button (top left)
4. ✅ **Expected Result**: Returns to Invoice page

**From Receipt:**
1. Go to Receipt page
2. Click "Create New" signature
3. On Signature page, click **"Back"** button
4. ✅ **Expected Result**: Returns to Receipt page

**Direct Access:**
1. Navigate directly to `/signature` page
2. Click **"Back"** button
3. ✅ **Expected Result**: Goes to Invoice/Receipt selection page

---

## ✅ Test 6: Branch Isolation

**Steps:**
1. Log in as a member from "Branch A"
2. Create a signature
3. Log out
4. Log in as a member from "Branch B"
5. Go to Invoice or Signature page
6. ✅ **Expected Result**: Don't see Branch A's signatures
7. Create a new signature
8. Log out and back in as Branch A member
9. ✅ **Expected Result**: Don't see Branch B's signature

---

## ✅ Test 7: Auto-Reload When Returning

**Steps:**
1. Open Invoice page
2. Note the signatures in dropdown (e.g., 3 signatures)
3. Click "Create New"
4. Create and save a new signature
5. Click OK to return to Invoice
6. ✅ **Expected Result**: Dropdown now has 4 signatures (auto-reloaded)
7. ✅ **Expected Result**: New signature is at the top of the list

---

## ✅ Test 8: Multiple Signatures on Document

**Steps:**
1. Go to Invoice page
2. Select different signatures for "Signature 1 (Left)" and "Signature 2 (Right)"
3. ✅ **Expected Result**: Both previews show different signatures
4. Export to PDF or JPEG
5. ✅ **Expected Result**: Both signatures appear on the document
   - Signature 1 on the left
   - Signature 2 on the right
   - Both at the bottom of the invoice

---

## ✅ Test 9: Primary Signature Auto-Selection

**Steps:**
1. Delete all existing signatures
2. Create a new signature
3. ✅ **Expected Result**: This signature is marked as "Primary"
4. Reload Invoice page
5. ✅ **Expected Result**: Primary signature is auto-selected in both dropdowns
6. Create another signature
7. ✅ **Expected Result**: New signature is NOT primary
8. Open dropdown
9. ✅ **Expected Result**: First signature shows "(Primary)" label

---

## ✅ Test 10: Cancel Return Prompt

**Steps:**
1. Go to Invoice page
2. Click "Create New" signature
3. Draw and save signature
4. When prompted to return to Invoice, click **Cancel**
5. ✅ **Expected Result**: Stay on Signature page
6. ✅ **Expected Result**: See success alert: "✅ Signature saved successfully!"
7. New signature appears in the saved signatures panel
8. ✅ **Expected Result**: Can manually click "Back" or continue drawing

---

## 🐛 Troubleshooting

### Signatures Don't Load
- **Check**: Browser console for errors
- **Check**: localStorage for `authenticatedMember` data
- **Check**: Member has `branch` property
- **Fix**: Log out and log back in

### Return Prompt Doesn't Appear
- **Check**: Did you click "Create New" from Invoice/Receipt page?
- **Check**: localStorage for `signatureReturnPath` (should exist temporarily)
- **Fix**: Navigate from Invoice/Receipt page, not directly to `/signature`

### Signatures Don't Auto-Reload
- **Check**: Browser supports Document Visibility API
- **Check**: Console for visibility change events
- **Fix**: Manually refresh page

### Can't Delete Signatures
- **Check**: Member has correct branch permissions
- **Check**: Signature ID matches
- **Fix**: Clear localStorage and recreate signatures

### Preview Doesn't Show
- **Check**: Signature has valid dataURL
- **Check**: Image loads in network tab
- **Fix**: Recreate signature

---

## 📊 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Click "Create New" from Invoice | Redirects to /signature, stores return path |
| Save signature from Invoice context | Prompts to return to Invoice |
| Click OK on return prompt | Returns to Invoice, signatures auto-reload |
| Click Cancel on return prompt | Stays on Signature page |
| Select signature from dropdown | Preview appears below |
| Use multiple signatures | Both appear on exported document |
| Delete signature | Removed from all dropdowns |
| Back button | Returns to origin page or selection page |
| Branch isolation | Only see own branch's signatures |
| Primary signature | Auto-selected on page load |

---

## ✅ All Tests Passed?

If all tests pass, the signature integration is working perfectly! 🎉

If any tests fail:
1. Check the error in browser console
2. Verify `authenticatedMember` in localStorage
3. Clear browser cache and retry
4. Check if localStorage is enabled
5. Verify Firebase database functions are working

---

**Happy Testing! 🧪✨**
