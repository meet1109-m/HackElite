from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class VehicleBase(BaseModel):
    vehicle_code: str
    capacity_kg: float = 2000.0
    current_load: float = 0.0
    latitude: float
    longitude: float
    status: str = "Available"  # Available, On Route, Maintenance, Off Duty
    assigned_route_id: Optional[str] = None
    driver_name: Optional[str] = "Ramesh Patel"
    driver_phone: Optional[str] = "+91 98250 14210"


class VehicleResponse(VehicleBase):
    id: str
    available_capacity: float = Field(..., description="capacity_kg - current_load")
    utilization_pct: float = Field(..., description="(current_load / capacity_kg) * 100")
    # Compatibility fields for frontend components
    available_capacity_kg: float = Field(..., description="Frontend alias for available_capacity")
    utilization_percentage: float = Field(..., description="Frontend alias for utilization_pct")
    current_load_kg: float = Field(..., description="Frontend alias for current_load")
    driver_name: str = Field("Ramesh Patel", description="Name of assigned vehicle driver")
    driver_phone: str = Field("+91 98250 14210", description="Contact phone of driver")

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def set_compatibility_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            cap = float(data.get("capacity_kg", 2000.0) or 2000.0)
            load = float(data.get("current_load", data.get("current_load_kg", 0.0)) or 0.0)
            avail = max(0.0, round(cap - load, 1))
            util = min(100.0, round((load / max(1.0, cap)) * 100.0, 1))

            data.setdefault("current_load", load)
            data.setdefault("current_load_kg", load)
            data.setdefault("available_capacity", avail)
            data.setdefault("available_capacity_kg", avail)
            data.setdefault("utilization_pct", util)
            data.setdefault("utilization_percentage", util)
            if not data.get("driver_name"):
                data["driver_name"] = "Ramesh Patel"
            if not data.get("driver_phone"):
                data["driver_phone"] = "+91 98250 14210"
        elif hasattr(data, "__dict__"):
            cap = float(getattr(data, "capacity_kg", 2000.0) or 2000.0)
            load = float(getattr(data, "current_load", 0.0) or 0.0)
            avail = max(0.0, round(cap - load, 1))
            util = min(100.0, round((load / max(1.0, cap)) * 100.0, 1))
            if not getattr(data, "driver_name", None):
                setattr(data, "driver_name", "Ramesh Patel")
            if not getattr(data, "driver_phone", None):
                setattr(data, "driver_phone", "+91 98250 14210")
            if not hasattr(data, "available_capacity"):
                setattr(data, "available_capacity", avail)
            if not hasattr(data, "available_capacity_kg"):
                setattr(data, "available_capacity_kg", avail)
            if not hasattr(data, "utilization_pct"):
                setattr(data, "utilization_pct", util)
            if not hasattr(data, "utilization_percentage"):
                setattr(data, "utilization_percentage", util)
            if not hasattr(data, "current_load_kg"):
                setattr(data, "current_load_kg", load)
        return data


class BestVehicleInfo(BaseModel):
    vehicle_code: str
    driver_name: Optional[str] = "Ramesh Patel"
    driver_phone: Optional[str] = "+91 98250 14210"
    distance_km: float
    available_capacity_kg: float
    current_load_kg: Optional[float] = 0.0
    capacity_kg: Optional[float] = 2000.0


class VehicleSuitability(BaseModel):
    vehicle_code: str
    vehicle_id: str
    distance_km: float
    available_capacity_kg: float
    required_capacity_kg: float
    has_sufficient_capacity: bool
    is_recommended: bool
    rationale: str
    bin_id: Optional[str] = None
    best_vehicle: Optional[BestVehicleInfo] = None
    recommendation_summary: Optional[str] = None

