// =============================================================================
// PymeInventory.jsx
// -----------------------------------------------------------------------------
// Fusionado desde pymeEdgar/pyme/inventory/screens/PymeInventoryScreen.jsx.
// Se mantiene este nombre de archivo (no PymeInventoryScreen) porque ya está
// referenciado en MainNavigator.jsx (tab "assistantInventory" del Modo
// Asistente) y en ModulesScreen.jsx (navigation.navigate('PymeInventory')).
//
// MODIFICADO: agrega el CRUD de productos que faltaba por completo en esta
// pantalla (antes solo existía en InformalInventory.jsx, inalcanzable para
// PYME) reutilizando ProductFormModal.jsx tal cual. También conecta "Mermas"
// (POST /inventory/stock/adjust reason=waste) y "Caducidad" (columna real
// products.expiration_date) a accesos funcionales en vez de placeholders.
// =============================================================================
import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PlusIcon, PencilIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import InventoryAlertWidget from './InventoryAlertWidget';
import ProductScannerWidget from './ProductScannerWidget';
import ProductFormModal from './ProductFormModal';
import inventoryService from '../services/inventoryService';
import useInventoryConfig from '../hooks/useInventoryConfig';
import styles from '../styles/pymeInventory.styles';
import profileStyles from '../../profile/styles/profile.styles';

// "Recetas" y "Producción" ya no tienen tarjeta placeholder aquí: son
// redundantes con el módulo real de Recetas (Módulos → Recetas,
// RecipesScreen.jsx), que ya cubre esa función por completo — mostrarlas acá
// también solo duplicaba la entrada sin aportar nada. "caducidad"/"mermas"/
// "escaner"/"stock_predictivo"/"control_peso" tampoco viven aquí: todas
// tienen su propio acceso funcional real más abajo en esta pantalla.
const PREDICTIVE_THRESHOLD_DAYS = 7;

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const daysUntil = (isoDate) => {
    const target = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
};

// ─── Modal "Registrar Merma" — producto + cantidad + motivo → stock/adjust ──

