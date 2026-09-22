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
import Config from "@/constants/config";
import Header from "@/components/common/Header";
import Badge from "@/components/ui/Badge";
import { OrganizationService } from "@/services/api/organizationService";
import { GoogleSheetsService } from "@/services/api/googleSheetsService";
import { Organization } from "@/types/organization";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "organizations">("analytics");

  const [stats, setStats] = useState({
    totalOrgs: 0,
    verifiedOrgs: 0,
    pendingOrgs: 0,
    totalRequests: 0,
  });
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [fetchedStats, fetchedOrgs] = await Promise.all([
      OrganizationService.getAdminStats(),
      OrganizationService.getAll(),
    ]);
    setStats(fetchedStats);
    setOrgs(fetchedOrgs);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleVerify = async (org: Organization) => {
    const newStatus = !org.isVerified;
    Alert.alert(
      newStatus ? "Verify Organization" : "Unverify Organization",
      `${newStatus ? "Verify" : "Unverify"} ${org.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            const { error } = await OrganizationService.toggleVerification(org.id, newStatus);
            if (error) {
              Alert.alert("Error", error);
            } else {
              setOrgs((prev) =>
                prev.map((o) => o.id === org.id ? { ...o, isVerified: newStatus } : o)
              );
              setStats((prev) => ({
                ...prev,
                verifiedOrgs: prev.verifiedOrgs + (newStatus ? 1 : -1),
                pendingOrgs: prev.pendingOrgs + (newStatus ? -1 : 1),
              }));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        title="Admin Console"
        showBack={true}
        onBackPress={() => router.replace("/(user)/home")}
      />

      {/* Admin identity bar */}
      <View style={styles.adminBar}>
        <Ionicons name="shield-checkmark" size={18} color={Colors.status.info} />
        <Text style={styles.adminBarText}>BloodHelp Admin</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Super Admin</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("analytics")}
          style={[styles.tab, activeTab === "analytics" && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === "analytics" && styles.tabTextActive]}>
            Analytics & Monitoring
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("organizations")}
          style={[styles.tab, activeTab === "organizations" && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === "organizations" && styles.tabTextActive]}>
            Organizations ({stats.totalOrgs})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} style={{ flex: 1 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ── ANALYTICS TAB ── */}
          {activeTab === "analytics" && (
            <View>
              {/* KPI Cards */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{stats.totalOrgs}</Text>
                  <Text style={styles.kpiLabel}>Total Orgs</Text>
                </View>
                <View style={[styles.kpiCard, { borderColor: "#BBF7D0" }]}>
                  <Text style={[styles.kpiValue, { color: "#16A34A" }]}>{stats.verifiedOrgs}</Text>
                  <Text style={styles.kpiLabel}>Verified</Text>
                </View>
                <View style={[styles.kpiCard, { borderColor: "#FED7AA" }]}>
                  <Text style={[styles.kpiValue, { color: "#D97706" }]}>{stats.pendingOrgs}</Text>
                  <Text style={styles.kpiLabel}>Pending</Text>
                </View>
                <View style={[styles.kpiCard, { borderColor: "#BFDBFE" }]}>
                  <Text style={[styles.kpiValue, { color: Colors.status.info }]}>{stats.totalRequests}</Text>
                  <Text style={styles.kpiLabel}>Requests</Text>
                </View>
              </View>

              {/* Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>System Overview</Text>
                <View style={styles.summaryRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                  <Text style={styles.summaryText}>
                    {stats.verifiedOrgs} verified organizations active
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="time-outline" size={16} color="#D97706" />
                  <Text style={styles.summaryText}>
                    {stats.pendingOrgs} organizations pending verification
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.primary.DEFAULT} />
                  <Text style={styles.summaryText}>
                    {stats.totalRequests} total blood requests submitted
                  </Text>
                </View>
              </View>

              {/* Stale inventory warning */}
              {orgs.some((o) => o.lastUpdatedMinutesAgo > 60) && (
                <View style={styles.warningCard}>
                  <Ionicons name="warning-outline" size={18} color="#D97706" />
                  <Text style={styles.warningText}>
                    {orgs.filter((o) => o.lastUpdatedMinutesAgo > 60).length} organization(s) have stale inventory (last updated &gt;60 min ago)
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── ORGANIZATIONS TAB ── */}
          {activeTab === "organizations" && (
            <View>
              {orgs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="business-outline" size={48} color={Colors.text.muted} />
                  <Text style={styles.emptyText}>No organizations found</Text>
                </View>
              ) : (
                orgs.map((org) => (
                  <View key={org.id} style={styles.orgCard}>
                    <View style={styles.orgCardTop}>
                      <View style={styles.orgInfo}>
                        <Text style={styles.orgName}>{org.name}</Text>
                        <Text style={styles.orgMeta}>{org.type} • {org.city}</Text>
                      </View>
                      <Badge
                        label={org.isVerified ? "Verified" : "Pending"}
                        variant="status"
                        status={org.isVerified ? "Accepted" : "Searching"}
                      />
                    </View>
                    <View style={styles.orgCardFooter}>
                      <Text style={styles.orgUpdated}>
                        Updated {org.lastUpdatedMinutesAgo} min ago
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleToggleVerify(org)}
                        style={[
                          styles.verifyBtn,
                          org.isVerified ? styles.verifyBtnActive : styles.verifyBtnInactive,
                        ]}
                      >
                        <Ionicons
                          name={org.isVerified ? "close-circle-outline" : "checkmark-circle-outline"}
                          size={14}
                          color={org.isVerified ? "#DC2626" : "#16A34A"}
                        />
                        <Text
                          style={[
                            styles.verifyBtnText,
                            { color: org.isVerified ? "#DC2626" : "#16A34A" },
                          ]}
                        >
                          {org.isVerified ? "Unverify" : "Verify"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity
                style={styles.sheetSyncBtn}
                onPress={async () => {
                  if (!Config.googleSheet.webhookUrl) {
                    Alert.alert(
                      "Google Sheet Webhook Required",
                      `To sync directly to your Google Sheet:\n\n1. Open your sheet: ${Config.googleSheet.url}\n2. Go to Extensions -> Apps Script\n3. Paste the code from google_apps_script.js and Deploy as Web App\n4. Add the Web App URL to EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL in .env`
                    );
                    return;
                  }
                  const res = await GoogleSheetsService.syncAllHospitals(orgs);
                  if (res.success) {
                    Alert.alert("Sync Successful", `Successfully synced ${orgs.length} hospitals and inventory to Google Sheet.`);
                  } else {
                    Alert.alert("Sync Failed", res.error);
                  }
                }}
              >
                <Ionicons name="document-text-outline" size={20} color="#16A34A" />
                <Text style={styles.sheetSyncBtnText}>Sync to Google Sheet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addOrgBtn}
                onPress={() => Alert.alert("Add Organization", "Use Supabase dashboard to add new organizations and assign provider_id.")}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary.DEFAULT} />
                <Text style={styles.addOrgBtnText}>Add Organization</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  adminBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#EFF6FF", borderBottomWidth: 1, borderBottomColor: "#BFDBFE", gap: 8 },
  adminBarText: { fontSize: 14, fontWeight: "700", color: Colors.text.primary, flex: 1 },
  adminBadge: { backgroundColor: Colors.status.info, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  adminBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF" },
  tabBar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", paddingHorizontal: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary.DEFAULT },
  tabText: { fontSize: 11, fontWeight: "700", color: Colors.text.muted, textAlign: "center" },
  tabTextActive: { color: Colors.primary.DEFAULT },
  scrollContent: { padding: 16, paddingBottom: 40 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, minWidth: "45%", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1.5, borderColor: Colors.surface.border },
  kpiValue: { fontSize: 32, fontWeight: "900", color: Colors.primary.DEFAULT },
  kpiLabel: { fontSize: 11, color: Colors.text.muted, fontWeight: "600", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 10 },
  summaryTitle: { fontSize: 14, fontWeight: "800", color: Colors.text.primary, marginBottom: 4 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryText: { fontSize: 13, color: Colors.text.secondary, flex: 1 },
  warningCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFBEB", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#FDE68A" },
  warningText: { fontSize: 12, color: "#92400E", flex: 1, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.text.muted, fontWeight: "600" },
  orgCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  orgCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orgInfo: { flex: 1, marginRight: 8 },
  orgName: { fontSize: 14, fontWeight: "800", color: Colors.text.primary },
  orgMeta: { fontSize: 12, color: Colors.text.muted, marginTop: 2 },
  orgCardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 },
  orgUpdated: { fontSize: 11, color: Colors.text.muted },
  verifyBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  verifyBtnActive: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  verifyBtnInactive: { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" },
  verifyBtnText: { fontSize: 12, fontWeight: "700" },
  sheetSyncBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, marginTop: 8, borderRadius: 12, borderWidth: 1.5, borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
  sheetSyncBtnText: { fontSize: 14, fontWeight: "700", color: "#16A34A" },
  addOrgBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, marginTop: 8, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", borderColor: Colors.primary.DEFAULT, backgroundColor: Colors.primary.lighter },
  addOrgBtnText: { fontSize: 14, fontWeight: "700", color: Colors.primary.DEFAULT },
});
