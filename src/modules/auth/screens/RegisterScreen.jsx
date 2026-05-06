import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import styles from '../styles/register.styles';
import registerService from '../services/registerService';

const RegisterScreen = ({ navigation }) => {

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    profileType: '', // 'emprendedor' | 'empresa'
    category: '',

    // Empresa
    nit: '',
    address: '',

    // Emprendedor
    businessType: '',
    avgPrice: '',
    taxEnabled: false,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (value) => {
    const emailPattern = /^\S+@\S+\.\S+$/;
    return emailPattern.test((value || '').trim());
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    // validar antes de avanzar (ej: contraseña mínima)
    if (step === 1) {
      const normalizedEmail = formData.email.trim().toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        setEmailError('Ingresa un correo válido.');
        setPasswordError('');
        Alert.alert('Correo inválido', 'Ingresa un correo válido.');
        return;
      }

      if (!formData.password || formData.password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres.');
        setEmailError('');
        Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      if (emailError) setEmailError('');
      setPasswordError('');
    }

    setStep(step + 1);
  };

  const handleRegister = () => {
    (async () => {
      try {
        setLoading(true);
        // protección adicional antes de enviar
        const normalizedEmail = formData.email.trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
          setEmailError('Ingresa un correo válido.');
          setPasswordError('');
          Alert.alert('Correo inválido', 'Ingresa un correo válido.');
          return;
        }

        if (!formData.password || formData.password.length < 6) {
          setPasswordError('La contraseña debe tener al menos 6 caracteres.');
          setEmailError('');
          Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
          return;
        }
        const payload = {
          ...formData,
          email: normalizedEmail,
          categoryId: formData.category || null,
        };

        const result = await registerService.register(payload);
        // registro ok, el AuthProvider debería detectar la sesión y navegar
        Alert.alert('Registro', 'Registro completado correctamente');
      } catch (error) {
        console.error('Error en registro:', error);
        const message = error?.message || String(error);

        if (/rate limit/i.test(message)) {
          Alert.alert('Demasiados intentos', 'Hubo demasiados intentos de registro con este correo. Espera unos minutos e inténtalo otra vez.');
          return;
        }

        if (/invalid/i.test(message) && /email/i.test(message)) {
          setEmailError('Ingresa un correo válido.');
          Alert.alert('Correo inválido', 'Ingresa un correo válido.');
          return;
        }

        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await registerService.getCategories();
        if (mounted) setCategories(cats);
      } catch (e) {
        console.error('No se pudieron cargar categorias:', e);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <AuthLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {step > 1 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            style={{ alignSelf: 'flex-start', marginBottom: 12 }}
          >
            <Text style={styles.linkText}>Atrás</Text>
          </TouchableOpacity>
        )}
        
        {/* STEP 1 - REGISTRO UNIVERSAL */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Información básica</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={formData.name}
                onChangeText={(val) => updateField('name', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={formData.lastName}
                onChangeText={(val) => updateField('lastName', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={formData.email}
                onChangeText={(val) => {
                  updateField('email', val);
                  if (emailError) setEmailError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoComplete="email"
              />

              {emailError ? (
                <Text style={{ color: 'red', marginBottom: 8 }}>{emailError}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => updateField('password', val)}
              />

              {passwordError ? (
                <Text style={{ color: 'red', marginBottom: 8 }}>{passwordError}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.phone}
                onChangeText={(val) => updateField('phone', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Nombre del negocio"
                value={formData.businessName}
                onChangeText={(val) => updateField('businessName', val)}
              />

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 2 - SELECCIÓN DE PERFIL */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Selecciona tu perfil</Text>

            <View style={styles.form}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  updateField('profileType', 'emprendedor');
                  handleNext();
                }}
              >
                <Text style={styles.buttonText}>Emprendedor (Rápido)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  updateField('profileType', 'empresa');
                  handleNext();
                }}
              >
                <Text style={styles.buttonText}>Empresa PYME</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 3 - FORM DINÁMICO */}
        {step === 3 && formData.profileType === 'empresa' && (
          <>
            <Text style={styles.title}>Configuración Empresa</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="NIT / Identificación"
                value={formData.nit}
                onChangeText={(val) => updateField('nit', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={formData.address}
                onChangeText={(val) => updateField('address', val)}
              />

              <Text style={styles.subtitle}>Categoría del negocio</Text>

              {categories.length === 0 ? (
                <Text>Cargando categorías...</Text>
              ) : (
                categories.map((c) => (
                  <TouchableOpacity key={c.id} onPress={() => updateField('category', c.id)}>
                    <Text style={{ paddingVertical: 6 }}>{c.name}</Text>
                  </TouchableOpacity>
                ))
              )}

              {/* EJEMPLO DINÁMICO */}
              {formData.category === 'alimentos' && (
                <>
                  <TextInput style={styles.input} placeholder="Unidad de medida (Kg/Lb)" />
                  <TextInput style={styles.input} placeholder="Merma estimada (%)" />
                </>
              )}

              {formData.category === 'servicios' && (
                <>
                  <TextInput style={styles.input} placeholder="Duración promedio (min)" />
                </>
              )}

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Finalizar'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 3 - EMPRENDEDOR */}
        {step === 3 && formData.profileType === 'emprendedor' && (
          <>
            <Text style={styles.title}>Configuración rápida</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="¿Qué vendes?"
                value={formData.businessType}
                onChangeText={(val) => updateField('businessType', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Precio promedio"
                value={formData.avgPrice}
                onChangeText={(val) => updateField('avgPrice', val)}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => updateField('taxEnabled', !formData.taxEnabled)}
              >
                <Text style={styles.buttonText}>
                  Impuesto 7%: {formData.taxEnabled ? 'Activo' : 'Inactivo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* LINK */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </AuthLayout>
  );
};

export default RegisterScreen;