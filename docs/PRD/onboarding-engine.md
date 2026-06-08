# Onboarding Engine Configuration Matrix - CuentaClara

Este documento define las reglas de negocio atómicas del motor de onboarding adaptativo. Controla de forma determinista la inyección y habilitación dinámica de módulos funcionales en el Frontend basados en el perfilamiento (`ui_mode` y `category`) recolectado en el registro.

## 🎛️ Esquema de Mapeo Lógico (YAML/JSON Structure)

```yaml
UserType:
  INFORMAL:
    ui_mode: "simple"
    smart_defaults:
      currency: "USD"
      tax_enabled: false
      tax_rate: 0.07
    modules:
      - quick_sell  # Punto de venta express por teclado de monto libre (US-007)
      - debts       # Registro base de fiados mediante nombre o apodo (US-008)
      - profits     # Tarjeta analítica rápida de balance neto diario (US-009)

  PYME:
    ui_mode: "advanced"
    smart_defaults:
      currency: "USD"
      tax_enabled: true
      tax_rate: 0.07  # ITBMS de la República de Panamá (Exenciones aplicadas por ítem)
    categories:
      COMMERCE:
        description: "MiniSúper, tiendas de retail, abarroterías formalizadas y venta de mercancía física"
        modules:
          - inventory  # CRUD detallado, control de stock lineal, SKU y variantes (RETAIL)
          - billing    # Facturación formal legal, numeración secuencial y PDF con RUC
          - scanner    # Escáner de código de barras nativo por cámara Expo (EAN-13)

      FOOD:
        description: "Carnicerías, verdulerías y comercios de alimentos perecederos por volumen/peso"
        modules:
          - inventory  # Control de stock físico lineal por unidad o peso variable (RETAIL)
          - scanner    # Interpretación y parseo de etiquetas de peso variable provenientes de balanzas
          - waste      # Módulo de control de mermas, caducidad, auditoría y desecho físico

      PREPARED_FOOD:
        description: "Cafeterías, fondas, reposterías y restaurantes que transforman materias primas"
        modules:
          - recipes    # Lista de Materiales (BOM) bajo JSONB para deducción relacional de insumos
          - inventory  # Gestión híbrida (Manufactura para producto final, Retail para insumos)
          - billing    # Facturación, control de mesas/comandas y gestión de reparto de propinas

      SERVICES:
        description: "Talleres, barberías, consultorías y soporte técnico"
        modules:
          - commissions # Control de comisiones, tracking por staff asignado y tiempo prestado
          - inventory   # Forzado estricto de Stock NULL (Infinito) para ítems tipo SERVICE