# WasteWise AI — Waste Hotspot Detection Report

**Module**: Waste Hotspot Detection & Spatial Intelligence  
**City Focus**: Ahmedabad Municipal Corporation (AMC), Gujarat, India  
**Subsystem Type**: Unsupervised Spatial Clustering & Multi-Factor Intelligence Engine  
**Algorithm**: Density-Based Spatial Clustering of Applications with Noise (DBSCAN) with Haversine Metric  
**Integration Status**: Production Ready (`src/hotspots/`, `POST /predict/hotspots`)

---

## 1. Problem Definition

Municipal waste accumulation across urban Ahmedabad is not uniformly distributed. Waste generation spikes dynamically due to commercial density, street markets (e.g., Manek Chowk, Relief Road), festive events (e.g., Navratri, Diwali, Uttarayan), and residential density variations. 

Standard static bin-emptying schedules often lead to two critical operational inefficiencies:
1. **Premature emptyings** of low-activity bins resulting in wasted fuel, excessive vehicle emissions, and driver fatigue.
2. **Delayed collections** in localized clusters of high-volume bins resulting in overflow spillage, localized health hazards, and citizen complaints.

**Objective**: Automatically discover geographic clusters of bins experiencing elevated waste generation, identify their severity and temporal dynamics (*Persistent*, *Emerging*, *Temporary*, *Declining*), forecast potential future hotspots via existing ML models, and generate explainable operational dispatch recommendations for the SmartBinX dashboard and routing engine.

---

## 2. Datasets Used

The module leverages existing Ahmedabad municipal operational datasets without requiring synthetic or artificial training data:
- `ahmedabad_bins.csv`: 600 smart bins across 33 municipal zones with exact WGS84 GPS coordinates (`latitude`, `longitude`), ward, stream, and density metadata.
- `ahmedabad_zone_waste_generation.csv`: 12,045 historical daily waste logs (2025-09-01 to 2026-08-31) providing 14-day rolling baselines (`avg_daily_generation_kg_14d`), fill averages, and overflow tallies.
- `ahmedabad_anomaly_ground_truth.csv`: 5,703 localized anomaly records capturing dumping surges and irregular accumulation events.
- `ahmedabad_bin_fill_history.csv` & `ahmedabad_waste_composition.csv`: Granular sensor fill histories and waste stream breakdowns.

---

## 3. Spatial & Temporal Feature Engineering

To prevent any data leakage, spatial and temporal metrics are calculated strictly on historical and observed windows:
- **Spatial Coordinates**: Converted to spherical radians for geodesic distance calculation:
  $$\theta = \text{radians}(\text{latitude}), \quad \phi = \text{radians}(\text{longitude})$$
- **Waste Metrics**:
  - `total_waste_kg`: Current observed/estimated waste weight in the cluster.
  - `baseline_waste_kg`: Historical expected waste baseline ($W_{\text{base}}$) derived from 14-day trailing averages.
  - `deviation_percent`: $\Delta\% = \frac{W - W_{\text{base}}}{\max(W_{\text{base}}, 1.0)} \times 100\%$
- **Telemetry & Infrastructure Metrics**:
  - `average_fill_percent`: Cluster mean bin fill level ($\%$).
  - `overflow_events`: Count of active or historical overflow incidents.
  - `anomaly_events`: Count of detected behavioral anomalies.
  - `affected_bins` & `affected_zones`: Spatial footprint of the cluster.
  - `primary_waste_stream`: Dominant waste stream (*Organic*, *Recyclable*, *Dry*, *Mixed*).

---

## 4. Algorithm Used: DBSCAN with Haversine Metric

The core clustering engine utilizes **DBSCAN** configured with the exact geodesic **Haversine metric**:
$$d_H(p_1, p_2) = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\theta}{2}\right) + \cos\theta_1 \cos\theta_2 \sin^2\left(\frac{\Delta\phi}{2}\right)}\right)$$
where $R = 6,371.0088\text{ km}$ (mean volumetric radius of Earth).

