export const createEmptyIngredient = () => ({
  id: Date.now() + Math.random(),
  supplyName: '',
  quantity: '',
  unit: '',
});

export const saveRecipe = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
};
