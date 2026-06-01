"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Bell,
  ArrowLeft,
  Loader2,
  Sparkles,
  Clock,
  Hash,
  User,
  DollarSign,
  UtensilsCrossed,
} from "lucide-react";

interface RoomServiceOrder {
  id: string;
  business_id: string;
  room_number: string;
  customer_name: string;
  items_ordered: any;
  total: number;
  status: "pending" | "preparing" | "delivered" | "completed";
  notes: string | null;
  created_at: string;
}

export default function RoomServicePage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [orders, setOrders] = useState<RoomServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (biz) setBusinessName(biz.name);

      const { data, error } = await supabase
        .from("room_service_orders")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load room service orders:", err);
      toast.error("Erro ao carregar pedidos de serviço de quarto.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from("room_service_orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: status as RoomServiceOrder["status"] } : o)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  }

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing");
  const todayStr = new Date().toISOString().split("T")[0];
  const completedToday = orders.filter((o) => o.status === "completed" && o.created_at?.startsWith(todayStr));

  function getStatusBadge(status: string) {
    switch (status) {
      case "preparing": return <Badge variant="amber">Preparando</Badge>;
      case "delivered": return <Badge variant="indigo">Entregue</Badge>;
      case "completed": return <Badge variant="emerald">Concluído</Badge>;
      default: return <Badge variant="rose">Pendente</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              Serviço de Quarto
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie pedidos de serviço de quarto para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {pendingOrders.length} pendentes · {completedToday.length} hoje
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum pedido de serviço de quarto</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Os pedidos de serviço de quarto aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Quarto {order.room_number}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {order.customer_name}
                    </p>
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                    {order.items_ordered && Array.isArray(order.items_ordered) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {order.items_ordered.map((item: any, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
                          >
                            {typeof item === "string" ? item : item.name} {item.quantity ? `(${item.quantity}x)` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      Total: R$ {order.total.toFixed(2)}
                    </p>
                  </div>

                  {order.notes && (
                    <p className="text-xs text-gray-400 italic line-clamp-2">
                      "{order.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  {(order.status === "pending" || order.status === "preparing") && (
                    <div className="flex items-center gap-2 pt-1">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(order.id, "preparing")}
                        >
                          Iniciar Preparo
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(order.id, "delivered")}
                        >
                          Marcar Entregue
                        </Button>
                      )}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
