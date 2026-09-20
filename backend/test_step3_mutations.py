"""
Test Step 3: Write-Through Persistence for Operational Mutations.
Verifies:
1. Route replanning persists to SQLite `routes` table.
2. Bin collection creates audit record in SQLite `collections` table and resets bin in DB and in-memory.
"""
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.config import settings
from app.models.entities import Route as DBRoute, Collection as DBCollection, Bin as DBBin

def test_mutations():
    client = TestClient(app)
    client.headers["X-API-Key"] = settings.MUNICIPAL_API_KEY
    db = SessionLocal()
    
    print("=======================================================")
    print("STEP 3 VERIFICATION: WRITE-THROUGH MUTATION PERSISTENCE")
    print("=======================================================\n")
    
    # 1. Test Dynamic Route Replanning with Emergency Bin AHM-156
    print("1. Testing POST /api/routes/replan (Emergency Bin AHM-156)...")
    replan_payload = {
        "route_id": "route-01",
        "emergency_bin_code": "AHM-156"
    }
    res = client.post("/api/routes/replan", json=replan_payload)
    assert res.status_code == 200, f"Replan failed: {res.text}"
    replan_data = res.json()
    replanned_route = replan_data["replanned_route"]
    route_id = replanned_route["route_id"]
    
    print(f"   [PASS] Replanned Route ID: {route_id}")
    print(f"          New Total Distance: {replanned_route['total_distance_km']} km")
    print(f"          Added Delta Distance: {replan_data['additional_distance_km']} km")
    print(f"          Waypoints Count: {len(replanned_route['waypoints'])}")
    
    # Verify in SQLite
    db_route = db.query(DBRoute).filter(DBRoute.id == route_id).first()
    assert db_route is not None, "Route was not persisted to SQLite!"
    assert "AHM-156" in db_route.waypoints_json, "Emergency bin AHM-156 not found in persisted waypoints!"
    print("   [PASS] SQLite 'routes' table verified: contains AHM-156 in waypoints_json.")
    
    # 2. Test Bin Collection Mutation with AHM-104
    print("\n2. Testing POST /api/bins/AHM-104/collect...")
    
    # Check pre-collection state
    bin_before = db.query(DBBin).filter(DBBin.bin_code == "AHM-104").first()
    print(f"          Before Collection: Fill = {bin_before.fill_percentage}%, Status = {bin_before.status}")
    
    res = client.post("/api/bins/AHM-104/collect?vehicle_code=V-01")
    assert res.status_code == 200, f"Collection failed: {res.text}"
    collect_data = res.json()
    
    print(f"   [PASS] Collection Recorded: ID = {collect_data['collection_id']}")
    print(f"          Weight Collected: {collect_data['weight_collected_kg']} kg")
    print(f"          Vehicle: {collect_data['vehicle_code']}")
    
    # Verify in SQLite collections table
    db_collection = db.query(DBCollection).filter(DBCollection.bin_code == "AHM-104").order_by(DBCollection.timestamp.desc()).first()
    assert db_collection is not None, "Collection record not found in SQLite collections table!"
    print(f"   [PASS] SQLite 'collections' table verified: Row found (Weight: {db_collection.weight_collected} kg).")
    
    # Verify in SQLite bins table
    db.refresh(bin_before)
    assert bin_before.fill_percentage == 0.0, f"Expected 0.0% fill, got {bin_before.fill_percentage}%"
    assert bin_before.status == "Healthy", f"Expected Healthy status, got {bin_before.status}"
    print(f"   [PASS] SQLite 'bins' table verified: Fill = {bin_before.fill_percentage}%, Status = {bin_before.status}, Last Collection = '{bin_before.last_collection}'.")
    
    db.close()
    print("\n=======================================================")
    print("STEP 3 FULLY VERIFIED: ALL MUTATIONS PERSISTED TO SQLITE!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_mutations()
