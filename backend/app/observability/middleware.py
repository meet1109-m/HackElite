"""Observability & Trace Correlation ID Middleware for FastAPI.

Assigns and propagates correlation IDs across the entire request lifecycle,
collects Prometheus latency/status metrics, and outputs structured access logs.
"""

import logging
import re
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.observability.context import set_correlation_id, get_correlation_id
from app.observability.metrics import (
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    HTTP_REQUESTS_IN_PROGRESS,
)

logger = logging.getLogger("smartbinx.access")

# Regex to normalize high-cardinality path parameters in Prometheus metrics
# e.g. /api/bins/AHM-104 -> /api/bins/:id, /api/predictions/AHM-101 -> /api/predictions/:id
BIN_CODE_PATTERN = re.compile(r"/(AHM-\d+|V-\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})")


def normalize_metric_path(path: str) -> str:
    """Replace dynamic IDs with generic tokens to prevent Prometheus label explosion."""
    clean_path = BIN_CODE_PATTERN.sub("/:id", path)
    return clean_path if clean_path else "/"


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """Intercepts all HTTP transactions for tracing, metrics, and structured logging."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # 1. Trace Correlation ID extraction or generation
        incoming_cid = (
            request.headers.get("X-Correlation-ID")
            or request.headers.get("X-Request-ID")
            or None
        )
        cid = set_correlation_id(incoming_cid)

        # 2. Path normalization for metric labels
        raw_path = request.url.path
        metric_endpoint = normalize_metric_path(raw_path)
        method = request.method

        # 3. Track metrics & timing
        HTTP_REQUESTS_IN_PROGRESS.labels(method=method, endpoint=metric_endpoint).inc()
        start_time = time.perf_counter()
        status_code = 500

        try:
            response: Response = await call_next(request)
            status_code = response.status_code
        except Exception as exc:
            duration = time.perf_counter() - start_time
            duration_ms = round(duration * 1000, 2)
            logger.error(
                f"Unhandled exception processing {method} {raw_path}: {exc}",
                exc_info=True,
                extra={
                    "correlation_id": cid,
                    "method": method,
                    "path": raw_path,
                    "duration_ms": duration_ms,
                    "status_code": 500,
                },
            )
            HTTP_REQUESTS_TOTAL.labels(
                method=method, endpoint=metric_endpoint, status_code=500
            ).inc()
            HTTP_REQUEST_DURATION_SECONDS.labels(
                method=method, endpoint=metric_endpoint
            ).observe(duration)
            raise exc
        finally:
            HTTP_REQUESTS_IN_PROGRESS.labels(method=method, endpoint=metric_endpoint).dec()

        duration = time.perf_counter() - start_time
        duration_ms = round(duration * 1000, 2)

        # 4. Record Prometheus Metrics
        HTTP_REQUESTS_TOTAL.labels(
            method=method, endpoint=metric_endpoint, status_code=status_code
        ).inc()
        HTTP_REQUEST_DURATION_SECONDS.labels(
            method=method, endpoint=metric_endpoint
        ).observe(duration)

        # 5. Inject Trace Headers into Response
        response.headers["X-Correlation-ID"] = cid
        response.headers["X-Request-ID"] = cid
        response.headers["X-Process-Time"] = f"{duration_ms}ms"

        # 6. Emit Structured Log (skip spamming /health and /metrics at INFO unless error)
        is_probe = raw_path in ("/health", "/metrics", "/favicon.ico")
        if not is_probe or status_code >= 400:
            client_ip = request.client.host if request.client else "unknown"
            logger.info(
                f"{method} {raw_path} {status_code} ({duration_ms}ms)",
                extra={
                    "correlation_id": cid,
                    "method": method,
                    "path": raw_path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "client_ip": client_ip,
                    "user_agent": request.headers.get("user-agent", "-"),
                },
            )

        return response
