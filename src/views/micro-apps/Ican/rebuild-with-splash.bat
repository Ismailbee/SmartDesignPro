@echo off
echo ===================================================================
echo ICAN Splash Screen Fix - Rebuilding APK
echo ===================================================================
echo.
echo Applying splash screen fixes...
echo 1. Updated Capacitor splash config (2 second duration)
echo 2. Set launchAutoHide to false (manual control)
echo 3. Updated splash colors to ICAN branding
echo 4. Fixed programmatic hide timing
echo.
echo Rebuilding the app...
echo.

echo Step 1: Sync Capacitor...
call npx cap sync android

echo.
echo Step 2: Clean and rebuild...
cd android
call .\gradlew clean
call .\gradlew assembleRelease

echo.
echo ===================================================================
echo Splash Screen APK Build Complete!
echo ===================================================================
echo.
echo Changes made:
echo - Splash duration: 2 seconds
echo - Background color: ICAN blue (#5865F2)
echo - Manual hide control after app loads
echo.
echo Your APK will now show the splash screen properly!
echo.
pause