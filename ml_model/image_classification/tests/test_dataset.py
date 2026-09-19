"""
Automated unit tests for DSWD image dataset loader.
"""
import sys
from pathlib import Path
import pytest
import torch

IMG_CLASS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(IMG_CLASS_DIR / "src"))
from dataset import get_data_loaders, CLASSES, CLASS_TO_IDX

def test_dataset_loaders():
    train_loader, val_loader, test_loader, meta = get_data_loaders(batch_size=8)
    assert meta["train_count"] > 0
    assert meta["val_count"] > 0
    assert meta["test_count"] > 0
    assert len(meta["classes"]) == 5
    
    # Check sample batch
    for images, labels in train_loader:
        assert images.shape == (8, 3, 224, 224)
        assert labels.shape == (8,)
        assert (labels >= 0).all() and (labels < 5).all()
        break
