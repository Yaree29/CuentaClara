// =============================================================================
// useRecipes.js
// -------------
// Estado de la pantalla de Recetas: lista de recetas (con costo en tiempo
// real calculado por el backend) y catálogo de productos del negocio (para
// elegir producto final e insumos). Mismo patrón que useCommissions.js.
// =============================================================================
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import recipeService from '../services/recipeService';
import inventoryService from '../../inventory/services/inventoryService';

const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [recipesData, productsData] = await Promise.all([
        recipeService.getRecipes().catch(() => []),
        inventoryService.getProducts().catch(() => []),
      ]);
      setRecipes(Array.isArray(recipesData) ? recipesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  return { recipes, products, loading, refetch: fetchAll };
};

export default useRecipes;
