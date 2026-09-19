"""SmartBinX Waste Intelligence & Recycling Purity Endpoints.

Endpoints for computer vision waste classification, historical estimation,
and recycling purity/contamination analysis.
"""

from typing import Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.schemas.waste import WasteClassificationResponse, RecyclingPurityResponse
from app.services.data_store import data_store
from app.services.waste_intelligence import (
    classify_waste_image,
    estimate_waste_composition,
    calculate_recycling_purity,
)

router = APIRouter(prefix="/api/waste", tags=["Waste Intelligence"])


@router.post("/classify", response_model=WasteClassificationResponse)
async def classify_waste_endpoint(
    file: Optional[UploadFile] = File(None),
    demo_image_id: Optional[str] = Query(None, description="Demo preset image identifier (e.g. 'AHM-104', 'AHM-118')"),
    bin_code: Optional[str] = Query(None, description="Optional associated bin code"),
):
    """Computer Vision waste classification endpoint.

    Accepts an uploaded image file or a demo image preset.
    Returns material composition breakdown tagged with "source": "AI Detected from Image".
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()

    target_code = bin_code or demo_image_id or "DEMO-STREAM"
    result = classify_waste_image(
        image_bytes=image_bytes,
        bin_code=target_code,
    )
    return result


@router.get("/composition/{bin_code}", response_model=WasteClassificationResponse)
def get_waste_composition_endpoint(bin_code: str):
    """Retrieve historical estimated waste composition for a specific bin.

    Tagged with "source": "AI Estimated".
    """
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    wc = data_store.get_waste_composition(bin_code)
    if not wc:
        wc = estimate_waste_composition(bin_code, zone_name=b["zone"], stream_name=b.get("waste_stream", "Mixed"))

    if "composition" in wc and isinstance(wc["composition"], dict):
        comp = wc["composition"]
    else:
        comp = {
            "plastic": float(wc.get("plastic_percentage", 30.0)),
            "organic": float(wc.get("organic_percentage", 40.0)),
            "paper": float(wc.get("paper_percentage", 15.0)),
            "metal": float(wc.get("metal_percentage", 5.0)),
            "glass": float(wc.get("glass_percentage", 5.0)),
            "other": float(wc.get("other_percentage", 5.0)),
        }

    purity = calculate_recycling_purity(
        bin_code,
        comp,
        stream_name=b.get("waste_stream", "Mixed"),
    )

    dominant = max(comp, key=lambda k: comp.get(k, 0.0)).capitalize()
    conf = float(wc.get("confidence", 0.85))
    confidence_pct = conf * 100.0 if conf <= 1.0 else conf

    return {
        "bin_code": bin_code,
        "composition": comp,
        "dominant_material": dominant,
        "confidence_pct": round(confidence_pct, 1),
        "source": "AI Estimated",
        "recycling_purity_score": purity["purity_score"],
        "is_contaminated": purity["is_contaminated"],
        "contamination_warning": purity["contamination_warning"],
    }


@router.get("/purity/{bin_code}", response_model=RecyclingPurityResponse)
def get_recycling_purity_endpoint(bin_code: str):
    """Evaluate the recycling purity score (0-100) for a bin.

    If purity is below 70%, flags high contamination warning and suggests manual sorting.
    """
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    wc = data_store.get_waste_composition(bin_code)
    if wc and "composition" in wc and isinstance(wc["composition"], dict):
        comp = wc["composition"]
    elif wc:
        comp = {
            "plastic": float(wc.get("plastic_percentage", 30.0)),
            "organic": float(wc.get("organic_percentage", 40.0)),
            "paper": float(wc.get("paper_percentage", 15.0)),
            "metal": float(wc.get("metal_percentage", 5.0)),
            "glass": float(wc.get("glass_percentage", 5.0)),
            "other": float(wc.get("other_percentage", 5.0)),
        }
    else:
        comp_res = estimate_waste_composition(bin_code, zone_name=b["zone"], stream_name=b.get("waste_stream", "Mixed"))
        comp = comp_res["composition"]

    purity_res = calculate_recycling_purity(
        bin_code,
        comp,
        stream_name=b.get("waste_stream", "Recyclable"),
    )
    return purity_res
