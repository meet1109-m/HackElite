"""
WasteWise AI - Future Hotspot Forecasting Integration.
Reuses the existing Zone Waste Generation HistGradientBoostingRegressor to forecast future hotspot emergence without duplicate model training.
"""
from typing import Dict, Any, List, Optional
import numpy as np

def predict_future_hotspots_from_forecast(
    hotspots: List[Dict[str, Any]],
    zone_waste_predictor_func
) -> List[Dict[str, Any]]:
    """
    Combines current hotspot clusters with existing ML zone waste predictions to forecast future risk.
    """
    future_hotspots = []
    
    for hs in hotspots:
        zone_names = hs.get("zone_names", [])
        if not zone_names:
            zone_names = [hs.get("zone_name", "Navrangpura")]
            
        forecasted_waste_total = 0.0
        
        for zone in zone_names:
            # Construct forecast payload for existing forecaster
            # Use current metrics as recent lag proxies
            current_kg = hs.get("waste_generation_kg", 1000.0) / max(1, len(zone_names))
            baseline_kg = hs.get("baseline_waste_kg", 800.0) / max(1, len(zone_names))
            
            payload = {
                "zone_name": str(zone),
                "day_of_week": 2,
                "month": 4,
                "is_weekend": 0,
                "waste_lag_1": float(current_kg),
                "waste_lag_2": float(current_kg * 0.98),
                "waste_lag_7": float(baseline_kg),
                "waste_rolling_mean_3": float(current_kg),
                "waste_rolling_mean_7": float(baseline_kg),
                "avg_daily_generation_kg_14d": float(baseline_kg)
            }
            
            try:
                pred = zone_waste_predictor_func(payload)
                forecasted_waste_total += float(pred.get("predicted_total_waste_kg", current_kg))
            except Exception:
                forecasted_waste_total += float(current_kg * 1.05)
                
        forecast_baseline = hs.get("baseline_waste_kg", 1.0)
        forecast_deviation_pct = round(((forecasted_waste_total - forecast_baseline) / max(1.0, forecast_baseline)) * 100.0, 1)
        
        # Determine future risk tier
        if forecast_deviation_pct >= 40.0 or hs.get("severity") == "CRITICAL":
            future_risk = "CRITICAL"
        elif forecast_deviation_pct >= 20.0 or hs.get("severity") == "HIGH":
            future_risk = "HIGH"
        elif forecast_deviation_pct >= 5.0 or hs.get("severity") == "MEDIUM":
            future_risk = "MEDIUM"
        else:
            future_risk = "LOW"
            
        future_hotspots.append({
            "hotspot_id": hs.get("hotspot_id"),
            "latitude": hs.get("latitude"),
            "longitude": hs.get("longitude"),
            "affected_zones": zone_names,
            "current_severity": hs.get("severity"),
            "future_predicted_risk": future_risk,
            "forecasted_waste_kg": round(forecasted_waste_total, 2),
            "forecast_deviation_percent": forecast_deviation_pct,
            "forecast_horizon": "next_day",
            "early_warning_alert": bool(future_risk in ["HIGH", "CRITICAL"])
        })
        
    return future_hotspots
