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
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../../../src/lib/supabase";
import {
  ArrowLeft,
  Plus,
  FileText,
  QrCode,
  Eye,
  Settings,
  Trash2,
  Edit3,
  Share2,
  ChevronRight,
  BarChart3,
  ShoppingCart,
  Users,
  MessageSquare,
  ClipboardList,
} from "lucide-react-native";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  subscription_tier: string;
  is_active: boolean;
}

export default function BusinessDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const businessId = id as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: bizPages } = await supabase
        .from("pages")
        .select("id, title, slug, is_published, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      const { data: bizQrs } = await supabase
        .from("qr_codes")
        .select("id, short_code, title, scan_count, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setBusiness(biz);
      setPages(bizPages || []);
      setQrCodes(bizQrs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteBusiness() {
    Alert.alert(
      "Excluir Negócio",
      "Tem certeza que deseja excluir este negócio? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await supabase.from("businesses").delete().eq("id", businessId);
            router.back();
          },
        },
      ]
    );
  }

  async function handleShare() {
    if (!business) return;
    try {
      await Share.share({
        message: `Confira meu negócio no MeuQR: https://meuqr.com.br/${business.slug}`,
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

  if (!business) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Negócio não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBusiness(); }} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteBusiness}>
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Business Info */}
      <View style={styles.businessHeader}>
        <View style={styles.businessLogo}>
          {business.logo_url ? (
            <Text>Logo</Text>
          ) : (
            <Text style={styles.businessInitial}>
              {business.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessCategory}>
            {business.category.replace(/_/g, " ")}
          </Text>
          <Text style={styles.businessSlug}>/{business.slug}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push(`/business/${businessId}/qr`)}
        >
          <QrCode size={20} color="#00C853" />
          <Text style={styles.quickActionText}>QR Codes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleShare()}
        >
          <Share2 size={20} color="#3B82F6" />
          <Text style={styles.quickActionText}>Compartilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => Linking.openURL(`https://meuqr.com.br/${business.slug}`)}
        >
          <Eye size={20} color="#8B5CF6" />
          <Text style={styles.quickActionText}>Ver Site</Text>
        </TouchableOpacity>
      </View>

      {/* Pages Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FileText size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Páginas</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Alert.alert("Criar Página", "Função disponível em breve");
            }}
          >
            <Plus size={16} color="#00C853" />
            <Text style={styles.addButtonText}>Nova</Text>
          </TouchableOpacity>
        </View>

        {pages.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={32} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhuma página ainda</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                Alert.alert("Criar Página", "Função disponível em breve");
              }}
            >
              <Text style={styles.emptyButtonText}>Criar primeira página</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pages.map((page) => (
            <TouchableOpacity
              key={page.id}
              style={styles.listItem}
              onPress={() =>
                router.push(`/business/${businessId}/pages/${page.id}`)
              }
            >
              <View style={styles.listItemLeft}>
                <View
                  style={[
                    styles.statusDot,
                    page.is_published
                      ? styles.statusPublished
                      : styles.statusDraft,
                  ]}
                />
                <View>
                  <Text style={styles.listItemTitle}>{page.title}</Text>
                  <Text style={styles.listItemSub}>/{page.slug}</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* QR Codes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <QrCode size={18} color="#111827" />
            <Text style={styles.sectionTitle}>QR Codes</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push(`/business/${businessId}/qr`)}
          >
            <QrCode size={16} color="#00C853" />
            <Text style={styles.addButtonText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {qrCodes.length === 0 ? (
          <View style={styles.emptyState}>
            <QrCode size={32} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum QR code gerado</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push(`/business/${businessId}/qr`)}
            >
              <Text style={styles.emptyButtonText}>Gerar QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          qrCodes.map((qr) => (
            <View key={qr.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.qrIconSmall}>
                  <QrCode size={16} color="#111827" />
                </View>
                <View>
                  <Text style={styles.listItemTitle}>
                    {qr.title || qr.short_code}
                  </Text>
                  <Text style={styles.listItemSub}>
                    {qr.scan_count} scans · /q/{qr.short_code}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/business/${businessId}/qr/${qr.id}`)
                }
              >
                <Edit3 size={16} color="#00C853" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Management Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Settings size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Gerenciamento</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.managementItem}
          onPress={() => router.push(`/business/${businessId}/analytics`)}
        >
          <View style={styles.managementItemLeft}>
            <View style={[styles.managementIcon, { backgroundColor: "#EFF6FF" }]}>
              <BarChart3 size={18} color="#3B82F6" />
            </View>
            <Text style={styles.managementText}>Analytics</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.managementItem}
          onPress={() => router.push(`/business/${businessId}/orders`)}
        >
          <View style={styles.managementItemLeft}>
            <View style={[styles.managementIcon, { backgroundColor: "#FFFBEB" }]}>
              <ShoppingCart size={18} color="#F59E0B" />
            </View>
            <Text style={styles.managementText}>Pedidos</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.managementItem}
          onPress={() => router.push(`/business/${businessId}/leads`)}
        >
          <View style={styles.managementItemLeft}>
            <View style={[styles.managementIcon, { backgroundColor: "#F0FDF4" }]}>
              <Users size={18} color="#00C853" />
            </View>
            <Text style={styles.managementText}>Leads</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.managementItem}
          onPress={() => router.push(`/business/${businessId}/members`)}
        >
          <View style={styles.managementItemLeft}>
            <View style={[styles.managementIcon, { backgroundColor: "#F5F3FF" }]}>
              <MessageSquare size={18} color="#7C3AED" />
            </View>
            <Text style={styles.managementText}>Equipe</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.managementItem}
          onPress={() => router.push(`/business/${businessId}/quote-requests`)}
        >
          <View style={styles.managementItemLeft}>
            <View style={[styles.managementIcon, { backgroundColor: "#ECFDF5" }]}>
              <ClipboardList size={18} color="#059669" />
            </View>
            <Text style={styles.managementText}>Orçamentos</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Settings size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Informações</Text>
          </View>
        </View>
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>WhatsApp</Text>
            <Text style={styles.infoValue}>{business.whatsapp || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plano</Text>
            <Text style={styles.infoValue}>{business.subscription_tier}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, business.is_active && { color: "#00C853" }]}>
              {business.is_active ? "Ativo" : "Inativo"}
            </Text>
          </View>
        </View>
      </View>

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
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  businessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  businessInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  businessCategory: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "capitalize",
    marginTop: 2,
  },
  businessSlug: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
  quickActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
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
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    color: "#00C853",
    fontWeight: "500",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: "#00C853",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 13,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPublished: {
    backgroundColor: "#00C853",
  },
  statusDraft: {
    backgroundColor: "#D1D5DB",
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  listItemSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  qrIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  managementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  managementItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  managementIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  managementText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  infoList: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
});
