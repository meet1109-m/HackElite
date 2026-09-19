"""SmartBinX Ahmedabad Domain Constants.

Includes zone metadata, collection depots, waste streams, and operational thresholds.
"""

from typing import Dict, List, Any

# 10 Key Ahmedabad Operational Zones
AHMEDABAD_ZONES: Dict[str, Dict[str, Any]] = {
    "Navrangpura": {
        "name": "Navrangpura",
        "zone_type": "Commercial & Educational",
        "baseline_generation": 750.0,  # kg/day
        "footfall_estimate": 12000,
        "center_lat": 23.0373,
        "center_lng": 72.5524,
        "description": "Educational and commercial center with colleges, shops, and offices.",
    },
    "Satellite": {
        "name": "Satellite",
        "zone_type": "Dense Residential",
        "baseline_generation": 820.0,
        "footfall_estimate": 9500,
        "center_lat": 23.0304,
        "center_lng": 72.5177,
        "description": "High-density residential hub with major retail avenues.",
    },
    "Bodakdev": {
        "name": "Bodakdev",
        "zone_type": "Commercial & Upscale Residential",
        "baseline_generation": 900.0,
        "footfall_estimate": 11000,
        "center_lat": 23.0396,
        "center_lng": 72.5065,
        "description": "Upscale commercial district with high corporate and restaurant waste density.",
    },
    "Vastrapur": {
        "name": "Vastrapur",
        "zone_type": "Commercial & Recreational",
        "baseline_generation": 780.0,
        "footfall_estimate": 10500,
        "center_lat": 23.0350,
        "center_lng": 72.5293,
        "description": "Recreational lake precinct and shopping malls.",
    },
    "SG Highway": {
        "name": "SG Highway",
        "zone_type": "Commercial Corridor & IT",
        "baseline_generation": 1100.0,
        "footfall_estimate": 15000,
        "center_lat": 23.0270,
        "center_lng": 72.5020,
        "description": "Major expressway corridor with IT parks, hospitals, and convention centers.",
    },
    "Maninagar": {
        "name": "Maninagar",
        "zone_type": "High-Density Residential & Transit",
        "baseline_generation": 850.0,
        "footfall_estimate": 13000,
        "center_lat": 22.9978,
        "center_lng": 72.6033,
        "description": "South-eastern Ahmedabad transport interchange and dense residential neighborhood.",
    },
    "Paldi": {
        "name": "Paldi",
        "zone_type": "Institutional & Residential",
        "baseline_generation": 650.0,
        "footfall_estimate": 8000,
        "center_lat": 23.0125,
        "center_lng": 72.5625,
        "description": "Historic institutional neighborhood hosting cultural centers and NID.",
    },
    "Ashram Road": {
        "name": "Ashram Road",
        "zone_type": "Financial & Riverfront Commercial",
        "baseline_generation": 950.0,
        "footfall_estimate": 14000,
        "center_lat": 23.0338,
        "center_lng": 72.5714,
        "description": "Prime financial artery adjacent to the Sabarmati Riverfront.",
    },
    "Sabarmati": {
        "name": "Sabarmati",
        "zone_type": "Transit & Mixed Residential",
        "baseline_generation": 600.0,
        "footfall_estimate": 7000,
        "center_lat": 23.0818,
        "center_lng": 72.5938,
        "description": "Northern transit gateway and historic Sabarmati Ashram sector.",
    },
    "Prahlad Nagar": {
        "name": "Prahlad Nagar",
        "zone_type": "Corporate Hub & Retail",
        "baseline_generation": 880.0,
        "footfall_estimate": 12500,
        "center_lat": 23.0135,
        "center_lng": 72.5075,
        "description": "Modern corporate center with high-density commercial towers and restaurants.",
    },
}

# 3 Primary Municipal Collection Depots
COLLECTION_DEPOTS: Dict[str, Dict[str, Any]] = {
    "DEPOT-01": {
        "code": "DEPOT-01",
        "name": "Dudheshwar Central Depot",
        "latitude": 23.0450,
        "longitude": 72.5780,
        "capacity_vehicles": 12,
        "service_zones": ["Ashram Road", "Navrangpura", "Paldi", "Sabarmati"],
    },
    "DEPOT-02": {
        "code": "DEPOT-02",
        "name": "Bodakdev West Depot",
        "latitude": 23.0370,
        "longitude": 72.5120,
        "capacity_vehicles": 10,
        "service_zones": ["Bodakdev", "Satellite", "Vastrapur", "SG Highway", "Prahlad Nagar"],
    },
    "DEPOT-03": {
        "code": "DEPOT-03",
        "name": "Odhav East Depot",
        "latitude": 23.0230,
        "longitude": 72.6510,
        "capacity_vehicles": 8,
        "service_zones": ["Maninagar"],
    },
}

# Supported Waste Streams
WASTE_STREAMS = ["Organic", "Recyclable", "Mixed", "Hazardous"]

# Bin Operational Statuses
BIN_STATUSES = [
    "Healthy",
    "Filling",
    "High Priority",
    "Critical",
    "Overflow Risk",
    "Offline",
]

# Overflow Severity Levels
OVERFLOW_SEVERITIES = ["Green", "Yellow", "Orange", "Red"]

# Vehicle Operational Statuses
VEHICLE_STATUSES = ["Available", "On Route", "Maintenance", "Off Duty"]

# Alert Types & Severities
ALERT_TYPES = ["Overflow Risk", "Contamination", "Anomaly", "Sensor Offline"]
ALERT_SEVERITIES = ["Low", "Medium", "High", "Critical"]

# City Boundary
AHMEDABAD_BOUNDING_BOX = {
    "min_lat": 22.9000,
    "max_lat": 23.1800,
    "min_lon": 72.4200,
    "max_lon": 72.7200,
}
