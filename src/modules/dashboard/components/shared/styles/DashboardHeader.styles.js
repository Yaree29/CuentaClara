// =============================================================================
// MODIFICADO: 2026-07-22
// Propósito: Estilos del DashboardHeader único (avatar + título + slot de
//            acciones), estandarizado para todas las pantallas — mismo
//            tamaño de avatar y de letra en cada módulo/pestaña.
// =============================================================================
import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../../theme/colors';

// Tamaño estándar del avatar y del slot de acciones — no cambiar por pantalla,
// es justamente lo que evita los "sobresaltos" visuales entre pestañas.
const AVATAR_SIZE = 36;
const ACTIONS_SLOT_MIN_WIDTH = 40;

// Avatar más grande, solo para la fila de saludo (showGreeting) de
// HomeScreen.jsx — necesita más presencia junto al saludo de 2 líneas.
const GREETING_AVATAR_SIZE = 48;

export default StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    backgroundColor: colors.card,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarInitial: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  screenTitle: {
    flex: 1,
    color: colors.greeting,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  actionsSlot: {
    minWidth: ACTIONS_SLOT_MIN_WIDTH,
    minHeight: AVATAR_SIZE,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  /* ===================== showGreeting (HomeScreen) ===================== */
  // Contenedor propio (no headerContainer) — más separación respecto a la
  // barra de notificaciones, exclusiva de esta fila de saludo.
  headerContainerGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: Platform.OS === 'ios' ? 20 : 22,
    backgroundColor: colors.card,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  greetingTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greetingTitle: {
    color: colors.greeting,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  greetingTitleRegular: {
    fontWeight: '400',
  },
  greetingTitleBold: {
    fontWeight: '700',
  },
  greetingSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  avatarContainerLarge: {
    width: GREETING_AVATAR_SIZE,
    height: GREETING_AVATAR_SIZE,
    borderRadius: GREETING_AVATAR_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImageLarge: {
    width: GREETING_AVATAR_SIZE,
    height: GREETING_AVATAR_SIZE,
    borderRadius: GREETING_AVATAR_SIZE / 2,
  },
  avatarInitialLarge: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
