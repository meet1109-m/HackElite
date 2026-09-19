"""SmartBinX Capacitated Vehicle Routing (CVRP) & Fleet Optimization Engine.

Implements:
- Capacitated Vehicle Routing with hard capacity constraints.
- Depot-to-depot routing starting and ending at Ahmedabad municipal depots
  (Dudheshwar, Bodakdev, or Odhav).
- Priority-driven bin selection (Critical & High-priority bins prioritized).
- "Best Vehicle for Bin" evaluation with distance, capacity, and rationale checks.
"""

from typing import Any, Dict, List, Optional, Tuple
from app.utils.constants import COLLECTION_DEPOTS
from app.utils.geo import haversine_distance, estimate_travel_time_minutes


def find_nearest_depot(lat: float, lon: float) -> Tuple[str, Dict[str, Any], float]:
    """Find the closest collection depot to a given coordinate."""
    best_code = "DEPOT-01"
    best_depot = COLLECTION_DEPOTS["DEPOT-01"]
    min_dist = float("inf")

    for code, depot in COLLECTION_DEPOTS.items():
        dist = haversine_distance(lat, lon, depot["latitude"], depot["longitude"])
        if dist < min_dist:
            min_dist = dist
            best_code = code
            best_depot = depot

    return best_code, best_depot, min_dist


def optimize_cvrp_route(
    vehicle: Dict[str, Any],
    candidate_bins: List[Dict[str, Any]],
    depot_code: Optional[str] = None,
) -> Dict[str, Any]:
    """Plan an optimal Capacitated Vehicle Route (CVRP) for a vehicle.

    Hard constraint: Collected weight must never exceed vehicle's available capacity.
    Starts and finishes at the nearest municipal depot.
    """
    v_code = vehicle.get("vehicle_code", "V-01")
    v_cap = float(vehicle.get("capacity_kg", 2000.0))
    current_load = float(vehicle.get("current_load", 0.0))
    available_capacity = max(0.0, v_cap - current_load)

    # Determine depot
    if depot_code and depot_code in COLLECTION_DEPOTS:
        depot = COLLECTION_DEPOTS[depot_code]
    else:
        # Use depot nearest to vehicle current position
        v_lat = float(vehicle.get("latitude", 23.0370))
        v_lng = float(vehicle.get("longitude", 72.5120))
        _, depot, _ = find_nearest_depot(v_lat, v_lng)

    depot_lat = depot["latitude"]
    depot_lng = depot["longitude"]
    depot_name = depot["name"]

    # Filter and sort candidate bins by priority (Critical first) and fill level
    eligible_bins = []
    for b in candidate_bins:
        # Don't pick healthy bins (< 50% fill) unless critical
        fill = float(b.get("fill_percentage", 0.0))
        p_score = int(b.get("priority_score", 0))
        status = str(b.get("status", ""))
        if p_score >= 70 or fill >= 70.0 or status in ["Critical", "Overflow Risk", "High Priority"]:
            eligible_bins.append(b)

    # Sort primarily by priority score descending
    eligible_bins.sort(key=lambda x: int(x.get("priority_score", 0)), reverse=True)

    # Greedy Knapsack: Select bins that strictly respect available capacity
    assigned_bins = []
    total_assigned_weight = 0.0

    for b in eligible_bins:
        b_weight = float(b.get("estimated_weight", 30.0))
        if total_assigned_weight + b_weight <= available_capacity:
            assigned_bins.append(b)
            total_assigned_weight += b_weight

    # Sequence waypoints using Nearest-Neighbor heuristic starting from depot
    ordered_bins = []
    unvisited = list(assigned_bins)
    curr_lat, curr_lng = depot_lat, depot_lng

    while unvisited:
        # Find nearest unvisited bin to current location
        nearest_idx = 0
        min_d = float("inf")
        for idx, b in enumerate(unvisited):
            d = haversine_distance(curr_lat, curr_lng, b["latitude"], b["longitude"])
            if d < min_d:
                min_d = d
                nearest_idx = idx

        next_bin = unvisited.pop(nearest_idx)
        ordered_bins.append(next_bin)
        curr_lat = next_bin["latitude"]
        curr_lng = next_bin["longitude"]

    # Calculate sequential travel distance: Depot -> Bin 1 -> ... -> Bin N -> Depot
    total_distance_km = 0.0
    waypoints = []
    curr_lat, curr_lng = depot_lat, depot_lng

    for stop_num, b in enumerate(ordered_bins, 1):
        leg_dist = haversine_distance(curr_lat, curr_lng, b["latitude"], b["longitude"])
        total_distance_km += leg_dist
        curr_lat = b["latitude"]
        curr_lng = b["longitude"]

        status = b.get("status", "Healthy")
        is_crit = status in ["Critical", "Overflow Risk"] or int(b.get("priority_score", 0)) >= 85

        waypoints.append(
            {
                "stop_number": stop_num,
                "bin_code": b["bin_code"],
                "zone": b["zone"],
                "latitude": b["latitude"],
                "longitude": b["longitude"],
                "fill_percentage": b["fill_percentage"],
                "estimated_weight_kg": b["estimated_weight"],
                "is_critical": is_crit,
                "status": status,
            }
        )

    # Return leg to depot
    if ordered_bins:
        return_dist = haversine_distance(curr_lat, curr_lng, depot_lat, depot_lng)
        total_distance_km += return_dist

    total_distance_km = round(total_distance_km, 2)
    # 25 km/h urban speed + 3 minutes collection service time per bin
    driving_minutes = estimate_travel_time_minutes(total_distance_km, average_speed_kmh=25.0)
    service_minutes = len(ordered_bins) * 3
    estimated_duration_mins = driving_minutes + service_minutes

    total_load = round(current_load + total_assigned_weight, 1)
    utilization_pct = round((total_load / max(1.0, v_cap)) * 100.0, 1)

    route_id = f"ROUTE-{v_code.upper()}"

    return {
        "route_id": route_id,
        "vehicle_code": v_code,
        "depot_name": depot_name,
        "total_distance_km": total_distance_km,
        "estimated_duration_mins": estimated_duration_mins,
        "collected_weight_kg": round(total_assigned_weight, 1),
        "vehicle_capacity_kg": v_cap,
        "utilization_pct": min(100.0, utilization_pct),
        "waypoints": waypoints,
        "status": "Active",
        "environment": "SmartBinX CVRP Optimization Engine",
    }


