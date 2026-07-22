import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

// Opciones fijas de unidad de medida — compartidas por ProductFormModal.jsx
// (campo unit_type del producto) y RecipesScreen.jsx (unidad de cada insumo
// de una receta). Un solo lugar de verdad para no repetir el arreglo.
export const WEIGHT_UNIT_OPTIONS = [
  { value: 'kg', label: 'Kg' },
  { value: 'lb', label: 'Libra' },
  { value: 'unidad', label: 'Unidad' },
];

// Selector visual simple (pills) para elegir kg/libra/unidad, en vez de
// texto libre. No trae estilos propios: cada pantalla pasa los suyos
// (containerStyle/pillStyle/pillActiveStyle/textStyle/textActiveStyle) para
// respetar la regla del proyecto de mantener los estilos en su propio
// styles/ — así encaja igual de bien en informalInventory.styles.js
// (ProductFormModal) que en recipesScreen.styles.js (insumos de receta).
const UnitTypeSelector = ({
  value,
  onChange,
  containerStyle,
  pillStyle,
  pillActiveStyle,
  textStyle,
  textActiveStyle,
}) => (
  <View style={containerStyle}>
    {WEIGHT_UNIT_OPTIONS.map((opt) => (
      <TouchableOpacity
        key={opt.value}
        style={[pillStyle, value === opt.value && pillActiveStyle]}
        onPress={() => onChange(opt.value)}
      >
        <Text style={[textStyle, value === opt.value && textActiveStyle]}>{opt.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default UnitTypeSelector;
