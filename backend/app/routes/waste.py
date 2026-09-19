"""SmartBinX Waste Intelligence & Recycling Purity Endpoints.

Endpoints for computer vision waste classification, historical estimation,
and recycling purity/contamination analysis.
"""

from typing import Optional
from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile

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
    request: Request,
    demo_image_id: Optional[str] = Query(None, description="Demo preset image identifier (e.g. 'AHM-104', 'AHM-118')"),
    bin_code: Optional[str] = Query(None, description="Optional associated bin code"),
):
    """Computer Vision waste classification endpoint.

    Accepts:
    1. JSON payload: { "stream": "Plastic", "sampleId": "sample-01", "demo_image_id": "AHM-104", "bin_code": "AHM-104" }
    2. Multipart form data with file upload: `file`
    3. Query parameters: `demo_image_id`, `bin_code`

    Returns material composition breakdown tagged with "source": "AI Detected from Image".
    """
    content_type = request.headers.get("content-type", "").lower()
    image_bytes = None
    stream_name = "Recyclable"
    target_code = bin_code or demo_image_id

    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                target_code = (
                    body.get("sampleId")
                    or body.get("demo_image_id")
                    or body.get("bin_code")
                    or target_code
                )
                stream_name = body.get("stream") or body.get("waste_stream") or stream_name
        except Exception:
            pass
    elif "multipart/form-data" in content_type:
        try:
            form = await request.form()
            file_obj = form.get("file")
            if file_obj and hasattr(file_obj, "read"):
                image_bytes = await file_obj.read()
            target_code = form.get("bin_code") or form.get("demo_image_id") or target_code
            stream_name = form.get("stream") or form.get("waste_stream") or stream_name
        except Exception:
            pass

    target_code = target_code or "DEMO-STREAM"
    result = classify_waste_image(
        image_bytes=image_bytes,
        bin_code=target_code,
        stream_name=stream_name,
    )

    comp = result.get("composition", {})
    purity_score = int(result.get("recycling_purity_score", 75))
    is_contaminated = bool(result.get("is_contaminated", False))
    conf_pct = float(result.get("confidence_pct", 89.0))

    return {
        "bin_code": result.get("bin_code"),
        "composition": comp,
        "dominant_material": result.get("dominant_material", "Plastic"),
        "confidence_pct": conf_pct,
        "source": result.get("source", "AI Detected from Image"),
        "recycling_purity_score": purity_score,
        "is_contaminated": is_contaminated,
        "contamination_warning": result.get("contamination_warning"),
        "plastic": comp.get("plastic", 0.0),
        "organic": comp.get("organic", 0.0),
        "paper": comp.get("paper", 0.0),
        "metal": comp.get("metal", 0.0),
        "glass": comp.get("glass", 0.0),
        "other": comp.get("other", 0.0),
        "confidence": round(conf_pct / 100.0, 2),
        "purity_score": float(purity_score),
        "contamination_level": "Critical Contamination" if purity_score < 50 else ("Moderate Contamination" if is_contaminated else "Low Contamination"),
    }



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
