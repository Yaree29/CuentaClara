import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useProfile from '../hooks/useProfile';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';

const MenuItem = ({ icon, label, subLabel, onPress, isDanger, hasChevron = true }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, isDanger && styles.iconContainerDanger]}>
      <Ionicons name={icon} size={22} color={isDanger ? colors.danger : colors.primary} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>{label}</Text>
      {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
    </View>
    {hasChevron && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
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
              {/* Sección Superior: Avatar y Nombre */}
              <View style={styles.profileCardHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.profileMainInfo}>
                  <Text style={styles.profileName}>
                    {profile?.name || 'Usuario'}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {profile?.email}
                  </Text>
                </View>
              </View>

              {/* Separador */}
              <View style={styles.separator} />

              {/* Sección Inferior: Información Contextual */}
              <View style={styles.infoList}>
                {profile?.phone && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color={colors.textMuted} />
                    <Text style={styles.infoText}>
                      {profile.phone}
                    </Text>
                  </View>
                )}
                
                {profile?.businessName && (
                  <View style={styles.infoRow}>
                    <Ionicons name="briefcase-outline" size={20} color={colors.textMuted} />
                    <Text style={styles.infoText}>
                      {profile.businessName}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} />
                  <Text style={styles.infoText}>
                    Rol: {profile?.role || 'Miembro'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cuerpo del Menú */}
          <View style={styles.bodyContainer}>
            <MenuSection title="Opciones">
              <MenuItem
                icon="shield-checkmark-outline"
                label="Seguridad"
                subLabel="Verificación en dos pasos / Biometría"
                onPress={() => navigation.navigate('SecuritySettings')}
              />
              <MenuItem
                icon="people-outline"
                label="Equipo"
                subLabel="Gestionar colaboradores"
                onPress={() => {}}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notificaciones"
                subLabel="Alertas y avisos"
                onPress={() => {}}
              />
              <MenuItem
                icon="apps-outline"
                label="Aplicación"
                subLabel="Personalización y ajustes"
                onPress={() => {}}
              />
              <MenuItem
                icon="help-circle-outline"
                label="Ayuda"
                subLabel="Soporte y tutoriales"
                onPress={() => {}}
              />
            </MenuSection>

            <MenuSection title="Zona de riesgo">
              <MenuItem
                icon="trash-outline"
                label="Borrar cuenta"
                isDanger
                onPress={() => {}}
              />
              <MenuItem
                icon="refresh-outline"
                label="Borrar datos"
                isDanger
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
