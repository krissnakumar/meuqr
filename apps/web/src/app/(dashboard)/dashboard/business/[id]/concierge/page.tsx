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
  User,
  Hash,
  MapPin,
  UtensilsCrossed,
  Car,
  Compass,
} from "lucide-react";

interface ConciergeRequest {
  id: string;
  business_id: string;
  guest_name: string;
  room_number: string;
  request_type: "restaurant" | "taxi" | "tour" | "other";
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
}

export default function ConciergePage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [requests, setRequests] = useState<ConciergeRequest[]>([]);
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
        .from("concierge_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load concierge requests:", err);
      toast.error("Erro ao carregar solicitações de concierge.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(requestId: string, status: string) {
    try {
      const { error } = await supabase
        .from("concierge_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;
      setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: status as ConciergeRequest["status"] } : r)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const completedToday = requests.filter((r) => r.status === "completed" && r.created_at?.startsWith(todayStr));

  function getStatusBadge(status: string) {
    switch (status) {
      case "in_progress": return <Badge variant="amber">Em Andamento</Badge>;
      case "completed": return <Badge variant="emerald">Concluído</Badge>;
      case "cancelled": return <Badge variant="rose">Cancelado</Badge>;
      default: return <Badge variant="indigo">Pendente</Badge>;
    }
  }

  function getRequestTypeIcon(type: string) {
    switch (type) {
      case "restaurant": return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case "taxi": return <Car className="w-3.5 h-3.5" />;
      case "tour": return <Compass className="w-3.5 h-3.5" />;
      default: return <MapPin className="w-3.5 h-3.5" />;
    }
  }

  function getRequestTypeLabel(type: string) {
    switch (type) {
      case "restaurant": return "Restaurante";
      case "taxi": return "Táxi";
      case "tour": return "Tour";
      default: return "Outro";
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
                <Bell className="w-5 h-5 text-white" />
              </div>
              Concierge
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie solicitações de concierge para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {pendingCount} pendentes · {completedToday.length} hoje
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma solicitação de concierge</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              As solicitações de concierge dos hóspedes aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req, idx) => (
            <div
              key={req.id}
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
                    {getStatusBadge(req.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {req.guest_name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Quarto {req.room_number}
                    </p>
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                    <p className="flex items-center gap-1.5 text-slate-600 font-medium">
                      {getRequestTypeIcon(req.request_type)}
                      {getRequestTypeLabel(req.request_type)}
                    </p>
                    <p className="text-gray-500 line-clamp-3">{req.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-8 flex-1"
                        onClick={() => updateStatus(req.id, "in_progress")}
                      >
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 flex-1"
                        onClick={() => updateStatus(req.id, "cancelled")}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  {req.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8 w-full"
                      onClick={() => updateStatus(req.id, "completed")}
                    >
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
