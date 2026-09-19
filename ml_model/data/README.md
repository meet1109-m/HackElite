# WasteWise AI — Synthetic Ahmedabad Municipal Waste Dataset

**Synthetic Ahmedabad-centric operational data generated for WasteWise AI model development and demonstration.**

> ### ⚠️ Synthetic-data disclaimer
> This dataset is **entirely synthetic**. It was produced by a stochastic simulation
> (`generator/simulate.py`) and contains **no real measurements**. It is **not** Ahmedabad
> Municipal Corporation (AMC) data, not derived from AMC data, and must never be presented,
> published or cited as official municipal data. Zone names, wards and landmarks are real
> public place names used to give the simulation a plausible geography; every quantity
> attached to them (waste volumes, fill levels, collections, vehicles, composition) is
> invented. The festival calendar is an approximate placeholder for the simulated window,
> not an authoritative civic calendar. No real person, household, employee or vehicle
> registration is represented — the data contains **no private citizen information**.
>
> Use it for prototyping, teaching and demonstration. Any operational or policy decision
> requires real, validated municipal data.

| | |
|---|---|
| `data_type` | synthetic |
| `city` | Ahmedabad |
| `state` | Gujarat |
| `country` | India |
| `generated_for` | WasteWise AI |
| Simulated period | 2025-09-01 → 2026-08-31 (365 days) |
| Random seed | 20260919 (fully reproducible) |

---

## 1. Purpose

The dataset supports six ML modules. **No image-classification data is included** — waste
images are handled by a separate dataset.

| # | Module | Primary file(s) | Target |
|---|---|---|---|
| 1 | Bin fill-level forecasting | `ahmedabad_bin_fill_history.csv` | `fill_percentage_6h / _12h / _24h` |
| 2 | Overflow risk / time-to-overflow | `ahmedabad_bin_fill_history.csv` | `hours_until_overflow` |
| 3 | Waste composition estimation | `ahmedabad_waste_composition.csv` | six `*_percentage` columns |
| 4 | Waste generation forecasting | `ahmedabad_zone_waste_generation.csv` | `total_waste_kg` (future day) |
| 5 | Generation anomaly detection | zone + fill history | unsupervised |
| 6 | Zone-level pattern analysis | `ahmedabad_zone_waste_generation.csv` | descriptive |

---

## 2. Files

| File | Rows | Grain |
|---|---:|---|
| `ahmedabad_bins.csv` | 600 | one row per bin (master) |
| `ahmedabad_vehicles.csv` | 70 | one row per vehicle (current snapshot) |
| `ahmedabad_bin_fill_history.csv` | 877,053 | one row per bin per 6-hour reading |
| `ahmedabad_collection_history.csv` | 262,242 | one row per collection stop |
| `ahmedabad_waste_composition.csv` | 55,823 | one row per sampled collection |
| `ahmedabad_zone_waste_generation.csv` | 12,045 | one row per zone per day |
| `ahmedabad_anomaly_ground_truth.csv` | 5,703 | **evaluation only — never a feature** |
| `generation_summary.json` | — | run statistics |
| `validation_report.json` | — | results of the 23 consistency checks |
| `dataset_metadata.json` | — | machine-readable metadata |
| `generator/` | — | source code that produced everything |

---

## 3. Geographic scope

All coordinates fall inside the Ahmedabad urban envelope: **latitude 22.95 – 23.12 N,
longitude 72.46 – 72.68 E**. Bins are clustered around their own zone centroid (maximum
bin-to-centroid distance **1.24 km**), so zones are spatially coherent rather than scattered
across Gujarat. 33 zones are modelled, each internally typed as residential, commercial,
market, industrial or mixed. **That type is never written to any file** — it is expressed only
through density, activity and generation feature values, so a model must infer zone behaviour
from data rather than read a label.

Vehicles operate out of six synthetic depots: Pirana, Gyaspur, Naroda, Vastral, Gota, Vasna.

---

## 4. Generation methodology

