"""SmartBinX Simulation & Event Mode Endpoints.

Endpoints for What-If scenario simulations and Ahmedabad Event Mode resource sizing.
"""

from fastapi import APIRouter

from app.schemas.simulation import (
    WhatIfRequest,
    WhatIfResponse,
    EventModeRequest,
    EventModeResponse,
)
from app.services.simulation_service import run_what_if_simulation, simulate_event_mode

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])


@router.post("/what-if", response_model=WhatIfResponse)
def what_if_simulation_endpoint(payload: WhatIfRequest):
    """Execute What-If scenario simulation on the municipal collection fleet."""
    result = run_what_if_simulation(payload.model_dump())
    return result


@router.post("/event-mode", response_model=EventModeResponse)
def event_mode_endpoint(payload: EventModeRequest):
    """Activate Ahmedabad Event Mode to size temporary bins, extra vehicles, and collection cycles."""
    result = simulate_event_mode(
        event_name=payload.event_name,
        expected_footfall=payload.expected_footfall,
        expected_waste_increase_pct=payload.expected_waste_increase_pct,
        target_zones=payload.target_zones,
    )
    return result
