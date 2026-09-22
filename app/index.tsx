import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";

export default function SplashScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the heart emblem
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in controls
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim, fadeAnim]);

  const handleStartOnboarding = () => {
    router.push("/(onboarding)");
  };

  const handleGoHome = () => {
    router.replace("/(user)/home");
  };

  const handleGoProvider = () => {
    router.push("/(provider)/dashboard");
  };

  const handleGoAdmin = () => {
    router.push("/(admin)/dashboard");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          {/* Logo with Heart Emblem */}
          <Animated.View
            style={[
              styles.logoWrapper,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="water" size={64} color="#FFFFFF" />
              <View style={styles.heartOverlay}>
                <Ionicons
                  name="heart"
                  size={26}
                  color={Colors.primary.DEFAULT}
                />
              </View>
            </View>
          </Animated.View>

          {/* Typography */}
          <Text style={styles.title}>BloodHelp</Text>
          <Text style={styles.tagline}>Every Drop Counts</Text>
          <Text style={styles.subtagline}>Every Life Matters</Text>

          {/* Heartbeat Wave Line */}
          <View style={styles.waveContainer}>
            <View style={styles.waveLineLeft} />
            <Ionicons name="pulse" size={26} color="#FFFFFF" />
            <View style={styles.waveLineRight} />
          </View>

          {/* Setup Complete Badge */}
          <View style={styles.badgeSetup}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text style={styles.badgeText}>Setup Complete</Text>
          </View>
          <Text style={styles.verificationNote}>
            Find the blood help you need, where it is available.
          </Text>
        </View>

        {/* Quick Launcher for Interactive Testing */}
        <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStartOnboarding}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Start Onboarding</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary.DEFAULT} />
          </TouchableOpacity>

          <View style={styles.quickNavRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoHome}
              style={styles.ghostButton}
            >
              <Ionicons name="home-outline" size={16} color="#FFFFFF" />
              <Text style={styles.ghostButtonText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoProvider}
              style={styles.ghostButton}
            >
              <Ionicons name="medkit-outline" size={16} color="#FFFFFF" />
              <Text style={styles.ghostButtonText}>Provider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoAdmin}
              style={styles.ghostButton}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
              <Text style={styles.ghostButtonText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C62828",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  heartOverlay: {
    position: "absolute",
    bottom: "26%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    opacity: 0.95,
  },
  subtagline: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFCDD2",
    marginBottom: 16,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
    marginVertical: 12,
  },
  waveLineLeft: {
    flex: 1,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginRight: 8,
  },
  waveLineRight: {
    flex: 1,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginLeft: 8,
  },
  badgeSetup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16A34A",
    marginLeft: 6,
  },
  verificationNote: {
    fontSize: 12,
    color: "#FFCDD2",
    marginTop: 8,
    textAlign: "center",
    maxWidth: 280,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    height: 52,
    borderRadius: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
    marginRight: 8,
  },
  quickNavRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    gap: 12,
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    gap: 4,
  },
  ghostButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
