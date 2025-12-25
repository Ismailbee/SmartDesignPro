# PowerShell script to cleanly rebuild Android platform and APK with correct Java version
Write-Host "Starting Clean Android Rebuild Process..." -ForegroundColor Cyan

# Step 0: Find Java
Write-Host "Checking Java environment..." -ForegroundColor Yellow
& ./find-java.ps1

if (Test-Path "selected_java_path.txt") {
    $javaPath = Get-Content "selected_java_path.txt"
    $env:JAVA_HOME = $javaPath
    Write-Host "Set JAVA_HOME to $javaPath" -ForegroundColor Green
    
    $env:Path = "$javaPath\bin;" + $env:Path
} else {
    Write-Host "ERROR: Required Java version not found. Please install JDK 21 or higher." -ForegroundColor Red
    exit 1
}

Write-Host "Java Version check:" -ForegroundColor Gray
java -version

# Step 1: Remove existing android directory
if (Test-Path "android") {
    Write-Host "Removing existing android directory..." -ForegroundColor Yellow
    Remove-Item -Path "android" -Recurse -Force
    Write-Host "Android directory removed" -ForegroundColor Green
}

# Step 2: Build Vue project
Write-Host "Building Vue project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vue build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Vue project built successfully" -ForegroundColor Green

# Step 3: Add Android platform
Write-Host "Adding Android platform..." -ForegroundColor Yellow
npx cap add android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to add Android platform!" -ForegroundColor Red
    exit 1
}
Write-Host "Android platform added" -ForegroundColor Green

# Step 3.5: Configure gradle.properties to use the selected Java
Write-Host "Configuring Gradle to use Java from $env:JAVA_HOME..." -ForegroundColor Yellow
$gradlePropsPath = "android\gradle.properties"
if (Test-Path $gradlePropsPath) {
    $gradleProps = Get-Content $gradlePropsPath
    $javaHomeLine = "org.gradle.java.home=" + $env:JAVA_HOME.Replace('\', '\\')
    
    # Remove old java.home line if exists
    $gradleProps = $gradleProps | Where-Object { $_ -notmatch '^org\.gradle\.java\.home=' }
    
    # Add new java.home line
    $gradleProps += ""
    $gradleProps += "# Configured by rebuild-android.ps1"
    $gradleProps += $javaHomeLine
    $gradleProps += "org.gradle.java.installations.auto-detect=true"
    
    Set-Content -Path $gradlePropsPath -Value $gradleProps
    Write-Host "✅ Configured gradle.properties" -ForegroundColor Green
}

# Step 3.6: Create an init script to force Java 21
Write-Host "Creating Gradle Init Script to Enforce Java 21..." -ForegroundColor Yellow
$initScriptPath = "android\force-java21.gradle"

$initScriptContent = @"
allprojects {
    tasks.withType(JavaCompile) {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
}
"@

Set-Content -Path $initScriptPath -Value $initScriptContent
Write-Host "✅ Created force-java21.gradle init script" -ForegroundColor Green


# Step 4: Sync Capacitor
Write-Host "Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Capacitor synced" -ForegroundColor Green

# Step 5: Build APK
Write-Host "Building APK (this may take a while)..." -ForegroundColor Yellow
Set-Location android

# Use the init script (--init-script) to force configuration
& cmd /c "gradlew.bat assembleDebug --init-script force-java21.gradle"
if ($LASTEXITCODE -ne 0) {
    Write-Host "APK build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Step 6: Verify and Report
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "🎉 Build Complete!" -ForegroundColor Green
    Write-Host "APK Location: $apkPath" -ForegroundColor Cyan
    Write-Host "APK Size: $([Math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build appeared successful but APK not found." -ForegroundColor Red
}
