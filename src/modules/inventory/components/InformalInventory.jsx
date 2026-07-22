import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PencilIcon,
  CheckCircleIcon,
  PlusIcon,
} from 'react-native-heroicons/solid';
import { useInformalInventory } from '../hooks/useInformalInventory';
import PromoGeneratorModal from './PromoGeneratorModal';
import ProductFormModal from './ProductFormModal';
import styles from '../styles/informalInventory.styles';
import colors from '../../../theme/colors';

const InformalInventory = () => {
  const {
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    categories,
    productCategories,
    filteredProducts,
    isSelectionMode, setIsSelectionMode,
    selectedProductsForPromo, setSelectedProductsForPromo, toggleProductForPromo,
    isPromoModalVisible, setIsPromoModalVisible,
    generateWhatsAppPromo,
    isFormModalVisible, setIsFormModalVisible, editingProduct, openAddForm, openEditForm, saveProduct, deleteProduct,
    loading, error, refreshInventory,
    addCategory,
    isAddCategoryModalVisible, setIsAddCategoryModalVisible,
    categoriesLoading,
  } = useInformalInventory();

  // Shortcut "Nuevo Producto" del dashboard: navega acá con openAddProduct=true
  // y abre directo el formulario de crear producto. Se limpia el param en el
  // mismo tick para que no se re-abra si el usuario cierra el modal y vuelve.
  const navigation = useNavigation();
  const route = useRoute();
  useEffect(() => {
    if (route.params?.openAddProduct) {
      openAddForm();
      navigation.setParams({ openAddProduct: undefined });
    }
  }, [route.params?.openAddProduct, navigation, openAddForm]);

  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const fabAnimation = React.useRef(new Animated.Value(0)).current;

  const toggleFabMenu = () => {
    if (!isFabMenuOpen) {
      Animated.spring(fabAnimation, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }).start();
      setIsFabMenuOpen(true);
    } else {
      Animated.spring(fabAnimation, {
        toValue: 0,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }).start();
      setIsFabMenuOpen(false);
    }
  };

  const fabRotation = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const fabMenuTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0]
  });

  const fabMenuOpacity = fabAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });


  // Estado local solo para el input del modal de nueva categoría
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addCatLoading, setAddCatLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  /** Solo letras (con tildes y ñ) y espacios — sin números ni símbolos */
  const CATEGORY_VALID = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  const handleCategoryNameChange = (val) => {
    setNewCategoryName(val);
    if (val.trim() === '') {
      setCategoryError(null);
      return;
    }
    if (!CATEGORY_VALID.test(val)) {
      setCategoryError('Solo se permiten letras y espacios. Sin números ni símbolos.');
    } else if (val.trim().length < 2) {
      setCategoryError('El nombre debe tener al menos 2 letras.');
    } else {
      setCategoryError(null);
    }
  };

  // ─── Estado vacío / carga / error ──────────────────────────────────────────
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Cargando catálogo...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.danger, textAlign: 'center', fontWeight: 'bold' }}>{error}</Text>
          <TouchableOpacity
            style={[styles.categoryPill, { marginTop: 12, alignSelf: 'center' }]}
            onPress={refreshInventory}
          >
            <Text style={styles.categoryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
          No tienes productos en tu catálogo. ¡Agrega uno nuevo pulsando el botón + abajo!
        </Text>
      </View>
    );
  };

  // ─── Tarjeta de producto ────────────────────────────────────────────────────
  const renderProduct = ({ item }) => {
    const isSelected = selectedProductsForPromo.some((p) => p.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        activeOpacity={0.8}
        onPress={() => (isSelectionMode ? toggleProductForPromo(item) : null)}
      >
        {/* Indicador visual de selección para publicidad */}
        {isSelectionMode && (
          <View style={{ marginRight: 12, justifyContent: 'center' }}>
            {isSelected ? (
              <CheckCircleIcon size={26} color={colors.primary} />
            ) : (
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border }} />
            )}
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          {/* Stock — null significa servicio ilimitado */}
          {item.stock !== null && (
            <Text
              style={[
                styles.productStock,
                item.minStock > 0 && item.stock <= item.minStock && { color: colors.danger },
              ]}
            >
              Disp: {item.stock} unidades
              {item.minStock > 0 && item.stock <= item.minStock ? '  ⚠️ Stock bajo' : ''}
            </Text>
          )}
          {item.category ? (
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
              {item.category}
            </Text>
          ) : null}
        </View>

        {/* Botón de editar (solo fuera del modo selección) */}
        {!isSelectionMode && (
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditForm(item)}>
            <PencilIcon size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // ─── Handler para confirmar nueva categoría ─────────────────────────────────
  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    // Validación final antes de guardar
    if (!CATEGORY_VALID.test(trimmed)) {
      setCategoryError('Solo se permiten letras y espacios. Sin números ni símbolos.');
      return;
    }
    if (trimmed.length < 2) {
      setCategoryError('El nombre debe tener al menos 2 letras.');
      return;
    }

    setAddCatLoading(true);
    await addCategory(trimmed);
    setAddCatLoading(false);
    setNewCategoryName('');
    setCategoryError(null);
    setIsAddCategoryModalVisible(false);
  };

  // ─── Render principal ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* SECCIÓN CABECERA: Buscador y Filtros */}
      <View style={styles.headerWrapper}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MagnifyingGlassIcon size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en mi catálogo..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Scroll horizontal de categorías + botón para agregar nueva */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {/* Botón "Todas" */}
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botón especial: Agregar nueva categoría */}
          <TouchableOpacity
            style={styles.categoryPillAdd}
            onPress={() => {
              setNewCategoryName('');
              setIsAddCategoryModalVisible(true);
            }}
          >
            <PlusIcon size={13} color={colors.primary} />
            <Text style={styles.categoryPillAddText}>Nueva</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* LISTA DE PRODUCTOS */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        // El spinner del RefreshControl solo para pull-to-refresh (cuando ya
        // hay productos en pantalla). En la carga inicial la lista está vacía
        // y el indicador lo pone ListEmptyComponent: si ambos usaran `loading`
        // a secas, se verían dos spinners al entrar.
        refreshing={loading && filteredProducts.length > 0}
        onRefresh={refreshInventory}
      />

      {/* Botones inferiores: Modo Selección */}
      {isSelectionMode && (
        <View style={[styles.bottomFloatContainer, { flexDirection: 'row', gap: 12 }]}>
          <TouchableOpacity
            style={[styles.generatePromoBtn, { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => {
              setIsSelectionMode(false);
              setSelectedProductsForPromo([]);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.generatePromoBtnText, { color: colors.textSecondary, marginLeft: 0 }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.generatePromoBtn, { flex: 1.5, opacity: selectedProductsForPromo.length > 0 ? 1 : 0.5 }]}
            onPress={() => {
              if (selectedProductsForPromo.length > 0) {
                setIsPromoModalVisible(true);
              }
            }}
            activeOpacity={0.8}
          >
            {selectedProductsForPromo.length > 0 && (
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>{selectedProductsForPromo.length}</Text>
              </View>
            )}
            <Text style={[styles.generatePromoBtnText, { marginLeft: selectedProductsForPromo.length > 0 ? 12 : 0 }]}>
              Promocionar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Backdrop for FAB Menu */}
      <TouchableWithoutFeedback 
        onPress={() => {
          if (isFabMenuOpen) toggleFabMenu();
        }}
      >
        <Animated.View 
          style={[
            styles.fabBackdrop, 
            { 
              opacity: fabMenuOpacity,
              pointerEvents: isFabMenuOpen ? 'auto' : 'none'
            }
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* FAB: Menú para agregar / promocionar */}
      {!isSelectionMode && (
        <View style={styles.fabContainer}>
          <Animated.View 
            style={[
              styles.fabMenu, 
              { 
                opacity: fabMenuOpacity, 
                transform: [{ translateY: fabMenuTranslateY }],
                pointerEvents: isFabMenuOpen ? 'auto' : 'none'
              }
            ]}
          >
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                toggleFabMenu();
                setIsSelectionMode(true);
              }}
            >
              <Text style={styles.fabMenuLabel}>Promocionar productos</Text>
              <View style={[styles.fabMenuButton, { backgroundColor: colors.primary }]}>
                <MegaphoneIcon size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                toggleFabMenu();
                openAddForm();
              }}
            >
              <Text style={styles.fabMenuLabel}>Agregar producto</Text>
              <View style={[styles.fabMenuButton, { backgroundColor: colors.success || '#2ecc71' }]}>
                <PlusIcon size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity 
            style={styles.fabButton} 
            activeOpacity={0.8}
            onPress={toggleFabMenu}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
              <PlusIcon size={28} color="#FFF" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL: Generador de promo WhatsApp */}
      <PromoGeneratorModal
        visible={isPromoModalVisible}
        onClose={() => setIsPromoModalVisible(false)}
        selectedProducts={selectedProductsForPromo}
        onGenerate={(msg) => {
          if (generateWhatsAppPromo) generateWhatsAppPromo(msg);
          setIsPromoModalVisible(false);
          setIsSelectionMode(false);
          setSelectedProductsForPromo([]);
        }}
      />

      {/* MODAL: Formulario de producto (Agregar / Editar) */}
      <ProductFormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        initialData={editingProduct}
        categories={productCategories}
        onSave={(data) => {
          if (saveProduct) saveProduct(data);
        }}
        onDelete={(id) => {
          if (deleteProduct) deleteProduct(id);
        }}
      />

      {/* MODAL: Agregar nueva categoría */}
      <Modal
        visible={isAddCategoryModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setIsAddCategoryModalVisible(false);
          setCategoryError(null);
        }}
      >
        <View style={styles.addCatOverlay}>
          <View style={styles.addCatCard}>
            <Text style={styles.addCatTitle}>Nueva Categoría</Text>

            <TextInput
              style={[styles.addCatInput, categoryError && styles.inputError]}
              placeholder="Ej. Frutas, Tecnología, Ropa..."
              placeholderTextColor={colors.placeholder}
              value={newCategoryName}
              onChangeText={handleCategoryNameChange}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddCategory}
            />
            {categoryError ? (
              <Text style={[styles.errorText, { marginTop: 6 }]}>{categoryError}</Text>
            ) : null}

            <View style={styles.addCatActions}>
              <TouchableOpacity
                style={styles.addCatCancelBtn}
                onPress={() => {
                  setIsAddCategoryModalVisible(false);
                  setCategoryError(null);
                }}
              >
                <Text style={styles.addCatCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addCatConfirmBtn,
                  (!newCategoryName.trim() || addCatLoading || !!categoryError) && { opacity: 0.5 },
                ]}
                onPress={handleAddCategory}
                disabled={!newCategoryName.trim() || addCatLoading || !!categoryError}
              >
                {addCatLoading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={styles.addCatConfirmText}>Guardar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InformalInventory;
