# 🚀 Start Payment Server - Quick Guide

## ⚠️ CRITICAL: Payment Server Not Running

The error you're seeing:
```
GET http://localhost:3006/api/users/VwXPosv5R8dAfUFdE513DqV1dUd2 net::ERR_CONNECTION_REFUSED
```

This means **the payment server is not running**. You need to start it!

---

## How to Start Payment Server

### **Step 1: Open New Terminal**

Open a **NEW terminal window** (separate from your frontend dev server)

### **Step 2: Navigate to Project Directory**

```bash
cd "C:\Users\LENOVO\OneDrive\Documents\the real project"
```

### **Step 3: Start Payment Server**

```bash
node payment-server.cjs
```

### **Step 4: Verify Server Started**

You should see:
```
[dotenv@17.2.3] injecting env (18) from .env
✅ Database initialized successfully

🚀 Payment Server running on port 3006
📊 Health check: http://localhost:3006/health
💳 Paystack mode: LIVE

✅ Ready to process payments!
```

---

## ✅ Verification

### **Test Server is Running:**

Open browser and go to:
```
http://localhost:3006/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "payment-server"
}
```

---

## 🔧 Troubleshooting

### **Issue: "Cannot find module 'dotenv'"**

**Solution:**
```bash
npm install dotenv
```

### **Issue: "Port 3006 already in use"**

**Solution:**
```bash
# Find process using port 3006
netstat -ano | findstr :3006

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Then start server again
node payment-server.cjs
```

### **Issue: "Cannot find module 'express'"**

**Solution:**
```bash
npm install express cors uuid better-sqlite3 express-validator axios dotenv
```

---

## 📋 Complete Startup Checklist

### **Terminal 1: Payment Server**
```bash
cd "C:\Users\LENOVO\OneDrive\Documents\the real project"
node payment-server.cjs
```

**Expected Output:**
```
🚀 Payment Server running on port 3006
💳 Paystack mode: LIVE
✅ Ready to process payments!
```

### **Terminal 2: Frontend Dev Server**
```bash
cd "C:\Users\LENOVO\OneDrive\Documents\the real project"
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8101/
➜  Network: use --host to expose
```

---

## 🎯 After Both Servers Are Running

1. Open browser: `http://localhost:8101`
2. Login with your account
3. Click token display (💎) in header
4. Should navigate to `/tokens-and-plans`
5. Page should load successfully!

---

## 📊 What You Should See

### **Payment Server Terminal:**
```
🚀 Payment Server running on port 3006
💳 Paystack mode: LIVE
✅ Ready to process payments!

✅ Created new user: VwXPosv5R8dAfUFdE513DqV1dUd2
```

### **Browser:**
- Token balance displayed
- Current plan shown
- Token packages visible
- Plan upgrade options visible

---

## ⚠️ Important Notes

1. **Keep Both Terminals Open**
   - Terminal 1: Payment server (port 3006)
   - Terminal 2: Frontend dev server (port 8101)

2. **Don't Close Terminals**
   - Closing terminal will stop the server
   - You need both servers running simultaneously

3. **Check Logs**
   - Payment server logs show user creation
   - Frontend console shows API calls

---

## 🔍 Quick Debug Commands

### **Check if payment server is running:**
```bash
curl http://localhost:3006/health
```

### **Check if frontend is running:**
```bash
curl http://localhost:8101
```

### **Check what's using port 3006:**
```bash
netstat -ano | findstr :3006
```

### **Check what's using port 8101:**
```bash
netstat -ano | findstr :8101
```

---

## ✅ Success Indicators

### **Payment Server Running:**
- ✅ Terminal shows "Payment Server running on port 3006"
- ✅ `http://localhost:3006/health` returns `{"status":"ok"}`
- ✅ No "ERR_CONNECTION_REFUSED" errors

### **Frontend Running:**
- ✅ Terminal shows "Local: http://localhost:8101/"
- ✅ Browser can access `http://localhost:8101`
- ✅ No "Failed to fetch" errors

### **Both Working Together:**
- ✅ Token page loads successfully
- ✅ User data displays
- ✅ No console errors
- ✅ Payment server logs show user creation

---

## 🎉 You're Ready!

Once both servers are running, the token page should work perfectly!

**Next Steps:**
1. Start payment server (Terminal 1)
2. Start frontend (Terminal 2)
3. Open browser and test
4. Try purchasing tokens!

---

**Status:** Ready to start servers ✅  
**Required:** 2 terminal windows  
**Ports:** 3006 (payment) + 8101 (frontend)

