"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Wrench,
  ArrowLeft,
  Loader2,
  Sparkles,
  User,
  Phone,
  Clock,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Car,
  CheckCircle2,
} from "lucide-react";

interface ServiceOrder {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_info: string;
  service_description: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  assigned_to: string | null;
  total: number | null;
  created_at: string;
}

export default function ServiceOrdersPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
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
        .from("service_orders")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load service orders:", err);
      toast.error("Erro ao carregar ordens de serviço.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from("service_orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: status as ServiceOrder["status"] } : o)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  }

  const openCount = orders.filter((o) => o.status === "open").length;
  const inProgressCount = orders.filter((o) => o.status === "in_progress").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  function getStatusBadge(status: string) {
    switch (status) {
      case "in_progress": return <Badge variant="amber">Em Andamento</Badge>;
      case "completed": return <Badge variant="emerald">Concluído</Badge>;
      case "cancelled": return <Badge variant="rose">Cancelado</Badge>;
      default: return <Badge variant="indigo">Aberto</Badge>;
    }
  }

  function getPriorityIcon(priority: string) {
    switch (priority) {
      case "high": return <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />;
      case "medium": return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-emerald-500" />;
    }
  }

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case "high":
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Alta</span>;
      case "medium":
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Média</span>;
      default:
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Baixa</span>;
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
                <Wrench className="w-5 h-5 text-white" />
              </div>
              Ordens de Serviço
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie ordens de serviço e acompanhamento para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {openCount} abertas · {inProgressCount} andamento · {completedCount} concluídas
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma ordem de serviço</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              As ordens de serviço dos seus clientes aparecerão aqui.
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
              <GlassCard className={`group-hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                order.priority === "high" ? "border-rose-200" : ""
              }`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  order.priority === "high"
                    ? "from-rose-500 to-rose-400"
                    : order.priority === "medium"
                    ? "from-amber-500 to-amber-400"
                    : "from-emerald-500 to-emerald-400"
                }`} />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(order.priority)}
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {order.customer_name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customer_phone}
                    </p>
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Car className="w-3.5 h-3.5 text-gray-400" />
                      {order.vehicle_info}
                    </p>
                    <p className="text-gray-500 line-clamp-2">{order.service_description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    {order.total != null && (
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        R$ {order.total.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {order.status === "open" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-8 flex-1"
                        onClick={() => updateStatus(order.id, "in_progress")}
                      >
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 flex-1"
                        onClick={() => updateStatus(order.id, "cancelled")}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  {order.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8 w-full"
                      onClick={() => updateStatus(order.id, "completed")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Concluir
                    </Button>
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
