"""
WasteWise AI - Anomaly Detection Preprocessing Module.
Extracts behavioral features for unsupervised anomaly detection and loads held-out ground truth for evaluation only.
"""
import gc
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

from src.utils.config import get_dataset_path

ANOMALY_FEATURE_COLS = [
    "total_waste_kg",
    "average_bin_fill_percentage",
    "overflow_count",
    "collection_count",
    "organic_waste_kg",
    "plastic_waste_kg",
    "paper_waste_kg",
    "metal_waste_kg",
    "glass_waste_kg",
    "other_waste_kg",
    "rainfall_mm",
    "temperature_c",
    "market_activity_level",
    "event_activity_level",
    "waste_surge_ratio"  # Engineered: total_waste_kg / avg_daily_generation_kg_14d
]

def load_and_preprocess_anomaly_data():
    """
    Loads zone waste records for unsupervised learning.
    Also loads held-out ground truth strictly for evaluation.
    """
    zone_path = get_dataset_path("zone_waste_generation")
    print(f"Loading anomaly detection feature source: {zone_path.name}...")
    df = pd.read_csv(zone_path)
    
    # Feature engineering: waste surge ratio
    df["waste_surge_ratio"] = (df["total_waste_kg"] / (df["avg_daily_generation_kg_14d"].replace(0, 1.0))).astype("float32")
    
    # Load ground truth for post-prediction evaluation
    gt_path = get_dataset_path("anomaly_ground_truth")
    print(f"Loading held-out ground truth: {gt_path.name}...")
    gt_df = pd.read_csv(gt_path)
    
    # Filter ground truth for zone entities
    zone_gt = gt_df[gt_df["entity_type"] == "zone"].copy()
    zone_gt_keys = set(zip(zone_gt["zone_id"], zone_gt["date"]))
    
    # Flag ground truth labels in df (strictly for evaluation metrics)
    df["ground_truth_anomaly"] = [
        1 if (zid, dt) in zone_gt_keys else 0
        for zid, dt in zip(df["zone_id"], df["date"])
    ]
    
    X = df[ANOMALY_FEATURE_COLS].copy()
    y_ground_truth = df["ground_truth_anomaly"].values
    
    print(f"Loaded {len(X):,} records. Ground truth contains {sum(y_ground_truth):,} known zone anomalies ({sum(y_ground_truth)/len(y_ground_truth)*100:.2f}%).")
    
    return X, y_ground_truth, df[["zone_name", "date", "total_waste_kg", "average_bin_fill_percentage"]].copy()

def build_anomaly_preprocessor():
    """Builds numerical scaling and imputation pipeline for Isolation Forest."""
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
