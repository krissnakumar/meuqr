import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../../src/lib/api-client";
import { quoteApi } from "../../../src/lib/api-business";
import {
  ArrowLeft,
  FileText,
  Phone,
  Mail,
  Package,
  MessageSquare,
  Trash2,
} from "lucide-react-native";
import { useTranslation } from "../../../src/lib/i18n-provider";

interface QuoteItemData {
  id: string;
  name: string;
  quantity: number;
}

interface QuoteRequestData {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  quote_items: QuoteItemData[];
}

// STATUS_CONFIG is now rendered using t() calls inside the component

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  pending: { color: "#D97706", bg: "#FFFBEB" },
  contacted: { color: "#3B82F6", bg: "#EFF6FF" },
  completed: { color: "#00C853", bg: "#F0FDF4" },
  cancelled: { color: "#DC2626", bg: "#FEF2F2" },
};

export default function QuoteRequestsScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();
  const { t } = useTranslation();

  const [quotes, setQuotes] = useState<QuoteRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, [businessId]);

  async function loadQuotes() {
    try {
      const data = await quoteApi.list(businessId);
      setQuotes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function updateQuoteStatus(quoteId: string, status: string) {
    try {
      await quoteApi.update(quoteId, { status });
      setQuotes(
        quotes.map((q) =>
          q.id === quoteId ? { ...q, status } : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteQuote(quoteId: string) {
    Alert.alert(t("common.delete"), t("common.confirm_delete_quote"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await quoteApi.remove(quoteId);
          setQuotes(quotes.filter((q) => q.id !== quoteId));
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
        <Text style={styles.headerTitle}>{t("business.quotes")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadQuotes();
            }}
          />
        }
      >
        {quotes.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t("common.no_quotes_yet")}</Text>
            <Text style={styles.emptyText}>
              {t("common.no_quotes_desc")}
            </Text>
          </View>
        ) : (
          quotes.map((quote) => {
            const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
            const statusLabels: Record<string, string> = {
              pending: t("common.status_pending"),
              contacted: t("common.status_contacted"),
              completed: t("common.status_completed"),
              cancelled: t("common.status_cancelled"),
            };

            return (
              <View key={quote.id} style={styles.quoteCard}>
                {/* Header */}
                <View style={styles.quoteHeader}>
                  <View style={styles.quoteAvatar}>
                    <Text style={styles.quoteInitial}>
                      {quote.customer_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.quoteInfo}>
                    <Text style={styles.customerName}>
                      {quote.customer_name}
                    </Text>
                    <Text style={styles.quoteDate}>
                      {new Date(quote.created_at).toLocaleString("pt-BR")}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                      {statusLabels[quote.status] || t("common.status_pending")}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                {quote.quote_items?.length > 0 && (
                  <View style={styles.itemsList}>
                    {quote.quote_items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Package size={14} color="#6B7280" />
                        <Text style={styles.itemName}>
                          {item.quantity}x {item.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Message */}
                {quote.message && (
                  <View style={styles.messageBox}>
                    <MessageSquare size={14} color="#6B7280" />
                    <Text style={styles.messageText}>{quote.message}</Text>
                  </View>
                )}

                {/* Contact */}
                <View style={styles.contactRow}>
                  {quote.customer_phone && (
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => Linking.openURL(`tel:${quote.customer_phone}`)}
                    >
                      <Phone size={14} color="#00C853" />
                      <Text style={styles.contactText}>{quote.customer_phone}</Text>
                    </TouchableOpacity>
                  )}
                  {quote.customer_email && (
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => Linking.openURL(`mailto:${quote.customer_email}`)}
                    >
                      <Mail size={14} color="#3B82F6" />
                      <Text style={styles.contactText} numberOfLines={1}>
                        {quote.customer_email}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Actions */}
                {quote.status === "pending" && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionPrimary}
                      onPress={() => updateQuoteStatus(quote.id, "contacted")}
                    >
                      <Text style={styles.actionPrimaryText}>{t("common.mark_contacted")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionDelete}
                      onPress={() => deleteQuote(quote.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
                {quote.status === "contacted" && (
                  <TouchableOpacity
                    style={styles.actionComplete}
                    onPress={() => updateQuoteStatus(quote.id, "completed")}
                  >
                    <Text style={styles.actionCompleteText}>{t("common.finish")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
  quoteCard: {
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
  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quoteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  quoteInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  quoteInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  quoteDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#111827",
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
  contactRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
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
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  actionDelete: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  actionComplete: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#F0FDF4",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionCompleteText: {
    color: "#00C853",
    fontWeight: "600",
    fontSize: 14,
  },
});
