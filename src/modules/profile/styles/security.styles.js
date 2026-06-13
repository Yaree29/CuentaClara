import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

const securityStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 24,
  },
  
  // Contenedor para filas con Switch
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.rowLabel,
  },
  switchSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 18,
  },
  
  // Overlay de carga
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay || 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default securityStyles;
