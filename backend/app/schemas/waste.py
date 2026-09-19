from typing import Optional, Dict
from pydantic import BaseModel, Field


class WasteComposition(BaseModel):
    plastic: float = Field(..., description="Plastic percentage (0-100)")
    organic: float = Field(..., description="Organic percentage (0-100)")
    paper: float = Field(..., description="Paper percentage (0-100)")
    metal: float = Field(..., description="Metal percentage (0-100)")
    glass: float = Field(..., description="Glass percentage (0-100)")
    other: float = Field(..., description="Other percentage (0-100)")


class WasteClassificationResponse(BaseModel):
    bin_code: Optional[str] = None
    composition: WasteComposition
    dominant_material: str
    confidence_pct: float
    source: str = Field(
        ...,
        description="'AI Detected from Image' or 'AI Estimated'"
    )
    recycling_purity_score: int = Field(
        ...,
        description="Recycling Purity Score (0-100) based on target material dominance"
    )
    is_contaminated: bool = False
    contamination_warning: Optional[str] = None
    # Frontend flat compatibility fields
    plastic: Optional[float] = None
    organic: Optional[float] = None
    paper: Optional[float] = None
    metal: Optional[float] = None
    glass: Optional[float] = None
    other: Optional[float] = None
    confidence: Optional[float] = None
    purity_score: Optional[float] = None
    contamination_level: Optional[str] = None



class RecyclingPurityResponse(BaseModel):
    bin_code: str
    stream_name: str
    target_material: str
    target_percentage: float
    purity_score: int
    is_contaminated: bool
    contamination_warning: Optional[str] = None
    recommended_action: str
