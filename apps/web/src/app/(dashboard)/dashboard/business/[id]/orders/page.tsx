"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Clock,
  CookingPot,
  Bike,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: OrderItem[];
  total: number;
  payment_method: string | null;
  status: string;
  created_at: string;
}

const statusFlow = ["pending", "confirmed", "preparing", "ready", "delivered"];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle2 },
  preparing: { label: "Preparando", color: "bg-purple-100 text-purple-800 border-purple-200", icon: CookingPot },
  ready: { label: "Pronto", color: "bg-green-100 text-green-800 border-green-200", icon: Bike },
  delivered: { label: "Entregue", color: "bg-gray-100 text-gray-500 border-gray-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

export default function OrdersPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setBusiness(biz);
      setOrders(ordersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Pedidos</h1>
          <p className="text-sm text-gray-500">{orders.length} pedido(s)</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Todos", count: counts.all },
          { key: "pending", label: "Pendentes", count: counts.pending },
          { key: "confirmed", label: "Confirmados", count: counts.confirmed },
          { key: "preparing", label: "Preparando", count: counts.preparing },
          { key: "ready", label: "Prontos", count: counts.ready },
          { key: "delivered", label: "Entregues", count: counts.delivered },
          { key: "cancelled", label: "Cancelados", count: counts.cancelled },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s.key
                ? "bg-[#111827] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-gray-500">
              Os pedidos feitos pelos clientes aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Customer info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#111827]">
                          {order.customer_name}
                        </h3>
                        <Badge className={`${status.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <a
                          href={`https://wa.me/${order.customer_phone}`}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-[#00C853]"
                        >
                          <Phone className="w-3 h-3" />
                          {order.customer_phone}
                        </a>
                        {order.customer_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {order.customer_email}
                          </span>
                        )}
                        <span>
                          {new Date(order.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#111827]">
                        R$ {order.total.toFixed(2)}
                      </p>
                      {order.payment_method && (
                        <p className="text-xs text-gray-400">{order.payment_method}</p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1">
                      {Array.isArray(order.items) &&
                        order.items.map((item: OrderItem, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-800 font-medium">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      {(() => {
                        const currentIdx = statusFlow.indexOf(order.status);
                        const nextStatus = statusFlow[currentIdx + 1];
                        const cancelStatus = order.status !== "cancelled";

                        return (
                          <>
                            {nextStatus && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => updateStatus(order.id, nextStatus)}
                              >
                                Avançar para {statusConfig[nextStatus]?.label}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(order.id, "cancelled")}
                              className="text-red-500 hover:text-red-700"
                            >
                              Cancelar
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
