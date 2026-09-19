"""Core intelligence, routing, and simulation services for SmartBinX."""

from app.services.data_store import DataStore, data_store
from app.services.priority_engine import calculate_priority, batch_calculate_priorities
from app.services.prediction_engine import calculate_overflow_countdown, predict_bin_overflow
from app.services.waste_intelligence import (
    classify_waste_image,
    estimate_waste_composition,
    calculate_recycling_purity,
)
from app.services.route_optimizer import (
    optimize_cvrp_route,
    find_best_vehicle_for_bin,
    find_nearest_depot,
)
from app.services.replan_service import dynamic_replan_route
from app.services.anomaly_service import detect_zone_anomalies, get_zone_hotspots
from app.services.simulation_service import run_what_if_simulation, simulate_event_mode
from app.services.ai_manager_service import process_ai_query
from app.services.demo_runner import DemoRunner, demo_runner

__all__ = [
    "DataStore",
    "data_store",
    "calculate_priority",
    "batch_calculate_priorities",
    "calculate_overflow_countdown",
    "predict_bin_overflow",
    "classify_waste_image",
    "estimate_waste_composition",
    "calculate_recycling_purity",
    "optimize_cvrp_route",
    "find_best_vehicle_for_bin",
    "find_nearest_depot",
    "dynamic_replan_route",
    "detect_zone_anomalies",
    "get_zone_hotspots",
    "run_what_if_simulation",
    "simulate_event_mode",
    "process_ai_query",
    "DemoRunner",
    "demo_runner",
]
