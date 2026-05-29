"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@meuqr/ui";
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

      // Build query
      let scanQuery = supabase.from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds);
      let clickQuery = supabase.from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds);

      const { count: totalScans } = await scanQuery;
      const { count: totalClicks } = await clickQuery;

      const { count: mobileScans } = await supabase
        .from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("device_type", "mobile");

      const { count: desktopScans } = await supabase
        .from("scans").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("device_type", "desktop");

      const { count: whatsappClicks } = await supabase
        .from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("click_type", "whatsapp");

      const { count: pixClicks } = await supabase
        .from("clicks").select("*", { count: "exact", head: true }).in("qr_code_id", qrIds).eq("click_type", "pix");

      // Today
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Analytics</h1>
          <p className="text-sm text-gray-500">{business?.name}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: "7d", label: "7 dias" },
            { key: "30d", label: "30 dias" },
            { key: "all", label: "Todo período" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === opt.key
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-gray-500 hover:text-[#111827]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Scans</p>
                <p className="text-2xl font-bold text-[#111827]">{stats?.totalScans || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500 opacity-70" />
            </div>
            <p className="text-xs text-gray-400 mt-2">+{stats?.todayScans || 0} hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Cliques</p>
                <p className="text-2xl font-bold text-[#111827]">{stats?.totalClicks || 0}</p>
              </div>
              <MousePointerClick className="w-8 h-8 text-purple-500 opacity-70" />
            </div>
            <p className="text-xs text-gray-400 mt-2">+{stats?.todayClicks || 0} hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Leads</p>
                <p className="text-2xl font-bold text-[#111827]">{stats?.totalLeads || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Pedidos</p>
                <p className="text-2xl font-bold text-[#111827]">{stats?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Mobile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (stats?.totalScans || 0) > 0
                            ? ((stats?.mobileScans || 0) / (stats?.totalScans || 1)) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{stats?.mobileScans || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Desktop</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${
                          (stats?.totalScans || 0) > 0
                            ? ((stats?.desktopScans || 0) / (stats?.totalScans || 1)) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{stats?.desktopScans || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliques por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.clickTypes && stats.clickTypes.length > 0 ? (
              <div className="space-y-3">
                {stats.clickTypes.map((ct) => (
                  <div key={ct.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{ct.type}</span>
                    <span className="text-sm font-medium">{ct.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum clique registrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visão geral do conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <FileText className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#111827]">{stats?.totalPages || 0}</p>
              <p className="text-xs text-gray-400">Páginas</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <Eye className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#111827]">{stats?.totalQrs || 0}</p>
              <p className="text-xs text-gray-400">QR Codes</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <Users className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#111827]">{stats?.totalLeads || 0}</p>
              <p className="text-xs text-gray-400">Leads</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <ShoppingCart className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#111827]">{stats?.totalOrders || 0}</p>
              <p className="text-xs text-gray-400">Pedidos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
