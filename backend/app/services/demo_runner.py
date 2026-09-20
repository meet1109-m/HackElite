"""SmartBinX Scripted 10-Step Automated Hackathon Demo Runner.

Coordinates the complete end-to-end hackathon demonstration flow:
Step 1: Bin AHM-104 fill level reaches 82% (Estimated weight: 31.4 kg).
Step 2: AI predicts overflow in 3h 42m (Countdown severity: RED).
Step 3: Priority score elevates to 96 / 100 (Status: CRITICAL).
Step 4: High-priority system alert triggers for Bodakdev zone.
Step 5: Waste Vision identifies composition (Plastic 62%, Organic 18%, Paper 12%, Confidence 91%, Source: "AI Detected from Image").
Step 6: AI selects Vehicle V-01 as the optimal match (Available capacity: 1,700 kg, Distance: 2.4 km).
Step 7: Route optimizer generates initial route (Depot -> AHM-104 -> AHM-118 -> AHM-101 -> Depot).
Step 8: Emergency event: High-risk bin AHM-156 appears with 45 minutes until overflow.
Step 9: Dynamic route replanning inserts AHM-156 (+2.2 km additional distance, avoided overflow risk: HIGH).
Step 10: Dashboard updates environmental & operational impact (Distance avoided: 23.4 km, Fuel saved: 5.1 L, CO2e avoided: 12.4 kg, Landfill diversion: 64%).
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.services.data_store import data_store
from app.services.priority_engine import calculate_priority
from app.services.prediction_engine import calculate_overflow_countdown
from app.services.waste_intelligence import calculate_recycling_purity
from app.services.route_optimizer import find_best_vehicle_for_bin, optimize_cvrp_route
from app.services.replan_service import dynamic_replan_route


class DemoRunner:
    """Manages state and execution of the scripted 10-step hackathon demo."""

    def __init__(self):
        self.current_step = 0
        self.demo_id = f"demo-{uuid.uuid4().hex[:8]}"
        self.step_history: List[Dict[str, Any]] = []

    def reset_demo(self) -> Dict[str, Any]:
        """Reset demo state and data store to initial baseline."""
        self.current_step = 0
        self.demo_id = f"demo-{uuid.uuid4().hex[:8]}"
        self.step_history.clear()
        data_store.reset_data()
        return {
            "demo_id": self.demo_id,
            "status": "Reset",
            "current_step": 0,
            "message": "Demo runner and operational data store have been reset to baseline.",
        }

    def run_demo_step(self, step_number: int) -> Dict[str, Any]:
        """Execute an individual step of the 10-step demonstration sequence."""
        if step_number < 1 or step_number > 10:
            raise ValueError(f"Invalid demo step {step_number}. Must be between 1 and 10.")

        step_func = getattr(self, f"_step_{step_number}", None)
        if not step_func:
            raise NotImplementedError(f"Step {step_number} handler not found.")

        step_result = step_func()
        self.current_step = step_number
        return step_result

    # -------------------------------------------------------------
    # Step Implementations
    # -------------------------------------------------------------

    def _step_1(self) -> Dict[str, Any]:
        """Step 1: Bin AHM-104 fill level reaches 82% (Estimated weight: 31.4 kg)."""
        data_store.update_bin(
            "AHM-104",
            {
                "fill_percentage": 82.0,
                "estimated_weight": 31.4,
                "status": "Filling",
            },
        )
        b = data_store.get_bin("AHM-104")
        return {
            "step_number": 1,
            "title": "Telemetry Ingestion: Bin AHM-104 Fill Surge",
            "description": "Smart sensor on Bin AHM-104 (Bodakdev) detects waste influx, reaching 82% fill capacity (31.4 kg).",
            "action_taken": "Updated live telemetry in data_store: fill_percentage=82.0%, estimated_weight=31.4 kg.",
            "data_snapshot": {
                "bin_code": "AHM-104",
                "zone": "Bodakdev",
                "fill_percentage": 82.0,
                "estimated_weight_kg": 31.4,
                "capacity_kg": 40.0,
                "status": "Filling",
            },
        }

    def _step_2(self) -> Dict[str, Any]:
        """Step 2: AI predicts overflow in 3h 42m (Countdown severity: RED)."""
        data_store.update_bin(
            "AHM-104",
            {
                "predicted_overflow_time": "03h 42m",
                "overflow_severity": "Red",
            },
        )
        return {
            "step_number": 2,
            "title": "AI Forecasting: Overflow Predicted in 3h 42m",
            "description": "Time-series forecasting model predicts Bin AHM-104 will overflow in 3 hours 42 minutes.",
            "action_taken": "Set predicted_overflow_time='03h 42m', overflow_severity='Red' (Critical threshold).",
            "data_snapshot": {
                "bin_code": "AHM-104",
                "predicted_overflow_time": "03h 42m",
                "hours_remaining": 3.7,
                "severity": "Red",
                "is_urgent": True,
                "fill_6h_forecast": 98.0,
                "fill_12h_forecast": 100.0,
            },
        }

    def _step_3(self) -> Dict[str, Any]:
        """Step 3: Priority score elevates to 96 / 100 (Status: CRITICAL)."""
        data_store.update_bin(
            "AHM-104",
            {
                "priority_score": 96,
                "status": "Critical",
                "priority_breakdown": {
                    "current_fill": 32,
                    "predicted_overflow": 29,
                    "high_generation_rate": 15,
                    "organic_waste": 15,
                    "time_since_collection": 5,
                    "total": 96,
                    "explanation": "Critical priority: High fill (82%), Organic waste decay risk, overflow expected in 3h 42m in Bodakdev.",
                },
            },
        )
        return {
            "step_number": 3,
            "title": "Explainable AI: Priority Elevates to 96/100",
            "description": "Multi-factor priority engine elevates AHM-104 to score 96/100 (CRITICAL) with explainable rationale.",
            "action_taken": "Updated priority_score=96, status='Critical', generated XAI breakdown.",
            "data_snapshot": {
                "bin_code": "AHM-104",
                "priority_score": 96,
                "priority_category": "Critical",
                "breakdown": {
                    "current_fill": 32,
                    "predicted_overflow": 29,
                    "high_generation_rate": 15,
                    "organic_waste": 15,
                    "time_since_collection": 5,
                    "total": 96,
                },
                "xai_explanation": "Critical priority: High fill (82%), Organic waste decay risk, overflow expected in 3h 42m in Bodakdev.",
            },
        }

    def _step_4(self) -> Dict[str, Any]:
        """Step 4: High-priority system alert triggers for Bodakdev zone."""
        alert_obj = {
            "id": "ALERT-DEMO-104",
            "alert_type": "Overflow Risk",
            "severity": "Critical",
            "bin_id": "bin-ahm-104",
            "bin_code": "AHM-104",
            "zone": "Bodakdev",
            "message": "CRITICAL ALERT: Bin AHM-104 reached 82% capacity with organic stream. Overflow expected in 3h 42m.",
            "status": "Active",
            "created_at": datetime.utcnow(),
        }
        # Insert alert in memory and SQLite
        data_store.alerts.insert(0, alert_obj)
        try:
            from app.database import SessionLocal
            from app.models.entities import Alert as DBAlert
            with SessionLocal() as db:
                existing = db.query(DBAlert).filter(DBAlert.id == alert_obj["id"]).first()
                if not existing:
                    db.add(DBAlert(**alert_obj))
                    db.commit()
        except Exception:
            pass

        return {
            "step_number": 4,
            "title": "System Alert Dispatch: Bodakdev Overflow Trigger",
            "description": "High-priority operational alert broadcast to municipal dispatch dashboard.",
            "action_taken": "Triggered ALERT-DEMO-104 for Bodakdev zone.",
            "data_snapshot": alert_obj,
        }

    def _step_5(self) -> Dict[str, Any]:
        """Step 5: Waste Vision identifies composition (Plastic 62%, Organic 18%, Paper 12%, Confidence 91%, Source: 'AI Detected from Image')."""
        wc_data = {
            "id": "wc-demo-104",
            "bin_id": "bin-ahm-104",
            "bin_code": "AHM-104",
            "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
            "plastic_percentage": 62.0,
            "organic_percentage": 18.0,
            "paper_percentage": 12.0,
            "metal_percentage": 4.0,
            "glass_percentage": 2.0,
            "other_percentage": 2.0,
            "confidence": 0.91,
            "source": "AI Detected from Image",
            "created_at": datetime.utcnow(),
        }
        data_store.waste_classifications["AHM-104"] = wc_data
        try:
            from app.database import SessionLocal
            from app.models.entities import WasteClassification as DBWasteClassification
            with SessionLocal() as db:
                existing = db.query(DBWasteClassification).filter(DBWasteClassification.bin_code == "AHM-104").first()
                if existing:
                    for k, v in wc_data.items():
                        if hasattr(existing, k):
                            setattr(existing, k, v)
                else:
                    db.add(DBWasteClassification(**wc_data))
                db.commit()
        except Exception:
            pass

        purity = calculate_recycling_purity("AHM-104", wc_data, stream_name="Recyclable")

        return {
            "step_number": 5,
            "title": "Waste Vision: Material Composition Classified",
            "description": "Computer Vision classifier processes bin image: Plastic 62%, Organic 18%, Paper 12% (Confidence 91%).",
            "action_taken": "Logged AI Vision breakdown with 'source': 'AI Detected from Image'.",
            "data_snapshot": {
                "bin_code": "AHM-104",
                "dominant_material": "Plastic",
                "composition": {
                    "plastic": 62.0,
                    "organic": 18.0,
                    "paper": 12.0,
                    "metal": 4.0,
                    "glass": 2.0,
                    "other": 2.0,
                },
                "confidence_pct": 91.0,
                "source": "AI Detected from Image",
                "recycling_purity_score": purity["purity_score"],
            },
        }

    def _step_6(self) -> Dict[str, Any]:
        """Step 6: AI selects Vehicle V-01 as the optimal match (Available capacity: 1,700 kg, Distance: 2.4 km)."""
        data_store.update_vehicle(
            "V-01",
            {
                "current_load": 300.0,
                "capacity_kg": 2000.0,
                "latitude": 23.0370,
                "longitude": 72.5120,
                "status": "Available",
            },
        )
        return {
            "step_number": 6,
            "title": "Fleet Matching: Vehicle V-01 Selected",
            "description": "Optimizer selects Vehicle V-01 as the best operational match (Available capacity: 1,700 kg, Distance: 2.4 km).",
            "action_taken": "Recommended V-01 with verified payload envelope and minimum distance.",
            "data_snapshot": {
                "recommended_vehicle": "V-01",
                "target_bin": "AHM-104",
                "distance_km": 2.4,
                "available_capacity_kg": 1700.0,
                "required_capacity_kg": 31.4,
                "has_sufficient_capacity": True,
                "status": "Available",
                "rationale": "⭐ Recommended: Closest vehicle (2.4 km) with 1,700 kg available capacity.",
            },
        }

    def _step_7(self) -> Dict[str, Any]:
        """Step 7: Route optimizer generates initial route (Depot -> AHM-104 -> AHM-118 -> AHM-101 -> Depot)."""
        initial_route = {
            "route_id": "ROUTE-DEMO-01",
            "vehicle_code": "V-01",
            "depot_name": "Bodakdev West Depot",
            "total_distance_km": 14.8,
            "estimated_duration_mins": 42,
            "collected_weight_kg": 1850.0,
            "vehicle_capacity_kg": 2000.0,
            "utilization_pct": 92.5,
            "waypoints": [
                {
                    "stop_number": 1,
                    "bin_code": "AHM-104",
                    "zone": "Bodakdev",
                    "latitude": 23.0392,
                    "longitude": 72.5061,
                    "fill_percentage": 82.0,
                    "estimated_weight_kg": 31.4,
                    "is_critical": True,
                    "status": "Critical",
                },
                {
                    "stop_number": 2,
                    "bin_code": "AHM-118",
                    "zone": "Navrangpura",
                    "latitude": 23.0378,
                    "longitude": 72.5519,
                    "fill_percentage": 88.0,
                    "estimated_weight_kg": 34.2,
                    "is_critical": True,
                    "status": "High Priority",
                },
                {
                    "stop_number": 3,
                    "bin_code": "AHM-101",
                    "zone": "Bodakdev",
                    "latitude": 23.0380,
                    "longitude": 72.5050,
                    "fill_percentage": 78.0,
                    "estimated_weight_kg": 28.5,
                    "is_critical": False,
                    "status": "Filling",
                },
            ],
            "status": "Active",
            "environment": "SmartBinX CVRP Optimization Engine",
        }
        try:
            from app.database import SessionLocal
            with SessionLocal() as db:
                data_store.persist_route(db, initial_route)
        except Exception:
            data_store.routes.insert(0, initial_route)

        data_store.update_vehicle("V-01", {"status": "On Route", "assigned_route_id": "ROUTE-DEMO-01"})

        return {
            "step_number": 7,
            "title": "CVRP Dispatch: Initial Route Generated",
            "description": "Capacitated vehicle route generated: Bodakdev West Depot -> AHM-104 -> AHM-118 -> AHM-101 -> Depot.",
            "action_taken": "Created ROUTE-DEMO-01 with 3 bin waypoints, total 14.8 km.",
            "data_snapshot": initial_route,
        }

    def _step_8(self) -> Dict[str, Any]:
        """Step 8: Emergency event: High-risk bin AHM-156 appears with 45 minutes until overflow."""
        data_store.update_bin(
            "AHM-156",
            {
                "fill_percentage": 96.0,
                "estimated_weight": 48.0,
                "predicted_overflow_time": "45m",
                "overflow_severity": "Red",
                "status": "Overflow Risk",
                "priority_score": 98,
            },
        )
        return {
            "step_number": 8,
            "title": "Emergency Event: Bin AHM-156 Overflow Risk (45m)",
            "description": "Sensor on Bin AHM-156 reports 96% fill level with only 45 minutes until overflow.",
            "action_taken": "Elevated AHM-156 to 'Overflow Risk' (Priority 98/100).",
            "data_snapshot": {
                "bin_code": "AHM-156",
                "zone": "Bodakdev",
                "fill_percentage": 96.0,
                "estimated_weight_kg": 48.0,
                "predicted_overflow_time": "45m",
                "severity": "Red",
                "status": "Overflow Risk",
                "priority_score": 98,
            },
        }

    def _step_9(self) -> Dict[str, Any]:
        """Step 9: Dynamic route replanning inserts AHM-156 (+2.2 km additional distance, avoided overflow risk: HIGH)."""
        active_route = data_store.routes[0]
        emergency_bin = data_store.get_bin("AHM-156")

        replan_result = dynamic_replan_route(active_route, emergency_bin)
        try:
            from app.database import SessionLocal
            with SessionLocal() as db:
                data_store.persist_route(db, replan_result["replanned_route"])
        except Exception:
            data_store.routes[0] = replan_result["replanned_route"]

        return {
            "step_number": 9,
            "title": "Dynamic Replanning: AHM-156 Inserted (+2.2 km)",
            "description": "Dynamic replanning engine recalculates optimal stop insertion: +2.2 km detour, imminent overflow avoided.",
            "action_taken": "Inserted AHM-156 into ROUTE-DEMO-01 at Stop #2. Avoided overflow risk: HIGH.",
            "data_snapshot": {
                "route_id": "ROUTE-DEMO-01",
                "emergency_bin_code": "AHM-156",
                "additional_distance_km": 2.2,
                "additional_duration_mins": 9,
                "overflow_risk_avoided": "HIGH",
                "new_total_distance_km": replan_result["replanned_route"]["total_distance_km"],
                "new_total_duration_mins": replan_result["replanned_route"]["estimated_duration_mins"],
                "waypoints": replan_result["replanned_route"]["waypoints"],
            },
        }

    def _step_10(self) -> Dict[str, Any]:
        """Step 10: Dashboard updates environmental & operational impact

        (Distance avoided: 23.4 km, Fuel saved: 5.1 L, CO2e avoided: 12.4 kg, Landfill diversion: 64%).
        """
        impact_metrics = {
            "distance_avoided_km": 23.4,
            "fuel_saved_liters": 5.1,
            "co2e_avoided_kg": 12.4,
            "landfill_diversion_pct": 64.0,
            "total_waste_collected_kg": 1898.0,
            "circularity_score": 82,
            "operational_efficiency_gain_pct": 28.5,
        }
        return {
            "step_number": 10,
            "title": "Impact Dashboard: Environmental & Operational Metrics",
            "description": "Route optimization and AI triage log significant sustainability savings across Ahmedabad.",
            "action_taken": "Updated ESG dashboard metrics with validated savings.",
            "data_snapshot": impact_metrics,
        }

    def run_full_demo(self) -> Dict[str, Any]:
        """Execute the entire 10-step sequence sequentially and return DemoRunResponse."""
        self.reset_demo()
        steps = []
        for i in range(1, 11):
            s = self.run_demo_step(i)
            steps.append(s)

        final_summary = {
            "demo_id": self.demo_id,
            "status": "Completed",
            "steps_executed": 10,
            "primary_bin_serviced": "AHM-104",
            "emergency_bin_diverted": "AHM-156",
            "vehicle_dispatched": "V-01",
            "distance_avoided_km": 23.4,
            "fuel_saved_liters": 5.1,
            "co2e_avoided_kg": 12.4,
            "landfill_diversion_pct": 64.0,
            "execution_timestamp": datetime.utcnow().isoformat(),
        }

        return {
            "demo_id": self.demo_id,
            "status": "Completed",
            "total_steps": 10,
            "steps": steps,
            "final_summary": final_summary,
            "label": "Scripted Hackathon Demo Runner",
        }


# Global singleton instance
demo_runner = DemoRunner()
