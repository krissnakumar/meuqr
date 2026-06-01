"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  CalendarDays,
  ArrowLeft,
  Loader2,
  Sparkles,
  Clock,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Booking {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
}

export default function BookingsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [bookings, setBookings] = useState<Booking[]>([]);
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
        .from("bookings")
        .select("*")
        .eq("business_id", businessId)
        .order("date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error("Erro ao carregar agendamentos.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId: string, status: string) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: status as Booking["status"] } : b)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed": return <Badge variant="indigo">Confirmado</Badge>;
      case "completed": return <Badge variant="emerald">Concluído</Badge>;
      case "cancelled": return <Badge variant="rose">Cancelado</Badge>;
      default: return <Badge variant="amber">Pendente</Badge>;
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
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              Agenda
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie agendamentos e reservas para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {todayBookings.length} hoje · {bookings.length} total
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum agendamento encontrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Os agendamentos dos seus clientes aparecerão aqui.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookings.map((booking, idx) => {
            const isToday = booking.date === todayStr;
            return (
              <div
                key={booking.id}
                className="block group"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <GlassCard className={`group-hover:shadow-xl transition-all duration-300 relative overflow-hidden ${isToday ? "border-indigo-200" : ""}`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {booking.customer_name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.customer_phone}
                      </p>
                    </div>

                    <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(booking.date).toLocaleDateString()} às {booking.time}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {booking.service}
                      </p>
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-gray-400 italic line-clamp-2">
                        "{booking.notes}"
                      </p>
                    )}

                    {booking.status === "pending" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(booking.id, "confirmed")}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(booking.id, "cancelled")}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
