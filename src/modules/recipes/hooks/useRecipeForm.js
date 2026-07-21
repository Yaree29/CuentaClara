// =============================================================================
// useRecipeForm.js
// -----------------
// Estado del formulario de crear/editar receta: producto final, porciones que
// rinde e insumos (producto + cantidad + unidad). El costo de cada insumo
// (cost_price) y el costo total se calculan del lado del backend en tiempo
// real; este hook solo arma el payload y valida antes de guardar.
// =============================================================================
import { useState } from 'react';
import recipeService from '../services/recipeService';

const createEmptyIngredient = () => ({
  id: Date.now() + Math.random(),
  ingredientProductId: null,
  ingredientName: '',
  quantity: '',
  unit: '',
});

const useRecipeForm = ({ recipe, onSaved }) => {
  const isEditing = !!recipe;

  const [name, setName] = useState(recipe?.name || '');
  const [productId, setProductId] = useState(recipe?.productId ?? null);
  const [productName, setProductName] = useState(recipe?.productName || '');
  const [portionsYield, setPortionsYield] = useState(recipe ? String(recipe.portionsYield) : '');
  const [ingredients, setIngredients] = useState(
    recipe && recipe.ingredients.length
      ? recipe.ingredients.map((ing) => ({
          id: Date.now() + Math.random(),
          ingredientProductId: ing.ingredientProductId,
          ingredientName: ing.ingredientName,
          quantity: String(ing.quantity),
          unit: ing.unit || '',
        }))
      : [createEmptyIngredient()]
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const addIngredient = () => setIngredients((prev) => [...prev, createEmptyIngredient()]);

  const removeIngredient = (id) => {
    setIngredients((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.id !== id)));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const selectFinalProduct = (product) => {
    setProductId(product.id);
    setProductName(product.name);
  };

  const selectIngredientProduct = (id, product) => {
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, ingredientProductId: product.id, ingredientName: product.name, unit: i.unit || product.unitType || '' }
          : i
      )
    );
  };

  const validate = () => {
    if (!name.trim()) return 'El nombre de la receta es obligatorio.';
    if (!productId) return 'Selecciona el producto final que rinde esta receta.';
    const py = Number(portionsYield);
    if (!portionsYield || Number.isNaN(py) || py <= 0) return 'Las porciones que rinde deben ser mayor a 0.';

    const validIngredients = ingredients.filter((i) => i.ingredientProductId);
    if (validIngredients.length === 0) return 'Agrega al menos un insumo.';
    if (
      validIngredients.some(
        (i) => !i.quantity || Number.isNaN(Number(i.quantity)) || Number(i.quantity) <= 0
      )
    ) {
      return 'Cada insumo debe tener una cantidad mayor a 0.';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setError(null);
    setSaving(true);
    try {
      const payload = {
        productId,
        name: name.trim(),
        portionsYield,
        ingredients: ingredients
          .filter((i) => i.ingredientProductId)
          .map((i) => ({ ingredientProductId: i.ingredientProductId, quantity: i.quantity, unit: i.unit })),
      };

      if (isEditing) {
        await recipeService.updateRecipe(recipe.id, payload);
      } else {
        await recipeService.createRecipe(payload);
      }
      onSaved?.();
      return true;
    } catch (e) {
      setError(e?.message || 'No se pudo guardar la receta.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    isEditing,
    name,
    setName,
    productId,
    productName,
    selectFinalProduct,
    portionsYield,
    setPortionsYield,
    ingredients,
    addIngredient,
    removeIngredient,
    updateIngredient,
    selectIngredientProduct,
    error,
    saving,
    handleSave,
  };
};

export default useRecipeForm;
