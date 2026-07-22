import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArchiveBoxIcon, ShareIcon, CheckIcon, XMarkIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import { useBillingHistory } from '../hooks/useBillingHistory';
import DayFilterCalendar from '../components/DayFilterCalendar';
import styles from '../styles/billingHistory.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const STATUS_LABEL = {
  paid: 'Pagada',
  pending: 'Pendiente (fiado)',
  void: 'Anulada',
};

const STATUS_STYLE = {
  paid: styles.statusPaid,
  pending: styles.statusPending,
  void: styles.statusVoid,
};

// "2026-07-22" → clave de día estable (sin depender de la zona horaria del
// dispositivo: se toma el prefijo ISO tal cual viene del backend).
const dayKey = (invoice) => (invoice.created_at || '').slice(0, 10);

// "2026-07-22" → "martes, 22 jul 2026" (fecha legible del encabezado de grupo).
const formatDayLabel = (key) => {
  if (!key) return 'Sin fecha';
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// "2026-07-22" → "22 jul 2026" (etiqueta corta para la píldora de filtro).
const shortDayLabel = (key) => {
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

// "Hoy" en el mismo reloj (UTC) con que el backend marca created_at
// (datetime.utcnow()), para que el filtro por defecto muestre las ventas
// recién registradas del día.
const todayKey = () => new Date().toISOString().slice(0, 10);

// embedded=true: se usa como subpestaña dentro de BillingScreen (MiRUC), que ya
// aporta el SafeAreaView y el DashboardHeader — aquí se omiten para no duplicar.
const BillingHistoryScreen = ({ embedded = false }) => {
  const navigation = useNavigation();
  const { invoices, loading, error, refresh, shareInvoices, sharing } = useBillingHistory();
  const Container = embedded ? View : SafeAreaView;

  // Refresca al volver a la pantalla (ej. tras registrar una venta nueva) sin
  // interferir con el modo selección, que se cancela al enfocar de nuevo.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Filtro por día: activo por defecto en el día de hoy. Se puede elegir otro
  // día en el calendario, o desactivarlo con "Todos" para ver todo el historial.
  const [filterActive, setFilterActive] = useState(true);
  const [selectedDay, setSelectedDay] = useState(todayKey());   // 'YYYY-MM-DD'
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);      // ids de facturas marcadas
  const [rowSharingId, setRowSharingId] = useState(null);  // fila con compartir en curso

  // Días con ventas, para marcarlos con un punto en el calendario.
  const markedDays = useMemo(
    () => new Set(invoices.map(dayKey).filter(Boolean)),
    [invoices]
  );

  const handlePickDay = (dayKeyValue) => {
    setSelectedDay(dayKeyValue);
    setFilterActive(true);
    setCalendarVisible(false);
  };

  const pillLabel = selectedDay === todayKey()
    ? `Hoy · ${shortDayLabel(selectedDay)}`
    : shortDayLabel(selectedDay);

  // Facturas filtradas por el día seleccionado y agrupadas por día (para render).
  const groups = useMemo(() => {
    const filtered = !filterActive
      ? invoices
      : invoices.filter((inv) => dayKey(inv) === selectedDay);

    const byDay = new Map();
    filtered.forEach((inv) => {
      const key = dayKey(inv);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(inv);
    });

    return [...byDay.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // día más reciente primero
      .map(([key, list]) => ({
        key,
        label: formatDayLabel(key),
        invoices: list,
        total: list
          .filter((i) => i.status === 'paid')
          .reduce((sum, i) => sum + (Number(i.total) || 0), 0),
      }));
  }, [invoices, filterActive, selectedDay]);

  const enterSelection = (invoice) => {
    setSelectionMode(true);
    setSelectedIds([invoice.id]);
  };

  const toggleSelected = (invoice) => {
    setSelectedIds((prev) =>
      prev.includes(invoice.id)
        ? prev.filter((id) => id !== invoice.id)
        : [...prev, invoice.id]
    );
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const handleRowPress = (invoice) => {
    if (selectionMode) {
      toggleSelected(invoice);
      return;
    }
    navigation.navigate('BillingInvoiceDetail', { invoiceId: invoice.id });
  };

  const handleShareSelected = async () => {
    if (selectedIds.length === 0 || sharing) return;
    try {
      await shareInvoices(selectedIds);
      exitSelection();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudieron compartir las facturas.');
    }
  };

  // Compartir una sola factura desde su botón de la fila (sin entrar al detalle).
  const handleShareOne = async (invoice) => {
    if (rowSharingId) return;
    setRowSharingId(invoice.id);
    try {
      await shareInvoices([invoice.id]);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo compartir la factura.');
    } finally {
      setRowSharingId(null);
    }
  };

  return (
    <Container style={styles.safeArea} edges={['top']}>
      {!embedded && <DashboardHeader title="Historial de facturas" />}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />}

        {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && invoices.length === 0 && (
          <View style={styles.emptyCard}>
            <ArchiveBoxIcon size={35} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aún no hay ventas registradas</Text>
            <Text style={styles.emptySubtitle}>
              Las ventas que registres desde la pestaña "Ventas" aparecerán aquí.
            </Text>
          </View>
        )}

        {!loading && !error && invoices.length > 0 && (
          <>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterDateButton, filterActive && styles.filterDateButtonActive]}
                onPress={() => setCalendarVisible(true)}
                activeOpacity={0.7}
              >
                <CalendarDaysIcon
                  size={18}
                  color={filterActive ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[styles.filterDateText, filterActive && styles.filterDateTextActive]}
                  numberOfLines={1}
                >
                  {pillLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterAllButton, !filterActive && styles.filterAllButtonActive]}
                onPress={() => setFilterActive(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterAllText, !filterActive && styles.filterAllTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
            </View>

            {groups.map((group) => (
              <View key={group.key || 'nodate'}>
                <View style={styles.dayHeaderRow}>
                  <Text style={styles.dayHeaderTitle}>{group.label}</Text>
                  <Text style={styles.dayHeaderMeta}>{money(group.total)}</Text>
                </View>

                {group.invoices.map((invoice) => {
                  const customerName = invoice.customer_id
                    ? (invoice.customer_name || 'Cliente')
                    : 'Consumidor final';
                  const isSelected = selectedIds.includes(invoice.id);

                  return (
                    <TouchableOpacity
                      key={invoice.id}
                      style={[styles.invoiceCard, isSelected && styles.invoiceCardSelected]}
                      onPress={() => handleRowPress(invoice)}
                      onLongPress={() => !selectionMode && enterSelection(invoice)}
                      delayLongPress={250}
                      activeOpacity={0.7}
                    >
                      {selectionMode && (
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <CheckIcon size={16} color={colors.textWhite} />}
                        </View>
                      )}

                      <View style={styles.invoiceMain}>
                        <View style={styles.invoiceTopRow}>
                          <Text style={styles.invoiceTotal}>{money(invoice.total)}</Text>
                          <Text style={styles.invoiceDate}>{invoice.created_at?.slice(11, 16)}</Text>
                        </View>
                        <Text style={styles.invoiceCustomer} numberOfLines={1}>
                          {customerName} · {invoice.invoice_number || `Venta #${invoice.id}`}
                        </Text>
                        <Text style={[styles.invoiceStatus, STATUS_STYLE[invoice.status] || styles.statusVoid]}>
                          {STATUS_LABEL[invoice.status] || invoice.status}
                        </Text>
                      </View>

                      {!selectionMode && (
                        <TouchableOpacity
                          style={styles.shareButton}
                          onPress={() => handleShareOne(invoice)}
                          disabled={rowSharingId === invoice.id}
                          accessibilityLabel="Compartir esta factura"
                        >
                          {rowSharingId === invoice.id ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : (
                            <ShareIcon size={20} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {filterActive && groups.length === 0 && (
              <View style={styles.emptyCard}>
                <ArchiveBoxIcon size={30} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Sin ventas este día</Text>
                <Text style={styles.emptySubtitle}>
                  No hay ventas registradas el {shortDayLabel(selectedDay)}. Elige otro día o toca "Todos".
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <DayFilterCalendar
        visible={calendarVisible}
        initialDate={selectedDay}
        markedDays={markedDays}
        onSelect={handlePickDay}
        onClose={() => setCalendarVisible(false)}
      />

      {selectionMode && (
        <View style={styles.selectionBar}>
          <TouchableOpacity style={styles.selectionCancel} onPress={exitSelection}>
            <XMarkIcon size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectionShareButton,
              (selectedIds.length === 0 || sharing) && styles.selectionShareDisabled,
            ]}
            onPress={handleShareSelected}
            disabled={selectedIds.length === 0 || sharing}
          >
            {sharing ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : (
              <>
                <ShareIcon size={18} color={colors.textWhite} />
                <Text style={styles.selectionShareText}>
                  Compartir{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Container>
  );
};

export default BillingHistoryScreen;
