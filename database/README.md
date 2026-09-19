# SmartBinX Database Architecture & Operations

This directory contains the database schema definitions, operational seeding pipelines, and validation tooling for **SmartBinX** — AI-Powered Waste Management & Recycling Optimizer for Ahmedabad.

---

## 🏛️ 1. Architecture Overview

SmartBinX utilizes **SQLite** for zero-configuration, offline-first local persistence and high-speed in-memory testing during development and hackathon demonstrations.

- **Primary Target Database:** `backend/smartbinx.db`
- **Engine:** SQLite 3 (ACID compliant, relational integrity)
- **Constraint Enforcement:** `PRAGMA foreign_keys = ON;`
- **Indexes:** Strategic B-tree indexes applied on high-frequency query paths (`bins(zone)`, `bins(status)`, `bins(bin_code)`, `bin_readings(bin_id)`, `bin_readings(timestamp)`).
- **Geospatial Scope:** 10 core municipal wards in Ahmedabad, Gujarat, India centered around reference coordinates `23.0225° N, 72.5714° E`.

```text
database/
├── schemas/
│   └── schema.sql       # Complete SQLite DDL (9 tables, constraints, indexes)
├── seed/
│   ├── seed_data.py     # Standalone Python seeder (Ahmedabad operational data)
│   └── verify_db.py     # Automated table and row count verification script
└── README.md            # Database documentation and developer guide
```

---

## 📊 2. Entity Descriptions (9 Tables)

The database schema matches the backend FastAPI SQLAlchemy entity models 1-to-1:

| # | Table | Description | Key Attributes |
|---|---|---|---|
| 1 | **`zones`** | Municipal wards and administrative sectors in Ahmedabad. | `id`, `name` (UNIQUE), `zone_type`, `waste_generation`, `baseline_generation`, `footfall_estimate`, `center_lat`, `center_lng` |
| 2 | **`bins`** | Smart IoT waste bin units deployed across Ahmedabad wards. | `id`, `bin_code` (UNIQUE), `zone`, `latitude`, `longitude`, `capacity_kg`, `fill_percentage`, `estimated_weight`, `waste_stream` (*Organic, Recyclable, Mixed, Hazardous*), `status` (*Healthy, Filling, High Priority, Critical, Overflow Risk*), `priority_score`, `predicted_overflow_time`, `overflow_severity` (*Green, Yellow, Orange, Red*), `last_collection`, `created_at`, `updated_at` |
| 3 | **`bin_readings`** | Time-series telemetry readings recorded from bin weight and ultrasonic sensors. | `id`, `bin_id` (FK to `bins.id` ON DELETE CASCADE), `bin_code`, `timestamp`, `fill_percentage`, `weight` |
| 4 | **`vehicles`** | Municipal collection fleet stationed across 3 depots. | `id`, `vehicle_code` (UNIQUE, e.g. `V-01` to `V-12`), `capacity_kg`, `current_load`, `latitude`, `longitude`, `status` (*Available, On Route, Maintenance*), `assigned_route_id`, `updated_at` |
| 5 | **`routes`** | AI-optimized dynamic dispatch routes for collection vehicles. | `id`, `vehicle_id`, `vehicle_code`, `distance_km`, `estimated_duration_mins`, `load_kg`, `utilization_pct`, `waypoints_json` (Ordered stops array), `status`, `created_at` |
| 6 | **`collections`** | Historical audit logs of completed waste pickups. | `id`, `vehicle_id`, `bin_id`, `bin_code`, `weight_collected`, `waste_type`, `timestamp` |
| 7 | **`waste_classifications`** | Computer vision AI waste segregation breakdowns. | `id`, `bin_id`, `bin_code`, `image_url`, `plastic_percentage`, `paper_percentage`, `metal_percentage`, `glass_percentage`, `organic_percentage`, `other_percentage`, `confidence`, `source`, `created_at` |
| 8 | **`predictions`** | Machine learning forecasting fill levels and time-to-overflow. | `id`, `bin_id`, `bin_code`, `prediction_time`, `fill_6h`, `fill_12h`, `fill_24h`, `predicted_overflow_hours`, `confidence` |
| 9 | **`alerts`** | Real-time threshold alerts and anomalies. | `id`, `alert_type` (*Overflow Risk, Contamination, Anomaly*), `severity` (*Low, Medium, High, Critical*), `bin_id`, `bin_code`, `zone`, `message`, `status`, `created_at` |

