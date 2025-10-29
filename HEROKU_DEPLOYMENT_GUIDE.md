# 🚀 Heroku Deployment Guide - SmartDesignPro Backend

## 📋 **Overview**

This guide will help you deploy your SmartDesignPro backend servers to Heroku so your mobile app can access them from anywhere.

---

## 🎯 **What We're Deploying**

Your app has **6 backend servers**:
1. **payment-server.cjs** (Port 3006) - Payments, tokens, referrals ⭐ **CRITICAL**
2. **marketplace-server.js** (Port 3004) - Templates
3. **ai-server.js** (Port 3002) - AI features
4. **export-server.js** (Port 3001) - Export & share
5. **collaboration-server.js** - Collaboration
6. **auto-design-server.cjs** - Auto design

**We'll deploy the Payment Server first** (most critical for referrals & tokens).

---

## ✅ **Prerequisites**

### 1. Install Heroku CLI

**Windows:**
```powershell
# Download and install from:
https://devcenter.heroku.com/articles/heroku-cli
```

**Mac:**
```bash
brew tap heroku/brew && brew install heroku
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Create Heroku Account
- Go to https://signup.heroku.com/
- Sign up for free account
- Verify your email

### 3. Login to Heroku
```bash
heroku login
```

---

## 🚀 **STEP 1: Prepare Payment Server for Deployment**

### 1.1 Create Procfile
This file tells Heroku how to start your server.

**File: `Procfile`** (already created for you)
```
web: node payment-server.cjs
```

### 1.2 Update package.json
We need to add a start script and specify Node version.

**Add to your `package.json`:**
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "scripts": {
    "start": "node payment-server.cjs",
    "dev": "vite"
  }
}
```

### 1.3 Create .gitignore (if not exists)
```
node_modules/
.env
*.db
dist/
.DS_Store
```

---

## 🚀 **STEP 2: Create Heroku App**

```bash
# Navigate to your project directory
cd "C:\Users\LENOVO\OneDrive\Documents\the real project"

# Create Heroku app (choose a unique name)
heroku create smartdesignpro-backend

# Or let Heroku generate a random name
heroku create
```

**Output:**
```
Creating app... done, ⬢ smartdesignpro-backend
https://smartdesignpro-backend.herokuapp.com/ | https://git.heroku.com/smartdesignpro-backend.git
```

**Save this URL!** You'll need it later.

---

## 🚀 **STEP 3: Configure Environment Variables**

Heroku doesn't use `.env` files. You need to set environment variables manually.

```bash
# Set Paystack keys
heroku config:set PAYSTACK_SECRET_KEY=sk_live_aa71affd6c1d1c41d426df812726c406c5f1f290
heroku config:set PAYSTACK_PUBLIC_KEY=pk_live_647c6a863dbc46dce6495259c4ee93ef686e5d68

# Set CORS origins (update with your domain later)
heroku config:set CORS_ORIGINS="https://smartdesignpro-backend.herokuapp.com,http://localhost:8100,http://localhost:8101"

# Set Node environment
heroku config:set NODE_ENV=production

# Set port (Heroku assigns this automatically, but we set a default)
heroku config:set PAYMENT_PORT=3006
```

**Verify configuration:**
```bash
heroku config
```

---

## 🚀 **STEP 4: Handle SQLite Database**

⚠️ **IMPORTANT:** Heroku's filesystem is **ephemeral** (resets on restart). SQLite files will be lost!

### **Solution: Use PostgreSQL (Recommended)**

**Option A: Add Heroku Postgres (Free Tier)**
```bash
heroku addons:create heroku-postgresql:essential-0
```

**Then you need to:**
1. Install `pg` package: `npm install pg`
2. Update `payment-server.cjs` to use PostgreSQL instead of SQLite
3. Migrate your database schema

**Option B: Keep SQLite for Testing (Temporary)**
- SQLite will work but data will be lost on app restart
- Good for initial testing only
- Not recommended for production

For now, we'll proceed with SQLite for testing, then migrate to PostgreSQL.

---

## 🚀 **STEP 5: Deploy to Heroku**

### 5.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### 5.2 Add Heroku Remote
```bash
heroku git:remote -a smartdesignpro-backend
```

### 5.3 Deploy!
```bash
git push heroku main
```

**If your branch is named `master`:**
```bash
git push heroku master
```

**Watch the deployment logs:**
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Compressing objects: 100% (80/80), done.
Writing objects: 100% (100/100), 50.00 KiB | 5.00 MiB/s, done.
remote: Compressing source files... done.
remote: Building source:
remote: -----> Node.js app detected
remote: -----> Installing dependencies
remote: -----> Build succeeded!
remote: -----> Launching...
remote: https://smartdesignpro-backend.herokuapp.com/ deployed to Heroku
```

---

## 🚀 **STEP 6: Verify Deployment**

### 6.1 Check if app is running
```bash
heroku logs --tail
```

### 6.2 Open your app
```bash
heroku open
```

### 6.3 Test API endpoint
```bash
# Test health check (if you have one)
curl https://smartdesignpro-backend.herokuapp.com/health

# Test user endpoint
curl https://smartdesignpro-backend.herokuapp.com/api/users/test-user-id
```

---

## 🚀 **STEP 7: Update Frontend to Use Heroku URL**

### 7.1 Update `.env` file
```env
# OLD (local development)
VITE_PAYMENT_API_URL=http://localhost:3006

# NEW (production)
VITE_PAYMENT_API_URL=https://smartdesignpro-backend.herokuapp.com
```

### 7.2 Rebuild your frontend
```bash
npm run build
```

### 7.3 Test on mobile
- Deploy your frontend to a hosting service (Netlify, Vercel, Firebase Hosting)
- Or use Ionic's live reload with the Heroku URL
- Test referral system, token purchases, etc.

---

## 🔧 **Troubleshooting**

### App crashes on startup?
```bash
# Check logs
heroku logs --tail

# Common issues:
# 1. Missing environment variables
# 2. Port binding (use process.env.PORT)
# 3. Missing dependencies
```

### Database not working?
```bash
# SQLite won't persist on Heroku
# Migrate to PostgreSQL:
heroku addons:create heroku-postgresql:essential-0
```

### CORS errors?
```bash
# Update CORS origins
heroku config:set CORS_ORIGINS="https://your-frontend-url.com,https://smartdesignpro-backend.herokuapp.com"
```

---

## 📊 **Next Steps**

1. ✅ Deploy payment server (this guide)
2. ⏳ Migrate SQLite to PostgreSQL
3. ⏳ Deploy other servers (marketplace, AI, etc.)
4. ⏳ Set up custom domain
5. ⏳ Configure Paystack webhook URL
6. ⏳ Deploy frontend to Netlify/Vercel
7. ⏳ Test complete flow on mobile

---

## 💰 **Heroku Pricing**

- **Free Tier (Eco Dynos):** $5/month for 1000 dyno hours
- **Basic:** $7/month per dyno
- **Standard:** $25-50/month per dyno

**Recommendation:** Start with Eco tier, upgrade as needed.

---

## 🆘 **Need Help?**

If deployment fails, share the error logs:
```bash
heroku logs --tail > deployment-error.log
```

Then share the `deployment-error.log` file for debugging.

---

**Ready to deploy? Let's start with Step 1!** 🚀

