import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import Colors from "@/constants/colors";

export type ButtonVariant =
  | "primary"
  | "emergency"
  | "secondary"
  | "outline"
  | "ghost"
  | "call"
  | "navigate";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return "#E2E8F0";
    switch (variant) {
      case "emergency":
        return Colors.emergency.bg;
      case "secondary":
        return Colors.primary.light;
      case "outline":
      case "ghost":
        return "transparent";
      case "call":
        return Colors.accent.call;
      case "navigate":
        return Colors.accent.navigate;
      case "primary":
      default:
        return Colors.primary.DEFAULT;
    }
  };

  const getTextColor = () => {
    if (disabled) return "#94A3B8";
    switch (variant) {
      case "secondary":
        return Colors.primary.DEFAULT;
      case "outline":
        return Colors.primary.DEFAULT;
      case "ghost":
        return Colors.text.primary;
      case "emergency":
      case "primary":
      case "call":
      case "navigate":
      default:
        return "#FFFFFF";
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") return Colors.primary.DEFAULT;
    return "transparent";
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return 38;
      case "lg":
        return 56;
      case "md":
      default:
        return 48; // Accessible min touch target
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1.5 : 0,
          height: getHeight(),
          width: fullWidth ? "100%" : undefined,
          paddingHorizontal: size === "sm" ? 14 : size === "lg" ? 24 : 18,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === "left" && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === "sm" ? 13 : size === "lg" ? 17 : 15,
                fontWeight: variant === "emergency" ? "800" : "700",
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
