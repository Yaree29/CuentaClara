# Product Requirements Document (PRD) - CuentaClara

**Versión:** 2.0  
**Fecha:** 2026-06-07    
**Equipo de Organización:** Yarlenis Pimentel (Product Owner), Cristian Pinto, Miguel Zamora, Yosue Pineda, Diego Landero, Edgar Juarez, Luis Jiménez  
**Estado:** Production Draft

---

## 1. Introducción
CuentaClara es una solución integral y móvil de Planificación de Recursos Empresariales (ERP) con arquitectura *multi-tenant*, diseñada con el fin de resolver la brecha estructural de digitalización comercial en América Latina (especialmente parametrizada para el mercado de Panamá). 

El sistema consolida la administración diaria de dos segmentos comerciales críticos: los trabajadores del sector informal (microemprendedores) y las pequeñas y medianas empresas (PYMEs). A través de un núcleo de software híbrido y adaptativo, CuentaClara conmuta dinámicamente sus módulos, validaciones de interfaz y flujos de datos operativos, permitiendo transicionar desde un registro transaccional ágil hasta controles de auditoría e inventarios avanzados sin requerir costosas migraciones o conocimientos técnicos previos de contabilidad.

---

## 2. Problema
El tejido comercial minorista y de servicios independiente en la región adolece de ineficiencias severas causadas por la falta de herramientas accesibles:
* **Sistemas de gestión analógicos o fragmentados:** La mayoría de los microcomerciantes informales dependen de libretas de papel físicas y de conversaciones dispersas en WhatsApp para consolidar flujos financieros, lo que induce pérdidas económicas por registros extraviados, errores de cálculo manual o falta de trazabilidad.
* **Falta de visibilidad e incertidumbre sobre inventarios:** Inexistencia de mecanismos de alerta automatizados que mitiguen los quiebres de stock en artículos de alta rotación, limitando la toma oportuna de decisiones de reabastecimiento con los proveedores.
* **Barreras de entrada de los ERP tradicionales:** Las soluciones comerciales vigentes en el mercado imponen una carga excesiva debido a flujos contables complejos, costosos requisitos de hardware y parametrizaciones fiscales rígidas que resultan incompatibles con la velocidad operativa del autoempleo o el comercio ambulante.
* **Control ineficiente de las ventas a crédito ("Fiado"):** El crédito informal basado en relaciones interpersonales carece de esquemas deterministas de cobro, provocando una degradación de la liquidez del negocio debido a la dificultad de calcular saldos pendientes de forma exacta en tiempo real.

---

## 3. Solución
CuentaClara redefine la gestión microempresarial mediante un ecosistema móvil multiplataforma que unifica la simplicidad de una aplicación de mensajería con la robustez transaccional de un ERP corporativo:
* **Registro Financiero Omnicanal en Segundos:** Habilita el guardado ágil de ventas en menos de 3 clics mediante un teclado numérico interactivo (Modo Simple) o desgloses contables automatizados por categorías y productos (Modo Avanzado).
* **Flujos de Cobro Automatizados y Proactivos:** Digitaliza de forma transparente las cuentas corrientes de los deudores e interactúa mediante componentes dinámicos y enlaces nativos (*deep linking*) con WhatsApp para despachar comprobantes estructurados, reportes y recordatorios automatizados de pago.
* **Inteligencia Operativa Ligera e Integrada:** Centraliza modelos algorítmicos en backend para predecir el desabastecimiento de materias primas o mercancías y procesar análisis heurísticos de recurrencia de compradores, sin imponer mantenimiento o configuraciones sofisticadas al usuario final.

---

## 4. Propuesta de valor
CuentaClara es un ERP adaptativo diseñado para trabajadores informales y PYMES.

El sistema ajusta automáticamente la complejidad de la experiencia según el tipo de negocio configurado durante el onboarding. Esto permite que un vendedor informal pueda registrar ventas en segundos mientras una PYME obtiene herramientas avanzadas de control operativo, inventario y facturación.

### Modelo Adaptativo
CuentaClara opera bajo dos experiencias principales sobre una misma base de código:
* **Experiencia Informal (Modo Simple):** Minimiza la presencia de formularios técnicos, activa lógicas automáticas por defecto (*Smart Defaults*) en segundo plano y prioriza la captura inmediata de montos globales para agilizar el flujo de caja.
* **Experiencia PYME (Modo Avanzado):** Habilita módulos detallados de inventarios multinivel (Retail, Servicios, Manufactura/Recetas JSONB), auditorías exhaustivas de sesiones de caja, desgloses impositivos, reportería analítica interactiva y administración avanzada de perfiles de staff.