1. **Master data.** 600 bins allocated across 33 zones proportional to zone intensity.
   Capacity depends on setting — commercial, market and industrial locations skew to
   500/660/1000 kg containers, residential to 50–240 kg bins. `capacity_liters` is derived
   from `capacity_kg` using stream-specific apparent bulk density (organic 0.55 kg/L,
   mixed 0.40, commercial 0.35, dry 0.25, recyclable 0.22).
2. **Fill dynamics.** Each bin is simulated on a 6-hour grid. Generation in each window is:

   ```
   gen = base_daily × hour_share(zone_type, hour) × dow_multiplier(zone_type, weekday)
         × season × festival × local_event × rain × holiday × anomaly × lognormal_noise
   ```

   `base_daily` is scaled against the bin's own service rate, so a twice-daily bin receives
   roughly 0.85 × capacity per day and an alternate-day bin roughly 0.29 × capacity.
3. **Collections** fire on schedule, on a high-fill alert (≥86 %), or as a special festival
   round. A served stop drops fill to a random 3–14 % (partial stops to 22–44 %) — never to
   exactly zero. Stops can be MISSED, DELAYED or PARTIAL; heavy rain and peak festival days
   raise the miss rate.
4. **Composition** is drawn per bin-day from a zone/stream base profile through a Dirichlet
   sample, modulated by festival, season and rainfall, then re-noised at sampling time.
5. **Vehicles** are assigned to stops chronologically with running load accumulation and
   transfer-station tipping, so no truck ever carries more than its capacity.
6. **Imperfections** are applied last: sensor bias and noise, outages, delayed telemetry,
   duplicate packets and missing weather.

### Modelled behaviour by area type

| Type | Example zones | Behaviour |
|---|---|---|
| Residential | Bopal, Gota, Chandkheda, Nikol, Vastral, Ranip, Thaltej | Moderate generation, morning + evening peaks, high organic share, weekends **up ~10 %** |
| Commercial | CG Road, Navrangpura, Prahlad Nagar, Satellite, Ashram Road | High generation, strong daytime, more paper/plastic, weekends **down ~24 %** |
| Market | Maninagar, Jamalpur, Relief Road, Shahpur, Dariyapur | Very high organic, large swings, weekends **up ~24 %** |
| Industrial | Vatva, Odhav, Naroda, Saraspur | More dry/metal/other, strong working hours, Sunday **down ~32 %** |

Festival periods raise mean generation by **~19 %** overall, concentrated in market and
commercial zones (sensitivity 0.55 and 0.42) and muted in industrial zones (0.12).

---

## 5. Column dictionary

### 5.1 `ahmedabad_bins.csv`

| Column | Type | Units / values | Meaning |
|---|---|---|---|
| `bin_id` | str | `AMD-BIN-0001` | **PK**. Unique bin identifier |
| `zone_id` | str | `AMD-Z-01` | **FK** → zone. A bin belongs to exactly one zone |
| `zone_name` | str | e.g. Maninagar | Ahmedabad area name |
| `latitude` | float | degrees N | 22.95–23.12 |
| `longitude` | float | degrees E | 72.46–72.68 |
| `ward` | str | — | Administrative ward label |
| `bin_type` | str | Community Bin, Twin Bin Set, Skip Container, Underground Bin, Litter Bin, Compactor Bin | Physical container type |
| `capacity_kg` | int | kg | 50, 100, 150, 240, 500, 660, 1000 |
| `capacity_liters` | int | L | Derived from capacity_kg ÷ stream bulk density |
| `waste_stream` | str | Mixed, Organic, Dry, Recyclable, Commercial | Stream the bin collects |
| `installation_date` | date | YYYY-MM-DD | Before the simulation window |
| `collection_frequency` | str | twice_daily, daily, alternate_day | Scheduled service level |
| `nearby_landmark` | str | — | Public landmark for context |
| `population_density` | int | persons/km² | Catchment density |
| `commercial_density` | int | index 0–100 | Commercial intensity |
| `residential_density` | int | index 0–100 | Residential intensity |
| `market_area` | int | 0/1 | Bin sits in/next to a market |
| `sensitive_location` | int | 0/1 | Hospital, school or religious site nearby |
| `data_type` | str | synthetic | Provenance marker |

### 5.2 `ahmedabad_vehicles.csv`

