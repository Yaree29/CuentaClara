import { useState } from 'react';
import { Linking, Alert } from 'react-native';

// Lista de categorías controladas por nosotros
export const CONTROLLED_CATEGORIES = ['Servicios', 'Lotería', 'Snacks', 'Bebidas', 'Otros'];

const INITIAL_MOCK_PRODUCTS = [
  { id: '1', name: 'Recarga +Móvil $5', price: 5.00, category: 'Servicios', stock: null },
  { id: '2', name: 'Recarga Tigo $3', price: 3.00, category: 'Servicios', stock: null },
  { id: '3', name: 'Chances (Miercoles)', price: 0.25, category: 'Lotería', stock: 40 },
  { id: '4', name: 'Billetes (Domingo)', price: 1.00, category: 'Lotería', stock: 15 },
  { id: '5', name: 'Chocolate Snickers', price: 1.25, category: 'Snacks', stock: 12 },
];

export const useInformalInventory = () => {
  // Convertimos los datos a un estado para poder agregar/editar
  const [products, setProducts] = useState(INITIAL_MOCK_PRODUCTS);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Estados de Promoción
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProductsForPromo, setSelectedProductsForPromo] = useState([]);
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);

  // Estados del Formulario (Agregar/Editar)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Modo Crear

  const categories = ['Todas', ...CONTROLLED_CATEGORIES];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleProductForPromo = (product) => {
    if (selectedProductsForPromo.find(p => p.id === product.id)) {
      setSelectedProductsForPromo(prev => prev.filter(p => p.id !== product.id));
    } else {
      setSelectedProductsForPromo(prev => [...prev, product]);
    }
  };

  const generateWhatsAppPromo = (discountText = "") => {
    if (selectedProductsForPromo.length === 0) return;
    let text = `🔥 *¡Mira lo que tengo disponible hoy!* 🔥\n\n`;
    selectedProductsForPromo.forEach(p => { text += `✅ *${p.name}* - a solo *$${p.price.toFixed(2)}*\n`; });
    if (discountText) text += `\n🎁 *Aviso:* ${discountText}\n`;
    text += `\n📲 Escríbeme por aquí si te interesa algo.`;

    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    Linking.canOpenURL(url).catch(err => console.error('Error al abrir WA', err));
      
    setIsPromoModalVisible(false);
    setIsSelectionMode(false);
    setSelectedProductsForPromo([]);
  };

  // --- LÓGICA DE FORMULARIO (CRUD) ---
  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormModalVisible(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setIsFormModalVisible(true);
  };

  const saveProduct = (productData) => {
    if (editingProduct) {
      // Editar
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      // Crear (Generamos un ID falso)
      const newProduct = { ...productData, id: Date.now().toString() };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsFormModalVisible(false);
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setIsFormModalVisible(false);
  };

  return {
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    categories, filteredProducts,
    isSelectionMode, setIsSelectionMode,
    selectedProductsForPromo, toggleProductForPromo,
    isPromoModalVisible, setIsPromoModalVisible, generateWhatsAppPromo,
    isFormModalVisible, setIsFormModalVisible, editingProduct, openAddForm, openEditForm, saveProduct, deleteProduct
  };
};