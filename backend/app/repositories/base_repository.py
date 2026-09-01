"""
Generic Base Repository.
Provides standardized, type-safe CRUD operations parameterized over any SQLAlchemy ORM model.
"""
from typing import Generic, TypeVar, Type, Optional, List, Any, Union, Dict
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic repository encapsulating SQLAlchemy 2.x query operations for ORM entities.
    """
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Fetch a single entity by its primary key ID.
        """
        stmt = select(self.model).where(self.model.id == id)
        return db.scalars(stmt).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """
        Fetch a paginated list of entities.
        """
        stmt = select(self.model).offset(skip).limit(limit)
        return list(db.scalars(stmt).all())

    def create(self, db: Session, obj_in: Union[Dict[str, Any], ModelType]) -> ModelType:
        """
        Create and persist a new model instance.
        """
        if isinstance(obj_in, dict):
            db_obj = self.model(**obj_in)
        else:
            db_obj = obj_in
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        db_obj: ModelType,
        obj_in: Union[Dict[str, Any], ModelType]
    ) -> ModelType:
        """
        Update an existing model instance with field updates.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.__dict__

        for field, value in update_data.items():
            if hasattr(db_obj, field) and not field.startswith("_"):
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Remove a model instance by ID.
        """
        db_obj = self.get(db, id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

    # Alias for backward compatibility
    remove = delete

    def exists(self, db: Session, id: Any) -> bool:
        """
        Check if an entity with the given ID exists.
        """
        stmt = select(func.count()).select_from(self.model).where(self.model.id == id)
        count_val = db.scalar(stmt)
        return bool(count_val and count_val > 0)

    def count(self, db: Session) -> int:
        """
        Count total records in the model's table.
        """
        stmt = select(func.count()).select_from(self.model)
        return db.scalar(stmt) or 0

    def refresh(self, db: Session, db_obj: ModelType) -> ModelType:
        """
        Refresh model instance attributes from the database.
        """
        db.refresh(db_obj)
        return db_obj

    def flush(self, db: Session) -> None:
        """
        Flush pending changes to the database without committing the transaction.
        """
        db.flush()
