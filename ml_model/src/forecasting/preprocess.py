"""
WasteWise AI - Zone Waste Generation Forecasting Preprocessing.
Extracts time-series lag and rolling features per Ahmedabad zone without future leakage.
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

CATEGORICAL_COLS = ["zone_name"]
NUMERICAL_COLS = [
    "number_of_active_bins",
    "average_bin_fill_percentage",
    "overflow_count",
    "collection_count",
    "population_density",
    "commercial_density",
    "market_activity_level",
    "holiday_flag",
    "festival_flag",
    "event_activity_level",
    "rainfall_mm",
    "temperature_c",
    "day_of_week",
    "month",
    "is_weekend",
    "waste_lag_1",
    "waste_lag_2",
    "waste_lag_7",
    "waste_rolling_mean_3",
    "waste_rolling_mean_7",
    "avg_daily_generation_kg_14d"
]

FEATURE_COLS = CATEGORICAL_COLS + NUMERICAL_COLS
TARGET_COL = "total_waste_kg"

def load_and_preprocess_forecast_data():
    """Loads ahmedabad_zone_waste_generation.csv and engineers lag & rolling features per zone."""
    file_path = get_dataset_path("zone_waste_generation")
    print(f"Loading zone waste generation data from {file_path.name}...")
    
    df = pd.read_csv(file_path)
    
    # Sort chronologically by zone and date to avoid any leakages
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(by=["zone_name", "date"]).reset_index(drop=True)
    
    # Extract date features
    df["day_of_week"] = df["date"].dt.dayofweek.astype("int32")
    df["month"] = df["date"].dt.month.astype("int32")
    df["is_weekend"] = (df["day_of_week"] >= 5).astype("int32")
    
    # Engineer lag and rolling features within each zone group
    df["waste_lag_1"] = df.groupby("zone_name")["total_waste_kg"].shift(1)
    df["waste_lag_2"] = df.groupby("zone_name")["total_waste_kg"].shift(2)
    df["waste_lag_7"] = df.groupby("zone_name")["total_waste_kg"].shift(7)
    
    df["waste_rolling_mean_3"] = df.groupby("zone_name")["total_waste_kg"].shift(1).rolling(window=3, min_periods=1).mean()
    df["waste_rolling_mean_7"] = df.groupby("zone_name")["total_waste_kg"].shift(1).rolling(window=7, min_periods=1).mean()
    
    # Backfill initial lag rows with available values to avoid dropping early data
    df["waste_lag_1"] = df["waste_lag_1"].bfill()
    df["waste_lag_2"] = df["waste_lag_2"].bfill()
    df["waste_lag_7"] = df["waste_lag_7"].bfill()
    df["waste_rolling_mean_3"] = df["waste_rolling_mean_3"].bfill()
    df["waste_rolling_mean_7"] = df["waste_rolling_mean_7"].bfill()
    
    train_mask = df["split"] == "train"
    val_mask = df["split"] == "validation"
    test_mask = df["split"] == "test"
    
    X_train = df.loc[train_mask, FEATURE_COLS]
    y_train = df.loc[train_mask, TARGET_COL]
    
    X_val = df.loc[val_mask, FEATURE_COLS]
    y_val = df.loc[val_mask, TARGET_COL]
    
    X_test = df.loc[test_mask, FEATURE_COLS]
    y_test = df.loc[test_mask, TARGET_COL]
    
    # Keep dates for visualization
    test_dates = df.loc[test_mask, ["date", "zone_name"]].copy()
    
    print(f"Forecast Dataset: {len(df):,} total records | Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")
    
    del df
    gc.collect()
    
    return (X_train, y_train), (X_val, y_val), (X_test, y_test), test_dates

def build_forecast_preprocessor():
    """Builds scikit-learn ColumnTransformer for waste forecasting."""
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
