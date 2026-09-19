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

from app.config import settings
from app.database import engine, Base, SessionLocal
import app.models  # Ensure models are registered on Base.metadata
from app.services.data_store import data_store
from app.routes import register_routes

# Initialize tables (creates tables if not exist)
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

# CORS Middleware specifically configured for Frontend (Saumya)
# Supports Vite (http://localhost:5173), Next.js/React (http://localhost:3000), and all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
