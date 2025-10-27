# 🧪 Quick Test - Tokens & Plans Page

## Prerequisites

✅ All fixes applied:
- `src/views/TokensAndPlans.vue` - Fixed template syntax
- `src/main.ts` - Added Ionic Vue configuration

---

## Test Steps

### Step 1: Start Payment Server
```bash
# Open Terminal 1
cd "c:\Users\LENOVO\OneDrive\Documents\the real project"
node payment-server.cjs
```

**Expected Output:**
```
🚀 Payment Server running on port 3006
💳 Paystack mode: LIVE
✅ Ready to process payments!
```

---

### Step 2: Start Frontend Dev Server
```bash
# Open Terminal 2
cd "c:\Users\LENOVO\OneDrive\Documents\the real project"
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:8101/
  ➜  press h to show help
```

---

### Step 3: Open Browser
```
http://localhost:8101
```

---

### Step 4: Login
1. Click "Login" button
2. Enter your Firebase credentials
3. Wait for redirect to home page

---

### Step 5: Navigate to Tokens Page
1. Look for token display in header (💎 with number)
2. Click on it
3. Should navigate to `/tokens-and-plans`

---

## Visual Verification

### Hero Section ✅
- [ ] Gradient background (blue to purple) displays
- [ ] Plan badge shows (e.g., "Premium Plan")
- [ ] Token count displays large (3.5rem font)
- [ ] Quick stats show 3 cards:
  - [ ] Total Designs
  - [ ] Avg per Design
  - [ ] Current Plan
- [ ] "Buy More Tokens" button is visible

### Token Packages Section ✅
- [ ] Section title: "Buy Tokens"
- [ ] Section subtitle: "Choose a package that fits your needs"
- [ ] 3 package cards display in a row (desktop)
- [ ] Each card shows:
  - [ ] Price (₦ amount)
  - [ ] Token count with 💎 icon
  - [ ] Value indicator (tokens/₦)
  - [ ] "Buy Now" button
- [ ] Best value card has:
  - [ ] Warm gradient background
  - [ ] ⭐ "Best Value" badge
  - [ ] Highlighted border

### Subscription Plans Section ✅
- [ ] Section title: "Subscription Plans"
- [ ] Section subtitle: "Unlock more features and benefits"
- [ ] 3 plan cards display in a row (desktop)
- [ ] Each card shows:
  - [ ] Plan icon (emoji)
  - [ ] Plan name
  - [ ] Pricing
  - [ ] Feature list with ✓ checkmarks
  - [ ] CTA button
- [ ] Current plan highlighted (blue gradient)
- [ ] Recommended plan highlighted (green gradient)

### Responsive Design ✅
- [ ] Desktop (1920px): 3-column layout
- [ ] Tablet (768px): 2-column layout
- [ ] Mobile (375px): 1-column layout

---

## Console Check

### Open Browser DevTools
```
F12 → Console tab
```

### Expected Results
- ✅ No "Unknown custom element" errors
- ✅ No "Failed to resolve component" errors
- ✅ No "Cannot find module" errors
- ✅ No red error messages
- ✅ Only info/warning messages (if any)

### Common Errors to Watch For
```
❌ [Vue warn]: Unknown custom element: 'ion-page'
   → Means Ionic Vue not registered

❌ [Vue warn]: Failed to resolve component: IonPage
   → Means component not imported

❌ Cannot find module '@ionic/vue'
   → Means Ionic Vue not installed
```

---

## Interaction Testing

### Hover Effects (Desktop)
- [ ] Hover over package card → lifts up
- [ ] Hover over plan card → shadow increases
- [ ] Hover over button → color changes

### Click Interactions
- [ ] Click "Buy More Tokens" → scrolls to packages
- [ ] Click "Buy Now" on package → payment flow starts
- [ ] Click "Upgrade" on plan → upgrade flow starts
- [ ] Click back button → navigates to home

### Loading State
- [ ] Page shows spinner while loading
- [ ] Spinner is blue (primary color)
- [ ] "Loading your account..." text displays

---

## Data Verification

### Check User Data
1. Open browser console (F12)
2. Run this command:
```javascript
// Check if user data loaded
const userStore = window.$pinia?.state.value.user
console.log('User:', userStore?.user)
console.log('Tokens:', userStore?.user?.tokens)
console.log('Plan:', userStore?.user?.plan)
```

**Expected Output:**
```javascript
User: {
  id: "VwXPosv5R8dAfUFdE513DqV1dUd2",
  email: "ismailabdulrauf556@gmail.com",
  tokens: 1250,
  plan: "Premium",
  ...
}
Tokens: 1250
Plan: "Premium"
```

---

## Payment Flow Test

### Test Token Purchase
1. Click "Buy Now" on any package
2. Paystack payment modal opens
3. Use test card: `4084 0840 8408 4081`
4. Enter any future expiry date
5. Enter any 3-digit CVV
6. Click "Pay"
7. Should show success message
8. Token balance should update

### Test Plan Upgrade
1. Click "Upgrade" on Premium or Pro plan
2. Paystack payment modal opens
3. Complete payment with test card
4. Should show success message
5. Plan should update

---

## Troubleshooting

### Issue: Page shows blank
**Solution:** 
1. Check payment server is running
2. Check browser console for errors
3. Refresh page (Ctrl+R)

### Issue: Ionic components not styled
**Solution:**
1. Check `src/main.ts` has Ionic CSS imports
2. Check `app.use(IonicVue)` is called
3. Restart dev server

### Issue: Icons not showing
**Solution:**
1. Check icon imports in `TokensAndPlans.vue`
2. Check ionicons package is installed
3. Restart dev server

### Issue: Payment flow not working
**Solution:**
1. Check payment server is running
2. Check Paystack API keys in `.env`
3. Check browser console for errors

---

## Sign-Off Checklist

- [ ] Page loads without errors
- [ ] All Ionic components render
- [ ] Hero section displays correctly
- [ ] Token packages display correctly
- [ ] Subscription plans display correctly
- [ ] Responsive design works
- [ ] Hover effects work
- [ ] Click interactions work
- [ ] User data displays correctly
- [ ] No console errors
- [ ] Ready for production

---

## Success Criteria

✅ **All of the above checks pass**  
✅ **No console errors**  
✅ **Page displays beautifully**  
✅ **All interactions work smoothly**  

---

**Happy Testing!** 🚀

