"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Store,
  Plus,
  Loader2,
  Search,
  QrCode,
  Eye,
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

      // Enrich with page and QR counts
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
            Negócios
          </h1>
          <p className="text-gray-500 mt-1">
            {businesses.length} negócio(s) cadastrado(s)
          </p>
        </div>
        <Link href="/dashboard/business/new">
          <Button variant="accent">
            <Plus className="w-4 h-4 mr-2" />
            Novo Negócio
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar negócio..."
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              {search ? "Nenhum negócio encontrado" : "Nenhum negócio ainda"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {search
                ? "Tente alterar sua busca."
                : "Crie seu primeiro negócio para começar."}
            </p>
            {!search && (
              <Link href="/dashboard/business/new">
                <Button variant="accent">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Negócio
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((biz) => (
            <Link key={biz.id} href={`/dashboard/business/${biz.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-slate-100 hover:border-indigo-200 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {biz.logo_url ? (
                        <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                      )}
                    </div>
                    <Badge
                      variant={biz.subscription_tier === "free" ? "outline" : "accent"}
                      className="text-xs"
                    >
                      {biz.subscription_tier === "free"
                        ? "Grátis"
                        : biz.subscription_tier === "pro"
                        ? "Pro"
                        : "Business"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {biz.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    /{biz.slug}
                  </p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {biz._pageCount} páginas
                    </span>
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      {biz._qrCount} QR codes
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
