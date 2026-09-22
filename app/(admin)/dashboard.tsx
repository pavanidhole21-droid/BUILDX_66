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
import Header from "@/components/common/Header";
import Badge from "@/components/ui/Badge";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "organizations">("analytics");

  const [orgs, setOrgs] = useState([
    {
      id: "org_1",
      name: "Government Medical College",
      type: "Hospital",
      location: "Nagpur",
      status: "Verified",
    },
    {
      id: "org_2",
      name: "Red Cross Blood Bank",
      type: "Blood Bank",
      location: "Nagpur",
      status: "Verified",
    },
    {
      id: "org_3",
      name: "LifeCare Hospital",
      type: "Hospital",
      location: "Nagpur",
      status: "Pending",
    },
    {
      id: "org_4",
      name: "City Blood Bank",
      type: "Blood Bank",
      location: "Nagpur",
      status: "Verified",
    },
  ]);

  const handleToggleVerify = (id: string) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "Verified" ? "Pending" : "Verified" }
          : o
      )
    );
    Alert.alert("Status Updated", "Organization verification status toggled.");
  };

  const bloodGroupStats = [
    { group: "O+", count: 42 },
    { group: "A+", count: 28 },
    { group: "B+", count: 32 },
    { group: "AB+", count: 12 },
    { group: "O-", count: 8 },
    { group: "A-", count: 6 },
    { group: "B-", count: 5 },
    { group: "AB-", count: 3 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        title="Admin Console"
        showBack={true}
        onBackPress={() => router.replace("/(user)/home")}
      />

      {/* Admin Title Bar */}
      <View style={styles.adminBar}>
        <View style={styles.adminBarLeft}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.primary.DEFAULT} />
          <Text style={styles.adminTitle}>BloodHelp Admin</Text>
        </View>
        <Text style={styles.adminBadge}>Super Admin</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("analytics")}
          style={[styles.tabBtn, activeTab === "analytics" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === "analytics" && styles.tabTextActive]}>
            Analytics & Monitoring
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("organizations")}
          style={[styles.tabBtn, activeTab === "organizations" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === "organizations" && styles.tabTextActive]}>
            Organizations ({orgs.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "analytics" ? (
          <View>
            {/* KPI Stat Cards Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>48</Text>
                <Text style={styles.statLabel}>Total Organizations</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: "#16A34A" }]}>36</Text>
                <Text style={styles.statLabel}>Verified Centers</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: "#D97706" }]}>12</Text>
                <Text style={styles.statLabel}>Pending Review</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: Colors.primary.DEFAULT }]}>
                  124
                </Text>
                <Text style={styles.statLabel}>Total Requests</Text>
              </View>
            </View>

            {/* Requests by Blood Group Bar Representation */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Requests by Blood Group</Text>
                <Text style={styles.chartPeriod}>Last 30 days</Text>
              </View>

              <View style={styles.barsContainer}>
                {bloodGroupStats.map((item) => {
                  const heightPercent = (item.count / 42) * 100;
                  return (
                    <View key={item.group} style={styles.barCol}>
                      <Text style={styles.barCount}>{item.count}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${heightPercent}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.barGroupLabel}>{item.group}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Stale Inventory Monitoring Alert */}
            <View style={styles.staleNotice}>
              <Ionicons name="alert-circle" size={20} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.staleTitle}>Stale Inventory Detection</Text>
                <Text style={styles.staleSub}>
                  2 organizations haven't updated availability in &gt; 2 hours. Automated reminder dispatched.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          /* Organization Management */
          <View>
            <View style={styles.orgHeaderRow}>
              <Text style={styles.orgHeaderTitle}>Verified Center Directory</Text>
              <TouchableOpacity
                onPress={() => alert("Add Organization modal")}
                style={styles.addOrgBtn}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.addOrgText}>Add Org</Text>
              </TouchableOpacity>
            </View>

            {orgs.map((o) => (
              <View key={o.id} style={styles.orgRowCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orgRowName}>{o.name}</Text>
                  <Text style={styles.orgRowMeta}>
                    {o.type} • {o.location}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleToggleVerify(o.id)}
                  style={[
                    styles.verifyToggleBadge,
                    o.status === "Verified"
                      ? styles.badgeVerified
                      : styles.badgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.verifyToggleText,
                      o.status === "Verified"
                        ? { color: "#16A34A" }
                        : { color: "#D97706" },
                    ]}
                  >
                    {o.status}
                  </Text>
                </TouchableOpacity>
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
  adminBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  adminBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text.primary,
  },
  adminBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: Colors.primary.DEFAULT,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.muted,
  },
  tabTextActive: {
    color: Colors.primary.DEFAULT,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  chartPeriod: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingTop: 20,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barCount: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.text.muted,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: Colors.surface.muted,
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 7,
  },
  barGroupLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.primary,
    marginTop: 6,
  },
  staleNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  staleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400E",
  },
  staleSub: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 16,
  },
  orgHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orgHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  addOrgBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addOrgText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  orgRowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orgRowName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  orgRowMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  verifyToggleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeVerified: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  verifyToggleText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
