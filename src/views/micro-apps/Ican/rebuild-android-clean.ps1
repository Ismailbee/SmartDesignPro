Write-Host "☢️  INITIATING NUCLEAR OPTION ☢️" -ForegroundColor Red
Write-Host "--------------------------------"

# Ensure we are in the project root
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root (where package.json is)." -ForegroundColor Red
    exit
}

if (Test-Path "android") {
    Write-Host "🗑️  Deleting existing android folder..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force android -ErrorAction Stop
    } catch {
        Write-Host "❌ Could not delete 'android' folder. Close Android Studio and try again." -ForegroundColor Red
        exit
    }
}

Write-Host "✨ Creating fresh Android project..." -ForegroundColor Cyan
# npx cap add android is interactive sometimes or fails if folder exists (we deleted it). 
# We need to make sure we don't need input.
cmd /c "npx cap add android"

Write-Host "🔄 Syncing assets..." -ForegroundColor Cyan
cmd /c "npx cap sync android"

Write-Host "🚀 Building Android Project..." -ForegroundColor Green
Set-Location android

# Check for gradlew
if (Test-Path "gradlew.bat") {
    ./gradlew.bat assembleDebug
} else {
    Write-Host "❌ Error: gradlew.bat not found. 'cap add android' might have failed." -ForegroundColor Red
}

Write-Host "--------------------------------"
Write-Host "✅ DONE! Check for 'BUILD SUCCESSFUL' above." -ForegroundColor Green
Write-Host "--------------------------------"
