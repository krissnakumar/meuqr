"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Eye,
  MousePointerClick,
  TrendingUp,
  MessageCircle,
  DollarSign,
  Smartphone,
  Monitor,
  Globe,
  Calendar,
} from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get business IDs for this user
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

      if (!businesses?.length) {
        setLoading(false);
        return;
      }

      const businessIds = businesses.map((b) => b.id);

      // Get QR codes for these businesses
      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .in(
          "business_id",
          businessIds
        );

      if (!qrCodes?.length) {
        setLoading(false);
        return;
      }

      const qrIds = qrCodes.map((q) => q.id);

      // Stats
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

      // Today
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

      // Recent scans
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
          Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Acompanhe o desempenho dos seus QR codes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Scans</p>
                <p className="text-2xl font-bold text-[#111827]">
                  {stats.totalScans}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Cliques</p>
                <p className="text-2xl font-bold text-[#111827]">
                  {stats.totalClicks}
                </p>
              </div>
              <MousePointerClick className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="text-2xl font-bold text-[#111827]">
                  {stats.whatsappClicks}
                </p>
              </div>
              <MessageCircle className="w-8 h-8 text-[#00C853]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scans Hoje</p>
                <p className="text-2xl font-bold text-[#111827]">
                  {stats.todayScans}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Mobile</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.mobileScans}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Desktop</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.desktopScans}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliques por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#00C853]" />
                  <span className="text-sm text-gray-600">WhatsApp</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.whatsappClicks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm text-gray-600">Pix</span>
                </div>
                <span className="text-sm font-medium">{stats.pixClicks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scans Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhum scan registrado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {scan.device_type === "mobile" ? (
                      <Smartphone className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Monitor className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-gray-600">
                      {scan.device_type || "Desconhecido"}
                    </span>
                    {scan.browser && (
                      <span className="text-gray-400">· {scan.browser}</span>
                    )}
                    {scan.city && (
                      <span className="text-gray-400">· {scan.city}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(scan.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
