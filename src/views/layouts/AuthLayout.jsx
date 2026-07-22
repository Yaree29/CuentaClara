import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import styles from '../styles/auth.styles';

/**
 * Layout compartido por las pantallas de autenticación.
 *
 * Nuevo diseño (estructura tipo "app fitness" del mockup, con la paleta
 * azul oscuro de CuentaClara en vez de rojo): zona superior degradada con
 * el título de la pantalla + tarjeta blanca redondeada inferior que
 * contiene el formulario.
 *
 * Retrocompatibilidad: si no se pasa `title`, se renderiza el layout
 * simple anterior (fondo plano + tarjeta centrada) para no afectar
 * pantallas que no fueron parte de este rediseño (RecoveryOptions,
 * ResetPassword).
 */
const AuthLayout = ({ children, title, subtitle, showBack = false, onBack }) => {
  const insets = useSafeAreaInsets();

  // ---- Layout antiguo (sin título): se conserva intacto ----
  if (!title) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ---- Layout nuevo: encabezado degradado + tarjeta inferior ----
  const headerHeight = 210 + insets.top;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { height: headerHeight }]}>
        {/* Capa de fondo: SIN padding, para que el degradado cubra
            el ancho/alto completo del header (antes quedaba recortado
            porque compartía la vista con paddingHorizontal). */}
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="authHeaderGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primaryDark} stopOpacity="1" />
              <Stop offset="0.55" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="400" height="400" fill="url(#authHeaderGradient)" />
        </Svg>

        {/* Capa de contenido: aquí sí va el padding, por encima del fondo. */}
        <View style={[styles.headerContent, { paddingTop: insets.top + 18 }]}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textWhite} />
            </TouchableOpacity>
          )}

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.cardArea}
      >
        <ScrollView
          contentContainerStyle={styles.cardScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardNew}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthLayout;