"""
Centralized SQLAlchemy Engine and Session Management Module.
Provides thread-safe connection pooling, SessionLocal factory, and FastAPI get_db dependency.
"""
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, DBAPIError

from app.core.config import settings

from app.core.exceptions import AppException

logger = logging.getLogger("kintsugi.db")

# SQLAlchemy Engine Configuration for PostgreSQL / SQLite
def create_app_engine():
    import os
    if os.getenv("ENV") == "testing" or os.getenv("TESTING") == "1":
        sqlite_url = "sqlite:///./kintsugi.db"
        logger.info(f"Test mode detected, using SQLite database engine: {sqlite_url}")
        return create_engine(
            sqlite_url,
            connect_args={"check_same_thread": False},
            future=True
        )

    try:
        db_url = settings.DATABASE_URL
        if db_url.startswith("postgresql"):
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_size=10,
                max_overflow=20,
                pool_timeout=2,
                connect_args={"connect_timeout": 2},
                echo=False,
                future=True,
            )
            # Verify connection
            with engine.connect() as conn:
                pass
            logger.info("Successfully connected to PostgreSQL database")
            return engine
    except Exception as pg_err:
        logger.warning(f"PostgreSQL connection failed ({pg_err}), failing over to SQLite fallback engine...")
    
    # Fallback SQLite Engine
    sqlite_url = "sqlite:///./kintsugi.db"
    logger.info(f"Using SQLite database engine: {sqlite_url}")
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        future=True
    )

engine = create_app_engine()

# Thread-safe Session Factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency Generator for database session lifecycle management.
    Yields a SessionLocal instance, rolls back on exceptions, and ensures cleanup.
    """
    db: Session = SessionLocal()
    try:
        yield db
    except AppException:
        db.rollback()
        raise
    except SQLAlchemyError as sql_err:
        db.rollback()
        logger.error(f"Database session error encountered, rolling back: {sql_err}")
        raise
    except Exception as err:
        db.rollback()
        logger.error(f"Unexpected error during request processing, rolling back DB session: {err}")
        raise
    finally:
        db.close()
