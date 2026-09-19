# SmartBinX Backend — Ahmedabad Waste Intelligence

The backend service for **SmartBinX — AI-Powered Waste Intelligence, Collection & Recycling Optimizer (PS-11)**.

Built with **FastAPI**, **Pydantic v2**, and **SQLAlchemy**.

---

## 📁 Architecture & Directory Structure

```text
backend/
├── app/
│   ├── config.py                 # Pydantic BaseSettings, priority weights & city coordinates
│   ├── database.py               # SQLAlchemy engine & session dependency
│   ├── main.py                   # FastAPI entry point, CORS configuration & lifespan seeding
│   ├── models/                   # SQLAlchemy database entities
│   │   ├── entities.py           # Bin, Vehicle, Route, Alert, WasteClassification, etc.
│   │   └── __init__.py
│   ├── routes/                   # FastAPI route controllers (9 modules)
│   │   ├── bins.py               # /api/bins & /api/bins/{bin_code}/twin
│   │   ├── vehicles.py           # /api/vehicles & /api/vehicles/best-for-bin/{bin_code}
│   │   ├── routes.py             # /api/routes/optimize & /api/routes/replan
│   │   ├── waste.py              # /api/waste/classify & /api/waste/purity/{bin_code}
│   │   ├── predictions.py        # /api/predictions/{bin_code} & countdown timers
│   │   ├── analytics.py          # /api/analytics/hotspots, anomalies, & impact
│   │   ├── simulation.py         # /api/simulation/what-if & event-mode
│   │   ├── ai.py                 # /api/ai/query (Operations Copilot)
│   │   ├── demo.py               # /api/demo/run & step-by-step runner
│   │   └── __init__.py
│   ├── schemas/                  # Pydantic v2 data contracts for frontend
│   ├── services/                 # Pure Python intelligence & optimization engines
│   │   ├── data_store.py         # In-memory repository & auto-seeding engine
│   │   ├── priority_engine.py    # Multi-factor scoring (0-100) & XAI breakdown
│   │   ├── prediction_engine.py  # 6h/12h/24h forecasting & overflow countdown
│   │   ├── waste_intelligence.py # CV classifier & recycling purity calculator
│   │   ├── route_optimizer.py    # Capacitated vehicle routing (CVRP) & fleet matching
│   │   ├── replan_service.py     # Dynamic emergency route replanning
│   │   ├── anomaly_service.py    # Zone waste surge detection & hypotheses
│   │   ├── simulation_service.py # What-If simulator & Ahmedabad Event Mode
│   │   ├── ai_manager_service.py # Grounded decision support copilot
│   │   ├── demo_runner.py        # Scripted 10-step hackathon demo coordinator
│   │   └── __init__.py
│   └── utils/                    # Ahmedabad constants, depots, & Haversine geo helpers
├── requirements.txt              # Python dependencies
├── .env.example                  # Sample environment variables
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Activate Environment & Install Dependencies
```bash
# In backend/ directory:
python -m venv venv
.\venv\Scripts\activate       # On Windows
# source venv/bin/activate    # On macOS/Linux

pip install -r requirements.txt
```

### 2. Start the Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Open Interactive API Documentation
Once running, open your browser to test and inspect all endpoints:
- **Swagger UI:** 👉 [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc:** 👉 [`http://localhost:8000/redoc`](http://localhost:8000/redoc)
- **Health Check:** `http://localhost:8000/health`

---

## 💻 Frontend Integration Guide (For Saumya)

The backend has CORS enabled for all origins (`*`), specifically supporting Vite on `http://localhost:5173` and Next.js on `http://localhost:3000`.

### Key Endpoints & JavaScript `fetch` Examples

#### 1. Fetch All Bins (Filtered)
```javascript
const response = await fetch("http://localhost:8000/api/bins?zone=Bodakdev&min_fill=75");
const bins = await response.json();
console.log("Filtered Bins:", bins);
```

#### 2. Get Bin Digital Twin Profile
```javascript
const response = await fetch("http://localhost:8000/api/bins/AHM-104/twin");
const digitalTwin = await response.json();
console.log("Current State:", digitalTwin.current_state);
console.log("Predictions:", digitalTwin.predictions);
console.log("Waste Intelligence:", digitalTwin.waste_intelligence);
```

#### 3. Optimize Collection Route (CVRP)
```javascript
const response = await fetch("http://localhost:8000/api/routes/optimize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    vehicle_codes: ["V-01"],
    min_fill_threshold: 70.0
  })
});
const route = await response.json();
console.log("Optimized Route:", route.waypoints);
```

#### 4. Query AI Operations Copilot
```javascript
const response = await fetch("http://localhost:8000/api/ai/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "Why is Bin AHM-104 critical?"
  })
});
const aiResponse = await response.json();
console.log("Answer:", aiResponse.answer);
console.log("Action Cards:", aiResponse.cards);
```

#### 5. Execute 10-Step Automated Demo
```javascript
const response = await fetch("http://localhost:8000/api/demo/run", {
  method: "POST"
});
const demoResult = await response.json();
console.log("Demo Status:", demoResult.status);
console.log("All 10 Steps:", demoResult.steps);
```

---

## 🗄️ Database Configuration (For Ronak)

The backend uses **SQLAlchemy** and defaults to a local **SQLite** database (`sqlite:///./smartbinx.db`) with zero setup needed.

### Switching to PostgreSQL or Supabase
To connect to an external PostgreSQL or Supabase instance, create a `.env` file in `backend/`:

```env
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Priority Engine Weights (Optional Overrides)
WEIGHT_CURRENT_FILL=0.35
WEIGHT_OVERFLOW_RISK=0.30
WEIGHT_WASTE_TYPE=0.15
WEIGHT_LOCATION_SENSITIVITY=0.10
WEIGHT_GENERATION_RATE=0.10
```

When started with a PostgreSQL URL, FastAPI's startup lifespan will automatically execute `Base.metadata.create_all()` and populate all initial zones, 120+ bins, 12 vehicles, and active alerts.
