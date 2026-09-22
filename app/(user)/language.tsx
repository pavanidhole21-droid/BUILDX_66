import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { SupportedLanguage } from "@/types/user";
import Header from "@/components/common/Header";
import Button from "@/components/ui/Button";

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English (Default)" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("en");

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header title="Select Language" showBack={true} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose your preferred language for the BloodHelp app.
        </Text>

        <View style={styles.listContainer}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                activeOpacity={0.7}
                onPress={() => setSelectedLang(lang.code)}
                style={[
                  styles.langOption,
                  isSelected && styles.langOptionSelected,
                ]}
              >
                <View>
                  <Text style={styles.langName}>{lang.label}</Text>
                  <Text style={styles.langNative}>{lang.nativeLabel}</Text>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          title="Continue"
          onPress={handleSave}
          size="lg"
          fullWidth
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
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  listContainer: {
    gap: 12,
  },
  langOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.surface.border,
    backgroundColor: Colors.surface.muted,
  },
  langOptionSelected: {
    borderColor: Colors.primary.DEFAULT,
    backgroundColor: Colors.primary.lighter,
  },
  langName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  langNative: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.surface.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioCircleSelected: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surface.border,
  },
});
