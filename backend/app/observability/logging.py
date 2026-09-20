"""Structured JSON and text logging for SmartBinX.

Outputs machine-readable JSON logs for Prometheus, Grafana Loki, and CloudWatch in production,
with optional clean text output for local development.
"""

from datetime import datetime, timezone
import json
import logging
import sys
from typing import Any

from app.observability.context import get_correlation_id


class JSONFormatter(logging.Formatter):
    """Formats log records as structured JSON single-line strings."""

    def format(self, record: logging.LogRecord) -> str:
        log_payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": getattr(record, "correlation_id", None) or get_correlation_id() or None,
        }

        # Include file/line location on errors and warnings
        if record.levelno >= logging.WARNING:
            log_payload["source"] = {
                "file": record.filename,
                "line": record.lineno,
                "function": record.funcName,
            }

        # Include exception stack trace if present
        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)

        # Include structured extra fields passed by caller
        standard_attrs = {
            "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
            "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
            "created", "msecs", "relativeCreated", "thread", "threadName",
            "processName", "process", "message", "correlation_id"
        }
        extras = {k: v for k, v in record.__dict__.items() if k not in standard_attrs and not k.startswith("_")}
        if extras:
            log_payload["extra"] = extras

        return json.dumps(log_payload, default=str)


class TextFormatter(logging.Formatter):
    """Readable log formatter for local development console."""

    def format(self, record: logging.LogRecord) -> str:
        cid = getattr(record, "correlation_id", None) or get_correlation_id()
        cid_str = f" [{cid[:8]}]" if cid else ""
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        msg = record.getMessage()
        res = f"{timestamp} [{record.levelname:<7}]{cid_str} {record.name}: {msg}"
        if record.exc_info:
            res += f"\n{self.formatException(record.exc_info)}"
        return res


def setup_logging(log_level: str = "INFO", log_format: str = "json") -> None:
    """Configure root and framework loggers with the selected formatter."""
    level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Clear existing handlers to prevent duplicate lines
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    if log_format.lower() == "json":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(TextFormatter())

    root_logger.addHandler(handler)

    # Standardize Uvicorn and FastAPI loggers
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        l = logging.getLogger(logger_name)
        l.handlers.clear()
        l.addHandler(handler)
        l.setLevel(level)
        l.propagate = False
