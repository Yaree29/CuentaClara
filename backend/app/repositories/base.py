from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mapped import has_column


class TenantRepository:
    def __init__(self, db: Session, model: Any):
        self.db = db
        self.model = model

    def _apply_tenant_filter(self, stmt: Any, tenant_id: str) -> Any:
        if has_column(self.model, "business_id"):
            return stmt.where(self.model.business_id == tenant_id)
        if has_column(self.model, "id") and self.model.__table__.name == "businesses":
            return stmt.where(self.model.id == tenant_id)
        return stmt

    def list(self, tenant_id: str, offset: int = 0, limit: int = 100):
        stmt = select(self.model)
        stmt = self._apply_tenant_filter(stmt, tenant_id).offset(offset).limit(limit)
        return self.db.scalars(stmt).all()

    def get_by_id(self, record_id: Any, tenant_id: str):
        stmt = select(self.model).where(self.model.id == record_id)
        stmt = self._apply_tenant_filter(stmt, tenant_id)
        instance = self.db.scalar(stmt)
        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        return instance

    def create(self, payload: dict[str, Any], tenant_id: str):
        if has_column(self.model, "business_id"):
            payload["business_id"] = tenant_id
        instance = self.model(**payload)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def update(self, instance: Any, payload: dict[str, Any]):
        for key, value in payload.items():
            setattr(instance, key, value)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def delete(self, instance: Any):
        self.db.delete(instance)
        self.db.commit()
