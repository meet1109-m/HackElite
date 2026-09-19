#!/usr/bin/env python3
"""Verification check for SmartBinX SQLite database."""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "backend" / "smartbinx.db"

def verify():
    if not DB_PATH.exists():
        print(f"Error: Database file does not exist at {DB_PATH}")
        return False

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    # Get all tables
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence' ORDER BY name")
    tables = [r[0] for r in cur.fetchall()]

    expected_tables = [
        "alerts",
        "bin_readings",
        "bins",
        "collections",
        "predictions",
        "routes",
        "vehicles",
        "waste_classifications",
        "zones",
    ]

    print("=" * 60)
    print(f"SmartBinX Database Verification ({DB_PATH.name})")
    print("=" * 60)
    
    missing = set(expected_tables) - set(tables)
    if missing:
        print(f"[FAIL] Missing tables: {missing}")
        return False
    print("[PASS] All 9 expected tables exist in database.")

    # 1. zones
    cur.execute("SELECT COUNT(*) FROM zones")
    zones_cnt = cur.fetchone()[0]
    print(f"1. Total row count for 'zones': {zones_cnt} (Expected: 10)")

    # 2. bins
    cur.execute("SELECT COUNT(*) FROM bins")
    bins_cnt = cur.fetchone()[0]
    print(f"2. Total row count for 'bins': {bins_cnt} (Expected: 125)")

    # 3. vehicles
    cur.execute("SELECT COUNT(*) FROM vehicles")
    vehicles_cnt = cur.fetchone()[0]
    print(f"3. Total row count for 'vehicles': {vehicles_cnt} (Expected: 12)")

    # 4. alerts
    cur.execute("SELECT COUNT(*) FROM alerts")
    alerts_cnt = cur.fetchone()[0]
    print(f"4. Total row count for 'alerts': {alerts_cnt}")

    print("-" * 60)
    print("All Tables Row Counts & Audit:")
    counts = {}
    for tbl in expected_tables:
        cur.execute(f"SELECT COUNT(*) FROM {tbl}")
        cnt = cur.fetchone()[0]
        counts[tbl] = cnt
        expected_note = ""
        if tbl == "zones": expected_note = "(Expected: 10)"
        elif tbl == "bins": expected_note = "(Expected: 125)"
        elif tbl == "vehicles": expected_note = "(Expected: 12)"
        elif tbl == "waste_classifications": expected_note = "(Expected: 125)"
        print(f"   - {tbl:<22}: {cnt:>5} rows {expected_note}")

    # Verify data integrity of samples
    print("-" * 60)
    print("Data Integrity Checks:")
    
    # Check nulls in critical columns
    cur.execute("SELECT COUNT(*) FROM bins WHERE bin_code IS NULL OR latitude IS NULL OR longitude IS NULL")
    null_bins = cur.fetchone()[0]
    print(f"   - Bins with null coordinates/codes: {null_bins} (Pass)" if null_bins == 0 else f"   - [FAIL] Bins with nulls: {null_bins}")

    # Check foreign key integrity
    cur.execute("PRAGMA foreign_key_check")
    fk_errors = cur.fetchall()
    print(f"   - Foreign key constraint violations: {len(fk_errors)} (Pass)" if len(fk_errors) == 0 else f"   - [FAIL] FK violations: {fk_errors}")

    conn.close()
    
    status = (
        counts.get("zones", 0) == 10
        and counts.get("bins", 0) == 125
        and counts.get("vehicles", 0) == 12
        and counts.get("waste_classifications", 0) == 125
        and counts.get("alerts", 0) > 0
        and len(fk_errors) == 0
        and null_bins == 0
    )
    print("=" * 60)
    print("[SUCCESS] All tables exist and contain valid data." if status else "[FAILURE] Verification checks did not pass.")
    print("=" * 60)
    return status

if __name__ == "__main__":
    verify()
