# 📱 SmartDesignPro - APK Build Guide

## ✅ Pre-Build Checklist

### 1. **Authentication Fixed**
- ✅ `DEV_BYPASS_AUTH` set to `false` in `src/stores/auth.ts`
- ✅ Firebase authentication properly configured
- ✅ Google sign-in enabled

### 2. **Android Setup Complete**
- ✅ Android folder exists with proper configuration
- ✅ Capacitor installed (`@capacitor/android` v7.4.4)
- ✅ Permissions configured in AndroidManifest.xml:
  - Internet access
  - Camera access
  - Storage access (images)
  - Network state

### 3. **Required Software**
- ✅ Node.js (installed)
- ✅ npm/yarn (installed)
- ⚠️ **Android Studio** - REQUIRED (download if not installed)
- ⚠️ **Java JDK 17** - REQUIRED for Android Studio

---

## 🚀 Quick Build Process

### **Step 1: Install Android Studio**
If not already installed:
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio → Tools → SDK Manager
4. Install:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools
   - Android Emulator (optional, for testing)

### **Step 2: Set Environment Variables**
Add to System Environment Variables:
```
ANDROID_HOME = C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

### **Step 3: Build the Web App**
```powershell
# In your project root directory
npm run build
```
This creates the `dist` folder with your production build.

### **Step 4: Sync with Android**
```powershell
# Sync the built files to Android project
npm run sync:android
```

### **Step 5: Open in Android Studio**
```powershell
# Opens Android Studio with your project
npm run open:android
```

OR manually:
```powershell
npx cap open android
```

### **Step 6: Build APK in Android Studio**

#### For Debug APK (Testing):
1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete (shown in bottom bar)
3. Click "locate" in the notification popup
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### For Release APK (Production):
1. **Generate Signing Key First:**
   ```powershell
   cd android/app
   keytool -genkey -v -keystore smartdesignpro-release.keystore -alias smartdesignpro -keyalg RSA -keysize 2048 -validity 10000
   ```
   - Enter password (remember it!)
   - Fill in organization details

2. **Configure Signing in `gradle.properties`:**
   Create/edit `android/gradle.properties`:
   ```properties
   MYAPP_RELEASE_STORE_FILE=smartdesignpro-release.keystore
   MYAPP_RELEASE_KEY_ALIAS=smartdesignpro
   MYAPP_RELEASE_STORE_PASSWORD=YOUR_PASSWORD
   MYAPP_RELEASE_KEY_PASSWORD=YOUR_PASSWORD
   ```

3. **Build Release APK:**
   - In Android Studio: **Build → Generate Signed Bundle / APK**
   - Choose **APK**
   - Select your keystore file
   - Enter passwords
   - Select "release" build variant
   - Click Finish

4. APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎯 One-Command Build (All Steps)

```powershell
# Build and open in Android Studio
npm run build:android
```

This command:
1. Builds the Vue app (`npm run build`)
2. Syncs to Android (`npx cap sync android`)
3. Opens Android Studio (`npx cap open android`)

---

## 🔧 Troubleshooting

### Issue: "Android SDK not found"
**Solution:**
1. Open Android Studio
2. Tools → SDK Manager
3. Note the SDK Location path
4. Set `ANDROID_HOME` environment variable to that path

### Issue: "Gradle build failed"
**Solution:**
```powershell
cd android
./gradlew clean
./gradlew build
```

### Issue: "Java version mismatch"
**Solution:**
- Use Java 17 (comes with Android Studio)
- Set `JAVA_HOME` to: `C:\Program Files\Android\Android Studio\jbr`

### Issue: "Permission denied" on Gradlew
**Solution:**
```powershell
cd android
icacls gradlew /grant Everyone:F
```

### Issue: "App crashes on launch"
**Solution:**
1. Check `dist` folder exists and has files
2. Run `npm run sync:android` again
3. In Android Studio: Build → Clean Project
4. Build → Rebuild Project

---

## 📦 APK File Sizes
- **Debug APK**: ~50-80 MB (includes debug symbols)
- **Release APK**: ~30-50 MB (optimized, minified)
- **AAB (Bundle)**: ~20-30 MB (recommended for Play Store)

---

## 🎨 App Icon & Splash Screen

### Update App Icon:
1. Create 1024x1024 PNG icon
2. Use Android Studio:
   - Right-click `android/app/src/main/res`
   - New → Image Asset
   - Choose your icon
   - Generate all sizes

### Update Splash Screen:
Edit `capacitor.config.ts`:
```typescript
plugins: {
  SplashScreen: {
    backgroundColor: '#667eea', // Your brand color
    showSpinner: true
  }
}
```

---

## 📱 Testing the APK

### Install on Physical Device:
1. Enable Developer Options on phone:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect phone via USB
4. In Android Studio: Run → Run 'app'

### Install APK File:
```powershell
# Via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 Publishing to Play Store

### 1. Build AAB (Android App Bundle)
- In Android Studio: **Build → Generate Signed Bundle / APK**
- Choose **Android App Bundle**
- Use release keystore
- Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 2. Prepare for Play Console
- [ ] App screenshots (phone + tablet)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Privacy policy URL
- [ ] App description

### 3. Upload to Play Console
1. Go to: https://play.google.com/console
2. Create new app
3. Upload AAB file
4. Fill in store listing
5. Submit for review

---

## 📋 Important Notes

### Firebase Configuration
Make sure `google-services.json` is in `android/app/`:
```
android/
  app/
    google-services.json  ← Firebase config
    build.gradle
```

### Version Management
Update version in `android/app/build.gradle`:
```gradle
versionCode 1      // Increment for each release
versionName "1.0"  // User-visible version
```

### App ID
Current: `com.smartdesignpro.app`
- Change in `capacitor.config.ts`
- Change in `android/app/build.gradle`
- Sync changes: `npm run sync:android`

---

## ✅ Final Checklist Before Release

- [ ] Test all features on physical device
- [ ] Test login/logout flow
- [ ] Test image upload and camera
- [ ] Test offline behavior
- [ ] Check app icon displays correctly
- [ ] Check splash screen works
- [ ] Test on different Android versions (if possible)
- [ ] Review app permissions in Settings
- [ ] Test Google sign-in
- [ ] Verify no console errors in debug mode
- [ ] Create release build with signing key
- [ ] Test release APK on device
- [ ] Backup signing keystore file (IMPORTANT!)

---

## 🆘 Need Help?

### Quick Commands Reference:
```powershell
# Build web app
npm run build

# Sync to Android
npm run sync:android

# Open Android Studio
npm run open:android

# All in one
npm run build:android

# Clean build
cd android
./gradlew clean
cd ..
npm run build:android
```

### Check Capacitor Status:
```powershell
npx cap doctor
```

### View Connected Devices:
```powershell
adb devices
```

---

## 🎉 Success!

Your APK is ready when you see:
```
BUILD SUCCESSFUL in 2m 34s
```

Find your APK at:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

**Install on device and enjoy your app! 📱✨**
