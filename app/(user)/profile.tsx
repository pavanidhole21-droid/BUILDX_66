import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Header from "@/components/common/Header";
import BottomTabBar from "@/components/common/BottomTabBar";
import { useAuth } from "@/lib/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut: authSignOut } = useAuth();

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
      onPress: () => alert(`Edit Profile: ${profile?.name} (${profile?.bloodGroup})`),
    },
    {
      icon: "document-text-outline",
      label: "My Requests",
      onPress: () => router.push("/(user)/requests"),
    },
    {
      icon: "bookmark-outline",
      label: "Saved Organizations",
      onPress: () => alert("Saved: Government Medical College & Hospital"),
    },
    {
      icon: "settings-outline",
      label: "Settings",
      onPress: () => alert("Notification & privacy settings"),
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
      onPress: () => alert("Support helpline: 1800-BLOOD-HELP"),
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
        {!profile ? (
          <View style={[styles.profileCard, { justifyContent: 'center', paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
          </View>
        ) : (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={Colors.primary.DEFAULT} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{profile?.name}</Text>
              <Text style={styles.userEmail}>{profile?.email}</Text>
              <Text style={styles.userPhone}>{profile?.phone}</Text>
              <View style={styles.bloodBadge}>
                <Ionicons name="water" size={12} color={Colors.primary.DEFAULT} />
                <Text style={styles.bloodBadgeText}>Donor Group: {profile?.bloodGroup}</Text>
              </View>
            </View>
          </View>
        )}

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

      <BottomTabBar activeTab="profile" />
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
    gap: 16,
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
});
