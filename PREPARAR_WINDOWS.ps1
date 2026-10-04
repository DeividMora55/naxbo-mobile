$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mobile = Join-Path $root 'mobile'

if (!(Test-Path (Join-Path $mobile 'package.json'))) {
    throw 'No se encontró mobile/package.json.'
}

Write-Host ''
Write-Host 'NAXVO React Native + XAMPP' -ForegroundColor Magenta
Write-Host '--------------------------' -ForegroundColor Magenta
Write-Host '1) Apache y MySQL deben estar Running en XAMPP.' -ForegroundColor White
Write-Host '2) La base de datos debe llamarse: naxvo' -ForegroundColor White
Write-Host '3) Para teléfono físico: PC y teléfono deben estar en la misma Wi-Fi.' -ForegroundColor White
Write-Host ''

Set-Location $mobile
npm ci
npm run typecheck

Write-Host ''
Write-Host '[OK] Dependencias preparadas.' -ForegroundColor Green
Write-Host 'API local en PC:' -ForegroundColor White
Write-Host 'http://localhost/NAXVO_Movil/backend/public/api/v1/health.php' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Para iniciar:' -ForegroundColor White
Write-Host 'cd C:\xampp\htdocs\NAXVO_Movil\mobile' -ForegroundColor Cyan
Write-Host 'npx expo start --clear --lan' -ForegroundColor Cyan
