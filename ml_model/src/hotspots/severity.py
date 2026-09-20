"""
WasteWise AI - Hotspot Intensity and Multi-Factor Severity Engine.
Computes objective, configurable severity scores (LOW, MEDIUM, HIGH, CRITICAL) for detected waste hotspots.
"""
from typing import Dict, Any, Tuple
import numpy as np

# Default severity model weights
DEFAULT_WEIGHTS = {
    "deviation": 0.35,  # Surge above historical baseline
    "fill_level": 0.30, # Physical bin saturation
    "overflows": 0.20,  # Service breakdown / spillage risk
    "anomalies": 0.15   # Behavioral / illegal dumping spikes
}

# Configurable severity cutoffs
DEFAULT_THRESHOLDS = {
    "critical_score": 75.0,
    "high_score": 55.0,
    "medium_score": 35.0
}

def calculate_hotspot_severity(
    cluster_features: Dict[str, Any],
    weights: Dict[str, float] = None,
    thresholds: Dict[str, float] = None
) -> Tuple[str, float, Dict[str, float]]:
    """
    Calculates composite severity score and category for a spatial waste hotspot.
    
    Returns:
        Tuple of (severity_label, composite_score_0_to_100, component_scores_dict).
    """
    if not cluster_features or cluster_features.get("affected_bins", 0) == 0:
        return "LOW", 0.0, {}
        
    w = weights or DEFAULT_WEIGHTS
    th = thresholds or DEFAULT_THRESHOLDS
    
    deviation_pct = cluster_features.get("deviation_percent", 0.0)
    avg_fill_pct = cluster_features.get("average_fill_percent", 50.0)
    overflows = cluster_features.get("overflow_events", 0)
    anomalies = cluster_features.get("anomaly_events", 0)
    affected_bins = max(1, cluster_features.get("affected_bins", 1))
    
    # 1. Normalized Deviation Component (0 - 100)
    # 0% deviation -> 25 score, +50% surge -> 75 score, >= +100% surge -> 100 score
    # Negative deviation (< -20%) -> 0 score
    norm_dev = float(np.clip((deviation_pct + 20.0) / 1.2, 0.0, 100.0))
    
    # 2. Fill Level Component (0 - 100)
    norm_fill = float(np.clip(avg_fill_pct, 0.0, 100.0))
    
    # 3. Overflow Rate Component (0 - 100)
    # Ratio of overflows to bins in the cluster: 0.5 overflows/bin -> 50 score, >= 1.0 -> 100 score
    ovf_rate = overflows / affected_bins
    norm_ovf = float(np.clip(ovf_rate * 100.0, 0.0, 100.0))
    
    # 4. Anomaly Rate Component (0 - 100)
    anom_rate = anomalies / affected_bins
    norm_anom = float(np.clip(anom_rate * 100.0, 0.0, 100.0))
    
    # Composite Weighted Score
    score = (
        w["deviation"] * norm_dev +
        w["fill_level"] * norm_fill +
        w["overflows"] * norm_ovf +
        w["anomalies"] * norm_anom
    )
    score = float(np.clip(score, 0.0, 100.0))
    
    # Direct override criteria for extreme operational danger
    if avg_fill_pct >= 85.0 or overflows >= 3 or (deviation_pct >= 50.0 and avg_fill_pct >= 75.0):
        if score < th["high_score"]:
            score = max(score, th["high_score"])
            
    if avg_fill_pct >= 92.0 and overflows >= 2:
        score = max(score, th["critical_score"])
        
    # Categorization
    if score >= th["critical_score"]:
        severity = "CRITICAL"
    elif score >= th["high_score"]:
        severity = "HIGH"
    elif score >= th["medium_score"]:
        severity = "MEDIUM"
    else:
        severity = "LOW"
        
    components = {
        "deviation_component": round(norm_dev, 2),
        "fill_component": round(norm_fill, 2),
        "overflow_component": round(norm_ovf, 2),
        "anomaly_component": round(norm_anom, 2),
        "composite_score": round(score, 2)
    }
    
    return severity, round(score, 2), components
