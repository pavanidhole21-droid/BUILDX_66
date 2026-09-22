import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { BloodRequest, RequestStatus } from "@/types/blood";
import { BloodService } from "@/services/api/bloodService";
import Header from "@/components/common/Header";
import Badge from "@/components/ui/Badge";
import BottomTabBar from "@/components/common/BottomTabBar";

type TabFilter = "All" | "Pending" | "Accepted" | "Completed";

export default function MyRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [requests, setRequests] = useState<BloodRequest[]>([]);

  useEffect(() => {
    BloodService.getRequests().then(setRequests);
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending")
      return r.status === "Pending" || r.status === "Searching";
    if (activeTab === "Accepted") return r.status === "Accepted";
    if (activeTab === "Completed") return r.status === "Completed";
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        title="My Requests"
        showBack={true}
        onBackPress={() => router.replace("/(user)/home")}
      />

      {/* Filter Tabs Row */}
      <View style={styles.tabsRow}>
        {(["All", "Pending", "Accepted", "Completed"] as TabFilter[]).map(
          (tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRequests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            {/* Header: ID, Group/Units, Status */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.requestId}>{req.id}</Text>
                <Text style={styles.reqSummary}>
                  {req.units} {req.units === 1 ? "unit" : "units"} •{" "}
                  <Text style={styles.bloodGroupBold}>{req.bloodGroup}</Text>
                </Text>
              </View>
              <Badge
                label={req.status}
                variant="status"
                status={req.status}
              />
            </View>

            {/* Hospital & Location */}
            <View style={styles.hospitalRow}>
              <Ionicons
                name="business-outline"
                size={16}
                color={Colors.text.secondary}
              />
              <Text style={styles.hospitalName}>{req.hospitalName}</Text>
            </View>

            {/* Footer Row: Timestamp & Actions */}
            <View style={styles.cardFooter}>
              <Text style={styles.createdAtText}>{req.createdAt}</Text>
              <TouchableOpacity
                onPress={() =>
                  alert(
                    `Details for ${req.id}:\nPatient: ${req.patientName}\nContact: ${req.contactPhone}`
                  )
                }
                style={styles.viewDetailsBtn}
              >
                <Text style={styles.viewDetailsText}>Details</Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={Colors.primary.DEFAULT}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No requests found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any requests in this category.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomTabBar activeTab="requests" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.surface.muted,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary.DEFAULT,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  requestId: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  reqSummary: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  bloodGroupBold: {
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
  },
  hospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 6,
  },
  hospitalName: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surface.borderLight,
  },
  createdAtText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 4,
  },
});
