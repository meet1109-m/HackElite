# WasteWise AI — Comprehensive Model Inventory

This document provides an exhaustive inventory of all machine learning models, statistical engines, and vision classifiers developed for the **WasteWise AI** municipal waste management intelligence platform in Ahmedabad.

---

## Model & Engine Registry

| # | System Name | Model / Architecture | File Location | Input Features | Output Target | Performance Benchmark |
|---|-------------|----------------------|---------------|----------------|---------------|-----------------------|
| 1 | **6-Hour Bin Fill Regressor** | `HistGradientBoostingRegressor` | `models/fill_prediction/fill_6h_model.joblib` | 60 tabular features (fill %, sensor dynamics, zone density, weather, temporal cycles, holiday/festival) | `fill_percentage_6h` (%) | **MAE: 8.02%**, **RMSE: 13.17%**, **$R^2$: 0.7221** (Baseline MAE: 19.77%) |
| 2 | **12-Hour Bin Fill Regressor** | `HistGradientBoostingRegressor` | `models/fill_prediction/fill_12h_model.joblib` | 60 tabular features (same feature matrix) | `fill_percentage_12h` (%) | **MAE: 10.80%**, **RMSE: 15.94%**, **$R^2$: 0.5923** (Baseline MAE: 19.77%) |
| 3 | **24-Hour Bin Fill Regressor** | `HistGradientBoostingRegressor` | `models/fill_prediction/fill_24h_model.joblib` | 60 tabular features (same feature matrix) | `fill_percentage_24h` (%) | **MAE: 10.75%**, **RMSE: 16.10%**, **$R^2$: 0.5833** (Baseline MAE: 19.74%) |
| 4 | **Overflow Risk Engine** | Piecewise Dynamic Trajectory Solver | `src/fill_prediction/overflow.py` | Multi-horizon fill predictions (6h, 12h, 24h), current fill %, capacity | `hours_until_overflow`, `predicted_overflow_time`, `overflow_risk` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) | Deterministic mathematical solver with monotonic trajectory safety checks |
| 5 | **Waste Composition Estimator** | Normalized Multi-Output `HistGradientBoostingRegressor` | `models/composition/composition_model.joblib` | 47 features (zone, stream, weight, temporal, weather) | 6 stream shares (`Plastic`, `Paper`, `Metal`, `Glass`, `Organic`, `Other`) | **Mean MAE: 3.25%**, **Mean $R^2$: 0.7484**, Strictly normalized $\sum = 100.0\%$ |
| 6 | **Zone Waste Generation Forecaster** | `HistGradientBoostingRegressor` | `models/forecasting/waste_forecasting_model.joblib` | 54 features (`lag_1`, `lag_2`, `lag_7`, `rolling_mean_3`, `rolling_mean_7`, `14d_baseline`, zone density) | Next-day `total_waste_kg` per Ahmedabad zone | **MAE: 245.37 kg**, **RMSE: 424.14 kg**, **$R^2$: 0.9887** (vs Baseline Dummy MAE: 3,304.02 kg) |
| 7 | **Zone Anomaly Detector** | `IsolationForest` (c=0.02, n_estimators=100) | `models/anomaly_detection/isolation_forest.joblib` | 15 standardized features (waste ratios, fill deviations, overflows, generation spikes) | `is_anomaly` (bool), `anomaly_score` (float), `anomaly_status` | Unsupervised calibrated: Precision: **0.1245**, Recall: **0.4167**, F1: **0.1917** vs held-out ground truth |
| 8 | **Waste Image Classifier** | Pretrained `MobileNetV2` with Custom Head | `image_classification/models/image_classifier.pt` | 224x224 RGB image (tensor normalized to ImageNet statistics) | Fine-grained waste stream (`Plastic`, `Other`, `Metal`, `Paper`, `Glass`), class confidence, probabilities | **Accuracy: 61.86%**, **Weighted F1: 0.6118**, Source: `AI Detected from Image` |
| 9 | **Waste Hotspot Detection** | `DBSCAN` (Haversine Metric) + Multi-Factor Intelligence | `src/hotspots/detector.py` | Geodesic GPS coordinates (`lat`, `lon` radians), waste surge, fill %, overflows, anomalies | Spatial waste hotspots (`hotspot_id`, `severity`, `trend`, `future_predicted_risk`, `recommendations`) | Unsupervised spatial clustering with 100% leak-free historical baselines and zero spherical distortion |

---

## Serialization & Artifact Assets

- **Preprocessors**:
  - `models/fill_prediction/fill_preprocessor.joblib`
  - `models/composition/composition_preprocessor.joblib`
  - `models/forecasting/waste_forecasting_preprocessor.joblib`
  - `models/anomaly_detection/anomaly_preprocessor.joblib`
  - `image_classification/models/class_names.json`, `config.json`, `training_metadata.json`
- **Inference Interfaces**:
  - Tabular Unified Engine: `src/predict.py`
  - Vision Inference: `image_classification/src/predict.py`
  - Unified REST API: `api/main.py`
