# 💎 User Guide: How to Access Tokens & Plans

Complete guide for users to access the token management system and upgrade their plans.

---

## 🎯 **How to Access the Tokens & Plans Page**

### **Method 1: Direct URL Navigation** ⭐ (Easiest)

Simply navigate to:
```
http://localhost:8100/tokens-and-plans
```

Or in production:
```
https://yourapp.com/tokens-and-plans
```

---

### **Method 2: From the Header Token Display**

1. Look at the top-right corner of any page
2. You'll see your token balance: **💎 1,250 tokens**
3. **Click on the token display**
4. You'll be redirected to the Tokens & Plans page

---

### **Method 3: From Navigation Menu** (Recommended)

Add a navigation link in your app's menu. Here are the options:

#### **Option A: Add to HomeHeader Navigation**

The route has been added to the router. Now you can add a link in the header:

```vue
<!-- In src/components/home/HomeHeader.vue -->
<nav class="nav-menu">
  <a href="#home" class="nav-link">Home</a>
  <a href="#portfolio" class="nav-link">Portfolio</a>
  <router-link to="/tokens-and-plans" class="nav-link">
    💎 Tokens & Plans
  </router-link>
  <!-- ... other links ... -->
</nav>
```

#### **Option B: Add to User Profile Dropdown**

```vue
<!-- In user profile dropdown -->
<div class="user-menu">
  <router-link to="/settings">Settings</router-link>
  <router-link to="/tokens-and-plans">💎 Tokens & Plans</router-link>
  <button @click="logout">Logout</button>
</div>
```

#### **Option C: Add to More Menu Modal**

```vue
<!-- In src/components/home/MoreMenuModal.vue -->
<div class="menu-item" @click="navigate('/tokens-and-plans')">
  <span class="icon">💎</span>
  <span>Tokens & Plans</span>
</div>
```

---

## 💰 **How to Purchase Tokens**

### **Step 1: Navigate to Tokens & Plans Page**

Use any of the methods above to access the page.

---

### **Step 2: View Your Current Balance**

You'll see a large dashboard showing:
```
┌────────────────────────────┐
│    Token Balance           │
│                            │
│    💎 1,250 tokens         │
│    Available Tokens        │
│                            │
│  Total Designs: 45         │
│  Average per Design: 27    │
└────────────────────────────┘
```

---

### **Step 3: Choose a Token Package**

Scroll down to the "Buy Tokens" section. You'll see 6 packages:

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  ₦100    │  │  ₦200    │  │  ₦300    │
│ 💎 100   │  │ 💎 200   │  │ 💎 300   │
│  tokens  │  │  tokens  │  │  tokens  │
└──────────┘  └──────────┘  └──────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐
│  ₦500    │  │  ₦1,000  │  │  ₦1,200  │
│ 💎 500   │  │ 💎 1,000 │  │⭐ Best   │
│  tokens  │  │  tokens  │  │  Value   │
└──────────┘  └──────────┘  │💎 1,200  │
                            └──────────┘
```

**💡 Tip:** The ₦1,200 package is marked as "Best Value"!

---

### **Step 4: Click "Buy Now"**

Click the **"Buy Now"** button on your chosen package.

---

### **Step 5: Complete Payment with Paystack**

A Paystack payment popup will appear:

```
┌─────────────────────────────────┐
│     Paystack Payment            │
├─────────────────────────────────┤
│  Amount: ₦500.00                │
│                                 │
│  Card Number:                   │
│  [________________]             │
│                                 │
│  Expiry Date:    CVV:           │
│  [______]        [___]          │
│                                 │
│  [Pay ₦500.00]                  │
└─────────────────────────────────┘
```

**For Testing (Test Mode):**
- Card Number: `4084 0840 8408 4081`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

**For Production (Live Mode):**
- Use your real debit/credit card

---

### **Step 6: Payment Success**

After successful payment:

1. ✅ **Success notification appears:**
   ```
   🎉 Payment Successful!
   500 tokens added to your account
   ```

2. ✅ **Your balance updates automatically:**
   ```
   💎 1,750 tokens (was 1,250)
   ```

3. ✅ **Header token display updates in real-time**

4. ✅ **Payment appears in your history**

---

## ⭐ **How to Upgrade Your Plan**

### **Step 1: Navigate to Tokens & Plans Page**

---

### **Step 2: View Available Plans**

Scroll down to the "Subscription Plans" section:

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│    🆓      │  │     ⭐     │  │     💎     │
│   Basic    │  │  Premium   │  │    Pro     │
│            │  │Most Popular│  │ Best Value │
│   Free     │  │  ₦2,500    │  │  ₦5,000    │
│  Forever   │  │  2 months  │  │  2 months  │
│            │  │            │  │            │
│ Features:  │  │ Features:  │  │ Features:  │
│ ✓ Pay per  │  │ ✓ 1,000    │  │ ✓ 1,500    │
│   design   │  │   tokens   │  │   tokens   │
│ ✓ No       │  │ ✓ Priority │  │ ✓ Unlimited│
│   commit   │  │   support  │  │   designs  │
│ ✗ No free  │  │ ✓ Early    │  │ ✓ 24/7     │
│   tokens   │  │   access   │  │   support  │
│            │  │            │  │ ✓ Advanced │
│            │  │            │  │   AI       │
│            │  │            │  │            │
│[Current]   │  │ [Upgrade]  │  │ [Upgrade]  │
└────────────┘  └────────────┘  └────────────┘
```

---

### **Step 3: Choose a Plan**

**Premium Plan (₦2,500 / 2 months)** - Most Popular ⭐
- Get **1,000 free tokens** immediately
- Priority support
- Early access to new features
- Perfect for regular users

