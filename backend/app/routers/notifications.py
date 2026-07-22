from fastapi import APIRouter, HTTPException, Depends, Query
from app.routers.auth import get_current_user
from app.models.notifications import NotificationPreferencesUpdateRequest
from app.services import notifications_service

router = APIRouter()


@router.get("/", summary="Listar notificaciones del usuario")
def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    try:
        return notifications_service.list_notifications(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            unread_only=unread_only,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{notification_id}/read", summary="Marcar notificación como leída")
def mark_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
):
    try:
        return notifications_service.mark_notification_read(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            notification_id=notification_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preferences", summary="Preferencias de notificación del negocio")
def get_notification_preferences(current_user: dict = Depends(get_current_user)):
    try:
        return notifications_service.get_notification_preferences(
            business_id=current_user["business_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/preferences", summary="Editar preferencias de notificación")
def update_notification_preferences(
    data: NotificationPreferencesUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return notifications_service.update_notification_preferences(
            business_id=current_user["business_id"], data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
