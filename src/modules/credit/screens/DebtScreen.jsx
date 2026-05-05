import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useDebts } from '../hooks/useDebts';
import styles from '../styles/Debt.styles';

const DebtScreen = () => {
  const { debts, loading, totalReceivable } = useDebts();

  const renderDebtItem = ({ item }) => (
    <View style={styles.debtCard}>
      <View>
        <Text style={styles.customerName}>{item.customer}</Text>
        <Text style={styles.date}>Último movimiento: {item.lastUpdate}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount, 
          item.status === 'overdue' ? styles.overdueText : null
        ]}>
          ${item.amount.toFixed(2)}
        </Text>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Abonar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <MainLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total por Cobrar</Text>
        <Text style={styles.summaryValue}>${totalReceivable.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Clientes con Saldo</Text>

      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        renderItem={renderDebtItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay cuentas pendientes.</Text>
        }
      />
    </MainLayout>
  );
};

export default DebtScreen;