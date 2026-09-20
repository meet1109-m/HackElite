"""
WasteWise AI - Spatial & Temporal Feature Engineering for Waste Hotspots.
Prepares clean spatial, waste, telemetry, and temporal features without future data leakage.
"""
from typing import Dict, Any, List, Optional, Union
import numpy as np
import pandas as pd

AHMEDABAD_LAT_BOUNDS = (22.8, 23.3)
AHMEDABAD_LON_BOUNDS = (72.3, 72.8)

DEFAULT_BASELINE_WASTE_PER_BIN = 80.0  # kg/bin/day default
DEFAULT_FILL_PERCENTAGE = 50.0

def validate_and_clean_spatial_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates coordinates, removes duplicates, handles missing values, and ensures robust types.
    """
    if df is None or len(df) == 0:
        return pd.DataFrame()
        
    df = df.copy()
    
    # Standardize column names
    col_map = {
        "lat": "latitude",
        "lon": "longitude",
        "lng": "longitude",
        "zone": "zone_name",
        "fill": "fill_percentage",
        "current_fill": "fill_percentage",
        "waste_kg": "total_waste_kg",
        "daily_waste": "total_waste_kg",
        "baseline_kg": "baseline_waste_kg",
        "overflows": "overflow_count",
        "anomalies": "anomaly_count"
    }
    for old_col, new_col in col_map.items():
        if old_col in df.columns and new_col not in df.columns:
            df[new_col] = df[old_col]
            
    # Ensure required columns exist with valid defaults
    if "latitude" not in df.columns or "longitude" not in df.columns:
        return pd.DataFrame()
        
    # Drop rows with NaN in coordinates
    df = df.dropna(subset=["latitude", "longitude"])
    
    # Coerce numeric coordinates
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = df.dropna(subset=["latitude", "longitude"])
    
    # Filter out impossible geographic coordinates
    valid_mask = (
        (df["latitude"] >= -90.0) & (df["latitude"] <= 90.0) &
        (df["longitude"] >= -180.0) & (df["longitude"] <= 180.0)
    )
    df = df[valid_mask]
    
    if len(df) == 0:
        return pd.DataFrame()
        
    # Deduplicate exact duplicate records (by bin_id or coordinates if bin_id missing)
    if "bin_id" in df.columns:
        df = df.drop_duplicates(subset=["bin_id"], keep="last")
    else:
        df = df.drop_duplicates(subset=["latitude", "longitude"], keep="last")
        
    # Ensure identifier and zone columns
    if "bin_id" not in df.columns:
        df["bin_id"] = [f"BIN-{i+1:04d}" for i in range(len(df))]
    if "zone_name" not in df.columns:
        if "zone_id" in df.columns:
            df["zone_name"] = df["zone_id"].astype(str)
        else:
            df["zone_name"] = "Ahmedabad-Central"
            
    if "zone_id" not in df.columns:
        df["zone_id"] = df["zone_name"].apply(lambda z: f"AMD-Z-{hash(z)%100:02d}")
        
    # Ensure numerical metrics
    if "fill_percentage" not in df.columns:
        df["fill_percentage"] = DEFAULT_FILL_PERCENTAGE
    else:
        df["fill_percentage"] = pd.to_numeric(df["fill_percentage"], errors="coerce").fillna(DEFAULT_FILL_PERCENTAGE)
        df["fill_percentage"] = df["fill_percentage"].clip(0.0, 135.0)
        
    if "total_waste_kg" not in df.columns:
        # If estimated_weight_kg or capacity available, approximate
        if "estimated_weight_kg" in df.columns:
            df["total_waste_kg"] = pd.to_numeric(df["estimated_weight_kg"], errors="coerce").fillna(DEFAULT_BASELINE_WASTE_PER_BIN)
        else:
            df["total_waste_kg"] = DEFAULT_BASELINE_WASTE_PER_BIN
    else:
        df["total_waste_kg"] = pd.to_numeric(df["total_waste_kg"], errors="coerce").fillna(DEFAULT_BASELINE_WASTE_PER_BIN)
        df["total_waste_kg"] = df["total_waste_kg"].clip(lower=0.0)
        
    if "baseline_waste_kg" not in df.columns:
        if "avg_daily_generation_kg_14d" in df.columns:
            df["baseline_waste_kg"] = pd.to_numeric(df["avg_daily_generation_kg_14d"], errors="coerce").fillna(df["total_waste_kg"])
        elif "avg_daily_generation_kg" in df.columns:
            df["baseline_waste_kg"] = pd.to_numeric(df["avg_daily_generation_kg"], errors="coerce").fillna(df["total_waste_kg"])
        else:
            df["baseline_waste_kg"] = df["total_waste_kg"] * 0.85
    else:
        df["baseline_waste_kg"] = pd.to_numeric(df["baseline_waste_kg"], errors="coerce").fillna(df["total_waste_kg"] * 0.85)
        df["baseline_waste_kg"] = df["baseline_waste_kg"].clip(lower=1.0)
        
    if "overflow_count" not in df.columns:
        # Check if fill_percentage > 95%
        df["overflow_count"] = (df["fill_percentage"] >= 95.0).astype(int)
    else:
        df["overflow_count"] = pd.to_numeric(df["overflow_count"], errors="coerce").fillna(0).astype(int).clip(lower=0)
        
    if "anomaly_count" not in df.columns:
        df["anomaly_count"] = 0
    else:
        df["anomaly_count"] = pd.to_numeric(df["anomaly_count"], errors="coerce").fillna(0).astype(int).clip(lower=0)
        
    if "waste_stream" not in df.columns:
        df["waste_stream"] = "Mixed"
        
    return df

def compute_cluster_aggregated_features(cluster_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes aggregated spatial, waste, and telemetry features for a clustered hotspot.
    """
    n_bins = len(cluster_df)
    if n_bins == 0:
        return {}
        
    center_lat = float(cluster_df["latitude"].mean())
    center_lon = float(cluster_df["longitude"].mean())
    
    unique_zones = cluster_df["zone_name"].unique().tolist()
    n_zones = len(unique_zones)
    
    total_waste = float(cluster_df["total_waste_kg"].sum())
    avg_waste = float(cluster_df["total_waste_kg"].mean())
    total_baseline = float(cluster_df["baseline_waste_kg"].sum())
    
    # Deviation from historical baseline (%)
    if total_baseline > 0:
        deviation_pct = float(((total_waste - total_baseline) / total_baseline) * 100.0)
    else:
        deviation_pct = 0.0
        
    avg_fill = float(cluster_df["fill_percentage"].mean())
    total_overflows = int(cluster_df["overflow_count"].sum())
    total_anomalies = int(cluster_df["anomaly_count"].sum())
    
    # Most common waste stream in the hotspot
    streams = cluster_df["waste_stream"].mode()
    primary_stream = str(streams[0]) if len(streams) > 0 else "Mixed"
    
    return {
        "center_latitude": round(center_lat, 6),
        "center_longitude": round(center_lon, 6),
        "affected_bins": n_bins,
        "affected_zones": n_zones,
        "zone_names": unique_zones,
        "total_waste_kg": round(total_waste, 2),
        "average_waste_kg": round(avg_waste, 2),
        "baseline_waste_kg": round(total_baseline, 2),
        "deviation_percent": round(deviation_pct, 2),
        "average_fill_percent": round(avg_fill, 2),
        "overflow_events": total_overflows,
        "anomaly_events": total_anomalies,
        "primary_waste_stream": primary_stream,
        "bin_ids": cluster_df["bin_id"].tolist()
    }
