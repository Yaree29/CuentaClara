import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../../theme/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 4,
    marginBottom: 24, // Mayor respiro al final del contenedor
  },

  verticalList: {
    gap: 16,
    paddingHorizontal: 16,
  },

  carousel: {
    paddingHorizontal: 16,
    paddingRight: 32, // Margen extra al final para que la última tarjeta no quede pegada al borde
  },

  graphCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20, // Aumentamos el padding interno para que la gráfica respire mejor
    backgroundColor: colors.card || '#ffffff',
    borderWidth: 1,
    borderColor: colors.border || '#e2e8f0',
    // Sombra más suave y moderna (estilo Apple/Stripe)
    shadowColor: colors.shadowCard || '#0f172a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3, 
  },

  carouselCard: {
    width: width * 0.88,
    marginRight: 16,
  },

  graphTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary || '#1e293b',
    marginBottom: 4, // Más cerca de la descripción para agrupar visualmente
    letterSpacing: -0.3, // Toque tipográfico moderno
  },

  graphDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary || '#64748b',
    marginBottom: 20, // Espacio claro antes de empezar a dibujar la gráfica
  },

  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 180, // Mantiene la tarjeta estable aunque la gráfica tarde en cargar
  },

  // Diseño especial para cuando no hay gráfica (Placeholder)
  fallbackContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9', // Fondo gris muy suave
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed', // Borde punteado para indicar estado vacío
  },

  fallbackText: {
    color: colors.textSecondary || '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  paginationDot: {
    width: 6, // Puntos más finos y delicados
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    backgroundColor: colors.border || '#cbd5e1',
  },

  activeDot: {
    width: 20, // Forma de "píldora" para el dot activo
    borderRadius: 4,
    backgroundColor: colors.primary || '#3b82f6',
  },
});