| Column | Type | Units / values | Meaning |
|---|---|---|---|
| `vehicle_id` | str | `AMD-VEH-001` | **PK** |
| `vehicle_type` | str | Mini Tipper, Compactor Truck, Dumper Placer, Hopper Tipper, Refuse Collector | — |
| `capacity_kg` | int | kg | 1000–10000 |
| `current_load_kg` | float | kg | Snapshot load at end of window |
| `available_capacity_kg` | float | kg | `capacity_kg − current_load_kg` |
| `current_latitude` / `current_longitude` | float | degrees | Snapshot position near home depot |
| `home_depot` | str | DEP-PIRANA, DEP-GYASPUR, DEP-NARODA, DEP-VASTRAL, DEP-GOTA, DEP-VASNA | Base |
| `status` | str | ACTIVE, IDLE, MAINTENANCE, OFF_DUTY | Snapshot status |
| `fuel_type` | str | Diesel, CNG, Electric | — |
| `average_speed_kmph` | float | km/h | Effective urban speed |
| `data_type` | str | synthetic | Provenance marker |

### 5.3 `ahmedabad_bin_fill_history.csv` — main training table

Readings at **00:00, 06:00, 12:00, 18:00**. Each reading reflects accumulation **since the
previous reading**, so the 00:00 reading of date *D* covers 18:00–24:00 of *D−1* and is dated *D*.

| Column | Type | Units | Meaning |
|---|---|---|---|
| `record_id` | str | `AMD-FH-00000001` | Row id (duplicated on ~0.12 % simulated repeat packets) |
| `bin_id` | str | — | **FK** → `ahmedabad_bins` |
| `timestamp` | datetime | — | **Actual telemetry report time**, including jitter/delay |
| `date` | date | — | Nominal reading date |
| `hour` | int | 0/6/12/18 | Nominal slot hour |
| `day_of_week` | int | 0=Mon … 6=Sun | — |
| `is_weekend` | int | 0/1 | — |
| `month` | int | 1–12 | — |
| `season` | str | Winter, Summer, Monsoon, Post-Monsoon | Ahmedabad seasons |
| `zone_id`, `zone_name` | str | — | Denormalised zone |
| `latitude`, `longitude` | float | degrees | Denormalised bin position |
| `waste_stream` | str | — | Denormalised |
| `capacity_kg` | int | kg | Denormalised |
| `previous_collection_id` | str | — | **FK** → `ahmedabad_collection_history`. Empty during each bin's warm-up, before its first simulated collection |
| `previous_collection_timestamp` | datetime | — | Last collection **strictly before** this reading |
| `hours_since_collection` | float | h | `timestamp − previous_collection_timestamp` |
| `fill_percentage` | float | % of capacity | **Observed** level incl. sensor bias/noise. 0–135; >100 = overflowing |
| `estimated_weight_kg` | float | kg | ≈ `capacity_kg × fill_percentage / 100` ± noise |
| `daily_generation_kg` | float | kg | **Trailing** 24 h generation for this bin (leak-free) |
| `avg_daily_generation_kg` | float | kg/day | **Trailing 14 complete days** mean (leak-free) |
| `weather_condition` | str | Clear, Hot Clear, Cloudy, Humid Cloudy, Haze, Light Rain, Rain, Heavy Rain | City-level |
| `temperature_c` | float | °C | City-level daily |
| `rainfall_mm` | float | mm/day | City-level daily |
| `humidity` | float | % RH | City-level daily |
| `holiday_flag` | int | 0/1 | Public holiday |
| `festival_flag` | int | 0/1 | Inside a festival window |
| `festival_name` | str | e.g. Navratri, `None` | Festival label |
| `market_activity_level` | int | 0–5 | Local market intensity for that window |
| `event_activity_level` | int | 0–5 | Festival + local event intensity |
| **`fill_percentage_6h`** | float | % | **TARGET** — true fill 6 h later |
| **`fill_percentage_12h`** | float | % | **TARGET** — true fill 12 h later |
| **`fill_percentage_24h`** | float | % | **TARGET** — true fill 24 h later |
| **`hours_until_overflow`** | float | h | **TARGET** — hours until fill ≥ 100 %. `0` if already overflowing; **blank = right-censored** (no overflow within the 7-day scan horizon) |
| `split` | str | train, validation, test | Chronological split label |

