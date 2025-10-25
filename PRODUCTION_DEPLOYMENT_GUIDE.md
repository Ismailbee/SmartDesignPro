# 🚀 Production Deployment Guide - Paystack Payment System

## ⚠️ **CRITICAL: You Are Using LIVE API Keys**

```
🔴 LIVE MODE ACTIVE
💰 Real money will be processed
🧪 Test with small amounts first
📊 Monitor Paystack dashboard closely
```

---

## 📋 **Pre-Deployment Checklist**

### **1. Paystack Dashboard Configuration**

#### **A. Get Webhook Secret**

1. Login to: https://dashboard.paystack.com
2. Go to: **Settings** → **Developer**
3. Scroll to **Webhook** section
4. Copy **Webhook Secret**
5. Update `.env` file:
   ```env
   PAYSTACK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

#### **B. Configure Webhook URL**

1. In Paystack Dashboard: **Settings** → **Developer**
2. Find **Webhook URL** field
3. Enter your production URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Click **Save**
5. Click **Test Webhook** to verify

#### **C. Verify API Keys**

1. Go to: **Settings** → **API Keys & Webhooks**
2. Confirm you're using **LIVE** keys:
   - Secret Key starts with: `sk_live_`
   - Public Key starts with: `pk_live_`
3. Keys should match those in your `.env` file

---

### **2. Environment Variables (.env)**

Update these values for production:

```env
# ============================================================================
# PAYSTACK LIVE API KEYS - PRODUCTION
# ============================================================================

PAYSTACK_SECRET_KEY=sk_live_aa71affd6c1d1c41d426df812726c406c5f1f290
PAYSTACK_PUBLIC_KEY=pk_live_647c6a863dbc46dce6495259c4ee93ef686e5d68
VITE_PAYSTACK_PUBLIC_KEY=pk_live_647c6a863dbc46dce6495259c4ee93ef686e5d68

# ⚠️ UPDATE THIS - Get from Paystack dashboard
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ============================================================================
# PRODUCTION CONFIGURATION
# ============================================================================

# Payment API URL (update with your production domain)
VITE_PAYMENT_API_URL=https://api.yourdomain.com

# Payment Server Port
PAYMENT_PORT=3006

# Node Environment
NODE_ENV=production

# ============================================================================
# SECURITY SETTINGS
# ============================================================================

# ⚠️ UPDATE THIS - Add your production domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ⚠️ UPDATE THIS - Generate a strong random secret
# Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your_strong_random_secret_here

# ============================================================================
# WEBHOOK CONFIGURATION
# ============================================================================

# ⚠️ UPDATE THIS - Your actual webhook URL
WEBHOOK_URL=https://api.yourdomain.com/api/payments/webhook
```

---

### **3. Generate Strong Session Secret**

Run this command to generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update `.env`:
```env
SESSION_SECRET=<paste_generated_secret_here>
```

---

### **4. Server Configuration**

#### **A. Enable HTTPS**

**Option 1: Using Nginx (Recommended)**

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Option 2: Using Let's Encrypt (Free SSL)**

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

#### **B. Process Manager (PM2)**

Install PM2 to keep server running:

```bash
# Install PM2 globally
npm install -g pm2

# Start payment server with PM2
pm2 start payment-server.cjs --name "payment-server"

# Save PM2 configuration
pm2 save

# Set up auto-start on server reboot
pm2 startup
```

**PM2 Commands:**
```bash
# View logs
pm2 logs payment-server

# Restart server
pm2 restart payment-server

# Stop server
pm2 stop payment-server

# Monitor
pm2 monit
```

---

### **5. Firewall Configuration**

```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Allow HTTP (for redirect to HTTPS)
sudo ufw allow 80/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🧪 **Testing Before Going Live**

### **1. Test with Small Amount**

1. Start payment server
2. Open your app
3. Purchase smallest token package (₦100)
4. Verify:
   - ✅ Paystack popup appears
   - ✅ Payment processes successfully
   - ✅ Tokens added to account
   - ✅ Transaction appears in Paystack dashboard
   - ✅ Webhook received and processed

### **2. Test Webhook Delivery**

```bash
# Check server logs for webhook
pm2 logs payment-server | grep webhook

# Expected output:
# ✅ Webhook received: charge.success
# ✅ Signature verified
# ✅ Payment verified: ref_123456
# ✅ Tokens added: 100
```

### **3. Test Error Handling**

1. Try payment with insufficient funds
2. Try payment with invalid card
3. Verify error messages display correctly
4. Check failed transactions in Paystack dashboard

