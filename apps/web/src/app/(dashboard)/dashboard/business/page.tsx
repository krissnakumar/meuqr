"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Store,
  Plus,
  Loader2,
  Search,
  QrCode,
  Eye,
  Building2,
  ChevronRight,
} from "lucide-react";

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  logo_url: string | null;
  subscription_tier: string;
  created_at: string;
  _pageCount?: number;
  _qrCount?: number;
}

export default function BusinessesListPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bizList } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!bizList) {
        setBusinesses([]);
        return;
      }

      const enriched = await Promise.all(
        bizList.map(async (biz) => {
          const { count: pages } = await supabase
            .from("pages")
            .select("*", { count: "exact", head: true })
            .eq("business_id", biz.id);

          const { count: qrs } = await supabase
            .from("qr_codes")
            .select("*", { count: "exact", head: true })
            .eq("business_id", biz.id);

          return {
            ...biz,
            _pageCount: pages || 0,
            _qrCount: qrs || 0,
          };
        })
      );

      setBusinesses(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando negócios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Negócios
          </h1>
          <p className="text-sm text-gray-400 mt-1 ml-[52px]">
            {businesses.length} negócio(s) cadastrado(s)
          </p>
        </div>
        <Link href="/dashboard/business/new">
          <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
            <Plus className="w-4 h-4 mr-2" />
            Novo Negócio
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar negócio por nome ou slug..."
          className="w-full pl-10 pr-10 h-11 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <span className="text-xs font-medium">Limpar</span>
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {search ? "Nenhum negócio encontrado" : "Nenhum negócio ainda"}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              {search
                ? "Tente alterar sua busca ou digitar outros termos."
                : "Crie seu primeiro negócio para começar a gerenciar seu catálogo digital."}
            </p>
            {!search && (
              <Link href="/dashboard/business/new">
                <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Negócio
                </Button>
              </Link>
            )}
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((biz, idx) => (
            <Link
              key={biz.id}
              href={`/dashboard/business/${biz.id}`}
              className="block group"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <GlassCard className="hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden shadow-sm">
                      {biz.logo_url ? (
                        <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-indigo-500" />
                      )}
                    </div>
                    <Badge
                      variant={biz.subscription_tier === "free" ? "amber" : "emerald"}
                    >
                      {biz.subscription_tier === "free"
                        ? "Grátis"
                        : biz.subscription_tier === "pro"
                        ? "Pro"
                        : "Business"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
                    {biz.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    /{biz.slug}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {biz._pageCount} páginas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5" />
                        {biz._qrCount} QR codes
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
