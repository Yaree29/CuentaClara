# Product Requirements Document (PRD) - CuentaClara

**Versión:** 1.0  
**Fecha:** 2026-06-03  
**Propietario del Producto:** Cristian Pinto  
**Estado:** Draft

---

## 📋 Resumen Ejecutivo

CuentaClara es una aplicación ERP móvil multi-tenant diseñada para gestionar operaciones diarias de pequeñas y medianas empresas (PYMEs) y emprendedores independientes. La plataforma ofrece dos modos de operación: **Modo Simple** para transacciones rápidas y **Modo Avanzado** para gestión estructurada de inventario, ventas y facturación.

### Valor Propuesto
- ✅ Gestión simplificada de inventario, ventas y facturación
- ✅ Autenticación segura con biometría
- ✅ Integración multi-tenant con aislamiento RLS
- ✅ Disponibilidad offline (sync automático)
- ✅ Notificaciones en tiempo real (Firebase + WhatsApp)

---

## 🎯 Visión & Objetivos

### Visión a Largo Plazo
Ser la plataforma ERP preferida para PYMEs latinoamericanas, permitiendo que cualquier negocio gestione sus operaciones con la simplicidad de una app mobile.

### Objetivos de Negocio (SMART)
1. **Adopción**: Alcanzar 1000+ usuarios activos en primeros 6 meses
2. **Retención**: Lograr 70% de retención mensual (MAU)
3. **Monetización**: Implementar modelo freemium con 20% conversión
4. **Satisfacción**: NPS > 50 en 6 meses

---

## 👥 Target Users & Personas

### Segmentos de Usuario
1. **PYMEs Informales** - Pequeños negocios sin sistema contable formal
2. **Emprendedores** - Personas con negocio en operación independiente
3. **Gerentes Operativos** - Staff encargado de ventas e inventario

### User Personas

#### Persona 1: "Doña Mariana" - Dueña de Tienda
- **Rol**: Propietaria y operadora de tienda de abarrotes
- **Edad**: 45 años
- **Tech Literacy**: Básica (usa WhatsApp, conoce apps)
- **Pain Points**: 
  - No sabe cuándo se acabó el stock
  - Pierde control de clientes con crédito
  - Gasta tiempo en cálculos manuales
- **Beneficio Esperado**: Saber qué vender y cuándo, recordar quién debe

#### Persona 2: "Carlos" - Vendedor Ambulante
- **Rol**: Vendedor independiente de productos
- **Edad**: 28 años
- **Tech Literacy**: Avanzada (usa múltiples apps)
- **Pain Points**:
  - Necesita registrar ventas rápidamente
  - No tiene acceso a computadora
  - Requiere recibos inmediatos
- **Beneficio Esperado**: Registro rápido de ventas, facturación instantánea

---

## 📊 Alcance & Out of Scope

### ✅ Incluido (MVP)
- Gestión de productos e inventario
- Módulo de ventas (simple y avanzado)
- Facturación automática (PDF + WhatsApp)
- Control de créditos/deudas
- Autenticación con biometría
- Notificaciones push en tiempo real
- Dashboard de KPIs básicos

### ❌ Excluido (Futuro)
- Sistema de nómina/payroll
- Contabilidad financiera completa
- Integración de pasarelas de pago
- E-commerce marketplace
- Análisis predictivo/IA
- App de escritorio (web)

### 🔗 Dependencias Externas
- Supabase (Auth + PostgreSQL)
- Firebase Cloud Messaging
- WhatsApp Business API
- Expo (distribución mobile)

---

## 📖 Contenido Principal

Para más detalles, ver archivos relacionados:

- **[User Stories](./user-stories.md)** - Historias de usuario detalladas
- **[Requisitos Funcionales](./requirements.md)** - RF por módulo
- **[Criterios de Aceptación](./acceptance-criteria.md)** - Condiciones de éxito
- **[Changelog](./changelog.md)** - Historial de versiones

---

## 🏗️ Arquitectura & Tech Stack

Ver **[ARCHITECTURE.md](../ARCHITECTURE.md)** para:
- Diagrama de arquitectura completo
- Decisiones técnicas
- Stack de desarrollo (React Native, FastAPI, PostgreSQL)

---

## 💳 Modelo de Monetización & Planes

El acceso a las funcionalidades del sistema se divide en tres planes de suscripción:

### 1. Plan Gratuito (Free)
* **Destinatario:** Vendedor informal independiente.
* **Límite de Usuarios:** 1 usuario por negocio (el propietario).
* **Funcionalidades Incluidas:**
  * Gestión básica de **Inventario** (Retail).
  * **Facturación Rápida** (Modo Simple - registro rápido de ventas).
  * **Sistema de Fiado** (control básico de deudas y abonos de clientes).

### 2. Plan Básico (Basic)
* **Destinatario:** Vendedor informal/micro-empresa que requiere reportería y automatización.
* **Límite de Usuarios:** 1 usuario por negocio (el propietario).
* **Funcionalidades Incluidas:**
  * Todo lo del Plan Gratuito.
  * **Generación de PDF** para reportes mensuales y comprobantes.
  * **Dashboards** e indicadores clave de rendimiento (KPIs).
  * **Alertas Inteligentes** de stock mínimo.
  * **Integración con WhatsApp** (compartir recibos y facturas).
  * **Sistema Personalizado** según el rubro (Productos, Servicios, Manufactura/Recetas).
  * **Contacto con Proveedores** externos dentro de la app con órdenes de compra/pedidos por WhatsApp.

### 3. Plan Pro (Pro)
* **Destinatario:** PYMEs con staff y necesidades de análisis avanzado.
* **Límite de Usuarios:** Adición de más usuarios (2 usuarios en total: propietario + 1 staff/asistente).
* **Funcionalidades Incluidas:**
  * Todo lo del Plan Básico.
  * **Reportes en Tiempo Real**.
  * **Escaneo de Código de Barras** (vía cámara Expo) e interpretación de etiquetas de peso variable de balanzas.
  * **Notificaciones Inteligentes** de WhatsApp para promociones a clientes frecuentes.
  * **Diario de Contabilidad** simplificado.
  * **Análisis de Productos Más Vendidos** con insights automatizados.

---

## 📅 Roadmap & Timeline

### Fase 1: MVP (Semanas 1-8)
- ✅ Autenticación completa y biometría
- ✅ Gestión de inventario (CRUD y tipos de producto)
- ✅ Módulo de ventas básico (Quick Sell)
- ✅ Facturación básica y fiados (crédito)

### Fase 2: Estabilidad (Semanas 9-12)
- 🔄 Testing exhaustivo y robustez RLS
- 🔄 Optimización de rendimiento
- 🔄 Documentación de API y bases de datos

### Fase 3: Expansión (Semanas 13-24)
- 📈 Integración de WhatsApp y plantillas de cobro
- 📈 Reportes mensuales avanzados y dashboards
- 📈 Notificaciones inteligentes de promoción y análisis predictivos

---

## 📞 Stakeholders & Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Product Owner | Cristian Pinto | _____ | _____ |
| Tech Lead | Diego Landero | _____ | _____ |
| Developer | Edgar Juarez / Miguel Zamora | _____ | _____ |

---

## 📝 Notas Importantes

> **[NEEDS CLARIFICATION]** Especificar SLA de uptime y performance targets  
> **[PENDING]** Crear wireframes de Modo Avanzado  

---

*Documento vivo - Última actualización: 2026-06-03*