Ambas experiencias comparten una misma plataforma tecnológica. La interfaz, módulos, validaciones y reportes son habilitados dinámicamente según la configuración y el modo operativo del negocio guardado en la base de datos.

---

## 5. Tipos de usuarios
La plataforma adapta de forma adaptativa sus privilegios e interfaces para tres tipologías operativas claras:

1. **Trabajadores Informales y Emprendedores Independientes:**
   * *Perfil:* Vendedores ambulantes, puestos de comida callejera, microtiendas de abarrotes, costureros, artesanos.
   * *Necesidad:* Velocidad transaccional extrema, nula fricción con términos contables, cobros inmediatos por canales móviles y acceso a herramientas de promoción básicas.
2. **Pequeñas y Medianas Empresas (PYMEs):**
   * *Perfil:* Comercios minoristas establecidos, talleres de confección/manufactura ligera, restaurantes formalizados.
   * *Necesidad:* Control granular de existencias físicas, administración fiscal localizada (ITBMS), alertas de stock mínimo, trazabilidad de costos e insumos por recetas y reportes ejecutivos periódicos.
3. **Gerentes Operativos / Personal de Staff:**
   * *Perfil:* Cajeros, dependientes de tienda o encargados de almacén delegados por el dueño de la PYME.
   * *Necesidad:* Restricciones de seguridad estrictas que limiten su interacción únicamente al registro de ventas o auditorías de existencias asignadas, protegiendo las métricas de rentabilidad consolidada mediante políticas RLS.

### User Personas Detalladas

#### Persona 1: "Doña Mariana" - Dueña de Tienda de Abarrotes
* **Rol:** Propietaria, administrativa y cajera única de un comercio minorista local.
* **Edad:** 45 años.
* **Competencia Digital:** Básica-intermedia (Usa cotidianamente WhatsApp para coordinar pedidos y conoce aplicaciones de banca móvil).
* **Puntos de Dolor:** * Incapacidad de preveir quiebres de inventario hasta que el estante está físicamente vacío.
  * Pérdida recurrente de ingresos debido al descontrol de créditos anotados en libretas manuales propensas a manchas o extravíos.
  * Consumo excesivo de horas al cierre de la jornada calculando de forma manual los ingresos y egresos netos.
* **Beneficio Esperado:** Conocer de forma visual cuándo realizar pedidos a sus proveedores, automatizar el cobro del fiado a sus vecinos y consolidar el balance de caja sin cálculos manuales.

#### Persona 2: "Carlos" - Vendedor Ambulante de Productos Tecnológicos
* **Rol:** Distribuidor y comerciante independiente en vía pública y redes sociales.
* **Edad:** 28 años.
* **Competencia Digital:** Avanzada (Nativo digital, opera con billeteras digitales y coordina su negocio a través de redes sociales).
* **Puntos de Dolor:**
  * Fricción al registrar transacciones en movimiento debido a interfaces complejas diseñadas para computadoras de escritorio.
  * Imposibilidad de despachar comprobantes estéticos o profesionales de manera instantánea a los clientes de la calle.
  * Falta de un catálogo consolidado y actualizado que pueda compartir rápidamente en chats masivos.
* **Beneficio Esperado:** Un punto de venta móvil ultrarápido que funcione a tres clics, genere PDFs o mensajes estructurados listos para enviar por WhatsApp y mantenga un catálogo digital vivo indexado a su stock.

---

## 6. Arquitectura funcional & Tech Stack
La base del ecosistema tecnológico asegura aislamiento absoluto, alta disponibilidad offline y procesamiento asíncrono optimizado:

* **Frontend Mobile:** Desarrollado sobre **React Native** asistido por **Expo SDK**. Emplea `expo-secure-store` para el almacenamiento encriptado local de tokens de sesión, biométricos y PINs de contingencia; y módulos de acceso nativo de hardware para la captura de imágenes y escaneo periférico de códigos de barra.
* **Core Backend:** Construido sobre **FastAPI**, explotando su enrutador asíncronico de alto rendimiento para procesar solicitudes REST con latencias mínimas. Delegación de flujos pesados a `BackgroundTasks` para evitar bloqueos en el hilo principal del cliente y ejecuciones automatizadas en segundo plano mediante **APScheduler**.
* **Capa de Datos y Seguridad Estricta:** Implementada sobre **Supabase** respaldada por **PostgreSQL**. La seguridad de aislamiento multi-inquilino (*Multi-tenancy*) se ejecuta de forma mandatoria mediante **Row Level Security (RLS)** inyectando la función del sistema `get_business_id()` en cada consulta SQL ejecutada por roles autenticados.

