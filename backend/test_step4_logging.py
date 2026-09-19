"""
Test Step 4: Time-Series Telemetry & Prediction Logging.
Verifies:
1. Predictions are logged into the SQLite `predictions` table on GET /api/predictions/{bin_code}.
2. Telemetry sensor readings are logged into SQLite `bin_readings` and bin state is updated.
"""
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.entities import Prediction as DBPrediction, BinReading as DBBinReading, Bin as DBBin

def test_telemetry_and_prediction_logging():
    client = TestClient(app)
    db = SessionLocal()

    print("=======================================================")
    print("STEP 4 VERIFICATION: TELEMETRY & PREDICTION LOGGING")
    print("=======================================================\n")

    # 1. Test Prediction Logging
    print("1. Testing GET /api/predictions/AHM-118 (Prediction Logging)...")
    res = client.get("/api/predictions/AHM-118")
    assert res.status_code == 200, f"Prediction call failed: {res.text}"
    
    # Check SQLite predictions table
    db_pred = db.query(DBPrediction).filter(DBPrediction.bin_code == "AHM-118").order_by(DBPrediction.prediction_time.desc()).first()
    assert db_pred is not None, "Prediction record was not logged to SQLite!"
    print(f"   [PASS] Prediction Logged in SQLite: ID = {db_pred.id}")
    print(f"          Fill 6h: {db_pred.fill_6h}%, 12h: {db_pred.fill_12h}%, 24h: {db_pred.fill_24h}%")
    print(f"          Overflow Hours: {db_pred.predicted_overflow_hours}h")

    # 2. Test Sensor Telemetry Logging
    print("\n2. Testing POST /api/bins/AHM-118/telemetry (IoT Sensor Reading)...")
    res = client.post("/api/bins/AHM-118/telemetry?fill_percentage=88.5&weight=36.2")
    assert res.status_code == 200, f"Telemetry call failed: {res.text}"
    tel_data = res.json()
    reading_id = tel_data["reading_id"]
    
    print(f"   [PASS] Telemetry Recorded: Reading ID = {reading_id}")
    print(f"          Fill: {tel_data['fill_percentage']}%, Weight: {tel_data['weight_kg']} kg, Status: {tel_data['status']}")

    # Check SQLite bin_readings table
    db_reading = db.query(DBBinReading).filter(DBBinReading.id == reading_id).first()
    assert db_reading is not None, "Telemetry reading was not found in SQLite bin_readings!"
    assert db_reading.fill_percentage == 88.5, f"Expected 88.5%, got {db_reading.fill_percentage}%"
    print(f"   [PASS] SQLite 'bin_readings' verified: Row found (Fill: {db_reading.fill_percentage}%, Weight: {db_reading.weight} kg).")

    # Check SQLite bins table update
    db_bin = db.query(DBBin).filter(DBBin.bin_code == "AHM-118").first()
    assert db_bin.fill_percentage == 88.5, f"Expected 88.5% in bins table, got {db_bin.fill_percentage}%"
    assert db_bin.status == "High Priority", f"Expected High Priority, got {db_bin.status}"
    print(f"   [PASS] SQLite 'bins' verified: Updated fill = {db_bin.fill_percentage}%, Status = {db_bin.status}.")

    db.close()
    print("\n=======================================================")
    print("STEP 4 FULLY VERIFIED: ALL TELEMETRY & PREDICTIONS LOGGED!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_telemetry_and_prediction_logging()
