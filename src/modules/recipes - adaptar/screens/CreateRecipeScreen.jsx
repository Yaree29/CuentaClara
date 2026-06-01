import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import useRecipeForm from '../hooks/useRecipeForm';
import styles from '../styles/recipeStyles';

const CreateRecipeScreen = ({ navigation }) => {
  const {
    recipeName,
    ingredients,
    nameError,
    saving,
    addIngredient,
    removeIngredient,
    updateIngredient,
    updateRecipeName,
    handleSave,
  } = useRecipeForm(navigation);

  const visibleIngredients = ingredients.filter((ingredient) => ingredient.supplyName.trim());

  return (
    <MainLayout>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Nueva Receta</Text>
          <Text style={styles.pageSubtitle}>
            Define los insumos necesarios para producir este artículo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nombre de la receta *</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="Ej: Torta de chocolate, Café especial..."
            value={recipeName}
            onChangeText={updateRecipeName}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Insumos</Text>
            <TouchableOpacity style={styles.addIngBtn} onPress={addIngredient}>
              <Text style={styles.addIngBtnText}>+ Agregar insumo</Text>
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={ingredient.id} style={styles.ingredientCard}>
              <View style={styles.ingCardHeader}>
                <View style={styles.ingBadge}>
                  <Text style={styles.ingBadgeText}>#{index + 1}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeIngredient(ingredient.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.fieldLabel}>Nombre del insumo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Harina, Leche, Azúcar..."
                value={ingredient.supplyName}
                onChangeText={(value) => updateIngredient(ingredient.id, 'supplyName', value)}
              />
              <View style={styles.row}>
                <View style={styles.quantityField}>
                  <Text style={styles.fieldLabel}>Cantidad *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={ingredient.quantity}
                    onChangeText={(value) => updateIngredient(ingredient.id, 'quantity', value)}
                  />
                </View>
                <View style={styles.unitField}>
                  <Text style={styles.fieldLabel}>Unidad</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="kg, g, ml, unid…"
                    value={ingredient.unit}
                    onChangeText={(value) => updateIngredient(ingredient.id, 'unit', value)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {visibleIngredients.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de insumos</Text>
            {visibleIngredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.summaryRow}>
                <Text style={styles.summaryName}>• {ingredient.supplyName}</Text>
                <Text style={styles.summaryQty}>{ingredient.quantity} {ingredient.unit}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar Receta</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation?.goBack()} disabled={saving}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
};

export default CreateRecipeScreen;