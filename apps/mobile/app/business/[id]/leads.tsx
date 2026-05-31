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
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../src/lib/supabase";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  Search,
} from "lucide-react-native";
import { useTranslation } from "../../../src/lib/i18n-provider";

interface LeadData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
}

export default function LeadsScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();
  const { t } = useTranslation();

  const [leads, setLeads] = useState<LeadData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [businessId]);

  async function loadLeads() {
    try {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setLeads(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteLead(leadId: string) {
    Alert.alert(t("business.delete_lead"), t("business.delete_lead_confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await supabase.from("leads").delete().eq("id", leadId);
          setLeads(leads.filter((l) => l.id !== leadId));
        },
      },
    ]);
  }

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search)
  );

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
        <Text style={styles.headerTitle}>{t("business.leads")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t("business.search_leads")}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadLeads();
            }}
          />
        }
      >
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t("business.no_members")}</Text>
            <Text style={styles.emptyText}>
              {t("business.leads_captured_desc")}
            </Text>
          </View>
        ) : (
          filteredLeads.map((lead) => (
            <View key={lead.id} style={styles.leadCard}>
              <View style={styles.leadHeader}>
                <View style={styles.leadAvatar}>
                  <Text style={styles.leadInitial}>
                    {lead.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.leadInfo}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <Text style={styles.leadDate}>
                    {new Date(lead.created_at).toLocaleString("pt-BR")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteLead(lead.id)}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Contact Info */}
              <View style={styles.contactRow}>
                {lead.email && (
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => Linking.openURL(`mailto:${lead.email}`)}
                  >
                    <Mail size={14} color="#3B82F6" />
                    <Text style={styles.contactText} numberOfLines={1}>
                      {lead.email}
                    </Text>
                  </TouchableOpacity>
                )}
                {lead.phone && (
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => Linking.openURL(`tel:${lead.phone}`)}
                  >
                    <Phone size={14} color="#00C853" />
                    <Text style={styles.contactText} numberOfLines={1}>
                      {lead.phone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Message */}
              {lead.message && (
                <View style={styles.messageBox}>
                  <MessageSquare size={14} color="#6B7280" />
                  <Text style={styles.messageText}>{lead.message}</Text>
                </View>
              )}
            </View>
          ))
        )}

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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: "#111827",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
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
  leadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  leadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  leadInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  leadDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  contactRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactText: {
    fontSize: 13,
    color: "#6B7280",
    maxWidth: 160,
  },
  messageBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
  },
  messageText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    lineHeight: 18,
  },
});
