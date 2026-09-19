"""Smoke test for Phase 3 Step 3: Route & GIS Format Harmonization."""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

def run_tests():
    client = TestClient(app)
    print("Testing Phase 3 Step 3 Route & GIS Format Harmonization...\n")

    # 1. POST /api/routes/optimize for V-01 (Sabarmati Heavy Compactor)
    res_v1 = client.post("/api/routes/optimize", json={"vehicle_id": "V-01"})
    print(f"1. POST /api/routes/optimize (V-01): status={res_v1.status_code}")
    assert res_v1.status_code == 200
    r1 = res_v1.json()
    assert r1["vehicle_id"] == "V-01"
    assert r1["color"] == "#16845B"
    assert "polyline_coords" in r1 and len(r1["polyline_coords"]) >= 3
    assert "stops" in r1 and len(r1["stops"]) >= 3
    assert r1["stops"][0]["is_depot"] is True
    assert r1["stops"][-1]["is_mrf"] is True
    assert "distance_km" in r1
    assert "duration_minutes" in r1
    print(f"   -> V-01: {len(r1['stops'])} stops, {len(r1['polyline_coords'])} polyline points, dist={r1['distance_km']} km, color={r1['color']}")

    # 2. POST /api/routes/optimize for V-02 (Navrangpura Electric Tipper)
    res_v2 = client.post("/api/routes/optimize", json={"vehicle_id": "V-02"})
    print(f"\n2. POST /api/routes/optimize (V-02): status={res_v2.status_code}")
    assert res_v2.status_code == 200
    r2 = res_v2.json()
    assert r2["vehicle_id"] == "V-02"
    assert r2["color"] == "#2878C8"
    assert "polyline_coords" in r2
    assert "stops" in r2
    print(f"   -> V-02: {len(r2['stops'])} stops, dist={r2['distance_km']} km, color={r2['color']}")

    # 3. POST /api/routes/optimize for V-03 (Vastrapur Standard Tipper)
    res_v3 = client.post("/api/routes/optimize", json={"vehicle_id": "V-03"})
    print(f"\n3. POST /api/routes/optimize (V-03): status={res_v3.status_code}")
    assert res_v3.status_code == 200
    r3 = res_v3.json()
    assert r3["vehicle_id"] == "V-03"
    assert r3["color"] == "#E89A27"
    assert "polyline_coords" in r3
    assert "stops" in r3
    print(f"   -> V-03: {len(r3['stops'])} stops, dist={r3['distance_km']} km, color={r3['color']}")

    # 4. POST /api/routes/replan (Emergency dynamic insertion of AHM-156)
    replan_payload = {
        "vehicle_id": "V-01",
        "urgent_bin": "AHM-156"
    }
    res_replan = client.post("/api/routes/replan", json=replan_payload)
    print(f"\n4. POST /api/routes/replan: status={res_replan.status_code}")
    assert res_replan.status_code == 200
    rep = res_replan.json()
    assert rep["is_replanned"] is True
    assert rep["inserted_bin"] == "AHM-156"
    assert "polyline_coords" in rep
    assert "stops" in rep
    assert "new_distance_km" in rep
    assert "delta_distance_km" in rep
    # Verify AHM-156 is in stops
    inserted_stop = next((s for s in rep["stops"] if "AHM-156" in s["bin_code"]), None)
    assert inserted_stop is not None
    print(f"   -> Replan: inserted {rep['inserted_bin']}, delta={rep['delta_distance_km']} km, status='{rep['overflow_risk_status']}'")

    # 5. GET /api/routes/active
    res_active = client.get("/api/routes/active")
    print(f"\n5. GET /api/routes/active: status={res_active.status_code}")
    assert res_active.status_code == 200
    active_routes = res_active.json()
    assert isinstance(active_routes, list)
    print(f"   -> Found {len(active_routes)} active routes in fleet")

    print("\nALL STEP 3 TESTS PASSED! [5/5]")

if __name__ == "__main__":
    run_tests()
