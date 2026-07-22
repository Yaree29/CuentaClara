import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AuthLayout from '../../../views/layouts/AuthLayout';
import colors from '../../../theme/colors';
import styles from '../styles/register.styles';
import registerService from '../services/registerService';
import useAuthStore from '../../../store/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { safeGoBack } from '../utils/navigationHelpers';
import {
  validateEmail, 
  validatePassword, 
  validateName, 
  validateBusinessName, 
  validatePhone,
  getPasswordStrength
} from '../utils/validation';

// Traduce el category_group de la plantilla de industria elegida (ver
// auth_service.py) al nombre de la categoría genérica (tabla `categories`),
// para resolver su id real. No son la misma tabla: industry_templates tiene
// muchas más filas que categories (1-5), así que nunca se puede reusar el id
// de la plantilla como category_id directamente.
const CATEGORY_GROUP_TO_NAME = {
  alimentos: 'Alimentos',
  servicios: 'Servicios',
  comercio: 'Comercio',
  comida_preparada: 'Restaurante',
  general: 'General',
};

const resolveCategoryId = (categoryGroup, categories) => {
  const name = CATEGORY_GROUP_TO_NAME[categoryGroup] || CATEGORY_GROUP_TO_NAME.general;
  const match = categories.find((c) => c.name === name);
  return match ? match.id : null;
};

