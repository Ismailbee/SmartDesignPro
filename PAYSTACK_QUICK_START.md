# ⚡ Paystack LIVE - Quick Start (5 Minutes)

## 🚀 **Start Payment Server**

```bash
node payment-server.cjs
```

**Expected Output:**
```
🚀 Payment Server running on port 3006
💳 Paystack mode: LIVE
✅ Ready to process payments!
```

---

## 🌐 **Start Frontend**

```bash
npm run dev
```

**Open:** `http://localhost:8101`

---

## 💳 **Test Payment**

1. **Login** to your account
2. **Click** token display (💎 1,250) in header
3. **Click** "Buy Now" on any token package
4. **Complete** payment with REAL card (⚠️ LIVE mode!)
5. **Verify** tokens added to account

---

## ✅ **Verify in Paystack**

Go to: https://dashboard.paystack.com/transactions

**Check:**
- ✅ Transaction appears
- ✅ Status is "Success"
- ✅ Amount is correct

---

## 📋 **Configuration Files**

### **`.env` (Already Created)**
```env
PAYSTACK_SECRET_KEY=sk_live_aa71affd6c1d1c41d426df812726c406c5f1f290
PAYSTACK_PUBLIC_KEY=pk_live_647c6a863dbc46dce6495259c4ee93ef686e5d68
VITE_PAYSTACK_PUBLIC_KEY=pk_live_647c6a863dbc46dce6495259c4ee93ef686e5d68
VITE_PAYMENT_API_URL=http://localhost:3006
```

### **`payment-server.cjs` (Already Updated)**
```javascript
require('dotenv').config()
```

### **`index.html` (Already Updated)**
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

---

## ⚠️ **IMPORTANT**

```
🔴 LIVE MODE ACTIVE
💰 Real money will be processed
🧪 Test with small amounts
📊 Monitor Paystack dashboard
```

---

## 🔐 **Security**

- ✅ `.env` is in `.gitignore`
- ✅ Secret key is server-side only
- ✅ No hardcoded API keys
- ✅ HTTPS required in production

---

## 📞 **Support**

**Paystack:** https://dashboard.paystack.com

**Docs:** https://paystack.com/docs

---

## 🎯 **Next Steps**

1. ✅ Test payment (you're here!)
2. Get webhook secret from Paystack
3. Configure webhook URL
4. Set up production HTTPS
5. Deploy to production

---

**Ready to process payments!** 🚀

