"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Package,
  Search,
  Plus,
  Trash2,
  ImageIcon,
  DollarSign,
  Tag,
  Eye,
  Layers,
  Edit3,
  Save,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface ProductItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  item_type: string;
  is_available: boolean;
  sort_order: number;
  metadata: any;
  created_at: string;
}

interface SectionInfo {
  id: string;
  name: string;
  page_id: string;
  page_title: string;
  page_slug: string;
}

interface ProductWithCategory {
  item: ProductItem;
  section: SectionInfo;
}

// ─── Page Component ──────────────────────────────────────

export default function ProductsPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // New product form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSelectedSection, setNewSelectedSection] = useState("");
  const [newAvailability, setNewAvailability] = useState(true);
  const [creating, setCreating] = useState(false);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Upload state
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Available sections for new product dropdown
  const [availableSections, setAvailableSections] = useState<{ id: string; name: string; page_id: string }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, slug, category")
        .eq("id", businessId)
        .single();

      setBusiness(biz);

      // Fetch all pages for this business
      const { data: pages } = await supabase
        .from("pages")
        .select("id, title, slug")
        .eq("business_id", businessId)
        .order("sort_order");

      if (!pages || pages.length === 0) {
        setLoading(false);
        return;
      }

      const pageIds = pages.map((p) => p.id);

      // Fetch all sections for those pages
      const { data: sections } = await supabase
        .from("sections")
        .select("id, name, page_id")
        .in("page_id", pageIds)
        .order("sort_order");

      if (!sections || sections.length === 0) {
        setLoading(false);
        return;
      }

      const sectionIds = sections.map((s) => s.id);

      // Fetch all items in those sections
      const { data: items } = await supabase
        .from("items")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order");

      const pageMap = new Map(pages.map((p) => [p.id, p]));

      // Build products list with category info
      const productsList: ProductWithCategory[] = [];
      for (const section of sections) {
        const page = pageMap.get(section.page_id);
        if (!page) continue;
        const sectionItems = (items || []).filter((i) => i.section_id === section.id);
        for (const item of sectionItems) {
          productsList.push({
            item: item as ProductItem,
            section: {
              id: section.id,
              name: section.name,
              page_id: section.page_id,
              page_title: page.title,
              page_slug: page.slug,
            },
          });
        }
      }

      setProducts(productsList);

      // Set available sections for new product form
      setAvailableSections(
        sections.map((s) => ({
          id: s.id,
          name: s.name,
          page_id: s.page_id,
        }))
      );
      if (sections.length > 0 && !newSelectedSection) {
        setNewSelectedSection(sections[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Upload image ──────────────────────────────────────

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", businessId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar imagem");
      return null;
    }
  }

  async function handleImageUpload(itemId: string, file: File) {
    setUploadingId(itemId);
    const url = await uploadImage(file);
    if (url) {
      await supabase.from("items").update({ image_url: url }).eq("id", itemId);
      setProducts((prev) =>
        prev.map((p) =>
          p.item.id === itemId ? { ...p, item: { ...p.item, image_url: url } } : p
        )
      );
      toast.success("Imagem atualizada");
    }
    setUploadingId(null);
  }

  async function handleRemoveImage(itemId: string) {
    await supabase.from("items").update({ image_url: null }).eq("id", itemId);
    setProducts((prev) =>
      prev.map((p) =>
        p.item.id === itemId ? { ...p, item: { ...p.item, image_url: null } } : p
      )
    );
  }

  // ── CRUD ──────────────────────────────────────────────

  async function handleCreate() {
    if (!newName.trim()) {
      toast.error("Digite o nome do produto");
      return;
    }
    if (!newSelectedSection) {
      toast.error("Selecione uma categoria");
      return;
    }

    setCreating(true);
    try {
      const itemsInSection = products.filter((p) => p.section.id === newSelectedSection).length;

      const { data, error } = await supabase
        .from("items")
        .insert({
          section_id: newSelectedSection,
          name: newName.trim(),
          description: newDescription.trim() || null,
          price: newPrice ? parseFloat(newPrice) : null,
          image_url: newImageUrl || null,
          is_available: newAvailability,
          sort_order: itemsInSection,
          item_type: "product",
        })
        .select()
        .single();

      if (error) throw error;

      const section = availableSections.find((s) => s.id === newSelectedSection);
      const page = await supabase
        .from("pages")
        .select("title, slug")
        .eq("id", section?.page_id)
        .single();

      setProducts((prev) => [
        {
          item: data as ProductItem,
          section: {
            id: section!.id,
            name: section!.name,
            page_id: section!.page_id,
            page_title: page.data?.title || "",
            page_slug: page.data?.slug || "",
          },
        },
        ...prev,
      ]);

      toast.success("Produto criado!");
      setShowNewForm(false);
      setNewName("");
      setNewPrice("");
      setNewDescription("");
      setNewImageUrl("");
      setNewAvailability(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar produto");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(itemId: string) {
    const updates: any = {};
    if (editName.trim()) updates.name = editName.trim();
    if (editPrice) updates.price = parseFloat(editPrice);
    else updates.price = null;
    if (editDescription !== undefined) updates.description = editDescription.trim() || null;
    if (editImageUrl !== undefined) updates.image_url = editImageUrl || null;

    const { error } = await supabase.from("items").update(updates).eq("id", itemId);
    if (error) {
      toast.error("Erro ao salvar");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.item.id === itemId
          ? {
              ...p,
              item: {
                ...p.item,
                name: editName.trim() || p.item.name,
                price: editPrice ? parseFloat(editPrice) : null,
                description: editDescription.trim() || null,
                image_url: editImageUrl || p.item.image_url,
              },
            }
          : p
      )
    );
    setEditingId(null);
    toast.success("Produto atualizado");
  }

  async function toggleAvailability(itemId: string, current: boolean) {
    await supabase.from("items").update({ is_available: !current }).eq("id", itemId);
    setProducts((prev) =>
      prev.map((p) =>
        p.item.id === itemId ? { ...p, item: { ...p.item, is_available: !current } } : p
      )
    );
    toast.success(!current ? "Produto ativado" : "Produto desativado");
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Excluir este produto permanentemente?")) return;
    await supabase.from("items").delete().eq("id", itemId);
    setProducts((prev) => prev.filter((p) => p.item.id !== itemId));
    toast.success("Produto excluído");
  }

  // ── Filters ───────────────────────────────────────────

  const categories = Array.from(new Set(products.map((p) => p.section.name)));

  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.section.name !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matches =
        p.item.name.toLowerCase().includes(q) ||
        (p.item.description && p.item.description.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  // ── Stats ─────────────────────────────────────────────

  const stats = {
    total: products.length,
    available: products.filter((p) => p.item.is_available).length,
    categories: categories.length,
    totalPages: availableSections.length,
  };

  // ── Loading state ─────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando produtos...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
            <p className="text-sm text-gray-400">
              Gerencie o catálogo de produtos do seu negócio
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowNewForm(!showNewForm);
            setEditingId(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          {showNewForm ? "Cancelar" : "Novo Produto"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Package, bg: "from-blue-50 to-indigo-50", color: "text-blue-600" },
          { label: "Disponíveis", value: stats.available, icon: Eye, bg: "from-emerald-50 to-green-50", color: "text-emerald-600" },
          { label: "Categorias", value: stats.categories, icon: Layers, bg: "from-purple-50 to-violet-50", color: "text-purple-600" },
          { label: "Seções", value: stats.totalPages, icon: Tag, bg: "from-amber-50 to-orange-50", color: "text-amber-600" },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <GlassCardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-medium text-gray-400">{stat.label}</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Search & Filters */}
      <GlassCard>
        <GlassCardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          {categories.length > 1 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-3 py-2 h-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* New Product Form */}
      {showNewForm && (
        <GlassCard className="ring-2 ring-indigo-200 ring-offset-1">
          <GlassCardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Novo Produto
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Nome *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Cimento CP II 50kg"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Preço (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Descrição</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição do produto..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Categoria</label>
                <select
                  value={newSelectedSection}
                  onChange={(e) => setNewSelectedSection(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">URL da Imagem</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAvailability}
                  onChange={(e) => setNewAvailability(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-600">Disponível para venda</span>
              </label>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Produto"}
              </button>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {search || categoryFilter !== "all"
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {search || categoryFilter !== "all"
                ? "Tente alterar os filtros ou a busca."
                : "Crie seu primeiro produto para aparecer no catálogo do seu negócio."}
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const isEditing = editingId === p.item.id;

            return (
              <GlassCard
                key={p.item.id}
                className={`relative overflow-hidden transition-all ${
                  !p.item.is_available ? "opacity-60" : "hover:shadow-md"
                } ${isEditing ? "ring-2 ring-indigo-200" : ""}`}
              >
                <GlassCardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-36 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                    {p.item.image_url ? (
                      <img
                        src={p.item.image_url}
                        alt={p.item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-300" />
                    )}
                    {/* Upload button overlay */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <label className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(p.item.id, file);
                          }}
                        />
                        {uploadingId === p.item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </label>
                      {p.item.image_url && (
                        <button
                          onClick={() => handleRemoveImage(p.item.id)}
                          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>

                    {/* Availability badge */}
                    <div className="absolute top-2 left-2">
                      <button
                        onClick={() => toggleAvailability(p.item.id, p.item.is_available)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm transition-all ${
                          p.item.is_available
                            ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600"
                            : "bg-slate-500/80 text-white border-slate-400/50 hover:bg-slate-600"
                        }`}
                      >
                        {p.item.is_available ? "Disponível" : "Indisponível"}
                      </button>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-sm text-indigo-600 border border-indigo-200">
                        {p.section.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2.5">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveEdit(p.item.id)}
                            className="flex-1 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all px-3"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 flex-1">
                            {p.item.name}
                          </h3>
                          <p className="text-sm font-bold text-slate-800 shrink-0">
                            {p.item.price
                              ? `R$ ${p.item.price.toFixed(2)}`
                              : "—"}
                          </p>
                        </div>
                        {p.item.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {p.item.description}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400">
                          {p.section.page_title} / {p.section.name}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions (only when not editing) */}
                  {!isEditing && (
                    <div className="px-4 pb-4 flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(p.item.id);
                          setEditName(p.item.name);
                          setEditPrice(p.item.price?.toString() || "");
                          setEditDescription(p.item.description || "");
                          setEditImageUrl(p.item.image_url || "");
                          setShowNewForm(false);
                        }}
                        className="flex-1 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-xs font-medium transition-all flex items-center justify-center gap-1 border border-slate-200"
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.item.id)}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
