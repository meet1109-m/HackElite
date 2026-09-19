from typing import List
from pydantic import BaseModel, Field


class HotspotResponse(BaseModel):
    zone_name: str
    latitude: float
    longitude: float
    intensity: str = Field(..., description="High, Medium, Low")
    current_generation_kg: float
    baseline_generation_kg: float
    variance_pct: float


class AnomalyResponse(BaseModel):
    zone_name: str
    current_generation_kg: float
    baseline_generation_kg: float
    increase_pct: float
    severity: str = Field(..., description="Warning, Critical")
    message: str
    hypotheses: List[str] = Field(
        ...,
        description="Plausible contributing factors presented as hypotheses, not verified facts"
    )
    environment: str = "Prototype / Simulated Insight"


class EnvironmentalImpactResponse(BaseModel):
    distance_avoided_km: float
    fuel_saved_liters: float
    co2e_avoided_kg: float
    potentially_recoverable_kg: float
    total_waste_collected_kg: float
    landfill_diversion_pct: float
    circularity_score: int
    environment: str = "Prototype / Simulated Estimates"
