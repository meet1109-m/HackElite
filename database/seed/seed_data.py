#!/usr/bin/env python3
"""SmartBinX SQLite Database Seeder for Ahmedabad Operational Data.

This script executes `database/schemas/schema.sql` and populates `backend/smartbinx.db`
with complete, highly realistic synthetic operational data tailored for the SmartBinX
hackathon demo (PS-11).
"""

import os
import sys
import json
import random
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path


def get_utcnow() -> datetime:
    """Return timezone-naive UTC datetime for consistent SQLite timestamps."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ==============================================================================
# Path Configuration
# ==============================================================================
SCRIPT_DIR = Path(__file__).resolve().parent
DB_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = DB_DIR.parent
SCHEMA_PATH = DB_DIR / "schemas" / "schema.sql"
TARGET_DB_PATH = PROJECT_ROOT / "backend" / "smartbinx.db"


# ==============================================================================
# Ahmedabad Domain Constants
# ==============================================================================
AHMEDABAD_ZONES = [
    {
        "id": "zone-navrangpura",
        "name": "Navrangpura",
        "zone_type": "Commercial & Educational",
        "waste_generation": 750.0,
        "baseline_generation": 750.0,
        "footfall_estimate": 12000,
        "center_lat": 23.0373,
        "center_lng": 72.5524,
    },
    {
        "id": "zone-satellite",
        "name": "Satellite",
        "zone_type": "Dense Residential",
        "waste_generation": 820.0,
        "baseline_generation": 820.0,
        "footfall_estimate": 9500,
        "center_lat": 23.0304,
        "center_lng": 72.5177,
    },
    {
        "id": "zone-bodakdev",
        "name": "Bodakdev",
        "zone_type": "Commercial & Upscale Residential",
        "waste_generation": 900.0,
        "baseline_generation": 900.0,
        "footfall_estimate": 11000,
        "center_lat": 23.0396,
        "center_lng": 72.5065,
    },
    {
        "id": "zone-vastrapur",
        "name": "Vastrapur",
        "zone_type": "Commercial & Recreational",
        "waste_generation": 780.0,
        "baseline_generation": 780.0,
        "footfall_estimate": 10500,
        "center_lat": 23.0350,
        "center_lng": 72.5293,
    },
    {
        "id": "zone-sg-highway",
        "name": "SG Highway",
        "zone_type": "Commercial Corridor & IT",
        "waste_generation": 1100.0,
        "baseline_generation": 1100.0,
        "footfall_estimate": 15000,
        "center_lat": 23.0270,
        "center_lng": 72.5020,
    },
    {
        "id": "zone-maninagar",
        "name": "Maninagar",
        "zone_type": "High-Density Residential & Transit",
        "waste_generation": 850.0,
        "baseline_generation": 850.0,
        "footfall_estimate": 13000,
        "center_lat": 22.9978,
        "center_lng": 72.6033,
    },
    {
        "id": "zone-paldi",
        "name": "Paldi",
        "zone_type": "Institutional & Residential",
        "waste_generation": 650.0,
        "baseline_generation": 650.0,
        "footfall_estimate": 8000,
        "center_lat": 23.0125,
        "center_lng": 72.5625,
    },
    {
        "id": "zone-ashram-road",
        "name": "Ashram Road",
        "zone_type": "Financial & Riverfront Commercial",
        "waste_generation": 950.0,
        "baseline_generation": 950.0,
        "footfall_estimate": 14000,
        "center_lat": 23.0338,
        "center_lng": 72.5714,
    },
    {
        "id": "zone-sabarmati",
        "name": "Sabarmati",
        "zone_type": "Transit & Mixed Residential",
        "waste_generation": 600.0,
        "baseline_generation": 600.0,
        "footfall_estimate": 7000,
        "center_lat": 23.0818,
        "center_lng": 72.5938,
    },
    {
        "id": "zone-prahlad-nagar",
        "name": "Prahlad Nagar",
        "zone_type": "Corporate Hub & Retail",
        "waste_generation": 880.0,
        "baseline_generation": 880.0,
        "footfall_estimate": 12500,
        "center_lat": 23.0135,
        "center_lng": 72.5075,
    },
]

DEPOTS = {
    "Dudheshwar": {"code": "DEPOT-01", "name": "Dudheshwar Central Depot", "lat": 23.0450, "lng": 72.5780},
    "Bodakdev": {"code": "DEPOT-02", "name": "Bodakdev West Depot", "lat": 23.0370, "lng": 72.5120},
    "Odhav": {"code": "DEPOT-03", "name": "Odhav East Depot", "lat": 23.0230, "lng": 72.6510},
}


# ==============================================================================
# Seeding Functions
# ==============================================================================
def create_database(db_path: Path, schema_path: Path) -> sqlite3.Connection:
    """Ensure target directory exists, initialize DB and apply schema DDL."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Clean recreate if exists
    if db_path.exists():
        try:
            os.remove(db_path)
        except OSError:
            pass

    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON;")

    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found at: {schema_path}")

    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn.executescript(schema_sql)
    return conn


