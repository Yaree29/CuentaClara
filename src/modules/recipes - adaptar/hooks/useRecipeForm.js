import { useState } from 'react';
import { Alert } from 'react-native';
import { createEmptyIngredient, saveRecipe } from '../services/recipeService';

const useRecipeForm = (navigation) => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([createEmptyIngredient()]);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const addIngredient = () => {
    setIngredients((prev) => [...prev, createEmptyIngredient()]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length === 1) {
      Alert.alert('Mínimo requerido', 'La receta debe tener al menos un insumo.');
      return;
    }

    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((ingredient) => (ingredient.id === id ? { ...ingredient, [field]: value } : ingredient)));
  };

  const updateRecipeName = (value) => {
    setRecipeName(value);
    if (value.trim()) setNameError('');
  };

  const validate = () => {
    if (!recipeName.trim()) {
      setNameError('El nombre de la receta es obligatorio.');
      return false;
    }

    setNameError('');

    if (ingredients.some((ingredient) => !ingredient.supplyName.trim() || !ingredient.quantity.trim())) {
      Alert.alert('Insumos incompletos', 'Cada insumo debe tener nombre y cantidad.');
      return false;
    }

    if (ingredients.some((ingredient) => Number.isNaN(Number(ingredient.quantity)) || Number(ingredient.quantity) <= 0)) {
      Alert.alert('Cantidad inválida', 'Las cantidades deben ser números mayores a 0.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    await saveRecipe({ recipeName, ingredients });
    setSaving(false);

    Alert.alert('¡Receta guardada!', `"${recipeName}" fue registrada correctamente.`, [
      { text: 'OK', onPress: () => navigation?.goBack() },
    ]);
  };

  return {
    recipeName,
    ingredients,
    nameError,
    saving,
    addIngredient,
    removeIngredient,
    updateIngredient,
    updateRecipeName,
    handleSave,
  };
};

export default useRecipeForm;
