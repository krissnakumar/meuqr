import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { LogOut, User, Mail, Shield, Globe, Check } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingLang, setUpdatingLang] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageChange(newLang: string) {
    if (!profile) return;
    setUpdatingLang(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ language: newLang })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, language: newLang }));
      
      const messages: Record<string, string> = {
        "pt-BR": "Idioma atualizado para Português!",
        en: "Language updated to English!",
        es: "¡Idioma actualizado a Español!",
      };
      
      Alert.alert("Idioma / Language", messages[newLang]);
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível atualizar o idioma.");
    } finally {
      setUpdatingLang(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/auth");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  const currentLang = profile?.language || "pt-BR";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      {/* Profile Card */}
      {profile && (
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile.full_name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.full_name || "Usuário MeuQR"}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
        </View>
      )}

      {/* Language Selector Section */}
      <View style={styles.sectionHeader}>
        <Globe size={16} color="#4B5563" />
        <Text style={styles.sectionHeaderText}>Idioma / Language</Text>
      </View>
      <View style={styles.section}>
        {[
          { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
          { code: "en", label: "English (US)", flag: "🇺🇸" },
          { code: "es", label: "Español", flag: "🇪🇸" },
        ].map((lang) => {
          const isSelected = currentLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.menuItem, isSelected && styles.menuItemActive]}
              onPress={() => handleLanguageChange(lang.code)}
              disabled={updatingLang}
            >
              <View style={styles.langItemLeft}>
                <Text style={styles.flagText}>{lang.flag}</Text>
                <Text style={[styles.menuText, isSelected && styles.menuTextActive]}>
                  {lang.label}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Account Section */}
      <View style={styles.sectionHeader}>
        <User size={16} color="#4B5563" />
        <Text style={styles.sectionHeaderText}>Segurança</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Shield size={20} color="#111827" />
          <Text style={styles.menuText}>Privacidade & Termos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.version}>MeuQR v1.0.0</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemActive: {
    backgroundColor: "#F9FAFB",
  },
  langItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flagText: {
    fontSize: 20,
  },
  menuText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  menuTextActive: {
    color: "#00C853",
    fontWeight: "bold",
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00C853",
    justifyContent: "center",
    alignItems: "center",
  },
  versionContainer: {
    marginVertical: 12,
  },
  version: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 40,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#EF4444",
  },
});
