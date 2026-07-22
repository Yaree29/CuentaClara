// =============================================================================
// OffersScreen.jsx
// -----------------------------------------------------------------------------
// Promociones: CRUD sobre promotions (producto o categoría, descuento %/fijo,
// fechas de vigencia). Gestión: listado con estado activo/programado/vencido
// derivado de la fecha actual (sin columna de estado propia), historial de
// promociones pasadas.
// =============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import offersService from '../services/offersService';
import inventoryService from '../../inventory/services/inventoryService';
import useOffers from '../hooks/useOffers';
import styles from '../styles/offersScreen.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const SCOPE_OPTIONS = [
  { key: 'product', label: 'Producto' },
  { key: 'category', label: 'Categoría' },
];
const DISCOUNT_TYPE_OPTIONS = [
  { key: 'percentage', label: '% Porcentaje' },
  { key: 'fixed', label: 'Monto fijo' },
];

const STATUS_META = {
  active: { label: 'Activa', badge: 'badgeActive', text: 'badgeTextActive' },
  scheduled: { label: 'Programada', badge: 'badgeScheduled', text: 'badgeTextScheduled' },
  expired: { label: 'Vencida', badge: 'badgeExpired', text: 'badgeTextExpired' },
};

const discountLabel = (promo) =>
  promo.discount_type === 'percentage' ? `${promo.discount_value}% de descuento` : `${money(promo.discount_value)} de descuento`;

const PromotionCard = ({ promo, onDelete }) => {
  const meta = STATUS_META[promo.status];
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>{promo.scope === 'product' ? promo.product_name : promo.category_name}</Text>
        <View style={[styles.badge, styles[meta.badge]]}>
          <Text style={[styles.badgeText, styles[meta.text]]}>{meta.label}</Text>
        </View>
      </View>
      <Text style={styles.cardDiscount}>{discountLabel(promo)}</Text>
      <Text style={styles.cardDates}>{promo.start_date} — {promo.end_date}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(promo.id)}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const OffersScreen = () => {
  const { active, past, loading, refetch } = useOffers();

  const [modalVisible, setModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [scope, setScope] = useState('product');
  const [productId, setProductId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modalVisible) {
      inventoryService.getProducts().then(setProducts).catch(() => setProducts([]));
      inventoryService.getCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => setCategories([]));
    }
  }, [modalVisible]);

  const openModal = () => {
    setScope('product');
    setProductId(null);
    setCategoryId(null);
    setDiscountType('percentage');
    setDiscountValue('');
    setStartDate('');
    setEndDate('');
    setError(null);
    setModalVisible(true);
  };

  const handleCreate = async () => {
    const value = Number(discountValue);
    if (!discountValue || Number.isNaN(value) || value <= 0) {
      setError('Ingresa un valor de descuento válido.');
      return;
    }
    if (scope === 'product' && !productId) {
      setError('Selecciona un producto.');
      return;
    }
    if (scope === 'category' && !categoryId) {
      setError('Selecciona una categoría.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Ingresa fecha de inicio y fin (YYYY-MM-DD).');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await offersService.createPromotion({
        scope,
        product_id: scope === 'product' ? productId : null,
        category_id: scope === 'category' ? categoryId : null,
        discount_type: discountType,
        discount_value: value,
        start_date: startDate,
        end_date: endDate,
      });
      setModalVisible(false);
      await refetch();
    } catch (err) {
      setError(err?.message || 'No se pudo crear la promoción.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (promotionId) => {
    Alert.alert('Eliminar promoción', '¿Seguro que quieres eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await offersService.deletePromotion(promotionId);
            await refetch();
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar la promoción.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Gestor de Ofertas" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Promociones</Text>
          <Text style={styles.heroTitle}>Programa descuentos por producto o categoría.</Text>
          <Text style={styles.heroSubtitle}>El estado (activa/programada/vencida) se calcula según la fecha de hoy.</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>+ Nueva promoción</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>GESTIÓN</Text>
                <Text style={styles.sectionTitle}>Promociones activas y programadas</Text>
              </View>
              {active.length === 0 ? (
                <Text style={styles.emptyText}>No tienes promociones activas ni programadas.</Text>
              ) : (
                active.map((promo) => <PromotionCard key={promo.id} promo={promo} onDelete={handleDelete} />)
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>HISTORIAL</Text>
                <Text style={styles.sectionTitle}>Promociones pasadas</Text>
              </View>
              {past.length === 0 ? (
                <Text style={styles.emptyText}>Aún no tienes promociones vencidas.</Text>
              ) : (
                past.map((promo) => <PromotionCard key={promo.id} promo={promo} onDelete={handleDelete} />)
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nueva promoción</Text>
              <Text style={styles.modalSubtitle}>Elige a qué aplica el descuento y su vigencia.</Text>

              <Text style={styles.fieldLabel}>Aplica a</Text>
              <View style={styles.segmentedControl}>
                {SCOPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.segmentButton, scope === option.key && styles.segmentButtonActive]}
                    onPress={() => setScope(option.key)}
                  >
                    <Text style={[styles.segmentButtonText, scope === option.key && styles.segmentButtonTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {scope === 'product' ? (
                <View style={styles.pickerRow}>
                  {products.length === 0 ? (
                    <Text style={styles.emptyText}>No tienes productos en inventario.</Text>
                  ) : (
                    products.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.pickerChip, productId === p.id && styles.pickerChipActive]}
                        onPress={() => setProductId(p.id)}
                      >
                        <Text style={[styles.pickerChipText, productId === p.id && styles.pickerChipTextActive]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              ) : (
                <View style={styles.pickerRow}>
                  {categories.length === 0 ? (
                    <Text style={styles.emptyText}>No tienes categorías en inventario.</Text>
                  ) : (
                    categories.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.pickerChip, categoryId === c.id && styles.pickerChipActive]}
                        onPress={() => setCategoryId(c.id)}
                      >
                        <Text style={[styles.pickerChipText, categoryId === c.id && styles.pickerChipTextActive]}>{c.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              <Text style={styles.fieldLabel}>Tipo de descuento</Text>
              <View style={styles.segmentedControl}>
                {DISCOUNT_TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.segmentButton, discountType === option.key && styles.segmentButtonActive]}
                    onPress={() => setDiscountType(option.key)}
                  >
                    <Text style={[styles.segmentButtonText, discountType === option.key && styles.segmentButtonTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>{discountType === 'percentage' ? 'Porcentaje (%)' : 'Monto fijo'}</Text>
              <TextInput
                style={styles.textInput}
                value={discountValue}
                onChangeText={setDiscountValue}
                placeholder={discountType === 'percentage' ? 'Ej. 15' : 'Ej. 5.00'}
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Fecha de inicio (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2026-07-21"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Fecha de fin (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="2026-07-31"
                placeholderTextColor={colors.placeholder}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, saving ? styles.modalButtonDisabled : styles.modalButtonPrimary]}
                  onPress={handleCreate}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.textButton} />
                  ) : (
                    <Text style={styles.modalButtonTextPrimary}>Crear</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OffersScreen;
