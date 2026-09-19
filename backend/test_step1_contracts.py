"""Smoke test for Phase 3 Step 1: Endpoint & Path Alignment."""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

def run_tests():
    client = TestClient(app)
    print("Testing Phase 3 Step 1 Contract Alignment...\n")

    # 1. GET /api/zones
    res_zones = client.get("/api/zones")
    print(f"1. GET /api/zones: status={res_zones.status_code}")
    assert res_zones.status_code == 200
    zones = res_zones.json()
    assert len(zones) >= 7
    print(f"   -> Found {len(zones)} Ahmedabad zones. Sample: {zones[0]['name']}")

    # 2. GET /api/analytics
    res_analytics = client.get("/api/analytics")
    print(f"\n2. GET /api/analytics: status={res_analytics.status_code}")
    assert res_analytics.status_code == 200
    analytics = res_analytics.json()
    expected_keys = [
        "total_waste_collected_tonnes",
        "potentially_recoverable_tonnes",
        "landfill_diversion_percentage",
        "stream_breakdown",
        "purity_scores",
        "co2e_emissions_avoided_kg",
        "fuel_saved_liters",
        "distance_optimized_km",
    ]
    for k in expected_keys:
        assert k in analytics, f"Missing key {k} in analytics summary"
    print(f"   -> Summary: {analytics['total_waste_collected_tonnes']} tonnes, diversion: {analytics['landfill_diversion_percentage']}%")

    # 3. POST /api/simulation (Root alias & frontend parameters)
    sim_payload = {
        "vehicles_count": 3,
        "generation_surge_pct": 25.0,
        "traffic_factor": "Heavy",
    }
    res_sim = client.post("/api/simulation", json=sim_payload)
    print(f"\n3. POST /api/simulation: status={res_sim.status_code}")
    assert res_sim.status_code == 200
    sim = res_sim.json()
    assert "distance_km" in sim
    assert "overflow_risk_pct" in sim
    assert "fleet_utilization_pct" in sim
    assert "uncollected_bins" in sim
    assert "fuel_liters" in sim
    assert "scenario_summary" in sim
    print(f"   -> Sim Result: dist={sim['distance_km']} km, overflow={sim['overflow_risk_pct']}%, fleet_util={sim['fleet_utilization_pct']}%")

    # 4. GET /api/bin-readings/{bin_code}
    res_readings = client.get("/api/bin-readings/AHM-104")
    print(f"\n4. GET /api/bin-readings/AHM-104: status={res_readings.status_code}")
    assert res_readings.status_code == 200
    readings = res_readings.json()
    assert isinstance(readings, list)
    print(f"   -> Received {len(readings)} telemetry readings for AHM-104")

    # 5. GET /api/vehicles/best-for-bin/{bin_code}
    res_veh = client.get("/api/vehicles/best-for-bin/AHM-104")
    print(f"\n5. GET /api/vehicles/best-for-bin/AHM-104: status={res_veh.status_code}")
    assert res_veh.status_code == 200
    veh = res_veh.json()
    assert "best_vehicle" in veh
    assert "recommendation_summary" in veh
    assert "vehicle_code" in veh["best_vehicle"]
    print(f"   -> Best vehicle: {veh['best_vehicle']['vehicle_code']}, dist={veh['best_vehicle']['distance_km']} km")

    print("\nALL STEP 1 TESTS PASSED! [5/5]")

if __name__ == "__main__":
    run_tests()
