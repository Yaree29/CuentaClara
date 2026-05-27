"""
inventory.py  (router)
----------------------
Endpoints REST para el módulo de inventario de CuentaClara.

Prefijo registrado en main.py: /inventory
Autenticación: Bearer JWT validado por get_current_user (mismo patrón que sales/invoices).

Rutas:
  Categorías
    GET    /inventory/categories            — listar categorías del negocio
    POST   /inventory/categories            — crear nueva categoría

  Productos
    GET    /inventory/products              — listar productos activos con stock
    POST   /inventory/products              — crear producto + fila inventario
    PATCH  /inventory/products/{product_id} — actualizar producto/stock
    DELETE /inventory/products/{product_id} — soft-delete

  Stock / Movimientos
    POST   /inventory/stock/adjust          — entrada compra / ajuste / pérdida / devolución
    GET    /inventory/stock/low             — productos por debajo del stock mínimo
"""

from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import inventory_service
from app.models.inventory import (
    CategoryCreateRequest,
    ProductCreateRequest,
    ProductUpdateRequest,
    StockAdjustRequest,
)

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
#  CATEGORÍAS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/categories", summary="Listar categorías del negocio")
def list_categories(current_user: dict = Depends(get_current_user)):
    """
    Devuelve todas las categorías de productos registradas para el negocio del
    usuario autenticado, ordenadas alfabéticamente.
    """
    try:
        return inventory_service.list_categories(
            business_id=current_user["business_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/categories", status_code=201, summary="Crear nueva categoría")
def create_category(
    data: CategoryCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Crea una categoría con el nombre indicado.
    - Nombre: solo letras y espacios (sin números ni símbolos).
    - Si ya existe una categoría con ese nombre (case-insensitive), devuelve la
      existente con `already_exists: true` en lugar de duplicarla.
    """
    try:
        return inventory_service.create_category(
            business_id=current_user["business_id"],
            name=data.name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
#  PRODUCTOS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/products", summary="Listar productos activos con stock")
def list_products(current_user: dict = Depends(get_current_user)):
    """
    Devuelve todos los productos activos del negocio junto con su stock actual,
    stock mínimo y si están por debajo del umbral de alerta.
    """
    try:
        return inventory_service.list_products(
            business_id=current_user["business_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", status_code=201, summary="Crear producto con inventario inicial")
def create_product(
    data: ProductCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Crea un producto nuevo y su fila de inventario en una sola operación atómica.

    Validaciones de negocio:
    - Nombre sin dígitos.
    - Precio > $0.00.
    - Stock inicial >= 0 (null = servicio ilimitado).
    - Stock mínimo >= 0.
    - Si la categoría no existe para este negocio, se crea automáticamente.

    Si la inserción del inventario falla, el producto se elimina (rollback manual).
    """
    try:
        return inventory_service.create_product(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/products/{product_id}", summary="Actualizar producto o stock")
def update_product(
    product_id: int,
    data: ProductUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Actualiza parcialmente un producto (patch semántico).
    Solo se modifican los campos incluidos en el body.

    Puede actualizar:
    - Datos del producto: nombre, precio, categoría, SKU, unidad de medida.
    - Datos de inventario: stock actual, stock mínimo, unidad.
    """
    try:
        return inventory_service.update_product(
            business_id=current_user["business_id"],
            product_id=product_id,
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/products/{product_id}", summary="Eliminar producto (soft delete)")
def delete_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
):
    """
    Marca el producto como inactivo (`is_active = false`).
    No elimina la fila de la base de datos para preservar el historial de
    facturas y movimientos de inventario.
    """
    try:
        return inventory_service.soft_delete_product(
            business_id=current_user["business_id"],
            product_id=product_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
#  STOCK / MOVIMIENTOS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/stock/adjust", summary="Ajuste de inventario (compra / pérdida / devolución)")
def adjust_stock(
    data: StockAdjustRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Registra un movimiento de inventario y actualiza el stock.

    Tipos de razón (`reason`) aceptados:
    | reason   | Efecto sobre stock | type registrado |
    |----------|--------------------|-----------------|
    | purchase | +cantidad          | in              |
    | return   | +cantidad          | in              |
    | waste    | -cantidad          | out             |
    | manual   | =abs(cantidad)     | adjust          |

    - Para `waste` y `manual` con resultado negativo: devuelve 400.
    - Productos de stock ilimitado (null) no se modifican.
    - Devuelve el stock anterior, nuevo y si hay alerta de stock bajo.
    """
    try:
        return inventory_service.adjust_stock(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/movements", summary="Historial de movimientos de inventario")
def list_movements(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """
    Devuelve los últimos movimientos de inventario del negocio (ventas, compras,
    ajustes, pérdidas, devoluciones), ordenados del más reciente al más antiguo.
    """
    try:
        return inventory_service.list_movements(
            business_id=current_user["business_id"],
            limit=max(1, min(limit, 200)),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stock/low", summary="Productos por debajo del stock mínimo")
def low_stock_alerts(current_user: dict = Depends(get_current_user)):
    """
    Devuelve la lista de productos activos cuyo stock actual es menor o igual
    al stock mínimo configurado, ordenados por déficit descendente.

    Útil para el panel de alertas de reposición.
    """
    try:
        return inventory_service.list_low_stock(
            business_id=current_user["business_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
