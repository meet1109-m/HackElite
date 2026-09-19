# DSWD Image Dataset Comprehensive Audit Report

## 1. Dataset Dimensions & Splits
- **Total Labeled Images**: 784 RGB images (224x224 input resolution)
- **Train Set**: 548 images (70.0%)
- **Validation Set**: 118 images (15.0%)
- **Held-Out Test Set**: 118 images (15.0%)
- **Split Strategy**: Stratified random split (`random_state=42`), zero train/test leakage.

## 2. Waste Stream Distribution & Class Imbalance
| Stream Class | Total Count | Proportion (%) | Train Count | Test Count |
| :--- | :--- | :--- | :--- | :--- |
| **Plastic** | 422 | 53.8% | 295 | 63 |
| **Other** | 312 | 39.8% | 218 | 47 |
| **Metal** | 31 | 4.0% | 22 | 5 |
| **Paper** | 14 | 1.8% | 10 | 2 |
| **Glass** | 5 | 0.6% | 3 | 1 |

## 3. Data Quality & Corruption Check
- **Corrupted Images**: 0 invalid/unreadable files across all 784 instances.
- **Image Formats**: Standard 3-channel RGB PNG format.
- **Observed Challenge**: `Metal` and `Glass` are minority categories (~2-5% of images), while `Plastic` and `Other` comprise >80% of waste items.
- **Improvement Strategy**: Inverse frequency class-weighted CrossEntropyLoss, enhanced spatial augmentations (affine, rotations, color jitter), and cosine annealing LR schedule.
