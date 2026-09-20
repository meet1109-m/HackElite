"""Observability context variables for distributed trace and correlation tracking."""

from contextvars import ContextVar
import uuid

# ContextVar holding the correlation ID across async task execution branches
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")


def get_correlation_id() -> str:
    """Retrieve the current request's correlation ID, or return empty string."""
    return correlation_id_ctx.get() or ""


def set_correlation_id(correlation_id: str | None = None) -> str:
    """Assign or generate a correlation ID for the current context."""
    cid = correlation_id.strip() if correlation_id and correlation_id.strip() else str(uuid.uuid4())
    correlation_id_ctx.set(cid)
    return cid
