"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Phone,
  Mail,
  Package,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface QuoteItem {
  name: string;
  quantity: number;
}

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: QuoteItem[];
  message: string | null;
  created_at: string;
}

export default function QuoteRequestsPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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

      const { data: quotesData } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setBusiness(biz);
      setQuotes(quotesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuote(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta solicitação?")) return;
    await supabase.from("quote_requests").delete().eq("id", id);
    setQuotes(quotes.filter((q) => q.id !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando orçamentos...</p>
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pedidos de Orçamento</h1>
          <p className="text-sm text-gray-400">{quotes.length} solicitação(ões)</p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum orçamento solicitado</h3>
            <p className="text-sm text-gray-400">As solicitações de orçamento dos clientes aparecerão aqui.</p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <GlassCard key={quote.id} className="overflow-hidden">
              <GlassCardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Customer Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-teal-200">
                        {quote.customer_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {quote.customer_name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {new Date(quote.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 ml-10 mb-3">
                      <a
                        href={`https://wa.me/${quote.customer_phone}`}
                        target="_blank"
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        {quote.customer_phone}
                      </a>
                      {quote.customer_email && (
                        <a
                          href={`mailto:${quote.customer_email}`}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {quote.customer_email}
                        </a>
                      )}
                    </div>

                    {/* Items Toggle */}
                    <button
                      onClick={() => setExpanded(expanded === quote.id ? null : quote.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors font-medium ml-10"
                    >
                      {expanded === quote.id ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <Package className="w-3 h-3" />
                      {Array.isArray(quote.items) ? quote.items.length : 0} item(ns)
                    </button>

                    {expanded === quote.id && Array.isArray(quote.items) && (
                      <div className="ml-10 mt-2 p-3 rounded-xl bg-gradient-to-br from-teal-50/30 to-emerald-50/30 border border-teal-100/30 space-y-1.5">
                        {quote.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">{item.name}</span>
                            <span className="text-gray-400 text-xs">
                              Qtd: {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message */}
                    {quote.message && (
                      <div className="ml-10 mt-2 p-3 rounded-xl bg-gradient-to-br from-indigo-50/30 to-blue-50/30 border border-indigo-100/30 text-sm text-gray-600">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          <MessageSquare className="w-3 h-3" />
                          Mensagem
                        </div>
                        {quote.message}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteQuote(quote.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 ml-4"
                    title="Excluir solicitação"
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
