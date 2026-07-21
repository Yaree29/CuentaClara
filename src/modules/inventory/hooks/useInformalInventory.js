// =============================================================================
// MODIFICADO: 2026-05-27
// Propósito: Hook del módulo de inventario para usuarios informales. Integrado
//            desde la rama main, pero conectado a la API FastAPI a través de
//            inventoryService (el backend ya extrae business_id del JWT).
//
// Mantiene la interfaz pública exacta que espera InformalInventory.jsx.
// =============================================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../../../store/useAuthStore';
//import useUserStore from '../../../store/useUserStore';
import inventoryService from '../services/inventoryService';

export const useInformalInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Categorías dinámicas cargadas desde el backend ---
  const [userCategories, setUserCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Estados de Promoción
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProductsForPromo, setSelectedProductsForPromo] = useState([]);
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);

  // Estados del Formulario (Agregar/Editar)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // El backend extrae business_id del JWT — el frontend ya no lo necesita,
  // pero se mantiene la lectura de las stores por compatibilidad con el hook
  // anterior (algunas integraciones futuras pueden requerirlo).
  const user = useAuthStore((state) => state.user);
  const businessData = 'informal';

  // ─── Carga de categorías del negocio ───────────────────────────────────────
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await inventoryService.getCategories();
      setUserCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      // No mostramos alert, el inventario ya muestra el error general
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ─── Carga de productos del negocio ────────────────────────────────────────
  // silent=true evita mostrar el spinner de carga completa. Se usa al volver a
  // la pestaña (p.ej. tras registrar una venta) para refrescar el stock sin
  // parpadeo; la carga inicial sí muestra el spinner.
  const loadInventory = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [user, businessData]);

  // Recargar el inventario cada vez que la pestaña toma el foco. Así, tras
  // registrar una venta en la pestaña de Ventas, al volver a Inventario el
  // stock ya aparece descontado sin tener que deslizar para refrescar.
  // La primera vez muestra el spinner; las siguientes son silenciosas.
  const hasLoadedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      loadInventory(hasLoadedRef.current);
      hasLoadedRef.current = true;
    }, [loadInventory])
  );

  // Listado final de categorías para el filtro de cabecera: "Todas" + las del negocio
  const categories = ['Todas', ...userCategories.map((c) => c.name)];

  // Las categorías disponibles para el formulario de producto (sin "Todas")
  const productCategories = userCategories.map((c) => c.name);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ─── Crear nueva categoría ──────────────────────────────────────────────────
  const addCategory = async (categoryName) => {
    if (!categoryName?.trim()) {
      Alert.alert('Error', 'El nombre de la categoría no puede estar vacío.');
      return;
    }
    try {
      const response = await inventoryService.createCategory(null, categoryName);
      if (response.alreadyExists) {
        Alert.alert('Aviso', `La categoría "${response.category.name}" ya existe.`);
      } else {
        setUserCategories((prev) =>
          [...prev, response.category].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    } catch (err) {
      console.error('Error creating category:', err);
      Alert.alert('Error', err.message || 'No se pudo crear la categoría.');
    }
  };

  // ─── Promoción ──────────────────────────────────────────────────────────────
  const toggleProductForPromo = (product) => {
    if (selectedProductsForPromo.find((p) => p.id === product.id)) {
      setSelectedProductsForPromo((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setSelectedProductsForPromo((prev) => [...prev, product]);
    }
  };

  const generateWhatsAppPromo = (discountText = '') => {
    if (selectedProductsForPromo.length === 0) return;
    let text = `🔥 *¡Mira lo que tengo disponible hoy!* 🔥\n\n`;
    selectedProductsForPromo.forEach((p) => {
      text += `✅ *${p.name}* - a solo *$${p.price.toFixed(2)}*\n`;
    });
    if (discountText) text += `\n🎁 *Aviso:* ${discountText}\n`;
    text += `\n📲 Escríbeme por aquí si te interesa algo.`;

    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    Linking.canOpenURL(url).catch((err) => console.error('Error al abrir WA', err));

    setIsPromoModalVisible(false);
    setIsSelectionMode(false);
    setSelectedProductsForPromo([]);
  };

  // ─── CRUD Productos ─────────────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormModalVisible(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setIsFormModalVisible(true);
  };

  const saveProduct = async (productData) => {
    setLoading(true);
    try {
      if (editingProduct) {
        const response = await inventoryService.updateProduct(null, editingProduct.id, productData);
        if (response.success) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? response.product : p)));
        }
      } else {
        const response = await inventoryService.createProduct(null, productData);
        if (response.success) {
          setProducts((prev) => [response.product, ...prev]);
          // Si se usó una categoría que no estaba en la lista local, recargamos
          const catExists = userCategories.some((c) => c.name === productData.category);
          if (!catExists) await loadCategories();
        }
      }
      setIsFormModalVisible(false);
    } catch (err) {
      console.error('Error saving product:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      const response = await inventoryService.deleteProduct(null, id);
      if (response.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
      setIsFormModalVisible(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      Alert.alert('Error', err.message || 'No se pudo eliminar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return {
    // Productos
    filteredProducts,
    loading,
    error,
    refreshInventory: loadInventory,
    // Búsqueda y filtros
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    categories,
    // Categorías dinámicas
    productCategories,
    userCategories,
    categoriesLoading,
    addCategory,
    isAddCategoryModalVisible, setIsAddCategoryModalVisible,
    // Promoción
    isSelectionMode, setIsSelectionMode,
    selectedProductsForPromo, setSelectedProductsForPromo, toggleProductForPromo,
    isPromoModalVisible, setIsPromoModalVisible, generateWhatsAppPromo,
    // Formulario producto
    isFormModalVisible, setIsFormModalVisible,
    editingProduct,
    openAddForm, openEditForm, saveProduct, deleteProduct,
  };
};
