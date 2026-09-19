"""
Automated unit tests for Overflow Prediction Engine.
"""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.fill_prediction.overflow import calculate_overflow_metrics

def test_overflow_already_full():
    res = calculate_overflow_metrics(102.0, 105.0, 110.0, 120.0)
    assert res["hours_until_overflow"] == 0.0
    assert res["overflow_risk"] == "CRITICAL"

def test_overflow_critical_urgency():
    res = calculate_overflow_metrics(90.0, 110.0, 115.0, 120.0)
    assert res["hours_until_overflow"] < 4.0
    assert res["overflow_risk"] == "CRITICAL"

def test_overflow_high_urgency():
    res = calculate_overflow_metrics(70.0, 90.0, 110.0, 115.0)
    assert 4.0 <= res["hours_until_overflow"] <= 12.0
    assert res["overflow_risk"] == "HIGH"

def test_overflow_medium_urgency():
    res = calculate_overflow_metrics(40.0, 60.0, 80.0, 100.0)
    assert 12.0 <= res["hours_until_overflow"] <= 24.0
    assert res["overflow_risk"] == "MEDIUM"

def test_overflow_low_urgency():
    res = calculate_overflow_metrics(20.0, 30.0, 40.0, 50.0)
    assert res["hours_until_overflow"] > 24.0
    assert res["overflow_risk"] == "LOW"
