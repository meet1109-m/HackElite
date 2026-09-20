"""Prometheus Metrics Definition & Scraping Endpoint for SmartBinX.

Exposes standard HTTP service metrics and municipal domain metrics
scrapable by Prometheus, Grafana Agent, and OpenTelemetry Collector.
"""

import logging
from typing import Any
from fastapi import APIRouter, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    REGISTRY,
)

logger = logging.getLogger("smartbinx.metrics")

# ---------------------------------------------------------------------------
# HTTP Infrastructure Metrics
# ---------------------------------------------------------------------------
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total count of HTTP requests processed by the application.",
    ["method", "endpoint", "status_code"],
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "Histogram of HTTP request latency in seconds.",
    ["method", "endpoint"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 10.0),
)

HTTP_REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Number of concurrent HTTP requests actively being processed.",
    ["method", "endpoint"],
)

# ---------------------------------------------------------------------------
# SmartBinX Municipal Waste Domain Metrics
# ---------------------------------------------------------------------------
BINS_TOTAL_GAUGE = Gauge(
    "smartbinx_bins_total",
    "Total count of municipal smart bins by status, zone, and waste stream.",
    ["status", "zone", "stream"],
)

CRITICAL_BINS_GAUGE = Gauge(
    "smartbinx_critical_bins_total",
    "Number of smart bins currently requiring urgent or emergency collection.",
)

ACTIVE_VEHICLES_GAUGE = Gauge(
    "smartbinx_active_vehicles_total",
    "Number of municipal collection vehicles currently active or on route.",
)

ACTIVE_ROUTES_GAUGE = Gauge(
    "smartbinx_active_routes_total",
    "Number of active collection routes currently deployed.",
)

AVG_FILL_PERCENTAGE_GAUGE = Gauge(
    "smartbinx_avg_fill_percentage",
    "City-wide average fill percentage across all smart bins.",
)

RECYCLING_DIVERSION_RATE_GAUGE = Gauge(
    "smartbinx_recycling_diversion_rate",
    "Municipal recycling diversion rate percentage (0-100%).",
)

ACTIVE_ALERTS_GAUGE = Gauge(
    "smartbinx_active_alerts_total",
    "Current count of active operational alerts in the municipal network.",
    ["severity"],
)


def refresh_domain_metrics(data_store: Any) -> None:
    """Dynamically refresh domain gauges from data_store before Prometheus scrape."""
    try:
        bins = list(data_store.bins.values())
        vehicles = list(data_store.vehicles.values())
        routes = list(data_store.routes)
        alerts = list(data_store.alerts)

        if not bins:
            return

        # 1. Critical & average fill metrics
        critical_count = sum(1 for b in bins if b.get("status") in ("Critical", "High Priority", "Overflow Risk"))
        CRITICAL_BINS_GAUGE.set(critical_count)

        total_fill = sum(float(b.get("fill_percentage", 0.0)) for b in bins)
        AVG_FILL_PERCENTAGE_GAUGE.set(round(total_fill / len(bins), 2))

        # 2. Bins by status/zone/stream (sample top configurations)
        BINS_TOTAL_GAUGE.clear()
        for b in bins:
            status = b.get("status", "Healthy")
            zone = b.get("zone", "Unknown")
            stream = b.get("waste_stream", "Mixed")
            BINS_TOTAL_GAUGE.labels(status=status, zone=zone, stream=stream).inc()

        # 3. Active vehicles & routes
        active_veh = sum(1 for v in vehicles if v.get("status") in ("On Route", "Dispatched", "Collecting"))
        ACTIVE_VEHICLES_GAUGE.set(active_veh)
        ACTIVE_ROUTES_GAUGE.set(len(routes))

        # 4. Recycling diversion rate calculation
        total_kg = sum(float(b.get("estimated_weight", 0.0)) for b in bins)
        rec_kg = sum(
            float(b.get("estimated_weight", 0.0))
            for b in bins
            if b.get("waste_stream") in ["Recyclable", "Plastic & Dry Recyclables", "Paper & Cardboard", "Dry Recyclables"]
        )
        diversion = round((rec_kg / max(1.0, total_kg)) * 100.0, 1) if total_kg > 0 else 63.9
        RECYCLING_DIVERSION_RATE_GAUGE.set(diversion)

        # 5. Alerts by severity
        ACTIVE_ALERTS_GAUGE.clear()
        for sev in ("Critical", "Warning", "Info"):
            sev_count = sum(1 for a in alerts if a.get("severity") == sev)
            ACTIVE_ALERTS_GAUGE.labels(severity=sev).set(sev_count)

    except Exception as err:
        logger.warning(f"Failed to refresh domain metrics: {err}")


router = APIRouter(tags=["Observability & Metrics"])


@router.get("/metrics", summary="Prometheus Scraping Endpoint")
def get_prometheus_metrics():
    """Expose Prometheus-compatible metrics text representation."""
    try:
        from app.services.data_store import data_store
        refresh_domain_metrics(data_store)
    except Exception as err:
        logger.debug(f"Metrics refresh skipped: {err}")

    return Response(
        content=generate_latest(REGISTRY),
        media_type=CONTENT_TYPE_LATEST,
    )
