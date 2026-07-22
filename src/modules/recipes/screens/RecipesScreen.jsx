// =============================================================================
// RecipesScreen.jsx
// -------------------
// Módulo de Recetas / Producción (ver DASHBOARD_PYMES.md):
//   - Producción: CRUD de recetas (producto final, insumos, costo en tiempo
//     real calculado por el backend a partir de cost_price de cada insumo).
//   - Automatización: al producir, valida disponibilidad de TODOS los
//     insumos (todo o nada) y descuenta stock vía POST /inventory/stock/adjust
//     (reason='production').
//   - Control: historial de producción, consumo de insumos y rentabilidad
//     (margen unitario; sin vínculo a ventas reales todavía, se reporta como
//     limitación en vez de inventar el dato).
// =============================================================================
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import recipeService from '../services/recipeService';
import useRecipes from '../hooks/useRecipes';
import useRecipeForm from '../hooks/useRecipeForm';
import styles from '../styles/recipesScreen.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const NO_DISPONIBLE = 'No disponible';

// ─── Formulario de crear/editar receta ──────────────────────────────────────

const RecipeFormModal = ({ visible, recipe, products, onClose, onSaved }) => {
  const form = useRecipeForm({ recipe, onSaved: () => { onSaved(); onClose(); } });

  const estimatedCost = form.ingredients.reduce((total, ing) => {
    if (!ing.ingredientProductId || !ing.quantity) return total;
    const product = products.find((p) => p.id === ing.ingredientProductId);
    const costPrice = product?.costPrice || 0;
    const quantity = Number(ing.quantity) || 0;
    return total + costPrice * quantity;
  }, 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{form.isEditing ? 'Editar receta' : 'Nueva receta'}</Text>
            <Text style={styles.modalSubtitle}>
              Define el producto final, cuántas porciones rinde y sus insumos.
            </Text>

            <Text style={styles.fieldLabel}>Nombre de la receta *</Text>
            <TextInput
              style={styles.textInput}
              value={form.name}
              onChangeText={form.setName}
              placeholder="Ej. Torta de chocolate"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.fieldLabel}>Producto final *</Text>
            {products.length === 0 ? (
              <Text style={styles.emptyText}>No tienes productos registrados en Inventario.</Text>
            ) : (
              <View style={styles.chipGrid}>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[styles.chip, form.productId === product.id && styles.chipActive]}
                    onPress={() => form.selectFinalProduct(product)}
                  >
                    <Text style={[styles.chipText, form.productId === product.id && styles.chipTextActive]}>
                      {product.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Porciones que rinde *</Text>
            <TextInput
              style={styles.textInput}
              value={form.portionsYield}
              onChangeText={form.setPortionsYield}
              keyboardType="decimal-pad"
              placeholder="Ej. 8"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Insumos *</Text>
            {form.ingredients.map((ingredient, index) => (
              <View key={ingredient.id} style={styles.ingredientCard}>
                <View style={styles.ingredientCardHeader}>
                  <Text style={styles.ingredientBadge}>Insumo #{index + 1}</Text>
                  <TouchableOpacity onPress={() => form.removeIngredient(ingredient.id)}>
                    <Text style={styles.removeText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>

                {products.length === 0 ? (
                  <Text style={styles.emptyText}>No tienes productos registrados en Inventario.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipGrid}>
                      {products.map((product) => (
                        <TouchableOpacity
                          key={product.id}
                          style={[
                            styles.chip,
                            ingredient.ingredientProductId === product.id && styles.chipActive,
                          ]}
                          onPress={() => form.selectIngredientProduct(ingredient.id, product)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              ingredient.ingredientProductId === product.id && styles.chipTextActive,
                            ]}
                          >
                            {product.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}

                <View style={styles.quantityRow}>
                  <View style={styles.quantityField}>
                    <TextInput
                      style={styles.textInput}
                      value={ingredient.quantity}
                      onChangeText={(value) => form.updateIngredient(ingredient.id, 'quantity', value)}
                      keyboardType="decimal-pad"
                      placeholder="Cantidad"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                  <View style={styles.unitField}>
                    <TextInput
                      style={styles.textInput}
                      value={ingredient.unit}
                      onChangeText={(value) => form.updateIngredient(ingredient.id, 'unit', value)}
                      placeholder="kg, g, ml…"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.secondaryButton} onPress={form.addIngredient}>
              <Text style={styles.secondaryButtonText}>+ Agregar insumo</Text>
            </TouchableOpacity>

            {estimatedCost > 0 && (
              <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>
                Costo estimado: {money(estimatedCost)}
              </Text>
            )}

            {form.error && <Text style={styles.errorText}>{form.error}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={onClose}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, form.saving ? styles.modalButtonDisabled : styles.modalButtonPrimary]}
                onPress={form.handleSave}
                disabled={form.saving}
              >
                {form.saving ? (
                  <ActivityIndicator size="small" color={colors.textButton} />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Detalle de receta: insumos, producir, historial, consumo, rentabilidad ──

const RecipeDetailModal = ({ visible, recipe, onClose, onChanged, onEdit, onDelete }) => {
  const [portionsToProduce, setPortionsToProduce] = useState('');
  const [producing, setProducing] = useState(false);
  const [produceError, setProduceError] = useState(null);
  const [produceSuccess, setProduceSuccess] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [consumption, setConsumption] = useState([]);
  const [consumptionLoading, setConsumptionLoading] = useState(false);
  const [consumptionFilter, setConsumptionFilter] = useState(null);

  const [profitability, setProfitability] = useState(null);
  const [profitLoading, setProfitLoading] = useState(false);

  const loadControlData = useCallback(
    async (recipeId, ingredientFilter = null) => {
      setHistoryLoading(true);
      setConsumptionLoading(true);
      setProfitLoading(true);
      try {
        const [historyData, consumptionData, profitData] = await Promise.all([
          recipeService.getProductionHistory({ recipeId }).catch(() => []),
          recipeService.getConsumption(recipeId, ingredientFilter).catch(() => []),
          recipeService.getProfitability(recipeId).catch(() => null),
        ]);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setConsumption(Array.isArray(consumptionData) ? consumptionData : []);
        setProfitability(profitData);
      } finally {
        setHistoryLoading(false);
        setConsumptionLoading(false);
        setProfitLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (visible && recipe) {
      setPortionsToProduce('');
      setProduceError(null);
      setProduceSuccess(null);
      setConsumptionFilter(null);
      loadControlData(recipe.id, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, recipe?.id]);

  if (!recipe) return null;

  const handleProduce = async () => {
    const portions = Number(portionsToProduce);
    if (!portionsToProduce || Number.isNaN(portions) || portions <= 0) {
      setProduceError('Ingresa una cantidad de porciones válida.');
      return;
    }
    setProducing(true);
    setProduceError(null);
    setProduceSuccess(null);
    try {
      const result = await recipeService.produce(recipe.id, portions);
      setProduceSuccess(`Producción registrada. Costo: ${money(result.total_cost)}.`);
      setPortionsToProduce('');
      await loadControlData(recipe.id, consumptionFilter);
      onChanged?.();
    } catch (e) {
      setProduceError(e?.message || 'No se pudo registrar la producción.');
    } finally {
      setProducing(false);
    }
  };

  const filterByIngredient = (ingredientProductId) => {
    setConsumptionFilter(ingredientProductId);
    loadControlData(recipe.id, ingredientProductId);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.fullScreenModal}>
        <View style={styles.fullScreenHeader}>
          <Text style={styles.fullScreenTitle}>{recipe.name}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ============================ Insumos y costo ============================ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionKicker}>PRODUCCIÓN</Text>
                <Text style={styles.sectionTitle}>Ficha técnica</Text>
                <Text style={styles.sectionSubtitle}>
                  Rinde {recipe.portionsYield} porciones · {recipe.productName || 'Producto eliminado'}
                </Text>
              </View>
              <Text style={styles.recipeCardCost}>{money(recipe.costPerPortion)}{'\n'}
                <Text style={styles.recipeCardCostLabel}>por porción</Text>
              </Text>
            </View>

            {recipe.ingredients.map((ing, index) => (
              <View key={`${ing.ingredientProductId}-${index}`} style={[styles.row, index === recipe.ingredients.length - 1 && styles.rowLast]}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowName}>{ing.ingredientName || 'Insumo eliminado'}</Text>
                  <Text style={styles.rowMeta}>{ing.quantity} {ing.unit} × {money(ing.costPrice)}</Text>
                </View>
                <Text style={styles.rowValue}>{money(ing.subtotal)}</Text>
              </View>
            ))}

            <Text style={[styles.sectionSubtitle, { marginTop: 8 }]}>
              Costo total de la receta: {money(recipe.totalCost)}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={[styles.editButton, { flex: 1, alignItems: 'center' }]} onPress={() => onEdit(recipe)}>
                <Text style={styles.editButtonText}>Editar receta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dangerButton, { flex: 1, alignItems: 'center' }]} onPress={() => onDelete(recipe)}>
                <Text style={styles.dangerButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ============================ Producir ============================ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionKicker}>AUTOMATIZACIÓN</Text>
                <Text style={styles.sectionTitle}>Registrar producción</Text>
                <Text style={styles.sectionSubtitle}>
                  Valida disponibilidad de todos los insumos y descuenta el stock automáticamente.
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Porciones a producir</Text>
            <TextInput
              style={styles.textInput}
              value={portionsToProduce}
              onChangeText={setPortionsToProduce}
              keyboardType="decimal-pad"
              placeholder={`Ej. ${recipe.portionsYield}`}
              placeholderTextColor={colors.placeholder}
            />

            {produceError && <Text style={styles.errorText}>{produceError}</Text>}
            {produceSuccess && <Text style={[styles.sectionSubtitle, { color: colors.textSuccess, marginTop: 8 }]}>{produceSuccess}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, producing && styles.primaryButtonDisabled]}
              onPress={handleProduce}
              disabled={producing}
            >
              {producing ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Text style={styles.primaryButtonText}>Producir</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ============================ Rentabilidad ============================ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionKicker}>CONTROL</Text>
                <Text style={styles.sectionTitle}>Rentabilidad</Text>
              </View>
            </View>

            {profitLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : profitability ? (
              <View style={styles.profitCard}>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Precio de venta</Text>
                  <Text style={styles.profitValue}>{money(profitability.product_price)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Costo por porción</Text>
                  <Text style={styles.profitValue}>{money(profitability.cost_per_portion)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Margen unitario</Text>
                  <Text style={styles.profitValue}>{money(profitability.unit_margin)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Ganancia total (porciones vendidas)</Text>
                  <Text style={styles.profitValue}>{NO_DISPONIBLE}</Text>
                </View>
                <Text style={styles.limitationText}>{profitability.limitation}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>{NO_DISPONIBLE}</Text>
            )}
          </View>

          {/* ============================ Consumo de insumos ============================ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionKicker}>CONTROL</Text>
                <Text style={styles.sectionTitle}>Consumo de insumos</Text>
                <Text style={styles.sectionSubtitle}>Derivado de los movimientos de inventario por producción.</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipGrid}>
                <TouchableOpacity
                  style={[styles.chip, consumptionFilter === null && styles.chipActive]}
                  onPress={() => filterByIngredient(null)}
                >
                  <Text style={[styles.chipText, consumptionFilter === null && styles.chipTextActive]}>Todos</Text>
                </TouchableOpacity>
                {recipe.ingredients.map((ing) => (
                  <TouchableOpacity
                    key={ing.ingredientProductId}
                    style={[styles.chip, consumptionFilter === ing.ingredientProductId && styles.chipActive]}
                    onPress={() => filterByIngredient(ing.ingredientProductId)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        consumptionFilter === ing.ingredientProductId && styles.chipTextActive,
                      ]}
                    >
                      {ing.ingredientName || 'Insumo eliminado'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {consumptionLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
            ) : consumption.length === 0 ? (
              <Text style={styles.emptyText}>Aún no hay consumo registrado para esta receta.</Text>
            ) : (
              consumption.map((c, index) => (
                <View key={c.movement_id} style={[styles.row, index === consumption.length - 1 && styles.rowLast]}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowName}>{c.ingredient_name || 'Insumo eliminado'}</Text>
                    <Text style={styles.rowMeta}>{c.created_at?.split('T')[0]}</Text>
                  </View>
                  <Text style={styles.rowValue}>-{c.quantity}</Text>
                </View>
              ))
            )}
          </View>

          {/* ============================ Historial de producción ============================ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionKicker}>CONTROL</Text>
                <Text style={styles.sectionTitle}>Historial de producción</Text>
              </View>
            </View>

            {historyLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : history.length === 0 ? (
              <Text style={styles.emptyText}>Aún no has registrado producciones de esta receta.</Text>
            ) : (
              history.map((h, index) => (
                <View key={h.id} style={[styles.row, index === history.length - 1 && styles.rowLast]}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowName}>{h.portions_produced} porciones</Text>
                    <Text style={styles.rowMeta}>{h.created_at?.split('T')[0]}</Text>
                  </View>
                  <Text style={styles.rowValue}>{money(h.total_cost)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Pantalla principal ──────────────────────────────────────────────────────

const RecipesScreen = () => {
  const { recipes, products, loading, refetch } = useRecipes();

  const [formModal, setFormModal] = useState({ visible: false, recipe: null });
  const [detailRecipe, setDetailRecipe] = useState(null);

  const openCreate = () => setFormModal({ visible: true, recipe: null });
  const openEdit = (recipe) => {
    setDetailRecipe(null);
    setFormModal({ visible: true, recipe });
  };
  const closeForm = () => setFormModal({ visible: false, recipe: null });

  const handleDelete = async (recipe) => {
    try {
      await recipeService.deleteRecipe(recipe.id);
      setDetailRecipe(null);
      await refetch();
    } catch (e) {
      // El error se limita a no cerrar el detalle; el usuario puede reintentar.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Recetas" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Recetas y Producción</Text>
          <Text style={styles.heroTitle}>Fichas técnicas con costo en tiempo real.</Text>
          <Text style={styles.heroSubtitle}>
            Cada receta calcula su costo a partir del costo actual de sus insumos.
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionKicker}>PRODUCCIÓN</Text>
                <Text style={styles.sectionTitle}>Tus recetas</Text>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={openCreate}>
                <Text style={styles.addButtonText}>+ Nueva</Text>
              </TouchableOpacity>
            </View>

            {recipes.length === 0 ? (
              <Text style={styles.emptyText}>Aún no tienes recetas registradas.</Text>
            ) : (
              recipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard} onPress={() => setDetailRecipe(recipe)}>
                  <View style={styles.recipeCardHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.recipeCardTitle}>{recipe.name}</Text>
                      <Text style={styles.recipeCardSubtitle}>
                        {recipe.productName || 'Producto eliminado'} · rinde {recipe.portionsYield}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.recipeCardCost}>{money(recipe.totalCost)}</Text>
                      <Text style={styles.recipeCardCostLabel}>costo total</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <RecipeFormModal
        visible={formModal.visible}
        recipe={formModal.recipe}
        products={products}
        onClose={closeForm}
        onSaved={refetch}
      />

      <RecipeDetailModal
        visible={!!detailRecipe}
        recipe={detailRecipe}
        onClose={() => setDetailRecipe(null)}
        onChanged={refetch}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
};

export default RecipesScreen;
