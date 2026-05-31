"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import PagesTreeView from "./_components/pages-tree-view";
import EditBusinessInfo from "./_components/edit-business-info";
import NotificationSettings from "./_components/notification-settings";
import {
  ArrowLeft,
  Trash2,
  ShoppingCart,
  Users,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Store,
  Sparkles,
  ClipboardList,
  Eye,
  Plus,
  Calendar,
  Utensils,
  Truck,
  DollarSign,
  Stethoscope,
  HeartPulse,
  Package,
  FileText,
  Gift
} from "lucide-react";

interface BusinessFull {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  subscription_tier: string;
  is_active: boolean;
  default_language?: string;
}

const getManagementLinks = (cat: string, id: string) => {
  const isFood = ["restaurant", "pizzeria", "burger_shop", "bakery", "coffee_shop", "acai_sorveteria", "bar_pub", "food_truck"].includes(cat);
  const isClinic = ["medical_clinic", "physiotherapy"].includes(cat);
  const isDentist = ["dental_clinic"].includes(cat);
  const isConstruction = ["construction_materials", "hardware_store", "paint_store"].includes(cat);
  const isBeauty = ["salon", "barber_shop", "nail_studio", "spa"].includes(cat);

  const links = [];

  if (isFood) {
    links.push({ label: "Menu", descKey: "menu_desc", href: `/dashboard/business/${id}/pages`, color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", iconBg: "from-blue-50 to-indigo-50", iconColor: "text-blue-600", countKey: null, icon: FileText });
    links.push({ label: "Orders", descKey: "orders_desc", href: `/dashboard/business/${id}/orders`, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", iconBg: "from-amber-50 to-orange-50", iconColor: "text-amber-600", countKey: "totalOrders" as const, icon: Package });
    links.push({ label: "Fidelidade", descKey: "loyalty_desc", href: `/dashboard/business/${id}/loyalty`, color: "from-pink-500 to-rose-500", bg: "bg-pink-50", iconBg: "from-pink-50 to-rose-50", iconColor: "text-pink-600", countKey: null, icon: Gift });
    links.push({ label: "Customers", descKey: "clients_desc", href: `/dashboard/business/${id}/clients`, color: "from-indigo-500 to-violet-500", bg: "bg-indigo-50", iconBg: "from-indigo-50 to-violet-50", iconColor: "text-indigo-600", countKey: "totalClients" as const, icon: Users });
  } else if (isClinic || isDentist) {
    links.push({ label: "Appointments", descKey: "appointments_desc", href: `/dashboard/business/${id}/appointments`, color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", iconBg: "from-emerald-50 to-green-50", iconColor: "text-emerald-600", countKey: null, icon: Calendar });
    links.push({ label: "Patients", descKey: "patients_desc", href: `/dashboard/business/${id}/patients`, color: "from-indigo-500 to-violet-500", bg: "bg-indigo-50", iconBg: "from-indigo-50 to-violet-50", iconColor: "text-indigo-600", countKey: "totalClients" as const, icon: Users });
    links.push({ label: "Doctors", descKey: "doctors_desc", href: `/dashboard/business/${id}/doctors`, color: "from-teal-500 to-emerald-500", bg: "bg-teal-50", iconBg: "from-teal-50 to-emerald-50", iconColor: "text-teal-600", countKey: null, icon: Stethoscope });
  } else if (isConstruction) {
    links.push({ label: "Product Catalog", descKey: "catalog_desc", href: `/dashboard/business/${id}/pages`, color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", iconBg: "from-blue-50 to-indigo-50", iconColor: "text-blue-600", countKey: null, icon: FileText });
    links.push({ label: "Quote Requests", descKey: "quote_requests_desc", href: `/dashboard/business/${id}/quote-requests`, color: "from-teal-500 to-emerald-500", bg: "bg-teal-50", iconBg: "from-teal-50 to-emerald-50", iconColor: "text-teal-600", countKey: "totalQuoteRequests" as const, icon: ClipboardList });
    links.push({ label: "Orders", descKey: "orders_desc", href: `/dashboard/business/${id}/orders`, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", iconBg: "from-amber-50 to-orange-50", iconColor: "text-amber-600", countKey: "totalOrders" as const, icon: Package });
  } else if (isBeauty) {
    links.push({ label: "Appointments", descKey: "appointments_desc", href: `/dashboard/business/${id}/appointments`, color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", iconBg: "from-emerald-50 to-green-50", iconColor: "text-emerald-600", countKey: null, icon: Calendar });
    links.push({ label: "Fidelidade", descKey: "loyalty_desc", href: `/dashboard/business/${id}/loyalty`, color: "from-pink-500 to-rose-500", bg: "bg-pink-50", iconBg: "from-pink-50 to-rose-50", iconColor: "text-pink-600", countKey: null, icon: Gift });
    links.push({ label: "Clients", descKey: "clients_desc", href: `/dashboard/business/${id}/clients`, color: "from-indigo-500 to-violet-500", bg: "bg-indigo-50", iconBg: "from-indigo-50 to-violet-50", iconColor: "text-indigo-600", countKey: "totalClients" as const, icon: Users });
    links.push({ label: "Professionals", descKey: "professionals_desc", href: `/dashboard/business/${id}/professionals`, color: "from-purple-500 to-fuchsia-500", bg: "bg-purple-50", iconBg: "from-purple-50 to-fuchsia-50", iconColor: "text-purple-600", countKey: null, icon: Users });
  } else {
    // Generic
    links.push({ label: "Pages", descKey: "pages_desc", href: `/dashboard/business/${id}/pages`, color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", iconBg: "from-blue-50 to-indigo-50", iconColor: "text-blue-600", countKey: null, icon: FileText });
    links.push({ label: "Orders", descKey: "orders_desc", href: `/dashboard/business/${id}/orders`, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", iconBg: "from-amber-50 to-orange-50", iconColor: "text-amber-600", countKey: "totalOrders" as const, icon: Package });
    links.push({ label: "Leads", descKey: "leads_desc", href: `/dashboard/business/${id}/leads`, color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", iconBg: "from-emerald-50 to-green-50", iconColor: "text-emerald-600", countKey: "totalLeads" as const, icon: MessageSquare });
  }

  // Always append Analytics
  links.push({ label: "Analytics", descKey: "analytics_desc", href: `/dashboard/business/${id}/analytics`, color: "from-slate-500 to-gray-500", bg: "bg-slate-50", iconBg: "from-slate-50 to-gray-50", iconColor: "text-slate-600", countKey: null, icon: BarChart3 });

  return links;
};

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const { t } = useTranslation();
  const [business, setBusiness] = useState<BusinessFull | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalQuoteRequests, setTotalQuoteRequests] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [notifSettings, setNotifSettings] = useState<any>(null);

  async function handleSaveNotifSettings(updatedSettings: any) {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          notification_settings: updatedSettings
        })
        .eq("id", businessId);

      if (error) {
        toast.error(t("errors.generic") + " " + error.message);
        return;
      }

      setNotifSettings(updatedSettings);
      toast.success(t("success.saved"));
    } catch (err) {
      console.error(err);
      toast.error(t("errors.generic"));
    }
  }

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: bizPages } = await supabase
        .from("pages")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      const { data: bizQrs } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: membersCount } = await supabase
        .from("business_members")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: quotesCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const pageIds = bizPages?.map((p) => p.id) || [];
      let bizSections: any[] = [];
      if (pageIds.length > 0) {
        const { data: secs } = await supabase
          .from("sections")
          .select("*")
          .in("page_id", pageIds)
          .order("sort_order");
        bizSections = secs || [];
      }

      setBusiness(biz);
      setPages(bizPages || []);
      setQrCodes(bizQrs || []);
      setSections(bizSections);
      setTotalOrders(ordersCount || 0);
      setTotalLeads(leadsCount || 0);
      setTotalMembers(membersCount || 0);
      setTotalQuoteRequests(quotesCount || 0);
      setTotalClients(clientsCount || 0);
      setNotifSettings(biz?.notification_settings || {
        notify_qr_scan: true,
        notify_whatsapp_click: true,
        notify_new_order: true,
        notify_quote_request: true,
        notify_lead: true,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        quiet_hours_enabled: false,
        notification_language: "pt-BR",
        push_enabled: true,
        email_enabled: false,
        whatsapp_enabled: false
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness() {
    if (!confirm(t("business.confirm_delete"))) return;
    const { error } = await supabase.from("businesses").delete().eq("id", businessId);
    if (error) {
      toast.error(t("business.error_delete"));
      return;
    }
    toast.success(t("business.success_delete"));
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 space-y-8 animate-fade-in-up">
        {/* Back link skeleton */}
        <div className="skeleton w-24 h-4 rounded" />

        {/* Header GlassCard skeleton */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.06)] p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo skeleton */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl skeleton" />
              <div className="space-y-2.5">
                {/* Name skeleton */}
                <div className="skeleton h-6 w-44 rounded" />
                {/* Badges skeleton */}
                <div className="flex gap-2">
                  <div className="skeleton h-5 w-20 rounded-md" />
                  <div className="skeleton h-5 w-14 rounded-md" />
                </div>
              </div>
            </div>
            {/* Action buttons skeleton */}
            <div className="flex items-center gap-2">
              <div className="skeleton h-9 w-28 rounded-xl" />
              <div className="skeleton h-9 w-36 rounded-xl" />
              <div className="skeleton h-9 w-9 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Main Grid skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN: Pages skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.06)]">
              {/* Card header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-36 rounded" />
                    <div className="skeleton h-3 w-48 rounded" />
                  </div>
                </div>
                <div className="skeleton h-9 w-28 rounded-xl" />
              </div>
              {/* Card content */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Business root node skeleton */}
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="skeleton w-9 h-9 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                </div>
                {/* Tree branch skeleton */}
                <div className="relative pl-6 border-l-2 border-dashed border-slate-200 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[26px] top-6 w-[26px] h-0.5 border-t-2 border-dashed border-slate-200" />
                      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className="flex items-center gap-3 p-4 ml-2">
                          {/* Color bar skeleton */}
                          <div className="skeleton w-1 h-12 rounded-full" />
                          <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-4 w-40 rounded" />
                            <div className="skeleton h-3 w-24 rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="skeleton w-8 h-8 rounded-lg" />
                            <div className="skeleton w-16 h-8 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Business Info skeleton */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.06)]">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div className="skeleton w-8 h-8 rounded-lg" />
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                {/* Business name card skeleton */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/20 border border-slate-100">
                  <div className="skeleton w-9 h-9 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                  </div>
                </div>
                {/* Info rows */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="skeleton w-4 h-4 mt-0.5 rounded" />
                    <div className="space-y-1 flex-1">
                      <div className="skeleton h-3 w-16 rounded" />
                      <div className="skeleton h-4 w-32 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Links skeleton */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.06)]">
              <div className="flex items-center gap-2 p-5 sm:p-6 border-b border-[#E2E8F0]">
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="skeleton h-4 w-28 rounded" />
              </div>
              <div className="divide-y divide-slate-50">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="skeleton w-9 h-9 rounded-xl" />
                      <div className="space-y-1">
                        <div className="skeleton h-4 w-20 rounded" />
                        <div className="skeleton h-3 w-28 rounded" />
                      </div>
                    </div>
                    <div className="skeleton w-4 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Templates CTA skeleton */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.06)] p-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="skeleton w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-44 rounded" />
                </div>
                <div className="skeleton w-4 h-4 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">{t("business.not_found")}</h2>
        <p className="text-sm text-gray-400 mb-6">{t("errors.not_found")}</p>
        <Link href="/dashboard">
          <Button variant="outline">{t("business.back_to_dashboard")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8 animate-fade-in-up">
      {/* ===== Back Link ===== */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        {t("dashboard.title")}
      </Link>

      {/* ===== Header ===== */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-50/60 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-gradient-to-br from-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />

        <GlassCardContent className="relative p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {business.logo_url ? (
                  <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{business.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant="indigo">
                    {business.category.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant={business.subscription_tier === "free" ? "amber" : "emerald"}>
                    {business.subscription_tier === "free" ? t("dashboard.free_plan") : business.subscription_tier}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {business.slug && (
                <Link
                  href={`/${business.slug}`}
                  target="_blank"
                  className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center gap-1.5 shadow-sm"
                >                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t("public.page")}</span>
                </Link>
              )}
              <Link href={`/dashboard/business/${businessId}/setup`}>
                <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t("business.add_page")}
                </Button>
              </Link>
              <button
                onClick={deleteBusiness}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
                title={t("common.delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* ===== Main Grid ===== */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ===== LEFT COLUMN: Pages & QR Codes ===== */}
        <div className="lg:col-span-2 space-y-6">
          <PagesTreeView
            businessId={businessId}
            businessName={business.name}
            businessSlug={business.slug}
            pages={pages}
            qrCodes={qrCodes}
            sections={sections}
            onRefresh={loadBusiness}
          />
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-5">

          {/* Business Info */}
          <EditBusinessInfo
            businessId={businessId}
            business={business}
            onRefresh={loadBusiness}
          />

          {/* Notification Settings */}
          {notifSettings && (
            <NotificationSettings
              settings={notifSettings}
              onSave={(updated) => handleSaveNotifSettings(updated)}
            />
          )}

          {/* Management Links */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
                <GlassCardTitle>{t("dashboard.title")}</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {getManagementLinks(business.category || "other", businessId).map((link, linkIndex) => {
                  const IconComponent = link.icon || BarChart3;
                  const count = link.countKey ? (() => {
                    switch (link.countKey) {
                      case "totalOrders": return totalOrders;
                      case "totalLeads": return totalLeads;
                      case "totalMembers": return totalMembers;
                      case "totalQuoteRequests": return totalQuoteRequests;
                      case "totalClients": return totalClients;
                      default: return 0;
                    }
                  })() : 0;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group animate-fade-in-up"
                      style={{ animationDelay: `${linkIndex * 80}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${link.iconBg} flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 ${link.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{link.label}</p>
                          <p className="text-xs text-gray-400">{t(link.descKey)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <Badge variant="indigo" className="text-[10px] px-2 py-0.5">
                            {count}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Templates CTA */}
          <GlassCard>
            <GlassCardContent className="p-4">
              <Link href={`/dashboard/business/${businessId}/setup`} className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 hover:border-indigo-200 transition-all hover:shadow-md">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{t("business.use_template")}</p>
                    <p className="text-xs text-gray-400">{t("business.setup_desc")}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                </div>
              </Link>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

