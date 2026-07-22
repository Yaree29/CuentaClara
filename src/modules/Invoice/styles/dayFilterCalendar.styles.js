import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
  },

  /* Cabecera: mes/año + navegación entre meses. */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.salesBadgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },

  /* Fila de nombres de día (L M M J V S D). */
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },

  /* Rejilla de días. */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInnerToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayInnerSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.textWhite,
    fontWeight: '800',
  },
  dayTextMuted: {
    color: colors.border,
  },
  // Punto bajo los días que tienen ventas.
  saleDot: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  saleDotSelected: {
    backgroundColor: colors.textWhite,
  },

  /* Pie: botón cerrar. */
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
