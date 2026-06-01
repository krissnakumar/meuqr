"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Truck,
  ArrowLeft,
  Loader2,
  Sparkles,
  Clock,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
} from "lucide-react";

interface DeliveryRequest {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  delivery_date: string;
  delivery_time: string;
  items: any;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
}

export default function DeliveriesPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
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
        .from("delivery_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (err) {
      console.error("Failed to load deliveries:", err);
      toast.error("Erro ao carregar entregas.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(deliveryId: string, status: string) {
    try {
      const { error } = await supabase
        .from("delivery_requests")
        .update({ status })
        .eq("id", deliveryId);

      if (error) throw error;
      setDeliveries(deliveries.map((d) => (d.id === deliveryId ? { ...d, status: status as DeliveryRequest["status"] } : d)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  }

  const pendingCount = deliveries.filter((d) => d.status === "pending" || d.status === "in_transit").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const completedToday = deliveries.filter((d) => d.status === "delivered" && d.delivery_date === todayStr);

  function getStatusBadge(status: string) {
    switch (status) {
      case "in_transit": return <Badge variant="amber">Em Trânsito</Badge>;
      case "delivered": return <Badge variant="emerald">Entregue</Badge>;
      case "cancelled": return <Badge variant="rose">Cancelado</Badge>;
      default: return <Badge variant="indigo">Pendente</Badge>;
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
                <Truck className="w-5 h-5 text-white" />
              </div>
              Entregas
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie solicitações de entrega para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {pendingCount} pendentes · {completedToday.length} entregues hoje
          </div>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma entrega solicitada</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              As solicitações de entrega dos seus clientes aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deliveries.map((delivery, idx) => (
            <div
              key={delivery.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    {getStatusBadge(delivery.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {delivery.customer_name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {delivery.customer_phone}
                    </p>
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="line-clamp-1">{delivery.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(delivery.delivery_date).toLocaleDateString()} às {delivery.delivery_time}
                    </p>
                    {delivery.items && Array.isArray(delivery.items) && (
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        {delivery.items.length} itens
                      </p>
                    )}
                  </div>

                  {delivery.notes && (
                    <p className="text-xs text-gray-400 italic line-clamp-2">
                      "{delivery.notes}"
                    </p>
                  )}

                  {delivery.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-8 flex-1"
                        onClick={() => updateStatus(delivery.id, "in_transit")}
                      >
                        Iniciar Entrega
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 flex-1"
                        onClick={() => updateStatus(delivery.id, "cancelled")}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  {delivery.status === "in_transit" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8 w-full"
                      onClick={() => updateStatus(delivery.id, "delivered")}
                    >
                      Confirmar Entrega
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
