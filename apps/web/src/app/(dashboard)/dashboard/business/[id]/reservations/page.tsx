"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  CalendarCheck,
  Phone,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
} from "lucide-react";

interface Reservation {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  service_name?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pendente", color: "text-amber-600 bg-amber-50 border-amber-200", bg: "bg-amber-50", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bg: "bg-emerald-50", icon: CheckCircle2 },
  completed: { label: "Concluído", color: "text-blue-600 bg-blue-50 border-blue-200", bg: "bg-blue-50", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "text-red-600 bg-red-50 border-red-200", bg: "bg-red-50", icon: XCircle },
  no_show: { label: "Não Compareceu", color: "text-slate-600 bg-slate-50 border-slate-200", bg: "bg-slate-50", icon: XCircle },
};

export default function ReservationsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

      const { data: services } = await supabase
        .from("appointment_services")
        .select("id, name")
        .eq("business_id", businessId);

      const serviceMap = new Map(services?.map((s) => [s.id, s.name]) || []);

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("business_id", businessId)
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) throw error;

      const enriched: Reservation[] = (appointments || []).map((a) => ({
        ...a,
        service_name: serviceMap.get(a.service_id) || "Serviço",
      }));

      setReservations(enriched);
    } catch (err) {
      console.error("Failed to load reservations:", err);
      toast.error("Erro ao carregar reservas.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar reserva");
      return;
    }
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
      no_show: "Não Compareceu",
    };
    toast.success(`Status: ${labels[status] || status}`);
  }

  const today = new Date().toISOString().split("T")[0];
  const todayReservations = reservations.filter((r) => r.appointment_date === today);

  const stats = {
    today: todayReservations.length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    pending: reservations.filter((r) => r.status === "pending").length,
  };

  const filtered = filter === "all"
    ? reservations
    : reservations.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in-up">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              Reservas
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie reservas de mesas, salas e eventos{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            {reservations.length} reserva(s)
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Hoje", value: stats.today, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Confirmadas", value: stats.confirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todas", count: reservations.length },
          { key: "pending", label: "Pendentes", count: stats.pending },
          { key: "confirmed", label: "Confirmadas", count: stats.confirmed },
          { key: "completed", label: "Concluídas", count: reservations.filter((r) => r.status === "completed").length },
          { key: "cancelled", label: "Canceladas", count: reservations.filter((r) => r.status === "cancelled").length },
          { key: "no_show", label: "Não Compareceram", count: reservations.filter((r) => r.status === "no_show").length },
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

      {/* Reservations list */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma reserva encontrada</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              As reservas feitas pelos clientes aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => {
            const status = statusConfig[res.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isToday = res.appointment_date === today;

            return (
              <GlassCard key={res.id} className="overflow-hidden relative">
                {isToday && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                )}
                <GlassCardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-sm font-bold text-emerald-700 shadow-sm">
                          {res.customer_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800">{res.customer_name}</h3>
                            <Badge className={`${status.color} border text-[10px]`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">{res.service_name || "Reserva"}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(res.appointment_date).toLocaleDateString("pt-BR")}
                          {isToday && <span className="text-emerald-600 font-semibold">(Hoje)</span>}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {res.start_time.slice(0, 5)} - {res.end_time.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {res.customer_phone}
                        </span>
                      </div>

                      {res.notes && (
                        <p className="text-xs text-gray-500 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          {res.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      {res.status === "pending" && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateStatus(res.id, "confirmed")}
                            className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium transition-all flex items-center gap-1 border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateStatus(res.id, "cancelled")}
                            className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-all flex items-center gap-1 border border-red-200"
                          >
                            <XCircle className="w-3 h-3" />
                            Cancelar
                          </button>
                        </div>
                      )}
                      {res.status === "confirmed" && (
                        <button
                          onClick={() => updateStatus(res.id, "completed")}
                          className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-all flex items-center gap-1 border border-blue-200"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