**Pro Plan (₦5,000 / 2 months)** - Best Value 💎
- Get **1,500 free tokens** immediately
- Unlimited designs
- 24/7 priority support
- Advanced AI features
- Perfect for power users

---

### **Step 4: Click "Upgrade to [Plan Name]"**

Click the **"Upgrade to Premium"** or **"Upgrade to Pro"** button.

---

### **Step 5: Confirm Upgrade**

A confirmation modal will appear:

```
┌─────────────────────────────────────┐
│  Upgrade to Premium?                │
├─────────────────────────────────────┤
│                                     │
│  You'll get:                        │
│  • 1,000 free tokens immediately    │
│  • All Premium benefits             │
│  • Priority support                 │
│  • Early access to new features     │
│                                     │
│  Billing: ₦2,500 / 2 months         │
│  Next billing: 25 Dec 2025          │
│                                     │
│  [Cancel]  [Confirm Upgrade]        │
└─────────────────────────────────────┘
```

Click **"Confirm Upgrade"** to proceed.

---

### **Step 6: Complete Payment**

Same as token purchase - Paystack popup appears.

---

### **Step 7: Enjoy Your Upgraded Plan!**

After successful payment:

1. ✅ **Plan badge updates:**
   ```
   ⭐ Premium Plan  [Upgrade to Pro]
   Expires on 25 Dec 2025
   60 days left
   ```

2. ✅ **Free tokens added automatically:**
   ```
   💎 2,250 tokens (1,250 + 1,000 free)
   ```

3. ✅ **All Premium features unlocked**

4. ✅ **Confirmation notification:**
   ```
   🎉 Welcome to Premium!
   1,000 free tokens added to your account
   ```

---

## 📊 **Understanding Your Token Balance**

### **Token Balance Dashboard**

```
┌────────────────────────────────────────┐
│         Token Balance                  │
│                                        │
│      💎 1,250 tokens                   │
│      Available Tokens                  │
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Total        │  │ Average per  │   │
│  │ Designs      │  │ Design       │   │
│  │    45        │  │    27        │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
│  [Buy More Tokens]                     │
└────────────────────────────────────────┘
```

**What this means:**
- **Available Tokens:** Tokens you can use right now
- **Total Designs:** Number of designs you've created
- **Average per Design:** Average tokens used per design

---

### **How Tokens Are Used**

Tokens are deducted when you:
- ✅ Generate a design with AI
- ✅ Remove background from images
- ✅ Apply advanced effects
- ✅ Export high-resolution designs

**💡 Tip:** Premium and Pro plans give you free tokens every 2 months!

---

## 🔄 **Plan Expiry & Renewal**

### **When Your Plan Expires**

```
⚠️ Premium Plan
Expires on 25 Oct 2025
0 days left - Expiring soon!
```

**What happens:**
1. You'll be downgraded to **Basic Plan**
2. Your purchased tokens remain (not lost!)
3. You can upgrade again anytime

---

### **How to Renew**

Simply upgrade to the same plan again:
1. Go to Tokens & Plans page
2. Click **"Upgrade to Premium"** (or Pro)
3. Complete payment
4. Get another 2 months + free tokens!

---

## 💳 **Payment Methods**

### **Supported Payment Methods (via Paystack)**

- ✅ Debit Cards (Visa, Mastercard, Verve)
- ✅ Credit Cards
- ✅ Bank Transfer
- ✅ USSD
- ✅ Mobile Money

---

### **Test Cards (Development Mode)**

For testing in development:

**Successful Payment:**
- Card: `4084 0840 8408 4081`
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment:**
- Card: `5060 6666 6666 6666 6666`

---

## 🔒 **Security & Privacy**

- ✅ **Secure Payments:** All payments processed by Paystack (PCI-DSS compliant)
- ✅ **No Card Storage:** We never store your card details
- ✅ **Encrypted:** All transactions are encrypted
- ✅ **Verified:** Webhook signature verification prevents fraud

---

## 📱 **Mobile Experience**

The Tokens & Plans page is fully responsive:

**Desktop:**
- 3 token packages per row
- 3 plan cards side-by-side
- Full feature lists

**Tablet:**
- 2 packages per row
- 2-3 plan cards

**Mobile:**
- 1 package per row (stacked)
- 1 plan card per row
- Compact token display in header

---

## ❓ **Frequently Asked Questions**

### **Q: Do my tokens expire?**
A: No! Purchased tokens never expire. Only subscription plans expire after 2 months.

### **Q: What happens to my tokens when my plan expires?**
A: Your purchased tokens remain in your account. Only the free tokens from the plan are removed.

### **Q: Can I upgrade from Premium to Pro?**
A: Yes! You can upgrade anytime. The remaining time on your Premium plan will be credited.

### **Q: Can I get a refund?**
A: Refunds are handled on a case-by-case basis. Contact support for assistance.

### **Q: How do I check my payment history?**
A: Coming soon! A payment history table will be added in Phase 3.

### **Q: Can I buy tokens for someone else?**
A: Currently, tokens are tied to your account. Gift cards coming soon!

---

## 🎉 **Quick Summary**

### **To Buy Tokens:**
1. Go to `/tokens-and-plans`
2. Choose a package
3. Click "Buy Now"
4. Complete Paystack payment
5. Tokens added instantly!

### **To Upgrade Plan:**
1. Go to `/tokens-and-plans`
2. Choose Premium or Pro
3. Click "Upgrade"
4. Confirm in modal
5. Complete payment
6. Enjoy free tokens + benefits!

---

**Need Help?** Contact support or check the documentation! 🚀

