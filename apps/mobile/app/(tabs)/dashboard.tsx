import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { QrCode, Store, Eye, MousePointerClick, ChevronRight, Plus, Sparkles, TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../../src/lib/i18n-provider";

interface Business {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  created_at: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState({
    businesses: 0,
    qrCodes: 0,
    scans: 0,
    clicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.email?.split("@")[0] || t("common.app_name"));
      }

      // Fetch user's businesses
      const { data: bizList } = await supabase
        .from("businesses")
        .select("id, name, category, logo_url, created_at")
        .eq("owner_id", user?.id || "")
        .order("created_at", { ascending: false });

      const businessItems = bizList || [];
      setBusinesses(businessItems);

      const bizIds = businessItems.map((b) => b.id);

      let qrCount = 0;
      let scanCount = 0;
      let clickCount = 0;

      if (bizIds.length > 0) {
        const { data: qrCodes } = await supabase
          .from("qr_codes")
          .select("id")
          .in("business_id", bizIds);

        const qrIds = qrCodes?.map((q: any) => q.id) || [];
        qrCount = qrIds.length;

        if (qrIds.length > 0) {
          const { count: sCount } = await supabase
            .from("scans")
            .select("*", { count: "exact", head: true })
            .in("qr_code_id", qrIds);
          scanCount = sCount || 0;

          const { count: cCount } = await supabase
            .from("clicks")
            .select("*", { count: "exact", head: true })
            .in("qr_code_id", qrIds);
          clickCount = cCount || 0;
        }
      }

      setStats({
        businesses: businessItems.length,
        qrCodes: qrCount,
        scans: scanCount,
        clicks: clickCount,
      });
    } catch (err) {
      console.error("Error loading mobile dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877F2" />
        <Text style={styles.loadingText}>{t("dashboard.loading_info")}</Text>
      </View>
    );
  }

  const statsCards = [
    { icon: Store, label: t("dashboard.businesses"), value: stats.businesses, color: "#1877F2" },
    { icon: QrCode, label: t("dashboard.qrcodes"), value: stats.qrCodes, color: "#31A24C" },
    { icon: Eye, label: t("dashboard.scans"), value: stats.scans, color: "#1877F2" },
    { icon: MousePointerClick, label: t("dashboard.whatsapp_clicks"), value: stats.clicks, color: "#31A24C" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* ===== Greeting Header Card ===== */}
      <View style={styles.headerCard}>
        <View style={styles.headerTag}>
          <Sparkles size={12} color="#FFFFFF" />
          <Text style={styles.headerTagText}>{t("dashboard.title")}</Text>
        </View>
        <Text style={styles.greeting}>{t("common.welcome")}, <Text style={styles.usernameText}>{username}</Text>! 👋</Text>
        <Text style={styles.subtitle}>{t("dashboard.subtitle")}</Text>
      </View>

      {/* ===== Stats Section Title ===== */}
      <View style={styles.sectionHeader}>
        <TrendingUp size={18} color="#1877F2" />
        <Text style={styles.sectionTitle}>{t("common.total")}</Text>
      </View>

      {/* ===== Stats Grid ===== */}
      <View style={styles.statsGrid}>
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${card.color}12` }]}>
                <Icon size={18} color={card.color} />
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          );
        })}
      </View>

      {/* ===== Business List Title ===== */}
      <View style={styles.sectionHeader}>
        <Store size={18} color="#1877F2" />
        <Text style={styles.sectionTitle}>{t("dashboard.businesses")}</Text>
      </View>

      {/* ===== Business List ===== */}
      {businesses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Store size={36} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{t("dashboard.no_businesses")}</Text>
          <Text style={styles.emptyText}>{t("dashboard.no_businesses_desc")}</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/business/new")}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>{t("common.start_free")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.businessList}>
          {businesses.map((biz) => (
            <TouchableOpacity
              key={biz.id}
              style={styles.businessCard}
              onPress={() => router.push(`/business/${biz.id}`)}
            >
              <View style={styles.businessDetails}>
                <View style={styles.businessIconContainer}>
                  {biz.logo_url ? (
                    <Image source={{ uri: biz.logo_url }} style={styles.businessLogo} />
                  ) : (
                    <Store size={20} color="#1877F2" />
                  )}
                </View>
                <View style={styles.businessTextGroup}>
                  <Text style={styles.businessName} numberOfLines={1}>
                    {biz.name}
                  </Text>
                  <Text style={styles.businessCategory}>
                    {biz.category.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ===== Quick Add Floating Action Bar ===== */}
      {businesses.length > 0 && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/business/new")}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>{t("dashboard.create_business")}</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#65676B",
    fontWeight: "500",
  },
  headerCard: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#1877F2",
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  headerTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  usernameText: {
    color: "#FFFFFF",
    textTransform: "capitalize",
    textDecorationLine: "underline",
  },
  subtitle: {
    fontSize: 13,
    color: "#E0F2FE",
    marginTop: 8,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#050505",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E4E6EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#050505",
  },
  statLabel: {
    fontSize: 11,
    color: "#65676B",
    marginTop: 2,
    fontWeight: "600",
  },
  emptyCard: {
    margin: 16,
    padding: 32,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E4E6EB",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#050505",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: "#65676B",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1877F2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  businessList: {
    paddingHorizontal: 16,
  },
  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E4E6EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  businessDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  businessIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E4E6EB",
  },
  businessLogo: {
    width: "100%",
    height: "100%",
  },
  businessTextGroup: {
    flex: 1,
  },
  businessName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#050505",
  },
  businessCategory: {
    fontSize: 11,
    color: "#65676B",
    marginTop: 2,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 24,
    height: 52,
    backgroundColor: "#1877F2",
    borderRadius: 14,
    gap: 8,
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
