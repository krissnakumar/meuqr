"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  QrCode,
  FileText,
  Plus,
  Eye,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Save,
  ShoppingCart,
  Users,
  MessageSquare,
  BarChart3,
  ClipboardList,
  ChevronRight,
  Store,
} from "lucide-react";

interface BusinessFull {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  subscription_tier: string;
  is_active: boolean;
  default_language?: string;
}

const PHASE15_SQL = `-- ============================================
-- MeuQR - Phase 15 Notifications System Migration
-- ============================================

-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL CHECK (source IN ('menu', 'qr', 'whatsapp', 'manual')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_interaction_type TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_quote_requests INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone)
);

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'push', 'email', 'whatsapp', 'system')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Device Push Tokens Table
CREATE TABLE IF NOT EXISTS device_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  expo_push_token TEXT NOT NULL,
  device_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, expo_push_token)
);

-- 4. Alter existing tables to connect to clients
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 5. Add notification settings to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notification_settings JSONB NOT NULL DEFAULT '{
  "notify_qr_scan": true,
  "notify_whatsapp_click": true,
  "notify_new_order": true,
  "notify_quote_request": true,
  "notify_lead": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "quiet_hours_enabled": false,
  "notification_language": "pt-BR",
  "push_enabled": true,
  "email_enabled": false,
  "whatsapp_enabled": false
}'::jsonb;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_push_tokens ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- 7.1 Clients Policies
CREATE POLICY "Business members and owners can view their clients" ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = clients.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = clients.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business members and owners can manage their clients" ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = clients.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = clients.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- 7.2 Notifications Policies
CREATE POLICY "Business members and owners can view notifications for their business" ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = notifications.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = notifications.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business members and owners can update notifications for their business" ON notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = notifications.business_id
      AND business_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = notifications.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- 7.3 Device Push Tokens Policies
CREATE POLICY "Users can manage their own device push tokens" ON device_push_tokens
  FOR ALL
  USING (user_id = auth.uid());

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user_id ON device_push_tokens(user_id);`;

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<BusinessFull | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalQuoteRequests, setTotalQuoteRequests] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [notifSettings, setNotifSettings] = useState<any>(null);
  const [savingNotifSettings, setSavingNotifSettings] = useState(false);
  const [migrationMissing, setMigrationMissing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Inline Page Edit States
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageSlug, setEditPageSlug] = useState("");
  const [savingPage, setSavingPage] = useState(false);

  // Business Edit States
  const [editingInfo, setEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLang, setEditLang] = useState("pt-BR");
  const [savingInfo, setSavingInfo] = useState(false);

  // New Page State
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [creatingPage, setCreatingPage] = useState(false);

  function generateShortCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function handleCreatePage() {
    if (!newPageTitle || !newPageSlug) {
      toast.error("Título e link são obrigatórios!");
      return;
    }
    setCreatingPage(true);
    try {
      const slugVal = newPageSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const { data: page, error } = await supabase
        .from("pages")
        .insert({
          business_id: businessId,
          title: newPageTitle,
          slug: slugVal,
          is_published: true,
          seo_title: `${business?.name} - ${newPageTitle}`,
        })
        .select()
        .single();

      if (error) {
        toast.error("Erro ao criar página: " + error.message);
        return;
      }

      // Generate a QR code automatically for this page
      const shortCode = generateShortCode();
      const { data: qr } = await supabase
        .from("qr_codes")
        .insert({
          business_id: businessId,
          page_id: page.id,
          short_code: shortCode,
          title: `${business?.name} - ${newPageTitle}`,
          is_active: true,
        })
        .select()
        .single();

      toast.success("Página e QR Code criados!");
      setPages([page, ...pages]);
      if (qr) setQrCodes([qr, ...qrCodes]);
      setShowAddPage(false);
      setNewPageTitle("");
      setNewPageSlug("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar.");
    } finally {
      setCreatingPage(false);
    }
  }

  async function handleSavePage(pageId: string) {
    if (!editPageTitle || !editPageSlug) {
      toast.error("Título e link são obrigatórios!");
      return;
    }
    setSavingPage(true);
    try {
      const slugVal = editPageSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase
        .from("pages")
        .update({
          title: editPageTitle,
          slug: slugVal,
        })
        .eq("id", pageId);

      if (error) {
        toast.error("Erro ao salvar alterações: " + error.message);
        return;
      }

      setPages(pages.map((p) => (p.id === pageId ? { ...p, title: editPageTitle, slug: slugVal } : p)));
      setEditingPageId(null);
      toast.success("Menu atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar.");
    } finally {
      setSavingPage(false);
    }
  }

  async function handleDeletePage(pageId: string) {
    if (!confirm("Tem certeza que deseja excluir este menu? Todos os itens e QR codes associados serão excluídos permanentemente.")) return;
    try {
      const { error } = await supabase.from("pages").delete().eq("id", pageId);
      if (error) {
        toast.error("Erro ao excluir: " + error.message);
        return;
      }
      setPages(pages.filter((p) => p.id !== pageId));
      setQrCodes(qrCodes.filter((q) => q.page_id !== pageId));
      setEditingPageId(null);
      toast.success("Menu excluído com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir.");
    }
  }



  const startEditInfo = () => {
    if (!business) return;
    setEditName(business.name);
    setEditWhatsapp(business.whatsapp || "");
    setEditInstagram(business.instagram || "");
    setEditSlug(business.slug);
    setEditDescription(business.description || "");
    setEditLang(business.default_language || "pt-BR");
    setEditingInfo(true);
  };

  async function handleSaveInfo() {
    if (!editName || !editSlug) {
      toast.error("Nome e Link são obrigatórios!");
      return;
    }
    setSavingInfo(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          name: editName,
          whatsapp: editWhatsapp || null,
          instagram: editInstagram || null,
          slug: editSlug,
          description: editDescription || null,
          default_language: editLang,
        })
        .eq("id", businessId);

      if (error) {
        toast.error("Erro ao atualizar informações: " + error.message);
        return;
      }

      setBusiness((prev: any) => prev ? {
        ...prev,
        name: editName,
        whatsapp: editWhatsapp || null,
        instagram: editInstagram || null,
        slug: editSlug,
        description: editDescription || null,
        default_language: editLang,
      } : null);

      toast.success("Informações do negócio atualizadas!");
      setEditingInfo(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar.");
    } finally {
      setSavingInfo(false);
    }
  }

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: bizPages } = await supabase
        .from("pages")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      const { data: bizQrs } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      // Load counts for management nav
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: membersCount } = await supabase
        .from("business_members")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: quotesCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      // Load all sections for these pages
      const pageIds = bizPages?.map((p) => p.id) || [];
      let bizSections: any[] = [];
      if (pageIds.length > 0) {
        const { data: secs } = await supabase
          .from("sections")
          .select("*")
          .in("page_id", pageIds)
          .order("sort_order");
        bizSections = secs || [];
      }

      const isSettingsMissing = biz && !("notification_settings" in biz);
      setMigrationMissing(isSettingsMissing);

      setBusiness(biz);
      setPages(bizPages || []);
      setQrCodes(bizQrs || []);
      setSections(bizSections);
      setTotalOrders(ordersCount || 0);
      setTotalLeads(leadsCount || 0);
      setTotalMembers(membersCount || 0);
      setTotalQuoteRequests(quotesCount || 0);
      setTotalClients(clientsCount || 0);
      setNotifSettings(biz?.notification_settings || {
        notify_qr_scan: true,
        notify_whatsapp_click: true,
        notify_new_order: true,
        notify_quote_request: true,
        notify_lead: true,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        quiet_hours_enabled: false,
        notification_language: "pt-BR",
        push_enabled: true,
        email_enabled: false,
        whatsapp_enabled: false
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness() {
    if (!confirm("Tem certeza que deseja excluir este negócio?")) return;
    const { error } = await supabase.from("businesses").delete().eq("id", businessId);
    if (error) {
      toast.error("Erro ao excluir negócio");
      return;
    }
    toast.success("Negócio excluído");
    router.push("/dashboard");
  }

  async function handleSaveNotifSettings(updatedSettings: any) {
    setSavingNotifSettings(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          notification_settings: updatedSettings
        })
        .eq("id", businessId);

      if (error) {
        toast.error("Erro ao salvar configurações de notificações: " + error.message);
        return;
      }

      setNotifSettings(updatedSettings);
      toast.success("Configurações de notificações atualizadas!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSavingNotifSettings(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Negócio não encontrado</p>
        <Link href="/dashboard" className="text-[#00C853] hover:underline mt-2 block">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Migration Warning Banner */}
      {migrationMissing && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 backdrop-blur-sm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Atualização de Banco de Dados Necessária 🛠️
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed max-w-2xl">
              Seu banco de dados remoto precisa de uma atualização de esquema para habilitar os recursos da Phase 15 (Alertas em Tempo Real e o CRM de Clientes). Copie o script SQL e execute-o no Editor SQL do painel do Supabase.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end shrink-0">
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(PHASE15_SQL);
                toast.success("Script SQL copiado com sucesso!");
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              Copiar SQL
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSqlModal(true)}
              className="border-amber-200 bg-white hover:bg-amber-100 text-amber-800 font-bold text-xs"
            >
              Ver Script
            </Button>
          </div>
        </div>
      )}

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-lg">Migração de Notificações & CRM (Phase 15)</h3>
                <p className="text-xs text-gray-500 mt-0.5">Execute este SQL no painel Supabase → SQL Editor para completar a instalação.</p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto bg-slate-900 text-slate-250 font-mono text-xs select-all rounded-b-xl border-x border-slate-950">
              <pre className="whitespace-pre">{PHASE15_SQL}</pre>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSqlModal(false)}
                className="text-xs bg-white"
              >
                Fechar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(PHASE15_SQL);
                  toast.success("Script SQL copiado com sucesso!");
                }}
                className="bg-[#00C853] hover:bg-[#00B34A] text-white text-xs font-bold shadow-md shadow-[#00C853]/10"
              >
                Copiar SQL
              </Button>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Painel
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[#111827]/5 flex items-center justify-center overflow-hidden">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl font-bold text-[#111827]">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{business.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="muted">{business.category.replace("_", " ")}</Badge>
              <Badge variant={business.subscription_tier === "free" ? "outline" : "accent"}>
                {business.subscription_tier}
              </Badge>
              <Link
                href={`/${business.slug}`}
                target="_blank"
                className="text-xs text-gray-400 hover:text-[#00C853] flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ver página
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/business/${businessId}/setup`}>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nova Página
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={deleteBusiness} className="text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Combined Pages & QR Codes Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <CardTitle className="text-lg font-bold text-[#111827]">Menus e Páginas</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">Gerencie seus menus e seus códigos QR gerados automaticamente</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddPage(!showAddPage)} className="h-8 text-xs cursor-pointer">
                  {showAddPage ? "Fechar" : <><Plus className="w-3.5 h-3.5 mr-1" /> Novo Menu</>}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Inline Form: Add Page */}
                {showAddPage && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 space-y-4 animate-fade-in">
                    <h4 className="font-bold text-sm text-gray-800">Criar Novo Menu</h4>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 block">Título do Menu / Página *</label>
                      <input
                        type="text"
                        value={newPageTitle}
                        onChange={(e) => {
                          setNewPageTitle(e.target.value);
                          setNewPageSlug(e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-"));
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] bg-white"
                        placeholder="Ex: Cardápio Principal, Menu Executivo"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 block">Link de Acesso *</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">meuqr.com.br/{business.slug}/</span>
                        <input
                          type="text"
                          value={newPageSlug}
                          onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] bg-white"
                          placeholder="cardapio-verao"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowAddPage(false)} className="flex-1 cursor-pointer">
                        Cancelar
                      </Button>
                      <Button variant="accent" size="sm" onClick={handleCreatePage} disabled={creatingPage} className="flex-1 cursor-pointer">
                        {creatingPage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Criar Página"}
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-gray-200/50 text-center">
                      <p className="text-xs text-gray-400">
                        Prefere começar a partir de modelos prontos?{" "}
                        <Link href={`/dashboard/business/${businessId}/setup`} className="text-[#00C853] font-semibold hover:underline">
                          Usar Modelos Onboarding
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                {/* Combined List */}
                <div className="space-y-4">
                  {pages.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 animate-fade-in">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-gray-700 mb-1">Nenhum menu criado ainda</h3>
                      <p className="text-xs text-gray-400 mb-4">Crie um cardápio ou página de links para o seu negócio e o QR Code será gerado na hora.</p>
                      <Button variant="accent" size="sm" onClick={() => setShowAddPage(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Criar Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Tree Root Node: The Business itself */}
                      <div className="flex items-center gap-3 mb-5 bg-gray-50 border border-gray-100 rounded-xl p-3 animate-fade-in animate-fade-in">
                        <div className="w-9 h-9 rounded-lg bg-[#00C853]/10 flex items-center justify-center shrink-0">
                          <Store className="w-5 h-5 text-[#00C853]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">{business?.name}</h4>
                          <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Negócio Principal</p>
                        </div>
                        {pages.length === 1 && business?.slug && (
                          <Link href={`/${business.slug}`} target="_blank" className="ml-auto">
                            <button className="h-8 px-3 rounded-lg border border-[#00C853]/25 bg-[#00C853]/5 hover:bg-[#00C853]/10 text-[#00C853] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visualizar</span>
                            </button>
                          </Link>
                        )}
                      </div>

                      {/* Tree Branches: The Pages/Menus with curved connection lines */}
                      <div className="relative pl-6 border-l-2 border-dashed border-gray-200/85 space-y-4">
                        {pages.map((page, index) => {
                          const qr = qrCodes.find((q) => q.page_id === page.id);
                          const isLast = index === pages.length - 1;
                          return (
                            <div key={page.id} className="relative group animate-fade-in">
                              {/* Horizontal connector line to the child row */}
                              <div className="absolute -left-[26px] top-6 w-[26px] h-0.5 border-t-2 border-dashed border-gray-200/85" />
                              
                              {/* Mask to cut off the vertical dashed line on the last item */}
                              {isLast && (
                                <div className="absolute -left-[26px] top-[26px] w-2 h-40 bg-white" />
                              )}

                              <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all shadow-sm group-hover:shadow-md">
                                  <div className="flex items-center gap-3">
                                    {/* Expand/Collapse Chevron if page has sections */}
                                    {sections.some(s => s.page_id === page.id) && (
                                      <button
                                        onClick={() => setExpandedPages(prev => ({ ...prev, [page.id]: !prev[page.id] }))}
                                        className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer text-gray-400 hover:text-gray-700 shrink-0"
                                        title="Expandir/Recolher Seções do Menu"
                                      >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${!!expandedPages[page.id] ? "rotate-90 text-[#00C853]" : ""}`} />
                                      </button>
                                    )}

                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${page.is_published ? "bg-[#00C853]" : "bg-gray-300"}`} />
                                    <div className="min-w-0">
                                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{page.title}</h4>
                                      <p className="text-xs text-gray-400 mt-0.5">/{page.slug}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center flex-wrap gap-2.5">
                                    {/* Linked QR Code Indicator */}
                                    {qr ? (
                                      <Link
                                        href={`/dashboard/business/${businessId}/qr/${qr.id}`}
                                        className="w-8 h-8 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-all cursor-pointer"
                                        title={`Personalizar QR Code (${qr.scan_count} scans)`}
                                      >
                                        <QrCode className="w-4 h-4" />
                                      </Link>
                                    ) : (
                                      <button
                                        onClick={async () => {
                                          const shortCode = generateShortCode();
                                          const { data } = await supabase.from("qr_codes").insert({
                                            business_id: businessId,
                                            page_id: page.id,
                                            short_code: shortCode,
                                            title: `${business?.name} - ${page.title}`,
                                            is_active: true
                                          }).select().single();
                                          if (data) {
                                            setQrCodes([data, ...qrCodes]);
                                            toast.success("QR Code gerado para a página!");
                                          }
                                        }}
                                        className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
                                        title="Gerar QR Code para esta página"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-auto">
                                      <button
                                        onClick={() => {
                                          if (editingPageId === page.id) {
                                            setEditingPageId(null);
                                          } else {
                                            setEditingPageId(page.id);
                                            setEditPageTitle(page.title);
                                            setEditPageSlug(page.slug);
                                          }
                                        }}
                                        className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                          editingPageId === page.id
                                            ? "border-[#00C853] bg-[#00C853]/5 text-[#00C853]"
                                            : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                        <span>Editar</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Inline Collapsible Edit Form */}
                                {editingPageId === page.id && (
                                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-2 mb-4 space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-bold text-sm text-gray-800">Editar Menu / Página</h4>
                                      <button onClick={() => setEditingPageId(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold text-gray-500 block">Título do Menu / Página *</label>
                                      <input
                                        type="text"
                                        value={editPageTitle}
                                        onChange={(e) => {
                                          setEditPageTitle(e.target.value);
                                          setEditPageSlug(e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-"));
                                        }}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] bg-white"
                                        placeholder="Ex: Cardápio Principal"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold text-gray-500 block">Link de Acesso *</label>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-400">meuqr.com.br/{business.slug}/</span>
                                        <input
                                          type="text"
                                          value={editPageSlug}
                                          onChange={(e) => setEditPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] bg-white"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                                      <button
                                        onClick={() => handleSavePage(page.id)}
                                        disabled={savingPage}
                                        className="h-8 px-3 rounded-lg bg-[#00C853] hover:bg-[#00C853]/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>{savingPage ? "Salvando..." : "Salvar"}</span>
                                      </button>

                                      {/* Option to manage items separately */}
                                      <Link href={`/dashboard/business/${businessId}/pages/${page.id}`}>
                                        <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                          <span>Itens do Catálogo (Seções)</span>
                                        </button>
                                      </Link>

                                      {/* Dangerous Delete option */}
                                      <button
                                        onClick={() => handleDeletePage(page.id)}
                                        className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Excluir</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Nested Sections/Menus Tree Branches */}
                                {!!expandedPages[page.id] && sections.filter(s => s.page_id === page.id).length > 0 && (
                                  <div className="relative pl-8 mt-2 space-y-2 border-l border-dashed border-gray-200 ml-5 pb-1">
                                    {sections.filter(s => s.page_id === page.id).map((sec, secIndex, arr) => {
                                      const isLastSec = secIndex === arr.length - 1;
                                      return (
                                        <div key={sec.id} className="relative flex items-center justify-between p-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-lg transition-all animate-fade-in group">
                                          {/* Sub-branch horizontal indicator line */}
                                          <div className="absolute -left-[32px] top-4.5 w-[32px] h-0.5 border-t border-dashed border-gray-200" />
                                          
                                          {/* Mask to cut off the sub-vertical line */}
                                          {isLastSec && (
                                            <div className="absolute -left-[32px] top-[18px] w-2 h-10 bg-white" />
                                          )}

                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-indigo-50/50 flex items-center justify-center shrink-0">
                                              <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                                            </div>
                                            <div>
                                              <span className="text-xs font-bold text-gray-700">{sec.name}</span>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {/* Open separate menu in page editor */}
                                            <Link href={`/dashboard/business/${businessId}/pages/${page.id}`}>
                                              <button className="h-6 px-2 rounded bg-white hover:bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-650 transition-all flex items-center gap-1 cursor-pointer">
                                                <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                                                <span>Abrir separado</span>
                                              </button>
                                            </Link>
                                            {/* Visualizar only on the separate submenus */}
                                            {business?.slug && (
                                              <Link href={`/${business.slug}#${sec.id}`} target="_blank">
                                                <button className="h-6 px-2 rounded border border-[#00C853]/25 bg-[#00C853]/5 hover:bg-[#00C853]/10 text-[#00C853] text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer">
                                                  <Eye className="w-2.5 h-2.5" />
                                                  <span>Visualizar</span>
                                                </button>
                                              </Link>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Right: Business Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Informações</CardTitle>
              {!editingInfo && (
                <Button variant="ghost" size="icon" onClick={startEditInfo} className="h-8 w-8 cursor-pointer">
                  <Edit3 className="w-4 h-4 text-gray-500 hover:text-black" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="text-sm">
              {editingInfo ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Nome do Negócio *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent bg-gray-50"
                      placeholder="Ex: Minha Loja"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Link personalizado *</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">meuqr.com.br/</span>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent bg-gray-50"
                        placeholder="minha-loja"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">WhatsApp</label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent bg-gray-50"
                      placeholder="Ex: 5511999999999"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Instagram</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent bg-gray-50"
                      placeholder="Ex: @minhaloja"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Idioma de Onboarding / Templates</label>
                    <select
                      value={editLang}
                      onChange={(e) => setEditLang(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent bg-gray-50"
                    >
                      <option value="pt-BR">🇧🇷 Português (pt-BR)</option>
                      <option value="en">🇺🇸 English (en)</option>
                      <option value="es">🇪🇸 Español (es)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Descrição</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent bg-gray-50 resize-none"
                      placeholder="Fale um pouco sobre a sua empresa..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button variant="outline" size="sm" onClick={() => setEditingInfo(false)} className="flex-1 cursor-pointer">
                      Cancelar
                    </Button>
                    <Button variant="accent" size="sm" onClick={handleSaveInfo} disabled={savingInfo} className="flex-1 cursor-pointer">
                      {savingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-xs block">WhatsApp:</span>
                    <p className="text-[#111827] font-medium">{business.whatsapp || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Instagram:</span>
                    <p className="text-[#111827] font-medium">{business.instagram || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Slug / Link de Acesso:</span>
                    <p className="text-[#00C853] font-medium font-mono text-xs">/{business.slug}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Idioma Principal:</span>
                    <p className="text-[#111827] font-medium uppercase font-mono text-xs">
                      {business.default_language || "pt-BR"}
                    </p>
                  </div>
                  {business.description && (
                    <div>
                      <span className="text-gray-400 text-xs block">Descrição:</span>
                      <p className="text-[#111827] leading-relaxed text-xs">{business.description}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          {notifSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações de Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                
                {/* Channels */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Canais</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.push_enabled}
                      onChange={(e) => handleSaveNotifSettings({ ...notifSettings, push_enabled: e.target.checked })}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853] w-4 h-4"
                    />
                    <span>Notificações Push no App Mobile</span>
                  </label>
                </div>

                {/* Events to notify */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Eventos Ativos</h4>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.notify_new_order}
                      onChange={(e) => handleSaveNotifSettings({ ...notifSettings, notify_new_order: e.target.checked })}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853] w-4 h-4"
                    />
                    <span>Novos Pedidos do Cardápio</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.notify_quote_request}
                      onChange={(e) => handleSaveNotifSettings({ ...notifSettings, notify_quote_request: e.target.checked })}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853] w-4 h-4"
                    />
                    <span>Novas Solicitações de Orçamento</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.notify_lead}
                      onChange={(e) => handleSaveNotifSettings({ ...notifSettings, notify_lead: e.target.checked })}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853] w-4 h-4"
                    />
                    <span>Novos Contatos / Leads</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.notify_qr_scan}
                      onChange={(e) => handleSaveNotifSettings({ ...notifSettings, notify_qr_scan: e.target.checked })}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853] w-4 h-4"
                    />
                    <span>Escaneamento de QR Code</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.notify_whatsapp_click}
                      onChange={(e) => handleSaveNotifSettings({ ...notifSettings, notify_whatsapp_click: e.target.checked })}
                      className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853] w-4 h-4"
                    />
                    <span>Cliques em WhatsApp</span>
                  </label>
                </div>

                {/* Quiet Hours */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Horário de Silêncio</h4>
                    <label className="flex items-center gap-1 text-xs cursor-pointer text-gray-500">
                      <input
                        type="checkbox"
                        checked={notifSettings.quiet_hours_enabled}
                        onChange={(e) => handleSaveNotifSettings({ ...notifSettings, quiet_hours_enabled: e.target.checked })}
                        className="rounded border-gray-350 text-[#00C853] focus:ring-[#00C853] w-3 h-3"
                      />
                      <span>Ativar</span>
                    </label>
                  </div>

                  {notifSettings.quiet_hours_enabled && (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold block">Início</label>
                        <input
                          type="time"
                          value={notifSettings.quiet_hours_start}
                          onChange={(e) => handleSaveNotifSettings({ ...notifSettings, quiet_hours_start: e.target.value })}
                          className="w-full text-xs rounded border border-gray-200 p-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold block">Fim</label>
                        <input
                          type="time"
                          value={notifSettings.quiet_hours_end}
                          onChange={(e) => handleSaveNotifSettings({ ...notifSettings, quiet_hours_end: e.target.value })}
                          className="w-full text-xs rounded border border-gray-200 p-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Language */}
                <div className="space-y-1.5 pt-2 border-t border-gray-50">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Idioma dos Alertas</h4>
                  <select
                    value={notifSettings.notification_language}
                    onChange={(e) => handleSaveNotifSettings({ ...notifSettings, notification_language: e.target.value })}
                    className="w-full text-xs rounded border border-gray-200 p-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#00C853] cursor-pointer"
                  >
                    <option value="pt-BR">Português (pt-BR)</option>
                    <option value="en">English (en)</option>
                    <option value="es">Español (es)</option>
                  </select>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                <Link
                  href={`/dashboard/business/${businessId}/analytics`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Analytics</p>
                      <p className="text-xs text-gray-400">Scans, cliques e métricas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/orders`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Pedidos</p>
                      <p className="text-xs text-gray-400">Gerenciar pedidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalOrders > 0 && (
                      <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        {totalOrders}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/leads`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Leads</p>
                      <p className="text-xs text-gray-400">Contatos recebidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalLeads > 0 && (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {totalLeads}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/members`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Equipe</p>
                      <p className="text-xs text-gray-400">Membros e permissões</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalMembers > 0 && (
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {totalMembers}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/quote-requests`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Orçamentos</p>
                      <p className="text-xs text-gray-400">Solicitações de clientes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalQuoteRequests > 0 && (
                      <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        {totalQuoteRequests}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>

                <Link
                  href={`/dashboard/business/${businessId}/clients`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Clientes</p>
                      <p className="text-xs text-gray-400">Base de clientes e timeline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalClients > 0 && (
                      <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {totalClients}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Link href={`/dashboard/business/${businessId}/setup`}>
                <Button variant="default" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Página usando Modelo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
