import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { Eye, MousePointerClick, MessageCircle, TrendingUp } from "lucide-react-native";

export default function AnalyticsScreen() {
  const [stats, setStats] = useState({
    totalScans: 0,
    totalClicks: 0,
    whatsappClicks: 0,
    todayScans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

      if (!businesses?.length) {
        setLoading(false);
        return;
      }

      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .in(
          "business_id",
          businesses.map((b) => b.id)
        );

      const qrIds = qrCodes?.map((q) => q.id) || [];
      
      if (qrIds.length === 0) {
        setLoading(false);
        return;
      }

      const { count: scans } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds);

      const { count: clicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds);

      const { count: whatsapp } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .eq("click_type", "whatsapp");

      setStats({
        totalScans: scans || 0,
        totalClicks: clicks || 0,
        whatsappClicks: whatsapp || 0,
        todayScans: 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  const cards = [
    { icon: Eye, label: "Scans", value: stats.totalScans, color: "#3B82F6" },
    { icon: MousePointerClick, label: "Cliques", value: stats.totalClicks, color: "#8B5CF6" },
    { icon: MessageCircle, label: "WhatsApp", value: stats.whatsappClicks, color: "#00C853" },
    { icon: TrendingUp, label: "Total", value: stats.totalScans + stats.totalClicks, color: "#111827" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Desempenho dos seus QR codes</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <View key={index} style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: `${card.color}15` }]}>
                <Icon size={24} color={card.color} />
              </View>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          );
        })}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  card: {
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
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  cardLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
