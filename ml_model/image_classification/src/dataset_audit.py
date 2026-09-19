"""
DSWD Dataset Audit and Metadata Extraction Module.
Inspects original images and masks without modifying any files in DSWD/.
Extracts dominant instance classes per image, checks image integrity, and creates stratified splits.
"""
import os
import sys
from pathlib import Path
from collections import Counter
from PIL import Image
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# DSWD 14-class benchmark taxonomy
DSWD_CLASS_MAP = {
    1: "Plastic container",
    2: "Plastic bottle",
    3: "Thermocol",
    4: "Metal bottle",
    5: "Plastic cardboard",
    6: "Glass",
    7: "Thermocol plate",
    8: "Plastic",
    9: "Paper",
    10: "Plastic cup",
    11: "Paper cup",
    12: "Aluminium foil",
    13: "Cloth",
    14: "Nylon"
}

# High-level stream mapping for WasteWise AI integration
STREAM_MAP = {
    "Plastic container": "Plastic",
    "Plastic bottle": "Plastic",
    "Thermocol": "Plastic",
    "Metal bottle": "Metal",
    "Plastic cardboard": "Plastic",
    "Glass": "Glass",
    "Thermocol plate": "Plastic",
    "Plastic": "Plastic",
    "Paper": "Paper",
    "Plastic cup": "Plastic",
    "Paper cup": "Paper",
    "Aluminium foil": "Metal",
    "Cloth": "Other",
    "Nylon": "Plastic"
}

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DSWD_DIR = BASE_DIR / "data" / "DSWD" / "DSWD"
IMG_CLASS_DIR = BASE_DIR / "image_classification"
PROCESSED_DIR = IMG_CLASS_DIR / "processed"
REPORTS_DIR = IMG_CLASS_DIR / "reports"
MODELS_DIR = IMG_CLASS_DIR / "models"

for p in [PROCESSED_DIR, REPORTS_DIR, MODELS_DIR]:
    p.mkdir(parents=True, exist_ok=True)

