import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Switch,
  Linking,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Config from "@/constants/config";
import { BloodGroup, ALL_BLOOD_GROUPS } from "@/types/blood";
import {
  BloodService,
  RankedOrganizationResult,
} from "@/services/api/bloodService";
import Header from "@/components/common/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import BottomTabBar from "@/components/common/BottomTabBar";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [units, setUnits] = useState(2);
  const [locationText, setLocationText] = useState("Nagpur, Maharashtra");
  const [hasSearched, setHasSearched] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);

  // Filters
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterRecentlyUpdated, setFilterRecentlyUpdated] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Results
  const [results, setResults] = useState<RankedOrganizationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await BloodService.searchBloodSources({
        bloodGroup,
        units,
        maxDistanceKm: filterDistance || undefined,
        verifiedOnly: filterVerifiedOnly,
        recentlyUpdatedOnly: filterRecentlyUpdated,
      });
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [bloodGroup, units, filterDistance, filterVerifiedOnly, filterRecentlyUpdated]);

  const handleCall = (phone: string, orgName: string) => {
    const targetPhone = phone || Config.emergencyHelpline;
    Alert.alert(
      "Confirm Availability",
      `Call ${orgName} at ${targetPhone} to confirm before travelling?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          onPress: () => Linking.openURL(`tel:${targetPhone.replace(/\s+/g, "")}`),
        },
      ]
    );
  };

  const handleNavigate = (org: RankedOrganizationResult["organization"]) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      org.name + ", " + org.address
    )}`;
    Linking.openURL(url);
  };

  const handleRequest = (org: RankedOrganizationResult["organization"]) => {
    router.push({
      pathname: "/(user)/request",
      params: {
        orgId: org.id,
        orgName: org.name,
        bloodGroup,
        units,
      },
    });
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
      <Header
        title="Find Blood"
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={styles.filterIconBtn}
          >
            <Ionicons name="options-outline" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        }
      />

      {/* Top Search Controls Bar */}
      <View style={styles.controlsBar}>
        {/* Blood Group Selector Chips */}
        <View style={styles.bloodSelectorRow}>
          <Text style={styles.controlLabel}>Blood Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bloodChipsScroll}>
            {ALL_BLOOD_GROUPS.map((bg) => {
              const isSelected = bg === bloodGroup;
              return (
                <TouchableOpacity
                  key={bg}
                  activeOpacity={0.7}
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
          </ScrollView>
        </View>

        {/* Units Counter & View Toggle */}
        <View style={styles.counterRow}>
          <View style={styles.unitsControl}>
            <Text style={styles.unitsLabel}>Units Required</Text>
            <View style={styles.stepperBox}>
              <TouchableOpacity
                onPress={() => setUnits((u) => Math.max(1, u - 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={16} color={Colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{units}</Text>
              <TouchableOpacity
                onPress={() => setUnits((u) => u + 1)}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={16} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List vs Map Switcher */}
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              style={[
                styles.toggleBtn,
                viewMode === "list" && styles.toggleBtnActive,
              ]}
            >
              <Ionicons
                name="list"
                size={16}
                color={viewMode === "list" ? "#FFFFFF" : Colors.text.muted}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  viewMode === "list" && styles.toggleBtnTextActive,
                ]}
              >
                List
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode("map")}
              style={[
                styles.toggleBtn,
                viewMode === "map" && styles.toggleBtnActive,
              ]}
            >
              <Ionicons
                name="map"
                size={16}
                color={viewMode === "map" ? "#FFFFFF" : Colors.text.muted}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  viewMode === "map" && styles.toggleBtnTextActive,
                ]}
              >
                Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content: List or Map View */}
      {viewMode === "list" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsScroll}
        >
          {/* Header summary */}
          <View style={styles.resultsSummaryRow}>
            <Text style={styles.resultsSummaryText}>
              <Text style={{ fontWeight: "800", color: Colors.text.primary }}>
                {results.length} verified sources
              </Text>{" "}
              near {locationText}
            </Text>
            <Text style={styles.disclaimerText}>
              Reported availability • Call to confirm
            </Text>
          </View>

          {/* Organization Cards */}
          {results.map((item) => {
            const org = item.organization;
            return (
              <View key={org.id} style={styles.card}>
                {/* Top Row: Name, Type & Verified */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetails(org.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleCol}>
                      <Text style={styles.orgName}>{org.name}</Text>
                      <View style={styles.orgMetaRow}>
                        <Text style={styles.orgType}>{org.type}</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.distanceText}>
                          {org.distanceKm} km away
                        </Text>
                      </View>
                    </View>

                    {org.isVerified && (
                      <Badge label="Verified" variant="verified" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Blood Availability Pill & Freshness */}
                <View style={styles.availabilityRow}>
                  <View style={styles.bloodPill}>
                    <Ionicons name="water" size={14} color={Colors.primary.DEFAULT} />
                    <Text style={styles.bloodPillText}>
                      {bloodGroup} : {item.availableUnits} units reported
                    </Text>
                  </View>

                  <Text style={styles.updatedText}>
                    {org.lastUpdatedMinutesAgo <= 0
                      ? "Just now"
                      : `Updated ${org.lastUpdatedMinutesAgo} min ago`}
                  </Text>
                </View>

                {/* Smart USP Match Reasons */}
                <View style={styles.reasonsContainer}>
                  <Text style={styles.reasonsTitle}>Recommended because:</Text>
                  <View style={styles.reasonsGrid}>
                    {item.relevanceReasons.map((reason, idx) => (
                      <Text key={idx} style={styles.reasonBadge}>
                        {reason}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* Action Buttons: Call, Navigate, Request */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleCall(org.phone, org.name)}
                    style={styles.actionBtnCall}
                  >
                    <Ionicons name="call" size={14} color="#16A34A" />
                    <Text style={styles.actionCallText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleNavigate(org)}
                    style={styles.actionBtnNav}
                  >
                    <Ionicons name="navigate" size={14} color="#2563EB" />
                    <Text style={styles.actionNavText}>Navigate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRequest(org)}
                    style={styles.actionBtnRequest}
                  >
                    <Text style={styles.actionRequestText}>Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        /* Map View */
        <View style={styles.mapCanvas}>
          {/* Simulated Map Background with Grid & Pins */}
          <View style={styles.mapGrid}>
            <View style={styles.userPin}>
              <View style={styles.userPinPulse} />
              <Ionicons name="navigate-circle" size={32} color="#2563EB" />
              <Text style={styles.userPinLabel}>You (Nagpur)</Text>
            </View>

            {results.map((item, index) => {
              const isSelected = selectedOrgIndex === index;
              // Spread pins across map visually
              const topOffset = 80 + (index % 3) * 110;
              const leftOffset = 40 + (index * 75) % 240;

              return (
                <TouchableOpacity
                  key={item.organization.id}
                  onPress={() => setSelectedOrgIndex(index)}
                  style={[
                    styles.orgMarker,
                    { top: topOffset, left: leftOffset },
                    isSelected && styles.orgMarkerSelected,
                  ]}
                >
                  <Ionicons
                    name="location"
                    size={isSelected ? 36 : 28}
                    color={isSelected ? Colors.primary.DEFAULT : "#64748B"}
                  />
                  <View style={styles.markerBadge}>
                    <Text style={styles.markerBadgeText}>
                      {item.availableUnits}u
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Floating Selected Organization Bottom Card */}
          {results[selectedOrgIndex] && (
            <View style={styles.floatingCard}>
              <View style={styles.floatingCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.floatingOrgName} numberOfLines={1}>
                    {results[selectedOrgIndex].organization.name}
                  </Text>
                  <Text style={styles.floatingOrgDistance}>
                    {results[selectedOrgIndex].organization.distanceKm} km away •{" "}
                    {results[selectedOrgIndex].organization.type}
                  </Text>
                </View>
                {results[selectedOrgIndex].organization.isVerified && (
                  <Badge label="Verified" variant="verified" />
                )}
              </View>

              <View style={styles.availabilityRow}>
                <View style={styles.bloodPill}>
                  <Text style={styles.bloodPillText}>
                    {bloodGroup}: {results[selectedOrgIndex].availableUnits} units
                  </Text>
                </View>
                <Text style={styles.updatedText}>
                  Updated{" "}
                  {results[selectedOrgIndex].organization.lastUpdatedMinutesAgo} min
                  ago
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() =>
                    handleCall(
                      results[selectedOrgIndex].organization.phone,
                      results[selectedOrgIndex].organization.name
                    )
                  }
                  style={styles.actionBtnCall}
                >
                  <Ionicons name="call" size={14} color="#16A34A" />
                  <Text style={styles.actionCallText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleNavigate(results[selectedOrgIndex].organization)
                  }
                  style={styles.actionBtnNav}
                >
                  <Ionicons name="navigate" size={14} color="#2563EB" />
                  <Text style={styles.actionNavText}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleRequest(results[selectedOrgIndex].organization)
                  }
                  style={styles.actionBtnRequest}
                >
                  <Text style={styles.actionRequestText}>Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Filter Modal Sheet */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Search</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Distance Filter */}
            <Text style={styles.filterSectionTitle}>
              Distance: Up to {filterDistance} km
            </Text>
            <View style={styles.distanceChipsRow}>
              {[5, 10, 15, 25].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  onPress={() => setFilterDistance(dist)}
                  style={[
                    styles.distanceChip,
                    filterDistance === dist && styles.distanceChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.distanceChipText,
                      filterDistance === dist && styles.distanceChipTextActive,
                    ]}
                  >
                    {dist} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Toggles */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Verified Organizations Only</Text>
                <Text style={styles.toggleSub}>Only officially verified centers</Text>
              </View>
              <Switch
                value={filterVerifiedOnly}
                onValueChange={setFilterVerifiedOnly}
                trackColor={{ true: Colors.primary.DEFAULT, false: "#CBD5E1" }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Recently Updated Only</Text>
                <Text style={styles.toggleSub}>Updated in the last 60 minutes</Text>
              </View>
              <Switch
                value={filterRecentlyUpdated}
                onValueChange={setFilterRecentlyUpdated}
                trackColor={{ true: Colors.primary.DEFAULT, false: "#CBD5E1" }}
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => {
                  setFilterDistance(10);
                  setFilterVerifiedOnly(false);
                  setFilterRecentlyUpdated(false);
                }}
                style={styles.modalResetBtn}
              >
                <Text style={styles.modalResetText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalApplyBtn}
              >
                <Text style={styles.modalApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar activeTab="explore" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  filterIconBtn: {
    padding: 6,
  },
  controlsBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  bloodSelectorRow: {
    marginBottom: 10,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.muted,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  bloodChipsScroll: {
    flexDirection: "row",
    gap: 8,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.surface.muted,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  bloodChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  bloodChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  bloodChipTextActive: {
    color: "#FFFFFF",
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitsControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unitsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  stepperBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.muted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepValue: {
    fontSize: 14,
    fontWeight: "800",
    paddingHorizontal: 6,
    color: Colors.text.primary,
  },
  viewToggleGroup: {
    flexDirection: "row",
    backgroundColor: Colors.surface.muted,
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary.DEFAULT,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.muted,
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resultsScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  resultsSummaryRow: {
    marginBottom: 12,
  },
  resultsSummaryText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  orgMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  orgType: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  dotSeparator: {
    color: Colors.text.muted,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  bloodPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  bloodPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
  },
  updatedText: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  reasonsContainer: {
    backgroundColor: Colors.surface.muted,
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  reasonsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  reasonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reasonBadge: {
    fontSize: 11,
    color: Colors.primary.dark,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.primary.border,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surface.borderLight,
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    gap: 4,
  },
  actionCallText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  actionBtnNav: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
    gap: 4,
  },
  actionNavText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  actionBtnRequest: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary.DEFAULT,
  },
  actionRequestText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  mapGrid: {
    flex: 1,
    backgroundColor: "#E0F2FE",
    position: "relative",
  },
  userPin: {
    position: "absolute",
    top: 140,
    left: 150,
    alignItems: "center",
  },
  userPinPulse: {
    position: "absolute",
    top: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(37, 99, 235, 0.3)",
  },
  userPinLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E3A8A",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  orgMarker: {
    position: "absolute",
    alignItems: "center",
  },
  orgMarkerSelected: {
    zIndex: 10,
    transform: [{ scale: 1.15 }],
  },
  markerBadge: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: -8,
  },
  markerBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  floatingCard: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  floatingOrgName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  floatingOrgDistance: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  distanceChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  distanceChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    alignItems: "center",
  },
  distanceChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  distanceChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  distanceChipTextActive: {
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.borderLight,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalResetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalResetText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  modalApplyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
  },
  modalApplyText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
