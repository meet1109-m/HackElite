"""SmartBinX Observability, Logging, Tracing & Prometheus Package."""

from app.observability.context import (
    correlation_id_ctx,
    get_correlation_id,
    set_correlation_id,
)
from app.observability.logging import (
    JSONFormatter,
    TextFormatter,
    setup_logging,
)
from app.observability.metrics import (
    router as metrics_router,
    refresh_domain_metrics,
)
from app.observability.middleware import (
    ObservabilityMiddleware,
    normalize_metric_path,
)

__all__ = [
    "correlation_id_ctx",
    "get_correlation_id",
    "set_correlation_id",
    "JSONFormatter",
    "TextFormatter",
    "setup_logging",
    "metrics_router",
    "refresh_domain_metrics",
    "ObservabilityMiddleware",
    "normalize_metric_path",
]