### Alcance de Desarrollo (MVP vs. Out of Scope)
* **✅ Incluido en el MVP:** Gestión de existencias (CRUD por tipos); Punto de venta dual (Venta Rápida / Detallada); Facturación e impuestos (PDF compacto + Texto Estructurado); Módulo de Fiados y cobros vía WhatsApp; Autenticación Biométrica local; Notificaciones push en tiempo real y Dashboard analítico de KPIs base.
* **❌ Excluido (Roadmap Futuro):** Procesamiento contable de nóminas completas (*Payroll*); Pasarelas de pagos electrónicos integradas (Stripe/bancos locales); Automatización de Marketplace E-commerce propio y aplicación nativa de escritorio o Web avanzada de contabilidad profunda.

---

## 7. Funcionalidades Detalladas & Criterios de Aceptación (AC)

### 7.1. Onboarding Adaptativo y Registro Personalizado (Épica 2)
* **AC-02-01:** El formulario de registro recolecta los campos obligatorios: Nombre, Apellido, Teléfono, Nombre del Negocio, Email y Contraseña.
* **AC-02-02:** Después del registro, la aplicación presenta una pantalla de selección visual clara con dos opciones: "Gestión rápida y sencilla" (Bifurcación Informal) y "Control avanzado" (Bifurcación PYME).
* **AC-02-03:** El sistema registra la elección guardando el valor de `ui_mode` (`simple` o `advanced`) en la tabla `businesses`.
* **AC-02-04:** El usuario PYME puede configurar campos fiscales como RUC/NIT y subir un logo corporativo en formato (.png, .jpg) menor a 5MB para cabeceras de facturas.
* **AC-02-05:** Para usuarios informales, el sistema autoconfigura valores por defecto (*Smart Defaults*): moneda "USD", tasa ITBMS en 7% (inactiva por defecto) e insumos deshabilitados.
* **AC-02-06:** El sistema carga plantillas pre-configuradas según la vertical seleccionada (Alimentos, Servicios, Retail), mapeando metadatos especializados en la base de datos de manera automatizada.

### 7.2. Gestión Híbrida de Inventario y Alertas Predictivas (Épica 3)
* **AC-03-01:** **SERVICE (Servicios):** Al realizar una venta, el inventario del producto no disminuye. Su stock en base de datos permanece como `NULL` (infinito).
* **AC-03-02:** **RETAIL (Minorista):** Cada unidad vendida decrementa el stock de forma lineal (`stock_nuevo = stock_anterior - cantidad_vendida`).
* **AC-03-03:** **MANUFACTURE (Manufactura/Recetas):** Al venderse un producto terminado, el backend descuenta automáticamente el stock de sus insumos insulares basándose en una receta en formato JSONB. Si un insumo rompe el inventario mínimo, la transacción se completa pero arroja una alerta en el dashboard.
* **AC-03-04:** El escáner de la cámara (Expo) debe leer códigos de barras (EAN-13, QR) e identificar el producto de forma automática en menos de 1 segundo.
* **AC-03-05:** El backend interpreta etiquetas de balanzas de peso variable con prefijos específicos, extrayendo el ID del producto y calculando el peso neto y precio final de venta.
* **AC-03-06:** El algoritmo de monitoreo dispara una alerta visual cuando el stock de un producto o insumo cae por debajo de su `min_stock` establecido.
* **AC-03-07:** **Alertas Predictivas (Algoritmo de Agotamiento):** El sistema analiza la velocidad de venta histórica diaria para estimar la fecha en que el producto quedará en stock cero. Si el modelo predice desabastecimiento en un periodo menor o igual a 5 días, generará una alerta predictiva en el dashboard.
* **AC-03-08:** Para perfiles informales, la alerta incluye un botón directo que abre WhatsApp con el número telefónico del proveedor guardado en la DB, pre-redactando un mensaje con la orden de suministro sugerida.

