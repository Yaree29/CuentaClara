# =============================================================================
# CREADO: 2026-05-26
# Propósito: Schemas Pydantic para el módulo de crédito/fiado.
#            Define los modelos de entrada y salida para customers, debts y
#            debt_payments.
# =============================================================================
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


# --- Clientes ---

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    phone: Optional[str] = Field(None, max_length=30)
    notes: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    business_id: str
    name: str
    phone: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: str


# --- Deudas / Fiado ---

class DebtCreate(BaseModel):
    customer_id: int
    amount: Decimal = Field(..., gt=0)
    description: Optional[str] = None
    due_date: Optional[str] = None       # YYYY-MM-DD
    invoice_id: Optional[int] = None     # si viene de una venta a crédito


class DebtResponse(BaseModel):
    id: int
    business_id: str
    customer_id: int
    customer_name: str                   # join de customers.name
    original_amount: float
    remaining_amount: float
    description: Optional[str]
    status: str
    due_date: Optional[str]
    created_at: str


# --- Abonos ---

class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    method: str = Field(default="cash")  # cash | card | transfer | other
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    debt_id: int
    amount: float
    method: str
    notes: Optional[str]
    paid_at: str
    remaining_amount: float              # saldo restante de la deuda tras el abono
    debt_status: str                     # estado actualizado de la deuda