def seed_zones(conn: sqlite3.Connection) -> int:
    """Seed 10 Ahmedabad Zones."""
    sql = """
        INSERT INTO zones (id, name, zone_type, waste_generation, baseline_generation, footfall_estimate, center_lat, center_lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    params = [
        (
            z["id"],
            z["name"],
            z["zone_type"],
            z["waste_generation"],
            z["baseline_generation"],
            z["footfall_estimate"],
            z["center_lat"],
            z["center_lng"],
        )
        for z in AHMEDABAD_ZONES
    ]
    conn.executemany(sql, params)
    return len(params)


def seed_bins_and_related(conn: sqlite3.Connection) -> dict:
    """Seed exactly 125 bins across 10 zones including 3 pinned demo bins,

    along with corresponding telemetry readings, predictions, and classifications.
    """
    rng = random.Random(42)  # Deterministic seed for reproducible testing
    now = get_utcnow()

    # Exact Pinned Demo Bins as requested in PS-11 specifications:
    pinned_bins = {
        "AHM-104": {
            "id": "bin-ahm-104",
            "bin_code": "AHM-104",
            "zone": "Bodakdev",
            "latitude": 23.0373,
            "longitude": 72.5119,
            "capacity_kg": 40.0,
            "fill_percentage": 82.0,
            "estimated_weight": 31.4,
            "waste_stream": "Organic",
            "status": "Critical",
            "priority_score": 94,
            "predicted_overflow_time": "04h 18m",
            "overflow_severity": "Red",
            "last_collection": "2026-09-19 06:30:00",
            "created_at": (now - timedelta(days=20)).strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        },
        "AHM-118": {
            "id": "bin-ahm-118",
            "bin_code": "AHM-118",
            "zone": "Navrangpura",
            "latitude": 23.0365,
            "longitude": 72.5611,
            "capacity_kg": 50.0,
            "fill_percentage": 88.0,
            "estimated_weight": 42.1,
            "waste_stream": "Recyclable",
            "status": "Critical",
            "priority_score": 91,
            "predicted_overflow_time": "04h 10m",
            "overflow_severity": "Red",
            "last_collection": "2026-09-19 05:45:00",
            "created_at": (now - timedelta(days=25)).strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        },
        "AHM-156": {
            "id": "bin-ahm-156",
            "bin_code": "AHM-156",
            "zone": "Bodakdev",
            "latitude": 23.0390,
            "longitude": 72.5150,
            "capacity_kg": 40.0,
            "fill_percentage": 96.0,
            "estimated_weight": 38.5,
            "waste_stream": "Mixed",
            "status": "Overflow Risk",
            "priority_score": 98,
            "predicted_overflow_time": "00h 45m",
            "overflow_severity": "Red",
            "last_collection": "2026-09-18 22:15:00",
            "created_at": (now - timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        },
    }

    zone_lookup = {z["name"]: z for z in AHMEDABAD_ZONES}
    zone_names = list(zone_lookup.keys())

    # Build 125 bins total (AHM-101 to AHM-225)
    bins_data = []
    total_bins_target = 125

    for i in range(101, 101 + total_bins_target):
        code = f"AHM-{i}"
        if code in pinned_bins:
            bins_data.append(pinned_bins[code])
        else:
            zone_name = zone_names[(i - 101) % len(zone_names)]
            zinfo = zone_lookup[zone_name]

            # Realistic spatial jitter (~200m - 800m)
            lat = round(zinfo["center_lat"] + rng.uniform(-0.0075, 0.0075), 5)
            lng = round(zinfo["center_lng"] + rng.uniform(-0.0075, 0.0075), 5)

            capacity = rng.choice([40.0, 50.0, 60.0, 80.0, 100.0])
            fill_pct = round(rng.uniform(15.0, 92.0), 1)
            density = rng.uniform(0.70, 0.95)
            weight = round((fill_pct / 100.0) * capacity * density, 1)

            stream = rng.choices(
                ["Organic", "Recyclable", "Mixed", "Hazardous"],
                weights=[0.40, 0.35, 0.20, 0.05],
                k=1,
            )[0]

            if fill_pct >= 90.0:
                status = "Critical"
                severity = "Red"
                overflow_hours = rng.uniform(0.5, 3.0)
                priority = rng.randint(86, 96)
            elif fill_pct >= 75.0:
                status = "High Priority"
                severity = "Orange"
                overflow_hours = rng.uniform(3.0, 7.5)
                priority = rng.randint(70, 85)
            elif fill_pct >= 50.0:
                status = "Filling"
                severity = "Yellow"
                overflow_hours = rng.uniform(8.0, 18.0)
                priority = rng.randint(40, 69)
            else:
                status = "Healthy"
                severity = "Green"
                overflow_hours = rng.uniform(18.0, 36.0)
                priority = rng.randint(15, 39)

            if overflow_hours < 1.0:
                pred_overflow = f"{int(overflow_hours * 60):02d}m"
            elif overflow_hours < 24.0:
                hrs = int(overflow_hours)
                mins = int((overflow_hours - hrs) * 60)
                pred_overflow = f"{hrs:02d}h {mins:02d}m"
            else:
                pred_overflow = ">24h"

            last_coll_hours_ago = rng.randint(2, 36)
            last_coll_time = (now - timedelta(hours=last_coll_hours_ago)).strftime("%Y-%m-%d %H:%M:%S")

            bins_data.append({
                "id": f"bin-{code.lower()}",
                "bin_code": code,
                "zone": zone_name,
                "latitude": lat,
                "longitude": lng,
                "capacity_kg": capacity,
                "fill_percentage": fill_pct,
                "estimated_weight": weight,
                "waste_stream": stream,
                "status": status,
                "priority_score": priority,
                "predicted_overflow_time": pred_overflow,
                "overflow_severity": severity,
                "last_collection": last_coll_time,
                "created_at": (now - timedelta(days=rng.randint(10, 45))).strftime("%Y-%m-%d %H:%M:%S"),
                "updated_at": (now - timedelta(minutes=rng.randint(2, 50))).strftime("%Y-%m-%d %H:%M:%S"),
            })

    # Insert Bins
    bin_insert_sql = """
        INSERT INTO bins (
            id, bin_code, zone, latitude, longitude, capacity_kg, fill_percentage,
            estimated_weight, waste_stream, status, priority_score,
            predicted_overflow_time, overflow_severity, last_collection, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    conn.executemany(
        bin_insert_sql,
        [
            (
                b["id"],
                b["bin_code"],
                b["zone"],
                b["latitude"],
                b["longitude"],
                b["capacity_kg"],
                b["fill_percentage"],
                b["estimated_weight"],
                b["waste_stream"],
                b["status"],
                b["priority_score"],
                b["predicted_overflow_time"],
                b["overflow_severity"],
                b["last_collection"],
                b["created_at"],
                b["updated_at"],
            )
            for b in bins_data
        ],
    )

    # Insert Telemetry Readings (5 time-series steps per bin = 625 readings)
    readings = []
    for b in bins_data:
        curr_fill = b["fill_percentage"]
        curr_wt = b["estimated_weight"]
        for step in range(4, -1, -1):
            t_stamp = (now - timedelta(hours=step * 3)).strftime("%Y-%m-%d %H:%M:%S")
            sim_fill = max(8.0, round(curr_fill - (step * rng.uniform(3.5, 6.5)), 1))
            sim_wt = max(2.0, round(curr_wt * (sim_fill / max(1.0, curr_fill)), 1))
            readings.append((
                f"read-{b['bin_code'].lower()}-{step}",
                b["id"],
                b["bin_code"],
                t_stamp,
                sim_fill,
                sim_wt,
            ))

    conn.executemany(
        "INSERT INTO bin_readings (id, bin_id, bin_code, timestamp, fill_percentage, weight) VALUES (?, ?, ?, ?, ?, ?)",
        readings,
    )

    # Insert Predictions (ML forecasts for 6h, 12h, 24h)
    predictions = []
    for b in bins_data:
        fill = b["fill_percentage"]
        fill_rate = rng.uniform(2.5, 5.0) if b["zone"] in ["SG Highway", "Bodakdev", "Navrangpura"] else rng.uniform(1.5, 3.5)
        f_6h = min(100.0, round(fill + fill_rate * 6, 1))
        f_12h = min(100.0, round(fill + fill_rate * 12, 1))
        f_24h = min(100.0, round(fill + fill_rate * 24, 1))
        hours_to_overflow = round(max(0.5, (100.0 - fill) / max(0.5, fill_rate)), 1)
        conf = round(0.85 + (0.10 if fill > 80 else 0.04 * rng.random()), 2)

        predictions.append((
            f"pred-{b['bin_code'].lower()}",
            b["id"],
            b["bin_code"],
            now.strftime("%Y-%m-%d %H:%M:%S"),
            f_6h,
            f_12h,
            f_24h,
            hours_to_overflow,
            min(0.99, conf),
        ))

    conn.executemany(
        """INSERT INTO predictions (
            id, bin_id, bin_code, prediction_time, fill_6h, fill_12h, fill_24h, predicted_overflow_hours, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        predictions,
    )

    # Insert Waste Classifications
    waste_classes = []
    # Dedicated demo visual models for pinned bins
    pinned_wc = {
        "AHM-104": (10.5, 5.2, 1.8, 0.5, 80.5, 1.5, 0.94, "AI Detected from Image", "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"),
        "AHM-118": (48.0, 32.0, 12.0, 5.0, 2.0, 1.0, 0.91, "AI Detected from Image", "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"),
        "AHM-156": (35.0, 20.0, 10.0, 5.0, 25.0, 5.0, 0.88, "AI Detected from Image", "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80"),
    }

    for b in bins_data:
        code = b["bin_code"]
        if code in pinned_wc:
            p, pa, m, g, o, ot, c, s, img = pinned_wc[code]
        else:
            img = None
            s = "AI Estimated"
            c = round(rng.uniform(0.78, 0.92), 2)
            stream = b["waste_stream"]
            if stream == "Organic":
                o = rng.uniform(70.0, 85.0)
                p = rng.uniform(5.0, 15.0)
                pa = rng.uniform(3.0, 10.0)
                m = rng.uniform(0.5, 3.0)
                g = rng.uniform(0.5, 2.0)
                ot = max(0.0, 100.0 - (o + p + pa + m + g))
            elif stream == "Recyclable":
                p = rng.uniform(35.0, 50.0)
                pa = rng.uniform(25.0, 40.0)
                m = rng.uniform(8.0, 16.0)
                g = rng.uniform(4.0, 10.0)
                o = rng.uniform(1.0, 5.0)
                ot = max(0.0, 100.0 - (p + pa + m + g + o))
            elif stream == "Hazardous":
                ot = rng.uniform(60.0, 80.0)
                p = rng.uniform(5.0, 15.0)
                m = rng.uniform(5.0, 15.0)
                g = rng.uniform(2.0, 8.0)
                pa = rng.uniform(1.0, 5.0)
                o = max(0.0, 100.0 - (ot + p + m + g + pa))
            else:
                p = rng.uniform(20.0, 35.0)
                pa = rng.uniform(15.0, 30.0)
                o = rng.uniform(20.0, 40.0)
                m = rng.uniform(3.0, 10.0)
                g = rng.uniform(2.0, 8.0)
                ot = max(0.0, 100.0 - (p + pa + o + m + g))

        waste_classes.append((
            f"wc-{code.lower()}",
            b["id"],
            code,
            img,
            round(p, 1),
            round(pa, 1),
            round(m, 1),
            round(g, 1),
            round(o, 1),
            round(ot, 1),
            c,
            s,
            now.strftime("%Y-%m-%d %H:%M:%S"),
        ))

    conn.executemany(
        """INSERT INTO waste_classifications (
            id, bin_id, bin_code, image_url, plastic_percentage, paper_percentage,
            metal_percentage, glass_percentage, organic_percentage, other_percentage,
            confidence, source, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        waste_classes,
    )

    return {
        "bins": len(bins_data),
        "readings": len(readings),
        "predictions": len(predictions),
        "classifications": len(waste_classes),
    }


def seed_vehicles(conn: sqlite3.Connection) -> int:
    """Seed 12 collection vehicles (V-01 to V-12) stationed across 3 municipal depots."""
    now = get_utcnow()
    vehicle_rows = [
        ("veh-v-01", "V-01", 2000.0, 450.0, 23.0370, 72.5120, "Available", None, (now - timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-02", "V-02", 2500.0, 1850.0, 23.0385, 72.5090, "On Route", "ROUTE-01", (now - timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-03", "V-03", 1500.0, 0.0, 23.0450, 72.5780, "Available", None, (now - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-04", "V-04", 3000.0, 1200.0, 23.0360, 72.5540, "On Route", "ROUTE-02", (now - timedelta(minutes=8)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-05", "V-05", 3500.0, 0.0, 23.0230, 72.6510, "Available", None, (now - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-06", "V-06", 2000.0, 700.0, 23.0345, 72.5280, "Available", None, (now - timedelta(minutes=20)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-07", "V-07", 2500.0, 0.0, 23.0450, 72.5780, "Maintenance", None, (now - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-08", "V-08", 1800.0, 600.0, 23.0140, 72.5065, "Available", None, (now - timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-09", "V-09", 3000.0, 1600.0, 23.0260, 72.5035, "Available", None, (now - timedelta(minutes=22)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-10", "V-10", 2200.0, 950.0, 22.9985, 72.6020, "Available", None, (now - timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-11", "V-11", 3200.0, 1100.0, 23.0325, 72.5700, "Available", None, (now - timedelta(minutes=18)).strftime("%Y-%m-%d %H:%M:%S")),
        ("veh-v-12", "V-12", 2800.0, 350.0, 23.0805, 72.5920, "Available", None, (now - timedelta(minutes=40)).strftime("%Y-%m-%d %H:%M:%S")),
    ]

    sql = """
        INSERT INTO vehicles (id, vehicle_code, capacity_kg, current_load, latitude, longitude, status, assigned_route_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    conn.executemany(sql, vehicle_rows)
    return len(vehicle_rows)


def seed_routes(conn: sqlite3.Connection) -> int:
    """Seed initial active collection routes."""
    now = get_utcnow()
    routes = [
        (
            "ROUTE-01",
            "veh-v-02",
            "V-02",
            14.8,
            42,
            1850.0,
            74.0,
            json.dumps(["AHM-101", "AHM-103", "AHM-104", "AHM-107", "DEPOT-02"]),
            "Active",
            (now - timedelta(minutes=25)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "ROUTE-02",
            "veh-v-04",
            "V-04",
            18.2,
            55,
            1200.0,
            40.0,
            json.dumps(["AHM-115", "AHM-118", "AHM-122", "DEPOT-01"]),
            "Active",
            (now - timedelta(minutes=40)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
    ]

    sql = """
        INSERT INTO routes (id, vehicle_id, vehicle_code, distance_km, estimated_duration_mins, load_kg, utilization_pct, waypoints_json, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    conn.executemany(sql, routes)
    return len(routes)


def seed_collections(conn: sqlite3.Connection) -> int:
    """Seed historical collection records."""
    now = get_utcnow()
    collections = [
        ("coll-001", "veh-v-01", "bin-ahm-101", "AHM-101", 38.5, "Organic", (now - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S")),
        ("coll-002", "veh-v-01", "bin-ahm-102", "AHM-102", 42.0, "Recyclable", (now - timedelta(hours=4, minutes=30)).strftime("%Y-%m-%d %H:%M:%S")),
        ("coll-003", "veh-v-06", "bin-ahm-108", "AHM-108", 48.2, "Mixed", (now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")),
        ("coll-004", "veh-v-08", "bin-ahm-120", "AHM-120", 35.0, "Organic", (now - timedelta(hours=2, minutes=15)).strftime("%Y-%m-%d %H:%M:%S")),
    ]
    sql = """
        INSERT INTO collections (id, vehicle_id, bin_id, bin_code, weight_collected, waste_type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    conn.executemany(sql, collections)
    return len(collections)


def seed_alerts(conn: sqlite3.Connection) -> int:
    """Seed initial alerts including critical overflow alerts and contamination alerts."""
    now = get_utcnow()
    alerts = [
        (
            "alert-001",
            "Overflow Risk",
            "Critical",
            "bin-ahm-156",
            "AHM-156",
            "Bodakdev",
            "Bin AHM-156 has reached 96% fill level. Overflow imminent within 00h 45m. Immediate collection dispatch advised.",
            "Active",
            (now - timedelta(minutes=18)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "alert-002",
            "Overflow Risk",
            "Critical",
            "bin-ahm-104",
            "AHM-104",
            "Bodakdev",
            "Bin AHM-104 reached 82% capacity. Priority Score 94. High decay and odor risk. Predicted overflow in 04h 18m.",
            "Active",
            (now - timedelta(minutes=35)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "alert-003",
            "Overflow Risk",
            "Critical",
            "bin-ahm-118",
            "AHM-118",
            "Navrangpura",
            "Bin AHM-118 (Recyclable) reached 88% capacity. Priority Score 91. Overflow imminent in 04h 10m.",
            "Active",
            (now - timedelta(minutes=50)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "alert-004",
            "Contamination",
            "High",
            "bin-ahm-105",
            "AHM-105",
            "Vastrapur",
            "AI Vision detected severe non-recyclable plastic contamination (38%) in Recyclable bin AHM-105 near Vastrapur Lake. Segregation failure.",
            "Active",
            (now - timedelta(hours=1, minutes=10)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "alert-005",
            "Anomaly",
            "Medium",
            "bin-ahm-112",
            "AHM-112",
            "Satellite",
            "Sudden 40% weight spike detected within 15 minutes at bin AHM-112. Possible bulk dumping event.",
            "Active",
            (now - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
    ]

    sql = """
        INSERT INTO alerts (id, alert_type, severity, bin_id, bin_code, zone, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    conn.executemany(sql, alerts)
    return len(alerts)


# ==============================================================================
# Main Seeding Orchestration
# ==============================================================================
def run_seed():
    print("=" * 72)
    print(" SmartBinX Database Seeder (Ahmedabad Operations) ")
    print("=" * 72)
    print(f"Target Database: {TARGET_DB_PATH}")
    print(f"Schema Path:     {SCHEMA_PATH}")
    print("-" * 72)

    conn = create_database(TARGET_DB_PATH, SCHEMA_PATH)
    print(" Schema initialized successfully with foreign keys enabled.")

    with conn:
        zones_cnt = seed_zones(conn)
        bins_stats = seed_bins_and_related(conn)
        veh_cnt = seed_vehicles(conn)
        route_cnt = seed_routes(conn)
        coll_cnt = seed_collections(conn)
        alert_cnt = seed_alerts(conn)

    # Verification counts directly from SQLite
    cur = conn.cursor()
    tables = [
        "zones",
        "bins",
        "bin_readings",
        "vehicles",
        "routes",
        "collections",
        "waste_classifications",
        "predictions",
        "alerts",
    ]
    counts = {}
    for tbl in tables:
        cur.execute(f"SELECT COUNT(*) FROM {tbl}")
        counts[tbl] = cur.fetchone()[0]

    # Verify Pinned Bins in DB
    cur.execute("""
        SELECT bin_code, zone, fill_percentage, estimated_weight, waste_stream, status, priority_score, predicted_overflow_time, overflow_severity
        FROM bins WHERE bin_code IN ('AHM-104', 'AHM-118', 'AHM-156')
        ORDER BY bin_code
    """)
    pinned_rows = cur.fetchall()
    conn.close()

    db_size_kb = round(os.path.getsize(TARGET_DB_PATH) / 1024, 2)

    print("\n" + "=" * 72)
    print(" DATABASE SEEDING COMPLETED SUCCESSFULLY")
    print("=" * 72)
    print(f"Database File:    {TARGET_DB_PATH}")
    print(f"Database Size:    {db_size_kb} KB")
    print("-" * 72)
    print(f"  Zones:                 {counts['zones']:>4} (Navrangpura, Satellite, Bodakdev, Vastrapur, ...)")
    print(f"  Bins:                  {counts['bins']:>4} (125 total bins across 10 Ahmedabad zones)")
    print(f"  Bin Readings:          {counts['bin_readings']:>4} (5-step telemetry history per bin)")
    print(f"  Vehicles:              {counts['vehicles']:>4} (V-01 to V-12 across 3 municipal depots)")
    print(f"  Active Routes:         {counts['routes']:>4} (Dynamic collection routes with waypoints)")
    print(f"  Historical Pickups:    {counts['collections']:>4} (Completed collection events)")
    print(f"  Waste Classifications: {counts['waste_classifications']:>4} (AI vision & estimated material splits)")
    print(f"  ML Predictions:        {counts['predictions']:>4} (Forecasted 6h, 12h, 24h fill levels)")
    print(f"  System Alerts:         {counts['alerts']:>4} (Critical overflow & contamination warnings)")
    print("-" * 72)
    print("  Pinned Demo Bins Verification:")
    for r in pinned_rows:
        print(f"   * {r[0]}: Zone={r[1]}, Fill={r[2]}%, Wt={r[3]}kg, Stream={r[4]}, Status={r[5]}, Score={r[6]}, Overflow={r[7]}, Severity={r[8]}")
    print("=" * 72)


if __name__ == "__main__":
    run_seed()
