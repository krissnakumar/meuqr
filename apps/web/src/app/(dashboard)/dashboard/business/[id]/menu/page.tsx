"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Loader2,
  ArrowLeft,
  UtensilsCrossed,
  Sparkles,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  item_type: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  section_name: string;
  page_title: string;
}

interface CategoryTab {
  id: string;
  name: string;
  count: number;
}

export default function MenuPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (biz) setBusinessName(biz.name);

      const { data: pages } = await supabase
        .from("pages")
        .select("id, title")
        .eq("business_id", businessId);

      const pageIds = pages?.map((p) => p.id) || [];

      if (pageIds.length > 0) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name, page_id")
          .in("page_id", pageIds)
          .order("sort_order");

        const sectionIds = sections?.map((s) => s.id) || [];

        if (sectionIds.length > 0) {
          const { data: allItems } = await supabase
            .from("items")
            .select("*")
            .in("section_id", sectionIds)
            .order("sort_order");

          const pageMap = new Map(pages!.map((p) => [p.id, p.title]));
          const sectionMap = new Map(sections!.map((s) => [s.id, { name: s.name, page_id: s.page_id }]));

          const menuItems: MenuItem[] = (allItems || []).map((item) => {
            const section = sectionMap.get(item.section_id);
            const pageTitle = section ? pageMap.get(section.page_id) : "";
            return {
              ...item,
              section_name: section?.name || "Sem categoria",
              page_title: pageTitle || "",
            } as MenuItem;
          });

          setItems(menuItems);
        }
      }
    } catch (err) {
      console.error("Failed to load menu:", err);
      toast.error("Erro ao carregar cardápio.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    await supabase.from("items").update({ is_available: !current }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_available: !current } : i)));
    toast.success(!current ? "Item ativado" : "Item desativado");
  }

  const categories: CategoryTab[] = [
    { id: "all", name: "Todos", count: items.length },
    ...Array.from(
      items.reduce((map, item) => {
        const existing = map.get(item.section_name);
        if (existing) {
          existing.count++;
        } else {
          map.set(item.section_name, { id: item.section_name, name: item.section_name, count: 1 });
        }
        return map;
      }, new Map<string, CategoryTab>()).values()
    ),
  ];

  const filtered = activeCategory === "all"
    ? items
    : items.filter((i) => i.section_name === activeCategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in-up">
      <div className="space-y-4">
        <Link
          href={`/dashboard/business/${businessId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao negócio
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              Cardápio Digital
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Gerencie o cardápio digital do seu negócio{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
            <Sparkles className="w-3.5 h-3.5" />
            {items.length} item(ns)
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum item no cardápio</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {activeCategory !== "all"
                ? "Nenhum item nesta categoria."
                : "Adicione produtos e serviços nas páginas do seu negócio."}
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <GlassCard key={item.id} className="overflow-hidden">
              <GlassCardContent className="p-4">
                <div className="flex items-start gap-4">
                  {item.image_url && (
                    <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden bg-slate-100">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                          <Badge variant={item.is_available ? "emerald" : "muted"} className="text-[10px]">
                            {item.is_available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          {item.section_name} • {item.page_title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.price !== null && (
                          <p className="text-base font-bold text-slate-800">
                            R$ {item.price.toFixed(2)}
                          </p>
                        )}
                        <button
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
                            item.is_available
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {item.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
