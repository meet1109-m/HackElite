"""
WasteWise AI - Spatial Clustering Engine for Waste Hotspots.
Implements density-based spatial clustering (DBSCAN) using the Haversine metric on geographic coordinates.
"""
from typing import Tuple, List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN, KMeans

EARTH_RADIUS_KM = 6371.0088

def perform_dbscan_clustering(
    coordinates_df: pd.DataFrame,
    lat_col: str = "latitude",
    lon_col: str = "longitude",
    eps_km: float = 0.8,
    min_samples: int = 3
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Performs DBSCAN clustering on geographic coordinates using Haversine metric.
    
    Args:
        coordinates_df: DataFrame containing latitude and longitude columns.
        lat_col: Name of latitude column.
        lon_col: Name of longitude column.
        eps_km: Neighborhood radius in kilometers (default: 0.8 km).
        min_samples: Minimum points to form a core cluster (default: 3).
        
    Returns:
        Tuple of (cluster_labels_array, clustering_metadata_dict).
    """
    n_points = len(coordinates_df)
    if n_points == 0:
        return np.array([]), {
            "n_clusters": 0,
            "n_noise": 0,
            "algorithm": "DBSCAN (Haversine)",
            "eps_km": eps_km,
            "min_samples": min_samples
        }
        
    if n_points < min_samples:
        # Not enough points for a core cluster
        labels = np.full(n_points, -1, dtype=int)
        return labels, {
            "n_clusters": 0,
            "n_noise": n_points,
            "algorithm": "DBSCAN (Haversine)",
            "eps_km": eps_km,
            "min_samples": min_samples
        }
        
    coords_deg = coordinates_df[[lat_col, lon_col]].to_numpy(dtype=float)
    coords_rad = np.radians(coords_deg)
    
    # Convert km radius to radians for Haversine
    eps_rad = eps_km / EARTH_RADIUS_KM
    
    db = DBSCAN(
        eps=eps_rad,
        min_samples=min_samples,
        metric="haversine",
        algorithm="ball_tree"
    )
    labels = db.fit_predict(coords_rad)
    
    unique_labels = set(labels)
    n_clusters = len(unique_labels) - (1 if -1 in unique_labels else 0)
    n_noise = int(np.sum(labels == -1))
    
    metadata = {
        "n_clusters": n_clusters,
        "n_noise": n_noise,
        "algorithm": "DBSCAN (Haversine)",
        "eps_km": eps_km,
        "min_samples": min_samples,
        "total_points": n_points
    }
    return labels, metadata

def evaluate_kmeans_comparison(
    coordinates_df: pd.DataFrame,
    n_clusters: int = 10,
    lat_col: str = "latitude",
    lon_col: str = "longitude",
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Evaluates KMeans clustering for comparison analysis in research reports.
    """
    if len(coordinates_df) < n_clusters or len(coordinates_df) == 0:
        return {"algorithm": "KMeans", "status": "insufficient_data"}
        
    coords_deg = coordinates_df[[lat_col, lon_col]].to_numpy(dtype=float)
    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    labels = kmeans.fit_predict(coords_deg)
    
    return {
        "algorithm": "KMeans",
        "n_clusters": n_clusters,
        "inertia": float(kmeans.inertia_),
        "labels": labels
    }
