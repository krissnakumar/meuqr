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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../src/lib/supabase";
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react-native";

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number | null;
}

interface OrderData {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  status: string;
  total: number | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#D97706", bg: "#FFFBEB" },
  confirmed: { label: "Confirmado", color: "#2563EB", bg: "#EFF6FF" },
  preparing: { label: "Preparando", color: "#7C3AED", bg: "#F5F3FF" },
  ready: { label: "Pronto", color: "#059669", bg: "#ECFDF5" },
  delivered: { label: "Entregue", color: "#00C853", bg: "#F0FDF4" },
  cancelled: { label: "Cancelado", color: "#DC2626", bg: "#FEF2F2" },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [businessId]);

  async function loadOrders() {
    try {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    }
  }

  function confirmStatusChange(orderId: string, currentStatus: string, nextStatus: string) {
    const config = STATUS_CONFIG[nextStatus];
    Alert.alert(
      `Alterar para "${config?.label}"?`,
      `Tem certeza que deseja mover este pedido para "${config?.label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => updateOrderStatus(orderId, nextStatus),
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Pedidos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingCart size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Nenhum Pedido</Text>
            <Text style={styles.emptyText}>
              Os pedidos dos seus clientes aparecerão aqui
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const nextStatuses = STATUS_FLOW[order.status] || [];

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <View style={styles.orderIcon}>
                      <Package size={20} color="#111827" />
                    </View>
                    <View>
                      <Text style={styles.customerName}>
                        {order.customer_name}
                      </Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleString("pt-BR")}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                {order.order_items?.length > 0 && (
                  <View style={styles.itemsList}>
                    {order.order_items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemQty}>{item.quantity}x</Text>
                        <Text style={styles.itemName}>{item.item_name}</Text>
                        {item.price != null && item.price > 0 && (
                          <Text style={styles.itemPrice}>
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Total & Notes */}
                {order.notes && (
                  <Text style={styles.orderNotes}>📝 {order.notes}</Text>
                )}
                {order.customer_phone && (
                  <Text style={styles.orderPhone}>
                    📞 {order.customer_phone}
                  </Text>
                )}
                {order.total != null && order.total > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      R$ {order.total.toFixed(2)}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                {nextStatuses.length > 0 && (
                  <View style={styles.actionsRow}>
                    {nextStatuses.map((nextStatus) => {
                      const cfg = STATUS_CONFIG[nextStatus];
                      if (!cfg) return null;
                      const isCancel = nextStatus === "cancelled";
                      return (
                        <TouchableOpacity
                          key={nextStatus}
                          style={[
                            styles.actionBtn,
                            isCancel
                              ? styles.actionDanger
                              : { backgroundColor: cfg.bg },
                          ]}
                          onPress={() =>
                            confirmStatusChange(order.id, order.status, nextStatus)
                          }
                        >
                          {isCancel ? (
                            <XCircle size={16} color={cfg.color} />
                          ) : nextStatus === "delivered" || nextStatus === "ready" ? (
                            <CheckCircle size={16} color={cfg.color} />
                          ) : (
                            <Clock size={16} color={cfg.color} />
                          )}
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: cfg.color },
                            ]}
                          >
                            {cfg.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  orderDate: {
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
  },
  itemQty: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    width: 32,
  },
  itemName: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00C853",
  },
  orderNotes: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  orderPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionDanger: {
    backgroundColor: "#FEF2F2",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
