"""
ASGI Request Logging & Distributed Tracing Middleware.
Generates/propagates a correlation ID per HTTP request, measures execution latency,
and logs structured access events without exposing sensitive request bodies.
"""
import uuid
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import set_correlation_id

logger = logging.getLogger("kintsugi.access")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    ASGI Middleware extracting/generating request correlation IDs and logging access metrics.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Extract incoming X-Request-ID or X-Correlation-ID header, or generate a new UUIDv4
        correlation_id = (
            request.headers.get("X-Request-ID")
            or request.headers.get("X-Correlation-ID")
            or str(uuid.uuid4())
        )

        # Bind correlation ID to request state and contextvar
        request.state.correlation_id = correlation_id
        set_correlation_id(correlation_id)

        client_ip = request.client.host if request.client else "127.0.0.1"
        start_time = time.time()

        response = await call_next(request)

        process_time_ms = (time.time() - start_time) * 1000.0

        # Log structured access metrics
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} - "
            f"IP: {client_ip} - Duration: {process_time_ms:.2f}ms"
        )

        # Inject correlation ID into outbound response headers
        response.headers["X-Request-ID"] = correlation_id
        response.headers["X-Correlation-ID"] = correlation_id

        return response