---

## ⚡ 3. How to Re-Run the Seed Script

The seeding pipeline creates and populates the database using standard Python 3 standard libraries (`sqlite3`, `random`, `json`, `datetime`) without requiring third-party dependencies.

### From the Project Root Directory:
```bash
python database/seed/seed_data.py
```

### From the `database/` Directory:
```bash
python seed/seed_data.py
```

### What the Seeder Does:
1. Re-executes `database/schemas/schema.sql` to construct fresh tables and indexes.
2. Seeds **10 Ahmedabad Zones** (Navrangpura, Satellite, Bodakdev, Vastrapur, SG Highway, Maninagar, Paldi, Ashram Road, Sabarmati, Prahlad Nagar).
3. Seeds **125 Bins** across the 10 zones with realistic fill levels, including pinned demo bins:
   - **`AHM-104`** (Bodakdev): 82% fill, 31.4 kg, Organic, Status: Critical, Priority: 94, Overflow: "04h 18m", Severity: Red.
   - **`AHM-118`** (Navrangpura): 88% fill, 42.1 kg, Recyclable, Status: Critical, Priority: 91, Overflow: "04h 10m", Severity: Red.
   - **`AHM-156`** (Bodakdev): 96% fill, 38.5 kg, Mixed, Status: Overflow Risk, Priority: 98, Overflow: "00h 45m", Severity: Red.
4. Seeds **625 Telemetry Readings** (5 past readings per bin).
5. Seeds **12 Collection Vehicles** (`V-01` to `V-12`) stationed across Dudheshwar, Bodakdev, and Odhav municipal depots.
6. Seeds **Active Routes**, **Historical Pickups**, **Waste Classifications**, and **ML Predictions**.
7. Seeds **System Alerts** for immediate triage.

### Verifying Database Integrity:
Run the validation script at any time:
```bash
python database/seed/verify_db.py
```

---

## 🔍 4. Viewing the Database in VS Code (SQLite Viewer)

To visually explore the database tables, relations, and data inside VS Code:

1. **Install the Extension:**
   - Open the VS Code Extensions panel (`Ctrl+Shift+X` or `Cmd+Shift+X`).
   - Search for **SQLite Viewer** (by *Florian Klampfer* / ID: `qwtel.sqlite-viewer`).
   - Click **Install**.
2. **Open the Database:**
   - In the VS Code File Explorer, navigate to `backend/smartbinx.db`.
   - Left-click directly on `smartbinx.db`.
   - Alternatively, right-click `backend/smartbinx.db` and select **"Open With..."** → **"SQLite Viewer"**.
3. **Explore Data:**
   - Use the dropdown at the top to switch between tables (`bins`, `zones`, `vehicles`, `alerts`, etc.).
   - Sort, filter, and page through records interactively.

---

## 🔌 5. How the Backend Connects to `backend/smartbinx.db`

The FastAPI backend automatically reads and writes to `backend/smartbinx.db`:

1. **Environment Configuration (`backend/app/config.py`):**
   ```python
   DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartbinx.db")
   ```
   When the backend server runs with its working directory in `backend/`, the relative path `./smartbinx.db` immediately resolves to `backend/smartbinx.db`.

2. **Database Engine & Connection Pool (`backend/app/database.py`):**
   ```python
   connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
   engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
   SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
   ```
   The `check_same_thread: False` parameter ensures thread safety across FastAPI asynchronous endpoints.

3. **ORM Mapping (`backend/app/models/entities.py`):**
   SQLAlchemy Declarative Models map table columns and relationships to Python objects for API routes (`/api/bins`, `/api/vehicles`, `/api/alerts`, `/api/routes`, etc.).

4. **Dependency Injection:**
   Routes inject database sessions using the standard `get_db` FastAPI dependency:
   ```python
   @router.get("/api/bins")
   def get_bins(db: Session = Depends(get_db)):
       return db.query(Bin).all()
   ```
