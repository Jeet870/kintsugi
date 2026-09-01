# =============================================================================
# Kintsugi Automated System Setup Script (Windows PowerShell)
# =============================================================================
$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Purple
Write-Host "  ✦ Starting Kintsugi Environment Setup ✦" -ForegroundColor Gold
Write-Host "=================================================================" -ForegroundColor Purple

# 1. Environment File Provisioning
if (-not (Test-Path "backend\.env")) {
    Write-Host "[1/4] Provisioning backend\.env from .env.example..." -ForegroundColor Cyan
    Copy-Item "backend\.env.example" "backend\.env"
}

if (-not (Test-Path "web\.env")) {
    Write-Host "[1/4] Provisioning web\.env from .env.example..." -ForegroundColor Cyan
    Copy-Item "web\.env.example" "web\.env"
}

# 2. Python Virtual Environment Setup
Write-Host "[2/4] Setting up Python virtual environment..." -ForegroundColor Cyan
Set-Location "backend"
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\venv\Scripts\pip.exe" install -r requirements.txt
Set-Location ".."

# 3. Web Package Installation
Write-Host "[3/4] Installing web npm dependencies..." -ForegroundColor Cyan
Set-Location "web"
npm install
Set-Location ".."

# 4. Database Table Creation
Write-Host "[4/4] Creating database tables in MariaDB/MySQL..." -ForegroundColor Cyan
Set-Location "backend"
& ".\venv\Scripts\python.exe" -c "from app.db.session import engine; from app.db.base_class import Base; import app.models; Base.metadata.create_all(bind=engine)"
Set-Location ".."

Write-Host "=================================================================" -ForegroundColor Purple
Write-Host "  ✔ Kintsugi Setup Completed Successfully!" -ForegroundColor Green
Write-Host "  Run '.\scripts\run-all.ps1' to launch services." -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Purple
