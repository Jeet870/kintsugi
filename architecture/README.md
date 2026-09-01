# Kintsugi System Architecture Overview

Kintsugi is designed as a distributed, decoupled multi-platform mental health platform built around high performance, strict privacy, low-latency AI response, and offline-first capabilities.

---

## Architectural Topology Diagram

```
+-----------------------------------------------------------------------+
|                             CLIENT LAYER                              |
|                                                                       |
|  +---------------------------------+   +---------------------------+  |
|  |     Android Client (Kotlin)     |   |    Web Frontend (React)   |  |
|  |  Single Activity + MVVM + Hilt  |   |    Vite + Tailwind + TS   |  |
|  +---------------------------------+   +---------------------------+  |
+-----------------------------------++----------------------------------+
                                    || HTTP REST / WebSocket
                                    \/
+-----------------------------------------------------------------------+
|                            GATEWAY / BACKEND                          |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |                   FastAPI Asynchronous Engine                   |  |
|  |  Endpoints: /auth, /users, /mood, /journal, /chat, /notifications|  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------++----------------------------------+
                                    ||
         +--------------------------++--------------------------+
         |                                                      |
         \/                                                     \/
+-----------------------------------+  +-----------------------------------+
|          PERSISTENCE LAYER        |  |          TASK & AI LAYER          |
|                                   |  |                                   |
|  MariaDB / MySQL Relational DB    |  |  Celery Task Queue + Redis 7      |
|  SQLAlchemy ORM + Encryption      |  |  Mistral AI LLM Inference API     |
+-----------------------------------+  +-----------------------------------+
```

---

## Core Architectural Pillars

1. **Clean MVVM on Android**: View/Fragment -> ViewModel -> Repository -> Remote Data Source.
2. **Stateless JWT Security**: Short-lived Access Tokens (30 mins) with revocation-aware Refresh Tokens (7 days).
3. **Decoupled Business Services**: Fast, non-blocking REST handlers delegating heavy AI summarization and email dispatch to Celery background workers.
4. **Security by Design**: SHA-256 hashed OTPs, 5-password history checks, symmetric Fernet encrypted journal content.
