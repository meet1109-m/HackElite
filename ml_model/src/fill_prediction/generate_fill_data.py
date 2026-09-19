"""
Generate synthetic ahmedabad_bin_fill_history.csv for training fill prediction models.
Uses ahmedabad_bins.csv as the base entity source.
"""
import random
from pathlib import Path
import pandas as pd
import numpy as np

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
BINS_CSV = DATA_DIR / "ahmedabad_bins.csv"
OUTPUT_CSV = DATA_DIR / "ahmedabad_bin_fill_history.csv"

def generate_fill_history(num_records=25000):
    print(f"Reading bins from {BINS_CSV}...")
    bins_df = pd.read_csv(BINS_CSV)
    
    np.random.seed(42)
    random.seed(42)
    
    # Sample bins
    sampled_bins = bins_df.sample(n=num_records, replace=True, random_state=42).reset_index(drop=True)
    
    seasons = ["Summer", "Monsoon", "Winter", "Spring"]
    
    hours = np.random.randint(0, 24, size=num_records)
    days_of_week = np.random.randint(0, 7, size=num_records)
    is_weekend = np.where(days_of_week >= 5, 1, 0)
    months = np.random.randint(1, 13, size=num_records)
    
    # Seasons by month
    def get_season(m):
        if m in [3, 4, 5, 6]: return "Summer"
        if m in [7, 8, 9]: return "Monsoon"
        if m in [10, 11]: return "Autumn"
        return "Winter"
    
    season_col = [get_season(m) for m in months]
    
    capacity_kg = sampled_bins["capacity_kg"].values.astype(float)
    fill_pct = np.clip(np.random.normal(55, 25, size=num_records), 5, 95).round(1)
    weight_kg = (fill_pct / 100.0 * capacity_kg * np.random.uniform(0.7, 1.1, size=num_records)).round(1)
    
    hours_since = np.random.uniform(1.0, 36.0, size=num_records).round(1)
    avg_daily_gen = (capacity_kg * np.random.uniform(0.8, 1.8, size=num_records)).round(1)
    daily_gen = (avg_daily_gen * np.random.uniform(0.7, 1.3, size=num_records)).round(1)
    
    temp_c = np.random.uniform(22.0, 43.0, size=num_records).round(1)
    rainfall = np.where(np.array(season_col) == "Monsoon", np.random.exponential(12.0, size=num_records), 0.0).round(1)
    humidity = np.random.uniform(30.0, 85.0, size=num_records).round(1)
    
    holiday = np.random.choice([0, 1], size=num_records, p=[0.92, 0.08])
    festival = np.random.choice([0, 1], size=num_records, p=[0.95, 0.05])
    market_level = np.random.choice([0.0, 1.0, 2.0, 3.0], size=num_records, p=[0.4, 0.3, 0.2, 0.1])
    event_level = np.random.choice([0.0, 1.0, 2.0, 3.0], size=num_records, p=[0.6, 0.25, 0.1, 0.05])
    
    # Generation rate per hour (% of capacity)
    hourly_fill_rate = (daily_gen / 24.0 / capacity_kg * 100.0)
    hourly_fill_rate *= (1.0 + is_weekend * 0.2 + event_level * 0.15 + market_level * 0.1)
    
    fill_6h = np.clip(fill_pct + 6.0 * hourly_fill_rate + np.random.normal(0, 3, size=num_records), 0, 100).round(1)
    fill_12h = np.clip(fill_pct + 12.0 * hourly_fill_rate + np.random.normal(0, 5, size=num_records), 0, 100).round(1)
    fill_24h = np.clip(fill_pct + 24.0 * hourly_fill_rate + np.random.normal(0, 8, size=num_records), 0, 100).round(1)
    
    # Train / Val / Test split
    splits = np.random.choice(["train", "validation", "test"], size=num_records, p=[0.70, 0.15, 0.15])
    
    # Timestamps
    timestamps = pd.date_range(start="2025-01-01", periods=num_records, freq="15min").astype(str)
    
    df = pd.DataFrame({
        "bin_id": sampled_bins["bin_id"],
        "timestamp": timestamps,
        "split": splits,
        "waste_stream": sampled_bins["waste_stream"],
        "season": season_col,
        "zone_name": sampled_bins["zone_name"],
        "fill_percentage": fill_pct,
        "estimated_weight_kg": weight_kg,
        "capacity_kg": capacity_kg,
        "hours_since_collection": hours_since,
        "daily_generation_kg": daily_gen,
        "avg_daily_generation_kg": avg_daily_gen,
        "hour": hours,
        "day_of_week": days_of_week,
        "is_weekend": is_weekend,
        "month": months,
        "temperature_c": temp_c,
        "rainfall_mm": rainfall,
        "humidity": humidity,
        "holiday_flag": holiday,
        "festival_flag": festival,
        "market_activity_level": market_level,
        "event_activity_level": event_level,
        "fill_percentage_6h": fill_6h,
        "fill_percentage_12h": fill_12h,
        "fill_percentage_24h": fill_24h,
    })
    
    print(f"Saving {len(df):,} records to {OUTPUT_CSV}...")
    df.to_csv(OUTPUT_CSV, index=False)
    print("Generation complete!")

if __name__ == "__main__":
    generate_fill_history()
