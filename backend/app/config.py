import sys
from pathlib import Path
from pydantic_settings import BaseSettings

# Ensure project root is in sys.path so ml_model can be imported seamlessly
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartBinX Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "Demo environment — simulated operational data"

    # Database: SQLite by default; overridden by DATABASE_URL in .env
    DATABASE_URL: str = "sqlite:///./smartbinx.db"

    # Redis Distributed Cache Configuration
    REDIS_URL: str = "redis://redis:6379/0"
    REDIS_ENABLED: bool = True

    # Observability & Structured Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # "json" for structured production logging, "text" for local dev
    PROMETHEUS_METRICS_ENABLED: bool = True

    # Priority Engine Weights (Configurable)
    WEIGHT_CURRENT_FILL: float = 0.35
    WEIGHT_OVERFLOW_RISK: float = 0.30
    WEIGHT_WASTE_TYPE: float = 0.15
    WEIGHT_LOCATION_SENSITIVITY: float = 0.10
    WEIGHT_GENERATION_RATE: float = 0.10

    # Security & CORS
    SECRET_KEY: str = "smartbinx-secure-jwt-secret-key-ahmedabad-2026"
    MUNICIPAL_API_KEY: str = "smartbinx-ahmedabad-municipal-key-2026"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    CORS_ORIGIN_REGEX: str = r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
