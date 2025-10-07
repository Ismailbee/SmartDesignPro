# 🔥 Firebase Environment Variables Setup Guide

## ✅ What's Been Done

Your Firebase configuration has been updated to use **environment variables** instead of hard-coded keys for better security and flexibility!

---

## 📁 Files Created/Updated

### **1. `.env` - Your Environment Variables**
```env
VITE_FIREBASE_API_KEY=AIzaSyA7Vi3H3r9UuJCm99gq66hXb7yHVSRqA4s
VITE_FIREBASE_AUTH_DOMAIN=designpro-5169c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=designpro-5169c
VITE_FIREBASE_STORAGE_BUCKET=designpro-5169c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=87682923615
VITE_FIREBASE_APP_ID=1:87682923615:web:cfd236c77189e47f84afea
VITE_FIREBASE_MEASUREMENT_ID=G-TMQFM3CCCH
```

⚠️ **IMPORTANT:** This file contains your actual Firebase keys and is **NOT committed to Git** (it's in `.gitignore`)

---

### **2. `.env.example` - Template for Other Developers**
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

✅ **This file IS committed to Git** so other developers know what variables they need

---

### **3. `src/config/firebase.ts` - Updated Configuration**

**Before (Hard-coded):**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyA7Vi3H3r9UuJCm99gq66hXb7yHVSRqA4s",
  authDomain: "designpro-5169c.firebaseapp.com",
  // ... hard-coded values
}
```

**After (Environment Variables):**
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}
```

**Features Added:**
- ✅ Environment variable validation (throws error if required vars are missing)
- ✅ Removed `getAnalytics` (not needed for most apps)
- ✅ Exports `auth`, `db`, `storage` for easy import
- ✅ Better error handling and logging

---

### **4. `.gitignore` - Security**

Added to prevent committing sensitive files:
```
# Environment variables
.env
.env.local
.env.*.local

# Firebase
.firebase
.firebaserc
firebase-debug.log
```

---

## 🔍 Where to Find Firebase Keys

### **Step-by-Step:**

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com

2. **Select Your Project**
   - Click on: **designpro-5169c**

3. **Open Project Settings**
   - Click the **⚙️ gear icon** (top-left, next to "Project Overview")
   - Select **"Project settings"**

4. **Scroll Down to "Your apps"**
   - You'll see a section called **"Your apps"**
   - Find your web app (it should show the `</>` icon)

5. **View Firebase SDK Snippet**
   - Click on **"Config"** radio button (not "CDN")
   - You'll see the `firebaseConfig` object with all your keys

6. **Copy the Values**
   - Copy each value to your `.env` file with the `VITE_` prefix

---

## 📸 Visual Guide

```
Firebase Console
└── Project Settings (⚙️ gear icon)
    └── General Tab
        └── Your apps section
            └── SDK setup and configuration
                └── Config (radio button)
                    └── const firebaseConfig = { ... }
```

---

## 🚀 How to Use

### **In Your Code:**

**Import Firebase services:**
```typescript
import { auth, db, storage } from '@/config/firebase'

// Use auth
import { signInWithEmailAndPassword } from 'firebase/auth'
await signInWithEmailAndPassword(auth, email, password)

// Use Firestore
import { collection, getDocs } from 'firebase/firestore'
const querySnapshot = await getDocs(collection(db, 'users'))

// Use Storage
import { ref, uploadBytes } from 'firebase/storage'
const storageRef = ref(storage, 'images/photo.jpg')
await uploadBytes(storageRef, file)
```

**Already integrated in:**
- ✅ `src/services/firebase-auth.ts` - Uses `auth` and `db`
- ✅ `src/stores/auth.ts` - Uses Firebase auth service

---

## 🔐 Security Best Practices

### **✅ DO:**
- ✅ Use environment variables for all sensitive config
- ✅ Add `.env` to `.gitignore`
- ✅ Commit `.env.example` as a template
- ✅ Use different Firebase projects for dev/staging/production
- ✅ Set up Firebase Security Rules for Firestore and Storage

### **❌ DON'T:**
- ❌ Commit `.env` file to Git
- ❌ Hard-code API keys in source code
- ❌ Share your `.env` file publicly
- ❌ Use production keys in development
- ❌ Expose sensitive keys in client-side code (Firebase keys are safe for client-side)

---

## 🌍 Multiple Environments

### **Development (.env.development):**
```env
VITE_FIREBASE_API_KEY=dev_api_key
VITE_FIREBASE_PROJECT_ID=designpro-dev
# ... other dev keys
```

### **Production (.env.production):**
```env
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_PROJECT_ID=designpro-prod
# ... other prod keys
```

### **Usage:**
```bash
# Development
npm run dev

# Production build
npm run build
```

Vite automatically loads the correct `.env` file based on the mode!

---

## 🐛 Troubleshooting

### **Issue: "Missing required environment variable"**

**Solution:**
1. Make sure `.env` file exists in project root
2. Check that all required variables are defined
3. Restart dev server after changing `.env`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### **Issue: "Firebase not initialized"**

**Solution:**
1. Check browser console for errors
2. Verify `.env` values are correct
3. Make sure you're using `import.meta.env.VITE_*` (not `process.env`)

### **Issue: "Environment variables are undefined"**

**Solution:**
1. All Vite env vars must start with `VITE_`
2. Restart dev server after adding new variables
3. Check that `.env` file is in project root (not in `src/`)

### **Issue: "Can't find Firebase keys in console"**

**Solution:**
1. Make sure you've created a web app in Firebase
2. Go to Project Settings → General → Your apps
3. If no app exists, click "Add app" → Web (</>) icon
4. Register app and copy the config

---

## 📋 Checklist

- [x] Created `.env` file with Firebase keys
- [x] Created `.env.example` template
- [x] Updated `src/config/firebase.ts` to use env vars
- [x] Added `.env` to `.gitignore`
- [x] Removed `getAnalytics` (not needed)
- [x] Added environment variable validation
- [x] Exported `auth`, `db`, `storage` for easy import

---

## 🎯 Benefits of This Setup

### **Security:**
- ✅ No hard-coded secrets in source code
- ✅ `.env` file not committed to Git
- ✅ Easy to rotate keys without code changes

### **Flexibility:**
- ✅ Different configs for dev/staging/prod
- ✅ Easy to switch between Firebase projects
- ✅ Team members can use their own Firebase projects

### **Maintainability:**
- ✅ Single source of truth for config
- ✅ Easy to update keys
- ✅ Clear documentation with `.env.example`

---

## 📚 Additional Resources

- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **Firebase Web Setup:** https://firebase.google.com/docs/web/setup
- **Firebase Security Rules:** https://firebase.google.com/docs/rules
- **Environment Variables Best Practices:** https://12factor.net/config

---

## ✅ You're All Set!

Your Firebase configuration is now secure and flexible! 🎉

**Next Steps:**
1. ✅ Restart your dev server: `npm run dev`
2. ✅ Test Firebase authentication
3. ✅ Verify environment variables are loaded correctly
4. ✅ Set up Firebase Security Rules (recommended)

**Check Console:**
You should see:
```
✅ Firebase initialized successfully
📊 Project ID: designpro-5169c
```

---

**Happy Coding! 🔥🚀**


