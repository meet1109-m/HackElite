"""Smoke test for Phase 3 Step 2: Request Schema Tolerancing."""

import io
import sys
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

def run_tests():
    client = TestClient(app)
    print("Testing Phase 3 Step 2 Request Schema Tolerancing...\n")

    # 1. POST /api/ai/query with frontend { prompt, context } format
    ai_payload_frontend = {
        "prompt": "Which bins need immediate collection?",
        "context": {"source": "AIWasteManagerPage"}
    }
    res_ai1 = client.post("/api/ai/query", json=ai_payload_frontend)
    print(f"1. POST /api/ai/query (frontend prompt): status={res_ai1.status_code}")
    assert res_ai1.status_code == 200
    data_ai1 = res_ai1.json()
    assert "answer" in data_ai1
    assert "cards" in data_ai1
    assert "suggested_actions" in data_ai1
    assert "recommended_actions" in data_ai1
    assert len(data_ai1["cards"]) > 0
    assert "data" in data_ai1["cards"][0]
    safe_summary1 = data_ai1['answer'][:60].encode('ascii', 'ignore').decode('ascii')
    print(f"   -> AI Answer summary: {safe_summary1}...")
    print(f"   -> Card data items: {len(data_ai1['cards'][0]['data'])} items, actions: {len(data_ai1['suggested_actions'])}")

    # 2. POST /api/ai/query with standard { query } format
    ai_payload_std = {
        "query": "Why is AHM-104 critical?"
    }
    res_ai2 = client.post("/api/ai/query", json=ai_payload_std)
    print(f"\n2. POST /api/ai/query (standard query): status={res_ai2.status_code}")
    assert res_ai2.status_code == 200
    data_ai2 = res_ai2.json()
    assert "answer" in data_ai2
    safe_summary2 = data_ai2['answer'][:60].encode('ascii', 'ignore').decode('ascii')
    print(f"   -> AI Answer summary: {safe_summary2}...")


    # 3. POST /api/waste/classify with JSON { stream, sampleId } (frontend format)
    waste_json_payload = {
        "stream": "Plastic",
        "sampleId": "sample-01"
    }
    res_waste1 = client.post("/api/waste/classify", json=waste_json_payload)
    print(f"\n3. POST /api/waste/classify (JSON stream/sampleId): status={res_waste1.status_code}")
    assert res_waste1.status_code == 200
    data_w1 = res_waste1.json()
    assert "composition" in data_w1
    assert "plastic" in data_w1
    assert "organic" in data_w1
    assert "purity_score" in data_w1
    assert "contamination_level" in data_w1
    print(f"   -> Plastic: {data_w1['plastic']}%, Purity: {data_w1['purity_score']}, Level: {data_w1['contamination_level']}")

    # 4. POST /api/waste/classify with JSON { demo_image_id: "AHM-104" }
    res_waste2 = client.post("/api/waste/classify", json={"demo_image_id": "AHM-104"})
    print(f"\n4. POST /api/waste/classify (JSON demo_image_id): status={res_waste2.status_code}")
    assert res_waste2.status_code == 200
    data_w2 = res_waste2.json()
    assert data_w2["organic"] > 50.0  # AHM-104 is primarily organic
    print(f"   -> AHM-104 Organic: {data_w2['organic']}%, Dominant: {data_w2['dominant_material']}")

    # 5. POST /api/waste/classify with multipart file upload
    img = Image.new("RGB", (224, 224), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    
    files = {"file": ("test.jpg", buf.getvalue(), "image/jpeg")}
    res_waste3 = client.post("/api/waste/classify", files=files)
    print(f"\n5. POST /api/waste/classify (multipart image file): status={res_waste3.status_code}")
    assert res_waste3.status_code == 200
    data_w3 = res_waste3.json()
    assert "composition" in data_w3
    assert "plastic" in data_w3
    assert data_w3["source"] == "AI Detected from Image"
    print(f"   -> ML Classified Dominant: {data_w3['dominant_material']}, Confidence: {data_w3['confidence_pct']}%")

    print("\nALL STEP 2 TESTS PASSED! [5/5]")

if __name__ == "__main__":
    run_tests()
