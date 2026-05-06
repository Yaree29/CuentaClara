import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import styles from '../styles/register.styles';
import registerService from '../services/registerService';
import useAuthStore from '../../../store/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateBusinessName, 
  validatePhone,
  getPasswordStrength
} from '../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const setLogin = useAuthStore((state) => state.setLogin);
  const { linkBiometricSession, isBiometricAvailable } = useAuth();
  const [step, setStep] = useState(1);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    profileType: '', 
    category: '',

    nit: '',
    address: '',

    businessType: '',
    avgPrice: '',
    taxEnabled: false,
    handlesTips: false,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({ level: 'débil', percentage: 0 });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (field === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };


  const handleNext = () => {
    const newErrors = {};

    if (step === 1) {
      // Validar nombre
      const nameValidation = validateName(formData.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error;
      }

      // Validar email
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error;
      }

      // Validar contraseña
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error;
      }

      // Validar teléfono (opcional)
      if (formData.phone) {
        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.valid) {
          newErrors.phone = phoneValidation.error;
        }
      }

      // Validar nombre del negocio
      const businessValidation = validateBusinessName(formData.businessName);
      if (!businessValidation.valid) {
        newErrors.businessName = businessValidation.error;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstError = Object.values(newErrors)[0];
        Alert.alert('Datos inválidos', firstError);
        return;
      }

      setErrors({});
    }

    setStep(step + 1);
  };

  const handleBack = () => {
  if (step > 1) {
    setStep(step - 1);
  } else {
    navigation.goBack();
  }
};

const renderCategoryFields = () => {
  switch (formData.category) {
    case 'alimentos':
      return <AlimentosFields />;
    case 'servicios':
      return <ServiciosFields />;
    case 'comercio':
      return <ComercioFields />;
    case 'restaurante':
      return <RestauranteFields />;
    case 'general':
      return <GeneralFields />;
    default:
      return null;
  }
};

const handleCategoryChange = (value) => {
  setTimeout(() => {
    updateField('category', value);
  }, 0);
};

const AlimentosFields = () => (
  <>
    <TextInput placeholder="Unidad de medida (Kg/Lb)" style={styles.input} />
    <TextInput placeholder="Merma estimada (%)" style={styles.input} />

    <TouchableOpacity style={styles.button}  onPress={() => updateField('taxEnabled', !formData.taxEnabled)}>
      <Text style={styles.buttonText}>
        ¿Usas balanza digital con etiquetas? {formData.taxEnabled ? 'Sí' : 'No'}
      </Text>
    </TouchableOpacity>
  </>
);

