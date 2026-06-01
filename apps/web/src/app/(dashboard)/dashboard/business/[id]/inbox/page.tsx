"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  MessageSquare,
  Calendar,
  ClipboardList,
  FileText,
  Star,
  ShoppingBag,
  CheckCheck,
  Archive,
  Search,
  Inbox,
  AlertCircle,
  ChevronDown,
  Clock,
  MessageCircle,
  Eye,
  Ban,
  User,
  Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface InboxItem {
  id: string;
  business_id: string;
  customer_id: string | null;
  source_type: string;
  source_id: string | null;
  title: string;
  message: string | null;
  status: "new" | "open" | "waiting" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Source type config ──────────────────────────────────

const sourceConfig: Record<string, { label: string; icon: any; gradient: string; iconBg: string; color: string }> = {
  contact_form: {
    label: "Formulário de Contato",
    icon: MessageSquare,
    gradient: "from-blue-500 to-indigo-500",
    iconBg: "from-blue-50 to-indigo-50",
    color: "text-blue-600",
  },
  appointment: {
    label: "Agendamento",
    icon: Calendar,
    gradient: "from-emerald-500 to-green-500",
    iconBg: "from-emerald-50 to-green-50",
    color: "text-emerald-600",
  },
  quote_request: {
    label: "Pedido de Orçamento",
    icon: ClipboardList,
    gradient: "from-teal-500 to-emerald-500",
    iconBg: "from-teal-50 to-emerald-50",
    color: "text-teal-600",
  },
  booking: {
    label: "Reserva",
    icon: Calendar,
    gradient: "from-purple-500 to-fuchsia-500",
    iconBg: "from-purple-50 to-fuchsia-50",
    color: "text-purple-600",
  },
  product_inquiry: {
    label: "Consulta de Produto",
    icon: ShoppingBag,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "from-amber-50 to-orange-50",
    color: "text-amber-600",
  },
  whatsapp_click: {
    label: "Clique no WhatsApp",
    icon: MessageCircle,
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "from-emerald-50 to-teal-50",
    color: "text-emerald-600",
  },
  review: {
    label: "Avaliação",
    icon: Star,
    gradient: "from-yellow-500 to-amber-500",
    iconBg: "from-yellow-50 to-amber-50",
    color: "text-yellow-600",
  },
  document_request: {
    label: "Solicitação de Documento",
    icon: FileText,
    gradient: "from-rose-500 to-pink-500",
    iconBg: "from-rose-50 to-pink-50",
    color: "text-rose-600",
  },
};

const defaultSourceConfig = {
  label: "Mensagem",
  icon: MessageSquare,
  gradient: "from-slate-500 to-gray-500",
  iconBg: "from-slate-50 to-gray-50",
  color: "text-slate-600",
};

function getSourceConfig(type: string) {
  return sourceConfig[type] || defaultSourceConfig;
}

// ─── Status config ───────────────────────────────────────

const statusConfig: Record<string, { label: string; classes: string }> = {
  new: { label: "Novo", classes: "text-blue-600 bg-blue-50 border-blue-200" },
  open: { label: "Aberto", classes: "text-amber-600 bg-amber-50 border-amber-200" },
  waiting: { label: "Aguardando", classes: "text-purple-600 bg-purple-50 border-purple-200" },
  resolved: { label: "Resolvido", classes: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  archived: { label: "Arquivado", classes: "text-slate-400 bg-slate-50 border-slate-200" },
};

// ─── Priority config ─────────────────────────────────────

const priorityConfig: Record<string, { label: string; icon: any; classes: string }> = {
  low: { label: "Baixa", icon: ChevronDown, classes: "text-slate-400" },
  normal: { label: "Normal", icon: Clock, classes: "text-blue-500" },
  high: { label: "Alta", icon: AlertCircle, classes: "text-amber-500" },
  urgent: { label: "Urgente", icon: AlertCircle, classes: "text-red-500" },
};

// ─── Relative time helper ────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays}d`;
  return date.toLocaleDateString("pt-BR");
}

// ─── Page Component ──────────────────────────────────────

export default function InboxPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [items, setItems] = useState<InboxItem[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, whatsapp")
        .eq("id", businessId)
        .single();

      const { data: inboxData } = await supabase
        .from("inbox_items")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setBusiness(biz);
      setItems(inboxData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateStatus(itemId: string, newStatus: string) {
    const { error } = await supabase
      .from("inbox_items")
      .update({ status: newStatus })
      .eq("id", itemId);

    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: newStatus as any } : i))
    );
    const label = statusConfig[newStatus]?.label || newStatus;
    toast.success(`Status alterado para "${label}"`);
  }

  // ── Stats ──────────────────────────────────────────────

  const stats = {
    total: items.length,
    new: items.filter((i) => i.status === "new").length,
    open: items.filter((i) => i.status === "open" || i.status === "waiting").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  // ── Filters ────────────────────────────────────────────

  const filtered = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (sourceFilter !== "all" && item.source_type !== sourceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matches =
        item.title.toLowerCase().includes(q) ||
        (item.message && item.message.toLowerCase().includes(q)) ||
        item.source_type.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  // ── Source types for filter dropdown ───────────────────

  const sourceTypes = Array.from(new Set(items.map((i) => i.source_type)));

  // ── Loading state ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando mensagens...</p>
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
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Caixa de Entrada</h1>
            <p className="text-sm text-gray-400">
              Todas as interações com clientes em um só lugar
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, gradient: "from-indigo-500 to-violet-500", bg: "from-indigo-50 to-violet-50", textColor: "text-indigo-600" },
          { label: "Novos", value: stats.new, gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", textColor: "text-blue-600" },
          { label: "Abertos", value: stats.open, gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50", textColor: "text-amber-600" },
          { label: "Resolvidos", value: stats.resolved, gradient: "from-emerald-500 to-green-500", bg: "from-emerald-50 to-green-50", textColor: "text-emerald-600" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                <span className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard>
        <GlassCardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, mensagem ou tipo..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Status tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "all", label: "Todas", count: stats.total },
              { key: "new", label: "Novas", count: stats.new },
              { key: "open", label: "Abertas", count: stats.open },
              { key: "resolved", label: "Resolvidas", count: stats.resolved },
              { key: "archived", label: "Arquivadas", count: items.filter((i) => i.status === "archived").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === tab.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Source type filter */}
          {sourceTypes.length > 1 && (
            <div className="flex items-center gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="all">Todos os tipos</option>
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

      {/* Inbox Feed */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {search || statusFilter !== "all" || sourceFilter !== "all"
                ? "Nenhum resultado encontrado"
                : "Caixa de entrada vazia"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {search || statusFilter !== "all" || sourceFilter !== "all"
                ? "Tente alterar os filtros ou a busca."
                : "As mensagens e interações dos seus clientes aparecerão aqui automaticamente."}
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const src = getSourceConfig(item.source_type);
            const SourceIcon = src.icon;
            const status = statusConfig[item.status] || statusConfig.new;
            const priority = priorityConfig[item.priority] || priorityConfig.normal;
            const PriorityIcon = priority.icon;

            return (
              <GlassCard key={item.id} className="relative overflow-hidden group transition-all">
                {/* Left color bar */}
                <div
                  className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                    item.status === "new"
                      ? "bg-blue-500"
                      : item.status === "open"
                      ? "bg-amber-500"
                      : item.status === "waiting"
                      ? "bg-purple-500"
                      : item.status === "resolved"
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                />

                <GlassCardContent className="p-4 sm:p-5 ml-2">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Content */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Row 1: Source icon + Type + Status + Priority + Time */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${src.iconBg} flex items-center justify-center shrink-0`}
                        >
                          <SourceIcon className={`w-3.5 h-3.5 ${src.color}`} />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          {src.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.classes}`}>
                          {status.label}
                        </span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${priority.classes}`}>
                          <PriorityIcon className="w-3 h-3" />
                          {priority.label}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {timeAgo(item.created_at)}
                        </span>
                      </div>

                      {/* Row 2: Title */}
                      <h3 className="text-sm font-bold text-slate-800 leading-snug">
                        {item.title}
                      </h3>

                      {/* Row 3: Message preview */}
                      {item.message && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>
                      )}

                      {/* Row 4: Customer link */}
                      {item.customer_id && (
                        <Link
                          href={`/dashboard/business/${businessId}/customers/${item.customer_id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                          <User className="w-3 h-3" />
                          Ver cliente
                        </Link>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      {/* WhatsApp */}
                      {business?.whatsapp && (
                        <a
                          href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                            `Olá! Recebi sua mensagem: "${item.title}". Como posso ajudar?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-all"
                          title="Responder no WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Mark as resolved */}
                      {item.status !== "resolved" && item.status !== "archived" && (
                        <button
                          onClick={() => updateStatus(item.id, "resolved")}
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-all"
                          title="Marcar como resolvido"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Mark as open (from resolved/archived) */}
                      {(item.status === "resolved" || item.status === "archived") && (
                        <button
                          onClick={() => updateStatus(item.id, "open")}
                          className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 hover:text-amber-700 transition-all"
                          title="Reabrir"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Archive */}
                      {item.status !== "archived" && (
                        <button
                          onClick={() => updateStatus(item.id, "archived")}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                          title="Arquivar"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Un-archive */}
                      {item.status === "archived" && (
                        <button
                          onClick={() => updateStatus(item.id, "open")}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                          title="Desarquivar"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
