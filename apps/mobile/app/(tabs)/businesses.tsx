import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { businessApi } from "../../src/lib/api-business";
import { Store, Plus, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../../src/lib/i18n-provider";

interface Business {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export default function BusinessesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const data = await businessApi.list();

      setBusinesses(data || []);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("business.title")}</Text>
        <Text style={styles.subtitle}>{businesses.length} {t("dashboard.businesses")}</Text>
      </View>

      {businesses.length === 0 ? (
        <View style={styles.empty}>
          <Store size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{t("dashboard.no_businesses")}</Text>
          <Text style={styles.emptyText}>{t("dashboard.no_businesses_desc")}</Text>
        </View>
      ) : (
        businesses.map((biz) => (
          <TouchableOpacity key={biz.id} style={styles.businessCard} onPress={() => router.push(`/business/${biz.id}`)}>
            <View style={styles.businessInfo}>
              <View style={styles.businessIcon}>
                <Store size={24} color="#111827" />
              </View>
              <View>
                <Text style={styles.businessName}>{biz.name}</Text>
                <Text style={styles.businessCategory}>
                  {biz.category.replace(/_/g, " ")}
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/business/new")}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>{t("business.new_title")}</Text>
      </TouchableOpacity>
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
  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  businessInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  businessCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    textTransform: "capitalize",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 24,
    height: 52,
    backgroundColor: "#00C853",
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
