# WasteWise AI — Waste Hotspot Dataset Audit Report

**Date**: 2026-09-19  
**Target Scope**: Ahmedabad Municipal Corporation (AMC) Waste Hotspot Detection Subsystem  
**Audited Datasets**: `ahmedabad_bins.csv`, `ahmedabad_zone_waste_generation.csv`, `ahmedabad_anomaly_ground_truth.csv`, `ahmedabad_waste_composition.csv`, `ahmedabad_vehicles.csv`, `ahmedabad_bin_fill_history.csv`, `ahmedabad_collection_history.csv`.

---

## 1. Executive Summary

This audit establishes the data foundation for the **Waste Hotspot Detection** module of the WasteWise AI platform. Waste hotspot detection requires precise spatial coordinates, temporal historical generation records, bin fill metrics, overflow logs, and anomaly telemetry.

All required fields are natively present in the existing Ahmedabad datasets without needing any artificial data synthesis.

---

## 2. Spatial Coverage & Resolution

- **City Coverage**: Ahmedabad Municipal Area (AMC)
- **Bounding Box**:
  - **Latitude Range**: `22.953425° N` to `23.114212° N` (Span: ~17.89 km)
  - **Longitude Range**: `72.465564° E` to `72.675199° E` (Span: ~21.46 km)
- **Spatial Granularity**:
  - **Zone Level**: 33 Distinct Municipal Zones (e.g., *Navrangpura*, *Vastrapur*, *Satellite*, *Bodakdev*, *Prahlad Nagar*, *Thaltej*, *Bopal*, *Gota*, *Maninagar*, *Paldi*, *Jamalpur*, *Dariyapur*, *CG Road*, etc.)
  - **Bin Level**: 600 Smart Bins with exact GPS coordinates (`latitude`, `longitude`).
  - **Spatial Density**: Bin density ranges between 15 and 25 bins per administrative zone. Nearest-neighbor distance analysis shows a mean adjacent bin distance of **168.27 meters** (median: 146.99 m), with a 5th-neighbor mean distance of **368.03 meters**.

---

## 3. Temporal Coverage & Granularity

- **Historical Observation Range**: `2025-09-01` to `2026-08-31` (365 calendar days, 1 full operational year).
- **Temporal Resolution**:
  - Daily aggregated zone generation: 12,045 daily zone records ($33 \text{ zones} \times 365 \text{ days}$).
  - Hourly sensor telemetry: Granular bin fill and generation time-series across all seasons (*Monsoon*, *Post-Monsoon*, *Winter*, *Summer*).
- **Temporal Features Available**: `timestamp`, `date`, `hour`, `day_of_week`, `is_weekend`, `month`, `season`, `holiday_flag`, `festival_flag`, `market_activity_level`, `event_activity_level`.

---

## 4. Waste Generation & Telemetry Fields

| Field Name | Source Dataset | Type | Description | Hotspot Detection Utility |
|------------|----------------|------|-------------|---------------------------|
| `latitude`, `longitude` | `ahmedabad_bins.csv` / `fill_history` | Float | GPS coordinates in degrees WGS84 | Primary spatial clustering inputs for DBSCAN |
| `zone_id`, `zone_name` | All datasets | String | Unique zone identifier and name | Administrative grouping and zone overlap analysis |
| `total_waste_kg` | `zone_waste_generation.csv` | Float | Total daily generated waste (kg) | Quantifies raw waste volume in hotspot |
| `avg_daily_generation_kg_14d` | `zone_waste_generation.csv` | Float | 14-day rolling historical baseline | Critical baseline for surge & deviation computation |
| `fill_percentage` / `average_bin_fill_percentage` | `bin_fill_history.csv` / `zone_waste` | Float | Sensor-measured bin volume capacity % | Measures bin accumulation stress |
| `overflow_count` | `zone_waste_generation.csv` / `fill_history` | Integer | Recorded bin overflow occurrences | Contributes directly to hotspot severity scoring |
| `anomaly_type` / `anomaly_count` | `anomaly_ground_truth.csv` | Categorical / Count | Flagged anomalies (e.g. dumping spikes) | Flags operational irregularities in hotspots |
| `waste_stream` | `bins.csv` / `composition.csv` | Categorical | Stream (Organic, Recyclable, Dry, Mixed) | Drives stream-specific recovery recommendations |
| `population_density`, `commercial_density` | `bins.csv` / `zone_waste` | Float | Zone demographic and commercial density | Contextual baseline normalization |

---

## 5. Data Quality, Missing Values, and Duplicates

- **Missing Values**:
  - `ahmedabad_bins.csv`: **0 missing values** across all 600 records and 19 columns.
  - `ahmedabad_zone_waste_generation.csv`: **0 missing values** in waste, fill, overflow, and density fields (107 records had missing `rainfall_mm` during dry winter days, imputed to 0.0).
  - `ahmedabad_anomaly_ground_truth.csv`: **0 missing values** across all 5,703 anomaly events.
- **Duplicate Records**: **0 duplicate rows** found across all key tables.
- **Data Hygiene**: Referential integrity confirmed across `bin_id` $\leftrightarrow$ `zone_id` $\leftrightarrow$ `zone_name`.

---

## 6. Spatial Distance Metric Formulation

Standard Euclidean distance on raw degree coordinates $(\Delta\text{lat}^2 + \Delta\text{lon}^2)^{1/2}$ distorts geographic distances because $1^\circ$ longitude varies by latitude ($\cos(23.03^\circ) \approx 0.9205$).

Therefore, the Hotspot Detection subsystem mandates:
1. **Haversine Distance**: $d_H(p_1, p_2) = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\theta}{2}\right) + \cos\theta_1 \cos\theta_2 \sin^2\left(\frac{\Delta\phi}{2}\right)}\right)$ with $R = 6,371.0088\text{ km}$.
2. **Radians Transformation**: Conversion of input decimal degrees to radians prior to DBSCAN execution.
3. **Calibrated Parameters**: Neighborhood radius $\varepsilon \in [0.6, 1.2]\text{ km}$ ($\varepsilon_{\text{rad}} = \varepsilon_{\text{km}} / 6371.0088$) and $\text{min\_samples} \in [3, 5]$ bins.

---

## 7. Conclusion & Audit Sign-Off

The existing Ahmedabad datasets are complete, leak-free, mathematically sound, and fully equipped for unsupervised density-based spatial clustering (DBSCAN) and multi-factor hotspot intensity characterization. No external synthetic data generation is required.
