"""
WasteWise AI - Waste Composition Model Training Pipeline.
Trains lightweight tree-based models to estimate waste fractions.
Ensures outputs are non-negative and strictly sum to 100%.
"""
import sys
import gc
import time
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.utils.config import COMPOSITION_MODEL_DIR, PLOTS_DIR, REPORTS_DIR, RANDOM_STATE
from src.composition.preprocess import (
    load_and_preprocess_composition_data,
    build_composition_preprocessor,
    COMPOSITION_TARGETS
)
from src.composition.estimator import NormalizedCompositionEstimator

def train_composition_models():
    print("\n=======================================================")
    print("STEP 5: TRAINING WASTE COMPOSITION ESTIMATION MODELS")
    print("=======================================================\n")
    
    (X_train, y_train), (X_val, y_val), (X_test, y_test) = load_and_preprocess_composition_data()
    
    print("Fitting composition preprocessor...")
    preprocessor = build_composition_preprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_val_proc = preprocessor.transform(X_val)
    X_test_proc = preprocessor.transform(X_test)
    
    joblib.dump(preprocessor, COMPOSITION_MODEL_DIR / "preprocessor.joblib")
    print(f"Preprocessor saved to {COMPOSITION_MODEL_DIR / 'preprocessor.joblib'}")
    
    trained_submodels = {}
    results = []
    
    t0 = time.time()
    for target in COMPOSITION_TARGETS:
        print(f"Training HistGradientBoosting for {target}...")
        y_tr = y_train[target].values
        y_te = y_test[target].values
        
        # Dummy
        dummy = DummyRegressor(strategy="mean")
        dummy.fit(X_train_proc, y_tr)
        
        # HGB
        hgb = HistGradientBoostingRegressor(
            max_iter=150,
            learning_rate=0.08,
            max_leaf_nodes=31,
            random_state=RANDOM_STATE,
            early_stopping=True
        )
        hgb.fit(X_train_proc, y_tr)
        trained_submodels[target] = hgb
        
        y_pred = hgb.predict(X_test_proc)
        mae = mean_absolute_error(y_te, y_pred)
        rmse = np.sqrt(mean_squared_error(y_te, y_pred))
        r2 = r2_score(y_te, y_pred)
        print(f"  [{target}] -> MAE: {mae:.2f}%, RMSE: {rmse:.2f}%, R2: {r2:.4f}")
        
        results.append({
            "Model": "HistGradientBoostingRegressor",
            "Task": f"Composition Estimation ({target})",
            "Component": target,
            "Train_Records": len(X_train_proc),
            "Features": X_train_proc.shape[1],
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "R2": round(r2, 4),
        })
        
    total_time = time.time() - t0
    
    # Wrap in normalized estimator
    final_estimator = NormalizedCompositionEstimator(trained_submodels)
    joblib.dump(final_estimator, COMPOSITION_MODEL_DIR / "composition_model.joblib")
    print(f"Saved normalized composition model to {COMPOSITION_MODEL_DIR / 'composition_model.joblib'}")
    
    # Evaluate normalized multi-target predictions
    norm_preds = final_estimator.predict(X_test_proc)
    y_test_mat = y_test.values
    overall_mae = mean_absolute_error(y_test_mat, norm_preds)
    overall_r2 = r2_score(y_test_mat, norm_preds)
    print(f"\nOverall Normalized Composition -> MAE: {overall_mae:.2f}%, Mean R2: {overall_r2:.4f}")
    
    # Visualizations: Actual vs Predicted shares
    print("\nGenerating composition visualization plot...")
    plt.figure(figsize=(12, 6))
    sample_idx = np.random.RandomState(42).choice(len(y_test_mat), size=min(500, len(y_test_mat)), replace=False)
    
    for i, target in enumerate(COMPOSITION_TARGETS):
        plt.subplot(2, 3, i + 1)
        plt.scatter(y_test_mat[sample_idx, i], norm_preds[sample_idx, i], alpha=0.4, s=15, color="#ff7f0e")
        plt.plot([0, 100], [0, 100], "k--", lw=1.2)
        plt.title(f"{target.replace('_percentage', '').capitalize()} %")
        plt.xlabel("Actual %")
        plt.ylabel("AI Estimated %")
        plt.grid(True, linestyle="--", alpha=0.5)
        
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "actual_vs_predicted_composition.png", dpi=150)
    plt.close()
    print(f"Plot saved: {PLOTS_DIR / 'actual_vs_predicted_composition.png'}")
    
    del X_train, y_train, X_val, y_val, X_test, y_test, X_train_proc, X_val_proc, X_test_proc
    gc.collect()
    
    metrics_df = pd.DataFrame(results)
    metrics_df.to_csv(REPORTS_DIR / "composition_model_metrics.csv", index=False)
    print("Waste Composition Model Training Complete!")
    return results

if __name__ == "__main__":
    train_composition_models()
