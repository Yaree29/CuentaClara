/**
 * EmptyState.jsx
 *
 * Componente reutilizable para estados vacíos.
 *
 * Compatible con:
 * - Emoji
 * - Heroicons (componentes)
 * - Elementos React
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import styles from "./styles/emptyState.styles";

const EmptyState = ({
  icon = "📭",
  title = "Sin información",
  message = "No hay datos disponibles actualmente",
  actionLabel,
  onActionPress,
}) => {
  /**
   * Permite recibir:
   *
   * icon="📭"
   * icon={InboxIcon}
   * icon={<InboxIcon />}
   */
  const renderIcon = () => {
    if (!icon) return null;

    // JSX
    if (React.isValidElement(icon)) {
      return icon;
    }

    // Heroicon
    if (typeof icon === "function") {
      const Icon = icon;

      return (
        <Icon
          size={46}
          color="#94A3B8"
        />
      );
    }

    // Emoji o texto
    return (
      <Text style={styles.icon}>
        {icon}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {renderIcon()}

      {!!title && (
        <Text style={styles.title}>
          {title}
        </Text>
      )}

      {!!message && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}

      {!!actionLabel && (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={onActionPress}
        >
          <Text style={styles.buttonText}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;