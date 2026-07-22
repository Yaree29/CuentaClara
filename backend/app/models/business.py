# =============================================================================
# business.py (models)
# -------------------
# Pydantic request models para el router /businesses.
# =============================================================================
import re

from pydantic import BaseModel, field_validator
from typing import Optional

_HHMM_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class BusinessUpdate(BaseModel):
    """Campos actualizables del negocio (todos opcionales — patch semántico)."""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    ui_mode: Optional[str] = None


class BusinessConfigUpdate(BaseModel):
    """Campos actualizables de la configuración del negocio."""
    currency: Optional[str] = None
    weight_unit: Optional[str] = None
    tax_rate: Optional[float] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    language: Optional[str] = None
    settings: Optional[dict] = None


class ModuleToggleRequest(BaseModel):
    """Activar/desactivar un módulo opcional del negocio (tabla `features`)."""
    module: str
    enabled: bool = True


class SalesScheduleUpdate(BaseModel):
    """Horario fijo diario de ventas (opcional). Ambos null = sin restricción
    horaria — la caja sigue siendo obligatoria de todos modos."""
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None

    @field_validator("opening_time", "closing_time")
    @classmethod
    def validate_hhmm(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _HHMM_RE.match(v):
            raise ValueError("Formato de hora inválido, usa HH:MM (24h).")
        return v
