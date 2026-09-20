"""SmartBinX In-Memory Data Store & Synthetic Seed Engine for Ahmedabad.

Preloaded with 120+ bins, 12 collection vehicles, active alerts,
waste composition intelligence, and automatic database synchronization.
"""

import copy
import math
import random
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.utils.constants import (
    AHMEDABAD_ZONES,
    COLLECTION_DEPOTS,
    WASTE_STREAMS,
    BIN_STATUSES,
    OVERFLOW_SEVERITIES,
    VEHICLE_STATUSES,
    ALERT_TYPES,
    ALERT_SEVERITIES,
)
from app.utils.geo import haversine_distance


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class DataStore:
    """In-memory operational repository for SmartBinX."""

    def __init__(self):
        self.zones: Dict[str, Dict[str, Any]] = {}
        self.depots: Dict[str, Dict[str, Any]] = {}
        self.bins: Dict[str, Dict[str, Any]] = {}
        self.vehicles: Dict[str, Dict[str, Any]] = {}
        self.alerts: List[Dict[str, Any]] = []
        self.routes: List[Dict[str, Any]] = []
        self.waste_classifications: Dict[str, Dict[str, Any]] = {}
        self.telemetry_history: Dict[str, List[Dict[str, Any]]] = {}

        self.initialize_store()

    def initialize_store(self):
        """Build initial synthetic Ahmedabad state."""
        self.zones = copy.deepcopy(AHMEDABAD_ZONES)
        self.depots = copy.deepcopy(COLLECTION_DEPOTS)
        self.bins.clear()
        self.vehicles.clear()
        self.alerts.clear()
        self.routes.clear()
        self.waste_classifications.clear()
        self.telemetry_history.clear()

        self._seed_bins()
        self._seed_vehicles()
        self._seed_alerts()
        self._seed_routes()
        self._seed_waste_classifications()
        self._seed_telemetry()

    def _seed_bins(self):
        """Generate 125 realistic bins distributed across the 10 Ahmedabad zones

        including pinned demo bins (AHM-104, AHM-118, AHM-156).
        """
        # Fixed seed for reproducible realistic generation
        rng = random.Random(42)

        zone_names = list(self.zones.keys())
        total_bins = 125

        # Pinned Demo Bins (as specified in PS-11 requirements)
        pinned_bins = {
            "AHM-104": {
                "id": "bin-ahm-104",
                "bin_code": "AHM-104",
                "zone": "Bodakdev",
                "latitude": 23.0392,
                "longitude": 72.5061,
                "capacity_kg": 40.0,
                "fill_percentage": 82.0,
                "estimated_weight": 31.4,
                "waste_stream": "Organic",
                "status": "Critical",
                "priority_score": 94,
                "priority_breakdown": {
                    "current_fill": 32,
                    "predicted_overflow": 28,
                    "high_generation_rate": 15,
                    "organic_waste": 15,
                    "time_since_collection": 4,
                    "total": 94,
                    "explanation": "Critical priority: High fill (82%), Organic waste decay risk, overflow expected in 4h 18m.",
                },
                "predicted_overflow_time": "4h 18m",
                "overflow_severity": "Red",
                "last_collection": "5 hours ago",
                "created_at": datetime.utcnow() - timedelta(days=30),
                "updated_at": datetime.utcnow(),
            },
            "AHM-118": {
                "id": "bin-ahm-118",
                "bin_code": "AHM-118",
                "zone": "Navrangpura",
                "latitude": 23.0378,
                "longitude": 72.5519,
                "capacity_kg": 40.0,
                "fill_percentage": 88.0,
                "estimated_weight": 34.2,
                "waste_stream": "Recyclable",
                "status": "High Priority",
                "priority_score": 91,
                "priority_breakdown": {
                    "current_fill": 34,
                    "predicted_overflow": 27,
                    "high_generation_rate": 14,
                    "organic_waste": 8,
                    "time_since_collection": 8,
                    "total": 91,
                    "explanation": "High priority: Recyclable stream at 88% fill, overflow imminent in 4h 10m.",
                },
                "predicted_overflow_time": "4h 10m",
                "overflow_severity": "Orange",
                "last_collection": "6 hours ago",
                "created_at": datetime.utcnow() - timedelta(days=30),
                "updated_at": datetime.utcnow(),
            },
            "AHM-156": {
                "id": "bin-ahm-156",
                "bin_code": "AHM-156",
                "zone": "Bodakdev",
                "latitude": 23.0410,
                "longitude": 72.5085,
                "capacity_kg": 50.0,
                "fill_percentage": 96.0,
                "estimated_weight": 48.0,
                "waste_stream": "Mixed",
                "status": "Overflow Risk",
                "priority_score": 98,
                "priority_breakdown": {
                    "current_fill": 35,
                    "predicted_overflow": 30,
                    "high_generation_rate": 15,
                    "organic_waste": 8,
                    "time_since_collection": 10,
                    "total": 98,
                    "explanation": "Immediate emergency: 96% fill level, predicted overflow in 45m. Requires dynamic reroute.",
                },
                "predicted_overflow_time": "45m",
                "overflow_severity": "Red",
                "last_collection": "14 hours ago",
                "created_at": datetime.utcnow() - timedelta(days=30),
                "updated_at": datetime.utcnow(),
            },
        }

        # Add pinned bins first
        for code, bdata in pinned_bins.items():
            self.bins[code] = bdata

        # Generate remaining bins from AHM-101 to AHM-225
        for i in range(101, 101 + total_bins):
            code = f"AHM-{i}"
            if code in self.bins:
                continue

            zone_name = zone_names[(i - 101) % len(zone_names)]
            zone_info = self.zones[zone_name]

            # Realistic jitter around zone center (~300m - 1.2km)
            lat_jitter = rng.uniform(-0.007, 0.007)
            lng_jitter = rng.uniform(-0.007, 0.007)
            lat = round(zone_info["center_lat"] + lat_jitter, 5)
            lng = round(zone_info["center_lng"] + lng_jitter, 5)

            capacity = rng.choice([40.0, 50.0, 60.0])
            fill_pct = round(rng.uniform(15.0, 92.0), 1)
            density = rng.uniform(0.65, 0.95)
            estimated_weight = round((fill_pct / 100.0) * capacity * density, 1)

            waste_stream = rng.choices(
                WASTE_STREAMS, weights=[0.40, 0.35, 0.20, 0.05], k=1
            )[0]

            # Determine status, priority, and overflow estimation
            if fill_pct >= 90.0:
                status = "Critical"
                severity = "Red"
                overflow_hours = rng.uniform(0.8, 3.5)
                priority_score = rng.randint(85, 95)
            elif fill_pct >= 75.0:
                status = "High Priority"
                severity = "Orange"
                overflow_hours = rng.uniform(3.5, 7.5)
                priority_score = rng.randint(70, 84)
            elif fill_pct >= 50.0:
                status = "Filling"
                severity = "Yellow"
                overflow_hours = rng.uniform(7.5, 18.0)
                priority_score = rng.randint(40, 69)
            else:
                status = "Healthy"
                severity = "Green"
                overflow_hours = rng.uniform(18.0, 36.0)
                priority_score = rng.randint(15, 39)

            if overflow_hours < 1.0:
                pred_time_str = f"{int(overflow_hours * 60)}m"
            elif overflow_hours < 24.0:
                hours_part = int(overflow_hours)
                mins_part = int((overflow_hours - hours_part) * 60)
                pred_time_str = f"{hours_part}h {mins_part}m"
            else:
                pred_time_str = ">24h"

            last_coll_hours = rng.randint(1, 28)
            last_collection_str = (
                f"{last_coll_hours} hours ago"
                if last_coll_hours <= 24
                else "Yesterday"
            )

            current_fill_pts = min(35, int(fill_pct * 0.35))
            pred_pts = min(30, int((1.0 / max(0.5, overflow_hours)) * 60))
            gen_pts = 10 if zone_info["baseline_generation"] > 800 else 5
            organic_pts = 15 if waste_stream == "Organic" else 5
            time_pts = min(10, int(last_coll_hours * 0.4))
            total_pts = min(100, current_fill_pts + pred_pts + gen_pts + organic_pts + time_pts)

            self.bins[code] = {
                "id": f"bin-{code.lower()}",
                "bin_code": code,
                "zone": zone_name,
                "latitude": lat,
                "longitude": lng,
                "capacity_kg": capacity,
                "fill_percentage": fill_pct,
                "estimated_weight": estimated_weight,
                "waste_stream": waste_stream,
                "status": status,
                "priority_score": total_pts,
                "priority_breakdown": {
                    "current_fill": current_fill_pts,
                    "predicted_overflow": pred_pts,
                    "high_generation_rate": gen_pts,
                    "organic_waste": organic_pts,
                    "time_since_collection": time_pts,
                    "total": total_pts,
                    "explanation": f"Score {total_pts}: Fill {fill_pct}%, Stream {waste_stream}, Zone {zone_name}.",
                },
                "predicted_overflow_time": pred_time_str,
                "overflow_severity": severity,
                "last_collection": last_collection_str,
                "created_at": datetime.utcnow() - timedelta(days=rng.randint(5, 60)),
                "updated_at": datetime.utcnow() - timedelta(minutes=rng.randint(2, 45)),
            }

    def _seed_vehicles(self):
        """Generate 12 Collection Vehicles (V-01 to V-12) with realistic capacities,

        loads, locations, and operational statuses.
        """
        vehicle_configs = [
            {"code": "V-01", "capacity": 2000.0, "load": 450.0, "status": "Available", "lat": 23.0370, "lng": 72.5120, "depot": "DEPOT-02", "driver_name": "Ramesh Patel", "driver_phone": "+91 98250 14210"},
            {"code": "V-02", "capacity": 2500.0, "load": 1850.0, "status": "On Route", "lat": 23.0385, "lng": 72.5090, "route_id": "ROUTE-01", "driver_name": "Kiran Solanki", "driver_phone": "+91 94260 88123"},
            {"code": "V-03", "capacity": 1500.0, "load": 0.0, "status": "Available", "lat": 23.0450, "lng": 72.5780, "depot": "DEPOT-01", "driver_name": "Dinesh Varma", "driver_phone": "+91 97240 55319"},
            {"code": "V-04", "capacity": 3000.0, "load": 1200.0, "status": "On Route", "lat": 23.0360, "lng": 72.5540, "route_id": "ROUTE-02", "driver_name": "Amit Dave", "driver_phone": "+91 98251 33412"},
            {"code": "V-05", "capacity": 3500.0, "load": 0.0, "status": "Available", "lat": 23.0230, "lng": 72.6510, "depot": "DEPOT-03", "driver_name": "Suresh Chauhan", "driver_phone": "+91 98240 77154"},
            {"code": "V-06", "capacity": 2000.0, "load": 700.0, "status": "Available", "lat": 23.0345, "lng": 72.5280, "driver_name": "Vijay Shah", "driver_phone": "+91 94280 22910"},
            {"code": "V-07", "capacity": 2500.0, "load": 0.0, "status": "Maintenance", "lat": 23.0450, "lng": 72.5780, "depot": "DEPOT-01", "driver_name": "Pravin Parmar", "driver_phone": "+91 98980 11234"},
            {"code": "V-08", "capacity": 1800.0, "load": 600.0, "status": "Available", "lat": 23.0140, "lng": 72.5065, "driver_name": "Mahesh Prajapati", "driver_phone": "+91 98254 99182"},
            {"code": "V-09", "capacity": 3000.0, "load": 1600.0, "status": "Available", "lat": 23.0260, "lng": 72.5035, "driver_name": "Nilesh Rathod", "driver_phone": "+91 94270 44521"},
            {"code": "V-10", "capacity": 2200.0, "load": 950.0, "status": "Available", "lat": 22.9985, "lng": 72.6020, "driver_name": "Harish Makwana", "driver_phone": "+91 98255 66732"},
            {"code": "V-11", "capacity": 3200.0, "load": 1100.0, "status": "Available", "lat": 23.0325, "lng": 72.5700, "driver_name": "Bharat Vaghela", "driver_phone": "+91 98242 88419"},
            {"code": "V-12", "capacity": 2800.0, "load": 350.0, "status": "Available", "lat": 23.0805, "lng": 72.5920, "driver_name": "Jayesh Pandya", "driver_phone": "+91 98250 55198"},
        ]

        for vc in vehicle_configs:
            code = vc["code"]
            self.vehicles[code] = {
                "id": f"veh-{code.lower()}",
                "vehicle_code": code,
                "capacity_kg": vc["capacity"],
                "current_load": vc["load"],
                "latitude": vc["lat"],
                "longitude": vc["lng"],
                "status": vc["status"],
                "assigned_route_id": vc.get("route_id"),
                "driver_name": vc.get("driver_name", "Ramesh Patel"),
                "driver_phone": vc.get("driver_phone", "+91 98250 14210"),
                "updated_at": datetime.utcnow() - timedelta(minutes=5),
            }

    def _seed_alerts(self):
        """Generate initial active system alerts for critical bins."""
        self.alerts = [
            {
                "id": "alert-001",
                "alert_type": "Overflow Risk",
                "severity": "Critical",
                "bin_id": "bin-ahm-156",
                "bin_code": "AHM-156",
                "zone": "Bodakdev",
                "message": "Bin AHM-156 has reached 96% fill level. Overflow imminent within 45 minutes. Immediate collection dispatch advised.",
                "status": "Active",
                "created_at": datetime.utcnow() - timedelta(minutes=18),
            },
            {
                "id": "alert-002",
                "alert_type": "Overflow Risk",
                "severity": "Critical",
                "bin_id": "bin-ahm-104",
                "bin_code": "AHM-104",
                "zone": "Bodakdev",
                "message": "Bin AHM-104 (Organic) at 82% capacity. Priority Score 94. High decay and odor risk.",
                "status": "Active",
                "created_at": datetime.utcnow() - timedelta(minutes=35),
            },
            {
                "id": "alert-003",
                "alert_type": "Contamination",
                "severity": "High",
                "bin_id": "bin-ahm-118",
                "bin_code": "AHM-118",
                "zone": "Navrangpura",
                "message": "AI Vision detected mixed contamination in Recyclable bin AHM-118. Segregation check required.",
                "status": "Active",
                "created_at": datetime.utcnow() - timedelta(hours=1, minutes=10),
            },
            {
                "id": "alert-004",
                "alert_type": "Anomaly",
                "severity": "Medium",
                "bin_id": "bin-ahm-112",
                "bin_code": "AHM-112",
                "zone": "Satellite",
                "message": "Sudden 40% weight spike detected within 15 minutes at bin AHM-112.",
                "status": "Active",
                "created_at": datetime.utcnow() - timedelta(hours=2),
            },
        ]

    def _seed_routes(self):
        """Seed initial active collection routes."""
        self.routes = [
            {
                "id": "ROUTE-01",
                "vehicle_id": "veh-v-02",
                "vehicle_code": "V-02",
                "distance_km": 14.8,
                "estimated_duration_mins": 42,
                "load_kg": 1850.0,
                "utilization_pct": 74.0,
                "waypoints_json": "[\"AHM-101\", \"AHM-103\", \"AHM-104\", \"AHM-107\", \"DEPOT-02\"]",
                "status": "Active",
                "created_at": datetime.utcnow() - timedelta(minutes=25),
            },
            {
                "id": "ROUTE-02",
                "vehicle_id": "veh-v-04",
                "vehicle_code": "V-04",
                "distance_km": 18.2,
                "estimated_duration_mins": 55,
                "load_kg": 1200.0,
                "utilization_pct": 40.0,
                "waypoints_json": "[\"AHM-115\", \"AHM-118\", \"AHM-122\", \"DEPOT-01\"]",
                "status": "Active",
                "created_at": datetime.utcnow() - timedelta(minutes=40),
            },
        ]

    def _seed_waste_classifications(self):
        """Generate waste intelligence profiles (both AI Detected and AI Estimated)."""
        # Pinned Demo Profiles
        self.waste_classifications["AHM-104"] = {
            "id": "wc-ahm-104",
            "bin_id": "bin-ahm-104",
            "bin_code": "AHM-104",
            "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
            "plastic_percentage": 10.5,
            "paper_percentage": 5.2,
            "metal_percentage": 1.8,
            "glass_percentage": 0.5,
            "organic_percentage": 80.5,
            "other_percentage": 1.5,
            "confidence": 0.94,
            "source": "AI Detected from Image",
            "created_at": datetime.utcnow() - timedelta(hours=2),
        }

        self.waste_classifications["AHM-118"] = {
            "id": "wc-ahm-118",
            "bin_id": "bin-ahm-118",
            "bin_code": "AHM-118",
            "image_url": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
            "plastic_percentage": 48.0,
            "paper_percentage": 32.0,
            "metal_percentage": 12.0,
            "glass_percentage": 5.0,
            "organic_percentage": 2.0,
            "other_percentage": 1.0,
            "confidence": 0.91,
            "source": "AI Detected from Image",
            "created_at": datetime.utcnow() - timedelta(hours=3),
        }

        self.waste_classifications["AHM-156"] = {
            "id": "wc-ahm-156",
            "bin_id": "bin-ahm-156",
            "bin_code": "AHM-156",
            "image_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
            "plastic_percentage": 35.0,
            "paper_percentage": 20.0,
            "metal_percentage": 10.0,
            "glass_percentage": 5.0,
            "organic_percentage": 25.0,
            "other_percentage": 5.0,
            "confidence": 0.88,
            "source": "AI Detected from Image",
            "created_at": datetime.utcnow() - timedelta(minutes=45),
        }

        # For remaining bins, populate realistic AI Estimated breakdowns
        rng = random.Random(101)
        for code, b in self.bins.items():
            if code in self.waste_classifications:
                continue

            stream = b["waste_stream"]
            if stream == "Organic":
                org = rng.uniform(70.0, 85.0)
                pl = rng.uniform(5.0, 15.0)
                pa = rng.uniform(3.0, 10.0)
                me = rng.uniform(0.5, 3.0)
                gl = rng.uniform(0.5, 2.0)
                ot = max(0.0, 100.0 - (org + pl + pa + me + gl))
            elif stream == "Recyclable":
                pl = rng.uniform(35.0, 50.0)
                pa = rng.uniform(25.0, 40.0)
                me = rng.uniform(8.0, 16.0)
                gl = rng.uniform(4.0, 10.0)
                org = rng.uniform(1.0, 5.0)
                ot = max(0.0, 100.0 - (pl + pa + me + gl + org))
            elif stream == "Hazardous":
                ot = rng.uniform(60.0, 80.0)
                pl = rng.uniform(5.0, 15.0)
                me = rng.uniform(5.0, 15.0)
                gl = rng.uniform(2.0, 8.0)
                pa = rng.uniform(1.0, 5.0)
                org = max(0.0, 100.0 - (ot + pl + me + gl + pa))
            else:  # Mixed
                pl = rng.uniform(20.0, 35.0)
                pa = rng.uniform(15.0, 30.0)
                org = rng.uniform(20.0, 40.0)
                me = rng.uniform(3.0, 10.0)
                gl = rng.uniform(2.0, 8.0)
                ot = max(0.0, 100.0 - (pl + pa + org + me + gl))

            self.waste_classifications[code] = {
                "id": f"wc-{code.lower()}",
                "bin_id": b["id"],
                "bin_code": code,
                "image_url": None,
                "plastic_percentage": round(pl, 1),
                "paper_percentage": round(pa, 1),
                "metal_percentage": round(me, 1),
                "glass_percentage": round(gl, 1),
                "organic_percentage": round(org, 1),
                "other_percentage": round(ot, 1),
                "confidence": round(rng.uniform(0.75, 0.90), 2),
                "source": "AI Estimated",
                "created_at": datetime.utcnow() - timedelta(hours=rng.randint(1, 12)),
            }

    def _seed_telemetry(self):
        """Generate historical readings for bins to support time-series charts."""
        for code, b in self.bins.items():
            current_fill = b["fill_percentage"]
            current_wt = b["estimated_weight"]
            history = []

            # 6 past readings at 2-hour intervals
            for step in range(6, 0, -1):
                past_time = datetime.utcnow() - timedelta(hours=step * 2)
                # Fill was lower in the past
                sim_fill = max(5.0, round(current_fill - (step * random.uniform(3.0, 7.0)), 1))
                sim_wt = max(2.0, round(current_wt * (sim_fill / max(1.0, current_fill)), 1))

                history.append(
                    {
                        "id": f"read-{code.lower()}-{step}",
                        "bin_id": b["id"],
                        "bin_code": code,
                        "timestamp": past_time,
                        "fill_percentage": sim_fill,
                        "weight": sim_wt,
                    }
                )

            # Latest reading
            history.append(
                {
                    "id": f"read-{code.lower()}-0",
                    "bin_id": b["id"],
                    "bin_code": code,
                    "timestamp": datetime.utcnow(),
                    "fill_percentage": current_fill,
                    "weight": current_wt,
                }
            )

            self.telemetry_history[code] = history

    # ==========================================
    # CRUD & Lookup Methods
    # ==========================================

    def get_all_bins(
        self,
        zone: Optional[str] = None,
        status: Optional[str] = None,
        min_fill: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve bins with optional filtering by zone, status, or minimum fill percentage."""
        result = list(self.bins.values())

        if zone:
            result = [b for b in result if b["zone"].lower() == zone.lower()]
        if status:
            result = [b for b in result if b["status"].lower() == status.lower()]
        if min_fill is not None:
            result = [b for b in result if b["fill_percentage"] >= min_fill]

        return result

    def get_bin(self, bin_code: str) -> Optional[Dict[str, Any]]:
        """Lookup a specific bin by its bin_code (case-insensitive)."""
        return self.bins.get(bin_code.upper())

    def update_bin(self, bin_code: str, updates: Dict[str, Any], db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        """Update bin attributes in-memory and write-through to SQLite."""
        code = bin_code.upper()
        if code not in self.bins:
            return None

        self.bins[code].update(updates)
        self.bins[code]["updated_at"] = datetime.utcnow()

        # Write-through to SQLite database
        try:
            from app.models.entities import Bin as DBBin
            from app.database import SessionLocal

            def _apply_bin_updates(session):
                db_b = session.query(DBBin).filter(DBBin.bin_code == code).first()
                if db_b:
                    for k, val in updates.items():
                        if hasattr(db_b, k):
                            setattr(db_b, k, val)
                    db_b.updated_at = datetime.utcnow()
                    session.commit()

            if db:
                _apply_bin_updates(db)
            else:
                with SessionLocal() as session:
                    _apply_bin_updates(session)
        except Exception:
            pass

        return self.bins[code]

    def get_all_vehicles(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve all vehicles with optional status filter."""
        vehicles = list(self.vehicles.values())
        if status:
            vehicles = [v for v in vehicles if v["status"].lower() == status.lower()]

        # Compute dynamic fields and frontend compatibility aliases
        for v in vehicles:
            v["available_capacity"] = max(0.0, round(v["capacity_kg"] - v["current_load"], 1))
            v["available_capacity_kg"] = v["available_capacity"]
            v["utilization_pct"] = min(
                100.0, round((v["current_load"] / max(1.0, v["capacity_kg"])) * 100.0, 1)
            )
            v["utilization_percentage"] = v["utilization_pct"]
            v["current_load_kg"] = v["current_load"]
            if "driver_name" not in v:
                v["driver_name"] = "Ramesh Patel"
            if "driver_phone" not in v:
                v["driver_phone"] = "+91 98250 14210"

        return vehicles

    def get_vehicle(self, vehicle_code: str) -> Optional[Dict[str, Any]]:
        """Lookup a vehicle by vehicle_code."""
        v = self.vehicles.get(vehicle_code.upper())
        if v:
            v["available_capacity"] = max(0.0, round(v["capacity_kg"] - v["current_load"], 1))
            v["available_capacity_kg"] = v["available_capacity"]
            v["utilization_pct"] = min(
                100.0, round((v["current_load"] / max(1.0, v["capacity_kg"])) * 100.0, 1)
            )
            v["utilization_percentage"] = v["utilization_pct"]
            v["current_load_kg"] = v["current_load"]
            if "driver_name" not in v:
                v["driver_name"] = "Ramesh Patel"
            if "driver_phone" not in v:
                v["driver_phone"] = "+91 98250 14210"
        return v

    def update_vehicle(self, vehicle_code: str, updates: Dict[str, Any], db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        """Update vehicle attributes in-memory and write-through to SQLite."""
        code = vehicle_code.upper()
        if code not in self.vehicles:
            return None

        self.vehicles[code].update(updates)
        self.vehicles[code]["updated_at"] = datetime.utcnow()

        # Write-through to SQLite database
        try:
            from app.models.entities import Vehicle as DBVehicle
            from app.database import SessionLocal

            def _apply_vehicle_updates(session):
                db_v = session.query(DBVehicle).filter(DBVehicle.vehicle_code == code).first()
                if db_v:
                    for k, val in updates.items():
                        if hasattr(db_v, k):
                            setattr(db_v, k, val)
                    db_v.updated_at = datetime.utcnow()
                    session.commit()

            if db:
                _apply_vehicle_updates(db)
            else:
                with SessionLocal() as session:
                    _apply_vehicle_updates(session)
        except Exception:
            pass

        return self.get_vehicle(code)

    def get_zones(self) -> List[Dict[str, Any]]:
        """Retrieve all 10 zones with aggregated metrics."""
        zone_list = []
        for name, zinfo in self.zones.items():
            zone_bins = [b for b in self.bins.values() if b["zone"] == name]
            total_bins = len(zone_bins)
            avg_fill = (
                round(sum(b["fill_percentage"] for b in zone_bins) / total_bins, 1)
                if total_bins > 0
                else 0.0
            )
            critical_count = sum(1 for b in zone_bins if b["status"] in ["Critical", "Overflow Risk"])

            z = dict(zinfo)
            z["total_bins"] = total_bins
            z["average_fill_percentage"] = avg_fill
            z["critical_bins"] = critical_count
            zone_list.append(z)

        return zone_list

    def get_alerts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve system alerts."""
        if status:
            return [a for a in self.alerts if a["status"].lower() == status.lower()]
        return self.alerts

    def get_active_routes(self) -> List[Dict[str, Any]]:
        """Retrieve current active collection routes."""
        return self.routes

    def get_waste_composition(self, bin_code: str) -> Optional[Dict[str, Any]]:
        """Retrieve waste composition breakdown for a bin."""
        return self.waste_classifications.get(bin_code.upper())

    def get_telemetry_readings(self, bin_code: str) -> List[Dict[str, Any]]:
        """Retrieve historical telemetry readings for a bin."""
        return self.telemetry_history.get(bin_code.upper(), [])

    def reset_data(self):
        """Reset in-memory data to fresh synthetic baseline."""
        self.initialize_store()

    # ==========================================
    # Database Synchronization & Auto-Seeding
    # ==========================================

    def load_from_database(self, db: Session) -> bool:
        """Hydrate in-memory cache directly from SQLite if tables are populated.

        Preserves existing operational state across server restarts.
        """
        from app.models.entities import (
            Zone as DBZone,
            Bin as DBBin,
            Vehicle as DBVehicle,
            Alert as DBAlert,
            Route as DBRoute,
            WasteClassification as DBWasteClassification,
        )
        from app.services.priority_engine import calculate_priority

        db_bins = db.query(DBBin).all()
        if not db_bins:
            return False  # Empty DB, needs seeding

        # 1. Hydrate Zones
        db_zones = db.query(DBZone).all()
        if db_zones:
            self.zones.clear()
            for z in db_zones:
                self.zones[z.name] = {
                    "zone_type": z.zone_type,
                    "baseline_generation": z.baseline_generation,
                    "footfall_estimate": z.footfall_estimate,
                    "center_lat": z.center_lat,
                    "center_lng": z.center_lng,
                }

        # 2. Hydrate Bins
        self.bins.clear()
        for b in db_bins:
            bin_dict = {
                "id": b.id,
                "bin_code": b.bin_code,
                "zone": b.zone,
                "latitude": b.latitude,
                "longitude": b.longitude,
                "capacity_kg": b.capacity_kg,
                "fill_percentage": b.fill_percentage,
                "estimated_weight": b.estimated_weight,
                "waste_stream": b.waste_stream,
                "status": b.status,
                "priority_score": b.priority_score,
                "predicted_overflow_time": b.predicted_overflow_time,
                "overflow_severity": b.overflow_severity,
                "last_collection": b.last_collection,
                "created_at": b.created_at,
                "updated_at": b.updated_at,
            }
            # Add explainable priority breakdown
            xai = calculate_priority(bin_dict)
            bin_dict["priority_breakdown"] = xai.get("priority_breakdown", {})
            self.bins[b.bin_code] = bin_dict

        # 3. Hydrate Vehicles
        db_vehicles = db.query(DBVehicle).all()
        if db_vehicles:
            self.vehicles.clear()
            for v in db_vehicles:
                self.vehicles[v.vehicle_code] = {
                    "id": v.id,
                    "vehicle_code": v.vehicle_code,
                    "capacity_kg": v.capacity_kg,
                    "current_load": v.current_load,
                    "latitude": v.latitude,
                    "longitude": v.longitude,
                    "status": v.status,
                    "assigned_route_id": v.assigned_route_id,
                    "driver_name": getattr(v, "driver_name", "Ramesh Patel") or "Ramesh Patel",
                    "driver_phone": getattr(v, "driver_phone", "+91 98250 14210") or "+91 98250 14210",
                    "updated_at": v.updated_at,
                }

        # 4. Hydrate Alerts
        db_alerts = db.query(DBAlert).all()
        if db_alerts:
            self.alerts.clear()
            for a in db_alerts:
                self.alerts.append({
                    "id": a.id,
                    "alert_type": a.alert_type,
                    "severity": a.severity,
                    "bin_id": a.bin_id,
                    "bin_code": a.bin_code,
                    "zone": a.zone,
                    "message": a.message,
                    "status": a.status,
                    "created_at": a.created_at,
                })

        # 5. Hydrate Routes
        db_routes = db.query(DBRoute).all()
        if db_routes:
            self.routes.clear()
            for r in db_routes:
                self.routes.append({
                    "id": r.id,
                    "route_id": r.id,
                    "vehicle_id": r.vehicle_id,
                    "vehicle_code": r.vehicle_code,
                    "distance_km": r.distance_km,
                    "estimated_duration_mins": r.estimated_duration_mins,
                    "load_kg": r.load_kg,
                    "utilization_pct": r.utilization_pct,
                    "waypoints_json": r.waypoints_json,
                    "status": r.status,
                    "created_at": r.created_at,
                })

        # 6. Hydrate Waste Classifications
        db_wc = db.query(DBWasteClassification).all()
        if db_wc:
            self.waste_classifications.clear()
            for wc in db_wc:
                self.waste_classifications[wc.bin_code] = {
                    "id": wc.id,
                    "bin_id": wc.bin_id,
                    "bin_code": wc.bin_code,
                    "image_url": wc.image_url,
                    "plastic_percentage": wc.plastic_percentage,
                    "paper_percentage": wc.paper_percentage,
                    "metal_percentage": wc.metal_percentage,
                    "glass_percentage": wc.glass_percentage,
                    "organic_percentage": wc.organic_percentage,
                    "other_percentage": wc.other_percentage,
                    "confidence": wc.confidence,
                    "source": wc.source,
                    "created_at": wc.created_at,
                    "composition": {
                        "plastic": wc.plastic_percentage,
                        "paper": wc.paper_percentage,
                        "metal": wc.metal_percentage,
                        "glass": wc.glass_percentage,
                        "organic": wc.organic_percentage,
                        "other": wc.other_percentage,
                    },
                }

        return True

    def seed_database_if_empty(self, db: Session) -> bool:
        """Auto-seed SQLite or PostgreSQL tables if the database is currently empty.

        Populates zones, bins, vehicles, alerts, routes, and waste classifications.
        """
        from app.database import Base
        from app.models.entities import (
            Zone as DBZone,
            Bin as DBBin,
            Vehicle as DBVehicle,
            Alert as DBAlert,
            Route as DBRoute,
            WasteClassification as DBWasteClassification,
            BinReading as DBBinReading,
        )

        # Ensure tables exist
        Base.metadata.create_all(bind=db.get_bind())

        # Check if database already has bins
        existing_bins_count = db.query(DBBin).count()
        if existing_bins_count > 0:
            return False  # Already seeded

        # 1. Seed Zones
        for name, z in self.zones.items():
            db_zone = DBZone(
                id=f"zone-{name.lower().replace(' ', '-')}",
                name=name,
                zone_type=z.get("zone_type"),
                waste_generation=z.get("baseline_generation", 500.0),
                baseline_generation=z.get("baseline_generation", 500.0),
                footfall_estimate=z.get("footfall_estimate", 5000),
                center_lat=z["center_lat"],
                center_lng=z["center_lng"],
            )
            db.add(db_zone)

        # 2. Seed Bins
        for code, b in self.bins.items():
            db_bin = DBBin(
                id=b["id"],
                bin_code=b["bin_code"],
                zone=b["zone"],
                latitude=b["latitude"],
                longitude=b["longitude"],
                capacity_kg=b["capacity_kg"],
                fill_percentage=b["fill_percentage"],
                estimated_weight=b["estimated_weight"],
                waste_stream=b["waste_stream"],
                status=b["status"],
                priority_score=b["priority_score"],
                predicted_overflow_time=b["predicted_overflow_time"],
                overflow_severity=b["overflow_severity"],
                last_collection=b["last_collection"],
                created_at=b["created_at"],
                updated_at=b["updated_at"],
            )
            db.add(db_bin)

        # 3. Seed Vehicles
        for code, v in self.vehicles.items():
            db_vehicle = DBVehicle(
                id=v["id"],
                vehicle_code=v["vehicle_code"],
                capacity_kg=v["capacity_kg"],
                current_load=v["current_load"],
                latitude=v["latitude"],
                longitude=v["longitude"],
                status=v["status"],
                assigned_route_id=v.get("assigned_route_id"),
                driver_name=v.get("driver_name", "Ramesh Patel"),
                driver_phone=v.get("driver_phone", "+91 98250 14210"),
                updated_at=v["updated_at"],
            )
            db.add(db_vehicle)

        # 4. Seed Alerts
        for a in self.alerts:
            db_alert = DBAlert(
                id=a["id"],
                alert_type=a["alert_type"],
                severity=a["severity"],
                bin_id=a["bin_id"],
                bin_code=a["bin_code"],
                zone=a["zone"],
                message=a["message"],
                status=a["status"],
                created_at=a["created_at"],
            )
            db.add(db_alert)

        # 5. Seed Routes
        for r in self.routes:
            db_route = DBRoute(
                id=r["id"],
                vehicle_id=r["vehicle_id"],
                vehicle_code=r["vehicle_code"],
                distance_km=r["distance_km"],
                estimated_duration_mins=r["estimated_duration_mins"],
                load_kg=r["load_kg"],
                utilization_pct=r["utilization_pct"],
                waypoints_json=r["waypoints_json"],
                status=r["status"],
                created_at=r["created_at"],
            )
            db.add(db_route)

        # 6. Seed Waste Classifications
        for code, wc in self.waste_classifications.items():
            db_wc = DBWasteClassification(
                id=wc["id"],
                bin_id=wc["bin_id"],
                bin_code=wc["bin_code"],
                image_url=wc["image_url"],
                plastic_percentage=wc["plastic_percentage"],
                paper_percentage=wc["paper_percentage"],
                metal_percentage=wc["metal_percentage"],
                glass_percentage=wc["glass_percentage"],
                organic_percentage=wc["organic_percentage"],
                other_percentage=wc["other_percentage"],
                confidence=wc["confidence"],
                source=wc["source"],
                created_at=wc["created_at"],
            )
            db.add(db_wc)

        # 7. Seed Initial Telemetry Readings
        for code, readings in self.telemetry_history.items():
            for r in readings:
                db_reading = DBBinReading(
                    id=r["id"],
                    bin_id=r["bin_id"],
                    bin_code=r["bin_code"],
                    timestamp=r["timestamp"],
                    fill_percentage=r["fill_percentage"],
                    weight=r["weight"],
                )
                db.add(db_reading)

        db.commit()
        return True

    def persist_route(self, db: Session, route_data: Dict[str, Any]) -> Dict[str, Any]:
        """Persist or update a route in both the in-memory cache and SQLite database."""
        import json
        from app.models.entities import Route as DBRoute

        route_id = route_data.get("id") or route_data.get("route_id") or f"route-{uuid.uuid4().hex[:8]}"
        vehicle_code = route_data.get("vehicle_code", "V-01")
        vehicle_id = route_data.get("vehicle_id") or f"veh-{vehicle_code.lower()}"
        distance_km = float(route_data.get("distance_km") or route_data.get("total_distance_km", 0.0))
        duration_mins = int(route_data.get("estimated_duration_mins", 0))
        load_kg = float(route_data.get("load_kg") or route_data.get("collected_weight_kg", 0.0))
        utilization_pct = float(route_data.get("utilization_pct", 0.0))
        waypoints = route_data.get("waypoints", [])
        waypoints_json = json.dumps(waypoints) if isinstance(waypoints, list) else str(waypoints)

        # 1. Update in-memory
        formatted_entry = {
            "id": route_id,
            "route_id": route_id,
            "vehicle_id": vehicle_id,
            "vehicle_code": vehicle_code,
            "distance_km": distance_km,
            "estimated_duration_mins": duration_mins,
            "load_kg": load_kg,
            "utilization_pct": utilization_pct,
            "waypoints": waypoints,
            "waypoints_json": waypoints_json,
            "status": route_data.get("status", "Active"),
            "created_at": datetime.utcnow(),
        }

        # Replace or append in self.routes
        replaced = False
        for idx, r in enumerate(self.routes):
            if r.get("id") == route_id or r.get("route_id") == route_id:
                self.routes[idx] = formatted_entry
                replaced = True
                break
        if not replaced:
            self.routes.append(formatted_entry)

        # 2. Persist to SQLite
        db_route = db.query(DBRoute).filter(DBRoute.id == route_id).first()
        if db_route:
            db_route.vehicle_code = vehicle_code
            db_route.distance_km = distance_km
            db_route.estimated_duration_mins = duration_mins
            db_route.load_kg = load_kg
            db_route.utilization_pct = utilization_pct
            db_route.waypoints_json = waypoints_json
            db_route.status = route_data.get("status", "Active")
        else:
            db_route = DBRoute(
                id=route_id,
                vehicle_id=vehicle_id,
                vehicle_code=vehicle_code,
                distance_km=distance_km,
                estimated_duration_mins=duration_mins,
                load_kg=load_kg,
                utilization_pct=utilization_pct,
                waypoints_json=waypoints_json,
                status=route_data.get("status", "Active"),
                created_at=datetime.utcnow(),
            )
            db.add(db_route)

        db.commit()
        return formatted_entry

    def record_collection(
        self, db: Session, bin_code: str, vehicle_code: str = "V-01"
    ) -> Dict[str, Any]:
        """Record a completed bin collection in SQLite and reset the bin state."""
        from app.models.entities import Bin as DBBin, Collection as DBCollection

        b = self.get_bin(bin_code)
        if not b:
            raise ValueError(f"Bin '{bin_code}' not found.")

        weight_collected = float(b.get("estimated_weight", 0.0))
        waste_type = b.get("waste_stream", "Mixed")
        bin_id = b.get("id", f"bin-{bin_code.lower()}")

        # 1. Create DB Collection record
        collection_record = DBCollection(
            id=str(uuid.uuid4()),
            vehicle_id=f"veh-{vehicle_code.lower()}",
            bin_id=bin_id,
            bin_code=bin_code,
            weight_collected=weight_collected,
            waste_type=waste_type,
            timestamp=datetime.utcnow(),
        )
        db.add(collection_record)

        # 2. Reset bin in SQLite
        db_bin = db.query(DBBin).filter(DBBin.bin_code == bin_code).first()
        now_str = "Just now"
        if db_bin:
            db_bin.fill_percentage = 0.0
            db_bin.estimated_weight = 0.0
            db_bin.status = "Healthy"
            db_bin.priority_score = 15
            db_bin.predicted_overflow_time = ">24h"
            db_bin.overflow_severity = "Green"
            db_bin.last_collection = now_str
            db_bin.updated_at = datetime.utcnow()

        db.commit()

        # 3. Reset in-memory cache
        b["fill_percentage"] = 0.0
        b["estimated_weight"] = 0.0
        b["status"] = "Healthy"
        b["priority_score"] = 15
        b["predicted_overflow_time"] = ">24h"
        b["overflow_severity"] = "Green"
        b["last_collection"] = now_str
        b["updated_at"] = datetime.utcnow()

        return {
            "collection_id": collection_record.id,
            "bin_code": bin_code,
            "weight_collected_kg": weight_collected,
            "waste_type": waste_type,
            "vehicle_code": vehicle_code,
            "timestamp": collection_record.timestamp.isoformat(),
            "updated_bin": b,
        }

    def log_prediction(self, db: Session, pred_data: Dict[str, Any]) -> Dict[str, Any]:
        """Log a fill level prediction to the SQLite predictions table."""
        from app.models.entities import Prediction as DBPrediction, Bin as DBBin

        bin_code = pred_data.get("bin_code", "")
        b = self.get_bin(bin_code)
        bin_id = b.get("id", f"bin-{bin_code.lower()}") if b else f"bin-{bin_code.lower()}"

        db_bin = db.query(DBBin).filter(DBBin.bin_code == bin_code).first()
        if db_bin:
            bin_id = db_bin.id

        confidence_val = float(pred_data.get("confidence_pct", 88.0))
        if confidence_val > 1.0:
            confidence_val = confidence_val / 100.0

        db_pred = DBPrediction(
            id=str(uuid.uuid4()),
            bin_id=bin_id,
            bin_code=bin_code,
            prediction_time=datetime.utcnow(),
            fill_6h=float(pred_data.get("fill_6h", 0.0)),
            fill_12h=float(pred_data.get("fill_12h", 0.0)),
            fill_24h=float(pred_data.get("fill_24h", 0.0)),
            predicted_overflow_hours=float(pred_data.get("predicted_overflow_hours", 24.0)),
            confidence=confidence_val,
        )
        db.add(db_pred)
        db.commit()
        return {
            "prediction_id": db_pred.id,
            "bin_code": bin_code,
            "timestamp": db_pred.prediction_time.isoformat(),
        }

    def log_telemetry(
        self,
        db: Session,
        bin_code: str,
        fill_percentage: float,
        weight: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Record a new sensor telemetry reading in both SQLite and in-memory cache."""
        from app.models.entities import BinReading as DBBinReading, Bin as DBBin

        b = self.get_bin(bin_code)
        if not b:
            raise ValueError(f"Bin '{bin_code}' not found.")

        bin_id = b.get("id", f"bin-{bin_code.lower()}")
        db_bin = db.query(DBBin).filter(DBBin.bin_code == bin_code).first()
        if db_bin:
            bin_id = db_bin.id

        capacity = float(b.get("capacity_kg", 50.0))
        if weight is None:
            weight = round((fill_percentage / 100.0) * capacity * 0.85, 1)

        now = datetime.utcnow()

        # 1. Insert into SQLite bin_readings
        db_reading = DBBinReading(
            id=str(uuid.uuid4()),
            bin_id=bin_id,
            bin_code=bin_code,
            timestamp=now,
            fill_percentage=fill_percentage,
            weight=weight,
        )
        db.add(db_reading)

        # 2. Update bin in SQLite
        if db_bin:
            db_bin.fill_percentage = fill_percentage
            db_bin.estimated_weight = weight
            if fill_percentage >= 90.0:
                db_bin.status = "Critical"
                db_bin.overflow_severity = "Red"
            elif fill_percentage >= 75.0:
                db_bin.status = "High Priority"
                db_bin.overflow_severity = "Orange"
            elif fill_percentage >= 50.0:
                db_bin.status = "Filling"
                db_bin.overflow_severity = "Yellow"
            else:
                db_bin.status = "Healthy"
                db_bin.overflow_severity = "Green"
            db_bin.updated_at = now

        db.commit()

        # 3. Update in-memory cache
        b["fill_percentage"] = fill_percentage
        b["estimated_weight"] = weight
        if fill_percentage >= 90.0:
            b["status"] = "Critical"
            b["overflow_severity"] = "Red"
        elif fill_percentage >= 75.0:
            b["status"] = "High Priority"
            b["overflow_severity"] = "Orange"
        elif fill_percentage >= 50.0:
            b["status"] = "Filling"
            b["overflow_severity"] = "Yellow"
        else:
            b["status"] = "Healthy"
            b["overflow_severity"] = "Green"
        b["updated_at"] = now

        # Add to telemetry history
        if bin_code not in self.telemetry_history:
            self.telemetry_history[bin_code] = []
        self.telemetry_history[bin_code].append({
            "id": db_reading.id,
            "bin_id": bin_id,
            "bin_code": bin_code,
            "timestamp": now,
            "fill_percentage": fill_percentage,
            "weight": weight,
        })

        return {
            "reading_id": db_reading.id,
            "bin_code": bin_code,
            "fill_percentage": fill_percentage,
            "weight_kg": weight,
            "status": b["status"],
            "timestamp": now.isoformat(),
        }


# Global singleton instance
data_store = DataStore()
