from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.tenant import get_tenant_id
from app.models.schemas import SupplierCreate, SupplierOut, SupplierUpdate
from app.services.supplier_service import SupplierService

router = APIRouter(prefix="/suppliers", tags=["Suppliers"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[SupplierOut])
def list_suppliers(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    return SupplierService(db).list_suppliers(tenant_id=tenant_id, offset=offset, limit=limit)


@router.get("/{supplier_id}", response_model=SupplierOut)
def get_supplier(
    supplier_id: int,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    return SupplierService(db).get_supplier(supplier_id=supplier_id, tenant_id=tenant_id)


@router.post("", response_model=SupplierOut, status_code=status.HTTP_201_CREATED)
def create_supplier(
    payload: SupplierCreate,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    return SupplierService(db).create_supplier(payload=payload, tenant_id=tenant_id)


@router.put("/{supplier_id}", response_model=SupplierOut)
def update_supplier(
    supplier_id: int,
    payload: SupplierUpdate,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    return SupplierService(db).update_supplier(supplier_id=supplier_id, payload=payload, tenant_id=tenant_id)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: int,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    SupplierService(db).delete_supplier(supplier_id=supplier_id, tenant_id=tenant_id)
