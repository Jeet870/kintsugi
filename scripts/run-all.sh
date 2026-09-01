#!/usr/bin/env bash
# =============================================================================
# Kintsugi Full Application Runner (Linux/macOS)
# =============================================================================
set -e

echo "================================================================="
echo "  ✦ Launching Kintsugi Services (Backend + Web) ✦"
echo "================================================================="

trap 'kill 0' EXIT

# Start Backend
cd backend
source venv/bin/activate
python start.py &
cd ..

# Start Web Dev Server
cd web
npm run dev &
cd ..

wait
