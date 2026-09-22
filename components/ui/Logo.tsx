import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: string;
  variant?: "red" | "white";
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  textColor,
  variant = "red",
}) => {
  const iconSize =
    size === "sm" ? 22 : size === "md" ? 32 : size === "lg" ? 48 : 64;
  const textSize =
    size === "sm"
      ? "text-base font-bold"
      : size === "md"
      ? "text-xl font-extrabold"
      : size === "lg"
      ? "text-3xl font-extrabold"
      : "text-4xl font-black";

  const isWhite = variant === "white";
  const dropColor = isWhite ? "#FFFFFF" : Colors.primary.DEFAULT;
  const heartColor = isWhite ? Colors.primary.DEFAULT : "#FFFFFF";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          {
            width: iconSize * 1.5,
            height: iconSize * 1.5,
            borderRadius: (iconSize * 1.5) / 2,
            backgroundColor: isWhite ? "rgba(255,255,255,0.2)" : Colors.primary.light,
          },
        ]}
      >
        <Ionicons name="water" size={iconSize} color={dropColor} />
        <View style={styles.heartOverlay}>
          <Ionicons name="heart" size={iconSize * 0.42} color={heartColor} />
        </View>
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.text,
              {
                color: textColor || (isWhite ? "#FFFFFF" : Colors.text.primary),
                fontSize:
                  size === "sm" ? 18 : size === "md" ? 22 : size === "lg" ? 30 : 38,
              },
            ]}
          >
            Blood<Text style={{ color: isWhite ? "#FFFFFF" : Colors.primary.DEFAULT }}>Help</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heartOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: "22%",
  },
  textContainer: {
    marginLeft: 8,
  },
  text: {
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});

export default Logo;
