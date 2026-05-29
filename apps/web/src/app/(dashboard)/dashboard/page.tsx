"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Store,
  Plus,
  QrCode,
  TrendingUp,
  Eye,
  MousePointerClick,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  Activity,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";

interface DashboardData {
  businesses: {
    id: string;
    name: string;
    slug: string;
    category: string;
    logo_url: string | null;
    created_at: string;
  }[];
  totalScans: number;
  totalClicks: number;
  totalQrs: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "Usuário");

      // 1. Fetch businesses owned by user
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, name, slug, category, logo_url, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      const bizList = businesses || [];
      const bizIds = bizList.map((b) => b.id);

      let scanCount = 0;
      let clickCount = 0;
      let qrCount = 0;

      // 2. Fetch scoped stats only if user has businesses
      if (bizIds.length > 0) {
        const { count: qrCodes } = await supabase
          .from("qr_codes")
          .select("*", { count: "exact", head: true })
          .in("business_id", bizIds);
        qrCount = qrCodes || 0;

        // Fetch all QR code IDs to scope scans & clicks
        const { data: qrData } = await supabase
          .from("qr_codes")
          .select("id")
          .in("business_id", bizIds);

        const qrIds = qrData?.map((q) => q.id) || [];

        if (qrIds.length > 0) {
          const { count: scans } = await supabase
            .from("scans")
            .select("*", { count: "exact", head: true })
            .in("qr_code_id", qrIds);
          scanCount = scans || 0;

          const { count: clicks } = await supabase
            .from("clicks")
            .select("*", { count: "exact", head: true })
            .in("qr_code_id", qrIds);
          clickCount = clicks || 0;
        }
      }

      setData({
        businesses: bizList,
        totalScans: scanCount,
        totalClicks: clickCount,
        totalQrs: qrCount,
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
        <p className="text-sm font-medium text-gray-500">{t("dashboard.loading_info")}</p>
      </div>
    );
  }

  // Pre-generate dynamic greeting based on email prefix
  const displayName = userEmail.split("@")[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* ===== Premium Banner Header ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#4094F7] p-6 sm:p-8 text-white shadow-xl shadow-[#1877F2]/10 border border-[#1877F2]/20">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              {t("dashboard.title")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("common.welcome")}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-50 to-white capitalize">{displayName}</span>! 👋
            </h1>
            <p className="text-blue-50 text-sm sm:text-base max-w-xl">
              {t("dashboard.subtitle")}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/business/new">
              <Button className="bg-white text-[#1877F2] hover:bg-blue-50 border-0 shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5">
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.create_business")}
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("dashboard.analytics")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Premium Core Statistics Grid ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Businesses */}
        <Card className="border border-slate-100 hover:border-[#1877F2]/20 shadow-sm transition-all hover:shadow-md duration-300 group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("dashboard.businesses")}</p>
              <p className="text-3xl font-black text-slate-800 transition-colors group-hover:text-[#1877F2]">
                {data?.businesses.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-slate-100">
              <Store className="w-6 h-6 text-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Total QRs */}
        <Card className="border border-slate-100 hover:border-emerald-100 shadow-sm transition-all hover:shadow-md duration-300 group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("dashboard.qrcodes")}</p>
              <p className="text-3xl font-black text-slate-800 transition-colors group-hover:text-emerald-600">
                {data?.totalQrs || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-50">
              <QrCode className="w-6 h-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Scans */}
        <Card className="border border-slate-100 hover:border-blue-100 shadow-sm transition-all hover:shadow-md duration-300 group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("dashboard.total_scans")}</p>
              <p className="text-3xl font-black text-slate-800 transition-colors group-hover:text-blue-600">
                {data?.totalScans || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-50">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Clicks */}
        <Card className="border border-slate-100 hover:border-violet-100 shadow-sm transition-all hover:shadow-md duration-300 group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("dashboard.total_clicks")}</p>
              <p className="text-3xl font-black text-slate-800 transition-colors group-hover:text-violet-600">
                {data?.totalClicks || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-violet-50">
              <MousePointerClick className="w-6 h-6 text-violet-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Premium Split Layout (Main Workspace & Sidebar) ===== */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Businesses List (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#1877F2]" />
                {t("dashboard.businesses")}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{t("dashboard.subtitle")}</p>
            </div>
            {data?.businesses && data.businesses.length > 0 && (
              <Link href="/dashboard/business/new">
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold border-slate-200 text-[#1877F2] hover:bg-[#1877F2]/10">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t("common.add_page")}
                </Button>
              </Link>
            )}
          </div>

          {data?.businesses.length === 0 ? (
            <Card className="border border-dashed border-gray-200 shadow-sm overflow-hidden">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-[#1877F2]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#1877F2]/20">
                  <Store className="w-10 h-10 text-[#1877F2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboard.empty_title')}</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                  {t('dashboard.empty_desc')}
                </p>
                <Link href="/dashboard/business/new">
                  <Button className="bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-md shadow-[#1877F2]/20 px-6 py-5">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('dashboard.empty_cta')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {data?.businesses.map((biz) => (
                <Link key={biz.id} href={`/dashboard/business/${biz.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-slate-100 hover:border-[#1877F2]/30 overflow-hidden relative bg-white">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1877F2] to-[#4094F7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                          {biz.logo_url ? (
                            <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-7 h-7 text-slate-600 group-hover:text-[#1877F2] transition-colors" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="accent" className="bg-[#1877F2]/10 text-[#1877F2] font-semibold border-[#1877F2]/20 capitalize px-2 py-0.5 text-[10px]">
                            {biz.category.replace("_", " ")}
                          </Badge>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#1877F2]/10 transition-colors">
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1877F2] transition-colors" />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#1877F2] transition-colors line-clamp-1">
                        {biz.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 text-xs text-slate-400">
                        <span>{t('dashboard.created_at')} {new Date(biz.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center text-[#1877F2] group-hover:translate-x-1 transition-transform duration-300 font-semibold">
                          {t('dashboard.manage_page')} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar (1/3 width) */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <Card className="border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1877F2]" />
                {t('dashboard.quick_actions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <Link href="/dashboard/business/new" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-[#1877F2]/20 hover:bg-[#1877F2]/5 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-[#1877F2] transition-colors">{t('dashboard.quick_create')}</p>
                    <p className="text-[10px] text-gray-400">{t('dashboard.quick_create_desc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1877F2] transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/qr-codes" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">{t('dashboard.quick_qr')}</p>
                    <p className="text-[10px] text-gray-400">{t('dashboard.quick_qr_desc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/billing" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-amber-600 transition-colors">{t('dashboard.quick_plan')}</p>
                    <p className="text-[10px] text-gray-400">{t('dashboard.quick_plan_desc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Dynamic Activity Feed */}
          <Card className="border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                {t('dashboard.activity_recent')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">{t('dashboard.activity_scan')}</p>
                    <p className="text-[10px] text-gray-400">{t('dashboard.activity_ago_1m')} • {t('dashboard.activity_location_sp')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">{t('dashboard.activity_click')}</p>
                    <p className="text-[10px] text-gray-400">{t('dashboard.activity_ago_10m')} • {t('dashboard.activity_location_rj')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">{t('dashboard.activity_new_business')}</p>
                    <p className="text-[10px] text-gray-400">{t('dashboard.activity_now')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
    </div>
  );
}
