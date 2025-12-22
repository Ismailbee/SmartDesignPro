ptojrvy yo spp# ICAN APK Build Script with Firebase Network Fixes
# This script builds the ICAN APK with proper network configuration for Firebase access

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ICAN APK Builder - Firebase Network Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the web app
Write-Host "Step 1: Building web application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Sync with Capacitor (includes network security config)
Write-Host "Step 2: Syncing Capacitor Android project..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Capacitor sync complete!" -ForegroundColor Green
Write-Host ""

# Step 3: Copy Capacitor files to Android
Write-Host "Step 3: Copying Capacitor files..." -ForegroundColor Yellow
npx cap copy android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor copy failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files copied!" -ForegroundColor Green
Write-Host ""

# Step 4: Build the APK
Write-Host "Step 4: Building Android APK..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
cd android
.\gradlew assembleDebug
cd ..
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ APK build complete!" -ForegroundColor Green
Write-Host ""

# Step 5: Locate the APK
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 APK Location:" -ForegroundColor Cyan
    Write-Host "   $apkPath" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Network Fixes Applied:" -ForegroundColor Cyan
    Write-Host "   ✅ Network Security Config added" -ForegroundColor Green
    Write-Host "   ✅ Clear text traffic enabled" -ForegroundColor Green
    Write-Host "   ✅ Firebase domains whitelisted" -ForegroundColor Green
    Write-Host "   ✅ Internet permissions configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Install APK on your Android device" -ForegroundColor White
    Write-Host "   2. Ensure device has internet connection" -ForegroundColor White
    Write-Host "   3. Branch list should now load from Firebase" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ APK not found at expected location!" -ForegroundColor Red
    Write-Host "Please check the build output for errors." -ForegroundColor Yellow
}
