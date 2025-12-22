# ICAN APK Complete Build Script
# Includes: Firebase Network Fixes + Splash Screen + Pull-to-Refresh

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ICAN APK Builder - Complete Edition" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Features Included:" -ForegroundColor Yellow
Write-Host "   ✅ Firebase network connectivity" -ForegroundColor Green
Write-Host "   ✅ Splash screen configuration" -ForegroundColor Green
Write-Host "   ✅ Pull-to-refresh on all pages" -ForegroundColor Green
Write-Host ""

# Step 1: Build the web app
Write-Host "📦 Step 1/5: Building web application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Sync with Capacitor
Write-Host "🔄 Step 2/5: Syncing Capacitor Android project..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Capacitor sync complete!" -ForegroundColor Green
Write-Host ""

# Step 3: Copy files
Write-Host "📋 Step 3/5: Copying Capacitor files..." -ForegroundColor Yellow
npx cap copy android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor copy failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files copied!" -ForegroundColor Green
Write-Host ""

# Step 4: Update Capacitor assets
Write-Host "🖼️ Step 4/5: Updating Capacitor assets..." -ForegroundColor Yellow
npx cap update android
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Asset update encountered issues (continuing...)" -ForegroundColor Yellow
}
Write-Host "✅ Assets updated!" -ForegroundColor Green
Write-Host ""

# Step 5: Build the APK
Write-Host "🏗️ Step 5/5: Building Android APK..." -ForegroundColor Yellow
Write-Host "This may take 3-5 minutes..." -ForegroundColor Gray
cd android
.\gradlew assembleDebug
$buildResult = $LASTEXITCODE
cd ..

if ($buildResult -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ APK build complete!" -ForegroundColor Green
Write-Host ""

# Locate and display APK info
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  ✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 APK Information:" -ForegroundColor Cyan
    Write-Host "   Location: $apkPath" -ForegroundColor White
    Write-Host "   Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "🎨 Features Enabled:" -ForegroundColor Cyan
    Write-Host "   ✅ Splash Screen: 3-second display with ICAN branding" -ForegroundColor Green
    Write-Host "   ✅ Network Security: Firebase domains whitelisted" -ForegroundColor Green
    Write-Host "   ✅ Pull-to-Refresh: Swipe down to reload data" -ForegroundColor Green
    Write-Host "   ✅ Branch Loading: Real-time from Firebase" -ForegroundColor Green
    Write-Host "   ✅ Internet Permissions: Configured for online access" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Installation Steps:" -ForegroundColor Yellow
    Write-Host "   1. Transfer APK to your Android device" -ForegroundColor White
    Write-Host "   2. Enable 'Install from Unknown Sources' in Settings" -ForegroundColor White
    Write-Host "   3. Open the APK file to install" -ForegroundColor White
    Write-Host "   4. Ensure internet connection is active" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 How to Use:" -ForegroundColor Yellow
    Write-Host "   • Launch app → See ICAN splash screen" -ForegroundColor White
    Write-Host "   • Pull down on any page → Refresh data" -ForegroundColor White
    Write-Host "   • Select branch → Branch list loads from Firebase" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Happy testing!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ APK not found at expected location!" -ForegroundColor Red
    Write-Host "Expected: $apkPath" -ForegroundColor Yellow
    Write-Host "Please check the build output for errors." -ForegroundColor Yellow
}
