# =============================================================================
# businesses.py (router)
# ----------------------
# Endpoints REST para la gestión del Negocio (tenant) actual.
#
# Prefijo registrado en main.py: /businesses
# Autenticación: Bearer JWT validado por get_current_user.
#
# Rutas:
#   GET    /businesses/me              — datos del negocio del usuario autenticado
#   PUT    /businesses/me              — actualizar datos del negocio
#   DELETE /businesses/me/account      — eliminar cuenta completa (solo owner)
#   DELETE /businesses/me/data         — reiniciar historial y transacciones (solo owner)
#   GET    /businesses/me/config       — configuración del negocio
#   PUT    /businesses/me/config       — actualizar configuración del negocio
#   PUT    /businesses/me/modules      — activar/desactivar un módulo opcional
#
# Nota: Usa /me en lugar de /{business_id} para que el business_id se extraiga
#       del JWT, evitando que el frontend pase IDs manualmente y previniendo
#       accesos cross-tenant.
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user, require_role
from app.services import business_service
from app.models.business import (
    BusinessUpdate,
    BusinessConfigUpdate,
    ModuleToggleRequest,
)

router = APIRouter()


@router.get("/me", summary="Obtener datos del negocio actual")
def get_business(current_user: dict = Depends(get_current_user)):
    """
    Devuelve la información del negocio al que pertenece el usuario autenticado.
    El business_id se extrae del JWT — no se pasa como parámetro.
    """
    try:
        return business_service.get_business(business_id=current_user["business_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/me", summary="Actualizar datos del negocio")
def update_business(
    data: BusinessUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Actualiza parcialmente la información del negocio.
    Solo se modifican los campos incluidos en el body (patch semántico vía PUT).
    """
    try:
        return business_service.update_business(
            business_id=current_user["business_id"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/config", summary="Obtener configuración del negocio")
def get_business_config(current_user: dict = Depends(get_current_user)):
    """
    Devuelve la configuración del negocio (moneda, idioma, impuesto, etc.).
    Si no existe fila de configuración, retorna valores por defecto.
    """
    try:
        return business_service.get_business_config(
            business_id=current_user["business_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/me/config", summary="Actualizar configuración del negocio")
def update_business_config(
    data: BusinessConfigUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Actualiza la configuración del negocio. Si no existe fila de configuración,
    la crea automáticamente (upsert).
    """
    try:
        return business_service.update_business_config(
            business_id=current_user["business_id"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put(
    "/me/modules", summary="Activar o desactivar un módulo opcional del negocio"
)
def update_business_modules(
    data: ModuleToggleRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Activa (o desactiva) un módulo opcional (ej. 'commissions', 'tips', 'offers')
    agregando/actualizando su fila en `features`. Devuelve la lista actualizada
    de `enabled_modules` para que el frontend refresque su blueprint sin
    necesitar un nuevo login.
    """
    try:
        return business_service.set_module_active(
            business_id=current_user["business_id"],
            module=data.module,
            enabled=data.enabled,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/me/account", summary="Eliminar cuenta completa del usuario")
def delete_account(
    current_user: dict = Depends(require_role("owner")),
):
    """
    Elimina la cuenta completa: negocio, todos los datos y usuario de auth.
    Solo el propietario puede ejecutar esta acción.
    """
    try:
        return business_service.delete_account(
            user_id=current_user["sub"],
            business_id=current_user["business_id"],
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/me/data", summary="Reiniciar historial y transacciones")
def delete_data(
    current_user: dict = Depends(require_role("owner")),
):
    """
    Borra todas las transacciones e historial del negocio, conservando
    el catálogo de productos, clientes, configuración y usuarios.
    Solo el propietario puede ejecutar esta acción.
    """
    try:
        return business_service.delete_data(
            business_id=current_user["business_id"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
