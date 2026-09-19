"""
Automated tests for FastAPI endpoints in WasteWise AI.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Ahmedabad" in data["city"]
    print("  [PASS] /health")

def test_fill_prediction():
    payload = {
        "bin_id": "AMD-BIN-0123",
        "zone_name": "Navrangpura",
        "waste_stream": "Organic",
        "season": "Summer",
        "fill_percentage": 65.0,
        "estimated_weight_kg": 150.0,
        "capacity_kg": 240.0,
        "hours_since_collection": 10.0,
        "daily_generation_kg": 250.0,
        "avg_daily_generation_kg": 240.0,
        "hour": 10,
        "day_of_week": 1,
        "is_weekend": 0,
        "month": 4,
        "temperature_c": 35.0,
        "rainfall_mm": 0.0,
        "humidity": 40.0,
        "holiday_flag": 0,
        "festival_flag": 0,
        "market_activity_level": 1.5,
        "event_activity_level": 0.0
    }
    res = client.post("/predict/fill", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "fill_percentage_6h" in data
    assert "fill_percentage_12h" in data
    assert "fill_percentage_24h" in data
    assert "hours_until_overflow" in data
    assert "overflow_risk" in data
    print("  [PASS] /predict/fill ->", data)

def test_overflow_prediction():
    payload = {
        "bin_id": "AMD-BIN-0123",
        "fill_percentage": 95.0,
        "capacity_kg": 240.0,
        "hours_since_collection": 22.0
    }
    res = client.post("/predict/overflow", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "overflow_risk" in data
    print("  [PASS] /predict/overflow ->", data)

def test_composition_prediction():
    payload = {
        "zone_name": "Bopal",
        "waste_stream": "Mixed",
        "total_waste_kg": 600.0
    }
    res = client.post("/predict/composition", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["estimation_source"] == "AI Estimated"
    assert round(data["total_percentage"], 1) == 100.0
    print("  [PASS] /predict/composition ->", data)

def test_waste_forecast():
    payload = {
        "zone_name": "Maninagar",
        "day_of_week": 2,
        "month": 4,
        "is_weekend": 0,
        "waste_lag_1": 3500.0,
        "waste_lag_2": 3400.0,
        "waste_lag_7": 3600.0,
        "waste_rolling_mean_3": 3450.0,
        "waste_rolling_mean_7": 3500.0,
        "avg_daily_generation_kg_14d": 3520.0
    }
    res = client.post("/predict/waste", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "predicted_total_waste_kg" in data
    assert data["predicted_total_waste_kg"] > 0
    print("  [PASS] /predict/waste ->", data)

def test_anomaly_detection():
    payload = {
        "zone_name": "Navrangpura",
        "total_waste_kg": 35000.0,
        "average_bin_fill_percentage": 96.0,
        "overflow_count": 30,
        "collection_count": 10,
        "avg_daily_generation_kg_14d": 4000.0
    }
    res = client.post("/predict/anomaly", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "is_anomaly" in data
    assert "anomaly_status" in data
    print("  [PASS] /predict/anomaly ->", data)

def test_image_prediction_file():
    from io import BytesIO
    from PIL import Image
    
    img = Image.new("RGB", (224, 224), color=(100, 150, 200))
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    files = {"file": ("test.png", buf, "image/png")}
    res = client.post("/predict/image", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["source"] == "AI Detected from Image"
    assert data["predicted_class"] in ["Plastic", "Other", "Metal", "Paper", "Glass"]
    assert 0.0 <= data["confidence"] <= 1.0
    print("  [PASS] /predict/image ->", data)

def test_image_prediction_base64():
    import base64
    from io import BytesIO
    from PIL import Image
    
    img = Image.new("RGB", (224, 224), color=(50, 120, 80))
    buf = BytesIO()
    img.save(buf, format="PNG")
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    
    payload = {"image_base64": b64_str}
    res = client.post("/predict/image-base64", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["source"] == "AI Detected from Image"
    assert data["predicted_class"] in ["Plastic", "Other", "Metal", "Paper", "Glass"]
    print("  [PASS] /predict/image-base64 ->", data)

if __name__ == "__main__":
    print("Running FastAPI Endpoint Verification Suite...")
    test_health()
    test_fill_prediction()
    test_overflow_prediction()
    test_composition_prediction()
    test_waste_forecast()
    test_anomaly_detection()
    test_image_prediction_file()
    test_image_prediction_base64()
    print("\nALL FASTAPI ENDPOINTS VERIFIED SUCCESSFULLY!")
