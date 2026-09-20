"""SmartBinX Phase 3 Comprehensive Frontend-Backend Contract Verification Suite.

Tests all 12 operational API calls made by the React frontend (frontend/src/services/api.js)
against the FastAPI backend to verify 100% contract compliance and zero fallback.
"""

import io
import sys
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

def run_phase3_verification():
    client = TestClient(app)
    print("================================================================================")
    print("SmartBinX Phase 3: Comprehensive Frontend-to-Backend Contract Verification Suite")
    print("================================================================================\n")

    # Authenticate client with canonical municipal admin credentials
    login_res = client.post("/api/auth/login", json={
        "email_or_username": "amc-admin@ahmedabadcity.gov.in",
        "password": "8821"
    })
    assert login_res.status_code == 200, f"Auth login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    print("[Auth] Successfully authenticated TestClient with signed JWT Bearer token.\n")

    passed_tests = 0
    total_tests = 13

    # 1. GET /api/bins (All smart bins)
    res = client.get("/api/bins")
    print(f"[Test 1/13] GET /api/bins: HTTP {res.status_code}")
    assert res.status_code == 200
    bins = res.json()
    assert len(bins) >= 120, f"Expected >= 120 bins, got {len(bins)}"
    assert "bin_code" in bins[0]
    assert "fill_percentage" in bins[0]
    assert "priority_score" in bins[0]
    print(f"  -> Verified {len(bins)} smart bins. Sample: {bins[0]['bin_code']} ({bins[0]['fill_percentage']}%)")
    passed_tests += 1

    # 2. GET /api/bins/{bin_code} (Single bin metadata)
    res = client.get("/api/bins/AHM-104")
    print(f"\n[Test 2/13] GET /api/bins/AHM-104: HTTP {res.status_code}")
    assert res.status_code == 200
    bin_data = res.json()
    assert bin_data["bin_code"] == "AHM-104"
    assert "waste_stream" in bin_data
    print(f"  -> Verified bin: {bin_data['bin_code']} in {bin_data['zone']}, stream={bin_data['waste_stream']}")
    passed_tests += 1

    # 3. GET /api/bin-readings/{bin_code} (Telemetry time-series)
    res = client.get("/api/bin-readings/AHM-104")
    print(f"\n[Test 3/13] GET /api/bin-readings/AHM-104: HTTP {res.status_code}")
    assert res.status_code == 200
    readings = res.json()
    assert isinstance(readings, list) and len(readings) > 0
    assert "fill_percentage" in readings[0] or "fill" in readings[0]
    print(f"  -> Verified {len(readings)} telemetry time-series readings for AHM-104")
    passed_tests += 1

    # 4. POST /api/waste/classify (JSON preset)
    res = client.post("/api/waste/classify", json={"stream": "Plastic", "sampleId": "sample-01"})
    print(f"\n[Test 4/13] POST /api/waste/classify (JSON): HTTP {res.status_code}")
    assert res.status_code == 200
    w_json = res.json()
    assert "plastic" in w_json
    assert "organic" in w_json
    assert "purity_score" in w_json
    assert "contamination_level" in w_json
    print(f"  -> Material: Plastic={w_json['plastic']}%, Purity={w_json['purity_score']}, Level='{w_json['contamination_level']}'")
    passed_tests += 1

    # 5. POST /api/waste/classify (Multipart image upload)
    img = Image.new("RGB", (224, 224), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    files = {"file": ("test.jpg", buf.getvalue(), "image/jpeg")}
    res = client.post("/api/waste/classify", files=files)
    print(f"\n[Test 5/13] POST /api/waste/classify (Multipart Image): HTTP {res.status_code}")
    assert res.status_code == 200
    w_img = res.json()
    assert "dominant_material" in w_img
    assert w_img["source"] == "AI Detected from Image"
    print(f"  -> PyTorch MobileNetV2 Output: Dominant='{w_img['dominant_material']}', Confidence={w_img['confidence_pct']}%")
    passed_tests += 1

    # 6. GET /api/vehicles (Fleet roster)
    res = client.get("/api/vehicles")
    print(f"\n[Test 6/13] GET /api/vehicles: HTTP {res.status_code}")
    assert res.status_code == 200
    vehicles = res.json()
    assert len(vehicles) >= 12
    assert "vehicle_code" in vehicles[0]
    assert "capacity_kg" in vehicles[0]
    print(f"  -> Verified {len(vehicles)} collection vehicles in fleet")
    passed_tests += 1

    # 7. GET /api/vehicles/best-for-bin/{bin_code} (Best vehicle dispatch match)
    res = client.get("/api/vehicles/best-for-bin/AHM-104")
    print(f"\n[Test 7/13] GET /api/vehicles/best-for-bin/AHM-104: HTTP {res.status_code}")
    assert res.status_code == 200
    match = res.json()
    assert "best_vehicle" in match
    assert "vehicle_code" in match["best_vehicle"]
    assert "distance_km" in match["best_vehicle"]
    assert "recommendation_summary" in match
    print(f"  -> Recommended: {match['best_vehicle']['vehicle_code']} ({match['best_vehicle']['distance_km']} km away)")
    passed_tests += 1

    # 8. POST /api/routes/optimize (CVRP Route Optimizer)
    res = client.post("/api/routes/optimize", json={"vehicle_id": "V-01"})
    print(f"\n[Test 8/13] POST /api/routes/optimize (V-01): HTTP {res.status_code}")
    assert res.status_code == 200
    route = res.json()
    assert "polyline_coords" in route and len(route["polyline_coords"]) >= 3
    assert "stops" in route and len(route["stops"]) >= 3
    assert route["stops"][0]["is_depot"] is True
    assert route["stops"][-1]["is_mrf"] is True
    assert route["color"] == "#16845B"
    assert "distance_km" in route
    assert "duration_minutes" in route
    print(f"  -> V-01 Route: {len(route['stops'])} stops, dist={route['distance_km']} km, color={route['color']}")
    passed_tests += 1

    # 9. POST /api/routes/replan (Emergency Route Dynamic Insertion)
    res = client.post("/api/routes/replan", json={"vehicle_id": "V-01", "urgent_bin": "AHM-156"})
    print(f"\n[Test 9/13] POST /api/routes/replan: HTTP {res.status_code}")
    assert res.status_code == 200
    replan = res.json()
    assert replan["is_replanned"] is True
    assert replan["inserted_bin"] == "AHM-156"
    assert "polyline_coords" in replan
    assert "stops" in replan
    assert "delta_distance_km" in replan
    print(f"  -> Dynamic Replan: inserted {replan['inserted_bin']}, delta={replan['delta_distance_km']} km, status='{replan['overflow_risk_status']}'")
    passed_tests += 1

    # 10. GET /api/analytics (Municipal Overview)
    res = client.get("/api/analytics")
    print(f"\n[Test 10/13] GET /api/analytics: HTTP {res.status_code}")
    assert res.status_code == 200
    analytics = res.json()
    for k in ["total_waste_collected_tonnes", "potentially_recoverable_tonnes", "landfill_diversion_percentage", "stream_breakdown", "purity_scores"]:
        assert k in analytics
    print(f"  -> Analytics: {analytics['total_waste_collected_tonnes']} tonnes, Diversion: {analytics['landfill_diversion_percentage']}%")
    passed_tests += 1

    # 11. GET /api/zones (10 Ahmedabad Zones)
    res = client.get("/api/zones")
    print(f"\n[Test 11/13] GET /api/zones: HTTP {res.status_code}")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) >= 10
    assert "name" in zones[0]
    assert "center_lat" in zones[0]
    assert "center_lng" in zones[0]
    print(f"  -> Verified {len(zones)} Ahmedabad zones")
    passed_tests += 1

    # 12. POST /api/simulation (What-If Simulation)
    res = client.post("/api/simulation", json={"vehicles_count": 3, "generation_surge_pct": 20.0, "traffic_factor": "Heavy"})
    print(f"\n[Test 12/13] POST /api/simulation: HTTP {res.status_code}")
    assert res.status_code == 200
    sim = res.json()
    for k in ["distance_km", "overflow_risk_pct", "fleet_utilization_pct", "uncollected_bins", "fuel_liters"]:
        assert k in sim
    print(f"  -> Simulation: dist={sim['distance_km']} km, overflow={sim['overflow_risk_pct']}%, util={sim['fleet_utilization_pct']}%")
    passed_tests += 1

    # 13. POST /api/ai/query (AI Decision Support Assistant)
    res = client.post("/api/ai/query", json={"prompt": "Which bins need immediate collection?", "context": {}})
    print(f"\n[Test 13/13] POST /api/ai/query: HTTP {res.status_code}")
    assert res.status_code == 200
    ai = res.json()
    assert "answer" in ai
    assert "cards" in ai and len(ai["cards"]) > 0
    assert "data" in ai["cards"][0]
    assert "suggested_actions" in ai
    safe_ans = ai["answer"][:60].encode("ascii", "ignore").decode("ascii")
    print(f"  -> AI Copilot: {safe_ans}... ({len(ai['cards'])} cards, {len(ai['suggested_actions'])} actions)")
    passed_tests += 1

    print("\n================================================================================")
    print(f"PHASE 3 CONTRACT VERIFICATION COMPLETE: {passed_tests}/{total_tests} TESTS PASSED (100%)")
    print("================================================================================")

if __name__ == "__main__":
    run_phase3_verification()
