"""
FastAPI route for Zone Waste Generation Forecasting.
"""
from fastapi import APIRouter
from api.schemas import WasteForecastRequest, WasteForecastResponse
from src.predict import predict_zone_waste

router = APIRouter(prefix="/predict", tags=["Waste Forecasting"])

@router.post("/waste", response_model=WasteForecastResponse)
def get_zone_waste_forecast(payload: WasteForecastRequest):
    result = predict_zone_waste(payload.model_dump())
    return WasteForecastResponse(**result)
