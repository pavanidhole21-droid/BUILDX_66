import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Header from "@/components/common/Header";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { ALL_BLOOD_GROUPS, BloodGroup } from "@/types/blood";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut: authSignOut } = useAuth();

  // Edit Profile modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState<BloodGroup | undefined>(undefined);
  const [editCity, setEditCity] = useState("");
  const [saving, setSaving] = useState(false);

  // Dynamic user details with robust fallbacks
  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "BloodHelp User");

  const displayEmail = profile?.email || user?.email || "No email";
  const displayPhone = profile?.phone || user?.user_metadata?.phone || "No phone added";
  const displayBloodGroup = profile?.bloodGroup || (user?.user_metadata?.blood_group as BloodGroup) || null;
  const displayCity = profile?.city || user?.user_metadata?.city || "Nagpur";
  const displayState = profile?.state || user?.user_metadata?.state || "Maharashtra";

  const openEditModal = () => {
    setEditName(displayName);
    setEditPhone(displayPhone === "No phone added" ? "" : displayPhone);
    setEditBloodGroup(displayBloodGroup || undefined);
    setEditCity(displayCity);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      bloodGroup: editBloodGroup,
      city: editCity.trim() || "Nagpur",
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error);
    } else {
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authSignOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const menuItems: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress: () => void;
  }[] = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      onPress: openEditModal,
    },
    {
      icon: "document-text-outline",
      label: "My Requests",
      onPress: () => router.push("/(user)/requests"),
    },
    {
      icon: "bookmark-outline",
      label: "Saved Organizations",
      onPress: () => router.push("/(user)/saved"),
    },
    {
      icon: "settings-outline",
      label: "Settings",
      onPress: () => alert("Notification & privacy settings are configured."),
    },
    {
      icon: "globe-outline",
      label: "Language",
      value: "English",
      onPress: () => router.push("/(user)/language"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      onPress: () => alert("Emergency Helpline: 9371742672"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        title="My Profile"
        showBack={true}
        onBackPress={() => router.replace("/(user)/home")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={Colors.primary.DEFAULT} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <Text style={styles.userPhone}>{displayPhone}</Text>
            <View style={styles.bloodBadge}>
              <Ionicons name="water" size={12} color={Colors.primary.DEFAULT} />
              <Text style={styles.bloodBadgeText}>
                {displayBloodGroup ? `Donor Group: ${displayBloodGroup}` : "Group: Not set"}
              </Text>
            </View>
            <Text style={styles.locationSmall}>
              📍 {displayCity}, {displayState}
            </Text>
          </View>
          <TouchableOpacity
            onPress={openEditModal}
            style={styles.editIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={Colors.primary.DEFAULT} />
          </TouchableOpacity>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconWrapper}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={Colors.text.primary}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>

              <View style={styles.menuItemRight}>
                {item.value && (
                  <Text style={styles.menuValue}>{item.value}</Text>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.text.muted}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.text.muted}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+91 9876543210"
                placeholderTextColor={Colors.text.muted}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.modalInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="City"
                placeholderTextColor={Colors.text.muted}
              />

              <Text style={styles.inputLabel}>Blood Group</Text>
              <View style={styles.bgSelectorRow}>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    onPress={() => setEditBloodGroup(bg === editBloodGroup ? undefined : bg)}
                    style={[
                      styles.bgChip,
                      editBloodGroup === bg && styles.bgChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bgChipText,
                        editBloodGroup === bg && styles.bgChipTextActive,
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ marginTop: 20 }}>
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  loading={saving}
                  fullWidth
                  size="lg"
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 20,
    gap: 14,
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary.border,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text.primary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 1,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.lighter,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "flex-start",
    gap: 4,
  },
  bloodBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
  },
  locationSmall: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 4,
  },
  editIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary.lighter,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.borderLight,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  logoutBtn: {
    backgroundColor: Colors.primary.DEFAULT,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.text.primary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.surface.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
    backgroundColor: Colors.surface.white,
  },
  bgSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  bgChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    backgroundColor: "#FFFFFF",
  },
  bgChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  bgChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  bgChipTextActive: {
    color: "#FFFFFF",
  },
});

