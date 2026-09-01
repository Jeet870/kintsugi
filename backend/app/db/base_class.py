"""
Declarative Base, Constraint Naming Conventions, and Common Entity Mixins.
Provides standardized primary keys, timestamp fields, and deterministic constraint naming
for SQLAlchemy ORM models and Alembic migrations.
"""
from typing import Any
from datetime import datetime, timezone
from sqlalchemy import BigInteger, Integer, DateTime, MetaData, func
from sqlalchemy.orm import as_declarative, declared_attr, Mapped, mapped_column

# Naming convention for deterministic constraint naming across Alembic migrations
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)


@as_declarative(metadata=metadata)
class Base:
    """
    Shared Declarative Base for all SQLAlchemy models.
    Automatically generates __tablename__ in lowercase based on class name.
    """
    id: Any
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


class PrimaryKeyMixin:
    """
    Reusable Mixin providing a standardized BIGINT primary key column.
    Uses Integer for SQLite dialect to enable AUTOINCREMENT ROWID behavior.
    """
    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
        index=True,
    )


class TimestampMixin:
    """
    Reusable Mixin providing timezone-aware created_at and updated_at audit columns.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

