import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // topBar estilizado
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  headerPlaceholder: {
    width: 40,
  },

  //Tarjeta de Perfil Profesional
  profileCardWrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileMainInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  // Menú y Secciones
  bodyContainer: {
    paddingTop: 24,
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuSectionContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rowButton,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerDanger: {
    backgroundColor: colors.logoutBackground,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.rowLabel,
  },
  menuLabelDanger: {
    color: colors.danger,
  },
  menuSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: colors.logoutBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.logoutText,
  },
  joinedDateText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 20,
  },
  modalGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 16,
    width: '100%',
  },
  modalGoogleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 10,
  },
});
