"""
Custom Application Exception Hierarchy and Global FastAPI Exception Handlers.
Returns a structured JSON response schema across all errors:
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "Human-readable message" },
  "timestamp": "ISO-8601",
  "path": "/api/v1/...",
  "requestId": "correlation-id"
}
"""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("kintsugi.exceptions")


class AppException(Exception):
    """
    Base exception class for all domain-specific application errors.
    """
    def __init__(
        self,
        message: str = "An unexpected error occurred",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_SERVER_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


class ValidationException(AppException):
    def __init__(self, message: str = "Invalid request payload or parameters", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class NotFoundException(AppException):
    def __init__(self, message: str = "Requested resource not found"):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Could not validate authentication credentials"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access to this resource is forbidden"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict detected"):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT",
        )


class DatabaseException(AppException):
    def __init__(self, message: str = "Database operation failure"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
        )


class CrisisEscalationException(AppException):
    def __init__(self, message: str = "Crisis condition flagged requiring escalation"):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="CRISIS_ESCALATED",
        )


class ExternalServiceException(AppException):
    def __init__(self, message: str = "External service connection failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_code="EXTERNAL_SERVICE_ERROR",
        )


class AIProviderException(ExternalServiceException):
    def __init__(self, message: str = "AI Provider error occurred"):
        super().__init__(message=message)
        self.error_code = "AI_PROVIDER_ERROR"


class AIAuthenticationException(AIProviderException):
    def __init__(self, message: str = "Invalid or missing AI API credentials"):
        super().__init__(message=message)
        self.status_code = status.HTTP_401_UNAUTHORIZED
        self.error_code = "AI_AUTHENTICATION_ERROR"


class AIRateLimitException(AIProviderException):
    def __init__(self, message: str = "AI Provider rate limit exceeded"):
        super().__init__(message=message)
        self.status_code = status.HTTP_429_TOO_MANY_REQUESTS
        self.error_code = "AI_RATE_LIMIT_EXCEEDED"


class AITimeoutException(AIProviderException):
    def __init__(self, message: str = "AI Provider request timed out"):
        super().__init__(message=message)
        self.status_code = status.HTTP_504_GATEWAY_TIMEOUT
        self.error_code = "AI_TIMEOUT"


class AIConfigurationException(AIProviderException):
    def __init__(self, message: str = "AI Provider configuration missing or invalid"):
        super().__init__(message=message)
        self.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        self.error_code = "AI_CONFIGURATION_ERROR"


def build_error_payload(
    code: str,
    message: str,
    request: Request,
    details: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Builds standard JSON error response dictionary.
    """
    correlation_id = getattr(request.state, "correlation_id", None)
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "path": request.url.path,
        "requestId": correlation_id,
    }
    if details is not None:
        payload["error"]["details"] = details
    return payload


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers global exception handlers on FastAPI application instance.
    """
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.warning(f"AppException [{exc.error_code}] on {request.url.path}: {exc.message}")
        payload = build_error_payload(exc.error_code, exc.message, request, exc.details)
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        error_code = "HTTP_ERROR"
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = "UNAUTHORIZED"
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            error_code = "FORBIDDEN"
        elif exc.status_code == status.HTTP_404_NOT_FOUND:
            error_code = "NOT_FOUND"

        payload = build_error_payload(error_code, str(exc.detail), request)
        return JSONResponse(
            status_code=exc.status_code,
            content=payload,
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"RequestValidationError on {request.url.path}: {exc.errors()}")
        payload = build_error_payload(
            "VALIDATION_ERROR",
            "Invalid request body or query parameters",
            request,
            details=exc.errors(),
        )
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Internal Server Error on {request.url.path}: {exc}", exc_info=True)
        payload = build_error_payload(
            "INTERNAL_SERVER_ERROR",
            "An unexpected internal server error occurred.",
            request,
        )
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=payload)
