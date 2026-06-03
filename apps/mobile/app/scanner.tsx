import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { api } from "../src/lib/api-client";
import { Scan, QrCode, ArrowLeft } from "lucide-react-native";
import { useTranslation } from "../src/lib/i18n-provider";

export default function ScannerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (!scanning || scannedCode) return;
    setScanning(false);
    setScannedCode(data);

    setLoading(true);
    try {
      // Try to extract short code from URL
      let shortCode = data;
      if (data.includes("/q/")) {
        shortCode = data.split("/q/").pop()?.split("?")[0] || data;
      } else if (data.includes("meuqr.com.br/")) {
        const parts = data.split("meuqr.com.br/");
        if (parts.length > 1) {
          const afterDomain = parts[1].split("?")[0];
          if (!afterDomain.includes("/")) {
            // It's a business slug - open in browser
            Linking.openURL(`https://meuqr.com.br/${afterDomain}`);
            resetScanner();
            return;
          }
          shortCode = afterDomain;
        }
      }

      // Look up the QR code by short code via public API
      try {
        const qrData = await api.get<{
          businessSlug: string;
          destinationUrl: string;
        }>(`/api/public/qr/${shortCode}`);

        if (qrData?.destinationUrl) {
          Linking.openURL(qrData.destinationUrl);
        } else if (qrData?.businessSlug) {
          Linking.openURL(`https://meuqr.com.br/${qrData.businessSlug}`);
        } else {
          Alert.alert(t("errors.not_found"), t("public.qr_scanner_prompt"), [
            { text: "OK", onPress: () => resetScanner() },
          ]);
        }
      } catch {
        // Try to open as a business slug directly
        Linking.openURL(`https://meuqr.com.br/${shortCode}`);
        resetScanner();
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t("errors.generic"), t("errors.generic"));
      resetScanner();
    } finally {
      setLoading(false);
    }
  }

  function resetScanner() {
    setScannedCode(null);
    setScanning(true);
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <QrCode size={64} color="#D1D5DB" />
          <Text style={styles.permissionTitle}>{t("errors.unauthorized")}</Text>
          <Text style={styles.permissionText}>
            {t("public.qr_scanner_prompt")}
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>{t("common.yes_continue")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>{t("public.qr_scanner_prompt")}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Scan area */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {loading && (
                <ActivityIndicator size="large" color="#00C853" />
              )}
              {!loading && scanning && (
                <Scan size={48} color="#00C853" />
              )}
            </View>
          </View>

          {/* Bottom */}
          <View style={styles.bottomArea}>
            <Text style={styles.bottomText}>
              {t("public.qr_scanner_prompt")}
            </Text>
            {!scanning && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={resetScanner}
              >
                <Text style={styles.rescanButtonText}>{t("public.scanned_success")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00C853",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  bottomArea: {
    padding: 40,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
  },
  rescanButton: {
    marginTop: 20,
    backgroundColor: "#00C853",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rescanButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 20,
  },
  permissionText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: "#00C853",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  backButton: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 15,
  },
});
