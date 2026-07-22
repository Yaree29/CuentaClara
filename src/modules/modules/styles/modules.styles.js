import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // 120: estándar del proyecto — la lista de módulos activos/activables crece.
  scrollContent: {
    paddingBottom: 120,
  },
  // Espacio entre el header (DashboardHeader, con logo/avatar) y la primera
  // tarjeta (Análisis Estratégico) — antes ese espacio lo daba el título
  // "Herramientas" que se quitó de esta pantalla.
  bodyContainer: {
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    // 16px: mismo padding lateral que el resto de la pantalla (grid,
    // featuredCard, activateMoreCard), no los 20px de antes.
    marginHorizontal: 16,
  },
  menuSectionContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerBusiness: {
    backgroundColor: colors.primary + '15',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.rowLabel,
  },
  menuSubLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
  },
  activateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },

  /* =====================
     GRID "HERRAMIENTAS"
  ===================== */
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textButton,
  },
  featuredSubLabel: {
    fontSize: 12,
    color: colors.textButton,
    opacity: 0.8,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  toolCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    minHeight: 120,
  },
  toolIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.rowLabel,
  },
  toolSubLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  activateMoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 4,
  },
  activateMoreText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
