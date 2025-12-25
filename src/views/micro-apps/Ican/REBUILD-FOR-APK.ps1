Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Building ICAN App with All Fixes   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "D:\GOLDEN-PRINTER\Programing-practical\SmartDesignPro\src\views\micro-apps\Ican"

Write-Host "[Step 1/2] Building Vue app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[Step 2/2] Syncing to Android platform..." -ForegroundColor Yellow
    npx cap sync android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   ✓ ALL FIXES SYNCED TO ANDROID!      " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Cyan
        Write-Host "1. Open Android Studio" -ForegroundColor White
        Write-Host "2. File → Open → Select:" -ForegroundColor White
        Write-Host "   D:\GOLDEN-PRINTER\Programing-practical\SmartDesignPro\src\views\micro-apps\Ican\android" -ForegroundColor Yellow
        Write-Host "3. Wait for Gradle sync to complete" -ForegroundColor White
        Write-Host "4. Build → Build Bundle(s)/APK(s) → Build APK(s)" -ForegroundColor White
        Write-Host ""
        Write-Host "FIXES INCLUDED IN THIS BUILD:" -ForegroundColor Cyan
        Write-Host "✓ Preview button error handling improved" -ForegroundColor Green
        Write-Host "✓ Android back button navigates to Dashboard" -ForegroundColor Green
        Write-Host "✓ Reports page mobile responsiveness fixed" -ForegroundColor Green
        Write-Host "✓ Signature page notification removed" -ForegroundColor Green
        Write-Host "✓ MainLayout header modernized" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Sync failed! Check the error above." -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "✗ Build failed! Check the error above." -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to close..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
