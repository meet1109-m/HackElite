"""
WasteWise AI - Hotspot Detection Package.
"""
from src.hotspots.detector import WasteHotspotDetector, detect_waste_hotspots
from src.hotspots.clustering import perform_dbscan_clustering, evaluate_kmeans_comparison
from src.hotspots.severity import calculate_hotspot_severity
from src.hotspots.temporal import classify_temporal_trend
from src.hotspots.recommendations import generate_hotspot_recommendations

__all__ = [
    "WasteHotspotDetector",
    "detect_waste_hotspots",
    "perform_dbscan_clustering",
    "evaluate_kmeans_comparison",
    "calculate_hotspot_severity",
    "classify_temporal_trend",
    "generate_hotspot_recommendations"
]
