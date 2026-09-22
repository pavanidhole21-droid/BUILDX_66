import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export type TabRoute = "home" | "saved" | "explore" | "profile";

interface BottomTabBarProps {
  activeTab?: TabRoute;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab: propActiveTab }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Automatically determine active tab from route if not explicitly passed
  let activeTab: TabRoute = propActiveTab || "home";
  if (!propActiveTab) {
    if (pathname.includes("/saved")) {
      activeTab = "saved";
    } else if (pathname.includes("/search")) {
      activeTab = "explore";
    } else if (pathname.includes("/profile")) {
      activeTab = "profile";
    } else {
      activeTab = "home";
    }
  }

  const tabs: {
    key: TabRoute;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    route: string;
  }[] = [
    {
      key: "home",
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      route: "/(user)/home",
    },
    {
      key: "saved",
      label: "Saved",
      icon: "heart-outline",
      activeIcon: "heart",
      route: "/(user)/saved",
    },
    {
      key: "explore",
      label: "Explore",
      icon: "compass-outline",
      activeIcon: "compass",
      route: "/(user)/search",
    },
    {
      key: "profile",
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      route: "/(user)/profile",
    },
  ];

  const handleTabPress = (route: string) => {
    if (pathname !== route) {
      router.replace(route as any);
    }
  };

  const bottomPadding = Math.max(insets.bottom, Platform.OS === "android" ? 4 : 6);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => handleTabPress(tab.route)}
            style={styles.tabItem}
          >
            {/* 32x32 fixed icon container ensures zero jitter or displacement */}
            <View
              style={[
                styles.iconBox,
                isActive && styles.iconBoxActive,
              ]}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={isActive ? 18 : 22}
                color={isActive ? "#FFFFFF" : "#64748B"}
              />
            </View>

            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: Colors.primary.DEFAULT,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    height: 14,
    lineHeight: 14,
    textAlign: "center",
  },
  tabLabelActive: {
    color: Colors.primary.DEFAULT,
    fontWeight: "800",
  },
  tabLabelInactive: {
    color: "#64748B",
    fontWeight: "500",
  },
});

export default BottomTabBar;
