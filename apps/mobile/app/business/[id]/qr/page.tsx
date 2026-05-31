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
  RefreshControl,
  Share,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../src/lib/supabase";
import {
  ArrowLeft,
  QrCode,
  Plus,
  Share2,
  ChevronRight,
} from "lucide-react-native";
import { useTranslation } from "../../../../src/lib/i18n-provider";

interface QRCodeData {
  id: string;
  short_code: string;
  title: string | null;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  pages: { title: string } | null;
}

export default function BusinessQRCodesScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();
  const { t } = useTranslation();

  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewQrModal, setShowNewQrModal] = useState(false);
  const [newQrTitle, setNewQrTitle] = useState("");
  const [creatingQr, setCreatingQr] = useState(false);

  useEffect(() => {
    loadQRCodes();
  }, [businessId]);

  async function loadQRCodes() {
    try {
      const { data } = await supabase
        .from("qr_codes")
        .select("*, pages(title)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setQrCodes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleShare(shortCode: string) {
    try {
      await Share.share({
        message: `Confira no MeuQR: https://meuqr.com.br/q/${shortCode}`,
      });
    } catch {}
  }

  async function toggleQRStatus(qrId: string, currentActive: boolean) {
    await supabase
      .from("qr_codes")
      .update({ is_active: !currentActive })
      .eq("id", qrId);

    setQrCodes(
      qrCodes.map((q) =>
        q.id === qrId ? { ...q, is_active: !currentActive } : q
      )
    );
  }

  async function deleteQR(qrId: string) {
    Alert.alert(t("business.qr_delete_title"), t("business.qr_delete_confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await supabase.from("qr_codes").delete().eq("id", qrId);
          setQrCodes(qrCodes.filter((q) => q.id !== qrId));
        },
      },
    ]);
  }

  async function generateNewQR() {
    if (!newQrTitle.trim()) return;
    setCreatingQr(true);

    try {
      const shortCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          business_id: businessId,
          short_code: shortCode,
          title: newQrTitle.trim() || null,
        })
        .select()
        .single();

      if (!error && data) {
        setQrCodes([data, ...qrCodes]);
        setShowNewQrModal(false);
        setNewQrTitle("");
        Alert.alert(t("success.created"), t("business.qr_created_success", { code: shortCode }));
      } else if (error) {
        Alert.alert(t("errors.generic"), error.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t("errors.generic"), t("business.qr_create_error"));
    } finally {
      setCreatingQr(false);
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("business.qrcodes")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewQrModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadQRCodes();
            }}
          />
        }
      >
        {qrCodes.length === 0 ? (
          <View style={styles.emptyState}>
            <QrCode size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t("business.no_qrcodes")}</Text>
            <Text style={styles.emptyText}>
              {t("business.no_qrcodes_desc")}
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => setShowNewQrModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>{t("business.generate_qr")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {qrCodes.map((qr) => (
              <View key={qr.id} style={styles.qrCard}>
                <TouchableOpacity
                  style={styles.qrMain}
                  onPress={() =>
                    router.push(`/business/${businessId}/qr/${qr.id}`)
                  }
                >
                  <View style={styles.qrIcon}>
                    <QrCode size={28} color="#111827" />
                  </View>
                  <View style={styles.qrInfo}>
                    <Text style={styles.qrTitle}>
                      {qr.title || `QR #${qr.short_code}`}
                    </Text>
                    <Text style={styles.qrCode}>/q/{qr.short_code}</Text>
                    <Text style={styles.qrMeta}>
                      {qr.scan_count} scans
                      {qr.pages?.title ? ` · ${qr.pages.title}` : ""}
                    </Text>
                  </View>
                  <View style={styles.qrActions}>
                    <TouchableOpacity
                      style={styles.qrActionBtn}
                      onPress={() => handleShare(qr.short_code)}
                    >
                      <Share2 size={18} color="#00C853" />
                    </TouchableOpacity>
                    <ChevronRight size={18} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
                <View style={styles.qrCardFooter}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggle,
                      qr.is_active && styles.statusActive,
                    ]}
                    onPress={() => toggleQRStatus(qr.id, qr.is_active)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        qr.is_active && styles.statusDotActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        qr.is_active && styles.statusTextActive,
                      ]}
                    >
                      {qr.is_active ? t("common.active") : t("common.inactive")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteQR(qr.id)}
                    style={styles.deleteQrBtn}
                  >
                    <Text style={styles.deleteQrText}>{t("common.delete")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New QR Code Modal */}
      <Modal visible={showNewQrModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("business.new_qr_title")}</Text>
            <Text style={styles.modalSubtitle}>
              {t("business.new_qr_desc")}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={newQrTitle}
              onChangeText={setNewQrTitle}
              placeholder={t("business.page_title_placeholder")}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowNewQrModal(false);
                  setNewQrTitle("");
                }}
              >
                <Text style={styles.modalCancelText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  (!newQrTitle.trim() || creatingQr) && { opacity: 0.5 },
                ]}
                onPress={generateNewQR}
                disabled={!newQrTitle.trim() || creatingQr}
              >
                {creatingQr ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>{t("common.create")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  addButton: {
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
  emptyState: {
    padding: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#00C853",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  list: {
    gap: 12,
  },
  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  qrMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  qrIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  qrCode: {
    fontSize: 13,
    color: "#00C853",
    fontWeight: "500",
    marginTop: 2,
  },
  qrMeta: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  qrActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qrActionBtn: {
    padding: 8,
  },
  qrCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  statusActive: {
    backgroundColor: "#F0FDF4",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  statusDotActive: {
    backgroundColor: "#00C853",
  },
  statusText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusTextActive: {
    color: "#00C853",
    fontWeight: "500",
  },
  deleteQrBtn: {
    padding: 6,
  },
  deleteQrText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalConfirm: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#00C853",
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
