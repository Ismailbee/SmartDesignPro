# 🚀 Token Management System - Quick Start Guide

Get the token management system up and running in 5 minutes!

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies (1 min)

```powershell
# Run the setup script
.\setup-payment-server.ps1
```

### Step 2: Configure Paystack (2 min)

1. **Get Paystack Keys:**
   - Go to https://dashboard.paystack.com/#/settings/developer
   - Copy your **Test Secret Key** (starts with `sk_test_`)
   - Copy your **Test Public Key** (starts with `pk_test_`)

2. **Update .env file:**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
   ```

3. **Update frontend .env:**
   ```env
   VITE_PAYMENT_API_URL=http://localhost:3006
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   ```

### Step 3: Add Paystack Script (30 sec)

Add to `index.html` before closing `</body>` tag:

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

### Step 4: Add Route (30 sec)

Update `src/router/index.ts`:

```typescript
{
  path: '/tokens-and-plans',
  name: 'TokensAndPlans',
  component: () => import('@/views/TokensAndPlans.vue'),
  meta: { requiresAuth: true }
}
```

### Step 5: Start Servers (1 min)

```powershell
# Terminal 1: Start payment server
node payment-server.js

# Terminal 2: Start frontend
npm run dev
```

---

## ✅ Test It Out

### 1. Open the App

Navigate to: `http://localhost:8100/tokens-and-plans`

### 2. Test Token Purchase

1. Click on any token package (e.g., ₦500 → 500 tokens)
2. Paystack popup will open
3. Use test card: `4084 0840 8408 4081`
4. CVV: `408`, PIN: `0000`
5. Complete payment
6. Tokens should be added to your account!

### 3. Test Plan Upgrade

1. Click "Upgrade to Premium" button
2. Confirm in the modal
3. Complete payment with test card
4. Plan should upgrade and 1,000 tokens added!

---

## 🎯 Key Features to Test

### ✅ Token Purchase
- [ ] Click token package
- [ ] Paystack popup opens
- [ ] Complete payment
- [ ] Tokens added to balance
- [ ] Header token count updates

### ✅ Plan Upgrade
- [ ] Click upgrade button
- [ ] Confirmation modal shows
- [ ] Complete payment
- [ ] Plan badge updates
- [ ] Free tokens added

### ✅ Token Deduction
- [ ] Generate a design
- [ ] Tokens deducted automatically
- [ ] Balance updates in real-time

---

## 🧪 Test Cards

### Success Card
```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: 12/25 (any future date)
PIN: 0000
```

### Declined Card
```
Card Number: 4084 0840 8408 4084
CVV: 408
Expiry: 12/25
PIN: 0000
```

---

## 📊 What You Should See

### 1. Tokens & Plans Page

```
┌─────────────────────────────────────┐
│  ⭐ Premium Plan    [Upgrade to Pro]│
│  Expires on 25 Dec 2025             │
│  23 days left                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Token Balance               │
│                                     │
│      💎 1,250 tokens                │
│                                     │
│  Total Designs: 45                  │
│  Average per Design: 27             │
│                                     │
│     [Buy More Tokens]               │
└─────────────────────────────────────┘

Buy Tokens
┌────────┐ ┌────────┐ ┌────────┐
│ ₦100   │ │ ₦200   │ │ ₦300   │
│ 💎 100 │ │ 💎 200 │ │ 💎 300 │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ ₦500   │ │ ₦1,000 │ │ ₦1,200 │
│ 💎 500 │ │💎 1,000│ │💎 1,200│
└────────┘ └────────┘ └────────┘
                      ⭐ Best Value

Subscription Plans
┌──────────┐ ┌──────────┐ ┌──────────┐
│   🆓     │ │    ⭐    │ │    💎    │
│  Basic   │ │ Premium  │ │   Pro    │
│   Free   │ │  ₦2,500  │ │  ₦5,000  │
│          │ │ 2 months │ │ 2 months │
│ Features │ │ Features │ │ Features │
│ [Switch] │ │[Upgrade] │ │[Upgrade] │
└──────────┘ └──────────┘ └──────────┘
```

### 2. Header Token Display

```
┌──────────────────────────────────┐
│  My App          💎 1,250 tokens │
└──────────────────────────────────┘
```

---

## 🔧 Common Issues & Fixes

### Issue: "Paystack is not defined"

**Fix:** Add Paystack script to `index.html`
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

### Issue: "Failed to initialize payment"

**Fix:** Check Paystack keys in `.env`
```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

### Issue: "CORS error"

**Fix:** Update CORS origins in `.env`
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:8100
```

### Issue: "User not found"

**Fix:** Update user ID in TokensAndPlans.vue
```typescript
// Replace with actual user ID from auth
const userId = 'user_123' // TODO: Get from auth store
```

---

## 📝 Next Steps

### 1. Integrate with Auth System

Update `TokensAndPlans.vue` and `HeaderTokenDisplay.vue`:

```typescript
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const userId = authStore.user?.id
```

### 2. Add Payment History Component

Create `src/components/PaymentHistory.vue` (see full implementation plan)

### 3. Test Webhook

1. Use ngrok to expose local server:
   ```powershell
   ngrok http 3006
   ```

2. Add webhook URL in Paystack Dashboard:
   ```
   https://your-ngrok-url.ngrok.io/api/payments/webhook
   ```

3. Test with real payment

### 4. Production Deployment

1. Switch to live Paystack keys
2. Update environment variables
3. Deploy backend to cloud (Heroku, Railway, etc.)
4. Update frontend API URL

---

## 🎉 Success Checklist

- [x] Payment server running on port 3006
- [x] Frontend running on port 8100
- [x] Paystack keys configured
- [x] Can navigate to /tokens-and-plans
- [x] Can purchase tokens with test card
- [x] Can upgrade plan with test card
- [x] Token balance updates in header
- [x] Payment history shows transactions

---

## 🔗 Quick Links

- **Payment Server Health:** http://localhost:3006/health
- **Tokens Page:** http://localhost:8100/tokens-and-plans
- **Paystack Dashboard:** https://dashboard.paystack.com
- **Test Cards:** https://paystack.com/docs/payments/test-payments

---

## 💡 Pro Tips

1. **Use Test Mode First:** Always test with `sk_test_` and `pk_test_` keys before going live

2. **Monitor Webhooks:** Check Paystack Dashboard → Webhooks to see webhook delivery status

3. **Check Server Logs:** Payment server logs all transactions for debugging

4. **Test Edge Cases:**
   - Insufficient tokens
   - Payment cancellation
   - Network errors
   - Duplicate payments

5. **Security:** Never commit `.env` file to git!

---

**Ready to go! 🚀**

If you encounter any issues, check the full documentation in `TOKEN_MANAGEMENT_README.md`

