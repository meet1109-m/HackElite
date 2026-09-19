"""
Automated unit tests for Zone Waste Generation Forecasting.
"""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.predict import predict_zone_waste

def test_forecast_zone_waste_normal():
    payload = {
        "zone_name": "Maninagar",
        "day_of_week": 3,
        "month": 5,
        "is_weekend": 0,
        "waste_lag_1": 4200.0,
        "waste_lag_2": 4100.0,
        "waste_lag_7": 4350.0,
        "waste_rolling_mean_3": 4150.0,
        "waste_rolling_mean_7": 4200.0,
        "avg_daily_generation_kg_14d": 4180.0
    }
    res = predict_zone_waste(payload)
    assert res["zone_name"] == "Maninagar"
    assert res["predicted_total_waste_kg"] > 0.0
    assert res["forecast_horizon"] == "next_day"

def test_forecast_missing_lags_fallback():
    payload = {
        "zone_name": "Bopal"
    }
    res = predict_zone_waste(payload)
    assert res["predicted_total_waste_kg"] >= 0.0
