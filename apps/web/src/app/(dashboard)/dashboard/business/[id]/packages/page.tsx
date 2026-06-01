"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Gift,
  ArrowLeft,
  Loader2,
  Sparkles,
  Tag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PackageItem {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  duration: string | null;
  items: any;
  is_active: boolean;
  created_at: string;
}

export default function PackagesPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [packages, setPackages] = useState<PackageItem[]>([]);
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
        .from("packages")
        .select("*")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      console.error("Failed to load packages:", err);
      toast.error("Erro ao carregar pacotes.");
    } finally {
      setLoading(false);
    }
  }

  const activeCount = packages.filter((p) => p.is_active).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

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
                <Gift className="w-5 h-5 text-white" />
              </div>
              Pacotes
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Crie pacotes e combos de serviços para <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {packages.length} pacotes · {activeCount} ativos
          </div>
        </div>
      </div>

      {packages.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum pacote criado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Crie pacotes e combos para oferecer mais valor aos seus clientes.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant={pkg.is_active ? "emerald" : "rose"}>
                        {pkg.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {pkg.name}
                      </h4>
                      {pkg.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{pkg.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Preço</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-800">
                          R$ {pkg.price.toFixed(2)}
                        </span>
                        {pkg.original_price && pkg.original_price > pkg.price && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            R$ {pkg.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {pkg.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Duração</span>
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {pkg.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {pkg.items && Array.isArray(pkg.items) && (
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.items.map((item: any, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
                        >
                          {typeof item === "string" ? item : item.name}
                        </span>
                      ))}
                    </div>
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
