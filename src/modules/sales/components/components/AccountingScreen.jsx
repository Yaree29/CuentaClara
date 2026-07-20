import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import styles from './styles/accounting.style';
import useSalesStore from '../../../../store/useSaleStore';
import useAuthStore from '../../../../store/useAuthStore';
import { ArchiveBoxIcon } from 'react-native-heroicons/outline';

const AccountingScreen = () => {
  const dailySales = useSalesStore((state) => state.dailySales);

  // Usuario autenticado (dueño por ahora)
  const user = useAuthStore((state) => state.user);

  const [selectedUser, setSelectedUser] = useState(null);

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
    return users.map((currentUser) => {
      const sales = dailySales;

      const totalMoney = sales.reduce(
        (sum, sale) => sum + sale.total,
        0
      );

      const totalProducts = sales.reduce(
        (sum, sale) => sum + sale.totalProducts,
        0
      );

      return {
        ...currentUser,
        sales,
        totalMoney,
        totalProducts,
      };
    });
  }, [users, dailySales]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Registro de ventas</Text>

        {userSales.map((user) => (
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
        ))}
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
                        Venta #{sale.id}
                      </Text>

                      <Text style={styles.saleTotal}>
                        ${sale.total.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.saleProductsList}>
                      {sale.products.map((product) => (
                        <Text
                          key={product.id}
                          style={styles.productItem}
                        >
                          • {product.name}{' '}
                          <Text style={styles.productQty}>
                            x{product.quantity}
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