import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // 120: estándar del proyecto — la lista de órdenes de compra no tenía
  // ningún padding inferior (ScrollView sin contentContainerStyle).
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 120,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.borderLight,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.card,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#2563eb',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  label: {
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
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
    paddingVertical: 20,
  },
  listGroup: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemMeta: {
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
    marginHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: colors.disabledButton,
  },
  mainButtonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderCard: {
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderSupplier: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
  },
  statusDraftText: {
    color: '#92400e',
  },
  statusReceived: {
    backgroundColor: '#dcfce7',
  },
  statusReceivedText: {
    color: '#166534',
  },
  statusCancelled: {
    backgroundColor: colors.logoutBackground,
  },
  statusCancelledText: {
    color: '#991b1b',
  },
  orderActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  orderActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  receiveBtn: {
    backgroundColor: '#2563eb',
  },
  receiveBtnText: {
    color: colors.textButton,
    fontWeight: '600',
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: colors.borderLight,
  },
  cancelBtnText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
});
