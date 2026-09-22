import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { BloodGroup, ALL_BLOOD_GROUPS } from "@/types/blood";
import { BloodService } from "@/services/api/bloodService";
import Header from "@/components/common/Header";
import Button from "@/components/ui/Button";

export default function EmergencyScreen() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [units, setUnits] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleSendEmergency = async () => {
    setLoading(true);
    try {
      const created = await BloodService.createRequest({
        patientName: "Emergency Patient",
        bloodGroup,
        units,
        hospitalName: "Nearest Verified Hospital (GPS Broadcast)",
        hospitalAddress: "Nagpur, Maharashtra",
        isEmergency: true,
        contactPerson: "Emergency Contact",
        contactPhone: "+91 9876543210",
        additionalNote: "EMERGENCY SOS: Critical blood requirement broadcast",
      });

      router.replace({
        pathname: "/(user)/confirmation",
        params: {
          requestId: created.id,
          bloodGroup: created.bloodGroup,
          units: created.units.toString(),
          hospital: "Nearest Verified Hospital (Broadcast)",
          status: "Searching",
        },
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to broadcast emergency request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header title="Emergency SOS" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Siren Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.sirenCircle}>
            <Ionicons name="warning" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.alertHeadline}>Emergency Request</Text>
          <Text style={styles.alertSubhead}>
            Send an urgent blood request to nearby verified organizations
          </Text>
        </View>

        {/* Quick Blood Group Selector */}
        <Text style={styles.sectionTitle}>Select Blood Group</Text>
        <View style={styles.bloodChipsRow}>
          {ALL_BLOOD_GROUPS.map((bg) => {
            const isSelected = bg === bloodGroup;
            return (
              <TouchableOpacity
                key={bg}
                activeOpacity={0.8}
                onPress={() => setBloodGroup(bg)}
                style={[
                  styles.bloodChip,
                  isSelected && styles.bloodChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.bloodChipText,
                    isSelected && styles.bloodChipTextActive,
                  ]}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Units Required */}
        <View style={styles.unitsCard}>
          <Text style={styles.unitsLabel}>Units Required</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setUnits((u) => Math.max(1, u - 1))}
              style={styles.stepBtn}
            >
              <Ionicons name="remove" size={20} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.stepCount}>{units}</Text>
            <TouchableOpacity
              onPress={() => setUnits((u) => u + 1)}
              style={styles.stepBtn}
            >
              <Ionicons name="add" size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Notice */}
        <View style={styles.locationNotice}>
          <Ionicons name="location" size={20} color={Colors.primary.DEFAULT} />
          <Text style={styles.locationNoticeText}>
            Your GPS location will be used to automatically notify the nearest
            verified organizations in Nagpur.
          </Text>
        </View>

        {/* Send Emergency Request CTA */}
        <Button
          title="Send Emergency Request"
          onPress={handleSendEmergency}
          variant="emergency"
          size="lg"
          loading={loading}
          fullWidth
          icon={<Ionicons name="flash" size={20} color="#FFFFFF" />}
          style={styles.emergencySubmitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  alertBanner: {
    width: "100%",
    backgroundColor: Colors.emergency.bg,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  sirenCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  alertHeadline: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  alertSubhead: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  bloodChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    width: "100%",
  },
  bloodChip: {
    width: "22%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.surface.border,
    backgroundColor: Colors.surface.muted,
    alignItems: "center",
  },
  bloodChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  bloodChipText: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text.primary,
  },
  bloodChipTextActive: {
    color: "#FFFFFF",
  },
  unitsCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface.muted,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  unitsLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepCount: {
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 10,
    color: Colors.text.primary,
  },
  locationNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.primary.lighter,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.border,
    gap: 10,
    marginBottom: 24,
    width: "100%",
  },
  locationNoticeText: {
    fontSize: 13,
    color: Colors.primary.dark,
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  emergencySubmitBtn: {
    height: 56,
  },
});
