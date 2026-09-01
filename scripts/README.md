# Kintsugi Development & Operations Automation Scripts

This folder contains automated cross-platform shell and PowerShell scripts for setting up, starting, and cleaning the Kintsugi repository environment.

---

## Available Scripts

### 1. Environment Setup Scripts
- `setup.sh` (Linux / macOS): Installs dependencies, sets up `.env` files, builds backend virtual environment, installs web packages, and creates database tables.
- `setup.ps1` (Windows PowerShell): Automated Windows setup script doing virtualenv initialization, npm install, and database configuration.

### 2. Full Application Runner
- `run-all.sh` (Linux / macOS): Launches FastAPI backend, Web Vite dev server, and Celery background workers concurrently.
- `run-all.ps1` (Windows PowerShell): Launches all backend services and web dev server on Windows.

### 3. Cleanup Scripts
- `clean.sh` (Linux / macOS): Removes `node_modules`, build artifacts, `__pycache__`, and temporary logs.
- `clean.ps1` (Windows PowerShell): Windows project cleanup script.