// El usuario ya no elige entre las 11 plantillas de industria una por una
// (Carnicería, Barbería, etc.) — elige una de estas 5 categorías genéricas.
// Internamente se sigue guardando un industry_template_id real (el de la
// primera plantilla de ese category_group, ver firstTemplateIdByGroup más
// abajo): el backend (auth_service.py) sigue derivando category_group,
// flags de inventario y módulos a partir de esa columna, sin cambios ahí.
// 'general' es la excepción: no existe ninguna plantilla con
// category_group='general' en las 11 existentes (ver
// 15_category_group_and_inventory_config.sql), así que se guarda
// industryTemplateId=null — auth_service.py ya trata null como "sin
// plantilla" y cae en su rama por defecto (category_group=None).
const CATEGORY_OPTIONS = [
  { key: 'general', label: 'General', icon: '🏢' },
  { key: 'alimentos', label: 'Alimentos', icon: '🥕' },
  { key: 'comida_preparada', label: 'Comida Preparada', icon: '🍽️' },
  { key: 'comercio', label: 'Comercio', icon: '🏪' },
  { key: 'servicios', label: 'Servicios', icon: '💼' },
];

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
    categoryGroup: null, // 'general'|'alimentos'|'comida_preparada'|'comercio'|'servicios'
    industryTemplateId: null, // id real interno (representante del category_group elegido)
    categoryId: null,
    nit: '',
    address: '',
    logoBase64: null,
    // Se quitaron los toggles puramente decorativos (unitOfMeasure,
    // wasteMargin, useDigitalScale, useBarcodes, salesFormat,
    // simplifiedInventory, basicReports): se guardaban en
    // business_configs.settings pero ningún componente visual ni el backend
    // los leía de vuelta (ver auditoría). Quedan solo los que sí afectan algo
    // real: employeeCommission/manageTips (subtítulos del Dashboard PYME),
    // sellPhysicalProducts/transformsRawMaterial (activan módulos en
    // register_business) y taxRate (business_configs.tax_rate real).
    settings: {
      // Servicios (ID: 2)
      employeeCommission: 'No',
      sellPhysicalProducts: 'No',

      // Restaurante / Alimentos Preparados (ID: 4)
      transformsRawMaterial: 'No',
      manageTips: 'No',

      // General (todas las categorías)
      taxRate: '7.00',
    },
    businessType: '',
    avgPrice: '',
    taxEnabled: false,
  });

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Primera plantilla (menor id) de cada category_group, entre las 11 reales
  // — es el representante interno que se guarda como industryTemplateId
  // cuando el usuario elige una de las 5 categorías genéricas. No se toca ni
  // se borra ninguna plantilla: solo se usa su id como valor interno.
  const firstTemplateIdByGroup = useMemo(() => {
    const map = {};
    templates.forEach((t) => {
      if (t.category_group && !(t.category_group in map)) {
        map[t.category_group] = t.id;
      }
    });
    return map;
  }, [templates]);
  const [logoUri, setLogoUri] = useState(null);
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

  // Selector de logo (cámara/galería) — mismo patrón que EditProfileScreen.jsx
  // (expo-image-picker + base64), reemplaza el TextInput de URL manual. El
  // backend sube el base64 a Supabase Storage y guarda la URL resultante.
  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
      updateField('logoBase64', result.assets[0].base64);
    }
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
      // Si no hay pantalla previa en el stack (p. ej. se llegó desde
      // WelcomeScreen con "replace"), vuelve a Login en vez de fallar.
      safeGoBack(navigation, 'Login');
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
          if (!formData.categoryGroup) {
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
        const [tmplData, catData, biometricEnabled] = await Promise.all([
          registerService.getTemplates(),
          registerService.getCategories(),
          isBiometricAvailable(),
        ]);
        if (mounted) {
          setTemplates(tmplData);
          setCategories(catData);
          setBiometricAvailable(biometricEnabled);
        }
      } catch (e) {
        console.error('Error al cargar datos de registro:', e);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Título/subtítulo del encabezado según el paso actual (solo diseño).
  const getHeaderCopy = () => {
    if (step === 1) return { title: 'Crea tu', subtitle: 'cuenta' };
    if (step === 2) return { title: 'Elige tu', subtitle: 'perfil' };
    if (step === 3 && formData.profileType === 'empresa') return { title: 'Configura tu', subtitle: 'negocio' };
    return { title: 'Configuración', subtitle: 'rápida' };
  };
  const headerCopy = getHeaderCopy();

  return (
    <AuthLayout title={headerCopy.title} subtitle={headerCopy.subtitle} showBack onBack={handleBack}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {step === 1 && (
          <>
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nombre"
                  placeholderTextColor={colors.placeholder}
                  value={formData.name}
                  onChangeText={(val) => updateField('name', val)}
                  maxLength={100}
                />
                {errors.name ? <Text style={styles.errorMessage}>{errors.name}</Text> : null}
              </View>

              <View>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apellido"
                  placeholderTextColor={colors.placeholder}
                  value={formData.lastName}
                  onChangeText={(val) => updateField('lastName', val)}
                />
              </View>

              <View>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Correo electrónico"
                  placeholderTextColor={colors.placeholder}
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
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Contraseña"
                    placeholderTextColor={colors.placeholder}
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
                <Text style={styles.label}>Teléfono (opcional)</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Teléfono (opcional)"
                  placeholderTextColor={colors.placeholder}
                  value={formData.phone}
                  onChangeText={(val) => updateField('phone', val)}
                  keyboardType="phone-pad"
                />
                {errors.phone ? <Text style={styles.errorMessage}>{errors.phone}</Text> : null}
              </View>

              <View>
                <Text style={styles.label}>Nombre del negocio</Text>
                <TextInput
                  style={[styles.input, errors.businessName && styles.inputError]}
                  placeholder="Nombre del negocio"
                  placeholderTextColor={colors.placeholder}
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
            <Text style={styles.subtitle}>Selecciona el tipo de perfil que mejor describe tu negocio</Text>

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
                style={styles.buttonOutline}
                onPress={() => {
                  updateField('profileType', 'empresa');
                  handleNext();
                }}
              >
                <Text style={styles.buttonOutlineText}>Empresa PYME</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && formData.profileType === 'empresa' && (
          <>
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Sección General</Text>
              
              <TextInput
                style={styles.input}
                placeholder="RUC / NIT / Identificación Tributaria *"
                placeholderTextColor={colors.placeholder}
                value={formData.nit}
                onChangeText={(val) => updateField('nit', val)}
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección Física"
                placeholderTextColor={colors.placeholder}
                value={formData.address}
                onChangeText={(val) => updateField('address', val)}
              />

              <TouchableOpacity
                style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}
                onPress={pickLogo}
              >
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={{ width: 36, height: 36, borderRadius: 8 }} />
                ) : (
                  <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
                )}
                <Text style={{ color: logoUri ? colors.textPrimary : colors.textSecondary }}>
                  {logoUri ? 'Cambiar logo' : 'Agregar logo (opcional)'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Categoría de Negocio</Text>

              {/* Combobox de las 5 categorías genéricas — no de las 11
                  plantillas reales (ver CATEGORY_OPTIONS más arriba). */}
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setTemplatePickerOpen(!templatePickerOpen)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {formData.categoryGroup
                    ? (() => {
                        const opt = CATEGORY_OPTIONS.find((o) => o.key === formData.categoryGroup);
                        return opt ? `${opt.icon}  ${opt.label}` : 'Selecciona la categoría';
                      })()
                    : 'Selecciona la categoría del negocio ▾'}
                </Text>
              </TouchableOpacity>

              {templatePickerOpen && (
                <View style={styles.dropdownList}>
                  {templates.length === 0 ? (
                    <ActivityIndicator style={{ padding: 16 }} color={colors.primary} />
                  ) : (
                    CATEGORY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => {
                          // 'general' no tiene plantilla representante (ninguna
                          // de las 11 tiene category_group='general') — se
                          // guarda industryTemplateId=null, que auth_service.py
                          // ya trata como "sin plantilla elegida".
                          const templateId = opt.key === 'general' ? null : (firstTemplateIdByGroup[opt.key] ?? null);
                          updateField('categoryGroup', opt.key);
                          updateField('industryTemplateId', templateId);
                          updateField('categoryId', resolveCategoryId(opt.key, categories));
                          setTemplatePickerOpen(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text>{opt.icon}  {opt.label}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* Configuración Operativa — solo Servicios y Comida Preparada
                  tienen toggles que de verdad afectan algo (activan módulos
                  en register_business o cambian subtítulos reales del
                  Dashboard PYME). Alimentos y Comercio se quitaron: sus
                  toggles (unidad de medida, merma, balanza, códigos de
                  barras) se guardaban en business_configs.settings pero
                  ningún lugar del sistema los leía de vuelta. Antes esto se
                  gateaba por industryTemplateId===2/4 (IDs mágicos de la
                  plantilla representante); ahora que el usuario elige
                  categoryGroup directamente, se gatea por eso — más robusto
                  y no depende de qué plantilla haya quedado como
                  representante interno de cada grupo. */}
              {(formData.categoryGroup === 'servicios' || formData.categoryGroup === 'comida_preparada') && (
                <>
                  <Text style={styles.sectionTitle}>Configuración Operativa</Text>
                  <View style={styles.sectionCard}>
                    {formData.categoryGroup === 'servicios' && (
                      <>
                        {/* "Cobra por comisión" ya activa el módulo Comisiones
                            en register_business (ver auth_service.py) además
                            de su uso previo en el subtítulo del Dashboard
                            PYME (dashboardEngine.js/summaryRules.js) — mismo
                            campo, ambos efectos, sin duplicar la pregunta. */}
                        <View style={styles.rowContainer}>
                          <Text style={styles.rowLabel}>Cobra por comisión</Text>
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
                          <Text style={styles.rowLabel}>Vende productos físicos</Text>
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

                    {formData.categoryGroup === 'comida_preparada' && (
                      <>
                        <View style={styles.rowContainer}>
                          <Text style={styles.rowLabel}>Transforma materia prima</Text>
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
                          <Text style={styles.rowLabel}>Maneja propinas</Text>
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
                </>
              )}

              {formData.categoryGroup && (
                <>
                  <Text style={styles.sectionTitle}>Configuración General</Text>
                  <View style={styles.sectionCard}>
                    <View style={styles.rowContainer}>
                      <Text style={styles.rowLabel}>Tasa de impuesto (%)</Text>
                      <TextInput
                        style={[styles.input, { padding: 8, width: 80, textAlign: 'center' }]}
                        keyboardType="numeric"
                        value={formData.settings.taxRate}
                        onChangeText={(val) => updateSettingField('taxRate', val)}
                        placeholder="7.00"
                        placeholderTextColor={colors.placeholder}
                      />
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.button, !formData.categoryGroup && { opacity: 0.5 }]}
                onPress={handleRegister}
                disabled={loading || !formData.categoryGroup}
              >
                <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Finalizar'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && formData.profileType === 'emprendedor' && (
          <>
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>¿Qué vendes?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="¿Qué vendes?"
                  placeholderTextColor={colors.placeholder}
                  value={formData.businessType}
                  onChangeText={(val) => updateField('businessType', val)}
                />
              </View>

              <View>
                <Text style={styles.label}>Precio promedio</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Precio promedio"
                  placeholderTextColor={colors.placeholder}
                  value={formData.avgPrice}
                  onChangeText={(val) => updateField('avgPrice', val)}
                />
              </View>

              <TouchableOpacity
                style={styles.buttonOutline}
                onPress={() => updateField('taxEnabled', !formData.taxEnabled)}
              >
                <Text style={styles.buttonOutlineText}>
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
        <TouchableOpacity onPress={() => safeGoBack(navigation, 'Login')} style={styles.link}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </AuthLayout>
  );
};

export default RegisterScreen;