"""
WasteWise AI - Unified Prediction Interface.
Provides unified callable functions for all 5 ML subsystems:
1. predict_bin_fill()
2. predict_overflow()
3. predict_composition()
4. predict_zone_waste()
5. detect_anomaly()
"""
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib

# Add base src to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.utils.config import (
    FILL_MODEL_DIR,
    COMPOSITION_MODEL_DIR,
    FORECASTING_MODEL_DIR,
    ANOMALY_MODEL_DIR
)
from src.fill_prediction.overflow import calculate_overflow_metrics
from src.fill_prediction.preprocess import CATEGORICAL_COLS as FILL_CAT_COLS, NUMERICAL_COLS as FILL_NUM_COLS
from src.composition.preprocess import COMPOSITION_TARGETS, CATEGORICAL_COLS as COMP_CAT_COLS, NUMERICAL_COLS as COMP_NUM_COLS
from src.composition.estimator import NormalizedCompositionEstimator
from src.forecasting.preprocess import CATEGORICAL_COLS as FORECAST_CAT_COLS, NUMERICAL_COLS as FORECAST_NUM_COLS
from src.anomaly_detection.preprocess import ANOMALY_FEATURE_COLS

class WasteWisePredictor:
    """Singleton predictor that lazy-loads models as needed."""
    def __init__(self):
        self._fill_preprocessor = None
        self._fill_6h_model = None
        self._fill_12h_model = None
        self._fill_24h_model = None
        
        self._comp_preprocessor = None
        self._comp_model = None
        
        self._forecast_preprocessor = None
        self._forecast_model = None
        
        self._anomaly_preprocessor = None
        self._anomaly_model = None

    def _load_fill_models(self):
        if self._fill_6h_model is None:
            self._fill_preprocessor = joblib.load(FILL_MODEL_DIR / "preprocessor.joblib")
            self._fill_6h_model = joblib.load(FILL_MODEL_DIR / "fill_6h_model.joblib")
            self._fill_12h_model = joblib.load(FILL_MODEL_DIR / "fill_12h_model.joblib")
            self._fill_24h_model = joblib.load(FILL_MODEL_DIR / "fill_24h_model.joblib")

    def _load_comp_models(self):
        if self._comp_model is None:
            self._comp_preprocessor = joblib.load(COMPOSITION_MODEL_DIR / "preprocessor.joblib")
            self._comp_model = joblib.load(COMPOSITION_MODEL_DIR / "composition_model.joblib")

    def _load_forecast_models(self):
        if self._forecast_model is None:
            self._forecast_preprocessor = joblib.load(FORECASTING_MODEL_DIR / "preprocessor.joblib")
            self._forecast_model = joblib.load(FORECASTING_MODEL_DIR / "waste_forecasting_model.joblib")

    def _load_anomaly_models(self):
        if self._anomaly_model is None:
            self._anomaly_preprocessor = joblib.load(ANOMALY_MODEL_DIR / "preprocessor.joblib")
            self._anomaly_model = joblib.load(ANOMALY_MODEL_DIR / "isolation_forest.joblib")

    def predict_bin_fill(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predicts 6h, 12h, and 24h fill levels for an Ahmedabad bin."""
        self._load_fill_models()
        
        # Prepare DataFrame
        df = pd.DataFrame([features])
        
        # Fill defaults if missing
        if "fill_rate" not in df.columns:
            cur_fill = float(df.get("fill_percentage", [50.0])[0])
            hrs = float(df.get("hours_since_collection", [12.0])[0])
            df["fill_rate"] = cur_fill / (hrs + 0.1)
            
        for c in FILL_CAT_COLS:
            if c not in df.columns:
                df[c] = "Recyclable" if c == "waste_stream" else ("Summer" if c == "season" else "Navrangpura")
                
        for c in FILL_NUM_COLS:
            if c not in df.columns:
                df[c] = 0.0
                
        X_proc = self._fill_preprocessor.transform(df[FILL_CAT_COLS + FILL_NUM_COLS])
        
        pred_6h = float(np.clip(self._fill_6h_model.predict(X_proc)[0], 0.0, 135.0))
        pred_12h = float(np.clip(self._fill_12h_model.predict(X_proc)[0], 0.0, 135.0))
        pred_24h = float(np.clip(self._fill_24h_model.predict(X_proc)[0], 0.0, 135.0))
        
        bin_id = str(features.get("bin_id", "AMD-BIN-UNKNOWN"))
        cur_fill = float(features.get("fill_percentage", 0.0))
        
        # Also compute overflow
        overflow_info = calculate_overflow_metrics(cur_fill, pred_6h, pred_12h, pred_24h)
        
        return {
            "bin_id": bin_id,
            "current_fill_percentage": round(cur_fill, 1),
            "fill_percentage_6h": round(pred_6h, 1),
            "fill_percentage_12h": round(pred_12h, 1),
            "fill_percentage_24h": round(pred_24h, 1),
            "hours_until_overflow": overflow_info["hours_until_overflow"],
            "predicted_overflow_time": overflow_info["predicted_overflow_time"],
            "overflow_risk": overflow_info["overflow_risk"]
        }

    def predict_overflow(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates overflow timeline and categorized risk."""
        fill_res = self.predict_bin_fill(features)
        return {
            "bin_id": fill_res["bin_id"],
            "current_fill_percentage": fill_res["current_fill_percentage"],
            "hours_until_overflow": fill_res["hours_until_overflow"],
            "predicted_overflow_time": fill_res["predicted_overflow_time"],
            "overflow_risk": fill_res["overflow_risk"]
        }

    def predict_composition(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Estimates waste composition shares (sum strictly normalized to 100%)."""
        self._load_comp_models()
        
        df = pd.DataFrame([features])
        
        # Populate defaults if omitted
        for c in COMP_CAT_COLS:
            if c not in df.columns:
                df[c] = "Navrangpura" if c == "zone_name" else ("Recyclable" if c == "waste_stream" else "sensor_estimate")
        for c in COMP_NUM_COLS:
            if c not in df.columns:
                df[c] = 50.0 if c == "total_waste_kg" else (0.85 if c == "confidence" else 1.0)
                
        X_proc = self._comp_preprocessor.transform(df[COMP_CAT_COLS + COMP_NUM_COLS])
        shares = self._comp_model.predict(X_proc)[0]
        
        return {
            "estimation_source": "AI Estimated",
            "zone_name": str(features.get("zone_name", "Unknown")),
            "waste_stream": str(features.get("waste_stream", "Mixed")),
            "plastic_percentage": float(shares[0]),
            "paper_percentage": float(shares[1]),
            "metal_percentage": float(shares[2]),
            "glass_percentage": float(shares[3]),
            "organic_percentage": float(shares[4]),
            "other_percentage": float(shares[5]),
            "total_percentage": round(float(np.sum(shares)), 1)
        }

    def predict_zone_waste(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Forecasts total waste (kg) for an Ahmedabad zone."""
        self._load_forecast_models()
        
        df = pd.DataFrame([features])
        
        for c in FORECAST_CAT_COLS:
            if c not in df.columns:
                df[c] = "Navrangpura"
        for c in FORECAST_NUM_COLS:
            if c not in df.columns:
                df[c] = 0.0
                
        X_proc = self._forecast_preprocessor.transform(df[FORECAST_CAT_COLS + FORECAST_NUM_COLS])
        pred_kg = float(self._forecast_model.predict(X_proc)[0])
        
        return {
            "zone_name": str(features.get("zone_name", "Unknown")),
            "predicted_total_waste_kg": round(max(0.0, pred_kg), 2),
            "forecast_horizon": "next_day"
        }

    def detect_anomaly(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Detects operational/behavioral waste anomalies using Isolation Forest."""
        self._load_anomaly_models()
        
        df = pd.DataFrame([features])
        
        if "waste_surge_ratio" not in df.columns:
            tot = float(df.get("total_waste_kg", [1000.0])[0])
            avg14 = float(df.get("avg_daily_generation_kg_14d", [1000.0])[0])
            df["waste_surge_ratio"] = tot / max(1.0, avg14)
            
        for c in ANOMALY_FEATURE_COLS:
            if c not in df.columns:
                df[c] = 0.0
                
        X_proc = self._anomaly_preprocessor.transform(df[ANOMALY_FEATURE_COLS])
        pred = self._anomaly_model.predict(X_proc)[0]
        score = float(self._anomaly_model.decision_function(X_proc)[0])
        
        is_anomaly = bool(pred == -1)
        
        return {
            "zone_name": str(features.get("zone_name", "Unknown")),
            "is_anomaly": is_anomaly,
            "anomaly_score": round(score, 4),
            "anomaly_status": "ANOMALY_DETECTED" if is_anomaly else "NORMAL"
        }

    def detect_waste_hotspots(self, data: Optional[Any] = None, eps_km: Optional[float] = None, min_samples: Optional[int] = None, include_forecast: bool = True) -> Dict[str, Any]:
        """Detects spatial waste hotspots across Ahmedabad bins and zones."""
        from src.hotspots.detector import detect_waste_hotspots as _detect_hotspots
        return _detect_hotspots(data=data, eps_km=eps_km, min_samples=min_samples, include_forecast=include_forecast, forecast_func=self.predict_zone_waste)

# Global Singleton Instance
_predictor = WasteWisePredictor()

def predict_bin_fill(features: Dict[str, Any]) -> Dict[str, Any]:
    return _predictor.predict_bin_fill(features)

def predict_overflow(features: Dict[str, Any]) -> Dict[str, Any]:
    return _predictor.predict_overflow(features)

def predict_composition(features: Dict[str, Any]) -> Dict[str, Any]:
    return _predictor.predict_composition(features)

def predict_zone_waste(features: Dict[str, Any]) -> Dict[str, Any]:
    return _predictor.predict_zone_waste(features)

def detect_anomaly(features: Dict[str, Any]) -> Dict[str, Any]:
    return _predictor.detect_anomaly(features)

def detect_waste_hotspots(data: Optional[Any] = None, eps_km: Optional[float] = None, min_samples: Optional[int] = None, include_forecast: bool = True) -> Dict[str, Any]:
    return _predictor.detect_waste_hotspots(data=data, eps_km=eps_km, min_samples=min_samples, include_forecast=include_forecast)

if __name__ == "__main__":
    print("Testing Unified Predictor with sample payloads...")
    
    # 1. Test Bin Fill & Overflow
    sample_bin = {
        "bin_id": "AMD-BIN-0042",
        "zone_name": "Bopal",
        "waste_stream": "Organic",
        "season": "Summer",
        "fill_percentage": 78.5,
        "estimated_weight_kg": 185.0,
        "capacity_kg": 240.0,
        "hours_since_collection": 14.5,
        "daily_generation_kg": 320.0,
        "avg_daily_generation_kg": 300.0,
        "hour": 14,
        "day_of_week": 2,
        "is_weekend": 0,
        "month": 4,
        "temperature_c": 36.5,
        "rainfall_mm": 0.0,
        "humidity": 45.0,
        "holiday_flag": 0,
        "festival_flag": 0,
        "market_activity_level": 2.0,
        "event_activity_level": 1.0
    }
    fill_out = predict_bin_fill(sample_bin)
    print("\nFill & Overflow Output:\n", fill_out)
    
    # 2. Test Composition
    sample_comp = {
        "zone_name": "Navrangpura",
        "waste_stream": "Mixed",
        "total_waste_kg": 520.0
    }
    comp_out = predict_composition(sample_comp)
    print("\nComposition Output:\n", comp_out)
    
    # 3. Test Forecast
    sample_forecast = {
        "zone_name": "Maninagar",
        "day_of_week": 3,
        "month": 5,
        "is_weekend": 0,
        "waste_lag_1": 4200.0,
        "waste_lag_2": 4100.0,
        "waste_lag_7": 4350.0,
        "waste_rolling_mean_3": 4150.0,
        "waste_rolling_mean_7": 4200.0,
        "avg_daily_generation_kg_14d": 4180.0
    }
    forecast_out = predict_zone_waste(sample_forecast)
    print("\nForecast Output:\n", forecast_out)
    
    # 4. Test Anomaly
    sample_anomaly = {
        "zone_name": "Bopal",
        "total_waste_kg": 28000.0,
        "average_bin_fill_percentage": 94.0,
        "overflow_count": 22,
        "collection_count": 12,
        "avg_daily_generation_kg_14d": 5000.0
    }
    anomaly_out = detect_anomaly(sample_anomaly)
    print("\nAnomaly Output:\n", anomaly_out)
