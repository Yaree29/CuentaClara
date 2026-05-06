from datetime import datetime, timezone

from fastapi import APIRouter

from app.models.schemas import HealthOut

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(status="ok", timestamp=datetime.now(timezone.utc))