```python
from sklearn.cluster import DBSCAN
import numpy as np

coords_rad = np.radians(df[['latitude', 'longitude']].to_numpy(dtype=float))
eps_rad = eps_km / 6371.0088

db = DBSCAN(eps=eps_rad, min_samples=min_samples, metric='haversine', algorithm='ball_tree')
labels = db.fit_predict(coords_rad)
```

---

## 5. Why DBSCAN Was Selected (vs KMeans / HDBSCAN)

| Evaluation Factor | DBSCAN | KMeans | HDBSCAN |
|-------------------|--------|--------|---------|
| **Number of Clusters ($k$)** | **Discovered dynamically from density**; no prior $k$ required | Requires pre-specifying arbitrary $k$ beforehand | Discovered dynamically from density |
| **Cluster Geometry** | Identifies **arbitrary non-spherical shapes** conforming to road corridors and natural urban wards | Constrained strictly to isotropic spherical Voronoi partitions | Arbitrary density shapes |
| **Outlier / Noise Rejection** | Automatically isolates scattered bins as noise ($l = -1$) | Forces every distant isolated bin into a cluster | Isolates noise |
| **Geodesic Support** | Native `metric='haversine'` with `ball_tree` | Requires Euclidean coordinate projection | Computationally heavier, requires optional C extensions |
| **Computational Overhead** | Extremely fast ($< 15\text{ ms}$ for 600 bins) | Fast | Slower on large real-time payloads |

**Conclusion**: DBSCAN is the optimal clustering paradigm for municipal waste hotspots.

---

## 6. Parameter Selection & Tuning

Empirical nearest-neighbor distance distributions across Ahmedabad's 600 bins:
- 1st nearest neighbor mean distance: **168.27 meters**
- 5th nearest neighbor mean distance: **368.03 meters**

Parameter exploration over $\varepsilon \in [0.4\text{ km}, 1.5\text{ km}]$ and $\text{min\_samples} \in [3, 5]$:
- $\varepsilon = 0.4\text{ km}, \text{min\_samples} = 3 \implies 33\text{ clusters}, 32\text{ noise points}$ (Overly fragmented)
- $\varepsilon = 0.6\text{ km}, \text{min\_samples} = 3 \implies 19\text{ clusters}, 0\text{ noise points}$ (High granularity)
- $\varepsilon = 0.8\text{ km}, \text{min\_samples} = 3 \implies 14\text{ clusters}, 0\text{ noise points}$ (**Optimal city-scale default**)
- $\varepsilon = 1.5\text{ km}, \text{min\_samples} = 3 \implies 8\text{ clusters}$ (Coarse macro-zones)

**Default Production Configuration**:
- $\varepsilon = 0.8\text{ km}$ ($\approx 800\text{ m}$ catchment radius)
- $\text{min\_samples} = 3\text{ bins}$

---

## 7. Hotspot Intensity & Severity Methodology

Rather than merely outputting raw cluster indices, each hotspot is scored on a multi-factor scale $S \in [0, 100]$:

$$S = w_{\text{dev}} S_{\text{dev}} + w_{\text{fill}} S_{\text{fill}} + w_{\text{ovf}} S_{\text{ovf}} + w_{\text{anom}} S_{\text{anom}}$$

- **Component Weights**:
  - $w_{\text{dev}} = 0.35$ (Waste surge above historical baseline)
  - $w_{\text{fill}} = 0.30$ (Physical bin volume saturation)
  - $w_{\text{ovf}} = 0.20$ (Overflow event density)
  - $w_{\text{anom}} = 0.15$ (Operational / dumping anomaly density)

- **Configurable Severity Tiers**:
  - **`CRITICAL`** ($S \ge 75$ or `average_fill_percent` $\ge 92\%$ with overflows $\ge 2$): Severe spillage hazard requiring immediate emergency intervention.
  - **`HIGH`** ($55 \le S < 75$ or `average_fill_percent` $\ge 85\%$ or `deviation_percent` $\ge 50\%$): High risk of overflow; prioritize for expedited dispatch.
  - **`MEDIUM`** ($35 \le S < 55$ or `deviation_percent` $\ge 15\%$): Elevated activity above baseline; schedule standard morning clearance.
  - **`LOW`** ($S < 35$): Normal baseline waste generation; standard cycle monitoring.

