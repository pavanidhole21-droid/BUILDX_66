import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack, usePathname } from "expo-router";
import BottomTabBar from "@/components/common/BottomTabBar";

export default function UserLayout() {
  const pathname = usePathname();

  // Screens that should hide the bottom navigation bar (sub-flows, details, forms)
  const hideOnScreens = [
    "/details",
    "/request",
    "/confirmation",
    "/emergency",
    "/language",
    "/requests",
  ];
  const shouldHide = hideOnScreens.some((route) => pathname.endsWith(route));

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: "#F8FAFC" },
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="saved" />
        <Stack.Screen name="search" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="requests" />
        <Stack.Screen name="details" />
        <Stack.Screen name="request" />
        <Stack.Screen name="confirmation" />
        <Stack.Screen name="emergency" />
        <Stack.Screen name="language" />
      </Stack>

      {!shouldHide && <BottomTabBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
