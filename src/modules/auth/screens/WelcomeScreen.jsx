import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import styles from '../styles/Welcome.styles';

const WelcomeScreen = ({ navigation }) => {
  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.title}>CuentaClara</Text>
        <Text style={styles.subtitle}>Gestión inteligente para tu negocio</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonOutline]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, styles.buttonTextOutline]}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

export default WelcomeScreen;