import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { ALL_BLOOD_GROUPS, BloodGroup } from "@/types/blood";
import { Organization } from "@/types/organization";
import { BloodRequest, RequestStatus } from "@/types/blood";
import Header from "@/components/common/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { OrganizationService } from "@/services/api/organizationService";
import { BloodService } from "@/services/api/bloodService";

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "requests">("overview");

  const [org, setOrg] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [inventory, setInventory] = useState<Record<BloodGroup, number>>({
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
  });
  const [savingInventory, setSavingInventory] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Not updated yet");

  const [incomingRequests, setIncomingRequests] = useState<BloodRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Load organization for this provider
  const loadOrg = useCallback(async () => {
    if (!user) return;
    setLoadingOrg(true);
    const fetchedOrg = await OrganizationService.getByProvider(user.id);
    if (fetchedOrg) {
      setOrg(fetchedOrg);
      setInventory(fetchedOrg.inventory);
      const mins = fetchedOrg.lastUpdatedMinutesAgo;
      setLastUpdated(mins < 1 ? "Just now" : `Updated ${mins} min ago`);
    }
    setLoadingOrg(false);
  }, [user]);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    const all = await BloodService.getAllRequests();
    // Show Searching/Pending requests
    setIncomingRequests(all.filter((r) => r.status === "Searching" || r.status === "Pending"));
    setLoadingRequests(false);
  }, []);

  useEffect(() => {
    loadOrg();
    loadRequests();
  }, [loadOrg, loadRequests]);

  const updateUnits = (group: BloodGroup, delta: number) => {
    setInventory((prev) => ({
      ...prev,
      [group]: Math.max(0, (prev[group] || 0) + delta),
    }));
  };

  const handleSaveInventory = async () => {
    if (!org) { Alert.alert("Error", "No organization found for your account."); return; }
    setSavingInventory(true);
    const { error } = await OrganizationService.updateInventory(org.id, inventory);
    setSavingInventory(false);
    if (error) {
      Alert.alert("Error", error);
    } else {
      setLastUpdated("Updated just now");
      Alert.alert("Success", "Blood inventory updated successfully!");
    }
  };

  const handleAcceptRequest = (id: string) => {
    setIncomingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Accepted" as RequestStatus } : r))
    );
    Alert.alert("Request Accepted", `Request ${id} accepted.`);
  };

  const handleRejectRequest = (id: string) => {
    setIncomingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" as RequestStatus } : r))
    );
    Alert.alert("Request Rejected", `Request ${id} declined.`);
  };

  const pendingCount = incomingRequests.filter(
    (r) => r.status === "Searching" || r.status === "Pending"
  ).length;

  if (loadingOrg) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        title="Provider Portal"
        showBack={true}
        onBackPress={() => router.replace("/(user)/home")}
      />

      {/* Dark banner */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTitle}>{org?.name || profile?.name || "My Organization"}</Text>
          <Text style={styles.bannerSub}>
            {org?.isVerified ? "✓ Verified" : "⚠ Unverified"} • {org?.type || "Blood Center"}
          </Text>
          <Text style={styles.bannerLocation}>
            {org?.city || "Nagpur"}, {org?.state || "Maharashtra"}
          </Text>
        </View>
        <View style={styles.bannerRight}>
          <Ionicons name="business" size={36} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(["overview", "inventory", "requests"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "requests" ? `Requests (${pendingCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <View>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{pendingCount}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {Object.values(inventory).reduce((a, b) => a + b, 0)}
                </Text>
                <Text style={styles.metricLabel}>Total Units</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Inventory Summary</Text>
            <View style={styles.inventorySummaryGrid}>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <View key={bg} style={styles.inventoryChip}>
                  <Text style={styles.inventoryChipGroup}>{bg}</Text>
                  <Text style={[styles.inventoryChipUnits, inventory[bg] === 0 && { color: Colors.text.muted }]}>
                    {inventory[bg]}u
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.lastUpdatedText}>{lastUpdated}</Text>
            <Button
              title="Update Inventory"
              onPress={() => setActiveTab("inventory")}
              size="md"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* ── INVENTORY TAB ── */}
        {activeTab === "inventory" && (
          <View>
            <Text style={styles.sectionTitle}>Update Blood Inventory</Text>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <View key={bg} style={styles.inventoryRow}>
                <View style={styles.inventoryLabel}>
                  <Text style={styles.inventoryGroup}>{bg}</Text>
                  <Text style={styles.inventoryUnit}>units</Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => updateUnits(bg, -1)}
                    style={styles.stepBtn}
                  >
                    <Ionicons name="remove" size={18} color={Colors.primary.DEFAULT} />
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{inventory[bg]}</Text>
                  <TouchableOpacity
                    onPress={() => updateUnits(bg, 1)}
                    style={styles.stepBtn}
                  >
                    <Ionicons name="add" size={18} color={Colors.primary.DEFAULT} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Button
              title="Save Inventory"
              onPress={handleSaveInventory}
              loading={savingInventory}
              size="lg"
              fullWidth
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <View>
            <Text style={styles.sectionTitle}>Incoming Requests</Text>
            {loadingRequests ? (
              <ActivityIndicator color={Colors.primary.DEFAULT} style={{ marginTop: 20 }} />
            ) : incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.text.muted} />
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            ) : (
              incomingRequests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  {req.isEmergency && (
                    <View style={styles.emergencyTag}>
                      <Ionicons name="flash" size={12} color="#DC2626" />
                      <Text style={styles.emergencyTagText}>EMERGENCY</Text>
                    </View>
                  )}
                  <View style={styles.requestCardTop}>
                    <View style={styles.bloodCircle}>
                      <Text style={styles.bloodCircleText}>{req.bloodGroup}</Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestId}>{req.id}</Text>
                      <Text style={styles.requestPatient}>{req.patientName}</Text>
                      <Text style={styles.requestUnits}>{req.units} units needed</Text>
                    </View>
                    <Badge label={req.status} variant="status" status={req.status as RequestStatus} />
                  </View>
                  <Text style={styles.requestHospital}>{req.hospitalName}</Text>
                  {(req.status === "Searching" || req.status === "Pending") && (
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        onPress={() => handleRejectRequest(req.id)}
                        style={styles.rejectBtn}
                      >
                        <Text style={styles.rejectBtnText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleAcceptRequest(req.id)}
                        style={styles.acceptBtn}
                      >
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  banner: { backgroundColor: "#1A1A2E", paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bannerLeft: { flex: 1 },
  bannerTitle: { fontSize: 17, fontWeight: "900", color: "#FFFFFF", marginBottom: 4 },
  bannerSub: { fontSize: 12, color: "#94A3B8", marginBottom: 2 },
  bannerLocation: { fontSize: 12, color: "#64748B" },
  bannerRight: { marginLeft: 12 },
  tabBar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary.DEFAULT },
  tabText: { fontSize: 12, fontWeight: "700", color: Colors.text.muted },
  tabTextActive: { color: Colors.primary.DEFAULT },
  scrollContent: { padding: 16, paddingBottom: 40 },
  metricsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  metricValue: { fontSize: 32, fontWeight: "900", color: Colors.primary.DEFAULT },
  metricLabel: { fontSize: 12, color: Colors.text.secondary, marginTop: 4, fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: Colors.text.primary, marginBottom: 12 },
  inventorySummaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  inventoryChip: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", minWidth: "22%" },
  inventoryChipGroup: { fontSize: 13, fontWeight: "900", color: Colors.primary.DEFAULT },
  inventoryChipUnits: { fontSize: 11, fontWeight: "700", color: Colors.text.secondary, marginTop: 2 },
  lastUpdatedText: { fontSize: 12, color: Colors.text.muted, textAlign: "center", marginBottom: 8 },
  inventoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  inventoryLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  inventoryGroup: { fontSize: 16, fontWeight: "900", color: Colors.primary.DEFAULT },
  inventoryUnit: { fontSize: 12, color: Colors.text.muted },
  stepper: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary.light, alignItems: "center", justifyContent: "center" },
  stepValue: { fontSize: 18, fontWeight: "900", color: Colors.text.primary, minWidth: 30, textAlign: "center" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.text.muted, fontWeight: "600" },
  requestCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  emergencyTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start", marginBottom: 8 },
  emergencyTagText: { fontSize: 10, fontWeight: "900", color: "#DC2626" },
  requestCardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  bloodCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary.light, alignItems: "center", justifyContent: "center" },
  bloodCircleText: { fontSize: 12, fontWeight: "900", color: Colors.primary.DEFAULT },
  requestInfo: { flex: 1 },
  requestId: { fontSize: 13, fontWeight: "800", color: Colors.text.primary },
  requestPatient: { fontSize: 12, color: Colors.text.secondary },
  requestUnits: { fontSize: 12, color: Colors.text.muted },
  requestHospital: { fontSize: 12, color: Colors.text.muted, marginBottom: 10 },
  requestActions: { flexDirection: "row", gap: 10 },
  rejectBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1.5, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  rejectBtnText: { fontSize: 13, fontWeight: "700", color: Colors.text.secondary },
  acceptBtn: { flex: 2, height: 40, borderRadius: 10, backgroundColor: Colors.primary.DEFAULT, alignItems: "center", justifyContent: "center" },
  acceptBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
