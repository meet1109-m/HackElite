"""
FastAPI route for AI Estimated Waste Composition.
"""
from fastapi import APIRouter
from api.schemas import CompositionRequest, CompositionResponse
from src.predict import predict_composition

router = APIRouter(prefix="/predict", tags=["Waste Composition"])

@router.post("/composition", response_model=CompositionResponse)
def get_waste_composition_estimation(payload: CompositionRequest):
    result = predict_composition(payload.model_dump())
    return CompositionResponse(**result)
