import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import Logo from "@/components/ui/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    const trimmedId = email.trim();
    if (!trimmedId) {
      setErrorMessage("Please enter your email or phone number.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setSigningIn(true);
    try {
      console.log("[LOGIN] Attempting login with:", trimmedId);
      const { error } = await signIn(trimmedId, password);
      if (error) {
        console.warn("[LOGIN] Error received:", error);
        setErrorMessage(error);
        if (Platform.OS !== "web") {
          Alert.alert("Login Failed", error);
        }
      } else {
        router.replace("/(user)/home");
      }
    } catch (err: any) {
      console.error("[LOGIN] Exception:", err);
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setSigningIn(true);
    try {
      const { error } = await signIn("demo@bloodhelp.org", "Password@123");
      if (error) {
        setErrorMessage(error);
      } else {
        router.replace("/(user)/home");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Demo login failed");
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoSignup = () => {
    router.push("/(auth)/signup");
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="lg" />
          </View>

          {/* Heading */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Error Message Box */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle"
                size={22}
                color={Colors.status.rejected}
              />
              <View style={styles.errorTextCol}>
                <Text style={styles.errorTitle}>Unable to Sign In</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
                {errorMessage.includes("Sign Up") && (
                  <TouchableOpacity
                    onPress={handleGoSignup}
                    style={styles.errorActionBtn}
                  >
                    <Text style={styles.errorActionText}>
                      Create Account Now →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email or Phone Number"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. 9503838360 or rohit@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.text.muted}
                />
              }
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
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
              title={signingIn ? "Signing In..." : "Login"}
              onPress={handleLogin}
              loading={signingIn}
              size="lg"
              fullWidth
            />

            {/* 1-Click Quick Demo Login Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDemoLogin}
              style={styles.demoLoginBtn}
            >
              <Ionicons
                name="flash-outline"
                size={16}
                color={Colors.primary.DEFAULT}
              />
              <Text style={styles.demoLoginText}>
                Quick Demo Login (1-Click)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons (UI only) */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.socialButton}
              onPress={() =>
                Alert.alert("Coming Soon", "Google login coming soon.")
              }
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.socialButton}
              onPress={() =>
                Alert.alert("Coming Soon", "Apple login coming soon.")
              }
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  logoContainer: { marginTop: 12, marginBottom: 20 },
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
  subtitle: { fontSize: 15, color: Colors.text.secondary },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    marginBottom: 18,
    gap: 12,
    alignItems: "flex-start",
  },
  errorTextCol: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#B91C1C",
    marginBottom: 2,
  },
  errorText: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
  },
  errorActionBtn: {
    marginTop: 8,
    paddingVertical: 4,
  },
  errorActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
    textDecorationLine: "underline",
  },
  form: { width: "100%" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20 },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary.DEFAULT,
  },
  demoLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary.border,
    backgroundColor: Colors.primary.lighter,
    gap: 6,
  },
  demoLoginText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary.DEFAULT,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.surface.border },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.text.muted,
  },
  socialRow: { flexDirection: "row", width: "100%", gap: 12 },
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  footerText: { fontSize: 14, color: Colors.text.secondary },
  signupLink: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary.DEFAULT,
  },
});

