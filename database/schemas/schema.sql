-- ====================================================================
-- AI-Powered Waste Management & Recycling Optimizer (PS-11)
-- Database Schema: SQLite DDL
-- ====================================================================

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------
-- Table: bins
-- Stores smart waste bin metadata, locations, capacities, and states.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bins (
    bin_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id TEXT UNIQUE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT NOT NULL,
    capacity_liters REAL NOT NULL DEFAULT 240.0,
    bin_type TEXT NOT NULL DEFAULT 'general' CHECK (bin_type IN ('organic', 'recyclable', 'general', 'hazardous')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'full')),
    installation_date TEXT NOT NULL DEFAULT (DATE('now')),
    created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- --------------------------------------------------------------------
-- Table: fill_level_logs
-- Periodic sensor readings of bin fill percentage, weight, and battery.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fill_level_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bin_id INTEGER NOT NULL,
    fill_percentage REAL NOT NULL CHECK (fill_percentage >= 0.0 AND fill_percentage <= 100.0),
    weight_kg REAL NOT NULL DEFAULT 0.0,
    battery_level REAL NOT NULL DEFAULT 100.0 CHECK (battery_level >= 0.0 AND battery_level <= 100.0),
    status_flags TEXT DEFAULT 'NORMAL',
    recorded_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (bin_id) REFERENCES bins (bin_id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- Table: waste_categories
-- Master data for waste categories, material types, and guidelines.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waste_categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT UNIQUE NOT NULL,
    description TEXT,
    recycling_guidelines TEXT NOT NULL,
    avg_contamination_rate REAL DEFAULT 0.0,
    material_type TEXT NOT NULL
);

-- --------------------------------------------------------------------
-- Table: vehicles
-- Fleet vehicles used for municipal waste collection routes.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT UNIQUE NOT NULL,
    capacity_kg REAL NOT NULL,
    fuel_type TEXT NOT NULL DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'electric', 'cng', 'hybrid')),
    operational_status TEXT NOT NULL DEFAULT 'available' CHECK (operational_status IN ('available', 'on_route', 'maintenance', 'out_of_service')),
    assigned_driver TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- --------------------------------------------------------------------
-- Table: collection_records
-- Historical logs of bin collections, volumes emptied, and vehicles.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_records (
    collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bin_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    route_id TEXT NOT NULL,
    pickup_timestamp TEXT NOT NULL DEFAULT (DATETIME('now')),
    volume_emptied_liters REAL NOT NULL,
    weight_emptied_kg REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'skipped', 'in_progress')),
    FOREIGN KEY (bin_id) REFERENCES bins (bin_id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT
);

-- --------------------------------------------------------------------
-- Table: predictions
-- AI/ML predictions of fill levels and overflow risk probabilities.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bin_id INTEGER NOT NULL,
    predicted_fill_level REAL NOT NULL,
    overflow_risk_probability REAL NOT NULL CHECK (overflow_risk_probability >= 0.0 AND overflow_risk_probability <= 1.0),
    predicted_collection_due TEXT NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'v1.0.0',
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (bin_id) REFERENCES bins (bin_id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- Indexes for query optimization
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fill_logs_bin_timestamp ON fill_level_logs(bin_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_bins_status ON bins(status);
CREATE INDEX IF NOT EXISTS idx_predictions_bin_risk ON predictions(bin_id, overflow_risk_probability DESC);
CREATE INDEX IF NOT EXISTS idx_collection_route ON collection_records(route_id, pickup_timestamp);
