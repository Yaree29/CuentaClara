from pydantic import BaseModel, field_validator
from typing import List, Optional
from decimal import Decimal


# ─── Compartir PDFs en lote (selección múltiple del historial) ──────────────────

class InvoicePdfBatchRequest(BaseModel):
    invoice_ids: List[int]

    @field_validator("invoice_ids")
    @classmethod
    def _non_empty(cls, value: List[int]) -> List[int]:
        if not value:
            raise ValueError("Debes seleccionar al menos una factura.")
        return value


# ─── Creación de factura fiscal (PYME) ──────────────────────────────────────────

class InvoiceItemCreate(BaseModel):
    product_id: int
    quantity: Decimal
    unit_price: Decimal


class InvoiceCreateRequest(BaseModel):
    items: List[InvoiceItemCreate]
    payment_method: str  # cash | card | transfer | other
    invoice_type_id: int = 1
    customer_id: Optional[int] = None   # None = consumidor final / sin cliente
    notes: Optional[str] = None


class InvoiceCreateResponse(BaseModel):
    invoice_id: int
    invoice_number: str
    customer_id: Optional[int]
    customer_name: Optional[str]
    total: Decimal
    tax: Decimal
    status: str
    created_at: str


class InvoiceItemDetail(BaseModel):
    product_id: int
    product_name: str
    quantity: Decimal
    unit_price: Decimal
    subtotal: Decimal

class InvoiceDetail(BaseModel):
    invoice_id: int
    invoice_number: str
    total: Decimal
    tax: Decimal
    status: str
    payment_method: Optional[str]
    items: List[InvoiceItemDetail]
    created_at: str