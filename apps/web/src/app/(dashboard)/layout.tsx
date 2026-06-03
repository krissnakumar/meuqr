"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, ErrorBoundary, LanguageSelector } from "@meuqr/ui";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  QrCode,
  Bell,
  FileText,
  Package,
  Users,
  Megaphone,
  Calendar,
  Utensils,
  Truck,
  DollarSign,
  Stethoscope,
  HeartPulse,
  Gift,
  Crown,
  Zap,
  MessageSquare,
  Star,
  UserPlus,
  Sparkles,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { I18nProvider, useTranslation } from "@/lib/i18n-provider";
import { NotificationBell } from "@/components/NotificationBell";
import { getNavigationForBusiness } from "@meuqr/shared";

// Map icon strings from navigation config to actual Lucide components
const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  FileText,
  QrCode,
  Image: Package,
  MessageSquare,
  Users,
  BarChart3,
  MessageCircle: Bell,
  Star,
  Bell,
  Settings,
  CreditCard: DollarSign,
  Package,
  Briefcase: Calendar,
  UtensilsCrossed: Utensils,
  Calendar,
  ShoppingCart,
  CalendarCheck: Calendar,
  ClipboardList: FileText,
  FileSpreadsheet: FileText,
  Megaphone,
  Gift,
  TicketPercent: Gift,
  UsersRound: Users,
  UserCheck: Users,
  HeartPulse,
  Stethoscope,
  Home: Store,
  UserPlus,
  BookOpen: FileText,
  GraduationCap: Users,
  ChalkboardTeacher: Users,
  CalendarDays: Calendar,
  Hotel: Store,
  RoomService: Bell,
  ConciergeBell: Bell,
  Truck,
  Car: Truck,
  Wrench: Settings,
  FileSignature: FileText,
  Table2: Calendar,
};

type SidebarItem = {
  href: string;
  icon: any;
  match: string;
  key?: string;
  label?: string;
};

type SidebarGroup = {
  title?: string;
  items: SidebarItem[];
};

function SubscriptionBadge({ tier }: { tier: string | undefined }) {
  const normTier = (tier || "free").toLowerCase();

  if (normTier === "business" || normTier === "premium") {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black tracking-wider uppercase shadow-sm shrink-0 leading-none">
        <Crown className="w-2.5 h-2.5 fill-white text-white shrink-0" />
        <span>Premium</span>
      </div>
    );
  }

  if (normTier === "pro" || normTier === "starter") {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black tracking-wider uppercase shadow-sm shrink-0 leading-none">
        <Zap className="w-2.5 h-2.5 fill-white text-white shrink-0" />
        <span>Starter</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-extrabold tracking-wider uppercase shrink-0 leading-none">
      <span>Free</span>
    </div>
  );
}

