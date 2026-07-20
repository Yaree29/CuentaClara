import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

const recipeStyles = StyleSheet.create({
  /* --- Encabezado de la página --- */
  pageHeader: { 
    paddingHorizontal: 16, 
    paddingTop: 28, 
    paddingBottom: 8 },

  pageTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    marginBottom: 4 },

  pageSubtitle: {
    fontSize: 13, 
    color: colors.textSecondary, 
    lineHeight: 18 },
  
  /* --- Estructura de secciones --- */
  section: { 
    marginHorizontal: 16, 
    marginTop: 20, 
    marginBottom: 4 },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 },

  sectionLabel: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: colors.textSecondary, 
    textTransform: 'uppercase', 
    letterSpacing: 0.8, 
    marginBottom: 6 },
  
  /* --- Campos de entrada (Inputs) --- */
  input: { 
    backgroundColor: colors.card, 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    fontSize: 15, 
    color: colors.textPrimary, 
    marginBottom: 4 },

  inputError: { 
    borderColor: colors.textError },

  errorText: { 
    fontSize: 12, 
    color: colors.textError, 
    marginBottom: 4, 
    paddingLeft: 2 },

  fieldLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: colors.textSecondary, 
    marginBottom: 4, 
    marginTop: 8 },
  
  /* --- Layout en filas (Grid/Rows) --- */
  row: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' },

  quantityField: { 
    flex: 1.5, 
    marginRight: 8 },

  unitField: { 
    flex: 2 },
  
  /* --- Botón para agregar ingredientes --- */
  addIngBtn: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    borderWidth: 1.5, 
    borderColor: colors.primary },

  addIngBtnText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: colors.primary },
  
  /* --- Tarjetas de ingredientes --- */
  ingredientCard: { 
    backgroundColor: colors.card, 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: colors.border, 
    elevation: 1 },

  ingCardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 },
  
  /* --- Etiquetas (Badges) en ingredientes --- */
  ingBadge: { 
    backgroundColor: colors.primary + '15', 
    borderRadius: 6, 
    paddingHorizontal: 10, 
    paddingVertical: 3 },

  ingBadgeText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: colors.primary },

  removeText: { 
    fontSize: 13, 
    color: colors.textError, 
    fontWeight: '600' },
  
  /* --- Tarjeta de resumen de receta --- */
  summaryCard: { 
    marginHorizontal: 16, 
    marginTop: 4, 
    marginBottom: 16, 
    backgroundColor: colors.successLight, 
    borderRadius: 12, 
    padding: 14, 
    borderWidth: 1, 
    borderColor: colors.success },

  summaryTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: colors.textSuccess, 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.6 },

  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 },

  summaryName: { 
    fontSize: 13, 
    color: colors.textSuccess, 
    flex: 2 },

  summaryQty: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: colors.textSuccess, 
    flex: 1 , 
    textAlign: 'right' },
  
  /* --- Botones de acción principales (Guardar/Cancelar) --- */
  saveButton: { 
    marginHorizontal: 16, 
    marginTop: 8, 
    backgroundColor: colors.primary, 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center' },

  saveButtonDisabled: { 
    backgroundColor: colors.border },

  saveButtonText: {
    color: colors.textButton,
    fontWeight: 'bold', 
    fontSize: 16 },
  
  cancelButton: { 
    marginHorizontal: 16, 
    marginTop: 10, 
    marginBottom: 36, 
    borderRadius: 12, 
    padding: 14, 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: colors.border },

  cancelButtonText: { 
    color: colors.textSecondary, 
    fontWeight: '600', 
    fontSize: 15 },
});

export default recipeStyles;