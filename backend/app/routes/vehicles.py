"""SmartBinX Vehicle Route Controllers.

Endpoints for fleet telemetry, vehicle statuses, and optimal vehicle-bin matching.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.vehicle import VehicleResponse, VehicleSuitability
from app.services.data_store import data_store
from app.services.route_optimizer import find_best_vehicle_for_bin

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[VehicleResponse])
def list_vehicles(
    status: Optional[str] = Query(None, description="Filter by status (Available, On Route, Maintenance, Off Duty)")
):
    """List all 12 collection vehicles with capacity, load, utilization, and GPS coordinates."""
    vehicles = data_store.get_all_vehicles(status=status)
    return vehicles


@router.get("/best-for-bin/{bin_code}", response_model=VehicleSuitability)
def get_best_vehicle_for_bin_endpoint(bin_code: str):
    """Evaluate all vehicles and return the nearest vehicle with sufficient available capacity."""
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    eval_result = find_best_vehicle_for_bin(b, data_store.get_all_vehicles())
    recommended = eval_result.get("recommended_vehicle")
    evaluations = eval_result.get("evaluations", [])

    if not recommended:
        raise HTTPException(
            status_code=404,
            detail=f"No operational vehicles currently have sufficient payload capacity ({b.get('estimated_weight', 30.0)} kg) for bin {bin_code}."
        )

    # Find matching evaluation item
    match = next((ev for ev in evaluations if ev["vehicle_code"] == recommended["vehicle_code"]), None)
    if not match:
        raise HTTPException(status_code=500, detail="Evaluation mapping error.")

    match_copy = dict(match)
    match_copy["bin_id"] = b.get("id", bin_code)
    match_copy["best_vehicle"] = {
        "vehicle_code": recommended.get("vehicle_code"),
        "driver_name": recommended.get("driver_name", "Ramesh Patel"),
        "driver_phone": recommended.get("driver_phone", "+91 98250 14210"),
        "distance_km": match.get("distance_km", 0.0),
        "available_capacity_kg": match.get("available_capacity_kg", 0.0),
        "current_load_kg": recommended.get("current_load", 0.0),
        "capacity_kg": recommended.get("capacity_kg", 2000.0),
    }
    match_copy["recommendation_summary"] = match.get(
        "rationale",
        f"Truck {recommended.get('vehicle_code')} selected: Closest proximity ({match.get('distance_km')} km)."
    )

    return match_copy

