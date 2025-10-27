# 🧪 Custom Token Purchase Feature - Testing Guide

## Quick Start

### Prerequisites
```bash
# Terminal 1: Payment Server
node payment-server.cjs

# Terminal 2: Frontend Dev Server
npm run dev

# Browser
http://localhost:8101
```

---

## Test Scenarios

### Test 1: Input Validation - Minimum Amount

**Steps:**
1. Navigate to Tokens & Plans page
2. Scroll to "Buy Tokens" section
3. Find the "Custom Amount" card (blue dashed border)
4. Enter `50` in the input field
5. Click outside or press Tab

**Expected Result:**
- ❌ Error message appears: "Minimum purchase is 100 tokens"
- ❌ "Buy Now" button is disabled (grayed out)
- ❌ Price shows ₦0

**Actual Result:** _______________

---

### Test 2: Input Validation - Decimal Numbers

**Steps:**
1. In the custom amount input field
2. Enter `150.5`
3. Click outside or press Tab

**Expected Result:**
- ❌ Error message appears: "Please enter a whole number"
- ❌ "Buy Now" button is disabled
- ❌ Price shows ₦0

**Actual Result:** _______________

---

### Test 3: Valid Input - Minimum Amount

**Steps:**
1. Clear the input field
2. Enter `100`
3. Observe the field

**Expected Result:**
- ✅ No error message
- ✅ Price displays: ₦100
- ✅ "Buy Now" button is enabled (blue)
- ✅ Button text shows: "Buy 100 Tokens"

**Actual Result:** _______________

---

### Test 4: Valid Input - Custom Amount

**Steps:**
1. Clear the input field
2. Enter `500`
3. Observe the field

**Expected Result:**
- ✅ No error message
- ✅ Price displays: ₦500
- ✅ "Buy Now" button is enabled
- ✅ Button text shows: "Buy 500 Tokens"
- ✅ Rate shows: "1 token = ₦1"

**Actual Result:** _______________

---

### Test 5: Real-time Price Calculation

**Steps:**
1. Clear the input field
2. Type `250` slowly, one digit at a time
3. Watch the price update

**Expected Result:**
- ✅ Price updates in real-time as you type
- ✅ After typing `2`: Price shows ₦2
- ✅ After typing `25`: Price shows ₦25
- ✅ After typing `250`: Price shows ₦250
- ✅ Button text updates: "Buy 250 Tokens"

**Actual Result:** _______________

---

### Test 6: Button State Management

**Steps:**
1. Clear the input field (empty)
2. Observe button state
3. Enter `100`
4. Observe button state
5. Clear field again
6. Observe button state

**Expected Result:**
- ✅ Empty field: Button disabled (grayed out)
- ✅ Valid amount (100): Button enabled (blue)
- ✅ Empty again: Button disabled (grayed out)

**Actual Result:** _______________

---

### Test 7: Payment Flow - Successful Purchase

**Steps:**
1. Enter `200` in custom amount field
2. Click "Buy 200 Tokens" button
3. Paystack payment modal opens
4. Use test card: `4084 0840 8408 4081`
5. Enter any future expiry date (e.g., 12/25)
6. Enter any 3-digit CVV (e.g., 123)
7. Click "Pay"

**Expected Result:**
- ✅ Toast message: "Opening payment gateway..."
- ✅ Paystack modal opens
- ✅ Payment processes
- ✅ Toast message: "Payment successful! Verifying..."
- ✅ Toast message: "✅ 200 tokens added to your account!"
- ✅ Page refreshes with updated token balance
- ✅ Token count increases by 200

**Actual Result:** _______________

---

### Test 8: Payment Flow - Cancelled Payment

**Steps:**
1. Enter `300` in custom amount field
2. Click "Buy 300 Tokens" button
3. Paystack modal opens
4. Click the X or close button to cancel

**Expected Result:**
- ✅ Toast message: "Payment cancelled. No charges were made."
- ✅ Modal closes
- ✅ Page remains on Tokens & Plans
- ✅ Token balance unchanged

**Actual Result:** _______________

---

### Test 9: Large Amount Purchase

**Steps:**
1. Enter `5000` in custom amount field
2. Observe price calculation
3. Click "Buy 5000 Tokens" button
4. Complete payment with test card

**Expected Result:**
- ✅ Price displays: ₦5,000 (with comma formatting)
- ✅ Button text: "Buy 5,000 Tokens"
- ✅ Payment processes correctly
- ✅ 5,000 tokens added to account

**Actual Result:** _______________

---

### Test 10: Responsive Design - Desktop

**Steps:**
1. Open page on desktop (1920px width)
2. Scroll to "Buy Tokens" section
3. Observe layout

