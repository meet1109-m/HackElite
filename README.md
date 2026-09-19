# SmartBinX — AI-Powered Waste Intelligence, Dynamic Collection & Recycling Optimizer (PS-11)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite_5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PyTorch](https://img.shields.io/badge/ML-PyTorch_MobileNetV2-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=flat&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Leaflet](https://img.shields.io/badge/GIS-React--Leaflet-199900?style=flat&logo=leaflet&logoColor=white)](https://react-leaflet.js.org/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Target City](https://img.shields.io/badge/City-Ahmedabad_AMC-FF9933?style=flat)](https://ahmedabadcity.gov.in/)

An end-to-end municipal intelligence and decision-support platform engineered specifically for **Ahmedabad's urban waste management ecosystem (PS-11)**. SmartBinX bridges IoT sensor telemetry, machine learning forecasting, computer vision material classification, capacitated vehicle routing (CVRP), dynamic emergency replanning, and explainable AI (XAI) into an interactive municipal command center.

---

## 🌟 Executive Summary & Problem Statement (PS-11)

Municipal corporations face critical operational bottlenecks: overflowing bins, inefficient fixed collection schedules, high fuel consumption, and severe contamination in recyclable streams. **SmartBinX** solves these challenges through six integrated pillars:

1. **Real-Time IoT & GIS Telemetry:** Monitors 125 smart bins across 10 Ahmedabad zones and 3 collection depots with live fill levels, weights, and battery/sensor status.
2. **Multi-Horizon Predictive Forecasting:** Forecasts fill levels at 6h, 12h, and 24h horizons using gradient-boosted regression and calculates real-time overflow countdown timers.
3. **Explainable AI (XAI) Priority Engine:** Computes a transparent 0–100 priority score with point-by-point attribution (fill level, overflow risk, organic decay sensitivity, zone footfall, and collection recency).
4. **Capacitated Vehicle Routing (CVRP) & Dynamic Replanning:** Optimizes collection loops starting and ending at Ahmedabad depots, with zero-delay dynamic insertion of emergency bins (e.g., +2.2 km detour for bin overflowing in 45m).
5. **Hybrid Waste Intelligence:** Distinguishes between Computer Vision classification (`"AI Detected from Image"`) and historical zone estimation (`"AI Estimated"`), computing recycling purity and flagging contamination (<70%).
6. **Circularity & Scenario Simulation:** What-If fleet modeling and Ahmedabad Event Mode presets (Navratri at GMDC, Cricket at Motera Stadium, Diwali Shopping) with ESG impact metrics.

---

