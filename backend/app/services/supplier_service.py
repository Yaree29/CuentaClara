from sqlalchemy.orm import Session

from app.models.mapped import get_model
from app.models.schemas import SupplierCreate, SupplierUpdate
from app.repositories.base import TenantRepository


class SupplierService:
    def __init__(self, db: Session):
        model = get_model("suppliers")
        self.repository = TenantRepository(db, model)

    def list_suppliers(self, tenant_id: str, offset: int = 0, limit: int = 100):
        return self.repository.list(tenant_id=tenant_id, offset=offset, limit=limit)

    def get_supplier(self, supplier_id: int, tenant_id: str):
        return self.repository.get_by_id(record_id=supplier_id, tenant_id=tenant_id)

    def create_supplier(self, payload: SupplierCreate, tenant_id: str):
        return self.repository.create(payload=payload.model_dump(), tenant_id=tenant_id)

    def update_supplier(self, supplier_id: int, payload: SupplierUpdate, tenant_id: str):
        instance = self.get_supplier(supplier_id=supplier_id, tenant_id=tenant_id)
        data = payload.model_dump(exclude_unset=True)
        return self.repository.update(instance=instance, payload=data)

    def delete_supplier(self, supplier_id: int, tenant_id: str):
        instance = self.get_supplier(supplier_id=supplier_id, tenant_id=tenant_id)
        self.repository.delete(instance=instance)
