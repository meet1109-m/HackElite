"""API Route Controllers for SmartBinX."""

from fastapi import FastAPI

from app.routes.bins import router as bins_router
from app.routes.vehicles import router as vehicles_router
from app.routes.routes import router as routes_router
from app.routes.waste import router as waste_router
from app.routes.predictions import router as predictions_router
from app.routes.analytics import router as analytics_router
from app.routes.simulation import router as simulation_router
from app.routes.ai import router as ai_router
from app.routes.demo import router as demo_router

ROUTER_CONFIGS = [
    (bins_router, ["Bins & Digital Twins"]),
    (vehicles_router, ["Vehicles & Capacity"]),
    (routes_router, ["Routing & Replanning"]),
    (waste_router, ["Waste Intelligence & Purity"]),
    (predictions_router, ["Predictions & Countdown"]),
    (analytics_router, ["Analytics & Impact"]),
    (simulation_router, ["Simulation & Event Mode"]),
    (ai_router, ["AI Waste Manager"]),
    (demo_router, ["Scripted Demo Runner"]),
]


def register_routes(app: FastAPI) -> None:
    """Mount all API routers onto the FastAPI application with standardized OpenAPI tags."""
    for router, tags in ROUTER_CONFIGS:
        app.include_router(router, tags=tags)


__all__ = [
    "bins_router",
    "vehicles_router",
    "routes_router",
    "waste_router",
    "predictions_router",
    "analytics_router",
    "simulation_router",
    "ai_router",
    "demo_router",
    "ROUTER_CONFIGS",
    "register_routes",
]
