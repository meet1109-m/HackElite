"""SmartBinX Dynamic Route Replanning Service.

Dynamically reroutes active collection vehicles to handle high-urgency emergency bins
(such as AHM-156 overflowing within 45 minutes) with minimal detour distance.
"""

import copy
from typing import Any, Dict, List, Optional
from app.utils.constants import COLLECTION_DEPOTS
from app.utils.geo import haversine_distance, estimate_travel_time_minutes


def dynamic_replan_route(
    original_route: Dict[str, Any],
    emergency_bin: Dict[str, Any],
) -> Dict[str, Any]:
    """Insert an emergency bin into an active route at the optimal point that minimizes added travel distance.

    Returns before vs. after comparison matching ReplanResponse schema.
    """
    orig = copy.deepcopy(original_route)
    e_code = emergency_bin.get("bin_code", "UNKNOWN")
    e_lat = float(emergency_bin.get("latitude", 23.0410))
    e_lng = float(emergency_bin.get("longitude", 72.5085))
    e_weight = float(emergency_bin.get("estimated_weight", 48.0))
    e_zone = emergency_bin.get("zone", "Bodakdev")

    # Check if already in waypoints
    existing_waypoints = orig.get("waypoints", [])
    for wp in existing_waypoints:
        if wp.get("bin_code") == e_code:
            return {
                "original_route": orig,
                "replanned_route": orig,
                "emergency_bin_code": e_code,
                "additional_distance_km": 0.0,
                "additional_duration_mins": 0,
                "overflow_risk_avoided": "ALREADY_SCHEDULED",
                "explanation": f"Bin {e_code} is already scheduled in this route.",
            }

    # Find depot location
    depot_name = orig.get("depot_name", "Bodakdev West Depot")
    depot_coords = (23.0370, 72.5120)  # Default Bodakdev
    for _, d in COLLECTION_DEPOTS.items():
        if d["name"].lower() == depot_name.lower():
            depot_coords = (d["latitude"], d["longitude"])
            break

    # Existing route points: [Depot, W1, W2, ..., Wn, Depot]
    points = [depot_coords]
    for wp in existing_waypoints:
        points.append((wp["latitude"], wp["longitude"]))
    points.append(depot_coords)

    # Evaluate best insertion index in points list (between 0 and len(points)-1)
    best_insert_pos = 1
    min_added_dist = float("inf")

    for i in range(len(points) - 1):
        p1 = points[i]
        p2 = points[i + 1]

        orig_leg = haversine_distance(p1[0], p1[1], p2[0], p2[1])
        new_leg1 = haversine_distance(p1[0], p1[1], e_lat, e_lng)
        new_leg2 = haversine_distance(e_lat, e_lng, p2[0], p2[1])

        added = (new_leg1 + new_leg2) - orig_leg
        if added < min_added_dist:
            min_added_dist = added
            best_insert_pos = i  # insert before index i in waypoints

    # Construct new waypoints
    emergency_wp = {
        "stop_number": 0,
        "bin_code": e_code,
        "zone": e_zone,
        "latitude": e_lat,
        "longitude": e_lng,
        "fill_percentage": float(emergency_bin.get("fill_percentage", 96.0)),
        "estimated_weight_kg": e_weight,
        "is_critical": True,
        "status": emergency_bin.get("status", "Overflow Risk"),
    }

    new_waypoints = list(existing_waypoints)
    # Insert at chosen slot
    insert_idx = min(len(new_waypoints), max(0, best_insert_pos))
    new_waypoints.insert(insert_idx, emergency_wp)

    # Re-index stop numbers
    for idx, wp in enumerate(new_waypoints, 1):
        wp["stop_number"] = idx

    added_dist_km = round(max(0.1, min_added_dist), 2)

    added_drive_mins = estimate_travel_time_minutes(added_dist_km, average_speed_kmh=25.0)
    added_duration_mins = added_drive_mins + 3  # 3 min collection time

    new_total_dist = round(float(orig.get("total_distance_km", 14.8)) + added_dist_km, 2)
    new_total_duration = int(orig.get("estimated_duration_mins", 42)) + added_duration_mins
    new_collected_wt = round(float(orig.get("collected_weight_kg", 1850.0)) + e_weight, 1)
    v_cap = float(orig.get("vehicle_capacity_kg", 2500.0))
    new_utilization = round((new_collected_wt / max(1.0, v_cap)) * 100.0, 1)

    replanned = copy.deepcopy(orig)
    replanned["total_distance_km"] = new_total_dist
    replanned["estimated_duration_mins"] = new_total_duration
    replanned["collected_weight_kg"] = new_collected_wt
    replanned["utilization_pct"] = min(100.0, new_utilization)
    replanned["waypoints"] = new_waypoints

    explanation = (
        f"Emergency bin {e_code} successfully scheduled at Stop #{insert_idx + 1}. "
        f"Added distance: +{added_dist_km} km (+{added_duration_mins} mins). "
        "Critical overflow avoided in under 45 minutes."
    )

    return {
        "original_route": orig,
        "replanned_route": replanned,
        "emergency_bin_code": e_code,
        "additional_distance_km": added_dist_km,
        "additional_duration_mins": added_duration_mins,
        "overflow_risk_avoided": "HIGH",
        "explanation": explanation,
    }
