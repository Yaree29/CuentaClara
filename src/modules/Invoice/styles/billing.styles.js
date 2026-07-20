import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    padding: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    paddingLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addText: {
    paddingRight: 10,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  inventoryList: {
    gap: 8,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inventoryMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mainButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: colors.disabledButton,
  },
  mainButtonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
