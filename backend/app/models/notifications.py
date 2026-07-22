from pydantic import BaseModel
from typing import Optional


class NotificationPreferencesUpdateRequest(BaseModel):
    """Preferencias de notificación por tipo de evento (patch parcial)."""
    sales: Optional[bool] = None
    inventory: Optional[bool] = None
