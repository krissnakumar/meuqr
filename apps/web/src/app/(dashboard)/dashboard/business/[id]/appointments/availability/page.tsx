"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  Clock,
  Sun,
  Power,
  PowerOff,
  Save,
} from "lucide-react";

interface AvailabilitySlot {
  id?: string;
  business_id: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
}

const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AppointmentsAvailabilityPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<AvailabilitySlot[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      setBusiness(biz);

      const { data: availData } = await supabase
        .from("business_availability")
        .select("*")
        .eq("business_id", businessId)
        .is("staff_id", null);

      const dbAvail = availData || [];

      const defaultSchedule: AvailabilitySlot[] = Array.from({ length: 7 }, (_, i) => {
        const existing = dbAvail.find((a: any) => a.day_of_week === i);
        return existing
          ? {
              id: existing.id,
              business_id: businessId,
              day_of_week: i,
              is_available: true,
              start_time: existing.start_time.slice(0, 5),
              end_time: existing.end_time.slice(0, 5),
            }
          : {
              business_id: businessId,
              day_of_week: i,
              is_available: i > 0 && i < 6,
              start_time: "08:00",
              end_time: "18:00",
            };
      });

      setSchedule(defaultSchedule);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateDay(index: number, updates: Partial<AvailabilitySlot>) {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error: deleteError } = await supabase
        .from("business_availability")
        .delete()
        .eq("business_id", businessId)
        .is("staff_id", null);

      if (deleteError) throw deleteError;

      const toInsert = schedule
        .filter((d) => d.is_available)
        .map((d) => ({
          business_id: businessId,
          day_of_week: d.day_of_week,
          start_time: d.start_time + ":00",
          end_time: d.end_time + ":00",
          staff_id: null,
        }));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("business_availability")
          .insert(toInsert);

        if (insertError) throw insertError;
      }

      toast.success("Disponibilidade salva!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar disponibilidade");
    } finally {
      setSaving(false);
    }
  }

  const availableDays = schedule.filter((d) => d.is_available).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando disponibilidade...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Disponibilidade</h1>
            <p className="text-sm text-gray-400">Configure os horários de funcionamento para agendamentos</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Horários
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Dias Disponíveis", value: availableDays, icon: Sun, bg: "from-amber-50 to-orange-50", color: "text-amber-600" },
          { label: "Dias Fechados", value: 7 - availableDays, icon: Clock, bg: "from-slate-50 to-gray-50", color: "text-slate-600" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((day, index) => {
          const isWeekend = index === 0 || index === 6;

          return (
            <GlassCard
              key={index}
              className={`relative overflow-hidden transition-all ${
                !day.is_available ? "opacity-60" : "hover:shadow-md"
              } ${isWeekend ? "bg-gradient-to-br from-slate-50/30 to-transparent" : ""}`}
            >
              <GlassCardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      day.is_available
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {DAY_SHORT[index]}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{DAY_NAMES[index]}</span>
                  </div>
                  <button
                    onClick={() => updateDay(index, { is_available: !day.is_available })}
                    className={`p-2 rounded-lg transition-all ${
                      day.is_available
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                    title={day.is_available ? "Fechar" : "Abrir"}
                  >
                    {day.is_available ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>
                </div>

                {day.is_available ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Início</label>
                      <input
                        type="time"
                        value={day.start_time}
                        onChange={(e) => updateDay(index, { start_time: e.target.value })}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fim</label>
                      <input
                        type="time"
                        value={day.end_time}
                        onChange={(e) => updateDay(index, { end_time: e.target.value })}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <Badge variant="muted">Fechado</Badge>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
