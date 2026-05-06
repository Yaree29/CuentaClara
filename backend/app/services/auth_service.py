from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.schemas import TokenResponse
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def login(self, email: str, password: str, tenant_id: str) -> TokenResponse:
        user = self.user_repository.get_by_email_and_tenant(email=email, tenant_id=tenant_id)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "business_id": str(user.business_id),
                "role": str(user.role),
            }
        )
        return TokenResponse(access_token=access_token)
