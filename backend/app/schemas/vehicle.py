from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class VehicleBase(BaseModel):
    vehicle_code: str
    capacity_kg: float = 2000.0
    current_load: float = 0.0
    latitude: float
    longitude: float
    status: str = "Available"  # Available, On Route, Maintenance, Off Duty
    assigned_route_id: Optional[str] = None


class VehicleResponse(VehicleBase):
    id: str
    available_capacity: float = Field(..., description="capacity_kg - current_load")
    utilization_pct: float = Field(..., description="(current_load / capacity_kg) * 100")

    model_config = ConfigDict(from_attributes=True)


class VehicleSuitability(BaseModel):
    vehicle_code: str
    vehicle_id: str
    distance_km: float
    available_capacity_kg: float
    required_capacity_kg: float
    has_sufficient_capacity: bool
    is_recommended: bool
    rationale: str
