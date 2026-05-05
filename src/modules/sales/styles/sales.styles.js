import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  title: {
    textAlign: 'center', 
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    padding:30,
  },
  display: {
    backgroundColor: '#1e293b',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  displayLabel: {
    color: '#94a3b8',
    fontSize: 16,
  },
  displayValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  displaySub: {
    color: '#38bdf8',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 30,
  },
  amountBtn: {
    backgroundColor: '#f1f5f9',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  amountBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  checkoutBtn: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearBtn: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 14,
  }
});