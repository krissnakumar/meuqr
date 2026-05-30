"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, MetricCard, QuickActionItem, ActivityItem, WelcomeBanner } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Store,
  Plus,
  QrCode,
  ArrowUpRight,
  Loader2,
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Share2,
  Zap,
  TrendingUp,
  Activity,
  Scan,
  Phone,
  DollarSign,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "Usuário");

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

      if (bizIds.length > 0) {
        const { count: qrCodes } = await supabase
          .from("qr_codes")
          .select("*", { count: "exact", head: true })
          .in("business_id", bizIds);
        qrCount = qrCodes || 0;

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
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-[#64748B]">{t("dashboard.loading_info")}</p>
      </div>
    );
  }

  const displayName = userEmail.split("@")[0];
  const hasBusinesses = data?.businesses && data.businesses.length > 0;
  const primaryBiz = hasBusinesses ? data!.businesses[0] : null;

  return (
    <div className="space-y-8 pb-10">
      {/* ===== Welcome Banner ===== */}
      <WelcomeBanner
        greeting={t("common.welcome")}
        title={displayName}
        subtitle={t("dashboard.subtitle")}
        badge={t("dashboard.title")}
        badgeIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
        actions={
          <>
            <Link href="/dashboard/business/new">
              <Button variant="outline-white" size="sm" className="backdrop-blur-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                {t("dashboard.create_business")}
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline-white" size="sm" className="backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                {t("dashboard.analytics")}
              </Button>
            </Link>
          </>
        }
      />

      {/* ===== Today's Metrics ===== */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">{t("dashboard.today")}</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label={t("dashboard.scans_today")}
            value={data?.totalScans || 0}
            icon={<Scan className="w-5 h-5" />}
            color="indigo"
            trend={{ value: 12, positive: true }}
          />
          <MetricCard
            label={t("dashboard.clicks_today")}
            value={data?.totalClicks || 0}
            icon={<Phone className="w-5 h-5" />}
            color="emerald"
            trend={{ value: 8, positive: true }}
          />
          <MetricCard
            label={t("dashboard.orders_today")}
            value="0"
            icon={<ShoppingBag className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            label={t("dashboard.revenue_today")}
            value="R$ 0"
            icon={<DollarSign className="w-5 h-5" />}
            color="violet"
          />
        </div>
      </div>

      {/* ===== Last 7 Days Trend + Quick Actions ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Last 7 Days Stats */}
          <Card className="border border-[#E2E8F0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <CardTitle className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                  {t("dashboard.last_7_days")}
                </CardTitle>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                  {t("common.view_all")}
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Mini trend chart (bar chart visualization) */}
              <div className="space-y-4">
                {/* Scans trend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Scan className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-[#0F172A]">{t("dashboard.scans")}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">{data?.totalScans || 0}</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((data?.totalScans || 0) / 10, 100)}%` }}
                    />
                  </div>
                </div>

                {/* WhatsApp clicks trend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-[#0F172A]">{t("dashboard.whatsapp_clicks")}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">{data?.totalClicks || 0}</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((data?.totalClicks || 0) / 10, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Orders trend (placeholder) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-[#0F172A]">{t("dashboard.orders")}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">0</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>

                {/* Conversion rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-violet-500" />
                      <span className="font-medium text-[#0F172A]">{t("dashboard.conversion_rate")}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">0%</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Businesses / Empty State */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">{t("dashboard.businesses")}</h2>
              </div>
              {hasBusinesses && (
                <Link href="/dashboard/business/new">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t("common.new")}
                  </Button>
                </Link>
              )}
            </div>

            {!hasBusinesses ? (
              <Card className="border border-dashed border-[#CBD5E1] shadow-sm overflow-hidden">
                <CardContent className="p-12 sm:p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100/50 shadow-sm">
                    <Store className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{t("dashboard.empty_title")}</h3>
                  <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-8 leading-relaxed">
                    {t("dashboard.empty_desc")}
                  </p>
                  <Link href="/dashboard/business/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 px-6 py-5 transition-all">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("dashboard.empty_cta")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {data?.businesses.map((biz, i) => (
                  <Link key={biz.id} href={`/dashboard/business/${biz.id}`}>
                    <Card
                      className="hover:shadow-elevated transition-all duration-300 cursor-pointer group border border-[#E2E8F0] overflow-hidden relative bg-white animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-[#E2E8F0] flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                            {biz.logo_url ? (
                              <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-6 h-6 text-[#64748B] group-hover:text-indigo-600 transition-colors" />
                            )}
                          </div>
                          <div className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-700 border border-indigo-200 capitalize">
                            {biz.category.replace("_", " ")}
                          </div>
                        </div>

                        <h3 className="font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {biz.name}
                        </h3>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#94A3B8]">
                          <span>{t("dashboard.created_at")} {new Date(biz.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-0.5 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5">
                            {t("dashboard.manage_page")}
                            <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border border-[#E2E8F0] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#F1F5F9] py-4">
              <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {t("dashboard.quick_actions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <QuickActionItem
                href="/dashboard/business/new"
                icon={<Plus className="w-5 h-5" />}
                title={t("dashboard.quick_create")}
                description={t("dashboard.quick_create_desc")}
                color="indigo"
              />
              <QuickActionItem
                href="/dashboard/business/new?tab=pages"
                icon={<LayoutDashboard className="w-5 h-5" />}
                title={t("dashboard.quick_page")}
                description={t("dashboard.quick_page_desc")}
                color="emerald"
              />
              <QuickActionItem
                href="/dashboard/qr-codes"
                icon={<Share2 className="w-5 h-5" />}
                title={t("dashboard.quick_qr")}
                description={t("dashboard.quick_qr_desc")}
                color="violet"
              />
              {primaryBiz?.slug && (
                <QuickActionItem
                  href={`https://wa.me/?text=${encodeURIComponent(`${t("dashboard.quick_whatsapp_text")} ${window.location.origin}/q/${primaryBiz.slug}`)}`}
                  icon={<MessageSquare className="w-5 h-5" />}
                  title={t("dashboard.quick_whatsapp")}
                  description={t("dashboard.quick_whatsapp_desc")}
                  color="emerald"
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-[#E2E8F0] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#F1F5F9] py-4">
              <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                {t("dashboard.activity_recent")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="divide-y divide-[#F1F5F9]">
                <ActivityItem
                  icon={<Scan className="w-3.5 h-3.5 text-indigo-500" />}
                  title={t("dashboard.activity_scan")}
                  time={t("dashboard.activity_ago_1m")}
                  location={t("dashboard.activity_location_sp")}
                  dotColor="bg-indigo-500"
                />
                <ActivityItem
                  icon={<Phone className="w-3.5 h-3.5 text-emerald-500" />}
                  title={t("dashboard.activity_click")}
                  time={t("dashboard.activity_ago_10m")}
                  location={t("dashboard.activity_location_rj")}
                  dotColor="bg-emerald-500"
                />
                <ActivityItem
                  icon={<Store className="w-3.5 h-3.5 text-violet-500" />}
                  title={t("dashboard.activity_new_business")}
                  time={t("dashboard.activity_now")}
                  dotColor="bg-violet-500"
                />
              </div>

              <button className="w-full mt-4 pt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors text-center cursor-pointer">
                {t("common.view_all")}
              </button>
            </CardContent>
          </Card>

          {/* Plan Summary */}
          <Card className="border border-[#E2E8F0] shadow-sm overflow-hidden bg-gradient-to-br from-indigo-50/50 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{t("dashboard.current_plan")}</p>
                  <p className="text-xs text-[#64748B] font-medium">{t("free_plan")}</p>
                </div>
              </div>
              <Link href="/dashboard/billing">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                  {t("dashboard.quick_plan")}
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
