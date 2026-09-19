from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    bin_code: str
    current_fill_pct: float
    fill_6h: float = Field(..., description="Predicted fill percentage after 6 hours")
    fill_12h: float = Field(..., description="Predicted fill percentage after 12 hours")
    fill_24h: float = Field(..., description="Predicted fill percentage after 24 hours")
    predicted_overflow_hours: float
    predicted_overflow_time: str
    confidence_pct: float
    model_type: str = "Prototype Prediction Model"


class OverflowCountdownResponse(BaseModel):
    bin_code: str
    hours_remaining: float
    formatted_countdown: str = Field(..., description="e.g. '04h 18m'")
    severity: str = Field(..., description="Green (>24h), Yellow (12-24h), Orange (4-12h), Red (<4h)")
    is_urgent: bool
    alert_message: str
