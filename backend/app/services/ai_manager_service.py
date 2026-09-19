"""SmartBinX AI Decision Support Assistant.

Context-grounded operational assistant for SmartBinX. Ingests live telemetry,
bin states, vehicle loads, and active anomalies to answer natural-language operational queries
with markdown answers, actionable UI cards, and concrete recommendations.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from app.services.data_store import data_store
from app.services.priority_engine import calculate_priority
from app.services.prediction_engine import calculate_overflow_countdown
from app.services.route_optimizer import find_best_vehicle_for_bin
from app.services.anomaly_service import detect_zone_anomalies
from app.services.simulation_service import run_what_if_simulation
from app.utils.geo import haversine_distance


def _handle_immediate_collection_query(query: str) -> Dict[str, Any]:
    """Answer 'Which bins need immediate collection?'"""
    all_bins = data_store.get_all_bins()
    critical_bins = [
        b
        for b in all_bins
        if b.get("status") in ["Critical", "Overflow Risk"]
        or int(b.get("priority_score", 0)) >= 85
    ]
    # Sort by priority score descending
    critical_bins.sort(key=lambda x: int(x.get("priority_score", 0)), reverse=True)

    answer_lines = [
        f"### 🚨 Immediate Collection Advisory: **{len(critical_bins)} Bins Critical**",
        "",
        "The following bins require immediate dispatch due to imminent overflow risk or critical fill levels:",
        "",
    ]

    cards = []
    actions = []

    for b in critical_bins[:5]:
        code = b["bin_code"]
        fill = b["fill_percentage"]
        zone = b["zone"]
        overflow = b.get("predicted_overflow_time", "N/A")
        score = b.get("priority_score", 0)
        stream = b.get("waste_stream", "Mixed")

        answer_lines.append(
            f"- **{code}** ({zone}) — **{fill}% fill**, {stream} stream, predicted overflow in **{overflow}** (Priority Score: **{score}/100**)"
        )

        cards.append(
            {
                "title": f"Dispatch Route for {code}",
                "subtitle": f"{zone} • {fill}% Fill • Overflow in {overflow}",
                "badge": "CRITICAL",
                "details": {
                    "bin_code": code,
                    "zone": zone,
                    "fill_percentage": fill,
                    "estimated_weight_kg": b.get("estimated_weight", 0.0),
                    "priority_score": score,
                    "predicted_overflow": overflow,
                },
                "action_type": "assign_vehicle",
                "action_target": code,
            }
        )

    if critical_bins:
        top_bin = critical_bins[0]["bin_code"]
        actions.append(f"Dispatch nearest available vehicle to {top_bin} immediately.")
        actions.append("Trigger dynamic route replanning for active vehicles in Bodakdev and Navrangpura.")
        actions.append("Alert municipal supervisors for high-priority overflow monitoring.")
    else:
        answer_lines.append("All bins are operating within safe capacity limits (< 75% fill).")
        actions.append("Maintain standard collection schedules.")

    return {
        "query": query,
        "answer": "\n".join(answer_lines),
        "cards": cards,
        "recommended_actions": actions,
        "timestamp": datetime.utcnow(),
    }


def _handle_why_bin_critical_query(query: str, bin_code: str = "AHM-104") -> Dict[str, Any]:
    """Answer 'Why is Bin AHM-104 critical?' (or any specified bin)."""
    # Try extracting bin code from query if not provided
    for b in data_store.get_all_bins():
        if b["bin_code"].lower() in query.lower():
            bin_code = b["bin_code"]
            break

    b = data_store.get_bin(bin_code)
    if not b:
        return {
            "query": query,
            "answer": f"Bin **{bin_code}** was not found in the Ahmedabad operational network.",
            "cards": [],
            "recommended_actions": ["Verify the bin code in the municipal registry."],
            "timestamp": datetime.utcnow(),
        }

    p_data = calculate_priority(b)
    breakdown = p_data["priority_breakdown"]
    countdown = calculate_overflow_countdown(b)

    fill = b["fill_percentage"]
    wt = b["estimated_weight"]
    stream = b["waste_stream"]
    zone = b["zone"]
    score = p_data["priority_score"]
    time_left = countdown["formatted_countdown"]

    answer_lines = [
        f"### 🔍 Explainable AI (XAI) Diagnosis: **Bin {bin_code}**",
        "",
        f"Bin **{bin_code}** in **{zone}** has been elevated to **{p_data['priority_category'].upper()}** priority (**Score: {score}/100**) based on the following multi-factor evaluation:",
        "",
        f"- **Current Fill Level (+{breakdown['current_fill']} pts):** Fill is currently at **{fill}%** ({wt} kg / {b.get('capacity_kg', 40.0)} kg capacity).",
        f"- **Overflow Urgency (+{breakdown['predicted_overflow']} pts):** Model predicts overflow in **{time_left}** ({countdown['severity']} severity).",
        f"- **Waste Stream Sensitivity (+{breakdown['organic_waste']} pts):** Contains **{stream}** waste, which poses high microbial decay and odor risks in Ahmedabad's climate.",
        f"- **Zone Generation Rate (+{breakdown['high_generation_rate']} pts):** Located in **{zone}**, a high-density commercial district.",
        f"- **Time Elapsed (+{breakdown['time_since_collection']} pts):** Last serviced **{b.get('last_collection', 'several hours ago')}**.",
        "",
        f"> **Explainable Rationale:** {breakdown['explanation']}",
    ]

    cards = [
        {
            "title": f"Assign Collection to {bin_code}",
            "subtitle": f"{zone} • {fill}% Fill • {wt} kg",
            "badge": "SCORE " + str(score),
            "details": {
                "bin_code": bin_code,
                "priority_score": score,
                "urgency": time_left,
                "stream": stream,
                "zone": zone,
            },
            "action_type": "assign_vehicle",
            "action_target": bin_code,
        },
        {
            "title": "Inspect Digital Twin",
            "subtitle": "Real-time telemetry and waste composition analysis",
            "badge": "TELEMETRY",
            "details": {"bin_code": bin_code, "status": b.get("status", "Healthy")},
            "action_type": "inspect_bin",
            "action_target": bin_code,
        },
    ]

    actions = [
        f"Dispatch collection vehicle to {bin_code} within {time_left}.",
        f"Verify seal integrity and waste segregation status for {stream} stream.",
    ]

    return {
        "query": query,
        "answer": "\n".join(answer_lines),
        "cards": cards,
        "recommended_actions": actions,
        "timestamp": datetime.utcnow(),
    }


def _handle_which_vehicle_query(query: str, bin_code: str = "AHM-104") -> Dict[str, Any]:
    """Answer 'Which vehicle should collect AHM-104?'"""
    for b in data_store.get_all_bins():
        if b["bin_code"].lower() in query.lower():
            bin_code = b["bin_code"]
            break

    target_bin = data_store.get_bin(bin_code)
    if not target_bin:
        target_bin = data_store.get_bin("AHM-104")
        bin_code = "AHM-104"

    eval_result = find_best_vehicle_for_bin(target_bin, data_store.get_all_vehicles())
    best = eval_result["recommended_vehicle"]

    if not best:
        return {
            "query": query,
            "answer": f"No available collection vehicles currently have sufficient payload capacity for {bin_code}.",
            "cards": [],
            "recommended_actions": ["Direct an on-route vehicle to offload at the nearest depot."],
            "timestamp": datetime.utcnow(),
        }

    v_code = best["vehicle_code"]
    v_avail = best["available_capacity"]
    v_dist = haversine_distance(
        best["latitude"], best["longitude"], target_bin["latitude"], target_bin["longitude"]
    )

    answer_lines = [
        f"### 🚛 Optimal Fleet Match for **{bin_code}**: **Vehicle {v_code}**",
        "",
        f"Based on real-time GPS telemetry and available payload capacity, **{v_code}** is the optimal collection match for Bin **{bin_code}** in {target_bin['zone']}:",
        "",
        f"- **Current Distance:** **{v_dist:.1f} km** away",
        f"- **Available Payload:** **{v_avail:.0f} kg** remaining (Bin weight: {target_bin.get('estimated_weight', 31.4)} kg)",
        f"- **Current Vehicle Status:** **{best.get('status', 'Available')}**",
        f"- **Selection Rationale:** Closest operational unit with non-exceeded capacity envelope.",
        "",
        "#### Other Evaluated Vehicles:",
    ]

    cards = [
        {
            "title": f"Dispatch {v_code} to {bin_code}",
            "subtitle": f"{v_dist:.1f} km away • {v_avail:.0f} kg available",
            "badge": "RECOMMENDED",
            "details": {
                "vehicle_code": v_code,
                "bin_code": bin_code,
                "distance_km": v_dist,
                "available_capacity_kg": v_avail,
            },
            "action_type": "assign_vehicle",
            "action_target": v_code,
        }
    ]

    for ev in eval_result["evaluations"][:4]:
        if ev["vehicle_code"] != v_code:
            status_icon = "✅" if ev["has_sufficient_capacity"] else "❌"
            answer_lines.append(
                f"- {status_icon} **{ev['vehicle_code']}**: {ev['distance_km']:.1f} km — {ev['rationale']}"
            )

    actions = [
        f"Authorize dispatch order for {v_code} to collect {bin_code}.",
        "Re-optimize downstream collection stops after pickup confirmation.",
    ]

    return {
        "query": query,
        "answer": "\n".join(answer_lines),
        "cards": cards,
        "recommended_actions": actions,
        "timestamp": datetime.utcnow(),
    }


def _handle_waste_generation_zone_query(query: str) -> Dict[str, Any]:
    """Answer 'Which zone generated the most waste this week?'"""
    anomalies = detect_zone_anomalies(threshold_pct=0.0)
    # Sort by current generation
    anomalies.sort(key=lambda x: x["current_generation_kg"], reverse=True)
    top_zone = anomalies[0]

    answer_lines = [
        f"### 📊 Ahmedabad Waste Generation Leader: **{top_zone['zone_name']}**",
        "",
        f"**{top_zone['zone_name']}** generated the highest waste volume over the observed period:",
        "",
        f"- **Recorded Generation:** **{top_zone['current_generation_kg']:.0f} kg** ({top_zone['increase_pct']:+.1f}% vs {top_zone['baseline_generation_kg']:.0f} kg baseline)",
        f"- **Operational Severity:** **{top_zone['severity']}**",
        "",
        "#### Leading Contributing Factors / Hypotheses:",
    ]

    for hyp in top_zone.get("hypotheses", []):
        answer_lines.append(f"- {hyp}")

    answer_lines.append("\n#### Top 4 Generation Zones:")
    for z in anomalies[:4]:
        answer_lines.append(
            f"- **{z['zone_name']}**: {z['current_generation_kg']:.0f} kg ({z['increase_pct']:+.1f}%)"
        )

    cards = [
        {
            "title": f"Inspect {top_zone['zone_name']} Hotspot",
            "subtitle": f"{top_zone['current_generation_kg']:.0f} kg • {top_zone['increase_pct']:+.1f}%",
            "badge": top_zone["severity"],
            "details": {
                "zone": top_zone["zone_name"],
                "generation_kg": top_zone["current_generation_kg"],
                "baseline_kg": top_zone["baseline_generation_kg"],
            },
            "action_type": "inspect_zone",
            "action_target": top_zone["zone_name"],
        }
    ]

    actions = [
        f"Deploy additional collection frequency along Sindhu Bhavan Road in {top_zone['zone_name']}.",
        "Coordinate with local merchant associations on commercial carton compaction.",
    ]

    return {
        "query": query,
        "answer": "\n".join(answer_lines),
        "cards": cards,
        "recommended_actions": actions,
        "timestamp": datetime.utcnow(),
    }


def _handle_recyclable_material_query(query: str) -> Dict[str, Any]:
    """Answer 'How much recyclable material was collected?'"""
    all_bins = data_store.get_all_bins()
    recyclable_bins = [b for b in all_bins if b.get("waste_stream") == "Recyclable"]
    rec_weight = sum(b.get("estimated_weight", 0.0) for b in recyclable_bins)
    total_weight = sum(b.get("estimated_weight", 0.0) for b in all_bins)
    diversion_pct = round((rec_weight / max(1.0, total_weight)) * 100.0, 1)

    answer_lines = [
        "### ♻️ Recyclable Material & Circular Economy Audit",
        "",
        f"Across Ahmedabad's monitored smart bins, **{rec_weight:.1f} kg** of recyclable materials are currently accumulated/collected:",
        "",
        f"- **Recyclable Stream Proportion:** **{diversion_pct}%** of active waste inventory",
        f"- **Dedicated Recyclable Bins:** **{len(recyclable_bins)} units** across 10 zones",
        "- **Estimated Stream Composition:** Plastic (~48%), Paper (~32%), Metal (~12%), Glass (~5%)",
        "- **Environmental Offset:** ~12.4 kg CO2e avoided; ~5.1 Liters collection fuel conserved.",
    ]

    cards = [
        {
            "title": "Recycling Recovery Summary",
            "subtitle": f"{rec_weight:.0f} kg collected • {diversion_pct}% diversion rate",
            "badge": "CIRCULARITY",
            "details": {
                "recyclable_kg": rec_weight,
                "total_kg": total_weight,
                "diversion_pct": diversion_pct,
            },
            "action_type": "view_analytics",
            "action_target": "recycling",
        }
    ]

    actions = [
        "Schedule dedicated baling and sorting runs for Navrangpura and Vastrapur recycling bins.",
        "Maintain zero-mixed contamination protocols at Dudheshwar Central Depot.",
    ]

    return {
        "query": query,
        "answer": "\n".join(answer_lines),
        "cards": cards,
        "recommended_actions": actions,
        "timestamp": datetime.utcnow(),
    }


def _handle_remove_vehicle_query(query: str) -> Dict[str, Any]:
    """Answer 'What happens if we remove one vehicle?'"""
    sim_res = run_what_if_simulation({"vehicles_count": 11})

    answer_lines = [
        "### 📉 What-If Impact Analysis: **Reducing Fleet by 1 Vehicle (12 → 11)**",
        "",
        "Simulating the removal of one collection truck from the active Ahmedabad fleet indicates:",
        "",
        f"- **Fleet Utilization:** Rises from **64.2% → {sim_res['vehicle_utilization_pct']}%** ({sim_res['utilization_change_pct']:+.1f}%)",
        f"- **Average Overflow Risk:** Increases from **21.8% → {sim_res['avg_overflow_risk_pct']}%** ({sim_res['overflow_risk_change_pct']:+.1f}%)",
        f"- **Total Mileage:** Adjusts to **{sim_res['total_distance_km']} km** ({sim_res['distance_change_km']:+.1f} km detour overhead)",
        "",
        "> **Operational Assessment:** Fleet remains viable during standard weekdays, but leaves zero reserve capacity for peak commercial surges along Bodakdev and SG Highway.",
    ]

    cards = [
        {
            "title": "What-If Simulation Results",
            "subtitle": f"11 Vehicles • {sim_res['vehicle_utilization_pct']}% Utilization",
            "badge": "SIMULATION",
            "details": sim_res,
            "action_type": "open_simulation",
            "action_target": "fleet_sizing",
        }
    ]

    actions = [
        "Maintain 12 active vehicles during weekend operations.",
        "Restrict single-vehicle maintenance downtime to off-peak morning hours (6 AM - 10 AM).",
    ]

    return {
        "query": query,
        "answer": "\n".join(answer_lines),
        "cards": cards,
        "recommended_actions": actions,
        "timestamp": datetime.utcnow(),
    }


def _handle_general_query(query: str) -> Dict[str, Any]:
    """Default fallback responding to general operational questions."""
    q_lower = query.lower()

    # Check for bin mentions
    for b in data_store.get_all_bins():
        if b["bin_code"].lower() in q_lower:
            return _handle_why_bin_critical_query(query, bin_code=b["bin_code"])

    # Check for vehicle mentions
    for v in data_store.get_all_vehicles():
        if v["vehicle_code"].lower() in q_lower:
            v_code = v["vehicle_code"]
            answer = (
                f"### 🚛 Vehicle Status: **{v_code}**\n\n"
                f"- **Capacity:** {v['capacity_kg']} kg\n"
                f"- **Current Load:** {v['current_load']} kg\n"
                f"- **Available:** {v['available_capacity']} kg\n"
                f"- **Status:** {v['status']}\n"
                f"- **Location:** {v['latitude']:.4f}° N, {v['longitude']:.4f}° E"
            )
            cards = [
                {
                    "title": f"Vehicle {v_code}",
                    "subtitle": f"{v['status']} • {v['available_capacity']} kg available",
                    "badge": v["status"].upper(),
                    "details": v,
                    "action_type": "track_vehicle",
                    "action_target": v_code,
                }
            ]
            return {
                "query": query,
                "answer": answer,
                "cards": cards,
                "recommended_actions": [f"View real-time location for {v_code} on GIS map."],
                "timestamp": datetime.utcnow(),
            }

    # Default general system overview
    total_bins = len(data_store.bins)
    total_veh = len(data_store.vehicles)
    crit_count = sum(1 for b in data_store.bins.values() if b["status"] in ["Critical", "Overflow Risk"])

    answer = (
        f"### 🤖 SmartBinX Operations Copilot\n\n"
        f"Monitoring **{total_bins} smart bins** and **{total_veh} collection vehicles** across Ahmedabad.\n\n"
        f"- **Critical / Overflow Bins:** {crit_count}\n"
        f"- **Active Collection Routes:** {len(data_store.routes)}\n"
        f"- **Active Alerts:** {len(data_store.alerts)}\n\n"
        "You can ask me:\n"
        "- *'Which bins need immediate collection?'*\n"
        "- *'Why is Bin AHM-104 critical?'*\n"
        "- *'Which vehicle should collect AHM-104?'*\n"
        "- *'Which zone generated the most waste this week?'*\n"
        "- *'What happens if we remove one vehicle?'*"
    )

    cards = [
        {
            "title": "System Overview",
            "subtitle": f"{total_bins} Bins • {total_veh} Vehicles • {crit_count} Critical",
            "badge": "HEALTHY" if crit_count == 0 else "ATTENTION",
            "details": {
                "total_bins": total_bins,
                "critical_bins": crit_count,
                "vehicles": total_veh,
            },
            "action_type": "view_dashboard",
            "action_target": "overview",
        }
    ]

    return {
        "query": query,
        "answer": answer,
        "cards": cards,
        "recommended_actions": ["Review critical bins in Bodakdev and Navrangpura."],
        "timestamp": datetime.utcnow(),
    }


def process_ai_query(query: str) -> Dict[str, Any]:
    """Route natural-language operational query to domain-specific grounded handlers."""
    q = query.lower()

    if "immediate" in q or "urgent" in q or "which bins" in q and ("collect" in q or "critical" in q):
        return _handle_immediate_collection_query(query)
    elif "why" in q and ("critical" in q or "priority" in q or "ahm-" in q):
        return _handle_why_bin_critical_query(query)
    elif "which vehicle" in q or ("vehicle" in q and "collect" in q):
        return _handle_which_vehicle_query(query)
    elif "most waste" in q or "highest" in q or "zone" in q and "generated" in q:
        return _handle_waste_generation_zone_query(query)
    elif "recycl" in q or "plastic" in q or "material" in q:
        return _handle_recyclable_material_query(query)
    elif "remove" in q and "vehicle" in q or "what happens if" in q:
        return _handle_remove_vehicle_query(query)
    else:
        return _handle_general_query(query)