> Targets are taken from the **clean** simulated trajectory while `fill_percentage` carries
> sensor noise. This is intentional: the model learns the physical state, not the noise.

### 5.4 `ahmedabad_collection_history.csv`

| Column | Type | Units | Meaning |
|---|---|---|---|
| `collection_id` | str | `AMD-COL-0000001` | **PK** |
| `bin_id` | str | — | **FK** → bins |
| `vehicle_id` | str | — | **FK** → vehicles |
| `zone_id`, `zone_name` | str | — | Denormalised |
| `collection_timestamp` | datetime | — | Actual stop time |
| `collection_date` | date | — | — |
| `pre_collection_fill_percentage` | float | % | Fill on arrival |
| `pre_collection_weight_kg` | float | kg | Weight on arrival |
| `post_collection_fill_percentage` | float | % | Fill on departure (3–14 % typical, 22–44 % partial) |
| `post_collection_weight_kg` | float | kg | Weight on departure |
| `collected_weight_kg` | float | kg | ≈ `pre − post` ± 2.5 % noise; `0` when MISSED |
| `collection_duration_minutes` | float | min | Scales with bin size |
| `vehicle_load_before_kg` / `vehicle_load_after_kg` | float | kg | Running truck load; drops when tipped at a transfer station |
| `collection_status` | str | COMPLETED, PARTIAL, DELAYED, MISSED | MISSED leaves the bin untouched |
| `overflow_before_collection` | int | 0/1 | Bin was ≥ 100 % on arrival |
| `trigger_reason` | str | SCHEDULED, HIGH_FILL_ALERT, EVENT_SPECIAL_ROUND | Why the stop happened |

### 5.5 `ahmedabad_waste_composition.csv`

| Column | Type | Units | Meaning |
|---|---|---|---|
| `composition_id` | str | `AMD-COMP-000001` | **PK** |
| `bin_id`, `zone_id`, `zone_name` | str | — | **FK** → bins / zone |
| `timestamp`, `date` | datetime/date | — | Sampling moment (= its collection) |
| `waste_stream` | str | — | Stream of the source bin |
| `plastic_percentage` … `other_percentage` | float | % by weight | Six shares, **sum exactly 100.00** |
| `total_waste_kg` | float | kg | Mass the sample describes (= `collected_weight_kg`) |
| `collection_id` | str | — | **FK** → collection history |
| `composition_source` | str | image_classifier, manual_audit, sensor_estimate | How it was derived |
| `confidence` | float | 0–1 | Source reliability (audits highest) |
| `split` | str | — | Chronological split label |

### 5.6 `ahmedabad_zone_waste_generation.csv`

| Column | Type | Units | Meaning |
|---|---|---|---|
| `record_id` | str | `AMD-ZW-000001` | **PK** |
| `date` | date | — | — |
| `zone_id`, `zone_name` | str | — | **FK** → zone |
| `total_waste_kg` | float | kg/day | Waste **generated** in the zone that day |
| `organic_` / `plastic_` / `paper_` / `metal_` / `glass_` / `other_waste_kg` | float | kg | Fractions; **sum = `total_waste_kg`** (≤0.01 % deviation) |
| `number_of_active_bins` | int | count | Bins reporting that day |
| `average_bin_fill_percentage` | float | % | Mean across all readings |
| `overflow_count` | int | count | Distinct overflow **episodes** (crossings of 100 %), not repeat readings |
| `collection_count` | int | count | Stops made in the zone |
| `population_density` | int | persons/km² | Zone-level |
| `commercial_density` | int | index 0–100 | Zone-level |
| `market_activity_level` | float | 0–5 | Daily mean |
| `holiday_flag`, `festival_flag` | int | 0/1 | — |
| `event_activity_level` | int | 0–5 | — |
| `rainfall_mm`, `temperature_c` | float | mm, °C | Daily weather |
| `avg_daily_generation_kg_14d` | float | kg | **Trailing** 14-day mean, excludes today (leak-free) |
| `split` | str | — | Chronological split label |

