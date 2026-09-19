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

    return match