function DashboardSidebar({ user, pathname, sidebarOpen, setSidebarOpen, handleLogout, primaryBusiness, enabledModuleSlugs }: {
  user: User | null;
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
  primaryBusiness: { id: string, category: string, subscription_tier?: string } | null;
  enabledModuleSlugs: string[];
}) {
  const { t, lang, setLang } = useTranslation();

  const getSidebarItems = () => {
    const groups: SidebarGroup[] = [];

    const mainItems: SidebarItem[] = [];

    if (primaryBusiness) {
      const id = primaryBusiness.id;

      // Generate dynamic navigation from enabled modules
      const navItems = getNavigationForBusiness(id, enabledModuleSlugs, primaryBusiness.category);

      for (const item of navItems) {
        const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
        const matchValue = item.match || item.href;
        mainItems.push({
          href: item.href,
          icon: IconComp,
          label: item.label,
          match: matchValue,
        });
      }

      // Add "Add Features" link at the end
      mainItems.push({
        href: `/dashboard/business/${id}/add-features`,
        icon: Sparkles,
        label: "Add Features",
        match: "/add-features",
      });

      groups.push({ items: mainItems });
    } else {
      // Global fallback if no primary business selected
      mainItems.push({ href: "/dashboard", icon: LayoutDashboard, key: "sidebar.overview", match: "/dashboard$" });
      mainItems.push({ href: "/dashboard/business", icon: Store, key: "dashboard.businesses", match: "/dashboard/business$" });
      mainItems.push({ href: "/dashboard/qr-codes", icon: QrCode, key: "sidebar.qrcodes", match: "/dashboard/qr-codes" });
      mainItems.push({ href: "/dashboard/analytics", icon: BarChart3, key: "sidebar.analytics", match: "/dashboard/analytics" });
      mainItems.push({ href: "/dashboard/settings", icon: Settings, key: "sidebar.settings", match: "/dashboard/settings" });
      groups.push({ items: mainItems });
    }

    return groups;
  };

  const sidebarItems = getSidebarItems();

  const isActive = (item: SidebarItem) => {
    const match = item.match;
    if (match.endsWith('$')) {
      return pathname === match.slice(0, -1);
    }
    return pathname.includes(match);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-[#E2E8F0] transform transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:z-auto`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:shadow-md group-hover:shadow-indigo-200 transition-shadow">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#0F172A] leading-none">MeuQR</span>
                <SubscriptionBadge tier={primaryBusiness?.subscription_tier} />
              </div>
              <span className="block text-[10px] text-[#64748B] font-medium leading-none mt-1">Business OS</span>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-4">
          {sidebarItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.title && (
                <div className="px-3.5 mb-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    {group.title}
                  </span>
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item);
                const label = item.label ?? (item.key ? t(item.key) : "");
                return (
                  <Link
                    key={`${label}-${item.href}`}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? "text-indigo-600" : ""}`} />
                    <span>{label}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E2E8F0] bg-white/50">
          <div className="flex items-center justify-center mb-3">
            <LanguageSelector
              currentLang={lang}
              onLanguageChange={setLang}
              variant="minimal"
              size="sm"
            />
          </div>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[#F8FAFC]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {user?.email?.split("@")[0] || "Usuário"}
              </p>
              <p className="text-[10px] text-[#64748B] font-extrabold tracking-wider uppercase">
                {primaryBusiness?.subscription_tier === "business" || primaryBusiness?.subscription_tier === "premium"
                  ? "Premium"
                  : primaryBusiness?.subscription_tier === "pro" || primaryBusiness?.subscription_tier === "starter"
                  ? "Starter"
                  : "Free"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title={t("logout")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [primaryBusiness, setPrimaryBusiness] = useState<{ id: string, category: string, subscription_tier?: string } | null>(null);
  const [enabledModuleSlugs, setEnabledModuleSlugs] = useState<string[]>([]);
  const params = useParams();

  // Fetch enabled modules for the current business
  useEffect(() => {
    const bizId = params?.id as string | undefined;
    if (!bizId || bizId === 'undefined') {
      setEnabledModuleSlugs([]);
      return;
    }

    supabase
      .from("business_enabled_modules")
      .select("module_id, modules(slug)")
      .eq("business_id", bizId)
      .eq("enabled", true)
      .then(({ data }) => {
        if (data) {
          const slugs: string[] = [];
          for (const row of data) {
            // row.modules can be the joined object { slug: string } or null
            const mod = row as any;
            if (mod.modules?.slug) {
              slugs.push(mod.modules.slug);
            }
          }
          setEnabledModuleSlugs(slugs);
        }
      });
  }, [params?.id]);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled) return;
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // If we are looking at a specific business (e.g. /dashboard/business/[id])
      const routeBusinessId = params?.id as string | undefined;

      // Query all businesses owned by this user to safely match client-side
      const { data: businesses, error } = await supabase
        .from("businesses")
        .select("id, category, subscription_tier")
        .eq("owner_id", user.id);

      if (cancelled) return;

      if (error || !businesses || businesses.length === 0) {
        router.push("/onboarding");
        return;
      }

      if (routeBusinessId && routeBusinessId !== "undefined") {
        const matched = businesses.find((b) => b.id === routeBusinessId);
        if (!matched) {
          // If the user owns other businesses but requested an invalid/unowned ID, redirect to dashboard overview
          router.push("/dashboard");
          return;
        }
        setPrimaryBusiness(matched);
      } else {
        // Default to the first business owned by the user
        setPrimaryBusiness(businesses[0]);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        router.push("/login");
      }
    });

    return () => { cancelled = true; };
  }, [router, params?.id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p suppressHydrationWarning className="text-sm font-medium text-[#64748B]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <DashboardSidebar
        user={user}
        pathname={pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        primaryBusiness={primaryBusiness}
        enabledModuleSlugs={enabledModuleSlugs}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[#0F172A]">MeuQR</span>
          </Link>
          <NotificationBell />
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 text-sm text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">{t("sidebar.home")}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#fff",
            border: "1px solid #E2E8F0",
            color: "#0F172A",
            fontSize: "14px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          },
        }}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </I18nProvider>
  );
}
