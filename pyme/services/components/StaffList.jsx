import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScissorsIcon } from 'react-native-heroicons/solid';
import colors from '../../../src/theme/colors';
import { staffMock } from '../mocks/staffMocks';

const StaffList = ({ staff = staffMock }) => {
  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PERSONAL</Text>
          <Text style={styles.title}>Lista de empleados</Text>
          <Text style={styles.subtitle}>Servicios realizados hoy y comisión generada.</Text>
        </View>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.name}
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
                <Text style={styles.service}>{item.service}</Text>
              </View>
            </View>

            <View style={styles.rowRight}>
              <Text style={styles.completed}>{item.completed} realizados</Text>
              <Text style={styles.commission}>${item.commission}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.reportHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  service: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  completed: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  commission: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});

export default StaffList;
