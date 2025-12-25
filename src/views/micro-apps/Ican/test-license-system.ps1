# 🧪 License System Test Script

Write-Host "🔐 Testing License System..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1️⃣  Checking if backend is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    exit 1
}

Write-Host ""

# Check license status
Write-Host "2️⃣  Checking license status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "http://localhost:4000/license/status"
    $data = $status.data
    
    Write-Host "✅ License Status Retrieved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 License Information:" -ForegroundColor Cyan
    Write-Host "   Valid: $($data.isValid)" -ForegroundColor $(if ($data.isValid) { "Green" } else { "Red" })
    Write-Host "   Expired: $($data.isExpired)" -ForegroundColor $(if ($data.isExpired) { "Red" } else { "Green" })
    Write-Host "   Days Remaining: $($data.daysRemaining)" -ForegroundColor White
    Write-Host "   Days Used: $($data.daysUsed)" -ForegroundColor White
    Write-Host "   Total Days: $($data.totalDays)" -ForegroundColor White
    Write-Host "   Install Date: $($data.installDate)" -ForegroundColor White
    Write-Host "   Expiration Date: $($data.expirationDate)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Failed to check license status" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test renewal (optional)
$testRenewal = Read-Host "Would you like to test license renewal? (y/n)"

if ($testRenewal -eq 'y' -or $testRenewal -eq 'Y') {
    Write-Host ""
    Write-Host "3️⃣  Testing license renewal..." -ForegroundColor Yellow
    
    $days = Read-Host "Enter number of days to extend (default: 90)"
    if ([string]::IsNullOrWhiteSpace($days)) {
        $days = 90
    }
    
    $secretKey = Read-Host "Enter secret key (default: ican-renewal-secret-2025)"
    if ([string]::IsNullOrWhiteSpace($secretKey)) {
        $secretKey = "ican-renewal-secret-2025"
    }
    
    try {
        $body = @{
            days = [int]$days
            secretKey = $secretKey
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "http://localhost:4000/license/renew" `
                                     -Method POST `
                                     -Body $body `
                                     -ContentType "application/json"
        
        Write-Host "✅ License renewed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Renewal Result:" -ForegroundColor Cyan
        Write-Host "   Message: $($result.data.message)" -ForegroundColor White
        Write-Host "   New Expiration: $($result.data.newExpirationDate)" -ForegroundColor White
        Write-Host "   Days Remaining: $($result.data.daysRemaining)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "❌ Renewal failed!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.Exception.Message -like "*403*" -or $_.Exception.Message -like "*Invalid*") {
            Write-Host ""
            Write-Host "💡 Tip: Check your secret key. Default is 'ican-renewal-secret-2025'" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ License System Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For more information, see:" -ForegroundColor Cyan
Write-Host "   - LICENSE_QUICKSTART.md" -ForegroundColor White
Write-Host "   - LICENSE_SYSTEM_GUIDE.md" -ForegroundColor White
Write-Host ""