**Expected Result:**
- ✅ 3-column layout
- ✅ Preset packages in columns 1-2
- ✅ Custom card in column 3
- ✅ All cards same height
- ✅ Input field fully visible
- ✅ Price calculation visible
- ✅ Button fully clickable

**Actual Result:** _______________

---

### Test 11: Responsive Design - Tablet

**Steps:**
1. Open page on tablet (768px width)
2. Scroll to "Buy Tokens" section
3. Observe layout

**Expected Result:**
- ✅ 2-column layout
- ✅ Preset packages in row 1
- ✅ Custom card in row 2
- ✅ All cards responsive
- ✅ Input field readable
- ✅ Touch-friendly sizing

**Actual Result:** _______________

---

### Test 12: Responsive Design - Mobile

**Steps:**
1. Open page on mobile (375px width)
2. Scroll to "Buy Tokens" section
3. Observe layout

**Expected Result:**
- ✅ 1-column layout (full width)
- ✅ All cards stack vertically
- ✅ Input field full width
- ✅ Price calculation visible
- ✅ Button full width and clickable
- ✅ No horizontal scrolling

**Actual Result:** _______________

---

### Test 13: Input Focus States

**Steps:**
1. Click on the custom amount input field
2. Observe styling
3. Type a number
4. Click outside
5. Observe styling change

**Expected Result:**
- ✅ When focused: Blue border, subtle shadow
- ✅ When typing: Input accepts numbers
- ✅ When unfocused: Normal border
- ✅ Validation runs on blur

**Actual Result:** _______________

---

### Test 14: Error Message Display/Hide

**Steps:**
1. Enter `50` (invalid)
2. Observe error message
3. Change to `100` (valid)
4. Observe error message disappears

**Expected Result:**
- ✅ Error message appears for invalid input
- ✅ Error message disappears when valid
- ✅ Error message is red and clear
- ✅ No error message for valid amounts

**Actual Result:** _______________

---

### Test 15: Comparison with Preset Packages

**Steps:**
1. Compare custom card with preset package cards
2. Check styling consistency
3. Check spacing consistency
4. Check button styling

**Expected Result:**
- ✅ Custom card matches design language
- ✅ Same card height and spacing
- ✅ Consistent typography
- ✅ Consistent button styling
- ✅ Seamless integration

**Actual Result:** _______________

---

## Browser Testing

### Chrome/Edge
- [ ] All tests pass
- [ ] Input validation works
- [ ] Payment flow works
- [ ] Responsive design works

### Firefox
- [ ] All tests pass
- [ ] Input validation works
- [ ] Payment flow works
- [ ] Responsive design works

### Safari
- [ ] All tests pass
- [ ] Input validation works
- [ ] Payment flow works
- [ ] Responsive design works

### Mobile Safari (iOS)
- [ ] All tests pass
- [ ] Touch interactions work
- [ ] Keyboard appears correctly
- [ ] Payment flow works

### Chrome Mobile (Android)
- [ ] All tests pass
- [ ] Touch interactions work
- [ ] Keyboard appears correctly
- [ ] Payment flow works

---

## Console Checks

### Open Browser DevTools
```
F12 → Console tab
```

### Expected Results
- ✅ No JavaScript errors
- ✅ No console warnings
- ✅ No module errors
- ✅ Payment API calls successful

### Check Network Tab
```
F12 → Network tab
```

### Expected Results
- ✅ Payment initialization request succeeds
- ✅ Payment verification request succeeds
- ✅ User data refresh succeeds
- ✅ No failed requests

---

## Sign-Off Checklist

### Functionality
- [ ] Input validation works
- [ ] Price calculation works
- [ ] Button state management works
- [ ] Payment flow works
- [ ] Tokens added correctly
- [ ] Error handling works

### UI/UX
- [ ] Card displays correctly
- [ ] Input field is usable
- [ ] Error messages clear
- [ ] Price updates real-time
- [ ] Button text updates
- [ ] Hover effects work
- [ ] Focus states visible

### Responsive Design
- [ ] Desktop layout works
- [ ] Tablet layout works
- [ ] Mobile layout works
- [ ] Touch interactions work
- [ ] No horizontal scrolling

### Browser Compatibility
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile browsers work

### Payment Integration
- [ ] Paystack modal opens
- [ ] Payment processes
- [ ] Tokens added
- [ ] Success message shows
- [ ] User data refreshes

---

## Issues Found

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |
| | | | |
| | | | |

---

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Status:** ✅ PASS / ❌ FAIL  

**Comments:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

**Ready for Production:** YES / NO

