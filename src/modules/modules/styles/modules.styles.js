import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // 120: estándar del proyecto — la lista de módulos activos/activables crece.
  scrollContent: {
    paddingBottom: 120,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  bodyContainer: {
    paddingTop: 16,
  },
  menuSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuSectionContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerBusiness: {
    backgroundColor: colors.primary + '15',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.rowLabel,
  },
  menuSubLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
  },
  activateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
