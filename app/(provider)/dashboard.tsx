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
import { ALL_BLOOD_GROUPS, BloodGroup } from "@/types/blood";
import Header from "@/components/common/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function ProviderDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "requests">("overview");

  // Inventory state for City Blood Bank
  const [inventory, setInventory] = useState<Record<BloodGroup, number>>({
    "A+": 6,
    "A-": 2,
    "B+": 5,
    "B-": 1,
    "O+": 8,
    "O-": 2,
    "AB+": 3,
    "AB-": 1,
  });
  const [lastUpdated, setLastUpdated] = useState("Updated 12 min ago");

  // Incoming Requests
  const [incomingRequests, setIncomingRequests] = useState([
    {
      id: "#BH20250915",
      bloodGroup: "O+",
      units: 2,
      isEmergency: true,
      patientName: "Amit Sharma",
      contact: "+91 9876543210",
      location: "Nagpur General Hospital",
      status: "Pending",
    },
    {
      id: "#BH20250914",
      bloodGroup: "A+",
      units: 1,
      isEmergency: false,
      patientName: "Ramesh Kumar",
      contact: "+91 9811223344",
      location: "Dhantoli Clinic",
      status: "Pending",
    },
  ]);

  const updateUnits = (group: BloodGroup, delta: number) => {
    setInventory((prev) => ({
      ...prev,
      [group]: Math.max(0, (prev[group] || 0) + delta),
    }));
  };

  const handleSaveInventory = () => {
    setLastUpdated("Updated just now");
    Alert.alert("Success", "Blood inventory updated successfully!");
  };

  const handleAcceptRequest = (id: string) => {
    setIncomingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Accepted" } : r))
    );
    Alert.alert("Request Accepted", `You accepted request ${id}`);
  };

  const handleRejectRequest = (id: string) => {
    setIncomingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
    Alert.alert("Request Rejected", `You declined request ${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        title="Provider Portal"
        showBack={true}
        onBackPress={() => router.replace("/(user)/home")}
      />

      {/* Provider Organization Header Banner */}
      <View style={styles.providerBanner}>
        <View style={styles.bannerRow}>
          <View style={styles.providerIconCircle}>
            <Ionicons name="business" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.orgName}>City Blood Bank</Text>
            <Text style={styles.orgType}>Verified Blood Center • Nagpur</Text>
          </View>
          <Badge label="Verified" variant="verified" />
        </View>
      </View>

      {/* Sub Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("overview")}
          style={[styles.navTab, activeTab === "overview" && styles.navTabActive]}
        >
          <Text style={[styles.navTabText, activeTab === "overview" && styles.navTabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("inventory")}
          style={[styles.navTab, activeTab === "inventory" && styles.navTabActive]}
        >
          <Text style={[styles.navTabText, activeTab === "inventory" && styles.navTabTextActive]}>
            Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("requests")}
          style={[styles.navTab, activeTab === "requests" && styles.navTabActive]}
        >
          <Text style={[styles.navTabText, activeTab === "requests" && styles.navTabTextActive]}>
            Incoming ({incomingRequests.filter((r) => r.status === "Pending").length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "overview" && (
          <View>
            {/* Metric Cards Row */}
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Ionicons name="notifications" size={24} color={Colors.primary.DEFAULT} />
                <Text style={styles.metricNumber}>12</Text>
                <Text style={styles.metricLabel}>Pending Requests</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="water" size={24} color="#2563EB" />
                <Text style={styles.metricNumber}>8</Text>
                <Text style={styles.metricLabel}>Total Donations</Text>
              </View>
            </View>

            {/* Quick Inventory Summary */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current Inventory Summary</Text>
                <TouchableOpacity onPress={() => setActiveTab("inventory")}>
                  <Text style={styles.viewLink}>Update</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.updatedSub}>{lastUpdated}</Text>

              <View style={styles.summaryChipsRow}>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <View key={bg} style={styles.summaryChip}>
                    <Text style={styles.summaryChipGroup}>{bg}</Text>
                    <Text style={styles.summaryChipUnits}>{inventory[bg]}u</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Action Navigation */}
            <View style={styles.quickNavList}>
              <TouchableOpacity
                onPress={() => setActiveTab("inventory")}
                style={styles.actionListItem}
              >
                <Ionicons name="create-outline" size={20} color={Colors.primary.DEFAULT} />
                <Text style={styles.actionListText}>Update Blood Inventory</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("requests")}
                style={styles.actionListItem}
              >
                <Ionicons name="mail-unread-outline" size={20} color={Colors.primary.DEFAULT} />
                <Text style={styles.actionListText}>View Incoming Requests</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "inventory" && (
          <View>
            <View style={styles.inventoryTopNotice}>
              <Text style={styles.inventoryNoticeTitle}>Update Units</Text>
              <Text style={styles.inventoryNoticeSub}>{lastUpdated}</Text>
            </View>

            {/* Inventory Controls Grid */}
            <View style={styles.inventoryGrid}>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <View key={bg} style={styles.inventoryCard}>
                  <Text style={styles.inventoryGroupTitle}>{bg}</Text>
                  <View style={styles.inventoryStepper}>
                    <TouchableOpacity
                      onPress={() => updateUnits(bg, -1)}
                      style={styles.counterBtn}
                    >
                      <Ionicons name="remove" size={18} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{inventory[bg]}</Text>
                    <TouchableOpacity
                      onPress={() => updateUnits(bg, 1)}
                      style={styles.counterBtn}
                    >
                      <Ionicons name="add" size={18} color={Colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <Button
              title="Save & Update Inventory"
              onPress={handleSaveInventory}
              size="lg"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </View>
        )}

        {activeTab === "requests" && (
          <View>
            <Text style={styles.tabSectionHeading}>Live Incoming Blood Requests</Text>

            {incomingRequests.map((req) => (
              <View key={req.id} style={styles.incomingCard}>
                <View style={styles.incomingHeader}>
                  <View>
                    <Text style={styles.incomingId}>{req.id}</Text>
                    <Text style={styles.incomingGroupUnits}>
                      {req.units} units • <Text style={{ color: Colors.primary.DEFAULT, fontWeight: "900" }}>{req.bloodGroup}</Text>
                    </Text>
                  </View>
                  {req.isEmergency && (
                    <View style={styles.emergencyTag}>
                      <Ionicons name="warning" size={12} color="#DC2626" />
                      <Text style={styles.emergencyTagText}>EMERGENCY</Text>
                    </View>
                  )}
                </View>

                <View style={styles.incomingDetails}>
                  <Text style={styles.detailLine}>Patient: {req.patientName}</Text>
                  <Text style={styles.detailLine}>Location: {req.location}</Text>
                  <Text style={styles.detailLine}>Contact: {req.contact}</Text>
                  <Text style={styles.detailLine}>Status: <Text style={{ fontWeight: "700" }}>{req.status}</Text></Text>
                </View>

                {req.status === "Pending" ? (
                  <View style={styles.decisionRow}>
                    <TouchableOpacity
                      onPress={() => handleRejectRequest(req.id)}
                      style={styles.rejectBtn}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleAcceptRequest(req.id)}
                      style={styles.acceptBtn}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.statusCompletedRow}>
                    <Text style={styles.statusCompletedText}>
                      Marked as {req.status}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  providerBanner: {
    backgroundColor: "#1E293B",
    padding: 16,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  providerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
  },
  orgName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  orgType: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  navBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  navTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  navTabActive: {
    borderBottomColor: Colors.primary.DEFAULT,
  },
  navTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.muted,
  },
  navTabTextActive: {
    color: Colors.primary.DEFAULT,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text.primary,
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  sectionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  viewLink: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
  },
  updatedSub: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
    marginBottom: 12,
  },
  summaryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  summaryChipGroup: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
  },
  summaryChipUnits: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  quickNavList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    overflow: "hidden",
  },
  actionListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.borderLight,
    gap: 12,
  },
  actionListText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  inventoryTopNotice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  inventoryNoticeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  inventoryNoticeSub: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inventoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inventoryGroupTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primary.DEFAULT,
  },
  inventoryStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.muted,
    borderRadius: 8,
  },
  counterBtn: {
    padding: 6,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 8,
    color: Colors.text.primary,
  },
  tabSectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  incomingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 12,
  },
  incomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  incomingId: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  incomingGroupUnits: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  emergencyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  emergencyTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
  },
  incomingDetails: {
    gap: 4,
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surface.borderLight,
  },
  detailLine: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  decisionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  acceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statusCompletedRow: {
    paddingVertical: 6,
    alignItems: "center",
  },
  statusCompletedText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.muted,
  },
});
