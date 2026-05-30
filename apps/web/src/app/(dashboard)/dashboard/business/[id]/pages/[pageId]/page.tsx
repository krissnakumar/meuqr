"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Input, Badge } from "@meuqr/ui";
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
} from "lucide-react";

interface SectionWithItems {
  id: string;
  name: string;
  slug: string;
  section_type: string | null;
  sort_order: number;
  is_visible: boolean;
  items: any[];
}

export default function PageEditorPage() {
  const params = useParams();
  const businessId = params.id as string;
  const pageId = params.pageId as string;

  const [page, setPage] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [sections, setSections] = useState<SectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <p className="text-sm font-medium text-gray-500">Carregando editor...</p>
      </div>
    );
  }

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name}
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
            variant={page?.is_published ? "outline" : "default"}
            size="sm"
            onClick={togglePublish}
            disabled={saving}
            className={page?.is_published ? "border-slate-200" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
          >
            {page?.is_published ? "Despublicar" : "Publicar"}
          </Button>
          <Link href={`/${business?.slug}`} target="_blank">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

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
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 group hover:border-indigo-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Package className="w-4 h-4 text-gray-400 shrink-0" />
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
                        <button
                          onClick={() => deleteItem(item.id, section.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