### 5.7 `ahmedabad_anomaly_ground_truth.csv` — evaluation only

`entity_type` (bin/zone), `entity_id`, `zone_id`, `date`, `anomaly_type`.

**Never join this into training features.** It exists so you can score an unsupervised
detector (precision/recall against known injected episodes).

---

## 6. Relationships

```
ahmedabad_bins (bin_id, zone_id)
   │  bin_id
   ├──────────────► ahmedabad_bin_fill_history (bin_id, previous_collection_id)
   │                         │ previous_collection_id
   │                         ▼
   ├──────────────► ahmedabad_collection_history (collection_id, bin_id, vehicle_id)
   │                         │ vehicle_id ──────► ahmedabad_vehicles
   │                         │ collection_id
   │                         ▼
   └──────────────► ahmedabad_waste_composition (bin_id, collection_id, zone_id)

zone_id ──► ahmedabad_zone_waste_generation (zone_id, date)
```

Referential integrity is verified: every bin has a valid zone, every collection a valid bin
**and** vehicle, every composition row a valid bin **and** collection. No broken keys.

---

## 7. Recommended features and targets

### Model 1 — Bin fill prediction (XGBoost / LightGBM / Random Forest)
**Inputs:** `fill_percentage`, `hours_since_collection`, `daily_generation_kg`,
`avg_daily_generation_kg`, `hour`, `day_of_week`, `is_weekend`, `month`, `season`, `zone_id`,
`waste_stream`, `capacity_kg`, `temperature_c`, `rainfall_mm`, `humidity`, `holiday_flag`,
`festival_flag`, `market_activity_level`, `event_activity_level`, plus bin attributes joined
from `ahmedabad_bins` (densities, `collection_frequency`, `market_area`).
**Targets:** `fill_percentage_6h`, `fill_percentage_12h`, `fill_percentage_24h`.

*Reference baseline* (HistGradientBoostingRegressor, 220 k train rows, 60 k test rows,
default settings, 24 h horizon): **R² ≈ 0.58, MAE ≈ 10.8 percentage points**, against
R² ≈ 0.14 for a persistence baseline and ≈ 0.00 for a mean baseline. This is an honest
reference point from the data, **not a claim about WasteWise AI's accuracy** — do not quote
model performance you have not measured yourself.

### Model 2 — Overflow prediction
Predict `hours_until_overflow` directly, or derive it from predicted fill. Blank values are
**right-censored**, not missing at random — either drop them, treat the problem as
classification (`will overflow within 24 h`), or use a survival model. A workable risk mapping:

| Risk | Rule |
|---|---|
| CRITICAL | predicted fill ≥ 100 % within 6 h |
| HIGH | within 12 h |
| MEDIUM | within 24 h |
| LOW | otherwise |

### Model 3 — Composition estimation
**Inputs:** zone, `waste_stream`, hour, day_of_week, month, historical composition for the
bin/zone, generation, densities, `market_activity_level`, `festival_flag`,
`collection_frequency`. **Targets:** the six percentages. Predict with a multi-output
regressor, or model five shares and derive the sixth; renormalise outputs to 100 %.

### Model 4 — Generation forecasting
Per zone, use lagged `total_waste_kg` (t−1, t−7, t−14), `avg_daily_generation_kg_14d`,
calendar, festival/holiday flags, weather and activity levels to predict the next day's
`total_waste_kg`. Build lags **within** each zone and never across the split boundary.

### Model 5 — Anomaly detection
Isolation Forest / LOF / One-Class SVM on engineered features: daily waste vs trailing mean,
fill rate per hour, collection interval, overflow frequency, composition deltas, overnight
generation share. Roughly **2.6 % of bin-days** and **72 zone-days** carry an injected
episode. Eight mechanisms are present: illegal dumping spikes, overnight dumping, collection
gaps, repeated overflow, composition shifts, weekend spikes, festival overload, zone surges.
Anomalies are expressed **only** through unusual feature combinations — there is no
`is_anomaly` column in any training file.

