// =============================================================================
// CREADO: 2026-05-27
// Propósito: Estilos del componente InformalDashboard. Portado desde Fronted,
//            que es la rama con el diseño final. No usa estilos de la versión
//            de main porque allí dependen de useLowStock con acceso directo a
//            Supabase (no permitido en este proyecto).
// =============================================================================
import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../../../theme/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },

  /* --- WELCOME --- */
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    color: colors.greeting,
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },

  /* --- BANNER DE STOCK BAJO --- */
  stockBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  stockBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stockBannerTitle: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  stockItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  stockBadge: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '600',
  },

  /* --- TARJETA PRINCIPAL --- */
  mainCard: {
    backgroundColor: colors.salesDisplayBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainCardTitle: {
    color: colors.salesDisplaySubtext,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.textSuccess,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  mainCardAmount: {
    color: colors.salesDisplayText,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  mainCardSubtext: {
    color: colors.salesDisplaySubtext,
    fontSize: 13,
  },

  /* --- GRID DE CONTADORES (Fiado, Clientes) --- */
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  gridCardValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  /* --- SECCIONES --- */
  sectionTitle: {
    color: colors.sectionTitle,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  /* --- ACCIONES RÁPIDAS --- */
  quickActionsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.successDark,
    backgroundColor: colors.backgroundSecondary,
  },
  quickActionIconContainer: {
    backgroundColor: colors.successBorder,
    padding: 12,
    borderRadius: 10,
    marginRight: 16,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.successDark,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* --- ACTIVIDADES RECIENTES --- */
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  emptyMessage: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 16,
    fontSize: 13,
  },
});
