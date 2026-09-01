# Production Deployment Guide

This guide details how to deploy Kintsugi to production servers using Docker or native systemd services.

---

## Production Prerequisites

- **Server Spec**: 2+ vCPU, 4GB+ RAM, Ubuntu 22.04 LTS
- **Services**: Docker 24+, MariaDB 10.11+ / MySQL 8.0+, Redis 7+
- **Domain & SSL**: Valid FQDN (e.g. `api.kintsugi.app`) with Let's Encrypt TLS certificate

---

## Backend & Database Deployment

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-org/kintsugi.git
   cd kintsugi/backend
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Set production `SECRET_KEY`, `DATABASE_URL`, `MISTRAL_API_KEY`, and `SMTP_*` parameters.

3. **Launch Docker Stack**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. **Verify Container Health**:
   ```bash
   docker compose ps
   curl http://localhost:8000/health
   ```
