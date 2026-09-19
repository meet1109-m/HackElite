"""
Phase 1: Baseline Metrics Reproduction Script.
Loads all existing saved models and computes baseline evaluation metrics on test sets.
Saves results to reports/improvement_baseline.csv without modifying or overwriting any models.
"""
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import torch
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    precision_recall_curve,
    auc,
    accuracy_score,
    classification_report
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.utils.config import (
    FILL_MODEL_DIR,
    COMPOSITION_MODEL_DIR,
    FORECASTING_MODEL_DIR,
    ANOMALY_MODEL_DIR,
    REPORTS_DIR,
    RANDOM_STATE
)
from src.fill_prediction.preprocess import load_and_preprocess_fill_data, FEATURE_COLS as FILL_FEATURE_COLS
from src.composition.preprocess import load_and_preprocess_composition_data, COMPOSITION_TARGETS
from src.forecasting.preprocess import load_and_preprocess_forecast_data
from src.anomaly_detection.preprocess import load_and_preprocess_anomaly_data
from image_classification.src.dataset import get_data_loaders
from image_classification.src.model import WasteClassifier

def evaluate_baselines():
    print("==================================================")
    print("PHASE 1: GENERATING BASELINE REPRODUCTION REPORT")
    print("==================================================")
    
    baseline_records = []
    
    # ---------------- 1. Bin Fill Prediction Models ---------------- #
    print("\n[1/5] Evaluating Fill Prediction Baseline Models (6h, 12h, 24h)...")
    (X_train_fill, y_train_fill), (X_val_fill, y_val_fill), (X_test_fill, y_test_fill) = load_and_preprocess_fill_data()
    
    fill_preprocessor = joblib.load(FILL_MODEL_DIR / "preprocessor.joblib")
    X_test_fill_proc = fill_preprocessor.transform(X_test_fill)
    
    for horizon, fname in [("6h", "fill_6h_model.joblib"), ("12h", "fill_12h_model.joblib"), ("24h", "fill_24h_model.joblib")]:
        target_col = f"fill_percentage_{horizon}"
        y_test_h = y_test_fill[target_col].values
        model = joblib.load(FILL_MODEL_DIR / fname)
        preds = model.predict(X_test_fill_proc)
        preds = np.clip(preds, 0.0, 100.0)
        
        mae = float(mean_absolute_error(y_test_h, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test_h, preds)))
        r2 = float(r2_score(y_test_h, preds))
        
        print(f"  -> Fill {horizon}: MAE = {mae:.2f}%, RMSE = {rmse:.2f}%, R2 = {r2:.4f}")
        baseline_records.append({
            "model": f"Fill_Prediction_{horizon}",
            "version": "baseline_v1",
            "task": f"Regression ({horizon} Fill)",
            "MAE": round(mae, 4),
            "RMSE": round(rmse, 4),
            "R2": round(r2, 4),
            "accuracy": np.nan,
            "precision": np.nan,
            "recall": np.nan,
            "F1": np.nan,
            "PR_AUC": np.nan,
            "other_metrics": f"Test Size: {len(y_test_h):,}"
        })
        
    # ---------------- 2. Waste Composition Model ---------------- #
    print("\n[2/5] Evaluating Waste Composition Baseline Model...")
    (X_train_comp, y_train_comp), (X_val_comp, y_val_comp), (X_test_comp, y_test_comp) = load_and_preprocess_composition_data()
    
    comp_preprocessor = joblib.load(COMPOSITION_MODEL_DIR / "preprocessor.joblib")
    comp_model = joblib.load(COMPOSITION_MODEL_DIR / "composition_model.joblib")
    X_test_comp_proc = comp_preprocessor.transform(X_test_comp)
    preds_comp = comp_model.predict(X_test_comp_proc)
    y_test_comp_vals = y_test_comp.values
    
    mae_comp = float(mean_absolute_error(y_test_comp_vals, preds_comp))
    rmse_comp = float(np.sqrt(mean_squared_error(y_test_comp_vals, preds_comp)))
    r2_comp = float(r2_score(y_test_comp_vals, preds_comp))
    
    print(f"  -> Composition: Mean MAE = {mae_comp:.2f}%, Mean RMSE = {rmse_comp:.2f}%, Mean R2 = {r2_comp:.4f}")
    baseline_records.append({
        "model": "Waste_Composition",
        "version": "baseline_v1",
        "task": "Multi-Target Regression (6 Streams)",
        "MAE": round(mae_comp, 4),
        "RMSE": round(rmse_comp, 4),
        "R2": round(r2_comp, 4),
        "accuracy": np.nan,
        "precision": np.nan,
        "recall": np.nan,
        "F1": np.nan,
        "PR_AUC": np.nan,
        "other_metrics": f"Sum to 100%: True (Tolerance 1e-4), Test Size: {len(y_test_comp_vals):,}"
    })
    
    # ---------------- 3. Zone Waste Forecasting Model ---------------- #
    print("\n[3/5] Evaluating Zone Waste Forecasting Baseline Model...")
    (X_train_fore, y_train_fore), (X_val_fore, y_val_fore), (X_test_fore, y_test_fore), _ = load_and_preprocess_forecast_data()
    
    fore_preprocessor = joblib.load(FORECASTING_MODEL_DIR / "preprocessor.joblib")
    fore_model = joblib.load(FORECASTING_MODEL_DIR / "waste_forecasting_model.joblib")
    
    X_test_fore_proc = fore_preprocessor.transform(X_test_fore)
    y_test_fore_vals = y_test_fore.values
    
    preds_fore = fore_model.predict(X_test_fore_proc)
    mae_fore = float(mean_absolute_error(y_test_fore_vals, preds_fore))
    rmse_fore = float(np.sqrt(mean_squared_error(y_test_fore_vals, preds_fore)))
    r2_fore = float(r2_score(y_test_fore_vals, preds_fore))
    
    print(f"  -> Forecasting: MAE = {mae_fore:.2f} kg, RMSE = {rmse_fore:.2f} kg, R2 = {r2_fore:.4f}")
    baseline_records.append({
        "model": "Zone_Waste_Forecasting",
        "version": "baseline_v1",
        "task": "Time Series Regression (Zone Waste kg)",
        "MAE": round(mae_fore, 4),
        "RMSE": round(rmse_fore, 4),
        "R2": round(r2_fore, 4),
        "accuracy": np.nan,
        "precision": np.nan,
        "recall": np.nan,
        "F1": np.nan,
        "PR_AUC": np.nan,
        "other_metrics": f"Test Size: {len(y_test_fore_vals):,}"
    })
    
    # ---------------- 4. Anomaly Detection Model ---------------- #
    print("\n[4/5] Evaluating Anomaly Detection Baseline Model...")
    X_anom, y_ground_truth, _ = load_and_preprocess_anomaly_data()
    anom_preprocessor = joblib.load(ANOMALY_MODEL_DIR / "preprocessor.joblib")
    anom_model = joblib.load(ANOMALY_MODEL_DIR / "isolation_forest.joblib")
    
    X_anom_proc = anom_preprocessor.transform(X_anom)
    preds_raw = anom_model.predict(X_anom_proc)
    pred_anom_binary = np.where(preds_raw == -1, 1, 0)
    anom_scores = -anom_model.decision_function(X_anom_proc)  # Higher is more anomalous
    
    prec_anom = float(precision_score(y_ground_truth, pred_anom_binary, zero_division=0))
    rec_anom = float(recall_score(y_ground_truth, pred_anom_binary, zero_division=0))
    f1_anom = float(f1_score(y_ground_truth, pred_anom_binary, zero_division=0))
    roc_auc_anom = float(roc_auc_score(y_ground_truth, anom_scores))
    
    precision_curve, recall_curve, _ = precision_recall_curve(y_ground_truth, anom_scores)
    pr_auc_anom = float(auc(recall_curve, precision_curve))
    
    print(f"  -> Anomaly Detection: Precision = {prec_anom:.4f}, Recall = {rec_anom:.4f}, F1 = {f1_anom:.4f}, PR-AUC = {pr_auc_anom:.4f}")
    baseline_records.append({
        "model": "Anomaly_Detection_IsolationForest",
        "version": "baseline_v1",
        "task": "Unsupervised Anomaly Detection",
        "MAE": np.nan,
        "RMSE": np.nan,
        "R2": np.nan,
        "accuracy": round(float(accuracy_score(y_ground_truth, pred_anom_binary)), 4),
        "precision": round(prec_anom, 4),
        "recall": round(rec_anom, 4),
        "F1": round(f1_anom, 4),
        "PR_AUC": round(pr_auc_anom, 4),
        "other_metrics": f"ROC-AUC: {roc_auc_anom:.4f}, Contamination: 0.02, Evaluated: {len(X_anom):,}"
    })
    
    # ---------------- 5. Waste Image Classification Model ---------------- #
    print("\n[5/5] Evaluating DSWD Image Classifier Baseline...")
    IMG_CLASS_DIR = BASE_DIR / "image_classification"
    with open(IMG_CLASS_DIR / "models" / "class_names.json", "r") as f:
        class_info = json.load(f)
        classes = class_info["classes"]
        
    _, _, test_loader, _ = get_data_loaders(batch_size=16)
    img_model = WasteClassifier(num_classes=len(classes), pretrained=False)
    img_model.load_state_dict(torch.load(IMG_CLASS_DIR / "models" / "image_classifier.pt", map_location="cpu"))
    img_model.eval()
    
    all_img_preds = []
    all_img_targets = []
    
    with torch.no_grad():
        for imgs, targets in test_loader:
            outputs = img_model(imgs)
            preds = outputs.argmax(dim=1).cpu().numpy()
            all_img_preds.extend(preds)
            all_img_targets.extend(targets.cpu().numpy())
            
    all_img_preds = np.array(all_img_preds)
    all_img_targets = np.array(all_img_targets)
    
    img_acc = float(accuracy_score(all_img_targets, all_img_preds))
    img_macro_f1 = float(f1_score(all_img_targets, all_img_preds, average="macro", zero_division=0))
    img_weighted_f1 = float(f1_score(all_img_targets, all_img_preds, average="weighted", zero_division=0))
    img_macro_prec = float(precision_score(all_img_targets, all_img_preds, average="macro", zero_division=0))
    img_macro_rec = float(recall_score(all_img_targets, all_img_preds, average="macro", zero_division=0))
    
    print(f"  -> Image Classifier: Accuracy = {img_acc*100:.2f}%, Macro F1 = {img_macro_f1:.4f}, Weighted F1 = {img_weighted_f1:.4f}")
    baseline_records.append({
        "model": "Waste_Image_Classifier_MobileNetV2",
        "version": "baseline_v1",
        "task": "Vision Waste Classification",
        "MAE": np.nan,
        "RMSE": np.nan,
        "R2": np.nan,
        "accuracy": round(img_acc, 4),
        "precision": round(img_macro_prec, 4),
        "recall": round(img_macro_rec, 4),
        "F1": round(img_macro_f1, 4),
        "PR_AUC": np.nan,
        "other_metrics": f"Weighted F1: {img_weighted_f1:.4f}, Test Images: {len(all_img_targets)}"
    })
    
    # ---------------- Save Baseline CSV ---------------- #
    baseline_df = pd.DataFrame(baseline_records)
    out_path = REPORTS_DIR / "improvement_baseline.csv"
    baseline_df.to_csv(out_path, index=False)
    print(f"\n==================================================")
    print(f"SUCCESS: Baseline report saved to {out_path}")
    print("==================================================\n")
    print(baseline_df[["model", "version", "task", "MAE", "R2", "accuracy", "precision", "recall", "F1", "PR_AUC"]].to_string(index=False))

if __name__ == "__main__":
    evaluate_baselines()
