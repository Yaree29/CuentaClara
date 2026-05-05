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
});