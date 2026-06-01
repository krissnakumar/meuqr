"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { toast } from "sonner";
import { Button, GlassCard, GlassCardContent, Badge } from "@meuqr/ui";
import {
  FileText,
  ArrowLeft,
  Loader2,
  Sparkles,
  User,
  Mail,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";

interface Proposal {
  id: string;
  business_id: string;
  client_name: string;
  client_email: string;
  title: string;
  description: string | null;
  total_value: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  valid_until: string;
  created_at: string;
}

export default function ProposalsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const businessId = params.id as string;

  const [proposals, setProposals] = useState<Proposal[]>([]);
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
        .from("proposals")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error("Failed to load proposals:", err);
      toast.error("Erro ao carregar propostas.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(proposalId: string, status: string) {
    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status })
        .eq("id", proposalId);

      if (error) throw error;
      setProposals(proposals.map((p) => (p.id === proposalId ? { ...p, status: status as Proposal["status"] } : p)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  }

  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;
  const pendingCount = proposals.filter((p) => p.status === "draft" || p.status === "sent").length;

  function getStatusBadge(status: string) {
    switch (status) {
      case "sent": return <Badge variant="indigo">Enviada</Badge>;
      case "accepted": return <Badge variant="emerald">Aceita</Badge>;
      case "rejected": return <Badge variant="rose">Rejeitada</Badge>;
      default: return <Badge variant="amber">Rascunho</Badge>;
    }
  }

  function isExpired(validUntil: string) {
    return new Date(validUntil) < new Date();
  }

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
                <FileText className="w-5 h-5 text-white" />
              </div>
              Propostas
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-[52px]">
              Crie e envie propostas comerciais para clientes de <span className="font-semibold text-slate-600">{businessName}</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {proposals.length} total · {acceptedCount} aceitas · {pendingCount} pendentes
          </div>
        </div>
      </div>

      {proposals.length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma proposta criada</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Crie propostas comerciais para enviar aos seus clientes.
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {proposals.map((proposal, idx) => {
            const expired = isExpired(proposal.valid_until);
            return (
              <div
                key={proposal.id}
                className="block group"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <GlassCard className={`group-hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                  expired && proposal.status !== "accepted" && proposal.status !== "rejected" ? "border-rose-200" : ""
                }`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <GlassCardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {proposal.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {proposal.client_name}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {proposal.client_email}
                      </p>
                    </div>

                    <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                      <p className="flex items-center justify-between text-slate-600">
                        <span className="text-gray-400">Valor</span>
                        <span className="font-bold text-slate-800 flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          R$ {proposal.total_value.toFixed(2)}
                        </span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-gray-400">Válida até</span>
                        <span className={`flex items-center gap-1 ${expired ? "text-rose-500 font-medium" : "text-slate-600"}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(proposal.valid_until).toLocaleDateString()}
                          {expired && " (Expirada)"}
                        </span>
                      </p>
                    </div>

                    {proposal.description && (
                      <p className="text-xs text-gray-400 line-clamp-2">{proposal.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {proposal.status === "draft" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(proposal.id, "sent")}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Enviar
                        </Button>
                      </div>
                    )}
                    {proposal.status === "sent" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(proposal.id, "accepted")}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 flex-1"
                          onClick={() => updateStatus(proposal.id, "rejected")}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
