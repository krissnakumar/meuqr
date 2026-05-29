"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, ErrorBoundary, LanguageSelector } from "@meuqr/ui";
import type { Language } from "@meuqr/shared";
import { Toaster } from "sonner";
import {
  QrCode,
  LayoutDashboard,
  Store,
  QrCode as QrCodeIcon,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { I18nProvider, useTranslation } from "@/lib/i18n-provider";

const sidebarItems = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/dashboard/business", icon: Store, key: "business" },
  { href: "/dashboard/qr-codes", icon: QrCodeIcon, key: "qrcodes" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "analytics" },
  { href: "/dashboard/billing", icon: CreditCard, key: "billing" },
  { href: "/dashboard/settings", icon: Settings, key: "settings" },
];

function DashboardSidebar({ user, pathname, sidebarOpen, setSidebarOpen, handleLogout }: {
  user: User | null;
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
}) {
  const { t, lang, setLang } = useTranslation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E4E6EB] transform transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:static lg:z-auto`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E4E6EB]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#050505]">MeuQR</span>
        </Link>
        <button
          className="lg:hidden p-1 pointer-events-auto cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const label = t(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#1877F2] text-white font-medium shadow-sm shadow-[#1877F2]/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-[#050505]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#E4E6EB]">
        <div className="flex items-center justify-center mb-2">
          <LanguageSelector
            currentLang={lang}
            onLanguageChange={setLang}
            variant="minimal"
            size="sm"
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-sm font-medium text-[#1877F2]">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#050505] truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-400">{t("free_plan")}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            title={t("logout")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled) return;
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (!cancelled) {
        if (!businesses || businesses.length === 0) {
          router.push("/onboarding");
        } else {
          setLoading(false);
        }
      }
    }).catch(() => {
      if (!cancelled) {
        router.push("/login");
      }
    });

    return () => { cancelled = true; };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      <DashboardSidebar
        user={user}
        pathname={pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-[#E4E6EB] flex items-center justify-between px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#050505]">MeuQR</span>
          </Link>
          <div className="w-10" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
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
            border: "1px solid #E4E6EB",
            color: "#050505",
            fontSize: "14px",
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
      <DashboardContent>{children}</DashboardContent>
    </I18nProvider>
  );
}

