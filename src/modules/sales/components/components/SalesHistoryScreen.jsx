// =============================================================================
// SalesHistoryScreen.jsx (antes AccountingScreen.jsx — nombre corregido: este
// archivo siempre fue el historial/"Registro de Ventas", no una pantalla de
// contabilidad; RegisterCount.jsx era en realidad el cierre de caja, ver
// CashRegisterScreen.jsx)
// -----------------------------------------------------------------------------
// Ledger real: facturas de la sesión de caja vigente vía GET /invoices/. Antes
// filtraba por rango de fecha calendario (todayRange); ahora filtra por
// cash_session_id (la sesión abierta actual, o la última cerrada si todavía
// no se ha abierto caja hoy) — así la lista se vacía naturalmente al abrir
// una sesión nueva, en vez de depender de la medianoche.
//
// Sigue accesible con normalidad fuera de horario de ventas (a diferencia de
// SalesSection.jsx, aquí no aplica ningún bloqueo — decisión explícita del
// usuario).
// =============================================================================
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles/salesHistory.style';
import useAuthStore from '../../../../store/useAuthStore';
import billingService from '../../../Invoice/services/billingService';
import cashService from '../../services/cashService';
import colors from '../../../../theme/colors';
import { ArchiveBoxIcon } from 'react-native-heroicons/outline';

const SalesHistoryScreen = ({ cashStatus }) => {
  // Usuario autenticado (dueño por ahora)
  const user = useAuthStore((state) => state.user);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessionLabel, setSessionLabel] = useState(null);

  const openSessionId = cashStatus?.session?.id ?? null;

  const fetchSessionInvoices = useCallback(async () => {
    setLoading(true);
    try {
      let sessionId = openSessionId;
      let label = null;

      if (sessionId) {
        label = 'Ventas de la caja abierta ahora mismo.';
      } else {
        const lastSessions = await cashService.getSessions(1).catch(() => []);
        if (Array.isArray(lastSessions) && lastSessions[0]) {
          sessionId = lastSessions[0].id;
          label = 'Última caja cerrada. Se vaciará al abrir una nueva.';
        }
      }

      if (!sessionId) {
        setInvoices([]);
        setSessionLabel(null);
        return;
      }

      const data = await billingService.getInvoices(null, { cashSessionId: sessionId, limit: 200 });
      setInvoices(Array.isArray(data) ? data : []);
      setSessionLabel(label);
    } catch (error) {
      console.error('Error cargando ventas de la sesión:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [openSessionId]);

  useFocusEffect(
    useCallback(() => {
      fetchSessionInvoices();
    }, [fetchSessionInvoices])
  );

  // Refresca también cuando cambia el estado de caja (ej. se acaba de abrir
  // una sesión nueva) sin esperar a un nuevo foco de pantalla.
  useEffect(() => {
    fetchSessionInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSessionId]);

  // Por ahora solo existe el dueño del negocio.
  // Cuando existan asistentes, este arreglo vendrá de la API.
  const users = useMemo(() => {
    return [
      {
        id: user?.id || 1,
        name: user?.name || 'Administrador',
        role: user?.role || 'owner',
      },
    ];
  }, [user]);

  const userSales = useMemo(() => {
    // Las anuladas ('void') no cuentan como venta real; las 'pending'
    // (fiado) no aportan dinero en caja pero sí productos entregados.
    const paidInvoices = invoices.filter((inv) => inv.status !== 'void');

    return users.map((currentUser) => {
      const totalMoney = paidInvoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

      const totalProducts = paidInvoices.reduce((sum, inv) => {
        const items = inv.invoice_items || [];
        return sum + items.reduce((s, item) => s + (Number(item.quantity) || 0), 0);
      }, 0);

      return {
        ...currentUser,
        sales: paidInvoices,
        totalMoney,
        totalProducts,
      };
    });
  }, [users, invoices]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Registro de ventas</Text>

        {!loading && sessionLabel && (
          <View style={styles.sessionBanner}>
            <ArchiveBoxIcon size={18} color={colors.primary} />
            <Text style={styles.sessionBannerText}>{sessionLabel}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : !openSessionId && !sessionLabel ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aún no hay ninguna caja abierta ni cerrada para mostrar.</Text>
          </View>
        ) : (
          userSales.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={styles.userCard}
              onPress={() => setSelectedUser(u)}
            >
              <View style={styles.userHeader}>
                <View>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userRole}>{u.role}</Text>
                </View>

                <Text style={styles.userMoney}>
                  ${u.totalMoney.toFixed(2)}
                </Text>
              </View>

              <View style={styles.userStatsRow}>
                <ArchiveBoxIcon size={20} color="#000000" />

                <Text style={styles.userInfoText}>
                  {u.totalProducts}{' '}
                  {u.totalProducts === 1 ? 'producto' : 'productos'}
                </Text>

                <Text style={styles.viewMoreText}>
                  Ver detalle →
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={selectedUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ventas de {selectedUser?.name}
            </Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedUser?.sales?.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No existen ventas registradas en esta caja.
                  </Text>
                </View>
              ) : (
                selectedUser?.sales?.map((sale) => (
                  <View key={sale.id} style={styles.saleCard}>
                    <View style={styles.saleHeader}>
                      <Text style={styles.saleId}>
                        Factura #{sale.id}{sale.status === 'pending' ? ' (fiado)' : ''}
                      </Text>

                      <Text style={styles.saleTotal}>
                        ${(Number(sale.total) || 0).toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.saleProductsList}>
                      {(sale.invoice_items || []).map((item, idx) => (
                        <Text
                          key={`${sale.id}-item-${idx}`}
                          style={styles.productItem}
                        >
                          • {item.products?.name || 'Producto eliminado'}{' '}
                          <Text style={styles.productQty}>
                            x{item.quantity}
                          </Text>
                        </Text>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedUser(null)}
            >
              <Text style={styles.closeButtonText}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SalesHistoryScreen;
