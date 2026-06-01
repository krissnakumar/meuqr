"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  TicketPercent,
  ArrowLeft,
  Loader2,
  Calendar,
  Percent,
  Tag,
  Copy,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  business_id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase: number | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
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

      const { data: couponsData, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(couponsData || []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
      toast.error("Erro ao carregar cupons.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    const newActive = !coupon.is_active;
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: newActive })
        .eq("id", coupon.id);

      if (error) throw error;

      setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, is_active: newActive } : c)));
      toast.success(newActive ? "Cupom ativado!" : "Cupom desativado.");
    } catch (err) {
      toast.error("Erro ao atualizar cupom.");
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Código copiado!");
    } catch {
      toast.error("Erro ao copiar código.");
    }
  }

  const activeCount = coupons.filter((c) => c.is_active).length;

  function formatDiscount(type: string, value: number) {
    if (type === "percentage") return `${value}%`;
    return `R$ ${value.toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando cupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Back + Header */}
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
                <TicketPercent className="w-5 h-5 text-white" />
              </div>
              Cupons
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Crie cupons de desconto e códigos promocionais{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {coupons.length} cupons
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{coupons.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ativos</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <TicketPercent className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum cupom criado</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Crie cupons de desconto para seus clientes.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon, idx) => (
            <div
              key={coupon.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-full h-1 transition-opacity duration-300 ${
                    coupon.is_active
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-100"
                      : "bg-gradient-to-r from-slate-400 to-slate-300 opacity-50"
                  }`}
                />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-indigo-200">
                        <TicketPercent className="w-5 h-5" />
                      </div>
                      <Badge variant={coupon.is_active ? "emerald" : "muted"}>
                        {coupon.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <code className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-800">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {coupon.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      {coupon.discount_type === "percentage" ? (
                        <Percent className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {formatDiscount(coupon.discount_type, coupon.discount_value)} de desconto
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(coupon.valid_from).toLocaleDateString()}
                      {coupon.valid_until &&
                        ` — ${new Date(coupon.valid_until).toLocaleDateString()}`}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      {coupon.used_count}/{coupon.usage_limit ?? "∞"} usos
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant={coupon.is_active ? "outline" : "default"}
                      className={`text-xs h-8 flex-1 ${
                        coupon.is_active
                          ? "border-slate-200"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                      onClick={() => toggleActive(coupon)}
                    >
                      {coupon.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