const ServiciosFields = () => (
  <>
    <TouchableOpacity style={styles.button} onPress={() => updateField('taxEnabled', !formData.taxEnabled)}>
      <Text style={styles.buttonText}>
        ¿Cobra por comisión de empleado? {formData.taxEnabled ? 'Sí' : 'No'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={() => updateField('handlesTips', !formData.handlesTips)}>
      <Text style={styles.buttonText}>
        ¿Vendes productos físicos además del servicio? {formData.handlesTips ? 'Sí' : 'No'}
      </Text>
    </TouchableOpacity>
  </>
);

const ComercioFields = () => (
  <>
    <TouchableOpacity style={styles.button} onPress={() => updateField('taxEnabled', !formData.taxEnabled)}>
      <Text style={styles.buttonText}>
        ¿Tu negocio usa códigos de barras? {formData.taxEnabled ? 'Sí' : 'No'}
      </Text>
    </TouchableOpacity>
  </>
);

const RestauranteFields = () => (
  <>
    <TouchableOpacity style={styles.button} onPress={() => updateField('taxEnabled', !formData.taxEnabled)}>
      <Text style={styles.buttonText}>
        ¿Transformas materia prima? {formData.taxEnabled ? 'Sí' : 'No'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={() => updateField('handlesTips', !formData.handlesTips)}>
      <Text style={styles.buttonText}>
        ¿Manejas propinas? {formData.handlesTips ? 'Sí' : 'No'}
      </Text>
    </TouchableOpacity>
  </>
);

const GeneralFields = () => (
  <>
    <Text style={styles.subtitle}>
      Inventario simple + reportes básicos activados
    </Text>
  </>
);

  const handleRegister = () => {
    (async () => {
      try {
        setLoading(true);
        
        // Validaciones finales
        const newErrors = {};

        const nameValidation = validateName(formData.name);
        if (!nameValidation.valid) newErrors.name = nameValidation.error;

        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) newErrors.email = emailValidation.error;

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) newErrors.password = passwordValidation.error;

        if (formData.phone) {
          const phoneValidation = validatePhone(formData.phone);
          if (!phoneValidation.valid) newErrors.phone = phoneValidation.error;
        }

        const businessValidation = validateBusinessName(formData.businessName);
        if (!businessValidation.valid) newErrors.businessName = businessValidation.error;

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          const firstError = Object.values(newErrors)[0];
          Alert.alert('Datos inválidos', firstError);
          return;
        }

        const payload = {
          ...formData,
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          businessName: formData.businessName.trim(),
          phone: formData.phone ? formData.phone.replace(/[\s\-\(\)]/g, '') : null,
          categoryId: formData.category || null,
        };

        const result = await registerService.register(payload);
        
        // Si la biometría está disponible, mostrar opción de vinculación
        if (biometricAvailable) {
          Alert.alert(
            'Registro Exitoso',
            '¿Deseas activar el inicio de sesión con huella dactilar/rostro para futuras ocasiones?',
            [
              {
                text: 'No, gracias',
                style: 'cancel',
                onPress: () => {
                  setLogin(result.user, result.token);
                }
              },
              {
                text: 'Sí, activar',
                onPress: async () => {
                  try {
                    const biometricService = require('../services/biometricService').default;
                    const available = await biometricService.isAvailable();
                    if (available) {
                      await biometricService.saveSession({ user: result.user, token: result.token });
                      Alert.alert('¡Listo!', 'Biometría vinculada correctamente.');
                    } else {
                      Alert.alert('Aviso', 'Tu dispositivo no soporta biometría.');
                    }
                  } catch (e) {
                    console.error(e);
                    Alert.alert('Error', 'No se pudo vincular la biometría.');
                  } finally {
                    setLogin(result.user, result.token);
                  }
                }
              }
            ]
          );
        } else {
          // Si no está disponible, login automático directamente
          setLogin(result.user, result.token);
          Alert.alert('Registro', 'Registro completado correctamente');
        }
      } catch (error) {
        console.error('Error en registro:', error);
        const message = error?.message || String(error);

        if (/rate limit/i.test(message)) {
          Alert.alert('Demasiados intentos', 'Hubo demasiados intentos de registro con este correo. Espera unos minutos e inténtalo otra vez.');
          return;
        }

        if (/invalid/i.test(message) && /email/i.test(message)) {
          setErrors({ ...errors, email: 'Ingresa un correo válido.' });
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
        
        // Verifica disponibilidad de biometría
        const biometricEnabled = await isBiometricAvailable();
        if (mounted) setBiometricAvailable(biometricEnabled);
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
        
        {step === 1 && (
          <>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Información básica</Text>

            <View style={styles.form}>
              <View>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nombre"
                  value={formData.name}
                  onChangeText={(val) => updateField('name', val)}
                  maxLength={100}
                />
                {errors.name ? <Text style={styles.errorMessage}>{errors.name}</Text> : null}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={formData.lastName}
                onChangeText={(val) => updateField('lastName', val)}
              />

              <View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChangeText={(val) => updateField('email', val)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoComplete="email"
                />
                {errors.email ? <Text style={styles.errorMessage}>{errors.email}</Text> : null}
              </View>

              <View>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Contraseña"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(val) => updateField('password', val)}
                  maxLength={128}
                />
                {formData.password ? (
                  <Text style={[styles.helperText, passwordStrength.level === 'fuerte' && styles.strongPassword]}>
                    Fortaleza: {passwordStrength.level} ({passwordStrength.percentage}%)
                  </Text>
                ) : null}
                {errors.password ? <Text style={styles.errorMessage}>{errors.password}</Text> : null}
              </View>

              <View>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Teléfono (opcional)"
                  value={formData.phone}
                  onChangeText={(val) => updateField('phone', val)}
                  keyboardType="phone-pad"
                />
                {errors.phone ? <Text style={styles.errorMessage}>{errors.phone}</Text> : null}
              </View>

              <View>
                <TextInput
                  style={[styles.input, errors.businessName && styles.inputError]}
                  placeholder="Nombre del negocio"
                  value={formData.businessName}
                  onChangeText={(val) => updateField('businessName', val)}
                  maxLength={100}
                />
                {errors.businessName ? <Text style={styles.errorMessage}>{errors.businessName}</Text> : null}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <TouchableOpacity onPress={handleBack}>
              <Text>← Volver</Text>
            </TouchableOpacity>

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

        {step === 3 && formData.profileType === 'empresa' && (
          <>
          <TouchableOpacity onPress={handleBack}>
            <Text>← Volver</Text>
          </TouchableOpacity>

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

              {renderCategoryFields()}

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Finalizar'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && formData.profileType === 'emprendedor' && (
          <>
          <TouchableOpacity onPress={handleBack}>
            <Text>← Volver</Text>
          </TouchableOpacity>

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

        {step === 4 && registeredUser && (
          <>
            <Text style={styles.title}>Vinculación de Huella</Text>
            <Text style={styles.subtitle}>
              ¿Deseas vincular tu huella digital para inicios de sesión rápidos?
            </Text>

            <View style={styles.form}>
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  try {
                    setBiometricLoading(true);
                    await linkBiometricSession(registeredUser.user, registeredUser.token);
                    setLogin(registeredUser.user, registeredUser.token);
                    Alert.alert('Éxito', 'Huella vinculada correctamente. ¡Bienvenido!');
                  } catch (err) {
                    Alert.alert('Error', 'No se pudo vincular la huella. Intenta de nuevo.');
                    console.error('Biometric linking error:', err);
                  } finally {
                    setBiometricLoading(false);
                  }
                }}
                disabled={biometricLoading}
              >
                <Text style={styles.buttonText}>
                  {biometricLoading ? 'Vinculando...' : 'Sí, vincular huella'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#6c757d' }]}
                onPress={() => {
                  setLogin(registeredUser.user, registeredUser.token);
                  Alert.alert('Registro', 'Registro completado correctamente');
                }}
              >
                <Text style={styles.buttonText}>No, hacerlo después</Text>
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