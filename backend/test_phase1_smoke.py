"""
SmartBinX Phase 1 Smoke Test Suite.
Tests all endpoints bridging FastAPI Backend with Machine Learning Subsystems.
"""
import io
import json
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

def run_smoke_tests():
    print("=======================================================")
    print("SMARTBINX PHASE 1: END-TO-END SMOKE TEST SUITE")
    print("=======================================================\n")
    
    client = TestClient(app)
    
    # 1. System Health Check
    print("1. Testing GET /health...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("   [PASS] Health Status:", res.json())
    
    # 2. Prediction Engine ML Endpoint
    print("\n2. Testing GET /api/predictions/AHM-104...")
    res = client.get("/api/predictions/AHM-104")
    assert res.status_code == 200, f"Prediction failed: {res.text}"
    pred_data = res.json()
    print("   [PASS] Prediction Response:")
    print("          Bin Code:", pred_data.get("bin_code"))
    print("          Current Fill:", pred_data.get("current_fill_pct"), "%")
    print("          6h Forecast:", pred_data.get("fill_6h"), "%")
    print("          12h Forecast:", pred_data.get("fill_12h"), "%")
    print("          24h Forecast:", pred_data.get("fill_24h"), "%")
    print("          Model Type:", pred_data.get("model_type"))
    print("          Confidence:", pred_data.get("confidence_pct"), "%")
    
    # 3. Overflow Countdown Endpoint
    print("\n3. Testing GET /api/predictions/AHM-104/countdown...")
    res = client.get("/api/predictions/AHM-104/countdown")
    assert res.status_code == 200, f"Countdown failed: {res.text}"
    cd_data = res.json()
    print("   [PASS] Countdown Response:")
    print("          Formatted:", cd_data.get("formatted_countdown"))
    print("          Hours Remaining:", cd_data.get("hours_remaining"), "h")
    print("          Severity Tag:", cd_data.get("severity"))
    
    # 4. Waste Composition ML Estimation Endpoint
    print("\n4. Testing GET /api/waste/composition/AHM-118...")
    res = client.get("/api/waste/composition/AHM-118")
    assert res.status_code == 200, f"Waste composition failed: {res.text}"
    comp_data = res.json()
    print("   [PASS] Composition Response:")
    print("          Source:", comp_data.get("source"))
    print("          Dominant Material:", comp_data.get("dominant_material"))
    print("          Purity Score:", comp_data.get("recycling_purity_score"))
    print("          Fractions:", json.dumps(comp_data.get("composition")))
    
    # 5. Waste Vision Image Classifier Endpoint
    print("\n5. Testing POST /api/waste/classify with synthetic image...")
    img = Image.new("RGB", (224, 224), color=(50, 180, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    
    files = {"file": ("test_sample.jpg", buf, "image/jpeg")}
    res = client.post("/api/waste/classify?bin_code=AHM-TEST", files=files)
    assert res.status_code == 200, f"Waste classification failed: {res.text}"
    vision_data = res.json()
    print("   [PASS] Waste Vision Response:")
    print("          Source:", vision_data.get("source"))
    print("          Detected Category:", vision_data.get("dominant_material"))
    print("          Confidence:", vision_data.get("confidence_pct"), "%")
    print("          Recycling Purity Score:", vision_data.get("recycling_purity_score"))
    print("          Is Contaminated:", vision_data.get("is_contaminated"))
    
    # 6. Zonal Anomaly Detection Endpoint
    print("\n6. Testing GET /api/analytics/anomalies...")
    res = client.get("/api/analytics/anomalies")
    assert res.status_code == 200, f"Anomalies check failed: {res.text}"
    anom_data = res.json()
    print(f"   [PASS] Zonal Anomalies Detected: {len(anom_data)} zones")
    if anom_data:
        top = anom_data[0]
        print(f"          Top Hotspot: {top.get('zone_name')} (+{top.get('increase_pct')}%)")
        print(f"          ML Status: {top.get('ml_anomaly_status')} (Score: {top.get('ml_anomaly_score')})")
        print(f"          Severity: {top.get('severity')}")
    
    print("\n=======================================================")
    print("ALL PHASE 1 SMOKE TESTS PASSED SUCCESSFULLY! (6/6)")
    print("=======================================================\n")

if __name__ == "__main__":
    run_smoke_tests()
