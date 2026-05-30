"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  Search,
  UserPlus,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
}

export default function LeadsPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setBusiness(biz);
      setLeads(leadsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir lead");
      return;
    }
    setLeads(leads.filter((l) => l.id !== id));
    toast.success("Lead excluído");
  }

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
            <p className="text-sm text-gray-400">{leads.length} lead(s) recebido(s)</p>
          </div>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {search ? "Nenhum lead encontrado" : "Nenhum lead recebido"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {search
                ? "Tente alterar sua busca."
                : "Os contatos dos clientes que preencherem o formulário aparecerão aqui."}
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((lead) => (
            <GlassCard key={lead.id} className="group-hover:shadow-md transition-all">
              <GlassCardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-indigo-200">
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                      <h3 className="font-bold text-slate-800">{lead.name}</h3>
                      {lead.source && (
                        <Badge variant="indigo">{lead.source}</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 ml-10">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone}`}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                      <span className="text-gray-300">
                        {new Date(lead.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    {lead.message && (
                      <div className="mt-3 ml-10 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-100 text-sm text-gray-600">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          <MessageSquare className="w-3 h-3" />
                          Mensagem
                        </div>
                        {lead.message}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 ml-3"
                    title="Excluir lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
