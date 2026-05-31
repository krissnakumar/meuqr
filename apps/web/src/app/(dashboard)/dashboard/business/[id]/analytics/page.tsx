"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import { useTranslation } from "@/lib/i18n-provider";
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
} from "lucide-react";

interface BizStats {
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
  scansByDay: { date: string; count: number }[];
  clickTypes: { type: string; count: number }[];
}

export default function BusinessAnalyticsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState<BizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    loadAnalytics();
  }, [businessId, period]);

  async function loadAnalytics() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, slug")
        .eq("id", businessId)
        .single();

      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("business_id", businessId);

      const { count: pages } = await supabase
        .from("pages")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: qrs } = await supabase
        .from("qr_codes")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: leads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: orders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      setBusiness(biz);

      if (!qrCodes?.length) {
        setStats({
          totalScans: 0, totalClicks: 0, todayScans: 0, todayClicks: 0,
          mobileScans: 0, desktopScans: 0, whatsappClicks: 0, pixClicks: 0,
          totalPages: pages || 0, totalQrs: qrs || 0, totalLeads: leads || 0, totalOrders: orders || 0,
          scansByDay: [], clickTypes: [],
        });
        return;
      }

      const qrIds = qrCodes.map((q) => q.id);

      const { count: totalScans } = await supabase.from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds);
      const { count: totalClicks } = await supabase.from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds);

      const { count: mobileScans } = await supabase
        .from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("device_type", "mobile");

      const { count: desktopScans } = await supabase
        .from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("device_type", "desktop");

      const { count: whatsappClicks } = await supabase
        .from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("click_type", "whatsapp");

      const { count: pixClicks } = await supabase
        .from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("click_type", "pix");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayScans } = await supabase
        .from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).gte("created_at", today.toISOString());

      const { count: todayClicks } = await supabase
        .from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).gte("created_at", today.toISOString());

      setStats({
        totalScans: totalScans || 0,
        totalClicks: totalClicks || 0,
        todayScans: todayScans || 0,
        todayClicks: todayClicks || 0,
        mobileScans: mobileScans || 0,
        desktopScans: desktopScans || 0,
        whatsappClicks: whatsappClicks || 0,
        pixClicks: pixClicks || 0,
        totalPages: pages || 0,
        totalQrs: qrs || 0,
        totalLeads: leads || 0,
        totalOrders: orders || 0,
        scansByDay: [],
        clickTypes: [
          { type: "WhatsApp", count: whatsappClicks || 0 },
          { type: "Pix", count: pixClicks || 0 },
          { type: "Outros", count: (totalClicks || 0) - (whatsappClicks || 0) - (pixClicks || 0) },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('business.loading_analytics')}</p>
      </div>
    );
  }

  const hasData = (stats?.totalScans || 0) > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
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

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scans</p>
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cliques</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalClicks || 0}</p>
            <p className="text-xs text-indigo-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats?.todayClicks || 0} hoje
            </p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leads</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalLeads || 0}</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pedidos</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalOrders || 0}</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Devices */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Dispositivos
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
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
                    style={{ width: `${hasData ? ((stats?.mobileScans || 0) / (stats?.totalScans || 1)) * 100 : 0}%` }}
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
                    style={{ width: `${hasData ? ((stats?.desktopScans || 0) / (stats?.totalScans || 1)) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Click Types */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-indigo-500" />
              Cliques por tipo
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

      {/* Content Overview */}
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
              { label: "Páginas", value: stats?.totalPages || 0, icon: FileText, color: "from-indigo-50 to-indigo-100", textColor: "text-indigo-600" },
              { label: "QR Codes", value: stats?.totalQrs || 0, icon: Eye, color: "from-violet-50 to-violet-100", textColor: "text-violet-600" },
              { label: "Leads", value: stats?.totalLeads || 0, icon: Users, color: "from-emerald-50 to-emerald-100", textColor: "text-emerald-600" },
              { label: "Pedidos", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "from-amber-50 to-amber-100", textColor: "text-amber-600" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-center`}>
                  <Icon className={`w-5 h-5 ${item.textColor} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
