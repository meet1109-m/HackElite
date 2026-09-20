from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, ConfigDict, Field


class PriorityBreakdown(BaseModel):
    current_fill: int = Field(..., description="Points contributed by current fill level")
    predicted_overflow: int = Field(..., description="Points contributed by overflow risk")
    high_generation_rate: int = Field(..., description="Points contributed by zone generation rate")
    organic_waste: int = Field(..., description="Points contributed by waste type sensitivity")
    time_since_collection: int = Field(..., description="Points contributed by time elapsed")
    total: int = Field(..., description="Summed priority score (0-100)")
    explanation: str = Field(..., description="Human-readable explainable AI rationale")


class BinBase(BaseModel):
    bin_code: str
    zone: str
    latitude: float
    longitude: float
    capacity_kg: float = 40.0
    fill_percentage: float = 0.0
    estimated_weight: float = 0.0
    waste_stream: str = "Mixed"  # Organic, Recyclable, Mixed, Hazardous
    status: str = "Healthy"      # Healthy, Filling, High Priority, Critical, Overflow Risk, Offline


class BinResponse(BinBase):
    id: str
    priority_score: int = 0
    priority_breakdown: Optional[PriorityBreakdown] = None
    predicted_overflow_time: str = ">24h"
    overflow_severity: str = "Green"  # Green, Yellow, Orange, Red
    last_collection: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BinDigitalTwin(BaseModel):
    bin_code: str
    zone: str
    status: str
    priority_score: int
    current_state: Dict[str, float] = Field(
        ...,
        description="fill_percentage, estimated_weight_kg, capacity_kg"
    )
    predictions: Dict[str, str] = Field(
        ...,
        description="fill_6h, fill_12h, fill_24h, predicted_overflow_time, confidence"
    )
    historical: Dict[str, str] = Field(
        ...,
        description="avg_daily_generation_kg, last_collection"
    )
    waste_intelligence: Dict[str, object] = Field(
        ...,
        description="composition breakdown, source, confidence"
    )
    environment: str = "Prototype / Simulated Data"


class BinReadingResponse(BaseModel):
    id: str
    bin_id: str
    bin_code: str
    timestamp: datetime
    fill_percentage: float
    weight: float

    model_config = ConfigDict(from_attributes=True)


class PriorityWeightsRequest(BaseModel):
    fill_weight: Optional[float] = Field(35.0, description="Weight percentage for current fill level")
    overflow_weight: Optional[float] = Field(30.0, description="Weight percentage for overflow urgency")
    stream_weight: Optional[float] = Field(15.0, description="Weight percentage for waste stream sensitivity")
    zone_weight: Optional[float] = Field(10.0, description="Weight percentage for location/zone generation")
    gen_weight: Optional[float] = Field(10.0, description="Weight percentage for zone generation rate")
    freq_weight: Optional[float] = Field(5.0, description="Weight percentage for collection frequency")
    delay_weight: Optional[float] = Field(5.0, description="Weight percentage for collection delay")
