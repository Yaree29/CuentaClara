import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useProfile } from '../hooks/useProfile';
import styles from '../styles/profile.styles';

const ProfileScreen = () => {
  const { profile, loading, logout } = useProfile();

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
      <Text style={styles.title}>Mi Perfil</Text>

      <View style={styles.infoCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>
        <Text style={styles.userEmail}>Rol: {profile?.role}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Negocio</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{profile?.businessName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Miembro desde:</Text>
          <Text style={styles.value}>{profile?.joinedDate}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </MainLayout>
  );
};

export default ProfileScreen;
