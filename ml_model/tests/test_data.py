"""
Automated tests for Dataset Integrity and Relationship Consistency.
"""
import sys
from pathlib import Path
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.utils.config import get_dataset_path, DATASET_FILENAMES

def test_all_datasets_exist():
    """Verify all 7 Ahmedabad tabular datasets exist and are non-empty."""
    for key in DATASET_FILENAMES:
        path = get_dataset_path(key)
        assert path.exists(), f"Missing dataset: {key}"
        assert path.stat().st_size > 0, f"Empty dataset file: {key}"

def test_bins_master_table():
    """Verify bins table has exactly 600 unique bins across 33 zones."""
    bins_path = get_dataset_path("bins")
    df = pd.read_csv(bins_path)
    assert len(df) == 600
    assert df["bin_id"].nunique() == 600
    assert df["zone_name"].nunique() == 33
    assert set(df["waste_stream"].unique()).issubset({"Plastic", "Paper", "Metal", "Glass", "Organic", "Commercial", "Dry", "Recyclable", "Mixed"})

def test_vehicles_table():
    """Verify vehicle fleet inventory integrity."""
    veh_path = get_dataset_path("vehicles")
    df = pd.read_csv(veh_path)
    assert len(df) == 70
    assert df["vehicle_id"].nunique() == 70
    assert (df["capacity_kg"] > 0).all()

def test_no_orphan_records():
    """Verify foreign key integrity between bins and telemetry."""
    bins_df = pd.read_csv(get_dataset_path("bins"))
    known_bins = set(bins_df["bin_id"].unique())
    
    # Check sample fill history
    fill_sample = pd.read_csv(get_dataset_path("bin_fill_history"), nrows=10000)
    fill_bins = set(fill_sample["bin_id"].dropna().unique())
    assert fill_bins.issubset(known_bins), "Orphan bins found in fill history sample!"
