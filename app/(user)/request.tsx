import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { BloodGroup, ALL_BLOOD_GROUPS } from "@/types/blood";
import { BloodService } from "@/services/api/bloodService";
import Header from "@/components/common/Header";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RequestBloodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orgId?: string;
    orgName?: string;
    bloodGroup?: BloodGroup;
    units?: string;
    isEmergency?: string;
  }>();

  const [patientName, setPatientName] = useState("Amit Sharma");
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>(
    (params.bloodGroup as BloodGroup) || "O+"
  );
  const [units, setUnits] = useState(
    params.units ? parseInt(params.units, 10) : 2
  );
  const [hospitalLocation, setHospitalLocation] = useState(
    params.orgName || "Government Medical College, Nagpur"
  );
  const [isEmergency, setIsEmergency] = useState(
    params.isEmergency === "true" || false
  );
  const [contactPerson, setContactPerson] = useState("Rohit Sharma");
  const [contactNumber, setContactNumber] = useState("+91 9876543210");
  const [note, setNote] = useState("Urgent requirement for scheduled procedure");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const created = await BloodService.createRequest({
        patientName,
        bloodGroup: selectedGroup,
        units,
        hospitalName: hospitalLocation,
        hospitalAddress: "Nagpur, Maharashtra",
        isEmergency,
        contactPerson,
        contactPhone: contactNumber,
        additionalNote: note,
        organizationName: hospitalLocation,
      });

      router.replace({
        pathname: "/(user)/confirmation",
        params: {
          requestId: created.id,
          bloodGroup: created.bloodGroup,
          units: created.units.toString(),
          hospital: created.hospitalName,
          status: created.status,
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header title="Request Blood" showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Emergency Highlight Banner if toggle is on */}
          {isEmergency && (
            <View style={styles.emergencyAlertBox}>
              <Ionicons name="warning" size={20} color="#DC2626" />
              <Text style={styles.emergencyAlertText}>
                Marked as Emergency: Will prioritize alert to all active verified centers.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Patient Information</Text>

          <Input
            label="Patient Name"
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Full name of patient"
          />

          {/* Blood Group Chips */}
          <Text style={styles.fieldLabel}>Blood Group</Text>
          <View style={styles.bloodChipsRow}>
            {ALL_BLOOD_GROUPS.map((bg) => {
              const isSelected = bg === selectedGroup;
              return (
                <TouchableOpacity
                  key={bg}
                  onPress={() => setSelectedGroup(bg)}
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
          <View style={styles.unitsRow}>
            <Text style={styles.fieldLabel}>Units Required</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={() => setUnits((u) => Math.max(1, u - 1))}
                style={styles.stepperBtn}
              >
                <Ionicons name="remove" size={18} color={Colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{units}</Text>
              <TouchableOpacity
                onPress={() => setUnits((u) => u + 1)}
                style={styles.stepperBtn}
              >
                <Ionicons name="add" size={18} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Hospital / Location"
            value={hospitalLocation}
            onChangeText={setHospitalLocation}
            placeholder="Hospital name or address"
            leftIcon={
              <Ionicons
                name="business-outline"
                size={18}
                color={Colors.text.muted}
              />
            }
          />

          {/* Emergency Switch */}
          <View style={styles.emergencyToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyToggleTitle}>Emergency Request</Text>
              <Text style={styles.emergencyToggleSub}>
                Mark if the request is critical or urgent
              </Text>
            </View>
            <Switch
              value={isEmergency}
              onValueChange={setIsEmergency}
              trackColor={{ true: Colors.primary.DEFAULT, false: "#CBD5E1" }}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            Contact Information
          </Text>

          <Input
            label="Contact Person"
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder="Name of attendee / requester"
            leftIcon={
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.text.muted}
              />
            }
          />

          <Input
            label="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="+91 Phone number"
            keyboardType="phone-pad"
            leftIcon={
              <Ionicons
                name="call-outline"
                size={18}
                color={Colors.text.muted}
              />
            }
          />

          <Input
            label="Additional Note (Optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Surgery details, urgency notes, doctor name..."
            multiline
            numberOfLines={3}
            style={{ height: 72, textAlignVertical: "top" }}
          />

          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            fullWidth
            style={{ marginTop: 10, marginBottom: 30 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emergencyAlertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.lighter,
    borderColor: Colors.primary.border,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  emergencyAlertText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
    flex: 1,
  },
  bloodChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  bloodChip: {
    width: "22%",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  bloodChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  bloodChipText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  bloodChipTextActive: {
    color: "#FFFFFF",
  },
  unitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 12,
    color: Colors.text.primary,
  },
  emergencyToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 16,
  },
  emergencyToggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  emergencyToggleSub: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
});
