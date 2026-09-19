# DSWD Waste Image Classification Model Report

**Architecture**: Pretrained `MobileNetV2` with Custom 5-Class Linear Head  
**Training Strategy**: Two-Stage Transfer Learning (Stage 1: Frozen Backbone, Stage 2: Fine-Tuning Top Blocks)  
**Hardware / Runtime**: CPU-Only, 391.4s training duration  
**Source Tag**: `AI Detected from Image` (strictly distinguished from Tabular `AI Estimated`)

---

## 1. Dataset & Split Configuration
- **Total Dataset Size**: 784 RGB images (224x224 input resolution)
- **Train Set**: 548 images (70%)
- **Validation Set**: 118 images (15%)
- **Held-Out Test Set**: 118 images (15%)

---

## 2. Test Set Evaluation Metrics

| Metric | Empirical Score |
| :--- | :--- |
| **Accuracy** | **61.86%** |
| **Macro Precision** | **0.3556** |
| **Macro Recall** | **0.3642** |
| **Macro F1-Score** | **0.3579** |
| **Weighted F1-Score** | **0.6118** |

### Per-Category Performance Breakdown

| Waste Category | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- |
| **Plastic** | 0.7091 | 0.619 | 0.661 |
| **Other** | 0.569 | 0.7021 | 0.6286 |
| **Metal** | 0.0 | 0.0 | 0.0 |
| **Paper** | 0.5 | 0.5 | 0.5 |
| **Glass** | 0.0 | 0.0 | 0.0 |

---

## 3. Error Analysis & Class Confusion
- **Dominant Categories**: Plastic and Other form the majority of instance annotations, achieving high recognition recall.
- **Observed Confusion**: Metal foil and paper wrappers occasionally overlap with general dry packaging in low-contrast conditions.
- **Mitigation**: Inverse frequency class-weighted loss and on-the-fly data augmentations (flips, rotations, jitter).