## 🏛️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         SMARTBINX WEB APPLICATION (FRONTEND)                     │
│               React 18 • Vite 5 • Tailwind CSS • React-Leaflet • Recharts        │
│                                                                                  │
│  [Command Center]   [Live Operations GIS]   [Bin Digital Twin]   [Route Optimizer]│
│  [Waste Vision]     [Recycling Purity]      [Analytics Hotspots] [What-If Sim]    │
│  [Event Sizing]     [AI Waste Manager]      [10-Step Demo]       [Settings]       │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST API / CORS (*)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND SERVICE                                │
│                     Python 3.10+ • Pydantic v2 • SQLAlchemy                      │
│                                                                                  │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────────────┐ │
│  │   Route Controllers  │ │ Intelligence Engines │ │   In-Memory Data Store    │ │
│  │  • /api/bins         │ │  • priority_engine   │ │  • 125 Bins (10 Zones)    │ │
│  │  • /api/vehicles     │ │  • prediction_engine │ │  • 3 Municipal Depots     │ │
│  │  • /api/routes       │ │  • waste_intelligence│ │  • 12 Collection Trucks   │ │
│  │  • /api/waste        │ │  • route_optimizer   │ │  • Pinned Demo Bins       │ │
│  │  • /api/predictions  │ │  • replan_service    │ │  • Active Routes & Alerts │ │
│  │  • /api/analytics    │ │  • anomaly_service   │ │  • Startup Auto-Seeding   │ │
│  │  • /api/simulation   │ │  • simulation_service│ └─────────────┬─────────────┘ │
│  │  • /api/ai           │ │  • ai_manager_service│               │               │
│  │  • /api/demo         │ │  • demo_runner       │               │               │
│  └──────────────────────┘ └──────────────────────┘               │               │
└────────────────────────────────────────┬─────────────────────────┴───────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌──────────────────────────────────┐            ┌──────────────────────────────────┐
│         DATABASE LAYER           │            │       MACHINE LEARNING LAYER     │
│   SQLite (Default Local) /       │            │  PyTorch (MobileNetV2 Image CV)  │
│   PostgreSQL / Supabase          │            │  HistGradientBoosting (Fill 24h) │
│  • Bins, Zones, Telemetry        │            │  NormalizedMultiHGB (Composition)│
│  • Vehicles, Routes, Alerts      │            │  IsolationForest (Anomalies)     │
└──────────────────────────────────┘            └──────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```text
bit_n_build/
├── frontend/                     # React 18 + Vite dashboard
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/           # Reusable UI cards, maps, modals, charts
│   │   ├── context/              # Global state management
│   │   ├── pages/                # 12 complete operational pages:
│   │   │   ├── CommandCenterPage.jsx       # Executive KPI overview
│   │   │   ├── LiveOperationsPage.jsx      # Ahmedabad GIS interactive map
│   │   │   ├── BinIntelligencePage.jsx     # Digital Twin & XAI breakdown
│   │   │   ├── RouteOptimizerPage.jsx      # CVRP routing & dynamic replan
│   │   │   ├── WasteVisionPage.jsx         # Computer vision image classifier
│   │   │   ├── RecyclingIntelligencePage.jsx # Stream purity & contamination
│   │   │   ├── AnalyticsHotspotsPage.jsx   # Heatmaps & zone anomaly detection
│   │   │   ├── WhatIfSimulatorPage.jsx     # Fleet sizing & scenario modeling
│   │   │   ├── EventPlacementPage.jsx      # Ahmedabad Event Mode presets
│   │   │   ├── AIWasteManagerPage.jsx      # Natural language operations copilot
│   │   │   ├── SettingsPage.jsx            # Threshold configs & demo launcher
│   │   │   └── LandingPage.jsx             # Public presentation & overview
│   │   ├── services/             # Axios / fetch API clients
│   │   ├── App.jsx               # Application routing & navigation
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Tailwind design system & tokens
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── backend/                      # FastAPI REST application
│   ├── app/
│   │   ├── config.py             # Settings, priority weights & city coordinates
│   │   ├── database.py           # SQLAlchemy engine & session dependency
│   │   ├── main.py               # FastAPI entry point, CORS & lifespan seeding
│   │   ├── models/               # SQLAlchemy ORM models:
│   │   │   ├── entities.py       # Bin, Zone, Vehicle, Route, Alert, etc.
│   │   │   └── __init__.py
│   │   ├── routes/               # 9 RESTful route controllers:
│   │   │   ├── bins.py           # /api/bins & /api/bins/{bin_code}/twin
│   │   │   ├── vehicles.py       # /api/vehicles & /api/vehicles/best-for-bin
│   │   │   ├── routes.py         # /api/routes/optimize & /api/routes/replan
│   │   │   ├── waste.py          # /api/waste/classify & /api/waste/purity
│   │   │   ├── predictions.py    # /api/predictions & overflow countdowns
│   │   │   ├── analytics.py      # /api/analytics/hotspots, anomalies, impact
│   │   │   ├── simulation.py     # /api/simulation/what-if & event-mode
│   │   │   ├── ai.py             # /api/ai/query (Operations Copilot)
│   │   │   ├── demo.py           # /api/demo/run & step-by-step runner
│   │   │   └── __init__.py       # Router registration helper
│   │   ├── schemas/              # Pydantic v2 request/response schemas
│   │   ├── services/             # Pure Python intelligence & optimization:
│   │   │   ├── data_store.py     # In-memory repository & auto-seeding engine
│   │   │   ├── priority_engine.py # Multi-factor scoring (0-100) & XAI breakdown
│   │   │   ├── prediction_engine.py # 6h/12h/24h forecasting & countdowns
│   │   │   ├── waste_intelligence.py # CV classifier & recycling purity
│   │   │   ├── route_optimizer.py # Capacitated vehicle routing (CVRP)
│   │   │   ├── replan_service.py # Dynamic emergency route replanning
│   │   │   ├── anomaly_service.py # Zone surge detection & hypotheses
│   │   │   ├── simulation_service.py # What-If simulator & Event Mode
│   │   │   ├── ai_manager_service.py # Grounded decision assistant
│   │   │   ├── demo_runner.py    # Scripted 10-step hackathon demo coordinator
│   │   │   └── __init__.py
│   │   └── utils/
│   │       ├── constants.py      # Ahmedabad zones, depots, waste streams
│   │       ├── geo.py            # Haversine distance & city bounding box
│   │       └── __init__.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── ml_model/                     # Machine Learning & Computer Vision layer
│   ├── data/                     # Raw, processed, and DSWD waste datasets
│   ├── models/                   # Pre-trained tabular model artifacts (.joblib)
│   │   ├── fill_prediction/      # HistGradientBoosting fill models (6h, 12h, 24h)
│   │   ├── composition/          # NormalizedMultiHGB composition estimator
│   │   ├── forecasting/          # Zone waste forecasting model
│   │   └── anomaly_detection/    # Isolation Forest anomaly model
│   ├── image_classification/     # PyTorch MobileNetV2 vision pipeline
│   │   ├── models/               # PyTorch weights (.pt) & class mappings
│   │   ├── src/                  # Dataset, model architecture, training, inference
│   │   └── reports/              # Confusion matrices & evaluation reports
│   ├── src/                      # Tabular feature engineering & predictors
│   ├── api/                      # Standalone ML FastAPI service
│   ├── reports/                  # Empirical evaluation reports & charts
│   ├── requirements.txt
│   └── README.md
│
├── database/                     # Database schemas, migrations & seed data
│   ├── migrations/               # Database migration scripts
│   ├── schemas/                  # Relational schema definitions
│   ├── seed/                     # Seed datasets for bins, vehicles, and zones
│   └── README.md
│
├── .gitignore                    # Unified Git ignore rules
└── README.md                     # Master project documentation
```

