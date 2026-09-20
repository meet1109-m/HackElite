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

# CORS Middleware configured for Frontend and local dev environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all 9 API route controllers (/api/bins, /api/vehicles, /api/routes, etc.)
register_routes(app)


@app.get("/", tags=["System"])
def root():
    """Service metadata and system status."""
    return {
        "project": "SmartBinX",
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "city": "Ahmedabad",
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/health", tags=["System"])
def health_check():
    """System liveness probe."""
    return {"status": "ok", "project": "SmartBinX"}
