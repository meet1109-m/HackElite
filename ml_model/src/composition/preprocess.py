"""
WasteWise AI - Waste Composition Estimation Preprocessing Module.
Handles feature extraction, encoding, and chronological train/test splitting.
"""
import gc
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

from src.utils.config import get_dataset_path

COMPOSITION_TARGETS = [
    "plastic_percentage",
    "paper_percentage",
    "metal_percentage",
    "glass_percentage",
    "organic_percentage",
    "other_percentage"
]

CATEGORICAL_COLS = ["zone_name", "waste_stream", "composition_source"]
NUMERICAL_COLS = ["total_waste_kg", "hour", "day_of_week", "month", "is_weekend", "confidence"]
FEATURE_COLS = CATEGORICAL_COLS + NUMERICAL_COLS

def load_and_preprocess_composition_data():
    """Loads and preprocesses ahmedabad_waste_composition.csv."""
    file_path = get_dataset_path("waste_composition")
    
    usecols = [
        "zone_name", "waste_stream", "timestamp", "total_waste_kg",
        "composition_source", "confidence", "split"
    ] + COMPOSITION_TARGETS
    
    print(f"Loading waste composition data from {file_path.name}...")
    df = pd.read_csv(file_path, usecols=usecols)
    
    # Extract temporal features
    dt = pd.to_datetime(df["timestamp"], errors="coerce")
    df["hour"] = dt.dt.hour.fillna(12).astype("int32")
    df["day_of_week"] = dt.dt.dayofweek.fillna(0).astype("int32")
    df["month"] = dt.dt.month.fillna(1).astype("int32")
    df["is_weekend"] = (df["day_of_week"] >= 5).astype("int32")
    
    train_mask = df["split"] == "train"
    val_mask = df["split"] == "validation"
    test_mask = df["split"] == "test"
    
    X_train = df.loc[train_mask, FEATURE_COLS]
    y_train = df.loc[train_mask, COMPOSITION_TARGETS]
    
    X_val = df.loc[val_mask, FEATURE_COLS]
    y_val = df.loc[val_mask, COMPOSITION_TARGETS]
    
    X_test = df.loc[test_mask, FEATURE_COLS]
    y_test = df.loc[test_mask, COMPOSITION_TARGETS]
    
    print(f"Composition Dataset: {len(df):,} total | Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")
    
    del df
    gc.collect()
    
    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

def build_composition_preprocessor():
    """Builds scikit-learn ColumnTransformer for composition."""
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

def normalize_composition(pred_matrix: np.ndarray) -> np.ndarray:
    """
    Post-processing for composition:
    1. Clip negative predictions to 0
    2. Normalize rows so shares sum strictly to 100.0%
    """
    clipped = np.clip(pred_matrix, 0.0, None)
    sums = np.sum(clipped, axis=1, keepdims=True)
    # Avoid division by zero
    sums = np.where(sums == 0, 1.0, sums)
    normalized = (clipped / sums) * 100.0
    return np.round(normalized, 2)
