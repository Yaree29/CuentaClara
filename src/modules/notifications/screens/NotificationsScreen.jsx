import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import useNotificationsStore from '../../../store/useNotificationsStore';
import { useNotifications } from '../hooks/useNotifications';
import notificationsService from '../services/notificationService';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const NotificationsScreen = () => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const removeReadNotifications = useNotificationsStore((state) => state.removeReadNotifications);
  const { refresh, loading, markAsRead } = useNotifications({
    autoFetch: false,
    subscribe: false,
  });
  const [deleting, setDeleting] = useState(false);

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.created_at || a.sent_at || 0).getTime();
      const dateB = new Date(b.created_at || b.sent_at || 0).getTime();
      return dateB - dateA;
    });
  }, [notifications]);

  const readCount = useMemo(() => {
    return notifications.filter((n) => n.is_read).length;
  }, [notifications]);

  const handleDeleteRead = async () => {
    Alert.alert(
      'Eliminar notificaciones',
      `¿Deseas eliminar las ${readCount} notificaciones leídas?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            setDeleting(true);
            try {
              await notificationsService.deleteReadNotifications();
              removeReadNotifications();
            } catch (error) {
              Alert.alert('Error', 'No se pudieron eliminar las notificaciones');
              console.error('Error deleting read notifications:', error);
            } finally {
              setDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Notificaciones" />

      {readCount > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleDeleteRead}
          disabled={deleting}
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.clearButtonText}>
            Limpiar {readCount} leída{readCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        onRefresh={() => refresh()}
        refreshing={loading || deleting}
        contentContainerStyle={sorted.length ? styles.listContent : styles.emptyContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.is_read && styles.cardUnread]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.message}>{item.message || 'Notificación'}</Text>
              <Text style={styles.meta}>
                {formatDate(item.created_at || item.sent_at)}
              </Text>
            </View>
            {item.is_read && (
              <View style={styles.readBadge}>
                <Ionicons name="checkmark" size={14} color={colors.textMuted} />
              </View>
            )}
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: colors.cardSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  clearButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardUnread: {
    borderColor: colors.primary,
  },
  cardContent: {
    flex: 1,
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
  readBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.cardSecondary,
    borderRadius: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default NotificationsScreen;
