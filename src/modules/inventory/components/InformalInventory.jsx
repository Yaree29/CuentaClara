import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { MagnifyingGlassIcon, MegaphoneIcon, PencilIcon, CheckCircleIcon, PlusIcon } from 'react-native-heroicons/solid';
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
    filteredProducts,
    isSelectionMode, setIsSelectionMode,
    selectedProductsForPromo, setSelectedProductsForPromo, toggleProductForPromo,
    isPromoModalVisible, setIsPromoModalVisible,
    generateWhatsAppPromo,

    isFormModalVisible, setIsFormModalVisible, editingProduct, openAddForm, openEditForm, saveProduct, deleteProduct
  } = useInformalInventory();

  // Renderiza cada producto del catálogo
  const renderProduct = ({ item }) => {
    const isSelected = selectedProductsForPromo.some(p => p.id === item.id);

    return (
      <TouchableOpacity 
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        activeOpacity={0.8}
        onPress={() => isSelectionMode ? toggleProductForPromo(item) : null}
      >
        {/* Indicador visual de selección para publicidad */}
        {isSelectionMode && (
          <CheckCircleIcon size={24} color={isSelected ? colors.primary : colors.border} />
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          {/* Ocultamos la etiqueta de stock si el producto es un servicio infinito */}
          {item.stock !== null && (
            <Text style={styles.productStock}>Disp: {item.stock} unidades</Text>
          )}
        </View>

        {/* Si NO estamos en modo selección, mostramos el botón de editar */}
        {!isSelectionMode && (
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditForm(item)}>
            <PencilIcon size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

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
          
          {/* Botón que activa el modo de selección para publicidad */}
          <TouchableOpacity 
            style={[styles.promoBtn, isSelectionMode && styles.promoBtnActive]}
            onPress={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode && setSelectedProductsForPromo) {
                setSelectedProductsForPromo([]);
              }
            }}
          >
            <MegaphoneIcon size={20} color={isSelectionMode ? '#FFF' : colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Scroll Horizontal de Categorías dinámicas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
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
        </ScrollView>
      </View>

      {/* SECCIÓN LISTA DE PRODUCTOS */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* BOTÓN FLOTANTE: Aparece solo si hay artículos seleccionados para la publicidad */}
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

      {/* BOTÓN FLOTANTE: Para agregar producto*/}
      {!isSelectionMode && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabButton} onPress={openAddForm}>
            <PlusIcon size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL DE GENERACIÓN DE WHATSAPP */}
      <PromoGeneratorModal 
        visible={isPromoModalVisible}
        onClose={() => setIsPromoModalVisible(false)}
        selectedProducts={selectedProductsForPromo}
        onGenerate={(msg) => {
          if (generateWhatsAppPromo) generateWhatsAppPromo(msg);
          setIsPromoModalVisible(false);
          setIsSelectionMode(false);
          if (setSelectedProductsForPromo) setSelectedProductsForPromo([]);
        }}
      />

      {/* MODAL DE FORMULARIO DE PRODUCTO (Agregar / Editar) */}
      <ProductFormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        initialData={editingProduct}
        onSave={(data) => {
          if (saveProduct) saveProduct(data);
          setIsFormModalVisible(false);
        }}
        onDelete={(id) => {
          if (deleteProduct) deleteProduct(id);
          setIsFormModalVisible(false);
        }}
      />
    </View>
  );
};

export default InformalInventory;