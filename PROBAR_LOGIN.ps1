$ErrorActionPreference = 'Stop'
$url = 'http://localhost/NAXVO_Movil/backend/public/api/v1/health.php'
Write-Host "Comprobando NAXVO API + MariaDB..." -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
    $r | ConvertTo-Json -Depth 8
    if ($r.ok -eq $true -and $r.data.database -eq 'ok') {
        Write-Host "OK: Apache, API y MariaDB responden correctamente." -ForegroundColor Green
    } else {
        Write-Host "La API respondió, pero la comprobación no fue correcta." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Revisa que Apache y MySQL estén en Running en XAMPP." -ForegroundColor Yellow
}
