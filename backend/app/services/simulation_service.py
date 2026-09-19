"""SmartBinX What-If Simulator & Ahmedabad Event Mode Engine.

Features:
- What-If Scenario Simulator: Evaluates fleet utilization, overflow risk, and total mileage
  under altered fleet sizes, traffic conditions, and waste generation spikes.
- Ahmedabad Event Mode: Pre-configured presets for major regional events
  (Navratri, Cricket Match at Motera, Diwali Shopping) providing automated resource sizing.
"""

from typing import Any, Dict, List, Optional
from app.utils.constants import AHMEDABAD_ZONES


# Pre-configured Ahmedabad Event Profiles
AHMEDABAD_EVENT_PRESETS: Dict[str, Dict[str, Any]] = {
    "navratri": {
        "event_name": "Navratri at GMDC Ground / Vastrapur",
        "expected_footfall": 65000,
        "expected_waste_increase_pct": 145.0,
        "target_zones": ["Vastrapur", "Bodakdev", "Navrangpura"],
        "projected_additional_waste_kg": 3850.0,
        "temporary_bins_recommended": 35,
        "additional_vehicles_needed": 4,
        "collection_cycles_increase": 3,
        "recommended_actions": [
            "Deploy 35 smart wheeled bins around GMDC entrance and peripheral food courts.",
            "Schedule 3 additional collection cycles during 10 PM - 3 AM peak garba hours.",
            "Assign dedicated vehicles V-06 and V-08 to continuous Vastrapur loop.",
            "Set up dedicated organic waste segregation for food stall vendors.",
        ],
    },
    "cricket": {
        "event_name": "Cricket Match at Narendra Modi Stadium (Motera)",
        "expected_footfall": 110000,
        "expected_waste_increase_pct": 220.0,
        "target_zones": ["Sabarmati"],
        "projected_additional_waste_kg": 6200.0,
        "temporary_bins_recommended": 55,
        "additional_vehicles_needed": 6,
        "collection_cycles_increase": 4,
        "recommended_actions": [
            "Position 55 heavy-duty recycling and mixed bins along stadium gate concourses and metro walkways.",
            "Deploy 6 high-capacity compactor trucks from Dudheshwar Central Depot.",
            "Activate real-time telemetry alerts on 15-minute intervals during match innings breaks.",
            "Establish post-match clearing route along Sabarmati riverfront corridor.",
        ],
    },
    "diwali": {
        "event_name": "Diwali Shopping at CG Road / Law Garden",
        "expected_footfall": 85000,
        "expected_waste_increase_pct": 110.0,
        "target_zones": ["Navrangpura", "Ashram Road", "Paldi"],
        "projected_additional_waste_kg": 2950.0,
        "temporary_bins_recommended": 28,
        "additional_vehicles_needed": 3,
        "collection_cycles_increase": 2,
        "recommended_actions": [
            "Deploy 28 pop-up bins across Law Garden Night Market and CG Road commercial strip.",
            "Mobilize V-04 and V-11 for evening packaging and retail carton collection.",
            "Enforce dedicated paper/cardboard baling at source for retail shops.",
            "Increase evening patrol sweeps between 6 PM and 11 PM.",
        ],
    },
}


