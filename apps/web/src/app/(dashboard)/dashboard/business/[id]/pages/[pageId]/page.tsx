"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Input, Badge, ImageUpload } from "@meuqr/ui";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Package,
  Layout,
  EyeOff,
  GripVertical,
  Settings2,
  ChevronDown
} from "lucide-react";

interface ItemMetadata {
  duration_minutes?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  modifiers?: { id: string; name: string; required: boolean; options: { name: string; price: number }[] }[];
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  is_available: boolean;
  metadata: ItemMetadata | null;
}

interface SectionWithItems {
  id: string;
  name: string;
  slug: string;
  section_type: string | null;
  sort_order: number;
  is_visible: boolean;
  items: Item[];
}

export default function PageEditorPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;
  const pageId = params.pageId as string;

  const [page, setPage] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [sections, setSections] = useState<SectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Page Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [navLabel, setNavLabel] = useState("");
  const [showInNav, setShowInNav] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    try {
      const { data: pg } = await supabase
        .from("pages")
        .select("*, businesses!inner(*)")
        .eq("id", pageId)
        .single();

      const { data: secs } = await supabase
        .from("sections")
        .select("*, items(*)")
        .eq("page_id", pageId)
        .order("sort_order");

      setPage(pg);
      setBusiness(pg?.businesses);
      setSections(secs || []);
      setNavLabel(pg?.navigation_label || pg?.title || "");
      setShowInNav(pg?.show_in_navigation ?? true);
      setSeoTitle(pg?.seo_title || "");
      setSeoDesc(pg?.seo_description || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function savePageSettings() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("pages")
        .update({
          navigation_label: navLabel,
          show_in_navigation: showInNav,
          seo_title: seoTitle,
          seo_description: seoDesc,
        })
        .eq("id", pageId);

      if (error) throw error;
      setPage({ 
        ...page, 
        navigation_label: navLabel,
        show_in_navigation: showInNav,
        seo_title: seoTitle,
        seo_description: seoDesc
      });
      toast.success("Ajustes salvos com sucesso!");
      setShowSettings(false);
    } catch (err) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  async function addSection() {
    if (!newSectionName.trim()) {
      toast.error("Digite um nome para a seção");
      return;
    }
    const slug = newSectionName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const { data, error } = await supabase
      .from("sections")
      .insert({
        page_id: pageId,
        name: newSectionName,
        slug,
        sort_order: sections.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar seção");
      return;
    }
    if (data) {
      setSections([...sections, { ...data, items: [] }]);
      setNewSectionName("");
      toast.success("Seção criada");
    }
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Excluir esta seção e todos os itens?")) return;
    const { error } = await supabase.from("sections").delete().eq("id", sectionId);
    if (error) {
      toast.error("Erro ao excluir seção");
      return;
    }
    setSections(sections.filter((s) => s.id !== sectionId));
    toast.success("Seção excluída");
  }

  async function toggleSectionVisibility(section: SectionWithItems) {
    const { data } = await supabase
      .from("sections")
      .update({ is_visible: !section.is_visible })
      .eq("id", section.id)
      .select()
      .single();

    if (data) {
      setSections(sections.map((s) => (s.id === section.id ? { ...s, is_visible: data.is_visible } : s)));
    }
  }

  async function addItem(sectionId: string) {
    const name = prompt("Nome do item:");
    if (!name) return;

    const { data } = await supabase
      .from("items")
      .insert({
        section_id: sectionId,
        name,
        sort_order: sections.find((s) => s.id === sectionId)?.items.length || 0,
      })
      .select()
      .single();

    if (data) {
      setSections(
        sections.map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, data] } : s
        )
      );
      setEditingItemId(data.id);
    }
  }

  async function deleteItem(itemId: string, sectionId: string) {
    if (!confirm("Excluir este item?")) return;
    await supabase.from("items").delete().eq("id", itemId);
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i: any) => i.id !== itemId) }
          : s
      )
    );
    toast.success("Item excluído");
  }

  async function updateItemPrice(itemId: string, price: string) {
    const numPrice = price ? parseFloat(price) : null;
    await supabase.from("items").update({ price: numPrice }).eq("id", itemId);
    setSections(
      sections.map((s) => ({
        ...s,
        items: s.items.map((i: any) =>
          i.id === itemId ? { ...i, price: numPrice } : i
        ),
      }))
    );
  }

  async function updateItemMetadata(itemId: string, metadata: ItemMetadata) {
    await supabase.from("items").update({ metadata }).eq("id", itemId);
    setSections(
      sections.map((s) => ({
        ...s,
        items: s.items.map((i: any) =>
          i.id === itemId ? { ...i, metadata } : i
        ),
      }))
    );
  }

  async function updateItemField(itemId: string, field: string, value: any) {
    await supabase.from("items").update({ [field]: value }).eq("id", itemId);
    setSections(
      sections.map((s) => ({
        ...s,
        items: s.items.map((i: any) =>
          i.id === itemId ? { ...i, [field]: value } : i
        ),
      }))
    );
  }

  async function uploadItemImage(itemId: string, sectionId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", businessId);

    const loadingToast = toast.loading("Enviando imagem...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar arquivo");

      await supabase.from("items").update({ image_url: data.url }).eq("id", itemId);
      
      setSections(
        sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map((i: any) =>
                  i.id === itemId ? { ...i, image_url: data.url } : i
                ),
              }
            : s
        )
      );
      toast.success("Imagem atualizada", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  }

  async function removeItemImage(itemId: string, sectionId: string) {
    await supabase.from("items").update({ image_url: null }).eq("id", itemId);
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i: any) =>
                i.id === itemId ? { ...i, image_url: null } : i
              ),
            }
          : s
      )
    );
  }

  async function togglePublish() {
    setSaving(true);
    const wasPublished = page.is_published;
    const { error } = await supabase
      .from("pages")
      .update({ is_published: !wasPublished })
      .eq("id", pageId);
    if (error) {
      toast.error("Erro ao publicar");
      setSaving(false);
      return;
    }
    setPage({ ...page, is_published: !wasPublished });
    toast.success(wasPublished ? "Página despublicada" : "Página publicada!");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('business.loading_editor')}</p>
      </div>
    );
  }

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  const renderCategoryAttributes = (item: any) => {
    if (business?.category === "salon" || business?.category === "clinic") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Duração (Minutos)</label>
              <input
                type="number"
                value={item.metadata?.duration_minutes || ""}
                onChange={(e) =>
                  updateItemMetadata(item.id, { ...item.metadata, duration_minutes: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Convênios Aceitos (Separe por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: Unimed, Bradesco"
                value={(item.metadata?.accepted_insurances || []).join(", ")}
                onChange={(e) =>
                  updateItemMetadata(item.id, {
                    ...item.metadata,
                    accepted_insurances: e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Instruções de Preparo (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Jejum de 8h, chegar 15 min antes"
              value={item.metadata?.preparation_instructions || ""}
              onChange={(e) =>
                updateItemMetadata(item.id, { ...item.metadata, preparation_instructions: e.target.value })
              }
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      );
    }

    if (business?.category === "real_estate") {
      return (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Quartos</label>
            <input
              type="number"
              value={item.metadata?.bedrooms || ""}
              onChange={(e) =>
                updateItemMetadata(item.id, { ...item.metadata, bedrooms: parseInt(e.target.value) || 0 })
              }
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Banheiros</label>
            <input
              type="number"
              value={item.metadata?.bathrooms || ""}
              onChange={(e) =>
                updateItemMetadata(item.id, { ...item.metadata, bathrooms: parseInt(e.target.value) || 0 })
              }
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Área (m²)</label>
            <input
              type="number"
              value={item.metadata?.area_sqm || ""}
              onChange={(e) =>
                updateItemMetadata(item.id, { ...item.metadata, area_sqm: parseInt(e.target.value) || 0 })
              }
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {/* Dietary Badges */}
        {(business?.category === "restaurant" ||
          business?.category === "pizzeria" ||
          business?.category === "burger_shop" ||
          business?.category === "bakery") && (
          <div className="space-y-2 pb-3 border-b border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Restrições e Etiquetas</p>
            <div className="flex flex-wrap gap-2">
              {["vegan", "vegetarian", "gluten_free", "spicy"].map((diet) => {
                const isActive = item.metadata?.dietary?.includes(diet);
                return (
                  <button
                    key={diet}
                    onClick={() => {
                      const current = item.metadata?.dietary || [];
                      const next = isActive ? current.filter((d: string) => d !== diet) : [...current, diet];
                      updateItemMetadata(item.id, { ...item.metadata, dietary: next });
                    }}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                      isActive
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium"
                        : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                    }`}
                  >
                    {diet === "vegan"
                      ? "🌱 Vegano"
                      : diet === "vegetarian"
                        ? "🧀 Vegetariano"
                        : diet === "gluten_free"
                          ? "🌾 Sem Glúten"
                          : "🌶️ Apimentado"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Wholesale / Quantities */}
        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Pedido Mínimo</label>
            <input
              type="number"
              min="1"
              placeholder="Ex: 1"
              value={item.metadata?.min_quantity || ""}
              onChange={(e) =>
                updateItemMetadata(item.id, { ...item.metadata, min_quantity: parseInt(e.target.value) || null })
              }
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Unidade (Ex: kg, cm, m²)</label>
            <input
              type="text"
              placeholder="Deixe em branco para UN"
              value={item.metadata?.unit_type || ""}
              onChange={(e) => updateItemMetadata(item.id, { ...item.metadata, unit_type: e.target.value })}
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-3 font-medium">Modificadores (Ex: Tamanhos, Extras)</p>
          {(item.metadata?.modifiers || []).map((mod: any, mIdx: number) => {
            return (
              <div key={mIdx} className="p-3 bg-white border border-slate-200 rounded-lg relative">
                <button
                  onClick={() => {
                    const mods = [...(item.metadata?.modifiers || [])];
                    mods.splice(mIdx, 1);
                    updateItemMetadata(item.id, { ...item.metadata, modifiers: mods });
                  }}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  value={mod.name}
                  placeholder="Nome do Modificador (ex: Tamanho)"
                  onChange={(e) => {
                    const mods = [...(item.metadata?.modifiers || [])];
                    mods[mIdx].name = e.target.value;
                    updateItemMetadata(item.id, { ...item.metadata, modifiers: mods });
                  }}
                  className="font-medium text-sm text-slate-700 bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 pb-0.5 w-3/4 mb-2"
                />
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mod.required}
                    onChange={(e) => {
                      const mods = [...(item.metadata?.modifiers || [])];
                      mods[mIdx].required = e.target.checked;
                      updateItemMetadata(item.id, { ...item.metadata, modifiers: mods });
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-600">Obrigatório</span>
                </label>

                <div className="space-y-2">
                  {(mod.options || []).map((opt: any, oIdx: number) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Opção (Ex: P, M, G)"
                        value={opt.name}
                        onChange={(e) => {
                          const mods = [...(item.metadata?.modifiers || [])];
                          mods[mIdx].options[oIdx].name = e.target.value;
                          updateItemMetadata(item.id, { ...item.metadata, modifiers: mods });
                        }}
                        className="flex-1 text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                      <input
                        type="number"
                        placeholder="+ R$"
                        value={opt.price}
                        onChange={(e) => {
                          const mods = [...(item.metadata?.modifiers || [])];
                          mods[mIdx].options[oIdx].price = parseFloat(e.target.value) || 0;
                          updateItemMetadata(item.id, { ...item.metadata, modifiers: mods });
                        }}
                        className="w-20 text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const mods = [...(item.metadata?.modifiers || [])];
                      mods[mIdx].options.push({ name: "", price: 0 });
                      updateItemMetadata(item.id, { ...item.metadata, modifiers: mods });
                    }}
                    className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                  >
                    + Opção
                  </button>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newMod = {
                id: Math.random().toString(),
                name: "",
                required: false,
                options: [{ name: "", price: 0 }],
              };
              updateItemMetadata(item.id, {
                ...item.metadata,
                modifiers: [...(item.metadata?.modifiers || []), newMod],
              });
            }}
            className="w-full h-8 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Modificador
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}/pages`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Todas as Páginas
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{page?.title}</h1>
            <p className="text-sm text-gray-400">{business?.name} · {sections.length} seções · {totalItems} itens</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="border-slate-200 text-slate-700 font-semibold"
          >
            Configurações da Página
          </Button>
          <Button
            variant={page?.is_published ? "outline" : "default"}
            size="sm"
            onClick={togglePublish}
            disabled={saving}
            className={page?.is_published ? "border-slate-200" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
          >
            {page?.is_published ? "Despublicar" : "Publicar"}
          </Button>
          <Link href={`/b/${business?.slug}?p=${page?.slug}`} target="_blank">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Settings Collapsible Panel */}
      {showSettings && (
        <GlassCard className="border-indigo-100 bg-indigo-50/5 p-5 animate-fade-in space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Settings2 className="w-4.5 h-4.5 text-indigo-500" />
            Ajustes de Visibilidade e SEO
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nome de Exibição no Menu (Abas)</label>
                <Input
                  value={navLabel}
                  onChange={(e) => setNavLabel(e.target.value)}
                  placeholder="Ex: Nossas Bebidas"
                  className="bg-white"
                />
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-white border border-slate-150 rounded-xl">
                <input
                  type="checkbox"
                  id="showInNavCheck"
                  checked={showInNav}
                  onChange={(e) => setShowInNav(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                />
                <label htmlFor="showInNavCheck" className="text-xs text-slate-700 leading-normal cursor-pointer select-none">
                  <span className="block font-bold">Exibir no menu público de abas</span>
                  Ative para que seus clientes consigam achar esta aba no topo da sua página principal.
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Título para o Google (SEO)</label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Ex: Cardápio Oficial - Meu Café"
                  className="bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Descrição para o Google (SEO)</label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Escreva uma frase que descreva sua página para buscadores como Google."
                  className="w-full h-[76px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={savePageSettings}
              disabled={saving}
              className="bg-indigo-600 text-white font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <GlassCard
            key={section.id}
            className={`transition-all ${!section.is_visible ? "opacity-50" : ""}`}
          >
            <GlassCardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                  <GlassCardTitle className="text-sm font-bold text-slate-700">{section.name}</GlassCardTitle>
                  {section.section_type && (
                    <Badge variant="indigo">{section.section_type}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSectionVisibility(section)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                    title={section.is_visible ? "Ocultar" : "Mostrar"}
                  >
                    {section.is_visible ? (
                      <Eye className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {/* Items */}
              {section.items.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Nenhum item nesta seção
                </p>
              ) : (
                <div className="space-y-2">
                  {section.items.map((item: any) => (
                    <div key={item.id} className="flex flex-col bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-xl overflow-hidden group hover:border-indigo-100 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-14 h-14 shrink-0">
                            <ImageUpload
                              value={item.image_url}
                              onChange={(file) => uploadItemImage(item.id, section.id, file)}
                              onRemove={() => removeItemImage(item.id, section.id)}
                              shape="rounded"
                              label="Foto"
                              className="w-14 h-14"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={item.price || ""}
                            onBlur={(e) => updateItemPrice(item.id, e.target.value)}
                            placeholder="Preço"
                            className="w-20 text-sm text-right bg-transparent border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                          />
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}
                              className={`p-1.5 rounded-lg transition-all ${editingItemId === item.id ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id, section.id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Polymorphic Metadata Editor */}
                      {editingItemId === item.id && (
                        <div className="p-5 bg-slate-50/80 border-t border-slate-100/50 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-bold text-slate-650 block mb-1">Nome do Item *</label>
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateItemField(item.id, "name", e.target.value)}
                                  placeholder="Ex: Cimento CP-II"
                                  className="bg-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-bold text-slate-650 block mb-1">Preço (R$)</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.price ?? ""}
                                    onChange={(e) => updateItemField(item.id, "price", e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="0.00"
                                    className="bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-slate-650 block mb-1">Preço Riscado (De)</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.original_price ?? ""}
                                    onChange={(e) => updateItemField(item.id, "original_price", e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="0.00"
                                    className="bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-bold text-slate-650 block mb-1">Descrição</label>
                                <textarea
                                  value={item.description || ""}
                                  onChange={(e) => updateItemField(item.id, "description", e.target.value)}
                                  placeholder="Descreva o item, detalhes técnicos, etc."
                                  className="w-full h-[84px] px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-650 block mb-1">Foto do Item</label>
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14">
                                    <ImageUpload
                                      value={item.image_url}
                                      onChange={(file) => uploadItemImage(item.id, section.id, file)}
                                      onRemove={() => removeItemImage(item.id, section.id)}
                                      shape="rounded"
                                      label="Foto"
                                      className="w-14 h-14"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    Envie uma foto para destacar este item no seu catálogo.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Atributos Específicos da Categoria</h4>
                            {renderCategoryAttributes(item)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => addItem(section.id)}
                className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors font-medium px-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar item
              </button>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Add Section */}
      <GlassCard className="bg-gradient-to-br from-indigo-50/30 to-indigo-50/10 border-indigo-100/30">
        <GlassCardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Nome da nova seção..."
              onKeyDown={(e) => e.key === "Enter" && addSection()}
              className="h-11 rounded-xl border-slate-200"
            />
            <Button
              variant="default"
              onClick={addSection}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Seção
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
