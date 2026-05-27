import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import inventoryService from '../services/inventoryService';

export const useInformalInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Categorías dinámicas cargadas desde Supabase ---
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

  // Obtener negocio del usuario actual
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);

  const resolveBusinessId = useCallback(() =>
    businessData?.id ||
    businessData?.business_id ||
    user?.business_id ||
    user?.businessId ||
    null,
  [businessData, user]);

  // ─── Carga de categorías del negocio ───────────────────────────────────────
  const loadCategories = useCallback(async () => {
    const businessId = resolveBusinessId();
    if (!businessId) {
      setUserCategories([]);
      return;
    }
    setCategoriesLoading(true);
    try {
      const data = await inventoryService.getCategories(businessId);
      setUserCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      // No mostramos alert, el inventario ya muestra el error general
    } finally {
      setCategoriesLoading(false);
    }
  }, [resolveBusinessId]);

  // ─── Carga de productos del negocio ────────────────────────────────────────
  const loadInventory = useCallback(async () => {
    const businessId = resolveBusinessId();
    if (!businessId) {
      setProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getProducts(businessId);
      setProducts(data);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('No se pudo cargar el inventario.');
      Alert.alert('Error', 'No se pudo cargar el inventario desde Supabase.');
    } finally {
      setLoading(false);
    }
  }, [resolveBusinessId]);

  useEffect(() => {
    loadInventory();
    loadCategories();
  }, [user, businessData]);

  // Listado final de categorías para el filtro de cabecera: "Todas" + las del negocio
  const categories = ['Todas', ...userCategories.map((c) => c.name)];

  // Las categorías disponibles para el formulario de producto (sin "Todas")
  const productCategories = userCategories.map((c) => c.name);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ─── Crear nueva categoría ──────────────────────────────────────────────────
  const addCategory = async (categoryName) => {
    const businessId = resolveBusinessId();
    if (!businessId) {
      Alert.alert('Error', 'No se encontró el negocio activo.');
      return;
    }
    if (!categoryName?.trim()) {
      Alert.alert('Error', 'El nombre de la categoría no puede estar vacío.');
      return;
    }
    try {
      const response = await inventoryService.createCategory(businessId, categoryName);
      if (response.alreadyExists) {
        Alert.alert('Aviso', `La categoría "${response.category.name}" ya existe.`);
      } else {
        setUserCategories((prev) => [...prev, response.category].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error('Error creating category:', err);
      Alert.alert('Error', 'No se pudo crear la categoría.');
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
    const businessId = resolveBusinessId();
    if (!businessId) {
      Alert.alert('Error', 'No se encontró el negocio activo para guardar el producto.');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        const response = await inventoryService.updateProduct(businessId, editingProduct.id, productData);
        if (response.success) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? response.product : p)));
        }
      } else {
        const response = await inventoryService.createProduct(businessId, productData);
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
      Alert.alert('Error', 'No se pudo guardar el producto en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    const businessId = resolveBusinessId();
    if (!businessId) {
      Alert.alert('Error', 'No se encontró el negocio activo para eliminar.');
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryService.deleteProduct(businessId, id);
      if (response.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
      setIsFormModalVisible(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      Alert.alert('Error', 'No se pudo eliminar el producto de Supabase.');
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