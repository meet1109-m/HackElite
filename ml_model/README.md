# WasteWise AI — Ahmedabad Machine Learning & Vision Layer

This repository contains the complete, production-ready machine learning intelligence system for **WasteWise AI**, designed for Ahmedabad's 33 urban municipal zones, 600 smart waste bins, and image-based waste stream classification.

---

## System Overview & Objectives

WasteWise AI provides 6 intelligent municipal capabilities using memory-efficient tree-based tabular models and a lightweight PyTorch vision model:

1. **Bin Fill-Level Prediction (6h, 12h, 24h Horizons)**: Predicts upcoming fill trajectories (`fill_percentage_6h`, `fill_percentage_12h`, `fill_percentage_24h`) using `HistGradientBoostingRegressor`.
2. **Overflow Risk Prediction**: Deterministic piecewise trajectory engine mapping multi-horizon fill forecasts into `hours_until_overflow`, `predicted_overflow_time`, and categorized urgency levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
3. **AI Estimated Waste Composition**: Multi-output tree regressor estimating the 6 municipal waste fractions (`plastic`, `paper`, `metal`, `glass`, `organic`, `other`) strictly normalized to 100.0%. (*Clearly distinguished as "AI Estimated"*).
4. **Zone Waste Generation Forecasting**: Time-series forecasting for municipal zones tomorrow using strictly chronological, non-leaking lag features (`lag_1`, `lag_2`, `lag_7`) and rolling averages.
5. **Operational Anomaly Detection**: Unsupervised `IsolationForest` detecting abnormal generation surges, dumping events, and collection gaps, evaluated against held-out ground truth.
6. **Waste Image Classification (Computer Vision)**: Two-stage transfer learning model built on `MobileNetV2` trained on DSWD images to classify waste into target streams, outputting probabilities and labeled as `"AI Detected from Image"`.

---

## Directory Structure

```text
ml_model/
├── data/
│   ├── raw/                      # Raw CSV datasets
│   ├── processed/                # Preprocessed feature sets / cached arrays
│   └── DSWD/                     # DSWD waste image dataset
├── models/
│   ├── fill_prediction/          # fill_6h, fill_12h, fill_24h & preprocessor.joblib
│   ├── composition/              # composition_model.joblib & preprocessor.joblib
│   ├── forecasting/              # waste_forecasting_model.joblib & preprocessor.joblib
│   └── anomaly_detection/        # isolation_forest.joblib & preprocessor.joblib
├── image_classification/
│   ├── models/                   # image_classifier.pt, class_names.json, config.json
│   ├── src/                      # dataset.py, model.py, train.py, predict.py
│   ├── tests/                    # test_dataset.py, test_model.py, test_prediction.py
│   └── reports/                  # image_model_report.md, confusion_matrix.png, etc.
├── src/
│   ├── preprocessing/
│   │   ├── data_audit.py         # Tabular data audit
│   │   └── relationships.py      # Multi-table foreign key & consistency checks
│   ├── fill_prediction/
│   │   ├── preprocess.py         # Chronological feature engineering
│   │   ├── overflow.py           # Overflow trajectory & risk engine
│   │   └── train.py              # HistGradientBoosting training
│   ├── composition/
│   │   ├── preprocess.py         # Composition feature transforms & normalization
│   │   ├── estimator.py          # Normalized multi-output estimator
│   │   └── train.py              # Multi-target regression training
│   ├── forecasting/
│   │   ├── preprocess.py         # Zone lag & rolling stats
│   │   └── train.py              # Zone waste prediction
│   ├── anomaly_detection/
│   │   ├── preprocess.py         # Behavioral feature extraction
│   │   └── train.py              # Isolation Forest + Ground Truth eval
│   ├── utils/
│   │   ├── config.py             # Global constants, paths, seed=42
│   │   └── generate_reports.py   # Automated report & plot compiler
│   └── predict.py                # Unified tabular predictor interface
├── api/
│   ├── main.py                   # FastAPI app with CORS, health check
│   ├── schemas.py                # Pydantic request/response schemas
│   └── routes/
│       ├── prediction.py         # /predict/fill & /predict/overflow
│       ├── composition.py        # /predict/composition
│       ├── forecasting.py        # /predict/waste
│       ├── anomaly.py            # /predict/anomaly
│       └── image.py              # /predict/image & /predict/image-base64
├── reports/
│   ├── plots/                    # Actual vs predicted & anomaly charts
│   ├── model_comparison.csv      # Empirical metrics table
│   ├── final_ml_report.md        # Comprehensive technical report
│   ├── final_model_inventory.md   # Exhaustive model registry
│   └── model_report.md           # Performance & explainability report
├── tests/
│   ├── test_data.py              # Dataset integrity & FK validation
│   ├── test_fill.py              # Fill prediction sanity & metrics
│   ├── test_overflow.py          # Overflow risk engine tests
│   ├── test_composition.py       # Composition sum-to-100% tests
│   ├── test_forecasting.py       # Forecasting lag tests
│   ├── test_anomaly.py           # Anomaly detector tests
│   ├── test_predict.py           # Unified predictor tests
│   └── test_api.py               # Complete FastAPI endpoint test suite
├── requirements.txt
└── README.md
```

