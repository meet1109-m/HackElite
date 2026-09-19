-- ====================================================================
-- SmartBinX - AI-Powered Waste Management & Recycling Optimizer
-- Database Schema: SQLite DDL
-- ====================================================================

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------
-- Table: zones
-- City zone metadata, baseline generation rates, and coordinates.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    zone_type TEXT,
    waste_generation REAL,
    baseline_generation REAL,
    footfall_estimate INTEGER,
    center_lat REAL,
    center_lng REAL
);

-- --------------------------------------------------------------------
-- Table: bins
-- Smart waste bin profiles, statuses, priority scores, and locations.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bins (
    id TEXT PRIMARY KEY,
    bin_code TEXT UNIQUE,
    zone TEXT,
    latitude REAL,
    longitude REAL,
    capacity_kg REAL,
    fill_percentage REAL,
    estimated_weight REAL,
    waste_stream TEXT,
    status TEXT,
    priority_score INTEGER,
    predicted_overflow_time TEXT,
    overflow_severity TEXT,
    last_collection TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- --------------------------------------------------------------------
-- Table: bin_readings
-- Time-series telemetry readings recorded from IoT bin sensors.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bin_readings (
    id TEXT PRIMARY KEY,
    bin_id TEXT,
    bin_code TEXT,
    timestamp TIMESTAMP,
    fill_percentage REAL,
    weight REAL,
    FOREIGN KEY (bin_id) REFERENCES bins (id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- Table: vehicles
-- Fleet vehicles, operational status, capacity, and route assignments.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    vehicle_code TEXT UNIQUE,
    capacity_kg REAL,
    current_load REAL,
    latitude REAL,
    longitude REAL,
    status TEXT,
    assigned_route_id TEXT,
    updated_at TIMESTAMP
);

-- --------------------------------------------------------------------
-- Table: routes
-- Optimized dynamic collection routes, loads, and waypoints JSON.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT,
    vehicle_code TEXT,
    distance_km REAL,
    estimated_duration_mins INTEGER,
    load_kg REAL,
    utilization_pct REAL,
    waypoints_json TEXT,
    status TEXT,
    created_at TIMESTAMP
);

-- --------------------------------------------------------------------
-- Table: collections
-- Historical logs of completed waste pickups.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT,
    bin_id TEXT,
    bin_code TEXT,
    weight_collected REAL,
    waste_type TEXT,
    timestamp TIMESTAMP
);

-- --------------------------------------------------------------------
-- Table: waste_classifications
-- Computer vision waste classifications with material breakdown.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waste_classifications (
    id TEXT PRIMARY KEY,
    bin_id TEXT,
    bin_code TEXT,
    image_url TEXT,
    plastic_percentage REAL,
    paper_percentage REAL,
    metal_percentage REAL,
    glass_percentage REAL,
    organic_percentage REAL,
    other_percentage REAL,
    confidence REAL,
    source TEXT,
    created_at TIMESTAMP
);

-- --------------------------------------------------------------------
-- Table: predictions
-- ML forecasted fill levels (6h, 12h, 24h) and overflow estimates.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    bin_id TEXT,
    bin_code TEXT,
    prediction_time TIMESTAMP,
    fill_6h REAL,
    fill_12h REAL,
    fill_24h REAL,
    predicted_overflow_hours REAL,
    confidence REAL
);

-- --------------------------------------------------------------------
-- Table: alerts
-- Real-time notifications and threshold alerts for bins and zones.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    alert_type TEXT,
    severity TEXT,
    bin_id TEXT,
    bin_code TEXT,
    zone TEXT,
    message TEXT,
    status TEXT,
    created_at TIMESTAMP
);

-- --------------------------------------------------------------------
-- Indexes for query optimization
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bins_zone ON bins(zone);
CREATE INDEX IF NOT EXISTS idx_bins_status ON bins(status);
CREATE INDEX IF NOT EXISTS idx_bins_bin_code ON bins(bin_code);
CREATE INDEX IF NOT EXISTS idx_bin_readings_bin_id ON bin_readings(bin_id);
CREATE INDEX IF NOT EXISTS idx_bin_readings_timestamp ON bin_readings(timestamp);
