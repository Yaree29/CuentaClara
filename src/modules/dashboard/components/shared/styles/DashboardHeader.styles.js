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
});
