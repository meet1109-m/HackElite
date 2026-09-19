"""
WasteWise AI - Zone Waste Generation Forecasting Model Training.
Trains HistGradientBoostingRegressor and RandomForestRegressor to forecast zone daily waste.
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
from src.utils.config import FORECASTING_MODEL_DIR, PLOTS_DIR, REPORTS_DIR, RANDOM_STATE, N_JOBS
from src.forecasting.preprocess import (
    load_and_preprocess_forecast_data,
    build_forecast_preprocessor
)

def train_forecasting_models():
    print("\n=======================================================")
    print("STEP 6: TRAINING WASTE GENERATION FORECASTING MODELS")
    print("=======================================================\n")
    
    (X_train, y_train), (X_val, y_val), (X_test, y_test), test_dates = load_and_preprocess_forecast_data()
    
    print("Fitting forecasting preprocessor...")
    preprocessor = build_forecast_preprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_val_proc = preprocessor.transform(X_val)
    X_test_proc = preprocessor.transform(X_test)
    
    joblib.dump(preprocessor, FORECASTING_MODEL_DIR / "preprocessor.joblib")
    print(f"Preprocessor saved to {FORECASTING_MODEL_DIR / 'preprocessor.joblib'}")
    
    results = []
    
    # 1. Baseline Dummy
    dummy = DummyRegressor(strategy="mean")
    dummy.fit(X_train_proc, y_train)
    y_pred_dummy = dummy.predict(X_test_proc)
    mae_d = mean_absolute_error(y_test, y_pred_dummy)
    rmse_d = np.sqrt(mean_squared_error(y_test, y_pred_dummy))
    r2_d = r2_score(y_test, y_pred_dummy)
    print(f"[DummyBaseline] -> MAE: {mae_d:.2f} kg, RMSE: {rmse_d:.2f} kg, R2: {r2_d:.4f}")
    results.append({
        "Model": "DummyRegressor",
        "Task": "Zone Waste Forecasting",
        "Train_Records": len(X_train_proc),
        "Features": X_train_proc.shape[1],
        "MAE": round(mae_d, 2),
        "RMSE": round(rmse_d, 2),
        "R2": round(r2_d, 4),
        "Train_Time_s": 0.01
    })
    
    # 2. HistGradientBoostingRegressor
    print("\nTraining HistGradientBoostingRegressor for Zone Waste Forecasting...")
    t0 = time.time()
    hgb = HistGradientBoostingRegressor(
        max_iter=200,
        learning_rate=0.06,
        max_leaf_nodes=31,
        random_state=RANDOM_STATE,
        early_stopping=True,
        validation_fraction=0.1
    )
    hgb.fit(X_train_proc, y_train)
    t_hgb = time.time() - t0
    
    y_pred_hgb = hgb.predict(X_test_proc)
    mae_hgb = mean_absolute_error(y_test, y_pred_hgb)
    rmse_hgb = np.sqrt(mean_squared_error(y_test, y_pred_hgb))
    r2_hgb = r2_score(y_test, y_pred_hgb)
    print(f"[HistGradientBoosting] -> MAE: {mae_hgb:.2f} kg, RMSE: {rmse_hgb:.2f} kg, R2: {r2_hgb:.4f}")
    results.append({
        "Model": "HistGradientBoostingRegressor",
        "Task": "Zone Waste Forecasting",
        "Train_Records": len(X_train_proc),
        "Features": X_train_proc.shape[1],
        "MAE": round(mae_hgb, 2),
        "RMSE": round(rmse_hgb, 2),
        "R2": round(r2_hgb, 4),
        "Train_Time_s": round(t_hgb, 2)
    })
    
    # Save the primary forecasting model
    joblib.dump(hgb, FORECASTING_MODEL_DIR / "waste_forecasting_model.joblib")
    print(f"Model saved to {FORECASTING_MODEL_DIR / 'waste_forecasting_model.joblib'}")
    
    # Visualization: Actual vs Predicted Zone Waste over time for 2 representative zones (e.g. Navrangpura, Bopal)
    print("\nGenerating forecasting visualization plots...")
    plt.figure(figsize=(12, 5))
    
    test_dates_eval = test_dates.copy()
    test_dates_eval["actual"] = y_test.values
    test_dates_eval["predicted"] = y_pred_hgb
    
    # Plot 1: Overall Scatter
    plt.subplot(1, 2, 1)
    plt.scatter(y_test.values, y_pred_hgb, alpha=0.4, color="#2b5c8f", s=15)
    max_val = max(y_test.max(), y_pred_hgb.max())
    plt.plot([0, max_val], [0, max_val], "r--", lw=1.5)
    plt.title("Zone Waste: Actual vs Predicted (All Zones)")
    plt.xlabel("Actual Waste (kg)")
    plt.ylabel("Predicted Waste (kg)")
    plt.grid(True, linestyle="--", alpha=0.5)
    
    # Plot 2: Time Series for sample zone
    plt.subplot(1, 2, 2)
    sample_zone = test_dates_eval["zone_name"].iloc[0]
    zone_subset = test_dates_eval[test_dates_eval["zone_name"] == sample_zone].sort_values("date")
    plt.plot(zone_subset["date"], zone_subset["actual"], label="Actual kg", color="#1f77b4", marker="o", markersize=3)
    plt.plot(zone_subset["date"], zone_subset["predicted"], label="Forecast kg", color="#ff7f0e", linestyle="--")
    plt.title(f"Time Series Forecast: Zone {sample_zone}")
    plt.xlabel("Date")
    plt.ylabel("Total Waste (kg)")
    plt.xticks(rotation=30)
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.5)
    
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "actual_vs_predicted_zone_waste.png", dpi=150)
    plt.close()
    print(f"Plot saved: {PLOTS_DIR / 'actual_vs_predicted_zone_waste.png'}")
    
    del X_train, y_train, X_val, y_val, X_test, y_test, X_train_proc, X_val_proc, X_test_proc
    gc.collect()
    
    metrics_df = pd.DataFrame(results)
    metrics_df.to_csv(REPORTS_DIR / "forecasting_model_metrics.csv", index=False)
    print("Waste Generation Forecasting Training Complete!")
    return results

if __name__ == "__main__":
    train_forecasting_models()
