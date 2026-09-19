# Anomaly Dataset Comprehensive Audit Report

## 1. Dataset Overview & Ground Truth Definition
- **Observation Entity**: Daily Ahmedabad Municipal Zone Waste Records (`zone_waste_generation.csv`).
- **Total Zone Records**: 12,045 across 33 municipal zones over 365 calendar days (2025-09-01 to 2026-08-31).
- **Ground Truth Source**: `ahmedabad_anomaly_ground_truth.csv` containing 5,703 total annotated operational incident events.
  - **Zone-Level Incidents**: 72 records (Type: `zone_surge`)
  - **Bin-Level Incidents**: 5,631 records (Types: `composition_shift, overnight_dumping, collection_gap, illegal_dumping_spike, festival_overload, repeated_overflow, weekend_spike`)

## 2. Class Imbalance & Prevalence
- **Ground-Truth Zone Anomalies**: 72 records
- **Normal Zone Operations**: 11,973 records
- **Prevalence (Positive Class Rate)**: **0.598%** (72/12045)
- **Class Ratio**: ~ 1 : 166 extreme class imbalance.

## 3. Data Integrity, Missingness & Contamination Audit
- **Duplicate Rows**: 0 duplicates found across (zone_id, date).
- **Missing Values**: 107 total missing cells across all columns.
- **Timestamp Coverage**: Uniform daily continuous coverage from 2025-09-01 to 2026-08-31.
- **Data Leakage Check**: Ground truth labels are strictly isolated in `ahmedabad_anomaly_ground_truth.csv` and never present in operational telemetry input vectors.
- **Root Cause of Baseline Low Precision (0.1245)**:
  1. Default contamination rate of $c=0.02$ (2.0%) is over 3.3x higher than the true anomaly base rate ($0.60\%$). This generated ~241 detections for only 72 true anomalies, mechanically bounding precision below 0.30.
  2. Lack of dynamic localized rolling z-scores and relative rate-of-change statistics caused global static thresholds to trigger on naturally high-density zones (e.g. dense commercial zones) rather than genuine temporal surge deviations.
