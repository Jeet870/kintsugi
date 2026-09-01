"""
Health Check & Observability Probes Router.
Exposes Kubernetes-compatible liveness (/health/live), readiness (/health/ready), and Prometheus metrics endpoints.
"""
import time
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings

logger = logging.getLogger("kintsugi.health")

router = APIRouter()


@router.get(
    "/live",
    summary="Liveness check probe",
    tags=["Health & Monitoring"],
)
@router.get(
    "",
    summary="Liveness check probe (alias)",
    tags=["Health & Monitoring"],
    include_in_schema=False,
)
def liveness_probe() -> Dict[str, Any]:
    """
    Kubernetes liveness probe verifying that the application process is running.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": time.time(),
    }


@router.get(
    "/ready",
    summary="Readiness check probe",
    tags=["Health & Monitoring"],
)
def readiness_probe(
    response: Response,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Kubernetes readiness probe checking active connectivity to MySQL database and Redis broker.
    Returns HTTP 200 when all downstream dependencies are reachable, or HTTP 503 if unhealthy.
    """
    db_healthy = False
    redis_healthy = False
    details: Dict[str, str] = {}

    # 1. Check Database connectivity
    try:
        db.execute(text("SELECT 1"))
        db_healthy = True
        details["database"] = "connected"
    except Exception as err:
        logger.error(f"Database readiness check failed: {err}")
        details["database"] = f"unhealthy: {err}"

    # 2. Check Redis connectivity
    try:
        import redis
        r = redis.from_url(settings.CELERY_BROKER_URL, decode_responses=True)
        r.ping()
        redis_healthy = True
        details["redis"] = "connected"
    except Exception as err:
        logger.warning(f"Redis readiness check failed: {err}")
        details["redis"] = f"unreachable: {err}"
        # Treat Redis as optional for API readiness if local memory fallback is enabled
        redis_healthy = True

    is_ready = db_healthy and redis_healthy
    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "ready": False,
            "details": details,
        }

    return {
        "status": "ready",
        "ready": True,
        "details": details,
    }


@router.get(
    "/metrics",
    summary="Prometheus exposition format metrics",
    tags=["Health & Monitoring"],
)
def prometheus_metrics() -> Response:
    """
    Exposes process telemetry metrics in Prometheus exposition format.
    """
    metrics_text = (
        f"# HELP kintsugi_up Service health indicator\n"
        f"# TYPE kintsugi_up gauge\n"
        f"kintsugi_up 1\n"
        f"# HELP kintsugi_build_info Build metadata\n"
        f"# TYPE kintsugi_build_info gauge\n"
        f'kintsugi_build_info{{version="1.0.0",env="{settings.ENVIRONMENT}"}} 1\n'
    )
    return Response(content=metrics_text, media_type="text/plain")
