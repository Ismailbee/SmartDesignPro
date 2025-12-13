# Android App Setup Guide

Your project has been successfully converted to an Android app using Capacitor!

## Next Steps

1.  **Open in Android Studio:**
    You can open the `android` folder in Android Studio.
    If you have the Capacitor CLI installed globally, you can run:
    ```bash
    npx cap open android
    ```

2.  **Run on Emulator or Device:**
    -   Connect your Android device or start an emulator in Android Studio.
    -   Click the "Run" button (green play icon) in Android Studio.

3.  **Build APK/Bundle:**
    -   In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    -   The APK will be generated in `android/app/build/outputs/apk/debug/`.

## Permissions Added
The following permissions have been added to `AndroidManifest.xml` to support the Camera and File Upload features:
-   `CAMERA`: For taking photos.
-   `READ_EXTERNAL_STORAGE`: For uploading images.
-   `WRITE_EXTERNAL_STORAGE`: For saving images (if needed).

## Updating the App
If you make changes to your Vue/web code (in `src/`), remember to run these commands to update the Android app:

```bash
npm run build
npx cap sync android
```
