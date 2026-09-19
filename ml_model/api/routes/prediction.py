"""
FastAPI route for Bin Fill-Level and Overflow Predictions.
"""
from fastapi import APIRouter
from api.schemas import BinFillRequest, BinFillResponse, OverflowResponse
from src.predict import predict_bin_fill, predict_overflow

router = APIRouter(prefix="/predict", tags=["Bin Fill & Overflow"])

@router.post("/fill", response_model=BinFillResponse)
def get_bin_fill_prediction(payload: BinFillRequest):
    result = predict_bin_fill(payload.model_dump())
    return BinFillResponse(**result)

@router.post("/overflow", response_model=OverflowResponse)
def get_overflow_prediction(payload: BinFillRequest):
    result = predict_overflow(payload.model_dump())
    return OverflowResponse(**result)
