// =============================================================================
// MODIFICADO: 2026-07-19
// Propósito: Estilos del DashboardHeader. Ambas variantes son transparentes,
//            integradas al colors.background de la pantalla que las contiene
//            (sin fondo de tarjeta ni sombra). El saludo dinámico vive en
//            DashboardGreeting.
// =============================================================================
import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../../theme/colors';

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 20 : 24,
  },
  headerContainerDefault: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 20 : 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  screenTitle: {
    color: colors.greeting,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  kebabContainer: {
    marginRight: -1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    position: 'absolute',
    zIndex: 1000,
    backgroundColor: colors.card,
    borderRadius: 12,
    minWidth: 170,
    paddingVertical: 8,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
