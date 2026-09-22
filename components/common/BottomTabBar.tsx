import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export type TabRoute = "home" | "requests" | "explore" | "profile";

interface BottomTabBarProps {
  activeTab?: TabRoute;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab = "home" }) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: { key: TabRoute; label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
    { key: "home", label: "Home", icon: "home", route: "/(user)/home" },
    { key: "requests", label: "Requests", icon: "document-text", route: "/(user)/requests" },
    { key: "explore", label: "Explore", icon: "compass", route: "/(user)/search" },
    { key: "profile", label: "Profile", icon: "person", route: "/(user)/profile" },
  ];

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => handleTabPress(tab.route)}
            style={styles.tabItem}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? Colors.primary.DEFAULT : Colors.text.muted}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? Colors.primary.DEFAULT : Colors.text.muted,
                  fontWeight: isActive ? "700" : "500",
                },
              ]}
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
    height: 62,
    flexDirection: "row",
    backgroundColor: Colors.surface.white,
    borderTopWidth: 1,
    borderTopColor: Colors.surface.border,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
});

export default BottomTabBar;
