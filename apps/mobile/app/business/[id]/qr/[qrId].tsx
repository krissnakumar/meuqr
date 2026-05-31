import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../../../../src/lib/supabase";
import {
  ArrowLeft,
  QrCode,
  Share2,
  Trash2,
  ExternalLink,
  Copy,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { useTranslation } from "../../../../src/lib/i18n-provider";

export default function QRCodeDetailScreen() {
  const router = useRouter();
  const { id: businessId, qrId } = useLocalSearchParams();
  const { t } = useTranslation();

  const [qrCode, setQrCode] = useState<any>(null);
  const [qrStyle, setQrStyle] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const qrUrl = qrCode
    ? `https://meuqr.com.br/q/${qrCode.short_code}`
    : "";

  useEffect(() => {
    loadQRData();
  }, [qrId]);

  async function loadQRData() {
    try {
      const { data: qr } = await supabase
        .from("qr_codes")
        .select("*, businesses!inner(name, slug)")
        .eq("id", qrId)
        .single();

      const { data: style } = await supabase
        .from("qr_styles")
        .select("*")
        .eq("qr_code_id", qrId)
        .single();

      const { data: scans } = await supabase
        .from("scans")
        .select("*")
        .eq("qr_code_id", qrId)
        .order("created_at", { ascending: false })
        .limit(10);

      setQrCode(qr);
      setQrStyle(style);
      setRecentScans(scans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `Confira no MeuQR: ${qrUrl}`,
        url: qrUrl,
      });
    } catch {}
  }

  async function copyToClipboard() {
    try {
      await Clipboard.setStringAsync(qrUrl);
      Alert.alert(t("common.copied"), t("common.qr_copied_desc"));
    } catch {}
  }

  async function saveTitle() {
    if (!newTitle.trim()) return;
    await supabase
      .from("qr_codes")
      .update({ title: newTitle })
      .eq("id", qrId);
    setQrCode({ ...qrCode, title: newTitle });
    setEditTitle(false);
  }

  async function deleteQR() {
    Alert.alert(t("common.qr_delete_title"), t("common.confirm_delete"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await supabase.from("qr_codes").delete().eq("id", qrId);
          router.back();
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

  if (!qrCode) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>{t("errors.not_found")}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>{t("common.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("common.qr_detail_title")}</Text>
        <TouchableOpacity onPress={deleteQR}>
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* QR Code Display */}
      <View style={styles.qrDisplay}>
        <View style={styles.qrBox}>
          <QRCode
            value={qrUrl}
            size={200}
            backgroundColor={qrStyle?.background_color || "#FFFFFF"}
            color={qrStyle?.foreground_color || "#111827"}
          />
        </View>
        <Text style={styles.qrUrlText}>/q/{qrCode.short_code}</Text>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        {editTitle ? (
          <View style={styles.editTitleRow}>
            <TextInput
              style={styles.titleInput}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              placeholder={t("common.qr_no_title")}
            />
            <TouchableOpacity style={styles.saveTitleBtn} onPress={saveTitle}>
              <Text style={styles.saveTitleText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.titleRow}
            onPress={() => {
              setNewTitle(qrCode.title || "");
              setEditTitle(true);
            }}
          >
            <Text style={styles.qrTitle}>
              {qrCode.title || t("common.qr_no_title")}
            </Text>
            <Text style={styles.editHint}>{t("common.edit")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>{t("common.share")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionSecondary]}
          onPress={copyToClipboard}
        >
          <Copy size={20} color="#111827" />            <Text style={[styles.actionText, { color: "#111827" }]}>
              {t("common.qr_copy_link")}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={18} color="#111827" />
          <Text style={styles.sectionTitle}>{t("common.qr_statistics")}</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{qrCode.scan_count}</Text>
            <Text style={styles.statLabel}>{t("common.qr_total_scans")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recentScans.length}</Text>
            <Text style={styles.statLabel}>{t("common.qr_recent_scans")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {recentScans.filter((s) => s.device_type === "mobile").length}
            </Text>
            <Text style={styles.statLabel}>{t("common.qr_mobile")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {recentScans.filter((s) => s.device_type === "desktop").length}
            </Text>
            <Text style={styles.statLabel}>{t("common.qr_desktop")}</Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={18} color="#111827" />
          <Text style={styles.sectionTitle}>{t("common.qr_info")}</Text>
        </View>
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("business.title")}</Text>
            <Text style={styles.infoValue}>{qrCode.businesses?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("dashboard.created_at")}</Text>
            <Text style={styles.infoValue}>
              {new Date(qrCode.created_at).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("common.status")}</Text>
            <Text
              style={[
                styles.infoValue,
                qrCode.is_active ? { color: "#00C853" } : { color: "#EF4444" },
              ]}
            >
              {qrCode.is_active ? t("common.active") : t("common.inactive")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("common.qr_short_link")}</Text>
            <View style={styles.linkRow}>
              <Text style={[styles.infoValue, { color: "#00C853" }]}>
                /q/{qrCode.short_code}
              </Text>
              <ExternalLink size={14} color="#00C853" />
            </View>
          </View>
        </View>
      </View>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={18} color="#111827" />
            <Text style={styles.sectionTitle}>{t("common.qr_recent_scans")}</Text>
          </View>
          {recentScans.map((scan) => (
            <View key={scan.id} style={styles.scanRow}>
              <View style={styles.scanIcon}>
                {scan.device_type === "mobile" ? (
                  <Smartphone size={14} color="#6B7280" />
                ) : (
                  <Monitor size={14} color="#6B7280" />
                )}
              </View>
              <View style={styles.scanInfo}>
                <Text style={styles.scanDevice}>
                  {scan.device_type || t("common.qr_unknown_device")}
                  {scan.browser ? ` · ${scan.browser}` : ""}
                </Text>
                <Text style={styles.scanTime}>
                  {new Date(scan.created_at).toLocaleString("pt-BR")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
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
  notFoundText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  backLink: {
    color: "#00C853",
    fontSize: 15,
    fontWeight: "500",
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
  qrDisplay: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
  },
  qrBox: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrUrlText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#00C853",
  },
  titleSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  editHint: {
    fontSize: 13,
    color: "#00C853",
    fontWeight: "500",
  },
  editTitleRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  titleInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
  },
  saveTitleBtn: {
    backgroundColor: "#00C853",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveTitleText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00C853",
    padding: 14,
    borderRadius: 12,
  },
  actionSecondary: {
    backgroundColor: "#F3F4F6",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  infoList: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  scanIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  scanInfo: {
    flex: 1,
  },
  scanDevice: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
  },
  scanTime: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
