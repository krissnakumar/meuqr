"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  Plus,
  Store,
  ChevronRight,
  QrCode,
  Eye,
  ExternalLink,
  Edit3,
  Save,
  Trash2,
  X,
  ClipboardList,
} from "lucide-react";

function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface PagesTreeViewProps {
  businessId: string;
  businessName: string;
  businessSlug: string;
  pages: any[];
  qrCodes: any[];
  sections: any[];
  onRefresh?: () => Promise<void>;
}

export default function PagesTreeView({
  businessId,
  businessName,
  businessSlug,
  pages,
  qrCodes,
  sections,
  onRefresh,
}: PagesTreeViewProps) {
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [creatingPage, setCreatingPage] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageSlug, setEditPageSlug] = useState("");
  const [savingPage, setSavingPage] = useState(false);

  async function handleCreatePage() {
    if (!newPageTitle || !newPageSlug) {
      toast.error("Título e link são obrigatórios!");
      return;
    }
    setCreatingPage(true);
    try {
      const slugVal = slugify(newPageSlug);
      const { data: page, error } = await supabase
        .from("pages")
        .insert({
          business_id: businessId,
          title: newPageTitle,
          slug: slugVal,
          is_published: true,
          seo_title: `${businessName} - ${newPageTitle}`,
        })
        .select()
        .single();

      if (error) {
        toast.error("Erro ao criar página: " + error.message);
        return;
      }

      // Generate a QR code automatically for this page
      const shortCode = generateShortCode();
      await supabase
        .from("qr_codes")
        .insert({
          business_id: businessId,
          page_id: page.id,
          short_code: shortCode,
          title: `${businessName} - ${newPageTitle}`,
          is_active: true,
        })
        .select()
        .single();

      toast.success("Página e QR Code criados!");
      setShowAddPage(false);
      setNewPageTitle("");
      setNewPageSlug("");
      await onRefresh?.();
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
      const slugVal = slugify(editPageSlug);
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

      setEditingPageId(null);
      toast.success("Menu atualizado com sucesso!");
      await onRefresh?.();
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
      setEditingPageId(null);
      toast.success("Menu excluído com sucesso!");
      await onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir.");
    }
  }

  async function generateQrForPage(pageId: string) {
    const shortCode = generateShortCode();
    const { data } = await supabase.from("qr_codes").insert({
      business_id: businessId,
      page_id: pageId,
      short_code: shortCode,
      title: `${businessName} - ${pages.find(p => p.id === pageId)?.title}`,
      is_active: true,
    }).select().single();
    if (data) {
      toast.success("QR Code gerado para a página!");
      await onRefresh?.();
    }
  }

  const hasPages = pages.length > 0;

  return (
    <GlassCard>
      <GlassCardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <GlassCardTitle>Menus e Páginas</GlassCardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Gerencie seus menus e QR Codes
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddPage(!showAddPage)}
          className="h-9"
        >
          {showAddPage ? "Fechar" : <><Plus className="w-3.5 h-3.5 mr-1" /> Novo Menu</>}
        </Button>
      </GlassCardHeader>
      <GlassCardContent>
        {/* Add Page Form */}
        {showAddPage && (
          <div className="bg-gradient-to-br from-indigo-50/30 to-indigo-50/10 border border-indigo-100/30 rounded-xl p-5 mb-6 space-y-4 animate-fade-in-up">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              Criar Novo Menu
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Título do Menu *</label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value);
                  setNewPageSlug(slugify(e.target.value));
                }}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                placeholder="Ex: Cardápio Principal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Link de Acesso *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200 shrink-0">
                  meuqr.com.br/{businessSlug}/
                </span>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(slugify(e.target.value))}
                  className="flex-1 h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                  placeholder="cardapio-principal"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAddPage(false)} className="flex-1 h-10 text-xs">
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleCreatePage}
                disabled={creatingPage}
                className="flex-1 h-10 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {creatingPage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Criar Página"}
              </Button>
            </div>

            <div className="pt-3 border-t border-indigo-100/30 text-center">
              <p className="text-xs text-gray-400">
                Prefere modelos prontos?{" "}
                <Link href={`/dashboard/business/${businessId}/setup`} className="text-indigo-600 font-semibold hover:underline">
                  Usar Modelos
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Pages List */}
        {!hasPages ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Nenhum menu criado ainda</h3>
            <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
              Crie um cardápio ou página de links para seu negócio. O QR Code será gerado na hora.
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddPage(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Criar Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Business root node */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50/50 to-transparent border border-slate-200 rounded-xl p-3.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800">{businessName}</h4>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Negócio Principal</p>
              </div>
              {pages.length === 1 && businessSlug && (
                <Link href={`/${businessSlug}`} target="_blank" className="ml-auto shrink-0">
                  <Button variant="ghost" size="sm" className="text-indigo-600 h-8 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Visualizar
                  </Button>
                </Link>
              )}
            </div>

            {/* Tree branches (pages) */}
            <div className="relative pl-6 border-l-2 border-dashed border-slate-200 space-y-4">
              {pages.map((page, index) => {
                const qr = qrCodes.find((q: any) => q.page_id === page.id);
                const isLast = index === pages.length - 1;
                const pageSections = sections.filter((s: any) => s.page_id === page.id);
                return (
                  <div key={page.id} className="relative group animate-fade-in-up" style={{ animationDelay: `${index * 120}ms` }}>
                    <div className="absolute -left-[26px] top-6 w-[26px] h-0.5 border-t-2 border-dashed border-slate-200" />
                    {isLast && (
                      <div className="absolute -left-[26px] top-[26px] w-2 h-40 bg-white" />
                    )}

                    <div className="space-y-2">
                      {/* Page card */}
                      <GlassCard className="overflow-hidden transition-all hover:shadow-md border-slate-200">
                        <div className={`absolute top-0 left-0 w-1 h-full ${page.is_published ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <GlassCardContent className="p-4 ml-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {pageSections.length > 0 && (
                                <button
                                  onClick={() => setExpandedPages(prev => ({ ...prev, [page.id]: !prev[page.id] }))}
                                  className="w-5 h-5 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all text-gray-400 hover:text-slate-500 shrink-0 cursor-pointer"
                                >
                                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedPages[page.id] ? "rotate-90 text-indigo-500" : ""}`} />
                                </button>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">{page.title}</h4>
                                <p className="text-xs text-gray-400 mt-0.5 font-mono">/{page.slug}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* QR Code */}
                              {qr ? (
                                <Link
                                  href={`/dashboard/business/${businessId}/qr/${qr.id}`}
                                  className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all"
                                  title={`QR Code (${qr.scan_count || 0} scans)`}
                                >
                                  <QrCode className="w-4 h-4" />
                                </Link>
                              ) : (
                                <button
                                  onClick={() => generateQrForPage(page.id)}
                                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-gray-400 hover:text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                                  title="Gerar QR Code"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}

                              {/* Edit button */}
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
                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                            </div>
                          </div>
                        </GlassCardContent>
                      </GlassCard>

                      {/* Edit form */}
                      {editingPageId === page.id && (
                        <div className="bg-gradient-to-br from-indigo-50/30 to-indigo-50/10 border border-indigo-100/30 rounded-xl p-5 space-y-4 animate-fade-in-up ml-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-800">Editar Menu</h4>
                            <button
                              onClick={() => setEditingPageId(null)}
                              className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-gray-400 hover:text-slate-500 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 block">Título *</label>
                            <input
                              type="text"
                              value={editPageTitle}
                              onChange={(e) => {
                                setEditPageTitle(e.target.value);
                                setEditPageSlug(slugify(e.target.value));
                              }}
                              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 block">Link *</label>
                            <input
                              type="text"
                              value={editPageSlug}
                              onChange={(e) => setEditPageSlug(slugify(e.target.value))}
                              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-indigo-100/30">
                            <Button
                              size="sm"
                              onClick={() => handleSavePage(page.id)}
                              disabled={savingPage}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
                            >
                              {savingPage ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : (
                                <Save className="w-3.5 h-3.5 mr-1" />
                              )}
                              Salvar
                            </Button>

                            <Link href={`/dashboard/business/${businessId}/pages/${page.id}`}>
                              <Button variant="outline" size="sm" className="h-9 text-xs">
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                Itens do Catálogo
                              </Button>
                            </Link>

                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="ml-auto h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sections */}
                      {expandedPages[page.id] && pageSections.length > 0 && (
                        <div className="relative pl-8 mt-2 space-y-2 border-l border-dashed border-slate-200 ml-5 pb-1">
                          {pageSections.map((sec: any, secIndex: number, arr: any[]) => {
                            const isLastSec = secIndex === arr.length - 1;
                            return (
                              <div key={sec.id} className="relative flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg transition-all group animate-fade-in-up" style={{ animationDelay: `${secIndex * 80}ms` }}>
                                <div className="absolute -left-[32px] top-[18px] w-[32px] h-0.5 border-t border-dashed border-slate-200" />
                                {isLastSec && (
                                  <div className="absolute -left-[32px] top-[18px] w-2 h-10 bg-white" />
                                )}

                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                    <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                                  </div>
                                  <span className="text-xs font-semibold text-slate-800">{sec.name}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <Link href={`/dashboard/business/${businessId}/pages/${page.id}`}>
                                    <button className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1 cursor-pointer">
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      Abrir
                                    </button>
                                  </Link>
                                  {businessSlug && (
                                    <Link href={`/${businessSlug}#${sec.id}`} target="_blank">
                                      <button className="h-7 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer">
                                        <Eye className="w-2.5 h-2.5" />
                                        Visualizar
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
      </GlassCardContent>
    </GlassCard>
  );
}
