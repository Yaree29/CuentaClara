import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../../../theme/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  
  /* --- CABECERAS DE SECCIÓN --- */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle: { color: colors.sectionTitle, fontSize: 16, fontWeight: '700' },
  viewAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  /* --- TARJETAS KPI --- */
  kpiMainCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  kpiLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { color: colors.primary, fontSize: 32, fontWeight: 'bold', marginVertical: 4 },
  kpiSubtext: { color: colors.textMuted, fontSize: 13 },

  /* --- FILAS DE ACTIVIDAD / PRODUCTOS --- */
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  itemSubtitle: { color: colors.textMuted, fontSize: 11 },
  itemAmount: { fontSize: 15, fontWeight: '700' },

  /* --- BOTONES DE ACCIÓN --- */
  primaryActionBtn: { backgroundColor: colors.success, flexDirection: 'row', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  primaryActionBtnText: { color: colors.textButton, fontWeight: '700', marginLeft: 8 },

  /* --- BANNERS DE ALERTA --- */
  alertBanner: { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: colors.danger, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  alertText: { color: '#991B1B', fontSize: 13, fontWeight: '600', marginLeft: 10 },

  /* --- GRÁFICOS SIMULADOS --- */
  chartPlaceholder: { height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginVertical: 10 },
  bar: { width: 25, borderRadius: 4, backgroundColor: colors.primary + '30' },
  barActive: { backgroundColor: colors.primary },

    /* --- WELCOM CONTENEDOR ---*/
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

});