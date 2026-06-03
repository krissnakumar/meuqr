"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Eye, 
  QrCode, 
  MessageCircle, 
  Download, 
  Share2, 
  ShoppingCart, 
  ClipboardList, 
  Calendar, 
  UserPlus, 
  BarChart3, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Store
} from "lucide-react";
import { Button, GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getModulesForVertical } from "@meuqr/shared";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  subscription_tier: string;
  is_active: boolean;
}

export default function BusinessDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stats & Lists
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [newQuotesCount, setNewQuotesCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  
  // Analytics
  const [viewsCount, setViewsCount] = useState(0);
  const [whatsappClicks, setWhatsappClicks] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  // QR details
  const [qrCode, setQrCode] = useState<any>(null);

  useEffect(() => {
    if (businessId) {
      loadDashboardData();
    }
  }, [businessId]);

  async function loadDashboardData() {
    try {
      // 1. Fetch business
      const { data: biz, error: bizError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (bizError || !biz) {
        toast.error("Estabelecimento não encontrado.");
        return;
      }
      setBusiness(biz);

      // 2. Fetch main QR Code
      const { data: qrs } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .limit(1);
      if (qrs && qrs.length > 0) {
        setQrCode(qrs[0]);
      }

      // 3. Fetch today's orders
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", startOfDay.toISOString());
      setTodayOrdersCount(ordersCount || 0);

      // 4. Fetch quote requests count
      const { count: quotesCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);
      setNewQuotesCount(quotesCount || 0);

      // 5. Fetch upcoming appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "pending")
        .order("appointment_date", { ascending: true })
        .limit(3);
      setUpcomingAppointments(appointments || []);

      // 6. Fetch new leads count
      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);
      setNewLeadsCount(leadsCount || 0);

      // 7. Simple Analytics Calculations
      // Scan count is cached on qr_codes
      const scans = qrs?.[0]?.scan_count || 0;
      setViewsCount(scans);

      // Query WhatsApp clicks
      const { count: clicks } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .eq("qr_code_id", qrs?.[0]?.id || "")
        .eq("click_type", "whatsapp");
      setWhatsappClicks(clicks || 0);

      const rate = scans > 0 ? Math.round(((clicks || 0) / scans) * 100) : 0;
      setConversionRate(rate);

    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadQR = () => {
    if (!qrCode) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `${origin}/r/${qrCode.short_code}`
    )}`;
    window.open(qrUrl, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!business?.whatsapp) {
      toast.error("Por favor, configure o número do WhatsApp comercial primeiro.");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = encodeURIComponent(
      `Confira a página oficial de *${business.name}* no MeuQR: ${origin}/${business.slug}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-[#64748B]">Carregando estatísticas do painel...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#0F172A]">Negócio Não Encontrado</h2>
        <Link href="/dashboard" className="text-sm text-indigo-600 mt-2 inline-block font-semibold">
          Voltar para Home do Dashboard
        </Link>
      </div>
    );
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicPageUrl = `${originUrl}/${business.slug}`;
  const enabledModules = getModulesForVertical(business.category);

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* 1. Header Overview & Branding */}
      <GlassCard className="relative overflow-hidden border-[#E2E8F0] shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        <GlassCardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 shadow-inner">
                {business.logo_url ? (
                  <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Store className="w-8 h-8 text-indigo-600" />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{business.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant="indigo" className="text-[10px] font-bold py-0.5 px-2.5 rounded-full capitalize">
                    {business.category.replace(/_/g, " ")}
                  </Badge>
                  <a 
                    href={publicPageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>{publicPageUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {business.whatsapp ? (
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700 shadow-sm shadow-emerald-50">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp Conectado
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 rounded-xl border border-amber-100 text-xs font-bold text-amber-700 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Sem WhatsApp
                </div>
              )}
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="border-[#E2E8F0] shadow-sm">
          <GlassCardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Acessos à Página</p>
              <h3 className="text-2xl font-black text-[#0F172A] mt-1">{viewsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Eye className="w-5 h-5" />
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="border-[#E2E8F0] shadow-sm">
          <GlassCardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Cliques no WhatsApp</p>
              <h3 className="text-2xl font-black text-[#0F172A] mt-1">{whatsappClicks}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <MessageCircle className="w-5 h-5" />
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="border-[#E2E8F0] shadow-sm">
          <GlassCardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Taxa de Conversão</p>
              <h3 className="text-2xl font-black text-[#0F172A] mt-1">{conversionRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* 3. Main Dashboard Body: Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Dynamic Activity & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Orders Alert Card */}
          {enabledModules.includes("orders") && (
            <GlassCard className="border-[#E2E8F0] shadow-sm">
              <GlassCardHeader className="pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#0F172A]" />
                  <GlassCardTitle className="text-sm font-bold text-[#0F172A]">Pedidos de Hoje</GlassCardTitle>
                </div>
                <Badge variant={todayOrdersCount > 0 ? "indigo" : "muted"}>
                  {todayOrdersCount} novos
                </Badge>
              </GlassCardHeader>
              <GlassCardContent>
                {todayOrdersCount > 0 ? (
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Você recebeu novos pedidos hoje pelo cardápio! Vá para o painel de pedidos para gerenciá-los.
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#94A3B8]">Nenhum pedido recebido hoje ainda.</p>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link 
                    href={`/dashboard/business/${businessId}/orders`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Ver todos os pedidos</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Quotes Alert Card */}
          {enabledModules.includes("quote_requests") && (
            <GlassCard className="border-[#E2E8F0] shadow-sm">
              <GlassCardHeader className="pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#0F172A]" />
                  <GlassCardTitle className="text-sm font-bold text-[#0F172A]">Solicitações de Orçamento</GlassCardTitle>
                </div>
                <Badge variant={newQuotesCount > 0 ? "indigo" : "muted"}>
                  {newQuotesCount} pendentes
                </Badge>
              </GlassCardHeader>
              <GlassCardContent>
                {newQuotesCount > 0 ? (
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Existem clientes aguardando resposta de orçamento para materiais/serviços.
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#94A3B8]">Nenhum orçamento pendente.</p>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link 
                    href={`/dashboard/business/${businessId}/quote-requests`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Gerenciar orçamentos</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Appointments Alert Card */}
          {enabledModules.includes("appointments") && (
            <GlassCard className="border-[#E2E8F0] shadow-sm">
              <GlassCardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0F172A]" />
                  <GlassCardTitle className="text-sm font-bold text-[#0F172A]">Próximos Agendamentos</GlassCardTitle>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingAppointments.map((app) => (
                      <div key={app.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                        <div>
                          <p className="font-bold text-[#0F172A]">{app.customer_name}</p>
                          <p className="text-[10px] text-[#64748B] mt-0.5">{app.appointment_date} às {app.start_time}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 capitalize">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#94A3B8]">Nenhum agendamento agendado.</p>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100">
                  <Link 
                    href={`/dashboard/business/${businessId}/appointments`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Ver agenda completa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Leads Alert Card */}
          {enabledModules.includes("leads") && (
            <GlassCard className="border-[#E2E8F0] shadow-sm">
              <GlassCardHeader className="pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#0F172A]" />
                  <GlassCardTitle className="text-sm font-bold text-[#0F172A]">Novos Leads</GlassCardTitle>
                </div>
                <Badge variant={newLeadsCount > 0 ? "indigo" : "muted"}>
                  {newLeadsCount} contatos
                </Badge>
              </GlassCardHeader>
              <GlassCardContent>
                {newLeadsCount > 0 ? (
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Você possui novos leads capturados de campanhas ou da sua página pública.
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#94A3B8]">Sem novos leads no momento.</p>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link 
                    href={`/dashboard/business/${businessId}/leads`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Visualizar leads</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
        </div>

        {/* Right Side: QR Code & Quick Actions */}
        <div className="space-y-6">
          {/* QR Code Card */}
          <GlassCard className="border-[#E2E8F0] shadow-sm text-center">
            <GlassCardHeader className="pb-2">
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-[#0F172A]" />
                <GlassCardTitle className="text-sm font-bold text-[#0F172A]">Código QR do Estabelecimento</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              {qrCode ? (
                <>
                  <div className="w-36 h-36 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner overflow-hidden p-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `${originUrl}/r/${qrCode.short_code}`
                      )}`} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-[#94A3B8] max-w-[200px] mx-auto leading-relaxed">
                    Escanear este código leva o cliente direto para o seu catálogo ou cardápio.
                  </p>
                </>
              ) : (
                <p className="text-xs text-[#94A3B8]">Carregando QR Code principal...</p>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Quick Actions Card */}
          <GlassCard className="border-[#E2E8F0] shadow-sm">
            <GlassCardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F172A]" />
                <GlassCardTitle className="text-sm font-bold text-[#0F172A]">Ações Rápidas</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="grid grid-cols-1 gap-2.5">
              <Link href={`/dashboard/business/${businessId}/products`}>
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#475569]">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  Adicionar Produto / Serviço
                </Button>
              </Link>

              <Link href={`/dashboard/business/${businessId}/pages`}>
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#475569]">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  Criar Página QR
                </Button>
              </Link>

              <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#475569]">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  Visualizar Página Pública
                </Button>
              </a>

              <button 
                onClick={handleShareWhatsApp}
                className="w-full flex items-center gap-3 px-3 h-10 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-[#475569] transition-colors"
              >
                <Share2 className="w-4 h-4 text-indigo-500" />
                Compartilhar Link no WhatsApp
              </button>

              <button 
                onClick={handleDownloadQR}
                className="w-full flex items-center gap-3 px-3 h-10 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-[#475569] transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                Baixar Código QR (PDF/Imagem)
              </button>
            </GlassCardContent>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
