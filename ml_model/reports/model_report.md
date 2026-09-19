# WasteWise AI — Machine Learning Model Performance & Architecture Report

**City Focus**: Ahmedabad, Gujarat, India  
**Deployment Target**: Municipal Waste Management & Recycling Optimization System  
**Hardware Profile**: CPU-Only, Memory Conscious, Tree-Based Architectures (`n_jobs=2`, `random_state=42`)

---

## 1. Executive Summary

WasteWise AI provides an end-to-end municipal waste intelligence layer for Ahmedabad's 33 urban zones and 600 telemetry-enabled smart bins. The system is designed to handle high-frequency sensor streams and historical collection records while remaining extremely lightweight on CPU and memory.

All 5 core tabular intelligence subsystems have been fully trained, validated, serialized, and integrated into a unified prediction interface and FastAPI service.

```text
========================================================================================
Subsystem                           Primary Algorithm                Key Performance
========================================================================================
1. Bin Fill Prediction (6h)         HistGradientBoostingRegressor    MAE: 8.02%  | R²: 0.722
2. Bin Fill Prediction (12h)        HistGradientBoostingRegressor    MAE: 10.80% | R²: 0.592
3. Bin Fill Prediction (24h)        HistGradientBoostingRegressor    MAE: 10.75% | R²: 0.583
4. Overflow Risk Engine             Deterministic Rule Trajectory    4 Risk Classes (LOW to CRITICAL)
5. AI Estimated Waste Composition   Normalized Multi-HGB             MAE: 3.25%  | Sum = 100.0%
6. Zone Generation Forecasting      HistGradientBoostingRegressor    MAE: 245 kg | R²: 0.989
7. Anomaly Detection (Unsupervised) IsolationForest (c=0.02)         Precision: 0.125 | Recall: 0.417
========================================================================================
```

---

## 2. Dataset Audit & Consistency Findings

A systematic, memory-efficient audit was performed across all 7 core Ahmedabad datasets:

1. **`ahmedabad_bin_fill_history.csv`** (214.34 MB | 877,053 rows | 36 columns):
   - Telemetry dataset covering 600 bins over a 365-day chronological horizon (2025-09-01 to 2026-08-31).
   - Strict chronological splits: Train (588,722 rows, 70%), Validation (144,174 rows, 15%), Test (141,753 rows, 15%).
2. **`ahmedabad_bins.csv`** (0.09 MB | 600 rows):
   - 600 smart bins clustered across 33 municipal zones (Navrangpura, Bopal, Maninagar, Satellite, Paldi, etc.).
   - Bin capacities range from 50 kg (pedestrian bins) to 1,000 kg (compactors/skip containers).
3. **`ahmedabad_collection_history.csv`** (39.97 MB | 262,242 rows):
   - 262,242 completed collection stops serviced by 51 active municipal vehicles. Zero orphan bin references.
4. **`ahmedabad_waste_composition.csv`** (9.04 MB | 55,823 rows):
   - 6-fraction audit measurements (`plastic`, `paper`, `metal`, `glass`, `organic`, `other`).
5. **`ahmedabad_zone_waste_generation.csv`** (1.74 MB | 12,045 rows):
   - Daily zone-level generation time series with meteorological conditions and festival indicators.
6. **`ahmedabad_vehicles.csv`** (0.01 MB | 70 vehicles):
   - Fleet inventory covering Refuse Collectors, Compactor Trucks, Mini Tippers, and Dumper Placers.
7. **`ahmedabad_anomaly_ground_truth.csv`** (0.30 MB | 5,703 records):
   - Held-out ground truth for unsupervised anomaly benchmark evaluation (no feature leakage into training).

---

## 3. Subsystem Architecture & Empirical Results

### A. Bin Fill-Level Prediction (Multi-Horizon)
- **Objective**: Answer *"Given current fill and historical behavior, how full will this Ahmedabad bin be in 6, 12, and 24 hours?"*
- **Baseline vs HGB**:
  - *Dummy Baseline (Mean)*: MAE ~19.75%, RMSE ~25.02%, R²: -0.004
  - *HistGradientBoosting (6h)*: **MAE: 8.02%**, **RMSE: 13.17%**, **R²: 0.7221**
  - *HistGradientBoosting (12h)*: **MAE: 10.80%**, **RMSE: 15.94%**, **R²: 0.5923**
  - *HistGradientBoosting (24h)*: **MAE: 10.75%**, **RMSE: 16.10%**, **R²: 0.5833**

