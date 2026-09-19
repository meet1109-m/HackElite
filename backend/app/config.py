from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartBinX Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "Demo environment — simulated operational data"

    # Database: SQLite by default; overridden by DATABASE_URL in .env
    DATABASE_URL: str = "sqlite:///./smartbinx.db"

    # Priority Engine Weights (Configurable)
    WEIGHT_CURRENT_FILL: float = 0.35
    WEIGHT_OVERFLOW_RISK: float = 0.30
    WEIGHT_WASTE_TYPE: float = 0.15
    WEIGHT_LOCATION_SENSITIVITY: float = 0.10
    WEIGHT_GENERATION_RATE: float = 0.10

    # Ahmedabad City Reference
    AHMEDABAD_CENTER_LAT: float = 23.0225
    AHMEDABAD_CENTER_LNG: float = 72.5714

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
