"""
WasteWise AI - Unsupervised Anomaly Detection Training Pipeline.
Trains Isolation Forest on behavioral waste metrics and evaluates against held-out ground truth.
"""
import sys
import gc
import time
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import joblib
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.utils.config import ANOMALY_MODEL_DIR, PLOTS_DIR, REPORTS_DIR, RANDOM_STATE, N_JOBS
from src.anomaly_detection.preprocess import (
    load_and_preprocess_anomaly_data,
    build_anomaly_preprocessor
)

def train_anomaly_model():
    print("\n=======================================================")
    print("STEP 7: TRAINING ISOLATION FOREST ANOMALY DETECTION")
    print("=======================================================\n")
    
    X, y_ground_truth, metadata = load_and_preprocess_anomaly_data()
    
    print("Fitting anomaly preprocessor...")
    preprocessor = build_anomaly_preprocessor()
    X_proc = preprocessor.fit_transform(X)
    
    # Save preprocessor
    joblib.dump(preprocessor, ANOMALY_MODEL_DIR / "preprocessor.joblib")
    
    # Train Isolation Forest
    # Contamination approximate between 1% and 3%
    contamination = 0.02
    print(f"Training IsolationForest (contamination={contamination}, n_estimators=100, n_jobs={N_JOBS})...")
    
    t0 = time.time()
    iso = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=RANDOM_STATE,
        n_jobs=N_JOBS
    )
    iso.fit(X_proc)
    train_time = time.time() - t0
    
    # Save model
    joblib.dump(iso, ANOMALY_MODEL_DIR / "isolation_forest.joblib")
    print(f"Model saved to {ANOMALY_MODEL_DIR / 'isolation_forest.joblib'}")
    
    # Predict (-1 is anomaly, 1 is normal)
    preds = iso.predict(X_proc)
    pred_binary = np.where(preds == -1, 1, 0)
    
    # Decision function (negative score indicates anomaly)
    scores = iso.decision_function(X_proc)
    
    # Evaluate against held-out ground truth
    num_anomalies_detected = int(np.sum(pred_binary))
    precision = precision_score(y_ground_truth, pred_binary, zero_division=0)
    recall = recall_score(y_ground_truth, pred_binary, zero_division=0)
    f1 = f1_score(y_ground_truth, pred_binary, zero_division=0)
    cm = confusion_matrix(y_ground_truth, pred_binary)
    
    print(f"\n--- Unsupervised Anomaly Detection Results vs Ground Truth ---")
    print(f"Total Evaluated Records: {len(X):,}")
    print(f"Ground Truth Anomalies: {int(np.sum(y_ground_truth)):,}")
    print(f"Detected Anomalies: {num_anomalies_detected:,}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1-Score: {f1:.4f}")
    print(f"Confusion Matrix (TN, FP, FN, TP):\n{cm}")
    
    # Visualization: Waste Generation vs Average Bin Fill highlighting anomalies
    print("\nGenerating anomaly detection visualization plot...")
    plt.figure(figsize=(10, 6))
    normal_mask = pred_binary == 0
    anomaly_mask = pred_binary == 1
    
    plt.scatter(
        metadata.loc[normal_mask, "total_waste_kg"],
        metadata.loc[normal_mask, "average_bin_fill_percentage"],
        c="#1f77b4", alpha=0.3, s=15, label="Normal Operation"
    )
    plt.scatter(
        metadata.loc[anomaly_mask, "total_waste_kg"],
        metadata.loc[anomaly_mask, "average_bin_fill_percentage"],
        c="#d62728", alpha=0.9, s=45, marker="x", label=f"Detected Anomaly (n={num_anomalies_detected})"
    )
    
    plt.title("WasteWise AI: Zone-Level Waste Generation Anomaly Detection")
    plt.xlabel("Total Waste Generated (kg)")
    plt.ylabel("Average Bin Fill Percentage (%)")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.5)
    
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "anomaly_detection_scatter.png", dpi=150)
    plt.close()
    print(f"Plot saved: {PLOTS_DIR / 'anomaly_detection_scatter.png'}")
    
    # Save metrics
    results = [{
        "Model": "IsolationForest",
        "Task": "Anomaly Detection",
        "Train_Records": len(X),
        "Features": X.shape[1],
        "Contamination": contamination,
        "Detected_Anomalies": num_anomalies_detected,
        "Precision": round(precision, 4),
        "Recall": round(recall, 4),
        "F1": round(f1, 4),
        "Confusion_Matrix": str(cm.tolist()),
        "Train_Time_s": round(train_time, 2)
    }]
    
    metrics_df = pd.DataFrame(results)
    metrics_df.to_csv(REPORTS_DIR / "anomaly_model_metrics.csv", index=False)
    print("Anomaly Detection Training Complete!")
    return results

if __name__ == "__main__":
    train_anomaly_model()
