"""
API Response Formatting Utilities.
Provides consistent JSON response envelopes for successful API responses and errors.
"""
from typing import Any, Optional, Dict
from fastapi.responses import JSONResponse


def success_response(
    data: Any,
    meta: Optional[Dict[str, Any]] = None,
    message: Optional[str] = None,
    status_code: int = 200,
) -> JSONResponse:
    """
    Wraps response payload in standard success envelope: { status, data, meta }.
    """
    content: Dict[str, Any] = {
        "status": "success",
        "data": data,
        "meta": meta or {},
    }
    if message:
        content["message"] = message

    return JSONResponse(status_code=status_code, content=content)


def error_response(
    message: str,
    status_code: int = 400,
    code: str = "BAD_REQUEST",
    details: Optional[Any] = None,
) -> JSONResponse:
    """
    Wraps error response in standard error envelope: { status, error: { code, message, details } }.
    """
    content: Dict[str, Any] = {
        "status": "error",
        "error": {
            "code": code,
            "message": message,
        },
    }
    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)