### 7.3. Módulo de Ventas, Finanzas y Sistema de Fiados (Épica 4)
* **AC-04-01:** La interfaz de venta rápida permite registrar transacciones con solo seleccionar un monto o un producto rápido y presionar "Completar Venta".
* **AC-04-02:** El cajero dispone de un botón binario visible en el checkout para clasificar la venta como "Al Contado" o "Fiado".
* **AC-04-03:** Al marcar una venta como "Fiado", el sistema exige asociar obligatoriamente un Cliente (nombre/apodo) y registra el saldo de la deuda en una cuenta corriente dedicada.
* **AC-04-04:** El módulo permite registrar amortizaciones e ingresos parciales. Al registrar un Abono, el saldo de la deuda se decrementa linealmente. Si llega a `0.00`, el estado de la deuda cambia automáticamente a `paid`.
* **AC-04-05:** **Cobro Proactivo por WhatsApp:** La lista de cuentas por cobrar incluye un botón para enviar un recordatorio pre-redactado por WhatsApp mediante deep linking que incluye el nombre del cliente, el saldo pendiente consolidado y la fecha de vencimiento.
* **AC-04-06:** Los comprobantes/facturas generadas en Panamá calculan automáticamente el ITBMS (7% sobre el subtotal imponible, excluyendo productos exentos).
* **AC-04-07:** El comprobante se genera asíncronamente en PDF y puede compartirse en formato de texto estructurado o archivo PDF mediante el menú de compartir nativo del dispositivo (optimizando el envío a WhatsApp).

### 7.4. Inteligencia de Negocio, Growth y Marketing WhatsApp (Épica 5)
* **AC-05-01:** **Marketing por WhatsApp (Catálogos Digitales):** El usuario puede seleccionar múltiples artículos del inventario para generar una plantilla de texto enriquecido con nombres, precios y promociones junto a links de imágenes para compartir directamente en sus estados o chats.
* **AC-05-02:** El Dashboard en Modo Avanzado (PYME) muestra gráficos nativos de barra/pastel del ranking de productos más vendidos e indicadores comerciales clave.
* **AC-05-03:** El motor de balance financiero calcula el total de ganancias netas restando los gastos operativos registrados de los subtotales de ingresos de forma diaria.
* **AC-05-04:** **Sistema de Detección de Cliente Frecuente:** El backend ejecuta algoritmos de agrupación basados en la recurrencia de nombres, apodos o teléfonos recolectados en el historial de ventas. Compila una sección con el "Top Clientes Más Frecuentes", visualizando su frecuencia mensual, volumen total de gasto e identificando sus productos preferidos para campañas dirigidas.
* **AC-05-05:** El planificador asíncrono (`APScheduler`) corre diariamente a las 11:59 PM para ejecutar de forma automática:
  1. Consolidar el cierre financiero diario.
  2. Actualizar estados vencidos de fiados a `overdue` comparando con la fecha límite.
  3. Limpiar e invalidar sesiones de caja que hayan quedado inactivas o abiertas por error.

---

## 8. Requisitos de Sistema

### 8.1. Requisitos Funcionales (RF)
* **RF-01 (Multi-tenancy & Isolation):** El sistema debe inyectar de manera transparente filtros de seguridad a nivel de base de datos empleando RLS para restringir el acceso a los datos únicamente al `business_id` del token activo.
* **RF-02 (Autenticación Biométrica):** El frontend debe interactuar con las APIs de hardware de iOS/Android para validar inicios biométricos seguros con un sistema de respaldo numérico (PIN).
* **RF-03 (MFA Contable):** Acciones destructivas o fiscales críticas deben exigir obligatoriamente una verificación secundaria vía Token TOTP de Supabase antes de confirmar el commit en la base de datos.
* **RF-04 (Procesamiento Asíncrono):** El backend de FastAPI debe delegar a colas de ejecución en background las operaciones pesadas de renderizado de reportes PDF y despachos automáticos de emails corporativos.

### 8.2. Requisitos No Funcionales (RNF)
* **RNF-01 (Velocidad del Escáner):** El módulo de escaneo de códigos de barra mediante cámara móvil debe enfocar, descodificar (EAN-13) e insertar el ítem en el carrito en un tiempo inferior a 1.0 segundo.
* **RNF-02 (Cifrado Local de Credenciales):** Cualquier dato sensible del cliente almacenado en el teléfono inteligente debe persistirse cifrado con algoritmos AES-256 usando `expo-secure-store`.
* **RNF-03 (Latencia de la API):** Los endpoints transaccionales centrales (inserción de ventas, actualización de stock) deben responder con latencias de servidor inferiores a 200ms bajo redes móviles estándar.
* **RNF-04 (Resiliencia Offline Efímera):** La aplicación debe almacenar el catálogo de productos esenciales en memoria local para permitir la confección de carritos de compra ante caídas temporales de la cobertura de red.

---

## 9. Historias de usuario
* **HU-01: Registro y Onboarding Adaptativo** (Ver especificaciones detalladas en AC-02-01 a AC-02-05).
* **HU-02: Cobro Proactivo de Cuentas por Cobrar (Fiados)** (Ver especificaciones detalladas en AC-04-03 a AC-04-05).
* **HU-03: Alertas de Abastecimiento Predictivo** (Ver especificaciones detalladas en AC-03-06 a AC-03-08).

