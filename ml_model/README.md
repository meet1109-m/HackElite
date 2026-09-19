# WasteWise AI — Ahmedabad Tabular Machine Learning Layer

This repository contains the complete, production-ready machine learning intelligence system for **WasteWise AI**, designed for Ahmedabad's 33 urban municipal zones and 600 smart waste bins.

---

## System Overview & Objectives

WasteWise AI solves 5 municipal optimization challenges using memory-efficient and CPU-friendly tree-based machine learning models:

1. **Bin Fill-Level Prediction (6h, 12h, 24h Horizons)**: Predicts upcoming fill trajectories (`fill_percentage_6h`, `fill_percentage_12h`, `fill_percentage_24h`) using `HistGradientBoostingRegressor`.
2. **Overflow Risk Prediction**: Deterministic rule-based engine mapping fill forecasts into `hours_until_overflow`, `predicted_overflow_time`, and categorized urgency levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
3. **AI Estimated Waste Composition**: Multi-output tree regressor estimating the 6 waste fractions (`plastic`, `paper`, `metal`, `glass`, `organic`, `other`) strictly normalized to 100.0%. (*Clearly distinguished as "AI Estimated" vs CV image classification*).
4. **Zone Waste Generation Forecasting**: Time-series forecasting for municipal zones tomorrow using strictly non-leaking lag features (`lag_1`, `lag_2`, `lag_7`) and rolling averages.
5. **Operational Anomaly Detection**: Unsupervised `IsolationForest` detecting abnormal generation surges, dumping events, and collection gaps, validated against held-out ground truth.

---

## Directory Structure

```text
ml_model/
├── data/
│   ├── raw/                      # Raw CSV datasets
│   └── processed/                # Preprocessed feature sets / cached arrays
├── models/
│   ├── fill_prediction/          # fill_6h, fill_12h, fill_24h & preprocessor.joblib
│   ├── composition/              # composition_model.joblib & preprocessor.joblib
│   ├── forecasting/              # waste_forecasting_model.joblib & preprocessor.joblib
│   └── anomaly_detection/        # isolation_forest.joblib & preprocessor.joblib
├── src/
│   ├── preprocessing/
│   │   ├── data_audit.py         # Full tabular audit
│   │   └── relationships.py      # Multi-table foreign key & consistency checks
│   ├── fill_prediction/
│   │   ├── preprocess.py         # Chronological feature engineering
│   │   ├── overflow.py           # Overflow trajectory & risk engine
│   │   └── train.py              # HistGradientBoosting / Baseline training
│   ├── composition/
│   │   ├── preprocess.py         # Composition feature transforms & normalization
│   │   ├── estimator.py          # Normalized multi-output estimator
│   │   └── train.py              # Multi-target regression training
│   ├── forecasting/
│   │   ├── preprocess.py         # Zone lag & rolling stats
│   │   └── train.py              # Zone waste prediction
│   ├── anomaly_detection/
│   │   ├── preprocess.py         # Behavioral feature extraction
│   │   └── train.py              # Unsupervised Isolation Forest + Ground Truth eval
│   ├── utils/
│   │   ├── config.py             # Global constants, paths, seed=42
│   │   └── generate_reports.py   # Automated report & plot compiler
│   └── predict.py                # Unified predictor interface
├── api/
│   ├── main.py                   # FastAPI app with CORS, health check
│   ├── schemas.py                # Pydantic request/response schemas
│   └── routes/
│       ├── prediction.py         # /predict/fill & /predict/overflow
│       ├── composition.py        # /predict/composition
│       ├── forecasting.py        # /predict/waste
│       └── anomaly.py            # /predict/anomaly
├── reports/
│   ├── plots/                    # Actual vs predicted & anomaly charts
│   ├── model_comparison.csv      # Empirical metrics table
│   └── model_report.md           # Comprehensive performance & explainability report
├── tests/
│   └── test_api.py               # Automated FastAPI test suite
├── requirements.txt
└── README.md
```

---

## Empirical Performance Summary

| Subsystem | Model | Training Set | Features | MAE | RMSE | $R^2$ / Metric |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Fill 6h** | `HistGradientBoostingRegressor` | 588,722 | 60 | **8.02%** | 13.17% | **0.7221** |
| **Fill 12h** | `HistGradientBoostingRegressor` | 588,722 | 60 | **10.80%** | 15.94% | **0.5923** |
| **Fill 24h** | `HistGradientBoostingRegressor` | 588,722 | 60 | **10.75%** | 16.10% | **0.5833** |
| **Composition** | `NormalizedMultiHGB` | 37,678 | 47 | **3.25%** | 4.10% | **0.7484** (Mean) |
| **Zone Forecast** | `HistGradientBoostingRegressor` | 8,085 | 54 | **245.37 kg** | 424.14 kg | **0.9887** |
| **Anomaly Detection** | `IsolationForest(c=0.02)` | 12,045 | 15 | *Unsupervised* | *Unsupervised* | Precision: **0.125**, Recall: **0.417** |

---

## Reproduction & Execution Guide

### 1. Data Audit & Relationships
```bash
python src/preprocessing/data_audit.py
python src/preprocessing/relationships.py
```

### 2. Sequential Model Training
```bash
python src/fill_prediction/train.py
python src/composition/train.py
python src/forecasting/train.py
python src/anomaly_detection/train.py
```

### 3. Generate Reports & Visualizations
```bash
python src/utils/generate_reports.py
```

### 4. Run Unified Prediction Test
```bash
python src/predict.py
```

### 5. Launch FastAPI Server & Run Test Suite
```bash
# Run automated API tests
python tests/test_api.py

# Launch live FastAPI server
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## FastAPI Endpoints

- `GET /health` — Service status and active ML subsystems.
- `POST /predict/fill` — Fill forecasting for 6h, 12h, 24h horizons with overflow metrics.
- `POST /predict/overflow` — Dedicated overflow timeline and urgency risk rating.
- `POST /predict/composition` — AI Estimated 6-stream breakdown normalized to 100%.
- `POST /predict/waste` — Next-day total municipal waste generation forecasting for Ahmedabad zones.
- `POST /predict/anomaly` — Unsupervised detection of waste spikes and abnormal operational telemetry.
