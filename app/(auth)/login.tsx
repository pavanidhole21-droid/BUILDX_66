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
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { Alert.alert("Error", "Please enter your email."); return; }
    if (!password) { Alert.alert("Error", "Please enter your password."); return; }

    setSigningIn(true);
    const { error } = await signIn(email.trim(), password);
    setSigningIn(false);

    if (error) {
      Alert.alert("Login Failed", error);
    }
    // On success, AuthGuard in _layout.tsx will redirect automatically
  };

  const handleGoSignup = () => { router.push("/(auth)/signup"); };

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

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={Colors.text.muted} />
              }
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.muted} />
              }
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
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
              loading={signingIn || loading}
              size="lg"
              fullWidth
            />
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
              onPress={() => Alert.alert("Coming Soon", "Google login coming soon.")}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.socialButton}
              onPress={() => Alert.alert("Coming Soon", "Apple login coming soon.")}
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
  scrollContent: { paddingHorizontal: 24, paddingVertical: 20, alignItems: "center" },
  logoContainer: { marginTop: 12, marginBottom: 20 },
  headerTextContainer: { width: "100%", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "900", color: Colors.text.primary, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.text.secondary },
  form: { width: "100%" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20 },
  forgotPasswordText: { fontSize: 13, fontWeight: "600", color: Colors.primary.DEFAULT },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.surface.border },
  dividerText: { paddingHorizontal: 12, fontSize: 13, color: Colors.text.muted },
  socialRow: { flexDirection: "row", width: "100%", gap: 12 },
  socialButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, borderRadius: 12, borderWidth: 1, borderColor: Colors.surface.border, backgroundColor: Colors.surface.white, gap: 8 },
  socialButtonText: { fontSize: 14, fontWeight: "700", color: Colors.text.primary },
  footer: { flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 12 },
  footerText: { fontSize: 14, color: Colors.text.secondary },
  signupLink: { fontSize: 14, fontWeight: "800", color: Colors.primary.DEFAULT },
});
