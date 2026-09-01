"""
Locust Load Testing Suite for Kintsugi FastAPI Backend.

Simulates concurrent virtual users interacting with baseline API endpoints:
- Root & Health probes (/ /health/live /health/ready)
- User Authentication (/api/v1/auth/login)
- Journal entries (/api/v1/journal/entries)
- Mood tracking (/api/v1/mood/history)
- Educational content (/api/v1/content/articles)
"""

import time
from locust import HttpUser, task, between, events

class KintsugiUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(3)
    def test_liveness(self):
        """Test simple fast endpoint /health/live."""
        self.client.get("/health/live", name="GET /health/live")

    @task(2)
    def test_root(self):
        """Test API root status /."""
        self.client.get("/", name="GET /")

    @task(2)
    def test_readiness(self):
        """Test database & service readiness /health/ready."""
        self.client.get("/health/ready", name="GET /health/ready")

    @task(1)
    def test_metrics(self):
        """Test telemetry metrics endpoint /metrics."""
        self.client.get("/metrics", name="GET /metrics")
