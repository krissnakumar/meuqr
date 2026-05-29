"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@meuqr/ui";
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

const sidebarItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/dashboard/business", icon: Store, label: "Negócios" },
  { href: "/dashboard/qr-codes", icon: QrCodeIcon, label: "QR Codes" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Assinatura" },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    });
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
      {/* ===== Sidebar ===== */}
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
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
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
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#E4E6EB]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-sm font-medium text-[#1877F2]">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#050505] truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400">Grátis</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Overlay ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <div className="flex-1 min-w-0">
        {/* Top bar (mobile) */}
        <header className="h-16 bg-white border-b border-[#E4E6EB] flex items-center justify-between px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
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

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
