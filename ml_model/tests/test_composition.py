"""
Automated unit tests for Waste Composition Estimation.
"""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.predict import predict_composition

def test_composition_sum_to_100():
    payload = {
        "zone_name": "Navrangpura",
        "waste_stream": "Mixed",
        "total_waste_kg": 450.0
    }
    res = predict_composition(payload)
    assert res["estimation_source"] == "AI Estimated"
    assert res["plastic_percentage"] >= 0.0
    assert res["paper_percentage"] >= 0.0
    assert res["metal_percentage"] >= 0.0
    assert res["glass_percentage"] >= 0.0
    assert res["organic_percentage"] >= 0.0
    assert res["other_percentage"] >= 0.0
    
    total = (
        res["plastic_percentage"] +
        res["paper_percentage"] +
        res["metal_percentage"] +
        res["glass_percentage"] +
        res["organic_percentage"] +
        res["other_percentage"]
    )
    assert abs(total - 100.0) < 0.1, f"Composition shares sum to {total}, expected 100.0"

def test_composition_organic_stream():
    payload = {
        "zone_name": "Paldi",
        "waste_stream": "Organic",
        "total_waste_kg": 300.0
    }
    res = predict_composition(payload)
    assert res["organic_percentage"] > 20.0
    assert abs(res["total_percentage"] - 100.0) < 0.1
