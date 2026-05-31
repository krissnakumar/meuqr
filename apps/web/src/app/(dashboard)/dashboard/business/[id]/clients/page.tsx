"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Users,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Phone,
  Mail,
  ShoppingBag,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  source: "menu" | "qr" | "whatsapp" | "manual";
  last_seen_at: string;
  last_interaction_type: string | null;
  total_orders: number;
  total_quote_requests: number;
  notes: string | null;
  created_at: string;
}

export default function ClientsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (biz) setBusinessName(biz.name);

      const { data: clientsData, error } = await supabase
        .from("clients")
        .select("*")
        .eq("business_id", businessId)
        .order("last_seen_at", { ascending: false });

      if (error) throw error;
      setClients(clientsData || []);
    } catch (err) {
      console.error("Failed to load clients:", err);
      toast.error("Erro ao carregar base de clientes.");
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchSource = sourceFilter === "all" || client.source === sourceFilter;

    return matchSearch && matchSource;
  });

  function getSourceBadge(source: string) {
    switch (source) {
      case "qr": return <Badge variant="indigo">QR Code</Badge>;
      case "whatsapp": return <Badge variant="emerald">WhatsApp</Badge>;
      case "manual": return <Badge variant="rose">Manual</Badge>;
      default: return <Badge variant="indigo">Catálogo / Menu</Badge>;
    }
  }

  function getSourceIcon(source: string) {
    switch (source) {
      case "qr": return "🔲";
      case "whatsapp": return "💬";
      case "manual": return "✍️";
      default: return "📋";
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('business.loading_clients')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Back + Header */}
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Users className="w-5 h-5 text-white" />
              </div>
              Base de Clientes
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie a base de clientes do catálogo <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {clients.length} clientes registrados
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard>
        <GlassCardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 h-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
            >
              <option value="all">Todas as Origens</option>
              <option value="menu">Catálogo / Menu</option>
              <option value="qr">QR Codes</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum cliente encontrado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Experimente ajustar os filtros ou digitar outros termos de pesquisa.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client, idx) => (
            <Link
              key={client.id}
              href={`/dashboard/business/${businessId}/clients/${client.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md shadow-indigo-200">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      {getSourceBadge(client.source)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {client.name}
                      </h4>

                      <div className="space-y-1 mt-2 text-xs text-gray-500">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {client.phone}
                        </p>
                        {client.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 truncate" />
                            {client.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-slate-100 text-center">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        Pedidos
                      </p>
                      <p className="text-base font-bold text-slate-800">{client.total_orders}</p>
                    </div>
                    <div className="space-y-0.5 border-l border-slate-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" />
                        Orçamentos
                      </p>
                      <p className="text-base font-bold text-slate-800">{client.total_quote_requests}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(client.last_seen_at).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center">
                      Timeline
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
