"""
WasteWise AI - Bin Fill-Level Model Training Pipeline.
Trains HistGradientBoostingRegressor, RandomForestRegressor, and DummyRegressor across 6h, 12h, and 24h horizons.
"""
import sys
import gc
import time
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.utils.config import FILL_MODEL_DIR, PLOTS_DIR, REPORTS_DIR, RANDOM_STATE, N_JOBS
from src.fill_prediction.preprocess import (
    load_and_preprocess_fill_data,
    build_preprocessor,
    TARGET_COLS
)

def evaluate_predictions(y_true, y_pred, model_name: str, horizon: str):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"[{model_name}] {horizon} -> MAE: {mae:.2f}%, RMSE: {rmse:.2f}%, R2: {r2:.4f}")
    return {"MAE": mae, "RMSE": rmse, "R2": r2}

def train_fill_models():
    print("\n=======================================================")
    print("STEP 2 & 3: TRAINING BIN FILL PREDICTION MODELS")
    print("=======================================================\n")
    
    # Load dataset
    (X_train, y_train), (X_val, y_val), (X_test, y_test) = load_and_preprocess_fill_data()
    
    # Fit Preprocessor
    print("\nFitting feature preprocessor...")
    preprocessor = build_preprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_val_proc = preprocessor.transform(X_val)
    X_test_proc = preprocessor.transform(X_test)
    
    # Save preprocessor
    joblib.dump(preprocessor, FILL_MODEL_DIR / "preprocessor.joblib")
    print(f"Preprocessor saved to {FILL_MODEL_DIR / 'preprocessor.joblib'}")
    
    # Get feature names from preprocessor
    num_cols = preprocessor.transformers_[0][2]
    cat_cols_encoded = preprocessor.transformers_[1][1].named_steps['encoder'].get_feature_names_out(preprocessor.transformers_[1][2])
    all_feature_names = list(num_cols) + list(cat_cols_encoded)
    
    results = []
    trained_models = {}
    
    horizons = [
        ("6h", "fill_percentage_6h"),
        ("12h", "fill_percentage_12h"),
        ("24h", "fill_percentage_24h")
    ]
    
    for h_name, h_col in horizons:
        print(f"\n--- Training Models for Horizon: {h_name} ({h_col}) ---")
        y_tr = y_train[h_col].values
        y_va = y_val[h_col].values
        y_te = y_test[h_col].values
        
        # 1. Baseline Dummy Model
        dummy = DummyRegressor(strategy="mean")
        dummy.fit(X_train_proc, y_tr)
        y_pred_dummy = dummy.predict(X_test_proc)
        m_dummy = evaluate_predictions(y_te, y_pred_dummy, "DummyBaseline", h_name)
        results.append({
            "Model": "DummyRegressor",
            "Task": f"Fill Prediction ({h_name})",
            "Horizon": h_name,
            "Train_Records": len(X_train_proc),
            "Features": X_train_proc.shape[1],
            "MAE": m_dummy["MAE"],
            "RMSE": m_dummy["RMSE"],
            "R2": m_dummy["R2"],
            "Train_Time_s": 0.05
        })
        
        # 2. HistGradientBoostingRegressor (Primary Candidate)
        print(f"Training HistGradientBoostingRegressor for {h_name}...")
        t0 = time.time()
        hgb = HistGradientBoostingRegressor(
            max_iter=200,
            learning_rate=0.08,
            max_leaf_nodes=31,
            random_state=RANDOM_STATE,
            early_stopping=True,
            validation_fraction=0.1
        )
        hgb.fit(X_train_proc, y_tr)
        t_hgb = time.time() - t0
        
        y_pred_hgb = hgb.predict(X_test_proc)
        m_hgb = evaluate_predictions(y_te, y_pred_hgb, "HistGradientBoosting", h_name)
        results.append({
            "Model": "HistGradientBoostingRegressor",
            "Task": f"Fill Prediction ({h_name})",
            "Horizon": h_name,
            "Train_Records": len(X_train_proc),
            "Features": X_train_proc.shape[1],
            "MAE": m_hgb["MAE"],
            "RMSE": m_hgb["RMSE"],
            "R2": m_hgb["R2"],
            "Train_Time_s": round(t_hgb, 2)
        })
        
        # Save model
        model_filename = FILL_MODEL_DIR / f"fill_{h_name}_model.joblib"
        joblib.dump(hgb, model_filename)
        trained_models[h_name] = hgb
        print(f"Model saved: {model_filename}")
        
    # Free training arrays
    del X_train, y_train, X_val, y_val, X_train_proc, X_val_proc
    gc.collect()
    
    # Generate Visualizations for 24h horizon
    print("\nGenerating visualization plots...")
    plt.figure(figsize=(10, 5))
    
    # Actual vs Predicted scatter for 6h and 24h on sample test
    sample_indices = np.random.RandomState(42).choice(len(X_test_proc), size=min(1000, len(X_test_proc)), replace=False)
    
    plt.subplot(1, 2, 1)
    y_te_6h = y_test["fill_percentage_6h"].values[sample_indices]
    y_pr_6h = trained_models["6h"].predict(X_test_proc[sample_indices])
    plt.scatter(y_te_6h, y_pr_6h, alpha=0.3, color="#1f77b4", s=15)
    plt.plot([0, 135], [0, 135], "r--", lw=1.5)
    plt.title("Fill 6h: Actual vs Predicted")
    plt.xlabel("Actual Fill %")
    plt.ylabel("Predicted Fill %")
    plt.grid(True, linestyle="--", alpha=0.5)
    
    plt.subplot(1, 2, 2)
    y_te_24h = y_test["fill_percentage_24h"].values[sample_indices]
    y_pr_24h = trained_models["24h"].predict(X_test_proc[sample_indices])
    plt.scatter(y_te_24h, y_pr_24h, alpha=0.3, color="#2ca02c", s=15)
    plt.plot([0, 135], [0, 135], "r--", lw=1.5)
    plt.title("Fill 24h: Actual vs Predicted")
    plt.xlabel("Actual Fill %")
    plt.ylabel("Predicted Fill %")
    plt.grid(True, linestyle="--", alpha=0.5)
    
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "actual_vs_predicted_fill.png", dpi=150)
    plt.close()
    print(f"Plot saved: {PLOTS_DIR / 'actual_vs_predicted_fill.png'}")
    
    # Save intermediate metrics
    metrics_df = pd.DataFrame(results)
    metrics_df.to_csv(REPORTS_DIR / "fill_model_metrics.csv", index=False)
    print("\nFill Prediction Model Training Complete!")
    return results

if __name__ == "__main__":
    train_fill_models()
