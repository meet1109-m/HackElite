"""SmartBinX Ahmedabad Zones Controller.

Endpoints for zone metadata, generation baselines, and geographic centroids.
"""
from typing import List, Dict, Any
from fastapi import APIRouter
from app.services.data_store import data_store

router = APIRouter(prefix="/api/zones", tags=["Zones"])


@router.get("", response_model=List[Dict[str, Any]])
def get_zones_endpoint():
    """Retrieve all 10 Ahmedabad municipal zones with baselines and coordinates."""
    zones = []
    for name, z in data_store.zones.items():
        baseline = float(z.get("baseline_generation", 750.0))
        current = float(z.get("waste_generation", baseline))
        diff = current - baseline
        delta_pct = round((diff / max(1.0, baseline)) * 100.0, 1)

        zones.append({
            "id": f"z-{name.lower().replace(' ', '-')}",
            "name": name,
            "center_lat": float(z["center_lat"]),
            "center_lng": float(z["center_lng"]),
            "current_generation_kg": current,
            "baseline_generation_kg": baseline,
            "delta_percentage": delta_pct,
            "zone_type": z.get("zone_type", "Mixed"),
            "footfall_estimate": z.get("footfall_estimate", 5000),
        })
    return zones
