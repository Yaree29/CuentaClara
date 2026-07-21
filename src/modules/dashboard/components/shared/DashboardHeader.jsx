// =============================================================================
// MODIFICADO: 2026-07-19
// Propósito: Header reutilizable para las pantallas internas del dashboard.
//            variant="home": solo kebab (Ajustes) + avatar, sin saludo (el
//            saludo dinámico ahora vive en DashboardGreeting, dentro de cada
//            dashboard)
//            variant="default": solo título, sin tuerca, sin avatar.
// =============================================================================
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../theme/colors';
import styles from './styles/DashboardHeader.styles';
import useAuthStore from '../../../../store/useAuthStore';
import useAssistantModeStore from '../../../../store/useAssistantModeStore';

// Alineado al mismo margen izquierdo que usa headerContainer (paddingHorizontal: 16).
const MENU_LEFT = 16;

const DashboardHeader = ({ title, variant = 'default' }) => {
  const navigation = useNavigation();
  const kebabRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const userType = useAuthStore((state) => state.user?.userType);
  const enableAssistantMode = useAssistantModeStore((state) => state.enableMode);

  const openMenu = () => {
    if (kebabRef.current) {
      kebabRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuTop(pageY + height + 8);
        setMenuVisible(true);
        menuAnim.setValue(0);
        Animated.timing(menuAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      });
    } else {
      setMenuVisible(true);
    }
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const goToSettings = () => {
    closeMenu();
    navigation.navigate('settings');
  };

  // Modo Asistente es exclusivo de PYME (igual que el resto de esta feature,
  // ver diagnóstico de Fase A/B). El dueño sigue con su mismo JWT — enableMode
  // solo marca la bandera local, no crea sesión nueva.
  const goToAssistantMode = () => {
    closeMenu();
    enableAssistantMode();
    navigation.navigate('AssistantSelect');
  };

  if (variant === 'home') {
    // El botón de salida de Modo Asistente ("candado") vivía aquí, pero esta
    // rama es inalcanzable: DashboardHeader variant="home" solo lo monta
    // HomeScreen.jsx (tab "dashboard"), y ese tab ya no existe durante Modo
    // Asistente (ver MainNavigator.jsx/ASSISTANT_TABS) — ahora hay un botón
    // "Salir" directo en el navbar de tabs. ExitAssistantModeModal.jsx no se
    // tocó: AssistantSelectScreen.jsx lo sigue usando para que el dueño pueda
    // salir sin PIN si entró por error.
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          ref={kebabRef}
          style={styles.kebabContainer}
          onPress={openMenu}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle" size={34} color={colors.textWhite} />
        </TouchableOpacity>

        <Modal visible={menuVisible} animationType="none" transparent={true} statusBarTranslucent={true}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeMenu}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  top: menuTop,
                  left: MENU_LEFT,
                  opacity: menuAnim,
                  transform: [{ scaleY: menuAnim }],
                  transformOrigin: 'top',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.modalOption}
                onPress={goToSettings}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={20} color={colors.primary} />
                <Text style={styles.modalOptionText}>Ajustes</Text>
              </TouchableOpacity>

              {userType === 'pyme' && (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={goToAssistantMode}
                  activeOpacity={0.7}
                >
                  <Ionicons name="people-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalOptionText}>Entrar a Modo Asistente</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.headerContainerDefault}>
      <View style={styles.textContainer}>
        <Text style={styles.screenTitle}>{title}</Text>
      </View>
    </View>
  );
};

export default DashboardHeader;
