# 🔥 Firebase Cloud Functions Setup - FREE Payment Backend

## ✅ What's Included

Your payment backend is now ready to deploy to Firebase Cloud Functions **for FREE**!

### Functions Created:
1. **verifyPayment** - Verify Paystack payments
2. **paystackWebhook** - Handle payment webhooks
3. **health** - Health check endpoint

## 💰 FREE Tier Limits

Firebase Spark (FREE) Plan includes:
- ✅ **2M function invocations/month** (more than enough!)
- ✅ **400K GB-seconds compute time**
- ✅ **200K CPU-seconds compute time**
- ✅ **5 GB outbound networking**
- ✅ **Unlimited inbound networking**

**For most apps, this is completely FREE!**

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Firebase CLI

```powershell
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```powershell
firebase login
```

This will open your browser - login with your Google account.

### Step 3: Initialize Firebase (Already Done!)

The project is already configured with `firebase.json` and functions folder.

### Step 4: Install Dependencies

```powershell
cd functions
npm install
cd ..
```

### Step 5: Set Environment Variables

```powershell
firebase functions:config:set paystack.secret_key="sk_live_aa71affd6c1d1c41d426df812726c406c5f1f290"
```

### Step 6: Deploy to Firebase

```powershell
firebase deploy --only functions
```

This takes 2-3 minutes. You'll get URLs like:
```
✔ functions[verifyPayment(us-central1)] deployed
  https://us-central1-designpro-5169c.cloudfunctions.net/verifyPayment

✔ functions[paystackWebhook(us-central1)] deployed
  https://us-central1-designpro-5169c.cloudfunctions.net/paystackWebhook

✔ functions[health(us-central1)] deployed
  https://us-central1-designpro-5169c.cloudfunctions.net/health
```

### Step 7: Update Your .env File

Replace the payment API URL in your `.env`:

```env
# OLD (localhost)
VITE_PAYMENT_API_URL=http://localhost:3006

# NEW (Firebase)
VITE_PAYMENT_API_URL=https://us-central1-designpro-5169c.cloudfunctions.net
```

### Step 8: Update Payment Service

Your payment service will now call:
```
POST https://us-central1-designpro-5169c.cloudfunctions.net/verifyPayment
```

## 📱 How It Works

### Payment Flow:

1. **User initiates payment** → Paystack popup opens
2. **User completes payment** → Paystack processes payment
3. **App calls verifyPayment** → Firebase function verifies with Paystack
4. **Function saves to Firestore** → Payment stored in database
5. **User subscription updated** → User gets access to features

### What Gets Stored:

```javascript
{
  reference: "ref_abc123",
  amount: 5000,
  currency: "NGN",
  email: "user@example.com",
  status: "success",
  userId: "user123",
  plan: "premium",
  createdAt: "2025-12-01T10:00:00Z"
}
```

## 🔒 Security Features

✅ **Secret keys secured** - Never exposed to client
✅ **CORS enabled** - Only your domains can call functions
✅ **Firestore rules** - Database access controlled
✅ **Payment verification** - Double-checked with Paystack API
✅ **Duplicate prevention** - Payments can't be processed twice

## 📊 Monitoring

### View Logs:
```powershell
firebase functions:log
```

### View in Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Functions" in left menu
4. See usage, errors, and logs

## 🧪 Testing

### Test Locally (Optional):
```powershell
cd functions
npm run serve
```

This runs functions on http://localhost:5001

### Test Production:
```powershell
# Health check
curl https://us-central1-designpro-5169c.cloudfunctions.net/health

# Test payment verification
curl -X POST https://us-central1-designpro-5169c.cloudfunctions.net/verifyPayment \
  -H "Content-Type: application/json" \
  -d '{"reference":"test_ref_123"}'
```

## 💡 Cost Breakdown

### Typical Usage:
- **100 payments/day** = 3,000/month
- **Each payment** = 1 function call
- **Total** = 3,000 invocations/month
- **Cost** = **$0 (FREE!)**

### When You Exceed Free Tier:
- **After 2M invocations** = $0.40 per 1M invocations
- **Example:** 3M invocations = $0.40
- **Still very cheap!**

## 🎯 Next Steps

1. **Deploy functions** (Step 6 above)
2. **Update .env** with Firebase function URL
3. **Test payment** in your app
4. **Monitor logs** in Firebase Console
5. **Configure Paystack webhook** (optional)

## 🆘 Troubleshooting

### Error: "Firebase project not found"
```powershell
firebase use --add
# Select your project: designpro-5169c
```

### Error: "Not authorized"
```powershell
firebase login --reauth
```

### Error: "Functions deployment failed"
```powershell
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 📚 Resources

- Firebase Console: https://console.firebase.google.com
- Firebase Functions Docs: https://firebase.google.com/docs/functions
- Paystack API: https://paystack.com/docs/api

---

**Ready to deploy?** Run these commands:

```powershell
npm install -g firebase-tools
firebase login
cd functions
npm install
cd ..
firebase functions:config:set paystack.secret_key="sk_live_aa71affd6c1d1c41d426df812726c406c5f1f290"
firebase deploy --only functions
```

Your payment backend will be live in 3 minutes! 🚀
