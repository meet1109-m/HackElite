"""SmartBinX Main Application Entry Point.

FastAPI REST service for AI-powered municipal waste management & recycling optimization
in Ahmedabad. Includes CORS middleware, startup database auto-seeding, and OpenAPI routing.
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root is in sys.path so ml_model is importable
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy import text
from app.config import settings
from app.database import engine, Base, SessionLocal
import app.models  # Ensure models are registered on Base.metadata
from app.services.data_store import data_store
from app.routes import register_routes

from app.observability import (
    setup_logging,
    ObservabilityMiddleware,
    metrics_router,
    get_correlation_id,
)

# Initialize structured logging subsystem
setup_logging(log_level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)

def ensure_db_migrations(db_engine):
    """Automatically apply any missing column migrations to SQLite tables."""
    try:
        with db_engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(vehicles)")).fetchall()
            cols = [r[1] for r in res]
            if "driver_name" not in cols:
                conn.execute(text("ALTER TABLE vehicles ADD COLUMN driver_name VARCHAR(100) DEFAULT 'Ramesh Patel'"))
            if "driver_phone" not in cols:
                conn.execute(text("ALTER TABLE vehicles ADD COLUMN driver_phone VARCHAR(50) DEFAULT '+91 98250 14210'"))
            conn.commit()
    except Exception:
        pass

# Ensure schema migrations and initialize tables
ensure_db_migrations(engine)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler: hydrates cache from DB or auto-seeds if empty."""
    db = SessionLocal()
    try:
        from app.routes.auth import ensure_canonical_users
        ensure_canonical_users(db)
        # If DB already populated, hydrate in-memory cache directly from SQLite; otherwise seed
        if not data_store.load_from_database(db):
            data_store.seed_database_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "SmartBinX — AI-Powered Municipal Waste Intelligence, Dynamic Collection Routing "
        "& Recycling Optimizer for Ahmedabad (PS-11)."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Observability Middleware (Correlation IDs, Prometheus Latency, Structured Access Logs)
app.add_middleware(ObservabilityMiddleware)

# 2. CORS Middleware configured strictly adhering to W3C specifications
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "X-API-Key",
        "X-Correlation-ID",
        "X-Request-ID",
    ],
    expose_headers=[
        "X-Correlation-ID",
        "X-Request-ID",
        "X-Process-Time",
    ],
)

# 3. Mount Prometheus Metrics Endpoint (/metrics)
if settings.PROMETHEUS_METRICS_ENABLED:
    app.include_router(metrics_router)

# 4. Mount all 9 API route controllers (/api/bins, /api/vehicles, /api/routes, etc.)
register_routes(app)


@app.get("/", tags=["System"])
def root():
    """Service metadata, endpoints, and system status."""
    return {
        "project": "SmartBinX",
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "city": "Ahmedabad",
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "health_check": "/health",
        "metrics_url": "/metrics",
        "correlation_id": get_correlation_id(),
    }


@app.get("/health", tags=["System"])
def health_check():
    """System liveness and readiness probe with database and cache health reporting."""
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    from app.services.cache_service import cache
    cache_status = cache.health()

    return {
        "status": "ok" if db_ok else "degraded",
        "project": "SmartBinX",
        "database": "connected" if db_ok else "disconnected",
        "cache": cache_status,
        "correlation_id": get_correlation_id(),
        "metrics": "/metrics",
    }
