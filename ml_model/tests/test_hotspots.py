"""
Comprehensive Test Suite for Waste Hotspot Detection Module.
Tests 10 mandatory cases:
1. Empty dataset
2. Normal dataset
3. Multiple spatial clusters
4. No detectable hotspots
5. Missing coordinates
6. Missing waste values
7. Duplicate records
8. Very small dataset
9. API response schema
10. Model/function reload
"""
import sys
import importlib
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure ml_model is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.hotspots.detector import detect_waste_hotspots, WasteHotspotDetector
from src.hotspots.clustering import perform_dbscan_clustering
from src.hotspots.severity import calculate_hotspot_severity
from src.hotspots.temporal import classify_temporal_trend
from src.hotspots.recommendations import generate_hotspot_recommendations
from api.main import app

client = TestClient(app)

# 1. Empty dataset
def test_empty_dataset():
    res = detect_waste_hotspots(data=[])
    assert res["status"] == "success"
    assert res["total_bins_analyzed"] == 0
    assert res["hotspots_count"] == 0
    assert res["hotspots"] == []
    assert res["summary"]["critical_hotspots"] == 0

# 2. Normal dataset
def test_normal_dataset():
    sample_data = [
        {"bin_id": "AMD-BIN-001", "latitude": 23.030, "longitude": 72.580, "zone_name": "Navrangpura", "total_waste_kg": 150.0, "baseline_waste_kg": 90.0, "fill_percentage": 82.0, "overflow_count": 1, "anomaly_count": 1},
        {"bin_id": "AMD-BIN-002", "latitude": 23.032, "longitude": 72.581, "zone_name": "Navrangpura", "total_waste_kg": 160.0, "baseline_waste_kg": 95.0, "fill_percentage": 88.0, "overflow_count": 2, "anomaly_count": 0},
        {"bin_id": "AMD-BIN-003", "latitude": 23.031, "longitude": 72.582, "zone_name": "Navrangpura", "total_waste_kg": 140.0, "baseline_waste_kg": 90.0, "fill_percentage": 79.0, "overflow_count": 0, "anomaly_count": 1},
        {"bin_id": "AMD-BIN-004", "latitude": 23.033, "longitude": 72.579, "zone_name": "Navrangpura", "total_waste_kg": 170.0, "baseline_waste_kg": 100.0, "fill_percentage": 85.0, "overflow_count": 1, "anomaly_count": 0},
    ]
    res = detect_waste_hotspots(data=sample_data, eps_km=0.8, min_samples=3)
    assert res["status"] == "success"
    assert res["total_bins_analyzed"] == 4
    assert res["hotspots_count"] >= 1
    hs = res["hotspots"][0]
    assert hs["affected_bins"] == 4
    assert hs["severity"] in ["HIGH", "CRITICAL"]
    assert hs["trend"] in ["EMERGING", "PERSISTENT"]
    assert len(hs["recommendation"]) > 0

# 3. Multiple spatial clusters
def test_multiple_spatial_clusters():
    # Cluster 1 around Navrangpura (23.03, 72.58)
    cluster1 = [
        {"bin_id": f"B1-{i}", "latitude": 23.030 + i * 0.001, "longitude": 72.580 + i * 0.001, "total_waste_kg": 120.0, "baseline_waste_kg": 80.0, "fill_percentage": 75.0}
        for i in range(4)
    ]
    # Cluster 2 far away in Maninagar (22.99, 72.60) ~ 5 km away
    cluster2 = [
        {"bin_id": f"B2-{i}", "latitude": 22.990 + i * 0.001, "longitude": 72.600 + i * 0.001, "total_waste_kg": 130.0, "baseline_waste_kg": 85.0, "fill_percentage": 78.0}
        for i in range(4)
    ]
    res = detect_waste_hotspots(data=cluster1 + cluster2, eps_km=0.6, min_samples=3)
    assert res["hotspots_count"] == 2
    assert res["hotspots"][0]["hotspot_id"] == "HS-001"
    assert res["hotspots"][1]["hotspot_id"] == "HS-002"

# 4. No detectable hotspots (uniform low baseline waste, low fill)
def test_no_detectable_hotspots_low_fill():
    # Bins widely scattered with zero overflow and low fill
    scattered_data = [
        {"bin_id": f"B-SC-{i}", "latitude": 23.00 + i * 0.08, "longitude": 72.50 + i * 0.08, "total_waste_kg": 30.0, "baseline_waste_kg": 50.0, "fill_percentage": 25.0, "overflow_count": 0, "anomaly_count": 0}
        for i in range(4)
    ]
    res = detect_waste_hotspots(data=scattered_data, eps_km=0.5, min_samples=3)
    # Since scattered points are farther than eps and have low fill, no dense clusters or noise spikes formed
    assert res["hotspots_count"] == 0

