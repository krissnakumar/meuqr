"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Badge } from "@meuqr/ui";
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Leads</h1>
          <p className="text-sm text-gray-500">
            {leads.length} lead(s) recebido(s)
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              {search ? "Nenhum lead encontrado" : "Nenhum lead recebido"}
            </h3>
            <p className="text-sm text-gray-500">
              {search
                ? "Tente alterar sua busca."
                : "Os contatos dos clientes que preencherem o formulário aparecerão aqui."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#111827]">{lead.name}</h3>
                      {lead.source && (
                        <Badge variant="muted" className="text-[10px]">
                          {lead.source}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 hover:text-[#00C853]"
                        >
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone}`}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-[#00C853]"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                      <span>
                        {new Date(lead.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {lead.message && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          Mensagem
                        </div>
                        {lead.message}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
