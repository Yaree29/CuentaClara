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
    marginBottom: 20,
    marginTop: 8,
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
  // BLOQUE 1: RESUMEN (GRID)
  // ===============================
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
  // BLOQUE 5: INFORMACIÓN GENERAL
  // ===============================
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.infocard || colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.infoBorder || colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  infoSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // ===============================
  // BLOQUE 6: MÓDULOS ACTIVOS
  // ===============================
  modulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  moduleCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.reportHighlight || colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // ===============================
  // BLOQUE 7: RESUMEN FINANCIERO
  // ===============================
  financesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  financeCard: {
    alignItems: 'center',
    flex: 1,
  },
  financeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  financeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  financeValueSuccess: {
    color: colors.success,
  },
  financeValueDanger: {
    color: colors.danger,
  },

  // ===============================
  // BLOQUE 8: ACTIVIDAD DEL DÍA
  // ===============================
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  activityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
});

export default styles;