---

## 📊 **Monitoring & Logging**

### **1. Set Up Logging**

Create `logs` directory:
```bash
mkdir logs
```

Update PM2 configuration:
```bash
pm2 start payment-server.cjs \
  --name "payment-server" \
  --log logs/payment-server.log \
  --error logs/payment-server-error.log
```

### **2. Monitor Transactions**

**Daily Checks:**
- [ ] Check Paystack dashboard for new transactions
- [ ] Verify all successful payments credited tokens
- [ ] Check for failed/pending payments
- [ ] Review webhook delivery logs

**Weekly Checks:**
- [ ] Review error logs
- [ ] Check server performance
- [ ] Verify database integrity
- [ ] Update security patches

### **3. Set Up Alerts**

**Paystack Email Notifications:**
1. Go to: **Settings** → **Notifications**
2. Enable:
   - ✅ Successful payments
   - ✅ Failed payments
   - ✅ Webhook failures
   - ✅ Chargebacks

**Server Monitoring:**
```bash
# Install monitoring tool (optional)
npm install -g pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔒 **Security Best Practices**

### **1. Environment Variables**

- ✅ Never commit `.env` to Git
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys periodically (every 90 days)
- ✅ Limit access to `.env` file (chmod 600)

### **2. Server Security**

```bash
# Set proper file permissions
chmod 600 .env
chmod 644 payment-server.cjs

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Keep system updated
sudo apt-get update && sudo apt-get upgrade
```

### **3. Database Security**

```bash
# Set proper permissions on database
chmod 600 payments.db

# Regular backups
# Add to crontab (crontab -e):
0 2 * * * cp /path/to/payments.db /path/to/backups/payments-$(date +\%Y\%m\%d).db
```

---

## 🚨 **Emergency Procedures**

### **If Payment Server Crashes:**

```bash
# Check status
pm2 status

# View error logs
pm2 logs payment-server --err

# Restart server
pm2 restart payment-server

# If still failing, check:
# 1. Database file exists and is readable
# 2. .env file is present and valid
# 3. Port 3006 is not in use
# 4. Node.js is installed and working
```

### **If Webhook Stops Working:**

1. Check Paystack dashboard for webhook errors
2. Verify webhook URL is correct
3. Test webhook from dashboard
4. Check server logs for signature errors
5. Verify `PAYSTACK_WEBHOOK_SECRET` is correct

### **If Payments Fail:**

1. Check Paystack dashboard for error details
2. Verify API keys are valid and active
3. Check server logs for errors
4. Test with Paystack test card
5. Contact Paystack support if needed

---

## 📞 **Support Contacts**

**Paystack Support:**
- Email: support@paystack.com
- Phone: +234 1 888 3888
- Dashboard: https://dashboard.paystack.com
- Docs: https://paystack.com/docs

**Your Team:**
- Developer: [Your contact]
- DevOps: [Your contact]
- Support: [Your contact]

---

## ✅ **Final Deployment Steps**

1. **Update `.env` with production values:**
   - [ ] PAYSTACK_WEBHOOK_SECRET
   - [ ] CORS_ORIGINS
   - [ ] SESSION_SECRET
   - [ ] WEBHOOK_URL
   - [ ] VITE_PAYMENT_API_URL

2. **Configure Paystack Dashboard:**
   - [ ] Add webhook URL
   - [ ] Test webhook delivery
   - [ ] Enable email notifications

3. **Set up server:**
   - [ ] Install SSL certificate
   - [ ] Configure Nginx/Apache
   - [ ] Install PM2
   - [ ] Set up firewall

4. **Test thoroughly:**
   - [ ] Test small payment (₦100)
   - [ ] Verify webhook received
   - [ ] Check tokens credited
   - [ ] Test error scenarios

5. **Monitor closely:**
   - [ ] Watch first 10 transactions
   - [ ] Check logs daily for first week
   - [ ] Respond to any issues immediately

---

## 🎉 **You're Ready to Go Live!**

Once all checklist items are complete:

1. ✅ Start payment server with PM2
2. ✅ Monitor logs in real-time
3. ✅ Process first test transaction
4. ✅ Verify everything works
5. ✅ Announce to users!

**Good luck with your launch!** 🚀

---

**Remember:**
- 🔴 You're in LIVE mode
- 💰 Real money is being processed
- 📊 Monitor closely
- 🚨 Have emergency procedures ready
- 📞 Keep support contacts handy

