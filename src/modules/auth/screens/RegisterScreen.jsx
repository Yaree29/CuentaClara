import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
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
    profileType: '', 
    category: '',

    nit: '',
    address: '',

    businessType: '',
    avgPrice: '',
    taxEnabled: false,
    handlesTips: false,
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
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
    console.log('DATA FINAL:', formData);
    // Aquí luego conectas Firebase + creación de tenant
  };

  return (
    <AuthLayout>
      <ScrollView contentContainerStyle={styles.container}>
        
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

              <Picker
                selectedValue={formData.category}
                onValueChange={handleCategoryChange}
              >
                <Picker.Item label="Selecciona categoría" value="" />
                <Picker.Item label="Alimentos" value="alimentos" />
                <Picker.Item label="Servicios" value="servicios" />
                <Picker.Item label="Comercio" value="comercio" />
                <Picker.Item label="Alimentos preparados" value="restaurante" />
                <Picker.Item label="General" value="general" />
              </Picker>

              {renderCategoryFields()}

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Finalizar</Text>
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

        {/* LINK */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </AuthLayout>
  );
};

export default RegisterScreen;