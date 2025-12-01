# 🚀 Deploy Payment Server to Render.com - FREE

## ✅ Why Render.com?

- ✅ **100% FREE** - No credit card required
- ✅ **Automatic HTTPS** - Secure by default
- ✅ **Auto-deploy from GitHub** - Push to deploy
- ✅ **750 hours/month FREE** - More than enough!
- ✅ **Easy setup** - Takes 5 minutes

## 📋 Step-by-Step Deployment

### Step 1: Push Code to GitHub (1 minute)

Your code is already on GitHub: `Ismailbee/SmartDesignPro`

Make sure the latest changes are pushed:

```powershell
git add .
git commit -m "Add payment server for Render deployment"
git push origin main
```

### Step 2: Create Render Account (1 minute)

1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account (easier)
4. **No credit card needed!**

### Step 3: Create New Web Service (2 minutes)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **Ismailbee/SmartDesignPro**
3. Render will detect the `render.yaml` file

### Step 4: Configure Service

Render will auto-fill these from `render.yaml`:

- **Name**: `smartdesignpro-payment`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node payment-server.js`
- **Plan**: **Free** ✅

### Step 5: Add Environment Variable

Click **"Environment"** tab and add:

```
Key: PAYSTACK_SECRET_KEY
Value: sk_live_aa71affd6c1d1c41d426df812726c406c5f1f290
```

### Step 6: Deploy! 🚀

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like:
   ```
   https://smartdesignpro-payment.onrender.com
   ```

### Step 7: Update Your .env

Copy your Render URL and update `.env`:

```env
# OLD
VITE_PAYMENT_API_URL=http://localhost:3006

# NEW
VITE_PAYMENT_API_URL=https://smartdesignpro-payment.onrender.com
```

### Step 8: Test It! ✅

Test your payment endpoint:

```powershell
# Health check
curl https://smartdesignpro-payment.onrender.com/health

# Test payment verification (use a real Paystack reference)
curl -X POST https://smartdesignpro-payment.onrender.com/verifyPayment `
  -H "Content-Type: application/json" `
  -d '{"reference":"your_payment_reference"}'
```

## 🎯 That's It!

Your payment server is now:
- ✅ **Live on the internet**
- ✅ **100% FREE**
- ✅ **Auto-deploys when you push to GitHub**
- ✅ **Has HTTPS (secure)**

## 📊 Free Plan Limits

- **750 hours/month** = 24/7 uptime
- **512 MB RAM** = More than enough
- **Automatic HTTPS**
- **Automatic deploys**

**You won't pay anything!** 💰

## 🔄 Auto-Deploy Setup

After initial setup, every time you push to GitHub:

```powershell
git add .
git commit -m "Update payment server"
git push origin main
```

Render will **automatically** redeploy your server! 🎉

## 🆘 Troubleshooting

### Server sleeping after inactivity?
Free tier servers sleep after 15 minutes of no requests. First request takes ~30 seconds to wake up. This is normal and FREE!

To keep it awake (optional):
1. Use a service like **UptimeRobot** (also free)
2. Ping your server every 10 minutes

### Deployment failed?
1. Check logs in Render dashboard
2. Make sure `package.json` has all dependencies
3. Verify environment variables are set

### Can't connect to server?
1. Check if server is running in Render dashboard
2. Verify the URL is correct
3. Test with health check endpoint first

## 💡 Next Steps

1. **Deploy to Render** (follow steps above)
2. **Update .env** with your Render URL
3. **Rebuild your app**: `npm run build`
4. **Test payment** in your app
5. **Celebrate!** 🎉

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Your GitHub Repo: https://github.com/Ismailbee/SmartDesignPro
- Paystack Dashboard: https://dashboard.paystack.com

---

**Ready to deploy?**

1. Push to GitHub
2. Go to https://render.com
3. Follow steps above
4. Done in 5 minutes! 🚀
