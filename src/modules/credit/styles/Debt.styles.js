import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    padding: 20,
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  debtCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  overdueText: {
    textDecorationLine: 'underline',
  },
  payButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  payButtonText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
});
