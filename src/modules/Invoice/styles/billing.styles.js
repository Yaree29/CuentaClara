import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    padding: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    paddingLeft: 10,
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
    paddingRight: 10,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  emptyText: {
    color: '#94a3b8',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  inventoryMeta: {
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
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
