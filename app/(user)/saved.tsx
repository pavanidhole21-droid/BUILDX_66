import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { MOCK_ORGANIZATIONS } from "@/services/api/mockData";
import { useSavedOrganizations } from "@/hooks/useSavedOrganizations";
import { Organization, OrganizationType } from "@/types/organization";
import Badge from "@/components/ui/Badge";

type FilterType = "All" | "Hospital" | "Blood Bank" | "NGO";

export default function SavedOrganizationsScreen() {
  const router = useRouter();
  const { savedIds, isSaved, toggleSave } = useSavedOrganizations();
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter organizations by savedIds and selected category
  const savedOrgs = MOCK_ORGANIZATIONS.filter((org) => savedIds.includes(org.id));

  const filteredOrgs = savedOrgs.filter((org) => {
    if (filterType === "All") return true;
    return org.type === filterType;
  });

  const countAll = savedOrgs.length;
  const countHospitals = savedOrgs.filter((o) => o.type === "Hospital").length;
  const countBloodBanks = savedOrgs.filter((o) => o.type === "Blood Bank").length;
  const countNGOs = savedOrgs.filter((o) => o.type === "NGO").length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleHeartPress = async (org: Organization) => {
    const isNowSaved = await toggleSave(org.id);
    if (isNowSaved) {
      showToast(`Saved ${org.name}`);
    } else {
      showToast(`Removed from saved`);
    }
  };

  const handleCall = (phone: string, orgName: string) => {
    Alert.alert("Call Organization", `Call ${orgName} at ${phone}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`),
      },
    ]);
  };

  const handleNavigate = (org: Organization) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      org.name + ", " + org.address
    )}`;
    Linking.openURL(url);
  };

  const handleOpenDetails = (orgId: string) => {
    router.push({
      pathname: "/(user)/details",
      params: { id: orgId },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(user)/home")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Saved Organizations</Text>

        <View style={styles.headerHeart}>
          <Ionicons name="heart" size={22} color="#DC2626" />
        </View>
      </View>

      <Text style={styles.subtitle}>
        Your saved blood-help centers for quick access.
      </Text>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          onPress={() => setFilterType("All")}
          style={[styles.filterPill, filterType === "All" && styles.filterPillActive]}
        >
          <Text
            style={[
              styles.filterPillText,
              filterType === "All" && styles.filterPillTextActive,
            ]}
          >
            All ({countAll})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("Hospital")}
          style={[
            styles.filterPill,
            filterType === "Hospital" && styles.filterPillActive,
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
              filterType === "Hospital" && styles.filterPillTextActive,
            ]}
          >
            Hospitals ({countHospitals})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("Blood Bank")}
          style={[
            styles.filterPill,
            filterType === "Blood Bank" && styles.filterPillActive,
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
              filterType === "Blood Bank" && styles.filterPillTextActive,
            ]}
          >
            Blood Banks ({countBloodBanks})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("NGO")}
          style={[styles.filterPill, filterType === "NGO" && styles.filterPillActive]}
        >
          <Text
            style={[
              styles.filterPillText,
              filterType === "NGO" && styles.filterPillTextActive,
            ]}
          >
            NGOs ({countNGOs})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredOrgs.map((org) => {
          const saved = isSaved(org.id);

          // Get primary blood availability string
          let bloodAvailability = "O+ : 8 units available";
          if (org.type === "NGO") {
            bloodAvailability = "Blood Donation Camps";
          } else if (org.id === "org_redcross") {
            bloodAvailability = "A+ : 5 units available";
          } else if (org.id === "org_lifecare") {
            bloodAvailability = "B+ : 6 units available";
          } else if (org.id === "org_cityblood") {
            bloodAvailability = "O- : 3 units available";
          }

          // Format freshness
          const freshnessText =
            org.lastUpdatedMinutesAgo >= 60
              ? `Updated ${Math.floor(org.lastUpdatedMinutesAgo / 60)} hour${
                  Math.floor(org.lastUpdatedMinutesAgo / 60) > 1 ? "s" : ""
                } ago`
              : `Updated ${org.lastUpdatedMinutesAgo} min ago`;

          return (
            <View key={org.id} style={styles.card}>
              {/* Top Row: Icon, Title, Heart */}
              <View style={styles.cardHeader}>
                {/* Organization Icon Circle */}
                <View
                  style={[
                    styles.orgIconBox,
                    org.type === "Hospital"
                      ? styles.iconBoxHospital
                      : org.type === "NGO"
                      ? styles.iconBoxNGO
                      : styles.iconBoxBloodBank,
                  ]}
                >
                  <Ionicons
                    name={
                      org.type === "Hospital"
                        ? "business"
                        : org.type === "NGO"
                        ? "heart"
                        : "water"
                    }
                    size={22}
                    color={
                      org.type === "Hospital"
                        ? "#0284C7"
                        : org.type === "NGO"
                        ? "#16A34A"
                        : Colors.primary.DEFAULT
                    }
                  />
                </View>

                {/* Name & Submeta */}
                <View style={styles.cardHeaderMiddle}>
                  <Text style={styles.orgName}>{org.name}</Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="location-sharp" size={12} color="#64748B" />
                    <Text style={styles.metaText}>
                      {org.type} • {org.distanceKm} km away
                    </Text>
                  </View>
                </View>

                {/* Heart Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleHeartPress(org)}
                  style={styles.heartBtn}
                >
                  <Ionicons
                    name={saved ? "heart" : "heart-outline"}
                    size={22}
                    color={saved ? "#DC2626" : "#94A3B8"}
                  />
                </TouchableOpacity>
              </View>

              {/* Status Row: Blood Availability & Verified */}
              <View style={styles.statusRow}>
                <View style={styles.bloodTag}>
                  <Ionicons
                    name={org.type === "NGO" ? "people" : "water"}
                    size={12}
                    color={Colors.primary.DEFAULT}
                  />
                  <Text style={styles.bloodTagText}>{bloodAvailability}</Text>
                </View>

                {org.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              {/* Freshness Row */}
              <View style={styles.freshnessRow}>
                <Text style={styles.freshnessText}>{freshnessText}</Text>
              </View>

              {/* Action Buttons: Call, Navigate, View Details */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCall(org.phone, org.name)}
                  style={styles.callBtn}
                >
                  <Ionicons name="call" size={14} color="#16A34A" />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleNavigate(org)}
                  style={styles.navigateBtn}
                >
                  <Ionicons name="navigate" size={14} color="#2563EB" />
                  <Text style={styles.navigateText}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetails(org.id)}
                  style={styles.detailsBtn}
                >
                  <Text style={styles.detailsText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredOrgs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={54} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No saved organizations</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any blood bank or hospital to save it for quick emergency access.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(user)/search")}
              style={styles.exploreBtn}
            >
              <Text style={styles.exploreBtnText}>Explore Centers</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Safety Tip Banner matching Image 2 */}
        <View style={styles.safetyBanner}>
          <View style={styles.bulbCircle}>
            <Ionicons name="bulb-outline" size={20} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyHeadline}>Always ready, always helpful</Text>
            <Text style={styles.safetySub}>
              Keep your trusted blood-help centers saved for emergencies.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  headerHeart: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    paddingBottom: 12,
  },
  filtersRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  filterPillActive: {
    backgroundColor: Colors.primary.DEFAULT,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  toast: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    zIndex: 99,
    backgroundColor: "#1E293B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  orgIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconBoxHospital: {
    backgroundColor: "#E0F2FE",
  },
  iconBoxNGO: {
    backgroundColor: "#DCFCE7",
  },
  iconBoxBloodBank: {
    backgroundColor: "#FEE2E2",
  },
  cardHeaderMiddle: {
    flex: 1,
  },
  orgName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
  },
  heartBtn: {
    padding: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  bloodTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    alignSelf: "flex-start",
  },
  bloodTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  freshnessRow: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  freshnessText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    gap: 4,
  },
  callText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  navigateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
    gap: 4,
  },
  navigateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  detailsBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    gap: 2,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 12,
  },
  bulbCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  safetyHeadline: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991B1B",
  },
  safetySub: {
    fontSize: 11,
    color: "#B91C1C",
    marginTop: 2,
  },
});
