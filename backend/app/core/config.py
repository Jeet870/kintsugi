"""
Centralized Application Configuration Module.
Loads, validates, and caches environment variables using pydantic-settings.
"""
from typing import List, Union
from functools import lru_cache
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application & Environment Settings
    PROJECT_NAME: str = Field(default="Kintsugi Mental Health & Wellness Companion")
    VERSION: str = Field(default="1.0.0")
    API_V1_STR: str = Field(default="/api/v1")
    ENV: str = Field(default="development")
    ENVIRONMENT: str = Field(default="development")
    LOG_LEVEL: str = Field(default="INFO")
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    # Database Configuration (PostgreSQL / SQLite fallback)
    POSTGRES_SERVER: str = Field(default="localhost")
    POSTGRES_PORT: str = Field(default="5432")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="postgres")
    POSTGRES_DB: str = Field(default="kintsugi_db")
    DATABASE_URL: str = Field(default="postgresql+psycopg2://postgres:postgres@localhost:5432/kintsugi_db")
    USE_SQLITE_FALLBACK: bool = Field(default=True)

    # JWT & Authentication Security
    SECRET_KEY: str = Field(default="kintsugi_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # Celery & Redis Task Queue Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379/1")
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/1")

    # AI & Mistral LLM Configuration
    MISTRAL_API_KEY: str = Field(default="")
    MISTRAL_MODEL: str = Field(default="mistral-small-latest")
    AI_TIMEOUT_SECONDS: float = Field(default=30.0)
    AI_MAX_RETRIES: int = Field(default=3)
    AI_MAX_TOKENS: int = Field(default=500)
    AI_TEMPERATURE: float = Field(default=0.7)

    # Safety & Emergency Contact Webhook Settings
    EMERGENCY_CONTACT_EMAIL: str = Field(default="support@kintsugi.example.com")
    CRISIS_ESCALATION_WEBHOOK: str = Field(default="")

    # SMTP Email Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="app.services.v1@gmail.com")
    SMTP_PASSWORD: str = Field(default="ubzx xugw lowv bgcv")
    SMTP_FROM: str = Field(default="app.services.v1@gmail.com")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Cached accessor function for Settings.
    Ensures .env is read once at import time and reused across all modules.
    """
    return Settings()


settings = get_settings()
