import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles/accounting.style';
import useAuthStore from '../../../../store/useAuthStore';
import billingService from '../../../Invoice/services/billingService';
import colors from '../../../../theme/colors';
import { ArchiveBoxIcon } from 'react-native-heroicons/outline';

const todayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
};

const AccountingScreen = () => {
  // Usuario autenticado (dueño por ahora)
  const user = useAuthStore((state) => state.user);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Ledger real: facturas de HOY vía GET /invoices/ (antes leía solo
  // useSaleStore.dailySales, que se vacía al reabrir la app aunque existan
  // ventas reales guardadas en el backend).
  const fetchTodayInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { dateFrom, dateTo } = todayRange();
      const data = await billingService.getInvoices(null, { dateFrom, dateTo, limit: 200 });
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando ventas del día:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTodayInvoices();
    }, [fetchTodayInvoices])
  );

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          userSales.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => setSelectedUser(user)}
            >
              <View style={styles.userHeader}>
                <View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </View>

                <Text style={styles.userMoney}>
                  ${user.totalMoney.toFixed(2)}
                </Text>
              </View>

              <View style={styles.userStatsRow}>
                <ArchiveBoxIcon size={20} color="#000000" />

                <Text style={styles.userInfoText}>
                  {user.totalProducts}{' '}
                  {user.totalProducts === 1 ? 'producto' : 'productos'}
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
                    No existen ventas registradas hoy.
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

export default AccountingScreen;
