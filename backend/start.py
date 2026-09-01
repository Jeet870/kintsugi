"""
Combined Startup Script for Kintsugi Backend Services.
Runs Uvicorn (FastAPI) and Celery Worker concurrently with auto-reload and configurable host/port binding.
Usage: python start.py [--host 0.0.0.0] [--port 8000] [--no-reload] [--no-celery]
"""
import os
import sys
import argparse
import subprocess
import time
from pathlib import Path

# Base directory setup
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass


def parse_args():
    parser = argparse.ArgumentParser(description="Kintsugi Backend Runner")
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HOST", "0.0.0.0"),
        help="Host binding (default: 0.0.0.0 for external/internal access)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", 8000)),
        help="API Port binding (default: 8000)",
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable auto-reload mode",
    )
    parser.add_argument(
        "--no-celery",
        action="store_true",
        help="Disable Celery worker process",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    processes = []

    # Detect python executable from venv if available
    if sys.platform == "win32":
        venv_python = BASE_DIR / "venv" / "Scripts" / "python.exe"
        celery_cmd = BASE_DIR / "venv" / "Scripts" / "celery.exe"
    else:
        venv_python = BASE_DIR / "venv" / "bin" / "python"
        celery_cmd = BASE_DIR / "venv" / "bin" / "celery"

    python_bin = str(venv_python) if venv_python.exists() else sys.executable

    print("=" * 65)
    print("[START] Starting Kintsugi Mental Health & Wellness Backend Services")
    print(f"[HOST]  Binding API Server on http://{args.host}:{args.port} (Internal & External)")
    print(f"[MODE]  Auto-reload: {'Disabled' if args.no_reload else 'Enabled'}")
    print("=" * 65)

    # 1. Prepare Uvicorn Command
    uvicorn_cmd = [
        python_bin,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        args.host,
        "--port",
        str(args.port),
    ]
    if not args.no_reload:
        uvicorn_cmd.append("--reload")

    # 2. Prepare Celery Worker Command
    celery_worker_cmd = None
    if not args.no_celery:
        if celery_cmd.exists():
            c_bin = str(celery_cmd)
            celery_worker_cmd = [
                c_bin,
                "-A",
                "app.workers.celery_worker.celery_app",
                "worker",
                "-Q",
                "kintsugi_default,ai,critical",
                "--loglevel=info",
                "-P",
                "solo" if sys.platform == "win32" else "prefork",
            ]
        else:
            celery_worker_cmd = [
                python_bin,
                "-m",
                "celery",
                "-A",
                "app.workers.celery_worker.celery_app",
                "worker",
                "-Q",
                "kintsugi_default,ai,critical",
                "--loglevel=info",
                "-P",
                "solo" if sys.platform == "win32" else "prefork",
            ]

    try:
        # Launch Uvicorn
        print("[LAUNCH] Launching Uvicorn FastAPI Server...")
        p_uvicorn = subprocess.Popen(uvicorn_cmd, cwd=str(BASE_DIR))
        processes.append(p_uvicorn)

        # Launch Celery
        if celery_worker_cmd:
            print("[LAUNCH] Launching Celery Background Worker...")
            p_celery = subprocess.Popen(celery_worker_cmd, cwd=str(BASE_DIR))
            processes.append(p_celery)

        # Monitor processes
        while True:
            for p in processes:
                if p.poll() is not None:
                    print(f"[WARN] Process PID {p.pid} exited with code {p.returncode}")
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[STOP] Shutdown signal received. Terminating services...")
        for p in processes:
            if p.poll() is None:
                p.terminate()
        for p in processes:
            p.wait()
        print("[DONE] All services stopped successfully.")


if __name__ == "__main__":
    main()
