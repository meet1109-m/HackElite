"""
FastAPI route for DSWD waste image classification.
"""
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from api.schemas import ImageClassificationResponse
from image_classification.src.predict import predict_waste_image

router = APIRouter(prefix="/predict", tags=["Image Classification"])

class ImageBase64Request(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded RGB image data")

@router.post("/image", response_model=ImageClassificationResponse)
async def classify_waste_image(file: UploadFile = File(...)):
    """Uploads an image file and returns predicted waste category and probabilities."""
    contents = await file.read()
    res = predict_waste_image(contents)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return ImageClassificationResponse(**res)

@router.post("/image-base64", response_model=ImageClassificationResponse)
async def classify_waste_image_base64(req: ImageBase64Request):
    """Classifies a base64 encoded image string."""
    try:
        raw_b64 = req.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        image_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")
        
    res = predict_waste_image(image_bytes)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return ImageClassificationResponse(**res)
