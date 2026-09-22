import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { MOCK_ORGANIZATIONS } from "@/services/api/mockData";
import { ALL_BLOOD_GROUPS } from "@/types/blood";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function OrganizationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const org =
    MOCK_ORGANIZATIONS.find((o) => o.id === id) || MOCK_ORGANIZATIONS[0];

  const handleCall = () => {
    Alert.alert(
      "Confirm Availability",
      `Call ${org.name} at ${org.phone} to confirm before travelling?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          onPress: () => Linking.openURL(`tel:${org.phone.replace(/\s+/g, "")}`),
        },
      ]
    );
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      org.name + ", " + org.address
    )}`;
    Linking.openURL(url);
  };

  const handleRequestBlood = () => {
    router.push({
      pathname: "/(user)/request",
      params: {
        orgId: org.id,
        orgName: org.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organization Details</Text>
        <TouchableOpacity
          onPress={() => alert(`Shared ${org.name}`)}
          style={styles.shareButton}
        >
          <Ionicons name="share-social-outline" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Graphic representing hospital facility */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="business" size={60} color="#94A3B8" />
            <Text style={styles.bannerOrgTitle}>{org.name}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.orgName}>{org.name}</Text>
            {org.isVerified && <Badge label="Verified" variant="verified" />}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="medical" size={14} color={Colors.primary.DEFAULT} />
              <Text style={styles.metaText}>{org.type}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="location" size={14} color={Colors.accent.navigate} />
              <Text style={styles.metaText}>{org.distanceKm} km away</Text>
            </View>
          </View>

          {/* Address & Contact */}
          <View style={styles.contactItem}>
            <Ionicons name="map-outline" size={18} color={Colors.text.secondary} />
            <Text style={styles.contactText}>{org.address}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={18} color={Colors.text.secondary} />
            <Text style={styles.contactText}>{org.phone}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={18} color={Colors.status.verified} />
            <Text style={[styles.contactText, { color: Colors.status.verified, fontWeight: "700" }]}>
              {org.operatingHours}
            </Text>
          </View>
        </View>

        {/* Blood Availability Inventory Matrix */}
        <View style={styles.inventorySection}>
          <View style={styles.inventoryHeader}>
            <Text style={styles.sectionHeading}>Blood Availability</Text>
            <Text style={styles.updatedBadge}>
              Updated {org.lastUpdatedMinutesAgo} min ago
            </Text>
          </View>

          <Text style={styles.disclaimerNote}>
            ⚠️ Reported availability only. Always call to confirm before travelling.
          </Text>

          <View style={styles.gridContainer}>
            {ALL_BLOOD_GROUPS.map((bg) => {
              const count = org.inventory[bg] || 0;
              const hasUnits = count > 0;
              return (
                <View
                  key={bg}
                  style={[
                    styles.gridItem,
                    hasUnits ? styles.gridItemAvailable : styles.gridItemEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.groupLabel,
                      hasUnits ? styles.groupLabelAvailable : styles.groupLabelEmpty,
                    ]}
                  >
                    {bg}
                  </Text>
                  <Text
                    style={[
                      styles.unitCount,
                      hasUnits ? styles.unitCountAvailable : styles.unitCountEmpty,
                    ]}
                  >
                    {count} {count === 1 ? "unit" : "units"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCall}
          style={styles.bottomCallBtn}
        >
          <Ionicons name="call" size={18} color="#16A34A" />
          <Text style={styles.bottomCallText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNavigate}
          style={styles.bottomNavBtn}
        >
          <Ionicons name="navigate" size={18} color="#2563EB" />
          <Text style={styles.bottomNavText}>Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleRequestBlood}
          style={styles.bottomRequestBtn}
        >
          <Text style={styles.bottomRequestText}>Request Blood</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 90,
  },
  bannerContainer: {
    height: 160,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bannerOrgTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orgName: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  contactText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  inventorySection: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    padding: 18,
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  updatedBadge: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  disclaimerNote: {
    fontSize: 12,
    color: Colors.primary.dark,
    backgroundColor: Colors.primary.lighter,
    padding: 8,
    borderRadius: 8,
    marginVertical: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  gridItem: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  gridItemAvailable: {
    backgroundColor: Colors.primary.light,
    borderColor: Colors.primary.border,
  },
  gridItemEmpty: {
    backgroundColor: Colors.surface.muted,
    borderColor: Colors.surface.border,
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: "900",
  },
  groupLabelAvailable: {
    color: Colors.primary.DEFAULT,
  },
  groupLabelEmpty: {
    color: Colors.text.muted,
  },
  unitCount: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  unitCountAvailable: {
    color: Colors.text.primary,
  },
  unitCountEmpty: {
    color: Colors.text.muted,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Colors.surface.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 8,
  },
  bottomCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    gap: 4,
  },
  bottomCallText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16A34A",
  },
  bottomNavBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
    gap: 4,
  },
  bottomNavText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  bottomRequestBtn: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary.DEFAULT,
  },
  bottomRequestText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
