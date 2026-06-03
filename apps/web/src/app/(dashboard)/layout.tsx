"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ErrorBoundary } from "@meuqr/ui";
import { Toaster } from "sonner";
import { Menu, QrCode } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { I18nProvider, useTranslation } from "@/lib/i18n-provider";
import { NotificationBell } from "@/components/NotificationBell";
import { getNavigationForBusiness } from "@meuqr/shared";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { isModuleEnabled } from "@/lib/modules";

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

  // Route Guard Effect to block access to unauthorized modules
  useEffect(() => {
    if (loading || !primaryBusiness) return;

    const parts = pathname.split("/");
    const isBusinessRoute = parts[1] === "dashboard" && parts[2] === "business" && parts[3] === primaryBusiness.id;
    const rawSlug = parts[4];

    if (isBusinessRoute && rawSlug) {
      const routeToModuleMap: Record<string, string> = {
        "quote-requests": "quote_requests",
        "qr": "qr_codes",
        "media": "media_library",
        "setup": "settings",
        "whatsapp": "whatsapp_actions",
      };
      const moduleKey = routeToModuleMap[rawSlug] || rawSlug;

      const modulesToRestrict = [
        "products", "services", "menu", "appointments", "orders", 
        "quote_requests", "leads", "patients", "courses", 
        "hotel_concierge", "loyalty", "coupons"
      ];

      if (modulesToRestrict.includes(moduleKey)) {
        const enabled = isModuleEnabled(primaryBusiness.category, moduleKey);
        if (!enabled) {
          router.replace(`/dashboard/business/${primaryBusiness.id}/unauthorized`);
        }
      }
    }
  }, [pathname, primaryBusiness, loading, router]);

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

  const navigationItems = primaryBusiness
    ? getNavigationForBusiness(primaryBusiness.id, enabledModuleSlugs, primaryBusiness.category)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        primaryBusiness={primaryBusiness}
        navigationItems={navigationItems}
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
