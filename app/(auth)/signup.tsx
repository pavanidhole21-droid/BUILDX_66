import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import Colors from "@/constants/colors";
import Logo from "@/components/ui/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { BloodGroup, ALL_BLOOD_GROUPS } from "@/types/blood";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Location Permission State
  const [locationGranted, setLocationGranted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationGranted(true);
        try {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          if (geo && (geo.city || geo.region)) {
            setLocationName(
              `${geo.city || geo.subregion || "Nagpur"}, ${geo.region || "Maharashtra"}`
            );
          } else {
            setLocationName("Nagpur, Maharashtra");
          }
        } catch {
          setLocationName("Nagpur, Maharashtra");
        }
      } else {
        setLocationGranted(false);
        Alert.alert(
          "Permission Denied",
          "Location access is optional but strongly recommended to find the nearest emergency blood supplies."
        );
      }
    } catch {
      // Fallback for environments without native GPS
      setLocationGranted(true);
      setLocationName("Nagpur, Maharashtra");
    } finally {
      setLocating(false);
    }
  };

  const submitRegistration = async () => {
    setSigningUp(true);
    const city = locationName?.split(",")[0]?.trim() || "Nagpur";
    const state = locationName?.split(",")[1]?.trim() || "Maharashtra";

    const { error } = await signUp(email.trim(), password, {
      name: fullName.trim(),
      phone: phone.trim(),
      bloodGroup: selectedBloodGroup || undefined,
      city,
      state,
      role: "recipient",
      language: "en",
    });
    setSigningUp(false);

    if (error) {
      Alert.alert("Sign Up Failed", error);
    }
    // On success, AuthGuard in _layout.tsx redirects to home automatically
  };

  const handleSignup = () => {
    if (!fullName.trim()) { Alert.alert("Error", "Please enter your full name."); return; }
    if (!email.trim()) { Alert.alert("Error", "Please enter your email."); return; }
    if (!phone.trim()) { Alert.alert("Error", "Please enter your phone number."); return; }
    if (password.length < 6) { Alert.alert("Error", "Password must be at least 6 characters."); return; }
    if (!agreeTerms) {
      Alert.alert("Terms Required", "Please agree to the Terms & Privacy Policy to continue.");
      return;
    }

    if (!locationGranted) {
      Alert.alert(
        "Enable Location?",
        "Location helps BloodHelp instantly connect you to the nearest verified blood banks and hospitals.",
        [
          {
            text: "Skip For Now",
            style: "cancel",
            onPress: () => submitRegistration(),
          },
          {
            text: "Enable Location",
            onPress: async () => {
              await requestLocationPermission();
              submitRegistration();
            },
          },
        ]
      );
    } else {
      submitRegistration();
    }
  };

  const handleGoLogin = () => { router.back(); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="lg" />
          </View>

          {/* Title */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to save lives</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Rohit Bramhe"
              leftIcon={<Ionicons name="person-outline" size={20} color={Colors.text.muted} />}
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rohit@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.text.muted} />}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 9876543210"
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={Colors.text.muted} />}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              secureTextEntry={!showPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.text.muted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.text.muted} />
                </TouchableOpacity>
              }
            />

            {/* Blood Group Picker */}
            <Text style={styles.fieldLabel}>Blood Group (optional)</Text>
            <View style={styles.bloodGroupGrid}>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  onPress={() => setSelectedBloodGroup(bg === selectedBloodGroup ? null : bg)}
                  style={[
                    styles.bloodGroupChip,
                    selectedBloodGroup === bg && styles.bloodGroupChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.bloodGroupChipText,
                      selectedBloodGroup === bg && styles.bloodGroupChipTextActive,
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location Permission Section */}
            <View
              style={[
                styles.locationCard,
                locationGranted && styles.locationCardActive,
              ]}
            >
              <View style={styles.locationCardTop}>
                <View
                  style={[
                    styles.locationIconBg,
                    locationGranted && styles.locationIconBgActive,
                  ]}
                >
                  <Ionicons
                    name={locationGranted ? "location" : "location-outline"}
                    size={22}
                    color={
                      locationGranted ? Colors.status.verified : Colors.primary.DEFAULT
                    }
                  />
                </View>
                <View style={styles.locationTextCol}>
                  <Text style={styles.locationTitle}>
                    {locationGranted
                      ? "Location Enabled"
                      : "Enable Location Access"}
                  </Text>
                  <Text style={styles.locationSub}>
                    {locationGranted
                      ? locationName || "Nagpur, Maharashtra"
                      : "Required to find nearby verified blood banks & emergency donors"}
                  </Text>
                </View>

                {locating ? (
                  <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
                ) : (
                  <Switch
                    value={locationGranted}
                    onValueChange={(val) => {
                      if (val) {
                        requestLocationPermission();
                      } else {
                        setLocationGranted(false);
                        setLocationName(null);
                      }
                    }}
                    trackColor={{
                      false: "#CBD5E1",
                      true: Colors.status.verified,
                    }}
                  />
                )}
              </View>

              {!locationGranted && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={requestLocationPermission}
                  style={styles.enableLocButton}
                >
                  <Ionicons name="navigate" size={14} color={Colors.primary.DEFAULT} />
                  <Text style={styles.enableLocButtonText}>
                    Grant Location Permission
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setAgreeTerms((prev) => !prev)}
              style={styles.termsRow}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={signingUp || loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleGoLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  logoContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  headerTextContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  form: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  bloodGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  bloodGroupChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.surface.border,
    backgroundColor: "#FFFFFF",
  },
  bloodGroupChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  bloodGroupChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  bloodGroupChipTextActive: {
    color: "#FFFFFF",
  },
  locationCard: {
    backgroundColor: Colors.surface.muted,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    marginBottom: 18,
  },
  locationCardActive: {
    backgroundColor: Colors.status.verifiedBg,
    borderColor: Colors.status.verifiedBorder,
  },
  locationCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconBgActive: {
    backgroundColor: "#FFFFFF",
  },
  locationTextCol: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  locationSub: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  enableLocButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.primary.border,
    gap: 6,
  },
  enableLocButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.surface.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  termsText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  termsLink: {
    color: Colors.primary.DEFAULT,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
  },
});
