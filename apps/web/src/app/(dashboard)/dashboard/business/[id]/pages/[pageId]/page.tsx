"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  ExternalLink,
  Image,
  Package,
  DollarSign,
  ToggleLeft,
  ToggleRight,
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
    if (!newSectionName.trim()) return;
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

    if (!error && data) {
      setSections([...sections, { ...data, items: [] }]);
      setNewSectionName("");
    }
  }

  async function deleteSection(sectionId: string) {
    await supabase.from("sections").delete().eq("id", sectionId);
    setSections(sections.filter((s) => s.id !== sectionId));
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
    await supabase.from("items").delete().eq("id", itemId);
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i: any) => i.id !== itemId) }
          : s
      )
    );
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
    await supabase
      .from("pages")
      .update({ is_published: !page.is_published })
      .eq("id", pageId);
    setPage({ ...page, is_published: !page.is_published });
    setSaving(false);
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
        {business?.name}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{page?.title}</h1>
          <p className="text-sm text-gray-500">
            {business?.name} · {sections.length} seções ·{" "}
            {sections.reduce((acc, s) => acc + s.items.length, 0)} itens
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={page?.is_published ? "outline" : "accent"}
            size="sm"
            onClick={togglePublish}
            disabled={saving}
          >
            {page?.is_published ? "Despublicar" : "Publicar"}
          </Button>
          <Link href={`/${business?.slug}`} target="_blank">
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className={`${!section.is_visible ? "opacity-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{section.name}</CardTitle>
                  {section.section_type && (
                    <Badge variant="muted" className="text-xs">
                      {section.section_type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSectionVisibility(section)}
                    className="p-1 text-gray-400 hover:text-[#111827]"
                    title={section.is_visible ? "Ocultar" : "Mostrar"}
                  >
                    {section.is_visible ? (
                      <ToggleRight className="w-5 h-5 text-[#00C853]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Items */}
              {section.items.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  Nenhum item nesta seção
                </p>
              ) : (
                <div className="space-y-2">
                  {section.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Package className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#111827] truncate">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={item.price || ""}
                          onBlur={(e) => updateItemPrice(item.id, e.target.value)}
                          placeholder="Preço"
                          className="w-20 text-sm text-right bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#111827]"
                        />
                        <button
                          onClick={() => deleteItem(item.id, section.id)}
                          className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => addItem(section.id)}
                className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-[#00C853] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar item
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Section */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Nome da nova seção..."
              onKeyDown={(e) => e.key === "Enter" && addSection()}
            />
            <Button variant="accent" onClick={addSection}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Seção
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
