"""
Main FastAPI Application Entrypoint.
Initializes middleware, lifespan handlers, CORS policy, security headers, database migrations, and mounts all V1 routes.
"""
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends, Response, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware as GzipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.api.v1.router import api_router
from app.api.deps import get_db
from app.services.auth_service import decode_token
from app.middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    ExceptionHandlingMiddleware,
)
from app.db.init_db import init_db
from app.api.v1.endpoints.health import liveness_probe, readiness_probe, prometheus_metrics

logger = logging.getLogger("kintsugi.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager handling startup initialization and shutdown resource cleanup.
    """
    logger.info("Starting Kintsugi Application...")
    try:
        init_db()
        logger.info("Database initialization and reference seeding complete.")
    except Exception as e:
        logger.error(f"Failed to initialize database during startup: {e}")

    yield

    logger.info("Shutting down Kintsugi Application...")


def create_app() -> FastAPI:
    """
    Application factory building and configuring the FastAPI instance.
    """
    fastapi_app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="✦ Kintsugi Mindfulness & Mental Sanctuary API ✦\nPowered by FastAPI, PostgreSQL, and Machine Learning Models.",
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # 1. Gzip compression middleware
    fastapi_app.add_middleware(GzipMiddleware, minimum_size=1000)

    # 2. Security Headers middleware
    fastapi_app.add_middleware(SecurityHeadersMiddleware)

    # 3. Request Logging middleware
    fastapi_app.add_middleware(RequestLoggingMiddleware)

    # 4. Global Exception Handler middleware
    fastapi_app.add_middleware(ExceptionHandlingMiddleware)
    register_exception_handlers(fastapi_app)

    # 5. Session middleware for stateful tokens if required
    fastapi_app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

    # 6. CORS policy middleware
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount V1 API Router
    fastapi_app.include_router(api_router, prefix=settings.API_V1_STR)

    # Root System Health & Readiness Endpoints
    @fastapi_app.get("/", tags=["Health & Monitoring"])
    def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "environment": settings.ENVIRONMENT,
            "documentation": f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else "disabled",
        }

    @fastapi_app.get("/health/live", tags=["Health & Monitoring"])
    def root_liveness():
        return liveness_probe()

    @fastapi_app.get("/health/ready", tags=["Health & Monitoring"])
    def root_readiness(response: Response, db: Session = Depends(get_db)):
        return readiness_probe(response=response, db=db)

    @fastapi_app.get("/metrics", tags=["Health & Monitoring"])
    def root_metrics():
        return prometheus_metrics()

    # WebSocket Realtime Event Channel Endpoints
    async def handle_websocket_connection(websocket: WebSocket, token: Optional[str] = Query(None)):
        if not token:
            await websocket.accept()
            await websocket.close(code=4003, reason="Token required")
            return

        try:
            payload = decode_token(token, expected_type="access")
            user_id_str = payload.get("sub")
            if not user_id_str:
                await websocket.accept()
                await websocket.close(code=4003, reason="Invalid token subject")
                return
            user_id = int(user_id_str)
        except Exception as e:
            logger.warning(f"WebSocket auth failed: {e}")
            await websocket.accept()
            await websocket.close(code=4003, reason="Token validation failed")
            return

        from app.websocket import connection_manager
        await connection_manager.connect(user_id, websocket)

        try:
            while True:
                data = await websocket.receive_text()
                try:
                    import json
                    event = json.loads(data)
                    if event.get("type") == "ping":
                        await websocket.send_json({
                            "type": "pong",
                            "timestamp": int(time.time() * 1000),
                        })
                except Exception:
                    pass
        except WebSocketDisconnect:
            connection_manager.disconnect(user_id, websocket)

    @fastapi_app.websocket("/ws")
    async def ws_root(websocket: WebSocket, token: Optional[str] = Query(None)):
        await handle_websocket_connection(websocket, token)

    @fastapi_app.websocket("/api/v1/ws")
    async def ws_v1(websocket: WebSocket, token: Optional[str] = Query(None)):
        await handle_websocket_connection(websocket, token)

    @fastapi_app.websocket("/api/v1/ws/companion")
    async def ws_companion(websocket: WebSocket, token: Optional[str] = Query(None)):
        await handle_websocket_connection(websocket, token)

    return fastapi_app


# Instantiate ASGI application instance
app = create_app()
