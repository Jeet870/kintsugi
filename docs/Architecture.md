# Architectural Specifications & System Design

## Overview

Kintsugi is built as an enterprise-ready, cross-platform mental wellness system composed of:
1. **Asynchronous REST & Real-time Backend** (FastAPI, Python 3.11+, SQLAlchemy 2.0).
2. **Web Single Page Application** (React 18, TypeScript, Vite, Framer Motion).
3. **Native Android Client** (Kotlin, MVVM, Hilt, Jetpack Navigation, Material Design 3).
4. **Relational Database Storage** (MariaDB / MySQL 8.0+).
5. **Asynchronous Task Queue** (Celery 5.4+ with Redis 7+ broker).

---

## Clean Architecture & Design Patterns

### 1. Android MVVM Pattern
- **UI Layer (Fragment / View)**: Renders state from ViewModel using Data Binding / View Binding.
- **ViewModel Layer (Hilt @HiltViewModel)**: Retains UI state using `StateFlow` and emits one-time navigation/snackbar events via `SharedFlow`.
- **Domain / Repository Layer**: Encapsulates business rules (`AuthRepository`, `JournalRepository`, `MoodRepository`) and dispatches work to `Dispatchers.IO`.
- **Data Source Layer**: Interacts with `AuthApiService` (Retrofit) and local `EncryptedSharedPreferences` / Datastore.

### 2. Backend Service Layer
- **API Endpoint Route**: Validates input using Pydantic schemas and dependency-injects DB session (`Depends(get_db)`).
- **Business Service**: Pure Python domain logic (`PasswordResetService`, `AuthService`, `JournalService`).
- **ORM Repository**: Handles SQLAlchemy queries, transactions, and explicit rollback error boundaries.