---

## 🚀 Key Features & Capabilities

### 1. Ahmedabad Domain & GIS Network
- **10 Core Municipal Zones:** Navrangpura, Satellite, Bodakdev, Vastrapur, SG Highway, Maninagar, Paldi, Ashram Road, Sabarmati, and Prahlad Nagar.
- **3 Strategic Municipal Depots:**
  - *Dudheshwar Central Depot* (`23.0450° N, 72.5780° E`)
  - *Bodakdev West Depot* (`23.0370° N, 72.5120° E`)
  - *Odhav East Depot* (`23.0230° N, 72.6510° E`)
- **Supported Waste Streams:** `Organic`, `Recyclable`, `Mixed`, `Hazardous`.

### 2. Pinned Demo Bins (Hackathon Specification)
| Bin Code | Zone | Fill % | Stream | Weight | Overflow Countdown | Priority Score | Status | Key Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`AHM-104`** | Bodakdev | 82.0% | Organic | 31.4 kg | 4h 18m | **94 / 100** | Critical | Primary demo triage target |
| **`AHM-118`** | Navrangpura | 88.0% | Recyclable | 34.2 kg | 4h 10m | **91 / 100** | High Priority | Recyclables contamination check |
| **`AHM-156`** | Bodakdev | 96.0% | Mixed | 48.0 kg | 45m | **98 / 100** | Overflow Risk | Dynamic route replan trigger |

