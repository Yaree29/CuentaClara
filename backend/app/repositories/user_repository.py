from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mapped import get_model


class UserRepository:
    def __init__(self, db: Session):
        self.db = db
        self.user_model = get_model("users")

    def get_by_email_and_tenant(self, email: str, tenant_id: str):
        stmt = select(self.user_model).where(
            self.user_model.email == email,
            self.user_model.business_id == tenant_id,
        )
        return self.db.scalar(stmt)

    def get_by_id_and_tenant(self, user_id: str, tenant_id: str):
        stmt = select(self.user_model).where(
            self.user_model.id == user_id,
            self.user_model.business_id == tenant_id,
        )
        return self.db.scalar(stmt)
