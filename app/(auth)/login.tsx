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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("rohit@example.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/(user)/home");
    }, 600);
  };

  const handleGoSignup = () => {
    router.push("/(auth)/signup");
  };

  const handleProviderLogin = () => {
    router.push("/(provider)/dashboard");
  };

  const handleAdminLogin = () => {
    router.push("/(admin)/dashboard");
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
          {/* Top Brand Logo */}
          <View style={styles.logoContainer}>
            <Logo size="lg" />
          </View>

          {/* Heading */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Input Form */}
          <View style={styles.form}>
            <Input
              label="Email or Phone"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email or phone"
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
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.muted}
                />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.text.muted}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogin}
              style={styles.socialButton}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogin}
              style={styles.socialButton}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Alternate Portals for Provider & Admin testing */}
          <View style={styles.portalBox}>
            <Text style={styles.portalBoxTitle}>Switch Portal</Text>
            <View style={styles.portalRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleProviderLogin}
                style={styles.portalPill}
              >
                <Ionicons name="medkit" size={14} color={Colors.primary.DEFAULT} />
                <Text style={styles.portalPillText}>Provider Portal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAdminLogin}
                style={styles.portalPill}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={Colors.status.info}
                />
                <Text style={styles.portalPillText}>Admin Web App</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Signup Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleGoSignup}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    marginTop: 12,
    marginBottom: 20,
  },
  headerTextContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 24,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary.DEFAULT,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surface.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.text.muted,
  },
  socialRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    backgroundColor: Colors.surface.white,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  portalBox: {
    width: "100%",
    backgroundColor: Colors.surface.muted,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    alignItems: "center",
  },
  portalBoxTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  portalRow: {
    flexDirection: "row",
    gap: 8,
  },
  portalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    gap: 6,
  },
  portalPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
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
  signupLink: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
  },
});
