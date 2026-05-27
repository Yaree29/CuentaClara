import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background },

  /* --- Cabecera y Buscador --- */
  headerWrapper: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.textPrimary },

  /* --- Lista de Fiados --- */
  listContainer: { padding: 16, paddingBottom: 100 },
  creditCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 },

  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary },

  debtAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.danger },

  itemsText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12 },

  /* --- Botones de la Tarjeta --- */
  actionsRow: {
    flexDirection: 'row', gap: 10 },

  payBtn: {
    flex: 1, backgroundColor: colors.success + '15',
    paddingVertical: 10, borderRadius: 8
    , flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },

  payBtnText: { color: colors.success,
    fontWeight: '700',
    marginLeft: 6 },

  waBtn: {
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center' },

  /* --- Botón Flotante (FAB) --- */
  fabContainer: {
    position: 'absolute',
    bottom: 20, right: 16 },

  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8 },

  /* --- Modales Comunes --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' },

  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24 },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16 },

  formGroup: { marginBottom: 16 },

  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
     marginBottom: 6 },

  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: colors.textPrimary },

  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 16, borderRadius: 12,
    alignItems: 'center',
    marginTop: 10 },

  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold' },

    /* --- Botón Editar --- */
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  editIconBtn: { padding: 4, marginLeft: 6 },

  /* --- Píldoras de Productos (Selector) --- */
  quickAddScroll: { marginVertical: 8, maxHeight: 35 },
  quickAddPill: { backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: colors.primary + '30' },
  quickAddPillText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  /* --- Ajuste de Phone Input --- */
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 48 },
  phonePrefix: { fontSize: 15, color: colors.textSecondary, fontWeight: '600', marginRight: 4 },
  phoneInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
});
