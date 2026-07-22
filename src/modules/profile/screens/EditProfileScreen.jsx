import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useProfile from '../hooks/useProfile';
import authService from '../../auth/services/authService';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import { StyleSheet } from 'react-native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { profile, reloadProfile } = useProfile();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [avatarUri, setAvatarUri] = useState(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setBusinessName(profile.businessName || '');
      setAvatarUri(profile.avatar_url || null);
    }
  }, [profile]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setAvatarBase64(result.assets[0].base64);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !businessName.trim()) {
      Alert.alert('Error', 'El nombre y el nombre del negocio son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({
        name,
        phone,
        business_name: businessName,
        avatar_base64: avatarBase64,
      });
      await reloadProfile();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.backButton}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={editStyles.saveText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={editStyles.container} showsVerticalScrollIndicator={false}>

          <View style={editStyles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={editStyles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={editStyles.avatarImage} />
              ) : (
                <View style={[styles.avatarContainer, { marginBottom: 0 }]}>
                  <Text style={styles.avatarText}>
                    {name.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={editStyles.editIconBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={editStyles.avatarHint}>Toca para cambiar foto</Text>
          </View>

          <View style={editStyles.formGroup}>
            <Text style={editStyles.label}>Información Personal</Text>
            <View style={editStyles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} style={editStyles.inputIcon} />
              <TextInput
                style={editStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu Nombre"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={editStyles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} style={editStyles.inputIcon} />
              <TextInput
                style={editStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={editStyles.formGroup}>
            <Text style={editStyles.label}>Información del Negocio</Text>
            <View style={editStyles.inputContainer}>
              <Ionicons name="storefront-outline" size={20} color={colors.textMuted} style={editStyles.inputIcon} />
              <TextInput
                style={editStyles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Nombre del Negocio"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const editStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.border,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    height: '100%',
  },
});

export default EditProfileScreen;
