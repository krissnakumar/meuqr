"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@meuqr/ui";
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

      <h1 className="text-2xl font-bold text-[#111827] mb-2">Pedidos de Orçamento</h1>
      <p className="text-gray-500 mb-8">{quotes.length} solicitação(ões)</p>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              Nenhum orçamento solicitado
            </h3>
            <p className="text-sm text-gray-500">
              As solicitações de orçamento dos clientes aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#111827]">
                        {quote.customer_name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date(quote.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <a
                        href={`https://wa.me/${quote.customer_phone}`}
                        target="_blank"
                        className="flex items-center gap-1 hover:text-[#00C853]"
                      >
                        <Phone className="w-3 h-3" />
                        {quote.customer_phone}
                      </a>
                      {quote.customer_email && (
                        <a
                          href={`mailto:${quote.customer_email}`}
                          className="flex items-center gap-1 hover:text-[#00C853]"
                        >
                          <Mail className="w-3 h-3" />
                          {quote.customer_email}
                        </a>
                      )}
                    </div>

                    {/* Items */}
                    <button
                      onClick={() =>
                        setExpanded(expanded === quote.id ? null : quote.id)
                      }
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#111827] mb-2"
                    >
                      <Package className="w-3 h-3" />
                      {Array.isArray(quote.items) ? quote.items.length : 0} item(ns)
                      {expanded !== quote.id && (
                        <span className="text-gray-300"> (clique para ver)</span>
                      )}
                    </button>

                    {expanded === quote.id && Array.isArray(quote.items) && (
                      <div className="mb-3 p-3 rounded-lg bg-gray-50 space-y-1">
                        {quote.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">{item.name}</span>
                            <span className="text-gray-400 text-xs">
                              Qtd: {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {quote.message && (
                      <div className="p-3 rounded-lg bg-blue-50 text-sm text-gray-600">
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          Mensagem
                        </div>
                        {quote.message}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteQuote(quote.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0 ml-4"
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