def run_what_if_simulation(params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute What-If scenario simulation on the municipal collection network.

    Calculates changes in total mileage, average overflow risk, and vehicle utilization.
    """
    baseline_vehicles = 12
    baseline_distance_km = 168.4
    baseline_overflow_risk_pct = 21.8
    baseline_utilization_pct = 64.2

    sim_vehicles = int(params.get("vehicles_count") or baseline_vehicles)
    sim_capacity = float(params.get("vehicle_capacity_kg") or 2400.0)
    raw_traffic = params.get("traffic_factor") or params.get("traffic_condition") or "Normal"
    traffic = str(raw_traffic).capitalize()
    gen_delta_pct = float(
        params.get("generation_surge_pct")
        if params.get("generation_surge_pct") is not None
        else (params.get("waste_generation_delta_pct") or 0.0)
    )

    # Traffic multiplier
    if traffic == "Heavy":
        traffic_mult = 1.25
    elif traffic == "Moderate":
        traffic_mult = 1.12
    elif traffic == "Light":
        traffic_mult = 0.92
    else:
        traffic_mult = 1.0

    # Impact on Distance:
    # Fewer vehicles mean remaining vehicles must cover more dispersed routes
    vehicle_ratio = baseline_vehicles / max(1, sim_vehicles)
    sim_distance_km = round(
        baseline_distance_km * (0.6 + (0.4 * vehicle_ratio)) * traffic_mult * (1.0 + (gen_delta_pct * 0.002)),
        1,
    )
    dist_change_km = round(sim_distance_km - baseline_distance_km, 1)

    # Impact on Overflow Risk:
    # Reducing vehicles or increasing generation increases overflow risk
    overflow_risk = baseline_overflow_risk_pct * (vehicle_ratio ** 1.3) * (1.0 + (gen_delta_pct * 0.015))
    sim_overflow_pct = min(98.0, max(5.0, round(overflow_risk, 1)))
    overflow_change_pct = round(sim_overflow_pct - baseline_overflow_risk_pct, 1)

    # Impact on Fleet Utilization:
    capacity_ratio = 2400.0 / max(500.0, sim_capacity)
    utilization = baseline_utilization_pct * vehicle_ratio * capacity_ratio * (1.0 + (gen_delta_pct * 0.01))
    sim_utilization_pct = min(100.0, max(15.0, round(utilization, 1)))
    utilization_change_pct = round(sim_utilization_pct - baseline_utilization_pct, 1)

    # Estimated uncollected bins and fuel consumption
    uncollected = max(0, int(round(2 + max(0, (baseline_vehicles - sim_vehicles)) * 1.5 + gen_delta_pct * 0.05)))
    fuel_liters = round(sim_distance_km * 0.22, 1)

    # Summary string
    v_diff = sim_vehicles - baseline_vehicles
    v_desc = f"{sim_vehicles} vehicles ({'+' if v_diff > 0 else ''}{v_diff})"
    summary = (
        f"Scenario: {v_desc}, {traffic} traffic, {gen_delta_pct:+.1f}% waste generation. "
        f"Fleet utilization shifts to {sim_utilization_pct}% ({utilization_change_pct:+.1f}%), "
        f"Overflow risk shifts to {sim_overflow_pct}% ({overflow_change_pct:+.1f}%)."
    )

    return {
        "scenario_summary": summary,
        "total_distance_km": sim_distance_km,
        "distance_km": sim_distance_km,
        "distance_change_km": dist_change_km,
        "avg_overflow_risk_pct": sim_overflow_pct,
        "overflow_risk_pct": sim_overflow_pct,
        "overflow_risk_change_pct": overflow_change_pct,
        "vehicle_utilization_pct": sim_utilization_pct,
        "fleet_utilization_pct": sim_utilization_pct,
        "utilization_change_pct": utilization_change_pct,
        "uncollected_bins": uncollected,
        "fuel_liters": fuel_liters,
        "label": "SmartBinX What-If Simulator",
    }



def simulate_event_mode(
    event_name: str,
    expected_footfall: Optional[int] = None,
    expected_waste_increase_pct: Optional[float] = None,
    target_zones: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Activate or simulate Ahmedabad Event Mode.

    Checks presets or builds custom resource sizing for high-density events.
    """
    query = event_name.lower()
    preset = None

    if "navratri" in query or "gmdc" in query:
        preset = AHMEDABAD_EVENT_PRESETS["navratri"]
    elif "cricket" in query or "stadium" in query or "motera" in query or "ipl" in query:
        preset = AHMEDABAD_EVENT_PRESETS["cricket"]
    elif "diwali" in query or "shopping" in query or "cg road" in query or "law garden" in query:
        preset = AHMEDABAD_EVENT_PRESETS["diwali"]

    if preset:
        res = dict(preset)
        if expected_footfall:
            res["expected_footfall"] = expected_footfall
        if expected_waste_increase_pct:
            res["expected_waste_increase_pct"] = expected_waste_increase_pct
        if target_zones:
            res["target_zones"] = target_zones

        res["status"] = "Activated"
        res["label"] = "SmartBinX Ahmedabad Event Mode"
        return res

    # Custom event calculation
    footfall = expected_footfall or 50000
    waste_inc = expected_waste_increase_pct or 100.0
    zones = target_zones or ["Navrangpura", "Vastrapur"]

    # Waste estimation: ~60 grams per attendee event generation
    add_kg = round((footfall * 0.06) * (waste_inc / 100.0), 1)
    temp_bins = max(10, int(round(add_kg / 80.0)))
    extra_veh = max(2, int(round(add_kg / 1200.0)))
    extra_cycles = max(1, int(round(waste_inc / 50.0)))

    actions = [
        f"Deploy {temp_bins} temporary smart bins across active event perimeters in {', '.join(zones)}.",
        f"Mobilize {extra_veh} additional collection vehicles for rapid turnaround.",
        f"Increase collection cycles by +{extra_cycles} per shift.",
        "Enable high-frequency 15-minute sensor monitoring on all perimeter bins.",
    ]

    return {
        "event_name": event_name,
        "status": "Activated",
        "expected_footfall": footfall,
        "expected_waste_increase_pct": waste_inc,
        "projected_additional_waste_kg": add_kg,
        "temporary_bins_recommended": temp_bins,
        "additional_vehicles_needed": extra_veh,
        "collection_cycles_increase": extra_cycles,
        "recommended_actions": actions,
        "label": "SmartBinX Custom Event Sizing",
    }
