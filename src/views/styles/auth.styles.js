import { StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default StyleSheet.create({
  /* =========================
     LAYOUT ANTIGUO (se conserva para pantallas no rediseñadas:
     RecoveryOptionsScreen, ResetPasswordScreen)
  ========================== */
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  /* =========================
     LAYOUT NUEVO (Login / Register)
     Encabezado degradado azul oscuro + tarjeta blanca inferior
  ========================== */
  screen: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  headerTextWrap: {
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textWhite,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.secondary,
    lineHeight: 36,
    marginTop: 2,
  },
  cardArea: {
    flex: 1,
    marginTop: -32,
  },
  cardScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  cardNew: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: 560,
  },
});