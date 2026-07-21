# =============================================================================
# assistants.py (router)
# ----------------------
# Endpoints REST para el Modo Asistente (empleados sin cuenta de login propia,
# gestionados localmente por el dueño dentro de su propia sesión).
#
# Prefijo registrado en main.py: /assistants
# Autenticación: Bearer JWT del dueño, validado por get_current_user — el
# Modo Asistente NO crea una sesión nueva, sigue operando bajo el JWT del
# dueño. Todas las rutas filtran por business_id del dueño autenticado antes
# de tocar cualquier id recibido en el path, para evitar acceso cross-tenant.
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import assistants_service
from app.models.assistants import AssistantCreate, AssistantUpdate, VerifyPinRequest

router = APIRouter()


@router.post("", summary="Crear un asistente nuevo")
def create_assistant(
    data: AssistantCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return assistants_service.create_assistant(
            business_id=current_user["business_id"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", summary="Listar todos los asistentes (incluye bloqueados)")
def list_assistants(current_user: dict = Depends(get_current_user)):
    return assistants_service.list_assistants(
        business_id=current_user["business_id"]
    )


@router.get("/active", summary="Listar asistentes activos (para el selector de entrada)")
def list_active_assistants(current_user: dict = Depends(get_current_user)):
    return assistants_service.list_active_assistants(
        business_id=current_user["business_id"]
    )


@router.patch("/{assistant_id}", summary="Editar asistente (nombre/tipo/bloqueo/PIN)")
def update_assistant(
    assistant_id: int,
    data: AssistantUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return assistants_service.update_assistant(
            business_id=current_user["business_id"],
            assistant_id=assistant_id,
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{assistant_id}/verify-pin", summary="Verificar PIN al entrar al Modo Asistente")
def verify_pin(
    assistant_id: int,
    data: VerifyPinRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return assistants_service.verify_pin(
            business_id=current_user["business_id"],
            assistant_id=assistant_id,
            pin=data.pin,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/{assistant_id}/status", summary="Estado liviano del asistente (para polling)")
def get_status(
    assistant_id: int,
    current_user: dict = Depends(get_current_user),
):
    try:
        return assistants_service.get_status(
            business_id=current_user["business_id"],
            assistant_id=assistant_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{assistant_id}", summary="Eliminar un asistente")
def delete_assistant(
    assistant_id: int,
    current_user: dict = Depends(get_current_user),
):
    try:
        return assistants_service.delete_assistant(
            business_id=current_user["business_id"],
            assistant_id=assistant_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
