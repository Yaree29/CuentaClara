import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../theme/colors';

const CreateTransactionScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <Text style={s.title}>Nueva Transacción</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
        <Text style={s.btnText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 24 },
  btn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default CreateTransactionScreen;
