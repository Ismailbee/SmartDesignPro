# 🚀 Authentication System - Quick Start Guide

## ⚡ Get Started in 3 Minutes

### Step 1: Install Dependencies (30 seconds)

```bash
npm install bcrypt jsonwebtoken better-sqlite3 express-validator
```

### Step 2: Start Authentication Server (10 seconds)

```bash
node auth-server.js
```

You should see:
```
============================================================
🔐 Authentication Server
============================================================
🚀 Server running on http://localhost:3003
📊 Health check: http://localhost:3003/health
💾 Database: auth.db
============================================================
```

### Step 3: Start Frontend (10 seconds)

```bash
npm run dev
```

### Step 4: Test the System (1 minute)

1. Open http://localhost:5173
2. Click **"Start Your Project"** button
3. You'll see the login modal appear! ✨

---

## 🎯 Try These Actions

### Create Your First Account

1. Click **"Create account"** in the login modal
2. Fill in the form:
   - **Email:** test@example.com
   - **Password:** TestPass123! (must meet requirements)
   - **First Name:** Test (optional)
   - **Last Name:** User (optional)
3. Click **"Create Account"**
4. You'll be automatically logged in and redirected to the editor! 🎉

### Login with Existing Account

1. Click **"Start Your Project"**
2. Enter your email and password
3. Optional: Check **"Remember me"** for extended session
4. Click **"Sign In"**
5. Welcome back! 👋

### Reset Your Password

1. Click **"Forgot password?"** in the login modal
2. Enter your email
3. Click **"Send Reset Link"**
4. In development mode, you'll see the reset token
5. Click **"Enter Reset Token"**
6. Enter the token and your new password
7. Click **"Reset Password"**
8. Done! Now login with your new password 🔑

---

## 🎨 Features You Can Use

### Password Strength Indicator

When creating an account, watch the password strength bar:
- **Red** = Weak (don't use this!)
- **Orange** = Medium (getting better)
- **Green** = Strong (perfect! ✓)

### Password Requirements Checklist

Real-time validation shows you:
- ✓ At least 8 characters
- ✓ One uppercase letter
- ✓ One lowercase letter
- ✓ One number
- ✓ One special character

### Show/Hide Password

Click the eye icon to toggle password visibility 👁️

### Remember Me

Check "Remember me" to stay logged in for 30 days instead of 7 days

---

## 🔐 Security Features

### Account Lockout

After **5 failed login attempts**, your account will be locked for **15 minutes**.

Example:
```
Attempt 1: ❌ Invalid password (4 attempts remaining)
Attempt 2: ❌ Invalid password (3 attempts remaining)
Attempt 3: ❌ Invalid password (2 attempts remaining)
Attempt 4: ❌ Invalid password (1 attempt remaining)
Attempt 5: ❌ Invalid password (0 attempts remaining)
🔒 Account locked! Try again in 15 minutes.
```

### Automatic Token Refresh

Your session automatically refreshes every 10 minutes, so you won't be logged out while working!

### Secure Password Storage

Passwords are hashed with **bcrypt** (10 salt rounds) - they're never stored in plain text.

---

## 🧪 Test Accounts

You can create test accounts with these credentials:

**Account 1:**
- Email: alice@example.com
- Password: AlicePass123!

**Account 2:**
- Email: bob@example.com
- Password: BobSecure456!

**Account 3:**
- Email: charlie@example.com
- Password: Charlie789!@

---

## 🐛 Quick Troubleshooting

### Server won't start?

```bash
# Check if port 3003 is already in use
netstat -ano | findstr :3003

# If yes, kill the process
taskkill /PID <process_id> /F

# Restart server
node auth-server.js
```

### Modal doesn't appear?

1. Check browser console (F12)
2. Verify auth server is running
3. Refresh the page

### Can't login?

1. Make sure you're using the correct email
2. Check if account is locked (wait 15 minutes)
3. Try password reset

### Forgot your password?

1. Click "Forgot password?"
2. Enter your email
3. Copy the reset token from the console
4. Use it to reset your password

---

## 📊 Database Location

The SQLite database is stored at:
```
c:\ProgramData\Corel\Messages\540111125_707000\EN\MessageCache1\Messages\the real project\auth.db
```

You can view it with any SQLite browser (e.g., DB Browser for SQLite).

---

## 🎯 What's Next?

Now that authentication is working, you can:

1. **Start designing!** Click "Start Your Project" and create amazing designs
2. **Invite team members** - they can create their own accounts
3. **Customize the UI** - edit the auth components to match your brand
4. **Add more features** - email verification, 2FA, OAuth, etc.

---

## 📚 More Information

- **Full Documentation:** See `AUTH_IMPLEMENTATION_GUIDE.md`
- **API Reference:** See API Endpoints section in the guide
- **Security Details:** See Security Features section

---

## 🎉 You're All Set!

**Authentication is working! Start creating amazing designs! 🚀✨**

**Happy Designing! 🎨**

