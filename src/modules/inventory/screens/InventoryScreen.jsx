import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useInventory } from '../hooks/useInventory';
import styles from '../styles/inventory.styles';

const InventoryScreen = () => {
  const { products, loading, refreshing, error, handleRefresh } = useInventory();

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>
          {item.category}
          {item.sku ? ` - ${item.sku}` : ''}
        </Text>
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Text style={[
          styles.productStock, 
          item.stock <= item.minStock ? styles.lowStock : null
        ]}>
          Stock: {item.stock} {item.unit}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
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
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} color="#2563eb" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay productos registrados.</Text>
        }
      />
    </MainLayout>
  );
};

export default InventoryScreen;
