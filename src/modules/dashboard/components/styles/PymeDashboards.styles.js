// ==============================
// PymeDashboard.styles.js
// ==============================

import { StyleSheet } from 'react-native';
import colors from '../../../../theme/colors'; // Ajusta la ruta a tu theme/colors

// Exposición de paleta para íconos u otros componentes dentro de PymeDashboard
export const iconColors = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

const styles = StyleSheet.create({
  // ===============================
  // CONTENEDOR PRINCIPAL
  // ===============================
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // paddingBottom para que "Actividad del Día" (último bloque) no quede
  // tapado por el tab bar inferior (height: 72 en MainNavigator.jsx) — mismo
  // valor que usan otras pantallas PYME con scroll bajo el tab bar (ver
  // salesPyme.style.js / cashRegister.style.js). El proyecto no usa
  // useSafeAreaInsets en ninguna pantalla existente.
  contentContainer: {
    paddingBottom: 120,
  },

  // ===============================
  // REFRESH CONTROL
  // ===============================
  refreshColor: colors.primary,

  // ===============================
  // HEADER
  // ===============================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.greeting || colors.textPrimary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },

  // ===============================
  // TÍTULOS Y CABECERAS
  // ===============================
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.sectionTitle || colors.textPrimary,
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeMoreText: {
    fontSize: 14,
    color: colors.textLink,
    fontWeight: '600',
  },

  // ===============================
  // BLOQUE 1: RESUMEN — hero (Ventas del Día) + fila secundaria
  // ===============================
  // Mismo lenguaje visual que el hero "Ventas del Día" de
  // InformalDashboard.styles.js (mainCard): mismos tokens de color
  // (salesDisplayBackground/Text/Subtext), mismo borderRadius/padding/sombra.
  heroCard: {
    backgroundColor: colors.salesDisplayBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    color: colors.salesDisplaySubtext,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  heroAmount: {
    color: colors.salesDisplayText,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroSubtext: {
    color: colors.salesDisplaySubtext,
    fontSize: 13,
    marginBottom: 16,
  },
  // Rendimiento vs. meta integrado al hero (no como tarjeta aparte). Riel
  // translúcido sobre el fondo oscuro del hero + relleno en colors.secondary
  // (mismo azul claro que salesDisplaySubtext, buen contraste sobre navy).
  heroProgressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  heroProgressLabel: {
    color: colors.salesDisplaySubtext,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  cardWrapper: {
    width: "48%", // Fuerza a que ocupen 2 columnas por fila
  },
  cardWrapperCentered: {
    marginLeft: "auto",
    marginRight: "auto",
  },

  // ===============================
  // BLOQUE 2: ALERTAS / EMPTY
  // ===============================
  // Envuelve todo el bloque de Alertas (encabezado + lista/estado vacío) para
  // separarlo de "Acciones Rápidas" justo debajo — antes quedaban pegados
  // (sin margen alguno entre el fin de la lista de alertas y QuickActions).
  alertsBlock: {
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // ===============================
  // BLOQUE 3: META MENSUAL
  // ===============================
  goalContainer: {
    marginVertical: 12,
  },

  // ===============================
  // BLOQUE 4: ACTIVIDAD DEL DÍA
  // ===============================
  // dashboard.activity es el array de eventos que arma buildActivity()
  // (ventas/gastos/movimientos de la sesión) — se lista, no se cuenta.
  activityListContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityRowLast: {
    borderBottomWidth: 0,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activityItemDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityEmptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },

  /* ===== Meta mensual: estado sin meta + edición ===== */
  goalEmptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.warning,
    padding: 18,
  },
  goalEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  goalEmptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  goalEmptyCta: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 12,
  },
  goalEditButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  goalEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  /* ===== Modal para elegir la meta ===== */
  goalModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  goalModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 22,
  },
  goalModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  goalModalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  goalModalInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  goalModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  goalModalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  goalModalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  goalModalSave: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 130,
    alignItems: 'center',
  },
  goalModalSaveDisabled: {
    backgroundColor: colors.disabledButton,
  },
  goalModalSaveText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default styles;