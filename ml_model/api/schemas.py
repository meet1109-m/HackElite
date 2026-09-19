"""
FastAPI Pydantic Schemas for WasteWise AI Prediction Service.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Bin Fill & Overflow Schemas ----------------- #
class BinFillRequest(BaseModel):
    bin_id: str = Field(default="AMD-BIN-0042", description="Ahmedabad Bin Identifier")
    zone_name: str = Field(default="Navrangpura", description="Ahmedabad Municipal Zone")
    waste_stream: str = Field(default="Mixed", description="Stream type: Organic, Recyclable, Dry, Commercial, Mixed")
    season: str = Field(default="Summer", description="Season: Summer, Monsoon, Post-Monsoon, Winter")
    fill_percentage: float = Field(default=75.0, ge=0.0, le=135.0, description="Current sensor fill percentage")
    estimated_weight_kg: float = Field(default=180.0, ge=0.0, description="Current weight in kg")
    capacity_kg: float = Field(default=240.0, gt=0.0, description="Bin capacity rating in kg")
    hours_since_collection: float = Field(default=16.0, ge=0.0, description="Elapsed hours since last clearance")
    daily_generation_kg: float = Field(default=300.0, ge=0.0, description="Estimated current daily generation")
    avg_daily_generation_kg: float = Field(default=280.0, ge=0.0, description="14-day average daily generation")
    hour: int = Field(default=14, ge=0, le=23, description="Hour of day (0-23)")
    day_of_week: int = Field(default=2, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")
    is_weekend: int = Field(default=0, ge=0, le=1, description="1 if weekend, else 0")
    month: int = Field(default=4, ge=1, le=12, description="Month of year (1-12)")
    temperature_c: float = Field(default=38.0, description="Ambient temperature Celsius")
    rainfall_mm: float = Field(default=0.0, ge=0.0, description="Precipitation in mm")
    humidity: float = Field(default=45.0, ge=0.0, le=100.0, description="Humidity percentage")
    holiday_flag: int = Field(default=0, ge=0, le=1, description="1 if public holiday")
    festival_flag: int = Field(default=0, ge=0, le=1, description="1 if active festival period")
    market_activity_level: float = Field(default=2.0, ge=0.0, le=5.0, description="Market activity scale 0-5")
    event_activity_level: float = Field(default=1.0, ge=0.0, le=5.0, description="Public event activity scale 0-5")

class BinFillResponse(BaseModel):
    bin_id: str
    current_fill_percentage: float
    fill_percentage_6h: float
    fill_percentage_12h: float
    fill_percentage_24h: float
    hours_until_overflow: float
    predicted_overflow_time: str
    overflow_risk: str

class OverflowResponse(BaseModel):
    bin_id: str
    current_fill_percentage: float
    hours_until_overflow: float
    predicted_overflow_time: str
    overflow_risk: str

# ----------------- Composition Schemas ----------------- #
class CompositionRequest(BaseModel):
    zone_name: str = Field(default="Navrangpura", description="Ahmedabad Municipal Zone")
    waste_stream: str = Field(default="Mixed", description="Stream type: Organic, Recyclable, Dry, Commercial, Mixed")
    total_waste_kg: float = Field(default=450.0, ge=0.0, description="Total collected weight in kg")
    hour: Optional[int] = Field(default=12, ge=0, le=23)
    day_of_week: Optional[int] = Field(default=2, ge=0, le=6)
    month: Optional[int] = Field(default=4, ge=1, le=12)

class CompositionResponse(BaseModel):
    estimation_source: str = "AI Estimated"
    zone_name: str
    waste_stream: str
    plastic_percentage: float
    paper_percentage: float
    metal_percentage: float
    glass_percentage: float
    organic_percentage: float
    other_percentage: float
    total_percentage: float

# ----------------- Waste Forecasting Schemas ----------------- #
class WasteForecastRequest(BaseModel):
    zone_name: str = Field(default="Maninagar", description="Ahmedabad Municipal Zone")
    day_of_week: int = Field(default=3, ge=0, le=6)
    month: int = Field(default=5, ge=1, le=12)
    is_weekend: int = Field(default=0, ge=0, le=1)
    waste_lag_1: float = Field(default=4200.0, ge=0.0, description="Previous day waste (kg)")
    waste_lag_2: float = Field(default=4100.0, ge=0.0, description="2-days prior waste (kg)")
    waste_lag_7: float = Field(default=4350.0, ge=0.0, description="Same day last week waste (kg)")
    waste_rolling_mean_3: float = Field(default=4150.0, ge=0.0, description="3-day moving average (kg)")
    waste_rolling_mean_7: float = Field(default=4200.0, ge=0.0, description="7-day moving average (kg)")
    avg_daily_generation_kg_14d: float = Field(default=4180.0, ge=0.0, description="14-day baseline average (kg)")
    number_of_active_bins: Optional[int] = Field(default=18)
    average_bin_fill_percentage: Optional[float] = Field(default=68.5)
    overflow_count: Optional[int] = Field(default=2)
    collection_count: Optional[int] = Field(default=24)
    population_density: Optional[float] = Field(default=28000.0)
    commercial_density: Optional[float] = Field(default=75.0)
    market_activity_level: Optional[float] = Field(default=2.5)
    holiday_flag: Optional[int] = Field(default=0)
    festival_flag: Optional[int] = Field(default=0)
    event_activity_level: Optional[float] = Field(default=1.0)
    rainfall_mm: Optional[float] = Field(default=0.0)
    temperature_c: Optional[float] = Field(default=35.0)

class WasteForecastResponse(BaseModel):
    zone_name: str
    predicted_total_waste_kg: float
    forecast_horizon: str

# ----------------- Anomaly Schemas ----------------- #
class AnomalyRequest(BaseModel):
    zone_name: str = Field(default="Bopal", description="Ahmedabad Municipal Zone")
    total_waste_kg: float = Field(default=25000.0, ge=0.0, description="Observed daily total waste kg")
    average_bin_fill_percentage: float = Field(default=92.0, ge=0.0, le=100.0)
    overflow_count: int = Field(default=18, ge=0)
    collection_count: int = Field(default=14, ge=0)
    organic_waste_kg: Optional[float] = Field(default=18000.0)
    plastic_waste_kg: Optional[float] = Field(default=3500.0)
    paper_waste_kg: Optional[float] = Field(default=2000.0)
    metal_waste_kg: Optional[float] = Field(default=500.0)
    glass_waste_kg: Optional[float] = Field(default=400.0)
    other_waste_kg: Optional[float] = Field(default=600.0)
    rainfall_mm: Optional[float] = Field(default=12.0)
    temperature_c: Optional[float] = Field(default=32.0)
    market_activity_level: Optional[float] = Field(default=4.0)
    event_activity_level: Optional[float] = Field(default=3.0)
    avg_daily_generation_kg_14d: float = Field(default=5200.0, gt=0.0)

class AnomalyResponse(BaseModel):
    zone_name: str
    is_anomaly: bool
    anomaly_score: float
    anomaly_status: str

# ----------------- Image Classification Schemas ----------------- #
class ImageClassificationResponse(BaseModel):
    predicted_class: str
    confidence: float
    waste_stream: str
    probabilities: Dict[str, float]
    source: str = "AI Detected from Image"

# ----------------- Health Check Schema ----------------- #
class HealthResponse(BaseModel):
    status: str
    city: str
    subsystems: Dict[str, str]
