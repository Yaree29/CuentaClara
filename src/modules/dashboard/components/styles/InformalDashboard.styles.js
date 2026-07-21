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

  // paddingBottom en contentContainerStyle (no en `container`, que va en
  // `style` y no crea espacio de scroll real) — 120 es el estándar del
  // proyecto. Reemplaza el spacer manual <View style={{height:40}}/> que
  // había antes al final del ScrollView.
  contentContainer: {
    paddingBottom: 120,
  },

  /* --- WELCOME --- */
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    color: colors.greeting,
    fontSize: 38,
  },
  welcomeTitleRegular: {
    fontWeight: '400',
  },
  welcomeTitleBold: {
    fontWeight: '700',
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

  /* --- TARJETA DE FIADOS --- */
  debtUnifiedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  debtUnifiedLeft: {
    flexDirection: 'column',
  },
  debtUnifiedLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  debtUnifiedAmount: {
    color: colors.danger,
    fontSize: 22,
    fontWeight: 'bold',
  },
  debtUnifiedRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtUnifiedIcon: {
    marginRight: 6,
  },
  debtUnifiedText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButtonLeft: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionButtonRight: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIconContainerLeft: {
    backgroundColor: colors.salesBadgeBackground, // soft blue from palette (#EFF6FF)
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconContainerRight: {
    backgroundColor: colors.successLight, // soft green from palette (#E8F5E9)
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitleLeft: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.info, // blue from palette (#3B82F6)
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionTitleRight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.successDark, // green from palette (#328339)
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
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
  activityIconSale: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.successLight,
  },
  activityAmountSale: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.textSuccess,
  },
  activityIconStock: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.borderLight,
  },
  activityAmountStock: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.textSecondary,
  },
  activityIconPurchase: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.logoutBackground,
  },
  activityAmountPurchase: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.textError,
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
