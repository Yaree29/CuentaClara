import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useProfile from '../hooks/useProfile';
import useAuthStore from '../../../store/useAuthStore';
import useAssistantModeStore from '../../../store/useAssistantModeStore';
import authService from '../../auth/services/authService';
import businessService from '../../../services/businessService';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const MenuItem = ({ icon, label, subLabel, onPress, isDanger, iconBgStyle, iconColor, isLast, hasChevron = true }) => (
  <TouchableOpacity style={[styles.menuItem, isLast && styles.menuItemLast]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, iconBgStyle]}>
      <Ionicons name={icon} size={20} color={iconColor || (isDanger ? colors.danger : colors.primary)} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>{label}</Text>
      {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
    </View>
    {hasChevron && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
  </TouchableOpacity>
);

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { profile, loading, logout } = useProfile();
  const userType = profile?.userType || 'informal';
  const isPyme = userType === 'pyme';
  const setLogin = useAuthStore((state) => state.setLogin);
  const enableAssistantMode = useAssistantModeStore((state) => state.enableMode);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({ title: '', message: '', onConfirm: null });

  const openDeleteModal = (title, message, onConfirm) => {
    setDeleteModalConfig({ title, message, onConfirm });
    setDeleteModalVisible(true);
  };

  const handleGrowToPyme = () => {
    Alert.alert(
      'Crecer a PYME',
      '¿Deseas actualizar tu cuenta a PYME? Esta acción no se puede deshacer desde aquí.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await businessService.updateBusinessInfo({ ui_mode: 'advanced' });
              const session = await authService.getCurrentSession();
              if (session?.user) {
                setLogin(session.user, session.token);
              }
            } catch (err) {
              Alert.alert(
                'No se pudo actualizar',
                err?.message || 'Ocurrió un error inesperado. Intenta de nuevo.'
              );
            }
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    openDeleteModal(
      '¿Estás seguro?',
      'Esta acción eliminará tu cuenta permanentemente junto con todos los datos del negocio. No se puede deshacer.',
      async () => {
        try {
          await businessService.deleteAccount();
          Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada permanentemente.', [
            { text: 'OK', onPress: () => logout() },
          ]);
        } catch (err) {
          Alert.alert(
            'No se pudo eliminar la cuenta',
            err?.message || 'Ocurrió un error inesperado. Intenta de nuevo.'
          );
        }
      }
    );
  };

  const confirmDeleteData = () => {
    openDeleteModal(
      '¿Estás seguro?',
      'Se eliminarán todas las transacciones, facturas, fiados y movimientos. Se conservarán tus productos, clientes y configuración.',
      async () => {
        try {
          const result = await businessService.deleteData();
          if (result?.has_data === false) {
            Alert.alert('Sin datos', 'No hay datos para eliminar.');
          } else {
            Alert.alert('Datos eliminados exitosamente', 'Tu historial y transacciones han sido eliminados.', [
              { text: 'OK', onPress: () => logout() },
            ]);
          }
        } catch (err) {
          Alert.alert(
            'No se pudieron eliminar los datos',
            err?.message || 'Ocurrió un error inesperado. Intenta de nuevo.'
          );
        }
      }
    );
  };

  const handleEnterAssistantMode = () => {
    enableAssistantMode();
    navigation.navigate('AssistantSelect');
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')} style={styles.backButton}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Tarjeta de Perfil Profesional */}
          <View style={styles.profileCardWrapper}>
            <View style={styles.profileCard}>
              {/* Bloque Destacado con Fondo Sutil y Centrado */}
              <View style={styles.profileHeaderBlock}>
                <View style={styles.avatarContainer}>
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.border }} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>

                <Text style={styles.profileName}>
                  {profile?.name || 'Usuario'}
                </Text>

                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{userType === 'pyme' ? 'PYME' : 'Informal'}</Text>
                </View>

                {profile?.businessName && (
                  <Text style={styles.profileBusinessName}>
                    {profile.businessName}
                  </Text>
                )}
              </View>

              {/* Sección Inferior: Información Contextual */}
              <View style={styles.infoList}>
                {profile?.email && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      {profile.email}
                    </Text>
                  </View>
                )}

                {profile?.phone && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color={colors.textMuted} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      {profile.phone}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} style={styles.infoIcon} />
                  <Text style={styles.infoText}>
                    Rol: {profile?.role || 'Miembro'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cuerpo del Menú (fusionado desde SettingsScreen.jsx) */}
          <View style={styles.bodyContainer}>
            {/* "Ajustes de Negocio" es exclusiva de PYME. El informal no maneja
                asistentes ni esos ajustes, y tampoco tiene notificaciones que
                configurar: las alertas existentes avisan al dueño de lo que hace
                un ASISTENTE (ver notifications_service.notify_owner_of_assistant_action)
                y en informal el dueño hace todo él mismo, así que la pantalla no
                le ofrecía nada. Al quitar Notificaciones, esta sección se queda
                sin un solo ítem en informal — por eso se oculta entera en vez de
                dejar un encabezado vacío. */}
            {isPyme && (
              <MenuSection title="Ajustes de Negocio">
                <MenuItem
                  icon="people-outline"
                  label="Equipo"
                  subLabel="Gestionar colaboradores"
                  iconBgStyle={styles.iconContainerBusiness}
                  iconColor={colors.primary}
                  onPress={() => navigation.navigate('TeamScreen')}
                />
                {profile?.role === 'owner' && (
                  <MenuItem
                    icon="time-outline"
                    label="Horario de Ventas"
                    subLabel="Define cuándo se puede abrir la caja y vender"
                    iconBgStyle={styles.iconContainerBusiness}
                    iconColor={colors.primary}
                    onPress={() => navigation.navigate('SalesSchedule')}
                  />
                )}
                {profile?.role === 'owner' && (
                  <MenuItem
                    icon="trophy-outline"
                    label="Meta Mensual"
                    subLabel="Objetivo de ventas del mes"
                    iconBgStyle={styles.iconContainerBusiness}
                    iconColor={colors.primary}
                    onPress={() => navigation.navigate('MonthlyGoal')}
                  />
                )}
                <MenuItem
                  icon="people-circle-outline"
                  label="Entrar a Modo Asistente"
                  subLabel="Operar con acceso limitado de un asistente"
                  iconBgStyle={styles.iconContainerBusiness}
                  iconColor={colors.primary}
                  onPress={handleEnterAssistantMode}
                />
                <MenuItem
                  icon="notifications-outline"
                  label="Notificaciones"
                  subLabel="Alertas y avisos"
                  iconBgStyle={styles.iconContainerBusiness}
                  iconColor={colors.primary}
                  onPress={() => navigation.navigate('NotificationSettings')}
                />
                <MenuItem
                  icon="apps-outline"
                  label="Aplicación"
                  subLabel="Personalización y ajustes"
                  iconBgStyle={styles.iconContainerBusiness}
                  iconColor={colors.primary}
                  isLast={true}
                  onPress={() => navigation.navigate('AppSettingsScreen')}
                />
              </MenuSection>
            )}

            {userType === 'informal' && (
              <MenuSection title="Tipo de Cuenta">
                <MenuItem
                  icon="trending-up-outline"
                  label="Crecer a PYME"
                  subLabel="Desbloquea facturación, categorías e inventario avanzado"
                  iconBgStyle={styles.iconContainerBusiness}
                  iconColor={colors.primary}
                  isLast={true}
                  onPress={handleGrowToPyme}
                />
              </MenuSection>
            )}

            <MenuSection title="Seguridad y Cuenta">
              <MenuItem
                icon="shield-checkmark-outline"
                label="Seguridad"
                subLabel="Verificación en dos pasos / Biometría"
                iconBgStyle={styles.iconContainerBusiness}
                iconColor={colors.primary}
                onPress={() => navigation.navigate('SecuritySettings')}
              />
              <MenuItem
                icon="help-circle-outline"
                label="Ayuda"
                subLabel="Soporte y tutoriales"
                iconBgStyle={styles.iconContainerBusiness}
                iconColor={colors.primary}
                isLast={true}
                onPress={() => {}}
              />
            </MenuSection>

            <MenuSection title="Zona de riesgo">
              <MenuItem
                icon="trash-outline"
                label="Borrar cuenta"
                subLabel="Eliminar tu cuenta permanentemente"
                isDanger
                iconBgStyle={styles.iconContainerDanger}
                iconColor={colors.danger}
                onPress={confirmDeleteAccount}
              />
              <MenuItem
                icon="refresh-outline"
                label="Borrar datos"
                subLabel="Reiniciar historial y transacciones"
                isDanger
                iconBgStyle={styles.iconContainerDanger}
                iconColor={colors.danger}
                isLast={true}
                onPress={confirmDeleteData}
              />
            </MenuSection>

            {/* Botón de Cerrar Sesión */}
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.primary + '15' }]}
              onPress={logout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.primary} style={styles.logoutIcon} />
              <Text style={[styles.logoutButtonText, { color: colors.primary }]}>Cerrar Sesión</Text>
            </TouchableOpacity>

            {profile?.joinedDate && (
              <Text style={styles.joinedDateText}>Miembro desde {profile.joinedDate}</Text>
            )}
          </View>
        </ScrollView>

        <ConfirmDeleteModal
          visible={deleteModalVisible}
          title={deleteModalConfig.title}
          message={deleteModalConfig.message}
          onConfirm={() => {
            setDeleteModalVisible(false);
            deleteModalConfig.onConfirm?.();
          }}
          onCancel={() => setDeleteModalVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProfileScreen;
