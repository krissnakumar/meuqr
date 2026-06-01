"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Eye,
  MousePointerClick,
  Smartphone,
  Monitor,
  Users,
  ShoppingCart,
  FileText,
  TrendingUp,
  BarChart3,
  Globe,
  Calendar,
  MessageCircle,
  DollarSign,
  Scan,
  MessageSquare,
  ClipboardList,
  Activity,
  Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface BizStats {
  // Legacy data
  totalScans: number;
  totalClicks: number;
  todayScans: number;
  todayClicks: number;
  mobileScans: number;
  desktopScans: number;
  whatsappClicks: number;
  pixClicks: number;
  totalPages: number;
  totalQrs: number;
  totalLeads: number;
  totalOrders: number;
  clickTypes: { type: string; count: number }[];
  // Analytics events data (unified)
  eventCounts: Record<string, number>;
  totalEvents: number;
  dailyTrend: { date: string; count: number }[];
  recentEvents: { id: string; event_type: string; created_at: string; metadata: any }[];
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  created_at: string;
  metadata: any;
}

// ─── Event type config ───────────────────────────────────

const eventConfig: Record<string, { label: string; icon: any; gradient: string; bg: string; color: string }> = {
  page_view: {
    label: "Visualizações de Página",
    icon: Eye,
    gradient: "from-indigo-500 to-blue-500",
    bg: "from-indigo-50 to-blue-50",
    color: "text-indigo-600",
  },
  qr_scan: {
    label: "Scans de QR Code",
    icon: Scan,
    gradient: "from-violet-500 to-purple-500",
    bg: "from-violet-50 to-purple-50",
    color: "text-violet-600",
  },
  whatsapp_click: {
    label: "Cliques no WhatsApp",
    icon: MessageCircle,
    gradient: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    color: "text-emerald-600",
  },
  product_click: {
    label: "Cliques em Produtos",
    icon: ShoppingCart,
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    color: "text-amber-600",
  },
  appointment_started: {
    label: "Agendamentos Iniciados",
    icon: Calendar,
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
    color: "text-blue-600",
  },
  appointment_submitted: {
    label: "Agendamentos Confirmados",
    icon: Calendar,
    gradient: "from-emerald-500 to-green-500",
    bg: "from-emerald-50 to-green-50",
    color: "text-emerald-600",
  },
  quote_submitted: {
    label: "Orçamentos Solicitados",
    icon: ClipboardList,
    gradient: "from-teal-500 to-emerald-500",
    bg: "from-teal-50 to-emerald-50",
    color: "text-teal-600",
  },
  form_submitted: {
    label: "Formulários Enviados",
    icon: MessageSquare,
    gradient: "from-rose-500 to-pink-500",
    bg: "from-rose-50 to-pink-50",
    color: "text-rose-600",
  },
};

function getEventConfig(type: string) {
  return eventConfig[type] || {
    label: type.replace(/_/g, " "),
    icon: Activity,
    gradient: "from-slate-500 to-gray-500",
    bg: "from-slate-50 to-gray-50",
    color: "text-slate-600",
  };
}

// ─── Time helpers ────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays}d`;
  return date.toLocaleDateString("pt-BR");
}

// ─── Page Component ──────────────────────────────────────

