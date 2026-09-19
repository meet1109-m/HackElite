from typing import List, Optional
from pydantic import BaseModel, Field


class Waypoint(BaseModel):
    stop_number: int
    bin_code: str
    zone: str
    latitude: float
    longitude: float
    fill_percentage: float
    estimated_weight_kg: float
    is_critical: bool
    status: str


class RouteResponse(BaseModel):
    route_id: str
    vehicle_code: str
    depot_name: str
    total_distance_km: float
    estimated_duration_mins: int
    collected_weight_kg: float
    vehicle_capacity_kg: float
    utilization_pct: float
    waypoints: List[Waypoint]
    status: str = "Active"
    environment: str = "Prototype / Simulated Data"


class OptimizeRouteRequest(BaseModel):
    vehicle_codes: Optional[List[str]] = None
    target_zones: Optional[List[str]] = None
    min_fill_threshold: Optional[float] = 70.0


class ReplanRequest(BaseModel):
    route_id: str
    emergency_bin_code: str


class ReplanResponse(BaseModel):
    original_route: RouteResponse
    replanned_route: RouteResponse
    emergency_bin_code: str
    additional_distance_km: float
    additional_duration_mins: int
    overflow_risk_avoided: str
    explanation: str
