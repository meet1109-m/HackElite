"""SmartBinX Universal Production Process Manager Runner.

Launches the application with a high-performance production process manager:
- On Linux / macOS / Docker containers: Runs Gunicorn with UvicornWorker and gunicorn_conf.py.
- On Windows: Runs multi-worker Uvicorn with reload disabled and production log formatting.
"""

import argparse
import multiprocessing
import os
import subprocess
import sys


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run SmartBinX FastAPI backend with production process manager."
    )
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HOST", "0.0.0.0"),
        help="Host address to bind (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", "8000")),
        help="Port number to listen on (default: 8000)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=int(os.getenv("WORKERS", os.getenv("WEB_CONCURRENCY", "0"))),
        help="Number of worker processes (default: auto-tuned based on CPU cores)",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    cores = multiprocessing.cpu_count()

    # Calculate optimal worker count if not explicitly set
    if args.workers <= 0:
        if sys.platform == "win32":
            # On Windows, cap at min(cores, 4) for optimal IPC performance
            workers = min(cores, 4)
        else:
            # Standard Gunicorn formula: (2 * cores) + 1, minimum 2
            workers = max((2 * cores) + 1, 2)
    else:
        workers = args.workers

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)

    print("=" * 70)
    print(" SmartBinX Production Process Manager")
    print("=" * 70)
    print(f" Platform : {sys.platform} ({'Windows Multi-Worker Uvicorn' if sys.platform == 'win32' else 'Linux Gunicorn+Uvicorn'})")
    print(f" Binding  : {args.host}:{args.port}")
    print(f" Workers  : {workers} processes (CPU cores detected: {cores})")
    print(" Reload   : DISABLED (Production Mode)")
    print("=" * 70)

    # Linux / macOS / Docker: Prefer Gunicorn with UvicornWorker
    if sys.platform != "win32":
        cmd = [
            "gunicorn",
            "-c",
            "gunicorn_conf.py",
            "-w",
            str(workers),
            "-b",
            f"{args.host}:{args.port}",
            "app.main:app",
        ]
        try:
            print(f"Executing: {' '.join(cmd)}\n")
            os.execvp("gunicorn", cmd)
        except FileNotFoundError:
            print("Gunicorn executable not found in PATH. Falling back to multi-worker Uvicorn...")
            import uvicorn
            uvicorn.run(
                "app.main:app",
                host=args.host,
                port=args.port,
                workers=workers,
                reload=False,
                access_log=True,
                log_level="info",
            )
    else:
        # Windows: Gunicorn is unavailable (due to POSIX fcntl); use multi-worker Uvicorn
        import uvicorn

        uvicorn.run(
            "app.main:app",
            host=args.host,
            port=args.port,
            workers=workers,
            reload=False,
            access_log=True,
            log_level="info",
        )


if __name__ == "__main__":
    main()
