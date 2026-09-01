# =============================================================================
# Kintsugi Full Application Runner (Windows PowerShell)
# =============================================================================
Write-Host "=================================================================" -ForegroundColor Purple
Write-Host "  ✦ Launching Kintsugi Services (Backend + Web) ✦" -ForegroundColor Gold
Write-Host "=================================================================" -ForegroundColor Purple

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location d:\Kintsugi\backend; .\venv\Scripts\python.exe start.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location d:\Kintsugi\web; npm run dev"

Write-Host "✔ Backend and Web development servers launched in separate windows!" -ForegroundColor Green
