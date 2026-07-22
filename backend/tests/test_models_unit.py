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
from app.models.business import SalesScheduleUpdate
from app.models.cash import CashSessionOpenRequest, CashSessionCloseRequest
from app.models.invoices import InvoicePdfBatchRequest


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

    def test_pu08_04_dos_decimales_aceptados(self):
        assert _product(price=Decimal("12.34")).price == Decimal("12.34")

    def test_pu08_05_tres_decimales_rechazados(self):
        # Es dinero: 12.345 no es un importe representable.
        with pytest.raises(ValidationError) as exc:
            _product(price=Decimal("12.345"))
        assert "2 decimales" in str(exc.value)

    def test_pu08_06_costo_con_tres_decimales_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            _product(cost_price=Decimal("1.005"))
        assert "2 decimales" in str(exc.value)


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
        # reason="purchase" exige unit_cost (regla añadida junto al registro
        # automático del gasto por reposición de stock).
        m = StockAdjustRequest(
            product_id=1, quantity=Decimal("5"), reason="purchase", unit_cost=Decimal("2.50")
        )
        assert m.quantity == Decimal("5")
        assert m.reason == "purchase"

    def test_pu12_02_cantidad_cero_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            StockAdjustRequest(
                product_id=1, quantity=Decimal("0"), reason="purchase", unit_cost=Decimal("2.50")
            )
        assert "no puede ser cero" in str(exc.value)

    def test_pu12_04_compra_sin_costo_unitario_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            StockAdjustRequest(product_id=1, quantity=Decimal("5"), reason="purchase")
        assert "Costo unitario" in str(exc.value)

    def test_pu12_05_costo_unitario_con_tres_decimales_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            StockAdjustRequest(
                product_id=1, quantity=Decimal("5"), reason="purchase", unit_cost=Decimal("2.505")
            )
        assert "2 decimales" in str(exc.value)

    def test_pu12_03_razon_invalida_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            StockAdjustRequest(product_id=1, quantity=Decimal("5"), reason="xxx")
        assert "Opciones:" in str(exc.value)


# ── PU-13: Validación de horario de ventas (SalesScheduleUpdate.validate_hhmm) ──
class TestPU13HorarioVentas:
    def test_pu13_01_horario_valido(self):
        schedule = SalesScheduleUpdate(opening_time="07:00", closing_time="20:00")
        assert schedule.opening_time == "07:00"
        assert schedule.closing_time == "20:00"

    def test_pu13_02_ambos_null_valido(self):
        # Sin restricción horaria (opt-out) — ambos campos null es válido.
        schedule = SalesScheduleUpdate()
        assert schedule.opening_time is None
        assert schedule.closing_time is None

    def test_pu13_03_formato_invalido_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            SalesScheduleUpdate(opening_time="7:00", closing_time="20:00")
        assert "Formato de hora inv" in str(exc.value)

    def test_pu13_04_hora_fuera_de_rango_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            SalesScheduleUpdate(opening_time="25:00", closing_time="20:00")
        assert "Formato de hora inv" in str(exc.value)


# ── PU-14: Validación de montos de sesión de caja (cash.py) ──
class TestPU14MontosCaja:
    def test_pu14_01_monto_apertura_valido(self):
        assert CashSessionOpenRequest(opening_amount=Decimal("50")).opening_amount == Decimal("50")

    def test_pu14_02_monto_apertura_negativo_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            CashSessionOpenRequest(opening_amount=Decimal("-1"))
        assert "no puede ser negativo" in str(exc.value)

    def test_pu14_03_monto_contado_negativo_rechazado(self):
        with pytest.raises(ValidationError) as exc:
            CashSessionCloseRequest(counted_amount=Decimal("-1"))
        assert "no puede ser negativo" in str(exc.value)


# ── PU-15: Validación de lote de PDFs a compartir (InvoicePdfBatchRequest) ──
class TestPU15LotePdf:
    def test_pu15_01_lista_valida(self):
        assert InvoicePdfBatchRequest(invoice_ids=[1, 2, 3]).invoice_ids == [1, 2, 3]

    def test_pu15_02_una_sola_valida(self):
        assert InvoicePdfBatchRequest(invoice_ids=[7]).invoice_ids == [7]

    def test_pu15_03_lista_vacia_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            InvoicePdfBatchRequest(invoice_ids=[])
        assert "al menos una factura" in str(exc.value)
