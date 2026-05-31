"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Badge } from "@meuqr/ui";
import {
  Users,
  ArrowLeft,
  Loader2,
  Calendar,
  Phone,
  Mail,
  ShoppingBag,
  FileText,
  MessageSquare,
  QrCode,
  Save,
  Edit,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
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

interface TimelineItem {
  id: string;
  type: "order" | "quote" | "lead" | "interaction";
  title: string;
  message: string;
  status?: string;
  meta?: any;
  created_at: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const businessId = params.id as string;
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [businessId, clientId]);

  async function loadClientData() {
    setLoading(true);
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("business_id", businessId)
        .maybeSingle();

      if (clientErr) throw clientErr;
      if (!clientData) {
        toast.error("Cliente não encontrado.");
        router.push(`/dashboard/business/${businessId}/clients`);
        return;
      }

      setClient(clientData);
      setNotesText(clientData.notes || "");

      const timelineEvents: TimelineItem[] = [];

      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .eq("client_id", clientId);

      orders?.forEach((o) => {
        timelineEvents.push({
          id: o.id,
          type: "order",
          title: "Pedido Recebido",
          message: `Pedido de R$ ${o.total.toFixed(2)} registrado com status: ${o.status}.`,
          status: o.status,
          meta: { orderId: o.id },
          created_at: o.created_at,
        });
      });

      const { data: quotes } = await supabase
        .from("quote_requests")
        .select("id, items, created_at")
        .eq("client_id", clientId);

      quotes?.forEach((q) => {
        const itemCount = Array.isArray(q.items) ? q.items.length : 1;
        timelineEvents.push({
          id: q.id,
          type: "quote",
          title: "Orçamento Solicitado",
          message: `Solicitação de orçamento contendo ${itemCount} item(ns).`,
          meta: { quoteId: q.id },
          created_at: q.created_at,
        });
      });

      const { data: leads } = await supabase
        .from("leads")
        .select("id, message, source, created_at")
        .eq("client_id", clientId);

      leads?.forEach((l) => {
        timelineEvents.push({
          id: l.id,
          type: "lead",
          title: "Formulário de Contato",
          message: l.message || "Cliente enviou uma mensagem de lead no catálogo.",
          status: l.source,
          meta: { leadId: l.id },
          created_at: l.created_at,
        });
      });

      const { data: notifications } = await supabase
        .from("notifications")
        .select("id, type, title, message, created_at")
        .eq("client_id", clientId);

      notifications?.forEach((n) => {
        if (!n.type.includes("new_order") && !n.type.includes("new_quote") && !n.type.includes("new_lead")) {
          timelineEvents.push({
            id: n.id,
            type: "interaction",
            title: n.title,
            message: n.message,
            status: n.type,
            created_at: n.created_at,
          });
        }
      });

      timelineEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTimeline(timelineEvents);
    } catch (err) {
      console.error("Failed to load client timeline:", err);
      toast.error("Erro ao carregar detalhes do cliente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({ notes: notesText })
        .eq("id", clientId);

      if (error) throw error;

      setClient(prev => prev ? { ...prev, notes: notesText } : null);
      setEditingNotes(false);
      toast.success("Anotações salvas com sucesso!");
    } catch (err) {
      console.error("Failed to save client notes:", err);
      toast.error("Erro ao salvar anotações.");
    } finally {
      setSavingNotes(false);
    }
  }

  function getTimelineIcon(type: string, status?: string) {
    const cls = "w-5 h-5 text-white";
    if (type === "order") return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-200"><ShoppingBag className={cls} /></div>;
    if (type === "quote") return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-200"><FileText className={cls} /></div>;
    if (type === "lead") return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-200"><MessageSquare className={cls} /></div>;
    if (status?.includes("qr")) return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200"><QrCode className={cls} /></div>;
    if (status?.includes("whatsapp")) return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-200"><Phone className={cls} /></div>;
    return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-200"><Clock className={cls} /></div>;
  }

  function getSourceBadge(source: string) {
    switch (source) {
      case "qr": return <Badge variant="indigo">QR Code</Badge>;
      case "whatsapp": return <Badge variant="emerald">WhatsApp</Badge>;
      case "manual": return <Badge variant="rose">Manual</Badge>;
      default: return <Badge variant="indigo">Catálogo / Menu</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}/clients`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Base de Clientes
      </Link>

      {/* Profile Card */}
      <GlassCard>
        <GlassCardContent className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-indigo-200">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{client.name}</h1>
                {getSourceBadge(client.source)}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {client.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl text-indigo-600">
            <UserCheck className="w-4 h-4 mr-1" />
            Cliente desde: {new Date(client.created_at).toLocaleDateString()}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard>
          <GlassCardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Pedidos</p>
              <p className="text-2xl font-bold text-slate-800">{client.total_orders}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orçamentos</p>
              <p className="text-2xl font-bold text-slate-800">{client.total_quote_requests}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <GlassCardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Último Acesso</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(client.last_seen_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Ação: <span className="font-bold text-indigo-500 capitalize">{client.last_interaction_type?.replace(/_/g, " ") || "Nenhuma"}</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Main Layout: Timeline + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Timeline de Interações
          </h3>

          {timeline.length === 0 ? (
            <GlassCard>
              <GlassCardContent className="py-12 text-center text-gray-400">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium">Nenhuma atividade registrada para este cliente.</p>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 ml-4 space-y-6 pb-4">
              {timeline.map((item) => (
                <div key={item.id} className="relative flex gap-4 items-start animate-fade-in group">
                  <div className="absolute -left-[53px] top-0.5 z-10 shrink-0">
                    {getTimelineIcon(item.type, item.status)}
                  </div>

                  <GlassCard className="flex-1 transition-all group-hover:shadow-md">
                    <GlassCardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{item.title}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{item.message}</p>
                        </div>

                        {item.type === "order" && (
                          <Link href={`/dashboard/business/${businessId}/orders`} className="shrink-0">
                            <div className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-400 hover:text-indigo-600 transition-all cursor-pointer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        )}
                        {item.type === "quote" && (
                          <Link href={`/dashboard/business/${businessId}/quote-requests`} className="shrink-0">
                            <div className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-400 hover:text-indigo-600 transition-all cursor-pointer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        )}
                        {item.type === "lead" && (
                          <Link href={`/dashboard/business/${businessId}/leads`} className="shrink-0">
                            <div className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-400 hover:text-indigo-600 transition-all cursor-pointer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        )}
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <GlassCard className="bg-gradient-to-br from-amber-50/30 to-amber-50/10 border-amber-100/30">
            <GlassCardHeader className="pb-3 border-b border-amber-100/30">
              <GlassCardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Anotações do Cliente
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="pt-4">
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white resize-none transition-all"
                    placeholder="Adicione observações internas sobre este cliente..."
                  />
                  <div className="flex gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotesText(client.notes || "");
                        setEditingNotes(false);
                      }}
                      className="flex-1 text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Salvar</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.notes ? (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {client.notes}
                    </p>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-xs font-medium">Nenhuma anotação adicionada.</p>
                      <button
                        onClick={() => setEditingNotes(true)}
                        className="text-xs text-indigo-500 hover:text-indigo-600 font-bold mt-2 cursor-pointer block mx-auto"
                      >
                        Escrever anotação
                      </button>
                    </div>
                  )}
                  {!editingNotes && client.notes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
