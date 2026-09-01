"""
Realtime WebSocket Connection Manager.
Manages active authenticated WebSocket client connections, channel subscriptions, and event broadcasts.
"""
import logging
import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger("kintsugi.websocket")


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket client connected user_id={user_id}")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket client disconnected user_id={user_id}")

    async def broadcast_to_user(self, user_id: int, event_type: str, payload: Any):
        if user_id in self.active_connections:
            message = {"type": event_type, "payload": payload}
            disconnected = []
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.append(ws)
            for ws in disconnected:
                self.disconnect(user_id, ws)

    def broadcast_to_user_sync(self, user_id: int, event_type: str, payload: Any):
        """Thread-safe synchronous wrapper for background tasks and Celery workers."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(self.broadcast_to_user(user_id, event_type, payload), loop)
            else:
                loop.run_until_complete(self.broadcast_to_user(user_id, event_type, payload))
        except Exception as e:
            logger.debug(f"Broadcast sync fallback: {e}")


connection_manager = ConnectionManager()
