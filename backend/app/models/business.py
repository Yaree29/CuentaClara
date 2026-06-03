# =============================================================================
# business.py (models)
# -------------------
# Pydantic request models para el router /businesses.
# =============================================================================
from pydantic import BaseModel
from typing import Optional


class BusinessUpdate(BaseModel):
    """Campos actualizables del negocio (todos opcionales — patch semántico)."""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class BusinessConfigUpdate(BaseModel):
    """Campos actualizables de la configuración del negocio."""
    currency: Optional[str] = None
    weight_unit: Optional[str] = None
    tax_rate: Optional[float] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    language: Optional[str] = None
