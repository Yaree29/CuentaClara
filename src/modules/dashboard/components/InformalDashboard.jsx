import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import styles from './styles/InformalDashboard.styles';


// Importación local para extraer los datos del usuario logueado
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

const InformalDashboard = () => {
  // Control de visibilidad para las ventanas de registro rápido
  const [modalGasto, setModalGasto] = useState(false);
  const [modalFiado, setModalFiado] = useState(false);
  const [modalProducto, setModalProducto] = useState(false);

  // Simulación de estados del Inventario Crítico
  const lowStockProducts = ["Queso Blanco", "Leche Entera", "Pan de Molde", "Huevos de Patio"];

// Extraemos los datos del usuario actual desde Zustand
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Comerciante';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* SECCIÓN DE BIENVENIDA */}
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>Tu negocio está creciendo hoy.</Text>
        </View>
      </View>

      {/* METRICAS PRINCIPALES */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardHeader}>
          <Text style={styles.mainCardTitle}>Ventas del Día</Text>
          <View style={styles.badgeSuccess}>
            <Ionicons name="trending-up" size={14} color={colors.textSuccess} />
            <Text style={styles.badgeText}>+12%</Text>
          </View>
        </View>
        <Text style={styles.mainCardAmount}>$145.50</Text>
        <Text style={styles.mainCardSubtext}>Dinero total recibido en caja hoy</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={[styles.gridCard, { marginRight: 8 }]}>
          <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="card" size={20} color={colors.danger} />
          </View>
          <Text style={styles.gridCardLabel}>Por Cobrar (Fiado)</Text>
          <Text style={[styles.gridCardValue, { color: colors.danger }]}>$68.00</Text>
        </View>

        <View style={[styles.gridCard, { marginLeft: 8 }]}>
          <View style={[styles.iconBadge, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={20} color={colors.info} />
          </View>
          <Text style={styles.gridCardLabel}>Clientes Fiados</Text>
          <Text style={styles.gridCardValue}>4 personas</Text>
        </View>
      </View>

      {/* ACCIONES RÁPIDAS REESTRUCTURADAS */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.actionsContainer}>
        
        {/* BOTÓN GASTOS */}
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => setModalGasto(true)}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="calculator" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Registrar Gasto</Text>
        </TouchableOpacity>

        {/* BOTÓN ANOTAR FIADO */}
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => setModalFiado(true)}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="bookmark" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Anotar Fiado</Text>
        </TouchableOpacity>

        {/* BOTÓN REGISTRAR PRODUCTO */}
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => setModalProducto(true)}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="cube" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Nuevo Producto</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN HISTORIAL DE ACTIVIDADES RECIENTES */}
      <Text style={styles.sectionTitle}>Actividades Recientes</Text>
      <View style={styles.activityCard}>
        
        {/* FILA 1: VENTA */}
        <View style={styles.activityRow}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="basket" size={18} color={colors.success} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Venta rápida al contado</Text>
              <Text style={styles.activityTime}>Hace 10 minutos • Caja General</Text>
            </View>
          </View>
          <Text style={[styles.activityAmount, { color: colors.textSuccess }]}>+$12.50</Text>
        </View>

        <View style={styles.divider} />

        {/* FILA 2: GASTO */}
        <View style={styles.activityRow}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trending-down" size={18} color={colors.danger} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Compra de Mercancía</Text>
              <Text style={styles.activityTime}>Hace 1 hora • Proveedor El Machetazo</Text>
            </View>
          </View>
          <Text style={[styles.activityAmount, { color: colors.textError }]}>-$45.00</Text>
        </View>

        <View style={styles.divider} />

        {/* FILA 3: CRÉDITO FIADO */}
        <View style={styles.activityRow}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bookmark" size={18} color={colors.info} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Fiado a Carlos Alvarado</Text>
              <Text style={styles.activityTime}>Hace 3 horas • Saldo pendiente</Text>
            </View>
          </View>
          <Text style={[styles.activityAmount, { color: colors.textPrimary }]}>$18.00</Text>
        </View>
      </View>

      {/* ALERTA INTELIGENTE */}
      {lowStockProducts.length > 0 && (
        <View style={[styles.stockBanner, { marginTop: 20, marginBottom: 4 }]}>
          <View style={styles.stockBannerHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.stockBannerTitle}>
              Alerta de Inventario ({lowStockProducts.length} productos bajos)
            </Text>
          </View>
          <View style={styles.stockItemsContainer}>
            {lowStockProducts.map((product, idx) => (
              <View key={idx} style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>{product}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* VENTANA EMERGENTE: REGISTRAR GASTO */}
      <Modal visible={modalGasto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Gasto Directo</Text>
              <TouchableOpacity onPress={() => setModalGasto(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción del gasto</Text>
              <TextInput style={styles.inputField} placeholder="Ej. Bolsas plásticas, Hielo..." placeholderTextColor={colors.placeholder} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto ($ USD)</Text>
              <TextInput style={styles.inputField} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.placeholder} />
            </View>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={() => setModalGasto(false)}>
              <Text style={styles.submitButtonText}>Guardar Gasto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VENTANA EMERGENTE: ANOTAR FIADO */}
      <Modal visible={modalFiado} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Anotar Cuenta de Fiado</Text>
              <TouchableOpacity onPress={() => setModalFiado(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Cliente</Text>
              <TextInput style={styles.inputField} placeholder="Ej. Vecina María" placeholderTextColor={colors.placeholder} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto Fiado ($ USD)</Text>
              <TextInput style={styles.inputField} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.placeholder} />
            </View>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={() => setModalFiado(false)}>
              <Text style={styles.submitButtonText}>Confirmar Registro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VENTANA EMERGENTE: NUEVO PRODUCTO */}
      <Modal visible={modalProducto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar al Inventario</Text>
              <TouchableOpacity onPress={() => setModalProducto(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del producto</Text>
              <TextInput style={styles.inputField} placeholder="Ej. Malta Vigor" placeholderTextColor={colors.placeholder} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cantidad Inicial</Text>
              <TextInput style={styles.inputField} keyboardType="numeric" placeholder="10" placeholderTextColor={colors.placeholder} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio ($ USD)</Text>
              <TextInput style={styles.inputField} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.placeholder} />
            </View>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={() => setModalProducto(false)}>
              <Text style={styles.submitButtonText}>Registrar Artículo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default InformalDashboard;