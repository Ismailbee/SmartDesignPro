@echo off
echo ===================================================================
echo ICAN Firebase Setup - Google Services Configuration
echo ===================================================================
echo.
echo This script will help you set up Firebase for your ICAN Android app.
echo.
echo STEP 1: Download google-services.json
echo 1. Go to: https://console.firebase.google.com
echo 2. Open project: designpro-5169c
echo 3. Click Settings (gear icon) - Project Settings
echo 4. Scroll to "Your apps" section
echo 5. Find Android app: com.goldenprinter.ican
echo 6. Click "Download google-services.json"
echo.
echo STEP 2: Place the file
echo Move the downloaded google-services.json file to:
echo %~dp0android\app\google-services.json
echo.
echo STEP 3: Rebuild the app
echo cd android
echo .\gradlew clean
echo .\gradlew assembleRelease
echo.
echo ===================================================================
pause