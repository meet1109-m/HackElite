"""Database models and ORM entities for SmartBinX."""

from app.models.entities import (
    Zone,
    Bin,
    BinReading,
    Vehicle,
    Route,
    Collection,
    WasteClassification,
    Prediction,
    Alert,
)

__all__ = [
    "Zone",
    "Bin",
    "BinReading",
    "Vehicle",
    "Route",
    "Collection",
    "WasteClassification",
    "Prediction",
    "Alert",
]
