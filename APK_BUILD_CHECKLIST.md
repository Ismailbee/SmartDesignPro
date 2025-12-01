# 📋 Pre-APK Build Checklist

## ✅ Authentication & Security
- [x] DEV_BYPASS_AUTH set to `false`
- [x] Firebase authentication configured
- [x] Google sign-in implemented
- [x] Environment variables configured (.env file)

## ✅ Android Configuration
- [x] Capacitor installed (@capacitor/android v7.4.4)
- [x] Android folder exists and configured
- [x] AndroidManifest.xml updated with permissions:
  - [x] Internet
  - [x] Camera
  - [x] Storage (images)
  - [x] Network state
- [x] capacitor.config.ts configured
- [x] App ID set: `com.smartdesignpro.app`
- [x] App Name set: `SmartDesignPro`

## ✅ Build Scripts
- [x] `npm run build` - Build Vue app
- [x] `npm run sync:android` - Sync to Android
- [x] `npm run open:android` - Open Android Studio
- [x] `npm run build:android` - All-in-one command

## ⚠️ Required Software (TO INSTALL)
- [ ] **Android Studio** - Download from https://developer.android.com/studio
- [ ] **Java JDK 17** (comes with Android Studio)
- [ ] Set `ANDROID_HOME` environment variable
- [ ] Set `JAVA_HOME` environment variable

## 📝 Before Building

### 1. Install Android Studio
```
Download: https://developer.android.com/studio
Install with default settings
```

### 2. Set Environment Variables
```powershell
# Add to System Environment Variables:
ANDROID_HOME = C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

### 3. Verify Installation
```powershell
# Check if tools are accessible
java --version
adb --version
```

## 🚀 Build Process

### Quick Build (Recommended)
```powershell
# Run the automated build script
.\build-android.ps1
```

### Manual Build
```powershell
# Step 1: Build Vue app
npm run build

# Step 2: Sync to Android
npm run sync:android

# Step 3: Open Android Studio
npm run open:android

# Step 4: In Android Studio
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## 📱 Testing Checklist

After building APK, test these features:
- [ ] App launches successfully
- [ ] Login with email/password works
- [ ] Google sign-in works
- [ ] Camera/image upload works
- [ ] Wedding sticker AI chat works
- [ ] Voice guide works in chat
- [ ] Image drag and pinch-zoom works
- [ ] Auto-design features work
- [ ] App doesn't crash on rotation
- [ ] Back button works properly

## 🔥 Firebase Setup for Android

### Required File
You need `google-services.json` in `android/app/`:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `designpro-5169c`
3. Project Settings → Your apps → Add Android app (if not added)
4. Package name: `com.smartdesignpro.app`
5. Download `google-services.json`
6. Place in: `android/app/google-services.json`

### Add SHA-1 Certificate for Google Sign-In
```powershell
# Generate debug certificate fingerprint
cd android
./gradlew signingReport

# Copy SHA-1 from output
# Add to Firebase Console → Project Settings → Your Android app
```

## 🎯 Common Issues & Solutions

### Issue: "Android SDK not found"
**Solution:**
- Install Android Studio
- Set ANDROID_HOME environment variable
- Restart PowerShell/Terminal

### Issue: "gradlew permission denied"
**Solution:**
```powershell
cd android
icacls gradlew /grant Everyone:F
```

### Issue: "Google sign-in doesn't work"
**Solution:**
- Add SHA-1 certificate to Firebase (see above)
- Ensure google-services.json is in android/app/
- Rebuild: `npm run build:android`

### Issue: "App crashes on launch"
**Solution:**
```powershell
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run build:android
```

## 📦 Output Files

After successful build:
- **Debug APK**: `android\app\build\outputs\apk\debug\app-debug.apk`
- **Release APK**: `android\app\build\outputs\apk\release\app-release.apk`

## 🎉 Ready to Build?

Run this command to start:
```powershell
.\build-android.ps1
```

Or read the detailed guide:
```
BUILD_APK_GUIDE.md
```

---

**Last Updated:** [Automatic - based on your changes]
**App Version:** 1.0.0
**Target SDK:** 34 (Android 14)
**Min SDK:** 22 (Android 5.1)
