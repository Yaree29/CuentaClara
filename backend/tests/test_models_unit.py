"""
Pruebas unitarias (internas) — Backend / Validadores Pydantic.

Cada prueba verifica UN validador de forma AISLADA: se instancia el modelo con
una entrada concreta y se comprueba la salida esperada (el valor ya limpio) o
que se lance `pydantic.ValidationError` con el mensaje correcto. No intervienen
base de datos, red ni interfaz de usuario.

Software: pytest
Ejecutar:  venv/Scripts/python -m pytest -v
"""
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.inventory import (
    ProductCreateRequest,
    CategoryCreateRequest,
    StockAdjustRequest,
)
from app.models.credit import DebtCreate


def _product(**overrides):
    """Crea un ProductCreateRequest con los campos requeridos mínimos válidos,
    para aislar el validador bajo prueba (los demás campos nunca fallan)."""
    data = {"name": "Producto", "price": Decimal("1.00")}
    data.update(overrides)
    return ProductCreateRequest(**data)


# ── PU-07: Validación de nombre de producto (ProductCreateRequest.name_valid) ──
class TestPU07NombreProducto:
    def test_pu07_01_nombre_valido(self):
        assert _product(name="Cuaderno").name == "Cuaderno"

    def test_pu07_02_nombre_con_numeros_es_aceptado(self):
        # Tras el fix del formulario: los números en el nombre están permitidos.
        assert _product(name="Coca Cola 2L").name == "Coca Cola 2L"

    def test_pu07_03_nombre_vacio_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            _product(name="   ")
        assert "no puede estar vac" in str(exc.value)

    def test_pu07_04_nombre_corto_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            _product(name="A")
        assert "al menos 2 caracteres" in str(exc.value)


# ── PU-08: Validación de precio de producto (ProductCreateRequest.price_positive) ──
class TestPU08PrecioProducto:
    def test_pu08_01_precio_positivo_valido(self):
        assert _product(price=Decimal("1.50")).price == Decimal("1.50")

    def test_pu08_02_precio_cero_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            _product(price=Decimal("0"))
        assert "mayor a $0.00" in str(exc.value)

    def test_pu08_03_precio_negativo_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            _product(price=Decimal("-5"))
        assert "mayor a $0.00" in str(exc.value)


# ── PU-09: Validación de stock no negativo (ProductCreateRequest.stock_non_negative) ──
class TestPU09StockProducto:
    def test_pu09_01_stock_none_servicio_ok(self):
        # None = servicio / stock ilimitado: es válido.
        assert _product(initial_stock=None).initial_stock is None

    def test_pu09_02_stock_cero_ok(self):
        assert _product(initial_stock=Decimal("0")).initial_stock == Decimal("0")

    def test_pu09_03_stock_positivo_ok(self):
        assert _product(initial_stock=Decimal("10")).initial_stock == Decimal("10")

    def test_pu09_04_stock_negativo_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            _product(initial_stock=Decimal("-1"))
        assert "no puede ser negativa" in str(exc.value)


# ── PU-10: Validación de nombre de categoría solo-letras (CategoryCreateRequest) ──
class TestPU10NombreCategoria:
    def test_pu10_01_categoria_valida(self):
        assert CategoryCreateRequest(name="Bebidas").name == "Bebidas"

    def test_pu10_02_categoria_con_numeros_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            CategoryCreateRequest(name="Bebidas2")
        assert "letras y espacios" in str(exc.value)

    def test_pu10_03_categoria_vacia_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            CategoryCreateRequest(name="")
        assert "no puede estar vac" in str(exc.value)

    def test_pu10_04_categoria_corta_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            CategoryCreateRequest(name="B")
        assert "al menos 2 caracteres" in str(exc.value)


# ── PU-11: Validación de monto de fiado (DebtCreate.amount, Field(gt=0)) ──
class TestPU11MontoFiado:
    def test_pu11_01_monto_positivo_valido(self):
        assert DebtCreate(customer_id=1, amount=Decimal("25.50")).amount == Decimal("25.50")

    def test_pu11_02_monto_cero_rechazado(self):
        with pytest.raises(ValidationError):
            DebtCreate(customer_id=1, amount=Decimal("0"))

    def test_pu11_03_monto_negativo_rechazado(self):
        with pytest.raises(ValidationError):
            DebtCreate(customer_id=1, amount=Decimal("-10"))


# ── PU-12: Validación de movimiento de inventario (StockAdjustRequest) ──
class TestPU12MovimientoInventario:
    def test_pu12_01_movimiento_valido(self):
        m = StockAdjustRequest(product_id=1, quantity=Decimal("5"), reason="purchase")
        assert m.quantity == Decimal("5")
        assert m.reason == "purchase"

    def test_pu12_02_cantidad_cero_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            StockAdjustRequest(product_id=1, quantity=Decimal("0"), reason="purchase")
        assert "no puede ser cero" in str(exc.value)

    def test_pu12_03_razon_invalida_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            StockAdjustRequest(product_id=1, quantity=Decimal("5"), reason="xxx")
        assert "Opciones:" in str(exc.value)
