"""
WasteWise AI - Overflow Prediction Engine.
Translates current fill percentage and multi-horizon fill predictions into:
- predicted_overflow_time
- hours_until_overflow
- overflow_risk (LOW, MEDIUM, HIGH, CRITICAL)
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

# Configurable prototype thresholds
RISK_CRITICAL_HOURS = 4.0   # < 4 hours
RISK_HIGH_HOURS = 12.0      # 4 - 12 hours
RISK_MEDIUM_HOURS = 24.0    # 12 - 24 hours
# LOW > 24 hours

def calculate_overflow_metrics(
    current_fill: float,
    fill_6h: float,
    fill_12h: float,
    fill_24h: float,
    current_timestamp: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Computes deterministic overflow metrics and categorized risk.
    """
    if current_timestamp is None:
        current_timestamp = datetime.now()

    # 1. If currently overflowing
    if current_fill >= 100.0:
        hours_until = 0.0
        risk = "CRITICAL"
        overflow_time = current_timestamp
        return {
            "hours_until_overflow": round(hours_until, 1),
            "predicted_overflow_time": overflow_time.isoformat(),
            "overflow_risk": risk
        }

    # 2. Linear / Piecewise interpolation across points: (0h, current), (6h, fill_6h), (12h, fill_12h), (24h, fill_24h)
    points = [
        (0.0, float(current_fill)),
        (6.0, float(fill_6h)),
        (12.0, float(fill_12h)),
        (24.0, float(fill_24h))
    ]

    hours_until = None

    # Check each segment
    for i in range(len(points) - 1):
        t1, f1 = points[i]
        t2, f2 = points[i+1]
        
        # Did it reach 100% in this interval?
        if f2 >= 100.0:
            if f2 > f1:
                # Linear interpolation
                fraction = (100.0 - f1) / (f2 - f1)
                hours_until = t1 + fraction * (t2 - t1)
            else:
                hours_until = t2
            break

    # If not reached in 24h, extrapolate rate from 24h prediction if increasing
    if hours_until is None:
        delta_fill_24h = fill_24h - current_fill
        if delta_fill_24h > 0:
            rate_per_hour = delta_fill_24h / 24.0
            remaining_fill = 100.0 - fill_24h
            if remaining_fill > 0 and rate_per_hour > 0:
                hours_until = 24.0 + (remaining_fill / rate_per_hour)
            else:
                hours_until = 24.0
        else:
            # Not increasing or empty
            hours_until = 999.0

    # Categorize Risk
    if hours_until < RISK_CRITICAL_HOURS:
        risk = "CRITICAL"
    elif hours_until <= RISK_HIGH_HOURS:
        risk = "HIGH"
    elif hours_until <= RISK_MEDIUM_HOURS:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    overflow_time = current_timestamp + timedelta(hours=min(hours_until, 720.0))

    return {
        "hours_until_overflow": round(hours_until, 1),
        "predicted_overflow_time": overflow_time.isoformat(),
        "overflow_risk": risk
    }
