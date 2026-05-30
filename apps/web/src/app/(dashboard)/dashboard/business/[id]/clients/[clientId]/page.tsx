"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@meuqr/ui";
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
  CheckCircle2,
  Edit,
  Save,
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
  const businessId = params.id as string;
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notes edit state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [businessId, clientId]);

  async function loadClientData() {
    setLoading(true);
    try {
      // 1. Fetch client details
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

      // 2. Fetch all activities to build timeline
      const timelineEvents: TimelineItem[] = [];

      // Fetch Orders
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

      // Fetch Quote Requests
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

      // Fetch Leads
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

      // Fetch Notifications related to this client (captures WhatsApp clicks, QR Scans, checkout, etc.)
      const { data: notifications } = await supabase
        .from("notifications")
        .select("id, type, title, message, created_at")
        .eq("client_id", clientId);
      
      notifications?.forEach((n) => {
        // Exclude new_order, new_quote, new_lead since they are fetched directly above to avoid duplication
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

      // Sort timeline chronologically (newest first)
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
    if (type === "order") return <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center shrink-0"><ShoppingBag className={cls} /></div>;
    if (type === "quote") return <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0"><FileText className={cls} /></div>;
    if (type === "lead") return <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0"><MessageSquare className={cls} /></div>;
    
    // Custom interactions
    if (status?.includes("qr")) return <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><QrCode className={cls} /></div>;
    if (status?.includes("whatsapp")) return <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><Phone className={cls} /></div>;
    return <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0"><Clock className={cls} /></div>;
  }

  function getSourceBadge(source: string) {
    switch (source) {
      case "qr": return <Badge className="bg-indigo-100 text-indigo-700">QR Code</Badge>;
      case "whatsapp": return <Badge className="bg-emerald-100 text-emerald-700">WhatsApp</Badge>;
      case "manual": return <Badge className="bg-gray-100 text-gray-700">Manual</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-700">Catálogo / Menu</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
        <p className="text-sm font-medium text-gray-500">Carregando timeline do cliente...</p>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* Back Button and profile header */}
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}/clients`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Base de Clientes
        </Link>

        {/* Profile Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-black shrink-0">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#050505]">{client.name}</h1>
                {getSourceBadge(client.source)}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {client.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl">
            <UserCheck className="w-4 h-4 text-indigo-500 mr-1" />
            Cliente desde: {new Date(client.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Core Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Orders */}
        <Card className="border border-slate-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Pedidos</p>
              <p className="text-2xl font-black text-slate-800">{client.total_orders}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Quotes */}
        <Card className="border border-slate-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orçamentos</p>
              <p className="text-2xl font-black text-slate-800">{client.total_quote_requests}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        {/* Last Seen */}
        <Card className="border border-slate-100 shadow-sm col-span-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Último Acesso</p>
              <p className="text-sm font-extrabold text-slate-700">
                {new Date(client.last_seen_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Ação: <span className="font-bold text-indigo-500 capitalize">{client.last_interaction_type?.replace("_", " ") || "Nenhuma"}</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Split Layout: Timeline (left) & Notes Pad (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Feed (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1877F2]" />
            Timeline de Interações
          </h3>

          {timeline.length === 0 ? (
            <Card className="border border-slate-100 shadow-sm">
              <CardContent className="p-12 text-center text-gray-400">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium">Nenhuma atividade registrada para este cliente.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative pl-8 border-l-2 border-dashed border-slate-200 ml-4 space-y-8 pb-4">
              {timeline.map((item) => (
                <div key={item.id} className="relative flex gap-4 items-start animate-fade-in group">
                  
                  {/* Absolute Timeline Icon connector bullet */}
                  <div className="absolute -left-[53px] top-0.5 z-10 shrink-0">
                    {getTimelineIcon(item.type, item.status)}
                  </div>

                  {/* Activity Details Box */}
                  <div className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-4 flex-1 shadow-sm transition-all group-hover:shadow-md flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-800">{item.title}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* Timeline Deep Links */}
                    {item.type === "order" && (
                      <Link href={`/dashboard/business/${businessId}/orders`} className="shrink-0">
                        <button className="p-1.5 rounded-lg border border-slate-200 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all cursor-pointer flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    )}
                    {item.type === "quote" && (
                      <Link href={`/dashboard/business/${businessId}/quote-requests`} className="shrink-0">
                        <button className="p-1.5 rounded-lg border border-slate-200 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all cursor-pointer flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    )}
                    {item.type === "lead" && (
                      <Link href={`/dashboard/business/${businessId}/leads`} className="shrink-0">
                        <button className="p-1.5 rounded-lg border border-slate-200 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all cursor-pointer flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Pad Column (1/3 width) */}
        <div className="space-y-6">
          <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-amber-50/10 to-amber-50/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/60">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Anotações do Cliente
              </CardTitle>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-xs font-bold text-[#1877F2] hover:text-[#1877F2]/80 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] bg-white resize-none"
                    placeholder="Adicione observações internas sobre este cliente (Ex: prefere entrega aos sábados, orçamento pendente)..."
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
                      className="flex-1 text-xs bg-[#1877F2] hover:bg-[#166FE5] text-white"
                    >
                      {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Salvar</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.notes ? (
                    <p className="text-sm text-gray-650 whitespace-pre-wrap leading-relaxed">
                      {client.notes}
                    </p>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-xs font-semibold">Nenhuma anotação adicionada.</p>
                      <button
                        onClick={() => setEditingNotes(true)}
                        className="text-xs text-[#1877F2] hover:underline font-bold mt-2 cursor-pointer block mx-auto"
                      >
                        Escrever anotação
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
