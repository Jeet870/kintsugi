# Kintsugi Backend API & Microservices

The Kintsugi backend is a production-ready asynchronous Python REST and WebSocket API built with **FastAPI**, **SQLAlchemy**, **Celery**, **Redis**, and **MariaDB / MySQL**.

---

## Technical Stack & Architecture

- **Framework**: FastAPI 0.115+
- **ORM & Database**: SQLAlchemy 2.0+ & PyMySQL targeting MariaDB/MySQL
- **Task Queue & Async Processing**: Celery 5.4+ with Redis broker & result backend
- **Authentication**: OAuth2 Password Flow + JWT (Access Token 30 mins, Refresh Token 7 days)
- **AI Engine**: Mistral AI SDK (`mistral-small-latest`) with prompt safety guards
- **Email Service**: Transactional HTML emails over SMTP (Gmail TLS/STARTTLS)
- **Encryption & Hashing**: Passlib + Bcrypt for passwords, SHA-256 for OTPs, Fernet symmetric encryption for journal contents

---

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── auth.py
│   │           ├── users.py
│   │           ├── mood.py
│   │           ├── journal.py
│   │           ├── chat.py
│   │           └── notifications.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── workers/
├── start.py
├── requirements.txt
└── .env.example
```

---

## Local Development Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to set `DATABASE_URL`, `MISTRAL_API_KEY`, and `SMTP_*` parameters.

4. **Initialize Database Tables**:
   ```bash
   python -c "from app.db.session import engine; from app.db.base_class import Base; import app.models; Base.metadata.create_all(bind=engine)"
   ```

5. **Start Services**:
   ```bash
   python start.py
   ```
   Runs Uvicorn server on `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.
