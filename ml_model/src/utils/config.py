"""
Configuration module for WasteWise AI ML models.
Handles path resolutions, model parameters, random state, and resource constraints.
"""
from pathlib import Path
import os

# Base directory for ML
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
PLOTS_DIR = REPORTS_DIR / "plots"

# Fallback dataset location if not copied to raw/
SYNTHETIC_DATASET_DIR = DATA_DIR / "wastewise_ahmedabad_synthetic_dataset" / "wastewise_ahmedabad"

# Ensure essential directories exist
for p in [RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR, REPORTS_DIR, PLOTS_DIR]:
    p.mkdir(parents=True, exist_ok=True)

# Submodel directories
FILL_MODEL_DIR = MODELS_DIR / "fill_prediction"
COMPOSITION_MODEL_DIR = MODELS_DIR / "composition"
FORECASTING_MODEL_DIR = MODELS_DIR / "forecasting"
ANOMALY_MODEL_DIR = MODELS_DIR / "anomaly_detection"

for p in [FILL_MODEL_DIR, COMPOSITION_MODEL_DIR, FORECASTING_MODEL_DIR, ANOMALY_MODEL_DIR]:
    p.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42
N_JOBS = 2

DATASET_FILENAMES = {
    "anomaly_ground_truth": "ahmedabad_anomaly_ground_truth.csv",
    "bin_fill_history": "ahmedabad_bin_fill_history.csv",
    "bins": "ahmedabad_bins.csv",
    "collection_history": "ahmedabad_collection_history.csv",
    "vehicles": "ahmedabad_vehicles.csv",
    "waste_composition": "ahmedabad_waste_composition.csv",
    "zone_waste_generation": "ahmedabad_zone_waste_generation.csv",
}

def get_dataset_path(name: str) -> Path:
    """Retrieve existing path for a dataset."""
    filename = DATASET_FILENAMES.get(name, f"{name}.csv")
    
    # Check RAW_DATA_DIR first
    raw_path = RAW_DATA_DIR / filename
    if raw_path.exists():
        return raw_path
        
    # Check DATA_DIR directly
    direct_path = DATA_DIR / filename
    if direct_path.exists():
        return direct_path
        
    # Check synthetic dataset folder
    synth_path = SYNTHETIC_DATASET_DIR / filename
    if synth_path.exists():
        return synth_path
        
    raise FileNotFoundError(f"Dataset '{name}' ({filename}) not found in raw, data, or synthetic directories.")
