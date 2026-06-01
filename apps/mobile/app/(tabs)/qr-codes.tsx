import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { qrApi } from "../../src/lib/api-business";
import { QrCode, Share2 } from "lucide-react-native";
import { useTranslation } from "../../src/lib/i18n-provider";

interface QRCode {
  id: string;
  short_code: string;
  title?: string;
  scan_count: number;
  created_at: string;
}

export default function QRCodesScreen() {
  const { t } = useTranslation();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRCodes();
  }, []);

  async function loadQRCodes() {
    try {
      const data = await qrApi.listAll();

      setQrCodes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare(shortCode: string) {
    try {
      await Share.share({
        message: `Confira meu QR code MeuQR: https://meuqr.com.br/q/${shortCode}`,
      });
    } catch {}
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("sidebar.qrcodes")}</Text>
        <Text style={styles.subtitle}>{qrCodes.length} {t("business.qrcodes")}</Text>
      </View>

      {qrCodes.length === 0 ? (
        <View style={styles.empty}>
          <QrCode size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{t("common.no_results")}</Text>
          <Text style={styles.emptyText}>{t("dashboard.no_businesses_desc")}</Text>
        </View>
      ) : (
        qrCodes.map((qr) => (
          <View key={qr.id} style={styles.qrCard}>
            <View style={styles.qrIcon}>
              <QrCode size={24} color="#111827" />
            </View>
            <View style={styles.qrInfo}>
              <Text style={styles.qrTitle}>{qr.title || qr.short_code}</Text>
              <Text style={styles.qrMeta}>
                {qr.scan_count} scans
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleShare(qr.short_code)}>
              <Share2 size={20} color="#00C853" />
            </TouchableOpacity>
          </View>
        ))
      )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  empty: {
    alignItems: "center",
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  qrCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  qrIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  qrMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
