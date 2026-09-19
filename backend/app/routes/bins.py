"""SmartBinX Bin Route Controllers.

Endpoints for bin telemetry, metadata, digital twins, and sensor time-series history.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.bin import BinResponse, BinDigitalTwin, BinReadingResponse
from app.services.data_store import data_store
from app.services.priority_engine import calculate_priority
from app.services.prediction_engine import predict_bin_overflow, calculate_overflow_countdown
from app.services.waste_intelligence import estimate_waste_composition

router = APIRouter(prefix="/api/bins", tags=["Bins"])


@router.get("", response_model=List[BinResponse])
def list_bins(
    zone: Optional[str] = Query(None, description="Filter by Ahmedabad zone name"),
    status: Optional[str] = Query(None, description="Filter by status (Healthy, Filling, High Priority, Critical, Overflow Risk)"),
    min_fill: Optional[float] = Query(None, description="Minimum fill percentage threshold (0-100)"),
):
    """List all bins with optional filtering by zone, status, or minimum fill percentage."""
    bins = data_store.get_all_bins(zone=zone, status=status, min_fill=min_fill)
    return bins


@router.get("/{bin_code}", response_model=BinResponse)
def get_bin(bin_code: str):
    """Retrieve metadata and live status for a specific bin."""
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found in Ahmedabad network.")
    return b


@router.get("/{bin_code}/twin", response_model=BinDigitalTwin)
def get_bin_digital_twin(bin_code: str):
    """Retrieve the full Digital Twin profile for a smart bin.

    Combines current physical state, time-series predictions, historical trends,
    and AI waste intelligence into a unified operational profile.
    """
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    pred = predict_bin_overflow(b)
    wc = data_store.get_waste_composition(bin_code)
    if not wc:
        wc = estimate_waste_composition(bin_code, zone_name=b["zone"], stream_name=b.get("waste_stream", "Mixed"))

    current_state = {
        "fill_percentage": float(b.get("fill_percentage", 0.0)),
        "estimated_weight_kg": float(b.get("estimated_weight", 0.0)),
        "capacity_kg": float(b.get("capacity_kg", 40.0)),
    }

    predictions = {
        "fill_6h": f"{pred['fill_6h']}%",
        "fill_12h": f"{pred['fill_12h']}%",
        "fill_24h": f"{pred['fill_24h']}%",
        "predicted_overflow_time": str(pred.get("predicted_overflow_time", ">24h")),
        "confidence": f"{pred.get('confidence_pct', 88.0)}%",
    }

    historical = {
        "avg_daily_generation_kg": "57.5 kg",
        "last_collection": str(b.get("last_collection", "Yesterday")),
    }

    waste_intel = {
        "composition": wc.get("composition", {}),
        "source": wc.get("source", "AI Estimated"),
        "confidence": f"{wc.get('confidence_pct', 85.0)}%",
    }

    return {
        "bin_code": b["bin_code"],
        "zone": b["zone"],
        "status": b["status"],
        "priority_score": b["priority_score"],
        "current_state": current_state,
        "predictions": predictions,
        "historical": historical,
        "waste_intelligence": waste_intel,
        "environment": "SmartBinX Digital Twin Engine",
    }


@router.get("/{bin_code}/readings", response_model=List[BinReadingResponse])
def get_bin_readings(bin_code: str):
    """Retrieve historical sensor readings for telemetry charting."""
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    readings = data_store.get_telemetry_readings(bin_code)
    return readings
