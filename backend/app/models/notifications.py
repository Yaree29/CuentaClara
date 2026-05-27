from pydantic import BaseModel
from typing import Optional


class PushTokenRequest(BaseModel):
    token: str
    device_type: Optional[str] = "ios"
