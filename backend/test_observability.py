"""Comprehensive Automated Test Suite for SmartBinX Observability Subsystem.

Verifies:
1. Trace Correlation ID generation, propagation, and context tracking.
2. Structured JSON logging format and fields.
3. Prometheus metrics endpoint (/metrics) and domain metrics collection.
4. Health probe (/health) with correlation and subsystem reporting.
"""

import json
import logging
from fastapi.testclient import TestClient

from app.main import app
from app.observability import (
    get_correlation_id,
    set_correlation_id,
    JSONFormatter,
)

client = TestClient(app)


def test_correlation_id_auto_generation():
    """Verify that incoming requests without trace headers receive generated correlation IDs."""
    response = client.get("/health")
    assert response.status_code == 200
    cid = response.headers.get("X-Correlation-ID")
    assert cid is not None, "Response must include X-Correlation-ID"
    assert len(cid) >= 16, "Correlation ID should be a valid UUID"
    assert response.headers.get("X-Request-ID") == cid
    assert "X-Process-Time" in response.headers
    print(f"[PASS] Auto-generated Correlation ID verified: {cid}")


def test_correlation_id_propagation():
    """Verify that client-provided correlation IDs are preserved and propagated."""
    custom_cid = "trace-test-ahmedabad-998877"
    response = client.get("/health", headers={"X-Correlation-ID": custom_cid})
    assert response.status_code == 200
    assert response.headers.get("X-Correlation-ID") == custom_cid
    assert response.headers.get("X-Request-ID") == custom_cid
    data = response.json()
    assert data.get("correlation_id") == custom_cid
    print(f"[PASS] Correlation ID propagation verified: {custom_cid}")


def test_structured_json_logger():
    """Verify that JSONFormatter produces valid JSON with required observability fields."""
    formatter = JSONFormatter()
    test_logger = logging.getLogger("test.observability")
    
    # Test record with correlation ID
    set_correlation_id("test-corr-abc-123")
    record = test_logger.makeRecord(
        name="test.observability",
        level=logging.INFO,
        fn="test_observability.py",
        lno=45,
        msg="Sample operational event occurred",
        args=(),
        exc_info=None,
        extra={"zone": "Bodakdev", "bin_count": 12},
    )
    
    formatted = formatter.format(record)
    parsed = json.loads(formatted)

    assert parsed["level"] == "INFO"
    assert parsed["logger"] == "test.observability"
    assert parsed["message"] == "Sample operational event occurred"
    assert parsed["correlation_id"] == "test-corr-abc-123"
    assert "timestamp" in parsed
    assert parsed.get("extra", {}).get("zone") == "Bodakdev"
    assert parsed.get("extra", {}).get("bin_count") == 12
    print(f"[PASS] Structured JSON log output verified:\n  {formatted}")


def test_prometheus_metrics_endpoint():
    """Verify that /metrics returns valid Prometheus metrics format with domain gauges."""
    # Trigger an API call first to increment HTTP request metrics
    client.get("/api/bins")
    
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers.get("content-type", "")
    content = response.text

    # 1. HTTP Infrastructure Metrics
    assert "http_requests_total" in content, "Missing http_requests_total counter"
    assert "http_request_duration_seconds" in content, "Missing latency histogram"
    assert "http_requests_in_progress" in content, "Missing concurrency gauge"

    # 2. SmartBinX Domain Metrics
    assert "smartbinx_bins_total" in content, "Missing smartbinx_bins_total"
    assert "smartbinx_critical_bins_total" in content, "Missing smartbinx_critical_bins_total"
    assert "smartbinx_avg_fill_percentage" in content, "Missing smartbinx_avg_fill_percentage"
    assert "smartbinx_active_vehicles_total" in content, "Missing smartbinx_active_vehicles_total"
    assert "smartbinx_recycling_diversion_rate" in content, "Missing smartbinx_recycling_diversion_rate"

    print("[PASS] Prometheus /metrics endpoint and domain gauges verified.")


def test_health_probe_observability():
    """Verify that /health reports correlation ID and subsystem metrics."""
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()

    assert "status" in payload
    assert "database" in payload
    assert "cache" in payload
    assert "correlation_id" in payload
    assert payload.get("metrics") == "/metrics"
    print(f"[PASS] Health probe observability payload verified: {payload}")


if __name__ == "__main__":
    print("=" * 70)
    print(" Running SmartBinX Observability Verification Suite")
    print("=" * 70)
    test_correlation_id_auto_generation()
    test_correlation_id_propagation()
    test_structured_json_logger()
    test_prometheus_metrics_endpoint()
    test_health_probe_observability()
    print("=" * 70)
    print(" ALL OBSERVABILITY TESTS PASSED (5/5) (100%)")
    print("=" * 70)
