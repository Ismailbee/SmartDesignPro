# 💎 Token Management & Subscription System

Complete implementation of token-based payment system with Paystack integration for Vue 3 + Ionic application.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This system implements a comprehensive token and subscription management solution with:

- **Token Purchase**: Buy tokens in packages (₦100 to ₦1,200)
- **Plan Upgrades**: Subscribe to Premium or Pro plans
- **Paystack Integration**: Secure payment processing
- **Real-time Updates**: Token balance updates across the app
- **Payment History**: Track all transactions

---

## ✨ Features

### Token System
- ✅ Buy tokens in 6 different packages
- ✅ Real-time token balance display
- ✅ Token deduction for design generation
- ✅ Usage statistics and analytics

### Subscription Plans

#### Basic Plan (Free)
- Pay-per-design model
- No monthly commitment
- No free tokens

#### Premium Plan (₦2,500 / 2 months)
- 1,000 free tokens on signup
- Priority email support
- Early access to new features
- Plan ID: `PLN_5x6n9kfpr8z34lu`

#### Pro Plan (₦5,000 / 2 months)
- 1,500 free tokens on signup
- Unlimited designs
- Priority 24/7 support
- Advanced AI features
- Plan ID: `PLN_31ofmv6h9jplglk`

### Payment Features
- ✅ Paystack popup integration
- ✅ Webhook verification
- ✅ Payment history tracking
- ✅ Automatic plan expiry handling
- ✅ Idempotent payment processing

---

## 🏗️ Architecture

### Backend (Node.js + Express)

```
payment-server.js
├── Database (SQLite)
│   ├── users table
│   └── payments table
├── API Endpoints
│   ├── GET /api/users/:userId
│   ├── PATCH /api/users/:userId/tokens
│   ├── GET /api/users/:userId/payments
│   ├── POST /api/payments/initialize
│   ├── POST /api/payments/webhook
│   └── GET /api/payments/verify/:reference
└── Paystack Service
    ├── initializeTransaction()
    ├── verifyTransaction()
    └── verifyWebhookSignature()
```

### Frontend (Vue 3 + Ionic)

```
src/
├── views/
│   └── TokensAndPlans.vue (Main dashboard)
├── components/
│   └── HeaderTokenDisplay.vue (Token count in header)
├── stores/
│   └── user.store.ts (Pinia store)
├── services/
│   ├── payment.service.ts (Paystack integration)
│   └── user.service.ts (User API calls)
└── types/
    └── payment.types.ts (TypeScript definitions)
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```powershell
# Run the setup script
.\setup-payment-server.ps1

# Or manually install
npm install express cors better-sqlite3 express-validator uuid axios
```

#### Configure Environment Variables

Create or update `.env` file:

```env
# Payment Server
PAYMENT_PORT=3006

# Paystack Keys (Get from https://dashboard.paystack.com/#/settings/developer)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

# Application URL
APP_URL=http://localhost:8100

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:8100,http://localhost:3000

# Environment
NODE_ENV=development
```

#### Start the Server

```powershell
node payment-server.js
```

Server will run on `http://localhost:3006`

### 2. Frontend Setup

#### Add Paystack Script to index.html

```html
<!-- Add before closing </body> tag -->
<script src="https://js.paystack.co/v1/inline.js"></script>
```

#### Configure Environment Variables

Create or update `.env` file in project root:

```env
# Payment API
VITE_PAYMENT_API_URL=http://localhost:3006

# Paystack Public Key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

#### Add Route

Update `src/router/index.ts`:

```typescript
import TokensAndPlans from '@/views/TokensAndPlans.vue'

const routes = [
  // ... existing routes
  {
    path: '/tokens-and-plans',
    name: 'TokensAndPlans',
    component: TokensAndPlans,
    meta: { requiresAuth: true }
  }
]
```

#### Add Header Component

Update your main layout/header component:

```vue
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>My App</ion-title>
      <ion-buttons slot="end">
        <HeaderTokenDisplay />
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import HeaderTokenDisplay from '@/components/HeaderTokenDisplay.vue'
</script>
```

---

## 📚 API Documentation

### User Endpoints

#### GET /api/users/:userId

Get user data including tokens and plan.

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "Premium",
  "planExpiryDate": "2025-12-25T00:00:00Z",
  "tokens": 1250,
  "totalDesignsGenerated": 45
}
```

#### PATCH /api/users/:userId/tokens

Deduct tokens when a design is generated.

**Request:**
```json
{
  "deduct": 10
}
```

**Response:**
```json
{
  "tokens": 1240,
  "totalDesignsGenerated": 46
}
```

#### GET /api/users/:userId/payments

