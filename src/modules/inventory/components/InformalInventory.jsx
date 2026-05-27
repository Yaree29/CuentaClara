import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
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
    selectedProductsForPromo, toggleProductForPromo,
    isPromoModalVisible, setIsPromoModalVisible,
    generateWhatsAppPromo,
    isFormModalVisible, setIsFormModalVisible, editingProduct, openAddForm, openEditForm, saveProduct, deleteProduct,
    loading, error, refreshInventory,
    addCategory,
    isAddCategoryModalVisible, setIsAddCategoryModalVisible,
    categoriesLoading,
  } = useInformalInventory();


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
          <CheckCircleIcon size={24} color={isSelected ? colors.primary : colors.border} />
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

          {/* Botón modo selección para publicidad */}
          <TouchableOpacity
            style={[styles.promoBtn, isSelectionMode && styles.promoBtnActive]}
            onPress={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedProductsForPromo([]);
            }}
          >
            <MegaphoneIcon size={20} color={isSelectionMode ? '#FFF' : colors.primary} />
          </TouchableOpacity>
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={loading}
        onRefresh={refreshInventory}
      />

      {/* FAB: Modo selección → botón generar promo */}
      {isSelectionMode && selectedProductsForPromo.length > 0 && (
        <View style={styles.bottomFloatContainer}>
          <TouchableOpacity
            style={styles.generatePromoBtn}
            onPress={() => setIsPromoModalVisible(true)}
          >
            <MegaphoneIcon size={20} color="#FFF" />
            <Text style={styles.generatePromoBtnText}>
              Crear Promo ({selectedProductsForPromo.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB: Modo normal → agregar producto */}
      {!isSelectionMode && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabButton} onPress={openAddForm}>
            <PlusIcon size={28} color="#FFF" />
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