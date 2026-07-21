import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ScissorsIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import styles from '../styles/staffList.styles';

/**
 * @typedef {Object} StaffPerformance
 * @property {number} id
 * @property {string} name
 * @property {string|null} role
 * @property {number} completed
 * @property {number} income
 * @property {null} commission
 */

const StaffList = ({ staff = [] }) => {
  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PERSONAL</Text>
          <Text style={styles.title}>Lista de empleados</Text>
          <Text style={styles.subtitle}>Ventas registradas hoy e ingresos generados.</Text>
        </View>
      </View>

      {staff.length === 0 ? (
        <Text style={styles.emptyText}>No tienes asistentes activos registrados.</Text>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.avatar}>
                  <ScissorsIcon size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.role}>{item.role || 'Sin rol asignado'}</Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <Text style={styles.completed}>{item.completed} ventas</Text>
                <Text style={styles.income}>${item.income.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default StaffList;
