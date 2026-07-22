import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
// SafeAreaView debe venir de react-native-safe-area-context: el de 'react-native'
// es un no-op en Android (solo aplica en iOS), así que el enlace inferior
// "¿Ya tienes una cuenta? Inicia sesión" quedaba debajo de la barra de
// navegación del sistema (app.json tiene edgeToEdgeEnabled).
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import colors from '../../../theme/colors';
import styles from '../styles/welcome.styles';
import { markWelcomeSeen } from '../utils/firstLaunch';

// Pantalla que solo se muestra una vez, la primera vez que alguien nuevo
// abre la app (nunca la ha usado). Tras continuar, se marca como vista y
// el usuario sigue con el flujo normal de registro.
const WelcomeScreen = ({ navigation }) => {
  const handleContinue = async () => {
    await markWelcomeSeen();
    navigation.replace('Register');
  };

  const handleGoToLogin = async () => {
    await markWelcomeSeen();
    navigation.replace('Login');
  };

  return (
    <View style={styles.screen}>
      <Svg style={styles.gradient} width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="welcomeGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primaryDark} stopOpacity="1" />
            <Stop offset="0.6" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="800" fill="url(#welcomeGradient)" />
      </Svg>

      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <View style={styles.centerBlock}>
          <Image
            source={require('../../../utils/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.brand}>CuentaClara</Text>

          <View style={styles.welcomeTextWrap}>
            <Text style={styles.welcomeTitle}>Bienvenido</Text>
            <Text style={styles.welcomeSubtitle}>
              Organiza las ventas, gastos e inventario de tu negocio en un solo lugar.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Comenzar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryLink} onPress={handleGoToLogin}>
            <Text style={styles.secondaryLinkText}>
              ¿Ya tienes una cuenta? <Text style={styles.secondaryLinkTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeScreen;
