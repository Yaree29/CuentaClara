from pydantic import BaseModel, field_validator
from typing import Optional
from decimal import Decimal
import re


# ─── Categorías ────────────────────────────────────────────────────────────────

class CategoryCreateRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_only_letters(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre de la categoría no puede estar vacío.")
        if len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")
        # Solo letras (con tildes y ñ) y espacios
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$", v):
            raise ValueError("El nombre solo puede contener letras y espacios (sin números ni símbolos).")
        return v

class CategoryResponse(BaseModel):
    id: int
    name: str
    color: Optional[str] = None
    business_id: str


# ─── Productos ─────────────────────────────────────────────────────────────────

class ProductCreateRequest(BaseModel):
    name: str
    price: Decimal
    cost_price: Optional[Decimal] = None    # costo del insumo (usado por Recetas)
    category_name: Optional[str] = None   # se busca/crea por nombre
    sku: Optional[str] = None
    unit_type: Optional[str] = None
    # Inventario inicial
    initial_stock: Optional[Decimal] = None   # null = servicio / stock ilimitado
    unit: Optional[str] = None
    min_stock: Decimal = Decimal("0")
    purchase_type: Optional[str] = "register_only"
    # Asistente activo (Modo Asistente) que creó el producto, si aplica.
    # None = producto creado directamente por el dueño.
    assistant_id: Optional[int] = None

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre del producto no puede estar vacío.")
        if len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("El precio debe ser mayor a $0.00.")
        return v

    @field_validator("cost_price")
    @classmethod
    def cost_price_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("El costo no puede ser negativo.")
        return v

    @field_validator("initial_stock")
    @classmethod
    def stock_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("La cantidad disponible no puede ser negativa.")
        return v

    @field_validator("min_stock")
    @classmethod
    def min_stock_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("El stock mínimo no puede ser negativo.")
        return v

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    category_name: Optional[str] = None
    sku: Optional[str] = None
    unit_type: Optional[str] = None
    stock: Optional[Decimal] = None
    unit: Optional[str] = None
    min_stock: Optional[Decimal] = None

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("El precio debe ser mayor a $0.00.")
        return v

    @field_validator("cost_price")
    @classmethod
    def cost_price_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("El costo no puede ser negativo.")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("La cantidad disponible no puede ser negativa.")
        return v

    @field_validator("min_stock")
    @classmethod
    def min_stock_non_negative(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v < 0:
            raise ValueError("El stock mínimo no puede ser negativo.")
        return v

class ProductResponse(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    price: Decimal
    cost_price: Optional[Decimal] = None
    unit_type: Optional[str]
    category: Optional[str]
    category_color: Optional[str]
    stock: Optional[Decimal]        # None = servicio ilimitado
    unit: Optional[str]
    min_stock: Decimal
    is_low_stock: bool
    updated_at: Optional[str]


# ─── Movimientos de inventario ──────────────────────────────────────────────────

class StockAdjustRequest(BaseModel):
    """Ajuste manual de stock (entrada por compra, pérdida, devolución, etc.)"""
    product_id: int
    quantity: Decimal           # positivo = entrada, negativo = salida
    reason: str                 # purchase | waste | manual | return
    notes: Optional[str] = None
    # Asistente activo (Modo Asistente) que hizo el ajuste, si aplica.
    # None = ajuste hecho directamente por el dueño.
    assistant_id: Optional[int] = None

    @field_validator("quantity")
    @classmethod
    def quantity_not_zero(cls, v: Decimal) -> Decimal:
        if v == 0:
            raise ValueError("La cantidad del movimiento no puede ser cero.")
        return v

    @field_validator("reason")
    @classmethod
    def reason_valid(cls, v: str) -> str:
        allowed = {"purchase", "waste", "manual", "return", "production"}
        if v not in allowed:
            raise ValueError(f"Razón inválida. Opciones: {', '.join(allowed)}")
        return v

class StockAdjustResponse(BaseModel):
    product_id: int
    previous_stock: Optional[Decimal]
    new_stock: Optional[Decimal]
    movement_id: int
    is_low_stock: bool
    min_stock: Decimal


# ─── Configuración interna de inventario ────────────────────────────────────────

class InventoryConfigUpdateRequest(BaseModel):
    """Actualización parcial de business_inventory_config — solo se envían
    los flags que el dueño quiere cambiar. Sin restricción sobre qué flags
    puede tocar (editable libremente después del registro)."""
    control_peso: Optional[bool] = None
    caducidad: Optional[bool] = None
    mermas: Optional[bool] = None
    recetas: Optional[bool] = None
    produccion: Optional[bool] = None
    escaner: Optional[bool] = None
    stock_predictivo: Optional[bool] = None
