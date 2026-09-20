"""
WasteWise AI - Unified Waste Hotspot Detection Engine.
Integrates density-based spatial clustering (DBSCAN), multi-factor intensity scoring, temporal dynamics, future forecasting, and actionable recommendation synthesis.
"""
from typing import Dict, Any, List, Optional, Union
import numpy as np
import pandas as pd

from src.utils.config import get_dataset_path
from src.hotspots.clustering import perform_dbscan_clustering
from src.hotspots.features import validate_and_clean_spatial_data, compute_cluster_aggregated_features
from src.hotspots.severity import calculate_hotspot_severity
from src.hotspots.temporal import classify_temporal_trend
from src.hotspots.recommendations import generate_hotspot_recommendations
from src.hotspots.forecast_integration import predict_future_hotspots_from_forecast

class WasteHotspotDetector:
    """
    Dedicated Waste Hotspot Detection engine for Ahmedabad municipality.
    Identifies spatial clusters with elevated waste activity, overflows, anomalies, and predicts emerging risk.
    """
    def __init__(
        self,
        default_eps_km: float = 0.8,
        default_min_samples: int = 3
    ):
        self.default_eps_km = default_eps_km
        self.default_min_samples = default_min_samples
        self._cached_ahmedabad_data = None

    def _load_default_ahmedabad_data(self) -> pd.DataFrame:
        """Loads and joins baseline Ahmedabad dataset records for out-of-the-box hotspot inference."""
        if self._cached_ahmedabad_data is not None:
            return self._cached_ahmedabad_data.copy()
            
        try:
            bins_path = get_dataset_path("bins")
            zone_path = get_dataset_path("zone_waste_generation")
            anom_path = get_dataset_path("anomaly_ground_truth")
            
            df_bins = pd.read_csv(bins_path)
            df_zone = pd.read_csv(zone_path)
            df_anom = pd.read_csv(anom_path)
            
            # Extract latest snapshot date
            latest_date = df_zone["date"].max()
            df_latest_zone = df_zone[df_zone["date"] == latest_date].copy()
            
            # Anomaly counts per zone on latest date
            df_anom_latest = df_anom[df_anom["date"] == latest_date]
            anom_counts = df_anom_latest["zone_id"].value_counts().to_dict()
            
            # Merge bin master with zone latest metrics
            merged = df_bins.merge(
                df_latest_zone[[
                    "zone_id", "total_waste_kg", "avg_daily_generation_kg_14d",
                    "average_bin_fill_percentage", "overflow_count", "market_activity_level"
                ]],
                on="zone_id",
                how="left"
            )
            
            # Distribute zone metrics proportionally to bins
            merged["bin_count_in_zone"] = merged.groupby("zone_id")["bin_id"].transform("count")
            merged["total_waste_kg"] = merged["total_waste_kg"] / merged["bin_count_in_zone"]
            merged["baseline_waste_kg"] = merged["avg_daily_generation_kg_14d"] / merged["bin_count_in_zone"]
            merged["fill_percentage"] = merged["average_bin_fill_percentage"].fillna(50.0)
            merged["overflow_count"] = (merged["overflow_count"] / merged["bin_count_in_zone"]).round().astype(int)
            merged["anomaly_count"] = merged["zone_id"].map(lambda z: anom_counts.get(z, 0))
            
            self._cached_ahmedabad_data = merged
            return merged.copy()
        except Exception:
            # If dataset load fails, return empty df
            return pd.DataFrame()

    def detect(
        self,
        data: Optional[Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]]] = None,
        eps_km: Optional[float] = None,
        min_samples: Optional[int] = None,
        include_forecast: bool = True,
        forecast_func = None
    ) -> Dict[str, Any]:
        """
        Executes complete end-to-end Waste Hotspot Detection pipeline.
        
        Args:
            data: Input data (DataFrame, list of bin dicts, dict with 'bins' list, or None for Ahmedabad defaults).
            eps_km: Neighborhood radius in km (default: 0.8).
            min_samples: Minimum bins to form a spatial cluster (default: 3).
            include_forecast: Whether to project future hotspot trends with forecasting model.
            forecast_func: Optional callable forecasting function.
            
        Returns:
            Structured dictionary matching SmartBinX schema.
        """
        eps = eps_km if eps_km is not None else self.default_eps_km
        ms = min_samples if min_samples is not None else self.default_min_samples
        
        # 1. Parse and format input data
        if data is None:
            raw_df = self._load_default_ahmedabad_data()
        elif isinstance(data, pd.DataFrame):
            raw_df = data
        elif isinstance(data, list):
            raw_df = pd.DataFrame(data)
        elif isinstance(data, dict):
            if "bins" in data and isinstance(data["bins"], list):
                raw_df = pd.DataFrame(data["bins"])
            elif "records" in data and isinstance(data["records"], list):
                raw_df = pd.DataFrame(data["records"])
            else:
                raw_df = pd.DataFrame([data])
        else:
            raw_df = pd.DataFrame()
            
        clean_df = validate_and_clean_spatial_data(raw_df)
        
        if len(clean_df) == 0:
            return {
                "status": "success",
                "total_bins_analyzed": 0,
                "hotspots_count": 0,
                "hotspots": [],
                "future_hotspots": [],
                "summary": {
                    "critical_hotspots": 0,
                    "high_hotspots": 0,
                    "medium_hotspots": 0,
                    "low_hotspots": 0,
                    "total_waste_in_hotspots_kg": 0.0
                }
            }
            
        # 2. Perform DBSCAN Spatial Clustering
        labels, cluster_meta = perform_dbscan_clustering(
            clean_df,
            lat_col="latitude",
            lon_col="longitude",
            eps_km=eps,
            min_samples=ms
        )
        clean_df["cluster_id"] = labels
        
        # 3. Analyze Clusters and Construct Hotspots
        hotspots = []
        cluster_ids = sorted([cid for cid in set(labels) if cid != -1])
        
        # Also check noise points (-1) for extreme single-point critical anomalies
        noise_df = clean_df[clean_df["cluster_id"] == -1]
        
        hotspot_counter = 1
        for cid in cluster_ids:
            c_df = clean_df[clean_df["cluster_id"] == cid]
            feats = compute_cluster_aggregated_features(c_df)
            
            # Hotspot intensity & severity
            severity, score, components = calculate_hotspot_severity(feats)
            
            # Temporal trajectory
            trend = classify_temporal_trend(feats)
            
            # Actionable recommendations
            recommendation = generate_hotspot_recommendations(feats, severity, trend)
            
            hotspot_id = f"HS-{hotspot_counter:03d}"
            hotspot_counter += 1
            
            hotspots.append({
                "hotspot_id": hotspot_id,
                "latitude": feats["center_latitude"],
                "longitude": feats["center_longitude"],
                "severity": severity,
                "affected_bins": feats["affected_bins"],
                "affected_zones": feats["affected_zones"],
                "zone_names": feats["zone_names"],
                "waste_generation_kg": feats["total_waste_kg"],
                "baseline_waste_kg": feats["baseline_waste_kg"],
                "deviation_percent": feats["deviation_percent"],
                "average_fill_percent": feats["average_fill_percent"],
                "overflow_events": feats["overflow_events"],
                "anomaly_events": feats["anomaly_events"],
                "trend": trend,
                "recommendation": recommendation,
                "composite_score": score,
                "primary_waste_stream": feats["primary_waste_stream"]
            })
            
        # Check if any isolated noise points have critical overflow/spikes
        for _, noise_row in noise_df.iterrows():
            fill_pct = float(noise_row.get("fill_percentage", 0.0))
            ovf = int(noise_row.get("overflow_count", 0))
            if fill_pct >= 90.0 or ovf > 0:
                n_df = pd.DataFrame([noise_row])
                n_feats = compute_cluster_aggregated_features(n_df)
                n_sev, n_score, _ = calculate_hotspot_severity(n_feats)
                n_trend = classify_temporal_trend(n_feats)
                n_rec = generate_hotspot_recommendations(n_feats, n_sev, n_trend)
                
                hotspots.append({
                    "hotspot_id": f"HS-{hotspot_counter:03d}",
                    "latitude": n_feats["center_latitude"],
                    "longitude": n_feats["center_longitude"],
                    "severity": n_sev,
                    "affected_bins": 1,
                    "affected_zones": 1,
                    "zone_names": n_feats["zone_names"],
                    "waste_generation_kg": n_feats["total_waste_kg"],
                    "baseline_waste_kg": n_feats["baseline_waste_kg"],
                    "deviation_percent": n_feats["deviation_percent"],
                    "average_fill_percent": n_feats["average_fill_percent"],
                    "overflow_events": n_feats["overflow_events"],
                    "anomaly_events": n_feats["anomaly_events"],
                    "trend": n_trend,
                    "recommendation": n_rec,
                    "composite_score": n_score,
                    "primary_waste_stream": n_feats["primary_waste_stream"]
                })
                hotspot_counter += 1
                
        # 4. Integrate Future Hotspot Forecasting if requested
        future_hotspots = []
        if include_forecast and len(hotspots) > 0:
            if forecast_func is None:
                try:
                    from src.predict import predict_zone_waste
                    forecast_func = predict_zone_waste
                except Exception:
                    forecast_func = None
                    
            if forecast_func is not None:
                future_hotspots = predict_future_hotspots_from_forecast(hotspots, forecast_func)
                
        # 5. Build Aggregated Summary
        crit_count = sum(1 for h in hotspots if h["severity"] == "CRITICAL")
        high_count = sum(1 for h in hotspots if h["severity"] == "HIGH")
        med_count = sum(1 for h in hotspots if h["severity"] == "MEDIUM")
        low_count = sum(1 for h in hotspots if h["severity"] == "LOW")
        total_waste_hs = sum(h["waste_generation_kg"] for h in hotspots)
        
        return {
            "status": "success",
            "total_bins_analyzed": len(clean_df),
            "hotspots_count": len(hotspots),
            "hotspots": hotspots,
            "future_hotspots": future_hotspots,
            "summary": {
                "critical_hotspots": crit_count,
                "high_hotspots": high_count,
                "medium_hotspots": med_count,
                "low_hotspots": low_count,
                "total_waste_in_hotspots_kg": round(total_waste_hs, 2)
            }
        }

# Global singleton instance
_hotspot_detector = WasteHotspotDetector()

def detect_waste_hotspots(
    data: Optional[Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]]] = None,
    eps_km: Optional[float] = None,
    min_samples: Optional[int] = None,
    include_forecast: bool = True,
    forecast_func = None
) -> Dict[str, Any]:
    """
    Main entrypoint function for Waste Hotspot Detection.
    """
    return _hotspot_detector.detect(
        data=data,
        eps_km=eps_km,
        min_samples=min_samples,
        include_forecast=include_forecast,
        forecast_func=forecast_func
    )
