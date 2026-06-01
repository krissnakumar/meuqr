"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Image,
  ArrowLeft,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Grid3X3,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export default function PortfolioPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

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

      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
      toast.error("Erro ao carregar portfólio.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(itemId: string, current: boolean) {
    try {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ is_visible: !current })
        .eq("id", itemId);

      if (error) throw error;
      setItems(items.map((i) => (i.id === itemId ? { ...i, is_visible: !current } : i)));
      toast.success(current ? "Item ocultado" : "Item visível");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar visibilidade.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  const visibleCount = items.filter((i) => i.is_visible).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Image className="w-5 h-5 text-white" />
              </div>
              Portfólio
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Mostre seu trabalho com uma galeria de imagens para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {items.length} itens · {visibleCount} visíveis
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum item no portfólio</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Adicione imagens do seu trabalho para exibir no portfólio.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleVisibility(item.id, item.is_visible)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-gray-600 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                      {item.is_visible ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {item.category && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-600">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>
                <GlassCardContent className="p-4">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
