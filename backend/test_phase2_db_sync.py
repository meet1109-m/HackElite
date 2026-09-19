"""
SmartBinX Phase 2 End-to-End Database Sync & Persistence Test Suite.
Tests:
1. Startup Hydration: DataStore loads exact persisted state from SQLite.
2. Mutation Write-Through: Route replanning persists to SQLite `routes`.
3. Collection Audit: Bin collection creates record in `collections` and resets bin.
4. Telemetry & Prediction Logging: Audit rows in `bin_readings` and `predictions`.
5. Foreign Key & Integrity Check: PRAGMA foreign_key_check passes with 0 errors.
"""
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.data_store import DataStore
from app.models.entities import (
    Bin as DBBin,
    Route as DBRoute,
    Collection as DBCollection,
    Prediction as DBPrediction,
    BinReading as DBBinReading,
)

def run_phase2_verification():
    print("=================================================================")
    print("SMARTBINX PHASE 2: DATABASE LAYER & STATE SYNC TEST SUITE")
    print("=================================================================\n")

    client = TestClient(app)
    db = SessionLocal()

    # -----------------------------------------------------------------
    # Test 1: Startup Hydration & State Preservation
    # -----------------------------------------------------------------
    print("1. Testing Startup Hydration from SQLite (smartbinx.db)...")
    fresh_store = DataStore()
    hydrated = fresh_store.load_from_database(db)
    assert hydrated is True, "Failed to hydrate DataStore from SQLite!"
    assert len(fresh_store.bins) == 125, f"Expected 125 bins, got {len(fresh_store.bins)}"
    assert len(fresh_store.zones) == 10, f"Expected 10 zones, got {len(fresh_store.zones)}"
    assert len(fresh_store.vehicles) == 12, f"Expected 12 vehicles, got {len(fresh_store.vehicles)}"
    
    # Check pinned demo bin preservation
    b104 = fresh_store.get_bin("AHM-104")
    assert b104 is not None, "AHM-104 not found in hydrated store!"
    assert "priority_breakdown" in b104, "XAI priority breakdown missing in hydrated bin!"
    print(f"   [PASS] Hydrated 125 bins, 10 zones, 12 vehicles from SQLite.")
    print(f"          AHM-104 preserved with XAI breakdown ({b104['priority_score']} priority pts).")

    # -----------------------------------------------------------------
    # Test 2: Mutation Write-Through: Dynamic Route Replanning
    # -----------------------------------------------------------------
    print("\n2. Testing Write-Through Mutation: Route Replanning (POST /api/routes/replan)...")
    replan_res = client.post("/api/routes/replan", json={
        "route_id": "route-01",
        "emergency_bin_code": "AHM-156"
    })
    assert replan_res.status_code == 200, f"Replan failed: {replan_res.text}"
    replanned = replan_res.json()["replanned_route"]
    route_id = replanned["route_id"]

    # Verify in SQLite
    db_route = db.query(DBRoute).filter(DBRoute.id == route_id).first()
    assert db_route is not None, "Replanned route was not written to SQLite!"
    assert "AHM-156" in db_route.waypoints_json, "Emergency stop AHM-156 missing in SQLite waypoints_json!"
    print(f"   [PASS] Route {route_id} replanned and committed to SQLite 'routes' table.")
    print(f"          Distance: {db_route.distance_km} km | Utilization: {db_route.utilization_pct}%")

    # -----------------------------------------------------------------
    # Test 3: Collection Audit & Bin State Reset
    # -----------------------------------------------------------------
    print("\n3. Testing Collection Audit & State Reset (POST /api/bins/AHM-118/collect)...")
    collect_res = client.post("/api/bins/AHM-118/collect?vehicle_code=V-01")
    assert collect_res.status_code == 200, f"Collection failed: {collect_res.text}"
    col_data = collect_res.json()
    col_id = col_data["collection_id"]

    # Verify in SQLite collections
    db_col = db.query(DBCollection).filter(DBCollection.id == col_id).first()
    assert db_col is not None, "Collection audit record was not found in SQLite collections table!"
    print(f"   [PASS] Collection audit created in SQLite 'collections' (ID: {col_id}, Weight: {db_col.weight_collected} kg).")

    # Verify bin reset in SQLite
    db_bin = db.query(DBBin).filter(DBBin.bin_code == "AHM-118").first()
    assert db_bin.fill_percentage == 0.0, f"Expected 0.0% fill, got {db_bin.fill_percentage}%"
    assert db_bin.status == "Healthy", f"Expected Healthy status, got {db_bin.status}"
    print(f"   [PASS] Bin AHM-118 reset in SQLite: Fill = {db_bin.fill_percentage}%, Status = {db_bin.status}, Last Collection = '{db_bin.last_collection}'.")

    # -----------------------------------------------------------------
    # Test 4: Time-Series Telemetry & Prediction Logging
    # -----------------------------------------------------------------
    print("\n4. Testing Telemetry & Prediction Logging...")
    # Log prediction
    pred_res = client.get("/api/predictions/AHM-104")
    assert pred_res.status_code == 200
    db_pred = db.query(DBPrediction).filter(DBPrediction.bin_code == "AHM-104").order_by(DBPrediction.prediction_time.desc()).first()
    assert db_pred is not None, "Prediction was not logged to SQLite!"
    print(f"   [PASS] Prediction logged to SQLite: 6h = {db_pred.fill_6h}%, 12h = {db_pred.fill_12h}%, 24h = {db_pred.fill_24h}%")

    # Log telemetry
    tel_res = client.post("/api/bins/AHM-104/telemetry?fill_percentage=75.5&weight=28.4")
    assert tel_res.status_code == 200
    tel_data = tel_res.json()
    db_tel = db.query(DBBinReading).filter(DBBinReading.id == tel_data["reading_id"]).first()
    assert db_tel is not None, "Telemetry reading was not found in SQLite bin_readings!"
    print(f"   [PASS] Telemetry sensor tick logged to SQLite 'bin_readings' (Fill: {db_tel.fill_percentage}%, Weight: {db_tel.weight} kg).")

    # -----------------------------------------------------------------
    # Test 5: Foreign Key Integrity & Cleanliness
    # -----------------------------------------------------------------
    print("\n5. Testing Foreign Key & Constraint Integrity...")
    raw_conn = db.get_bind().raw_connection()
    cur = raw_conn.cursor()
    cur.execute("PRAGMA foreign_key_check")
    fk_violations = cur.fetchall()
    assert len(fk_violations) == 0, f"Foreign key constraint violations detected: {fk_violations}"
    print("   [PASS] PRAGMA foreign_key_check returned 0 violations across all 9 tables.")

    db.close()
    print("\n=================================================================")
    print("ALL PHASE 2 VERIFICATION SCENARIOS PASSED SUCCESSFULLY! (5/5)")
    print("=================================================================\n")

if __name__ == "__main__":
    run_phase2_verification()
