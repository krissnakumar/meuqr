"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";

import {
  Loader2,
  ArrowLeft,
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Sparkles,
  Tag,
  Star,
  UserPlus,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  tags: string[];
  source: string;
  last_interaction_at: string | null;
  total_visits: number;
  total_spent: number;
  created_at: string;
}

// ─── Source config ───────────────────────────────────────

const sourceConfig: Record<string, { label: string; classes: string; badgeVariant: "indigo" | "emerald" | "rose" | "amber" | "default" }> = {
  manual: { label: "Manual", classes: "from-rose-50 to-pink-50 border-rose-200 text-rose-600", badgeVariant: "rose" },
  qr: { label: "QR Code", classes: "from-indigo-50 to-violet-50 border-indigo-200 text-indigo-600", badgeVariant: "indigo" },
  whatsapp: { label: "WhatsApp", classes: "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600", badgeVariant: "emerald" },
  appointment: { label: "Agendamento", classes: "from-indigo-50 to-violet-50 border-indigo-200 text-indigo-600", badgeVariant: "indigo" },
  order: { label: "Pedido", classes: "from-amber-50 to-orange-50 border-amber-200 text-amber-600", badgeVariant: "amber" },
  contact_form: { label: "Formulário", classes: "from-purple-50 to-fuchsia-50 border-purple-200 text-purple-600", badgeVariant: "indigo" },
  quote_request: { label: "Orçamento", classes: "from-teal-50 to-emerald-50 border-teal-200 text-teal-600", badgeVariant: "emerald" },
};

const defaultSourceConfig = {
  label: "Cliente",
  classes: "from-slate-50 to-gray-50 border-slate-200 text-slate-600",
  badgeVariant: "indigo" as const,
};

function getSourceConfig(source: string) {
  return sourceConfig[source] || defaultSourceConfig;
}

// ─── Time helper ─────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} sem`;
  return date.toLocaleDateString("pt-BR");
}

// ─── Currency formatter ──────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ─── Page Component ──────────────────────────────────────

export default function CustomersPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, whatsapp")
        .eq("id", businessId)
        .single();

      const { data: customersData } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId)
        .order("last_interaction_at", { ascending: false, nullsFirst: false });

      setBusiness(biz);
      setCustomers(customersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Stats ──────────────────────────────────────────────

  const stats = {
    total: customers.length,
    totalVisits: customers.reduce((sum, c) => sum + c.total_visits, 0),
    totalSpent: customers.reduce((sum, c) => sum + c.total_spent, 0),
    activeThisWeek: customers.filter((c) => {
      if (!c.last_interaction_at) return false;
      const diff = Date.now() - new Date(c.last_interaction_at).getTime();
      return diff < 7 * 86400000;
    }).length,
  };

  // ── Filters ────────────────────────────────────────────

  const filtered = customers.filter((customer) => {
    if (sourceFilter !== "all" && customer.source !== sourceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matches =
        customer.name.toLowerCase().includes(q) ||
        (customer.phone && customer.phone.includes(q)) ||
        (customer.email && customer.email.toLowerCase().includes(q)) ||
        (customer.tags && customer.tags.some((t) => t.toLowerCase().includes(q)));
      if (!matches) return false;
    }
    return true;
  });

  // ── Source types for filter dropdown ───────────────────

  const sourceTypes = Array.from(new Set(customers.map((c) => c.source)));

  // ── Loading state ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando clientes...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
            <p className="text-sm text-gray-400">
              Gerencie seus clientes e acompanhe o relacionamento
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" />
          {customers.length} cliente(s)
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Users, gradient: "from-indigo-500 to-violet-500", bg: "from-indigo-50 to-violet-50", textColor: "text-indigo-600" },
          { label: "Visitas", value: stats.totalVisits, icon: UserPlus, gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", textColor: "text-blue-600" },
          { label: "Gasto Total", value: formatCurrency(stats.totalSpent), icon: DollarSign, gradient: "from-emerald-500 to-green-500", bg: "from-emerald-50 to-green-50", textColor: "text-emerald-600" },
          { label: "Ativos (7d)", value: stats.activeThisWeek, icon: Star, gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50", textColor: "text-amber-600" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{stat.value}</p>
                <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Search & Filters */}
      <GlassCard>
        <GlassCardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone, email ou tags..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          {sourceTypes.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 h-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="all">Todas as origens</option>
                {sourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {getSourceConfig(type).label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Customers Grid */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {search || sourceFilter !== "all"
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente registrado"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {search || sourceFilter !== "all"
                ? "Tente alterar os filtros ou a busca."
                : "Os clientes que interagirem com seu negócio aparecerão aqui automaticamente."}
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer, idx) => {
            const src = getSourceConfig(customer.source);

            return (
              <Link
                key={customer.id}
                href={`/dashboard/business/${businessId}/customers/${customer.id}`}
                className="block group"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <GlassCardContent className="p-5 flex flex-col h-full">
                    {/* Header: Avatar + Source Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <Badge variant={src.badgeVariant} className="shrink-0">
                        {src.label}
                      </Badge>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                      {customer.name}
                    </h3>

                    {/* Contact info */}
                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      {customer.phone && (
                        <a
                          href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {customer.phone}
                        </a>
                      )}
                      {customer.email && (
                        <a
                          href={`mailto:${customer.email}`}
                          className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Tags */}
                    {customer.tags && customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {customer.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium border border-indigo-100"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Visitas
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                          {customer.total_visits}
                        </p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Gasto
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                          {formatCurrency(customer.total_spent)}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-gray-400 border-t border-slate-50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {customer.last_interaction_at
                          ? `Última: ${formatDate(customer.last_interaction_at)}`
                          : "Sem interações"}
                      </span>
                      <span className="font-medium text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center">
                        Detalhes
                        <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
