import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function RequestConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    requestId?: string;
    bloodGroup?: string;
    units?: string;
    hospital?: string;
    status?: string;
  }>();

  const requestId = params.requestId || "#BH20250915";
  const bloodGroup = params.bloodGroup || "O+";
  const units = params.units || "2";
  const hospital = params.hospital || "Government Medical College, Nagpur";

  const handleViewRequests = () => {
    router.replace("/(user)/requests");
  };

  const handleBackHome = () => {
    router.replace("/(user)/home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* Animated Checkmark Illustration */}
        <View style={styles.illustrationCircle}>
          <View style={styles.clipboardShape}>
            <Ionicons name="document-text" size={68} color={Colors.primary.DEFAULT} />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Request Submitted!</Text>
        <Text style={styles.subtitle}>
          Your request has been sent to nearby verified organizations.
        </Text>

        {/* Confirmation Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Request ID</Text>
            <Text style={styles.requestIdText}>{requestId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Badge label="Searching" variant="status" status="Searching" />
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Blood Group</Text>
            <Text style={styles.detailValue}>{bloodGroup}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Units Required</Text>
            <Text style={styles.detailValue}>{units} units</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hospital</Text>
            <Text style={[styles.detailValue, { flex: 1, textAlign: "right" }]}>
              {hospital}
            </Text>
          </View>
        </View>

        <Text style={styles.disclaimerNote}>
          Organizations review availability and will accept or respond promptly.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.bottomBar}>
        <Button
          title="View Request"
          onPress={handleViewRequests}
          size="lg"
          fullWidth
          style={{ marginBottom: 10 }}
        />
        <Button
          title="Back to Home"
          onPress={handleBackHome}
          variant="outline"
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    padding: 24,
  },
  content: {
    alignItems: "center",
    paddingTop: 20,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.lighter,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary.border,
  },
  clipboardShape: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadge: {
    position: "absolute",
    bottom: -4,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: Colors.surface.muted,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.text.muted,
    fontWeight: "600",
  },
  requestIdText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surface.border,
  },
  disclaimerNote: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: "center",
    marginTop: 16,
  },
  bottomBar: {
    width: "100%",
    paddingBottom: 10,
  },
});
