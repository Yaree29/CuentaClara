import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 76,
  },
  dropdown: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  separator: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '700',
  },
});
