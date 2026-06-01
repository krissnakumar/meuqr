import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { api } from "../../../../src/lib/api-client";
import { businessApi, pageApi, qrApi } from "../../../../src/lib/api-business";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, ChevronRight, FileText } from "lucide-react-native";
import { getAllBusinessTemplates } from "@meuqr/shared";
import { useTranslation } from "../../../../src/lib/i18n-provider";

function getLocalString(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val["pt-BR"] || "";
}

export default function NewPageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const businessId = id as string;
  const { t } = useTranslation();

  const [step, setStep] = useState<"template" | "details">("template");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [business, setBusiness] = useState<any>(null);

  // Fetch business to get category
  React.useEffect(() => {
    async function loadBusiness() {
      if (!businessId) return;
      try {
        const data = await businessApi.getById(businessId);
        if (data) setBusiness(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadBusiness();
  }, [businessId]);

  const templates = getAllBusinessTemplates();

  // Filter templates by business category
  const popularTemplates = templates.filter((t) => 
    business?.category ? t.businessType === business.category : true
  );

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50)
    );
  }

  function handleSelectTemplate(tmpl: any) {
    setSelectedTemplate(tmpl);
    setTitle(getLocalString(tmpl.name));
    setSlug(tmpl.id.replace("tmpl-", ""));
    setStep("details");
  }

  async function handleCreate() {
    if (!title || !slug) {
      Alert.alert(t("errors.generic"), t("business.fill_title_and_slug"));
      return;
    }

    setLoading(true);
    try {
      // 1. Create the page
      const page = await pageApi.create({
        business_id: businessId,
        template_id: selectedTemplate?.id || null,
        title: title,
        slug: slug,
        is_published: true,
      });

      // 2. Clone template sections
      if (selectedTemplate) {
        for (let i = 0; i < selectedTemplate.sections.length; i++) {
          const section = selectedTemplate.sections[i];

          await pageApi.addSection({
            page_id: page.id,
            name: getLocalString(section.title),
            slug: section.slug,
            section_type: section.sectionType || null,
            sort_order: i,
          });
        }
      }

      // 3. Create active QR code for this page
      const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await qrApi.create({
        business_id: businessId,
        page_id: page.id,
        short_code: shortCode,
        title: `QR Code - ${title}`,
        destination_url: `https://meuqr.com.br/${businessId}/${slug}`,
      });

      Alert.alert(t("success.created"), t("business.page_created"), [
        { text: "OK", onPress: () => router.push(`/business/${businessId}`) },
      ]);
    } catch (err: any) {
      Alert.alert(t("business.page_create_error"), err.message || t("errors.generic"));
    } finally {
      setLoading(false);
    }
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
          onPress={() => {
            if (step === "details") setStep("template");
            else router.back();
          }}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("business.new_page")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === "template" ? (
          <View>
            <Text style={styles.stepTitle}>{t("business.select_template_title")}</Text>
            <Text style={styles.stepSubtitle}>
              {t("business.select_template_desc")}
            </Text>

            <View style={styles.templateList}>
              {popularTemplates.map((tmpl) => (
                <TouchableOpacity
                  key={tmpl.id}
                  style={styles.templateCard}
                  onPress={() => handleSelectTemplate(tmpl)}
                >
                  <View style={styles.templateIcon}>
                    <FileText size={24} color="#00C853" />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{getLocalString(tmpl.name)}</Text>
                    <Text style={styles.templateDesc} numberOfLines={2}>
                      {getLocalString(tmpl.description)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}

              {/* Blank option */}
              <TouchableOpacity
                style={styles.templateCard}
                onPress={() => {
                  setSelectedTemplate(null);
                  setTitle("");
                  setSlug("");
                  setStep("details");
                }}
              >
                <View style={[styles.templateIcon, { backgroundColor: "#F3F4F6" }]}>
                  <FileText size={24} color="#4B5563" />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{t("business.blank_template")}</Text>
                  <Text style={styles.templateDesc}>
                    {t("business.blank_template_desc")}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.stepTitle}>{t("business.page_details")}</Text>
            <Text style={styles.stepSubtitle}>
              {t("business.page_details_desc")}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("business.page_title_label")}</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={handleTitleChange}
                placeholder={t("business.page_title_placeholder")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("business.custom_address_label")}</Text>
              <View style={styles.slugRow}>
                <Text style={styles.slugPrefix}>meuqr.com.br/...</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={slug}
                  onChangeText={(t) =>
                    setSlug(t.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 50))
                  }
                  placeholder="cardapio"
                />
              </View>
            </View>

            {selectedTemplate && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t("business.selected_template")}</Text>
                <Text style={styles.infoValue}>
                  {getLocalString(selectedTemplate.name)}
                </Text>
                <Text style={styles.infoText}>
                  {t("business.template_sections_info", { count: selectedTemplate.sections.length })}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.createButton, loading && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>{t("business.create_page_qr")}</Text>
              )}
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  templateList: {
    gap: 12,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
  },
  slugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slugPrefix: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#15803D",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#14532D",
    lineHeight: 18,
  },
  createButton: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#00C853",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
