import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../../src/lib/supabase";
import {
  ArrowLeft,
  Save,
  Globe,
  Code,
  Eye,
} from "lucide-react-native";
import * as Linking from "expo-linking";

export default function PageSettingsScreen() {
  const router = useRouter();
  const { id: businessId, pageId } = useLocalSearchParams();

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customJs, setCustomJs] = useState("");

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    try {
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single();

      if (data) {
        setPage(data);
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setMetaDescription(data.meta_description || "");
        setCustomCss(data.custom_css || "");
        setCustomJs(data.custom_js || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!title.trim()) {
      Alert.alert("Atenção", "O título é obrigatório");
      return;
    }
    setSaving(true);

    try {
      const { error } = await supabase
        .from("pages")
        .update({
          title: title.trim(),
          slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
          meta_description: metaDescription.trim() || null,
          custom_css: customCss.trim() || null,
          custom_js: customJs.trim() || null,
        })
        .eq("id", pageId);

      if (error) throw error;
      Alert.alert("Salvo!", "As configurações foram atualizadas.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Config. da Página</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* SEO Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color="#111827" />
            <Text style={styles.sectionTitle}>SEO</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nome da página"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Slug (URL)</Text>
            <View style={styles.slugRow}>
              <Text style={styles.slugPrefix}>/</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={slug}
                onChangeText={(t) =>
                  setSlug(t.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                placeholder="nome-da-pagina"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Meta Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={metaDescription}
              onChangeText={setMetaDescription}
              placeholder="Breve descrição para mecanismos de busca..."
              multiline
              numberOfLines={3}
            />
            <Text style={styles.hint}>
              {metaDescription.length}/160 caracteres
            </Text>
          </View>
        </View>

        {/* Custom Code Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Code size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Código Customizado</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CSS Customizado</Text>
            <TextInput
              style={[styles.input, styles.codeArea]}
              value={customCss}
              onChangeText={setCustomCss}
              placeholder="/* Adicione CSS personalizado */"
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>JavaScript Customizado</Text>
            <TextInput
              style={[styles.input, styles.codeArea]}
              value={customJs}
              onChangeText={setCustomJs}
              placeholder="// Adicione JavaScript personalizado"
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Preview Link */}
        {page && (
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() =>
              Linking.openURL(`https://meuqr.com.br/${slug}`)
            }
          >
            <Eye size={20} color="#00C853" />
            <Text style={styles.previewText}>Visualizar Página</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00C853",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  formGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  codeArea: {
    height: 100,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  slugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  slugPrefix: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  hint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "right",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00C853",
  },
  previewText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#00C853",
  },
});
