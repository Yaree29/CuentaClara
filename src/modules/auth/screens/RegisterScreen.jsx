import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import styles from '../styles/register.styles';

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

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleRegister = () => {
    console.log('DATA FINAL:', formData);
    // Aquí luego conectas Firebase + creación de tenant
  };

  return (
    <AuthLayout>
      <ScrollView contentContainerStyle={styles.container}>
        
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
                onChangeText={(val) => updateField('email', val)}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => updateField('password', val)}
              />

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

              <TouchableOpacity onPress={() => updateField('category', 'alimentos')}>
                <Text>Alimentos</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => updateField('category', 'servicios')}>
                <Text>Servicios</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => updateField('category', 'comercio')}>
                <Text>Comercio</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => updateField('category', 'restaurante')}>
                <Text>Alimentos preparados</Text>
              </TouchableOpacity>

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

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Finalizar</Text>
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