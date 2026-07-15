import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '../../../views/layouts/AuthLayout';
import colors from '../../../theme/colors';
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
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    profileType: '',
    industryTemplateId: null, // Sincronizado con IDs reales (1-5)
    categoryId: null,
    nit: '',
    address: '',
    logoUrl: '',
    settings: {
      // Alimentos (ID: 1)
      unitOfMeasure: 'Kg', 
      wasteMargin: '0',
      useDigitalScale: 'No',
      
      // Servicios (ID: 2)
      employeeCommission: 'No',
      sellPhysicalProducts: 'No',
      
      // Comercio (ID: 3)
      useBarcodes: 'No',
      
      // Restaurante / Alimentos Preparados (ID: 4)
      transformsRawMaterial: 'No',
      manageTips: 'No',
      
      // General (ID: 5 o Default)
      salesFormat: 'Mostrador', 
      taxRate: '7.00',
      simplifiedInventory: 'Sí',
      basicReports: 'Sí',
    },
    businessType: '',
    avgPrice: '',
    taxEnabled: false,
  });

  const [templates, setTemplates] = useState([]);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (field === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const updateSettingField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const handleNext = () => {
    const newErrors = {};

    if (step === 1) {
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
          setLoading(false);
          return;
        }

        if (formData.profileType === 'empresa') {
          if (!formData.nit || !formData.nit.trim()) {
            Alert.alert('Datos inválidos', 'El RUC/NIT/Identificación Tributaria es obligatorio.');
            setLoading(false);
            return;
          }
          if (!formData.industryTemplateId) {
            Alert.alert('Datos inválidos', 'Debes seleccionar la Categoría de tu Negocio.');
            setLoading(false);
            return;
          }
        }

        const payload = {
          ...formData,
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          businessName: formData.businessName.trim(),
          phone: formData.phone ? formData.phone.replace(/[\s\-\(\)]/g, '') : null,
          industryTemplateId: formData.industryTemplateId || null,
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
                    await linkBiometricSession(result.user);
                    Alert.alert('¡Listo!', 'Biometría vinculada correctamente.');
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
        const [tmplData, biometricEnabled] = await Promise.all([
          registerService. getCategories(),
          isBiometricAvailable(),
        ]);
        if (mounted) {
          setTemplates(tmplData);
          setBiometricAvailable(biometricEnabled);
        }
      } catch (e) {
        console.error('Error al cargar datos de registro:', e);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <AuthLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {step > 1 && (
          <TouchableOpacity
            onPress={handleBack}
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
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Contraseña"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(val) => updateField('password', val)}
                    maxLength={128}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
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
            <Text style={styles.title}>Configuración Empresa</Text>

            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Sección General</Text>
              
              <TextInput
                style={styles.input}
                placeholder="RUC / NIT / Identificación Tributaria *"
                value={formData.nit}
                onChangeText={(val) => updateField('nit', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección Física"
                value={formData.address}
                onChangeText={(val) => updateField('address', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="URL del Logo (opcional)"
                value={formData.logoUrl}
                onChangeText={(val) => updateField('logoUrl', val)}
              />

              <Text style={styles.sectionTitle}>Categoría de Negocio</Text>

              {/* Combobox de plantillas */}
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setTemplatePickerOpen(!templatePickerOpen)}
              >
                <Text>
                  {formData.industryTemplateId
                    ? (() => {
                        const t = templates.find((t) => t.id === formData.industryTemplateId);
                        return t ? `${t.icon}  ${t.name}` : 'Selecciona la categoría';
                      })()
                    : 'Selecciona la categoría del negocio ▾'}
                </Text>
              </TouchableOpacity>

              {templatePickerOpen && (
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8 }}>
                  {templates.length === 0 ? (
                    <ActivityIndicator style={{ padding: 16 }} />
                  ) : (
                    templates.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => {
                          updateField('industryTemplateId', t.id);
                          updateField('categoryId', t.id); 
                          setTemplatePickerOpen(false);
                        }}
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                      >
                        <Text>{t.icon}  {t.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* CONFIGURACIÓN OPERATIVA DINÁMICA CORREGIDA */}
              {formData.industryTemplateId && (
                <>
                  <Text style={styles.sectionTitle}>Configuración Operativa</Text>
                  <View style={styles.sectionCard}>
                    
                    {/* ID 1: Alimentos (Carnes, Mariscos, Verduras, etc.) */}
                    {formData.industryTemplateId === 1 && (
                      <>
                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Unidad de Medida</Text>
                          <View style={styles.inputRow}>
                            {['Kg', 'Lb', 'Ambos'].map((unit) => (
                              <TouchableOpacity
                                key={unit}
                                style={[styles.smallBtn, formData.settings.unitOfMeasure === unit && styles.smallBtnActive]}
                                onPress={() => updateSettingField('unitOfMeasure', unit)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.unitOfMeasure === unit && styles.smallBtnTextActive]}>
                                  {unit}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                        
                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Merma Estimada (%)</Text>
                          <TextInput
                            style={[styles.input, { padding: 8, width: 80, textAlign: 'center' }]}
                            keyboardType="numeric"
                            value={formData.settings.wasteMargin}
                            onChangeText={(val) => updateSettingField('wasteMargin', val)}
                            placeholder="0"
                          />
                        </View>

                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>¿Usa balanza digital?</Text>
                          <View style={styles.inputRow}>
                            {['Sí', 'No'].map((opt) => (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.smallBtn, formData.settings.useDigitalScale === opt && styles.smallBtnActive]}
                                onPress={() => updateSettingField('useDigitalScale', opt)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.useDigitalScale === opt && styles.smallBtnTextActive]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}

                    {/* ID 2: Servicios (Estilista, Barbería, Técnicos, etc.) */}
                    {formData.industryTemplateId === 2 && (
                      <>
                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Cobra por comisión</Text>
                          <View style={styles.inputRow}>
                            {['Sí', 'No'].map((opt) => (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.smallBtn, formData.settings.employeeCommission === opt && styles.smallBtnActive]}
                                onPress={() => updateSettingField('employeeCommission', opt)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.employeeCommission === opt && styles.smallBtnTextActive]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Vende productos físicos</Text>
                          <View style={styles.inputRow}>
                            {['Sí', 'No'].map((opt) => (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.smallBtn, formData.settings.sellPhysicalProducts === opt && styles.smallBtnActive]}
                                onPress={() => updateSettingField('sellPhysicalProducts', opt)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.sellPhysicalProducts === opt && styles.smallBtnTextActive]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}

                    {/* ID 3: Comercio (MiniSuper, Tienda de ropa, Ferreterías, etc.) */}
                    {formData.industryTemplateId === 3 && (
                      <>
                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Usa códigos de barras</Text>
                          <View style={styles.inputRow}>
                            {['Sí', 'No'].map((opt) => (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.smallBtn, formData.settings.useBarcodes === opt && styles.smallBtnActive]}
                                onPress={() => updateSettingField('useBarcodes', opt)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.useBarcodes === opt && styles.smallBtnTextActive]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}

                    {/* ID 4: Restaurante / Alimentos Preparados (Panadería, Cafeterías, etc.) */}
                    {formData.industryTemplateId === 4 && (
                      <>
                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Transforma materia prima</Text>
                          <View style={styles.inputRow}>
                            {['Sí', 'No'].map((opt) => (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.smallBtn, formData.settings.transformsRawMaterial === opt && styles.smallBtnActive]}
                                onPress={() => updateSettingField('transformsRawMaterial', opt)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.transformsRawMaterial === opt && styles.smallBtnTextActive]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View style={styles.rowContainer}>
                          <Text style={styles.label}>Maneja propinas</Text>
                          <View style={styles.inputRow}>
                            {['Sí', 'No'].map((opt) => (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.smallBtn, formData.settings.manageTips === opt && styles.smallBtnActive]}
                                onPress={() => updateSettingField('manageTips', opt)}
                              >
                                <Text style={[styles.smallBtnText, formData.settings.manageTips === opt && styles.smallBtnTextActive]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  <Text style={styles.sectionTitle}>Configuración General</Text>
                  <View style={styles.sectionCard}>
                    <View style={styles.rowContainer}>
                      <Text style={styles.label}>Forma de venta</Text>
                      <View style={styles.inputRow}>
                        {['Mostrador', 'Delivery', 'Ambos'].map((mode) => (
                          <TouchableOpacity
                            key={mode}
                            style={[styles.smallBtn, formData.settings.salesFormat === mode && styles.smallBtnActive]}
                            onPress={() => updateSettingField('salesFormat', mode)}
                          >
                            <Text style={[styles.smallBtnText, formData.settings.salesFormat === mode && styles.smallBtnTextActive]}>
                              {mode}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.rowContainer}>
                      <Text style={styles.label}>Tasa de impuesto (%)</Text>
                      <TextInput
                        style={[styles.input, { padding: 8, width: 80, textAlign: 'center' }]}
                        keyboardType="numeric"
                        value={formData.settings.taxRate}
                        onChangeText={(val) => updateSettingField('taxRate', val)}
                        placeholder="7.00"
                      />
                    </View>

                    <View style={styles.rowContainer}>
                      <Text style={styles.label}>Inventario simplificado</Text>
                      <View style={styles.inputRow}>
                        {['Sí', 'No'].map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.smallBtn, formData.settings.simplifiedInventory === opt && styles.smallBtnActive]}
                            onPress={() => updateSettingField('simplifiedInventory', opt)}
                          >
                            <Text style={[styles.smallBtnText, formData.settings.simplifiedInventory === opt && styles.smallBtnTextActive]}>
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.rowContainer}>
                      <Text style={styles.label}>Reportes básicos</Text>
                      <View style={styles.inputRow}>
                        {['Sí', 'No'].map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.smallBtn, formData.settings.basicReports === opt && styles.smallBtnActive]}
                            onPress={() => updateSettingField('basicReports', opt)}
                          >
                            <Text style={[styles.smallBtnText, formData.settings.basicReports === opt && styles.smallBtnTextActive]}>
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.button, !formData.industryTemplateId && { opacity: 0.5 }]}
                onPress={handleRegister}
                disabled={loading || !formData.industryTemplateId}
              >
                <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Finalizar'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

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