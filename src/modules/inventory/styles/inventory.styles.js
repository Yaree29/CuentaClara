import { StyleSheet } from 'react-native';
import colors from "../../../theme/colors";

export default StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.addBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.addText,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: colors.productBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.productBorder,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  productRight: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.productPrice,
  },
  productStock: {
    fontSize: 12,
    color: colors.productStock,
    marginTop: 4,
  },
  lowStock: {
    color: colors.lowStock,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.emptyText,
    marginTop: 40,
  },
  errorText: {
    color: colors.textError,
    marginHorizontal: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalInputHalf: {
    flex: 1,
  },
  modalInputRight: {
    marginLeft: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalCancel: {
    backgroundColor: '#e2e8f0',
  },
  modalPrimary: {
    backgroundColor: '#2563eb',
  },
  modalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalPrimaryText: {
    color: '#fff',
  },
  modalError: {
    color: colors.textError,
    fontSize: 12,
    marginBottom: 8,
  },
});
