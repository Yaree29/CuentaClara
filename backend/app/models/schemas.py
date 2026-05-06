from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: str
    business_id: str
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    category_id: int | None = None
    name: str
    sku: str | None = None
    price: Decimal = Decimal("0")
    unit_type: str | None = None
    image_url: str | None = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    sku: str | None = None
    price: Decimal | None = None
    unit_type: str | None = None
    image_url: str | None = None
    is_active: bool | None = None


class ProductOut(ProductBase):
    id: int
    business_id: str

    model_config = ConfigDict(from_attributes=True)


class SupplierBase(BaseModel):
    name: str
    phone: str | None = None
    email: EmailStr | None = None
    tax_id: str | None = None
    notes: str | None = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    tax_id: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class SupplierOut(SupplierBase):
    id: int
    business_id: str

    model_config = ConfigDict(from_attributes=True)


class HealthOut(BaseModel):
    status: str
    timestamp: datetime
