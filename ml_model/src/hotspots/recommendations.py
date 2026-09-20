"""
WasteWise AI - Explainable Hotspot Recommendation Engine.
Synthesizes contextual operational recommendations derived strictly from detected physical, spatial, and temporal conditions.
"""
from typing import Dict, Any, List

def generate_hotspot_recommendations(
    cluster_features: Dict[str, Any],
    severity: str,
    trend: str
) -> str:
    """
    Generates deterministic, actionable, explainable operational guidance.
    """
    avg_fill = cluster_features.get("average_fill_percent", 50.0)
    overflows = cluster_features.get("overflow_events", 0)
    anomalies = cluster_features.get("anomaly_events", 0)
    deviation_pct = cluster_features.get("deviation_percent", 0.0)
    waste_kg = cluster_features.get("total_waste_kg", 0.0)
    primary_stream = cluster_features.get("primary_waste_stream", "Mixed")
    affected_bins = cluster_features.get("affected_bins", 1)
    
    recs: List[str] = []
    
    # 1. Immediate Physical Saturation & Overflow Mitigations
    if avg_fill >= 80.0 or overflows > 0:
        if overflows >= 2:
            recs.append("Immediately dispatch rapid-response collection units to clear overflowing bins.")
        else:
            recs.append("Increase collection frequency and inspect high-fill bins.")
            
    # 2. Large Volume / Bulk Capacity Mitigations
    if waste_kg >= 2500.0 or severity in ["CRITICAL", "HIGH"]:
        recs.append("Deploy high-capacity compactor vehicles to accommodate heavy volumetric load.")
        
    # 3. Behavioral Anomaly / Dumping Mitigations
    if anomalies > 0 or deviation_pct >= 45.0:
        recs.append("Investigate abnormal waste generation and review area for unauthorized commercial dumping.")
        
    # 4. Stream Specific Routing
    if primary_stream == "Recyclable":
        recs.append("Prioritize recyclable-material recovery and assign dedicated dry-waste collection vehicle.")
    elif primary_stream == "Organic":
        recs.append("Prioritize daily organic waste clearance to prevent decomposition and odor in dense zone.")
        
    # 5. Temporal Trend Adjustments
    if trend == "EMERGING":
        recs.append("Review collection route coverage and adjust tomorrow's early morning dispatch window.")
    elif trend == "PERSISTENT":
        recs.append("Evaluate infrastructure expansion: install additional high-capacity smart bins.")
    elif trend == "DECLINING":
        recs.append("Normalize collection cadence as waste generation levels stabilize back toward baseline.")
        
    # Default fallback if quiet normal conditions
    if not recs:
        recs.append("Maintain standard scheduled collection frequency and monitor sensor telemetry.")
        
    # Deduplicate and format as clean cohesive text
    # Pick top 2 most urgent recommendations
    return " ".join(recs[:2])
