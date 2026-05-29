import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../src/lib/supabase";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Smartphone,
  Monitor,
  Users,
  ShoppingCart,
  FileText,
} from "lucide-react-native";

export default function BusinessAnalyticsScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();

  const [stats, setStats] = useState({
    scans: 0,
    clicks: 0,
    leads: 0,
    orders: 0,
    mobileScans: 0,
    desktopScans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [businessId]);

  async function loadAnalytics() {
    try {
      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("business_id", businessId);

      const qrIds = qrCodes?.map((q) => q.id) || [];

      let scanCount = 0;
      let clickCount = 0;
      let mobileCount = 0;
      let desktopCount = 0;

      if (qrIds.length > 0) {
        const { count: scans } = await supabase
          .from("scans")
          .select("*", { count: "exact", head: true })
          .in("qr_code_id", qrIds);
        scanCount = scans || 0;

        const { count: clicks } = await supabase
          .from("clicks")
          .select("*", { count: "exact", head: true })
          .in("qr_code_id", qrIds);
        clickCount = clicks || 0;

        const { data: recentScans } = await supabase
          .from("scans")
          .select("device_type")
          .in("qr_code_id", qrIds)
          .limit(100);

        if (recentScans) {
          mobileCount = recentScans.filter((s) => s.device_type === "mobile").length;
          desktopCount = recentScans.filter((s) => s.device_type === "desktop").length;
        }
      }

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      setStats({
        scans: scanCount,
        clicks: clickCount,
        leads: leadsCount || 0,
        orders: ordersCount || 0,
        mobileScans: mobileCount,
        desktopScans: desktopCount,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  const statCards = [
    { icon: Eye, label: "Scans", value: stats.scans, color: "#3B82F6", bg: "#EFF6FF" },
    { icon: MousePointerClick, label: "Cliques", value: stats.clicks, color: "#8B5CF6", bg: "#F5F3FF" },
    { icon: Users, label: "Leads", value: stats.leads, color: "#00C853", bg: "#F0FDF4" },
    { icon: ShoppingCart, label: "Pedidos", value: stats.orders, color: "#F59E0B", bg: "#FFFBEB" },
  ];

  const deviceCards = [
    { icon: Smartphone, label: "Mobile", value: stats.mobileScans, color: "#3B82F6" },
    { icon: Monitor, label: "Desktop", value: stats.desktopScans, color: "#6B7280" },
  ];

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
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadAnalytics();
            }}
          />
        }
      >
        {/* Main Stats */}
        <View style={styles.statsGrid}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
                  <Icon size={22} color={card.color} />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Device Distribution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Dispositivos</Text>
          </View>
          <View style={styles.deviceRow}>
            {deviceCards.map((card, index) => {
              const Icon = card.icon;
              const total = stats.mobileScans + stats.desktopScans;
              const pct = total > 0 ? Math.round((card.value / total) * 100) : 0;
              return (
                <View key={index} style={styles.deviceCard}>
                  <View style={styles.deviceIcon}>
                    <Icon size={24} color={card.color} />
                  </View>
                  <Text style={styles.deviceValue}>{card.value}</Text>
                  <Text style={styles.deviceLabel}>{card.label}</Text>
                  <Text style={styles.devicePct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Relatórios</Text>
          </View>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push(`/business/${businessId}/orders`)}
          >
            <ShoppingCart size={18} color="#F59E0B" />
            <Text style={styles.linkText}>Ver Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push(`/business/${businessId}/leads`)}
          >
            <Users size={18} color="#00C853" />
            <Text style={styles.linkText}>Ver Leads</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scroll: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
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
  deviceRow: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  deviceCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  deviceValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  deviceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  devicePct: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00C853",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  linkText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
});
