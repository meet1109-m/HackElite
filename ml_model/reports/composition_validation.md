# WasteWise AI — Waste Composition Model Validation Report

**Designation**: `AI Estimated Waste Composition` (Distinct from CV Image Classifier)  
**Sum Constraint**: Strictly enforced $\sum_{k=1}^6 \text{Share}_k = 100.0\%$  
**Overall Performance**: **Mean MAE: 3.25%** | **Mean $R^2$: 0.7484**

## Per-Category Evaluation Metrics

| Category | MAE (%) | RMSE (%) | $R^2$ Score |
| :--- | :--- | :--- | :--- |
| **Plastic** | 3.84% | 4.96% | 0.8141 |
| **Paper** | 3.56% | 4.66% | 0.8337 |
| **Metal** | 2.03% | 2.86% | 0.7084 |
| **Glass** | 2.24% | 3.0% | 0.5275 |
| **Organic** | 4.46% | 5.76% | 0.9648 |
| **Other** | 3.39% | 4.35% | 0.6418 |

### Normalization & Boundary Verification
- Non-negativity check: **PASSED** (0 negative predictions across all test cases)
- Sum-to-100% check: **PASSED** (maximum floating-point deviation across test set = 0.0200%)