export default function BusinessAnalyticsPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState<BizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  const loadAnalytics = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, slug")
        .eq("id", businessId)
        .single();

      setBusiness(biz);

      // ── Legacy data ───────────────────────────────────
      const { count: pages } = await supabase
        .from("pages").select("*", { count: "exact", head: true }).eq("business_id", businessId);

      const { count: qrs } = await supabase
        .from("qr_codes").select("*", { count: "exact", head: true }).eq("business_id", businessId);

      const { count: leads } = await supabase
        .from("leads").select("*", { count: "exact", head: true }).eq("business_id", businessId);

      const { count: orders } = await supabase
        .from("orders").select("*", { count: "exact", head: true }).eq("business_id", businessId);

      const { data: qrCodes } = await supabase
        .from("qr_codes").select("id").eq("business_id", businessId);

      let totalScans = 0, totalClicks = 0, todayScans = 0, todayClicks = 0;
      let mobileScans = 0, desktopScans = 0, whatsappClicks = 0, pixClicks = 0;

      if (qrCodes && qrCodes.length > 0) {
        const qrIds = qrCodes.map((q) => q.id);

        const scanQuery = supabase.from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds);
        const clickQuery = supabase.from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds);

        const [{ count: scans }, { count: clicks }] = await Promise.all([scanQuery, clickQuery]);
        totalScans = scans || 0;
        totalClicks = clicks || 0;

        const [{ count: mobile }] = await Promise.all([
          supabase.from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("device_type", "mobile"),
        ]);
        mobileScans = mobile || 0;
        desktopScans = totalScans - mobileScans;

        const [{ count: waClicks }, { count: pxClicks }] = await Promise.all([
          supabase.from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("click_type", "whatsapp"),
          supabase.from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("click_type", "pix"),
        ]);
        whatsappClicks = waClicks || 0;
        pixClicks = pxClicks || 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [{ count: tScans }, { count: tClicks }] = await Promise.all([
          supabase.from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).gte("created_at", today.toISOString()),
          supabase.from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).gte("created_at", today.toISOString()),
        ]);
        todayScans = tScans || 0;
        todayClicks = tClicks || 0;
      }

      // ── Analytics Events (unified) ────────────────────
      const dateFilter: Record<string, any> = {};
      if (period !== "all") {
        const days = period === "7d" ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        dateFilter.gte = cutoff.toISOString();
      }

      let eventQuery = supabase
        .from("analytics_events")
        .select("*")
        .eq("business_id", businessId);

      if (dateFilter.gte) {
        eventQuery = eventQuery.gte("created_at", dateFilter.gte);
      }

      const { data: events } = await eventQuery.order("created_at", { ascending: false });

      // ── Compute event stats ────────────────────────────
      const eventCounts: Record<string, number> = {};
      const dailyMap: Record<string, number> = {};
      const recentEvents: AnalyticsEvent[] = [];

      if (events) {
        for (const ev of events) {
          eventCounts[ev.event_type] = (eventCounts[ev.event_type] || 0) + 1;

          const day = ev.created_at.substring(0, 10);
          dailyMap[day] = (dailyMap[day] || 0) + 1;

          if (recentEvents.length < 10) {
            recentEvents.push(ev);
          }
        }
      }

      // Build daily trend (last N days)
      const dailyTrend: { date: string; count: number }[] = [];
      const numDays = period === "all" ? 30 : period === "30d" ? 30 : 7;
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().substring(0, 10);
        dailyTrend.push({ date: key, count: dailyMap[key] || 0 });
      }

      const totalEvents = Object.values(eventCounts).reduce((a, b) => a + b, 0);

      setStats({
        totalScans, totalClicks, todayScans, todayClicks,
        mobileScans, desktopScans, whatsappClicks, pixClicks,
        totalPages: pages || 0, totalQrs: qrs || 0, totalLeads: leads || 0, totalOrders: orders || 0,
        clickTypes: [
          { type: "WhatsApp", count: whatsappClicks },
          { type: "Pix", count: pixClicks },
          { type: "Outros", count: totalClicks - whatsappClicks - pixClicks },
        ],
        eventCounts, totalEvents,
        dailyTrend, recentEvents,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId, period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // ── Loading state ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando analytics...</p>
      </div>
    );
  }

  const hasLegacyData = (stats?.totalScans || 0) > 0 || (stats?.totalClicks || 0) > 0;
  const hasEvents = (stats?.totalEvents || 0) > 0;

  // Max value for daily trend chart
  const maxDaily = Math.max(...(stats?.dailyTrend.map(d => d.count) || [0]), 1);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
            <p className="text-sm text-gray-400">{business?.name}</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200">
          {[
            { key: "7d", label: "7 dias" },
            { key: "30d", label: "30 dias" },
            { key: "all", label: "Todo período" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === opt.key
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                  : "text-gray-400 hover:text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Primary Metric Cards ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Eventos</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalEvents || 0}</p>
            <p className="text-xs text-indigo-500 font-medium mt-1 flex items-center gap-1">
              Eventos registrados
            </p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">QR Scans</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <Scan className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalScans || 0}</p>
            <p className="text-xs text-indigo-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats?.todayScans || 0} hoje
            </p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {(stats?.whatsappClicks || 0) + (stats?.eventCounts?.whatsapp_click || 0)}
            </p>
            <p className="text-xs text-indigo-500 font-medium mt-1 flex items-center gap-1">
              Cliques + Eventos
            </p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leads</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalLeads || 0}</p>
            <p className="text-xs text-indigo-500 font-medium mt-1">+{stats?.totalOrders || 0} pedidos</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* ── Events by Type + Daily Trend ────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Events by type breakdown */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Eventos por tipo
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            {hasEvents ? (
              <div className="space-y-3">
                {Object.entries(stats?.eventCounts || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const cfg = getEventConfig(type);
                    const pct = ((count / (stats?.totalEvents || 1)) * 100).toFixed(0);
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600 flex items-center gap-1.5">
                            <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            {cfg.label}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhum evento registrado no período
              </p>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Daily trend (bar chart) */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Tendência diária
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            {hasEvents ? (
              <div>
                <div className="flex items-end gap-[2px] h-32 mb-2">
                  {stats?.dailyTrend.map((day, i) => {
                    const h = (day.count / maxDaily) * 100;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center justify-end group relative"
                      >
                        <div className="absolute bottom-full mb-1 px-1.5 py-0.5 rounded bg-slate-800 text-white text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {day.count} eventos em {day.date.substring(5)}
                        </div>
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            day.count > 0
                              ? "bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500"
                              : "bg-slate-100"
                          }`}
                          style={{ height: `${Math.max(h, day.count > 0 ? 2 : 0)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>{stats?.dailyTrend[0]?.date?.substring(5)}</span>
                  <span>{stats?.dailyTrend[stats.dailyTrend.length - 1]?.date?.substring(5)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhum dado disponível para o período
              </p>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* ── Legacy Stats (Devices + Click Types) ────────── */}
      {(hasLegacyData || (stats?.totalPages || 0) > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Devices */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                Dispositivos (QR Scans)
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {hasLegacyData ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Mobile</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{stats?.mobileScans || 0}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700"
                        style={{ width: `${(stats?.mobileScans || 0) / Math.max(stats?.totalScans || 1, 1) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Desktop</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{stats?.desktopScans || 0}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
                        style={{ width: `${(stats?.desktopScans || 0) / Math.max(stats?.totalScans || 1, 1) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum scan registrado</p>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Click Types */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-indigo-500" />
                Cliques por tipo (QR)
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {stats?.clickTypes && stats.clickTypes.some(ct => ct.count > 0) ? (
                <div className="space-y-3">
                  {stats.clickTypes.map((ct) => {
                    const total = stats.totalClicks || 1;
                    const pct = (ct.count / total) * 100;
                    const colors: Record<string, string> = {
                      WhatsApp: "from-emerald-500 to-emerald-400",
                      Pix: "from-blue-500 to-blue-400",
                      Outros: "from-slate-400 to-slate-300",
                    };
                    return (
                      <div key={ct.type}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600 flex items-center gap-1.5">
                            {ct.type === "WhatsApp" && <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            {ct.type === "Pix" && <DollarSign className="w-3.5 h-3.5 text-blue-500" />}
                            {ct.type}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">{ct.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[ct.type] || "from-slate-400 to-slate-300"} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum clique registrado</p>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      )}

      {/* ── Content Overview ────────────────────────────── */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Visão geral do conteúdo
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Páginas", value: stats?.totalPages || 0, icon: FileText, bg: "from-indigo-50 to-indigo-100", color: "text-indigo-600" },
              { label: "QR Codes", value: stats?.totalQrs || 0, icon: Eye, bg: "from-violet-50 to-violet-100", color: "text-violet-600" },
              { label: "Leads", value: stats?.totalLeads || 0, icon: Users, bg: "from-emerald-50 to-emerald-100", color: "text-emerald-600" },
              { label: "Pedidos", value: stats?.totalOrders || 0, icon: ShoppingCart, bg: "from-amber-50 to-amber-100", color: "text-amber-600" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`p-4 rounded-xl bg-gradient-to-br ${item.bg} text-center`}>
                  <Icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* ── Recent Events Timeline ───────────────────────── */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Eventos recentes
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-2">
              {stats.recentEvents.map((ev) => {
                const cfg = getEventConfig(ev.event_type);
                const Icon = cfg.icon;
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{cfg.label}</p>
                      {ev.metadata?.page_title && (
                        <p className="text-xs text-gray-400 truncate">{ev.metadata.page_title}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(ev.created_at)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhum evento recente. As interações dos clientes aparecerão aqui.
            </p>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
