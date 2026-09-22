import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "emergency" | "muted" | "elevated";
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  padding = 16,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "emergency":
        return Colors.primary.lighter;
      case "muted":
        return Colors.surface.muted;
      case "elevated":
      case "default":
      default:
        return Colors.surface.card;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case "emergency":
        return Colors.primary.border;
      case "default":
      case "elevated":
      case "muted":
      default:
        return Colors.surface.border;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          padding,
        },
        variant === "elevated" && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default Card;
