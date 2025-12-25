# FINAL BUILD SCRIPT
# This script finds and forces the use of JDK 21 to resolve all build errors.

Write-Host "🚀 Starting Final Clean Android Rebuild Process..." -ForegroundColor Cyan

# --- STEP 1: Find and Validate Java 21 ---
Write-Host "
🔍 STEP 1: Locating required Java 21 installation..." -ForegroundColor Yellow

$searchRoots = @(
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Java"
)
$foundCandidates = @()

foreach ($root in $searchRoots) {
    if (Test-Path $root) {
        Get-ChildItem -Path $root -Directory | ForEach-Object {
            $dir = $_;
            $javaExe = Join-Path $dir.FullName "bin\java.exe"
            if (Test-Path $javaExe) {
                try {
                    $output = & $javaExe -version 2>&1
                    if ($output -match 'version "(\d+)') {
                        $majorVersion = $matches[1]
                        if ($majorVersion -eq 21) {
                            $foundCandidates += @{ Version = [int]$majorVersion; Path = $dir.FullName }
                        }
                    }
                } catch { /* Ignore errors */ }
            }
        }
    }
}

$java21 = $foundCandidates | Where-Object { $_.Version -eq 21 } | Select-Object -First 1

if (-not $java21) {
    Write-Host "
❌ CRITICAL FAILURE: Java 21 was not found in standard directories." -ForegroundColor Red
    Write-Host "   Please ensure you have installed JDK 21 from https://adoptium.net/ and that it's in C:\Program Files\Eclipse Adoptium." -ForegroundColor Yellow
    exit 1
}

$javaPath = $java21.Path
Write-Host "✅ Found Java 21 at: $javaPath" -ForegroundColor Green
$env:JAVA_HOME = $javaPath
$env:Path = "$javaPath\bin;" + $env:Path

# --- STEP 2: Clean Project ---
Write-Host "
🗑️ STEP 2: Cleaning project directories..." -ForegroundColor Yellow

# Stop any running Gradle daemons
if (Test-Path "android/gradlew.bat") {
    Write-Host "   -> Stopping Gradle daemons..."
    ./android/gradlew.bat --stop
}

# Remove previous build artifacts
if (Test-Path "android") {
    Write-Host "   -> Removing 'android' directory..."
    Remove-Item -Path "android" -Recurse -Force
}

# --- STEP 3: Build Vue App ---
Write-Host "
📦 STEP 3: Building Vue.js application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vue.js build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Vue.js app built successfully." -ForegroundColor Green

# --- STEP 4: Initialize and Configure Android Project ---
Write-Host "
🤖 STEP 4: Initializing and configuring Android project..." -ForegroundColor Yellow

# Add android platform
npx cap add android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add Android platform!" -ForegroundColor Red
    exit 1
}

# Force Gradle to use the correct Java 21 path
$gradlePropsPath = "android/gradle.properties"
$javaHomeForGradle = $javaPath.Replace('\', '\\')
$configLine = "org.gradle.java.home=$javaHomeForGradle"

Write-Host "   -> Forcing Gradle to use Java 21 by writing to $gradlePropsPath" -ForegroundColor Cyan
Add-Content -Path $gradlePropsPath -Value "`n# Force JDK 21 to solve plugin requirements`n$configLine`n"

# Sync capacitor project
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Android project configured successfully." -ForegroundColor Green


# --- STEP 5: Build the APK ---
Write-Host "
🔨 STEP 5: Building the final APK... (This may take a while)" -ForegroundColor Yellow
Set-Location android

& cmd /c "gradlew.bat assembleDebug --no-daemon"
if ($LASTEXITCODE -ne 0) {
    Write-Host "
❌ APK build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..


# --- STEP 6: Report Success ---
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "
🎉 BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "   APK Location: $apkPath" -ForegroundColor Cyan
    Write-Host "   APK Size: $([Math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "
❓ Build appeared to succeed, but APK not found." -ForegroundColor Yellow
}