---

## 8. Train / validation / test split

Chronological, never random — the models must predict the future, not interpolate it.

| Split | Period | Share |
|---|---|---|
| **train** | 2025-09-01 → 2026-05-03 | ~70 % |
| **validation** | 2026-05-04 → 2026-07-02 | ~15 % |
| **test** | 2026-07-03 → 2026-08-31 | ~15 % |

Use the `split` column, or filter on `date`. Splits are verified non-overlapping and ordered.

---

## 9. Leakage prevention

- Forward-looking quantities exist **only** in the four documented target columns.
- `daily_generation_kg` and `avg_daily_generation_kg` are strictly **trailing** windows.
- `previous_collection_id` / `previous_collection_timestamp` always refer to a collection
  **strictly before** the reading — a reading never references a stop that happens later in
  its own window (verified: 0 violations).
- The anomaly ground truth lives in its own file, outside the training tables.

**Still your responsibility:** when you engineer lags or rolling features, group by `bin_id`
or `zone_id` and shift **backwards** only; fit scalers/encoders on the training split alone;
and never shuffle before splitting.

---

## 10. Data quality (deliberate imperfections)

| Artefact | Rate |
|---|---|
| Sensor outage (`fill_percentage` + `estimated_weight_kg` missing) | ~1.2 % of readings |
| Load-cell fault (`estimated_weight_kg` only) | ~0.6 % |
| Missing weather (`temperature_c`, `humidity`, `rainfall_mm`, `weather_condition`) | ~0.5–0.8 % |
| Missing `market_activity_level` | ~0.3 % |
| Delayed telemetry (timestamp 20–140 min late) | ~5.5 % |
| Duplicate packets (identical `record_id`) | ~0.12 % (1,053 rows) |
| Per-bin persistent sensor bias | σ ≈ 1.4 pp |
| Weight measurement noise | ±4 % |

Overall: **0.83 % of observable sensor cells** are missing and **3.76 % of rows** carry at
least one gap. Deduplicate on `record_id` if your pipeline needs unique keys.

---

## 11. Validation performed

23 programmatic checks all pass (see `validation_report.json`), covering: coordinate
plausibility and zone clustering; no negative quantities; fill within range; weight–capacity
consistency; composition summing to 100; zone fractions reconstructing zone totals; all four
foreign-key relationships; chronological timestamps; collections reducing fill; fill
increasing between collections (99.97 %); festival uplift (+18.7 %); anomaly prevalence
(2.57 %); absence of future-information features; chronological splits; and sufficient
variance for ML.

---

## 12. Known limitations

1. **Synthetic, not measured.** Absolute tonnages, densities and festival effects are
   plausible assumptions, not observations. Expect real Ahmedabad data to differ in level,
   in variance and in failure modes.
2. **600 bins is a pilot slice**, not full city coverage. City-wide totals cannot be inferred.
3. **Weather is city-wide**, not per zone — no local rainfall variation.
4. **The generative process is knowable.** A sufficiently flexible model can approach the
   simulator's own noise floor; performance here will be optimistic relative to reality.
5. **Zone type is latent but consistent** — real zones are far messier and change over time.
6. **No traffic, route, road-network or crew-roster data**, so route optimisation can only be
   demonstrated at the bin-location level.
7. **Vehicle rows are an end-of-window snapshot**, not a movement trace; positions are near
   depots, not on real routes.
8. **Composition is sampled from ~21 % of collections**, biased toward larger collections.
9. **`hours_until_overflow` is right-censored** at a 7-day horizon.
10. **One year means one observation per annual festival** — seasonal effects cannot be
    validated across years, and the test split (Jul–Aug) is monsoon-only, so test-set
    performance partly reflects a single season.
11. **No population growth, policy change, new infrastructure or bin decommissioning.**

---

## 13. Reproducing

```bash
cd generator
python3 simulate.py      # ~31 s, writes all CSVs
python3 validate.py      # runs the 23 checks + prints the summary
```

Set `WW_OUT` to change the output directory. The seed is fixed at 20260919, so runs are
byte-identical. Edit `config.py` to change zones, bin count, window or festival calendar.
