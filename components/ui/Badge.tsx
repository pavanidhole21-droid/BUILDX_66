import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { RequestStatus } from "@/types/blood";

interface BadgeProps {
  label: string;
  variant?: "verified" | "blood" | "status" | "info" | "emergency";
  status?: RequestStatus;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "blood",
  status,
  size = "md",
  style,
}) => {
  if (variant === "verified") {
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: Colors.status.verifiedBg,
            borderColor: Colors.status.verifiedBorder,
          },
          style,
        ]}
      >
        <Ionicons
          name="checkmark-circle"
          size={size === "sm" ? 12 : 14}
          color={Colors.status.verified}
          style={{ marginRight: 4 }}
        />
        <Text
          style={[
            styles.text,
            {
              color: Colors.status.verified,
              fontSize: size === "sm" ? 11 : 12,
              fontWeight: "700",
            },
          ]}
        >
          Verified
        </Text>
      </View>
    );
  }

  if (variant === "status" && status) {
    let bgColor = Colors.surface.muted;
    let textColor = Colors.text.secondary;

    switch (status) {
      case "Searching":
      case "Pending":
        bgColor = Colors.status.pendingBg;
        textColor = Colors.status.pending;
        break;
      case "Accepted":
        bgColor = Colors.status.verifiedBg;
        textColor = Colors.status.verified;
        break;
      case "Completed":
        bgColor = Colors.status.completedBg;
        textColor = Colors.status.completed;
        break;
      case "Rejected":
      case "Cancelled":
        bgColor = Colors.status.rejectedBg;
        textColor = Colors.status.rejected;
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: size === "sm" ? 11 : 12,
              fontWeight: "700",
            },
          ]}
        >
          {status}
        </Text>
      </View>
    );
  }

  const isBlood = variant === "blood";
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isBlood ? Colors.primary.light : Colors.surface.muted,
          borderColor: isBlood ? Colors.primary.border : Colors.surface.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isBlood ? Colors.primary.DEFAULT : Colors.text.primary,
            fontSize: size === "sm" ? 11 : 13,
            fontWeight: "800",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    letterSpacing: 0.1,
  },
});

export default Badge;
