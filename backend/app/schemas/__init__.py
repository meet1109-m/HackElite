"""Pydantic schemas and data contracts for SmartBinX."""

from app.schemas.bin import (
    PriorityBreakdown,
    BinBase,
    BinResponse,
    BinDigitalTwin,
    BinReadingResponse,
)
from app.schemas.vehicle import (
    VehicleBase,
    VehicleResponse,
    VehicleSuitability,
)
from app.schemas.route import (
    Waypoint,
    RouteResponse,
    OptimizeRouteRequest,
    ReplanRequest,
    ReplanResponse,
)
from app.schemas.waste import (
    WasteComposition,
    WasteClassificationResponse,
    RecyclingPurityResponse,
)
from app.schemas.prediction import (
    PredictionResponse,
    OverflowCountdownResponse,
)
from app.schemas.analytics import (
    HotspotResponse,
    AnomalyResponse,
    EnvironmentalImpactResponse,
)
from app.schemas.simulation import (
    WhatIfRequest,
    WhatIfResponse,
    EventModeRequest,
    EventModeResponse,
)
from app.schemas.ai import (
    ActionCard,
    AIQueryRequest,
    AIQueryResponse,
)
from app.schemas.demo import (
    DemoStep,
    DemoRunResponse,
)

__all__ = [
    "PriorityBreakdown",
    "BinBase",
    "BinResponse",
    "BinDigitalTwin",
    "BinReadingResponse",
    "VehicleBase",
    "VehicleResponse",
    "VehicleSuitability",
    "Waypoint",
    "RouteResponse",
    "OptimizeRouteRequest",
    "ReplanRequest",
    "ReplanResponse",
    "WasteComposition",
    "WasteClassificationResponse",
    "RecyclingPurityResponse",
    "PredictionResponse",
    "OverflowCountdownResponse",
    "HotspotResponse",
    "AnomalyResponse",
    "EnvironmentalImpactResponse",
    "WhatIfRequest",
    "WhatIfResponse",
    "EventModeRequest",
    "EventModeResponse",
    "ActionCard",
    "AIQueryRequest",
    "AIQueryResponse",
    "DemoStep",
    "DemoRunResponse",
]
