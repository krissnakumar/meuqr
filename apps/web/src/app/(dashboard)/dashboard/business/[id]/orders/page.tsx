"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pendente", color: "text-amber-600 bg-amber-50 border-amber-200", bg: "bg-amber-50", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-blue-600 bg-blue-50 border-blue-200", bg: "bg-blue-50", icon: CheckCircle2 },
  preparing: { label: "Preparando", color: "text-purple-600 bg-purple-50 border-purple-200", bg: "bg-purple-50", icon: CookingPot },
  ready: { label: "Pronto", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bg: "bg-emerald-50", icon: Bike },
  delivered: { label: "Entregue", color: "text-slate-500 bg-slate-50 border-slate-200", bg: "bg-slate-50", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "text-red-600 bg-red-50 border-red-200", bg: "bg-red-50", icon: XCircle },
};

export default function OrdersPage() {
  const params = useParams();
  const { t } = useTranslation();
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
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    const statusLabels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    toast.success(`Status: ${statusLabels[newStatus] || newStatus}`);
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
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('business.loading_orders')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
          <p className="text-sm text-gray-400">{orders.length} pedido(s)</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
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
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === s.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-sm text-gray-400">Os pedidos feitos pelos clientes aparecerão aqui.</p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <GlassCard key={order.id} className="overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full ${status.bg}`} />
                <GlassCardContent className="p-6 ml-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">
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
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
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
                        <span className="text-gray-300">
                          {new Date(order.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">
                        R$ {order.total.toFixed(2)}
                      </p>
                      {order.payment_method && (
                        <p className="text-xs text-gray-400">{order.payment_method}</p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="space-y-1.5">
                        {order.items.map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-slate-700 font-medium">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      {(() => {
                        const currentIdx = statusFlow.indexOf(order.status);
                        const nextStatus = statusFlow[currentIdx + 1];

                        return (
                          <>
                            {nextStatus && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => updateStatus(order.id, nextStatus)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                Avançar para {statusConfig[nextStatus]?.label}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(order.id, "cancelled")}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              Cancelar
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
