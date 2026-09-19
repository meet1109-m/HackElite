from typing import Any, Dict, List, Optional
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
    # Frontend GIS compatibility fields
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    color: Optional[str] = None
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    start_depot: Optional[str] = None
    end_mrf: Optional[str] = None
    polyline_coords: Optional[List[List[float]]] = None
    stops: Optional[List[Dict[str, Any]]] = None
    ai_recommendation: Optional[str] = None


class OptimizeRouteRequest(BaseModel):
    vehicle_codes: Optional[List[str]] = None
    vehicle_id: Optional[str] = None
    target_zones: Optional[List[str]] = None
    min_fill_threshold: Optional[float] = 70.0


class ReplanRequest(BaseModel):
    route_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    emergency_bin_code: Optional[str] = None
    urgent_bin: Optional[str] = None


class ReplanResponse(BaseModel):
    original_route: RouteResponse
    replanned_route: RouteResponse
    emergency_bin_code: str
    additional_distance_km: float
    additional_duration_mins: int
    overflow_risk_avoided: str
    explanation: str
    # Frontend flat compatibility fields
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    color: Optional[str] = None
    is_replanned: bool = True
    previous_distance_km: Optional[float] = None
    distance_km: Optional[float] = None
    new_distance_km: Optional[float] = None
    delta_distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    collected_weight_kg: Optional[float] = None
    vehicle_capacity_kg: Optional[float] = None
    utilization_pct: Optional[float] = None
    inserted_bin: Optional[str] = None
    overflow_risk_status: Optional[str] = None
    start_depot: Optional[str] = None
    end_mrf: Optional[str] = None
    polyline_coords: Optional[List[List[float]]] = None
    stops: Optional[List[Dict[str, Any]]] = None
    ai_recommendation: Optional[str] = None

