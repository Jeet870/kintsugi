#!/usr/bin/env bash
# =============================================================================
# Kintsugi Automated System Setup Script (Linux/macOS)
# =============================================================================
set -e

echo "================================================================="
echo "  ✦ Starting Kintsugi Environment Setup ✦"
echo "================================================================="

# 1. Environment File Provisioning
if [ ! -f backend/.env ]; then
  echo "[1/4] Provisioning backend/.env from .env.example..."
  cp backend/.env.example backend/.env
fi

if [ ! -f web/.env ]; then
  echo "[1/4] Provisioning web/.env from .env.example..."
  cp web/.env.example web/.env
fi

# 2. Python Virtual Environment Setup
echo "[2/4] Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# 3. Web Package Installation
echo "[3/4] Installing web npm dependencies..."
cd web
npm install
cd ..

# 4. Database Table Creation
echo "[4/4] Creating database tables..."
cd backend
venv/bin/python -c "from app.db.session import engine; from app.db.base_class import Base; import app.models; Base.metadata.create_all(bind=engine)"
cd ..

echo "================================================================="
echo "  ✔ Kintsugi Setup Completed Successfully!"
echo "  Run './scripts/run-all.sh' to start backend, web, and worker."
echo "================================================================="
