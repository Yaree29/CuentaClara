// services/mock.js

export const strategicAnalysisMock = {
  ventas: {
    cards: [
      {
        label: 'Ticket promedio',
        value: '$24.50'
      },
      {
        label: 'Número de ventas realizadas',
        value: '342'
      }
    ],
    charts: [
      {
        id: 'monthly-sales',
        title: 'Ventas mensuales',
        description: 'Comportamiento mensual de las ventas.',
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Ventas mensuales',
              data: [1200, 1800, 1500, 2300, 2800, 2500]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'annual-sales',
        title: 'Ventas anuales',
        description: 'Comparativa anual.',
        type: 'bar',
        data: {
          labels: ['2023', '2024', '2025', '2026'],
          datasets: [
            {
              label: 'Ventas anuales',
              data: [18000, 22000, 27500, 31000]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'period-comparison',
        title: 'Comparación entre períodos',
        description: 'Hoy vs ayer / Mes actual vs anterior.',
        type: 'bar',
        data: {
          labels: ['Mes Anterior', 'Mes Actual'],
          datasets: [
            {
              label: 'Comparación entre períodos',
              data: [4200, 5100]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'peak-hours',
        title: 'Horas de mayor venta',
        description: 'Distribución por horas.',
        type: 'bar',
        data: {
          labels: ['08:00', '10:00', '13:00', '16:00', '19:00'],
          datasets: [
            {
              label: 'Horas de mayor venta',
              data: [15, 45, 80, 50, 95]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'best-days',
        title: 'Días con mayores ingresos',
        description: 'Ingresos por día.',
        type: 'bar',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          datasets: [
            {
              label: 'Días con mayores ingresos',
              data: [300, 450, 400, 600, 900, 1200]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'top-products',
        title: 'Productos más vendidos',
        description: 'Ranking de productos.',
        type: 'horizontalBar',
        data: {
          labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
          datasets: [
            {
              label: 'Productos más vendidos',
              data: [150, 120, 95, 80]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'top-categories',
        title: 'Categorías más vendidas',
        description: 'Distribución por categoría.',
        type: 'donut',
        data: {
          labels: ['Electrónica', 'Hogar', 'Ropa', 'Accesorios'],
          datasets: [
            {
              label: 'Categorías más vendidas',
              data: [45, 25, 20, 10]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'payment-methods',
        title: 'Métodos de pago más utilizados',
        description: 'Uso por método de pago.',
        type: 'pie',
        data: {
          labels: ['Efectivo', 'Tarjeta Crédito', 'Tarjeta Débito', 'Transferencia'],
          datasets: [
            {
              label: 'Métodos de pago más utilizados',
              data: [30, 45, 15, 10]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'sales-growth',
        title: 'Tendencia de crecimiento',
        description: 'Evolución de las ventas.',
        type: 'line',
        data: {
          labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
          datasets: [
            {
              label: 'Tendencia de crecimiento',
              data: [1000, 1250, 1100, 1600]
            }
          ]
        },
        options: {
          showLegend: true
        }
      }
    ]
  },
  inventario: {
    cards: [
      {
        label: 'Tiempo promedio de permanencia',
        value: '14 días'
      },
      {
        label: 'Productos disponibles',
        value: '560'
      },
      {
        label: 'Productos bajos en stock',
        value: '18'
      }
    ],
    charts: [
      {
        id: 'top-rotation',
        title: 'Productos con mayor rotación',
        description: 'Productos con mayor salida.',
        type: 'horizontalBar',
        data: {
          labels: ['Cable USB', 'Funda', 'Cargador', 'Audífonos'],
          datasets: [
            {
              label: 'Productos con mayor rotación',
              data: [210, 185, 150, 120]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'no-movement',
        title: 'Productos sin movimiento',
        description: 'Productos sin ventas en los últimos 30 días.',
        type: 'horizontalBar',
        data: {
          labels: ['Modelo Antiguo X', 'Accesorio Y', 'Repuesto Z'],
          datasets: [
            {
              label: 'Productos sin movimiento',
              data: [0, 0, 1]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'most-profitable',
        title: 'Productos más rentables',
        description: 'Mayor margen de ganancia.',
        type: 'horizontalBar',
        data: {
          labels: ['Servicio Premium', 'Producto VIP', 'Paquete Pro'],
          datasets: [
            {
              label: 'Productos más rentables',
              data: [75, 65, 55]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'least-profitable',
        title: 'Productos menos rentables',
        description: 'Menor margen de ganancia.',
        type: 'horizontalBar',
        data: {
          labels: ['Bolsas', 'Tornillos', 'Cables genéricos'],
          datasets: [
            {
              label: 'Productos menos rentables',
              data: [5, 8, 12]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'highest-loss',
        title: 'Productos con mayor pérdida',
        description: 'Productos con más pérdidas o mermas.',
        type: 'bar',
        data: {
          labels: ['Cristales rotos', 'Baterías defectuosas', 'Cajas dañadas'],
          datasets: [
            {
              label: 'Productos con mayor pérdida',
              data: [45, 30, 15]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'damaged-products',
        title: 'Productos dañados',
        description: 'Distribución de productos dañados.',
        type: 'donut',
        data: {
          labels: ['Daño fábrica', 'Daño transporte', 'Daño almacén'],
          datasets: [
            {
              label: 'Productos dañados',
              data: [50, 35, 15]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'expired-products',
        title: 'Productos vencidos',
        description: 'Productos expirados.',
        type: 'pie',
        data: {
          labels: ['Químicos', 'Pegamentos', 'Otros'],
          datasets: [
            {
              label: 'Productos vencidos',
              data: [60, 30, 10]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'expiring-products',
        title: 'Productos próximos a vencer',
        description: 'Próximos a expirar en los siguientes 30 días.',
        type: 'bar',
        data: {
          labels: ['1-7 días', '8-15 días', '16-30 días'],
          datasets: [
            {
              label: 'Productos próximos a vencer',
              data: [12, 25, 42]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'monthly-rotation',
        title: 'Rotación promedio mensual',
        description: 'Índice de rotación del inventario.',
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
          datasets: [
            {
              label: 'Rotación promedio mensual',
              data: [2.1, 2.4, 2.2, 2.8, 3.1]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'inventory-value',
        title: 'Inventario valorizado',
        description: 'Costo vs precio de venta total.',
        type: 'bar',
        data: {
          labels: ['Costo Inversión', 'Valor Venta Estimado'],
          datasets: [
            {
              label: 'Inventario valorizado',
              data: [15000, 32500]
            }
          ]
        },
        options: {
          showLegend: true
        }
      }
    ],
  },
  finanzas: {
    cards: [
      {
        label: 'Rentabilidad del negocio',
        value: '38%'
      },
      {
        label: 'Punto de equilibrio',
        value: '$4,500.00'
      },
      {
        label: 'Capital invertido',
        value: '$18,500.00'
      },
      {
        label: 'Dinero pendiente por cobrar',
        value: '$1,250.00'
      },
      {
        label: 'Dinero pendiente por pagar',
        value: '$850.00'
      }
    ],
    charts: [
      {
        id: 'profit-margin',
        title: 'Márgenes',
        description: 'Evolución de los márgenes porcentuales.',
        type: 'line',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Márgenes',
              data: [32, 35, 34, 38]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'net-profit',
        title: 'Utilidad neta',
        description: 'Comportamiento de la utilidad neta.',
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr'],
          datasets: [
            {
              label: 'Utilidad neta',
              data: [2100, 2400, 2200, 2800]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'gross-profit',
        title: 'Utilidad bruta',
        description: 'Comportamiento de la utilidad bruta.',
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr'],
          datasets: [
            {
              label: 'Utilidad bruta',
              data: [5500, 6200, 5800, 7100]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'expenses-category',
        title: 'Gastos por categoría',
        description: 'Distribución de gastos fijos y variables.',
        type: 'donut',
        data: {
          labels: ['Planilla', 'Alquiler', 'Servicios', 'Insumos', 'Marketing'],
          datasets: [
            {
              label: 'Gastos por categoría',
              data: [40, 25, 10, 15, 10]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'income-vs-expenses',
        title: 'Comparación ingresos vs gastos',
        description: 'Ingresos totales frente a gastos totales.',
        type: 'bar',
        data: {
          labels: ['Ingresos', 'Gastos'],
          datasets: [
            {
              label: 'Comparación ingresos vs gastos',
              data: [15400, 9800]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'daily-balance',
        title: 'Balance diario',
        description: 'Flujo de caja por día de la última semana.',
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
          datasets: [
            {
              label: 'Balance diario',
              data: [150, 220, 180, 310, 450]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'monthly-balance',
        title: 'Balance mensual',
        description: 'Cierre de caja por mes.',
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr'],
          datasets: [
            {
              label: 'Balance mensual',
              data: [4200, 5100, 4800, 6200]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'annual-balance',
        title: 'Balance anual',
        description: 'Cierre histórico por año.',
        type: 'bar',
        data: {
          labels: ['2023', '2024', '2025'],
          datasets: [
            {
              label: 'Balance anual',
              data: [45000, 52000, 68000]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'financial-trend',
        title: 'Tendencia financiera',
        description: 'Evolución del capital líquido.',
        type: 'line',
        data: {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
          datasets: [
            {
              label: 'Tendencia financiera',
              data: [12000, 12500, 13100, 14200]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'operating-costs',
        title: 'Costos operativos',
        description: 'Costos directos de operación.',
        type: 'bar',
        data: {
          labels: ['Costos Fijos', 'Costos Variables'],
          datasets: [
            {
              label: 'Costos operativos',
              data: [4500, 3200]
            }
          ]
        },
        options: {
          showLegend: true
        }
      }
    ]
  },
  servicios: {
    cards: [
      {
        label: 'Servicios realizados',
        value: '145'
      },
      {
        label: 'Tiempo promedio por servicio',
        value: '45 min'
      },
      {
        label: 'Valor promedio por servicio',
        value: '$35.00'
      },
      {
        label: 'Tiempo de espera promedio',
        value: '12 min'
      }
    ],
    charts: [
      {
        id: 'completed-services',
        title: 'Servicios realizados',
        description: 'Cantidad de servicios completados en el mes.',
        type: 'bar',
        data: {
          labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
          datasets: [
            {
              label: 'Servicios realizados',
              data: [35, 42, 28, 40]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'pending-services',
        title: 'Servicios pendientes',
        description: 'Estado actual de la cola de servicios.',
        type: 'donut',
        data: {
          labels: ['En espera de cliente', 'En progreso', 'Falta repuesto'],
          datasets: [
            {
              label: 'Servicios pendientes',
              data: [15, 8, 4]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'employee-productivity',
        title: 'Productividad por empleado',
        description: 'Servicios completados por colaborador.',
        type: 'bar',
        data: {
          labels: ['Técnico 1', 'Técnico 2', 'Técnico 3'],
          datasets: [
            {
              label: 'Productividad por empleado',
              data: [55, 48, 42]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'cancelled-services',
        title: 'Servicios cancelados',
        description: 'Motivos de cancelación.',
        type: 'pie',
        data: {
          labels: ['Cliente no asistió', 'Rechazó presupuesto', 'Sin solución'],
          datasets: [
            {
              label: 'Servicios cancelados',
              data: [60, 30, 10]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'rescheduled-services',
        title: 'Servicios reprogramados',
        description: 'Motivos de reprogramación.',
        type: 'pie',
        data: {
          labels: ['Petición del cliente', 'Retraso interno', 'Falta insumo'],
          datasets: [
            {
              label: 'Servicios reprogramados',
              data: [50, 35, 15]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'most-requested-services',
        title: 'Servicios más solicitados',
        description: 'Ranking de los servicios estrella.',
        type: 'horizontalBar',
        data: {
          labels: ['Mantenimiento Básico', 'Revisión General', 'Reparación Express'],
          datasets: [
            {
              label: 'Servicios más solicitados',
              data: [85, 60, 45]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'services-by-category',
        title: 'Servicios por categoría',
        description: 'Distribución por tipo de servicio.',
        type: 'donut',
        data: {
          labels: ['Preventivo', 'Correctivo', 'Instalación', 'Garantía'],
          datasets: [
            {
              label: 'Servicios por categoría',
              data: [45, 30, 15, 10]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'service-income',
        title: 'Ingresos por servicios',
        description: 'Ingresos monetarios generados.',
        type: 'line',
        data: {
          labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
          datasets: [
            {
              label: 'Ingresos por servicios',
              data: [1225, 1470, 980, 1400]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'service-history',
        title: 'Historial de servicios',
        description: 'Evolución mensual de la cantidad de servicios.',
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
          datasets: [
            {
              label: 'Historial de servicios',
              data: [120, 135, 110, 150, 145]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'customers-served',
        title: 'Clientes atendidos',
        description: 'Volumen de clientes únicos por día.',
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
          datasets: [
            {
              label: 'Clientes atendidos',
              data: [18, 22, 15, 26, 30]
            }
          ]
        },
        options: {
          showLegend: true
        }
      },
      {
        id: 'daily-occupancy',
        title: 'Ocupación diaria',
        description: 'Porcentaje de capacidad instalada utilizada.',
        type: 'line',
        data: {
          labels: ['08:00', '11:00', '14:00', '17:00'],
          datasets: [
            {
              label: 'Ocupación diaria',
              data: [40, 85, 65, 90]
            }
          ]
        },
        options: {
          showLegend: true
        }
      }
    ],
  }
};