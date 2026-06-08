// =============================================================================
// CREADO: 2026-05-26
// Propósito: Estilos del DashboardHeader. Integrado desde la rama Fronted.
// =============================================================================
import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../../theme/colors';

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  businessText: {
    color: colors.greeting,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.3,
    marginLeft: 10,
  },
  screenTitle: {
    color: colors.greeting,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginLeft: 10,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  notificationsContainer: {
    marginRight: 25,
  },
  settingsContainer: {
    marginRight: -1,
  },
});