# =============================================================================
# CREADO: 2026-07-07
# Propósito: Schemas Pydantic para el módulo de compras (PYME). Define los
#            modelos de entrada y salida para suppliers y purchase_orders.
# =============================================================================
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal


# --- Proveedores ---

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = Field(None, max_length=30)
    email: Optional[str] = Field(None, max_length=150)
    tax_id: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    phone: Optional[str] = Field(None, max_length=30)
    email: Optional[str] = Field(None, max_length=150)
    tax_id: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class SupplierResponse(BaseModel):
    id: int
    business_id: str
    name: str
    phone: Optional[str]
    email: Optional[str]
    tax_id: Optional[str]
    notes: Optional[str]
    is_active: bool


# --- Órdenes de compra ---

class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(..., gt=0)
    unit_cost: Decimal = Field(..., ge=0)


class PurchaseOrderCreate(BaseModel):
    supplier_id: Optional[int] = None
    items: List[PurchaseItemCreate]


class PurchaseOrderResponse(BaseModel):
    id: int
    business_id: str
    supplier_id: Optional[int]
    supplier_name: Optional[str]
    total: float
    status: str
    ordered_at: str
    received_at: Optional[str]
