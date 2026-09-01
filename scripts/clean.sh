#!/usr/bin/env bash
# =============================================================================
# Kintsugi Build Artifact & Temp Cleanup Script (Linux/macOS)
# =============================================================================
echo "Cleaning build artifacts, caches, and temporary files..."

rm -rf web/node_modules web/dist web/.next
rm -rf frontend/app/build frontend/.gradle
find backend -type d -name "__pycache__" -exec rm -rf {} +
find backend -type f -name "*.pyc" -delete

echo "✔ Cleanup complete!"
