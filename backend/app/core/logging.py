"""
Structured Logging Module for Kintsugi Backend.
Provides human-readable formatted output in development mode and structured JSON
logging in production mode, with contextvar-based correlation ID propagation.
"""
import sys
import json
import logging
from datetime import datetime, timezone
from contextvars import ContextVar
from typing import Any, Dict

from app.core.config import settings

# ContextVar storing the current request correlation ID across async execution frames
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")


def get_correlation_id() -> str:
    """
    Retrieves the current request correlation ID from contextvar.
    """
    return correlation_id_ctx.get()


def set_correlation_id(correlation_id: str) -> None:
    """
    Sets the current request correlation ID in contextvar.
    """
    correlation_id_ctx.set(correlation_id)


class CorrelationIdFilter(logging.Filter):
    """
    Logging filter that injects the current request correlation_id into LogRecords.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        record.correlation_id = get_correlation_id() or None
        return True


class JsonFormatter(logging.Formatter):
    """
    Structured JSON log formatter for production log aggregation systems (Datadog, ELK).
    """
    def format(self, record: logging.LogRecord) -> str:
        log_object: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlationId": getattr(record, "correlation_id", None),
            "file": f"{record.filename}:{record.lineno}",
        }
        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_object)


class DevelopmentFormatter(logging.Formatter):
    """
    Human-readable log formatter for local development console.
    """
    def format(self, record: logging.LogRecord) -> str:
        correlation_id = getattr(record, "correlation_id", None)
        req_prefix = f" [{correlation_id[:8]}]" if correlation_id else ""
        formatted_msg = super().format(record)
        return f"{formatted_msg}{req_prefix}"


def setup_logging() -> None:
    """
    Initializes root logger configuration based on ENV setting.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers to prevent duplicate log records
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.addFilter(CorrelationIdFilter())

    if settings.ENV.lower() in ["production", "prod", "staging"]:
        console_handler.setFormatter(JsonFormatter())
    else:
        dev_fmt = "%(asctime)s | %(levelname)-7.7s | %(name)s | %(message)s"
        console_handler.setFormatter(DevelopmentFormatter(fmt=dev_fmt, datefmt="%H:%M:%S"))

    root_logger.addHandler(console_handler)