### 3. Explainable AI (XAI) Priority Scoring
Configurable weights in [`backend/app/config.py`](backend/app/config.py):
$$\text{Priority} = 0.35 \times \text{Fill} + 0.30 \times \text{OverflowRisk} + 0.15 \times \text{WasteType} + 0.10 \times \text{ZoneSensitivity} + 0.10 \times \text{GenerationRate}$$
- Returns transparent point breakdown (`current_fill`, `predicted_overflow`, `high_generation_rate`, `organic_waste`, `time_since_collection`).
- Generates human-readable explanations (e.g., *"Critical priority (94/100) because high fill level (82%), overflow predicted in 4h 18m, organic waste sensitivity, high-generation zone (Bodakdev)."*).

### 4. Capacitated Vehicle Routing (CVRP) & Dynamic Replanning
- **Hard Payload Constraints:** Vehicles never exceed available payload capacity.
- **Depot-to-Depot Loops:** Starts and finishes at the nearest municipal depot.
- **Dynamic Emergency Replanning:** Evaluates all candidate insertion points for emergency bins, minimizing detour distance (+2.2 km for `AHM-156`) and avoiding critical overflows.

### 5. Hybrid Waste Intelligence & Recycling Purity
- **Dual Provenance Tagging:**
  - Computer Vision classification tagged `"source": "AI Detected from Image"`.
  - Zone/day historical estimation tagged `"source": "AI Estimated"`.
- **Recycling Purity Score:**
  $$\text{Purity} = \left(\frac{\text{Target Recyclable Material \%}}{\text{Total Volume \%}}\right) \times 100$$
- If purity $< 70\%$, triggers `⚠️ HIGH CONTAMINATION: Manual sorting recommended`.

### 6. Zone Anomaly Detection & Contextual Hypotheses
- Compares 24h totals against baselines (e.g., Bodakdev: +82% above baseline).
- Provides contextual hypotheses (commercial dining surge along Sindhu Bhavan Road, quick-commerce fulfillment centers, corporate bulk disposal).

### 7. What-If Simulator & Ahmedabad Event Mode
- **What-If Simulator:** Recalculates fleet utilization, average overflow risk, and total mileage under altered vehicle counts, capacities, and traffic conditions.
- **Ahmedabad Event Mode Presets:**
  - *Navratri at GMDC Ground / Vastrapur* (65,000 attendees, +145% waste, 35 temporary bins, 4 extra vehicles)
  - *Cricket Match at Narendra Modi Stadium (Motera)* (110,000 attendees, +220% waste, 55 temporary bins, 6 extra vehicles)
  - *Diwali Shopping at CG Road / Law Garden* (85,000 attendees, +110% waste, 28 temporary bins, 3 extra vehicles)

### 8. Grounded AI Operations Copilot
- Natural language query endpoint (`/api/ai/query`) answering operational questions with markdown answers, actionable UI cards, and concrete dispatch recommendations.
- Local deterministic fallback ensures 100% uptime with zero external LLM API key dependencies.

### 9. Scripted 10-Step Automated Hackathon Demo
- End-to-end execution of the complete 10-step hackathon narrative:
  `Fill Surge (AHM-104) → Overflow Countdown → Priority 96/100 → System Alert → Waste Vision (62% Plastic) → Vehicle V-01 Match → CVRP Route Dispatch → Emergency Influx (AHM-156) → Dynamic Replanning (+2.2 km) → Circularity & ESG Impact`.

---

## ⚡ Getting Started & Quickstart

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the Backend Service
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # On Windows (PowerShell)
# source venv/bin/activate    # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger UI:** 👉 [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

---

