"""
Automated unit tests for Waste Image Classification Model Architecture.
"""
import sys
from pathlib import Path
import pytest
import torch

IMG_CLASS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(IMG_CLASS_DIR / "src"))
from model import WasteClassifier

def test_model_forward_pass():
    model = WasteClassifier(num_classes=5, pretrained=False)
    dummy_input = torch.randn(2, 3, 224, 224)
    output = model(dummy_input)
    assert output.shape == (2, 5)

def test_model_freezing():
    model = WasteClassifier(num_classes=5, pretrained=False)
    model.freeze_backbone()
    # Check that backbone features are frozen
    for p in model.backbone.features.parameters():
        assert p.requires_grad is False
    # Check that classifier head is trainable
    for p in model.backbone.classifier.parameters():
        assert p.requires_grad is True
