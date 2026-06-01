"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  Megaphone,
  ArrowLeft,
  Loader2,
  Calendar,
  Tag,
  Percent,
  Play,
  StopCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: "draft" | "active" | "ended";
  discount_type: "percentage" | "fixed";
  discount_value: number;
  created_at: string;
}

export default function CampaignsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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

      const { data: campaignsData, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(campaignsData || []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      toast.error("Erro ao carregar campanhas.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "active" | "ended") {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status } : c)));
      toast.success(
        status === "active"
          ? "Campanha ativada com sucesso!"
          : "Campanha encerrada com sucesso!"
      );
    } catch (err) {
      toast.error("Erro ao atualizar campanha.");
    }
  }

  const activeCount = campaigns.filter((c) => c.status === "active").length;

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return <Badge variant="emerald">Ativa</Badge>;
      case "ended":
        return <Badge variant="muted">Encerrada</Badge>;
      default:
        return <Badge variant="indigo">Rascunho</Badge>;
    }
  }

  function formatDiscount(type: string, value: number) {
    if (type === "percentage") return `${value}%`;
    return `R$ ${value.toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-gray-500">Carregando campanhas...</p>
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
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              Campanhas
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Crie e gerencie campanhas promocionais{" "}
              <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {campaigns.length} campanhas
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{campaigns.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ativas</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma campanha criada</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Crie campanhas promocionais para atrair mais clientes.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((campaign, idx) => (
            <div
              key={campaign.id}
              className="block group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <GlassCard className="group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-full h-1 transition-opacity duration-300 ${
                    campaign.status === "active"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-100"
                      : campaign.status === "ended"
                      ? "bg-gradient-to-r from-slate-400 to-slate-300 opacity-50"
                      : "bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100"
                  }`}
                />

                <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-indigo-200">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {campaign.name}
                      </h4>
                      {campaign.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(campaign.start_date).toLocaleDateString()}
                      {campaign.end_date &&
                        ` — ${new Date(campaign.end_date).toLocaleDateString()}`}
                    </p>
                    <p className="flex items-center gap-1.5">
                      {campaign.discount_type === "percentage" ? (
                        <Percent className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {formatDiscount(campaign.discount_type, campaign.discount_value)} de
                      desconto
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {campaign.status === "draft" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 flex-1"
                        onClick={() => updateStatus(campaign.id, "active")}
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Ativar
                      </Button>
                    )}
                    {campaign.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 flex-1 border-slate-200"
                        onClick={() => updateStatus(campaign.id, "ended")}
                      >
                        <StopCircle className="w-3.5 h-3.5 mr-1" />
                        Encerrar
                      </Button>
                    )}
                    {campaign.status === "ended" && (
                      <span className="text-xs text-gray-400 italic flex-1 text-center">
                        Campanha encerrada
                      </span>
                    )}
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