### B. Overflow Risk Prediction Engine
Deterministic rule engine combining current fill and predicted trajectory:
- **`hours_until_overflow`**: Time when fill reaches 100.0%.
- **`overflow_risk` Classification**:
  - `CRITICAL`: < 4 hours
  - `HIGH`: 4 – 12 hours
  - `MEDIUM`: 12 – 24 hours
  - `LOW`: > 24 hours

### C. Waste Composition Estimation
- **Designation**: Explicitly labeled as **`AI Estimated`** to distinguish from computer vision (`DSWD/` AI Detected from Image).
- **Enforcement**: Automatic clipping and L1 row-normalization guaranteeing $\sum = 100.0\%$.
- **Performance**: Overall Mean Absolute Error across all 6 categories is **3.25%** with mean $R^2 = 0.7484$.

### D. Zone Waste Generation Forecasting
- **Features**: Past lags (`waste_lag_1`, `waste_lag_2`, `waste_lag_7`), rolling stats (`waste_rolling_mean_3`, `waste_rolling_mean_7`), demographic densities, active bins, and weather. Strict prevention of future leakage.
- **Performance**:
  - *Dummy Baseline*: MAE: 3,304.02 kg | R²: -0.0058
  - *HistGradientBoostingRegressor*: **MAE: 245.37 kg** | **RMSE: 424.14 kg** | **R²: 0.9887**

### E. Anomaly Detection (Unsupervised Isolation Forest)
- **Algorithm**: `IsolationForest(n_estimators=100, contamination=0.02, random_state=42)`
- **Behavioral Features**: Total generation, surge ratio, overflow counts, collection counts, and composition breakdown.
- **Empirical Evaluation vs Held-Out Ground Truth**:
  - Total Evaluated Days: 12,045
  - Detected Anomalies: 241
  - Known Ground Truth Anomalies: 72
  - True Positives: 30 | False Positives: 211 | False Negatives: 42
  - **Recall**: 41.67% (discovers substantial portion of true operational anomalies without any supervised label access during training).

---

## 4. Model Feature Importance (Explainability)

> [!NOTE]
> Feature importance indicates statistical model reliance and ranking within the decision trees. It does not represent causal claims of waste generation.

**Top Features Influencing Fill Prediction**:
1. `Current Fill Percentage` (~38% importance)
2. `Hours Since Collection` (~22% importance)
3. `Engineered Fill Rate` (~14% importance)
4. `14-Day Average Daily Generation` (~8% importance)
5. `Hour of Day` (~5% importance)
6. `Bin Capacity Rating (kg)` (~4% importance)
7. `Market Activity Level` (~3% importance)

---

## 5. Unified System Architecture & Integration

```text
                    AHMEDABAD DATA
                          │
                          ▼
                  DATA PREPROCESSING
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   BIN FILL          COMPOSITION       WASTE GENERATION
   PREDICTION        ESTIMATION          FORECAST
  (6h, 12h, 24h)     (AI Estimated)    (Zone kg Tomorrow)
        │                 │                 │
        ▼                 ▼                 ▼
 OVERFLOW RISK     6-STREAM SPLIT      ZONE FORECAST
  (CRITICAL/HIGH)   (Sum = 100%)       (R² = 0.989)
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                  ANOMALY DETECTION
                 (Isolation Forest)
                          │
                          ▼
               UNIFIED PREDICTION API
                 (FastAPI REST Endpoints)
                          │
                          ▼
                  DECISION ENGINE
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
        PRIORITY       VEHICLE         ROUTE
         SCORING       SELECTION      OPTIMIZATION
            │             │             │
            └─────────────┼─────────────┘
                          ▼
                  WASTEWISE DASHBOARD
```

---

## 6. Model Artifacts & File Locations

All serialized models and preprocessing pipelines are stored under `models/`:
- `models/fill_prediction/fill_6h_model.joblib`
- `models/fill_prediction/fill_12h_model.joblib`
- `models/fill_prediction/fill_24h_model.joblib`
- `models/fill_prediction/preprocessor.joblib`
- `models/composition/composition_model.joblib`
- `models/composition/preprocessor.joblib`
- `models/forecasting/waste_forecasting_model.joblib`
- `models/forecasting/preprocessor.joblib`
- `models/anomaly_detection/isolation_forest.joblib`
- `models/anomaly_detection/preprocessor.joblib`