const WasteModal = ({ visible, onClose, products, onRegistered }) => {
    const [productId, setProductId] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [quantityError, setQuantityError] = useState(null);
    const [saving, setSaving] = useState(false);

    const reset = () => {
        setProductId(null);
        setQuantity('');
        setNotes('');
        setQuantityError(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSave = async () => {
        if (!productId) {
            Alert.alert('Selecciona un producto', 'Elige a qué producto pertenece la merma.');
            return;
        }
        const qty = parseFloat(quantity);
        if (!quantity || Number.isNaN(qty) || qty <= 0) {
            setQuantityError('La cantidad debe ser mayor a 0.');
            return;
        }
        setQuantityError(null);
        setSaving(true);
        try {
            await inventoryService.adjustStock({
                productId,
                quantity: qty,
                reason: 'waste',
                notes: notes.trim() || null,
            });
            reset();
            onRegistered();
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo registrar la merma.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.modalTitle}>Registrar Merma</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Producto *</Text>
                            {products.length === 0 ? (
                                <Text style={styles.emptyText}>No tienes productos registrados todavía.</Text>
                            ) : (
                                <View style={styles.productChipRow}>
                                    {products.map((p) => (
                                        <TouchableOpacity
                                            key={p.id}
                                            style={[styles.productChip, productId === p.id && styles.productChipActive]}
                                            onPress={() => setProductId(p.id)}
                                        >
                                            <Text
                                                style={[styles.productChipText, productId === p.id && styles.productChipTextActive]}
                                            >
                                                {p.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Cantidad perdida *</Text>
                            <TextInput
                                style={[styles.formInput, quantityError && styles.inputError]}
                                value={quantity}
                                onChangeText={(val) => {
                                    setQuantity(val.replace(/[^0-9.]/g, ''));
                                    setQuantityError(null);
                                }}
                                keyboardType="decimal-pad"
                                placeholder="0"
                                placeholderTextColor={colors.placeholder}
                            />
                            {quantityError ? <Text style={styles.errorText}>{quantityError}</Text> : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Motivo (opcional)</Text>
                            <TextInput
                                style={styles.formInput}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Ej. Producto vencido, dañado en bodega..."
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, (saving || products.length === 0) && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving || products.length === 0}
                        >
                            {saving ? (
                                <ActivityIndicator color={colors.textButton} />
                            ) : (
                                <Text style={styles.saveBtnText}>Registrar merma</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const PymeInventory = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { config, loading: loadingConfig } = useInventoryConfig();

    const [alerts, setAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [predictiveStock, setPredictiveStock] = useState([]);
    const [loadingPredictive, setLoadingPredictive] = useState(true);

    const [formModalVisible, setFormModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [wasteModalVisible, setWasteModalVisible] = useState(false);
    // Código leído por el escáner cuando el producto no existía — se pasa a
    // ProductFormModal para prellenar el campo Código de barras al crearlo.
    const [prefillBarcode, setPrefillBarcode] = useState(null);

    // Buscador (mismo patrón que useInformalInventory: filtra por nombre/SKU).
    const [searchQuery, setSearchQuery] = useState('');

    // Modal "Agregar categoría" (reutiliza inventoryService.createCategory, el
    // mismo servicio que usa useInformalInventory.addCategory).
    const [addCategoryVisible, setAddCategoryVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState(null);
    const [savingCategory, setSavingCategory] = useState(false);

    const fetchAlerts = useCallback(async () => {
        try {
            const data = await inventoryService.lowStockAlerts();
            setAlerts(Array.isArray(data) ? data : []);
        } catch (error) {
            setAlerts([]);
        } finally {
            setLoadingAlerts(false);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const data = await inventoryService.getProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    const fetchPredictiveStock = useCallback(async () => {
        setLoadingPredictive(true);
        try {
            const data = await inventoryService.getPredictiveStock(PREDICTIVE_THRESHOLD_DAYS);
            setPredictiveStock(Array.isArray(data) ? data : []);
        } catch (error) {
            setPredictiveStock([]);
        } finally {
            setLoadingPredictive(false);
        }
    }, []);

    // Categorías reales (mismo servicio que useInformalInventory.js) — no se
    // derivan de `products` porque una categoría recién creada sin productos
    // todavía no aparecería en esa lista.
    // Se guarda el objeto completo (id, name, color) — antes solo se guardaba
    // el nombre (categories.map(c => c.name)), así que aunque el fetch traía
    // bien la categoría nueva, el color se descartaba antes de llegar a
    // cualquier render, y además esta pantalla nunca renderizaba `categories`
    // en ningún lado visualmente (solo se pasaba como prop al picker de
    // ProductFormModal) — de ahí que nunca se vieran los chips.
    const [categoryList, setCategoryList] = useState([]);
    // Solo nombres, para el picker de ProductFormModal (espera string[]).
    const categories = useMemo(() => categoryList.map((c) => c.name), [categoryList]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await inventoryService.getCategories();
            setCategoryList(Array.isArray(data) ? data : []);
        } catch (error) {
            setCategoryList([]);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAlerts();
            fetchProducts();
            fetchCategories();
            fetchPredictiveStock();
        }, [fetchAlerts, fetchProducts, fetchCategories, fetchPredictiveStock])
    );

    const totalAlerts = alerts.length;
    // Déficit crítico: sin stock disponible (current_stock === 0).
    const itemsAtRisk = alerts.filter((alert) => alert.current_stock === 0).length;

    // Filtro por nombre o SKU (mismo criterio que useInformalInventory, más SKU
    // porque en PYME el código de barras es un dato de búsqueda relevante).
    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return products;
        return products.filter(
            (p) =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const openAddProduct = () => {
        setEditingProduct(null);
        setPrefillBarcode(null);
        setFormModalVisible(true);
    };

    // Escaneo sin coincidencia -> abrir el formulario en modo creación con el
    // código ya prellenado (flujo "buscar → si no existe, crear").
    const handleScanCreateNew = (code) => {
        setEditingProduct(null);
        setPrefillBarcode(code);
        setFormModalVisible(true);
    };

    const CATEGORY_VALID = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    const handleCategoryNameChange = (val) => {
        setNewCategoryName(val);
        if (val.trim() === '') {
            setCategoryError(null);
        } else if (!CATEGORY_VALID.test(val)) {
            setCategoryError('Solo letras y espacios. Sin números ni símbolos.');
        } else if (val.trim().length < 2) {
            setCategoryError('El nombre debe tener al menos 2 letras.');
        } else {
            setCategoryError(null);
        }
    };

    const handleAddCategory = async () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed || categoryError) return;
        setSavingCategory(true);
        try {
            const response = await inventoryService.createCategory(null, trimmed);
            if (response.alreadyExists) {
                Alert.alert('Aviso', `La categoría "${response.category.name}" ya existe.`);
            } else {
                // Recarga real desde el backend (GET /inventory/categories) — no
                // una suposición local de que el POST devolvió exactamente lo que se
                // va a leer después. `categories` es el mismo state que se pasa como
                // prop a ProductFormModal (categories={categories} en el JSX de más
                // abajo), así que en cuanto esta llamada resuelve, React re-renderiza
                // ProductFormModal con la lista ya actualizada — no hay copia vieja
                // ni prop estática de por medio.
                await fetchCategories();
            }
            setNewCategoryName('');
            setCategoryError(null);
            setAddCategoryVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo crear la categoría.');
        } finally {
            setSavingCategory(false);
        }
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);
        setFormModalVisible(true);
    };

    const closeProductForm = () => {
        setFormModalVisible(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (data) => {
        try {
            if (editingProduct) {
                await inventoryService.updateProduct(null, editingProduct.id, data);
            } else {
                await inventoryService.createProduct(null, data);
            }
            closeProductForm();
            await Promise.all([fetchProducts(), fetchAlerts(), fetchPredictiveStock()]);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo guardar el producto.');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await inventoryService.deleteProduct(null, productId);
            closeProductForm();
            await Promise.all([fetchProducts(), fetchAlerts()]);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo eliminar el producto.');
        }
    };

    const handleWasteRegistered = async () => {
        setWasteModalVisible(false);
        await Promise.all([fetchProducts(), fetchAlerts(), fetchPredictiveStock()]);
    };

    // "Productos por vencer": expiration_date real (products.expiration_date)
    // dentro de los próximos 7 días — incluye ya vencidos (días negativos).
    const expiringSoon = useMemo(() => {
        if (!config.caducidad) return [];
        return products
            .filter((p) => !!p.expirationDate)
            .map((p) => ({ ...p, daysLeft: daysUntil(p.expirationDate) }))
            .filter((p) => p.daysLeft !== null && p.daysLeft <= 7)
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [products, config.caducidad]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header con botón "atrás" */}
                <View style={profileStyles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={profileStyles.headerTitle}>Inventario</Text>
                    <View style={profileStyles.headerPlaceholder} />
                </View>

                {/* CÓDIGO MODIFICADO */}
                <ScrollView 
                    contentContainerStyle={styles.content} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <View style={styles.hero}>
                        <Text style={styles.heroKicker}>Control de stock</Text>
                        <Text style={styles.heroTitle}>Monitorea tus productos críticos en tiempo real.</Text>
                        <Text style={styles.heroSubtitle}>Alertas y catálogo conectados a tu inventario real del negocio.</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Alertas activas</Text>
                            <Text style={styles.summaryValue}>{totalAlerts}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>En riesgo</Text>
                            <Text style={styles.summaryValue}>{itemsAtRisk}</Text>
                        </View>
                    </View>

                    {loadingAlerts ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : (
                        <InventoryAlertWidget alerts={alerts} />
                    )}

                    {/* ── Tus productos (CRUD real, antes inexistente en esta pantalla) ── */}
                    <View style={styles.sectionBlock}>
                        <View style={styles.sectionRow}>
                            <Text style={styles.sectionTitle}>Tus productos ({products.length})</Text>
                        </View>

                        {/* Buscador por nombre o SKU (mismo patrón que InformalInventory). */}
                        <View style={styles.searchContainer}>
                            <MagnifyingGlassIcon size={18} color={colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar por nombre o código..."
                                placeholderTextColor={colors.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Carrusel de categorías: las existentes primero, "Agregar
                            categoría" al final como un elemento más del carrusel (antes
                            era un botón aparte encima de la lista). */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryCarousel}
                            contentContainerStyle={styles.categoryCarouselContent}
                        >
                            {categoryList.map((cat) => (
                                <View
                                    key={cat.id}
                                    style={[styles.categoryChip, { borderColor: cat.color || colors.border }]}
                                >
                                    <View style={[styles.categoryChipDot, { backgroundColor: cat.color || colors.primary }]} />
                                    <Text style={styles.categoryChipText}>{cat.name}</Text>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addCategoryPill}
                                onPress={() => {
                                    setNewCategoryName('');
                                    setCategoryError(null);
                                    setAddCategoryVisible(true);
                                }}
                            >
                                <PlusIcon size={13} color={colors.primary} />
                                <Text style={styles.addCategoryPillText}>Agregar categoría</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {loadingProducts ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : products.length === 0 ? (
                            <Text style={styles.emptyText}>Aún no tienes productos. Usa el botón "+" para agregar el primero.</Text>
                        ) : filteredProducts.length === 0 ? (
                            <Text style={styles.emptyText}>Ningún producto coincide con "{searchQuery}".</Text>
                        ) : (
                            filteredProducts.map((product) => (
                                <View key={product.id} style={styles.productListCard}>
                                    <View style={styles.productListInfo}>
                                        <Text style={styles.productListName}>{product.name}</Text>
                                        <Text style={styles.productListMeta}>
                                            {money(product.price)}
                                            {product.stock !== null ? ` · Stock ${product.stock} ${product.unit || ''}` : ' · Servicio'}
                                            {product.sku ? ` · ${product.sku}` : ''}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditProduct(product)}>
                                        <PencilIcon size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>

                    {loadingConfig ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : (
                        <>
                            {/* ── Mermas: acceso funcional real (reemplaza el placeholder) ── */}
                            {config.mermas && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.actionCard}>
                                        <View style={styles.actionCardText}>
                                            <Text style={styles.actionCardTitle}>Mermas</Text>
                                            <Text style={styles.actionCardDescription}>Registra pérdidas o desperdicio de inventario.</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.actionCardButton}
                                            onPress={() => setWasteModalVisible(true)}
                                        >
                                            <Text style={styles.actionCardButtonText}>Registrar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* ── Caducidad: "Productos por vencer" real (reemplaza el placeholder) ── */}
                            {config.caducidad && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionRow}>
                                        <Text style={styles.sectionTitle}>Productos por vencer</Text>
                                    </View>
                                    <View style={styles.expiringCard}>
                                        {expiringSoon.length === 0 ? (
                                            <Text style={styles.emptyText}>Ningún producto vence en los próximos 7 días.</Text>
                                        ) : (
                                            expiringSoon.map((product, index) => (
                                                <View
                                                    key={product.id}
                                                    style={[styles.expiringRow, index === expiringSoon.length - 1 && styles.expiringRowLast]}
                                                >
                                                    <Text style={styles.expiringName}>{product.name}</Text>
                                                    <Text
                                                        style={[
                                                            styles.expiringDate,
                                                            product.daysLeft < 0 ? styles.expiringDateDanger : styles.expiringDateWarning,
                                                        ]}
                                                    >
                                                        {product.daysLeft < 0
                                                            ? `Venció hace ${Math.abs(product.daysLeft)} d`
                                                            : product.daysLeft === 0
                                                                ? 'Vence hoy'
                                                                : `Vence en ${product.daysLeft} d`}
                                                    </Text>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* ── Stock predictivo: días estimados hasta quiebre (reemplaza el placeholder) ── */}
                            {config.stock_predictivo && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionRow}>
                                        <Text style={styles.sectionTitle}>Stock predictivo</Text>
                                    </View>
                                    {loadingPredictive ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color={colors.primary} />
                                        </View>
                                    ) : (
                                        <View style={styles.expiringCard}>
                                            {predictiveStock.length === 0 ? (
                                                <Text style={styles.emptyText}>
                                                    Ningún producto se quedará sin stock en los próximos {PREDICTIVE_THRESHOLD_DAYS} días.
                                                </Text>
                                            ) : (
                                                predictiveStock.map((item, index) => (
                                                    <View
                                                        key={item.product_id}
                                                        style={[styles.expiringRow, index === predictiveStock.length - 1 && styles.expiringRowLast]}
                                                    >
                                                        <Text style={styles.expiringName}>{item.product_name}</Text>
                                                        <Text
                                                            style={[
                                                                styles.expiringDate,
                                                                item.estimated_days <= 2 ? styles.expiringDateDanger : styles.expiringDateWarning,
                                                            ]}
                                                        >
                                                            {item.estimated_days === 0
                                                                ? 'Se agota hoy'
                                                                : `~${item.estimated_days} d restantes`}
                                                        </Text>
                                                    </View>
                                                ))
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}

                            {config.escaner && <ProductScannerWidget onCreateNew={handleScanCreateNew} />}
                        </>
                    )}
                </ScrollView>

                {/* bottom: 24 + insets.bottom — esta pantalla usa SafeAreaView
                    edges={['top']} (sin 'bottom'), así que sin sumar el inset real el
                    FAB se medía desde el borde absoluto de la pantalla, ignorando la
                    barra de navegación del sistema en Android (gestual o de 3 botones)
                    y quedando tapado/apretado contra ella. */}
                <View style={[styles.fabContainer, { bottom: 24 + insets.bottom }]}>
                    <TouchableOpacity style={styles.fabButton} activeOpacity={0.85} onPress={openAddProduct}>
                        <PlusIcon size={26} color={colors.textWhite} />
                    </TouchableOpacity>
                </View>

                <ProductFormModal
                    visible={formModalVisible}
                    onClose={closeProductForm}
                    initialData={editingProduct}
                    categories={categories}
                    showExpiration={!!config.caducidad}
                    prefillBarcode={prefillBarcode}
                    showWeightControl={!!config.control_peso}
                    showIngredientOnlyToggle={!!(config.recetas || config.produccion)}
                    onSave={handleSaveProduct}
                    onDelete={handleDeleteProduct}
                />

                <WasteModal
                    visible={wasteModalVisible}
                    onClose={() => setWasteModalVisible(false)}
                    products={products}
                    onRegistered={handleWasteRegistered}
                />

                {/* Modal "Agregar categoría" — mismo patrón visual que InformalInventory. */}
                <Modal
                    visible={addCategoryVisible}
                    animationType="fade"
                    transparent
                    onRequestClose={() => setAddCategoryVisible(false)}
                >
                    <View style={styles.addCatOverlay}>
                        <View style={styles.addCatCard}>
                            <Text style={styles.addCatTitle}>Nueva Categoría</Text>
                            <TextInput
                                style={[styles.formInput, categoryError && styles.inputError]}
                                placeholder="Ej. Frutas, Tecnología, Ropa..."
                                placeholderTextColor={colors.placeholder}
                                value={newCategoryName}
                                onChangeText={handleCategoryNameChange}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleAddCategory}
                            />
                            {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}

                            <View style={styles.addCatActions}>
                                <TouchableOpacity
                                    style={styles.addCatCancelBtn}
                                    onPress={() => {
                                        setAddCategoryVisible(false);
                                        setCategoryError(null);
                                    }}
                                >
                                    <Text style={styles.addCatCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addCatConfirmBtn, (!newCategoryName.trim() || savingCategory || !!categoryError) && styles.saveBtnDisabled]}
                                    onPress={handleAddCategory}
                                    disabled={!newCategoryName.trim() || savingCategory || !!categoryError}
                                >
                                    {savingCategory ? (
                                        <ActivityIndicator size="small" color={colors.textButton} />
                                    ) : (
                                        <Text style={styles.addCatConfirmText}>Guardar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

export default PymeInventory;
