# Capacitor Share & Export Fix for APK

## Problem Summary
1. **Export Issue**: Files download but don't appear in phone's file manager
2. **Share Issue**: Shares URL links instead of actual images

## Solution Implemented
Updated both Invoice and Receipt files to use Capacitor native APIs for file system and sharing.

## Installation Steps

### Step 1: Install Capacitor Plugins
Run these commands in your terminal:

```powershell
# Install Capacitor Filesystem plugin
npm install @capacitor/filesystem

# Install Capacitor Share plugin
npm install @capacitor/share

# Sync with Android
npx cap sync android
```

### Step 2: Update Android Permissions
Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
    <!-- Add these permissions before the application tag -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.INTERNET"/>
    
    <!-- For Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO"/>
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO"/>
    
    <application ...>
        <!-- Add FileProvider inside application tag -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

### Step 3: Create File Paths Configuration
Create file: `android/app/src/main/res/xml/file_paths.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <files-path name="files" path="." />
    <cache-path name="cache" path="." />
    <external-files-path name="external_files" path="." />
    <external-cache-path name="external_cache" path="." />
</paths>
```

### Step 4: Rebuild APK
After installing plugins and updating permissions:

```powershell
# Build your project
npm run build

# Sync changes
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK in Android Studio:
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

## How It Works Now

### On Mobile (APK):
1. **Export**: Files are saved to `Documents` directory (visible in file manager)
2. **Share**: Opens native Android share sheet with the actual image attached
3. User can directly share the image via WhatsApp, Telegram, Email, etc.

### On Desktop/Web:
1. **Export**: Uses browser download as before
2. **Share**: Uses Web Share API if available, otherwise downloads image

## Files Modified
- ✅ `src/views/micro-apps/Ican/src/pages/InvoiceIcan/PreviewIcanInvoice.vue`
- ✅ `src/views/micro-apps/Ican/src/pages/ReceiptIcan/PreviewIcanReceipt.vue`

## Testing Checklist
After rebuilding APK, test these:

- [ ] Export PDF - Check if file appears in file manager
- [ ] Export JPEG - Check if file appears in file manager
- [ ] Share via WhatsApp - Should show image preview, not just text link
- [ ] Share via Telegram - Should show image preview
- [ ] Share via Email - Should attach image
- [ ] Verify files are accessible from file manager app

## Troubleshooting

### Files still not visible in file manager?
Try changing the directory in the code from `Directory.Documents` to `Directory.External`:

```javascript
directory: Directory.External  // Change from Directory.Documents
```

### Share not working?
Check Android logcat for errors:
```powershell
npx cap run android -l
```

### Permission denied errors?
Make sure you've:
1. Added all permissions to AndroidManifest.xml
2. Created file_paths.xml
3. Synced with `npx cap sync android`
4. Rebuilt the APK

## Additional Notes

### For Android 10+ (Scoped Storage)
The app now properly handles Android's scoped storage requirements by:
- Using Capacitor's native APIs
- Saving to appropriate directories
- Using FileProvider for sharing

### Performance
- Images are generated at 2x scale for high quality
- JPEG format with 0.95 quality for optimal size/quality balance
- Base64 encoding for efficient transfer

## Support
If issues persist after following these steps:
1. Check Capacitor documentation: https://capacitorjs.com/docs/apis/filesystem
2. Verify Android version on your phone
3. Check app permissions in phone settings
4. Review Android logcat for specific errors

---
**Date**: December 20, 2025
**Status**: Ready for testing after plugin installation
