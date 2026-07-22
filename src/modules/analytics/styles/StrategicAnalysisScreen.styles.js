import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../../theme/colors'; // Ajusta la ruta correcta a tu archivo de colores

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background, // #F5F5F0 - Blanco hueso
  },
  // Contenido con el padding horizontal — separado de mainContainer para que
  // el header (topBar de profile.styles.js) quede a todo el ancho, sin
  // heredar este padding. marginTop: separación visual respecto al header.
  content: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  // Banner indicativo — mismo patrón "hero" que PymeInventory.jsx
  // (heroKicker/heroTitle/heroSubtitle), aclara que esta pantalla muestra un
  // resumen y que el detalle completo vive en cada módulo.
  banner: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  bannerKicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
    lineHeight: 26,
  },
  bannerSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },
  // El header con botón "atrás" ahora reutiliza profile.styles.js
  // (topBar/backButton/headerTitle/headerPlaceholder) — mismo patrón que
  // AppSettingsScreen.jsx — en vez de un header propio sin navegación.
  // ==========================================
  // ESTADOS DE CARGA
  // ==========================================
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background, // Mantiene el fondo blanco hueso
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary, // Un gris azulado para que no sea tan agresivo visualmente
    letterSpacing: 0.5,
  },
  
  footerSpacing: {
    height: 40,
  },

  sectionContainer: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.sectionTitle,
    marginBottom: 16,
    paddingLeft: 4,
    textAlign: 'left',
  },

  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardContainer: {
    width: '48%', 
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight, 
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase', // Opcional: le da un toque más analítico
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22, // Un poco más grande para destacar el KPI
    fontWeight: '800',
    color: colors.primary, // Usamos tu azul principal para que los números destaquen
  },

  chartsWrapper: {
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chartBox: {
    height: 200, 
    backgroundColor: colors.chartPhBackground,
    borderWidth: 1.5,
    borderColor: colors.chartPhBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    color: colors.chartPhText,
    fontSize: 14,
    fontWeight: '500',
  },

  tablesWrapper: {
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  tableBox: {
    height: 250, 
    backgroundColor: colors.chartPhBackground,
    borderWidth: 1.5,
    borderColor: colors.chartPhBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tablePlaceholderText: {
    color: colors.chartPhText,
    fontSize: 14,
    fontWeight: '500',
  },

  calendarsWrapper: {
    marginTop: 4,
  },
  calendarContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  calendarBox: {
    height: 320, 
    backgroundColor: colors.chartPhBackground,
    borderWidth: 1.5,
    borderColor: colors.chartPhBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarPlaceholderText: {
    color: colors.chartPhText,
    fontSize: 14,
    fontWeight: '500',
  },
});