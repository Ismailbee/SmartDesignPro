@echo off
echo ===================================================================
echo ICAN Firebase Connection Test
echo ===================================================================
echo.
echo Fixed Issues:
echo 1. Removed conflicting ICAN Firebase config
echo 2. Updated vite.config to use main project Firebase (@ alias)
echo 3. Updated component imports to use @ican alias
echo.
echo The ICAN app now uses:
echo - Main SmartDesignPro Firebase (designpro-5169c)
echo - Main Firebase configuration from @/config/firebase
echo - Same database collections (ican_branches, etc.)
echo.
echo Building test APK...
echo.

echo Step 1: Clean build...
if exist dist rmdir /s /q dist
if exist android\app\build rmdir /s /q android\app\build

echo Step 2: Build web version first...
call npm run build

echo Step 3: Sync with Android...
call npx cap sync android

echo Step 4: Build debug APK...
cd android
call .\gradlew assembleDebug

echo.
echo ===================================================================
echo Test APK Ready!
echo ===================================================================
echo.
echo The APK now connects to your main SmartDesignPro Firebase.
echo It should load real branch data instead of showing the error.
echo.
echo Install with: adb install app\build\outputs\apk\debug\app-debug.apk
echo.
pause