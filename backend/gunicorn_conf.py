"""Production Gunicorn Configuration for SmartBinX FastAPI Backend.

Provides multi-worker process supervision, CPU core auto-tuning,
automatic worker recycling, access logging, and graceful zero-downtime restarts.
"""

import multiprocessing
import os

# Server Socket Binding
host = os.getenv("HOST", "0.0.0.0")
port = os.getenv("PORT", "8000")
bind = f"{host}:{port}"

# Concurrency & Worker Tuning
# Formula: (2 x num_cores) + 1, capped at sensible bounds or configured via WEB_CONCURRENCY
cores = multiprocessing.cpu_count()
calculated_workers = max((2 * cores) + 1, 2)
workers = int(os.getenv("WEB_CONCURRENCY", os.getenv("WORKERS", calculated_workers)))

# Asynchronous Worker Class (FastAPI / ASGI)
worker_class = "uvicorn.workers.UvicornWorker"

# Worker Process Lifecycle Management
# Timeout for killing unresponsive workers
timeout = int(os.getenv("WORKER_TIMEOUT", "120"))
# Keepalive connection duration in seconds
keepalive = int(os.getenv("KEEPALIVE", "5"))
# Grace period to finish existing requests before forceful SIGKILL
graceful_timeout = int(os.getenv("GRACEFUL_TIMEOUT", "30"))

# Memory Leak Prevention: Automatically recycle worker processes after handling N requests
max_requests = int(os.getenv("MAX_REQUESTS", "2000"))
max_requests_jitter = int(os.getenv("MAX_REQUESTS_JITTER", "100"))

# Process Naming
proc_name = "smartbinx-backend"

# Structured Production Logging
loglevel = os.getenv("LOG_LEVEL", "info")
accesslog = "-"  # stdout
errorlog = "-"   # stderr
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" (%(L)ss)'

# Preloading
# Preloading disabled to ensure independent SQLAlchemy database connection pools per worker
preload_app = False
daemon = False
