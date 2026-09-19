"""SmartBinX Prediction & Overflow Countdown Endpoints.

Endpoints for 6h, 12h, 24h fill level forecasting and visual overflow countdown timers.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import PredictionResponse, OverflowCountdownResponse
from app.services.data_store import data_store
from app.services.prediction_engine import predict_bin_overflow, calculate_overflow_countdown

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.get("/{bin_code}", response_model=PredictionResponse)
def get_prediction_endpoint(bin_code: str):
    """Retrieve 6-hour, 12-hour, and 24-hour fill-level forecasts for a bin."""
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    prediction = predict_bin_overflow(b)
    return prediction


@router.get("/{bin_code}/countdown", response_model=OverflowCountdownResponse)
def get_countdown_endpoint(bin_code: str):
    """Retrieve the real-time overflow countdown and visual severity color for a bin.

    Severity tags: Green (>24h), Yellow (12-24h), Orange (4-12h), Red (<4h).
    """
    b = data_store.get_bin(bin_code)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin '{bin_code}' not found.")

    countdown = calculate_overflow_countdown(b)
    return countdown
