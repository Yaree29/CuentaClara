import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import useNotificationsStore from '../../../store/useNotificationsStore';
import { useNotifications } from '../hooks/useNotifications';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const NotificationsScreen = () => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const { refresh, loading, markAsRead } = useNotifications({
    autoFetch: false,
    subscribe: false,
  });

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.sent_at || 0).getTime();
      const dateB = new Date(b.sent_at || 0).getTime();
      return dateB - dateA;
    });
  }, [notifications]);

  return (
    <View style={styles.container}>
      <DashboardHeader title="Notificaciones" />

      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        onRefresh={() => refresh()}
        refreshing={loading}
        contentContainerStyle={sorted.length ? styles.listContent : styles.emptyContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.is_read && styles.cardUnread]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.message}>{item.message || 'Notificación'}</Text>
            <Text style={styles.meta}>{formatDate(item.sent_at)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes notificaciones aún.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardUnread: {
    borderColor: colors.primary,
  },
  message: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default NotificationsScreen;
