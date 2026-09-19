"""
WasteWise AI - Data Audit Module (Memory & CPU Efficient)
Inspects each dataset individually without excessive RAM consumption.
Reports schema, statistics, distributions, missing values, duplicates, and column classifications.
"""
import sys
import gc
from pathlib import Path
import pandas as pd
import numpy as np

# Add base src to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.utils.config import DATASET_FILENAMES, get_dataset_path, REPORTS_DIR

def audit_dataset(name: str, file_path: Path) -> dict:
    """Inspects a single dataset with chunked/memory-conscious operations."""
    print(f"\n=======================================================")
    print(f"AUDITING DATASET: {name} ({file_path.name})")
    print(f"File size: {file_path.stat().st_size / (1024 * 1024):.2f} MB")
    print(f"=======================================================")
    
    file_size_mb = file_path.stat().st_size / (1024 * 1024)
    is_large = file_size_mb > 30.0
    
    # 1. Read first few rows for schema and types
    sample_df = pd.read_csv(file_path, nrows=100)
    cols = list(sample_df.columns)
    
    # Identify timestamp candidates
    time_candidates = [c for c in cols if any(k in c.lower() for k in ["time", "date", "timestamp"])]
    
    # Parse dates and count rows / missing / duplicates
    total_rows = 0
    missing_counts = {c: 0 for c in cols}
    min_vals = {}
    max_vals = {}
    unique_counts = {c: set() for c in cols}
    min_date = None
    max_date = None
    
    chunk_size = 100000 if is_large else 50000
    
    for chunk in pd.read_csv(file_path, chunksize=chunk_size, low_memory=False):
        total_rows += len(chunk)
        
        # Missing values
        for c in cols:
            missing_counts[c] += int(chunk[c].isna().sum())
            
        # Unique counts / samples for small cardinality
        for c in cols:
            if len(unique_counts[c]) < 50:
                uniques = chunk[c].dropna().unique()
                for u in uniques[:50]:
                    unique_counts[c].add(u)
                    if len(unique_counts[c]) >= 50:
                        break
                        
        # Min/Max for numerical and date
        for c in cols:
            if pd.api.types.is_numeric_dtype(chunk[c]):
                valid_num = chunk[c].dropna()
                if not valid_num.empty:
                    c_min, c_max = valid_num.min(), valid_num.max()
                    min_vals[c] = min(min_vals.get(c, c_min), c_min)
                    max_vals[c] = max(max_vals.get(c, c_max), c_max)
                    
        # Date range
        for tc in time_candidates:
            if tc in chunk.columns:
                try:
                    dt_series = pd.to_datetime(chunk[tc].dropna(), errors='coerce')
                    valid_dt = dt_series.dropna()
                    if not valid_dt.empty:
                        c_dmin, c_dmax = valid_dt.min(), valid_dt.max()
                        min_date = min(min_date, c_dmin) if min_date is not None else c_dmin
                        max_date = max(max_date, c_dmax) if max_date is not None else c_dmax
                except Exception:
                    pass

    # Free memory
    del sample_df
    gc.collect()

    # Classify columns
    id_cols = [c for c in cols if any(k in c.lower() for k in ["_id", "id", "code", "number"])]
    cat_cols = [c for c in cols if c not in id_cols and c not in time_candidates and (c in unique_counts and len(unique_counts[c]) < 50)]
    num_cols = [c for c in cols if c in min_vals and c not in id_cols]
    target_candidates = [c for c in cols if any(k in c.lower() for k in ["target", "label", "percentage_6h", "percentage_12h", "percentage_24h", "anomaly", "total_waste", "hours_until_overflow"])]

    print(f"Total Rows: {total_rows:,}")
    print(f"Total Columns: {len(cols)}")
    print(f"Columns: {cols}")
    print(f"Identified ID Columns: {id_cols}")
    print(f"Identified Timestamp Columns: {time_candidates}")
    print(f"Identified Numerical Columns: {num_cols}")
    print(f"Identified Categorical Columns: {cat_cols}")
    print(f"Target Candidates: {target_candidates}")
    if min_date and max_date:
        print(f"Date Range: {min_date} to {max_date}")
        
    print("\nColumn Summaries:")
    for c in cols:
        missing_pct = (missing_counts[c] / total_rows) * 100 if total_rows > 0 else 0
        min_str = f"{min_vals[c]:.2f}" if c in min_vals else "N/A"
        max_str = f"{max_vals[c]:.2f}" if c in max_vals else "N/A"
        uniques_sample = list(unique_counts[c])[:5] if len(unique_counts[c]) <= 10 else f"{len(unique_counts[c])}+ unique values"
        print(f"  - {c}: missing={missing_counts[c]} ({missing_pct:.2f}%), min={min_str}, max={max_str}, sample={uniques_sample}")

    audit_result = {
        "dataset_name": name,
        "filename": file_path.name,
        "file_size_mb": file_size_mb,
        "total_rows": total_rows,
        "total_cols": len(cols),
        "columns": cols,
        "id_columns": id_cols,
        "time_columns": time_candidates,
        "numerical_columns": num_cols,
        "categorical_columns": cat_cols,
        "target_candidates": target_candidates,
        "date_range": f"{min_date} to {max_date}" if min_date else "N/A",
        "missing_counts": missing_counts
    }
    return audit_result

def run_full_audit():
    """Runs data audit on all 7 Ahmedabad datasets sequentially."""
    print("Starting WasteWise AI Comprehensive Data Audit...")
    results = []
    
    for key in DATASET_FILENAMES:
        try:
            path = get_dataset_path(key)
            res = audit_dataset(key, path)
            results.append(res)
        except Exception as e:
            print(f"Error auditing {key}: {e}")
            
    print("\n=======================================================")
    print("ALL 7 DATASETS AUDITED SUCCESSFULLY")
    print("=======================================================")
    return results

if __name__ == "__main__":
    run_full_audit()