def find_best_vehicle_for_bin(
    bin_data: Dict[str, Any],
    all_vehicles: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Evaluate all collection vehicles to find the nearest vehicle with sufficient capacity.

    Returns the recommendation and full comparative evaluation table.
    """
    bin_lat = float(bin_data.get("latitude", 23.0373))
    bin_lng = float(bin_data.get("longitude", 72.5524))
    req_cap = float(bin_data.get("estimated_weight", 30.0))
    bin_code = bin_data.get("bin_code", "UNKNOWN")

    evaluations = []
    best_vehicle = None
    min_dist = float("inf")

    for v in all_vehicles:
        v_cap = float(v.get("capacity_kg", 2000.0))
        c_load = float(v.get("current_load", 0.0))
        avail_cap = max(0.0, round(v_cap - c_load, 1))
        status = v.get("status", "Available")

        dist = haversine_distance(v["latitude"], v["longitude"], bin_lat, bin_lng)
        has_capacity = avail_cap >= req_cap
        is_operational = status in ["Available", "On Route"]

        is_candidate = has_capacity and is_operational

        if is_candidate and dist < min_dist:
            min_dist = dist
            best_vehicle = v

        rationale_parts = []
        if not has_capacity:
            rationale_parts.append(
                f"Insufficient capacity ({avail_cap:.0f} kg available < {req_cap:.0f} kg required)"
            )
        if status == "Maintenance":
            rationale_parts.append("Vehicle is under maintenance")
        elif status == "Off Duty":
            rationale_parts.append("Vehicle is currently off duty")
        elif is_candidate:
            rationale_parts.append(f"Available ({avail_cap:.0f} kg remaining), {dist:.1f} km away")

        evaluations.append(
            {
                "vehicle_code": v["vehicle_code"],
                "vehicle_id": v["id"],
                "distance_km": dist,
                "available_capacity_kg": avail_cap,
                "required_capacity_kg": req_cap,
                "has_sufficient_capacity": has_capacity,
                "is_recommended": False,
                "rationale": "; ".join(rationale_parts) or "Eligible",
            }
        )

    # Mark the winner
    if best_vehicle:
        for ev in evaluations:
            if ev["vehicle_code"] == best_vehicle["vehicle_code"]:
                ev["is_recommended"] = True
                ev["rationale"] = (
                    f"⭐ Recommended: Closest vehicle ({ev['distance_km']:.1f} km) with sufficient "
                    f"available capacity ({ev['available_capacity_kg']:.0f} kg)."
                )
                break

    return {
        "bin_code": bin_code,
        "recommended_vehicle": best_vehicle,
        "evaluations": evaluations,
    }
