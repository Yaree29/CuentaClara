import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    padding: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
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
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
  },
  emptyText: {
    color: '#94a3b8',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748b',
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
    backgroundColor: '#94a3b8',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderCard: {
    padding: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#1e293b',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  orderMeta: {
    fontSize: 12,
    color: '#64748b',
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
    backgroundColor: '#fee2e2',
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },
});