---

## 10. Métricas Comerciales y de Producto
1. **Tasa de Adopción (Ratio de Conmutación de Perfil):** Distribución porcentual mensual de comercios que operan en Modo Informal (`simple`) contra Modo Avanzado (`advanced`).
2. **Métrica de Retención de Cohortes (MAU / Retention Rate):** Porcentaje de negocios que continúan ejecutando movimientos transaccionales transcurridos 30, 60 y 90 días. Target: > 70%.
3. **Métrica de Stickiness del Módulo de Fiados:** Volumen promedio semanal de deudas y abonos por usuario activo, validando el reemplazo de la libreta física.
4. **WhatsApp Recovery Rate:** Ratio de mensajes de recordatorio emitidos que se traducen en un abono financiero en menos de 48 horas.

---

## 💳 Modelo de Monetización & Estructura de Planes

### 1. Plan Gratuito (Free)
* **Destinatario:** Vendedor informal independiente.
* **Límite de Usuarios:** 1 usuario único por negocio (Propietario).
* **Funcionalidades Incluidas:** Gestión básica de Inventario (Retail), Facturación Rápida (Modo Simple) y Sistema de Fiado (control base).

### 2. Plan Básico (Basic)
* **Destinatario:** Vendedor informal/micro-empresa que requiere reportería y automatización móvil.
* **Límite de Usuarios:** 1 usuario único por negocio (Propietario).
* **Funcionalidades Incluidas:** Todo lo del Plan Free, Reportes PDF mensuales, Dashboards de KPIs, Alertas Inteligentes y Predictivas de stock, Integración completa con WhatsApp (Catálogos y cobros), Gestión por tipo de Rubro (Servicios y Manufactura/Recetas JSONB), e integración de pedidos rápidos a proveedores.

### 3. Plan Pro (Pro)
* **Destinatario:** PYMEs consolidadas con staff y necesidades analíticas.
* **Límite de Usuarios:** Hasta 2 usuarios concurrentes por negocio (Propietario + 1 Rol de Staff/Asistente).
* **Funcionalidades Incluidas:** Todo lo del Plan Básico, Reportes en tiempo real, Escaneo de Código de Barras por hardware e interpretación de balanzas de peso variable, campañas de fidelización para Clientes Frecuentes, Diario Contable Simplificado y automatización de insights de venta.

---

## 📅 Roadmap de Ejecución & Timeline

* **Fase 1: MVP & Núcleo Transaccional (Semanas 1-8):** [CONCLUIDO] Autenticación biométrica, `expo-secure-store`, CRUD de inventarios, lógicas de Quick Sell, flujo transaccional base y cuentas corrientes de deudores.
* **Fase 2: Estabilidad, Auditoría & Robustez RLS (Semanas 9-12):** [EN CURSO] Testing exhaustivo multi-tenant, optimizaciones de latencia en FastAPI y colas asíncronas de PDF mediante `BackgroundTasks`.
* **Fase 3: Expansión, Analítica & Growth WhatsApp (Semanas 13-24):** [PLANIFICADO] Deep-linking de cobro interactivo, catálogos express, tableros gráficos, algoritmos de detección heurística de clientes recurrentes y rutinas de medianoche en `APScheduler`.

---

## 📞 Matriz de Stakeholders & Aprobaciones Oficiales

De acuerdo con la gobernanza oficial y distribución de áreas de trabajo establecida en las bases fundacionales del proyecto CuentaClara:

| Integrante del Equipo | Área de Trabajo / Rol Principal | Firma Digital | Fecha de Validación |
| :--- | :--- | :--- | :--- |
| **Yarlenis Pimentel** | Organización y Product Owner (PO) |  |  |
| **Cristian Pinto** | Líder de Funcionalidades y Módulos de Negocio |  |  |
| **Yosue Pineda** | Co-Líder de Funcionalidades y Reglas de Negocio |  |  |
| **Diego Landero** | Líder de Arquitectura Backend y Base de Datos |  |  |
| **Miguel Zamora** | Ingeniero de Desarrollo Frontend Lógico (Mobile) |  |  |
| **Luis Jiménez** | Ingeniero de Desarrollo Frontend e Interfaces UI |  |  |
| **Edgar Juarez** | Ingeniero de Desarrollo Frontend y Conectividad API |  |  |

---
*Documento de Requerimientos de Producto (PRD) - CuentaClara v2.0 - Última actualización: 2026-06-07*