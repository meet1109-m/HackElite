"""
Normalized composition estimator class for WasteWise AI.
Ensures stable pickling/unpickling across modules.
"""
import numpy as np
from src.composition.preprocess import normalize_composition, COMPOSITION_TARGETS

class NormalizedCompositionEstimator:
    """Multi-target estimator wrapping individual component regressors with sum-to-100 normalization."""
    def __init__(self, models_dict):
        self.models_dict = models_dict
        self.targets = COMPOSITION_TARGETS
        
    def predict(self, X):
        preds = []
        for t in self.targets:
            pred_t = self.models_dict[t].predict(X)
            preds.append(pred_t)
        raw_matrix = np.column_stack(preds)
        normalized = normalize_composition(raw_matrix)
        return normalized
