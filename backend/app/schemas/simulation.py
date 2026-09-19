from typing import List, Optional
from pydantic import BaseModel, Field


class WhatIfRequest(BaseModel):
    vehicles_count: Optional[int] = Field(None, description="Simulated active vehicle count")
    vehicle_capacity_kg: Optional[float] = Field(None, description="Average truck capacity")
    traffic_condition: Optional[str] = Field("Normal", description="Normal, Moderate, Heavy")
    waste_generation_delta_pct: Optional[float] = Field(0.0, description="Percentage change in waste generation")


class WhatIfResponse(BaseModel):
    scenario_summary: str
    total_distance_km: float
    distance_change_km: float
    avg_overflow_risk_pct: float
    overflow_risk_change_pct: float
    vehicle_utilization_pct: float
    utilization_change_pct: float
    label: str = "Simulation / Scenario Estimate"


class EventModeRequest(BaseModel):
    event_name: str = Field(..., description="e.g., 'Navratri at GMDC Ground', 'IPL at Narendra Modi Stadium'")
    expected_footfall: int = Field(..., description="Estimated attendees")
    expected_waste_increase_pct: float = Field(..., description="Anticipated percentage increase")
    target_zones: Optional[List[str]] = None


class EventModeResponse(BaseModel):
    event_name: str
    status: str = "Activated"
    expected_footfall: int
    expected_waste_increase_pct: float
    projected_additional_waste_kg: float
    temporary_bins_recommended: int
    additional_vehicles_needed: int
    collection_cycles_increase: int
    recommended_actions: List[str]
    label: str = "Prototype / Simulated Event Mode"
