# WasteWise AI — Comprehensive Machine Learning Technical Report

## Executive Summary

**WasteWise AI** is an end-to-end intelligent municipal solid waste management analytics and predictive platform tailored specifically to **Ahmedabad, Gujarat, India**. The system bridges real-time IoT bin telemetry, vehicle collection operations, zone-level municipal forecasting, and computer vision classification on waste stream photographs.

All models have been developed, trained, calibrated, and rigorously verified strictly within `ml_model/`.

---

## 1. Subsystem Architecture & Empirical Results

### 1.1 Multi-Horizon Bin Fill Prediction (6h, 12h, 24h)
- **Problem**: Accurately predict future bin fill percentages to prevent street overflow and optimize clearance schedules.
- **Model**: Fast, histogram-based gradient boosting (`HistGradientBoostingRegressor`) with chronological 70/15/15 splits.
- **Metrics**:
  - **6h Forecast**: MAE = **8.02%**, RMSE = **13.17%**, $R^2$ = **0.7221** (vs Baseline Dummy MAE: 19.77%)
  - **12h Forecast**: MAE = **10.80%**, RMSE = **15.94%**, $R^2$ = **0.5923** (vs Baseline Dummy MAE: 19.77%)
  - **24h Forecast**: MAE = **10.75%**, RMSE = **16.10%**, $R^2$ = **0.5833** (vs Baseline Dummy MAE: 19.74%)

### 1.2 Overflow Risk Prediction Engine
- **Mechanism**: Translates the multi-horizon piecewise trajectory into actionable urgency indicators (`CRITICAL` <4h, `HIGH` 4-12h, `MEDIUM` 12-24h, `LOW` >24h).
- **Guarantees**: Monotonic trajectory solver with edge clamping preventing out-of-range (>100% or <0%) artifacts.

### 1.3 AI Estimated Waste Composition
- **Problem**: Multi-target regression estimating composition proportions across 6 categories (`Organic`, `Plastic`, `Paper`, `Metal`, `Glass`, `Other`).
- **Constraint Enforcement**: Strictly normalized softmax-style post-processing guaranteeing $\sum = 100.0\%$ and strictly $\ge 0.0\%$. Labeled as `"AI Estimated"`.
- **Metrics**: Overall Mean MAE = **3.25%**, Mean $R^2$ = **0.7484**.

### 1.4 Zone Waste Generation Forecasting
- **Problem**: Daily municipal zone total generation forecasting for 33 Ahmedabad zones.
- **Model**: Gradient boosted regressor leveraging pure chronological lag features (`lag_1`, `lag_2`, `lag_7`, 3-day and 7-day rolling means, 14-day zone baseline).
- **Leakage Audit**: Verified zero forward-looking target leakage. The high $R^2$ (0.9887) reflects high zone-level spatial scale and regular seasonal cycles in municipal solid waste data.
- **Metrics**: MAE = **245.37 kg**, RMSE = **424.14 kg**, $R^2$ = **0.9887** (vs Baseline Dummy MAE: 3,304.02 kg).

### 1.5 Unsupervised Zone Anomaly Detection
- **Model**: `IsolationForest` ($n=100$, contamination calibrated at $c=0.02$).
- **Held-Out Evaluation**: Precision = **0.1245**, Recall = **0.4167**, F1 = **0.1917** on `ahmedabad_anomaly_ground_truth.csv`.

### 1.6 DSWD Waste Image Classification (Computer Vision)
- **Dataset**: 784 RGB images (640 Train, 144 Test) from DSWD.
- **Model**: Pretrained `MobileNetV2` with two-stage transfer learning (frozen backbone -> fine-tuned top layers).
- **Source Distinction**: Output tagged as `"AI Detected from Image"` (distinguished from tabular `"AI Estimated"`).
- **Metrics**: Accuracy = **61.86%**, Weighted F1 = **0.6118** on held-out test split.

---

## 2. API Serving & Integration

FastAPI service (`api/main.py`) provides unified REST endpoints:
- `GET /health` — Service health and subsystem readiness.
- `POST /predict/fill` — Multi-horizon bin fill percentages and overflow risk.
- `POST /predict/overflow` — Direct overflow risk calculation.
- `POST /predict/composition` — Zone waste stream composition breakdown.
- `POST /predict/waste` — Next-day municipal waste generation forecasting.
- `POST /predict/anomaly` — Zone anomaly detection and score.
- `POST /predict/image` — Direct file upload waste image classification.
- `POST /predict/image-base64` — Base64 payload waste image classification.

---

## 3. Automated Test Suite

33 comprehensive unit and integration tests across all modules:
- `tests/test_data.py`: Dataset integrity and relationship verification.
- `tests/test_fill.py`: Multi-horizon fill regression accuracy and boundary handling.
- `tests/test_overflow.py`: Overflow urgency categorization and math solver.
- `tests/test_composition.py`: Non-negativity and 100% sum preservation.
- `tests/test_forecasting.py`: Lag calculations and missing lag fallbacks.
- `tests/test_anomaly.py`: Anomaly score continuous range and spike detection.
- `tests/test_predict.py`: Unified lazy-loader interface and extreme input handling.
- `tests/test_api.py`: Full FastAPI endpoint coverage (including vision endpoints).
- `image_classification/tests/`: Dataset loader, model architecture, freezing, and image inference.