Get payment history with pagination and filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `type` (optional: 'token_purchase' | 'plan_upgrade')
- `startDate` (optional: ISO date string)
- `endDate` (optional: ISO date string)

**Response:**
```json
{
  "payments": [
    {
      "id": "pay_123",
      "amount": 500,
      "type": "token_purchase",
      "tokens": 500,
      "status": "success",
      "reference": "TKN_user123_1234567890",
      "createdAt": "2025-10-20T10:30:00Z",
      "verifiedAt": "2025-10-20T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Payment Endpoints

#### POST /api/payments/initialize

Initialize a Paystack payment.

**Request (Token Purchase):**
```json
{
  "userId": "user_123",
  "email": "john@example.com",
  "name": "John Doe",
  "amount": 500,
  "type": "token_purchase",
  "tokens": 500
}
```

**Request (Plan Upgrade):**
```json
{
  "userId": "user_123",
  "email": "john@example.com",
  "name": "John Doe",
  "amount": 2500,
  "type": "plan_upgrade",
  "plan": "Premium",
  "planId": "PLN_5x6n9kfpr8z34lu"
}
```

**Response:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "TKN_user123_1234567890",
  "accessCode": "abc123xyz"
}
```

#### POST /api/payments/webhook

Handle Paystack webhook events (called by Paystack).

**Headers:**
- `x-paystack-signature`: Webhook signature for verification

**Payload:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "TKN_user123_1234567890",
    "amount": 50000,
    "metadata": {
      "userId": "user_123",
      "type": "token_purchase",
      "tokens": 500
    }
  }
}
```

#### GET /api/payments/verify/:reference

Manually verify a payment.

**Response:**
```json
{
  "status": "success",
  "amount": 500,
  "type": "token_purchase",
  "tokens": 500,
  "verifiedAt": "2025-10-20T10:35:00Z"
}
```

---

## 🧩 Frontend Components

### TokensAndPlans.vue

Main dashboard page with 4 sections:

1. **Current Plan Display** - Shows active plan with upgrade button
2. **Token Balance Dashboard** - Large token count with usage stats
3. **Token Purchase Options** - 6 token packages in responsive grid
4. **Plan Upgrade Cards** - 3 plan cards (Basic, Premium, Pro)

**Usage:**
```vue
<template>
  <ion-button @click="router.push('/tokens-and-plans')">
    Manage Tokens
  </ion-button>
</template>
```

### HeaderTokenDisplay.vue

Compact token display for page header.

**Features:**
- Shows current token balance
- Clickable - navigates to TokensAndPlans page
- Real-time updates from Pinia store
- Responsive (hides text on mobile)
- Loading skeleton

**Usage:**
```vue
<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end">
        <HeaderTokenDisplay />
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>
```

---

## 🧪 Testing

### Paystack Test Mode

Use test keys for development:
- Secret Key: `sk_test_...`
- Public Key: `pk_test_...`

### Test Cards

**Success:**
- Card: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`

**Declined:**
- Card: `4084 0840 8408 4084`

### Test Webhook

Use Paystack Dashboard to send test webhook events:
1. Go to Settings → Webhooks
2. Click "Send Test Event"
3. Select "charge.success"
4. Check server logs

---

## 🔧 Troubleshooting

### Payment Server Won't Start

**Issue:** Missing Paystack keys

**Solution:**
```powershell
# Check .env file
cat .env

# Update with your keys
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

### Webhook Not Working

**Issue:** Invalid signature

**Solution:**
1. Check `PAYSTACK_WEBHOOK_SECRET` in `.env`
2. Get secret from Paystack Dashboard → Settings → Webhooks
3. Restart payment server

### Frontend Can't Connect

**Issue:** CORS error

**Solution:**
```env
# Update CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:5173,http://localhost:8100
```

### Tokens Not Updating

**Issue:** User store not initialized

**Solution:**
```typescript
// In your component
import { useUserStore } from '@/stores/user.store'

const userStore = useUserStore()

onMounted(async () => {
  await userStore.fetchUser(userId)
})
```

---

## 📝 Next Steps

1. ✅ **Phase 1 Complete**: Core functionality implemented
2. 🔄 **Phase 2**: Add payment history table component
3. 🔄 **Phase 3**: Add admin dashboard
4. 🔄 **Phase 4**: Production deployment

---

## 🔗 Resources

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Dashboard](https://dashboard.paystack.com)
- [Test Cards](https://paystack.com/docs/payments/test-payments)
- [Webhook Events](https://paystack.com/docs/payments/webhooks)

---

**Status:** ✅ Phase 1 Complete - Ready for Testing!

