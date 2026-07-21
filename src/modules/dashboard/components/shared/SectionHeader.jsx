/**
 * SectionHeader.jsx
 *
 * Encabezado reutilizable para secciones
 * del Dashboard PYME.
 *
 * Compatible con iconos como componentes
 * (Heroicons) y elementos React.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import styles from "./styles/sectionHeader.styles";

const SectionHeader = ({
  title,
  subtitle,
  icon,
  actionLabel,
  onActionPress,
  marginBottom = true,
}) => {
  /**
   * Permite recibir:
   *
   * icon={BanknotesIcon}
   * o
   * icon={<BanknotesIcon />}
   */
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return icon;
    }

    if (typeof icon === "function") {
      const Icon = icon;

      return (
        <Icon
          size={22}
          color="#2563EB"
        />
      );
    }

    return null;
  };

  return (
    <View
      style={[
        styles.container,
        marginBottom && styles.marginBottom,
      ]}
    >
      <View style={styles.leftContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
        )}

        <View>
          {!!title && (
            <Text style={styles.title}>
              {title}
            </Text>
          )}

          {!!subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {!!actionLabel && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onActionPress}
        >
          <Text style={styles.action}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;