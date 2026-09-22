import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface EmergencyBannerProps {
  onPress: () => void;
  compact?: boolean;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  onPress,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.container,
        compact ? styles.containerCompact : styles.containerFull,
      ]}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.headline}>Need immediate help?</Text>
          <Text style={styles.subtext}>
            Quick emergency alert to all nearby verified centers
          </Text>
        </View>
      </View>

      <View style={styles.actionPill}>
        <Text style={styles.actionText}>Emergency</Text>
        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.emergency.bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.emergency.bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  containerFull: {
    width: "100%",
    marginVertical: 10,
  },
  containerCompact: {
    width: "100%",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  subtext: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 2,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
});

export default EmergencyBanner;
