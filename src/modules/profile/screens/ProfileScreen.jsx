import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useProfile from '../hooks/useProfile';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';

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
                  <Text style={styles.badgeText}>{profile?.userType === 'pyme' ? 'PYME' : 'Informal'}</Text>
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
