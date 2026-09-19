"""
Automated unit tests for Waste Image Inference Module.
"""
import sys
from pathlib import Path
from PIL import Image
import pytest

IMG_CLASS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(IMG_CLASS_DIR / "src"))
from predict import predict_waste_image

def test_predict_synthetic_image():
    # Create test in-memory PIL image
    img = Image.new("RGB", (300, 300), color=(120, 150, 180))
    res = predict_waste_image(img)
    
    assert res["source"] == "AI Detected from Image"
    assert res["predicted_class"] in ["Plastic", "Other", "Metal", "Paper", "Glass"]
    assert 0.0 <= res["confidence"] <= 1.0
    assert len(res["probabilities"]) == 5
    assert abs(sum(res["probabilities"].values()) - 1.0) < 0.05

def test_predict_invalid_image():
    # Corrupted / invalid bytes
    res = predict_waste_image(b"invalid_corrupted_image_bytes")
    assert "error" in res
    assert res["predicted_class"] == "Unknown"
    assert res["confidence"] == 0.0
