"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  X,
  QrCode,
  Bell,
  FileText,
  Package,
  Users,
  Calendar,
  Utensils,
  Truck,
  DollarSign,
  HeartPulse,
  Crown,
  Zap,
  MessageSquare,
  Star,
  UserPlus,
  Sparkles,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useTranslation } from "@/lib/i18n-provider";
import { LanguageSelector } from "@meuqr/ui";
import { isModuleEnabled } from "@/lib/modules";

// Map icon strings from navigation config to actual Lucide components
const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  FileText,
  QrCode,
  Image: Package,
  MessageSquare,
  Users,
  BarChart3,
  MessageCircle: MessageSquare,
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
  Megaphone: Sparkles,
  Gift: Sparkles,
  TicketPercent: Sparkles,
  UsersRound: Users,
  UserCheck: Users,
  HeartPulse,
  Stethoscope: HeartPulse,
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

// Portuguese translation overrides for modules to keep the dashboard localized
const PT_MODULE_LABELS: Record<string, string> = {
  overview: "Painel Geral",
  pages: "Páginas QR",
  qr_codes: "QR Codes",
  media_library: "Galeria de Fotos",
  inbox: "Mensagens (Inbox)",
  customers: "Clientes & Leads",
  analytics: "Métricas",
  whatsapp_actions: "WhatsApp",
  reviews: "Avaliações",
  settings: "Configurações",
  billing: "Faturamento",
  products: "Produtos",
  services: "Serviços",
  menu: "Cardápio Digital",
  appointments: "Agendamentos",
  orders: "Pedidos",
  quote_requests: "Orçamentos",
  leads: "Leads",
  patients: "Pacientes",
  courses: "Cursos / Aulas",
  hotel_concierge: "Portaria & Quartos",
  loyalty: "Fidelidade",
  coupons: "Cupons de Desconto",
};

interface SidebarProps {
  user: User | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
  primaryBusiness: { id: string; category: string; subscription_tier?: string } | null;
  navigationItems: any[];
}

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
      <span>Gratis</span>
    </div>
  );
}

export function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
  primaryBusiness,
  navigationItems,
}: SidebarProps) {
  const pathname = usePathname();
  const { t, lang, setLang } = useTranslation();

  const getFilteredItems = () => {
    if (!primaryBusiness) {
      return [
        { href: "/dashboard", icon: LayoutDashboard, label: "Painel Geral", match: "/dashboard$" },
        { href: "/dashboard/business", icon: Store, label: "Negócios", match: "/dashboard/business$" },
        { href: "/dashboard/qr-codes", icon: QrCode, label: "QR Codes", match: "/dashboard/qr-codes" },
        { href: "/dashboard/analytics", icon: BarChart3, label: "Relatórios", match: "/dashboard/analytics" },
        { href: "/dashboard/settings", icon: Settings, label: "Ajustes", match: "/dashboard/settings" },
      ];
    }

    const filtered: any[] = [];
    const category = primaryBusiness.category;

    for (const item of navigationItems) {
      const slug = item.module_slug;

      // Check if module is allowed for the active business category
      if (slug && !isModuleEnabled(category, slug)) {
        continue;
      }

      const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
      const label = PT_MODULE_LABELS[slug] || item.label || slug;

      filtered.push({
        href: item.href,
        icon: IconComp,
        label,
        match: item.match || item.href,
      });
    }

    // Add "Add Features" link at the end (translated)
    filtered.push({
      href: `/dashboard/business/${primaryBusiness.id}/add-features`,
      icon: Sparkles,
      label: "Adicionar Recursos",
      match: "/add-features",
    });

    return filtered;
  };

  const menuItems = getFilteredItems();

  const isActive = (item: any) => {
    const match = item.match;
    if (match.endsWith("$")) {
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

        <nav className="p-3 space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-indigo-600" : ""}`} />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
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
                  : "Gratis"}
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
