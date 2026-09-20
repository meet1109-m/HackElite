"""
FastAPI route for Waste Hotspot Detection and Intelligence.
"""
from typing import Optional
from fastapi import APIRouter
from api.schemas import HotspotRequest, HotspotResponse
from src.predict import detect_waste_hotspots

router = APIRouter(tags=["Waste Hotspots"])

@router.post("/predict/hotspots", response_model=HotspotResponse)
def get_waste_hotspots(payload: Optional[HotspotRequest] = None):
    """
    Identifies geographic waste hotspots, multi-factor severity tiers, temporal trends,
    and projected future risks using spatial clustering and forecaster integration.
    """
    if payload is not None:
        bins_data = [b.model_dump() for b in payload.bins] if payload.bins is not None else None
        res = detect_waste_hotspots(
            data=bins_data,
            eps_km=payload.eps_km,
            min_samples=payload.min_samples,
            include_forecast=payload.include_forecast if payload.include_forecast is not None else True
        )
    else:
        res = detect_waste_hotspots()
        
    return HotspotResponse(**res)

@router.get("/hotspots/health", tags=["Waste Hotspots"])
def hotspots_health():
    """Health check specifically for the Waste Hotspot Detection subsystem."""
    return {
        "subsystem": "waste_hotspot_detection",
        "status": "healthy",
        "algorithm": "DBSCAN (Haversine)",
        "city": "Ahmedabad, Gujarat, India"
    }
