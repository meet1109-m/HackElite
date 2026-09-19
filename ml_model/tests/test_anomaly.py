"""
Automated unit tests for Anomaly Detection.
"""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.predict import detect_anomaly

def test_anomaly_detection_normal():
    payload = {
        "zone_name": "Navrangpura",
        "total_waste_kg": 4200.0,
        "average_bin_fill_percentage": 65.0,
        "overflow_count": 1,
        "collection_count": 22,
        "avg_daily_generation_kg_14d": 4150.0
    }
    res = detect_anomaly(payload)
    assert res["zone_name"] == "Navrangpura"
    assert isinstance(res["is_anomaly"], bool)
    assert isinstance(res["anomaly_score"], float)
    assert res["anomaly_status"] in ["NORMAL", "ANOMALY_DETECTED"]

def test_anomaly_detection_extreme_spike():
    payload = {
        "zone_name": "Bopal",
        "total_waste_kg": 36000.0,
        "average_bin_fill_percentage": 98.0,
        "overflow_count": 35,
        "collection_count": 5,
        "avg_daily_generation_kg_14d": 3500.0
    }
    res = detect_anomaly(payload)
    assert res["is_anomaly"] is True
    assert res["anomaly_status"] == "ANOMALY_DETECTED"
