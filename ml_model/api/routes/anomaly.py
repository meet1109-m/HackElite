"""
FastAPI route for Waste Generation Anomaly Detection.
"""
from fastapi import APIRouter
from api.schemas import AnomalyRequest, AnomalyResponse
from src.predict import detect_anomaly

router = APIRouter(prefix="/predict", tags=["Anomaly Detection"])

@router.post("/anomaly", response_model=AnomalyResponse)
def get_waste_anomaly_detection(payload: AnomalyRequest):
    result = detect_anomaly(payload.model_dump())
    return AnomalyResponse(**result)
