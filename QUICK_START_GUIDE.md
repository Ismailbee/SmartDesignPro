# 🚀 Quick Start Guide - DesignPro Application

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Navigation Guide](#navigation-guide)
5. [Firebase Setup](#firebase-setup)
6. [Admin Access](#admin-access)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (already configured)
- Modern web browser (Chrome, Firefox, Edge, Safari)

---

## 📦 Installation

```bash
# 1. Navigate to project directory
cd "c:\ProgramData\Corel\Messages\540111125_707000\EN\MessageCache1\Messages\the real project"

# 2. Install dependencies (if not already installed)
npm install

# 3. Verify installation
npm list firebase vue-router chart.js
```

---

## 🚀 Running the Application

### **Option 1: Run All Servers (Recommended)**

Open **4 separate terminals** and run:

```bash
# Terminal 1: Frontend Development Server
npm run dev
# Opens at: http://localhost:5173

# Terminal 2: Admin Dashboard Server
node admin-server.js
# Runs on: http://localhost:3006

# Terminal 3: Marketplace Server
node marketplace-server.js
# Runs on: http://localhost:3004

# Terminal 4: AI Retouch Server
node ai-retouch-server.js
# Runs on: http://localhost:3005
```

### **Option 2: Run Minimal Setup**

If you only need basic functionality:

```bash
# Terminal 1: Frontend only
npm run dev

# Terminal 2: Admin Server (if accessing admin dashboard)
node admin-server.js
```

---

## 🧭 Navigation Guide

### **1. Home Page**

**URL:** `http://localhost:5173`

**Features:**
- Hero section with "Start Your Project" button
- Features showcase
- Marketplace access button
- Responsive design

**Actions:**
- Click **"Start Your Project"** → Opens login modal
- Click **"🎨 Marketplace"** (top-right) → Opens marketplace panel

---

### **2. Login/Register**

**Firebase Authentication** is now integrated!

#### **Register New Account:**
1. Click "Start Your Project" or "Login" button
2. Click "Don't have an account? Register"
3. Fill in:
   - Email
   - Password (minimum 6 characters)
   - Username (optional)
   - First Name (optional)
   - Last Name (optional)
4. Click "Register"
5. You'll be automatically logged in and redirected to `/editor`

#### **Login with Existing Account:**
1. Click "Start Your Project" or "Login" button
2. Enter email and password
3. Click "Login"
4. Redirected to `/editor`

#### **Login with Google:**
1. Click "Start Your Project" or "Login" button
2. Click "Sign in with Google" button
3. Select your Google account
4. Redirected to `/editor`

#### **Forgot Password:**
1. Click "Forgot Password?" link
2. Enter your email
3. Click "Send Reset Link"
4. Check your email for password reset link from Firebase
5. Click the link and set new password

---

### **3. Editor Page**

**URL:** `http://localhost:5173/editor` (requires authentication)

**Features:**
- ✨ **AI Retouch Panel** - Click floating ✨ button (bottom-right)
- 🎨 **Marketplace** - Click marketplace button (top-right header)
- 🎨 **Design Canvas** - Konva.js canvas for design work
- 🔧 **Toolbar** - Design tools and options
- ↩️ **Undo/Redo** - History management

**AI Retouch Features:**
- One-click enhancement
- Color palette optimization
- Font pairing suggestions
- Smart alignment
- Auto spacing
- Balance detection
- Content-aware scaling
- Auto layering
- Contrast & brightness
- Background enhancement

---

### **4. Admin Dashboard**

**URL:** `http://localhost:5173/admin` (requires admin role)

**Access Requirements:**
- Must be logged in
- User role must be 'admin' or 'moderator'

**Features:**
- 📊 Dashboard with stats and charts
- 👥 User management
- 📄 Template management
- 💰 Payment management
- 📈 Analytics
- ⚙️ System monitoring
- 🔧 Settings

**Navigation:**
- **Sidebar:** 7 menu items (Dashboard, Users, Templates, Payments, Analytics, System, Settings)
- **Header:** Dark mode toggle, notifications, user menu
- **Quick Actions:** Collapse sidebar, go to home, go to editor

---

## 🔥 Firebase Setup

### **Your Firebase Configuration:**

```javascript
Project ID: designpro-5169c
Auth Domain: designpro-5169c.firebaseapp.com
API Key: AIzaSyA7Vi3H3r9UuJCm99gq66hXb7yHVSRqA4s
```

### **Firebase Services Enabled:**
- ✅ Authentication (Email/Password, Google)
- ✅ Firestore Database
- ✅ Storage
- ✅ Analytics

### **Firestore Collections:**
- `users` - User profiles and data

### **User Document Structure:**
```javascript
{
  email: "user@example.com",
  username: "johndoe",
  name: "John Doe",
  firstName: "John",
  lastName: "Doe",
  avatar: "https://...",
  role: "user", // 'user', 'designer', 'moderator', 'admin'
  status: "active", // 'active', 'suspended', 'pending'
  emailVerified: false,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}
```

---

## 🔐 Admin Access

### **How to Make a User Admin:**

#### **Method 1: Firebase Console (Recommended)**

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: **designpro-5169c**
3. Click **Firestore Database** in left sidebar
4. Find the `users` collection
5. Click on the user document you want to make admin
6. Click **Edit** (pencil icon)
7. Find the `role` field
8. Change value from `"user"` to `"admin"` or `"moderator"`
9. Click **Update**
10. User must logout and login again to see admin access

#### **Method 2: Programmatically**

```typescript
import { updateUserData } from '@/services/firebase-auth'

// Update user role
await updateUserData('USER_ID_HERE', {
  role: 'admin'
})
```

### **User Roles:**
- **user** - Regular user (default)
- **designer** - Can upload templates to marketplace
- **moderator** - Can access admin dashboard, approve templates
- **admin** - Full admin access

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module 'firebase'"**

**Solution:**
```bash
npm install firebase
```

### **Issue: "Cannot access /editor - redirects to home"**

**Solution:**
- You're not logged in
- Click "Start Your Project" and login
- After login, you'll be redirected to `/editor`

### **Issue: "Cannot access /admin - redirects to home"**

**Solution:**
- Your user role is not 'admin' or 'moderator'
- Follow [Admin Access](#admin-access) instructions to set role
- Logout and login again

### **Issue: "Admin server not responding"**

**Solution:**
```bash
# Check if server is running
curl http://localhost:3006/health

# If not running, start it
node admin-server.js
```

### **Issue: "Firebase authentication not working"**

**Solution:**
1. Check Firebase Console for errors
2. Verify Firebase configuration in `src/config/firebase.ts`
3. Check browser console for errors (F12)
4. Clear browser cache and localStorage:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### **Issue: "Charts not displaying in admin dashboard"**

**Solution:**
```bash
# Install Chart.js
npm install chart.js

# Restart dev server
npm run dev
```

### **Issue: "Router not working - shows blank page"**

**Solution:**
1. Check browser console for errors (F12)
2. Verify router is installed:
   ```bash
   npm install vue-router@4
   ```
3. Clear browser cache
4. Restart dev server

---

## 📊 Server Status Check

### **Check All Servers:**

```bash
# Frontend
curl http://localhost:5173

# Admin Server
curl http://localhost:3006/health

# Marketplace Server
curl http://localhost:3004/health

# AI Retouch Server
curl http://localhost:3005/health
```

### **Expected Responses:**

```json
// Admin Server
{
  "status": "ok",
  "service": "Admin Dashboard Server",
  "version": "1.0.0",
  "port": 3006
}

// Marketplace Server
{
  "status": "ok",
  "service": "Template Marketplace Server",
  "version": "1.0.0",
  "port": 3004
}

// AI Retouch Server
{
  "status": "ok",
  "service": "AI Retouch Server",
  "version": "1.0.0",
  "port": 3005
}
```

---

## 🎯 Quick Test Checklist

- [ ] Frontend runs on http://localhost:5173
- [ ] Can register new account with Firebase
- [ ] Can login with email/password
- [ ] Can login with Google
- [ ] Redirected to `/editor` after login
- [ ] Can access AI Retouch panel in editor
- [ ] Can access Marketplace in editor
- [ ] Admin server responds at http://localhost:3006/health
- [ ] Can set user role to 'admin' in Firestore
- [ ] Can access `/admin` dashboard with admin role
- [ ] Charts display correctly in admin dashboard
- [ ] Can navigate between home, editor, and admin

---

## 📚 Additional Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Vue Router Documentation:** https://router.vuejs.org
- **Chart.js Documentation:** https://www.chartjs.org/docs
- **Pinia Documentation:** https://pinia.vuejs.org

---

## 🎉 You're All Set!

Your DesignPro application is now fully configured with:
- ✅ Firebase Authentication
- ✅ Vue Router Navigation
- ✅ Admin Dashboard
- ✅ AI Retouch System
- ✅ Template Marketplace

**Start creating amazing designs! 🚀✨**


