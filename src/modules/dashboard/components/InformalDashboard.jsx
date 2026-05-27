import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import styles from './styles/InformalDashboard.styles';

// Importación local para extraer los datos del usuario logueado
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import { useLowStock } from '../hooks/useLowStock';
import inventoryService from '../../inventory/services/inventoryService';

const InformalDashboard = () => {
  // Control de visibilidad para las ventanas de registro rápido
  const [modalGasto, setModalGasto] = useState(false);
  const [modalFiado, setModalFiado] = useState(false);
  const [modalProducto, setModalProducto] = useState(false);

  // Estados para el formulario de Nuevo Producto
  const [newProductName, setNewProductName] = useState('');
  const [newProductQty, setNewProductQty] = useState('');
  const [newProductMinStock, setNewProductMinStock] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');

  // Estado de inventario crítico desde Supabase
  const { lowStockProducts, okProducts, loading: stockLoading, error: stockError, refresh: refreshStock } = useLowStock();

  // Estado del RefreshControl
  const [refreshing, setRefreshing] = useState(false);

  // Categorías del usuario
  const [userCategories, setUserCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);
  const userName = user?.name || 'Comerciante';

  const resolveBusinessId = useCallback(() =>
    businessData?.id ||
    businessData?.business_id ||
    user?.business_id ||
    user?.businessId ||
    null,
  [businessData, user]);

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
      if (data.length > 0 && !newProductCategory) {
        setNewProductCategory(data[0].name);
      }
    } catch (err) {
      console.error('Error cargando categorías en dashboard:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [resolveBusinessId, newProductCategory]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshStock();
    await loadCategories();
    setRefreshing(false);
  }, [refreshStock, loadCategories]);

  // Toggle para mostrar/ocultar la lista de productos OK
  const [showOkProducts, setShowOkProducts] = useState(false);

  const resetProductForm = () => {
    setNewProductName('');
    setNewProductQty('');
    setNewProductMinStock('');
    setNewProductPrice('');
    if (userCategories.length > 0) {
      setNewProductCategory(userCategories[0].name);
    } else {
      setNewProductCategory('');
    }
  };

  const openProductModal = () => {
    resetProductForm();
    setModalProducto(true);
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      
      {/* SECCIÓN DE BIENVENIDA */}
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>Tu negocio está creciendo hoy.</Text>
        </View>
      </View>

      {/* METRICAS PRINCIPALES */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardHeader}>
          <Text style={styles.mainCardTitle}>Ventas del Día</Text>
          <View style={styles.badgeSuccess}>
            <Ionicons name="trending-up" size={14} color={colors.textSuccess} />
            <Text style={styles.badgeText}>+12%</Text>
          </View>
        </View>
        <Text style={styles.mainCardAmount}>$145.50</Text>
        <Text style={styles.mainCardSubtext}>Dinero total recibido en caja hoy</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={[styles.gridCard, { marginRight: 8 }]}>
          <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="card" size={20} color={colors.danger} />
          </View>
          <Text style={styles.gridCardLabel}>Por Cobrar (Fiado)</Text>
          <Text style={[styles.gridCardValue, { color: colors.danger }]}>$68.00</Text>
        </View>

        <View style={[styles.gridCard, { marginLeft: 8 }]}>
          <View style={[styles.iconBadge, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={20} color={colors.info} />
          </View>
          <Text style={styles.gridCardLabel}>Clientes Fiados</Text>
          <Text style={styles.gridCardValue}>4 personas</Text>
        </View>
      </View>

      {/* ACCIONES RÁPIDAS REESTRUCTURADAS */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.actionsContainer}>
        
        {/* BOTÓN GASTOS */}
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => setModalGasto(true)}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="calculator" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Registrar Gasto</Text>
        </TouchableOpacity>

        {/* BOTÓN ANOTAR FIADO */}
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => setModalFiado(true)}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="bookmark" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Anotar Fiado</Text>
        </TouchableOpacity>

        {/* BOTÓN REGISTRAR PRODUCTO */}
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={openProductModal}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="cube" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Nuevo Producto</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN HISTORIAL DE ACTIVIDADES RECIENTES */}
      <Text style={styles.sectionTitle}>Actividades Recientes</Text>
      <View style={styles.activityCard}>
        
        {/* FILA 1: VENTA */}
        <View style={styles.activityRow}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="basket" size={18} color={colors.success} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Venta rápida al contado</Text>
              <Text style={styles.activityTime}>Hace 10 minutos • Caja General</Text>
            </View>
          </View>
          <Text style={[styles.activityAmount, { color: colors.textSuccess }]}>+$12.50</Text>
        </View>

        <View style={styles.divider} />

        {/* FILA 2: GASTO */}
        <View style={styles.activityRow}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trending-down" size={18} color={colors.danger} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Compra de Mercancía</Text>
              <Text style={styles.activityTime}>Hace 1 hora • Proveedor El Machetazo</Text>
            </View>
          </View>
          <Text style={[styles.activityAmount, { color: colors.textError }]}>-$45.00</Text>
        </View>

        <View style={styles.divider} />

        {/* FILA 3: CRÉDITO FIADO */}
        <View style={styles.activityRow}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bookmark" size={18} color={colors.info} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Fiado a Carlos Alvarado</Text>
              <Text style={styles.activityTime}>Hace 3 horas • Saldo pendiente</Text>
            </View>
          </View>
          <Text style={[styles.activityAmount, { color: colors.textPrimary }]}>$18.00</Text>
        </View>
      </View>

      {/* ── SECCIÓN DE INVENTARIO CRÍTICO (datos reales de Supabase) ── */}
      <Text style={styles.sectionTitle}>Estado del Inventario</Text>

      {/* Estado: Cargando */}
      {stockLoading && (
        <View style={styles.stockLoadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stockLoadingText}>Verificando niveles de stock...</Text>
        </View>
      )}

      {/* Estado: Error */}
      {!stockLoading && stockError && (
        <View style={[styles.stockSection, { borderColor: colors.border }]}>
          <View style={styles.stockSectionHeader}>
            <Ionicons name="warning-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.stockSectionTitle, { color: colors.textMuted }]}>{stockError}</Text>
            <TouchableOpacity style={styles.stockRefreshBtn} onPress={refreshStock}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Estado: Sin datos (negocio sin inventario aún) */}
      {!stockLoading && !stockError && lowStockProducts.length === 0 && okProducts.length === 0 && (
        <View style={[styles.stockSection, { borderColor: colors.border }]}>
          <View style={[styles.stockSectionHeader, { backgroundColor: colors.cardSecondary }]}>
            <Ionicons name="cube-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.stockSectionTitle, { color: colors.textMuted }]}>
              Aún no tienes productos en tu inventario.
            </Text>
          </View>
        </View>
      )}

      {/* ── BLOQUE ROJO/ÁMBAR: Productos con stock bajo ── */}
      {!stockLoading && lowStockProducts.length > 0 && (
        <View style={[styles.stockSection, { borderColor: colors.warning }]}>
          {/* Encabezado */}
          <View style={[styles.stockSectionHeader, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="alert-circle" size={18} color={colors.warning} />
            <Text style={[styles.stockSectionTitle, { color: '#92400E' }]}>
              Stock bajo
            </Text>
            <Text style={[styles.stockSectionCount, { backgroundColor: '#FDE68A', color: '#78350F' }]}>
              {lowStockProducts.length}
            </Text>
            <TouchableOpacity style={styles.stockRefreshBtn} onPress={refreshStock}>
              <Ionicons name="refresh-outline" size={14} color="#92400E" />
            </TouchableOpacity>
          </View>

          {/* Fila por cada producto bajo */}
          {lowStockProducts.map((item) => (
            <View key={item.id} style={styles.stockProductRow}>
              <View style={[styles.stockProductDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.stockProductName} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.stockProductQty, { color: colors.danger }]}>
                {item.stock !== null ? item.stock : '∞'}
              </Text>
              <Text style={styles.stockProductMin}>
                / mín {item.minStock} {item.unit || 'u.'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ── BLOQUE VERDE: Productos con stock suficiente ── */}
      {!stockLoading && okProducts.length > 0 && (
        <View style={[styles.stockSection, { borderColor: colors.successBorder }]}>
          {/* Encabezado — toca para expandir/colapsar */}
          <TouchableOpacity
            style={[styles.stockSectionHeader, { backgroundColor: colors.successLight }]}
            onPress={() => setShowOkProducts((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.stockSectionTitle, { color: colors.successDark }]}>
              Stock suficiente
            </Text>
            <Text style={[styles.stockSectionCount, { backgroundColor: colors.successBorder, color: colors.successDark }]}>
              {okProducts.length}
            </Text>
            <Ionicons
              name={showOkProducts ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.successDark}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>

          {/* Lista colapsable */}
          {showOkProducts && okProducts.map((item) => (
            <View key={item.id} style={styles.stockProductRow}>
              <View style={[styles.stockProductDot, { backgroundColor: colors.success }]} />
              <Text style={styles.stockProductName} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.stockProductQty, { color: colors.success }]}>
                {item.stock !== null ? item.stock : '∞'}
              </Text>
              {item.minStock > 0 && (
                <Text style={styles.stockProductMin}>
                  / mín {item.minStock} {item.unit || 'u.'}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}


      {/* VENTANA EMERGENTE: REGISTRAR GASTO */}
      <Modal visible={modalGasto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Gasto Directo</Text>
              <TouchableOpacity onPress={() => setModalGasto(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción del gasto</Text>
              <TextInput style={styles.inputField} placeholder="Ej. Bolsas plásticas, Hielo..." placeholderTextColor={colors.placeholder} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto ($ USD)</Text>
              <TextInput style={styles.inputField} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.placeholder} />
            </View>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={() => setModalGasto(false)}>
              <Text style={styles.submitButtonText}>Guardar Gasto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VENTANA EMERGENTE: ANOTAR FIADO */}
      <Modal visible={modalFiado} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Anotar Cuenta de Fiado</Text>
              <TouchableOpacity onPress={() => setModalFiado(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Cliente</Text>
              <TextInput style={styles.inputField} placeholder="Ej. Vecina María" placeholderTextColor={colors.placeholder} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto Fiado ($ USD)</Text>
              <TextInput style={styles.inputField} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.placeholder} />
            </View>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={() => setModalFiado(false)}>
              <Text style={styles.submitButtonText}>Confirmar Registro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VENTANA EMERGENTE: NUEVO PRODUCTO */}
      <Modal visible={modalProducto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar al Inventario</Text>
              <TouchableOpacity onPress={() => setModalProducto(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del producto</Text>
              <TextInput 
                style={styles.inputField} 
                placeholder="Ej. Malta Vigor" 
                placeholderTextColor={colors.placeholder} 
                value={newProductName}
                onChangeText={setNewProductName}
              />
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Cantidad Inicial</Text>
                <TextInput 
                  style={styles.inputField} 
                  keyboardType="numeric" 
                  placeholder="10" 
                  placeholderTextColor={colors.placeholder} 
                  value={newProductQty}
                  onChangeText={setNewProductQty}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Stock mínimo</Text>
                <TextInput 
                  style={styles.inputField} 
                  keyboardType="numeric" 
                  placeholder="Ej. 5" 
                  placeholderTextColor={colors.placeholder} 
                  value={newProductMinStock}
                  onChangeText={setNewProductMinStock}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio ($ USD)</Text>
              <TextInput 
                style={styles.inputField} 
                keyboardType="numeric" 
                placeholder="0.00" 
                placeholderTextColor={colors.placeholder} 
                value={newProductPrice}
                onChangeText={setNewProductPrice}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría</Text>
              {categoriesLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
              ) : userCategories.length === 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                  No tienes categorías asociadas a tu cuenta.
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 8 }}>
                  {userCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id || cat.name}
                      style={[
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 20,
                          backgroundColor: newProductCategory === cat.name ? colors.primary : colors.background,
                          borderWidth: 1,
                          borderColor: newProductCategory === cat.name ? colors.primary : colors.border,
                        }
                      ]}
                      onPress={() => setNewProductCategory(cat.name)}
                    >
                      <Text style={{
                        fontSize: 13,
                        color: newProductCategory === cat.name ? '#FFF' : colors.textSecondary,
                        fontWeight: newProductCategory === cat.name ? 'bold' : 'normal'
                      }}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={() => {
              // Aquí iría la lógica para guardar el producto.
              // Por ahora solo cerramos el modal.
              setModalProducto(false);
            }}>
              <Text style={styles.submitButtonText}>Registrar Artículo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default InformalDashboard;