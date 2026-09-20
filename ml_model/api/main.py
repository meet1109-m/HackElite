"""
WasteWise AI - FastAPI ML Model Serving Application.
Serves Ahmedabad-centric ML intelligence endpoints for bin fill, overflow risk, waste composition, zone forecasting, and anomaly detection.
"""
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure ml_model base is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from api.schemas import HealthResponse
from api.routes.prediction import router as prediction_router
from api.routes.composition import router as composition_router
from api.routes.forecasting import router as forecasting_router
from api.routes.anomaly import router as anomaly_router
from api.routes.image import router as image_router
from api.routes.hotspots import router as hotspots_router

app = FastAPI(
    title="WasteWise AI — Ahmedabad Machine Learning Service",
    description="Intelligent municipal waste analytics, fill forecasting, composition estimation, anomaly detection, hotspot clustering, and vision classification for Ahmedabad.",
    version="1.0.0"
)

# Enable CORS for frontend and backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include subrouters
app.include_router(prediction_router)
app.include_router(composition_router)
app.include_router(forecasting_router)
app.include_router(anomaly_router)
app.include_router(image_router)
app.include_router(hotspots_router)

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="healthy",
        city="Ahmedabad, Gujarat, India",
        subsystems={
            "bin_fill_prediction": "active",
            "overflow_prediction": "active",
            "waste_composition_estimation": "active",
            "zone_waste_forecasting": "active",
            "anomaly_detection": "active",
            "waste_image_classification": "active",
            "waste_hotspot_detection": "active"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
