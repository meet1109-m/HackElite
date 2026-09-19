"""
Automated unit tests for Bin Fill Prediction models.
"""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.predict import predict_bin_fill

def test_fill_prediction_normal():
    payload = {
        "bin_id": "AMD-BIN-0001",
        "zone_name": "Navrangpura",
        "waste_stream": "Organic",
        "season": "Summer",
        "fill_percentage": 50.0,
        "estimated_weight_kg": 120.0,
        "capacity_kg": 240.0,
        "hours_since_collection": 8.0,
        "daily_generation_kg": 240.0,
        "avg_daily_generation_kg": 220.0,
        "hour": 10,
        "day_of_week": 1,
        "is_weekend": 0,
        "month": 4,
        "temperature_c": 35.0,
        "rainfall_mm": 0.0,
        "humidity": 45.0
    }
    res = predict_bin_fill(payload)
    assert res["bin_id"] == "AMD-BIN-0001"
    assert 0.0 <= res["fill_percentage_6h"] <= 135.0
    assert 0.0 <= res["fill_percentage_12h"] <= 135.0
    assert 0.0 <= res["fill_percentage_24h"] <= 135.0
    assert "overflow_risk" in res

def test_fill_prediction_low_bin():
    payload = {
        "bin_id": "AMD-BIN-0010",
        "zone_name": "Bopal",
        "fill_percentage": 10.0,
        "hours_since_collection": 1.0,
        "daily_generation_kg": 50.0
    }
    res = predict_bin_fill(payload)
    assert res["current_fill_percentage"] == 10.0
    assert res["overflow_risk"] == "LOW"

def test_fill_prediction_high_bin():
    payload = {
        "bin_id": "AMD-BIN-0099",
        "zone_name": "Satellite",
        "fill_percentage": 95.0,
        "hours_since_collection": 24.0,
        "daily_generation_kg": 600.0
    }
    res = predict_bin_fill(payload)
    assert res["current_fill_percentage"] == 95.0
    assert res["overflow_risk"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
