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

// Alineado al mismo margen izquierdo que usa headerContainer (paddingHorizontal: 16).
const MENU_LEFT = 16;

const DashboardHeader = ({ title, variant = 'default' }) => {
  const navigation = useNavigation();
  const kebabRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const menuAnim = useRef(new Animated.Value(0)).current;

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

  if (variant === 'home') {
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
