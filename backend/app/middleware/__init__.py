from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.exceptions import AppException
from app.middleware.request_logger import RequestLoggerMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

class ExceptionHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except (AppException, StarletteHTTPException):
            raise
        except Exception as exc:
            return JSONResponse(
                status_code=500,
                content={"detail": "An internal server error occurred."}
            )

RequestLoggingMiddleware = RequestLoggerMiddleware

__all__ = [
    "SecurityHeadersMiddleware",
    "RequestLoggingMiddleware",
    "ExceptionHandlingMiddleware",
]
