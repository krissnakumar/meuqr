import { useState } from "react";
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
import { api } from "../../src/lib/api-client";
import { useRouter } from "expo-router";
import { ArrowLeft, Store, Check, ChevronRight } from "lucide-react-native";
import { useTranslation } from "../../src/lib/i18n-provider";

type Step = "category" | "info" | "confirm";

export default function NewBusinessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const CATEGORIES = [
    { value: "restaurant", label: t('categories.restaurant'), emoji: "🍽️" },
    { value: "construction_materials", label: t('categories.construction_materials'), emoji: "🔨" },
    { value: "salon", label: t('categories.salon'), emoji: "💇" },
    { value: "pet_shop", label: t('categories.pet_shop'), emoji: "🐾" },
    { value: "hotel", label: t('categories.hotel'), emoji: "🏨" },
    { value: "real_estate", label: t('categories.real_estate'), emoji: "🏠" },
    { value: "event", label: t('categories.event'), emoji: "🎉" },
    { value: "clinic", label: t('categories.clinic'), emoji: "🏥" },
    { value: "gym", label: t('categories.gym'), emoji: "💪" },
    { value: "auto_repair", label: t('categories.auto_repair'), emoji: "🔧" },
    { value: "freelancer", label: t('categories.freelancer'), emoji: "💼" },
    { value: "church", label: t('categories.church'), emoji: "⛪" },
    { value: "product_shelf", label: t('categories.product_shelf'), emoji: "📦" },
    { value: "other", label: t('categories.other'), emoji: "📋" },
  ];
  const [step, setStep] = useState<Step>("category");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50)
    );
  }

  function selectCategory(value: string) {
    setCategory(value);
    setStep("info");
  }

  async function handleCreate() {
    if (!name || !category) {
      Alert.alert(t("errors.generic"), t("validation.required"));
      return;
    }

    setLoading(true);
    try {
      const business = await api.post("/api/businesses", {
        name,
        category,
        description: description || undefined,
        whatsapp: whatsapp || undefined,
      });

      Alert.alert(t("success.created"), t("business.success_create"), [
        {
          text: t("business.details"),
          onPress: () => router.push(`/business/${(business as any).id}`),
        },
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(t("errors.generic"), error.message);
    } finally {
      setLoading(false);
    }
  }

  function renderStepIndicator() {
    const steps: { key: Step; label: string }[] = [
      { key: "category", label: t("common.category") },
      { key: "info", label: t("business.business_info") },
      { key: "confirm", label: t("common.confirm") },
    ];

    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, idx) => (
          <View key={s.key} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                idx <= currentIndex && styles.stepDotActive,
                idx < currentIndex && styles.stepDotCompleted,
              ]}
            >
              {idx < currentIndex ? (
                <Check size={14} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    idx <= currentIndex && styles.stepNumberActive,
                  ]}
                >
                  {idx + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                idx <= currentIndex && styles.stepLabelActive,
              ]}
            >
              {s.label}
            </Text>
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  idx < currentIndex && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
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
          onPress={() => {
            if (step === "info") setStep("category");
            else if (step === "confirm") setStep("info");
            else router.back();
          }}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("business.new_title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Category Selection */}
        {step === "category" && (
          <View>
            <Text style={styles.stepTitle}>{t("business.category_question")}</Text>
            <Text style={styles.stepSubtitle}>
              {t("business.category_question_desc")}
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryCard,
                    category === cat.value && styles.categoryCardActive,
                  ]}
                  onPress={() => selectCategory(cat.value)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.value && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Business Info */}
        {step === "info" && (
          <View>
            <Text style={styles.stepTitle}>{t("business.business_info")}</Text>
            <Text style={styles.stepSubtitle}>
              {t("business.business_info_desc")}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("business.name_label")} *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder={t("business.name_placeholder_new")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("business.custom_link")}</Text>
              <View style={styles.slugRow}>
                <Text style={styles.slugPrefix}>meuqr.com.br/</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={slug}
                  onChangeText={(t) =>
                    setSlug(
                      t.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 50)
                    )
                  }
                  placeholder={t("business.slug_placeholder")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("common.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={t("business.description_placeholder_new")}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("business.whatsapp_label")}</Text>
              <TextInput
                style={styles.input}
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder={t("business.whatsapp_placeholder")}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.nextButton, !name && { opacity: 0.5 }]}
              onPress={() => {
                if (!name) {
                  Alert.alert(t("errors.generic"), t("business.name_required"));
                  return;
                }
                setStep("confirm");
              }}
            >
              <Text style={styles.nextButtonText}>{t("common.next")}</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && (
          <View>
            <Text style={styles.stepTitle}>{t("common.confirm")}</Text>
            <Text style={styles.stepSubtitle}>
              {t("validation.required")}
            </Text>

            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>{t("common.name")}</Text>
                <Text style={styles.confirmValue}>{name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>{t("common.category")}</Text>
                <Text style={styles.confirmValue}>
                  {CATEGORIES.find((c) => c.value === category)?.label}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>{t("business.custom_link")}</Text>
                <Text style={[styles.confirmValue, { color: "#00C853" }]}>
                  /{slug}
                </Text>
              </View>
              {description ? (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>{t("common.description")}</Text>
                  <Text style={styles.confirmValue} numberOfLines={2}>
                    {description}
                  </Text>
                </View>
              ) : null}
              {whatsapp ? (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>{t("common.phone")}</Text>
                  <Text style={styles.confirmValue}>{whatsapp}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setStep("info")}
              >
                <Text style={styles.editButtonText}>{t("common.edit")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, loading && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>{t("business.create_business_btn")}</Text>
                )}
              </TouchableOpacity>
            </View>
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
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: "#111827",
  },
  stepDotCompleted: {
    backgroundColor: "#00C853",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 6,
    fontWeight: "500",
  },
  stepLabelActive: {
    color: "#111827",
    fontWeight: "600",
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#00C853",
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
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  categoryCardActive: {
    borderColor: "#00C853",
    backgroundColor: "#F0FDF4",
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
  },
  categoryLabelActive: {
    color: "#00C853",
    fontWeight: "600",
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  slugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  slugPrefix: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    backgroundColor: "#111827",
    borderRadius: 12,
    marginTop: 12,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmRow: {},
  confirmLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  createButton: {
    flex: 2,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#00C853",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
