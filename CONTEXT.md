# CuentaClara

CuentaClara es un sistema ERP móvil multi-tenant diseñado para la gestión operativa y financiera de pequeñas y medianas empresas (PYMEs) y comerciantes independientes, ofreciendo una experiencia adaptada mediante Modo Simple y Modo Avanzado.

## Lenguaje del Dominio

**Negocio** (Código: `business`):
El inquilino (tenant) independiente en el sistema multi-tenant. Cada negocio tiene su propia configuración, productos y aislamiento de datos.
_Evitar_: Tienda, comercio, local.

**Usuario** (Código: `user`):
La cuenta de acceso asignada a una persona dentro de un Negocio. Puede tener roles como propietario (`owner`), administrador (`admin`) o personal (`staff`).
_Evitar_: Empleado, trabajador, cuenta.

**Cliente** (Código: `customer`):
El contacto comercial externo del Negocio al cual se le realizan ventas o se le otorga crédito. No tiene acceso de inicio de sesión al sistema.
_Evitar_: Comprador, cuenta de cliente.

**Producto** (Código: `product`):
El artículo físico o servicio ofrecido por el Negocio para la venta.
_Evitar_: Mercadería, ítem, artículo.

**Inventario** (Código: `inventory` / `stock`):
El registro de existencias físicas, unidades de medida y umbrales de stock mínimo para cada Producto.
_Evitar_: Almacén, existencias.

**Factura** (Código: `invoice`):
El registro oficial o recibo comercial generado después de completar una venta.
_Evitar_: Cuenta, boleta, recibo de venta.

**Fiado** (Código: `debt`):
La deuda o saldo pendiente que adquiere un Cliente al realizar una venta a crédito.
_Evitar_: Cuenta pendiente, deuda manual, crédito simple.

**Abono** (Código: `debt_payment`):
El pago parcial o completo realizado por un Cliente para reducir el saldo pendiente de un Fiado.
_Evitar_: Pago general, depósito.

**Sesión de Caja** (Código: `cash_session`):
El registro temporal (apertura y cierre) de los movimientos de efectivo del Negocio para el control diario.
_Evitar_: Caja chica, turno.