# 5. Missing coordinates handling
def test_missing_coordinates():
    invalid_data = [
        {"bin_id": "AMD-BIN-1", "latitude": None, "longitude": 72.58, "total_waste_kg": 100.0},
        {"bin_id": "AMD-BIN-2", "latitude": "invalid", "longitude": "bad", "total_waste_kg": 100.0},
        {"bin_id": "AMD-BIN-3", "latitude": 23.030, "longitude": 72.580, "total_waste_kg": 100.0},
        {"bin_id": "AMD-BIN-4", "latitude": 23.031, "longitude": 72.581, "total_waste_kg": 100.0},
        {"bin_id": "AMD-BIN-5", "latitude": 23.032, "longitude": 72.582, "total_waste_kg": 100.0},
    ]
    res = detect_waste_hotspots(data=invalid_data, eps_km=0.8, min_samples=3)
    # The 2 invalid coordinates are dropped, remaining 3 form a valid cluster
    assert res["total_bins_analyzed"] == 3
    assert res["hotspots_count"] == 1

# 6. Missing waste values imputation
def test_missing_waste_values():
    data = [
        {"bin_id": "B-1", "latitude": 23.030, "longitude": 72.580, "total_waste_kg": None, "fill_percentage": None},
        {"bin_id": "B-2", "latitude": 23.031, "longitude": 72.581, "total_waste_kg": None, "fill_percentage": None},
        {"bin_id": "B-3", "latitude": 23.032, "longitude": 72.582, "total_waste_kg": None, "fill_percentage": None},
    ]
    res = detect_waste_hotspots(data=data, eps_km=0.8, min_samples=3)
    assert res["status"] == "success"
    assert res["total_bins_analyzed"] == 3
    assert res["hotspots"][0]["waste_generation_kg"] > 0
    assert res["hotspots"][0]["average_fill_percent"] > 0

# 7. Duplicate records deduplication
def test_duplicate_records():
    dup_data = [
        {"bin_id": "B-DUP-1", "latitude": 23.030, "longitude": 72.580, "total_waste_kg": 100.0},
        {"bin_id": "B-DUP-1", "latitude": 23.030, "longitude": 72.580, "total_waste_kg": 100.0}, # duplicate
        {"bin_id": "B-DUP-2", "latitude": 23.031, "longitude": 72.581, "total_waste_kg": 100.0},
        {"bin_id": "B-DUP-3", "latitude": 23.032, "longitude": 72.582, "total_waste_kg": 100.0},
    ]
    res = detect_waste_hotspots(data=dup_data, eps_km=0.8, min_samples=3)
    assert res["total_bins_analyzed"] == 3

# 8. Very small dataset (< min_samples)
def test_very_small_dataset():
    tiny_data = [
        {"bin_id": "B-TINY-1", "latitude": 23.030, "longitude": 72.580, "total_waste_kg": 40.0, "fill_percentage": 30.0}
    ]
    res = detect_waste_hotspots(data=tiny_data, eps_km=0.8, min_samples=3)
    assert res["status"] == "success"
    assert res["total_bins_analyzed"] == 1
    # 1 quiet point with low fill doesn't create a false hotspot
    assert res["hotspots_count"] == 0

# 9. API response schema validation
def test_api_hotspots_endpoint_schema():
    payload = {
        "eps_km": 0.8,
        "min_samples": 3,
        "include_forecast": True,
        "bins": [
            {"bin_id": "AMD-B-101", "latitude": 23.030, "longitude": 72.580, "total_waste_kg": 180.0, "baseline_waste_kg": 100.0, "fill_percentage": 88.0, "overflow_count": 2, "anomaly_count": 1},
            {"bin_id": "AMD-B-102", "latitude": 23.031, "longitude": 72.581, "total_waste_kg": 190.0, "baseline_waste_kg": 105.0, "fill_percentage": 92.0, "overflow_count": 1, "anomaly_count": 1},
            {"bin_id": "AMD-B-103", "latitude": 23.032, "longitude": 72.582, "total_waste_kg": 175.0, "baseline_waste_kg": 100.0, "fill_percentage": 85.0, "overflow_count": 0, "anomaly_count": 0},
        ]
    }
    response = client.post("/predict/hotspots", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_bins_analyzed"] == 3
    assert data["hotspots_count"] >= 1
    hs = data["hotspots"][0]
    required_keys = [
        "hotspot_id", "latitude", "longitude", "severity", "affected_bins",
        "affected_zones", "waste_generation_kg", "baseline_waste_kg",
        "deviation_percent", "average_fill_percent", "overflow_events",
        "anomaly_events", "trend", "recommendation"
    ]
    for key in required_keys:
        assert key in hs, f"Missing required key: {key}"

# 10. Model / Function reload test
def test_model_function_reload():
    import src.hotspots.detector as hd
    importlib.reload(hd)
    new_detector = hd.WasteHotspotDetector()
    res = new_detector.detect(data=[])
    assert res["status"] == "success"

# 11. Health endpoint test
def test_hotspots_health_endpoint():
    res = client.get("/hotspots/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["subsystem"] == "waste_hotspot_detection"
    assert data["algorithm"] == "DBSCAN (Haversine)"

# 12. Main Health endpoint active subsystems test
def test_main_health_includes_hotspots():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["subsystems"]["waste_hotspot_detection"] == "active"
