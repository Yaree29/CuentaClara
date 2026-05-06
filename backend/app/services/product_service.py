from sqlalchemy.orm import Session

from app.models.mapped import get_model
from app.models.schemas import ProductCreate, ProductUpdate
from app.repositories.base import TenantRepository


class ProductService:
    def __init__(self, db: Session):
        model = get_model("products")
        self.repository = TenantRepository(db, model)

    def list_products(self, tenant_id: str, offset: int = 0, limit: int = 100):
        return self.repository.list(tenant_id=tenant_id, offset=offset, limit=limit)

    def get_product(self, product_id: int, tenant_id: str):
        return self.repository.get_by_id(record_id=product_id, tenant_id=tenant_id)

    def create_product(self, payload: ProductCreate, tenant_id: str):
        return self.repository.create(payload=payload.model_dump(), tenant_id=tenant_id)

    def update_product(self, product_id: int, payload: ProductUpdate, tenant_id: str):
        instance = self.get_product(product_id=product_id, tenant_id=tenant_id)
        data = payload.model_dump(exclude_unset=True)
        return self.repository.update(instance=instance, payload=data)

    def delete_product(self, product_id: int, tenant_id: str):
        instance = self.get_product(product_id=product_id, tenant_id=tenant_id)
        self.repository.delete(instance=instance)
