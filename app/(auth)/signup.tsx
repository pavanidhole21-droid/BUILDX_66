import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Logo from "@/components/ui/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Rohit Bramhe");
  const [email, setEmail] = useState("rohit@example.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [password, setPassword] = useState("••••••••");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/(user)/home");
    }, 600);
  };

  const handleGoLogin = () => {
    router.back();
  };

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
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.text.muted}
                />
              }
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rohit@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.text.muted}
                />
              }
            />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 9876543210"
              keyboardType="phone-pad"
              leftIcon={
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Colors.text.muted}
                />
              }
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              secureTextEntry
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.muted}
                />
              }
            />

            {/* Terms checkbox */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setAgreeTerms((prev) => !prev)}
              style={styles.termsRow}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxActive,
                ]}
              >
                {agreeTerms && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={loading}
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
