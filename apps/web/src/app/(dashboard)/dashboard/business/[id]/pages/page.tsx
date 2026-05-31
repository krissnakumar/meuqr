"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import {
  Button,
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  Badge,
  Input
} from "@meuqr/ui";
import {
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  QrCode,
  Eye,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Utensils,
  Package,
  Calendar,
  ClipboardList,
  Phone,
  Layout,
  Home,
  Loader2,
  Sparkles,
  Globe,
  ChevronRight,
  Info,
  EyeOff,
  Smartphone,
  Share2,
  Check,
  HeartPulse
} from "lucide-react";

interface PageData {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  description: string | null;
  status: string;
  layout_type: string;
  show_in_navigation: boolean;
  navigation_label: string | null;
  sort_order: number;
  qr_code_id: string | null;
  created_at: string;
}

export default function PagesDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PagesDashboardContent />
    </Suspense>
  );
}

function PagesDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabFilter = searchParams.get("filter") || "all";
  const businessId = params.id as string;
  const { t } = useTranslation();

  const [business, setBusiness] = useState<any>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  // Wizard States
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Wizard Form values
  const [pageType, setPageType] = useState("custom");
  const [layoutType, setLayoutType] = useState("simple");
  const [mainTitle, setMainTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonAction, setButtonAction] = useState("whatsapp_order");
  const [buttonUrl, setButtonUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showInNavigation, setShowInNavigation] = useState(true);
  const [status, setStatus] = useState("published");
  const [navigationLabel, setNavigationLabel] = useState("");
  
  // Created page result
  const [createdPage, setCreatedPage] = useState<any>(null);
  const [createdQr, setCreatedQr] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const displayedPages = pages.filter(p => {
    if (activeTabFilter === "content") {
      return ["home", "appointments", "custom"].includes(p.page_type);
    }
    if (activeTabFilter === "menus") {
      return ["menu", "products", "services"].includes(p.page_type);
    }
    return true;
  });

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      const { data: pgList } = await supabase
        .from("pages")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true });

      const { data: qrs } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_id", businessId);

      setBusiness(biz);
      setPages((pgList as PageData[]) || []);
      setQrCodes(qrs || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  // Toggle Visibility in Navigation
  async function toggleNavigation(pageId: string, currentVal: boolean) {
    try {
      const { error } = await supabase
        .from("pages")
        .update({ show_in_navigation: !currentVal })
        .eq("id", pageId);

      if (error) throw error;
      setPages(pages.map(p => p.id === pageId ? { ...p, show_in_navigation: !currentVal } : p));
      toast.success("Visibilidade atualizada!");
    } catch (err) {
      toast.error("Erro ao atualizar visibilidade.");
    }
  }

  // Toggle Publish Status
  async function toggleStatus(pageId: string, currentStatus: string) {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const { error } = await supabase
        .from("pages")
        .update({ 
          status: nextStatus,
          is_published: nextStatus === "published"
        })
        .eq("id", pageId);

      if (error) throw error;
      setPages(pages.map(p => p.id === pageId ? { ...p, status: nextStatus } : p));
      toast.success(nextStatus === "published" ? "Página publicada!" : "Página despublicada!");
    } catch (err) {
      toast.error("Erro ao atualizar status.");
    }
  }

  // Delete Page
  async function handleDeletePage(pageId: string) {
    if (!confirm("Tem certeza que deseja excluir esta página? Isso apagará todas as seções e itens associados.")) return;

    try {
      const { error } = await supabase.from("pages").delete().eq("id", pageId);
      if (error) throw error;
      setPages(pages.filter(p => p.id !== pageId));
      toast.success("Página excluída com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir página.");
    }
  }

  // Duplicate Page
  async function handleDuplicatePage(srcPage: PageData) {
    setDuplicating(srcPage.id);
    try {
      // 1. Create duplicate page record
      const slugSuffix = Math.random().toString(36).substring(2, 6);
      const { data: newPage, error: pageErr } = await supabase
        .from("pages")
        .insert({
          business_id: businessId,
          title: `${srcPage.title} (Cópia)`,
          slug: `${srcPage.slug}-copy-${slugSuffix}`,
          page_type: srcPage.page_type,
          description: srcPage.description,
          status: "draft",
          is_published: false,
          layout_type: srcPage.layout_type,
          show_in_navigation: srcPage.show_in_navigation,
          navigation_label: srcPage.navigation_label ? `${srcPage.navigation_label} (Cópia)` : null,
          sort_order: pages.length + 1
        })
        .select()
        .single();

      if (pageErr) throw pageErr;

      // 2. Fetch original sections & items to copy
      const { data: oldSections } = await supabase
        .from("sections")
        .select("*, items(*)")
        .eq("page_id", srcPage.id);

      if (oldSections && oldSections.length > 0) {
        for (const sec of oldSections) {
          const { data: newSec, error: secErr } = await supabase
            .from("sections")
            .insert({
              page_id: newPage.id,
              name: sec.name,
              slug: `${sec.slug}-copy`,
              section_type: sec.section_type,
              sort_order: sec.sort_order,
              is_visible: sec.is_visible
            })
            .select()
            .single();

          if (secErr) throw secErr;

          if (sec.items && sec.items.length > 0) {
            const duplicatedItems = sec.items.map((it: any) => ({
              section_id: newSec.id,
              name: it.name,
              description: it.description,
              price: it.price,
              original_price: it.original_price,
              image_url: it.image_url,
              item_type: it.item_type,
              is_available: it.is_available,
              sort_order: it.sort_order,
              metadata: it.metadata
            }));

            await supabase.from("items").insert(duplicatedItems);
          }
        }
      }

      toast.success("Página duplicada com sucesso!");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao duplicar página.");
    } finally {
      setDuplicating(null);
    }
  }

  // Quick Wizard Launcher
  function launchQuickCreator(type: string) {
    setPageType(type);
    
    // Automatically set smart defaults based on page type
    let defaultTitle = "";
    let defaultDesc = "";
    let defaultBtn = "";
    let defaultAction = "whatsapp_order";
    
    if (type === "home") {
      defaultTitle = "Bem-vindo ao nosso espaço!";
      defaultDesc = "Oferecemos o melhor atendimento e serviços incríveis para você.";
      defaultBtn = "Fale Conosco";
      defaultAction = "call_us";
    } else if (type === "menu") {
      defaultTitle = "Nosso Cardápio Digital";
      defaultDesc = "Selecione seus itens favoritos e envie seu pedido pelo WhatsApp!";
      defaultBtn = "Ver no WhatsApp";
      defaultAction = "whatsapp_order";
    } else if (type === "products") {
      defaultTitle = "Catálogo de Produtos";
      defaultDesc = "Explore nossa linha completa de produtos.";
      defaultBtn = "Pedir Orçamento";
      defaultAction = "request_quote";
    } else if (type === "services") {
      defaultTitle = "Nossos Serviços & Especialidades";
      defaultDesc = "Veja tudo o que oferecemos para o seu bem-estar.";
      defaultBtn = "Agendar Horário";
      defaultAction = "book_appointment";
    } else if (type === "appointments") {
      defaultTitle = "Agende seu Atendimento";
      defaultDesc = "Escolha o melhor horário online de forma simples e rápida.";
      defaultBtn = "Agendar Agora";
      defaultAction = "book_appointment";
    } else if (type === "quote") {
      defaultTitle = "Solicitar Orçamento Rápido";
      defaultDesc = "Escreva o que você precisa e responderemos com os preços.";
      defaultBtn = "Enviar Solicitação";
      defaultAction = "request_quote";
    } else {
      defaultTitle = "Nova Página Customizada";
      defaultDesc = "Personalize o conteúdo da sua página como preferir.";
    }

    setMainTitle(defaultTitle);
    setDescription(defaultDesc);
    setButtonLabel(defaultBtn);
    setButtonAction(defaultAction);
    
    setShowWizard(true);
    setWizardStep(2); // Go straight to Layout Selection
  }

  // Create Page via Wizard
  async function handleFinishWizard() {
    setIsCreating(true);
    try {
      const cleanSlug = mainTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 30);

      // 1. Create page
      const { data: page, error: pageErr } = await supabase
        .from("pages")
        .insert({
          business_id: businessId,
          title: mainTitle,
          slug: cleanSlug || "nova-pagina",
          page_type: pageType,
          description: description,
          status: status,
          is_published: status === "published",
          layout_type: layoutType,
          show_in_navigation: showInNavigation,
          navigation_label: navigationLabel || mainTitle,
          sort_order: pages.length + 1
        })
        .select()
        .single();

      if (pageErr) throw pageErr;

      // 2. Create sections based on page type
      const { data: newSec, error: secErr } = await supabase
        .from("sections")
        .insert({
          page_id: page.id,
          name: "Destaque Principal",
          slug: "destaque-principal",
          section_type: "hero",
          sort_order: 0
        })
        .select()
        .single();

      if (secErr) throw secErr;

      // Create a default block item inside the section
      const { error: itemErr } = await supabase
        .from("items")
        .insert({
          section_id: newSec.id,
          name: mainTitle,
          description: description,
          price: null,
          image_url: imageUrl || null,
          metadata: {
            button_label: buttonLabel,
            button_action: buttonAction,
            button_url: buttonUrl
          }
        });

      if (itemErr) throw itemErr;

      // 3. Create QR Code specifically for this page
      const shortCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const destUrl = `${window.location.origin}/b/${business.slug}/${cleanSlug}`;

      const { data: qr, error: qrErr } = await supabase
        .from("qr_codes")
        .insert({
          business_id: businessId,
          page_id: page.id,
          title: `QR - ${mainTitle}`,
          short_code: shortCode,
          destination_url: destUrl,
          qr_type: "page",
          scan_count: 0
        })
        .select()
        .single();

      if (qrErr) throw qrErr;

      // Update page with qr_code_id
      await supabase
        .from("pages")
        .update({ qr_code_id: qr.id })
        .eq("id", page.id);

      setCreatedPage(page);
      setCreatedQr(qr);
      setWizardStep(6); // Success screen
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar a página.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleCopyLink(slug: string) {
    const url = `${window.location.origin}/b/${business?.slug}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-500">Carregando painel de páginas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8 animate-fade-in-up">
      {/* ===== Back Link ===== */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Voltar para a Visão Geral
      </Link>

      {/* ===== Dashboard Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Páginas de {business?.name}</h1>
            <p className="text-sm text-gray-400">Crie, edite e gerencie páginas públicas e cardápios vinculados aos seus QRs.</p>
          </div>
        </div>

        <Button
          variant="default"
          onClick={() => {
            setWizardStep(1);
            setCreatedPage(null);
            setCreatedQr(null);
            setShowWizard(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 h-11 rounded-xl shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Criar Nova Página
        </Button>
      </div>

      {/* ===== Quick Start Buttons Grid ===== */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Criar Página Rapidamente
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <button onClick={() => launchQuickCreator("home")} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all text-left flex flex-col justify-between h-24 group">
            <Home className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Página Home</span>
          </button>
          <button onClick={() => launchQuickCreator("menu")} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all text-left flex flex-col justify-between h-24 group">
            <Utensils className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Cardápio</span>
          </button>
          <button onClick={() => launchQuickCreator("products")} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all text-left flex flex-col justify-between h-24 group">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Catálogo</span>
          </button>
          <button onClick={() => launchQuickCreator("appointments")} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all text-left flex flex-col justify-between h-24 group">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Agendamento</span>
          </button>
          <button onClick={() => launchQuickCreator("quote")} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all text-left flex flex-col justify-between h-24 group">
            <ClipboardList className="w-5 h-5 text-teal-500" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Orçamento</span>
          </button>
          <button onClick={() => launchQuickCreator("custom")} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-xl transition-all text-left flex flex-col justify-between h-24 group">
            <Layout className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Personalizada</span>
          </button>
        </div>
      </div>

      {/* ===== Pages List Table ===== */}
      <GlassCard>
        <GlassCardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <GlassCardTitle className="text-base font-black text-slate-700">
                {activeTabFilter === "content" 
                  ? "Páginas de Conteúdo & Agendamento" 
                  : activeTabFilter === "menus" 
                  ? "Cardápios, Catálogos & Serviços" 
                  : "Todas as Páginas & Menus Ativos"}
              </GlassCardTitle>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Gerencie os links e layouts de exibição pública.</p>
            </div>
            
            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
              <Link 
                href={`/dashboard/business/${businessId}/pages`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTabFilter === "all" 
                    ? "bg-white text-slate-800 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Todas ({pages.length})
              </Link>
              <Link 
                href={`/dashboard/business/${businessId}/pages?filter=content`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTabFilter === "content" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                Páginas ({pages.filter(p => ["home", "appointments", "custom"].includes(p.page_type)).length})
              </Link>
              <Link 
                href={`/dashboard/business/${businessId}/pages?filter=menus`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTabFilter === "menus" 
                    ? "bg-amber-500 text-white shadow-sm" 
                    : "text-slate-500 hover:text-amber-600"
                }`}
              >
                Cardápios ({pages.filter(p => ["menu", "products", "services"].includes(p.page_type)).length})
              </Link>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="p-0">
          {displayedPages.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Globe className="w-8 h-8" />
              </div>
              <p className="text-slate-800 font-bold mb-1">Nenhuma página criada nesta categoria</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">Comece agora mesmo usando nosso assistente rápido de criação de páginas.</p>
              <Button onClick={() => setShowWizard(true)} className="bg-indigo-600 text-white font-bold">
                Criar Minha Primeira Página
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">Título / Tipo</th>
                    <th className="px-6 py-3.5">Acesso Público</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Menu</th>
                    <th className="px-6 py-3.5">Visualizações</th>
                    <th className="px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedPages.map((p) => {
                    const pageQr = qrCodes.find(q => q.page_id === p.id);
                    const scanCount = pageQr ? pageQr.scan_count : 0;
                    const publicUrl = `/b/${business?.slug}/${p.slug}`;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4.5">
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                              {p.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="indigo" className="text-[10px] py-0 px-2 leading-tight uppercase font-extrabold font-mono">
                                {p.page_type}
                              </Badge>
                              <Badge variant="muted" className="text-[10px] py-0 px-2 leading-tight uppercase font-medium">
                                {p.layout_type}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono select-all font-medium truncate max-w-44">
                              {p.slug}
                            </span>
                            <Link href={publicUrl} target="_blank" className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <button
                            onClick={() => toggleStatus(p.id, p.status)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0 ${
                              p.status === "published"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            {p.status === "published" ? "Publicado" : "Rascunho"}
                          </button>
                        </td>
                        <td className="px-6 py-4.5">
                          <button
                            onClick={() => toggleNavigation(p.id, p.show_in_navigation)}
                            className={`p-1 rounded-lg transition-all ${
                              p.show_in_navigation 
                                ? "text-indigo-600 bg-indigo-50" 
                                : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                            title={p.show_in_navigation ? "Visível no menu público" : "Oculto no menu público"}
                          >
                            {p.show_in_navigation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                            <QrCode className="w-3.5 h-3.5 text-gray-400" />
                            <span>{scanCount} scans</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/business/${businessId}/pages/${p.id}`}>
                              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Editar conteúdo">
                                <Settings className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDuplicatePage(p)}
                              disabled={duplicating === p.id}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="Duplicar Página"
                            >
                              {duplicating === p.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeletePage(p.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Excluir página"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* ===== STEP-BY-STEP PAGE CREATION WIZARD MODAL ===== */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 max-h-[90vh]">
            
            {/* Left Side: Wizard Form Fields */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
              
              {/* Wizard Steps Header */}
              {wizardStep < 6 && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Criando sua Página</h2>
                    <p className="text-xs text-gray-400">Etapa {wizardStep} de 5</p>
                  </div>
                  <button 
                    onClick={() => setShowWizard(false)}
                    className="text-gray-400 hover:text-slate-700 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* Step 1: Choose Page Type */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">1. Qual tipo de página deseja criar?</h3>
                  <p className="text-xs text-slate-400 mt-1">Selecione o modelo básico que servirá de ponto de partida.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "home", title: "Página Principal (Home)", desc: "Apresentação e links rápidos", icon: <Home className="w-5 h-5 text-indigo-600" /> },
                      { id: "menu", title: "Cardápio de Pedidos", desc: "Itens, preços e pedidos no WhatsApp", icon: <Utensils className="w-5 h-5 text-orange-500" /> },
                      { id: "products", title: "Catálogo de Produtos", desc: "Fotos, stock e pedidos de cotação", icon: <Package className="w-5 h-5 text-blue-500" /> },
                      { id: "services", title: "Lista de Serviços", desc: "Preços de serviços e profissionais", icon: <HeartPulse className="w-5 h-5 text-emerald-500" /> },
                      { id: "appointments", title: "Agendamento Online", desc: "Agendar horário rápido online", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
                      { id: "quote", title: "Formulário de Cotação", desc: "Clientes pedem orçamento rápido", icon: <ClipboardList className="w-5 h-5 text-teal-500" /> },
                      { id: "contact", title: "Página de Contato", desc: "WhatsApp, Telefone e Google Maps", icon: <Phone className="w-5 h-5 text-indigo-600" /> },
                      { id: "custom", title: "Página Customizada", desc: "Edite blocos como você quiser", icon: <Layout className="w-5 h-5 text-purple-500" /> }
                    ].map(card => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setPageType(card.id);
                          setWizardStep(2);
                        }}
                        className={`p-4 text-left border rounded-2xl hover:border-indigo-500 transition-all flex items-start gap-3 group bg-white ${
                          pageType === card.id ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-slate-100"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                          {card.icon}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 group-hover:text-indigo-600">{card.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{card.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Layout */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">2. Como os clientes acessarão esta página?</h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: "simple", title: "Exibir como Aba (dentro do meu Menu principal)", desc: "Excelente para abas como Café da Manhã, Almoço, Bebidas." },
                      { id: "separate", title: "Página Separada (com Link e QR Code próprios)", desc: "Perfeito para colocar QR Codes específicos em prateleiras, mesas ou banners." },
                      { id: "hybrid", title: "Híbrido (exibir no menu E ter QR Code separado)", desc: "Os clientes podem achar navegando e você também pode fixar um QR Code na recepção." }
                    ].map(lay => (
                      <button
                        key={lay.id}
                        onClick={() => {
                          setLayoutType(lay.id);
                          // Handle smart navigation default
                          if (lay.id === "simple") {
                            setShowInNavigation(true);
                          } else if (lay.id === "separate") {
                            setShowInNavigation(false);
                          } else {
                            setShowInNavigation(true);
                          }
                          setWizardStep(3);
                        }}
                        className={`w-full p-4 text-left border rounded-2xl hover:border-indigo-500 transition-all bg-white flex items-center justify-between group ${
                          layoutType === lay.id ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-slate-100"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-800 group-hover:text-indigo-600">{lay.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1 leading-normal">{lay.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Add Content */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">3. Conteúdo da Página</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Título Principal da Página</label>
                      <Input
                        value={mainTitle}
                        onChange={(e) => {
                          setMainTitle(e.target.value);
                          setNavigationLabel(e.target.value);
                        }}
                        placeholder="Ex: Nossas Pizzas Especiais"
                        className="h-10 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Descrição Curta</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Escreva uma frase acolhedora para seus clientes."
                        className="w-full h-20 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Texto do Botão de Ação</label>
                        <Input
                          value={buttonLabel}
                          onChange={(e) => setButtonLabel(e.target.value)}
                          placeholder="Ex: Fazer Pedido"
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">O que o botão deve fazer?</label>
                        <select
                          value={buttonAction}
                          onChange={(e) => setButtonAction(e.target.value)}
                          className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="whatsapp_order">Enviar pedido para o WhatsApp</option>
                          <option value="book_appointment">Agendar Horário online</option>
                          <option value="request_quote">Solicitar orçamento rápido</option>
                          <option value="call_us">Ligar para nossa empresa</option>
                          <option value="custom_url">Abrir outro Link da Web</option>
                        </select>
                      </div>
                    </div>

                    {buttonAction === "custom_url" && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Coloque o endereço (Link) da web</label>
                        <Input
                          value={buttonUrl}
                          onChange={(e) => setButtonUrl(e.target.value)}
                          placeholder="Ex: https://meusite.com/reserva"
                          className="h-10 rounded-xl"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Link de uma Imagem/Foto (Opcional)</label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Ex: https://imagens.com/minha-foto.jpg"
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Choose Visibility */}
              {wizardStep === 4 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800">4. Ajustes Finais de Visibilidade</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                      <input
                        type="checkbox"
                        id="showInNavCheck"
                        checked={showInNavigation}
                        onChange={(e) => setShowInNavigation(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mt-1 cursor-pointer"
                      />
                      <label htmlFor="showInNavCheck" className="text-xs text-slate-700 leading-normal cursor-pointer select-none">
                        <span className="block font-bold">Mostrar esta página no Menu Público</span>
                        Se marcado, os clientes poderão ver esta aba ao abrir qualquer QR ou link principal do seu negócio.
                      </label>
                    </div>

                    {showInNavigation && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Nome no Menu de Navegação</label>
                        <Input
                          value={navigationLabel}
                          onChange={(e) => setNavigationLabel(e.target.value)}
                          placeholder="Ex: Pizzas"
                          className="h-10 rounded-xl"
                        />
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-bold text-slate-600 mb-2">Estado inicial da página</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStatus("published")}
                          className={`flex-1 p-3 border rounded-xl font-bold text-xs transition-all ${
                            status === "published"
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-white border-slate-200 text-gray-500 hover:bg-slate-50"
                          }`}
                        >
                          Publicado (Visível para todos)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus("draft")}
                          className={`flex-1 p-3 border rounded-xl font-bold text-xs transition-all ${
                            status === "draft"
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-white border-slate-200 text-gray-500 hover:bg-slate-50"
                          }`}
                        >
                          Rascunho (Apenas você pode ver)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preview Confirmation */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">5. Tudo pronto! Vamos publicar?</h3>
                  <p className="text-xs text-gray-400">Verifique os dados ao lado na simulação do telefone antes de confirmar a criação.</p>
                  
                  <div className="p-4 bg-indigo-50 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-indigo-900">O que geraremos para você:</p>
                      <ul className="text-[10px] text-indigo-800 list-disc pl-4 mt-1 space-y-1">
                        <li>Uma página web rápida e otimizada para celulares.</li>
                        <li>Um <strong>QR Code próprio</strong> para fixar onde você quiser.</li>
                        <li>Possibilidade de receber pedidos ou agendamentos no seu WhatsApp.</li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={handleFinishWizard}
                    disabled={isCreating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-200"
                  >
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Publicar Agora!"
                    )}
                  </Button>
                </div>
              )}

              {/* Step Navigation Buttons */}
              {wizardStep < 5 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                  {wizardStep > 1 ? (
                    <button
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-slate-700 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                  ) : (
                    <div />
                  )}
                  
                  <Button
                    onClick={() => {
                      if (wizardStep === 3 && !mainTitle.trim()) {
                        toast.error("Insira um título principal");
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 rounded-xl text-xs h-10"
                  >
                    Continuar <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right Side: LIVE PREVIEW SKELETON or SUCCESS SCREEN */}
            <div className="w-full md:w-80 bg-slate-950 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 relative">
              
              {wizardStep < 6 ? (
                <>
                  <div className="absolute top-3 left-4 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Visualização Celular</span>
                  </div>

                  {/* Simulated Smart Phone */}
                  <div className="w-full max-w-[260px] aspect-[9/18] bg-[#F9FAFB] rounded-[32px] border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col text-slate-800">
                    {/* Speaker notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-b-xl z-20" />
                    
                    {/* Phone Status bar */}
                    <div className="h-6 bg-slate-800 text-white text-[9px] px-4 flex items-center justify-between shrink-0 select-none">
                      <span>9:41</span>
                      <span>MeuQR LTE</span>
                    </div>

                    {/* App Content Preview */}
                    <div className="flex-1 overflow-y-auto pb-4">
                      {/* Logo Cover Mock */}
                      <div className="h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 blur-md absolute" />
                        <span className="text-[10px] font-black text-white">{business?.name || "Empresa"}</span>
                      </div>

                      {/* Header Avatar */}
                      <div className="px-3 -mt-6 relative z-10 flex flex-col items-start">
                        <div className="w-12 h-12 rounded-xl bg-[#111827] border-2 border-white shadow flex items-center justify-center text-white text-xs font-bold font-mono">
                          {business?.name?.[0] || "E"}
                        </div>
                      </div>

                      {/* Dynamic Live Text */}
                      <div className="px-3 mt-2 text-left space-y-1">
                        <h4 className="text-[11px] font-black text-slate-800 leading-tight">
                          {mainTitle || "Nome da Página..."}
                        </h4>
                        <p className="text-[9px] text-gray-400 leading-normal line-clamp-3">
                          {description || "A descrição da sua página aparecerá detalhadamente para seus clientes..."}
                        </p>
                      </div>

                      {/* Tab Menu navigation mockup */}
                      {showInNavigation && (
                        <div className="px-3 mt-3 border-t border-slate-100 pt-2">
                          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none select-none">
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#111827] text-white">
                              {navigationLabel || "Início"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-white text-gray-400 border border-slate-200">
                              Contato
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Card block list placeholder */}
                      <div className="px-3 mt-3 space-y-2">
                        <div className="p-2 border border-slate-100 rounded-xl bg-white flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="block text-[9px] font-bold text-slate-700">Bloco de Destaque</span>
                            <span className="block text-[8px] text-gray-400">R$ 0,00</span>
                          </div>
                          <div className="w-7 h-7 rounded bg-slate-100 shrink-0" />
                        </div>
                      </div>

                      {/* Action Button Mock */}
                      {buttonLabel && (
                        <div className="px-3 mt-4">
                          <span className="block w-full py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold text-center shadow-sm">
                            {buttonLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Step 6: Success Screen */
                <div className="text-center space-y-6 w-full animate-fade-in text-white">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-lg">Página Publicada!</h3>
                    <p className="text-xs text-slate-400">Sua página já está online e pronta para receber visitas.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                    {/* Public link input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/b/${business?.slug}/${createdPage?.slug}`}
                        className="bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-1.5 rounded-lg flex-1 text-slate-300 font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(createdPage?.slug)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors cursor-pointer"
                        title="Copiar Link"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Print/Download QR Code */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 font-bold mb-2">QR CODE EXCLUSIVO</span>
                      <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button 
                      onClick={() => setShowWizard(false)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 w-full"
                    >
                      Voltar ao Painel
                    </Button>
                    {createdPage && (
                      <Link href={`/dashboard/business/${businessId}/pages/${createdPage.id}`} className="w-full">
                        <Button 
                          variant="outline"
                          className="border-slate-800 hover:bg-slate-900 text-slate-300 text-xs h-10 w-full"
                        >
                          Adicionar Produtos/Serviços
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
