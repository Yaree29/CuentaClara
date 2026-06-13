import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useProfile from '../hooks/useProfile';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';

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
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Tarjeta de Perfil Profesional */}
          <View style={styles.profileCardWrapper}>
            <View style={styles.profileCard}>
              {/* Bloque Destacado con Fondo Sutil y Centrado */}
              <View style={styles.profileHeaderBlock}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                
                <Text style={styles.profileName}>
                  {profile?.name || 'Usuario'}
                </Text>
                
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Perfil Informal</Text>
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

          {/* Cuerpo del Menú */}
          <View style={styles.bodyContainer}>
            <MenuSection title="Ajustes de Negocio">
              <MenuItem
                icon="people-outline"
                label="Equipo"
                subLabel="Gestionar colaboradores"
                iconBgStyle={styles.iconContainerBusiness}
                iconColor={colors.primary}
                onPress={() => {}}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notificaciones"
                subLabel="Alertas y avisos"
                iconBgStyle={styles.iconContainerNotifications}
                iconColor={colors.warning}
                onPress={() => {}}
              />
              <MenuItem
                icon="apps-outline"
                label="Aplicación"
                subLabel="Personalización y ajustes"
                iconBgStyle={styles.iconContainerApp}
                iconColor={colors.success}
                isLast={true}
                onPress={() => {}}
              />
            </MenuSection>

            <MenuSection title="Seguridad y Cuenta">
              <MenuItem
                icon="shield-checkmark-outline"
                label="Seguridad"
                subLabel="Verificación en dos pasos / Biometría"
                iconBgStyle={styles.iconContainerSecurity}
                iconColor={colors.info}
                onPress={() => navigation.navigate('SecuritySettings')}
              />
              <MenuItem
                icon="help-circle-outline"
                label="Ayuda"
                subLabel="Soporte y tutoriales"
                iconBgStyle={styles.iconContainerHelp}
                iconColor={colors.primaryLight}
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
                onPress={() => {}}
              />
              <MenuItem
                icon="refresh-outline"
                label="Borrar datos"
                subLabel="Reiniciar historial y transacciones"
                isDanger
                iconBgStyle={styles.iconContainerDanger}
                iconColor={colors.danger}
                isLast={true}
                onPress={() => {}}
              />
            </MenuSection>

            {/* Botón de Cerrar Sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={colors.logoutText} style={styles.logoutIcon} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            {profile?.joinedDate && (
              <Text style={styles.joinedDateText}>Miembro desde {profile.joinedDate}</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProfileScreen;
