# =============================================================================
# recipes.py (router)
# --------------------
# Endpoints REST para el módulo de Recetas / Producción.
# Prefijo registrado en main.py: /recipes
#
# Rutas:
#   GET    /recipes                         — listar recetas (costo en tiempo real)
#   POST   /recipes                         — crear receta + insumos
#   GET    /recipes/production-history      — historial de producción (filtrable)
#   GET    /recipes/{recipe_id}             — detalle de receta
#   PATCH  /recipes/{recipe_id}             — editar receta / insumos
#   DELETE /recipes/{recipe_id}             — soft delete
#   POST   /recipes/{recipe_id}/produce     — validar disponibilidad + producir
#   GET    /recipes/{recipe_id}/consumption — consumo de insumos (filtrable)
#   GET    /recipes/{recipe_id}/profitability — margen unitario
# =============================================================================
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import recipes_service
from app.models.recipes import RecipeCreateRequest, RecipeUpdateRequest, ProduceRequest

router = APIRouter()


@router.get("", summary="Listar recetas con costo en tiempo real")
def list_recipes(current_user: dict = Depends(get_current_user)):
    try:
        return recipes_service.list_recipes(business_id=current_user["business_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201, summary="Crear receta con sus insumos")
def create_recipe(
    data: RecipeCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return recipes_service.create_recipe(business_id=current_user["business_id"], data=data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/production-history", summary="Historial de producción (filtrable por receta y fecha)")
def production_history(
    recipe_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    try:
        return recipes_service.list_production_history(
            business_id=current_user["business_id"],
            recipe_id=recipe_id,
            date_from=date_from,
            date_to=date_to,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{recipe_id}", summary="Detalle de receta (insumos + costo en tiempo real)")
def get_recipe(recipe_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return recipes_service.get_recipe(business_id=current_user["business_id"], recipe_id=recipe_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{recipe_id}", summary="Editar receta y/o reemplazar sus insumos")
def update_recipe(
    recipe_id: int,
    data: RecipeUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return recipes_service.update_recipe(business_id=current_user["business_id"], recipe_id=recipe_id, data=data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{recipe_id}", summary="Eliminar receta (soft delete)")
def delete_recipe(recipe_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return recipes_service.delete_recipe(business_id=current_user["business_id"], recipe_id=recipe_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{recipe_id}/produce", summary="Validar disponibilidad y registrar producción")
def produce_recipe(
    recipe_id: int,
    data: ProduceRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Valida que TODOS los insumos alcancen para las porciones solicitadas
    (bloquea producción parcial), descuenta cada insumo vía
    POST /inventory/stock/adjust (reason='production') y congela el costo
    total en production_records.
    """
    try:
        return recipes_service.produce(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            recipe_id=recipe_id,
            portions_to_produce=data.portions_to_produce,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{recipe_id}/consumption", summary="Consumo de insumos de esta receta (derivado de inventory_movements)")
def consumption(
    recipe_id: int,
    ingredient_product_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
):
    try:
        return recipes_service.ingredient_consumption(
            business_id=current_user["business_id"],
            recipe_id=recipe_id,
            ingredient_product_id=ingredient_product_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{recipe_id}/profitability", summary="Margen unitario de la receta (sin vínculo a ventas reales)")
def recipe_profitability(recipe_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return recipes_service.profitability(business_id=current_user["business_id"], recipe_id=recipe_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