---

## Empirical Performance Summary

| Subsystem | Model / Architecture | Training Set | Features / Input | Primary Metric | Baseline / Benchmark |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fill 6h** | `HistGradientBoostingRegressor` | 588,722 | 60 tabular features | **MAE: 8.02%**, $R^2$: **0.7221** | Dummy MAE: 19.77% |
| **Fill 12h** | `HistGradientBoostingRegressor` | 588,722 | 60 tabular features | **MAE: 10.80%**, $R^2$: **0.5923** | Dummy MAE: 19.77% |
| **Fill 24h** | `HistGradientBoostingRegressor` | 588,722 | 60 tabular features | **MAE: 10.75%**, $R^2$: **0.5833** | Dummy MAE: 19.74% |
| **Composition** | `NormalizedMultiHGB` | 37,678 | 47 tabular features | **Mean MAE: 3.25%**, $R^2$: **0.7484** | Normalized $\sum = 100\%$ |
| **Zone Forecast** | `HistGradientBoostingRegressor` | 8,085 | 54 tabular features | **MAE: 245.37 kg**, $R^2$: **0.9887** | Dummy MAE: 3,304 kg |
| **Anomaly Detection** | `IsolationForest(c=0.02)` | 12,045 | 15 tabular features | **Precision: 0.125**, **Recall: 0.417** | Unsupervised |
| **Image Classifier** | Transfer Learning `MobileNetV2` | 548 images | 224x224 RGB image | **Accuracy: 61.86%**, **Weighted F1: 0.6118** | Held-Out Test Set |

---

## Reproduction & Execution Guide

### 1. Run Complete Automated Test Suite (33 Tests)
```bash
python -m pytest -v tests/ image_classification/tests/
```

### 2. Standalone Inference Verification
```bash
# Tabular unified predictor
python src/predict.py

# Vision image predictor
python image_classification/src/predict.py
```

### 3. Launch FastAPI Server
```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## FastAPI Endpoints

- `GET /health` — Service status and active ML & vision subsystems.
- `POST /predict/fill` — Fill forecasting for 6h, 12h, 24h horizons with overflow metrics.
- `POST /predict/overflow` — Dedicated overflow timeline and urgency risk rating.
- `POST /predict/composition` — AI Estimated 6-stream breakdown normalized to 100%.
- `POST /predict/waste` — Next-day total municipal waste generation forecasting for Ahmedabad zones.
- `POST /predict/anomaly` — Unsupervised detection of waste spikes and abnormal operational telemetry.
- `POST /predict/image` — Multipart file upload for waste image classification.
- `POST /predict/image-base64` — JSON base64 payload for waste image classification.