### Step 2: Start the Frontend Dashboard
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
- **Frontend Dashboard:** 👉 [`http://localhost:5173`](http://localhost:5173)

---

### Step 3 (Optional): Start the Standalone ML Service
```bash
# In a separate terminal:
cd ml_model
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8001
```
- **ML API Documentation:** `http://localhost:8001/docs`

---

## 🌐 API Route Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/` | Service metadata, status, and docs link |
| **System** | `GET` | `/health` | System liveness probe (`{"status": "ok"}`) |
| **Bins** | `GET` | `/api/bins` | List 125 bins with `zone`, `status`, `min_fill` filters |
| **Bins** | `GET` | `/api/bins/{bin_code}` | Single bin live telemetry & metadata |
| **Bins** | `GET` | `/api/bins/{bin_code}/twin` | Complete Digital Twin profile |
| **Bins** | `GET` | `/api/bins/{bin_code}/readings` | Historical telemetry readings for charts |
| **Vehicles** | `GET` | `/api/vehicles` | List all 12 collection trucks with loads and status |
| **Vehicles** | `GET` | `/api/vehicles/best-for-bin/{bin_code}` | Optimal vehicle match with capacity & distance check |
| **Routes** | `POST` | `/api/routes/optimize` | Generate capacity-constrained CVRP route |
| **Routes** | `POST` | `/api/routes/replan` | Dynamically insert emergency bin into active route |
| **Routes** | `GET` | `/api/routes/active` | Retrieve all active fleet routes |
| **Waste** | `POST` | `/api/waste/classify` | Vision classification (`AI Detected from Image`) |
| **Waste** | `GET` | `/api/waste/composition/{bin_code}` | Estimated composition (`AI Estimated`) |
| **Waste** | `GET` | `/api/waste/purity/{bin_code}` | Recycling purity score & contamination check |
| **Predictions** | `GET` | `/api/predictions/{bin_code}` | 6h, 12h, 24h fill forecasts |
| **Predictions** | `GET` | `/api/predictions/{bin_code}/countdown` | Overflow countdown timer & severity color |
| **Analytics** | `GET` | `/api/analytics/hotspots` | Zone generation heatmaps and baseline comparisons |
| **Analytics** | `GET` | `/api/analytics/anomalies` | Generation surges with explainable hypotheses |
| **Analytics** | `GET` | `/api/analytics/impact` | ESG circularity metrics (CO2e, fuel, diversion) |
| **Simulation** | `POST` | `/api/simulation/what-if` | Scenario simulation (fleet size, traffic, waste delta) |
| **Simulation** | `POST` | `/api/simulation/event-mode` | Ahmedabad Event Mode resource sizing |
| **AI Copilot** | `POST` | `/api/ai/query` | Natural-language query returning action cards |
| **Demo Runner** | `POST` | `/api/demo/run` | Execute complete 10-step automated hackathon demo |
| **Demo Runner** | `GET` | `/api/demo/step/{step_number}` | Execute and inspect single demo step (1 to 10) |
| **Demo Runner** | `POST` | `/api/demo/reset` | Reset demo state and operational data store |

---

## 🌿 Environmental & Circularity Impact

Based on optimized dynamic collection compared against static legacy rounds:

- **Distance Avoided:** **23.4 km** per collection shift
- **Fuel Conserved:** **5.1 Liters** of diesel saved
- **CO2e Emissions Prevented:** **12.4 kg CO2e**
- **Landfill Diversion Rate:** **64.0%**
- **Circularity Score:** **82 / 100**

---

## 👥 Team & Collaboration Workflow

1. **Repository:** [`https://github.com/meet1109-m/HackElite`](https://github.com/meet1109-m/HackElite)
2. **Branching Strategy:**
   - `main`: Stable, production-ready code
   - `feature/frontend-...`: UI/UX, components, and pages
   - `feature/backend-...`: API controllers, services, database models
   - `feature/ml-...`: Model training, pipelines, and vision models
3. **Module Separation:**
   - Keep frontend, backend, ML model, and database code strictly within their respective folders.
   - Do not commit virtual environments (`venv`), dependencies (`node_modules`), or temporary model cache files.
