"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@meuqr/ui";
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
  MessageSquare,
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
  const router = useRouter();
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
      // Fetch business details
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      
      if (biz) setBusinessName(biz.name);

      // Fetch clients scoped to businessId
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

  // Filter clients locally
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
      case "qr": return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">QR Code</Badge>;
      case "whatsapp": return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">WhatsApp</Badge>;
      case "manual": return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Manual</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Catálogo / Menu</Badge>;
    }
  }

  function getInteractionLabel(type: string | null) {
    if (!type) return "—";
    switch (type) {
      case "qr_scan": return "Escaneou QR";
      case "item_view": return "Visualizou Item";
      case "whatsapp_click": return "Chamou no WhatsApp";
      case "checkout_started": return "Iniciou Checkout";
      case "checkout_completed": return "Finalizou Pedido";
      case "pix_copied": return "Copiou PIX";
      case "quote_requested": return "Pediu Orçamento";
      case "order_created": return "Enviou Pedido";
      case "lead_created": return "Preencheu Formulário";
      default: return type.replace("_", " ");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
        <p className="text-sm font-medium text-gray-500">Carregando base de clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Back button and page header */}
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#050505] flex items-center gap-2">
              <Users className="w-6.5 h-6.5 text-[#1877F2]" />
              <span>Base de Clientes</span>
            </h1>
            <p className="text-xs text-gray-400">
              Gerencie a base de clientes do catálogo <span className="font-bold text-slate-650">{businessName}</span>.
            </p>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            {clients.length} clientes registrados
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="border border-slate-100 shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md shrink-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1877F2] cursor-pointer"
            >
              <option value="all">Todas as Origens</option>
              <option value="menu">Catálogo / Menu</option>
              <option value="qr">QR Codes</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Base List Grid */}
      {filteredClients.length === 0 ? (
        <Card className="border border-slate-100 shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum cliente encontrado</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Experimente ajustar os filtros ou digitar outros termos de pesquisa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <Link key={client.id} href={`/dashboard/business/${businessId}/clients/${client.id}`} className="block group">
              <Card className="hover:shadow-md border border-slate-100 group-hover:border-[#1877F2]/30 transition-all duration-300 h-full relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1877F2] to-[#4094F7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 font-bold text-[#1877F2]">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      {getSourceBadge(client.source)}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#050505] text-base group-hover:text-[#1877F2] transition-colors line-clamp-1">
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

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-slate-50 text-center shrink-0">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        Pedidos
                      </p>
                      <p className="text-base font-black text-slate-800">{client.total_orders}</p>
                    </div>

                    <div className="space-y-0.5 border-l border-slate-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" />
                        Orçamentos
                      </p>
                      <p className="text-base font-black text-slate-800">{client.total_quote_requests}</p>
                    </div>
                  </div>

                  {/* Timeline summary */}
                  <div className="flex items-center justify-between text-xs text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Ativo: {new Date(client.last_seen_at).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-[#1877F2] group-hover:translate-x-0.5 transition-transform flex items-center">
                      Timeline
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
