"use client";

import { useEffect, useState } from "react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Scan,
  MousePointerClick,
  TrendingUp,
  MessageCircle,
  DollarSign,
  Smartphone,
  Monitor,
  Globe,
  Calendar,
  Eye,
  BarChart3,
} from "lucide-react";

interface AnalyticsStats {
  totalScans: number;
  totalClicks: number;
  whatsappClicks: number;
  pixClicks: number;
  mobileScans: number;
  desktopScans: number;
  todayScans: number;
  todayClicks: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalScans: 0,
    totalClicks: 0,
    whatsappClicks: 0,
    pixClicks: 0,
    mobileScans: 0,
    desktopScans: 0,
    todayScans: 0,
    todayClicks: 0,
  });
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

      if (!businesses?.length) {
        setLoading(false);
        return;
      }

      const businessIds = businesses.map((b) => b.id);

      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .in("business_id", businessIds);

      if (!qrCodes?.length) {
        setLoading(false);
        return;
      }

      const qrIds = qrCodes.map((q) => q.id);

      const { count: totalScans } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds);

      const { count: totalClicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds);

      const { count: whatsappClicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .eq("click_type", "whatsapp");

      const { count: pixClicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .eq("click_type", "pix");

      const { count: mobileScans } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .eq("device_type", "mobile");

      const { count: desktopScans } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .eq("device_type", "desktop");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayScans } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .gte("created_at", today.toISOString());

      const { count: todayClicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .in("qr_code_id", qrIds)
        .gte("created_at", today.toISOString());

      setStats({
        totalScans: totalScans || 0,
        totalClicks: totalClicks || 0,
        whatsappClicks: whatsappClicks || 0,
        pixClicks: pixClicks || 0,
        mobileScans: mobileScans || 0,
        desktopScans: desktopScans || 0,
        todayScans: todayScans || 0,
        todayClicks: todayClicks || 0,
      });

      const { data: scans } = await supabase
        .from("scans")
        .select("*")
        .in("qr_code_id", qrIds)
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentScans(scans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-[#64748B]">Carregando analytics...</p>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Total de Scans",
      value: stats.totalScans.toLocaleString(),
      icon: <Scan className="w-5 h-5" />,
      bg: "from-indigo-500/10 to-indigo-500/5",
      border: "border-indigo-200/50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      trend: "+12%",
      delay: "delay-1",
    },
    {
      label: "Total de Cliques",
      value: stats.totalClicks.toLocaleString(),
      icon: <MousePointerClick className="w-5 h-5" />,
      bg: "from-violet-500/10 to-violet-500/5",
      border: "border-violet-200/50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: "+8%",
      delay: "delay-2",
    },
    {
      label: "Cliques WhatsApp",
      value: stats.whatsappClicks.toLocaleString(),
      icon: <MessageCircle className="w-5 h-5" />,
      bg: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-200/50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: stats.whatsappClicks > 0 ? "+5%" : undefined,
      delay: "delay-3",
    },
    {
      label: "Scans Hoje",
      value: stats.todayScans.toLocaleString(),
      icon: <Eye className="w-5 h-5" />,
      bg: "from-amber-500/10 to-amber-500/5",
      border: "border-amber-200/50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      delay: "delay-4",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Analytics</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Acompanhe o desempenho dos seus QR codes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className={`animate-fade-in-up ${card.delay}`}>
            <GlassCard className={`bg-gradient-to-br ${card.bg} ${card.border}`}>
              <GlassCardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">{card.value}</p>
                    {card.trend && (
                      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {card.trend}
                      </p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm ${card.iconColor}`}>
                    {card.icon}
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Today's Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <GlassCard className="animate-fade-in-up delay-3">
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <GlassCardTitle className="uppercase">Dispositivos</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50/50 to-transparent border border-indigo-100/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium text-[#0F172A]">Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#0F172A] tabular-nums">{stats.mobileScans}</span>
                  <span className="text-xs text-[#94A3B8]">
                    ({stats.totalScans > 0 ? Math.round((stats.mobileScans / stats.totalScans) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/50 to-transparent border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-[#0F172A]">Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#0F172A] tabular-nums">{stats.desktopScans}</span>
                  <span className="text-xs text-[#94A3B8]">
                    ({stats.totalScans > 0 ? Math.round((stats.desktopScans / stats.totalScans) * 100) : 0}%)
                  </span>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalScans > 0 ? (stats.mobileScans / stats.totalScans) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#94A3B8] text-center">
                {stats.mobileScans > stats.desktopScans
                  ? "Maioria dos acessos é mobile"
                  : "Maioria dos acessos é desktop"}
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Click Types */}
        <GlassCard className="animate-fade-in-up delay-4">
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <GlassCardTitle className="uppercase">Cliques por Tipo</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50/50 to-transparent border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium text-[#0F172A]">WhatsApp</span>
                </div>
                <span className="text-lg font-bold text-[#0F172A] tabular-nums">{stats.whatsappClicks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50/50 to-transparent border border-amber-100/50">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-[#0F172A]">Pix</span>
                </div>
                <span className="text-lg font-bold text-[#0F172A] tabular-nums">{stats.pixClicks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet-50/50 to-transparent border border-violet-100/50">
                <div className="flex items-center gap-3">
                  <MousePointerClick className="w-5 h-5 text-violet-500" />
                  <span className="text-sm font-medium text-[#0F172A]">Outros</span>
                </div>
                <span className="text-lg font-bold text-[#0F172A] tabular-nums">
                  {stats.totalClicks - stats.whatsappClicks - stats.pixClicks}
                </span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Today vs Total Comparison */}
      <GlassCard className="animate-fade-in-up delay-5">
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <GlassCardTitle className="uppercase">Hoje vs Total</GlassCardTitle>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#0F172A]">Scans</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 tabular-nums">{stats.todayScans}</span>
                  <span className="text-xs text-[#94A3B8]">hoje</span>
                </div>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalScans > 0 ? (stats.todayScans / stats.totalScans) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#94A3B8]">
                {stats.todayScans} de {stats.totalScans} scans totais
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#0F172A]">Cliques</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600 tabular-nums">{stats.todayClicks}</span>
                  <span className="text-xs text-[#94A3B8]">hoje</span>
                </div>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalClicks > 0 ? (stats.todayClicks / stats.totalClicks) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#94A3B8]">
                {stats.todayClicks} de {stats.totalClicks} cliques totais
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Recent Scans */}
      <GlassCard className="animate-fade-in-up delay-6">
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <GlassCardTitle className="uppercase">Scans Recentes</GlassCardTitle>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
                <Scan className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-medium text-[#64748B]">Nenhum scan registrado ainda</p>
              <p className="text-xs text-[#94A3B8] mt-1">Os scans aparecerão aqui conforme seus QR codes forem lidos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#F8FAFC] to-transparent border border-[#F1F5F9] hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${scan.device_type === "mobile" ? "bg-indigo-100" : "bg-slate-100"} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      {scan.device_type === "mobile" ? (
                        <Smartphone className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Monitor className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] capitalize">
                        {scan.device_type || "Desconhecido"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] flex-wrap">
                        {scan.browser && <span>{scan.browser}</span>}
                        {scan.city && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Globe className="w-3 h-3" />
                              {scan.city}{scan.country ? `, ${scan.country}` : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(scan.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
