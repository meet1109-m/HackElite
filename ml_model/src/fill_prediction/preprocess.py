"""
WasteWise AI - Bin Fill-Level Feature Engineering & Preprocessing.
Memory-efficient data loading with dtype optimization and chronological splitting.
"""
import gc
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

from src.utils.config import get_dataset_path, FILL_MODEL_DIR

# Feature definitions
CATEGORICAL_COLS = ["waste_stream", "season", "zone_name"]
NUMERICAL_COLS = [
    "fill_percentage",
    "estimated_weight_kg",
    "capacity_kg",
    "hours_since_collection",
    "daily_generation_kg",
    "avg_daily_generation_kg",
    "hour",
    "day_of_week",
    "is_weekend",
    "month",
    "temperature_c",
    "rainfall_mm",
    "humidity",
    "holiday_flag",
    "festival_flag",
    "market_activity_level",
    "event_activity_level",
    "fill_rate"  # Engineered: fill_percentage / (hours_since_collection + 0.1)
]

TARGET_COLS = ["fill_percentage_6h", "fill_percentage_12h", "fill_percentage_24h"]

FEATURE_COLS = CATEGORICAL_COLS + NUMERICAL_COLS

def load_and_preprocess_fill_data(sample_frac: float = 1.0):
    """
    Loads ahmedabad_bin_fill_history.csv efficiently.
    Uses dtype optimization and extracts features.
    """
    file_path = get_dataset_path("bin_fill_history")
    
    usecols = [
        "bin_id", "timestamp", "split",
        "waste_stream", "season", "zone_name",
        "fill_percentage", "estimated_weight_kg", "capacity_kg",
        "hours_since_collection", "daily_generation_kg", "avg_daily_generation_kg",
        "hour", "day_of_week", "is_weekend", "month",
        "temperature_c", "rainfall_mm", "humidity",
        "holiday_flag", "festival_flag", "market_activity_level", "event_activity_level",
        "fill_percentage_6h", "fill_percentage_12h", "fill_percentage_24h"
    ]
    
    dtype_dict = {
        "waste_stream": "category",
        "season": "category",
        "zone_name": "category",
        "fill_percentage": "float32",
        "estimated_weight_kg": "float32",
        "capacity_kg": "float32",
        "hours_since_collection": "float32",
        "daily_generation_kg": "float32",
        "avg_daily_generation_kg": "float32",
        "hour": "int32",
        "day_of_week": "int32",
        "is_weekend": "int32",
        "month": "int32",
        "temperature_c": "float32",
        "rainfall_mm": "float32",
        "humidity": "float32",
        "holiday_flag": "int32",
        "festival_flag": "int32",
        "market_activity_level": "float32",
        "event_activity_level": "float32",
        "fill_percentage_6h": "float32",
        "fill_percentage_12h": "float32",
        "fill_percentage_24h": "float32",
        "split": "category"
    }
    
    print(f"Loading fill history from {file_path.name}...")
    df = pd.read_csv(file_path, usecols=usecols, dtype=dtype_dict)
    
    # Drop rows missing the targets
    df = df.dropna(subset=TARGET_COLS)
    
    # Feature engineering: fill rate
    df["fill_rate"] = (df["fill_percentage"].fillna(0) / (df["hours_since_collection"].fillna(0) + 0.1)).astype("float32")
    
    # If sample_frac < 1.0 (for quick testing/lightweight training if needed)
    if sample_frac < 1.0:
        df = df.sample(frac=sample_frac, random_state=42)
        
    print(f"Data loaded: {len(df):,} valid records.")
    
    # Split chronologically based on 'split' column
    train_mask = df["split"] == "train"
    val_mask = df["split"] == "validation"
    test_mask = df["split"] == "test"
    
    X_train = df.loc[train_mask, FEATURE_COLS]
    y_train = df.loc[train_mask, TARGET_COLS]
    
    X_val = df.loc[val_mask, FEATURE_COLS]
    y_val = df.loc[val_mask, TARGET_COLS]
    
    X_test = df.loc[test_mask, FEATURE_COLS]
    y_test = df.loc[test_mask, TARGET_COLS]
    
    print(f"Train split: {len(X_train):,} rows | Val split: {len(X_val):,} rows | Test split: {len(X_test):,} rows")
    
    del df
    gc.collect()
    
    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

def build_preprocessor():
    """Builds a scikit-learn preprocessing ColumnTransformer."""
    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ])
    
    preprocessor = ColumnTransformer(transformers=[
        ("num", num_transformer, NUMERICAL_COLS),
        ("cat", cat_transformer, CATEGORICAL_COLS)
    ])
    return preprocessor
