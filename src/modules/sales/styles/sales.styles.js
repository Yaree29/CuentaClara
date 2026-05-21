import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({

  /* =========================
     HEADER
  ========================== */

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    paddingRight: 16,
  },

  backArrow: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },

  headerDocButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6A9AB0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  docIcon: {
    width: 14,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  /* =========================
     CONTAINER
  ========================== */

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  /* =========================
     TABS
  ========================== */

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  /* =========================
     DISPLAY CARD
  ========================== */

  displayCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  displayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },

  currency: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 4,
  },

  displayValue: {
    fontSize: 46,
    fontWeight: 'bold',
    color: colors.primary,
  },

  badge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  badgeText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },

  /* =========================
     QUICK GRID
  ========================== */

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },

  amountBtn: {
    backgroundColor: colors.card,
    width: '31%',
    aspectRatio: 1.35,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  amountBtnText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.primary,
  },

  amountSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* =========================
     LABELS
  ========================== */

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },

  /* =========================
     PAYMENT METHODS
  ========================== */

  methodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  methodBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  methodBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  methodBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  methodBtnTextActive: {
    color: '#FFFFFF',
  },

  /* =========================
     INPUT
  ========================== */

  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    minHeight: 56,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 14,
  },

  editIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },

  /* =========================
     EXTRA ACTIONS
  ========================== */

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  secondaryBtnGray: {
    backgroundColor: '#EAEAEA',
    flex: 1,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  secondaryBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  secondaryBtnTextGray: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  secondaryBtnBlue: {
    backgroundColor: '#93C5FD',
    flex: 1,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  secondaryBtnIconBlue: {
    fontSize: 16,
    marginRight: 6,
    color: '#1E3A8A',
  },

  secondaryBtnTextBlue: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 15,
  },

  /* =========================
     BUTTONS
  ========================== */

  checkoutBtn: {
    backgroundColor: colors.success,
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkoutBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkMark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },

  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  disabledBtn: {
    opacity: 0.5,
  },

  /* =========================
     ERRORS
  ========================== */

  errorText: {
    color: colors.textError,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },

  /* =========================
     REPORTS
  ========================== */

  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },

  reportInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    color: colors.textPrimary,
  },

  reportBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },

  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  reportLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },

  reportIncome: {
    color: '#10B981',
    fontWeight: 'bold',
  },

  reportExpense: {
    color: '#EF4444',
    fontWeight: 'bold',
  },

  reportProfit: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  // ========================= //
  // Acciones extras
  // ========================= //
  actionsTopRow: {
    marginBottom: 16,
  },

  clearAmountBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  clearAmountText: {
    color: colors.textError,
    fontWeight: '700',
    fontSize: 14,
  },

  productDropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productDropdownText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});