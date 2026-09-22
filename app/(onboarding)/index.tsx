import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Button from "@/components/ui/Button";

const { width } = Dimensions.get("window");

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentIcon: keyof typeof Ionicons.glyphMap;
  badgeLabel: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    title: "Your Blood Can Save Lives",
    subtitle:
      "Find nearby hospitals, blood banks and verified organizations instantly.",
    iconName: "water",
    accentIcon: "heart",
    badgeLabel: "Donate & Save",
  },
  {
    id: 2,
    title: "Real-time Availability",
    subtitle:
      "See reported blood units, verification status and live distance estimates.",
    iconName: "location",
    accentIcon: "shield-checkmark",
    badgeLabel: "Live Inventory",
  },
  {
    id: 3,
    title: "Get Help Faster",
    subtitle:
      "Call, navigate or send a prioritized blood request during emergencies.",
    iconName: "flash",
    accentIcon: "call",
    badgeLabel: "Emergency Ready",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const currentSlide = SLIDES[currentStep];

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.stepCounter}>
          <Text style={styles.stepText}>
            Step {currentStep + 1} of {SLIDES.length}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Center Illustration Graphic */}
      <View style={styles.illustrationContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Ionicons
              name={currentSlide.iconName}
              size={84}
              color={Colors.primary.DEFAULT}
            />
          </View>
          <View style={styles.badgeCircle}>
            <Ionicons
              name={currentSlide.accentIcon}
              size={26}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.pillBadge}>
          <Text style={styles.pillBadgeText}>{currentSlide.badgeLabel}</Text>
        </View>
      </View>

      {/* Text Info */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

        {/* Step Indicator Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                currentStep === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <Button
          title={currentStep === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          size="lg"
          fullWidth
          icon={
            <Ionicons
              name={
                currentStep === SLIDES.length - 1
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={18}
              color="#FFFFFF"
            />
          }
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  stepCounter: {
    backgroundColor: Colors.surface.muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.muted,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  outerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.primary.lighter,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: Colors.primary.border,
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeCircle: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  pillBadge: {
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 18,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
    letterSpacing: 0.5,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.primary.DEFAULT,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.surface.border,
  },
  bottomContainer: {
    paddingBottom: 16,
    width: "100%",
  },
});
