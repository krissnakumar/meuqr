"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MODULE_VENDOR_CATALOG, MODULE_GROUPS } from "@meuqr/shared";
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Calendar,
  UserPlus,
  Megaphone,
  Settings,
  Check,
  Plus,
  Crown,
  Zap,
  Star,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface ModuleRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  is_core: boolean;
  required_plan: string;
  sort_order: number;
}

interface EnabledModule {
  module_id: string;
  source: string;
}

// ─── Icon map for module group headers ───────────────────

const GROUP_ICONS: Record<string, any> = {
  sell_online: ShoppingCart,
  bookings: Calendar,
  leads: UserPlus,
  marketing: Megaphone,
  operations: Settings,
};

// ─── Plan badge component ────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  if (plan === "free") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Star className="w-2.5 h-2.5" />
        Free
      </span>
    );
  }
  if (plan === "pro") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <Zap className="w-2.5 h-2.5" />
        Pro
      </span>
    );
  }
  if (plan === "business") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Crown className="w-2.5 h-2.5" />
        Business
      </span>
    );
  }
  return null;
}

// ─── Page Component ──────────────────────────────────────

export default function AddFeaturesPage() {
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [allModules, setAllModules] = useState<ModuleRow[]>([]);
  const [enabledModuleIds, setEnabledModuleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, subscription_tier")
        .eq("id", businessId)
        .single();

      const { data: modules } = await supabase
        .from("modules")
        .select("*")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      const { data: enabled } = await supabase
        .from("business_enabled_modules")
        .select("module_id, source")
        .eq("business_id", businessId)
        .eq("enabled", true);

      setBusiness(biz);
      setAllModules(modules || []);
      setEnabledModuleIds(new Set((enabled || []).map((e: EnabledModule) => e.module_id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleModule(moduleId: string, slug: string, enable: boolean) {
    setToggling(moduleId);
    try {
      if (enable) {
        const { error } = await supabase
          .from("business_enabled_modules")
          .upsert({
            business_id: businessId,
            module_id: moduleId,
            enabled: true,
            source: "user_enabled",
          }, {
            onConflict: "business_id, module_id",
          });

        if (error) throw error;
        setEnabledModuleIds((prev) => new Set(prev).add(moduleId));
        const info = MODULE_VENDOR_CATALOG[slug];
        toast.success(`"${info?.name || slug}" ativado com sucesso!`);
      } else {
        const { error } = await supabase
          .from("business_enabled_modules")
          .upsert({
            business_id: businessId,
            module_id: moduleId,
            enabled: false,
            source: "user_enabled",
          }, {
            onConflict: "business_id, module_id",
          });

        if (error) throw error;
        setEnabledModuleIds((prev) => {
          const next = new Set(prev);
          next.delete(moduleId);
          return next;
        });
        const info = MODULE_VENDOR_CATALOG[slug];
        toast.success(`"${info?.name || slug}" desativado.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar módulo");
    } finally {
      setToggling(null);
    }
  }

  // ── Categorize modules ─────────────────────────────────

  const modulesByGroup: Record<string, ModuleRow[]> = {};
  const coreModuleIds = new Set<string>();

  for (const mod of allModules) {
    if (mod.is_core) {
      coreModuleIds.add(mod.id);
      continue;
    }
    const vendorInfo = MODULE_VENDOR_CATALOG[mod.slug];
    const group = vendorInfo?.group || "operations";
    if (!modulesByGroup[group]) modulesByGroup[group] = [];
    modulesByGroup[group].push(mod);
  }

  // ── Loading state ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando módulos...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {business?.name || "Voltar"}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Adicionar Funcionalidades</h1>
          <p className="text-sm text-gray-400">
            Ative novos recursos para o seu negócio. Adicione apenas o que você precisa.
          </p>
        </div>
      </div>

      {/* Summary */}
      <GlassCard>
        <GlassCardContent className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {enabledModuleIds.size + coreModuleIds.size} de {allModules.length} módulos ativos
            </p>
            <p className="text-xs text-gray-400">
              Módulos principais já estão sempre ativos. Ative módulos opcionais abaixo.
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Module groups */}
      <div className="space-y-10">
        {Object.entries(MODULE_GROUPS).map(([groupKey, groupInfo]) => {
          const modules = modulesByGroup[groupKey];
          if (!modules || modules.length === 0) return null;

          const GroupIcon = GROUP_ICONS[groupKey] || Sparkles;

          return (
            <div key={groupKey}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center">
                  <GroupIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">{groupInfo.label}</h2>
                  <p className="text-xs text-gray-400">{groupInfo.description}</p>
                </div>
              </div>

              {/* Module Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.map((mod) => {
                  const vendorInfo = MODULE_VENDOR_CATALOG[mod.slug];
                  const isEnabled = enabledModuleIds.has(mod.id);
                  const isToggling = toggling === mod.id;

                  return (
                    <GlassCard
                      key={mod.id}
                      className={`group transition-all ${
                        isEnabled
                          ? "ring-1 ring-indigo-200 ring-offset-1"
                          : "hover:shadow-md"
                      }`}
                    >
                      <GlassCardContent className="p-4 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isEnabled
                                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                                  : "bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
                              }`}
                            >
                              <Sparkles
                                className={`w-4 h-4 ${
                                  isEnabled ? "text-white" : "text-slate-400"
                                }`}
                              />
                            </div>
                            <div>
                              <h3
                                className={`text-sm font-bold ${
                                  isEnabled ? "text-indigo-700" : "text-slate-800"
                                }`}
                              >
                                {vendorInfo?.name || mod.name}
                              </h3>
                              <PlanBadge plan={mod.required_plan} />
                            </div>
                          </div>

                          {/* Toggle button */}
                          <button
                            onClick={() => toggleModule(mod.id, mod.slug, !isEnabled)}
                            disabled={isToggling}
                            className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isEnabled
                                ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                                : "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200"
                            }`}
                            title={isEnabled ? "Desativar" : "Ativar"}
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isEnabled ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-2.5">
                          {vendorInfo?.description || mod.description || "Ative este módulo para adicionar funcionalidades ao seu negócio."}
                        </p>

                        {/* Best For */}
                        {vendorInfo?.bestFor && (
                          <p className="text-[10px] text-gray-400 italic mt-auto">
                            Melhor para: {vendorInfo.bestFor}
                          </p>
                        )}
                      </GlassCardContent>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state if no optional modules available */}
      {Object.keys(modulesByGroup).length === 0 && (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              Todas as funcionalidades já estão ativas
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Você já ativou todos os módulos disponíveis. Novas funcionalidades serão adicionadas em breve!
            </p>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