def audit_dswd_dataset():
    print("Starting DSWD Dataset Audit...")
    
    train_img_dir = DSWD_DIR / "Train" / "Image"
    train_mask_dir = DSWD_DIR / "Train" / "Mask"
    test_img_dir = DSWD_DIR / "Test" / "Image"
    test_mask_dir = DSWD_DIR / "Test" / "Mask"
    
    train_images = sorted(list(train_img_dir.glob("*.png")))
    test_images = sorted(list(test_img_dir.glob("*.png")))
    all_image_paths = train_images + test_images
    
    print(f"Found {len(train_images)} Train images and {len(test_images)} Test images ({len(all_image_paths)} total).")
    
    records = []
    corrupt_records = []
    
    for img_path in all_image_paths:
        orig_split = "Train" if "Train" in str(img_path) else "Test"
        img_id = img_path.stem.replace("img_", "")
        mask_name = f"mask_{img_id}.png"
        mask_path = (train_mask_dir if orig_split == "Train" else test_mask_dir) / mask_name
        
        # 1. Verify image integrity
        try:
            with Image.open(img_path) as img:
                img.verify()
            with Image.open(img_path) as img:
                width, height = img.size
                mode = img.mode
        except Exception as e:
            corrupt_records.append({
                "file_path": str(img_path),
                "error": str(e)
            })
            continue
            
        # 2. Extract class labels from mask
        dominant_class_id = 0
        dominant_class_name = "Other"
        stream_name = "Other"
        
        if mask_path.exists():
            try:
                mask_arr = np.array(Image.open(mask_path))
                # Filter out background (0) and boundary (15)
                valid_pixels = mask_arr[(mask_arr > 0) & (mask_arr < 15)]
                if len(valid_pixels) > 0:
                    counts = Counter(valid_pixels)
                    dominant_class_id = counts.most_common(1)[0][0]
                    dominant_class_name = DSWD_CLASS_MAP.get(dominant_class_id, "Other")
                    stream_name = STREAM_MAP.get(dominant_class_name, "Other")
                else:
                    # If only 0 or 15 present, fallback to general waste
                    dominant_class_name = "Other"
                    stream_name = "Other"
            except Exception as e:
                print(f"Error reading mask {mask_path.name}: {e}")
                
        records.append({
            "image_id": img_id,
            "filename": img_path.name,
            "relative_path": str(img_path.relative_to(BASE_DIR)),
            "orig_split": orig_split,
            "width": width,
            "height": height,
            "mode": mode,
            "dominant_class_id": dominant_class_id,
            "class_name": dominant_class_name,
            "waste_stream": stream_name
        })
        
    # Save corrupt images report
    corrupt_df = pd.DataFrame(corrupt_records)
    corrupt_csv = BASE_DIR / "reports" / "corrupt_images.csv"
    corrupt_df.to_csv(corrupt_csv, index=False)
    print(f"Corrupt Images Check: {len(corrupt_records)} corrupted files detected (Report saved: {corrupt_csv})")
    
    df = pd.DataFrame(records)
    metadata_csv = PROCESSED_DIR / "dswd_metadata.csv"
    df.to_csv(metadata_csv, index=False)
    print(f"Saved dataset metadata to {metadata_csv}")
    
    # Class distribution
    class_counts = df["class_name"].value_counts()
    stream_counts = df["waste_stream"].value_counts()
    
    print("\nDSWD Fine-Grained Class Distribution:")
    for cname, count in class_counts.items():
        pct = (count / len(df)) * 100
        print(f"  - {cname}: {count} images ({pct:.1f}%)")
        
    print("\nWasteWise AI Waste Stream Distribution:")
    for sname, count in stream_counts.items():
        pct = (count / len(df)) * 100
        print(f"  - {sname}: {count} images ({pct:.1f}%)")
        
    # Generate Class Distribution Plot
    plt.figure(figsize=(10, 5))
    class_counts.plot(kind="bar", color="#2ca02c")
    plt.title("DSWD Waste Image Class Distribution")
    plt.xlabel("Waste Category")
    plt.ylabel("Number of Images")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "class_distribution.png", dpi=150)
    plt.close()
    print(f"Saved class distribution plot to {REPORTS_DIR / 'class_distribution.png'}")
    
    # Create Stratified 70/15/15 Train / Validation / Test Split
    # Set fixed random seed
    from sklearn.model_selection import train_test_split
    
    # Stratify by waste_stream (or class_name with min count handled)
    strat_key = df["waste_stream"]
    train_df, temp_df = train_test_split(df, test_size=0.30, random_state=42, stratify=strat_key)
    val_df, test_df = train_test_split(temp_df, test_size=0.50, random_state=42, stratify=temp_df["waste_stream"])
    
    train_df = train_df.copy()
    val_df = val_df.copy()
    test_df = test_df.copy()
    
    train_df["split"] = "train"
    val_df["split"] = "validation"
    test_df["split"] = "test"
    
    split_df = pd.concat([train_df, val_df, test_df]).sort_index()
    split_df.to_csv(PROCESSED_DIR / "dswd_splits.csv", index=False)
    print(f"\nStratified Splits Created:")
    print(f"  - Train: {len(train_df)} images ({(len(train_df)/len(df))*100:.1f}%)")
    print(f"  - Validation: {len(val_df)} images ({(len(val_df)/len(df))*100:.1f}%)")
    print(f"  - Test: {len(test_df)} images ({(len(test_df)/len(df))*100:.1f}%)")
    
    # Generate dataset_audit.md report
    audit_md = f"""# DSWD Waste Image Dataset Audit Report

**Dataset**: Dense Waste Segmentation / Deep Solid Waste Dataset (DSWD)  
**Total Images**: {len(df)}  
**Resolution**: {df['width'].iloc[0]}x{df['height'].iloc[0]} pixels (Color RGB)  
**Corrupt Files**: {len(corrupt_records)}  

## Class Distribution Summary

| Category | Image Count | Share (%) | Mapped Waste Stream |
| :--- | :--- | :--- | :--- |
"""
    for cname, count in class_counts.items():
        st = STREAM_MAP.get(cname, "Other")
        pct = (count / len(df)) * 100
        audit_md += f"| **{cname}** | {count} | {pct:.1f}% | {st} |\n"
        
    audit_md += f"""
## Stratified Splits (70% / 15% / 15%)
- **Training Set**: {len(train_df)} images
- **Validation Set**: {len(val_df)} images
- **Test Set (Held Out)**: {len(test_df)} images
"""
    with open(REPORTS_DIR / "dataset_audit.md", "w", encoding="utf-8") as f:
        f.write(audit_md)
    print(f"Generated {REPORTS_DIR / 'dataset_audit.md'}")

if __name__ == "__main__":
    audit_dswd_dataset()
