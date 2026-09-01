# =============================================================================
# Kintsugi Build Artifact & Temp Cleanup Script (Windows PowerShell)
# =============================================================================
Write-Host "Cleaning build artifacts, caches, and temporary files..." -ForegroundColor Yellow

Remove-Item -Recurse -Force "web\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "frontend\app\build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "frontend\.gradle" -ErrorAction SilentlyContinue

Get-ChildItem -Path "backend" -Recurse -Include "__pycache__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "backend" -Recurse -Include "*.pyc" | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "✔ Cleanup complete!" -ForegroundColor Green
