"""
Automated unit tests for Unified Predictor Interface and Edge Case Handling.
"""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.predict import (
    predict_bin_fill,
    predict_overflow,
    predict_composition,
    predict_zone_waste,
    detect_anomaly
)

def test_unified_predictor_empty_payloads():
    """Verify that empty dict payloads use safe defaults and do not crash."""
    f_res = predict_bin_fill({})
    assert f_res["bin_id"] == "AMD-BIN-UNKNOWN"
    assert f_res["overflow_risk"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    
    o_res = predict_overflow({})
    assert "overflow_risk" in o_res
    
    c_res = predict_composition({})
    assert c_res["estimation_source"] == "AI Estimated"
    assert abs(c_res["total_percentage"] - 100.0) < 0.1
    
    w_res = predict_zone_waste({})
    assert w_res["predicted_total_waste_kg"] >= 0.0
    
    a_res = detect_anomaly({})
    assert isinstance(a_res["is_anomaly"], bool)

def test_unified_predictor_extreme_values():
    """Verify resilience against extreme input numerical boundaries."""
    extreme_bin = {
        "bin_id": "AMD-BIN-EXTREME",
        "fill_percentage": 135.0,
        "estimated_weight_kg": 5000.0,
        "capacity_kg": 100.0,
        "hours_since_collection": 200.0
    }
    f_res = predict_bin_fill(extreme_bin)
    assert f_res["current_fill_percentage"] == 135.0
    assert f_res["overflow_risk"] == "CRITICAL"