---

## 8. Temporal Hotspot Dynamics Methodology

Hotspots are categorized across historical observation windows into four operational modes:
1. **`PERSISTENT`**: Waste generation consistently $> 15\%$ above baseline across $\ge 3$ consecutive periods. Represents structural urban growth or continuous high density.
2. **`EMERGING`**: Upward acceleration in generation ($\Delta W_t > \Delta W_{t-1} > 0$ and $> 40\%$ surge). Represents rapidly mounting collection demand.
3. **`TEMPORARY`**: Transient spike isolated to a festival, holiday market, or single anomaly event that reverts to baseline.
4. **`DECLINING`**: Generation contracting back toward or below baseline levels ($\Delta W_t < 0$).

---

## 9. Future Hotspot Forecasting Integration

To avoid duplicate model training, the Hotspot engine interfaces directly with the existing **Zone Waste Generation Forecaster** (`HistGradientBoostingRegressor`):
- For all zones in a detected hotspot, the existing forecaster estimates next-day waste $\hat{W}_{t+1}$.
- If $\hat{W}_{t+1} > W_{\text{base}} \times 1.20$, the cluster is flagged as an **Early Warning Future Hotspot** with projected growth rate and risk rating.

---

## 10. Explainable Recommendations Engine

Recommendations are generated deterministically based on real observed cluster telemetry:
- **Overflow & High Fill**: *"Increase collection frequency and inspect high-fill bins immediately."*
- **High Volumetric Surge**: *"Deploy high-capacity compactor vehicles to accommodate heavy volumetric load."*
- **Anomalies / Dumping**: *"Investigate abnormal waste generation and review area for unauthorized commercial dumping."*
- **Recyclable Streams**: *"Prioritize recyclable-material recovery and assign dedicated dry-waste collection vehicle."*

---

## 11. Example API Output (`POST /predict/hotspots`)

```json
{
  "status": "success",
  "total_bins_analyzed": 600,
  "hotspots_count": 14,
  "hotspots": [
    {
      "hotspot_id": "HS-001",
      "latitude": 23.032291,
      "longitude": 72.57262,
      "severity": "MEDIUM",
      "affected_bins": 252,
      "affected_zones": 14,
      "waste_generation_kg": 85687.02,
      "baseline_waste_kg": 89824.37,
      "deviation_percent": -4.61,
      "average_fill_percent": 46.61,
      "overflow_events": 0,
      "anomaly_events": 82,
      "trend": "TEMPORARY",
      "recommendation": "Deploy high-capacity compactor vehicles to accommodate heavy volumetric load. Investigate abnormal waste generation and review area for unauthorized commercial dumping.",
      "composite_score": 23.35,
      "primary_waste_stream": "Mixed"
    }
  ],
  "future_hotspots": [
    {
      "hotspot_id": "HS-001",
      "latitude": 23.032291,
      "longitude": 72.57262,
      "affected_zones": ["Navrangpura", "Paldi", "Vasna", "Naranpura", "Memnagar", "Ellis Bridge", "Ashram Road", "CG Road"],
      "current_severity": "LOW",
      "future_predicted_risk": "LOW",
      "forecasted_waste_kg": 53121.71,
      "forecast_deviation_percent": -40.9,
      "forecast_horizon": "next_day",
      "early_warning_alert": false
    }
  ],
  "summary": {
    "critical_hotspots": 0,
    "high_hotspots": 0,
    "medium_hotspots": 1,
    "low_hotspots": 13,
    "total_waste_in_hotspots_kg": 164680.1
  }
}
```

---

## 12. Limitations & Operating Constraints

1. **GPS Drift**: Sensor-reported coordinates with severe GPS noise ($> 1\text{ km}$) may distort boundary edges; pre-validation filtering removes unphysical coordinates.
2. **Dynamic Urban Changes**: Permanent road reconfigurations or newly installed bin clusters should be updated in `ahmedabad_bins.csv`.
3. **Unsupervised Nature**: Hotspot detection is strictly unsupervised spatial clustering combined with mathematical multi-factor scoring; it does not claim to be a supervised classifier.
