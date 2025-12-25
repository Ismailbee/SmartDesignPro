# Quick fix to configure Android project for Java 25
Write-Host "Configuring Android project for Java 25..." -ForegroundColor Cyan

$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot"
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

Write-Host "✅ Set JAVA_HOME to: $javaHome" -ForegroundColor Green

# Update gradle.properties
$gradlePropsPath = "android\gradle.properties"
if (Test-Path $gradlePropsPath) {
    Write-Host "Updating gradle.properties..." -ForegroundColor Yellow
    
    $content = @"
# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx1536m
android.useAndroidX=true

# Use Java 25 (supports Java 21 requirements)
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.0.36-hotspot
org.gradle.java.installations.auto-detect=true
"@
    
    Set-Content -Path $gradlePropsPath -Value $content
    Write-Host "✅ Updated gradle.properties" -ForegroundColor Green
} else {
    Write-Host "❌ android/gradle.properties not found. Run 'npx cap add android' first." -ForegroundColor Red
    exit 1
}

# Update app/build.gradle
$appBuildGradle = "android\app\build.gradle"
if (Test-Path $appBuildGradle) {
    Write-Host "Updating app/build.gradle..." -ForegroundColor Yellow
    
    $content = Get-Content $appBuildGradle -Raw
    $content = $content -replace 'VERSION_17', 'VERSION_21'
    Set-Content -Path $appBuildGradle -Value $content -NoNewline
    
    Write-Host "✅ Updated app/build.gradle" -ForegroundColor Green
}

# Update root build.gradle
$rootBuildGradle = "android\build.gradle"
if (Test-Path $rootBuildGradle) {
    Write-Host "Updating root build.gradle..." -ForegroundColor Yellow
    
    $content = Get-Content $rootBuildGradle -Raw
    $content = $content -replace 'VERSION_17', 'VERSION_21'
    Set-Content -Path $rootBuildGradle -Value $content -NoNewline
    
    Write-Host "✅ Updated root build.gradle" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Configuration complete! Now run:" -ForegroundColor Cyan
Write-Host "   cd android" -ForegroundColor White
Write-Host "   .\gradlew assembleDebug" -ForegroundColor White
