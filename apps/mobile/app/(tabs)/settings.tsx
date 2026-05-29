import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { LogOut, User, Mail, Shield } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <User size={20} color="#111827" />
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Shield size={20} color="#111827" />
          <Text style={styles.menuText}>Privacidade</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
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
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
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
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuText: {
    fontSize: 16,
    color: "#111827",
  },
  version: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    padding: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
  },
});
