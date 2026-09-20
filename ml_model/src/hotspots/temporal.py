"""
WasteWise AI - Temporal Hotspot Dynamics and Trajectory Classifier.
Classifies hotspots as PERSISTENT, EMERGING, TEMPORARY, or DECLINING using historical multi-window trajectory analysis.
"""
from typing import Dict, Any, List, Optional
import numpy as np

def classify_temporal_trend(
    cluster_features: Dict[str, Any],
    historical_series: Optional[List[float]] = None,
    anomaly_flag: bool = False,
    event_flag: bool = False
) -> str:
    """
    Determines temporal behavior mode of a waste hotspot.
    
    Categories:
    - PERSISTENT: Consistently high waste volume across >= 3 historical intervals (> 15% above baseline).
    - EMERGING: Rapidly accelerating waste generation trajectory (recent > prior > baseline).
    - TEMPORARY: Transient generation spike concentrated around an anomaly, festival, or isolated surge.
    - DECLINING: Downward generation trajectory returning toward or below baseline levels.
    """
    deviation_pct = float(cluster_features.get("deviation_percent", 0.0))
    avg_fill_pct = float(cluster_features.get("average_fill_percent", 50.0))
    anomalies = int(cluster_features.get("anomaly_events", 0))
    
    # 1. Multi-period historical analysis if time series provided
    if historical_series and len(historical_series) >= 3:
        w_hist = np.array(historical_series, dtype=float)
        baseline = float(cluster_features.get("baseline_waste_kg", np.mean(w_hist)))
        
        # Calculate recent velocity
        delta_recent = w_hist[-1] - w_hist[-2]
        delta_prior = w_hist[-2] - w_hist[-3]
        
        # Consistent elevation above baseline
        if all(w > baseline * 1.12 for w in w_hist[-3:]):
            if delta_recent > 0 and delta_recent > delta_prior:
                return "EMERGING"
            elif delta_recent < -0.05 * baseline:
                return "DECLINING"
            else:
                return "PERSISTENT"
                
        # Emerging upward breakout
        if w_hist[-1] > baseline * 1.15 and delta_recent > 0 and delta_prior >= 0:
            return "EMERGING"
            
        # Declining trajectory
        if delta_recent < 0 and delta_prior <= 0:
            return "DECLINING"
            
        # Isolated transient spike
        if w_hist[-1] > baseline * 1.25 and w_hist[-2] <= baseline * 1.08:
            return "TEMPORARY"
            
    # 2. Rule-based heuristic classification for single-snapshot operational records
    if event_flag:
        return "TEMPORARY"
        
    if deviation_pct >= 40.0:
        # Rapid high surge
        return "EMERGING"
    elif deviation_pct >= 15.0:
        # Steady elevated waste
        return "PERSISTENT"
    elif anomaly_flag or anomalies > 0:
        # Transient anomalous spike
        return "TEMPORARY"
    elif deviation_pct <= -5.0:
        # Contracting waste
        return "DECLINING"
    else:
        # Standard baseline
        if avg_fill_pct >= 75.0:
            return "PERSISTENT"
        return "TEMPORARY"
