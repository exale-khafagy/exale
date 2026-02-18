# Exale — Database Migration Script
# Run this when schema.prisma changes (e.g. MediaFile, Settings, ContentBlock).
# Prisma DLL lock (EPERM) occurs if the API is running — stop it first.

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $projectRoot "apps\api"

Write-Host ""
Write-Host "=== Exale DB Migration ===" -ForegroundColor Cyan
Write-Host ""

# Check we're in the right place
if (-not (Test-Path (Join-Path $apiDir "prisma\schema.prisma"))) {
    Write-Host "ERROR: prisma/schema.prisma not found. Run from project root or ensure apps/api exists." -ForegroundColor Red
    exit 1
}

Write-Host "IMPORTANT: Stop the API (and any dev servers) before continuing." -ForegroundColor Yellow
Write-Host "Prisma will fail with EPERM if the API process is using the Prisma client." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Have you stopped the API? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Aborted. Stop the API and run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running prisma generate..." -ForegroundColor Cyan
Push-Location $apiDir
try {
    npm run db:generate
    if ($LASTEXITCODE -ne 0) { throw "db:generate failed" }
    Write-Host "prisma generate OK" -ForegroundColor Green

    Write-Host ""
    Write-Host "Running prisma db push..." -ForegroundColor Cyan
    npm run db:push
    if ($LASTEXITCODE -ne 0) { throw "db:push failed" }
    Write-Host "prisma db push OK" -ForegroundColor Green
} catch {
    Write-Host "Migration failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "Done. You can restart the API and dev servers." -ForegroundColor Green
Write-Host ""
